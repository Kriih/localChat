import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useChats } from '../../chats/useChats';
import { ChatHistoryList } from '../../components/Chats';
import { IconButton } from '../../components/ui';
import { useSettings } from '../../settings/useSettings';

const MAX_WIDTH = 680;

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

// Historial de chats por días. Al tocar uno se vuelve directamente al chat
// (saltando Configuración, desde donde se llega aquí).
export default function History() {
  const insets = useSafeAreaInsets();
  const { theme } = useSettings();
  const { chats, current, openChat } = useChats();

  function open(id) {
    openChat(id);
    router.dismissTo('/');
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />
      <View style={[styles.topBar, { paddingTop: insets.top, borderColor: theme.border }]}>
        <IconButton icon="arrow-back" label="Volver" onPress={goBack} theme={theme} />
        <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
          Historial
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.column}>
          <ChatHistoryList chats={chats} currentId={current.id} onOpen={open} theme={theme} />
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
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
});
