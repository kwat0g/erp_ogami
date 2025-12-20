import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import {
  isValidEmail,
  isValidISODate,
  isValidName,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeText,
} from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const { jobPostingId, status } = req.query;
      const where: string[] = [];
      const params: any[] = [];

      if (jobPostingId) {
        where.push('CAST(a.job_posting_id AS CHAR(36)) = ?');
        params.push(jobPostingId);
      }

      if (status) {
        where.push('a.status = ?');
        params.push(status);
      }

      const sql = `
        SELECT
          a.id,
          a.job_posting_id as jobPostingId,
          jp.job_title as jobTitle,
          a.first_name as firstName,
          a.last_name as lastName,
          a.email,
          a.phone,
          a.address,
          a.resume_path as resumePath,
          a.cover_letter as coverLetter,
          a.application_date as applicationDate,
          a.status,
          a.interview_date as interviewDate,
          a.interview_notes as interviewNotes,
          a.rejection_reason as rejectionReason,
          a.created_at as createdAt
        FROM applicants a
        LEFT JOIN job_postings jp ON CAST(a.job_posting_id AS CHAR(36)) = CAST(jp.id AS CHAR(36))
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY a.application_date DESC
      `;

      const applicants = await query(sql, params);
      return res.status(200).json({ applicants });
    } catch (error) {
      console.error('Error fetching applicants:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        jobPostingId,
        firstName,
        lastName,
        email,
        phone,
        address,
        resumePath,
        coverLetter,
        applicationDate,
      } = req.body;

      const firstNameSan = sanitizeName(firstName);
      const lastNameSan = sanitizeName(lastName);
      const emailNorm = normalizeEmail(email);
      const phoneNorm = normalizePhone(phone);
      const jobPostingIdSan = sanitizeText(jobPostingId);

      if (!jobPostingIdSan || !firstNameSan || !lastNameSan || !emailNorm) {
        return res.status(400).json({
          message: 'jobPostingId, firstName, lastName, and email are required',
          fieldErrors: {
            jobPostingId: !jobPostingIdSan ? 'Job is required' : undefined,
            firstName: !firstNameSan ? 'First name is required' : undefined,
            lastName: !lastNameSan ? 'Last name is required' : undefined,
            email: !emailNorm ? 'Email is required' : undefined,
          },
        });
      }

      if (!isValidName(firstNameSan)) return res.status(400).json({ message: 'Invalid first name', fieldErrors: { firstName: 'Invalid first name' } });
      if (!isValidName(lastNameSan)) return res.status(400).json({ message: 'Invalid last name', fieldErrors: { lastName: 'Invalid last name' } });
      if (!isValidEmail(emailNorm)) return res.status(400).json({ message: 'Invalid email address', fieldErrors: { email: 'Invalid email address' } });
      if (phoneNorm && !isValidPhone(phoneNorm)) return res.status(400).json({ message: 'Invalid phone number', fieldErrors: { phone: 'Invalid phone number' } });

      const appDate = applicationDate ? sanitizeText(applicationDate) : new Date().toISOString().split('T')[0];
      if (!isValidISODate(appDate)) return res.status(400).json({ message: 'Invalid application date', fieldErrors: { applicationDate: 'Invalid application date' } });

      const existingEmail = await query('SELECT id FROM applicants WHERE LOWER(email) = LOWER(?) LIMIT 1', [emailNorm]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Applicant email already exists', fieldErrors: { email: 'Email already exists' } });
      }

      const existingEmployeeEmail = await query('SELECT id FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1', [emailNorm]);
      if (existingEmployeeEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists in employees', fieldErrors: { email: 'Email already exists in employees' } });
      }

      if (phoneNorm) {
        const existingPhone = await query('SELECT id FROM applicants WHERE phone = ? LIMIT 1', [phoneNorm]);
        if (existingPhone.length > 0) {
          return res.status(400).json({ message: 'Applicant phone number already exists', fieldErrors: { phone: 'Phone number already exists' } });
        }

        const existingEmployeePhone = await query('SELECT id FROM employees WHERE phone = ? LIMIT 1', [phoneNorm]);
        if (existingEmployeePhone.length > 0) {
          return res.status(400).json({ message: 'Phone number already exists in employees', fieldErrors: { phone: 'Phone number already exists in employees' } });
        }
      }

      const existingName = await query(
        'SELECT id FROM applicants WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) LIMIT 1',
        [firstNameSan, lastNameSan]
      );
      if (existingName.length > 0) {
        return res.status(400).json({
          message: 'An applicant with the same first and last name already exists',
          fieldErrors: { firstName: 'Duplicate full name', lastName: 'Duplicate full name' },
        });
      }

      const result = await execute(
        `INSERT INTO applicants
          (job_posting_id, first_name, last_name, email, phone, address, resume_path, cover_letter, application_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobPostingIdSan,
          firstNameSan,
          lastNameSan,
          emailNorm,
          phoneNorm,
          sanitizeOptionalText(address),
          sanitizeOptionalText(resumePath),
          sanitizeOptionalText(coverLetter),
          appDate,
          session.userId,
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'applicants',
        recordId: result.insertId.toString(),
        newValues: { jobPostingId, firstName, lastName, email },
      });

      return res.status(201).json({ message: 'Applicant created', id: result.insertId });
    } catch (error) {
      console.error('Error creating applicant:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
