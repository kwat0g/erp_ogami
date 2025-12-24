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
      const { journalType, status, startDate, endDate } = req.query;

      let sql = `
        SELECT 
          je.id, je.journal_number as journalNumber, je.journal_date as journalDate,
          je.journal_type as journalType, je.reference_type as referenceType,
          je.reference_id as referenceId, je.reference_number as referenceNumber,
          je.description, je.total_debit as totalDebit, je.total_credit as totalCredit,
          je.status, je.posted_date as postedDate,
          CONCAT(u.first_name, ' ', u.last_name) as createdByName,
          je.created_at as createdAt
        FROM journal_entries je
        LEFT JOIN users u ON je.created_by = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (journalType) {
        sql += ' AND je.journal_type = ?';
        params.push(journalType);
      }

      if (status) {
        sql += ' AND je.status = ?';
        params.push(status);
      }

      if (startDate) {
        sql += ' AND je.journal_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND je.journal_date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY je.journal_date DESC, je.journal_number DESC';

      const journals = await query(sql, params);

      // Get lines for each journal
      for (const journal of journals as any[]) {
        const lines = await query(
          `SELECT 
            jel.id, jel.line_number as lineNumber, jel.account_id as accountId,
            coa.account_code as accountCode, coa.account_name as accountName,
            jel.description, jel.debit_amount as debitAmount, jel.credit_amount as creditAmount
          FROM journal_entry_lines jel
          JOIN chart_of_accounts coa ON jel.account_id = coa.id
          WHERE jel.journal_id = ?
          ORDER BY jel.line_number`,
          [journal.id]
        );
        journal.lines = lines;
      }

      return res.status(200).json({ journals });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'accounting')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to create journal entries.' 
      });
    }

    try {
      const {
        journalDate,
        journalType,
        referenceType,
        referenceId,
        referenceNumber,
        description,
        lines,
      } = req.body;

      if (!journalDate || !lines || lines.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate debits = credits
      const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debitAmount || 0), 0);
      const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.creditAmount || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ 
          message: `Journal entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}` 
        });
      }

      // Generate journal number
      const year = new Date(journalDate).getFullYear();
      const [lastJournal]: any = await query(
        `SELECT journal_number FROM journal_entries 
         WHERE YEAR(journal_date) = ? 
         ORDER BY journal_number DESC LIMIT 1`,
        [year]
      );

      let journalNumber;
      if (lastJournal) {
        const lastNum = parseInt(lastJournal.journal_number.split('-')[1]);
        journalNumber = `JE${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        journalNumber = `JE${year}-00001`;
      }

      const journalId = require('crypto').randomUUID();

      // Create journal entry
      await execute(
        `INSERT INTO journal_entries (
          id, journal_number, journal_date, journal_type, reference_type,
          reference_id, reference_number, description, total_debit, total_credit,
          status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
        [
          journalId, journalNumber, journalDate, journalType || 'GENERAL',
          referenceType || null, referenceId || null, referenceNumber || null,
          description || null, totalDebit, totalCredit, session.userId
        ]
      );

      // Create journal lines
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        await execute(
          `INSERT INTO journal_entry_lines (
            journal_id, line_number, account_id, description, debit_amount, credit_amount
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            journalId, i + 1, line.accountId, line.description || null,
            line.debitAmount || 0, line.creditAmount || 0
          ]
        );
      }

      return res.status(201).json({
        message: 'Journal entry created successfully',
        journalId,
        journalNumber,
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
