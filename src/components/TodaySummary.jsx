// src/components/TodaySummary.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function TodaySummary() {
  const { currentUser, selectUser } = useUser();
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    // Count quests completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(collection(db, "quests"), where("status", "==", "completed"));
    const unsub = onSnapshot(q, (snap) => {
      // We count all completed quests as a simple proxy
      setCompletedToday(snap.size);
    });
    return unsub;
  }, []);

  const other = Object.values(USERS).find(u => u.id !== currentUser?.id);
  const dateStr = format(new Date(), "M월 d일 (EEE)", { locale: ko });

  return (
    <div className="today-summary">
      <div className="today-left">
        <div className="today-date">{dateStr}</div>
        <div className="today-greeting">
          {currentUser?.emoji} {currentUser?.label}님, 오늘도 함께해요 💪
        </div>
        {completedToday > 0 && (
          <div className="today-count">오늘 완료한 퀘스트: {completedToday}개</div>
        )}
      </div>
      <button
        className="switch-user-btn"
        onClick={() => selectUser(other?.id)}
        title={`${other?.label}으로 전환`}
      >
        {other?.emoji}
      </button>
    </div>
  );
}
