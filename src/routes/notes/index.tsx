import { db } from '../../db';
import { NotebookEditor, NotebookList, type NotebookConfig } from '../../components/NotebookModule';

const config: NotebookConfig = {
  table: db.notes,
  basePath: '/notities',
  title: 'Notities',
  bgVar: '--color-notes-bg',
  accentVar: '--color-notes-accent',
  emptyText: 'Nog geen notities. Tik op ‘Nieuwe notitie’ om te beginnen.',
  newLabel: 'Nieuwe notitie',
  attachmentOwnerType: 'note',
};

export function NotesList() {
  return <NotebookList {...config} />;
}

export function NoteEditor() {
  return <NotebookEditor {...config} />;
}
