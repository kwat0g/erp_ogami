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
      const { poId } = req.query;

      if (!poId) {
        return res.status(400).json({ message: 'PO ID is required' });
      }

      const items = await query(
        `SELECT 
          poi.id,
          poi.item_id AS itemId,
          i.item_code AS itemCode,
          i.name AS itemName,
          i.unit_of_measure AS unitOfMeasure,
          poi.quantity,
          poi.received_quantity AS receivedQuantity,
          (poi.quantity - poi.received_quantity) AS pendingQuantity,
          poi.unit_price AS unitPrice,
          poi.total_price AS totalPrice,
          poi.tax_rate AS taxRate,
          poi.discount_rate AS discountRate
        FROM purchase_order_items poi
        JOIN items i ON poi.item_id = i.id
        WHERE poi.po_id = ?
        AND poi.quantity > poi.received_quantity
        ORDER BY i.item_code`,
        [poId]
      );

      return res.status(200).json({ items });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('PO Items API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
