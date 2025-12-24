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

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'production_planning')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to run MRP.' 
      });
    }

    try {
      const { planningHorizonDays, startDate } = req.body;

      const horizon = planningHorizonDays || 90;
      const runStartDate = startDate || new Date().toISOString().split('T')[0];

      // Generate MRP run number
      const year = new Date().getFullYear();
      const [lastRun]: any = await query(
        `SELECT run_number FROM mrp_runs 
         WHERE YEAR(run_date) = ? 
         ORDER BY run_number DESC LIMIT 1`,
        [year]
      );

      let runNumber;
      if (lastRun) {
        const lastNum = parseInt(lastRun.run_number.split('-')[1]);
        runNumber = `MRP${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        runNumber = `MRP${year}-00001`;
      }

      const runId = require('crypto').randomUUID();

      // Create MRP run header
      await execute(
        `INSERT INTO mrp_runs (
          id, run_number, run_date, planning_horizon_days, status, run_by
        ) VALUES (?, ?, NOW(), ?, 'RUNNING', ?)`,
        [runId, runNumber, horizon, session.userId]
      );

      // Calculate end date
      const endDate = new Date(runStartDate);
      endDate.setDate(endDate.getDate() + horizon);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get all production schedules in planning horizon
      const schedules: any = await query(
        `SELECT 
          ps.id, ps.item_id, ps.scheduled_date, ps.planned_quantity
        FROM production_schedules ps
        WHERE ps.scheduled_date >= ? AND ps.scheduled_date <= ?
          AND ps.status IN ('PLANNED', 'CONFIRMED')
        ORDER BY ps.scheduled_date`,
        [runStartDate, endDateStr]
      );

      let totalItemsProcessed = 0;
      let totalRequirementsGenerated = 0;

      // Process each production schedule
      for (const schedule of schedules) {
        // Get active BOM for the item
        const [bom]: any = await query(
          `SELECT id, base_quantity FROM bom_headers 
           WHERE item_id = ? AND status = 'ACTIVE'
           LIMIT 1`,
          [schedule.item_id]
        );

        if (!bom) {
          console.log(`No active BOM found for item ${schedule.item_id}`);
          continue;
        }

        // Get BOM lines (components)
        const components: any = await query(
          `SELECT component_item_id, quantity, scrap_percentage
           FROM bom_lines
           WHERE bom_id = ?`,
          [bom.id]
        );

        totalItemsProcessed++;

        // Calculate requirements for each component
        for (const component of components) {
          // Calculate gross requirement with scrap
          const scrapFactor = 1 + (component.scrap_percentage / 100);
          const quantityPerUnit = component.quantity / bom.base_quantity;
          const grossRequirement = schedule.planned_quantity * quantityPerUnit * scrapFactor;

          // Get current inventory
          const [inventory]: any = await query(
            `SELECT COALESCE(SUM(quantity), 0) as totalStock,
                    COALESCE(SUM(reserved_quantity), 0) as totalReserved
             FROM inventory_stock
             WHERE item_id = ?`,
            [component.component_item_id]
          );

          const availableStock = (inventory?.totalStock || 0) - (inventory?.totalReserved || 0);

          // Get scheduled receipts (open POs)
          const [scheduledReceipts]: any = await query(
            `SELECT COALESCE(SUM(poi.quantity - COALESCE(poi.received_quantity, 0)), 0) as pendingQty
             FROM purchase_order_items poi
             JOIN purchase_orders po ON poi.po_id = po.id
             WHERE poi.item_id = ? 
               AND po.status IN ('PENDING', 'APPROVED')
               AND po.expected_delivery_date <= ?`,
            [component.component_item_id, schedule.scheduled_date]
          );

          const scheduledReceiptsQty = scheduledReceipts?.pendingQty || 0;

          // Calculate projected on hand
          const projectedOnHand = availableStock + scheduledReceiptsQty;

          // Calculate net requirement
          const netRequirement = Math.max(0, grossRequirement - projectedOnHand);

          // Determine action required
          let actionRequired = 'NONE';
          let plannedOrderQty = 0;
          let plannedReleaseDate = null;

          if (netRequirement > 0) {
            actionRequired = 'CREATE_PR';
            plannedOrderQty = netRequirement;
            
            // Calculate order release date (schedule date minus lead time)
            // For now, use 7 days lead time (should come from item master)
            const releaseDate = new Date(schedule.scheduled_date);
            releaseDate.setDate(releaseDate.getDate() - 7);
            plannedReleaseDate = releaseDate.toISOString().split('T')[0];
          }

          // Insert MRP requirement
          await execute(
            `INSERT INTO mrp_requirements (
              mrp_run_id, item_id, requirement_date,
              gross_requirement, scheduled_receipts, projected_on_hand,
              net_requirement, planned_order_quantity, planned_order_release_date,
              source_type, source_id, action_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PRODUCTION_SCHEDULE', ?, ?)`,
            [
              runId, component.component_item_id, schedule.scheduled_date,
              grossRequirement, scheduledReceiptsQty, projectedOnHand,
              netRequirement, plannedOrderQty, plannedReleaseDate,
              schedule.id, actionRequired
            ]
          );

          totalRequirementsGenerated++;
        }
      }

      // Update MRP run status
      await execute(
        `UPDATE mrp_runs 
         SET status = 'COMPLETED', 
             completed_at = NOW(),
             total_items_processed = ?,
             total_requirements_generated = ?
         WHERE id = ?`,
        [totalItemsProcessed, totalRequirementsGenerated, runId]
      );

      return res.status(200).json({
        message: 'MRP calculation completed successfully',
        runId,
        runNumber,
        totalItemsProcessed,
        totalRequirementsGenerated,
      });
    } catch (error) {
      console.error('Error running MRP:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
