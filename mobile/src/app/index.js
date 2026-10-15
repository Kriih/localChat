import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useChats } from '../../chats/useChats';
import { IconButton } from '../../components/ui';
import { useSettings } from '../../settings/useSettings';

const MAX_WIDTH = 680;
// Barra de escribir: botones redondos de BUTTON px y el texto, de una línea a cinco.
const BUTTON = 40;
const LINE = 20;
const INPUT_MAX = BUTTON + LINE * 4;

const openSettings = () => router.push('/settings');

const time = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Chat: los mensajes propios a la derecha con el color de la app y los del
// otro a la izquierda con su complementario. De momento no hay conexión: los
// mensajes se guardan en el móvil (historial en Configuración) y tocar la barra de arriba (o el botón de la
// izquierda del campo de texto) cambia de lado para escribir también los del otro.
export default function Chat() {
  const insets = useSafeAreaInsets();
  const { theme } = useSettings();
  const { current, addMessage } = useChats();
  const messages = current.messages;
  const [text, setText] = useState('');
  const [mine, setMine] = useState(true);
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(BUTTON);
  const canSend = text.trim().length > 0;

  function send() {
    const body = text.trim();
    if (!body) return;
    addMessage(body, mine);
    setText('');
    setInputHeight(BUTTON);
  }

  // El lado que escribe ahora: su color tiñe la barra de arriba y el botón de enviar.
  const sideColor = mine ? theme.accent : theme.secondary;
  const onSide = mine ? theme.onAccent : theme.onSecondary;
  const barTheme = { ...theme, text: onSide };

  return (
    <View style={[styles.flex, { backgroundColor: theme.bg }]}>
      {/* Iconos de la barra de estado del color que se lea sobre la barra de arriba. */}
      <StatusBar style={onSide === '#ffffff' ? 'light' : 'dark'} />

      {/* Tocar la barra cambia de lado: los mensajes pasan a ser del otro (izquierda,
          color complementario) o vuelven a ser tuyos (derecha, color de la app).
          El engranaje va aparte: un botón no puede ir dentro de otro. */}
      <View style={[styles.topBar, { paddingTop: insets.top, backgroundColor: sideColor }]}>
        <Pressable
          onPress={() => setMine((m) => !m)}
          accessibilityRole="button"
          accessibilityLabel={mine ? 'Escribes tú. Toca para escribir como el otro' : 'Escribe el otro. Toca para escribir como tú'}
          style={({ pressed }) => [styles.sideToggle, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.avatar, { backgroundColor: onSide }]}>
            <Ionicons name={mine ? 'person' : 'person-outline'} size={18} color={sideColor} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: onSide }]} accessibilityRole="header">
              Chat
            </Text>
            <Text style={[styles.subtitle, { color: onSide }]}>
              {mine ? 'Escribes tú' : 'Escribe el otro'} · toca para cambiar
            </Text>
          </View>
        </Pressable>
        <IconButton icon="settings-outline" label="Configuración" onPress={openSettings} theme={barTheme} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <FlatList
          inverted
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <Bubble message={item} theme={theme} />}
          contentContainerStyle={[styles.list, messages.length === 0 && styles.listEmpty]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            // En una lista invertida el contenido también sale al revés: se endereza.
            <View style={[styles.empty, styles.flipped]}>
              <Ionicons name="chatbubbles-outline" size={40} color={theme.muted} />
              <Text style={[styles.emptyText, { color: theme.muted }]}>Escribe el primer mensaje</Text>
            </View>
          }
        />

        {/* Barra de escribir: una sola cápsula con los dos botones dentro, del mismo
            tamaño y a la misma distancia del borde, para que quede simétrica. */}
        <View style={[styles.inputBar, { borderColor: theme.border, paddingBottom: insets.bottom + 10 }]}>
          <View
            style={[
              styles.column,
              styles.composer,
              { backgroundColor: theme.subtle, borderColor: focused ? sideColor : theme.border },
            ]}
          >
            {/* El mismo cambio de lado que la barra de arriba, a mano junto al teclado. */}
            <Pressable
              onPress={() => setMine((m) => !m)}
              accessibilityRole="button"
              accessibilityLabel={mine ? 'Escribes tú. Cambiar al otro lado' : 'Escribe el otro. Cambiar a tu lado'}
              style={({ pressed }) => [styles.round, styles.outline, { borderColor: sideColor }, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name={mine ? 'arrow-forward' : 'arrow-back'} size={20} color={sideColor} />
            </Pressable>
            <TextInput
              value={text}
              onChangeText={setText}
              // En el móvil Enter hace un salto de línea y se envía con el botón (como en
              // otras apps de chat); en el navegador Enter envía y Mayús + Enter salta de línea.
              onKeyPress={(e) => {
                if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              // Crece con el texto, de una línea (la altura de los botones) hasta unas cinco.
              onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Mensaje"
              placeholderTextColor={theme.muted}
              multiline
              style={[
                styles.input,
                { color: theme.text, height: Math.min(INPUT_MAX, Math.max(BUTTON, inputHeight)) },
              ]}
            />
            <Pressable
              onPress={send}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              style={({ pressed }) => [
                styles.round,
                // Sin texto, el botón se apaga en gris en vez de quedar del color a medias.
                { backgroundColor: canSend ? sideColor : theme.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="send" size={18} color={canSend ? onSide : theme.muted} style={styles.sendIcon} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ message, theme }) {
  const { mine } = message;
  const bg = mine ? theme.accent : theme.secondary;
  const fg = mine ? theme.onAccent : theme.onSecondary;
  return (
    <View style={[styles.column, styles.bubbleRow, mine ? styles.right : styles.left]}>
      <View style={[styles.bubble, { backgroundColor: bg }, mine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, { color: fg }]}>{message.text}</Text>
        <Text style={[styles.bubbleTime, { color: fg }]}>{time(message.ts)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  sideToggle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingLeft: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 12, opacity: 0.85 },
  list: { paddingHorizontal: 12, paddingVertical: 12, gap: 6 },
  listEmpty: { flexGrow: 1 },
  flipped: { transform: [{ scaleY: -1 }] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 15 },
  bubbleRow: { flexDirection: 'row' },
  right: { justifyContent: 'flex-end' },
  left: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 18, gap: 2 },
  // La esquina de abajo del lado de quien habla queda en pico, como la cola de la burbuja.
  bubbleMine: { borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  bubbleTime: { fontSize: 11, opacity: 0.75, alignSelf: 'flex-end' },
  inputBar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, paddingHorizontal: 10 },
  // Los botones van abajo: con varias líneas se quedan junto a la última, como en otras apps.
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, padding: 4, borderRadius: (BUTTON + 10) / 2, borderWidth: 1 },
  round: { width: BUTTON, height: BUTTON, borderRadius: BUTTON / 2, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: LINE,
    paddingHorizontal: 8,
    // (BUTTON - LINE) / 2 arriba y abajo: una línea queda centrada con los botones.
    paddingTop: (BUTTON - LINE) / 2,
    paddingBottom: (BUTTON - LINE) / 2,
    textAlignVertical: 'top',
    // En el navegador el recuadro de foco lo hace la cápsula, no el campo.
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  outline: { borderWidth: 2 },
  // La flecha de enviar es más pesada a la izquierda: se corre un poco para que se vea centrada.
  sendIcon: { marginLeft: 2 },
});
