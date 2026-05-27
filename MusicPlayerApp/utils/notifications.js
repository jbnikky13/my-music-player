import * as Notifications from 'expo-notifications';

export const registerForNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Push token:', token); // Save this to your backend
};

export const sendLocalNotification = async (songTitle) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎵 Now Playing",
      body: songTitle,
    },
    trigger: null, // sends immediately
  });
};
