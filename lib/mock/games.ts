export type Game = {
  id: "grassland" | "racing" | "demo";
  title: string;
  desc: string;
  route: string;
  available: boolean;
  accent: string;
};

export const games: Game[] = [
  {
    id: "demo",
    title: "🔥 동작 인식 데모",
    desc: "5가지 줄넘기 동작 실시간 인식",
    route: "/admin/play/JumpDemo",
    available: true,
    accent: "from-violet-400 to-fuchsia-500",
  },
  {
    id: "grassland",
    title: "초원 점프",
    desc: "풀밭을 뛰어넘으며 콤보 쌓기",
    route: "/admin/play/BasicJump",
    available: true,
    accent: "from-emerald-400 to-emerald-600",
  },
  {
    id: "racing",
    title: "자동차 레이싱",
    desc: "속도 게이지 채우고 1등 하기",
    route: "/admin/play/RacingJump",
    available: true,
    accent: "from-orange-400 to-rose-500",
  },
];

export type Tournament = {
  title: string;
  dday: number;
  prize: string;
};

export const tournament: Tournament = {
  title: "봄맞이 줄넘기 대회",
  dday: 7,
  prize: "1등 · 황금 줄넘기 뱃지",
};
