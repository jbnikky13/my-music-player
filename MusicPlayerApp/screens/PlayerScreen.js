import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function PlayerScreen() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://your-song-url.mp3' } // replace with real URL
    );
    setSound(sound);
    await sound.playAsync();
    setIsPlaying(true);
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Now Playing</Text>
      <Text style={styles.song}>Song Name - Artist</Text>

      <TouchableOpacity style={styles.btn} onPress={isPlaying ? stopSong : playSong}>
        <Text style={styles.btnText}>{isPlaying ? '⏸ Pause' : '▶️ Play'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  title: { fontSize: 22, color: '#fff', marginBottom: 10 },
  song: { fontSize: 16, color: '#aaa', marginBottom: 30 },
  btn: { backgroundColor: '#1DB954', padding: 16, borderRadius: 50 },
  btnText: { color: '#fff', fontSize: 18 },
});
