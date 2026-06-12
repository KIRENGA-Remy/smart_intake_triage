import { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import { MODE_COPY } from "../lib/constants.js";

export default function Chat({ mode, messages, sending, onStarter }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const copy = MODE_COPY[mode];
  const empty = messages.length === 0;

  return (
    <div className="relative z-[2] flex flex-1 flex-col items-center overflow-y-auto py-8">
      {empty ? (
        <div className="flex w-full max-w-[680px] flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <h1 className="mb-2.5 bg-[linear-gradient(135deg,var(--text-primary)_45%,var(--accent))] bg-clip-text font-display text-[30px] font-bold text-transparent">
            {copy.title}
          </h1>
          <p className="mb-7 max-w-[560px] text-[15px] leading-[1.65] text-tsecondary">
            {copy.subtitle}
          </p>
          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {copy.starters.map((s) => (
              <button
                key={s}
                onClick={() => onStarter(s)}
                className="cursor-pointer rounded-xl border border-line bg-[var(--card-glass)] px-4 py-3 text-left backdrop-blur-md transition-colors hover:border-accent"
              >
                <div className="text-[13px] font-semibold text-tprimary">{s}</div>
                <div className="mt-0.5 text-[12px] text-tmuted">
                  {mode === "intake" ? "Triage this message" : "Ask the knowledge base"}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((m) => (
            <Message key={m.id} m={m} />
          ))}
          {sending && (
            <div className="mb-[22px] w-full max-w-chat px-5">
              <div className="flex gap-3">
                <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent2))] text-[12px] font-bold text-[#1A1511]">
                  M
                </div>
                <div className="rounded-[4px_13px_13px_13px] border border-line bg-[var(--card-glass)] px-4 py-3 backdrop-blur-lg">
                  <span className="inline-flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-accent animate-blink" />
                    <i className="h-1.5 w-1.5 rounded-full bg-accent animate-blink [animation-delay:0.2s]" />
                    <i className="h-1.5 w-1.5 rounded-full bg-accent animate-blink [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
}
