// src/lib/userContext.js
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export const USERS = {
  wife: { id: "wife", label: "아내", emoji: "👩" },
  husband: { id: "husband", label: "남편", emoji: "👨" },
};

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const selectUser = (userId) => {
    const user = USERS[userId];
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ currentUser, selectUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
