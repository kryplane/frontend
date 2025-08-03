import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useWeb3AuthUser } from '@web3auth/modal/react';
import { ethers } from 'ethers';
import { AuthState, LoginMethod, User } from '@/types/auth';
import { generateReceiverHash, generateSecretCode, encryptData, decryptData } from '@/utils/crypto';

const AUTH_STORAGE_KEY = 'shadowchat_auth';
const SECRET_STORAGE_KEY = 'shadowchat_secret';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    receiverHash: null,
    secretKey: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { userInfo } = useWeb3AuthUser();

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Auto-login when wallet connects if we have stored data
  useEffect(() => {
    if (isConnected && address && !authState.isAuthenticated) {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          if (parsed.user?.walletAddress === address) {
            setAuthState(parsed);
          }
        } catch (error) {
          console.error('Error loading stored auth:', error);
        }
      }
    }
  }, [isConnected, address, authState.isAuthenticated]);

  const loadStoredAuth = useCallback(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        setAuthState(parsed);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SECRET_STORAGE_KEY);
    }
  }, []);

  const generateUser = useCallback((receiverHash: string, walletAddress?: string): User => {
    return {
      id: receiverHash.slice(0, 16), // Use first 16 chars of hash as ID
      username: userInfo?.name || `User_${receiverHash.slice(-6)}`,
      email: userInfo?.email || `user_${receiverHash.slice(-6)}@shadowchat.local`,
      walletAddress,
      receiverHash,
      isOnline: true,
      lastSeen: new Date(),
    };
  }, [userInfo]);

  const loginWithWallet = useCallback(async () => {
    if (!isConnected || !address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create a signer from the wallet client
      const account = walletClient.account;
      if (!account) {
        throw new Error('No account found');
      }

      // Sign the prefixed message using wallet client
      const timestamp = Date.now();
      const message = `ShadowChat:${timestamp}`;
      const signature = await walletClient.signMessage({
        account,
        message,
      });
      
      // Generate receiver hash from signature
      const receiverHash = generateReceiverHash(signature);
      
      // Create user object
      const user = generateUser(receiverHash, address);

      // Encrypt and store the signed message as our secret
      const encryptedSecret = await encryptData(signature, address);
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user,
        receiverHash,
        secretKey: signature,
      };

      // Store in localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
      localStorage.setItem(SECRET_STORAGE_KEY, encryptedSecret);

      setAuthState(newAuthState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login with wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, walletClient, generateUser]);

  const loginWithSecret = useCallback(async (secretCode?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use provided secret or generate a new one
      const secret = secretCode || generateSecretCode();
      
      // Generate receiver hash from secret
      const receiverHash = generateReceiverHash(secret);
      
      // Create user object
      const user = generateUser(receiverHash);

      // Encrypt and store the secret
      const encryptedSecret = await encryptData(secret, receiverHash);
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user,
        receiverHash,
        secretKey: secret,
      };

      // Store in localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
      localStorage.setItem(SECRET_STORAGE_KEY, encryptedSecret);

      setAuthState(newAuthState);
      
      return { secret, receiverHash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login with secret';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [generateUser]);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      receiverHash: null,
      secretKey: null,
    });
    setError(null);
    
    // Clear stored data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SECRET_STORAGE_KEY);
  }, []);

  const login = useCallback(async (method: LoginMethod) => {
    if (method.type === 'wallet') {
      return await loginWithWallet();
    } else {
      return await loginWithSecret(method.data);
    }
  }, [loginWithWallet, loginWithSecret]);

  return {
    ...authState,
    loading,
    error,
    login,
    loginWithWallet,
    loginWithSecret,
    logout,
    isWalletConnected: isConnected,
    walletAddress: address,
  };
}
