import { groupByDate } from "../lib/constants.js";

export default function Sidebar({ sessions, currentId, onSelect, onNew }) {
  const groups = groupByDate(sessions);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-session-btn" onClick={onNew}>
          <span className="plus">+</span> New Analysis Session
        </button>
      </div>
      <div className="sidebar-section-label">Recent Sessions</div>

      <div className="history-list">
        {sessions.length === 0 ? (
          <div className="history-empty">
            No sessions yet. Ask something in Intake Triage or Knowledge Assistant and it will
            appear here.
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <div className="history-group-label">{g.label}</div>
              {g.items.map((s) => (
                <div
                  key={s.id}
                  className={`history-item ${s.id === currentId ? "active" : ""}`}
                  onClick={() => onSelect(s.id)}
                  title={s.title}
                >
                  <span className="dot" />
                  <span className="htxt">{s.title}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-sidebar">
          <div className="avatar-lg">MO</div>
          <div className="user-info">
            <div className="user-name">Mine Operator</div>
            <div className="user-plan">Self-hosted · Qwen2.5-3B</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
