import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "start" | "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  
  // Actions
  ready: () => void;
  start: () => void;
  restart: () => void;
  end: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "start",
    
    ready: () => {
      set(() => ({ phase: "ready" }));
    },
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "start" }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    }
  }))
);
