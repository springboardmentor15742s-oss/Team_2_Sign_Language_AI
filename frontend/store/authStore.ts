import { create } from 'zustand';

interface UserPlaceholder {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: UserPlaceholder | null;
  token: string | null;
  isAuthenticated: boolean;
  // Reusable action signatures for Phase 2+
  setAuth: (user: UserPlaceholder, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));
