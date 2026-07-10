import { addDays, inferYear, nextWeekdayOccurrence, pad, toISODate, WEEKDAY_NAMES_NL } from './date';

export interface ParsedAgenda {
  title: string;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
}

const MONTHS: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maart: 2, mrt: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  augustus: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const RELATIVE_DAYS: Record<string, number> = {
  vandaag: 0,
  morgen: 1,
  overmorgen: 2,
};

/**
 * Best-effort extraction of a date, time and title from free-form Dutch text,
 * e.g. "18 juli tandarts Afroditi om 11 uur". Anything not recognized as a
 * date/time token is kept as the title. Always shown to the user for
 * confirmation/correction before saving, so this only needs to be "usually right".
 */
export function parseAgendaText(raw: string, ref: Date = new Date()): ParsedAgenda {
  let text = raw.trim();
  let date: Date | null = null;

  // 1. relative day words
  for (const [word, offset] of Object.entries(RELATIVE_DAYS)) {
    const re = new RegExp(`\\b${word}\\b`, 'i');
    if (re.test(text)) {
      date = addDays(ref, offset);
      text = text.replace(re, ' ');
      break;
    }
  }

  // 2. weekday name, optionally prefixed with "volgende"
  if (!date) {
    const re = /\b(volgende\s+)?(zondag|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag)\b/i;
    const m = text.match(re);
    if (m) {
      const targetIdx = WEEKDAY_NAMES_NL.indexOf(m[2].toLowerCase());
      date = nextWeekdayOccurrence(ref, targetIdx, !!m[1]);
      text = text.replace(re, ' ');
    }
  }

  // 3. "18 juli" / "18 juli 2027"
  if (!date) {
    const re = /\b(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|jan|feb|mrt|apr|jun|jul|aug|sept|sep|okt|nov|dec)\.?(?:\s+(\d{4}))?\b/i;
    const m = text.match(re);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = MONTHS[m[2].toLowerCase()];
      const year = m[3] ? parseInt(m[3], 10) : inferYear(ref, month, day);
      date = new Date(year, month, day);
      text = text.replace(re, ' ');
    }
  }

  // 4. numeric date "18-7", "18/07", "18-07-2027"
  if (!date) {
    const re = /\b(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?\b/;
    const m = text.match(re);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      let year = m[3] ? parseInt(m[3], 10) : inferYear(ref, month, day);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        date = new Date(year, month, day);
        text = text.replace(re, ' ');
      }
    }
  }

  // Time: "om 11 uur", "om 11:30", "11:30", "14u", "14u30"
  let time: { h: number; m: number } | null = null;
  {
    const re = /\bom\s+(\d{1,2})(?:[:.](\d{2}))?\s*(?:uur)?\b|\b(\d{1,2})[:.](\d{2})\b|\b(\d{1,2})u(\d{2})?\b/i;
    const m = text.match(re);
    if (m) {
      let h: number, min: number;
      if (m[1] !== undefined) {
        h = parseInt(m[1], 10);
        min = m[2] ? parseInt(m[2], 10) : 0;
      } else if (m[4] !== undefined) {
        h = parseInt(m[3], 10);
        min = parseInt(m[4], 10);
      } else {
        h = parseInt(m[5], 10);
        min = m[6] ? parseInt(m[6], 10) : 0;
      }
      if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
        time = { h, m: min };
        text = text.replace(re, ' ');
      }
    }
  }

  text = text
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^(om|op|voor|de|het|,)\s+/i, '')
    .replace(/\s+(om|op|,)$/i, '')
    .trim();

  return {
    title: text,
    date: date ? toISODate(date) : null,
    time: time ? `${pad(time.h)}:${pad(time.m)}` : null,
  };
}
