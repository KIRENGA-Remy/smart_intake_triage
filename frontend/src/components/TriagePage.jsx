import { useEffect, useState } from "react";
import { createTriage, listTickets } from "../lib/api.js";
import { CATEGORIES, PRIORITIES } from "../lib/constants.js";
import TicketCard from "./TicketCard.jsx";

export default function TriagePage() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");

  async function load(filters) {
    setLoading(true);
    setError("");
    try {
      setTickets(await listTickets(filters));
    } catch (e) {
      setError(`Couldn't load tickets — ${e.message}. Is the backend running on :4321?`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ category, priority });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priority]);

  async function onSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await createTriage(text.trim());
      setText("");
      await load({ category, priority });
    } catch (e) {
      setError(`Triage failed — ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Intake form */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-coffee">New intake</h2>
        <p className="mt-1 text-sm text-muted">
          Paste a support ticket or customer message. The local model classifies it and drafts
          a reply.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. Payroll export to our GL failed and the pay run is due today."
          className="mt-4 w-full resize-y rounded-xl border border-[#E3DACB] bg-cream/40 p-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:bg-white"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={submitting || !text.trim()}
            className="rounded-lg bg-cta px-5 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Analyzing…" : "Triage message"}
          </button>
          {submitting && (
            <span className="text-xs text-muted">
              Running on CPU — the first request can take a while as the model loads.
            </span>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-coffee">Triage queue</h3>
          <p className="text-sm text-muted">{tickets.length} item{tickets.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <Select label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-[#FBE6E0] px-4 py-3 text-sm text-[#9A3412]">{error}</div>
      )}

      {/* Queue */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : tickets.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-[#D8CDBB] p-10 text-center text-sm text-muted">
            No tickets match this filter yet. Triage a message above to get started.
          </div>
        ) : (
          tickets.map((t) => <TicketCard key={t.id} ticket={t} />)
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="font-medium text-ink/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-ink focus:border-gold"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
