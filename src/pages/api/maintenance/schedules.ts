import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          ms.id, ms.equipment_id as equipmentId,
          e.equipment_code as equipmentCode, e.equipment_name as equipmentName,
          ms.maintenance_type as scheduleType, 
          CONCAT(ms.frequency_type, ' - ', ms.frequency_value) as frequency,
          ms.last_maintenance_date as lastPerformedDate,
          ms.next_maintenance_date as nextDueDate, ms.description,
          ms.is_active as isActive, ms.created_at as createdAt
        FROM maintenance_schedules ms
        LEFT JOIN equipment e ON ms.equipment_id = e.id
        ORDER BY ms.next_maintenance_date
      `;
      const schedules = await query(sql);
      return res.status(200).json({ schedules });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'maintenance_schedules')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only MAINTENANCE_TECHNICIAN can create schedules.' 
      });
    }

    try {
      const {
        equipmentId,
        scheduleType,
        frequency,
        nextDueDate,
        description
      } = req.body;

      if (!equipmentId || !scheduleType || !frequency || !nextDueDate) {
        return res.status(400).json({ message: 'Equipment, schedule type, frequency, and next due date are required' });
      }

      const result = await execute(
        `INSERT INTO maintenance_schedules 
         (schedule_code, equipment_id, maintenance_type, frequency_type, frequency_value, next_maintenance_date, description, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          `SCH-${Date.now()}`,
          equipmentId, 
          scheduleType, 
          frequency || 'MONTHLY', 
          1,
          nextDueDate, 
          description || null
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'maintenance_schedules',
        recordId: result.insertId.toString(),
        newValues: { equipmentId, scheduleType, frequency },
      });

      return res.status(201).json({ 
        message: 'Maintenance schedule created successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
