'use client';

import { usePreferences } from './AppPreferencesProvider';

export function SettingsFootnote() {
  const { language, dictionary: t } = usePreferences();
  return (
    <p className="mt-8 text-xs text-muted">{t.settingsFootnote(language)}</p>
  );
}
