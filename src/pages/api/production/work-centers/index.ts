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
          id, code, name, description, work_center_type as workCenterType,
          capacity_per_day as capacityPerDay, capacity_uom as capacityUom,
          efficiency_percentage as efficiencyPercentage,
          is_active as isActive, created_at as createdAt
        FROM work_centers
        WHERE 1=1
      `;

      const params: any[] = [];

      if (isActive !== undefined) {
        sql += ' AND is_active = ?';
        params.push(isActive === 'true' ? 1 : 0);
      }

      sql += ' ORDER BY code';

      const workCenters = await query(sql, params);

      return res.status(200).json({ workCenters });
    } catch (error) {
      console.error('Error fetching work centers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'production_planning')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create work centers.' 
      });
    }

    try {
      const {
        code,
        name,
        description,
        workCenterType,
        capacityPerDay,
        capacityUom,
        efficiencyPercentage,
        isActive,
      } = req.body;

      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      const workCenterId = require('crypto').randomUUID();

      await execute(
        `INSERT INTO work_centers (
          id, code, name, description, work_center_type,
          capacity_per_day, capacity_uom, efficiency_percentage, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workCenterId, code, name, description || null, workCenterType || 'MACHINE',
          capacityPerDay || 0, capacityUom || 'HOURS', efficiencyPercentage || 100,
          isActive !== false ? 1 : 0
        ]
      );

      return res.status(201).json({
        message: 'Work center created successfully',
        workCenterId,
      });
    } catch (error: any) {
      console.error('Error creating work center:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Work center code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
