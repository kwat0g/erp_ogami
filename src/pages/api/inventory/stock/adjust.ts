import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { hasWritePermission } from '@/lib/permissions';
import { updateStockWithAutoStatus } from '@/lib/inventory-utils';

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
    // Check write permission
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to adjust stock.' 
      });
    }

    try {
      const { itemId, warehouseId, quantity, adjustmentType, notes } = req.body;

      if (!itemId || !warehouseId || quantity === undefined || quantity === null) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get current stock
      const [currentStock]: any = await query(
        `SELECT quantity, available_quantity FROM inventory_stock 
         WHERE item_id = ? AND warehouse_id = ?`,
        [itemId, warehouseId]
      );

      let finalQuantity = parseFloat(quantity);
      let quantityChange = 0;

      if (adjustmentType === 'SET') {
        // Set to specific quantity
        const currentQty = currentStock?.quantity || 0;
        quantityChange = finalQuantity - currentQty;
      } else if (adjustmentType === 'SUBTRACT') {
        // Subtract from current
        quantityChange = -Math.abs(finalQuantity);
      } else {
        // ADD - default
        quantityChange = Math.abs(finalQuantity);
      }

      // Update stock using the helper function (which also manages active status)
      await updateStockWithAutoStatus(itemId, warehouseId, quantityChange);

      // Generate transaction number
      const year = new Date().getFullYear();
      const [lastTxn]: any = await query(
        `SELECT transaction_number FROM inventory_transactions 
         WHERE YEAR(transaction_date) = ? 
         ORDER BY transaction_number DESC LIMIT 1`,
        [year]
      );

      let txnNumber;
      if (lastTxn && lastTxn.transaction_number) {
        const lastNum = parseInt(lastTxn.transaction_number.split('-')[1]);
        txnNumber = `TXN${year}-${String(lastNum + 1).padStart(6, '0')}`;
      } else {
        txnNumber = `TXN${year}-000001`;
      }

      // Create inventory transaction
      await execute(
        `INSERT INTO inventory_transactions (
          transaction_number, transaction_date, transaction_type, 
          item_id, warehouse_id, quantity, 
          reference_type, notes, created_by
        ) VALUES (?, NOW(), 'ADJUSTMENT', ?, ?, ?, 'MANUAL_ADJUSTMENT', ?, ?)`,
        [txnNumber, itemId, warehouseId, quantityChange, notes || 'Stock adjustment', session.userId]
      );

      return res.status(200).json({ 
        message: 'Stock adjusted successfully',
        transactionNumber: txnNumber
      });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
