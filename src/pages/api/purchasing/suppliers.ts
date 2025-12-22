import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const canManageSuppliers = ['SYSTEM_ADMIN', 'GENERAL_MANAGER', 'PURCHASING_STAFF'].includes(session.role);

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT id, code, name, contact_person as contactPerson, email, phone,
               address, city, country, payment_terms as paymentTerms,
               credit_limit as creditLimit, is_active as isActive
        FROM suppliers
        ORDER BY name
      `;

      const suppliers = await query(sql);

      return res.status(200).json({ suppliers });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!canManageSuppliers) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const { code, name, contactPerson, email, phone, address, city, country, paymentTerms, creditLimit, isActive } = req.body;

      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      const result = await execute(
        `INSERT INTO suppliers (code, name, contact_person, email, phone, address, city, country, payment_terms, credit_limit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, contactPerson || null, email || null, phone || null, address || null, city || null, country || null, paymentTerms || null, creditLimit || 0, isActive !== false]
      );

      const [newSupplier]: any = await query('SELECT id FROM suppliers WHERE code = ?', [code]);

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'suppliers',
        recordId: newSupplier.id,
        newValues: { code, name },
      });

      return res.status(201).json({ message: 'Supplier created successfully', id: newSupplier.id });
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Supplier code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
