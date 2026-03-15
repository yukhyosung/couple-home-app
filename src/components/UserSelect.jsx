// src/components/UserSelect.jsx
import { useUser, USERS } from "../lib/userContext";

export default function UserSelect() {
  const { selectUser } = useUser();

  return (
    <div className="user-select-screen">
      <div className="user-select-card">
        <div className="user-select-emoji">🏠</div>
        <h1>우리집</h1>
        <p>누구로 시작할까요?</p>
        <div className="user-buttons">
          {Object.values(USERS).map(user => (
            <button
              key={user.id}
              className="user-btn"
              onClick={() => selectUser(user.id)}
            >
              <span className="user-btn-emoji">{user.emoji}</span>
              <span>{user.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
