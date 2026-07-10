# Schrift — digitale organizer (V1)

Eén rustige plek voor agenda, taken, notities, ideeën, dagboek, voice memo's
en verjaardagen. Mobile-first, installeerbaar als PWA, werkt offline en
bewaart alles lokaal op je apparaat.

## Starten

Vereist: Node.js 20+.

```bash
npm install
npm run dev
```

Open de URL die Vite toont (meestal http://localhost:5173).

## Build

```bash
npm run build      # productie-build in dist/
npm run preview    # bekijk de productie-build lokaal
```

## PWA installeren

Open de `dist/`-build (via `npm run preview` of een gehoste versie) in een
mobiele browser en kies "Toevoegen aan startscherm" / "App installeren".

## Gemaakte technische keuzes

- **React + TypeScript + Vite** — snelle dev-loop, kleine bundle, geen
  onnodig framework-gewicht voor een lokale app.
- **Tailwind CSS v4** — voor consistente, snel te onderhouden styling zonder
  een eigen CSS-architectuur te hoeven optuigen.
- **Dexie (IndexedDB)** als lokale opslag, met `dexie-react-hooks` voor live
  queries. IndexedDB kan, in tegenstelling tot `localStorage`, ook audio
  (voice memo's) opslaan en blijft geschikt als de app groter wordt.
  De databasestructuur (`src/db.ts`) is opgezet in aparte tabellen per
  categorie, zodat een latere overstap naar cloudsync (bijv. een sync-laag
  bovenop dezelfde tabellen) geen herontwerp vergt.
- **HashRouter** (react-router) in plaats van BrowserRouter — zo werkt de
  app als statische bestanden overal, zonder dat een server
  deep links naar `index.html` hoeft door te sturen. Belangrijk voor een
  PWA die ook vanaf een simpele static host of `file://`-achtige omgeving
  moet kunnen draaien.
- **vite-plugin-pwa** genereert de service worker en het manifest; offline
  gebruik werkt na de eerste keer laden.
- **Agenda-tekstherkenning** (`src/lib/agendaParser.ts`) is een eigen,
  kleine regex-gebaseerde parser voor Nederlandse datums/tijden
  ("18 juli", "morgen", "volgende dinsdag", "om 11 uur", "14u30"). Geen
  externe library of AI-dienst nodig. Herkenning hoeft niet perfect te zijn:
  het bevestigingsscherm laat je alles handmatig corrigeren vóór opslaan.
- **Geen backend.** Alles draait client-side; export/import via JSON is de
  manier om gegevens te back-uppen of over te zetten.
- **Geen hidden gestures.** Bewerken/verwijderen gaat altijd via zichtbare,
  labelled knoppen (geen swipe-to-delete), in lijn met de eis dat bediening
  nooit verborgen mag zijn.

## Projectstructuur

```
src/
  db.ts                 Dexie-schema (alle tabellen)
  lib/                  datum-helpers, agenda-parser, export/import
  components/           gedeelde UI (Page, PageHeader, Fab, iconen, ...)
  routes/
    Home.tsx
    agenda/              lijst, nieuw (met NL-parser + bevestiging), detail
    todo/
    notes/, ideas/       delen één generieke "notebook"-component
    diary/
    voice/               opname via MediaRecorder
    birthdays/
    settings/            JSON-export/import
```

## Bekende beperkingen (V1)

- De Nederlandse datum/tijd-herkenning in Agenda dekt de meest gangbare
  patronen (relatieve dagen, weekdagen, "D maand", numerieke datums,
  diverse tijdnotaties), maar is geen volledige taalparser. Alles is
  altijd handmatig te corrigeren vóór opslaan.
- Reminders worden opgeslagen (agenda en verjaardagen), maar er is nog
  geen achtergrond-notificatiesysteem dat op het afgesproken moment een
  melding stuurt — browsers staan dat alleen toe met extra
  toestemmingen/service-worker-logica die bewust buiten V1 is gehouden.
  De reminder-keuze is dus voorbereid, maar (nog) niet actief.
- Voice memo's vereisen microfoon-toegang via de browser
  (`getUserMedia`/`MediaRecorder`); als een browser dat niet ondersteunt,
  toont de app dat duidelijk zonder de rest van de app te blokkeren.
- Taken kunnen na aanmaken niet meer tussen Vandaag/Deze week/Tijdloos
  verplaatst worden (wel bewerken, afvinken, verwijderen) — dit stond niet
  expliciet in de opdracht en is bewust weggelaten om de scope klein te
  houden.
- Er is nog geen cloudsync/account — bewust, zoals gevraagd. De
  opslaglaag is er wel op voorbereid.
- Gegevens leven in de IndexedDB van de browser op dit apparaat. Wissen
  van browsergegevens verwijdert ook de organizer-data; gebruik de
  JSON-export als back-up.
