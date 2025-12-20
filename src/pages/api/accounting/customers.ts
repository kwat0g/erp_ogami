import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

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
        SELECT id, code, name, contact_person as contactPerson, email, phone,
               address, city, country, payment_terms as paymentTerms,
               credit_limit as creditLimit, is_active as isActive
        FROM customers
        WHERE is_active = TRUE
        ORDER BY name
      `;

      const customers = await query(sql);

      return res.status(200).json({ customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
