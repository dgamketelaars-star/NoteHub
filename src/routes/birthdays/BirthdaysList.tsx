import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { fromISODate, startOfDay } from '../../lib/date';

function daysUntilNextOccurrence(dateISO: string, today: Date): { days: number; turningAge: number | null } {
  const birth = fromISODate(dateISO);
  const todayStart = startOfDay(today);
  let next = new Date(todayStart.getFullYear(), birth.getMonth(), birth.getDate());
  if (next.getTime() < todayStart.getTime()) {
    next = new Date(todayStart.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const days = Math.round((next.getTime() - todayStart.getTime()) / 86_400_000);
  const turningAge = next.getFullYear() - birth.getFullYear();
  return { days, turningAge };
}

function relativeLabel(days: number): string {
  if (days === 0) return 'vandaag';
  if (days === 1) return 'morgen';
  return `over ${days} dagen`;
}

export function BirthdaysList() {
  const birthdays = useLiveQuery(() => db.birthdays.toArray(), []);

  const sorted = useMemo(() => {
    const today = new Date();
    return (birthdays ?? [])
      .map((b) => ({ ...b, ...daysUntilNextOccurrence(b.date, today) }))
      .sort((a, b) => a.days - b.days);
  }, [birthdays]);

  return (
    <Page>
      <PageHeader title="Verjaardagen" accentClass="text-(--color-birthdays-accent)" />

      {birthdays && birthdays.length === 0 && (
        <EmptyState text="Nog geen verjaardagen. Tik op ‘Nieuwe verjaardag’ om te beginnen." />
      )}

      <ul className="flex flex-col gap-2">
        {sorted.map((b) => (
          <li key={b.id}>
            <Link
              to={`/verjaardagen/${b.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm active:scale-[0.99]"
            >
              <span>
                <span className="block font-medium text-(--color-ink)">{b.name}</span>
                {!b.yearUnknown && (
                  <span className="block text-xs text-(--color-ink-muted)">wordt {b.turningAge} jaar</span>
                )}
              </span>
              <span className="shrink-0 text-sm font-medium text-(--color-birthdays-accent)">
                {relativeLabel(b.days)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Fab to="/verjaardagen/nieuw" label="Nieuwe verjaardag" accentVar="--color-birthdays-accent" />
    </Page>
  );
}
