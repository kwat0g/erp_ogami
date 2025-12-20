import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

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

  // Only SYSTEM_ADMIN can manage users
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  if (req.method === 'PUT') {
    try {
      const oldUser = await queryOne('SELECT * FROM users WHERE id = ?', [id]);

      if (!oldUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { email, username, password, firstName, lastName, role, department, isActive } = req.body;

      let updateSql = `UPDATE users 
         SET email = ?, username = ?, first_name = ?, last_name = ?, 
             role = ?, department = ?, is_active = ?`;
      
      let params = [email, username, firstName, lastName, role, department || null, isActive !== false];

      // Only update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateSql += `, password = ?`;
        params.push(hashedPassword);
      }

      updateSql += ` WHERE id = ?`;
      params.push(id);

      await execute(updateSql, params);

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'users',
        recordId: id as string,
        oldValues: { email: oldUser.email, role: oldUser.role },
        newValues: { email, role },
      });

      return res.status(200).json({ message: 'User updated successfully' });
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const oldUser = await queryOne('SELECT * FROM users WHERE id = ?', [id]);

      if (!oldUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent deleting yourself
      if (oldUser.id === session.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      await execute('DELETE FROM users WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'users',
        recordId: id as string,
        oldValues: { email: oldUser.email, username: oldUser.username },
      });

      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
