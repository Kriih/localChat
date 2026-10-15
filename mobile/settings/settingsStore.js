import { File, Paths } from 'expo-file-system';

// Ajustes guardados en el móvil (versión web: settingsStore.web.js).
const file = () => new File(Paths.document, 'settings.json');

export function loadSettings() {
  try {
    const f = file();
    return f.exists ? JSON.parse(f.textSync()) : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings) {
  try {
    file().write(JSON.stringify(settings));
  } catch {
    // Si no se puede guardar, la app sigue funcionando con los valores en memoria.
  }
}
