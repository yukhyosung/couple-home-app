// src/components/ChoreBalance.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { USERS } from "../lib/userContext";

export default function ChoreBalance() {
  const [stats, setStats] = useState({ wife: 0, husband: 0 });
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // 퀘스트 완료 기록
    const qCompleted = query(
      collection(db, "quests"),
      where("status", "==", "completed")
    );

    // 루틴 완료 기록
    const rAll = query(collection(db, "routines"));

    let questStats = { wife: 0, husband: 0 };
    let routineStats = { wife: 0, husband: 0 };
    let recentList = [];

    const unsub1 = onSnapshot(qCompleted, snap => {
      questStats = { wife: 0, husband: 0 };
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.completed_by === "wife") questStats.wife++;
        else if (data.completed_by === "husband") questStats.husband++;

        recentList.push({
          title: data.title,
          by: data.completed_by,
          type: "퀘스트",
        });
      });
      setStats({ wife: questStats.wife + routineStats.wife, husband: questStats.husband + routineStats.husband });
      setRecentItems(recentList.slice(-5).reverse());
    });

    const unsub2 = onSnapshot(rAll, snap => {
      routineStats = { wife: 0, husband: 0 };
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.last_done_by === "wife") routineStats.wife++;
        else if (data.last_done_by === "husband") routineStats.husband++;
      });
      setStats({ wife: questStats.wife + routineStats.wife, husband: questStats.husband + routineStats.husband });
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  const total = stats.wife + stats.husband || 1;
  const wifePercent = Math.round((stats.wife / total) * 100);
  const husbandPercent = 100 - wifePercent;

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">⚖️</span>
        <h2>집안일 밸런스</h2>
      </div>

      <div className="balance-body">
        <div className="balance-bar-row">
          <span className="balance-label wife">👩 아내 {wifePercent}%</span>
          <span className="balance-label husband">남편 {husbandPercent}% 👨</span>
        </div>
        <div className="balance-bar">
          <div
            className="balance-fill wife-fill"
            style={{ width: `${wifePercent}%` }}
          />
          <div
            className="balance-fill husband-fill"
            style={{ width: `${husbandPercent}%` }}
          />
        </div>
        <div className="balance-counts">
          <span>{stats.wife}건</span>
          <span>{stats.husband}건</span>
        </div>

        {total === 1 && (
          <p className="balance-empty">아직 완료한 일이 없어요. 함께 시작해봐요! 💪</p>
        )}

        {recentItems.length > 0 && (
          <ul className="balance-recent">
            {recentItems.map((item, i) => (
              <li key={i} className="balance-recent-item">
                <span>{USERS[item.by]?.emoji} {USERS[item.by]?.label}</span>
                <span className="balance-recent-title">{item.title}</span>
                <span className="balance-recent-type">{item.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
