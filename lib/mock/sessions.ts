export type Session = {
  memberId: string;
  date: string;
  game: "grassland" | "racing";
  count: number;
  combo: number;
  stars: 1 | 2 | 3;
};

export const sessions: Session[] = [
  { memberId: "m01", date: "2026-04-23", game: "grassland", count: 142, combo: 34, stars: 3 },
  { memberId: "m01", date: "2026-04-22", game: "racing",    count: 98,  combo: 21, stars: 2 },
  { memberId: "m01", date: "2026-04-21", game: "grassland", count: 156, combo: 40, stars: 3 },
  { memberId: "m01", date: "2026-04-20", game: "grassland", count: 88,  combo: 18, stars: 2 },
  { memberId: "m01", date: "2026-04-19", game: "racing",    count: 124, combo: 28, stars: 3 },
  { memberId: "m01", date: "2026-04-18", game: "grassland", count: 76,  combo: 14, stars: 1 },
  { memberId: "m01", date: "2026-04-17", game: "grassland", count: 110, combo: 22, stars: 2 },
  { memberId: "m01", date: "2026-04-16", game: "racing",    count: 134, combo: 31, stars: 3 },
  { memberId: "m01", date: "2026-04-15", game: "grassland", count: 92,  combo: 19, stars: 2 },
  { memberId: "m01", date: "2026-04-14", game: "grassland", count: 148, combo: 36, stars: 3 },

  { memberId: "m03", date: "2026-04-23", game: "racing",    count: 210, combo: 52, stars: 3 },
  { memberId: "m03", date: "2026-04-22", game: "grassland", count: 188, combo: 44, stars: 3 },
  { memberId: "m03", date: "2026-04-21", game: "racing",    count: 172, combo: 38, stars: 3 },
  { memberId: "m03", date: "2026-04-20", game: "grassland", count: 165, combo: 36, stars: 3 },
  { memberId: "m03", date: "2026-04-19", game: "racing",    count: 198, combo: 48, stars: 3 },
];

export function getSessionsByMember(memberId: string): Session[] {
  return sessions.filter((s) => s.memberId === memberId);
}

export function getAttendanceDates(memberId: string): string[] {
  const unique = new Set(sessions.filter((s) => s.memberId === memberId).map((s) => s.date));
  return Array.from(unique);
}

export type WeeklyBar = { day: string; count: number; isToday?: boolean };

export const weeklyBars: WeeklyBar[] = [
  { day: "월", count: 88 },
  { day: "화", count: 110 },
  { day: "수", count: 134 },
  { day: "목", count: 92 },
  { day: "금", count: 148 },
  { day: "토", count: 156 },
  { day: "일", count: 142, isToday: true },
];
