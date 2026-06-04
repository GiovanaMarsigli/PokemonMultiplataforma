import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextData = {
    isAuthenticated: boolean;
    user: string | null;
    isLoading: boolean;
    signIn: (username: string, password: string) => boolean;
    signOut: () => void;
};

function validateLogin(name: string, password: string): boolean {
  return (
    name.trim().toLowerCase() === "gibsemari" && password.trim() === "Pipoca@pipoca"
  );
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode })  => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storedUser = await AsyncStorage.getItem('@Auth:user');
            if (storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        }
        loadStorageData();
    }, []);

    function signIn(username: string, password: string): boolean {
        const valid = validateLogin(username, password);
        if(!valid) return false;

        const displayName = username.trim();
        setUser(displayName);
        setIsAuthenticated(true);
        AsyncStorage.setItem('@Auth:user', displayName);
        return true;
    }

    async function signOut() {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@Auth:user');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);