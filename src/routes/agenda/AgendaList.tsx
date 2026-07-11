import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { formatDateNL, todayISO } from '../../lib/date';

export function AgendaList() {
  const items = useLiveQuery(() => db.agendaItems.toArray(), []);
  const [showPast, setShowPast] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const sorted = (items ?? []).slice().sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
    });
    const today = todayISO();
    return {
      upcoming: sorted.filter((i) => i.date >= today),
      past: sorted.filter((i) => i.date < today).reverse(),
    };
  }, [items]);

  let lastDate = '';

  return (
    <Page>
      <PageHeader title="Agenda" accentClass="text-(--color-agenda-accent)" />

      {items && items.length === 0 && <EmptyState text="Nog geen afspraken. Tik op ‘Nieuwe afspraak’ om te beginnen." />}

      <ul className="flex flex-col gap-2">
        {upcoming.map((item) => {
          const showHeader = item.date !== lastDate;
          lastDate = item.date;
          return (
            <li key={item.id}>
              {showHeader && (
                <p className="mt-3 mb-1 text-sm font-medium text-(--color-ink-muted)">
                  {formatDateNL(item.date, { withWeekday: true })}
                </p>
              )}
              <Link
                to={`/agenda/${item.id}`}
                replace
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm active:scale-[0.99]"
              >
                <span className="font-medium text-(--color-ink)">{item.title}</span>
                {item.time && <span className="shrink-0 text-(--color-agenda-accent)">{item.time}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {past.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-sm text-(--color-ink-muted) underline underline-offset-2"
          >
            {showPast ? 'Verberg eerdere afspraken' : `Eerdere afspraken tonen (${past.length})`}
          </button>
          {showPast && (
            <ul className="mt-3 flex flex-col gap-2 opacity-70">
              {past.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/agenda/${item.id}`}
                    replace
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm active:scale-[0.99]"
                  >
                    <span>
                      <span className="block text-xs text-(--color-ink-muted)">{formatDateNL(item.date)}</span>
                      <span className="font-medium text-(--color-ink)">{item.title}</span>
                    </span>
                    {item.time && <span className="shrink-0 text-(--color-ink-muted)">{item.time}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Fab to="/agenda/nieuw" label="Nieuwe afspraak" accentVar="--color-agenda-accent" />
    </Page>
  );
}
