// src/App.jsx
import { UserProvider, useUser } from "./lib/userContext";
import { PointsProvider } from "./lib/pointsContext";
import UserSelect from "./components/UserSelect";
import TodaySummary from "./components/TodaySummary";
import ShoppingList from "./components/ShoppingList";
import QuestList from "./components/QuestList";
import RoutineList from "./components/RoutineList";
import BabyTracker from "./components/BabyTracker";
import DayCounter from "./components/DayCounter";
import RewardShop from "./components/RewardShop";
import TodayMenu from "./components/TodayMenu";
import ActivityHistory from "./components/ActivityHistory";
import "./App.css";

function Dashboard() {
  const { currentUser } = useUser();
  if (!currentUser) return <UserSelect />;

  return (
    <div className="app-container">
      <TodaySummary />
      <main className="dashboard">
        <DayCounter />
        <RewardShop />
        <TodayMenu />
        <ShoppingList />
        <QuestList />
        <RoutineList />
        <BabyTracker />
        <ActivityHistory />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <PointsProvider>
        <Dashboard />
      </PointsProvider>
    </UserProvider>
  );
}
