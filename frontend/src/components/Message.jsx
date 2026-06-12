import { PRIORITY_COLORS, SENTIMENT_COLORS } from "../lib/constants.js";

function Badge({ children, colors }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-bold"
      style={colors ? { background: colors.bg, color: colors.fg } : undefined}
    >
      {children}
    </span>
  );
}

function TriageCard({ t }) {
  const pct = Math.round((t.confidence || 0) * 100);
  return (
    <div className="rounded-[4px_13px_13px_13px] border border-line border-l-[3px] border-l-accent bg-[var(--card-glass)] p-4 backdrop-blur-lg">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold text-accent">Triage Result</div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge colors={{ bg: "rgba(201,168,106,0.16)", fg: "var(--accent)" }}>{t.category}</Badge>
        <Badge colors={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
        <Badge colors={SENTIMENT_COLORS[t.sentiment]}>{t.sentiment}</Badge>
        {t.needsReview && (
          <Badge colors={{ bg: "rgba(217,136,59,0.16)", fg: "#D9883B" }}>⚠ Needs review</Badge>
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line py-[7px] text-[13px]">
          <span className="text-tmuted">Summary</span>
          <span className="text-right font-semibold text-tprimary">{t.summary}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line py-[7px] text-[13px]">
          <span className="text-tmuted">Affected module</span>
          <span className="text-right font-semibold text-tprimary">{t.affectedModule}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-[7px] text-[13px]">
          <span className="text-tmuted">Confidence</span>
          <span className="text-right font-semibold text-tprimary">
            <span className="mr-2 inline-block h-1.5 w-[90px] overflow-hidden rounded bg-line align-middle">
              <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
            </span>
            {pct}%
          </span>
        </div>
      </div>
      <div className="mt-3 rounded-[9px] bg-inputbg px-3.5 py-3">
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.6px] text-accent">
          Suggested reply
        </div>
        <p className="text-[13px] leading-[1.55] text-tprimary">{t.suggestedReply}</p>
      </div>
    </div>
  );
}

function KnowledgeAnswer({ m }) {
  const notInKb =
    m.grounded === false ||
    (m.answer || "").toLowerCase().includes("find anything about that in the knowledge base") ||
    (m.answer || "").toLowerCase().includes("couldn't find relevant information");

  if (notInKb) {
    return (
      <div className="rounded-[4px_13px_13px_13px] border border-[rgba(217,136,59,0.4)] bg-[rgba(217,136,59,0.12)] p-4 text-[14px] leading-relaxed text-[#D9883B] backdrop-blur-lg">
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.6px]">
          Not in the knowledge base
        </div>
        {m.answer}
        {typeof m.topSimilarity === "number" && (
          <div className="mt-[7px] text-[11.5px] opacity-80">
            best match {Math.round(m.topSimilarity * 100)}% — below threshold
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap rounded-[4px_13px_13px_13px] border border-line bg-[var(--card-glass)] px-4 py-3 text-[14px] leading-[1.65] text-tprimary backdrop-blur-lg">
      {m.answer}
      {m.citations && m.citations.length > 0 && (
        <div className="mt-[11px] flex flex-wrap gap-1.5 border-t border-line pt-2.5">
          {m.citations.map((c) => (
            <span
              key={c.n}
              title={`${c.source} · ${Math.round((c.similarity || 0) * 100)}% match`}
              className="inline-flex items-center gap-1.5 rounded-[7px] bg-[rgba(201,168,106,0.14)] px-2.5 py-[3px] text-[11px] font-semibold text-accent"
            >
              [{c.n}] {c.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Message({ m }) {
  if (m.role === "user") {
    return (
      <div className="mb-[22px] w-full max-w-chat px-5">
        <div className="flex flex-row-reverse gap-3">
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#4A3A2C] text-[12px] font-bold text-white">
            U
          </div>
          <div className="min-w-0 max-w-[88%]">
            <div className="rounded-[13px_4px_13px_13px] bg-[var(--user-bubble)] px-4 py-3 text-[14px] leading-[1.65] text-white">
              {m.text}
            </div>
            <div className="mt-[5px] text-right text-[11px] text-tmuted">You</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-[22px] w-full max-w-chat px-5">
      <div className="flex gap-3">
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent2))] text-[12px] font-bold text-[#1A1511]">
          M
        </div>
        <div className="min-w-0 max-w-[88%]">
          {m.kind === "intake" && m.triage && <TriageCard t={m.triage} />}
          {m.kind === "knowledge" && <KnowledgeAnswer m={m} />}
          {m.kind === "error" && (
            <div className="rounded-[4px_13px_13px_13px] border border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.12)] px-4 py-3 text-[14px] leading-relaxed text-[#E5484D] backdrop-blur-lg">
              {m.text}
            </div>
          )}
          <div className="mt-[5px] text-[11px] text-tmuted">TriageDesk</div>
        </div>
      </div>
    </div>
  );
}
