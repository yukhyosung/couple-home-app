// src/components/DayCounter.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { differenceInDays, format, isPast } from "date-fns";
import { ko } from "date-fns/locale";

const PRESET_EVENTS = [
  { label: "결혼기념일", emoji: "💍" },
  { label: "처음 만난 날", emoji: "💘" },
  { label: "이사 날짜", emoji: "🏠" },
  { label: "여행 출발", emoji: "✈️" },
  { label: "생일", emoji: "🎂" },
];

export default function DayCounter() {
  const [events, setEvents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newEmoji, setNewEmoji] = useState("💍");

  useEffect(() => {
    const q = query(collection(db, "ddays"), orderBy("created_at", "desc"));
    return onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newDate) return;
    await addDoc(collection(db, "ddays"), {
      label: newLabel.trim(),
      date: newDate,
      emoji: newEmoji,
      created_at: serverTimestamp(),
    });
    setNewLabel("");
    setNewDate("");
    setShowAdd(false);
  };

  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, "ddays", id));
  };

  const getDDay = (dateStr) => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = differenceInDays(target, today);
    if (diff === 0) return { label: "D-Day", past: false, value: 0 };
    if (diff > 0) return { label: `D-${diff}`, past: false, value: diff };
    return { label: `D+${Math.abs(diff)}`, past: true, value: Math.abs(diff) };
  };

  return (
    <section className="card dday-card">
      <div className="card-header">
        <span className="section-icon">📅</span>
        <h2>우리의 날들</h2>
        <button className="header-add-btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "닫기" : "+ 추가"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addEvent} className="add-form dday-add-form">
          <div className="emoji-picker">
            {PRESET_EVENTS.map(p => (
              <button
                key={p.emoji}
                type="button"
                className={`emoji-pick-btn ${newEmoji === p.emoji ? "active" : ""}`}
                onClick={() => { setNewEmoji(p.emoji); setNewLabel(p.label); }}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="이벤트 이름"
            className="add-input"
          />
          <div className="dday-date-row">
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="add-input date-input"
            />
            <button type="submit" className="add-btn">+</button>
          </div>
        </form>
      )}

      {events.length === 0 && !showAdd && (
        <p className="empty-hint">특별한 날을 추가해보세요 💕</p>
      )}

      <div className="dday-grid">
        {events.map(ev => {
          const dday = getDDay(ev.date);
          return (
            <div key={ev.id} className={`dday-item ${dday.value === 0 ? "dday-today" : ""}`}>
              <span className="dday-emoji">{ev.emoji}</span>
              <span className="dday-label-text">{ev.label}</span>
              <span className={`dday-number ${dday.past ? "past" : "future"}`}>
                {dday.label}
              </span>
              <span className="dday-date-text">
                {format(new Date(ev.date), "M월 d일", { locale: ko })}
              </span>
              <button className="dday-delete" onClick={() => deleteEvent(ev.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
