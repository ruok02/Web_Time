# Web_Time
3학년 웹 프로그래밍의 사이드 프로젝트(약속 관리 웹 애플리케이션)

프로젝트 기획 및 개발 계획서


I. 프로젝트 개요 및 정의 (IT 기획 부분) - 무엇을 만들 것인가?
1. 프로젝트명
약속을 지키는 습관, [꼬옥!]
→ 지각 패널티 관리 웹 애플리케이션


2. 개발 목표 - 서비스 목표
사용자가 약속 정보를 저장하고, 페널티를 설정하며, 약속 당일 간단한 체크인 로직을 통해 지각 여부를 판단하는 웹 애플리케이션을 만든다.
(JS를 활용하여 데이터 관리 및 시간 계산 로직 사용 예상)


3. 서비스 정의 (서비스의 목적과 핵심 가치 정의)
→ 지각 페널티 기능을 통해 친구들과의 약속을 잊지 않고 즐겁게 지킬수 있도록 돕는 동기 부여하는 웹 애플리케이션 (동적 웹 애플리케이션)
웹 페이지 ↔ 웹 애플리케이션의 차이는 존재함. (→ JavaScript 중요)


4. 기술 스택
프론트엔드 : HTML, CSS, JavaScript
데이터 저장: localStorage API 활용 → 서버/DB 대체 가능

+ 추가적 내용
프론트엔드 : HTML, CSS (Tailwind CSS), JavaScript
데이터 저장: localStorage API 활용 → 서버/DB 대체 가능
디자인: 반응형 웹 디자인 (모바일 우선)
폰트: Inter (Google Fonts)


5. 개발 기간 - 2025.11.04 ~ 2025.12.08 (5주)


6. 목표 사용자
약속이 많고 지각에 민감한 10~20대 학생들 및 친구 그룹
II. 서비스 구조 및 화면 설계
1. 메뉴 구조도
서비스의 전체 메뉴 계층 구조를 도식화
변경 가능: Home > 약속 등록, 약속 목록 > 약속 상세, 페널티 내역


2. 정보 구조도(IA)
화면에 노출되는 기능을 계층적으로 표현 (핵심 기능만)
약속 상세 > 
약속 정보 (제목, 장소, 시간) 
D-Day (남은 일수 표시)
참여자 명단 → 이름 목록 등 참여자 표현
페널티 내용 → 사전 약속 전에 페널티 내용 사전 협의 후 시행
체크인 버튼 → 약속장소에 도착해 버튼 클릭 시에 지각 여부 확인 가능

II. 서비스 구조 및 화면 설계
1. 메뉴 구조도 (Information Architecture - IA)

```
[Depth 0] index.html (랜딩/홈 페이지)
    ├── [Depth 1] login.html (로그인)
    │       └── [Depth 2] user.html (회원 전용 홈)
    │               ├── [Depth 3] 약속 등록 기능
    │               ├── [Depth 3] 약속 목록 표시
    │               └── [Depth 3] 페널티 내역 확인
    │
    ├── [Depth 1] signup.html (회원가입)
    │
    └── [Depth 1] 서비스 소개 섹션
```

**페이지 구조 설명:**
- `index.html`: 랜딩 페이지 (서비스 소개, 주요 기능, CTA)
- `login.html`: 로그인 페이지 (localStorage 기반 인증)
- `signup.html`: 회원가입 페이지 (사용자 정보 저장)
- `user.html`: 회원 전용 약속 관리 페이지 (로그인 필수)

2.1 추후 확장 계획서
약속 상세 >
약속 정보 (제목, 장소, 시간) → 시간표 공유, 시간 겹치는 부분 계산 기능 추가
D-Day (남은 일수 표시) → 알림 기능까지 추가
참여자 명단 → 초대 기능으로 받은 사람들로만 제한
페널티 내용 → 사전 약속 전에 페널티 내용 사전 협의 후 시행
체크인 버튼 → 장소 촬영, 인증 시에 지각 여부 확인 가능

3. 주요 기능 명세서
약속 등록: 약속일, 시간, 페널티 내용 입력
약속 목록: localStorage에 저장된 데이터 불러와 D-Day/지각 상태(예정/지각/완료) 동적 표시
체크인: ‘체크인’ 버튼 클릭 시 현재 시간과 약속 시간 비교 로직 실행

4. 기능 구현
MVP/규모 산정 - 소규모 프로젝트이기 때문에 규모 확대에서 집중으로 초점
위치 공유 기능은 일단 제외하고, localStorage 기반의 데이터 관리와 날짜/시간로직에 집중한다.

III. 개발 및 일정 계획 (정책 부분)
1. 핵심 로직 정의
지각 판단 룰 :
1. 약속 시간이 지난 후 ‘체크인’ 버튼을 클릭한 시간을 지각 시간으로 간주.
2. 지각 시간 > 약속 시간이라면, 해당 참여자는 ‘지각’ 상태로 분류, 패널티 활성화

2. 상태 값 정의
약속 상태: 예정(D-Day 표시), 진행 중(약속 당일), 지각 발생, 완료
참여자 상태: 미도착, 도착(시간 차이 표시(~분전 도착)), 지각

3. 주차별 개발 계획
1주차 - 기획서 완성 및 기본 구조(Layout) 개발
HTML/CSS: 메인, 목록, 등록 폼 페이지 레이아웃 완성.
폰트/색상 등 스타일 가이드 확정.

2주차 - 데이터 저장(CRUD - C/R) 및 목록 표시
약속 등록 폼 데이터 localStorage에 저장 및 목록에 동적으로 불러와 표시하는 로직 구현. (backend로 server에 저장하는 방식 미구현으로 JS 사용)

3주차 - 핵심 로직 구현 (시간/날짜) - Date 객체
D-Day 계산로직 구현 및 목록에 적용. 약속 수정(U), 삭제(D) 기능 구현하여 CRUD 완성.

4주차 - 핵심 기능 완성 (체크인)
체크인' 버튼 클릭 시 현재 시간 기록 및 약속 시간과의 비교 로직구현.
지각 여부에 따라 목록 상태 및 페널티 내용을 동적으로 변경/표시.

5주차 - 안정화, 발표 준비 및 시연 자료 제작.
버그 디버깅 및 사용자 테스트
CSS/UI 완성도 최종 검토
기획서 내용을 기반으로 발표 슬라이드 제작 및 시연 스크립트 작성

IV. 현재 구현 상태 (2025.11.08 기준)

✅ **완료된 작업:**
1. 정보 구조도(IA) 설계 및 시각화
2. 와이어프레임 디자인
3. 랜딩 페이지 구현 (index.html)
   - Hero Section (메인 홍보 영역)
   - 주요 기능 소개 (Features)
   - 이용 방법 안내 (How It Works)
   - CTA 버튼 배치
   - 반응형 디자인 적용
4. 로그인/회원가입 시스템 구현
   - login.html: 로그인 페이지
   - signup.html: 회원가입 페이지
   - localStorage 기반 인증 시스템
5. 회원 전용 페이지 구현 (user.html)
   - 기존 index.html을 user.html로 변경
   - 로그인 체크 로직 추가
   - 로그아웃 기능 추가

🔧 **진행 중인 작업:**
- 약속 등록 폼 데이터 처리 로직
- 약속 목록 동적 렌더링
- D-Day 계산 기능

📋 **향후 작업 계획:**
- 체크인 기능 구현 (지각 판단 로직)
- 약속 수정/삭제 기능 (CRUD 완성)
- 페널티 내역 페이지 구현
- UI/UX 개선 및 애니메이션 추가


V. 로컬 실행 방법

1. **웹 서버 실행 (Node.js 방법)**
   ```bash
   cd /home/user/webapp
   npm install
   npm start
   # 또는
   node server.js
   ```

2. **또는 Python 간단 서버**
   ```bash
   cd /home/user/webapp
   python3 -m http.server 8000
   ```

3. **브라우저에서 접속**
   - 랜딩 페이지: `http://localhost:8000/index.html`
   - 로그인: `http://localhost:8000/login.html`
   - 회원가입: `http://localhost:8000/signup.html`


VI. 데이터 구조 (localStorage)

**사용자 정보 (ko_og_users):**
```javascript
[
  {
    id: "timestamp",
    name: "홍길동",
    email: "user@example.com",
    password: "password123",
    createdAt: "2025-11-08T..."
  }
]
```

**약속 정보 (ko_og_appointments):**
```javascript
[
  {
    id: "uuid",
    title: "팀 회의",
    date: "2025-11-15",
    time: "14:00",
    place: "공학관 301호",
    penalty: "지각 시 커피 1잔",
    participants: ["홍길동", "김철수"],
    status: "예정" // 예정, 진행중, 완료, 지각발생
  }
]
```

**로그인 상태 (ko_og_logged_in):**
```javascript
"true" // 로그인 여부
```


VII. 참고 자료

- [정보구조도(IA) 및 와이어프레임 작성법](https://blog.naver.com/soomichip_/223127062784)
- Tailwind CSS Documentation
- localStorage API MDN Documentation


통합 모노레포 스타일
```
Web_Time
├─ backend
│  ├─ config
│  │  └─ dbConnect.js
│  └─ models
├─ frontend
│  ├─ public
│  │  ├─ images
│  │  │  ├─ homepage.jpeg
│  │  │  └─ 웹 페이지 깊이구조도.png
│  │  ├─ index.html
│  │  ├─ login.html
│  │  ├─ signup.html
│  │  └─ user.html
│  └─ src
│     ├─ app.js
│     └─ styles
│        └─ main.css
├─ package-lock.json
└─ README.md

```