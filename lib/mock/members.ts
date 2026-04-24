export type Member = {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  totalJumps: number;
};

export const members: Member[] = [
  { id: "m01", name: "김지우", avatarUrl: "/blueUI/character_01.png", level: 7,  xp: 62, streak: 12, totalJumps: 4820 },
  { id: "m02", name: "박서연", avatarUrl: "/blueUI/character_02.png", level: 9,  xp: 34, streak: 18, totalJumps: 5340 },
  { id: "m03", name: "이도현", avatarUrl: "/blueUI/character_03.png", level: 11, xp: 78, streak: 24, totalJumps: 7120 },
  { id: "m04", name: "최하늘", avatarUrl: "/blueUI/character_04.png", level: 5,  xp: 45, streak: 3,  totalJumps: 2100 },
  { id: "m05", name: "정유나", avatarUrl: "/blueUI/character_05.png", level: 8,  xp: 12, streak: 9,  totalJumps: 4100 },
  { id: "m06", name: "강민재", avatarUrl: "/blueUI/character_06.png", level: 6,  xp: 88, streak: 5,  totalJumps: 2980 },
  { id: "m07", name: "윤아린", avatarUrl: "/blueUI/character_07.png", level: 10, xp: 55, streak: 15, totalJumps: 6240 },
  { id: "m08", name: "임재윤", avatarUrl: "/blueUI/character_08.png", level: 4,  xp: 30, streak: 2,  totalJumps: 1580 },
  { id: "m09", name: "한지호", avatarUrl: "/blueUI/character_09.png", level: 7,  xp: 70, streak: 7,  totalJumps: 3720 },
  { id: "m10", name: "오수아", avatarUrl: "/blueUI/character_10.png", level: 12, xp: 22, streak: 30, totalJumps: 8450 },
];

export const currentMember: Member = members[0];

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}
