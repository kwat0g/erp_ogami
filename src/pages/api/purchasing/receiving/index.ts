import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { updateStockWithAutoStatus } from '@/lib/inventory-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = decoded.role;
    const allowedRoles = ['PURCHASING_STAFF', 'WAREHOUSE_STAFF', 'GENERAL_MANAGER'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    if (req.method === 'GET') {
      const { status, poId } = req.query;
      
      let sql = `
        SELECT 
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
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (status) {
        sql += ' AND gr.status = ?';
        params.push(status);
      }
      
      if (poId) {
        sql += ' AND gr.po_id = ?';
        params.push(poId);
      }
      
      sql += ' ORDER BY gr.gr_date DESC, gr.gr_number DESC';
      
      const receipts = await query(sql, params);
      
      return res.status(200).json({ receipts });
    }

    if (req.method === 'POST') {
      const {
        grDate,
        poId,
        warehouseId,
        supplierDeliveryNote,
        items,
        notes,
      } = req.body;

      if (!grDate || !poId || !warehouseId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate PO exists and is approved
      const [po]: any = await query(
        'SELECT id, status, po_number FROM purchase_orders WHERE id = ?',
        [poId]
      );

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (!['APPROVED', 'SENT', 'PARTIAL'].includes(po.status)) {
        return res.status(400).json({ message: 'Purchase order must be approved before receiving' });
      }

      // Generate GR number
      const year = new Date(grDate).getFullYear();
      const [lastGR]: any = await query(
        `SELECT gr_number FROM goods_receipts 
         WHERE YEAR(gr_date) = ? 
         ORDER BY gr_number DESC LIMIT 1`,
        [year]
      );

      let grNumber;
      if (lastGR) {
        const lastNum = parseInt(lastGR.gr_number.split('-')[1]);
        grNumber = `GR${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        grNumber = `GR${year}-00001`;
      }

      // Create goods receipt
      const grResult: any = await query(
        `INSERT INTO goods_receipts (
          gr_number, gr_date, po_id, warehouse_id, 
          supplier_delivery_note, received_by, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
        [grNumber, grDate, poId, warehouseId, supplierDeliveryNote, decoded.userId, notes]
      );

      const grId = grResult.insertId;

      // Insert receipt items
      for (const item of items) {
        await query(
          `INSERT INTO goods_receipt_items (
            gr_id, po_item_id, item_id, quantity_received, 
            quantity_accepted, quantity_rejected, rejection_reason, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            grId,
            item.poItemId,
            item.itemId,
            item.quantityReceived,
            item.quantityAccepted,
            item.quantityRejected || 0,
            item.rejectionReason || null,
            item.notes || null,
          ]
        );

        // Update PO item received quantity
        await query(
          `UPDATE purchase_order_items 
           SET received_quantity = received_quantity + ? 
           WHERE id = ?`,
          [item.quantityAccepted, item.poItemId]
        );

        // Update inventory stock and auto-manage item status
        await updateStockWithAutoStatus(item.itemId, warehouseId, item.quantityAccepted);

        // Create inventory transaction
        await query(
          `INSERT INTO inventory_transactions (
            item_id, warehouse_id, transaction_type, quantity, 
            reference_type, reference_id, transaction_date, notes
          ) VALUES (?, ?, 'RECEIPT', ?, 'GOODS_RECEIPT', ?, ?, ?)`,
          [item.itemId, warehouseId, item.quantityAccepted, grId, grDate, `GR: ${grNumber}`]
        );
      }

      // Check if PO is fully received
      const [poItems]: any = await query(
        `SELECT 
          SUM(quantity) as totalOrdered,
          SUM(received_quantity) as totalReceived
         FROM purchase_order_items 
         WHERE po_id = ?`,
        [poId]
      );

      if (poItems.totalOrdered <= poItems.totalReceived) {
        await query(
          `UPDATE purchase_orders SET status = 'COMPLETED' WHERE id = ?`,
          [poId]
        );
      } else {
        await query(
          `UPDATE purchase_orders SET status = 'PARTIAL' WHERE id = ?`,
          [poId]
        );
      }

      // Mark GR as completed
      await query(
        `UPDATE goods_receipts SET status = 'COMPLETED' WHERE id = ?`,
        [grId]
      );

      return res.status(201).json({
        message: 'Goods receipt created successfully',
        grId,
        grNumber,
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Receiving API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
