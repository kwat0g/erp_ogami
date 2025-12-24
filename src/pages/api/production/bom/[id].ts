import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { hasWritePermission } from '@/lib/permissions';

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

  if (req.method === 'GET') {
    try {
      const [bom]: any = await query(
        `SELECT 
          bh.id, bh.bom_number as bomNumber, bh.item_id as itemId,
          i.code as itemCode, i.name as itemName,
          bh.version, bh.effective_date as effectiveDate,
          bh.expiry_date as expiryDate, bh.status,
          bh.base_quantity as baseQuantity,
          u.name as uomName, bh.notes,
          bh.created_at as createdAt,
          CONCAT(usr.first_name, ' ', usr.last_name) as createdByName
        FROM bill_of_materials bh
        JOIN items i ON bh.item_id = i.id
        LEFT JOIN units_of_measure u ON bh.uom_id = u.id
        LEFT JOIN users usr ON bh.created_by = usr.id
        WHERE bh.id = ?`,
        [id]
      );

      if (!bom) {
        return res.status(404).json({ message: 'BOM not found' });
      }

      // Get BOM lines
      const lines = await query(
        `SELECT 
          bl.id, bl.line_number as lineNumber,
          bl.component_item_id as componentItemId,
          ci.code as componentCode, ci.name as componentName,
          bl.quantity, u.name as uomName,
          bl.scrap_percentage as scrapPercentage,
          bl.operation_sequence as operationSequence,
          bl.notes
        FROM bom_lines bl
        JOIN items ci ON bl.component_item_id = ci.id
        LEFT JOIN units_of_measure u ON bl.uom_id = u.id
        WHERE bl.bom_id = ?
        ORDER BY bl.line_number`,
        [id]
      );

      bom.lines = lines;

      return res.status(200).json({ bom });
    } catch (error) {
      console.error('Error fetching BOM:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'production_bom')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to update BOMs.' 
      });
    }

    try {
      const { action, effectiveDate, expiryDate, baseQuantity, notes, components } = req.body;

      const [bom]: any = await query('SELECT * FROM bill_of_materials WHERE id = ?', [id]);

      if (!bom) {
        return res.status(404).json({ message: 'BOM not found' });
      }

      if (action === 'ACTIVATE') {
        if (bom.status !== 'DRAFT') {
          return res.status(400).json({ message: 'Only draft BOMs can be activated' });
        }

        // Check if another active BOM exists for this item
        const [existingActive]: any = await query(
          `SELECT id FROM bill_of_materials WHERE item_id = ? AND status = 'ACTIVE' AND id != ?`,
          [bom.item_id, id]
        );

        if (existingActive) {
          return res.status(400).json({ 
            message: 'Another active BOM exists for this item. Please set it to obsolete first.' 
          });
        }

        await execute(
          `UPDATE bill_of_materials SET status = 'ACTIVE' WHERE id = ?`,
          [id]
        );

        return res.status(200).json({ message: 'BOM activated successfully' });

      } else if (action === 'OBSOLETE') {
        await execute(
          `UPDATE bill_of_materials SET status = 'OBSOLETE' WHERE id = ?`,
          [id]
        );

        return res.status(200).json({ message: 'BOM set to obsolete' });

      } else {
        // Update BOM details
        if (bom.status === 'ACTIVE') {
          return res.status(400).json({ 
            message: 'Cannot edit active BOM. Please create a new version or set to obsolete first.' 
          });
        }

        await execute(
          `UPDATE bill_of_materials 
           SET effective_date = ?, expiry_date = ?, base_quantity = ?, notes = ?
           WHERE id = ?`,
          [effectiveDate, expiryDate || null, baseQuantity || 1, notes || null, id]
        );

        // Update components if provided
        if (components && components.length > 0) {
          // Delete existing components
          await execute('DELETE FROM bom_items WHERE bom_id = ?', [id]);

          // Insert new components
          for (let i = 0; i < components.length; i++) {
            const component = components[i];
            await execute(
              `INSERT INTO bom_items (
                bom_id, component_item_id, quantity,
                scrap_percentage, sequence_number, notes
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                id,
                component.componentItemId,
                component.quantity,
                component.scrapPercentage || 0,
                component.sequenceNumber || i + 1,
                component.notes || null
              ]
            );
          }
        }

        return res.status(200).json({ message: 'BOM updated successfully' });
      }
    } catch (error) {
      console.error('Error updating BOM:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'production_bom')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to delete BOMs.' 
      });
    }

    try {
      const [bom]: any = await query('SELECT status FROM bill_of_materials WHERE id = ?', [id]);

      if (!bom) {
        return res.status(404).json({ message: 'BOM not found' });
      }

      if (bom.status === 'ACTIVE') {
        return res.status(400).json({ message: 'Cannot delete active BOM. Set to obsolete first.' });
      }

      await execute('DELETE FROM bill_of_materials WHERE id = ?', [id]);

      return res.status(200).json({ message: 'BOM deleted successfully' });
    } catch (error) {
      console.error('Error deleting BOM:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
