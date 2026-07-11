"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import { GAME_CONFIG } from "@/config/gameConfig";
import {
  AVATAR_FRAMES,
  CHARMS,
  DEFAULT_AVATAR_FRAME_ID,
  DEFAULT_TAP_SKIN_ID,
  TAP_SKINS,
  type AvatarFrameId,
  type CharmId,
  type TapSkinId,
} from "@/config/shopItems";
import { useGameStore } from "@/game/gameStore";

type CosmeticsState = {
  ownedTapSkinIds: TapSkinId[];
  equippedTapSkinId: TapSkinId;

  ownedAvatarFrameIds: AvatarFrameId[];
  equippedAvatarFrameId: AvatarFrameId;

  ownedCharmIds: CharmId[];
  equippedCharmIds: CharmId[];

  buyTapSkin: (id: TapSkinId) => boolean;
  equipTapSkin: (id: TapSkinId) => boolean;

  buyAvatarFrame: (
    id: AvatarFrameId,
  ) => boolean;
  equipAvatarFrame: (
    id: AvatarFrameId,
  ) => boolean;

  buyCharm: (id: CharmId) => boolean;
  toggleCharm: (id: CharmId) => boolean;

  resetCosmetics: () => void;
};

function createInitialCosmeticsState() {
  return {
    ownedTapSkinIds: [
      DEFAULT_TAP_SKIN_ID,
    ] as TapSkinId[],

    equippedTapSkinId:
      DEFAULT_TAP_SKIN_ID,

    ownedAvatarFrameIds: [
      DEFAULT_AVATAR_FRAME_ID,
    ] as AvatarFrameId[],

    equippedAvatarFrameId:
      DEFAULT_AVATAR_FRAME_ID,

    ownedCharmIds: [] as CharmId[],
    equippedCharmIds: [] as CharmId[],
  };
}

export const useCosmeticsStore =
  create<CosmeticsState>()(
    persist(
      (set, get) => ({
        ...createInitialCosmeticsState(),

        buyTapSkin: (id) => {
          const item = TAP_SKINS.find(
            (skin) => skin.id === id,
          );

          if (!item) {
            return false;
          }

          const state = get();

          if (
            state.ownedTapSkinIds.includes(id)
          ) {
            return false;
          }

          const purchased =
            useGameStore
              .getState()
              .spendBalance(item.price);

          if (!purchased) {
            return false;
          }

          set({
            ownedTapSkinIds: [
              ...state.ownedTapSkinIds,
              id,
            ],

            equippedTapSkinId: id,
          });

          return true;
        },

        equipTapSkin: (id) => {
          const state = get();

          if (
            !state.ownedTapSkinIds.includes(id)
          ) {
            return false;
          }

          if (
            state.equippedTapSkinId === id
          ) {
            return true;
          }

          set({
            equippedTapSkinId: id,
          });

          return true;
        },

        buyAvatarFrame: (id) => {
          const item = AVATAR_FRAMES.find(
            (frame) => frame.id === id,
          );

          if (!item) {
            return false;
          }

          const state = get();

          if (
            state.ownedAvatarFrameIds.includes(
              id,
            )
          ) {
            return false;
          }

          const purchased =
            useGameStore
              .getState()
              .spendBalance(item.price);

          if (!purchased) {
            return false;
          }

          set({
            ownedAvatarFrameIds: [
              ...state.ownedAvatarFrameIds,
              id,
            ],

            equippedAvatarFrameId: id,
          });

          return true;
        },

        equipAvatarFrame: (id) => {
          const state = get();

          if (
            !state.ownedAvatarFrameIds.includes(
              id,
            )
          ) {
            return false;
          }

          if (
            state.equippedAvatarFrameId === id
          ) {
            return true;
          }

          set({
            equippedAvatarFrameId: id,
          });

          return true;
        },

        buyCharm: (id) => {
          const item = CHARMS.find(
            (charm) => charm.id === id,
          );

          if (!item) {
            return false;
          }

          const state = get();

          if (
            state.ownedCharmIds.includes(id)
          ) {
            return false;
          }

          const purchased =
            useGameStore
              .getState()
              .spendBalance(item.price);

          if (!purchased) {
            return false;
          }

          set({
            ownedCharmIds: [
              ...state.ownedCharmIds,
              id,
            ],

            equippedCharmIds: [
              ...state.equippedCharmIds,
              id,
            ],
          });

          return true;
        },

        toggleCharm: (id) => {
          const state = get();

          if (
            !state.ownedCharmIds.includes(id)
          ) {
            return false;
          }

          const isEquipped =
            state.equippedCharmIds.includes(id);

          set({
            equippedCharmIds: isEquipped
              ? state.equippedCharmIds.filter(
                  (charmId) =>
                    charmId !== id,
                )
              : [
                  ...state.equippedCharmIds,
                  id,
                ],
          });

          return true;
        },

        resetCosmetics: () => {
          set(createInitialCosmeticsState());
        },
      }),
      {
        name: `${GAME_CONFIG.saveKey}-cosmetics`,

        storage: createJSONStorage(
          () => localStorage,
        ),

        partialize: (state) => ({
          ownedTapSkinIds:
            state.ownedTapSkinIds,
          equippedTapSkinId:
            state.equippedTapSkinId,

          ownedAvatarFrameIds:
            state.ownedAvatarFrameIds,
          equippedAvatarFrameId:
            state.equippedAvatarFrameId,

          ownedCharmIds:
            state.ownedCharmIds,
          equippedCharmIds:
            state.equippedCharmIds,
        }),
      },
    ),
  );