import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import type { EntityTable } from 'dexie';
import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { EmptyState } from './EmptyState';
import { Fab } from './Fab';
import { AttachmentCountBadge, AttachmentField } from './AttachmentField';
import { SearchIcon, TrashIcon } from './icons';
import { removeAttachmentsForOwner, type AttachmentOwnerType } from '../lib/attachments';

interface NotebookEntry {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookConfig {
  table: EntityTable<NotebookEntry, 'id'>;
  basePath: string; // e.g. "/notities"
  title: string; // e.g. "Notities"
  bgVar: string; // e.g. "--color-notes-bg"
  accentVar: string; // e.g. "--color-notes-accent"
  emptyText: string;
  newLabel: string;
  /** When set, entries of this type can carry file attachments (e.g. notes, but not ideas). */
  attachmentOwnerType?: AttachmentOwnerType;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function NotebookList(config: NotebookConfig) {
  const entries = useLiveQuery(() => config.table.orderBy('updatedAt').reverse().toArray(), []);
  const [query, setQuery] = useState('');

  const filtered = (entries ?? []).filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
  });

  return (
    <Page>
      <PageHeader title={config.title} accentVar={config.accentVar} />

      {entries && entries.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
          <span className="text-(--color-ink-muted)">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoeken…"
            className="flex-1 bg-transparent text-base outline-none"
          />
        </div>
      )}

      {entries && entries.length === 0 && <EmptyState text={config.emptyText} />}
      {entries && entries.length > 0 && filtered.length === 0 && <EmptyState text="Niets gevonden." />}

      <ul className="flex flex-col gap-2">
        {filtered.map((entry) => (
          <li key={entry.id}>
            <Link
              to={`${config.basePath}/${entry.id}`}
              replace
              className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm active:scale-[0.99]"
            >
              <p className="font-medium text-(--color-ink)">{entry.title || '(zonder titel)'}</p>
              {entry.body && <p className="mt-1 line-clamp-2 text-sm text-(--color-ink-muted)">{entry.body}</p>}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-(--color-ink-muted)">{formatDate(entry.updatedAt)}</p>
                {config.attachmentOwnerType && (
                  <AttachmentCountBadge ownerType={config.attachmentOwnerType} ownerId={entry.id} />
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Fab to={`${config.basePath}/nieuw`} label={config.newLabel} accentVar={config.accentVar} />
    </Page>
  );
}

export function NotebookEditor(config: NotebookConfig) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;
  const existing = useLiveQuery(() => (isNew ? undefined : config.table.get(Number(id))), [id]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loaded, setLoaded] = useState(isNew);
  // Tracks the row id once a new entry has been persisted, so later autosaves
  // update that row instead of inserting duplicates.
  const [entryId, setEntryId] = useState<number | undefined>(isNew ? undefined : Number(id));

  if (!isNew && existing && !loaded) {
    setTitle(existing.title);
    setBody(existing.body);
    setLoaded(true);
  }

  async function persist(force = false): Promise<number | undefined> {
    const now = new Date().toISOString();
    if (entryId === undefined) {
      if (!force && !title.trim() && !body.trim()) return undefined;
      const newId = await config.table.add({ title: title.trim(), body, createdAt: now, updatedAt: now } as never);
      setEntryId(newId as number);
      return newId as number;
    }
    await config.table.update(entryId, { title: title.trim(), body, updatedAt: now });
    return entryId;
  }

  async function handleDone() {
    await persist();
    navigate(config.basePath, { replace: true });
  }

  async function handleDelete() {
    if (entryId === undefined) {
      navigate(config.basePath, { replace: true });
      return;
    }
    if (!confirm('Verwijderen?')) return;
    await config.table.delete(entryId);
    if (config.attachmentOwnerType) {
      await removeAttachmentsForOwner(config.attachmentOwnerType, entryId);
    }
    navigate(config.basePath, { replace: true });
  }

  return (
    <Page>
      <PageHeader
        title={isNew && entryId === undefined ? config.newLabel : 'Bewerken'}
        accentVar={config.accentVar}
        action={
          entryId !== undefined && (
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

      <div className="flex flex-col gap-3">
        <input
          autoFocus={isNew}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => persist()}
          placeholder="Titel (optioneel)"
          className="rounded-2xl border border-(--color-line) bg-white p-4 text-lg font-medium outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => persist()}
          placeholder="Schrijf hier…"
          rows={10}
          className="rounded-2xl border border-(--color-line) bg-white p-4 text-base outline-none"
        />

        {config.attachmentOwnerType && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-(--color-ink-muted)">Bijlagen</span>
            <AttachmentField
              ownerType={config.attachmentOwnerType}
              ownerId={entryId}
              ensureOwnerId={() => persist(true)}
              accentVar={config.accentVar}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleDone}
          className="rounded-full py-3.5 font-medium text-white"
          style={{ backgroundColor: `var(${config.accentVar})` }}
        >
          Klaar
        </button>
      </div>
    </Page>
  );
}
