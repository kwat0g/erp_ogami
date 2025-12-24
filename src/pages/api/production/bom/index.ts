import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { hasWritePermission } from '@/lib/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    try {
      const { itemId, status } = req.query;

      let sql = `
        SELECT 
          bh.id, bh.bom_number as bomNumber, bh.item_id as itemId,
          i.code as itemCode, i.name as itemName,
          bh.version, bh.effective_date as effectiveDate,
          bh.expiry_date as expiryDate, bh.status,
          bh.base_quantity as baseQuantity,
          u.name as uomName, bh.notes,
          bh.created_at as createdAt,
          CONCAT(usr.first_name, ' ', usr.last_name) as createdByName
        FROM bill_of_materials bh
        JOIN items i ON bh.item_id COLLATE utf8mb4_unicode_ci = i.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN units_of_measure u ON bh.uom_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN users usr ON bh.created_by COLLATE utf8mb4_unicode_ci = usr.id COLLATE utf8mb4_unicode_ci
        WHERE 1=1
      `;

      const params: any[] = [];

      if (itemId) {
        sql += ' AND bh.item_id = ?';
        params.push(itemId);
      }

      if (status) {
        sql += ' AND bh.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY bh.created_at DESC';

      const boms = await query(sql, params);

      // Get BOM items for each BOM
      for (const bom of boms as any[]) {
        const items = await query(
          `SELECT 
            bi.id, bi.sequence_number as sequenceNumber,
            bi.component_item_id as componentItemId,
            ci.code as componentCode, ci.name as componentName,
            ci.uom_id as componentUomId,
            u.name as uomName,
            bi.quantity,
            bi.scrap_percentage as scrapPercentage,
            bi.notes
          FROM bom_items bi
          JOIN items ci ON bi.component_item_id COLLATE utf8mb4_unicode_ci = ci.id COLLATE utf8mb4_unicode_ci
          LEFT JOIN units_of_measure u ON ci.uom_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
          WHERE bi.bom_id = ?
          ORDER BY bi.sequence_number`,
          [bom.id]
        );
        bom.items = items;
      }

      return res.status(200).json({ boms });
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const canWrite = hasWritePermission(session.role, 'production_bom');
    if (!canWrite) {
      return res.status(403).json({ message: 'Access denied: Only PRODUCTION_PLANNER, PRODUCTION_SUPERVISOR, DEPARTMENT_HEAD, and GENERAL_MANAGER can create BOMs' });
    }

    try {
      const {
        itemId,
        version,
        description,
        baseQuantity,
        uomId,
        effectiveDate,
        expiryDate,
        notes,
        components, // Array of { componentItemId, quantity, uomId, scrapPercentage, sequenceNumber, notes }
      } = req.body;

      if (!itemId || !version || !components || components.length === 0) {
        return res.status(400).json({
          message: 'Item ID, version, and at least one component are required',
        });
      }

      // Generate BOM number
      const year = new Date().getFullYear();
      const [lastBom]: any = await query(
        `SELECT bom_number FROM bill_of_materials WHERE YEAR(created_at) = ? ORDER BY bom_number DESC LIMIT 1`,
        [year]
      );

      let bomNumber;
      if (lastBom) {
        const lastNum = parseInt(lastBom.bom_number.split('-')[1]);
        bomNumber = `BOM${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        bomNumber = `BOM${year}-00001`;
      }

      // Insert BOM header
      const bomResult: any = await execute(
        `INSERT INTO bill_of_materials (
          bom_number, item_id, version, description, base_quantity, uom_id,
          effective_date, expiry_date, notes, created_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
        [
          bomNumber,
          itemId,
          version,
          description || null,
          baseQuantity || 1,
          uomId || null,
          effectiveDate || null,
          expiryDate || null,
          notes || null,
          session.userId,
        ]
      );

      // Get the generated UUID (insertId doesn't work with uuid())
      const [newBom]: any = await query(
        `SELECT id FROM bill_of_materials WHERE bom_number = ?`,
        [bomNumber]
      );
      const bomId = newBom.id;

      // Insert BOM components
      for (const component of components) {
        await execute(
          `INSERT INTO bom_items (
            bom_id, component_item_id, quantity,
            scrap_percentage, sequence_number, notes
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            bomId,
            component.componentItemId,
            component.quantity,
            component.scrapPercentage || 0,
            component.sequenceNumber || 0,
            component.notes || null,
          ]
        );
      }

      return res.status(201).json({
        message: 'BOM created successfully',
        bomId,
        bomNumber,
      });
    } catch (error) {
      console.error('Error creating BOM:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
