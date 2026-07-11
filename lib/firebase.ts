// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMXyQ9UAOm_X6ScRITbcNIBPWeCMemyMI",
  authDomain: "ancore-7f8a8.firebaseapp.com",
  projectId: "ancore-7f8a8",
  storageBucket: "ancore-7f8a8.firebasestorage.app",
  messagingSenderId: "123800684100",
  appId: "1:123800684100:web:300f5bea8b5ba06c3fde11",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const storage = getStorage(app);
