import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { assertEnum, isValidISODate, sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const { id } = req.query;
  const idStr = sanitizeText(id);

  // GET single attendance record
  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          al.id,
          al.employee_id as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          al.attendance_date as attendanceDate,
          al.time_in as timeIn,
          al.time_out as timeOut,
          al.status,
          al.is_flagged as isFlagged,
          al.flag_reason as flagReason,
          al.is_validated as isValidated,
          al.validated_by as validatedBy,
          al.validated_at as validatedAt,
          al.notes,
          al.created_at as createdAt
        FROM attendance_logs al
        LEFT JOIN employees e ON al.employee_id = e.id
        WHERE al.id = ?
      `;
      
      const rows = await query(sql, [idStr]);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      return res.status(200).json({ attendance: rows[0] });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUT - Update attendance record
  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'hr_attendance')) {
      return res.status(403).json({
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only HR_STAFF can update attendance.'
      });
    }

    try {
      const { employeeId, attendanceDate, timeIn, timeOut, status, notes } = req.body;

      // Validation
      if (!employeeId || !attendanceDate) {
        return res.status(400).json({ message: 'Employee ID and attendance date are required' });
      }

      if (!isValidISODate(attendanceDate)) {
        return res.status(400).json({ message: 'Invalid attendance date format' });
      }

      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Verify attendance record exists
      const existing = await query(
        'SELECT id FROM attendance_logs WHERE id = ?',
        [idStr]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      // Update attendance
      await execute(
        `UPDATE attendance_logs 
         SET employee_id = ?,
             attendance_date = ?,
             time_in = ?,
             time_out = ?,
             status = ?,
             notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          employeeId,
          attendanceDate,
          timeIn || null,
          timeOut || null,
          status || 'PRESENT',
          sanitizeOptionalText(notes),
          idStr
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'attendance_logs',
        recordId: idStr,
        newValues: { employeeId, attendanceDate, status },
      });

      return res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Attendance record already exists for this employee and date' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // DELETE attendance record
  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'hr_attendance')) {
      return res.status(403).json({
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only HR_STAFF can delete attendance.'
      });
    }

    try {
      // Verify attendance record exists
      const existing = await query(
        'SELECT id FROM attendance_logs WHERE id = ?',
        [idStr]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      await execute('DELETE FROM attendance_logs WHERE id = ?', [idStr]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'attendance_logs',
        recordId: idStr,
        newValues: {},
      });

      return res.status(200).json({ message: 'Attendance deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
