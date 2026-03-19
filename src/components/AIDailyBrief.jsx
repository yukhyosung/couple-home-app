// src/components/AIDailyBrief.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../lib/userContext";

export default function AIDailyBrief() {
  const { currentUser } = useUser();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [data, setData] = useState({ shopping: [], quests: [], routines: [], babyLogs: [] });

  // 데이터 수집
  useEffect(() => {
    const unsubs = [];

    const sq = query(collection(db, "shopping"), orderBy("created_at", "desc"));
    unsubs.push(onSnapshot(sq, snap => {
      setData(d => ({ ...d, shopping: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }));

    const qq = query(collection(db, "quests"), orderBy("created_at", "desc"));
    unsubs.push(onSnapshot(qq, snap => {
      setData(d => ({ ...d, quests: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }));

    const rq = query(collection(db, "routines"));
    unsubs.push(onSnapshot(rq, snap => {
      setData(d => ({ ...d, routines: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }));

    const bq = query(collection(db, "babyLogs"), orderBy("time", "desc"));
    unsubs.push(onSnapshot(bq, snap => {
      setData(d => ({ ...d, babyLogs: snap.docs.slice(0, 10).map(doc => ({ id: doc.id, ...doc.data() })) }));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  const generateBrief = async () => {
    setLoading(true);
    setBrief("");

    const uncheckedShopping = data.shopping.filter(i => !i.checked).map(i => i.title);
    const activeQuests = data.quests.filter(q => q.status !== "completed").map(q => q.title);
    const overdueRoutines = data.routines.filter(r => {
      if (!r.last_done_at) return true;
      const days = Math.floor((Date.now() - r.last_done_at.toDate()) / 86400000);
      return days > r.recommended_cycle_days;
    }).map(r => r.title);
    const recentBaby = data.babyLogs.slice(0, 3).map(l => `${l.type}: ${l.note || ""}`);

    const today = new Date().toLocaleDateString("ko-KR", { weekday: "long", month: "long", day: "numeric" });

    const prompt = `오늘은 ${today}입니다. 부부 가정 관리 앱의 현재 상태를 바탕으로 따뜻하고 친근한 한국어로 오늘의 브리핑을 작성해주세요.

현재 상태:
- 장보기 미완료 항목 (${uncheckedShopping.length}개): ${uncheckedShopping.join(", ") || "없음"}
- 활성 퀘스트 (${activeQuests.length}개): ${activeQuests.join(", ") || "없음"}
- 기한 지난 루틴 (${overdueRoutines.length}개): ${overdueRoutines.join(", ") || "없음"}
- 최근 아기 기록: ${recentBaby.join(", ") || "없음"}

다음 형식으로 3~4문장으로 간결하게 작성해주세요:
1. 오늘 날씨/분위기 느낌의 인사
2. 오늘 집중해야 할 것 1~2가지
3. 부부에게 따뜻한 응원 한마디

이모지를 적절히 사용하고, 말투는 친근하게 해주세요.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const result = await response.json();
      const text = result.content?.map(c => c.text || "").join("") || "브리핑 생성에 실패했어요.";
      setBrief(text);
      setLastGenerated(new Date());
    } catch (e) {
      setBrief("AI 브리핑을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    }
    setLoading(false);
  };

  return (
    <section className="card ai-brief-card">
      <div className="card-header">
        <span className="section-icon">🤖</span>
        <h2>AI 데일리 브리핑</h2>
        <button className="header-add-btn" onClick={generateBrief} disabled={loading}>
          {loading ? "생성 중..." : "브리핑 받기"}
        </button>
      </div>

      <div className="brief-body">
        {loading && (
          <div className="brief-loading">
            <span className="brief-dots">●●●</span>
            <p>오늘의 브리핑을 준비하고 있어요...</p>
          </div>
        )}
        {!loading && brief && (
          <>
            <p className="brief-text">{brief}</p>
            {lastGenerated && (
              <p className="brief-time">
                {lastGenerated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준
              </p>
            )}
          </>
        )}
        {!loading && !brief && (
          <p className="brief-placeholder">
            버튼을 눌러 오늘의 브리핑을 받아보세요 ✨
          </p>
        )}
      </div>
    </section>
  );
}
