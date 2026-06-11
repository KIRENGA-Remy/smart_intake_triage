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
    <div className="chat-area">
      {empty ? (
        <div className="welcome">
          <div className="welcome-icon">⛏</div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <div className="suggestion-grid">
            {copy.starters.map((s) => (
              <button key={s} className="suggestion-card" onClick={() => onStarter(s)}>
                <div className="s-title">{s}</div>
                <div className="s-desc">
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
            <div className="message-wrapper">
              <div className="message ai">
                <div className="msg-avatar ai">M</div>
                <div className="msg-col">
                  <div className="msg-bubble">
                    <span className="typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
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
