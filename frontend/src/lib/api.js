const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4321";

async function jsonOrThrow(res) {
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail || "";
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json();
}

// UC1: classify + store one inbound message. Returns the stored ticket with its assigned ID
export async function createTriage(text) {
  const res = await fetch(`${BASE}/api/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return jsonOrThrow(res);
}

// UC1: list tickets for the dashboard, with optional filters
export async function listTickets({ category, priority } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (priority) params.set("priority", priority);
  const qs = params.toString();
  const res = await fetch(`${BASE}/api/triage${qs ? `?${qs}` : ""}`);
  return jsonOrThrow(res);
}

// UC2: grounded question answering
export async function ask(question) {
  const res = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return jsonOrThrow(res);
}
