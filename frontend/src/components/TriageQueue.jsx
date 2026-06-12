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

  const selectCls =
    "rounded-lg border border-line bg-inputbg px-2.5 py-[7px] text-[13px] text-tprimary";

  return (
    <div className="relative z-[2] flex flex-1 flex-col overflow-hidden bg-bgmain">
      <div className="px-7 pb-3.5 pt-[22px]">
        <h2 className="font-display text-[20px] font-bold text-tprimary">Triage Queue</h2>
        <p className="mt-0.5 text-[13px] text-tmuted">
          Every triaged ticket, filterable by category and priority.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-7 pb-3.5">
        <label className="flex items-center gap-[7px] text-[13px] text-tsecondary">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="">All</option>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-[7px] text-[13px] text-tsecondary">
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
            <option value="">All</option>
            {PRIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={load}
          title="Refresh"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-[9px] border border-line bg-transparent text-[15px] text-tsecondary transition-colors hover:border-linestrong hover:bg-inputbg hover:text-tprimary"
        >
          ⟳
        </button>
      </div>

      {error && (
        <div className="mx-7 mb-4 rounded-[9px] border border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.12)] px-3.5 py-3 text-[13px] text-[#E5484D]">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-7 pb-7">
        {loading ? (
          <div className="p-10 text-center text-[14px] text-tmuted">Loading…</div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center text-[14px] text-tmuted">
            No tickets match this filter yet.
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Priority", "Category", "Module", "Summary", "Conf.", "Review"].map((h) => (
                  <th
                    key={h}
                    className="sticky top-0 z-10 border-b border-line bg-bgmain px-2.5 py-2 text-left text-[11px] font-bold uppercase tracking-[0.6px] text-tmuted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const c = PCOLORS[t.priority];
                return (
                  <tr key={t.id} className="hover:bg-[rgba(201,168,106,0.05)]">
                    <td className="border-b border-line px-2.5 py-[11px] align-top">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                        style={c ? { background: c.bg, color: c.fg } : undefined}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="border-b border-line px-2.5 py-[11px] align-top text-tprimary">
                      {t.category}
                    </td>
                    <td className="border-b border-line px-2.5 py-[11px] align-top text-tprimary">
                      {t.affectedModule}
                    </td>
                    <td className="max-w-[360px] border-b border-line px-2.5 py-[11px] align-top text-tprimary">
                      {t.summary}
                    </td>
                    <td className="border-b border-line px-2.5 py-[11px] align-top text-tprimary">
                      {Math.round((t.confidence || 0) * 100)}%
                    </td>
                    <td className="border-b border-line px-2.5 py-[11px] align-top text-tprimary">
                      {t.needsReview ? "⚠" : "—"}
                    </td>
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
