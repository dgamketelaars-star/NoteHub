import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { TrashIcon } from '../../components/icons';
import { todayISO } from '../../lib/date';

export function BirthdayEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;
  const existing = useLiveQuery(() => (isNew ? undefined : db.birthdays.get(Number(id))), [id]);

  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [yearUnknown, setYearUnknown] = useState(false);
  const [note, setNote] = useState('');
  const [reminder, setReminder] = useState(true);
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !loaded) {
      setName(existing.name);
      setDate(existing.date);
      setYearUnknown(existing.yearUnknown);
      setNote(existing.note);
      setReminder(existing.reminder);
      setLoaded(true);
    }
  }, [existing, isNew, loaded]);

  async function handleSave() {
    if (!name.trim()) return;
    if (isNew) {
      await db.birthdays.add({
        name: name.trim(),
        date,
        yearUnknown,
        note: note.trim(),
        reminder,
        createdAt: new Date().toISOString(),
      } as never);
    } else {
      await db.birthdays.update(Number(id), { name: name.trim(), date, yearUnknown, note: note.trim(), reminder });
    }
    navigate('/verjaardagen', { replace: true });
  }

  async function handleDelete() {
    if (!confirm('Deze verjaardag verwijderen?')) return;
    await db.birthdays.delete(Number(id));
    navigate('/verjaardagen', { replace: true });
  }

  return (
    <Page>
      <PageHeader
        title={isNew ? 'Nieuwe verjaardag' : 'Verjaardag bewerken'}
        accentClass="text-(--color-birthdays-accent)"
        action={
          !isNew && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Verwijderen"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-(--color-ink-muted) shadow-sm active:scale-95"
            >
              <TrashIcon />
            </button>
          )
        }
      />

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Naam</span>
          <input
            autoFocus={isNew}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-birthdays-accent)"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Geboortedatum</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-birthdays-accent)"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl bg-white p-4">
          <input
            type="checkbox"
            checked={yearUnknown}
            onChange={(e) => setYearUnknown(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-sm text-(--color-ink)">Geboortejaar onbekend (kies dan een willekeurig jaar hierboven)</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--color-ink-muted)">Notitie (optioneel)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none focus:border-(--color-birthdays-accent)"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl bg-white p-4">
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-sm text-(--color-ink)">Herinner mij hieraan</span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="mt-2 rounded-full bg-(--color-birthdays-accent) py-3.5 font-medium text-white disabled:opacity-40"
        >
          Opslaan
        </button>
      </div>
    </Page>
  );
}
