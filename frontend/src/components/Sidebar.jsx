import { groupByDate } from "../lib/constants.js";

export default function Sidebar({ sessions, currentId, onSelect, onNew }) {
  const groups = groupByDate(sessions);

  return (
    <aside className="hidden w-[264px] flex-shrink-0 flex-col overflow-hidden border-r border-line bg-sidebar md:flex">
      <div className="px-3.5 pb-3 pt-4">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-[9px] border border-line bg-transparent px-3.5 py-2.5 text-[13px] font-semibold text-tprimary transition-colors hover:border-linestrong hover:bg-inputbg"
        >
          <span className="text-[17px] leading-none text-accent">+</span> New Analysis Session
        </button>
      </div>
      <div className="px-[18px] pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[1.2px] text-tmuted">
        Recent Sessions
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 ? (
          <div className="px-3 py-4 text-[12px] leading-relaxed text-tmuted">
            No sessions yet. Ask something in Intake Triage or Knowledge Assistant and it will
            appear here.
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <div className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.8px] text-tmuted">
                {g.label}
              </div>
              {g.items.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  title={s.title}
                  className={`mb-px flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] transition-colors ${
                    s.id === currentId
                      ? "bg-[rgba(201,168,106,0.14)] text-accent"
                      : "text-tsecondary hover:bg-[rgba(201,168,106,0.08)] hover:text-tprimary"
                  }`}
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent2 opacity-70" />
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{s.title}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent2),var(--accent))] text-[13px] font-bold text-white">
            MO
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-tprimary">Mine Operator</div>
            <div className="text-[11px] text-tmuted">Self-hosted · Qwen2.5-3B</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
