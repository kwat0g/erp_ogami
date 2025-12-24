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
      const { accountType, isActive } = req.query;

      let sql = `
        SELECT 
          id, account_code as accountCode, account_name as accountName,
          account_type as accountType, account_category as accountCategory,
          parent_account_id as parentAccountId, is_header as isHeader,
          normal_balance as normalBalance, opening_balance as openingBalance,
          current_balance as currentBalance, is_active as isActive,
          description, created_at as createdAt
        FROM chart_of_accounts
        WHERE 1=1
      `;

      const params: any[] = [];

      if (accountType) {
        sql += ' AND account_type = ?';
        params.push(accountType);
      }

      if (isActive !== undefined) {
        sql += ' AND is_active = ?';
        params.push(isActive === 'true' ? 1 : 0);
      }

      sql += ' ORDER BY account_code';

      const accounts = await query(sql, params);

      return res.status(200).json({ accounts });
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'accounting')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create accounts.' 
      });
    }

    try {
      const {
        accountCode,
        accountName,
        accountType,
        accountCategory,
        parentAccountId,
        isHeader,
        normalBalance,
        openingBalance,
        description,
        isActive,
      } = req.body;

      if (!accountCode || !accountName || !accountType || !normalBalance) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const accountId = require('crypto').randomUUID();

      await execute(
        `INSERT INTO chart_of_accounts (
          id, account_code, account_name, account_type, account_category,
          parent_account_id, is_header, normal_balance, opening_balance,
          current_balance, is_active, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          accountId, accountCode, accountName, accountType, accountCategory || null,
          parentAccountId || null, isHeader || false, normalBalance,
          openingBalance || 0, openingBalance || 0,
          isActive !== false ? 1 : 0, description || null
        ]
      );

      return res.status(201).json({
        message: 'Account created successfully',
        accountId,
      });
    } catch (error: any) {
      console.error('Error creating account:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Account code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
