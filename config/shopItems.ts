export type TapSkinId =
  | "tap-classic"
  | "tap-gold"
  | "tap-diamond"
  | "tap-neon"
  | "tap-galaxy";

export type AvatarFrameId =
  | "frame-classic"
  | "frame-green-neon"
  | "frame-gold-vip"
  | "frame-diamond"
  | "frame-royal";

export type CharmId =
  | "charm-lucky-leaf"
  | "charm-dice"
  | "charm-lucky-star"
  | "charm-cherry"
  | "charm-jackpot-bell"
  | "charm-casino-chip"
  | "charm-golden-crown"
  | "charm-treasure-chest";

export type TapSkinItem = {
  id: TapSkinId;
  name: string;
  description: string;
  image: string;
  price: number;

  offsetX: number;
  offsetY: number;
  scale: number;
};

export type AvatarFrameItem = {
  id: AvatarFrameId;
  name: string;
  description: string;
  image: string;
  price: number;

  offsetX: number;
  offsetY: number;
  scale: number;
};

export type CharmItem = {
  id: CharmId;
  name: string;
  description: string;
  image: string;
  price: number;
  slot: number;
};

export const DEFAULT_TAP_SKIN_ID: TapSkinId =
  "tap-classic";

export const DEFAULT_AVATAR_FRAME_ID: AvatarFrameId =
  "frame-classic";

export const TAP_SKINS: readonly TapSkinItem[] = [
  {
    id: "tap-classic",
    name: "Classic Clover",
    description: "Default green clover tap button",
    image: "/images/shop/tap-classic.png",
    price: 0,

    offsetX: -2,
    offsetY: -5,
    scale: 1,
  },
  {
    id: "tap-gold",
    name: "Golden Clover",
    description: "Premium golden clover tap button",
    image: "/images/shop/tap-gold.png",
    price: 25_000,

    offsetX: 2,
    offsetY: -1,
    scale: 1,
  },
  {
    id: "tap-diamond",
    name: "Diamond Clover",
    description: "Blue crystal clover tap button",
    image: "/images/shop/tap-diamond.png",
    price: 75_000,

    offsetX: 6,
    offsetY: 4,
    scale: 1,
  },
  {
    id: "tap-neon",
    name: "Neon Clover",
    description: "Bright green neon tap button",
    image: "/images/shop/tap-neon.png",
    price: 150_000,

    offsetX: -2,
    offsetY: -1,
    scale: 1,
  },
  {
    id: "tap-galaxy",
    name: "Galaxy Clover",
    description: "Purple cosmic clover tap button",
    image: "/images/shop/tap-galaxy.png",
    price: 300_000,

    offsetX: 15,
    offsetY: 1,
    scale: 0.99,
  },
] as const;

export const AVATAR_FRAMES: readonly AvatarFrameItem[] = [
  {
    id: "frame-classic",
    name: "Classic Frame",
    description: "Default silver avatar frame",
    image: "/images/shop/frame-classic.png",
    price: 0,

    offsetX: -1,
    offsetY: 0,
    scale: 1.1,
  },
  {
    id: "frame-green-neon",
    name: "Green Neon",
    description: "Glowing green avatar frame",
    image: "/images/shop/frame-green-neon.png",
    price: 20_000,

    offsetX: 2,
    offsetY: 1,
    scale: 1.05,
  },
  {
    id: "frame-gold-vip",
    name: "Gold VIP",
    description: "Golden VIP avatar frame",
    image: "/images/shop/frame-gold-vip.png",
    price: 60_000,

    offsetX: 0,
    offsetY: 0,
    scale: 1.15,
  },
  {
    id: "frame-diamond",
    name: "Diamond Frame",
    description: "Blue crystal avatar frame",
    image: "/images/shop/frame-diamond.png",
    price: 150_000,

    offsetX: 0,
    offsetY: 1,
    scale: 1.15,
  },
  {
    id: "frame-royal",
    name: "Royal Frame",
    description: "Purple and gold royal frame",
    image: "/images/shop/frame-royal.png",
    price: 350_000,

    offsetX: 2,
    offsetY: 0,
    scale: 1.05,
  },
] as const;

export const CHARMS: readonly CharmItem[] = [
  {
    id: "charm-lucky-leaf",
    name: "Lucky Leaf",
    description: "A small lucky clover charm",
    image: "/images/shop/charm-lucky-leaf.png",
    price: 2_000,
    slot: 1,
  },
  {
    id: "charm-dice",
    name: "Lucky Dice",
    description: "Casino dice collectible charm",
    image: "/images/shop/charm-dice.png",
    price: 8_000,
    slot: 2,
  },
  {
    id: "charm-lucky-star",
    name: "Lucky Star",
    description: "A bright casino star charm",
    image: "/images/shop/charm-lucky-star.png",
    price: 12_000,
    slot: 3,
  },
  {
    id: "charm-cherry",
    name: "Cherry",
    description: "Classic slot-machine cherry charm",
    image: "/images/shop/charm-cherry.png",
    price: 18_000,
    slot: 4,
  },
  {
    id: "charm-jackpot-bell",
    name: "Jackpot Bell",
    description: "Golden jackpot bell charm",
    image: "/images/shop/charm-jackpot-bell.png",
    price: 25_000,
    slot: 5,
  },
  {
    id: "charm-casino-chip",
    name: "Casino Chip",
    description: "Premium casino chip charm",
    image: "/images/shop/charm-casino-chip.png",
    price: 40_000,
    slot: 6,
  },
  {
    id: "charm-golden-crown",
    name: "Golden Crown",
    description: "Royal golden crown charm",
    image: "/images/shop/charm-golden-crown.png",
    price: 60_000,
    slot: 7,
  },
  {
    id: "charm-treasure-chest",
    name: "Treasure Chest",
    description: "Rare treasure chest charm",
    image: "/images/shop/charm-treasure-chest.png",
    price: 150_000,
    slot: 8,
  },
] as const;

export function getTapSkinById(
  id: TapSkinId,
): TapSkinItem | undefined {
  return TAP_SKINS.find(
    (item) => item.id === id,
  );
}

export function getAvatarFrameById(
  id: AvatarFrameId,
): AvatarFrameItem | undefined {
  return AVATAR_FRAMES.find(
    (item) => item.id === id,
  );
}

export function getCharmById(
  id: CharmId,
): CharmItem | undefined {
  return CHARMS.find(
    (item) => item.id === id,
  );
}