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
      const { startDate, endDate, status, itemId } = req.query;

      let sql = `
        SELECT 
          ps.id, ps.schedule_number as scheduleNumber,
          ps.item_id as itemId, i.code as itemCode, i.name as itemName,
          ps.scheduled_date as scheduledDate,
          ps.planned_quantity as plannedQuantity,
          ps.confirmed_quantity as confirmedQuantity,
          ps.status, ps.work_center_id as workCenterId,
          wc.name as workCenterName, ps.priority, ps.notes,
          ps.created_at as createdAt,
          CONCAT(u.first_name, ' ', u.last_name) as createdByName
        FROM production_schedules ps
        JOIN items i ON ps.item_id = i.id
        LEFT JOIN work_centers wc ON ps.work_center_id = wc.id
        LEFT JOIN users u ON ps.created_by = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (startDate) {
        sql += ' AND ps.scheduled_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND ps.scheduled_date <= ?';
        params.push(endDate);
      }

      if (status) {
        sql += ' AND ps.status = ?';
        params.push(status);
      }

      if (itemId) {
        sql += ' AND ps.item_id = ?';
        params.push(itemId);
      }

      sql += ' ORDER BY ps.scheduled_date, ps.priority DESC';

      const schedules = await query(sql, params);

      return res.status(200).json({ schedules });
    } catch (error) {
      console.error('Error fetching production schedules:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'production_planning')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create production schedules.' 
      });
    }

    try {
      const {
        itemId,
        scheduledDate,
        plannedQuantity,
        workCenterId,
        priority,
        notes,
      } = req.body;

      if (!itemId || !scheduledDate || !plannedQuantity) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Generate schedule number
      const year = new Date(scheduledDate).getFullYear();
      const [lastSchedule]: any = await query(
        `SELECT schedule_number FROM production_schedules 
         WHERE YEAR(scheduled_date) = ? 
         ORDER BY schedule_number DESC LIMIT 1`,
        [year]
      );

      let scheduleNumber;
      if (lastSchedule) {
        const lastNum = parseInt(lastSchedule.schedule_number.split('-')[1]);
        scheduleNumber = `MPS${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        scheduleNumber = `MPS${year}-00001`;
      }

      const scheduleId = require('crypto').randomUUID();

      await execute(
        `INSERT INTO production_schedules (
          id, schedule_number, item_id, scheduled_date, planned_quantity,
          status, work_center_id, priority, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, 'PLANNED', ?, ?, ?, ?)`,
        [
          scheduleId, scheduleNumber, itemId, scheduledDate, plannedQuantity,
          workCenterId || null, priority || 5, notes || null, session.userId
        ]
      );

      return res.status(201).json({
        message: 'Production schedule created successfully',
        scheduleId,
        scheduleNumber,
      });
    } catch (error) {
      console.error('Error creating production schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
