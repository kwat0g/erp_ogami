import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { sanitizeText, sanitizeOptionalText, isValidISODate } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;
  const idStr = sanitizeText(id);

  if (req.method === 'GET') {
    try {
      const rows = await query(
        `SELECT 
          ms.id, ms.equipment_id as equipmentId,
          e.equipment_code as equipmentCode, e.equipment_name as equipmentName,
          ms.maintenance_type as scheduleType, 
          CONCAT(ms.frequency_type, ' - ', ms.frequency_value) as frequency,
          ms.last_maintenance_date as lastPerformedDate,
          ms.next_maintenance_date as nextDueDate, ms.description,
          ms.is_active as isActive, ms.created_at as createdAt
        FROM maintenance_schedules ms
        LEFT JOIN equipment e ON ms.equipment_id = e.id
        WHERE ms.id = ?`,
        [idStr]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      return res.status(200).json({ schedule: rows[0] });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'maintenance_schedules')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
      });
    }

    try {
      const {
        equipmentId,
        scheduleType,
        frequency,
        lastPerformedDate,
        nextDueDate,
        description,
        isActive
      } = req.body;

      if (!equipmentId || !scheduleType || !frequency || !nextDueDate) {
        return res.status(400).json({ message: 'Equipment, schedule type, frequency, and next due date are required' });
      }

      if (!isValidISODate(nextDueDate)) {
        return res.status(400).json({ message: 'Invalid next due date format' });
      }

      const validTypes = ['PREVENTIVE', 'PREDICTIVE', 'CORRECTIVE'];
      if (!validTypes.includes(scheduleType)) {
        return res.status(400).json({ message: 'Invalid schedule type' });
      }

      await execute(
        `UPDATE maintenance_schedules 
         SET equipment_id = ?, maintenance_type = ?, frequency_type = ?,
             last_maintenance_date = ?, next_maintenance_date = ?,
             description = ?, is_active = ?
         WHERE id = ?`,
        [
          equipmentId,
          scheduleType,
          frequency || 'MONTHLY',
          lastPerformedDate || null,
          nextDueDate,
          sanitizeOptionalText(description),
          isActive !== undefined ? isActive : true,
          idStr
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'maintenance_schedules',
        recordId: idStr,
        newValues: { equipmentId, scheduleType, nextDueDate },
      });

      return res.status(200).json({ message: 'Schedule updated successfully' });
    } catch (error) {
      console.error('Error updating schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'maintenance_schedules')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
      });
    }

    try {
      await execute('DELETE FROM maintenance_schedules WHERE id = ?', [idStr]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'maintenance_schedules',
        recordId: idStr,
        newValues: {},
      });

      return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
