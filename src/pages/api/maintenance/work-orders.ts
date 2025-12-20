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
          mwo.id,
          mwo.wo_number as woNumber,
          mwo.wo_date as woDate,
          e.equipment_name as equipmentName,
          mwo.maintenance_type as maintenanceType,
          mwo.priority,
          mwo.status,
          CONCAT(u.first_name, ' ', u.last_name) as assignedToName,
          mwo.scheduled_start_date as scheduledDate
        FROM maintenance_work_orders mwo
        LEFT JOIN equipment e ON mwo.equipment_id = e.id
        LEFT JOIN users u ON mwo.assigned_to = u.id
        ORDER BY mwo.wo_date DESC
      `;

      const workOrders = await query(sql);

      return res.status(200).json({ workOrders });
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
