// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyD8ecPPtjnJiPimg2_4zmEzYhlbHfryT5Y",
    authDomain: "watashi-museum.firebaseapp.com",
    projectId: "watashi-museum",
    storageBucket: "watashi-museum.firebasestorage.app",
    messagingSenderId: "185581773268",
    appId: "1:185581773268:web:22d0342d78d45726db3641",
    measurementId: "G-1K086ZP7V5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
