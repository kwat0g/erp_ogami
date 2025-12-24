import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { sanitizeText, sanitizeOptionalText, isValidISODate } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['SYSTEM_ADMIN', 'IMPEX_OFFICER', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;
  const idStr = sanitizeText(id);

  if (req.method === 'GET') {
    try {
      const rows = await query(
        `SELECT 
          id, document_number as documentNumber, document_type as documentType,
          direction, reference_number as referenceNumber,
          shipper, consignee, origin_country as originCountry,
          destination_country as destinationCountry, port_of_loading as portOfLoading,
          port_of_discharge as portOfDischarge, estimated_arrival as estimatedArrival,
          actual_arrival as actualArrival, status, notes,
          created_at as createdAt, updated_at as updatedAt,
          submitted_by as submittedBy, submitted_at as submittedAt,
          approved_by as approvedBy, approved_at as approvedAt,
          completed_by as completedBy, completed_at as completedAt,
          completion_notes as completionNotes
        FROM impex_documents WHERE id = ?`,
        [idStr]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      return res.status(200).json({ document: rows[0] });
    } catch (error) {
      console.error('Error fetching document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const canWrite = ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(session.role);
    if (!canWrite) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const {
        documentNumber,
        documentType,
        direction,
        referenceNumber,
        shipper,
        consignee,
        originCountry,
        destinationCountry,
        portOfLoading,
        portOfDischarge,
        estimatedArrival,
        actualArrival,
        notes
      } = req.body;

      if (!documentNumber || !documentType || !direction) {
        return res.status(400).json({ message: 'Document number, type, and direction are required' });
      }

      const validTypes = ['BILL_OF_LADING', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CERTIFICATE_OF_ORIGIN', 'CUSTOMS_DECLARATION'];
      if (!validTypes.includes(documentType)) {
        return res.status(400).json({ message: 'Invalid document type' });
      }

      const validDirections = ['IMPORT', 'EXPORT'];
      if (!validDirections.includes(direction)) {
        return res.status(400).json({ message: 'Invalid direction' });
      }

      // Check if document is still editable
      const [existing]: any = await query(
        'SELECT status FROM impex_documents WHERE id = ?',
        [idStr]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only DRAFT documents can be edited' });
      }

      await execute(
        `UPDATE impex_documents 
         SET document_number = ?, document_type = ?, direction = ?,
             reference_number = ?, shipper = ?, consignee = ?,
             origin_country = ?, destination_country = ?,
             port_of_loading = ?, port_of_discharge = ?,
             estimated_arrival = ?, actual_arrival = ?, notes = ?
         WHERE id = ?`,
        [
          documentNumber,
          documentType,
          direction,
          sanitizeOptionalText(referenceNumber),
          sanitizeOptionalText(shipper),
          sanitizeOptionalText(consignee),
          sanitizeOptionalText(originCountry),
          sanitizeOptionalText(destinationCountry),
          sanitizeOptionalText(portOfLoading),
          sanitizeOptionalText(portOfDischarge),
          estimatedArrival || null,
          actualArrival || null,
          sanitizeOptionalText(notes),
          idStr
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'impex_documents',
        recordId: idStr,
        newValues: { documentNumber, documentType, direction },
      });

      return res.status(200).json({ message: 'Document updated successfully' });
    } catch (error: any) {
      console.error('Error updating document:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Document number already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    const canWrite = ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(session.role);
    if (!canWrite) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      // Check if document can be deleted
      const [existing]: any = await query(
        'SELECT status FROM impex_documents WHERE id = ?',
        [idStr]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only DRAFT documents can be deleted' });
      }

      await execute('DELETE FROM impex_documents WHERE id = ?', [idStr]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'impex_documents',
        recordId: idStr,
        newValues: {},
      });

      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
