import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { id } = req.query;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only SYSTEM_ADMIN can manage departments
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  if (req.method === 'PUT') {
    try {
      const oldDept = await queryOne('SELECT * FROM departments WHERE id = ?', [id]);

      if (!oldDept) {
        return res.status(404).json({ message: 'Department not found' });
      }

      const { code, name, description, managerId, isActive } = req.body;

      await execute(
        `UPDATE departments 
         SET code = ?, name = ?, description = ?, manager_id = ?, is_active = ?
         WHERE id = ?`,
        [code, name, description || null, managerId || null, isActive !== false, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'departments',
        recordId: id as string,
        oldValues: oldDept,
        newValues: { code, name, description, managerId, isActive },
      });

      return res.status(200).json({ message: 'Department updated successfully' });
    } catch (error: any) {
      console.error('Error updating department:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Department code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const oldDept = await queryOne('SELECT * FROM departments WHERE id = ?', [id]);

      if (!oldDept) {
        return res.status(404).json({ message: 'Department not found' });
      }

      await execute('DELETE FROM departments WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'departments',
        recordId: id as string,
        oldValues: oldDept,
      });

      return res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
