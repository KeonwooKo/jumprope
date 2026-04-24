"use client";

import { useState } from "react";
import { MHeader } from "@/components/MHeader";
import { Icon } from "@/components/Icon";
import { CharacterPreview3D } from "@/components/CharacterPreview3D";
import { StoreTabs } from "./_components/StoreTabs";
import { StoreGrid } from "./_components/StoreGrid";
import { storeItems, coins, type StoreItem } from "@/lib/mock/store-items";

const defaultSkin = storeItems.find(
  (i) => i.category === "skin" && i.owned,
)!;

export default function StorePage() {
  const [category, setCategory] = useState<StoreItem["category"]>("skin");
  const [equippedSkin, setEquippedSkin] = useState<StoreItem>(defaultSkin);
  const items = storeItems.filter((i) => i.category === category);

  function handleSelect(item: StoreItem) {
    if (item.category === "skin" && item.modelUrl) {
      setEquippedSkin(item);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <MHeader
        title="캐릭터 꾸미기"
        backHref="/me"
        right={
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#fff6d0] border border-[#ffe38a] text-[#8a6200]">
            <Icon name="coin" className="w-4 h-4 text-gold-dark" />
            <span className="font-num text-[13px] font-extrabold">{coins.toLocaleString()}</span>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <CharacterPreview3D modelUrl={equippedSkin.modelUrl} />

        <StoreTabs value={category} onChange={setCategory} />

        <StoreGrid
          items={items}
          selectedId={category === "skin" ? equippedSkin.id : undefined}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
