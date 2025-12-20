import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute, transaction } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

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
          wo.id, wo.wo_number as woNumber, wo.wo_date as woDate,
          wo.planned_quantity as plannedQuantity, wo.produced_quantity as producedQuantity,
          wo.rejected_quantity as rejectedQuantity, wo.scheduled_start_date as scheduledStartDate,
          wo.scheduled_end_date as scheduledEndDate, wo.status, wo.priority,
          i.code as itemCode, i.name as itemName, w.name as warehouseName
        FROM work_orders wo
        JOIN items i ON wo.item_id = i.id
        LEFT JOIN warehouses w ON wo.warehouse_id = w.id
        ORDER BY wo.wo_date DESC, wo.wo_number DESC
      `;

      const workOrders = await query(sql);

      return res.status(200).json({ workOrders });
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'production_work_orders')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot create work orders.' 
      });
    }

    try {
      const {
        woDate,
        itemId,
        plannedQuantity,
        scheduledStartDate,
        scheduledEndDate,
        priority,
        warehouseId,
        notes,
      } = req.body;

      // Validation
      if (!woDate || !itemId || !plannedQuantity || plannedQuantity <= 0) {
        return res.status(400).json({ message: 'WO date, item, and valid planned quantity are required' });
      }

      await transaction(async (connection) => {
        // Generate WO number
        const [lastWO] = await connection.query(
          "SELECT wo_number FROM work_orders ORDER BY created_at DESC LIMIT 1"
        );

        let woNumber = 'WO-0001';
        if (lastWO && lastWO.length > 0) {
          const lastNumber = parseInt(lastWO[0].wo_number.split('-')[1]);
          woNumber = `WO-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Insert work order
        const [woResult] = await connection.query(
          `INSERT INTO work_orders (
            wo_number, wo_date, item_id, planned_quantity, scheduled_start_date,
            scheduled_end_date, status, priority, warehouse_id, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)`,
          [
            woNumber,
            woDate,
            itemId,
            plannedQuantity,
            scheduledStartDate || null,
            scheduledEndDate || null,
            priority || 'NORMAL',
            warehouseId || null,
            notes || null,
            session.userId,
          ]
        );

        const woId = woResult.insertId;

        await createAuditLog({
          userId: session.userId,
          action: 'CREATE',
          tableName: 'work_orders',
          recordId: woId.toString(),
          newValues: { woNumber, woDate, plannedQuantity },
        });

        return res.status(201).json({
          message: 'Work order created successfully',
          id: woId,
          woNumber,
        });
      });
    } catch (error: any) {
      console.error('Error creating work order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
