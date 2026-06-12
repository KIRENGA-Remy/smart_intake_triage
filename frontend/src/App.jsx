import { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Chat from "./components/Chat.jsx";
import Composer from "./components/Composer.jsx";
import TriageQueue from "./components/TriageQueue.jsx";
import { createTriage, ask } from "./lib/api.js";
import { loadSessions, saveSessions, uid } from "./lib/constants.js";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [tab, setTab] = useState("intake"); // intake | knowledge | queue
  const [sessions, setSessions] = useState(() => loadSessions());
  const [currentId, setCurrentId] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentId) || null,
    [sessions, currentId]
  );
  const messages = currentSession?.messages || [];

  function newSession() {
    setCurrentId(null);
    if (tab === "queue") setTab("intake");
  }

  function selectSession(id) {
    setCurrentId(id);
    const s = sessions.find((x) => x.id === id);
    if (s && (s.mode === "intake" || s.mode === "knowledge")) setTab(s.mode);
  }

  async function handleSend(text) {
    const kind = tab === "knowledge" ? "knowledge" : "intake";
    const userMsg = { id: uid(), role: "user", kind, text };

    let sessionId = currentId;
    const isNew = !sessionId;
    if (isNew) sessionId = uid();

    setSessions((prev) => {
      if (isNew) {
        return [
          {
            id: sessionId,
            title: text.length > 60 ? text.slice(0, 60) + "…" : text,
            mode: kind,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [userMsg],
          },
          ...prev,
        ];
      }
      return prev.map((s) =>
        s.id === sessionId
          ? { ...s, mode: kind, updatedAt: Date.now(), messages: [...s.messages, userMsg] }
          : s
      );
    });
    if (isNew) setCurrentId(sessionId);

    setSending(true);
    try {
      let assistant;
      if (kind === "intake") {
        const t = await createTriage(text);
        assistant = { id: uid(), role: "assistant", kind: "intake", triage: t };
      } else {
        const r = await ask(text);
        assistant = {
          id: uid(),
          role: "assistant",
          kind: "knowledge",
          answer: r.answer,
          grounded: r.grounded,
          citations: r.citations || [],
          topSimilarity: r.topSimilarity,
        };
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistant] }
            : s
        )
      );
    } catch (e) {
      const errMsg = {
        id: uid(),
        role: "assistant",
        kind: "error",
        text: `Request failed — ${e.message}. Is the backend running on :4321 (with CORS enabled)?`,
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, errMsg] } : s))
      );
    } finally {
      setSending(false);
    }
  }

  const chatMode = tab === "knowledge" ? "knowledge" : "intake";

  return (
    <div className="flex h-screen flex-col">
      <TopNav
        tab={tab}
        onTab={setTab}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessions={sessions}
          currentId={currentId}
          onSelect={selectSession}
          onNew={newSession}
        />
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {tab === "queue" ? (
            <TriageQueue />
          ) : (
            <>
              <div className="absolute inset-0 z-0 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat" />
              <div className="absolute inset-0 z-[1] bg-[var(--overlay)] backdrop-blur-[1px]" />
              <Chat mode={chatMode} messages={messages} sending={sending} onStarter={handleSend} />
              <Composer mode={chatMode} onSend={handleSend} sending={sending} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
