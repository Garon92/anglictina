import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';

/* ─── Page header with back link ──────────────────────────────────── */

export function PageHeader({
  title,
  subtitle,
  back = '/practice',
  backLabel,
  icon,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Path of the parent screen; `null` hides the link. */
  back?: string | null;
  backLabel?: string;
  icon?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5">
      {back !== null && <BackLink to={back} label={backLabel} />}
      <div className="flex items-start gap-3">
        {icon && <span className="tile-icon mt-0.5" aria-hidden="true">{icon}</span>}
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

const BACK_LABELS: Record<string, string> = {
  '/': 'Dnes',
  '/practice': 'Procvičování',
  '/exam': 'Maturita',
  '/review': 'Pokrok',
};

const BACK_CLS = '-ml-2 mb-2 inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-bold text-muted no-underline hover:bg-surface-2 hover:text-fg';
const BACK_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

/** Back link to a parent route, or — with `onClick` — a back button inside a page (e.g. from a detail view). */
export function BackLink({ to, label, onClick }: { to?: string; label?: string; onClick?: () => void }) {
  if (onClick || !to) {
    return (
      <button type="button" className={BACK_CLS} onClick={onClick}>
        {BACK_ICON}
        {label ?? 'Zpět'}
      </button>
    );
  }
  return (
    <Link to={to} className={BACK_CLS}>
      {BACK_ICON}
      {label ?? BACK_LABELS[to] ?? 'Zpět'}
    </Link>
  );
}

/* ─── Progress ────────────────────────────────────────────────────── */

export function ProgressBar({ value, max = 1, className = '', tone = 'accent', label }: {
  value: number;
  max?: number;
  className?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  label?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = tone === 'accent' ? 'var(--accent)' : `var(--g92-${tone})`;
  return (
    <div
      className={`bar ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Ring({ value, size = 88, stroke = 9, children, tone = 'accent', label }: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  children?: ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const color = tone === 'accent' ? 'var(--accent)' : `var(--g92-${tone})`;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--g92-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 600ms var(--g92-ease-out)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ─── Stars ───────────────────────────────────────────────────────── */

export function starsFor(ratio: number): 0 | 1 | 2 | 3 {
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

export function Stars({ count, max = 3, size = 'md', animate = false }: { count: number; max?: number; size?: 'md' | 'lg'; animate?: boolean }) {
  const dim = size === 'lg' ? 40 : 22;
  return (
    <div className="flex items-center justify-center gap-1.5" role="img" aria-label={`${count} z ${max} hvězd`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={dim}
          height={dim}
          aria-hidden="true"
          className={animate && i < count ? 'animate-pop' : ''}
          style={animate ? { animationDelay: `${i * 140}ms` } : undefined}
        >
          <path
            d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.1l-5.6 3 1.1-6.3L2.9 9.4l6.3-.9z"
            fill={i < count ? 'var(--g92-gold)' : 'var(--g92-surface-3)'}
            stroke={i < count ? 'color-mix(in srgb, var(--g92-gold) 70%, black)' : 'none'}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ─── Stat tile ───────────────────────────────────────────────────── */

export function StatTile({ value, label, icon, tone }: { value: ReactNode; label: string; icon?: string; tone?: 'success' | 'warning' | 'danger' | 'accent' }) {
  const color = tone === 'accent' ? 'text-accent-text' : tone ? `text-${tone}` : 'text-fg';
  return (
    <div className="card !p-3 text-center">
      {icon && <div className="mb-0.5 text-lg" aria-hidden="true">{icon}</div>}
      <div className={`text-xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────── */

export function EmptyState({ icon, title, children, action }: { icon: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 !py-10 text-center">
      <div className="text-5xl" aria-hidden="true">{icon}</div>
      <h2 className="text-lg font-black text-fg">{title}</h2>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ─── Module card ─────────────────────────────────────────────────── */

export function ModuleCard({ to, icon, title, desc, meta, accuracy }: {
  to: string;
  icon: string;
  title: string;
  desc?: string;
  meta?: ReactNode;
  /** 0..1 accuracy dot */
  accuracy?: number;
}) {
  return (
    <Link to={to} className="card card-link flex items-center gap-3 !p-3 no-underline">
      <span className="tile-icon" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight text-fg">{title}</span>
        {desc && <span className="block truncate text-xs text-muted">{desc}</span>}
      </span>
      {meta && <span className="shrink-0 text-xs text-muted">{meta}</span>}
      {accuracy !== undefined && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: accuracy >= 0.8 ? 'var(--g92-success)' : accuracy >= 0.6 ? 'var(--g92-warning)' : 'var(--g92-danger)' }}
          title={`Úspěšnost ${Math.round(accuracy * 100)} %`}
          aria-label={`Úspěšnost ${Math.round(accuracy * 100)} %`}
        />
      )}
    </Link>
  );
}

/* ─── Segmented control ───────────────────────────────────────────── */

export function Segmented<T extends string>({ value, options, onChange, label, size = 'md' }: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`g92-chip ${size === 'sm' ? '!min-h-[36px] !text-xs' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Misc ────────────────────────────────────────────────────────── */

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="g92-kbd">{children}</kbd>;
}

export function SpeakButton({ onClick, label = 'Přehrát výslovnost', size = 'md' }: { onClick: () => void; label?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 56 : size === 'sm' ? 36 : 44;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid shrink-0 place-items-center rounded-full bg-accent-soft text-accent-text transition-transform hover:scale-105 active:scale-95"
      style={{ width: dim, height: dim }}
    >
      <svg viewBox="0 0 24 24" width={dim * 0.45} height={dim * 0.45} fill="currentColor" aria-hidden="true">
        <path d="M11 4.5 6.5 8.5H3.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3l4.5 4a.6.6 0 0 0 1-.45V4.95a.6.6 0 0 0-1-.45z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.3 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Navigate back helper for "Hotovo" buttons. */
export function useGoTo() {
  const navigate = useNavigate();
  return (to: string) => navigate(to);
}
