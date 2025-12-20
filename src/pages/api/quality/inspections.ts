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
          qi.id,
          qi.inspection_number as inspectionNumber,
          qi.inspection_date as inspectionDate,
          i.name as itemName,
          qi.batch_number as lotNumber,
          qi.quantity_inspected as quantityInspected,
          qi.quantity_accepted as quantityPassed,
          qi.quantity_rejected as quantityFailed,
          qi.status,
          CONCAT(u.first_name, ' ', u.last_name) as inspectorName
        FROM quality_inspections qi
        LEFT JOIN items i ON qi.item_id = i.id
        LEFT JOIN users u ON qi.inspector_id = u.id
        ORDER BY qi.inspection_date DESC
      `;

      const inspections = await query(sql);

      return res.status(200).json({ inspections });
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
