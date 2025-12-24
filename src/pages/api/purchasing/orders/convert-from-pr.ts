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

  if (req.method === 'POST') {
    // Only purchasing staff, dept heads, and managers can convert PR to PO
    const canConvert = ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'].includes(session.role);
    if (!canConvert) {
      return res.status(403).json({ message: 'Access denied: Only purchasing staff and managers can convert PR to PO' });
    }

    try {
      const { prId, supplierId, deliveryDate, deliveryAddress, paymentTerms, notes } = req.body;

      if (!prId || !supplierId) {
        return res.status(400).json({ message: 'PR ID and Supplier ID are required' });
      }

      // Check if PR exists and is approved
      const [pr]: any = await query(
        'SELECT id, pr_number, status, department FROM purchase_requisitions WHERE id = ?',
        [prId]
      );

      if (!pr) {
        return res.status(404).json({ message: 'Purchase requisition not found' });
      }

      if (pr.status !== 'APPROVED') {
        return res.status(400).json({ message: 'Only APPROVED PRs can be converted to POs' });
      }

      // Get PR items
      const prItems = await query(
        `SELECT pri.id, pri.item_id, pri.quantity, pri.estimated_unit_price, pri.notes
         FROM purchase_requisition_items pri
         WHERE pri.pr_id = ?`,
        [prId]
      );

      if (prItems.length === 0) {
        return res.status(400).json({ message: 'PR has no items' });
      }

      let poId: string = '';

      await transaction(async (connection) => {
        // Generate PO number
        const [lastPORows] = await connection.query(
          "SELECT po_number FROM purchase_orders ORDER BY created_at DESC LIMIT 1"
        );
        const lastPO = lastPORows as any[];
        
        let poNumber = 'PO-0001';
        if (lastPO && lastPO.length > 0) {
          const lastNumber = parseInt(lastPO[0].po_number.split('-')[1]);
          poNumber = `PO-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Calculate totals
        const subtotal = prItems.reduce((sum: number, item: any) => 
          sum + (parseFloat(item.quantity) * parseFloat(item.estimated_unit_price || 0)), 0
        );

        // Insert PO
        await connection.query(
          `INSERT INTO purchase_orders (
            po_number, po_date, supplier_id, delivery_date, delivery_address,
            payment_terms, status, subtotal, total_amount, notes, created_by
          ) VALUES (?, NOW(), ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)`,
          [poNumber, supplierId, deliveryDate || null, deliveryAddress || null, 
           paymentTerms || null, subtotal, subtotal, notes || null, session.userId]
        );

        // Get PO ID
        const [newPO]: any = await connection.query(
          'SELECT id FROM purchase_orders WHERE po_number = ?',
          [poNumber]
        );
        poId = newPO[0].id;

        // Insert PO items
        for (const prItem of prItems) {
          const totalPrice = parseFloat(prItem.quantity) * parseFloat(prItem.estimated_unit_price || 0);
          
          await connection.query(
            `INSERT INTO purchase_order_items (
              po_id, pr_item_id, item_id, quantity, unit_price, total_price, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [poId, prItem.id, prItem.item_id, prItem.quantity, 
             prItem.estimated_unit_price || 0, totalPrice, prItem.notes || null]
          );
        }

        // Update PR status to CONVERTED
        await connection.query(
          'UPDATE purchase_requisitions SET status = ?, updated_at = NOW() WHERE id = ?',
          ['CONVERTED', prId]
        );

        await createAuditLog({
          userId: session.userId,
          action: 'CREATE',
          tableName: 'purchase_orders',
          recordId: poId,
          newValues: { poNumber, prId, supplierId },
        });
      });

      return res.status(201).json({ 
        message: 'PO created successfully from PR',
        poId
      });
    } catch (error) {
      console.error('Error converting PR to PO:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
