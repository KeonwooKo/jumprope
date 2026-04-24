export type StoreItem = {
  id: string;
  category: "skin" | "hat" | "outfit";
  name: string;
  price: number;
  thumbUrl: string;
  owned?: boolean;
  modelUrl?: string;
};

export const storeItems: StoreItem[] = [
  { id: "s01", category: "skin",   name: "기본 캐릭터",   price: 0,    thumbUrl: "/blueUI/character_01.png", owned: true, modelUrl: "/models/character-female-d.glb" },
  { id: "s02", category: "skin",   name: "캐릭터 A",      price: 600,  thumbUrl: "/blueUI/character_02.png",              modelUrl: "/models/character-female-a.glb" },
  { id: "s03", category: "skin",   name: "캐릭터 B",      price: 800,  thumbUrl: "/blueUI/character_03.png",              modelUrl: "/models/character-female-b.glb" },
  { id: "s04", category: "skin",   name: "캐릭터 C",      price: 1000, thumbUrl: "/blueUI/character_04.png",              modelUrl: "/models/character-female-c.glb" },
  { id: "s05", category: "skin",   name: "캐릭터 E",      price: 1200, thumbUrl: "/blueUI/character_05.png",              modelUrl: "/models/character-female-e.glb" },

  { id: "h01", category: "hat",    name: "파란 캡모자",   price: 200, thumbUrl: "/blueUI/hat_blue.png", owned: true },
  { id: "h02", category: "hat",    name: "왕관",          price: 600, thumbUrl: "/blueUI/hat_crown.png" },
  { id: "h03", category: "hat",    name: "파티모자",      price: 400, thumbUrl: "/blueUI/hat_party.png" },
  { id: "h04", category: "hat",    name: "해적모자",      price: 700, thumbUrl: "/blueUI/hat_pirate.png" },

  { id: "o01", category: "outfit", name: "체육복",        price: 500, thumbUrl: "/blueUI/outfit_pe.png" },
  { id: "o02", category: "outfit", name: "정장",          price: 900, thumbUrl: "/blueUI/outfit_suit.png" },
  { id: "o03", category: "outfit", name: "도복",          price: 800, thumbUrl: "/blueUI/outfit_doboc.png" },
  { id: "o04", category: "outfit", name: "망토",          price: 1000,thumbUrl: "/blueUI/outfit_cape.png" },
];

export const coins = 2340;
