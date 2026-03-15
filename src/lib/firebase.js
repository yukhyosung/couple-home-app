// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV6WCS3qPGUrSjBVbsMNgwBknLgpcRBbk",
  authDomain: "hyunsol-family.firebaseapp.com",
  projectId: "hyunsol-family",
  storageBucket: "hyunsol-family.firebasestorage.app",
  messagingSenderId: "59832857399",
  appId: "1:59832857399:web:589084d3e2422f1799e0b2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);