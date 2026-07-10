import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  accentClass,
  accentVar,
  action,
}: {
  title: string;
  /** Literal Tailwind class, e.g. "text-(--color-agenda-accent)". Must be a static string. */
  accentClass?: string;
  /** CSS custom property name, e.g. "--color-notes-accent", applied via inline style. Use when the color is only known at runtime. */
  accentVar?: string;
  action?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 bg-(--color-paper)/95 px-4 py-4 backdrop-blur"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Terug"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl text-(--color-ink) shadow-sm active:scale-95"
      >
        ←
      </button>
      <h1
        className={`flex-1 truncate text-xl font-semibold ${accentVar ? '' : (accentClass ?? 'text-(--color-ink)')}`}
        style={accentVar ? { color: `var(${accentVar})` } : undefined}
      >
        {title}
      </h1>
      {action}
    </header>
  );
}
