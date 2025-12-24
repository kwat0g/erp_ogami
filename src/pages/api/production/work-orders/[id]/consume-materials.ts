import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute, transaction } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const canExecute = ['PRODUCTION_OPERATOR', 'PRODUCTION_SUPERVISOR', 'WAREHOUSE_STAFF', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canExecute) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { materials } = req.body; // Array of { itemId, quantityConsumed, notes }

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: 'Materials array is required' });
    }

    await transaction(async (conn) => {
      // Verify work order exists and is in progress
      const [wo]: any = await conn.query(
        `SELECT id, status FROM work_orders WHERE id = ?`,
        [id]
      );

      console.log('Work Order:', wo);
      console.log('Status:', wo?.status, 'Type:', typeof wo?.status);

      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'RELEASED' && wo.status !== 'IN_PROGRESS') {
        throw new Error(`Work order must be released or in progress. Current status: ${wo.status}`);
      }

      // Process each material consumption
      for (const material of materials) {
        const { itemId, quantityConsumed, notes } = material;

        if (!itemId || !quantityConsumed || quantityConsumed <= 0) {
          throw new Error('Valid item ID and quantity consumed are required for all materials');
        }

        // Check stock availability
        const [stock]: any = await conn.query(
          `SELECT quantity_on_hand FROM inventory_stock WHERE item_id = ?`,
          [itemId]
        );

        if (!stock || stock.quantity_on_hand < quantityConsumed) {
          throw new Error(`Insufficient stock for item ${itemId}. Available: ${stock?.quantity_on_hand || 0}, Required: ${quantityConsumed}`);
        }

        // Record material consumption
        await conn.query(
          `INSERT INTO work_order_materials 
           (work_order_id, item_id, quantity_consumed, consumed_date, consumed_by, notes)
           VALUES (?, ?, ?, NOW(), ?, ?)`,
          [id, itemId, quantityConsumed, session.userId, notes || null]
        );

        // Create inventory transaction
        await conn.query(
          `INSERT INTO inventory_transactions 
           (item_id, transaction_type, quantity, reference_type, reference_id, 
            transaction_date, created_by, notes)
           VALUES (?, 'PRODUCTION_ISSUE', ?, 'WORK_ORDER', ?, CURDATE(), ?, ?)`,
          [
            itemId,
            -quantityConsumed,
            id,
            session.userId,
            notes || `Material consumed for WO ${id}`
          ]
        );

        // Update stock levels
        await conn.query(
          `UPDATE inventory_stock 
           SET quantity_on_hand = quantity_on_hand - ?
           WHERE item_id = ?`,
          [quantityConsumed, itemId]
        );
      }

      // Update work order status to IN_PROGRESS if it was RELEASED
      if (wo.status === 'RELEASED') {
        await conn.query(
          `UPDATE work_orders SET status = 'IN_PROGRESS' WHERE id = ?`,
          [id]
        );
      }

    });

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'work_orders',
      recordId: id as string,
      newValues: { materialsConsumed: materials.length },
    });

    return res.status(200).json({ 
      message: 'Materials consumed successfully',
      materialsProcessed: materials.length
    });
  } catch (error: any) {
    console.error('Error consuming materials:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
