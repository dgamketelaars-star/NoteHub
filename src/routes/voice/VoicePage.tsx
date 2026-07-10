import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type VoiceMemo } from '../../db';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { TrashIcon } from '../../components/icons';

const RECORDING_SUPPORTED =
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return '';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function MemoRow({ memo }: { memo: VoiceMemo }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(memo.name);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = useMemo(() => URL.createObjectURL(memo.blob), [memo.blob]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  async function saveName() {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== memo.name) {
      await db.voiceMemos.update(memo.id, { name: trimmed });
    } else {
      setName(memo.name);
    }
  }

  async function remove() {
    if (!confirm('Deze opname verwijderen?')) return;
    await db.voiceMemos.delete(memo.id);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pauzeren' : 'Afspelen'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: 'var(--color-voice-accent)' }}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z" /></svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            className="w-full rounded-lg border border-(--color-line) px-2 py-1 text-base outline-none"
          />
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="block truncate text-left font-medium text-(--color-ink)">
            {memo.name}
          </button>
        )}
        <p className="text-xs text-(--color-ink-muted)">
          {formatDate(memo.createdAt)} · {formatDuration(memo.duration)}
        </p>
      </div>

      <button
        type="button"
        onClick={remove}
        aria-label="Verwijderen"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--color-ink-muted)"
      >
        <TrashIcon />
      </button>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </li>
  );
}

export function VoicePage() {
  const memos = useLiveQuery(() => db.voiceMemos.orderBy('createdAt').reverse().toArray(), []);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const count = (await db.voiceMemos.count()) + 1;
        await db.voiceMemos.add({
          name: `Voice memo ${count}`,
          blob,
          mimeType: mimeType || 'audio/webm',
          duration: elapsedRef.current,
          createdAt: new Date().toISOString(),
        } as never);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start();
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
      setRecording(true);
    } catch {
      setPermissionError(
        'Geen toegang tot de microfoon. Controleer of je browser toestemming heeft, of gebruik een andere browser.',
      );
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <Page>
      <PageHeader title="Voice memo's" accentClass="text-(--color-voice-accent)" />

      {!RECORDING_SUPPORTED && (
        <p className="mb-4 rounded-2xl bg-white p-4 text-sm text-(--color-ink-muted)">
          Opnemen wordt niet ondersteund in deze browser. Bestaande opnames kun je hieronder nog wel beluisteren.
        </p>
      )}

      {permissionError && (
        <p className="mb-4 rounded-2xl bg-white p-4 text-sm text-(--color-ink-muted)">{permissionError}</p>
      )}

      {RECORDING_SUPPORTED && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-label={recording ? 'Stop opname' : 'Start opname'}
            className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-md active:scale-95 ${recording ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: 'var(--color-voice-accent)' }}
          >
            {recording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" /></svg>
            )}
          </button>
          <p className="text-sm text-(--color-ink-muted)">
            {recording ? `Opname bezig… ${formatDuration(elapsed)}` : 'Tik om een opname te starten'}
          </p>
        </div>
      )}

      {memos && memos.length === 0 && <EmptyState text="Nog geen opnames." />}

      <ul className="flex flex-col gap-2">
        {memos?.map((memo) => (
          <MemoRow key={memo.id} memo={memo} />
        ))}
      </ul>
    </Page>
  );
}
