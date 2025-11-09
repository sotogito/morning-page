# 아키텍처

## Layer-based Structure

```
src/
├── pages/                      # Page Layer - 페이지 컴포넌트
│   ├── LoginPage/
│   │   └── LoginPage.jsx
│   └── EditorPage/
│       └── EditorPage.jsx
│
├── components/                 # Presentation Layer - UI 컴포넌트
│   ├── common/                 # 공통 컴포넌트
│   │   ├── Header/
│   │   │   └── Header.jsx
│   │   ├── TabNavigation/
│   │   │   └── TabNavigation.jsx
│   │   └── Resizer/
│   │       └── Resizer.jsx
│   ├── login/
│   │   └── LoginForm/
│   │       └── LoginForm.jsx
│   ├── editor/
│   │   ├── FileTree/
│   │   │   └── FileTree.jsx
│   │   ├── EditorPanel/
│   │   │   └── EditorPanel.jsx
│   │   └── PreviewPanel/
│   │       └── PreviewPanel.jsx
│   └── statistics/
│       └── GrassCalendar/
│           └── GrassCalendar.jsx
│
├── hooks/                      # Business Logic Layer - 커스텀 훅
│   ├── useEditor.js
│   ├── useTimer.js
│   ├── useGitHub.js
│   └── useAuth.js
│
├── services/                   # Data Access Layer - 외부 API/서비스
│   ├── githubService.js        # GitHub API 연동
│   └── supabaseService.js      # Supabase 연동
│
├── models/                     # Domain Layer - 타입/인터페이스
│   ├── types.js                # TypeScript 타입 정의
│   └── constants.js            # 상수
│
├── utils/                      # Utility Layer
│   ├── markdown.js             # 마크다운 파싱
│   ├── dateFormatter.js        # 날짜 포맷
│   └── validation.js           # 유효성 검사
│
├── styles/                     # Global Styles
│   ├── global.css
│   ├── variables.css           # CSS 변수 (색상, 간격 등)
│   └── reset.css
│
├── App.jsx
└── main.jsx
```

## 컴포넌트 계층 구조

### LoginPage
```
LoginPage
└── LoginForm
```

### EditorPage
```
EditorPage
├── Header (공통)
├── TabNavigation (공통)
└── Content
    ├── [에디터 탭]
    │   ├── FileTree
    │   ├── Resizer (드래그 조절)
    │   ├── EditorPanel
    │   ├── Resizer (드래그 조절)
    │   └── PreviewPanel (토글 가능)
    └── [통계 탭]
        └── GrassCalendar
```

## 레이어별 역할

### 1. Page Layer
- 라우팅 단위의 페이지 컴포넌트
- 레이아웃 구성 및 컴포넌트 조합

### 2. Presentation Layer (Components)
- UI 렌더링만 담당
- 비즈니스 로직 없음
- Props를 통해 데이터 수신

### 3. Business Logic Layer (Hooks)
- 비즈니스 로직 처리
- 상태 관리
- 컴포넌트와 서비스 레이어 중간 다리

### 4. Data Access Layer (Services)
- 외부 API 통신
- 데이터 CRUD
- HTTP 요청/응답 처리

### 5. Domain Layer (Models)
- 데이터 타입 정의
- 상수 관리
- 비즈니스 규칙 정의

