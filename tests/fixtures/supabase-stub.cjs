/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");
const url = require("node:url");

const PORT = Number.parseInt(process.env.SUPABASE_STUB_PORT || "4545", 10);

const posts = [
  {
    slug: "operations-deep-dive",
    title: "Operations Deep Dive",
    description: "Keeping complex systems on track.",
    date: "2024-08-15T09:00:00.000Z",
    tags: ["ops"],
    inserted_at: "2024-08-15T09:00:00.000Z",
  },
  {
    slug: "ai-red-team-strategy",
    title: "AI Red Team Strategy",
    description: "Hardening models against adversarial use.",
    date: "2024-07-10T12:00:00.000Z",
    tags: ["ai"],
    inserted_at: "2024-07-10T12:00:00.000Z",
  },
  {
    slug: "defense-in-depth",
    title: "Defense in Depth",
    description: "Layering controls for resilience.",
    date: "2024-06-05T08:30:00.000Z",
    tags: ["security"],
    inserted_at: "2024-06-05T08:30:00.000Z",
  },
  {
    slug: "incident-playbooks",
    title: "Incident Playbooks",
    description: "Repeatable responses under pressure.",
    date: "2024-05-15T11:45:00.000Z",
    tags: ["ops"],
    inserted_at: "2024-05-15T11:45:00.000Z",
  },
  {
    slug: "threat-modeling-at-scale",
    title: "Threat Modeling at Scale",
    description: "Scaling review practices across teams.",
    date: "2024-04-02T15:00:00.000Z",
    tags: ["security"],
    inserted_at: "2024-04-02T15:00:00.000Z",
  },
  {
    slug: "trusted-ml-deployments",
    title: "Trusted ML Deployments",
    description: "Operational guarantees for ML systems.",
    date: "2024-03-12T10:15:00.000Z",
    tags: ["ai"],
    inserted_at: "2024-03-12T10:15:00.000Z",
  },
  {
    slug: "operational-postmortems",
    title: "Operational Postmortems",
    description: "Learning from incidents without blame.",
    date: "2024-02-01T09:20:00.000Z",
    tags: ["ops"],
    inserted_at: "2024-02-01T09:20:00.000Z",
  },
  {
    slug: "secure-baselines",
    title: "Secure Baselines",
    description: "Anchoring defenses in fundamentals.",
    date: "2024-01-10T08:00:00.000Z",
    tags: ["security"],
    inserted_at: "2024-01-10T08:00:00.000Z",
  },
];

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const left = Date.parse(a.inserted_at);
    const right = Date.parse(b.inserted_at);
    if (left !== right) {
      return right - left;
    }

    return b.slug.localeCompare(a.slug);
  });
}

function decodeFilter(value) {
  if (!value) {
    return null;
  }

  const [primary, tieRaw] = value.split(",and(");
  const [field, op, ...rest] = primary.split(".");
  const baseValue = rest.join(".");

  let tieOp = null;
  let tieValue = null;

  if (tieRaw) {
    const cleaned = tieRaw.replace(/\)$/u, "");
    const parts = cleaned.split(",");
    for (const part of parts) {
      const [tieField, tieComparison, ...tieRest] = part.split(".");
      const value = tieRest.join(".");
      if (tieField === "slug") {
        tieOp = tieComparison;
        tieValue = value;
      }
    }
  }

  return { field, op, baseValue, tieOp, tieValue };
}

function applyFilter(rows, filter) {
  if (!filter) {
    return rows;
  }

  const { field, op, baseValue, tieOp, tieValue } = filter;
  if (field !== "inserted_at") {
    return rows;
  }

  return rows.filter((row) => {
    if (op === "lt") {
      if (row.inserted_at < baseValue) {
        return true;
      }

      if (row.inserted_at === baseValue && tieOp === "lt" && row.slug < tieValue) {
        return true;
      }

      return false;
    }

    if (op === "gt") {
      if (row.inserted_at > baseValue) {
        return true;
      }

      if (row.inserted_at === baseValue && tieOp === "gt" && row.slug > tieValue) {
        return true;
      }

      return false;
    }

    return true;
  });
}

const comments = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "operations-deep-dive",
    author_name: "Alex",
    author_email: "alex@example.com",
    content: "Loved the tactical detail!",
    status: "pending",
    is_spam: false,
    ip_hash: "hash-1",
    user_agent: "Playwright",
    created_at: "2024-08-20T10:00:00.000Z",
    updated_at: "2024-08-20T10:00:00.000Z",
    moderated_at: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "ai-red-team-strategy",
    author_name: "Bea",
    author_email: "bea@example.com",
    content: "Thanks for sharing this methodology.",
    status: "approved",
    is_spam: false,
    ip_hash: "hash-2",
    user_agent: "Mozilla/5.0",
    created_at: "2024-07-11T09:30:00.000Z",
    updated_at: "2024-07-11T09:30:00.000Z",
    moderated_at: "2024-07-11T12:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "defense-in-depth",
    author_name: "Chris",
    author_email: "chris@example.com",
    content: "Could you expand on the logging section?",
    status: "rejected",
    is_spam: false,
    ip_hash: "hash-3",
    user_agent: "Mozilla/5.0",
    created_at: "2024-06-06T08:00:00.000Z",
    updated_at: "2024-06-06T09:00:00.000Z",
    moderated_at: "2024-06-06T09:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "operations-deep-dive",
    author_name: "Dana",
    author_email: "dana@example.com",
    content: "We piloted this and it works great!",
    status: "approved",
    is_spam: false,
    ip_hash: "hash-4",
    user_agent: "Mozilla/5.0",
    created_at: "2024-08-19T15:00:00.000Z",
    updated_at: "2024-08-19T16:00:00.000Z",
    moderated_at: "2024-08-19T16:00:00.000Z",
  },
];

const auditLog = [];

function selectPublicComments(params) {
  const slugFilter = params.get("slug");
  if (!slugFilter || !slugFilter.startsWith("eq.")) {
    return [];
  }

  const slug = slugFilter.slice(3);
  const limitParam = params.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const createdFilter = params.get("created_at");
  const after = createdFilter && createdFilter.startsWith("gt.") ? createdFilter.slice(3) : null;

  const rows = comments
    .filter((row) => row.slug === slug && row.status === "approved" && !row.is_spam)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const filtered = after ? rows.filter((row) => row.created_at > after) : rows;
  return filtered.slice(0, Math.max(limit, 0)).map((row) => ({
    id: row.id,
    slug: row.slug,
    author: row.author_name,
    content: row.content,
    created_at: row.created_at,
  }));
}

function applyModerationFilters(rows, params) {
  const statusFilter = params.get("status");
  let filtered = rows;
  if (statusFilter && statusFilter.startsWith("eq.")) {
    const status = statusFilter.slice(3);
    filtered = filtered.filter((row) => row.status === status);
  }

  const orFilter = params.get("or");
  if (orFilter) {
    const clauses = orFilter.split(",");
    filtered = filtered.filter((row) => {
      return clauses.some((clause) => {
        const [field, op, ...rest] = clause.split(".");
        if (op !== "ilike") {
          return true;
        }
        const value = rest.join(".");
        const pattern = value.replace(/%/g, "").toLowerCase();
        const target = (row[field] ?? "").toString().toLowerCase();
        return target.includes(pattern);
      });
    });
  }

  return filtered;
}

function sortModerationRows(rows, params) {
  const orderParam = params.get("order") || "created_at.desc";
  const [field, direction] = orderParam.split(".");
  const ascending = direction === "asc";

  const sorted = [...rows].sort((a, b) => {
    if (field === "created_at") {
      const left = Date.parse(a.created_at);
      const right = Date.parse(b.created_at);
      if (left !== right) {
        return ascending ? left - right : right - left;
      }
      return ascending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    }

    return ascending ? String(a[field]).localeCompare(String(b[field])) : String(b[field]).localeCompare(String(a[field]));
  });

  return sorted;
}

function parseRange(rangeHeader, total) {
  if (!rangeHeader) {
    return [0, total > 0 ? total - 1 : 0];
  }

  const match = /^(\d+)-(\d+)$/u.exec(rangeHeader.replace(/items=/u, ""));
  if (!match) {
    return [0, total > 0 ? total - 1 : 0];
  }

  const start = Number.parseInt(match[1], 10);
  const end = Number.parseInt(match[2], 10);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    return [0, total > 0 ? total - 1 : 0];
  }

  return [start, Math.min(end, total > 0 ? total - 1 : 0)];
}

function respondJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, { "Content-Type": "application/json", ...extraHeaders });
  res.end(JSON.stringify(payload));
}

function handleModerationQuery(req, res, params) {
  const filtered = applyModerationFilters(comments, params);
  const sorted = sortModerationRows(filtered, params);
  const total = sorted.length;
  const [start, end] = parseRange(req.headers.range, total);
  const slice = sorted.slice(start, end + 1);
  const statusCode = slice.length < total ? 206 : 200;
  const contentRange = total === 0 ? "0-0/0" : `${start}-${start + slice.length - 1}/${total}`;

  respondJson(
    res,
    statusCode,
    slice.map((row) => ({
      id: row.id,
      slug: row.slug,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      status: row.status,
      is_spam: row.is_spam,
      ip_hash: row.ip_hash,
      user_agent: row.user_agent,
      created_at: row.created_at,
      updated_at: row.updated_at,
      moderated_at: row.moderated_at,
    })),
    { "Content-Range": contentRange },
  );
}

function handleModerationUpdate(req, res, params) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const idFilter = params.get("id");
      if (!idFilter || !idFilter.startsWith("eq.")) {
        respondJson(res, 400, { error: "Missing id filter" });
        return;
      }

      const id = idFilter.slice(3);
      const record = comments.find((row) => row.id === id);
      if (!record) {
        respondJson(res, 200, []);
        return;
      }

      if (payload.status) {
        record.status = payload.status;
      }
      if (Object.prototype.hasOwnProperty.call(payload, "is_spam")) {
        record.is_spam = Boolean(payload.is_spam);
      }
      if (payload.moderated_at) {
        record.moderated_at = payload.moderated_at;
      }
      record.updated_at = payload.updated_at || new Date().toISOString();

      respondJson(res, 200, [
        {
          id: record.id,
          slug: record.slug,
          status: record.status,
        },
      ]);
    } catch (error) {
      respondJson(res, 500, { error: error.message });
    }
  });
}

function handleAuditInsert(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const payload = body ? JSON.parse(body) : [];
      const rows = Array.isArray(payload) ? payload : [payload];
      rows.forEach((row) => {
        auditLog.push({ ...row, id: auditLog.length + 1 });
      });
      respondJson(res, 201, rows);
    } catch (error) {
      respondJson(res, 500, { error: error.message });
    }
  });
}

const server = http.createServer((req, res) => {
  const parsed = new url.URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && parsed.pathname === "/rest/v1/posts") {
    const sorted = sortRows(posts);
    const filter = decodeFilter(parsed.searchParams.get("or"));
    const filtered = applyFilter(sorted, filter);
    const limitParam = parsed.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : filtered.length;
    const limited = filtered.slice(0, Math.max(limit, 0));

    respondJson(res, 200, limited);
    return;
  }

  if (parsed.pathname === "/rest/v1/comments" || parsed.pathname === "/rest/v1/pl_site.comments") {
    const select = parsed.searchParams.get("select") || "";
    const targetsModeration =
      select.includes("author_name") ||
      select.includes("moderated_at") ||
      select.includes("status") ||
      parsed.searchParams.has("status");

    if (req.method === "GET") {
      if (targetsModeration) {
        handleModerationQuery(req, res, parsed.searchParams);
      } else {
        const data = selectPublicComments(parsed.searchParams);
        respondJson(res, 200, data);
      }
      return;
    }

    if (req.method === "PATCH") {
      handleModerationUpdate(req, res, parsed.searchParams);
      return;
    }
  }

  if (
    req.method === "POST" &&
    (parsed.pathname === "/rest/v1/pl_site.moderation_audit_log" || parsed.pathname === "/rest/v1/moderation_audit_log")
  ) {
    handleAuditInsert(req, res);
    return;
  }

  respondJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Supabase stub listening on ${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
