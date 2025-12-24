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

    if (req.method === 'GET') {
      // Get POs that are approved/sent and not fully received
      const orders = await query(
        `SELECT 
          po.id,
          po.po_number AS poNumber,
          po.po_date AS poDate,
          po.supplier_id AS supplierId,
          s.name AS supplierName,
          po.delivery_date AS deliveryDate,
          po.status,
          po.total_amount AS totalAmount,
          (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) AS itemCount,
          (SELECT SUM(quantity - received_quantity) 
           FROM purchase_order_items 
           WHERE po_id = po.id) AS pendingQuantity
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE po.status IN ('APPROVED', 'SENT', 'PARTIAL')
        AND EXISTS (
          SELECT 1 FROM purchase_order_items poi 
          WHERE poi.po_id = po.id 
          AND poi.quantity > poi.received_quantity
        )
        ORDER BY po.po_date DESC, po.po_number DESC`
      );

      return res.status(200).json({ orders });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Pending POs API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
