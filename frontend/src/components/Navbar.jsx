const TABS = [
  { id: "triage", label: "Intake Triage" },
  { id: "chat", label: "Knowledge Assistant" },
];

export default function Navbar({ active, onChange }) {
  return (
    <header className="bg-coffee-deep text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {/* Wordmark echoing the MineTech logo */}
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full border-2 border-gold">
            <span className="block h-1.5 w-3.5 rounded-full bg-gold" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-[0.14em] text-gold">
            MINETECH
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-gold/15 text-gold" : "text-cream/75 hover:text-cream"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <span className="hidden text-xs text-cream/50 sm:block">
          Self-hosted · Qwen2.5-3B
        </span>
      </div>
    </header>
  );
}
