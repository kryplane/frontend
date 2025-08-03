export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  receiverHash: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  receiverHash: string | null;
  secretKey: string | null;
}

export interface LoginMethod {
  type: 'wallet' | 'secret';
  data?: string; // secret code for secret method
}
