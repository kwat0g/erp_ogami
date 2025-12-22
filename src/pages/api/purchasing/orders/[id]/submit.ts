import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

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

  if (req.method === 'POST') {
    // Only PURCHASING_STAFF, DEPARTMENT_HEAD, or GENERAL_MANAGER can submit
    const canSubmit = ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(session.role);
    
    if (!canSubmit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      // Check if PO exists and is in DRAFT status
      const [po]: any = await query(
        'SELECT id, po_number, status, created_by FROM purchase_orders WHERE id = ?',
        [id]
      );

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (po.status !== 'DRAFT') {
        return res.status(400).json({ 
          message: `Cannot submit PO with status ${po.status}. Only DRAFT POs can be submitted.` 
        });
      }

      // Update status to PENDING
      await execute(
        'UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?',
        ['PENDING', id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'purchase_orders',
        recordId: id as string,
        oldValues: { status: 'DRAFT' },
        newValues: { status: 'PENDING' },
      });

      return res.status(200).json({ message: 'Purchase order submitted for approval' });
    } catch (error) {
      console.error('Error submitting purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
