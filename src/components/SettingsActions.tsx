'use client';

import { RotateCcw, Save } from 'lucide-react';
import { usePreferences } from './AppPreferencesProvider';

export function SettingsActions() {
  const { setCurrency, setLanguage, setMeasurementSystem, setTheme, dictionary: t } = usePreferences();

  function resetPreferences() {
    setTheme('dark');
    setLanguage('es');
    setCurrency('EUR');
    setMeasurementSystem('metric');
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={resetPreferences}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-5 py-2 font-heading text-sm font-bold text-premium transition hover:border-[#00DC82]/40"
      >
        <RotateCcw className="h-4 w-4" />
        {t.settingsReset}
      </button>
      <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 font-heading text-sm font-bold text-[#07140f]">
        <Save className="h-4 w-4" />
        {t.settingsAutosaved}
      </span>
    </div>
  );
}
