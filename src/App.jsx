// src/App.jsx
import { UserProvider, useUser } from "./lib/userContext";
import UserSelect from "./components/UserSelect";
import TodaySummary from "./components/TodaySummary";
import ShoppingList from "./components/ShoppingList";
import QuestList from "./components/QuestList";
import RoutineList from "./components/RoutineList";
import AIDailyBrief from "./components/AIDailyBrief";
import BabyTracker from "./components/BabyTracker";
import ChoreBalance from "./components/ChoreBalance";
import MoodCheck from "./components/MoodCheck";
import DayCounter from "./components/DayCounter";
import "./App.css";

function Dashboard() {
  const { currentUser } = useUser();
  if (!currentUser) return <UserSelect />;

  return (
    <div className="app-container">
      <TodaySummary />
      <main className="dashboard">
        <DayCounter />
        <AIDailyBrief />
        <MoodCheck />
        <ShoppingList />
        <QuestList />
        <RoutineList />
        <ChoreBalance />
        <BabyTracker />
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
