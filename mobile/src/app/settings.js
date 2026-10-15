import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useChats } from '../../chats/useChats';
import BackgroundSection from '../../components/BackgroundSection';
import ChatsSection from '../../components/Chats';
import { ask } from '../../components/notify';
import UpdateSection from '../../components/UpdateSection';
import { IconButton, Section } from '../../components/ui';
import { ACCENTS, accentFor } from '../../settings/theme';
import { useSettings } from '../../settings/useSettings';

const MAX_WIDTH = 680;

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

// Chats (nuevo y acceso al historial), color de la app, fondo, restablecer y actualizaciones.
// Lo que se cambia aquí se ve al instante en toda la app y se guarda para la próxima vez.
export default function Settings() {
  const insets = useSafeAreaInsets();
  const { settings, theme, update, reset } = useSettings();
  const { newChat } = useChats();

  async function onReset() {
    const ok = await ask('Restablecer', 'El color de la app y el fondo volverán a sus valores por defecto.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', value: true, style: 'destructive' },
    ]);
    if (ok) reset();
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <View style={[styles.topBar, { paddingTop: insets.top, borderColor: theme.border }]}>
        <IconButton icon="arrow-back" label="Volver" onPress={goBack} theme={theme} />
        <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
          Configuración
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          {/* Al crear un chat se vuelve directamente a él. */}
          <ChatsSection
            onNew={() => {
              newChat();
              goBack();
            }}
            onHistory={() => router.push('/history')}
            theme={theme}
          />

          <Section label="Color de la app" theme={theme}>
            <View style={styles.row}>
              {Object.entries(ACCENTS).map(([key, a]) => {
                const selected = settings.accent === key;
                const color = accentFor(key, theme);
                return (
                  <Pressable
                    key={key}
                    onPress={() => update({ accent: key })}
                    accessibilityRole="radio"
                    accessibilityLabel={`Color ${a.label.toLowerCase()}`}
                    accessibilityState={{ checked: selected }}
                    style={({ pressed }) => [
                      styles.accent,
                      { borderColor: selected ? color : theme.border },
                      selected && styles.accentSelected,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <View style={[styles.accentDot, { backgroundColor: color }]}>
                      {selected && <Ionicons name="checkmark" size={18} color={theme.onAccent} />}
                    </View>
                    <Text style={[styles.accentLabel, { color: theme.text }]}>{a.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          <BackgroundSection settings={settings} theme={theme} update={update} />

          <Pressable
            onPress={onReset}
            accessibilityRole="button"
            style={({ pressed }) => [styles.reset, { borderColor: theme.border }, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.text} />
            <Text style={[styles.resetText, { color: theme.text }]}>Restablecer valores por defecto</Text>
          </Pressable>

          <UpdateSection theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 56,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20 },
  row: { flexDirection: 'row', gap: 8 },
  accent: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, borderWidth: 1, borderRadius: 12 },
  accentSelected: { borderWidth: 2 },
  accentDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  accentLabel: { fontSize: 13, fontWeight: '500' },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
  },
  resetText: { fontSize: 15, fontWeight: '600' },
});
