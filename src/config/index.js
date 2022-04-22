// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9v8xc8DlYfK_tCR501Ao2C247bUP7B6A",
  authDomain: "okapi-68b47.firebaseapp.com",
  databaseURL: "https://okapi-68b47-default-rtdb.firebaseio.com",
  projectId: "okapi-68b47",
  storageBucket: "okapi-68b47.appspot.com",
  messagingSenderId: "1087789600269",
  appId: "1:1087789600269:web:fb4bbb83b789befceb4f44",
  measurementId: "G-YY9SRHGBFG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
