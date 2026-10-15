import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ACCENTS, DEFAULT_SETTINGS, THEMES, themeFor } from './theme';
import { loadSettings, saveSettings } from './settingsStore';

const SettingsContext = createContext(null);

// Estado único de los ajustes (color de la app y fondo), compartido por todas
// las pantallas. Cualquier cambio se refleja al instante y se guarda para la
// próxima vez.
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = loadSettings() ?? {};
    const merged = { ...DEFAULT_SETTINGS, ...saved };
    // Un valor que ya no existe (p. ej. de una versión anterior) vuelve al de por defecto.
    if (!THEMES[merged.theme]) merged.theme = DEFAULT_SETTINGS.theme;
    if (!ACCENTS[merged.accent]) merged.accent = DEFAULT_SETTINGS.accent;
    return merged;
  });

  useEffect(() => saveSettings(settings), [settings]);

  const value = useMemo(
    () => ({
      settings,
      theme: themeFor(settings),
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
