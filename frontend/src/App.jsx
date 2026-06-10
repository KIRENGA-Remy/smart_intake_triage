import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import TriagePage from "./components/TriagePage.jsx";
import ChatPage from "./components/ChatPage.jsx";

export default function App() {
  const [tab, setTab] = useState("triage");

  return (
    <div className="min-h-screen bg-cream">
      <Navbar active={tab} onChange={setTab} />
      {tab === "triage" ? <TriagePage /> : <ChatPage />}
    </div>
  );
}
