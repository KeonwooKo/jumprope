"use client";

import type { StoreItem } from "@/lib/mock/store-items";

type Category = StoreItem["category"];

type Props = {
  value: Category;
  onChange: (v: Category) => void;
};

const tabs: { id: Category; label: string }[] = [
  { id: "skin",   label: "캐릭터" },
  { id: "hat",    label: "모자" },
  { id: "outfit", label: "의상" },
];

export function StoreTabs({ value, onChange }: Props) {
  return (
    <div className="bg-panel-sub border-[1.5px] border-line p-1 rounded-xl grid grid-cols-3">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={
              "py-2 rounded-[9px] text-center font-bold text-[12px] cursor-pointer " +
              (active
                ? "text-white border-[1.5px] border-k-blue-outline bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-2.5px_0_var(--color-k-blue-depth)]"
                : "text-ink-sub")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
