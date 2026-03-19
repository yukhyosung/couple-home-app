// src/components/BabyTracker.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp, Timestamp, limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../lib/userContext";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const LOG_TYPES = [
  { id: "feed", emoji: "🍼", label: "수유" },
  { id: "diaper", emoji: "👶", label: "기저귀" },
  { id: "sleep", emoji: "😴", label: "수면" },
];

const DIAPER_OPTIONS = ["소변", "대변", "혼합"];

export default function BabyTracker() {
  const { currentUser } = useUser();
  const [logs, setLogs] = useState([]);
  const [activeType, setActiveType] = useState("feed");
  const [note, setNote] = useState("");
  const [diaperType, setDiaperType] = useState("소변");
  const [feedAmount, setFeedAmount] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "babyLogs"), orderBy("time", "desc"), limit(20));
    return onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const addLog = async () => {
    const logData = {
      type: activeType,
      time: Timestamp.now(),
      logged_by: currentUser?.id || "unknown",
      note: activeType === "diaper" ? diaperType : activeType === "feed" ? (feedAmount ? `${feedAmount}ml` : "") : note,
    };
    await addDoc(collection(db, "babyLogs"), logData);
    setNote("");
    setFeedAmount("");
  };

  const getLastLog = (type) => logs.find(l => l.type === type);

  const getTimeSince = (log) => {
    if (!log?.time) return "기록 없음";
    return formatDistanceToNow(log.time.toDate(), { locale: ko, addSuffix: true });
  };

  return (
    <section className="card">
      <div className="card-header" onClick={() => setCollapsed(!collapsed)} style={{ cursor: "pointer" }}>
        <span className="section-icon">👶</span>
        <h2>베이비 트래커</h2>
        <span className="collapse-arrow">{collapsed ? "▼" : "▲"}</span>
      </div>

      {/* 요약 - 항상 표시 */}
      <div className="baby-summary">
        {LOG_TYPES.map(type => {
          const last = getLastLog(type.id);
          return (
            <div key={type.id} className="baby-stat">
              <span className="baby-stat-emoji">{type.emoji}</span>
              <span className="baby-stat-label">{type.label}</span>
              <span className="baby-stat-time">{getTimeSince(last)}</span>
            </div>
          );
        })}
      </div>

      {!collapsed && (
        <>
          {/* 타입 선택 */}
          <div className="baby-type-row">
            {LOG_TYPES.map(type => (
              <button
                key={type.id}
                className={`baby-type-btn ${activeType === type.id ? "active" : ""}`}
                onClick={() => setActiveType(type.id)}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>

          {/* 입력 */}
          <div className="baby-input-row">
            {activeType === "feed" && (
              <input
                type="number"
                placeholder="수유량 (ml)"
                value={feedAmount}
                onChange={e => setFeedAmount(e.target.value)}
                className="add-input"
              />
            )}
            {activeType === "diaper" && (
              <div className="diaper-options">
                {DIAPER_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`diaper-btn ${diaperType === opt ? "active" : ""}`}
                    onClick={() => setDiaperType(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {activeType === "sleep" && (
              <input
                type="text"
                placeholder="메모 (선택)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="add-input"
              />
            )}
            <button className="add-btn" onClick={addLog}>기록</button>
          </div>

          {/* 최근 로그 */}
          <ul className="baby-log-list">
            {logs.slice(0, 8).map(log => {
              const typeInfo = LOG_TYPES.find(t => t.id === log.type);
              return (
                <li key={log.id} className="baby-log-item">
                  <span className="baby-log-emoji">{typeInfo?.emoji}</span>
                  <span className="baby-log-label">{typeInfo?.label}</span>
                  {log.note && <span className="baby-log-note">{log.note}</span>}
                  <span className="baby-log-time">
                    {log.time ? format(log.time.toDate(), "HH:mm") : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
