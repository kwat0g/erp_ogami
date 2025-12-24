import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          id, equipment_code as equipmentCode, equipment_name as equipmentName,
          equipment_type as equipmentType, location, manufacturer,
          model_number as modelNumber, serial_number as serialNumber,
          installation_date as installationDate, status, notes,
          created_at as createdAt, updated_at as updatedAt
        FROM equipment
        ORDER BY equipment_code
      `;
      const equipment = await query(sql);
      return res.status(200).json({ equipment });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'maintenance_equipment')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only MAINTENANCE_TECHNICIAN can create equipment.' 
      });
    }

    try {
      const {
        equipmentCode,
        equipmentName,
        equipmentType,
        location,
        manufacturer,
        modelNumber,
        serialNumber,
        installationDate,
        status,
        notes
      } = req.body;

      if (!equipmentCode || !equipmentName) {
        return res.status(400).json({ message: 'Equipment code and name are required' });
      }

      const result = await execute(
        `INSERT INTO equipment 
         (equipment_code, equipment_name, equipment_type, location, manufacturer, 
          model_number, serial_number, installation_date, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          equipmentCode,
          equipmentName,
          equipmentType || null,
          location || null,
          manufacturer || null,
          modelNumber || null,
          serialNumber || null,
          installationDate || null,
          status || 'OPERATIONAL',
          notes || null
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'equipment',
        recordId: result.insertId.toString(),
        newValues: { equipmentCode, equipmentName },
      });

      return res.status(201).json({ 
        message: 'Equipment created successfully',
        id: result.insertId
      });
    } catch (error: any) {
      console.error('Error creating equipment:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Equipment code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
