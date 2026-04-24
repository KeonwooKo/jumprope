"use client";

import { Icon } from "@/components/Icon";
import type { StoreItem } from "@/lib/mock/store-items";

type Props = {
  items: StoreItem[];
  selectedId?: string;
  onSelect?: (item: StoreItem) => void;
};

export function StoreGrid({ items, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => {
        const isSelected = selectedId === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onSelect?.(it)}
            className={
              "relative bg-white border-[1.5px] rounded-xl p-2 text-left cursor-pointer transition-colors " +
              (isSelected
                ? "border-k-blue ring-2 ring-k-blue bg-k-blue-soft"
                : it.owned
                ? "border-k-blue"
                : "border-line hover:border-k-blue-soft-2")
            }
          >
            <div className="aspect-square rounded-lg bg-panel-sub grid place-items-center mb-1.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-k-blue-soft-2" />
            </div>
            <div className="text-[11px] font-bold text-ink truncate">{it.name}</div>
            <div className="flex items-center justify-between mt-0.5">
              {isSelected ? (
                <span className="text-[10px] font-bold text-k-blue-depth flex items-center gap-0.5">
                  <Icon name="check" className="w-3 h-3" /> 착용 중
                </span>
              ) : it.owned ? (
                <span className="text-[10px] font-bold text-ink-sub flex items-center gap-0.5">
                  <Icon name="check" className="w-3 h-3" /> 보유
                </span>
              ) : (
                <span className="text-[10px] font-num font-bold text-ink flex items-center gap-0.5">
                  <Icon name="coin" className="w-3 h-3 text-gold" /> {it.price}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
