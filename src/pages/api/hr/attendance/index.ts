import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { assertEnum, assertNumber, isValidISODate, sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only HR_STAFF, GENERAL_MANAGER, and SYSTEM_ADMIN can access attendance
  const canAccessAttendance = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  
  if (!canAccessAttendance) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      
      let sql = `
        SELECT 
          a.id,
          a.employee_id as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          a.attendance_date as attendanceDate,
          a.time_in as timeIn,
          a.time_out as timeOut,
          a.status,
          a.hours_worked as hoursWorked,
          a.overtime_hours as overtimeHours,
          a.is_validated as isValidated,
          a.notes,
          CONCAT(v.first_name, ' ', v.last_name) as validatedByName,
          a.validated_at as validatedAt
        FROM attendance_logs a
        LEFT JOIN employees e ON a.employee_id COLLATE utf8mb4_general_ci = e.id COLLATE utf8mb4_general_ci
        LEFT JOIN users v ON a.validated_by COLLATE utf8mb4_general_ci = v.id COLLATE utf8mb4_general_ci
      `;

      const params: any[] = [];

      if (date) {
        sql += ' WHERE a.attendance_date = ?';
        params.push(date);
      }

      sql += ' ORDER BY a.attendance_date DESC, e.employee_number';

      const logs = await query(sql, params);

      return res.status(200).json({ logs });
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission - SYSTEM_ADMIN is read-only
    if (!hasWritePermission(session.role as any, 'hr_attendance')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only HR_STAFF can log attendance.' 
      });
    }

    try {
      const { 
        employeeId, 
        attendanceDate, 
        timeIn, 
        timeOut, 
        status, 
        hoursWorked, 
        overtimeHours, 
        notes 
      } = req.body;

      const employeeIdSan = sanitizeText(employeeId);
      const attendanceDateSan = sanitizeText(attendanceDate);
      const statusEnum =
        assertEnum(status, ['PRESENT', 'LATE', 'ABSENT', 'UNDERTIME', 'HALF_DAY', 'ON_LEAVE'] as const) || 'PRESENT';
      const timeInSan = sanitizeOptionalText(timeIn);
      const timeOutSan = sanitizeOptionalText(timeOut);
      const notesSan = sanitizeOptionalText(notes);

      const hoursWorkedNum = assertNumber(hoursWorked) ?? 0;
      const overtimeHoursNum = assertNumber(overtimeHours) ?? 0;

      if (!employeeIdSan || !attendanceDateSan) {
        return res.status(400).json({ message: 'Employee and date are required' });
      }

      if (!isValidISODate(attendanceDateSan)) {
        return res.status(400).json({ message: 'Invalid attendance date' });
      }

      const isValidTime = (v: string) => /^\d{2}:\d{2}(:\d{2})?$/.test(v);
      if (timeInSan && !isValidTime(timeInSan)) {
        return res.status(400).json({ message: 'Invalid time in format' });
      }
      if (timeOutSan && !isValidTime(timeOutSan)) {
        return res.status(400).json({ message: 'Invalid time out format' });
      }

      if (hoursWorkedNum < 0 || hoursWorkedNum > 24) {
        return res.status(400).json({ message: 'hoursWorked must be between 0 and 24' });
      }

      if (overtimeHoursNum < 0 || overtimeHoursNum > 24) {
        return res.status(400).json({ message: 'overtimeHours must be between 0 and 24' });
      }

      // Check if attendance already exists for this employee on this date
      const existing = await query(
        'SELECT id FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?',
        [employeeIdSan, attendanceDateSan]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Attendance already logged for this employee on this date' });
      }

      const result = await execute(
        `INSERT INTO attendance_logs 
         (employee_id, attendance_date, time_in, time_out, status, hours_worked, overtime_hours, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeIdSan,
          attendanceDateSan,
          timeInSan,
          timeOutSan,
          statusEnum,
          hoursWorkedNum,
          overtimeHoursNum,
          notesSan,
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'attendance_logs',
        recordId: result.insertId.toString(),
        newValues: { employeeId: employeeIdSan, attendanceDate: attendanceDateSan, status: statusEnum },
      });

      return res.status(201).json({
        message: 'Attendance logged successfully',
        id: result.insertId,
      });
    } catch (error: any) {
      console.error('Error logging attendance:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Attendance already exists for this date' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
