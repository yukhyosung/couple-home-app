// src/components/TodaySummary.jsx
import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function TodaySummary() {
  const { currentUser, selectUser } = useUser();
  const [completedToday, setCompletedToday] = useState(0);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "quests"), where("status", "==", "completed"));
    return onSnapshot(q, snap => setCompletedToday(snap.size));
  }, []);

  const spawnHearts = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHearts = Array.from({ length: 7 }, (_, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const dist = 50 + Math.random() * 40;
      return {
        id: Date.now() + i,
        x,
        y,
        dx: `${Math.cos(angle) * dist}px`,
        dy: `${Math.sin(angle) * dist}px`,
        dx2: `${Math.cos(angle) * (dist + 30)}px`,
        dy2: `${Math.sin(angle) * (dist + 30)}px`,
        size: 14 + Math.random() * 14,
      };
    });
    setHearts(h => [...h, ...newHearts]);
    setTimeout(() => setHearts(h => h.filter(heart => !newHearts.find(n => n.id === heart.id))), 900);
  }, []);

  const other = Object.values(USERS).find(u => u.id !== currentUser?.id);
  const dateStr = format(new Date(), "M월 d일 EEEE", { locale: ko });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "오후도 화이팅" : "오늘도 수고했어요";

  return (
    <div className="today-summary" onClick={spawnHearts} style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}>
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart-particle"
          style={{ left: h.x, top: h.y, fontSize: h.size, "--dx": h.dx, "--dy": h.dy, "--dx2": h.dx2, "--dy2": h.dy2 }}
        >💕</span>
      ))}
      <div className="today-left">
        <div className="today-date">{dateStr}</div>
        <div className="today-greeting">
          {currentUser?.emoji} {greeting}, {currentUser?.label}님!
        </div>
        {completedToday > 0 && (
          <div className="today-count">✨ 오늘 {completedToday}개 완료!</div>
        )}
      </div>
      <button
        className="switch-user-btn"
        onClick={e => { e.stopPropagation(); selectUser(other?.id); }}
        title={`${other?.label}으로 전환`}
      >
        {other?.emoji}
      </button>
    </div>
  );
}
