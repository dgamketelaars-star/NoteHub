import { db } from '../db';

const EXPORT_VERSION = 1;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

export async function exportAllData(): Promise<Blob> {
  const [agendaItems, todos, notes, ideas, diaryEntries, voiceMemos, birthdays] = await Promise.all([
    db.agendaItems.toArray(),
    db.todos.toArray(),
    db.notes.toArray(),
    db.ideas.toArray(),
    db.diaryEntries.toArray(),
    db.voiceMemos.toArray(),
    db.birthdays.toArray(),
  ]);

  const voiceMemosEncoded = await Promise.all(
    voiceMemos.map(async (memo) => ({
      ...memo,
      blob: await blobToBase64(memo.blob),
    })),
  );

  const payload = {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    agendaItems,
    todos,
    notes,
    ideas,
    diaryEntries,
    voiceMemos: voiceMemosEncoded,
    birthdays,
  };

  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

export async function importAllData(file: File): Promise<{ imported: number }> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data || typeof data !== 'object' || !('exportVersion' in data)) {
    throw new Error('Dit bestand lijkt geen geldig export-bestand van Schrift te zijn.');
  }

  let imported = 0;

  await db.transaction(
    'rw',
    [db.agendaItems, db.todos, db.notes, db.ideas, db.diaryEntries, db.voiceMemos, db.birthdays],
    async () => {
      for (const item of data.agendaItems ?? []) {
        const { id: _id, ...rest } = item;
        await db.agendaItems.add(rest);
        imported++;
      }
      for (const item of data.todos ?? []) {
        const { id: _id, ...rest } = item;
        await db.todos.add(rest);
        imported++;
      }
      for (const item of data.notes ?? []) {
        const { id: _id, ...rest } = item;
        await db.notes.add(rest);
        imported++;
      }
      for (const item of data.ideas ?? []) {
        const { id: _id, ...rest } = item;
        await db.ideas.add(rest);
        imported++;
      }
      for (const item of data.diaryEntries ?? []) {
        const { id: _id, ...rest } = item;
        await db.diaryEntries.add(rest);
        imported++;
      }
      for (const item of data.voiceMemos ?? []) {
        const { id: _id, blob, ...rest } = item;
        await db.voiceMemos.add({ ...rest, blob: base64ToBlob(blob, rest.mimeType) });
        imported++;
      }
      for (const item of data.birthdays ?? []) {
        const { id: _id, ...rest } = item;
        await db.birthdays.add(rest);
        imported++;
      }
    },
  );

  return { imported };
}
