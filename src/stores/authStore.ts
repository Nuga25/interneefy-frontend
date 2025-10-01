import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  _hasHydrated: boolean; // New state to track hydration
  setToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void; // New action
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      _hasHydrated: false, // Start as not hydrated
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-token-storage",
      onRehydrateStorage: () => (state) => {
        // This function runs once the store has been rehydrated from localStorage
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
