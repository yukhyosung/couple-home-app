// src/App.jsx
import { UserProvider, useUser } from "./lib/userContext";
import UserSelect from "./components/UserSelect";
import TodaySummary from "./components/TodaySummary";
import ShoppingList from "./components/ShoppingList";
import QuestList from "./components/QuestList";
import RoutineList from "./components/RoutineList";
import "./App.css";

function Dashboard() {
  const { currentUser } = useUser();
  if (!currentUser) return <UserSelect />;

  return (
    <div className="app-container">
      <TodaySummary />
      <main className="dashboard">
        <ShoppingList />
        <QuestList />
        <RoutineList />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}
