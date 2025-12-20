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
          p.id, p.payment_number as paymentNumber, p.payment_date as paymentDate,
          p.payment_type as paymentType, p.payment_method as paymentMethod,
          p.amount, p.reference_number as referenceNumber, p.bank_account as bankAccount,
          p.status, s.name as supplierName, c.name as customerName,
          i.invoice_number as invoiceNumber,
          CONCAT(u.first_name, ' ', u.last_name) as createdByName
        FROM payments p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN customers c ON p.customer_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        JOIN users u ON p.created_by = u.id
        ORDER BY p.payment_date DESC, p.payment_number DESC
      `;

      const payments = await query(sql);

      return res.status(200).json({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'accounting_payments')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot record payments.' 
      });
    }

    try {
      const {
        paymentDate,
        paymentType,
        paymentMethod,
        invoiceId,
        supplierId,
        customerId,
        amount,
        referenceNumber,
        bankAccount,
        notes,
      } = req.body;

      // Validation
      if (!paymentDate || !paymentType || !paymentMethod || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Payment date, type, method, and valid amount are required' });
      }

      if (paymentType === 'PAYMENT' && !supplierId && !invoiceId) {
        return res.status(400).json({ message: 'Supplier or invoice is required for payments' });
      }

      if (paymentType === 'RECEIPT' && !customerId && !invoiceId) {
        return res.status(400).json({ message: 'Customer or invoice is required for receipts' });
      }

      await transaction(async (connection) => {
        // Generate payment number
        const [lastPayment] = await connection.query(
          `SELECT payment_number FROM payments WHERE payment_type = ? ORDER BY created_at DESC LIMIT 1`,
          [paymentType]
        );

        let paymentNumber = paymentType === 'PAYMENT' ? 'PAY-0001' : 'REC-0001';
        if (lastPayment && lastPayment.length > 0) {
          const lastNumber = parseInt(lastPayment[0].payment_number.split('-')[1]);
          const prefix = paymentType === 'PAYMENT' ? 'PAY' : 'REC';
          paymentNumber = `${prefix}-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Insert payment
        const [paymentResult] = await connection.query(
          `INSERT INTO payments (
            payment_number, payment_date, payment_type, payment_method,
            invoice_id, supplier_id, customer_id, amount, reference_number,
            bank_account, status, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
          [
            paymentNumber,
            paymentDate,
            paymentType,
            paymentMethod,
            invoiceId || null,
            supplierId || null,
            customerId || null,
            amount,
            referenceNumber || null,
            bankAccount || null,
            notes || null,
            session.userId,
          ]
        );

        const paymentId = paymentResult.insertId;

        // Update invoice paid amount if invoice is linked
        if (invoiceId) {
          await connection.query(
            `UPDATE invoices SET paid_amount = paid_amount + ? WHERE id = ?`,
            [amount, invoiceId]
          );

          // Update invoice status based on balance
          await connection.query(
            `UPDATE invoices 
             SET status = CASE 
               WHEN balance_amount <= 0 THEN 'PAID'
               WHEN paid_amount > 0 THEN 'PARTIAL'
               ELSE status
             END
             WHERE id = ?`,
            [invoiceId]
          );
        }

        await createAuditLog({
          userId: session.userId,
          action: 'CREATE',
          tableName: 'payments',
          recordId: paymentId.toString(),
          newValues: { paymentNumber, paymentDate, amount },
        });

        return res.status(201).json({
          message: 'Payment recorded successfully',
          id: paymentId,
          paymentNumber,
        });
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
