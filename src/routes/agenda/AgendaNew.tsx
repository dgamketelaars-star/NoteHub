import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type ReminderOption } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { parseAgendaText } from '../../lib/agendaParser';
import { formatDateNL, todayISO } from '../../lib/date';

const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: 'none', label: 'Geen herinnering' },
  { value: '1h', label: '1 uur van tevoren' },
  { value: 'evening', label: 'De avond ervoor' },
  { value: 'both', label: 'Beide' },
];

export function AgendaNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [raw, setRaw] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState<ReminderOption>('none');

  function handleParse() {
    const parsed = parseAgendaText(raw);
    setTitle(parsed.title || raw.trim());
    setDate(parsed.date ?? todayISO());
    setTime(parsed.time ?? '');
    setStep('confirm');
  }

  async function handleSave() {
    await db.agendaItems.add({
      title: title.trim() || 'Afspraak',
      date,
      time: time || null,
      reminder,
      createdAt: new Date().toISOString(),
    } as never);
    navigate('/agenda', { replace: true });
  }

  return (
    <Page>
      <PageHeader title="Nieuwe afspraak" accentClass="text-(--color-agenda-accent)" />

      {step === 'input' && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-(--color-ink-muted)">
              Schrijf je afspraak, bijv. "18 juli tandarts Afroditi om 11 uur"
            </span>
            <textarea
              autoFocus
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={3}
              className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-agenda-accent)"
              placeholder="Datum, tijd en waar het over gaat…"
            />
          </label>
          <button
            type="button"
            disabled={!raw.trim()}
            onClick={handleParse}
            className="rounded-full bg-(--color-agenda-accent) py-3.5 text-center font-medium text-white disabled:opacity-40"
          >
            Volgende
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--color-ink-muted)">Klopt dit? Je kan alles aanpassen.</p>

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

          <p className="text-sm text-(--color-ink-muted)">
            {formatDateNL(date, { withWeekday: true })}
            {time && ` om ${time}`}
          </p>

          <div className="mt-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-(--color-ink-muted)">Reminder instellen?</span>
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

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setStep('input')}
              className="flex-1 rounded-full border border-(--color-line) py-3.5 font-medium text-(--color-ink)"
            >
              Terug
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-full bg-(--color-agenda-accent) py-3.5 font-medium text-white"
            >
              Opslaan
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}
