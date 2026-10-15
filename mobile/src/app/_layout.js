import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChatsProvider } from '../../chats/useChats';
import { SettingsProvider, useSettings } from '../../settings/useSettings';

// Pila: chat (/) → Configuración (/settings) → Historial (/history).
// Todas pintan su propia barra, así que se oculta la cabecera nativa.
function ThemedStack() {
  const { theme } = useSettings();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      {/* Configuración es otra sección: entra desde el lado. */}
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ChatsProvider>
          <ThemedStack />
        </ChatsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
