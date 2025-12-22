import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute, transaction } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { id } = req.query;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    try {
      const [pr]: any = await query(
        `SELECT 
          pr.id, pr.pr_number as prNumber, pr.pr_date as prDate,
          pr.requested_by as requestedBy, pr.department, pr.source_type as sourceType,
          pr.source_reference as sourceReference, pr.required_date as requiredDate,
          pr.status, pr.approved_by as approvedBy, pr.approved_date as approvedDate,
          pr.rejection_reason as rejectionReason, pr.notes,
          CONCAT(u1.first_name, ' ', u1.last_name) as requestedByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as approvedByName
        FROM purchase_requisitions pr
        JOIN users u1 ON pr.requested_by = u1.id
        LEFT JOIN users u2 ON pr.approved_by = u2.id
        WHERE pr.id = ?`,
        [id]
      );

      if (!pr) {
        return res.status(404).json({ message: 'Purchase requisition not found' });
      }

      const items = await query(
        `SELECT 
          pri.id, pri.item_id as itemId, pri.quantity, 
          pri.estimated_unit_price as estimatedUnitPrice,
          pri.estimated_total_price as estimatedTotalPrice,
          pri.required_date as requiredDate, pri.purpose, pri.notes,
          i.code as itemCode, i.name as itemName, u.name as uomName
        FROM purchase_requisition_items pri
        JOIN items i ON pri.item_id = i.id
        JOIN units_of_measure u ON i.uom_id = u.id
        WHERE pri.pr_id = ?`,
        [id]
      );

      pr.items = items;

      return res.status(200).json({ requisition: pr });
    } catch (error) {
      console.error('Error fetching requisition:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'purchasing_requisitions')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
      });
    }

    try {
      const { prDate, department, requiredDate, notes, items, sourceType, sourceReference } = req.body;

      // Check if PR can be edited
      const [existingPR]: any = await query(
        'SELECT status, requested_by FROM purchase_requisitions WHERE id = ?',
        [id]
      );

      if (!existingPR) {
        return res.status(404).json({ message: 'Purchase requisition not found' });
      }

      // Only allow editing DRAFT or PENDING PRs
      if (!['DRAFT', 'PENDING'].includes(existingPR.status)) {
        return res.status(400).json({ 
          message: `Cannot edit PR with status ${existingPR.status}. Only DRAFT or PENDING PRs can be edited.` 
        });
      }

      // Only creator can edit
      if (existingPR.requested_by !== session.userId) {
        return res.status(403).json({ message: 'Only the PR creator can edit it' });
      }

      await transaction(async (connection) => {
        // Update PR
        await connection.query(
          `UPDATE purchase_requisitions 
           SET pr_date = ?, department = ?, source_type = ?, source_reference = ?,
               required_date = ?, notes = ?, updated_at = NOW()
           WHERE id = ?`,
          [prDate, department, sourceType || 'MANUAL', sourceReference || null, requiredDate || null, notes || null, id]
        );

        // Delete existing items
        await connection.query('DELETE FROM purchase_requisition_items WHERE pr_id = ?', [id]);

        // Insert updated items
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_requisition_items (
              pr_id, item_id, quantity, estimated_unit_price, estimated_total_price,
              required_date, purpose, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.itemId,
              item.quantity,
              item.estimatedUnitPrice || 0,
              item.estimatedTotalPrice || 0,
              item.requiredDate || null,
              item.purpose || null,
              item.notes || null,
            ]
          );
        }

        await createAuditLog({
          userId: session.userId,
          action: 'UPDATE',
          tableName: 'purchase_requisitions',
          recordId: id as string,
          newValues: { prDate, department, items: items.length },
        });
      });

      return res.status(200).json({ message: 'Purchase requisition updated successfully' });
    } catch (error) {
      console.error('Error updating requisition:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'purchasing_requisitions')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const [existingPR]: any = await query(
        'SELECT status, requested_by FROM purchase_requisitions WHERE id = ?',
        [id]
      );

      if (!existingPR) {
        return res.status(404).json({ message: 'Purchase requisition not found' });
      }

      // Only allow deleting DRAFT PRs
      if (existingPR.status !== 'DRAFT') {
        return res.status(400).json({ 
          message: 'Only DRAFT PRs can be deleted' 
        });
      }

      await execute('DELETE FROM purchase_requisitions WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'purchase_requisitions',
        recordId: id as string,
        oldValues: { status: existingPR.status },
      });

      return res.status(200).json({ message: 'Purchase requisition deleted successfully' });
    } catch (error) {
      console.error('Error deleting requisition:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
