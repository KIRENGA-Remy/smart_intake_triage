const TABS = [
  { id: "intake", label: "Intake Triage" },
  { id: "knowledge", label: "Knowledge Assistant" },
  { id: "queue", label: "Triage Queue" },
];

export default function TopNav({ tab, onTab, theme, onToggleTheme }) {
  return (
    <header className="relative z-[100] flex h-14 flex-shrink-0 items-center justify-between border-b border-line bg-[var(--nav-bg)] px-5 backdrop-blur-lg">
      <div className="flex min-w-[120px] flex-shrink-0 items-center gap-2.5 md:min-w-[160px]">
        <a href="#" onClick={(e) => e.preventDefault()} className="no-underline">
          <div className="font-display text-[17px] font-extrabold tracking-[0.3px] text-tprimary">
            Mine<span className="text-accent">AI</span>
          </div>
        </a>
      </div>

      <div className="flex flex-1 justify-center">
        <nav className="flex gap-1 sm:gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition-colors sm:px-4 ${
                tab === t.id
                  ? "bg-[rgba(201,168,106,0.14)] text-accent"
                  : "text-tsecondary hover:bg-[rgba(201,168,106,0.10)] hover:text-tprimary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex min-w-[120px] flex-shrink-0 items-center justify-end gap-2.5 md:min-w-[160px]">
        <div className="flex items-center gap-2 rounded-full border border-line py-[5px] pl-1.5 pr-3">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent2),var(--accent))] text-[11px] font-bold text-white">
            MO
          </div>
          <span className="hidden text-[13px] font-semibold text-tprimary sm:block">
            Mine Operator
          </span>
        </div>
      </div>
    </header>
  );
}
