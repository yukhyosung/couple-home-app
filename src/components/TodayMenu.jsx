// src/components/TodayMenu.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, Timestamp, limit, doc, updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser, USERS } from "../lib/userContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { addHistoryLog } from "../lib/historyLogger";

const MEAL_TYPES = [
  { id: "breakfast", label: "아침", emoji: "🌅" },
  { id: "lunch",     label: "점심", emoji: "☀️" },
  { id: "dinner",    label: "저녁", emoji: "🌙" },
];

export default function TodayMenu() {
  const { currentUser } = useUser();
  const [menus, setMenus] = useState([]);
  const [activeMeal, setActiveMeal] = useState("dinner");
  const [newMenu, setNewMenu] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "menus"), orderBy("created_at", "desc"), limit(30));
    return onSnapshot(q, snap => {
      setMenus(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const addMenu = async (e) => {
    e.preventDefault();
    const menu = newMenu.trim();
    if (!menu) return;
    await addDoc(collection(db, "menus"), {
      menu,
      mealType: activeMeal,
      date: todayStr,
      decided_by: currentUser?.id,
      created_at: Timestamp.now(),
    });
    await addHistoryLog({ type: "menu", userId: currentUser?.id, reason: `${MEAL_TYPES.find(m=>m.id===activeMeal)?.label}: ${menu}` });
    setNewMenu("");
  };

  const todayMenus = menus.filter(m => m.date === todayStr);
  const historyMenus = menus.filter(m => m.date !== todayStr);

  // 날짜별로 그룹
  const grouped = {};
  historyMenus.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">🍽️</span>
        <h2>오늘 메뉴</h2>
        <button className="header-add-btn" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "오늘" : "히스토리"}
        </button>
      </div>

      {!showHistory ? (
        <>
          {/* 식사 타입 선택 */}
          <div className="meal-type-row">
            {MEAL_TYPES.map(type => (
              <button
                key={type.id}
                className={`meal-type-btn ${activeMeal === type.id ? "active" : ""}`}
                onClick={() => setActiveMeal(type.id)}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>

          {/* 입력 */}
          <form onSubmit={addMenu} className="add-form">
            <input
              type="text"
              value={newMenu}
              onChange={e => setNewMenu(e.target.value)}
              placeholder="오늘 뭐 먹을까요?"
              className="add-input"
            />
            <button type="submit" className="add-btn">+</button>
          </form>

          {/* 오늘 메뉴 */}
          {todayMenus.length === 0 ? (
            <p className="empty-hint">오늘 메뉴를 정해봐요 🍴</p>
          ) : (
            <ul className="menu-list">
              {MEAL_TYPES.map(type => {
                const items = todayMenus.filter(m => m.mealType === type.id);
                if (items.length === 0) return null;
                return (
                  <li key={type.id} className="menu-group">
                    <span className="menu-type-label">{type.emoji} {type.label}</span>
                    <div className="menu-items">
                      {items.map(item => (
                        <div key={item.id} className="menu-item">
                          <span className="menu-name">{item.menu}</span>
                          <span className="menu-by">
                            {USERS[item.decided_by]?.emoji} {USERS[item.decided_by]?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="menu-history">
          {Object.keys(grouped).length === 0 ? (
            <p className="empty-hint">아직 기록이 없어요</p>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 7)
              .map(([date, items]) => (
                <div key={date} className="history-day">
                  <div className="history-date">
                    {format(new Date(date), "M월 d일 (EEE)", { locale: ko })}
                  </div>
                  {items.map(item => {
                    const type = MEAL_TYPES.find(t => t.id === item.mealType);
                    return (
                      <div key={item.id} className="history-menu-item">
                        <span>{type?.emoji} {type?.label}</span>
                        <span className="history-menu-name">{item.menu}</span>
                        <span className="history-menu-by">{USERS[item.decided_by]?.emoji}</span>
                      </div>
                    );
                  })}
                </div>
              ))
          )}
        </div>
      )}
    </section>
  );
}
