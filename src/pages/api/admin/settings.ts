import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only SYSTEM_ADMIN can manage settings
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  if (req.method === 'GET') {
    try {
      const settings = await query('SELECT * FROM system_settings');
      
      // Convert array to key-value object
      const settingsObj: any = {};
      settings.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });

      return res.status(200).json({ settings: settingsObj });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const settings = req.body;

      // Update or insert each setting
      for (const [key, value] of Object.entries(settings)) {
        await execute(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value),
           updated_by = VALUES(updated_by),
           updated_at = CURRENT_TIMESTAMP`,
          [key, value, session.userId]
        );
      }

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'system_settings',
        recordId: 'system',
        newValues: settings,
      });

      return res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
