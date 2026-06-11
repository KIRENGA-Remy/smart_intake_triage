const TABS = [
  { id: "intake", label: "Intake Triage" },
  { id: "knowledge", label: "Knowledge Assistant" },
  { id: "queue", label: "Triage Queue" },
];

export default function TopNav({ tab, onTab, theme, onToggleTheme }) {
  return (
    <header className="topnav">
      <div className="nav-left">
        <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>
          <div className="nav-logo-icon">⛏</div>
          <div className="nav-logo-text">
            Mine<span>Tech</span>
          </div>
        </a>
      </div>

      <div className="nav-center">
        <nav className="nav-links">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-link ${tab === t.id ? "active" : ""}`}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => onTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title="Toggle dark / light mode"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <div className="user-pill">
          <div className="user-avatar">MO</div>
          <span className="user-pill-name">Mine Operator</span>
        </div>
      </div>
    </header>
  );
}
