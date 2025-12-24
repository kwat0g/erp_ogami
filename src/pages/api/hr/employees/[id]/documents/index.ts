import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id: employeeId } = req.query;

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT
          id,
          employee_id as employeeId,
          document_type as documentType,
          document_name as documentName,
          file_path as filePath,
          upload_date as uploadDate,
          uploaded_by as uploadedBy,
          notes,
          created_at as createdAt
        FROM employee_documents
        WHERE CAST(employee_id AS CHAR(36)) = ?
        ORDER BY upload_date DESC, created_at DESC
      `;

      const documents = await query(sql, [employeeId]);
      return res.status(200).json({ documents });
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'employee-documents');
      
      // Create upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;
      const notes = Array.isArray(fields.notes) ? fields.notes[0] : fields.notes;

      if (!documentType) {
        // Clean up uploaded file
        fs.unlinkSync(file.filepath);
        return res.status(400).json({ message: 'documentType is required' });
      }

      const validTypes = ['CONTRACT', 'ID', 'CERTIFICATE', 'EVALUATION', 'OTHER'];
      if (!validTypes.includes(documentType)) {
        fs.unlinkSync(file.filepath);
        return res.status(400).json({ message: 'Invalid document type' });
      }

      // Generate unique filename
      const ext = path.extname(file.originalFilename || '');
      const filename = `${employeeId}_${Date.now()}${ext}`;
      const newPath = path.join(uploadDir, filename);
      
      // Rename file
      fs.renameSync(file.filepath, newPath);

      const filePath = `/uploads/employee-documents/${filename}`;

      const result = await execute(
        `INSERT INTO employee_documents
          (employee_id, document_type, document_name, file_path, upload_date, uploaded_by, notes)
         VALUES (?, ?, ?, ?, CURDATE(), ?, ?)`,
        [employeeId, documentType, file.originalFilename || filename, filePath, session.userId, notes || null]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'employee_documents',
        recordId: result.insertId.toString(),
        newValues: { employeeId, documentType, documentName: file.originalFilename },
      });

      return res.status(201).json({ message: 'Document uploaded successfully', id: result.insertId });
    } catch (error) {
      console.error('Error uploading document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
