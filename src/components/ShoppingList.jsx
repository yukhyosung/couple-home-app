// src/components/ShoppingList.jsx
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../lib/userContext";

export default function ShoppingList() {
  const { currentUser } = useUser();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "shopping"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    const title = newItem.trim();
    if (!title) return;
    const duplicate = items.find(i => i.title.toLowerCase() === title.toLowerCase());
    if (duplicate) {
      alert("이미 목록에 있어요!");
      return;
    }
    await addDoc(collection(db, "shopping"), {
      title,
      checked: false,
      created_by: currentUser?.id || "unknown",
      created_at: serverTimestamp(),
    });
    setNewItem("");
  };

  const toggleItem = async (item) => {
    await updateDoc(doc(db, "shopping", item.id), {
      checked: !item.checked,
    });
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "shopping", id));
  };

  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  return (
    <section className="card">
      <div className="card-header">
        <span className="section-icon">🛒</span>
        <h2>장보기 목록</h2>
        <span className="badge">{unchecked.length}</span>
      </div>

      <form onSubmit={addItem} className="add-form">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="항목 추가..."
          className="add-input"
        />
        <button type="submit" className="add-btn">+</button>
      </form>

      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : (
        <ul className="item-list">
          {unchecked.map(item => (
            <li key={item.id} className="item-row">
              <button className="check-btn" onClick={() => toggleItem(item)}>
                <span className="checkbox" />
              </button>
              <span className="item-title">{item.title}</span>
              <button className="delete-btn" onClick={() => deleteItem(item.id)}>✕</button>
            </li>
          ))}
          {checked.map(item => (
            <li key={item.id} className="item-row checked">
              <button className="check-btn" onClick={() => toggleItem(item)}>
                <span className="checkbox checked-box">✓</span>
              </button>
              <span className="item-title">{item.title}</span>
              <button className="delete-btn" onClick={() => deleteItem(item.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
