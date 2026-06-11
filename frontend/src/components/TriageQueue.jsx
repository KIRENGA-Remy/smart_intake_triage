import { useEffect, useState } from "react";
import { listTickets } from "../lib/api.js";
import {
  CATEGORIES as CATS,
  PRIORITIES as PRIS,
  PRIORITY_COLORS as PCOLORS,
} from "../lib/constants.js";

export default function TriageQueue() {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setTickets(await listTickets({ category, priority }));
    } catch (e) {
      setError(`Couldn't load tickets — ${e.message}. Is the backend running on :4321?`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priority]);

  return (
    <div className="queue">
      <div className="queue-head">
        <h2>Triage Queue</h2>
        <p>Every triaged ticket, filterable by category and priority.</p>
      </div>

      <div className="queue-filters">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All</option>
            {PRIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button className="icon-btn refresh" onClick={load} title="Refresh">
          ⟳
        </button>
      </div>

      {error && <div className="q-error">{error}</div>}

      <div className="queue-scroll">
        {loading ? (
          <div className="q-empty">Loading…</div>
        ) : tickets.length === 0 ? (
          <div className="q-empty">No tickets match this filter yet.</div>
        ) : (
          <table className="qtable">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Category</th>
                <th>Module</th>
                <th>Summary</th>
                <th>Conf.</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const c = PCOLORS[t.priority];
                return (
                  <tr key={t.id}>
                    <td>
                      <span
                        className="badge"
                        style={c ? { background: c.bg, color: c.fg } : undefined}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.affectedModule}</td>
                    <td className="q-summary">{t.summary}</td>
                    <td>{Math.round((t.confidence || 0) * 100)}%</td>
                    <td>{t.needsReview ? "⚠" : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
