import { Router } from "express";
import { isLogged } from "../middleware/jwt";
import { AuditLog } from "../models/AuditLog";
import { Application } from "../models/Application";
import {
  Actor, csvColumns, csvRow, filteredPipeline, listReport, parseFilters,
  reportActor, reportDetail, reportRoles,
} from "../services/reports";

const router = Router();
router.use(isLogged);
router.use((req, res, next) => {
  try {
    res.locals.reportActor = reportActor(req.user);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie, Origin");
    next();
  } catch (error) { next(error); }
});

const audit = (actor: Actor, event: string, metadata: object) => AuditLog.create({
  actorId: actor.id, actorRole: actor.role, event, metadata,
});

router.get("/roles", async (_req, res, next) => {
  try {
    const actor = res.locals.reportActor as Actor;
    const data = await reportRoles(actor);
    await audit(actor, "report_roles_viewed", { count: data.length });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get("/export", async (req, res, next) => {
  let cursor: any;
  let completed = false;
  let count = 0;
  try {
    const actor = res.locals.reportActor as Actor;
    const filters = parseFilters(req.query);
    const log = await audit(actor, "report_export_started", { filters });
    cursor = Application.aggregate([
      ...filteredPipeline(actor, filters), { $sort: { appliedAt: -1, key: 1 } },
    ]).allowDiskUse(true).cursor({ batchSize: 250 });
    // Initialise the query before starting a download, so a DB error can
    // still be returned as a normal error response.
    let row = await cursor.next();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="volunteer-applications.csv"');
    const write = async (chunk: string) => {
      if (res.destroyed) throw new Error("Download disconnected.");
      if (!res.write(chunk)) {
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => { res.off("drain", drained); res.off("close", closed); res.off("error", failed); };
          const drained = () => { cleanup(); resolve(); };
          const closed = () => { cleanup(); reject(new Error("Download disconnected.")); };
          const failed = (error: Error) => { cleanup(); reject(error); };
          res.once("drain", drained); res.once("close", closed); res.once("error", failed);
        });
      }
    }
    await write("\uFEFF" + csvColumns.join(",") + "\r\n");
    while (row) {
      await write(csvRow(row)); count += 1;
      row = await cursor.next();
    }
    await AuditLog.updateOne({ _id: log._id }, { $set: {
      event: "report_export_generated", metadata: { filters, count },
    } });
    completed = true;
    res.end();
  } catch (error) {
    if (!res.headersSent) next(error);
    else res.destroy(error instanceof Error ? error : undefined);
  } finally {
    if (cursor) await cursor.close().catch(() => undefined);
    // A started event without generated indicates an interrupted export.
    if (!completed) console.error("Application report export did not complete.");
  }
});

router.get("/applications/:id", async (req, res, next) => {
  try {
    const actor = res.locals.reportActor as Actor;
    const data = await reportDetail(actor, req.params.id);
    await audit(actor, "report_application_viewed", { key: data.key });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const actor = res.locals.reportActor as Actor;
    const filters = parseFilters(req.query);
    const data = await listReport(actor, filters);
    await audit(actor, "report_viewed", { filters, count: data.rows.length });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});
export default router;