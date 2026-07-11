import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ReminderOption } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { TrashIcon } from '../../components/icons';

const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: 'none', label: 'Geen herinnering' },
  { value: '1h', label: '1 uur van tevoren' },
  { value: 'evening', label: 'De avond ervoor' },
  { value: 'both', label: 'Beide' },
];

export function AgendaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = useLiveQuery(() => db.agendaItems.get(Number(id)), [id]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState<ReminderOption>('none');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (item && !loaded) {
      setTitle(item.title);
      setDate(item.date);
      setTime(item.time ?? '');
      setReminder(item.reminder);
      setLoaded(true);
    }
  }, [item, loaded]);

  if (item === undefined) return null;
  if (item === null) {
    return (
      <Page>
        <PageHeader title="Afspraak" accentClass="text-(--color-agenda-accent)" />
        <p className="text-(--color-ink-muted)">Deze afspraak bestaat niet meer.</p>
      </Page>
    );
  }

  async function handleSave() {
    await db.agendaItems.update(Number(id), {
      title: title.trim() || 'Afspraak',
      date,
      time: time || null,
      reminder,
    });
    navigate('/agenda', { replace: true });
  }

  async function handleDelete() {
    if (!confirm('Deze afspraak verwijderen?')) return;
    await db.agendaItems.delete(Number(id));
    navigate('/agenda', { replace: true });
  }

  return (
    <Page>
      <PageHeader
        title="Afspraak bewerken"
        accentClass="text-(--color-agenda-accent)"
        action={
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Verwijderen"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-(--color-ink-muted) shadow-sm active:scale-95"
          >
            <TrashIcon />
          </button>
        }
      />

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Titel</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-agenda-accent)"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Datum</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-agenda-accent)"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Tijd (optioneel)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-agenda-accent)"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Reminder</span>
          {REMINDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReminder(opt.value)}
              className={`rounded-2xl border p-4 text-left ${
                reminder === opt.value
                  ? 'border-(--color-agenda-accent) bg-(--color-agenda-bg)'
                  : 'border-(--color-line) bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-2 rounded-full bg-(--color-agenda-accent) py-3.5 font-medium text-white"
        >
          Opslaan
        </button>
      </div>
    </Page>
  );
}
