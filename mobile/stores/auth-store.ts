import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const API_BASE = __DEV__
  ? 'http://localhost:3000'
  : 'https://zenflow-alpha.vercel.app';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('ログインに失敗しました');
    }

    // セッションCookieからトークンを取得
    const cookies = res.headers.get('set-cookie');
    const sessionToken = cookies?.match(/authjs\.session-token=([^;]+)/)?.[1];

    if (sessionToken) {
      await SecureStore.setItemAsync('session_token', sessionToken);
    }

    // ユーザー情報を取得
    const sessionRes = await fetch(`${API_BASE}/api/auth/session`, {
      headers: sessionToken
        ? { Cookie: `authjs.session-token=${sessionToken}` }
        : {},
    });
    const session = await sessionRes.json();

    if (session?.user) {
      set({ user: session.user, isAuthenticated: true });
    } else {
      throw new Error('セッションの取得に失敗しました');
    }
  },

  signup: async (email, password, name) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'アカウント作成に失敗しました');
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('session_token');
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/session`, {
        headers: { Cookie: `authjs.session-token=${token}` },
      });
      const session = await res.json();

      if (session?.user) {
        set({ user: session.user, isAuthenticated: true, isLoading: false });
      } else {
        await SecureStore.deleteItemAsync('session_token');
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
