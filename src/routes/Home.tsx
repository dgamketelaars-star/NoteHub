import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { CategoryTile } from '../components/CategoryTile';
import { CalendarIcon, CheckIcon, NoteIcon, BulbIcon, BookIcon, MicIcon, CakeIcon, SettingsIcon } from '../components/icons';

export function Home() {
  return (
    <Page>
      <header
        className="mb-6 flex items-center justify-between pt-6"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-(--color-ink)">Schrift</h1>
          <p className="text-(--color-ink-muted)">Eén rustige plek voor alles</p>
        </div>
        <Link
          to="/instellingen"
          aria-label="Instellingen"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-(--color-ink-muted) shadow-sm active:scale-95"
        >
          <SettingsIcon />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <CategoryTile to="/agenda" label="Agenda" bgVar="--color-agenda-bg" accentVar="--color-agenda-accent" icon={<CalendarIcon />} />
        <CategoryTile to="/todo" label="To-do" bgVar="--color-todo-bg" accentVar="--color-todo-accent" icon={<CheckIcon />} />
        <CategoryTile to="/notities" label="Notities" bgVar="--color-notes-bg" accentVar="--color-notes-accent" icon={<NoteIcon />} />
        <CategoryTile to="/ideeen" label="Ideeën" bgVar="--color-ideas-bg" accentVar="--color-ideas-accent" icon={<BulbIcon />} />
        <CategoryTile to="/dagboek" label="Dagboek" bgVar="--color-diary-bg" accentVar="--color-diary-accent" icon={<BookIcon />} />
        <CategoryTile to="/voice-memos" label="Voice memo's" bgVar="--color-voice-bg" accentVar="--color-voice-accent" icon={<MicIcon />} />
        <CategoryTile to="/verjaardagen" label="Verjaardagen" bgVar="--color-birthdays-bg" accentVar="--color-birthdays-accent" icon={<CakeIcon />} />
      </div>
    </Page>
  );
}
