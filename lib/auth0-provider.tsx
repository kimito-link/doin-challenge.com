import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth0 from 'react-native-auth0';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApiBaseUrl } from './api/config';

const auth0 = new Auth0({
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '',
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '',
});

interface Auth0ContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

// プラットフォーム別のストレージ操作
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export function Auth0Provider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 初期化時にトークンを復元
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedAccessToken = await storage.getItem('auth0_access_token');
      const storedUser = await storage.getItem('auth0_user');

      if (storedAccessToken && storedUser) {
        setAccessToken(storedAccessToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Auth0のUniversal Loginを使用
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        connection: 'twitter', // Twitter接続を指定
      });

      // トークンを保存
      await storage.setItem('auth0_access_token', credentials.accessToken);
      
      // バックエンドでトークンを検証してセッションを確立
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/trpc/auth0.login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: { accessToken: credentials.accessToken }
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session establishment failed:', errorText);
        throw new Error('Failed to establish session');
      }

      const result = await response.json();
      const userData = result.result?.data || result.user;

      if (!userData) {
        throw new Error('No user data returned from server');
      }

      // ユーザー情報を保存
      await storage.setItem('auth0_user', JSON.stringify(userData));

      setAccessToken(credentials.accessToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      // エラー時はトークンを削除
      await storage.deleteItem('auth0_access_token');
      await storage.deleteItem('auth0_user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Auth0からログアウト
      if (Platform.OS !== 'web') {
        await auth0.webAuth.clearSession();
      }

      // ローカルのトークンを削除
      await storage.deleteItem('auth0_access_token');
      await storage.deleteItem('auth0_user');

      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async () => {
    return accessToken;
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth0() {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth0 must be used within an Auth0Provider');
  }
  return context;
}
