// Data export utilities for CSV, Excel, and PDF generation

import { logAudit, AUDIT_ACTIONS } from './audit-log';

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], columns: string[]): string {
  if (data.length === 0) return '';

  // Header row
  const header = columns.join(',');

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col];
      // Escape commas and quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Generate CSV download response
 */
export function sendCSVDownload(res: any, data: any[], columns: string[], filename: string): void {
  const csv = convertToCSV(data, columns);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.status(200).send(csv);
}

/**
 * Convert data to Excel-compatible format (TSV)
 */
export function convertToExcel(data: any[], columns: string[]): string {
  if (data.length === 0) return '';

  // Header row
  const header = columns.join('\t');

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';
      return String(value).replace(/\t/g, ' ');
    }).join('\t');
  });

  return [header, ...rows].join('\n');
}

/**
 * Generate Excel download response
 */
export function sendExcelDownload(res: any, data: any[], columns: string[], filename: string): void {
  const excel = convertToExcel(data, columns);
  
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
  res.status(200).send(excel);
}

/**
 * Generate PDF report (simple text-based)
 */
export function generatePDFReport(data: any[], title: string, columns: string[]): string {
  // Simple HTML that can be converted to PDF
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => `<td>${item[col] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total Records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Send PDF download response
 */
export function sendPDFDownload(res: any, data: any[], title: string, columns: string[], filename: string): void {
  const html = generatePDFReport(data, title, columns);
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
  res.status(200).send(html);
}

/**
 * Log export activity
 */
export async function logExport(
  userId: string,
  module: string,
  exportType: string,
  recordCount: number
): Promise<void> {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.DATA_EXPORT,
    module,
    status: 'SUCCESS',
    newValue: { exportType, recordCount },
  });
}

/**
 * Sanitize data for export (remove sensitive fields)
 */
export function sanitizeForExport(data: any[], sensitiveFields: string[] = []): any[] {
  const defaultSensitive = ['password', 'token', 'secret', 'apiKey'];
  const allSensitive = [...defaultSensitive, ...sensitiveFields];

  return data.map(item => {
    const sanitized = { ...item };
    allSensitive.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });
    return sanitized;
  });
}

/**
 * Format data for export (convert dates, numbers, etc.)
 */
export function formatForExport(data: any[]): any[] {
  return data.map(item => {
    const formatted: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (value instanceof Date) {
        formatted[key] = value.toISOString().split('T')[0];
      } else if (typeof value === 'number') {
        formatted[key] = value.toFixed(2);
      } else if (value === null || value === undefined) {
        formatted[key] = '';
      } else {
        formatted[key] = value;
      }
    }
    
    return formatted;
  });
}

/**
 * Apply filters to data
 */
export function applyFilters(data: any[], filters: Record<string, any>): any[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      
      const itemValue = item[key];
      
      // Handle array filters (e.g., status in ['PENDING', 'APPROVED'])
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      // Handle range filters (e.g., { min: 100, max: 500 })
      if (typeof value === 'object' && ('min' in value || 'max' in value)) {
        if ('min' in value && itemValue < value.min) return false;
        if ('max' in value && itemValue > value.max) return false;
        return true;
      }
      
      // Handle string matching (case-insensitive)
      if (typeof itemValue === 'string' && typeof value === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      
      // Exact match
      return itemValue === value;
    });
  });
}

/**
 * Apply sorting to data
 */
export function applySort(data: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): any[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export default {
  convertToCSV,
  sendCSVDownload,
  convertToExcel,
  sendExcelDownload,
  generatePDFReport,
  sendPDFDownload,
  logExport,
  sanitizeForExport,
  formatForExport,
  applyFilters,
  applySort,
};
