import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit-log';
import { hasWritePermission } from '@/lib/permissions';
import { createNotification } from '@/lib/notification-helper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          mwo.id,
          mwo.wo_number as woNumber,
          mwo.wo_date as woDate,
          e.equipment_name as equipmentName,
          mwo.maintenance_type as maintenanceType,
          mwo.priority,
          mwo.status,
          CONCAT(u.first_name, ' ', u.last_name) as assignedToName,
          mwo.scheduled_start_date as scheduledDate
        FROM maintenance_work_orders mwo
        LEFT JOIN equipment e ON mwo.equipment_id = e.id
        LEFT JOIN users u ON mwo.assigned_to = u.id
        ORDER BY mwo.wo_date DESC
      `;

      const workOrders = await query(sql);

      return res.status(200).json({ workOrders });
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'maintenance_work_orders')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
      });
    }

    try {
      const {
        equipmentId,
        maintenanceType,
        priority,
        scheduledDate,
        assignedTo,
        description
      } = req.body;

      if (!equipmentId || !maintenanceType || !priority || !scheduledDate || !assignedTo) {
        return res.status(400).json({ message: 'Equipment, maintenance type, priority, scheduled date, and assigned to are required' });
      }

      // Generate WO number
      const woNumber = `MWO-${Date.now()}`;

      const result = await execute(
        `INSERT INTO maintenance_work_orders 
         (wo_number, wo_date, equipment_id, maintenance_type, priority, 
          scheduled_start_date, assigned_to, description, status)
         VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
        [
          woNumber,
          equipmentId,
          maintenanceType,
          priority,
          scheduledDate,
          assignedTo,
          description || ''
        ]
      );

      await logAudit({
        userId: session.userId,
        action: 'MAINTENANCE_WO_CREATE',
        module: 'MAINTENANCE',
        recordId: result.insertId.toString(),
        recordType: 'maintenance_work_orders',
        newValue: JSON.stringify({ woNumber, equipmentId, maintenanceType, priority }),
        status: 'SUCCESS',
      });

      // Get equipment name and notify assigned technician
      const [equipment] = await query(
        'SELECT equipment_name FROM equipment WHERE id = ?',
        [equipmentId]
      );

      await createNotification({
        userId: assignedTo,
        title: 'Maintenance Work Order Assigned',
        message: `Work Order ${woNumber} for ${equipment.equipment_name} has been assigned to you. Priority: ${priority}`,
        type: 'ACTION_REQUIRED',
        category: 'MAINTENANCE',
        referenceType: 'MAINTENANCE_WO',
        referenceId: result.insertId.toString(),
      });

      return res.status(201).json({ 
        message: 'Maintenance work order created successfully',
        woNumber 
      });
    } catch (error: any) {
      console.error('Error creating work order:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
