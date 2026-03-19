// src/lib/firebase.js
// 🔥 Firebase 설정 파일
// 아래 firebaseConfig를 본인의 Firebase 프로젝트 설정으로 교체하세요.
// Firebase Console → 프로젝트 설정 → 앱 추가 → 웹에서 확인 가능합니다.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
