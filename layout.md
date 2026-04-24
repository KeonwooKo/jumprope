# 줄넘기 체크 · MVP Layout 구조 (Phase 1)

## 목적
`public/layout_v0.1.html` 목업을 Next.js 16 + Tailwind v4로 구현. 백엔드 없이 더미데이터만 사용. "이런게 된다"를 보여주는 데모.

## 범위
12개 화면 중 **비게임 7개**만 구현. 게임 플레이(07·08·09·10·11)는 MediaPipe + R3F 연동과 함께 Phase 2에서.

### 대상 화면

| # | 라우트 | 화면 |
|---|---|---|
| 01 | `/login` | 로그인 (도장/회원 탭) |
| 02 | `/invite` | 초대코드 (6자리 OTP) |
| 03 | `/admin` | 어드민 홈 (KPI · 랭킹 · 세션) |
| 04 | `/admin/members/[id]` | 회원 상세 (출석 달력 · 기록 로그) |
| 05 | `/me` | 마이페이지 (레벨바 · 달력 · 주간 바차트) |
| 06 | `/play` | 게임 선택 (카드만, disabled) |
| 12 | `/store` | 캐릭터 꾸미기 (R3F 3D 프리뷰) · 스토어 |

### Non-goals
- 백엔드 / DB / 인증 없음 — 더미데이터만
- 카메라 · MediaPipe · 포즈 감지 없음 (Phase 2)
- 결제 없음 (구매 버튼은 낙관적 UI만)
- 실시간 랭킹 · 소켓 없음

## 사용자 플로우

```
/login ──[도장 탭]──▶ /admin ──▶ /admin/members/[id]
       └─[회원 탭]──▶ /invite(최초) ──▶ /me ──┬─▶ /play (카드만)
                                              └─▶ /store (3D 프리뷰)
```

## 디렉터리 구조

```
app/
├─ layout.tsx                         # Pretendard · globals.css · 메타
├─ page.tsx                           # 데모 허브 (7개 화면 링크)
│
├─ login/                             # 01
│  ├─ page.tsx
│  └─ _components/
│     ├─ LoginTabs.tsx
│     └─ LoginForm.tsx
│
├─ invite/                            # 02
│  ├─ page.tsx
│  └─ _components/OtpInput.tsx
│
├─ admin/
│  ├─ layout.tsx                      # 어드민 공통
│  ├─ page.tsx                        # 03
│  ├─ _components/
│  │  ├─ KpiRow.tsx
│  │  ├─ MemberRow.tsx
│  │  └─ RankMedal.tsx
│  └─ members/[id]/                   # 04
│     ├─ page.tsx
│     └─ _components/JumpLogList.tsx
│
├─ me/                                # 05
│  ├─ page.tsx
│  └─ _components/
│     ├─ LevelBar.tsx
│     ├─ WeeklyBarChart.tsx
│     └─ MiniRank.tsx
│
├─ play/                              # 06
│  ├─ page.tsx
│  └─ _components/GameCard.tsx
│
└─ store/                             # 12
   ├─ page.tsx
   └─ _components/
      ├─ CharacterPreview3D.tsx       # R3F, character-female-a.glb
      ├─ StoreTabs.tsx
      └─ StoreGrid.tsx

components/                           # 2+ 페이지에서 쓰이는 것만
├─ KButton.tsx                        # 전 화면
├─ KCard.tsx                          # 03 · 04 · 05 · 12
├─ KChip.tsx                          # 03 · 04 · 05 · 06 · 12
├─ Icon.tsx                           # 전 화면
├─ icons-sprite.tsx                   # <defs><symbol>
├─ MHeader.tsx                        # 03 · 04 · 05 · 12 (앱 상단바)
├─ TabBar.tsx                         # 05 · 06 · 12 (회원 하단 4탭)
└─ AttendanceCalendar.tsx             # 04 · 05 공용

lib/mock/                             # 더미 DB — 도메인별 분리
├─ members.ts
├─ rankings.ts
├─ sessions.ts
├─ kpis.ts
├─ games.ts
└─ store-items.ts

public/
├─ blueUI/                            # Kenney PNG (이미 있음)
├─ models/                            # character-female-a.glb 사용
└─ fonts/                             # Kenney-Future.ttf (추가 필요)
```

## 컴포넌트 소유 규칙

- **1개 페이지에서만 사용** → `app/<route>/_components/` (밑줄 폴더, 라우팅 제외)
- **2개 이상 페이지에서 사용** → `components/` 승격
- 처음엔 `_components/`에 두고 2번째 사용처 생길 때 승격 — 선제적 공유화 금지

## 뷰포트 정책

모바일 타깃. 데스크톱에서는 **컨테이너 max-width를 `md` 수준**으로 캡하고 중앙 정렬 → 태블릿 이하까지 자연스럽게 쓸 수 있게.

```tsx
// 각 페이지/레이아웃 루트에 적용
<div className="mx-auto w-full max-w-md min-h-dvh">{children}</div>
```

## 더미데이터 스키마 (핵심)

```ts
// lib/mock/members.ts
export type Member = {
  id: string; name: string; avatarUrl: string;
  level: number; xp: number;        // 0–100
  streak: number;                   // 연속 출석일
  totalJumps: number;
};

// lib/mock/sessions.ts
export type Session = {
  memberId: string; date: string;   // ISO
  game: "grassland" | "racing";
  count: number; combo: number;
};

// lib/mock/store-items.ts
export type StoreItem = {
  id: string; category: "skin" | "hat" | "outfit";
  name: string; price: number; thumbUrl: string; owned?: boolean;
};
```

## 스타일 규칙 (CLAUDE.md)

- 모든 스타일은 **Tailwind 유틸리티 클래스**로
- `<style>` / CSS 파일 / 인라인 `style` / CSS-in-JS 금지
- 단 `globals.css`는 `@theme` 토큰 / `@font-face` / `body` 리셋만 허용
- Kenney 블루 depth 버튼 등 복합 스타일은 `KButton` 컴포넌트에 Tailwind로 1회 캡슐화

## Next.js 16 주의

- dynamic route의 `params`는 Promise — `/admin/members/[id]/page.tsx`에서 `await props.params`
- Turbopack이 기본 (별도 플래그 불필요)
- `next lint` 제거됨 → `eslint` 직접 사용

## 의존성

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

MediaPipe 패키지는 Phase 2까지 **추가하지 않음**.

## 구현 순서

1. `globals.css` 토큰 + 공통 컴포넌트 (KButton/KCard/KChip/Icon/MHeader/TabBar/AttendanceCalendar)
2. 데모 허브 `/` — 7개 화면 링크
3. 01 로그인 → 02 초대코드
4. 05 마이페이지 (달력·레벨바·바차트)
5. 03 어드민 홈 → 04 회원 상세 (AttendanceCalendar 재사용)
6. 06 게임 선택
7. 12 스토어 (R3F 프리뷰)
