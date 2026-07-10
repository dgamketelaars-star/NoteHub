import type { ReactNode } from 'react';

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-full max-w-xl px-4 pb-10" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
      {children}
    </div>
  );
}
