import { PRIORITY_COLORS, SENTIMENT_COLORS } from "../lib/constants.js";

function Badge({ children, colors }) {
  return (
    <span className="badge" style={colors ? { background: colors.bg, color: colors.fg } : undefined}>
      {children}
    </span>
  );
}

function TriageCard({ t }) {
  const pct = Math.round((t.confidence || 0) * 100);
  return (
    <div className="triage-card">
      <div className="tc-header">⛏ Triage Result</div>
      <div className="badge-row">
        <Badge colors={{ bg: "rgba(201,168,106,0.16)", fg: "var(--accent)" }}>{t.category}</Badge>
        <Badge colors={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
        <Badge colors={SENTIMENT_COLORS[t.sentiment]}>{t.sentiment}</Badge>
        {t.needsReview && (
          <Badge colors={{ bg: "rgba(217,136,59,0.16)", fg: "#D9883B" }}>⚠ Needs review</Badge>
        )}
      </div>
      <div className="tc-rows">
        <div className="tc-row">
          <span className="label">Summary</span>
          <span className="value">{t.summary}</span>
        </div>
        <div className="tc-row">
          <span className="label">Affected module</span>
          <span className="value">{t.affectedModule}</span>
        </div>
        <div className="tc-row">
          <span className="label">Confidence</span>
          <span className="value">
            <span className="conf-bar">
              <span style={{ width: `${pct}%` }} />
            </span>
            {pct}%
          </span>
        </div>
      </div>
      <div className="reply-box">
        <div className="rb-label">Suggested reply</div>
        <p>{t.suggestedReply}</p>
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
      <div className="note-card nf">
        <div className="nf-label">Not in the knowledge base</div>
        {m.answer}
        {typeof m.topSimilarity === "number" && (
          <div className="nf-sub">best match {Math.round(m.topSimilarity * 100)}% — below threshold</div>
        )}
      </div>
    );
  }

  return (
    <div className="msg-bubble">
      {m.answer}
      {m.citations && m.citations.length > 0 && (
        <div className="citations">
          {m.citations.map((c) => (
            <span
              key={c.n}
              className="cite-chip"
              title={`${c.source} · ${Math.round((c.similarity || 0) * 100)}% match`}
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
      <div className="message-wrapper">
        <div className="message user">
          <div className="msg-avatar user-av">U</div>
          <div className="msg-col">
            <div className="msg-bubble">{m.text}</div>
            <div className="msg-meta">You</div>
          </div>
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="message-wrapper">
      <div className="message ai">
        <div className="msg-avatar ai">M</div>
        <div className="msg-col">
          {m.kind === "intake" && m.triage && <TriageCard t={m.triage} />}
          {m.kind === "knowledge" && <KnowledgeAnswer m={m} />}
          {m.kind === "error" && <div className="note-card err">{m.text}</div>}
          <div className="msg-meta">MineTech AI</div>
        </div>
      </div>
    </div>
  );
}
