import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Todo, type TodoBucket } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { AttachmentField } from '../../components/AttachmentField';
import { PaperclipIcon, TrashIcon } from '../../components/icons';
import { removeAttachmentsForOwner } from '../../lib/attachments';

const BUCKETS: { value: TodoBucket; label: string }[] = [
  { value: 'today', label: 'Vandaag' },
  { value: 'week', label: 'Deze week' },
  { value: 'anytime', label: 'Tijdloos' },
];

function TodoRow({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [showAttachments, setShowAttachments] = useState(false);
  const attachmentCount = useLiveQuery(
    () => db.attachments.where('[ownerType+ownerId]').equals(['todo', todo.id]).count(),
    [todo.id],
  );

  async function toggle() {
    await db.todos.update(todo.id, { done: !todo.done });
  }

  async function saveEdit() {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed && trimmed !== todo.text) {
      await db.todos.update(todo.id, { text: trimmed });
    } else {
      setText(todo.text);
    }
  }

  async function remove() {
    if (!confirm('Deze taak verwijderen?')) return;
    await db.todos.delete(todo.id);
    await removeAttachmentsForOwner('todo', todo.id);
  }

  return (
    <li className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={todo.done ? 'Markeer als niet klaar' : 'Markeer als klaar'}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
            todo.done ? 'border-(--color-todo-accent) bg-(--color-todo-accent)' : 'border-(--color-line)'
          }`}
        >
          {todo.done && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M4 12.5l5 5L20 6" />
            </svg>
          )}
        </button>

        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            className="flex-1 rounded-xl border border-(--color-line) px-2 py-1 text-base outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`flex-1 text-left text-base ${todo.done ? 'text-(--color-ink-muted) line-through' : 'text-(--color-ink)'}`}
          >
            {todo.text}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowAttachments((v) => !v)}
          aria-label="Bijlagen"
          className={`flex h-9 items-center gap-1 rounded-full px-2 ${
            attachmentCount ? 'text-(--color-todo-accent)' : 'text-(--color-ink-muted)'
          }`}
        >
          <PaperclipIcon />
          {!!attachmentCount && <span className="text-xs font-medium">{attachmentCount}</span>}
        </button>

        <button
          type="button"
          onClick={remove}
          aria-label="Verwijderen"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--color-ink-muted)"
        >
          <TrashIcon />
        </button>
      </div>

      {showAttachments && (
        <div className="border-t border-(--color-line) p-4 pt-3">
          <AttachmentField
            ownerType="todo"
            ownerId={todo.id}
            ensureOwnerId={async () => todo.id}
            accentVar="--color-todo-accent"
          />
        </div>
      )}
    </li>
  );
}

export function TodoPage() {
  const todos = useLiveQuery(() => db.todos.toArray(), []);
  const [newText, setNewText] = useState('');
  const [newBucket, setNewBucket] = useState<TodoBucket>('today');

  async function addTodo() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    await db.todos.add({
      text: trimmed,
      bucket: newBucket,
      done: false,
      createdAt: new Date().toISOString(),
    } as never);
    setNewText('');
  }

  return (
    <Page>
      <PageHeader title="To-do" accentClass="text-(--color-todo-accent)" />

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Nieuwe taak…"
          className="rounded-xl border border-(--color-line) p-3 text-base outline-none focus:border-(--color-todo-accent)"
        />
        <div className="flex gap-2">
          {BUCKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setNewBucket(b.value)}
              className={`flex-1 rounded-full border py-2 text-sm ${
                newBucket === b.value
                  ? 'border-(--color-todo-accent) bg-(--color-todo-bg) font-medium'
                  : 'border-(--color-line) text-(--color-ink-muted)'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={addTodo}
          disabled={!newText.trim()}
          className="rounded-full bg-(--color-todo-accent) py-3 font-medium text-white disabled:opacity-40"
        >
          Toevoegen
        </button>
      </div>

      {todos && todos.length === 0 && <EmptyState text="Nog geen taken. Voeg je eerste taak toe." />}

      {BUCKETS.map((b) => {
        const items = (todos ?? [])
          .filter((t) => t.bucket === b.value)
          .sort((a, b2) => Number(a.done) - Number(b2.done) || a.createdAt.localeCompare(b2.createdAt));
        if (items.length === 0) return null;
        return (
          <section key={b.value} className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-(--color-ink-muted)">{b.label}</h2>
            <ul className="flex flex-col gap-2">
              {items.map((t) => (
                <TodoRow key={t.id} todo={t} />
              ))}
            </ul>
          </section>
        );
      })}
    </Page>
  );
}
