import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function CategoryTile({
  to,
  label,
  bgVar,
  accentVar,
  icon,
  subtitle,
}: {
  to: string;
  label: string;
  bgVar: string;
  accentVar: string;
  icon: ReactNode;
  subtitle?: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-28 flex-col justify-between gap-3 rounded-3xl p-5 shadow-sm transition active:scale-[0.98]"
      style={{ backgroundColor: `var(${bgVar})` }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-2xl"
        style={{ color: `var(${accentVar})` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>
        <span className="block text-lg font-semibold" style={{ color: `var(${accentVar})` }}>
          {label}
        </span>
        {subtitle && <span className="block text-sm text-(--color-ink-muted)">{subtitle}</span>}
      </span>
    </Link>
  );
}
