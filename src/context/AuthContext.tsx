import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '@/@types/authIntegration';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthContextData = {
    isAuthenticated: boolean;
    user: string | null;
    userId: string | null;
    token: string | null;
    isLoading: boolean;
    signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
};


const AuthContext = createContext<AuthContextData>({} as AuthContextData);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const [storedUser, storedUserId, storedToken] = await AsyncStorage.multiGet([
                    '@Auth:user',
                    '@Auth:userId',
                    '@Auth:token',
                ]);

                const u = storedUser[1];
                const id = storedUserId[1];
                const t = storedToken[1];

                if (u && id && t) {
                    setUser(u);
                    setUserId(id);
                    setToken(t);
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error('Erro ao restaurar sessão:', e);
            } finally {
                setIsLoading(false);
            }
        }
        loadStorageData();
    }, []);

    async function signIn(
        username: string,
        password: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const data = await apiLogin({ username, password });

            setUser(data.username);
            setUserId(data.userId);
            setToken(data.token);
            setIsAuthenticated(true);

            await AsyncStorage.multiSet([
                ['@Auth:userId', data.userId],
            ]);

            return { success: true };
        } catch (e: any) {
            const message =
                e?.response?.data?.message ?? 'Usuário ou senha inválidos.';
            return { success: false, error: message };
        }
    }

    async function signUp(
        username: string,
        password: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const data = await apiRegister({ username, password });

            setUser(data.username);
            setUserId(data.userId);
            setToken(data.token);
            setIsAuthenticated(true);

            await AsyncStorage.multiSet([
                ['@Auth:user', data.username],
                ['@Auth:userId', data.userId],
                ['@Auth:token', data.token],
            ]);

            return { success: true };
        } catch (e: any) {
            const message =
                e?.response?.data?.message ?? 'Erro ao criar conta. Tente outro usuário.';
            return { success: false, error: message };
        }
    }

    async function signOut() {
        setUser(null);
        setUserId(null);
        setToken(null);
        setIsAuthenticated(false);
        await AsyncStorage.multiRemove(['@Auth:user', '@Auth:userId', '@Auth:token']);
    }

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, user, userId, token, isLoading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
