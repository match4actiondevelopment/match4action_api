import mongoose from "mongoose";
import { Application } from "../models/Application";
import { Initiative } from "../models/Initiatives";
import { User } from "../models/User";
import { createError } from "../utils/createError";

export const statuses = ["applied", "viewed", "shortlisted", "accepted", "declined", "withdrawn", "closed"];
export const sources = ["recommendations", "initiatives", "role_details", "unknown"];
export type Actor = { id: string; role: "organization" | "admin" };
export type Filters = {
  range: string; from?: string; to?: string; role?: string; status?: string;
  location?: string; source?: string; page: number; pageSize: number;
  start?: Date; end?: Date;
};
const objectId = (value: string) => new mongoose.Types.ObjectId(value);
const validId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export function reportActor(user: any): Actor {
  if (!user?._id) throw createError(401, "Authentication required.");
  if (user.roleSelectionPending === true) throw createError(403, "Complete account role selection first.");
  if (user.role !== "organization" && user.role !== "admin") {
    throw createError(403, "Organisation or approved platform admin access required.");
  }
  const id = String(user._id);
  if (user.role === "admin") {
    const approved = (process.env.REPORT_ADMIN_IDS || "").split(",").map(v => v.trim().toLowerCase());
    if (!approved.includes(id.toLowerCase())) {
      throw createError(403, "Platform admin report access has not been approved.");
    }
  }
  return { id, role: user.role };
}

export function periods(now = new Date()) {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const week = new Date(day);
  week.setUTCDate(week.getUTCDate() - (week.getUTCDay() + 6) % 7);
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextDay = new Date(day); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const nextWeek = new Date(week); nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { day: [day, nextDay], week: [week, nextWeek], month: [month, nextMonth] };
}

function date(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw createError(400, "Dates must use YYYY-MM-DD.");
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw createError(400, "Invalid calendar date.");
  }
  return parsed;
}

export function parseFilters(query: Record<string, unknown>, now = new Date()): Filters {
  const allowed = ["range", "from", "to", "role", "status", "location", "source", "page", "pageSize"];
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.includes(key) || typeof value !== "string") throw createError(400, "Invalid report filter.");
  }
  const q = query as Record<string, string>;
  const range = q.range || "month";
  if (!["day", "week", "month", "custom", "all"].includes(range)) throw createError(400, "Invalid date range.");
  function integer(value: string | undefined, fallback: number, max: number) {
    if (value === undefined) return fallback;
    if (!/^[1-9]\d*$/.test(value) || Number(value) > max) throw createError(400, "Invalid pagination.");
    return Number(value);
  }
  const f: Filters = { range, page: integer(q.page, 1, 100000), pageSize: integer(q.pageSize, 25, 100) };
  if (range === "custom") {
    if (!q.from || !q.to) throw createError(400, "Select both custom dates.");
    f.from = q.from; f.to = q.to; f.start = date(q.from); f.end = date(q.to);
    if (f.start > f.end) throw createError(400, "Start date must not follow end date.");
    f.end.setUTCDate(f.end.getUTCDate() + 1);
  } else {
    if (q.from || q.to) throw createError(400, "Custom dates require a custom range.");
    if (range !== "all") [f.start, f.end] = periods(now)[range as "day" | "week" | "month"];
  }
  if (q.role) { if (!validId(q.role)) throw createError(400, "Invalid role filter."); f.role = q.role; }
  if (q.status) { if (!statuses.includes(q.status)) throw createError(400, "Invalid application status."); f.status = q.status; }
  if (q.source) { if (!sources.includes(q.source)) throw createError(400, "Invalid application source."); f.source = q.source; }
  if (q.location?.trim()) {
    if (q.location.length > 120) throw createError(400, "Location filter is too long.");
    f.location = q.location.trim();
  }
  return f;
}

// Both modern and legacy records are scoped before joins, pagination or export.
// Legacy applicants are deduplicated and excluded if a durable application exists.
export function reportPipeline(actor: Actor, dates?: { start?: Date; end?: Date }): any[] {
  const owner = objectId(actor.id);
  return [
    { $match: { ...(actor.role === "admin" ? {} : { organisationId: owner }),
      ...(dates?.start && dates?.end ? { appliedAt: { $gte: dates.start, $lt: dates.end } } : {}) } },
    { $set: { key: { $toString: "$_id" }, legacy: false } },
    { $unionWith: { coll: Initiative.collection.name, pipeline: [
      { $match: dates?.start ? { _id: { $exists: false } } : actor.role === "admin" ? {} : { userId: owner } },
      { $unwind: "$applicants" },
      { $group: { _id: { initiative: "$_id", volunteer: "$applicants" }, item: { $first: "$$ROOT" } } },
      { $lookup: { from: Application.collection.name,
        let: { initiative: "$_id.initiative", volunteer: "$_id.volunteer" }, pipeline: [
          { $match: { $expr: { $and: [ { $eq: ["$initiativeId", "$$initiative"] }, { $eq: ["$userId", "$$volunteer"] } ] } } },
          { $limit: 1 }, { $project: { _id: 1 } },
        ], as: "recorded" } },
      { $match: { recorded: { $size: 0 } } },
      { $project: { _id: 0,
        key: { $concat: ["legacy-", { $toString: "$_id.initiative" }, "-", { $toString: "$_id.volunteer" }] },
        initiativeId: "$_id.initiative", userId: "$_id.volunteer", organisationId: "$item.userId",
        roleName: "$item.initiativeName", appliedAt: { $literal: null }, status: { $literal: "applied" },
        applicationSource: { $literal: "unknown" }, legacy: { $literal: true },
      } },
    ] } },
    { $lookup: { from: User.collection.name, localField: "userId", foreignField: "_id",
      pipeline: [{ $project: { name: 1, email: 1 } }], as: "volunteer" } },
    { $lookup: { from: User.collection.name, localField: "organisationId", foreignField: "_id",
      pipeline: [{ $project: { name: 1 } }], as: "owner" } },
    { $lookup: { from: Initiative.collection.name, localField: "initiativeId", foreignField: "_id",
      pipeline: [{ $project: { location: 1 } }], as: "opportunity" } },
    { $project: {
      _id: 0, key: 1, initiativeId: 1, organisationId: 1, roleName: 1, legacy: 1,
      appliedAt: { $ifNull: ["$appliedAt", null] }, status: 1,
      volunteerName: { $ifNull: ["$volunteerName", { $ifNull: [{ $arrayElemAt: ["$volunteer.name", 0] }, null] }] },
      volunteerEmail: { $ifNull: ["$volunteerEmail", { $ifNull: [{ $arrayElemAt: ["$volunteer.email", 0] }, null] }] },
      organisationName: { $ifNull: ["$organisationName", { $ifNull: [{ $arrayElemAt: ["$owner.name", 0] }, null] }] },
      applicationSource: { $ifNull: ["$applicationSource", "unknown"] },
      opportunityLocation: { $ifNull: ["$opportunityLocation", { $trim: { input: { $concat: [
        { $ifNull: [{ $arrayElemAt: ["$opportunity.location.city", 0] }, ""] }, " ",
        { $ifNull: [{ $arrayElemAt: ["$opportunity.location.country", 0] }, ""] },
      ] } } }] },
    } },
  ];
}

export function filteredPipeline(actor: Actor, f: Filters) {
  const match: Record<string, any> = {};
  if (f.start && f.end) match.appliedAt = { $gte: f.start, $lt: f.end };
  if (f.role) match.initiativeId = objectId(f.role);
  if (f.status) match.status = f.status;
  if (f.source) match.applicationSource = f.source;
  if (f.location) match.opportunityLocation = { $regex: f.location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  return [...reportPipeline(actor, f), { $match: match }];
}

export async function listReport(actor: Actor, f: Filters, now = new Date()) {
  const windows = periods(now);
  function count(start: Date, end: Date) {
    return [{ $match: { appliedAt: { $gte: start, $lt: end } } }, { $count: "count" }];
  }
  const [data] = await Application.aggregate([...filteredPipeline(actor, f), { $facet: {
    rows: [{ $sort: { appliedAt: -1, key: 1 } }, { $skip: (f.page - 1) * f.pageSize }, { $limit: f.pageSize }],
    total: [{ $count: "count" }],
    day: count(windows.day[0], windows.day[1]),
    week: count(windows.week[0], windows.week[1]),
    month: count(windows.month[0], windows.month[1]),
    undated: [{ $match: { appliedAt: null } }, { $count: "count" }],
  } }]).allowDiskUse(true);
  const number = (key: string) => data[key][0]?.count || 0;
  return { rows: data.rows, total: number("total"), page: f.page, pageSize: f.pageSize,
    summary: { day: number("day"), week: number("week"), month: number("month"), undated: number("undated") },
    timezone: "UTC", start: f.start || null, endExclusive: f.end || null };
}

export async function reportRoles(actor: Actor) {
  return Application.aggregate([...reportPipeline(actor),
    { $group: { _id: "$initiativeId", name: { $first: "$roleName" }, organisation: { $first: "$organisationName" } } },
    { $sort: { name: 1, _id: 1 } },
  ]).allowDiskUse(true);
}

export async function reportDetail(actor: Actor, key: string) {
  if (!validId(key) && !/^legacy-[a-f\d]{24}-[a-f\d]{24}$/i.test(key)) throw createError(400, "Invalid application ID.");
  const [row] = await Application.aggregate([...reportPipeline(actor), { $match: { key } }, { $limit: 1 }]);
  if (!row) throw createError(404, "Application not found.");
  return row;
}

export const csvColumns = ["Volunteer name", "Volunteer email", "Date applied (UTC)", "Role", "Status", "Organisation", "Opportunity location", "Application source"];
export function csvCell(value: unknown) {
  let text = value == null || value === "" ? "Unavailable" : String(value);
  // Prevent spreadsheet formula execution, including leading whitespace.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function csvRow(row: any) {
  return [row.volunteerName, row.volunteerEmail,
    row.appliedAt ? new Date(row.appliedAt).toISOString() : "Date unavailable",
    row.roleName, row.status, row.organisationName, row.opportunityLocation, row.applicationSource,
  ].map(csvCell).join(",") + "\r\n";
}