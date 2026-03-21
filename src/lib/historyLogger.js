// src/lib/historyLogger.js
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export const addHistoryLog = async ({ type, userId, amount, reason, extra }) => {
  try {
    await addDoc(collection(db, "history"), {
      type,       // "point" | "reward" | "quest" | "menu"
      userId,
      amount: amount || null,
      reason,
      extra: extra || null,
      created_at: Timestamp.now(),
    });
  } catch (e) {
    console.error("History log failed:", e);
  }
};
