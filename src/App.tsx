import { Route, Routes } from 'react-router-dom';
import { Home } from './routes/Home';
import { AgendaList } from './routes/agenda/AgendaList';
import { AgendaNew } from './routes/agenda/AgendaNew';
import { AgendaDetail } from './routes/agenda/AgendaDetail';
import { TodoPage } from './routes/todo/TodoPage';
import { NotesList, NoteEditor } from './routes/notes';
import { IdeasList, IdeaEditor } from './routes/ideas';
import { DiaryPage } from './routes/diary/DiaryPage';
import { BirthdaysList } from './routes/birthdays/BirthdaysList';
import { BirthdayEditor } from './routes/birthdays/BirthdayEditor';
import { SettingsPage } from './routes/settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/agenda" element={<AgendaList />} />
      <Route path="/agenda/nieuw" element={<AgendaNew />} />
      <Route path="/agenda/:id" element={<AgendaDetail />} />

      <Route path="/todo" element={<TodoPage />} />

      <Route path="/notities" element={<NotesList />} />
      <Route path="/notities/nieuw" element={<NoteEditor />} />
      <Route path="/notities/:id" element={<NoteEditor />} />

      <Route path="/ideeen" element={<IdeasList />} />
      <Route path="/ideeen/nieuw" element={<IdeaEditor />} />
      <Route path="/ideeen/:id" element={<IdeaEditor />} />

      <Route path="/dagboek" element={<DiaryPage />} />

      <Route path="/verjaardagen" element={<BirthdaysList />} />
      <Route path="/verjaardagen/nieuw" element={<BirthdayEditor />} />
      <Route path="/verjaardagen/:id" element={<BirthdayEditor />} />

      <Route path="/instellingen" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;
