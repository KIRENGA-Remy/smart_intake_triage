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
    <div className="relative z-[2] flex flex-shrink-0 flex-col items-center border-t border-line bg-[var(--nav-bg)] px-5 pb-5 pt-4 backdrop-blur-xl">
      <div className="flex w-full max-w-chat items-end gap-2.5 rounded-2xl border border-line bg-inputbg px-3.5 py-3 transition-shadow focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(201,168,106,0.12)]">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder={MODE_COPY[mode].placeholder}
          onChange={autoResize}
          onKeyDown={onKeyDown}
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-[14px] leading-normal text-tprimary focus:outline-none outline-none placeholder:text-tmuted"
        />
        <button
          onClick={submit}
          disabled={sending || !text.trim()}
          title="Send"
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--accent2),var(--accent))] text-[15px] text-[#1A1511] transition-transform hover:enabled:scale-105 disabled:cursor-not-allowed disabled:opacity-45"
        >
          ➤
        </button>
      </div>
      <div className="mt-2 text-center text-[11px] text-tmuted">
        TriageDesk runs a self-hosted model and can make mistakes. Verify critical operational
        decisions.
      </div>
    </div>
  );
}
