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
      const [po]: any = await query(
        `SELECT 
          po.id, po.po_number as poNumber, po.po_date as poDate,
          po.supplier_id as supplierId, po.delivery_date as deliveryDate,
          po.delivery_address as deliveryAddress, po.payment_terms as paymentTerms,
          po.status, po.subtotal, po.tax_amount as taxAmount,
          po.discount_amount as discountAmount, po.total_amount as totalAmount,
          po.notes, po.created_by as createdBy,
          s.name as supplierName
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE po.id = ?`,
        [id]
      );

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      const items = await query(
        `SELECT 
          poi.id, poi.item_id as itemId, poi.quantity, poi.unit_price as unitPrice,
          poi.total_price as totalPrice, poi.tax_rate as taxRate,
          poi.discount_rate as discountRate,
          i.code as itemCode, i.name as itemName
        FROM purchase_order_items poi
        JOIN items i ON poi.item_id = i.id
        WHERE poi.po_id = ?`,
        [id]
      );

      po.items = items;

      return res.status(200).json({ order: po });
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const canEdit = ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'].includes(session.role);
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied: Only purchasing staff and managers can edit POs' });
    }

    try {
      const {
        poDate,
        supplierId,
        deliveryDate,
        deliveryAddress,
        paymentTerms,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes,
        items,
      } = req.body;

      // Check if PO exists and is in DRAFT status
      const [existingPO]: any = await query(
        'SELECT id, po_number, status, created_by FROM purchase_orders WHERE id = ?',
        [id]
      );

      if (!existingPO) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (existingPO.status !== 'DRAFT') {
        return res.status(400).json({ 
          message: `Cannot edit PO with status ${existingPO.status}. Only DRAFT POs can be edited.` 
        });
      }

      await transaction(async (connection) => {
        // Update PO
        await connection.query(
          `UPDATE purchase_orders 
           SET po_date = ?, supplier_id = ?, delivery_date = ?, delivery_address = ?,
               payment_terms = ?, subtotal = ?, tax_amount = ?, discount_amount = ?,
               total_amount = ?, notes = ?, updated_at = NOW()
           WHERE id = ?`,
          [
            poDate,
            supplierId,
            deliveryDate || null,
            deliveryAddress || null,
            paymentTerms || null,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            notes || null,
            id,
          ]
        );

        // Delete existing items
        await connection.query('DELETE FROM purchase_order_items WHERE po_id = ?', [id]);

        // Insert updated items
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_order_items (
              po_id, item_id, quantity, unit_price, total_price,
              tax_rate, discount_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.itemId,
              item.quantity,
              item.unitPrice,
              item.totalPrice,
              item.taxRate || 0,
              item.discountRate || 0,
            ]
          );
        }

        await createAuditLog({
          userId: session.userId,
          action: 'UPDATE',
          tableName: 'purchase_orders',
          recordId: id as string,
          newValues: { poDate, supplierId, items: items.length },
        });
      });

      return res.status(200).json({ message: 'Purchase order updated successfully' });
    } catch (error) {
      console.error('Error updating purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    const canDelete = ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'].includes(session.role);
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied: Only purchasing staff and managers can delete POs' });
    }

    try {
      const [existingPO]: any = await query(
        'SELECT id, po_number, status FROM purchase_orders WHERE id = ?',
        [id]
      );

      if (!existingPO) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (existingPO.status !== 'DRAFT') {
        return res.status(400).json({ 
          message: `Cannot delete PO with status ${existingPO.status}. Only DRAFT POs can be deleted.` 
        });
      }

      await execute('DELETE FROM purchase_orders WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'purchase_orders',
        recordId: id as string,
        oldValues: { po_number: existingPO.po_number, status: existingPO.status },
      });

      return res.status(200).json({ message: 'Purchase order deleted successfully' });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
