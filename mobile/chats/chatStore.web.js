const KEY = 'chats';

export function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveChats(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Navegación privada o almacenamiento bloqueado: se usan los chats en memoria.
  }
}
