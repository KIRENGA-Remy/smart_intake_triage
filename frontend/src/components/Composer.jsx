import { useRef, useState } from "react";
import { MODE_COPY } from "../lib/constants.js";

export default function Composer({ mode, onSend, sending }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  function submit() {
    const v = text.trim();
    if (!v || sending) return;
    onSend(v);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoResize(e) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder={MODE_COPY[mode].placeholder}
          onChange={autoResize}
          onKeyDown={onKeyDown}
        />
        <button className="send-btn" onClick={submit} disabled={sending || !text.trim()} title="Send">
          ➤
        </button>
      </div>
      <div className="input-hint">
        MineAI runs a self-hosted model and can make mistakes. Verify critical operational
        decisions with your team.
      </div>
    </div>
  );
}
