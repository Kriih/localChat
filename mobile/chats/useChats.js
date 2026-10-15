import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { loadChats, saveChats } from './chatStore';

const ChatsContext = createContext(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const emptyChat = () => {
  const now = Date.now();
  return { id: newId(), createdAt: now, updatedAt: now, messages: [] };
};

function initialState() {
  const saved = loadChats();
  const chats = Array.isArray(saved?.chats) ? saved.chats.filter((c) => c && Array.isArray(c.messages)) : [];
  if (chats.length === 0) chats.push(emptyChat());
  const currentId = chats.some((c) => c.id === saved?.currentId) ? saved.currentId : chats[0].id;
  return { chats, currentId };
}

// Un chat vacío que se deja atrás no se guarda en el historial.
const dropEmpty = (chats, keepId) => chats.filter((c) => c.messages.length > 0 || c.id === keepId);

// Todos los chats y cuál está abierto. Cada chat: { id, createdAt, updatedAt,
// messages }, con los mensajes del más nuevo al más antiguo (la lista del chat
// está invertida). Todo se guarda al momento.
export function ChatsProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => saveChats(state), [state]);

  const value = useMemo(() => {
    const current = state.chats.find((c) => c.id === state.currentId) ?? state.chats[0];
    return {
      chats: state.chats,
      current,

      addMessage: (text, mine) =>
        setState((s) => {
          const ts = Date.now();
          const chats = s.chats.map((c) =>
            c.id === s.currentId
              ? { ...c, updatedAt: ts, messages: [{ id: `${ts}-${c.messages.length}`, text, mine, ts }, ...c.messages] }
              : c,
          );
          return { ...s, chats };
        }),

      // Si el chat abierto ya está vacío, "nuevo chat" es ese mismo.
      newChat: () =>
        setState((s) => {
          const open = s.chats.find((c) => c.id === s.currentId);
          if (open && open.messages.length === 0) return s;
          const chat = emptyChat();
          return { chats: [chat, ...s.chats], currentId: chat.id };
        }),

      openChat: (id) => setState((s) => ({ chats: dropEmpty(s.chats, id), currentId: id })),
    };
  }, [state]);

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export function useChats() {
  return useContext(ChatsContext);
}
