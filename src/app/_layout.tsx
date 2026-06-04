import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Slot, router } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";
import { PokeballLoading } from "@/components/pokeball-loading";

// Componente separado para poder usar o useAuth (precisa estar dentro do AuthProvider)
function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return; // Aguarda carregar o AsyncStorage

        if (isAuthenticated) {
            router.replace('/(app)/pokedex');
        } else {
            router.replace('/(auth)');
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <PokeballLoading />;
    }

    return <Slot />;
}

export default function Root() {
    useEffect(() => {
        if (Platform.OS === 'web') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;800;900&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
