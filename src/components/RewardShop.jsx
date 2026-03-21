// src/components/RewardShop.jsx
import { useState } from "react";
import { useUser, USERS } from "../lib/userContext";
import { usePoints, REWARDS } from "../lib/pointsContext";

export default function RewardShop() {
  const { currentUser } = useUser();
  const { points, spendPoints } = usePoints();
  const [buying, setBuying] = useState(null);
  const [successAnim, setSuccessAnim] = useState(null);

  const handleBuy = async (reward) => {
    if (buying) return;
    const myPoints = points[currentUser?.id] || 0;
    if (myPoints < reward.cost) {
      alert(`포인트가 부족해요! (현재 ${myPoints}pt, 필요 ${reward.cost}pt)`);
      return;
    }
    setBuying(reward.id);
    const ok = await spendPoints(currentUser?.id, reward.cost, reward.label);
    if (ok) {
      setSuccessAnim(reward.id);
      setTimeout(() => setSuccessAnim(null), 2000);
    }
    setBuying(null);
  };

  const myPts = points[currentUser?.id] || 0;
  const otherUser = Object.values(USERS).find(u => u.id !== currentUser?.id);
  const otherPts = points[otherUser?.id] || 0;

  return (
    <section className="card reward-card">
      <div className="card-header">
        <span className="section-icon">🎁</span>
        <h2>리워드 샵</h2>
      </div>

      {/* 포인트 현황 */}
      <div className="points-display">
        <div className="points-me">
          <span className="points-user-emoji">{currentUser?.emoji}</span>
          <div className="points-info">
            <span className="points-name">{currentUser?.label}</span>
            <span className="points-value">{myPts.toLocaleString()}pt</span>
          </div>
        </div>
        <div className="points-divider">VS</div>
        <div className="points-other">
          <div className="points-info" style={{ textAlign: "right" }}>
            <span className="points-name">{otherUser?.label}</span>
            <span className="points-value">{otherPts.toLocaleString()}pt</span>
          </div>
          <span className="points-user-emoji">{otherUser?.emoji}</span>
        </div>
      </div>

      {/* 리워드 목록 */}
      <div className="reward-grid">
        {REWARDS.map(reward => {
          const canAfford = myPts >= reward.cost;
          const isSuccess = successAnim === reward.id;
          return (
            <button
              key={reward.id}
              className={`reward-item ${canAfford ? "" : "reward-locked"} ${isSuccess ? "reward-success" : ""}`}
              onClick={() => handleBuy(reward)}
              disabled={buying === reward.id}
            >
              <span className="reward-emoji">{reward.emoji}</span>
              <span className="reward-label">{reward.label}</span>
              <span className={`reward-cost ${canAfford ? "can-afford" : "cant-afford"}`}>
                {isSuccess ? "구매완료! 🎉" : `${reward.cost}pt`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
