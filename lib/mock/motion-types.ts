import type { JumpType } from "@/lib/use-jump-classification";

export type MotionDefinition = {
  id: JumpType;
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
  description: string;
  instructions: string[];
  tips: string[];
  // 판정 기준 (디버깅용)
  criteria: {
    key: string;
    label: string;
    threshold?: number;
  }[];
};

export const motionDefinitions: MotionDefinition[] = [
  {
    id: "basic",
    name: "모아뛰기",
    nameEn: "Basic Jump",
    emoji: "⬆️",
    color: "bg-slate-500",
    description: "발을 모으고 기본적으로 점프",
    instructions: [
      "발을 모으고 서세요",
      "양손으로 줄넘기를 잡으세요",
      "일정한 리듬으로 점프하세요",
    ],
    tips: [
      "무릎을 살짝 구부려 착지하세요",
      "시선은 정면을 유지하세요",
    ],
    criteria: [
      { key: "isCrossed", label: "발 교차 없음" },
      { key: "isWide", label: "발 벌림 없음" },
      { key: "isArmCrossed", label: "팔 교차 없음" },
    ],
  },
  {
    id: "cross",
    name: "X자 뛰기",
    nameEn: "Cross Jump",
    emoji: "✖️",
    color: "bg-red-500",
    description: "팔을 가슴 앞에서 교차하며 점프",
    instructions: [
      "점프하면서 양팔을 가슴 앞으로",
      "손목이 완전히 교차되도록",
      "가슴 높이를 유지하세요",
    ],
    tips: [
      "어깨 너비의 20% 이상 교차해야 인식됩니다",
      "양손의 높이를 비슷하게 유지하세요",
    ],
    criteria: [
      { key: "isArmCrossed", label: "팔 교차", threshold: 0.6 },
      { key: "wristHeight", label: "가슴 높이 유지" },
      { key: "crossDistance", label: "충분한 교차 거리" },
    ],
  },
  {
    id: "rock-paper",
    name: "보바위 뛰기",
    nameEn: "Rock-Paper Jump",
    emoji: "✊✋",
    color: "bg-emerald-500",
    description: "발을 모으고-벌리기를 반복",
    instructions: [
      "점프하며 발을 모으세요 (보)",
      "다음 점프에서 발을 벌리세요 (바위)",
      "교차 없이 반복하세요",
    ],
    tips: [
      "발이 교차되면 안됩니다",
      "일정한 리듬으로 반복하세요",
    ],
    criteria: [
      { key: "isWide", label: "좁음-넓음 반복" },
      { key: "isCrossed", label: "발 교차 없음" },
      { key: "alternating", label: "교대 패턴" },
    ],
  },
  {
    id: "zigzag",
    name: "지그재그 뛰기",
    nameEn: "Zigzag Jump",
    emoji: "↔️",
    color: "bg-orange-500",
    description: "발을 벌리고-교차하기를 반복",
    instructions: [
      "발을 벌려 점프",
      "다음 점프에서 발을 교차",
      "넓음-좁음교차 반복하세요",
    ],
    tips: [
      "발을 확실히 벌리세요",
      "교차 시 완전히 교차하세요",
    ],
    criteria: [
      { key: "isWide", label: "발 벌림" },
      { key: "isCrossed", label: "발 교차" },
      { key: "pattern", label: "지그재그 패턴" },
    ],
  },
  {
    id: "side-swing",
    name: "옆 흔들어 뛰기",
    nameEn: "Side Swing Jump",
    emoji: "↪️",
    color: "bg-purple-500",
    description: "좌우로 몸을 흔들며 점프",
    instructions: [
      "왼쪽으로 몸을 기울여 점프",
      "오른쪽으로 몸을 기울여 점프",
      "좌우 교대로 반복하세요",
    ],
    tips: [
      "발이 중심에서 벗어나야 합니다",
      "과도하게 기울이지 마세요",
    ],
    criteria: [
      { key: "sideDirection", label: "좌우 방향" },
      { key: "alternating", label: "좌우 교대" },
    ],
  },
];

export function getMotionDefinition(id: JumpType): MotionDefinition | undefined {
  return motionDefinitions.find((m) => m.id === id);
}

export function getMotionLabel(id: JumpType): string {
  return motionDefinitions.find((m) => m.id === id)?.name || id;
}

export function getMotionEmoji(id: JumpType): string {
  return motionDefinitions.find((m) => m.id === id)?.emoji || "❓";
}
