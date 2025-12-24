import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { sanitizeText, sanitizeOptionalText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;
  const idStr = sanitizeText(id);

  if (req.method === 'GET') {
    try {
      const rows = await query(
        `SELECT 
          id, equipment_code as equipmentCode, equipment_name as equipmentName,
          equipment_type as equipmentType, location, manufacturer,
          model_number as modelNumber, serial_number as serialNumber,
          installation_date as installationDate, status, notes,
          created_at as createdAt, updated_at as updatedAt
        FROM equipment WHERE id = ?`,
        [idStr]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      return res.status(200).json({ equipment: rows[0] });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'maintenance_equipment')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
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

      const validStatuses = ['OPERATIONAL', 'DOWN', 'MAINTENANCE', 'RETIRED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      await execute(
        `UPDATE equipment 
         SET equipment_code = ?, equipment_name = ?, equipment_type = ?,
             location = ?, manufacturer = ?, model_number = ?, serial_number = ?,
             installation_date = ?, status = ?, notes = ?
         WHERE id = ?`,
        [
          equipmentCode,
          equipmentName,
          sanitizeOptionalText(equipmentType),
          sanitizeOptionalText(location),
          sanitizeOptionalText(manufacturer),
          sanitizeOptionalText(modelNumber),
          sanitizeOptionalText(serialNumber),
          installationDate || null,
          status || 'OPERATIONAL',
          sanitizeOptionalText(notes),
          idStr
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'equipment',
        recordId: idStr,
        newValues: { equipmentCode, equipmentName, status },
      });

      return res.status(200).json({ message: 'Equipment updated successfully' });
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Equipment code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'maintenance_equipment')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access.' 
      });
    }

    try {
      await execute('DELETE FROM equipment WHERE id = ?', [idStr]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'equipment',
        recordId: idStr,
        newValues: {},
      });

      return res.status(200).json({ message: 'Equipment deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      
      // Check for foreign key constraint error
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
          message: 'Cannot delete this equipment because it has associated maintenance work orders, schedules, or other records. Please delete or reassign those records first.' 
        });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
