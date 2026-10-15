import { File, Paths } from 'expo-file-system';

// Chats guardados en el móvil (versión web: chatStore.web.js).
const file = () => new File(Paths.document, 'chats.json');

export function loadChats() {
  try {
    const f = file();
    return f.exists ? JSON.parse(f.textSync()) : null;
  } catch {
    return null;
  }
}

export function saveChats(data) {
  try {
    file().write(JSON.stringify(data));
  } catch {
    // Si no se puede guardar, la app sigue funcionando con los chats en memoria.
  }
}
