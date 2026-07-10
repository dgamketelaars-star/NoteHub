import { useRef, useState } from 'react';
import { Page } from '../../components/Page';
import { PageHeader } from '../../components/PageHeader';
import { exportAllData, importAllData } from '../../lib/exportImport';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await exportAllData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `schrift-export-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Export gedownload.');
    } catch {
      setStatus('Export mislukt. Probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(file: File) {
    setBusy(true);
    setStatus(null);
    try {
      const { imported } = await importAllData(file);
      setStatus(`${imported} items geïmporteerd.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import mislukt. Controleer het bestand.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeader title="Instellingen" />

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-medium text-(--color-ink)">Gegevens exporteren</h2>
        <p className="text-sm text-(--color-ink-muted)">
          Download al je gegevens als één JSON-bestand. Handig als back-up of om later te importeren.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="rounded-full bg-(--color-ink) py-3 font-medium text-white disabled:opacity-40"
        >
          Exporteren
        </button>
      </section>

      <section className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-medium text-(--color-ink)">Gegevens importeren</h2>
        <p className="text-sm text-(--color-ink-muted)">
          Importeer een eerder geëxporteerd JSON-bestand. Bestaande gegevens blijven staan; het bestand wordt toegevoegd.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-(--color-line) py-3 font-medium text-(--color-ink) disabled:opacity-40"
        >
          Bestand kiezen…
        </button>
      </section>

      {status && <p className="mt-4 text-center text-sm text-(--color-ink-muted)">{status}</p>}

      <p className="mt-8 text-center text-xs text-(--color-ink-muted)">
        Alle gegevens staan lokaal op dit apparaat opgeslagen.
      </p>
    </Page>
  );
}
