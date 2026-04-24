export type RankEntry = {
  rank: number;
  memberId: string;
  count: number;
};

export const rankings: RankEntry[] = [
  { rank: 1,  memberId: "m10", count: 8450 },
  { rank: 2,  memberId: "m03", count: 7120 },
  { rank: 3,  memberId: "m07", count: 6240 },
  { rank: 4,  memberId: "m02", count: 5340 },
  { rank: 5,  memberId: "m01", count: 4820 },
  { rank: 6,  memberId: "m05", count: 4100 },
  { rank: 7,  memberId: "m09", count: 3720 },
  { rank: 8,  memberId: "m06", count: 2980 },
  { rank: 9,  memberId: "m04", count: 2100 },
  { rank: 10, memberId: "m08", count: 1580 },
];
