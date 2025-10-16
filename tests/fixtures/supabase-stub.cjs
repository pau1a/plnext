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

const server = http.createServer((req, res) => {
  const parsed = new url.URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && parsed.pathname === "/rest/v1/posts") {
    const sorted = sortRows(posts);
    const filter = decodeFilter(parsed.searchParams.get("or"));
    const filtered = applyFilter(sorted, filter);
    const limitParam = parsed.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : filtered.length;
    const limited = filtered.slice(0, Math.max(limit, 0));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(limited));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Supabase stub listening on ${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
