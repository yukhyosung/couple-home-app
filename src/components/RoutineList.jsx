// src/components/RoutineList.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { differenceInDays, format } from "date-fns";
import { ko } from "date-fns/locale";

const DEFAULT_ROUTINES = [
  { title: "청소기", recommended_cycle_days: 3 },
  { title: "물걸레", recommended_cycle_days: 7 },
  { title: "세면대 청소", recommended_cycle_days: 7 },
  { title: "변기 청소", recommended_cycle_days: 7 },
  { title: "침구 세탁", recommended_cycle_days: 14 },
];

export default function RoutineList() {
  const { currentUser } = useUser();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCycle, setNewCycle] = useState(7);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "routines"), orderBy("title"));
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // Seed defaults on first load
        for (const r of DEFAULT_ROUTINES) {
          await addDoc(collection(db, "routines"), {
            ...r,
            last_done_at: null,
            last_done_by: null,
          });
        }
      } else {
        setRoutines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const getStatus = (routine) => {
    if (!routine.last_done_at) return { color: "red", days: null, label: "아직 안 함" };
    const lastDate = routine.last_done_at.toDate();
    const daysPassed = differenceInDays(new Date(), lastDate);
    const cycle = routine.recommended_cycle_days;

    if (daysPassed <= cycle * 0.8) return { color: "green", days: daysPassed, label: "양호" };
    if (daysPassed <= cycle) return { color: "orange", days: daysPassed, label: "슬슬 할 때" };
    return { color: "red", days: daysPassed, label: "늦었어요!" };
  };

  const markDone = async (routine) => {
    await updateDoc(doc(db, "routines", routine.id), {
      last_done_at: Timestamp.now(),
      last_done_by: currentUser?.id || "unknown",
    });
  };

  const deleteRoutine = async (id) => {
    await deleteDoc(doc(db, "routines", id));
  };

  const addRoutine = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addDoc(collection(db, "routines"), {
      title: newTitle.trim(),
      recommended_cycle_days: Number(newCycle),
      last_done_at: null,
      last_done_by: null,
    });
    setNewTitle("");
    setNewCycle(7);
    setShowAdd(false);
  };

  const getUserLabel = (userId) => USERS[userId]?.label || userId;

  const sorted = [...routines].sort((a, b) => {
    const da = getStatus(a).days ?? 9999;
    const db2 = getStatus(b).days ?? 9999;
    const ca = a.recommended_cycle_days;
    const cb = b.recommended_cycle_days;
    return (db2 / cb) - (da / ca);
  });

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">🔄</span>
        <h2>루틴 관리</h2>
        <button className="header-add-btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "닫기" : "+ 추가"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addRoutine} className="add-form routine-add-form">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="루틴 이름..."
            className="add-input"
          />
          <div className="cycle-row">
            <label>주기</label>
            <input
              type="number"
              value={newCycle}
              onChange={e => setNewCycle(e.target.value)}
              min="1"
              max="90"
              className="cycle-input"
            />
            <span>일</span>
            <button type="submit" className="add-btn">+</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : (
        <ul className="item-list">
          {sorted.map(routine => {
            const status = getStatus(routine);
            return (
              <li key={routine.id} className={`routine-row color-${status.color}`}>
                <div className="routine-dot" />
                <div className="routine-info">
                  <span className="routine-title">{routine.title}</span>
                  <span className="routine-meta">
                    {routine.last_done_at
                      ? `마지막: ${format(routine.last_done_at.toDate(), "M월 d일", { locale: ko })}${routine.last_done_by ? ` (${getUserLabel(routine.last_done_by)})` : ""} · D+${status.days}`
                      : "아직 기록 없음"
                    } · {routine.recommended_cycle_days}일 주기
                  </span>
                </div>
                <div className="routine-right">
                  <span className={`status-badge badge-${status.color}`}>{status.label}</span>
                  <button className="action-btn done-btn" onClick={() => markDone(routine)}>완료</button>
                  <button className="delete-btn" onClick={() => deleteRoutine(routine.id)}>✕</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
