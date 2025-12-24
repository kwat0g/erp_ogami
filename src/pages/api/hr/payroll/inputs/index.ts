import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { assertEnum, assertNumber, isValidISODate, sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  // HR_STAFF can encode, ACCOUNTING_STAFF can view, GENERAL_MANAGER can view, SYSTEM_ADMIN can do both
  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'ACCOUNTING_STAFF', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const { employeeId, periodStart, periodEnd, processed } = req.query;
      const where: string[] = [];
      const params: any[] = [];

      if (employeeId) {
        where.push('CAST(pi.employee_id AS CHAR(36)) = ?');
        params.push(employeeId);
      }

      if (periodStart) {
        where.push('pi.payroll_period_start >= ?');
        params.push(periodStart);
      }

      if (periodEnd) {
        where.push('pi.payroll_period_end <= ?');
        params.push(periodEnd);
      }

      if (processed !== undefined) {
        where.push('pi.processed = ?');
        params.push(processed === 'true' ? 1 : 0);
      }

      const sql = `
        SELECT
          pi.id,
          pi.employee_id as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          e.department_id as departmentId,
          d.name as departmentName,
          pi.payroll_period_start as periodStart,
          pi.payroll_period_end as periodEnd,
          pi.input_type as inputType,
          pi.description,
          pi.amount,
          pi.is_taxable as isTaxable,
          pi.encoded_by as encodedBy,
          pi.encoded_at as encodedAt,
          pi.processed,
          pi.processed_by as processedBy,
          pi.processed_at as processedAt,
          pi.notes,
          encoder.username as encoderUsername
        FROM payroll_inputs pi
        LEFT JOIN employees e ON CAST(pi.employee_id AS CHAR(36)) = CAST(e.id AS CHAR(36))
        LEFT JOIN departments d ON CAST(e.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        LEFT JOIN users encoder ON CAST(pi.encoded_by AS CHAR(36)) = CAST(encoder.id AS CHAR(36))
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY pi.encoded_at DESC
      `;

      const inputs = await query(sql, params);
      return res.status(200).json({ inputs });
    } catch (error) {
      console.error('Error fetching payroll inputs:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission - SYSTEM_ADMIN is read-only
    if (!hasWritePermission(session.role as any, 'hr_payroll')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only HR_STAFF can encode payroll inputs.' 
      });
    }

    try {
      const {
        employeeId,
        periodStart,
        periodEnd,
        inputType,
        description,
        amount,
        isTaxable,
        notes,
      } = req.body;

      const employeeIdSan = sanitizeText(employeeId);
      const periodStartSan = sanitizeText(periodStart);
      const periodEndSan = sanitizeText(periodEnd);
      const descriptionSan = sanitizeText(description);
      const notesSan = sanitizeOptionalText(notes);
      const inputTypeEnum = assertEnum(inputType, ['ALLOWANCE', 'DEDUCTION', 'ADJUSTMENT', 'BONUS'] as const);
      const amountNum = assertNumber(amount);

      if (!employeeIdSan || !periodStartSan || !periodEndSan || !inputTypeEnum || !descriptionSan || amountNum === null) {
        return res.status(400).json({ message: 'employeeId, periodStart, periodEnd, inputType, description, and amount are required' });
      }

      if (!isValidISODate(periodStartSan) || !isValidISODate(periodEndSan)) {
        return res.status(400).json({ message: 'Invalid payroll period dates' });
      }

      if (periodEndSan < periodStartSan) {
        return res.status(400).json({ message: 'payroll_period_end cannot be earlier than payroll_period_start' });
      }

      if (amountNum < 0) {
        return res.status(400).json({ message: 'Amount must be 0 or greater' });
      }

      const result = await execute(
        `INSERT INTO payroll_inputs
          (employee_id, payroll_period_start, payroll_period_end, input_type, description, amount, is_taxable, encoded_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeIdSan,
          periodStartSan,
          periodEndSan,
          inputTypeEnum,
          descriptionSan,
          amountNum,
          isTaxable !== false,
          session.userId,
          notesSan,
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'payroll_inputs',
        recordId: result.insertId.toString(),
        newValues: { employeeId: employeeIdSan, periodStart: periodStartSan, periodEnd: periodEndSan, inputType: inputTypeEnum, description: descriptionSan, amount: amountNum },
      });

      return res.status(201).json({ message: 'Payroll input created', id: result.insertId });
    } catch (error) {
      console.error('Error creating payroll input:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
