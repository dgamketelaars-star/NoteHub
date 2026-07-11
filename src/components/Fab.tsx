import { Link } from 'react-router-dom';
import { PlusIcon } from './icons';

export function Fab({ to, label, accentVar }: { to: string; label: string; accentVar: string }) {
  return (
    <Link
      to={to}
      replace
      aria-label={label}
      className="fixed right-5 bottom-5 flex h-14 items-center gap-2 rounded-full px-5 text-white shadow-lg active:scale-95"
      style={{ backgroundColor: `var(${accentVar})`, bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      <PlusIcon />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
