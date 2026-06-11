// ===== Backend enums (must match schemas.js) =====
export const CATEGORIES = [
  "Equipment Failure",
  "Safety Incident",
  "Production Issue",
  "Logistics & Supply",
  "Environmental Compliance",
  "Staff & Training",
  "Billing & Licensing",
  "Payroll & Finance",
  "Feature Request",
  "Account & Access",
  "Other",
];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

// Badge colours { bg, fg } — chosen to read on both dark and light themes.
export const PRIORITY_COLORS = {
  Urgent: { bg: "rgba(229,72,77,0.16)", fg: "#E5484D" },
  High: { bg: "rgba(217,136,59,0.16)", fg: "#D9883B" },
  Medium: { bg: "rgba(201,168,106,0.18)", fg: "#C9A86A" },
  Low: { bg: "rgba(111,168,107,0.16)", fg: "#6FA86B" },
};
export const SENTIMENT_COLORS = {
  Positive: { bg: "rgba(111,168,107,0.16)", fg: "#6FA86B" },
  Neutral: { bg: "rgba(150,135,120,0.16)", fg: "#9B8E80" },
  Negative: { bg: "rgba(229,72,77,0.16)", fg: "#E5484D" },
};

// Welcome copy + starter prompts per mode.
export const MODE_COPY = {
  knowledge: {
    title: "What can I help you mine today?",
    subtitle:
      "Ask me anything about your mining operations — from ore grade predictions and equipment health to safety compliance and environmental monitoring.",
    placeholder: "Ask about ore grades, equipment health, safety reports…",
    starters: [
      "How does the payroll module handle overtime?",
      "What does the Grade Control module do?",
      "How are contractor certifications tracked?",
      "What does Quality Control monitor?",
    ],
  },
  intake: {
    title: "Smart Intake Triage",
    subtitle:
      "Paste an inbound support message or incident report. I'll classify it — category, priority, affected module, sentiment — and draft a suggested reply.",
    placeholder: "Paste a support ticket or incident report to triage…",
    starters: [
      "Conveyor belt at the crusher stopped mid-shift, production is halted.",
      "Payroll export to our GL failed and the pay run is due today.",
      "Worker reported a near-miss near the haul road — no injury.",
      "Can we get a dashboard widget for fleet fuel usage?",
    ],
  },
};

// ===== Session storage (localStorage) =====
const KEY = "minetech_sessions_v1";

export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

// Group sessions (sorted newest-first) into Today / Yesterday / Last 7 Days / Older.
export function groupByDate(sessions) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86400000;
  const buckets = { Today: [], Yesterday: [], "Last 7 Days": [], Older: [] };

  [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((s) => {
      const t = s.updatedAt;
      if (t >= startOfToday) buckets.Today.push(s);
      else if (t >= startOfToday - dayMs) buckets.Yesterday.push(s);
      else if (t >= startOfToday - 7 * dayMs) buckets["Last 7 Days"].push(s);
      else buckets.Older.push(s);
    });

  return Object.entries(buckets)
    .filter(([, items]) => items.length)
    .map(([label, items]) => ({ label, items }));
}
