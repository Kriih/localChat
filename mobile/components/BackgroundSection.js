import { Pressable, StyleSheet, Text, View } from 'react-native';

import { THEMES } from '../settings/theme';
import { Section } from './ui';

// Fondo de la app: cada opción se muestra con sus propios colores.
export default function BackgroundSection({ settings, theme, update }) {
  return (
    <Section label="Fondo" theme={theme}>
      <View style={[styles.row, styles.wrap]}>
        {Object.entries(THEMES).map(([key, t]) => {
          const selected = settings.theme === key;
          return (
            <Pressable
              key={key}
              onPress={() => update({ theme: key })}
              accessibilityRole="radio"
              accessibilityLabel={`Fondo ${t.label}`}
              accessibilityState={{ checked: selected }}
              style={[
                styles.swatch,
                { backgroundColor: t.bg, borderColor: selected ? theme.accent : theme.border },
                selected && styles.swatchSelected,
              ]}
            >
              <Text style={[styles.swatchText, { color: t.text }]} numberOfLines={1}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  wrap: { flexWrap: 'wrap' },
  swatch: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: 52,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: { borderWidth: 3 },
  swatchText: { fontSize: 15, fontWeight: '500' },
});
