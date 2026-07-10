import { db } from '../../db';
import { NotebookEditor, NotebookList, type NotebookConfig } from '../../components/NotebookModule';

const config: NotebookConfig = {
  table: db.ideas,
  basePath: '/ideeen',
  title: 'Ideeën',
  bgVar: '--color-ideas-bg',
  accentVar: '--color-ideas-accent',
  emptyText: 'Nog geen ideeën. Tik op ‘Nieuw idee’ om te beginnen.',
  newLabel: 'Nieuw idee',
};

export function IdeasList() {
  return <NotebookList {...config} />;
}

export function IdeaEditor() {
  return <NotebookEditor {...config} />;
}
