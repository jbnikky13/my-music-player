import * as MediaLibrary from 'expo-media-library';

export const loadLocalSongs = async () => {
  // Ask user for permission to access media
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission needed to access your music!');
    return [];
  }

  // Fetch all audio files on the phone
  const media = await MediaLibrary.getAssetsAsync({
    mediaType: 'audio',
    first: 200, // load up to 200 songs
  });

  return media.assets.map((track) => ({
    id: track.id,
    title: track.filename.replace(/\.[^/.]+$/, ''), // remove file extension
    uri: track.uri,
    duration: track.duration,
  }));
};
