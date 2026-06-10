import { useEffect, useRef, useState } from "react";
import { ask } from "../lib/api.js";
import { STARTER_QUESTIONS } from "../lib/constants.js";

export default function ChatPage() {
  const [messages, setMessages] = useState([]); // {role, content, grounded, citations, topSimilarity}
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(q) {
    const question = (q ?? input).trim();
    if (!question || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setSending(true);
    try {
      const res = await ask(question);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          grounded: res.grounded,
          citations: res.citations || [],
          topSimilarity: res.topSimilarity,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", error: true, content: `Request failed — ${e.message}. Is the backend running on :4321?`, citations: [] },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] max-w-3xl flex-col px-5">
      <div className="flex items-center justify-between py-5">
        <div>
          <h2 className="font-display text-xl font-bold text-coffee">Knowledge Assistant</h2>
          <p className="text-sm text-muted">Answers are grounded in the MineTech knowledge base, with citations.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#D8CDBB] p-8 text-center">
            <p className="text-sm text-muted">Ask about MineTech's product modules. Try:</p>
            <div className="mt-4 flex flex-col items-center gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full bg-[#EFE7DA] px-4 py-1.5 text-sm text-coffee hover:bg-[#E6DAC6]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-coffee px-4 py-2.5 text-sm text-cream">
                {m.content}
              </div>
            </div>
          ) : (
            <Assistant key={i} m={m} />
          )
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-muted shadow-card">
              Searching the knowledge base…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[#E3DACB] py-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
            className="max-h-32 flex-1 resize-none rounded-xl border border-[#E3DACB] bg-white p-3 text-sm text-ink placeholder:text-muted/70 focus:border-gold"
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            className="rounded-xl bg-cta px-5 py-3 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Assistant({ m }) {
  // Explicit transport/error state.
  if (m.error) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[#EAC4BC] bg-[#FBE6E0] px-4 py-3 text-sm text-[#9A3412] shadow-card">
          {m.content}
        </div>
      </div>
    );
  }

  // Defensive: treat as "not in KB" if the backend says so OR the answer text
  // matches the grounding prompt's fallback line (works even if `grounded` is absent).
  const notInKb =
    m.grounded === false ||
    (m.content || "").toLowerCase().includes("find anything about that in the knowledge base");

  if (notInKb) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[#EAD8B8] bg-[#FBF3E2] px-4 py-3 text-sm text-[#7A521A] shadow-card">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide">
            Not in the knowledge base
          </div>
          {m.content}
          {typeof m.topSimilarity === "number" && (
            <div className="mt-2 text-[11px] text-[#9C7B45]">
              best match {Math.round(m.topSimilarity * 100)}% — below threshold
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-ink shadow-card">
        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
        {m.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#EFE7DA] pt-2.5">
            {m.citations.map((c) => (
              <span
                key={c.n}
                title={`${c.source} · ${Math.round(c.similarity * 100)}% match`}
                className="inline-flex items-center gap-1 rounded-md bg-[#EFE7DA] px-2 py-0.5 text-[11px] font-medium text-coffee"
              >
                [{c.n}] {c.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
