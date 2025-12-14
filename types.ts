export type Language = 'en' | 'de' | 'fa';

export interface NarrativeContent {
  title: string;
  narrative: string;
  locationName: string;
  historicalFact: string;
  coordinates: { lat: number; lng: number };
  year: string;
}

export type AppMode = 'intro' | 'selection' | 'generating' | 'reading' | 'revealed';

export interface Theme {
  id: string;
  label: Record<Language, string>;
  promptContext: string;
}

export const THEMES: Theme[] = [
  {
    id: 'wall',
    label: { en: 'The Divide', de: 'Die Teilung', fa: 'جدایی' },
    promptContext: 'The Berlin Wall, division, checkpoints, escapes, the physical scar on the city.'
  },
  {
    id: 'migration',
    label: { en: 'Arrivals', de: 'Ankünfte', fa: 'آمدگان' },
    promptContext: 'Gastarbeiter history, diverse communities (Kreuzberg/Neukölln), refugees, finding a new home, displacement.'
  },
  {
    id: 'silence',
    label: { en: 'Stones of Silence', de: 'Steine der Stille', fa: 'سنگ‌های سکوت' },
    promptContext: 'Stolpersteine, hidden Jewish history, forgotten memorials, emptiness where buildings stood.'
  },
  {
    id: 'techno',
    label: { en: 'Concrete & Bass', de: 'Beton & Bass', fa: 'بتن و باس' },
    promptContext: 'The bunker culture, techno as liberation after 1989, reclaiming industrial spaces, Tresor, Berghain.'
  }
];

export const UI_TEXT = {
  start: { en: 'INITIALIZE', de: 'INITIALISIEREN', fa: 'آغاز سیستم' },
  select: { en: 'SELECT TRACE', de: 'SPUR WÄHLEN', fa: 'انتخاب ردپا' },
  loading: { en: 'EXCAVATING ARCHIVES...', de: 'ARCHIVE AUSGRABEN...', fa: 'در حال استخراج بایگانی...' },
  reveal: { en: 'EXPOSE REALITY', de: 'REALITÄT ENTHÜLLEN', fa: 'افشای واقعیت' },
  back: { en: 'RESET', de: 'ZURÜCKSETZEN', fa: 'بازنشانی' },
  factLabel: { en: 'DOCUMENTARY EVID.', de: 'DOKUMENTARISCHER BEWEIS', fa: 'سند تاریخی' },
  error: { en: 'DATA CORRUPTION. RETRY.', de: 'DATENFEHLER. WIEDERHOLEN.', fa: 'خطای داده. تلاش مجدد.' }
};