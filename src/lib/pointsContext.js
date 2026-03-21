// src/lib/pointsContext.js
// 포인트 시스템 - 전역 상태 관리
import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { addHistoryLog } from "./historyLogger";

const PointsContext = createContext(null);

export const QUEST_POINTS = {
  easy: 20,
  normal: 45,
  hard: 75,
  epic: 120,
};

export const REWARDS = [
  { id: "meat", emoji: "🥩", label: "고기 먹기", cost: 200 },
  { id: "sushi", emoji: "🍣", label: "초밥", cost: 180 },
  { id: "pizza", emoji: "🍕", label: "피자", cost: 100 },
  { id: "cleaning_pass", emoji: "🧹", label: "청소 면제권", cost: 90 },
  { id: "sleep_in", emoji: "😴", label: "늦잠 보장", cost: 80 },
  { id: "game", emoji: "🎮", label: "게임 2시간", cost: 70 },
  { id: "cafe", emoji: "☕", label: "카페 데이트", cost: 60 },
  { id: "massage", emoji: "💆", label: "안마권", cost: 50 },
  { id: "movie", emoji: "🎬", label: "영화 선택권", cost: 40 },
  { id: "wish", emoji: "⭐", label: "소원 한 가지", cost: 300 },
];

export function PointsProvider({ children }) {
  const [points, setPoints] = useState({ husband: 0, wife: 0 });

  useEffect(() => {
    const ref = doc(db, "system", "points");
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        await setDoc(ref, { husband: 0, wife: 0 });
      } else {
        setPoints(snap.data());
      }
    });
    return unsub;
  }, []);

  const addPoints = async (userId, amount, reason) => {
    const ref = doc(db, "system", "points");
    await updateDoc(ref, { [userId]: increment(amount) });
    await addHistoryLog({ type: "point", userId, amount, reason });
  };

  const spendPoints = async (userId, amount, rewardLabel) => {
    const ref = doc(db, "system", "points");
    const snap = await getDoc(ref);
    const current = snap.data()?.[userId] || 0;
    if (current < amount) return false;
    await updateDoc(ref, { [userId]: increment(-amount) });
    await addHistoryLog({ type: "reward", userId, amount, reason: rewardLabel });
    return true;
  };

  return (
    <PointsContext.Provider value={{ points, addPoints, spendPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export const usePoints = () => useContext(PointsContext);
