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
      const { mrpRunId, actionRequired } = req.query;

      let sql = `
        SELECT 
          mr.id, mr.mrp_run_id as mrpRunId,
          mr.item_id as itemId, i.code as itemCode, i.name as itemName,
          mr.requirement_date as requirementDate,
          mr.gross_requirement as grossRequirement,
          mr.scheduled_receipts as scheduledReceipts,
          mr.projected_on_hand as projectedOnHand,
          mr.net_requirement as netRequirement,
          mr.planned_order_quantity as plannedOrderQuantity,
          mr.planned_order_release_date as plannedOrderReleaseDate,
          mr.source_type as sourceType, mr.source_id as sourceId,
          mr.action_required as actionRequired,
          mr.pr_generated as prGenerated, mr.pr_id as prId,
          u.name as uomName
        FROM mrp_requirements mr
        JOIN items i ON mr.item_id = i.id
        LEFT JOIN units_of_measure u ON i.uom_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (mrpRunId) {
        sql += ' AND mr.mrp_run_id = ?';
        params.push(mrpRunId);
      }

      if (actionRequired) {
        sql += ' AND mr.action_required = ?';
        params.push(actionRequired);
      }

      sql += ' ORDER BY mr.requirement_date, i.code';

      const requirements = await query(sql, params);

      return res.status(200).json({ requirements });
    } catch (error) {
      console.error('Error fetching MRP requirements:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'production_planning')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to generate PRs from MRP.' 
      });
    }

    try {
      const { requirementIds } = req.body;

      if (!requirementIds || requirementIds.length === 0) {
        return res.status(400).json({ message: 'No requirements selected' });
      }

      const generatedPRs = [];

      // Group requirements by item
      const requirements: any = await query(
        `SELECT * FROM mrp_requirements WHERE id IN (${requirementIds.map(() => '?').join(',')})`,
        requirementIds
      );

      // Generate PR for each requirement
      for (const req of requirements) {
        if (req.pr_generated) {
          continue; // Skip if PR already generated
        }

        // Generate PR number
        const year = new Date().getFullYear();
        const [lastPR]: any = await query(
          `SELECT pr_number FROM purchase_requisitions 
           WHERE YEAR(pr_date) = ? 
           ORDER BY pr_number DESC LIMIT 1`,
          [year]
        );

        let prNumber;
        if (lastPR) {
          const lastNum = parseInt(lastPR.pr_number.split('-')[1]);
          prNumber = `PR${year}-${String(lastNum + 1).padStart(5, '0')}`;
        } else {
          prNumber = `PR${year}-00001`;
        }

        const prId = require('crypto').randomUUID();

        // Create PR
        await execute(
          `INSERT INTO purchase_requisitions (
            id, pr_number, pr_date, requested_by, department,
            required_date, status, notes, source_type, source_reference
          ) VALUES (?, ?, NOW(), ?, 'PRODUCTION', ?, 'PENDING', ?, 'MRP', ?)`,
          [
            prId, prNumber, session.userId, req.planned_order_release_date,
            `Generated from MRP for production requirement`, req.mrp_run_id
          ]
        );

        // Create PR item
        await execute(
          `INSERT INTO purchase_requisition_items (
            pr_id, item_id, quantity, estimated_unit_price,
            estimated_total_price, required_date, purpose
          ) VALUES (?, ?, ?, 0, 0, ?, ?)`,
          [
            prId, req.item_id, req.planned_order_quantity,
            req.planned_order_release_date,
            'MRP generated requirement'
          ]
        );

        // Update MRP requirement
        await execute(
          `UPDATE mrp_requirements SET pr_generated = TRUE, pr_id = ? WHERE id = ?`,
          [prId, req.id]
        );

        generatedPRs.push({ prId, prNumber });
      }

      return res.status(200).json({
        message: `${generatedPRs.length} Purchase Requisitions generated successfully`,
        prs: generatedPRs,
      });
    } catch (error) {
      console.error('Error generating PRs from MRP:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
