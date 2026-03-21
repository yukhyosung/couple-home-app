// src/components/ActivityHistory.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { USERS } from "../lib/userContext";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const TYPE_CONFIG = {
  point:  { emoji: "⭐", color: "history-point",  label: "포인트 획득" },
  reward: { emoji: "🎁", color: "history-reward", label: "리워드 사용" },
  quest:  { emoji: "⚔️", color: "history-quest",  label: "퀘스트" },
  menu:   { emoji: "🍽️", color: "history-menu",   label: "메뉴" },
};

export default function ActivityHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("created_at", "desc"), limit(50));
    return onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">📜</span>
        <h2>활동 기록</h2>
        <span className="badge">{logs.length}</span>
      </div>

      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : logs.length === 0 ? (
        <p className="empty-hint">아직 기록이 없어요. 퀘스트를 완료해보세요! 🎮</p>
      ) : (
        <ul className="history-list">
          {logs.map(log => {
            const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.quest;
            const user = USERS[log.userId];
            const timeAgo = log.created_at
              ? formatDistanceToNow(log.created_at.toDate(), { locale: ko, addSuffix: true })
              : "";
            return (
              <li key={log.id} className={`history-item ${config.color}`}>
                <span className="history-type-emoji">{config.emoji}</span>
                <div className="history-content">
                  <div className="history-main">
                    <span className="history-user">{user?.emoji} {user?.label}</span>
                    <span className="history-reason">{log.reason}</span>
                  </div>
                  <div className="history-meta">
                    {log.amount && (
                      <span className={`history-amount ${log.type === "reward" ? "minus" : "plus"}`}>
                        {log.type === "reward" ? "-" : "+"}{log.amount}pt
                      </span>
                    )}
                    <span className="history-time">{timeAgo}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
