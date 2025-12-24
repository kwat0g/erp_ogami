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

  const canExecute = ['PRODUCTION_OPERATOR', 'PRODUCTION_SUPERVISOR', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canExecute) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { quantityProduced, quantityRejected, notes, completionDate } = req.body;

    if (!quantityProduced || quantityProduced <= 0) {
      return res.status(400).json({ message: 'Valid quantity produced is required' });
    }

    let newQuantityProduced = 0;
    let newStatus = '';

    await transaction(async (conn) => {
      // Get work order details
      const [wo]: any = await conn.query(
        `SELECT id, item_id, quantity_ordered, quantity_produced, status
         FROM work_orders WHERE id = ?`,
        [id]
      );

      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'RELEASED' && wo.status !== 'IN_PROGRESS') {
        throw new Error('Work order must be released or in progress');
      }

      // Record production output
      await conn.query(
        `INSERT INTO production_output 
         (work_order_id, item_id, quantity_produced, quantity_rejected, 
          production_date, recorded_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          wo.item_id,
          quantityProduced,
          quantityRejected || 0,
          completionDate || new Date().toISOString().split('T')[0],
          session.userId,
          notes || null
        ]
      );

      // Update work order quantity produced
      newQuantityProduced = (wo.quantity_produced || 0) + parseFloat(quantityProduced);
      newStatus = newQuantityProduced >= wo.quantity_ordered ? 'COMPLETED' : 'IN_PROGRESS';

      await conn.query(
        `UPDATE work_orders 
         SET quantity_produced = ?,
             status = ?,
             completed_at = CASE WHEN ? = 'COMPLETED' THEN NOW() ELSE completed_at END
         WHERE id = ?`,
        [newQuantityProduced, newStatus, newStatus, id]
      );

      // Update inventory stock (add finished goods)
      const goodQuantity = parseFloat(quantityProduced) - (parseFloat(quantityRejected) || 0);
      if (goodQuantity > 0) {
        await conn.query(
          `INSERT INTO inventory_transactions 
           (item_id, transaction_type, quantity, reference_type, reference_id, 
            transaction_date, created_by, notes)
           VALUES (?, 'PRODUCTION_RECEIPT', ?, 'WORK_ORDER', ?, ?, ?, ?)`,
          [
            wo.item_id,
            goodQuantity,
            id,
            completionDate || new Date().toISOString().split('T')[0],
            session.userId,
            `Production output from WO ${id}`
          ]
        );

        // Update stock levels
        await conn.query(
          `UPDATE inventory_stock 
           SET quantity_on_hand = quantity_on_hand + ?
           WHERE item_id = ?`,
          [goodQuantity, wo.item_id]
        );
      }
    });

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'work_orders',
      recordId: id as string,
      newValues: { quantityProduced: newQuantityProduced, status: newStatus },
    });

    return res.status(200).json({ 
      message: 'Production output recorded successfully',
      quantityProduced: newQuantityProduced,
      status: newStatus
    });
  } catch (error: any) {
    console.error('Error recording production output:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
