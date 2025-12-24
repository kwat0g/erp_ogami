import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const session = await findSessionByToken(token);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = session.role;
    const allowedRoles = ['PURCHASING_STAFF', 'WAREHOUSE_STAFF', 'GENERAL_MANAGER'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      const [receipt]: any = await query(
        `SELECT 
          gr.id,
          gr.gr_number AS grNumber,
          gr.gr_date AS grDate,
          gr.po_id AS poId,
          po.po_number AS poNumber,
          gr.warehouse_id AS warehouseId,
          w.name AS warehouseName,
          gr.supplier_delivery_note AS supplierDeliveryNote,
          gr.received_by AS receivedBy,
          CONCAT(u.first_name, ' ', u.last_name) AS receivedByName,
          gr.status,
          gr.notes,
          gr.created_at AS createdAt,
          s.name AS supplierName,
          po.supplier_id AS supplierId
        FROM goods_receipts gr
        JOIN purchase_orders po ON gr.po_id = po.id
        JOIN warehouses w ON gr.warehouse_id = w.id
        JOIN users u ON gr.received_by = u.id
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE gr.id = ?`,
        [id]
      );

      if (!receipt) {
        return res.status(404).json({ message: 'Goods receipt not found' });
      }

      const items = await query(
        `SELECT 
          gri.id,
          gri.po_item_id AS poItemId,
          gri.item_id AS itemId,
          i.item_code AS itemCode,
          i.name AS itemName,
          i.unit_of_measure AS unitOfMeasure,
          poi.quantity AS orderedQuantity,
          poi.unit_price AS unitPrice,
          gri.quantity_received AS quantityReceived,
          gri.quantity_accepted AS quantityAccepted,
          gri.quantity_rejected AS quantityRejected,
          gri.rejection_reason AS rejectionReason,
          gri.notes
        FROM goods_receipt_items gri
        JOIN items i ON gri.item_id = i.id
        JOIN purchase_order_items poi ON gri.po_item_id = poi.id
        WHERE gri.gr_id = ?`,
        [id]
      );

      return res.status(200).json({ receipt, items });
    }

    if (req.method === 'PUT') {
      const { status, notes } = req.body;

      const [existing]: any = await query(
        'SELECT status FROM goods_receipts WHERE id = ?',
        [id]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Goods receipt not found' });
      }

      if (existing.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Cannot modify completed receipt' });
      }

      await query(
        'UPDATE goods_receipts SET status = ?, notes = ? WHERE id = ?',
        [status || existing.status, notes, id]
      );

      return res.status(200).json({ message: 'Goods receipt updated successfully' });
    }

    if (req.method === 'DELETE') {
      const [existing]: any = await query(
        'SELECT status FROM goods_receipts WHERE id = ?',
        [id]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Goods receipt not found' });
      }

      if (existing.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Cannot delete completed receipt' });
      }

      await query('UPDATE goods_receipts SET status = ? WHERE id = ?', ['CANCELLED', id]);

      return res.status(200).json({ message: 'Goods receipt cancelled successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Receiving API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
