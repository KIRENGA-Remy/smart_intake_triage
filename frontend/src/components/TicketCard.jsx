import Badge from "./Badge.jsx";
import { PRIORITY_SPINE, PRIORITY_BADGE, SENTIMENT_BADGE } from "../lib/constants.js";

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketCard({ ticket }) {
  const spine = PRIORITY_SPINE[ticket.priority] || "#B8935A";

  return (
    <article
      className="relative overflow-hidden rounded-xl bg-white shadow-card"
      style={{ borderLeft: `4px solid ${spine}` }}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#EFE7DA] text-coffee">{ticket.category}</Badge>
          <Badge className={PRIORITY_BADGE[ticket.priority] || "bg-[#EFE7DA] text-muted"}>
            {ticket.priority}
          </Badge>
          <Badge className={SENTIMENT_BADGE[ticket.sentiment] || "bg-[#ECE6DC] text-muted"}>
            {ticket.sentiment}
          </Badge>
          {ticket.needsReview && (
            <Badge className="bg-[#F7E8CF] text-[#92531A]">⚠ Needs review</Badge>
          )}
        </div>

        <p className="mt-3 font-medium leading-snug text-ink">{ticket.summary}</p>

        <div className="mt-1 text-xs text-muted">
          Module: <span className="font-medium text-ink/80">{ticket.affectedModule}</span>
        </div>

        <div className="mt-4 rounded-lg bg-cream px-3.5 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gold">
            Suggested reply
          </div>
          <p className="mt-1 text-sm text-ink/85">{ticket.suggestedReply}</p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <span>Confidence</span>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[#ECE6DC]">
              <span
                className="block h-full rounded-full bg-gold"
                style={{ width: `${Math.round((ticket.confidence || 0) * 100)}%` }}
              />
            </span>
            <span className="tabular-nums">{Math.round((ticket.confidence || 0) * 100)}%</span>
          </div>
          <time dateTime={ticket.createdAt}>{timeAgo(ticket.createdAt)}</time>
        </div>
      </div>
    </article>
  );
}
