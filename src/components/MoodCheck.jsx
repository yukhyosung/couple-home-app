// src/components/MoodCheck.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, Timestamp, limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const MOODS = [
  { id: "great", emoji: "😄", label: "좋아요" },
  { id: "okay", emoji: "😐", label: "그냥 그래요" },
  { id: "tired", emoji: "😫", label: "피곤해요" },
  { id: "bad", emoji: "😡", label: "힘들어요" },
];

export default function MoodCheck() {
  const { currentUser } = useUser();
  const [logs, setLogs] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "moodLogs"), orderBy("time", "desc"), limit(30));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(all);

      // 오늘 내가 기록했는지 확인
      const today = new Date().toDateString();
      const myToday = all.find(l =>
        l.user === currentUser?.id &&
        l.time?.toDate().toDateString() === today
      );
      setTodayMood(myToday || null);
    });
  }, [currentUser]);

  const logMood = async (moodId) => {
    await addDoc(collection(db, "moodLogs"), {
      user: currentUser?.id,
      mood: moodId,
      time: Timestamp.now(),
    });
  };

  // 파트너 오늘 기분
  const partnerId = Object.keys(USERS).find(id => id !== currentUser?.id);
  const today = new Date().toDateString();
  const partnerToday = logs.find(l =>
    l.user === partnerId &&
    l.time?.toDate().toDateString() === today
  );

  // 통계
  const myLogs = logs.filter(l => l.user === currentUser?.id);
  const moodCounts = MOODS.map(m => ({
    ...m,
    count: myLogs.filter(l => l.mood === m.id).length,
  }));

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">💭</span>
        <h2>오늘 기분은?</h2>
        <button className="header-add-btn" onClick={() => setShowStats(!showStats)}>
          {showStats ? "닫기" : "통계"}
        </button>
      </div>

      <div className="mood-body">
        {!todayMood ? (
          <>
            <p className="mood-prompt">오늘 {currentUser?.label}님의 기분은 어때요?</p>
            <div className="mood-buttons">
              {MOODS.map(m => (
                <button key={m.id} className="mood-btn" onClick={() => logMood(m.id)}>
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mood-today">
            <span className="mood-today-emoji">
              {MOODS.find(m => m.id === todayMood.mood)?.emoji}
            </span>
            <span className="mood-today-text">
              오늘 기분: {MOODS.find(m => m.id === todayMood.mood)?.label}
            </span>
          </div>
        )}

        {/* 파트너 기분 */}
        {partnerToday && (
          <div className="mood-partner">
            {USERS[partnerId]?.emoji} {USERS[partnerId]?.label}님은 오늘{" "}
            <strong>{MOODS.find(m => m.id === partnerToday.mood)?.emoji} {MOODS.find(m => m.id === partnerToday.mood)?.label}</strong>
          </div>
        )}

        {/* 통계 */}
        {showStats && (
          <div className="mood-stats">
            <p className="mood-stats-title">최근 30일 내 기분</p>
            {moodCounts.map(m => (
              <div key={m.id} className="mood-stat-row">
                <span>{m.emoji} {m.label}</span>
                <div className="mood-stat-bar-wrap">
                  <div
                    className="mood-stat-bar"
                    style={{ width: `${myLogs.length ? (m.count / myLogs.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="mood-stat-count">{m.count}회</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
