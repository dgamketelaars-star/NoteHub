import { useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Attachment, type AttachmentOwnerType } from '../db';
import { ATTACHMENT_ACCEPT, addAttachments, formatFileSize, isImageAttachment, removeAttachment } from '../lib/attachments';
import { FileIcon, PaperclipIcon, TrashIcon } from './icons';

function AttachmentThumb({ attachment, accentVar }: { attachment: Attachment; accentVar: string }) {
  const url = useMemo(() => URL.createObjectURL(attachment.blob), [attachment.blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`‘${attachment.name}’ verwijderen?`)) return;
    await removeAttachment(attachment.id);
  }

  if (isImageAttachment(attachment.mimeType)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-(--color-line)"
      >
        <img src={url} alt={attachment.name} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`${attachment.name} verwijderen`}
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-(--color-ink-muted) shadow-sm"
        >
          <TrashIcon />
        </button>
      </a>
    );
  }

  return (
    <a
      href={url}
      download={attachment.name}
      className="flex max-w-[12rem] items-center gap-2 rounded-xl border border-(--color-line) bg-white py-2 pr-2 pl-3 text-sm"
    >
      <span style={{ color: `var(${accentVar})` }}>
        <FileIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-(--color-ink)">{attachment.name}</span>
        <span className="block text-xs text-(--color-ink-muted)">{formatFileSize(attachment.size)}</span>
      </span>
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`${attachment.name} verwijderen`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--color-ink-muted)"
      >
        <TrashIcon />
      </button>
    </a>
  );
}

export function AttachmentField({
  ownerType,
  ownerId,
  ensureOwnerId,
  accentVar,
  compact,
}: {
  ownerType: AttachmentOwnerType;
  ownerId: number | undefined;
  /** Persists the owning note/todo if it doesn't exist yet, and returns its id. */
  ensureOwnerId: () => Promise<number | undefined>;
  accentVar: string;
  /** Smaller "add bijlage" affordance for tight spaces like a to-do row. */
  compact?: boolean;
}) {
  const attachments = useLiveQuery(
    () => (ownerId === undefined ? [] : db.attachments.where('[ownerType+ownerId]').equals([ownerType, ownerId]).toArray()),
    [ownerType, ownerId],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    const id = await ensureOwnerId();
    if (id === undefined) return;
    await addAttachments(ownerType, id, files);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {attachments?.map((a) => (
        <AttachmentThumb key={a.id} attachment={a} accentVar={accentVar} />
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={
          compact
            ? 'flex h-9 w-9 items-center justify-center rounded-full text-(--color-ink-muted)'
            : 'flex items-center gap-2 rounded-xl border border-dashed border-(--color-line) px-3 py-2 text-sm text-(--color-ink-muted)'
        }
        aria-label="Bijlage toevoegen"
      >
        <PaperclipIcon />
        {!compact && <span>Bijlage toevoegen</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => {
          // Snapshot the files synchronously: resetting e.target.value below
          // (needed so selecting the same file twice still fires onChange)
          // empties the live FileList, so it must not be read after an await.
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = '';
          handleFiles(files);
        }}
      />
    </div>
  );
}

/** Subtle "has attachments" indicator for list/row views. Renders nothing when there are none. */
export function AttachmentCountBadge({ ownerType, ownerId }: { ownerType: AttachmentOwnerType; ownerId: number }) {
  const count = useLiveQuery(
    () => db.attachments.where('[ownerType+ownerId]').equals([ownerType, ownerId]).count(),
    [ownerType, ownerId],
  );
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-(--color-ink-muted)">
      <PaperclipIcon />
      {count}
    </span>
  );
}
