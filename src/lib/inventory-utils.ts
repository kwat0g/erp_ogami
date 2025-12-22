import { query, execute } from './db';

/**
 * Reserve stock for an order or requisition
 * @param itemId - The ID of the item
 * @param warehouseId - The ID of the warehouse
 * @param quantity - The quantity to reserve
 */
export async function reserveStock(
  itemId: string,
  warehouseId: string,
  quantity: number
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check available stock
    const [stock]: any = await query(
      `SELECT quantity, reserved_quantity, available_quantity 
       FROM inventory_stock 
       WHERE item_id = ? AND warehouse_id = ?`,
      [itemId, warehouseId]
    );

    if (!stock) {
      return { success: false, message: 'No stock record found for this item in the warehouse' };
    }

    const availableQty = stock.available_quantity || (stock.quantity - (stock.reserved_quantity || 0));

    if (availableQty < quantity) {
      return { 
        success: false, 
        message: `Insufficient stock. Available: ${availableQty}, Requested: ${quantity}` 
      };
    }

    // Reserve the stock
    await execute(
      `UPDATE inventory_stock 
       SET reserved_quantity = reserved_quantity + ?,
           available_quantity = quantity - (reserved_quantity + ?)
       WHERE item_id = ? AND warehouse_id = ?`,
      [quantity, quantity, itemId, warehouseId]
    );

    return { success: true };
  } catch (error) {
    console.error('Error reserving stock:', error);
    return { success: false, message: 'Error reserving stock' };
  }
}

/**
 * Release reserved stock (e.g., when order is cancelled)
 * @param itemId - The ID of the item
 * @param warehouseId - The ID of the warehouse
 * @param quantity - The quantity to release
 */
export async function releaseReservedStock(
  itemId: string,
  warehouseId: string,
  quantity: number
): Promise<void> {
  await execute(
    `UPDATE inventory_stock 
     SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
         available_quantity = quantity - GREATEST(0, reserved_quantity - ?)
     WHERE item_id = ? AND warehouse_id = ?`,
    [quantity, quantity, itemId, warehouseId]
  );
}

/**
 * Issue stock (reduce actual quantity and reserved quantity)
 * @param itemId - The ID of the item
 * @param warehouseId - The ID of the warehouse
 * @param quantity - The quantity to issue
 */
export async function issueStock(
  itemId: string,
  warehouseId: string,
  quantity: number
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if we have enough reserved stock
    const [stock]: any = await query(
      `SELECT quantity, reserved_quantity FROM inventory_stock 
       WHERE item_id = ? AND warehouse_id = ?`,
      [itemId, warehouseId]
    );

    if (!stock) {
      return { success: false, message: 'No stock record found' };
    }

    if (stock.quantity < quantity) {
      return { success: false, message: 'Insufficient stock quantity' };
    }

    // Reduce both actual quantity and reserved quantity
    await execute(
      `UPDATE inventory_stock 
       SET quantity = quantity - ?,
           reserved_quantity = GREATEST(0, reserved_quantity - ?),
           available_quantity = (quantity - ?) - GREATEST(0, reserved_quantity - ?)
       WHERE item_id = ? AND warehouse_id = ?`,
      [quantity, quantity, quantity, quantity, itemId, warehouseId]
    );

    // Auto-manage active status
    await autoSetInactiveIfZeroStock(itemId);

    return { success: true };
  } catch (error) {
    console.error('Error issuing stock:', error);
    return { success: false, message: 'Error issuing stock' };
  }
}

/**
 * Check if an item's total stock across all warehouses is 0 and set it to inactive
 * @param itemId - The ID of the item to check
 */
export async function autoSetInactiveIfZeroStock(itemId: string): Promise<void> {
  try {
    // Get total stock across all warehouses
    const [stockResult]: any = await query(
      `SELECT COALESCE(SUM(quantity), 0) as totalStock 
       FROM inventory_stock 
       WHERE item_id = ?`,
      [itemId]
    );

    const totalStock = parseFloat(stockResult?.totalStock || 0);

    // If total stock is 0 or less, set item to inactive
    if (totalStock <= 0) {
      await execute(
        `UPDATE items SET is_active = FALSE WHERE id = ?`,
        [itemId]
      );
      console.log(`Item ${itemId} set to inactive due to zero stock`);
    } else {
      // If stock is greater than 0, ensure item is active
      await execute(
        `UPDATE items SET is_active = TRUE WHERE id = ?`,
        [itemId]
      );
      console.log(`Item ${itemId} set to active due to available stock`);
    }
  } catch (error) {
    console.error('Error in autoSetInactiveIfZeroStock:', error);
    // Don't throw error to prevent disrupting the main operation
  }
}

/**
 * Update inventory stock and automatically manage item active status
 * @param itemId - The ID of the item
 * @param warehouseId - The ID of the warehouse
 * @param quantityChange - The quantity change (positive for increase, negative for decrease)
 */
export async function updateStockWithAutoStatus(
  itemId: string,
  warehouseId: string,
  quantityChange: number
): Promise<void> {
  // Update the stock - available_quantity = quantity - reserved_quantity
  await execute(
    `INSERT INTO inventory_stock (item_id, warehouse_id, quantity, reserved_quantity, available_quantity, last_transaction_date)
     VALUES (?, ?, ?, 0, ?, NOW())
     ON DUPLICATE KEY UPDATE
       quantity = quantity + VALUES(quantity),
       available_quantity = (quantity + VALUES(quantity)) - COALESCE(reserved_quantity, 0),
       last_transaction_date = NOW()`,
    [itemId, warehouseId, quantityChange, quantityChange]
  );

  // Auto-manage active status based on total stock
  await autoSetInactiveIfZeroStock(itemId);
}
