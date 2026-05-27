// screens/PlayerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { loadLocalSongs } from '../utils/loadLocalSongs';
import axios from 'axios';

export default function PlayerScreen({ route }) {
  const { vibe } = route.params;
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildVibeQueue();
  }, [vibe]);

  const buildVibeQueue = async () => {
    setLoading(true);
    const allSongs = await loadLocalSongs();

    // Send to AI backend for vibe matching
    try {
      const res = await axios.post('http://your-backend-url/match-vibe', {
        vibe: vibe,
        songs: allSongs.map((s) => s.title),
      });

      const matchedTitles = res.data.matched_songs;

      // Filter local songs that match AI response
      const matched = allSongs.filter((s) =>
        matchedTitles.some((title) =>
          s.title.toLowerCase().includes(title.toLowerCase())
        )
      );

      setQueue(matched.length > 0 ? matched : allSongs); // fallback to all songs
    } catch (err) {
      console.error(err);
      setQueue(allSongs); // fallback if API fails
    }

    setLoading(false);
  };

  const playSong = async (index) => {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: queue[index].uri }
    );
    setSound(newSound);
    setCurrentIndex(index);
    await newSound.playAsync();
    setIsPlaying(true);

    // Auto-play next song when current ends
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) playNext();
    });
  };

  const playNext = () => {
    const next = (currentIndex + 1) % queue.length;
    playSong(next);
  };

  const playPrev = () => {
    const prev = (currentIndex - 1 + queue.length) % queue.length;
    playSong(prev);
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
      <Text style={styles.nowPlaying}>Now Playing</Text>
      <Text style={styles.songTitle}>{queue[currentIndex]?.title || 'No songs found'}</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrev} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Song Queue */}
      <Text style={styles.queueTitle}>Up Next ({queue.length} songs)</Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => playSong(index)}>
            <Text style={[styles.queueItem, index === currentIndex && styles.queueItemActive]}>
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
  loadingText: { color: '#aaa', marginTop: 16, fontSize: 14 },
  vibe: { fontSize: 18, color: '#1DB954', fontWeight: 'bold' },
  nowPlaying: { color: '#aaa', marginTop: 30, fontSize: 13 },
  songTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 },
  ctrlBtn: { padding: 12 },
  ctrlText: { fontSize: 28 },
  playBtn: { backgroundColor: '#1DB954', borderRadius: 50, padding: 18 },
  playText: { fontSize: 28 },
  queueTitle: { color: '#aaa', fontSize: 13, marginTop: 30, marginBottom: 10 },
  queueItem: { color: '#888', fontSize: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  queueItemActive: { color: '#1DB954', fontWeight: 'bold' },
});