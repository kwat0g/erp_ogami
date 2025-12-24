import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notification-helper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const canSubmit = ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canSubmit) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;

    const [doc]: any = await query(
      `SELECT id, status FROM impex_documents WHERE id = ?`,
      [id]
    );

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT documents can be submitted' });
    }

    await execute(
      `UPDATE impex_documents 
       SET status = 'SUBMITTED',
           submitted_by = ?,
           submitted_at = NOW()
       WHERE id = ?`,
      [session.userId, id]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'impex_documents',
      recordId: id as string,
      newValues: { status: 'SUBMITTED' },
    });

    // Get document details and notify approvers
    const [docDetails] = await query(
      `SELECT document_number, document_type, description
       FROM impex_documents WHERE id = ?`,
      [id]
    );

    const approvers = await query(
      `SELECT id FROM users 
       WHERE role IN ('GENERAL_MANAGER', 'DEPARTMENT_HEAD') 
       AND is_active = 1`
    );

    for (const approver of approvers as any[]) {
      await createNotification({
        userId: approver.id,
        title: 'Import/Export Document Approval',
        message: `${docDetails.document_type} Document ${docDetails.document_number} requires your approval`,
        type: 'ACTION_REQUIRED',
        category: 'IMPEX',
        referenceType: 'IMPEX_DOCUMENT',
        referenceId: id as string,
      });
    }

    return res.status(200).json({ message: 'Document submitted successfully' });
  } catch (error) {
    console.error('Error submitting document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
