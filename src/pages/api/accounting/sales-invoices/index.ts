import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
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
      const { customerId, status, startDate, endDate } = req.query;

      let sql = `
        SELECT 
          si.id, si.invoice_number as invoiceNumber, si.invoice_date as invoiceDate,
          si.customer_id as customerId, c.customer_name as customerName,
          si.due_date as dueDate, si.payment_terms_days as paymentTermsDays,
          si.subtotal, si.tax_amount as taxAmount, si.discount_amount as discountAmount,
          si.total_amount as totalAmount, si.amount_paid as amountPaid,
          si.balance_due as balanceDue, si.status, si.reference_number as referenceNumber,
          si.notes, si.created_at as createdAt,
          CONCAT(u.first_name, ' ', u.last_name) as createdByName
        FROM sales_invoices si
        JOIN customers c ON si.customer_id = c.id
        LEFT JOIN users u ON si.created_by = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (customerId) {
        sql += ' AND si.customer_id = ?';
        params.push(customerId);
      }

      if (status) {
        sql += ' AND si.status = ?';
        params.push(status);
      }

      if (startDate) {
        sql += ' AND si.invoice_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND si.invoice_date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY si.invoice_date DESC, si.invoice_number DESC';

      const invoices = await query(sql, params);

      return res.status(200).json({ invoices });
    } catch (error) {
      console.error('Error fetching sales invoices:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'accounting')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create invoices.' 
      });
    }

    try {
      const {
        customerId,
        invoiceDate,
        paymentTermsDays,
        items,
        taxPercentage,
        discountAmount,
        referenceNumber,
        notes,
      } = req.body;

      if (!customerId || !invoiceDate || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Generate invoice number
      const year = new Date(invoiceDate).getFullYear();
      const [lastInvoice]: any = await query(
        `SELECT invoice_number FROM sales_invoices 
         WHERE YEAR(invoice_date) = ? 
         ORDER BY invoice_number DESC LIMIT 1`,
        [year]
      );

      let invoiceNumber;
      if (lastInvoice) {
        const lastNum = parseInt(lastInvoice.invoice_number.split('-')[1]);
        invoiceNumber = `INV${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        invoiceNumber = `INV${year}-00001`;
      }

      // Calculate totals
      let subtotal = 0;
      items.forEach((item: any) => {
        const lineTotal = item.quantity * item.unitPrice;
        const discount = lineTotal * (item.discountPercentage || 0) / 100;
        subtotal += lineTotal - discount;
      });

      const taxAmount = subtotal * (taxPercentage || 0) / 100;
      const totalAmount = subtotal + taxAmount - (discountAmount || 0);

      // Calculate due date
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + (paymentTermsDays || 30));

      const invoiceId = require('crypto').randomUUID();

      // Create invoice
      await execute(
        `INSERT INTO sales_invoices (
          id, invoice_number, invoice_date, customer_id, due_date,
          payment_terms_days, subtotal, tax_amount, discount_amount,
          total_amount, amount_paid, balance_due, status,
          reference_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'DRAFT', ?, ?, ?)`,
        [
          invoiceId, invoiceNumber, invoiceDate, customerId, dueDate.toISOString().split('T')[0],
          paymentTermsDays || 30, subtotal, taxAmount, discountAmount || 0,
          totalAmount, totalAmount, referenceNumber || null, notes || null, session.userId
        ]
      );

      // Create invoice items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const lineTotal = item.quantity * item.unitPrice;
        const discount = lineTotal * (item.discountPercentage || 0) / 100;
        const finalTotal = lineTotal - discount;

        await execute(
          `INSERT INTO sales_invoice_items (
            invoice_id, line_number, item_id, description, quantity,
            unit_price, discount_percentage, tax_percentage, line_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceId, i + 1, item.itemId || null, item.description,
            item.quantity, item.unitPrice, item.discountPercentage || 0,
            taxPercentage || 0, finalTotal
          ]
        );
      }

      return res.status(201).json({
        message: 'Sales invoice created successfully',
        invoiceId,
        invoiceNumber,
      });
    } catch (error) {
      console.error('Error creating sales invoice:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
