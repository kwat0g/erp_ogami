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
        SELECT 
          ncr.id,
          ncr.ncr_number as ncrNumber,
          ncr.ncr_date as ncrDate,
          i.name as itemName,
          ncr.defect_description as defectDescription,
          ncr.quantity_affected as quantity,
          ncr.severity,
          ncr.status,
          CONCAT(u.first_name, ' ', u.last_name) as reportedByName
        FROM non_conformance_reports ncr
        LEFT JOIN items i ON ncr.item_id = i.id
        LEFT JOIN users u ON ncr.reported_by = u.id
        ORDER BY ncr.ncr_date DESC
      `;

      const ncrs = await query(sql);

      return res.status(200).json({ ncrs });
    } catch (error) {
      console.error('Error fetching NCRs:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
