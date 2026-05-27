import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';

const BACKEND_URL = 'https://didactic-guacamole-6pwww96rxvrh459g-8000.app.github.dev';

export default function PlayerScreen() {
  const { vibe } = useLocalSearchParams<{ vibe: string }>();
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { buildVibeQueue(); }, []);

  const buildVibeQueue = async () => {
    setLoading(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') { setLoading(false); return; }

    const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 200 });
    const allSongs = media.assets.map(t => ({ id: t.id, title: t.filename.replace(/\.[^/.]+$/, ''), uri: t.uri }));

    try {
      const res = await axios.post(`${BACKEND_URL}/match-vibe`, {
        vibe, songs: allSongs.map(s => s.title)
      });
      const matched = allSongs.filter(s =>
        res.data.matched_songs.some((t: string) => s.title.toLowerCase().includes(t.toLowerCase()))
      );
      setQueue(matched.length > 0 ? matched : allSongs);
    } catch {
      setQueue(allSongs);
    }
    setLoading(false);
  };

  const playSong = async (index: number) => {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: queue[index].uri });
    setSound(newSound);
    setCurrentIndex(index);
    await newSound.playAsync();
    setIsPlaying(true);
    newSound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) playSong((index + 1) % queue.length); });
  };

  const togglePlay = async () => {
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
    setIsPlaying(!isPlaying);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1DB954" />
      <Text style={styles.loadingText}>AI is building your {vibe} playlist... 🎵</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.vibe}>🎧 {vibe} Vibes</Text>
      <Text style={styles.songTitle}>{queue[currentIndex]?.title || 'No songs found'}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => playSong((currentIndex - 1 + queue.length) % queue.length)} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => playSong((currentIndex + 1) % queue.length)} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>⏭</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.queueTitle}>Queue ({queue.length} songs)</Text>
      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => playSong(index)}>
            <Text style={[styles.queueItem, index === currentIndex && styles.activeItem]}>
              {index === currentIndex ? '▶ ' : '   '}{item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { color: '#aaa', marginTop: 16 },
vibe: { fontSize: 18, color: '#1DB954', fontWeight: 'bold' },
  songTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 30 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  ctrlBtn: { padding: 12 },
  ctrlText: { fontSize: 28 },
  playBtn: { backgroundColor: '#1DB954', borderRadius: 50, padding: 18 },
  playText: { fontSize: 28 },
  queueTitle: { color: '#aaa', fontSize: 13, marginTop: 30, marginBottom: 10 },
  queueItem: { color: '#888', fontSize: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  activeItem: { color: '#1DB954', fontWeight: 'bold' },
});
