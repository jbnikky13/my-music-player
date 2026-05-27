import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const VIBES = {
  "😊 Mood": ["Happy", "Sad", "Chill", "Hype"],
  "🎸 Genre": ["Hip-Hop", "Pop", "Jazz", "Classical"],
  "⚡ Activity": ["Workout", "Sleep", "Focus", "Party"],
};

export default function HomeScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (vibe: string) => {
    setSelected(vibe);
    router.push({ pathname: '/player', params: { vibe } });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>What's your vibe? 🎵</Text>
      {Object.entries(VIBES).map(([category, options]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.category}>{category}</Text>
          <View style={styles.row}>
            {options.map((vibe) => (
              <TouchableOpacity
                key={vibe}
                style={[styles.btn, selected === vibe && styles.btnActive]}
                onPress={() => handleSelect(vibe)}
              >
                <Text style={[styles.btnText, selected === vibe && styles.btnTextActive]}>
                  {vibe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 24, marginTop: 40 },
  section: { marginBottom: 28 },
  category: { fontSize: 16, color: '#1DB954', marginBottom: 12, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 25, borderWidth: 1, borderColor: '#444', backgroundColor: '#1e1e1e' },
  btnActive: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  btnText: { color: '#aaa', fontSize: 14 },
  btnTextActive: { color: '#fff', fontWeight: 'bold' },
});
