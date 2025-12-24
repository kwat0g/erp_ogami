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
      const { isActive } = req.query;

      let sql = `
        SELECT 
          id, customer_code as customerCode, customer_name as customerName,
          customer_type as customerType, contact_person as contactPerson,
          email, phone, address, city, country, tax_id as taxId,
          credit_limit as creditLimit, payment_terms_days as paymentTermsDays,
          is_active as isActive, notes, created_at as createdAt
        FROM customers
        WHERE 1=1
      `;

      const params: any[] = [];

      if (isActive !== undefined) {
        sql += ' AND is_active = ?';
        params.push(isActive === 'true' ? 1 : 0);
      }

      sql += ' ORDER BY customer_name';

      const customers = await query(sql, params);

      return res.status(200).json({ customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'accounting')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create customers.' 
      });
    }

    try {
      const {
        customerName,
        customerType,
        contactPerson,
        email,
        phone,
        address,
        city,
        country,
        taxId,
        creditLimit,
        paymentTermsDays,
        isActive,
        notes,
      } = req.body;

      if (!customerName) {
        return res.status(400).json({ message: 'Customer name is required' });
      }

      // Generate customer code
      const [lastCustomer]: any = await query(
        `SELECT customer_code FROM customers ORDER BY customer_code DESC LIMIT 1`
      );

      let customerCode;
      if (lastCustomer) {
        const lastNum = parseInt(lastCustomer.customer_code.replace('CUST-', ''));
        customerCode = `CUST-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        customerCode = 'CUST-00001';
      }

      const customerId = require('crypto').randomUUID();

      await execute(
        `INSERT INTO customers (
          id, customer_code, customer_name, customer_type, contact_person,
          email, phone, address, city, country, tax_id,
          credit_limit, payment_terms_days, is_active, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId, customerCode, customerName, customerType || 'CORPORATE',
          contactPerson || null, email || null, phone || null,
          address || null, city || null, country || 'Philippines', taxId || null,
          creditLimit || 0, paymentTermsDays || 30,
          isActive !== false ? 1 : 0, notes || null
        ]
      );

      return res.status(201).json({
        message: 'Customer created successfully',
        customerId,
        customerCode,
      });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Customer code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
