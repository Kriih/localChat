import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Section } from './ui';

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (ts) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// "Hoy", "Ayer" o "Lunes, 12 de octubre" (con el año si no es este).
function dayLabel(dayStart) {
  const today = startOfDay(Date.now());
  if (dayStart === today) return 'Hoy';
  if (dayStart === today - DAY) return 'Ayer';
  const d = new Date(dayStart);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  const label = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const time = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Chats agrupados por el día en que se crearon, del más nuevo al más antiguo
// (escribir en un chat viejo no lo mueve de sitio).
function groupByDay(chats) {
  const groups = new Map();
  for (const chat of [...chats].sort((a, b) => b.createdAt - a.createdAt)) {
    const day = startOfDay(chat.createdAt);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(chat);
  }
  return [...groups.entries()];
}

// "Chats" en Configuración: nuevo chat y, al lado, el botón del historial
// (solo el icono, sin fondo, para que el principal sea "Nuevo chat").
export default function ChatsSection({ onNew, onHistory, theme }) {
  return (
    <Section label="Chats" theme={theme}>
      <View style={styles.actions}>
        <Pressable
          onPress={onNew}
          accessibilityRole="button"
          style={({ pressed }) => [styles.newButton, { backgroundColor: theme.accent }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="add" size={22} color={theme.onAccent} />
          <Text style={[styles.newText, { color: theme.onAccent }]}>Nuevo chat</Text>
        </Pressable>
        <Pressable
          onPress={onHistory}
          accessibilityRole="button"
          accessibilityLabel="Historial"
          hitSlop={4}
          style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.4 }]}
        >
          <Ionicons name="time-outline" size={26} color={theme.text} />
        </Pressable>
      </View>
    </Section>
  );
}

// Historial: los chats por días, del más nuevo al más antiguo.
export function ChatHistoryList({ chats, currentId, onOpen, theme }) {
  return (
    <View style={styles.list}>
      {groupByDay(chats).map(([day, list]) => (
        <View key={day} style={styles.day}>
          <Text style={[styles.dayLabel, { color: theme.muted }]}>{dayLabel(day)}</Text>
          <View style={[styles.card, { borderColor: theme.border }]}>
            {list.map((chat, i) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                open={chat.id === currentId}
                last={i === list.length - 1}
                onPress={() => onOpen(chat.id)}
                theme={theme}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ChatRow({ chat, open, last, onPress, theme }) {
  const count = chat.messages.length;
  // Los mensajes van del más nuevo al más antiguo: el primero que se escribió es el último.
  const first = chat.messages[count - 1];
  const title = first ? first.text : 'Chat nuevo';
  const detail = count === 0 ? 'Vacío' : count === 1 ? '1 mensaje' : `${count} mensajes`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: open }}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
        pressed && { backgroundColor: theme.subtle },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: open ? theme.accent : theme.border }]} />
      <View style={styles.flex}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.detail, { color: theme.muted }]}>
          {detail} · {time(chat.createdAt)}
          {open ? ' · abierto' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
  },
  newText: { fontSize: 15, fontWeight: '600' },
  historyButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 16 },
  day: { gap: 6 },
  dayLabel: { fontSize: 13, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 15, fontWeight: '500' },
  detail: { fontSize: 12, marginTop: 2 },
});
