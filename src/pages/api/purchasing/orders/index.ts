import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute, transaction } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notification-helper';
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
          po.id, po.po_number as poNumber, po.po_date as poDate,
          po.delivery_date as deliveryDate, po.delivery_address as deliveryAddress,
          po.payment_terms as paymentTerms, po.status, po.subtotal, po.tax_amount as taxAmount,
          po.discount_amount as discountAmount, po.total_amount as totalAmount,
          s.name as supplierName,
          CONCAT(u.first_name, ' ', u.last_name) as createdByName
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        JOIN users u ON po.created_by = u.id
        ORDER BY po.po_date DESC, po.po_number DESC
      `;

      const orders = await query(sql);

      return res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'purchasing_orders')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot create purchase orders.' 
      });
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

      // Validation
      if (!poDate || !supplierId) {
        return res.status(400).json({ message: 'PO date and supplier are required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }

      // Validate items
      for (const item of items) {
        if (!item.itemId || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0) {
          return res.status(400).json({ message: 'Invalid item data' });
        }
      }

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

        // Insert PO
        await connection.query(
          `INSERT INTO purchase_orders (
            po_number, po_date, supplier_id, delivery_date, delivery_address,
            payment_terms, status, subtotal, tax_amount, discount_amount,
            total_amount, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?)`,
          [
            poNumber,
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
            session.userId,
          ]
        );

        // Get the UUID of the newly created PO
        const [newPO]: any = await connection.query(
          'SELECT id FROM purchase_orders WHERE po_number = ?',
          [poNumber]
        );
        const poId = newPO[0].id;

        // Insert PO items
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_order_items (
              po_id, item_id, quantity, unit_price, total_price,
              tax_rate, discount_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              poId,
              item.itemId,
              item.quantity,
              item.unitPrice,
              item.totalPrice,
              item.taxRate,
              item.discountRate,
            ]
          );
        }

        await createAuditLog({
          userId: session.userId,
          action: 'CREATE',
          tableName: 'purchase_orders',
          recordId: poId.toString(),
          newValues: { poNumber, poDate, supplierId, totalAmount },
        });

        // Notify approvers (GENERAL_MANAGER, VICE_PRESIDENT, PRESIDENT) - exclude creator
        const approvers: any = await query(`
          SELECT DISTINCT u.id, u.username
          FROM users u
          WHERE u.is_active = 1 
            AND u.role IN ('GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT')
            AND u.id != ?
        `, [session.userId]);

        for (const approver of approvers) {
          await createNotification({
            userId: approver.id,
            title: 'New PO Awaiting Approval',
            message: `Purchase Order ${poNumber} has been created and requires your approval`,
            type: 'ACTION_REQUIRED',
            category: 'PURCHASING',
            referenceType: 'PURCHASE_ORDER',
            referenceId: poId.toString(),
          });
        }

        return res.status(201).json({
          message: 'Purchase order created successfully',
          id: poId,
          poNumber,
        });
      });
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
