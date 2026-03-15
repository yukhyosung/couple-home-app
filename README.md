# 🏠 우리집 앱 - MVP

부부를 위한 간단한 가정 관리 앱입니다.

---

## 📋 기능

| 기능 | 설명 |
|------|------|
| 🛒 장보기 목록 | 실시간 공유 체크리스트. 중복 방지 기능 포함 |
| ⚡ 퀘스트 | 일회성 할 일. 대기→수행 중→완료 상태 관리 |
| 🔄 루틴 | 반복 집안일. 주기 기반 색상 상태 표시 (초록/주황/빨강) |

---

## 🚀 배포 방법 (5단계)

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 (예: `우리집`)
4. Firestore Database → **데이터베이스 만들기** → **테스트 모드**로 시작

### 2. Firebase 웹 앱 등록

1. Firebase Console → 프로젝트 설정 (⚙️)
2. **앱 추가** → 웹 (`</>`) 클릭
3. 앱 닉네임 입력 후 **앱 등록**
4. 아래와 같은 `firebaseConfig` 코드가 나타납니다:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. 앱에 Firebase 설정 입력

`src/lib/firebase.js` 파일을 열고, `firebaseConfig` 값을 위에서 복사한 값으로 교체하세요.

```js
const firebaseConfig = {
  apiKey: "여기에 붙여넣기",
  authDomain: "여기에 붙여넣기",
  // ...
};
```

### 4. GitHub에 올리기

```bash
git init
git add .
git commit -m "우리집 앱 MVP"
git remote add origin https://github.com/내아이디/couple-home-app.git
git push -u origin main
```

### 5. Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. **Add New Project** → 위에서 만든 GitHub 레포 선택
3. **Deploy** 클릭
4. 배포 완료! URL이 생성됩니다 (예: `https://couple-home-app.vercel.app`)

---

## 💻 로컬 실행

```bash
npm install
npm start
```

---

## 📁 프로젝트 구조

```
src/
├── lib/
│   ├── firebase.js       # Firebase 연결 설정 ← 여기 수정 필요!
│   └── userContext.js    # 사용자 상태 관리 (아내/남편)
├── components/
│   ├── UserSelect.jsx    # 초기 사용자 선택 화면
│   ├── TodaySummary.jsx  # 상단 오늘 요약
│   ├── ShoppingList.jsx  # 장보기 목록
│   ├── QuestList.jsx     # 퀘스트 목록
│   └── RoutineList.jsx   # 루틴 관리
├── App.jsx               # 메인 앱
└── App.css               # 스타일
```

---

## 🔒 보안 참고

현재는 Firestore 규칙이 `allow read, write: if true` (모두 허용)로 되어 있습니다.

**프라이빗 앱이지만** 나중에 Firebase Auth를 추가하면 보안을 강화할 수 있습니다.  
MVP에서는 URL을 아는 사람만 접근할 수 있는 정도로 충분합니다.

---

## 📱 사용 방법

1. 앱에 처음 접속하면 **아내 / 남편** 선택 화면이 나옵니다
2. 본인 역할 선택 → 다음 번 접속 시 자동 기억
3. 오른쪽 상단의 이모지 버튼으로 사용자 전환 가능
4. 두 사람이 같은 URL에서 접속하면 **실시간으로 동기화**됩니다

---

## 🛠️ 향후 개선 아이디어 (v2)

- [ ] Firebase Auth로 실제 로그인
- [ ] 알림 기능 (FCM)
- [ ] 역할 분담 통계
- [ ] 가족 일정 캘린더
- [ ] 음성 입력으로 장보기 항목 추가
