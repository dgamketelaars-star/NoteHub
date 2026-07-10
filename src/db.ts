import Dexie, { type EntityTable } from 'dexie';

export type ReminderOption = 'none' | '1h' | 'evening' | 'both';
export type TodoBucket = 'today' | 'week' | 'anytime';

export interface AgendaItem {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm
  reminder: ReminderOption;
  createdAt: string; // ISO timestamp
}

export interface Todo {
  id: number;
  text: string;
  bucket: TodoBucket;
  done: boolean;
  createdAt: string;
}

export interface Note {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: number;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string;
}

export interface VoiceMemo {
  id: number;
  name: string;
  blob: Blob;
  mimeType: string;
  duration: number; // seconds
  createdAt: string;
}

export interface Birthday {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD (year of birth may be unknown, see yearUnknown)
  yearUnknown: boolean;
  note: string;
  reminder: boolean;
  createdAt: string;
}

const db = new Dexie('schrift-organizer') as Dexie & {
  agendaItems: EntityTable<AgendaItem, 'id'>;
  todos: EntityTable<Todo, 'id'>;
  notes: EntityTable<Note, 'id'>;
  ideas: EntityTable<Idea, 'id'>;
  diaryEntries: EntityTable<DiaryEntry, 'id'>;
  voiceMemos: EntityTable<VoiceMemo, 'id'>;
  birthdays: EntityTable<Birthday, 'id'>;
};

db.version(1).stores({
  agendaItems: '++id, date',
  todos: '++id, bucket, done',
  notes: '++id, createdAt, updatedAt',
  ideas: '++id, createdAt, updatedAt',
  diaryEntries: '++id, date',
  voiceMemos: '++id, createdAt',
  birthdays: '++id, date',
});

export { db };
