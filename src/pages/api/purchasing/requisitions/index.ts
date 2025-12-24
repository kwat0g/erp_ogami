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
        ORDER BY pr.pr_date DESC, pr.pr_number DESC
      `;

      const requisitions = await query(sql);

      return res.status(200).json({ requisitions });
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'purchasing_requisitions')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot create purchase requisitions.' 
      });
    }

    try {
      const { prDate, department, requiredDate, notes, items, sourceType, sourceReference } = req.body;

      // Validation
      if (!prDate || !department) {
        return res.status(400).json({ message: 'PR date and department are required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }

      // Validate items
      for (const item of items) {
        if (!item.itemId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: 'Invalid item data' });
        }
      }

      await transaction(async (connection) => {
        // Generate PR number
        const [lastPRRows] = await connection.query(
          "SELECT pr_number FROM purchase_requisitions ORDER BY created_at DESC LIMIT 1"
        );
        const lastPR = lastPRRows as any[];
        
        let prNumber = 'PR-0001';
        if (lastPR && lastPR.length > 0) {
          const lastNumber = parseInt(lastPR[0].pr_number.split('-')[1]);
          prNumber = `PR-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Insert PR
        const [prResult] = await connection.query(
          `INSERT INTO purchase_requisitions (
            pr_number, pr_date, requested_by, department, source_type, source_reference, required_date, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
          [prNumber, prDate, session.userId, department, sourceType || 'MANUAL', sourceReference || null, requiredDate || null, notes || null]
        );

        // Get the UUID of the newly created PR
        const [newPR]: any = await connection.query(
          'SELECT id FROM purchase_requisitions WHERE pr_number = ?',
          [prNumber]
        );
        const prId = newPR[0].id;

        // Insert PR items
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_requisition_items (
              pr_id, item_id, quantity, estimated_unit_price, estimated_total_price,
              required_date, purpose, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prId,
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
          action: 'CREATE',
          tableName: 'purchase_requisitions',
          recordId: prId.toString(),
          newValues: { prNumber, prDate, department, items },
        });

        return res.status(201).json({ 
          message: 'Purchase requisition created successfully', 
          id: prId,
          prNumber 
        });
      });
    } catch (error: any) {
      console.error('Error creating requisition:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
