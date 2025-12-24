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

  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT
          jp.id,
          jp.job_title as jobTitle,
          jp.department_id as departmentId,
          d.name as departmentName,
          jp.position_level as positionLevel,
          jp.employment_type as employmentType,
          jp.job_description as jobDescription,
          jp.requirements,
          jp.salary_range as salaryRange,
          jp.posted_date as postedDate,
          jp.closing_date as closingDate,
          jp.status,
          jp.created_by as createdBy,
          jp.created_at as createdAt
        FROM job_postings jp
        LEFT JOIN departments d ON CAST(jp.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        ORDER BY jp.posted_date DESC
      `;

      const postings = await query(sql);
      return res.status(200).json({ postings });
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission - SYSTEM_ADMIN is read-only
    if (!hasWritePermission(session.role as any, 'hr_recruitment')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Only HR_STAFF can create job postings.' 
      });
    }

    try {
      const {
        jobTitle,
        departmentId,
        positionLevel,
        employmentType,
        jobDescription,
        requirements,
        salaryRange,
        postedDate,
        closingDate,
        status,
      } = req.body;

      const jobTitleSan = sanitizeText(jobTitle);
      const departmentIdSan = sanitizeText(departmentId);
      const positionLevelSan = sanitizeOptionalText(positionLevel);
      const jobDescriptionSan = sanitizeText(jobDescription);
      const requirementsSan = sanitizeOptionalText(requirements);
      const salaryRangeSan = sanitizeOptionalText(salaryRange);

      const employmentTypeEnum =
        assertEnum(employmentType, ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const) || 'FULL_TIME';
      const statusEnum = assertEnum(status, ['DRAFT', 'OPEN', 'CLOSED', 'FILLED'] as const) || 'OPEN';

      const sanitizedPostedDate = postedDate ? sanitizeText(postedDate) : null;
      const postedDateVal = (sanitizedPostedDate || new Date().toISOString().split('T')[0]) as string;
      const closingDateVal = sanitizeOptionalText(closingDate);

      if (!jobTitleSan || !departmentIdSan || !jobDescriptionSan) {
        return res.status(400).json({ message: 'jobTitle, departmentId, and jobDescription are required' });
      }

      if (!isValidISODate(postedDateVal)) {
        return res.status(400).json({ message: 'Invalid postedDate' });
      }

      if (closingDateVal && !isValidISODate(closingDateVal)) {
        return res.status(400).json({ message: 'Invalid closingDate' });
      }

      if (closingDateVal && closingDateVal < postedDateVal) {
        return res.status(400).json({ message: 'closingDate cannot be earlier than postedDate' });
      }

      const result = await execute(
        `INSERT INTO job_postings
          (job_title, department_id, position_level, employment_type, job_description, requirements, salary_range, posted_date, closing_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobTitleSan,
          departmentIdSan,
          positionLevelSan,
          employmentTypeEnum,
          jobDescriptionSan,
          requirementsSan,
          salaryRangeSan,
          postedDateVal,
          closingDateVal,
          statusEnum,
          session.userId,
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'job_postings',
        recordId: result.insertId.toString(),
        newValues: { jobTitle: jobTitleSan, departmentId: departmentIdSan, status: statusEnum },
      });

      return res.status(201).json({ message: 'Job posting created', id: result.insertId });
    } catch (error) {
      console.error('Error creating job posting:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
