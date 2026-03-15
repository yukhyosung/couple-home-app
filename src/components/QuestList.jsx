// src/components/QuestList.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";

const STATUS_LABEL = {
  pending: "대기 중",
  claimed: "진행 중",
  completed: "완료",
};

export default function QuestList() {
  const { currentUser } = useUser();
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "quests"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addQuest = async (e) => {
    e.preventDefault();
    const title = newQuest.trim();
    if (!title) return;
    await addDoc(collection(db, "quests"), {
      title,
      status: "pending",
      created_by: currentUser?.id || "unknown",
      claimed_by: null,
      completed_by: null,
      created_at: serverTimestamp(),
    });
    setNewQuest("");
  };

  const claimQuest = async (quest) => {
    await updateDoc(doc(db, "quests", quest.id), {
      status: "claimed",
      claimed_by: currentUser?.id,
    });
  };

  const completeQuest = async (quest) => {
    await updateDoc(doc(db, "quests", quest.id), {
      status: "completed",
      completed_by: currentUser?.id,
    });
  };

  const deleteQuest = async (id) => {
    await deleteDoc(doc(db, "quests", id));
  };

  const active = quests.filter(q => q.status !== "completed");
  const completed = quests.filter(q => q.status === "completed");

  const getUserLabel = (userId) => USERS[userId]?.label || userId;
  const getUserEmoji = (userId) => USERS[userId]?.emoji || "👤";

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">⚡</span>
        <h2>퀘스트</h2>
        <span className="badge">{active.length}</span>
      </div>

      <form onSubmit={addQuest} className="add-form">
        <input
          type="text"
          value={newQuest}
          onChange={e => setNewQuest(e.target.value)}
          placeholder="할 일 추가..."
          className="add-input"
        />
        <button type="submit" className="add-btn">+</button>
      </form>

      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : (
        <ul className="item-list">
          {active.map(quest => (
            <li key={quest.id} className={`quest-row status-${quest.status}`}>
              <div className="quest-info">
                <span className="quest-title">{quest.title}</span>
                {quest.status === "claimed" && quest.claimed_by && (
                  <span className="quest-claimed-msg">
                    {getUserEmoji(quest.claimed_by)} {getUserLabel(quest.claimed_by)}이(가) 하러 갔어요
                  </span>
                )}
              </div>
              <div className="quest-actions">
                {quest.status === "pending" && (
                  <button className="action-btn claim-btn" onClick={() => claimQuest(quest)}>
                    내가 할게요
                  </button>
                )}
                {quest.status === "claimed" && (
                  <button className="action-btn complete-btn" onClick={() => completeQuest(quest)}>
                    완료
                  </button>
                )}
                <button className="delete-btn" onClick={() => deleteQuest(quest.id)}>✕</button>
              </div>
            </li>
          ))}

          {completed.length > 0 && (
            <li className="completed-divider">
              <span>완료된 항목</span>
            </li>
          )}
          {completed.map(quest => (
            <li key={quest.id} className="quest-row status-completed">
              <div className="quest-info">
                <span className="quest-title">{quest.title}</span>
                {quest.completed_by && (
                  <span className="quest-done-msg">
                    {getUserEmoji(quest.completed_by)} {getUserLabel(quest.completed_by)} 완료
                  </span>
                )}
              </div>
              <button className="delete-btn" onClick={() => deleteQuest(quest.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
