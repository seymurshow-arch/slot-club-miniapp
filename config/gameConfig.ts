export const GAME_CONFIG = {
  initialBalance: 100000000000,

  initialEnergy: 3_000,
  initialMaxEnergy: 3_000,

  initialTapPower: 1,
  energyCostPerTap: 1,

  energyRestoreAmount: 2,
  energyRestoreIntervalMs: 60_000,

  upgrades: {
    tapPower: {
      basePrice: 1_000,
      growthRate: 1.35,
      maxLevel: 100,
      valuePerLevel: 1,
    },

    maxEnergy: {
      basePrice: 2_000,
      growthRate: 1.4,
      maxLevel: 40,
      valuePerLevel: 250,
    },

    energyRecovery: {
      basePrice: 5_000,
      growthRate: 1.55,
      maxLevel: 20,
      valuePerLevel: 1,
    },
  },

  consumables: {
    fullEnergy: {
      price: 2_500,
    },
  },

  cosmetics: {
    tapSkins: [
      {
        id: "default",
        name: "Classic Clover",
        price: 0,
      },
      {
        id: "gold",
        name: "Golden Clover",
        price: 25_000,
      },
      {
        id: "diamond",
        name: "Diamond Clover",
        price: 75_000,
      },
      {
        id: "neon",
        name: "Neon Clover",
        price: 150_000,
      },
      {
        id: "galaxy",
        name: "Galaxy Clover",
        price: 300_000,
      },
    ],

    avatarFrames: [
      {
        id: "default",
        name: "Classic",
        price: 0,
      },
      {
        id: "green",
        name: "Green Neon",
        price: 20_000,
      },
      {
        id: "gold",
        name: "Gold VIP",
        price: 60_000,
      },
      {
        id: "diamond",
        name: "Diamond",
        price: 150_000,
      },
      {
        id: "royal",
        name: "Royal",
        price: 350_000,
      },
    ],

    charms: [
      { id: "leaf", name: "Lucky Leaf", price: 2_000, slot: 1 },
      { id: "coin", name: "Gold Coin", price: 5_000, slot: 2 },
      { id: "dice", name: "Dice", price: 8_000, slot: 3 },
      { id: "star", name: "Lucky Star", price: 12_000, slot: 4 },
      { id: "cherry", name: "Cherry", price: 18_000, slot: 5 },
      { id: "bell", name: "Jackpot Bell", price: 25_000, slot: 6 },
      { id: "chip", name: "Casino Chip", price: 40_000, slot: 7 },
      { id: "crown", name: "Golden Crown", price: 60_000, slot: 8 },
      { id: "diamond", name: "Diamond", price: 90_000, slot: 9 },
      { id: "treasure", name: "Treasure Chest", price: 150_000, slot: 10 },
    ],
  },

  saveKey: "slot-club-game-state",
} as const;