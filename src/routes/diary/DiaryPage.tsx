import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { TrashIcon } from '../../components/icons';
import { formatDateNL, todayISO } from '../../lib/date';

function DiaryEntryCard({ entry }: { entry: { id: number; text: string } }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);

  async function save() {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed && trimmed !== entry.text) {
      await db.diaryEntries.update(entry.id, { text: trimmed });
    } else if (!trimmed) {
      setText(entry.text);
    }
  }

  async function remove() {
    if (!confirm('Deze dagboeknotitie verwijderen?')) return;
    await db.diaryEntries.delete(entry.id);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          rows={4}
          className="w-full resize-none text-base outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="block w-full whitespace-pre-wrap text-left text-base text-(--color-ink)">
          {entry.text}
        </button>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={remove}
          aria-label="Verwijderen"
          className="flex h-9 w-9 items-center justify-center rounded-full text-(--color-ink-muted)"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export function DiaryPage() {
  const entries = useLiveQuery(() => db.diaryEntries.toArray(), []);
  const [date, setDate] = useState(todayISO());
  const [text, setText] = useState('');

  const grouped = useMemo(() => {
    const sorted = (entries ?? []).slice().sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
    const groups: { date: string; items: typeof sorted }[] = [];
    for (const e of sorted) {
      const last = groups[groups.length - 1];
      if (last && last.date === e.date) last.items.push(e);
      else groups.push({ date: e.date, items: [e] });
    }
    return groups;
  }, [entries]);

  async function addEntry() {
    const trimmed = text.trim();
    if (!trimmed) return;
    await db.diaryEntries.add({ date, text: trimmed, createdAt: new Date().toISOString() } as never);
    setText('');
  }

  return (
    <Page>
      <PageHeader title="Dagboek" accentClass="text-(--color-diary-accent)" />

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="self-start rounded-xl border border-(--color-line) px-3 py-2 text-sm outline-none"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hoe was je dag?"
          rows={4}
          className="rounded-xl border border-(--color-line) p-3 text-base outline-none focus:border-(--color-diary-accent)"
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={!text.trim()}
          className="rounded-full bg-(--color-diary-accent) py-3 font-medium text-white disabled:opacity-40"
        >
          Opslaan
        </button>
      </div>

      {entries && entries.length === 0 && <EmptyState text="Nog geen dagboeknotities." />}

      {grouped.map((group) => (
        <section key={group.date} className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-(--color-ink-muted)">
            {formatDateNL(group.date, { withWeekday: true })}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((e) => (
              <DiaryEntryCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      ))}
    </Page>
  );
}
