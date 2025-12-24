import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, requirePermission, BadRequestError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { query } from '@/lib/db';
import { sendCSVDownload, sendExcelDownload, sendPDFDownload, logExport, sanitizeForExport, formatForExport } from '@/lib/export-utils';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Authentication
  const session = await requireAuth(req);
  
  // Authorization
  requirePermission(session.role, ['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'ACCOUNTING_STAFF', 'GENERAL_MANAGER'], 'export data');

  const { format = 'csv', filters = {} } = req.query;

  // Fetch items data
  let sql = `
    SELECT 
      i.id, i.code, i.name, i.description,
      i.standard_cost as standardCost, i.selling_price as sellingPrice,
      i.is_active as isActive, i.created_at as createdAt,
      u.name as uomName,
      COALESCE(SUM(s.quantity), 0) as totalStock,
      COALESCE(SUM(s.available_quantity), 0) as availableStock
    FROM items i
    LEFT JOIN units_of_measure u ON i.uom_id = u.id
    LEFT JOIN inventory_stock s ON i.id = s.item_id
    WHERE 1=1
  `;

  const params: any[] = [];

  // Apply filters
  if ((filters as any).isActive !== undefined) {
    sql += ' AND i.is_active = ?';
    params.push((filters as any).isActive === 'true' ? 1 : 0);
  }

  sql += ' GROUP BY i.id ORDER BY i.code';

  const items: any = await query(sql, params);

  // Sanitize and format data
  const sanitized = sanitizeForExport(items);
  const formatted = formatForExport(sanitized);

  // Define columns for export
  const columns = ['code', 'name', 'description', 'standardCost', 'sellingPrice', 'uomName', 'totalStock', 'availableStock', 'isActive'];

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `items_export_${timestamp}`;

  // Log export activity
  await logExport(session.userId, 'INVENTORY', format as string, formatted.length);

  // Send appropriate format
  switch (format) {
    case 'csv':
      sendCSVDownload(res, formatted, columns, filename);
      break;
    case 'excel':
      sendExcelDownload(res, formatted, columns, filename);
      break;
    case 'pdf':
      sendPDFDownload(res, formatted, 'Inventory Items Report', columns, filename);
      break;
    default:
      throw new BadRequestError('Invalid export format. Use csv, excel, or pdf');
  }
});
