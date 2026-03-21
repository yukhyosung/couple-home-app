// src/components/QuestList.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { usePoints, QUEST_POINTS } from "../lib/pointsContext";

const DIFFICULTY = [
  { id: "easy",   label: "쉬움",   emoji: "🟢", points: QUEST_POINTS.easy },
  { id: "normal", label: "보통",   emoji: "🟡", points: QUEST_POINTS.normal },
  { id: "hard",   label: "어려움", emoji: "🔴", points: QUEST_POINTS.hard },
  { id: "epic",   label: "에픽",   emoji: "⭐", points: QUEST_POINTS.epic },
];

const DEFAULT_QUESTS = [
  { title: "설거지", difficulty: "easy" },
  { title: "밥하기", difficulty: "easy" },
  { title: "쓰레기 버리기", difficulty: "easy" },
  { title: "청소기 돌리기", difficulty: "normal" },
  { title: "빨래 돌리기", difficulty: "normal" },
  { title: "빨래 개기", difficulty: "normal" },
  { title: "화장실 청소", difficulty: "hard" },
  { title: "욕실 청소", difficulty: "hard" },
  { title: "창문 닦기", difficulty: "epic" },
];

export default function QuestList() {
  const { currentUser } = useUser();
  const { addPoints } = usePoints();
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("normal");
  const [loading, setLoading] = useState(true);
  const [showDefaults, setShowDefaults] = useState(false);
  const [completedAnim, setCompletedAnim] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "quests"), orderBy("created_at", "desc"));
    return onSnapshot(q, (snap) => {
      setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const addQuest = async (e) => {
    e.preventDefault();
    const title = newQuest.trim();
    if (!title) return;
    await addDoc(collection(db, "quests"), {
      title, difficulty: newDifficulty, status: "pending",
      created_by: currentUser?.id || "unknown",
      claimed_by: null, completed_by: null, created_at: serverTimestamp(),
    });
    setNewQuest("");
  };

  const addDefaultQuest = async (q) => {
    await addDoc(collection(db, "quests"), {
      title: q.title, difficulty: q.difficulty, status: "pending",
      created_by: "system", claimed_by: null, completed_by: null, created_at: serverTimestamp(),
    });
  };

  const claimQuest = async (quest) => {
    await updateDoc(doc(db, "quests", quest.id), { status: "claimed", claimed_by: currentUser?.id });
  };

  const completeQuest = async (quest) => {
    const diff = DIFFICULTY.find(d => d.id === quest.difficulty) || DIFFICULTY[1];
    await updateDoc(doc(db, "quests", quest.id), { status: "completed", completed_by: currentUser?.id });
    await addPoints(currentUser?.id, diff.points, `퀘스트 완료: ${quest.title}`);
    setCompletedAnim({ id: quest.id, points: diff.points });
    setTimeout(() => setCompletedAnim(null), 2000);
  };

  const deleteQuest = async (id) => { await deleteDoc(doc(db, "quests", id)); };

  const active = quests.filter(q => q.status !== "completed");
  const completed = quests.filter(q => q.status === "completed");
  const getUserLabel = (id) => USERS[id]?.label || id;
  const getUserEmoji = (id) => USERS[id]?.emoji || "👤";

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">⚔️</span>
        <h2>가사 퀘스트</h2>
        <button className="header-add-btn" onClick={() => setShowDefaults(!showDefaults)}>
          {showDefaults ? "닫기" : "기본 추가"}
        </button>
        <span className="badge">{active.length}</span>
      </div>

      {showDefaults && (
        <div className="default-quest-grid">
          {DEFAULT_QUESTS.map(q => {
            const diff = DIFFICULTY.find(d => d.id === q.difficulty);
            return (
              <button key={q.title} className="default-quest-btn" onClick={() => addDefaultQuest(q)}>
                {diff.emoji} {q.title} <span className="default-pt">+{diff.points}</span>
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={addQuest} className="add-form quest-add-form">
        <input type="text" value={newQuest} onChange={e => setNewQuest(e.target.value)}
          placeholder="퀘스트 추가..." className="add-input" />
        <div className="difficulty-row">
          {DIFFICULTY.map(d => (
            <button key={d.id} type="button"
              className={`diff-btn ${newDifficulty === d.id ? "active" : ""}`}
              onClick={() => setNewDifficulty(d.id)} title={`${d.label} +${d.points}pt`}>
              {d.emoji}
            </button>
          ))}
          <button type="submit" className="add-btn">+</button>
        </div>
      </form>

      {loading ? <p className="loading-text">불러오는 중...</p> : (
        <ul className="item-list">
          {active.map(quest => {
            const diff = DIFFICULTY.find(d => d.id === quest.difficulty) || DIFFICULTY[1];
            const isAnim = completedAnim?.id === quest.id;
            return (
              <li key={quest.id} className={`quest-row status-${quest.status}${isAnim ? " quest-complete-anim" : ""}`}>
                <span className="quest-diff-dot">{diff.emoji}</span>
                <div className="quest-info">
                  <div className="quest-title-row">
                    <span className="quest-title">{quest.title}</span>
                    <span className="quest-pts">+{diff.points}pt</span>
                  </div>
                  {quest.status === "claimed" && quest.claimed_by && (
                    <span className="quest-claimed-msg">{getUserEmoji(quest.claimed_by)} {getUserLabel(quest.claimed_by)}이(가) 하러 갔어요</span>
                  )}
                </div>
                {isAnim && <span className="point-burst">+{completedAnim.points}pt ✨</span>}
                <div className="quest-actions">
                  {quest.status === "pending" && (
                    <button className="action-btn claim-btn" onClick={() => claimQuest(quest)}>내가 할게요</button>
                  )}
                  {quest.status === "claimed" && (
                    <button className="action-btn complete-btn" onClick={() => completeQuest(quest)}>완료!</button>
                  )}
                  <button className="delete-btn" onClick={() => deleteQuest(quest.id)}>✕</button>
                </div>
              </li>
            );
          })}
          {completed.length > 0 && <li className="completed-divider"><span>완료</span></li>}
          {completed.map(quest => {
            const diff = DIFFICULTY.find(d => d.id === quest.difficulty) || DIFFICULTY[1];
            return (
              <li key={quest.id} className="quest-row status-completed">
                <span className="quest-diff-dot">{diff.emoji}</span>
                <div className="quest-info">
                  <span className="quest-title">{quest.title}</span>
                  {quest.completed_by && (
                    <span className="quest-done-msg">{getUserEmoji(quest.completed_by)} {getUserLabel(quest.completed_by)} 완료 +{diff.points}pt</span>
                  )}
                </div>
                <button className="delete-btn" onClick={() => deleteQuest(quest.id)}>✕</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
