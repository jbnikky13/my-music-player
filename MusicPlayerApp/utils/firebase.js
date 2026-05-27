// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA___EkfkmU3K_NqkTZP1Zv1oTCqvoc_Sk",
  authDomain: "my-music-player-35cd1.firebaseapp.com",
  projectId: "my-music-player-35cd1",
  storageBucket: "my-music-player-35cd1.firebasestorage.app",
  messagingSenderId: "1059743494329",
  appId: "1:1059743494329:web:813eaa8a542a2daa49eb68",
  measurementId: "G-VQQSVLK5R2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Save a favourite song to Firestore
export const saveFavourite = async (song) => {
  try {
    await addDoc(collection(db, "favourites"), {
      title: song.title,
      artist: song.artist,
      savedAt: new Date()
    });
    console.log("Song saved successfully!");
  } catch (error) {
    console.error("Error saving song: ", error);
  }
};
