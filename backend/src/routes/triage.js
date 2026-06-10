const express = require("express");
const { prisma } = require("../lib/db.js");
const { chatJSON } = require("../lib/ollama.js");
const { TriageSchema, TriageJsonSchema } = require("../lib/schemas.js");

const router = express.Router();

const SYSTEM = `You are a support-intake triage engine for MineTech, a mining
operations software company. Classify the inbound message and extract fields.
Rules:
- Pick the single best category and a priority. "Urgent" = production blocked or
  safety/financial risk; "High" = broken feature, no workaround; "Medium" = degraded
  or annoying; "Low" = question or minor request.
- affectedModule must be the closest MineTech module, or "Unknown".
- summary: one neutral sentence, no PII (no names, emails, phone numbers).
- suggestedReply: a short, professional first response the support team could send.
- confidence: your confidence in the classification, 0 to 1.
Output ONLY the JSON object.`;

async function classify(text) {
  const result = await chatJSON({ system: SYSTEM, user: text, schema: TriageJsonSchema });
  const obj = typeof result === "string" ? JSON.parse(result) : result;
  const parsed = TriageSchema.safeParse(obj);
  return parsed.success ? parsed.data : null;
}

async function tryClassify(text) {
  try {
    return await classify(text);
  } catch {
    return null;
  }
}

// POST /api/triage  -> classify + store
router.post("/", async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Body must be { text: string }" });
    }

    // Graceful malformed-output handling: try, retry once, then fallback.
    let result = await tryClassify(text);
    if (!result) result = await tryClassify(text);

    const needsReview = result === null;
    const data = result ?? {
      category: "Other",
      priority: "Medium",
      summary: text.slice(0, 200),
      sentiment: "Neutral",
      affectedModule: "Unknown",
      suggestedReply: "Thank you for reaching out — our team will review this shortly.",
      confidence: 0,
    };

    const ticket = await prisma.ticket.create({
      data: { rawText: text, ...data, needsReview },
    });
    res.json(ticket);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Triage failed", detail: String(e) });
  }
});

// GET /api/triage?category=&priority=  -> dashboard data
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = String(req.query.category);
    if (req.query.priority) where.priority = String(req.query.priority);
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "List failed" });
  }
});

module.exports = router;
