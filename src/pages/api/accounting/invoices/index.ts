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
          i.id, i.invoice_number as invoiceNumber, i.invoice_date as invoiceDate,
          i.invoice_type as invoiceType, i.due_date as dueDate, i.payment_terms as paymentTerms,
          i.status, i.subtotal, i.tax_amount as taxAmount, i.discount_amount as discountAmount,
          i.total_amount as totalAmount, i.paid_amount as paidAmount, i.balance_amount as balanceAmount,
          s.name as supplierName, c.name as customerName
        FROM invoices i
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.invoice_date DESC, i.invoice_number DESC
      `;

      const invoices = await query(sql);

      return res.status(200).json({ invoices });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'accounting_invoices')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot create invoices.' 
      });
    }

    try {
      const {
        invoiceDate,
        invoiceType,
        supplierId,
        customerId,
        dueDate,
        paymentTerms,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes,
        items,
      } = req.body;

      // Validation
      if (!invoiceDate || !invoiceType || !dueDate) {
        return res.status(400).json({ message: 'Invoice date, type, and due date are required' });
      }

      if (invoiceType === 'PURCHASE' && !supplierId) {
        return res.status(400).json({ message: 'Supplier is required for purchase invoices' });
      }

      if (invoiceType === 'SALES' && !customerId) {
        return res.status(400).json({ message: 'Customer is required for sales invoices' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }

      await transaction(async (connection) => {
        // Generate invoice number
        const [lastInvoiceRows] = await connection.query<any[]>(
          `SELECT invoice_number FROM invoices WHERE invoice_type = ? ORDER BY created_at DESC LIMIT 1`,
          [invoiceType]
        );

        let invoiceNumber = invoiceType === 'PURCHASE' ? 'PI-0001' : 'SI-0001';
        if (Array.isArray(lastInvoiceRows) && lastInvoiceRows.length > 0) {
          const lastNumber = parseInt(String(lastInvoiceRows[0].invoice_number).split('-')[1]);
          const prefix = invoiceType === 'PURCHASE' ? 'PI' : 'SI';
          invoiceNumber = `${prefix}-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Insert invoice
        const [invoiceResult] = await connection.query<any>(
          `INSERT INTO invoices (
            invoice_number, invoice_date, invoice_type, supplier_id, customer_id,
            due_date, payment_terms, status, subtotal, tax_amount, discount_amount,
            total_amount, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?)`,
          [
            invoiceNumber,
            invoiceDate,
            invoiceType,
            supplierId || null,
            customerId || null,
            dueDate,
            paymentTerms || null,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            notes || null,
            session.userId,
          ]
        );

        const invoiceId = Number((invoiceResult as any).insertId);

        // Insert invoice items
        for (const item of items) {
          await connection.query(
            `INSERT INTO invoice_items (
              invoice_id, item_id, description, quantity, unit_price,
              total_price, tax_rate, discount_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              invoiceId,
              item.itemId || null,
              item.description,
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
          tableName: 'invoices',
          recordId: invoiceId.toString(),
          newValues: { invoiceNumber, invoiceDate, totalAmount },
        });

        return res.status(201).json({
          message: 'Invoice created successfully',
          id: invoiceId,
          invoiceNumber,
        });
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
