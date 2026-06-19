import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const isWeb = Platform.OS === 'web';

const TABS = [
    { label: 'POKÉDEX', icon: '◉', route: '/(app)/pokedex' },
    { label: 'TIMES',   icon: '⊞', route: '/(app)/teams'   },
    { label: 'BATALHA', icon: '⚔', route: '/(app)/battle'  },
    { label: 'PERFIL',  icon: '◈', route: '/(app)/profile' },
];

export function BottomNavbar() {
    const router   = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.wrapper}>
            <View style={styles.blur} />
            <View style={styles.bar}>
                {TABS.map((tab) => {
                    const active = pathname.includes(tab.route.replace('/(app)/', ''));
                    return (
                        <TouchableOpacity
                            key={tab.route}
                            style={styles.tab}
                            onPress={() => router.push(tab.route as any)}
                            activeOpacity={0.7}
                        >
                            {active && <View style={styles.activeDot} />}
                            <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
                            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
                            {active && <View style={styles.activeBar} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { position: 'relative', borderTopWidth: 1, borderTopColor: '#ff6b3530', zIndex: 10 },
    blur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,15,0.92)', ...(isWeb ? { backdropFilter: 'blur(16px)' } as any : {}) },
    bar: { flexDirection: 'row', paddingVertical: isWeb ? 10 : 8, paddingHorizontal: isWeb ? 24 : 10 },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: isWeb ? 4 : 3, paddingVertical: isWeb ? 6 : 4, position: 'relative' },
    activeDot: { position: 'absolute', top: 0, width: 4, height: 4, borderRadius: 99, backgroundColor: '#ff6b35' },
    icon: { fontSize: isWeb ? 16 : 14, color: '#ffffff25' },
    iconActive: { color: '#ff6b35', ...(isWeb ? { textShadow: '0 0 10px #ff6b3590' } as any : {}) },
    label: { fontSize: isWeb ? 6 : 5.5, fontWeight: '800', letterSpacing: 1, color: '#ffffff25', fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    labelActive: { color: '#ff6b35' },
    activeBar: { position: 'absolute', bottom: -2, width: '40%', height: 2, borderRadius: 99, backgroundColor: '#ff6b35' },
});
