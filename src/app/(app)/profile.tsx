import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Platform,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';

import { getColor } from '@/constants/colors';
import { BottomNavbar } from '@/components/bottom-navbar';
import { TYPE_MAP } from '@/constants/pokemon';
import { useAuth } from '@/context/AuthContext';
import { getUserStats, UserStats } from '@/@types/authIntegration';

const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
const isWeb = Platform.OS === 'web';
const TABS = ['VISÃO GERAL', 'INSÍGNIAS', 'POKÉMONS'];

const BADGES = [
    { name: 'BOULDER', color: '#9b9b9b', icon: '◈' },
    { name: 'CASCADE', color: '#4fc3f7', icon: '◈' },
    { name: 'THUNDER', color: '#ffd700', icon: '◈' },
    { name: 'RAINBOW', color: '#f48fb1', icon: '◈' },
    { name: 'SOUL',    color: '#ce93d8', icon: '◈' },
    { name: 'MARSH',   color: '#80cbc4', icon: '◈' },
    { name: 'VOLCANO', color: '#ff8a65', icon: '◈' },
    { name: 'EARTH',   color: '#a5d6a7', icon: '◈' },
];

const RECENT_CATCHES = [
    { index: 25,  nome: 'Pikachu',   imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',  tipos: ['electric'] },
    { index: 143, nome: 'Snorlax',   imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', tipos: ['normal'] },
    { index: 149, nome: 'Dragonite', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', tipos: ['dragon', 'flying'] },
    { index: 94,  nome: 'Gengar',    imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',  tipos: ['ghost', 'poison'] },
    { index: 130, nome: 'Gyarados',  imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', tipos: ['water', 'flying'] },
    { index: 65,  nome: 'Alakazam',  imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png',  tipos: ['psychic'] },
];

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
    return (
        <View style={[statCardStyles.container, { borderColor: accent + '35', backgroundColor: accent + '08' }]}>
            <Text style={[statCardStyles.value, { color: accent }]}>{value}</Text>
            <Text style={statCardStyles.label}>{label}</Text>
        </View>
    );
}
const statCardStyles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingVertical: isWeb ? 12 : 8, borderRadius: 10, borderWidth: 1 },
    value: { fontSize: isWeb ? 18 : 15, fontWeight: '900', letterSpacing: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    label: { color: '#ffffff40', fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 1, marginTop: 4, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
});

function OverviewTab({ accent, vitorias, derrotas }: { accent: string; vitorias: number; derrotas: number }) {
    const total = vitorias + derrotas;
    const winRate = total > 0 ? Math.round((vitorias / total) * 100) : 0;

    return (
        <View style={styles.tabContent}>
            <View style={[styles.section, { borderColor: accent + '20' }]}>
                <Text style={[styles.sectionTitle, { color: accent }]}>◈ BATALHAS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: isWeb ? 28 : 22, fontWeight: '900', color: accent, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined }}>{winRate}%</Text>
                    <Text style={{ color: '#ffffff40', fontSize: isWeb ? 9 : 7, fontWeight: '600' }}>taxa de vitória</Text>
                </View>
                <View style={styles.statBarBg}>
                    <View style={[styles.statBarFill, { width: `${winRate}%` as any, backgroundColor: accent }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#3bff6b80', fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 1 }}>{vitorias} VITÓRIAS</Text>
                    <Text style={{ color: '#ff3b3b80', fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 1 }}>{derrotas} DERROTAS</Text>
                </View>
            </View>
        </View>
    );
}

function BadgesTab({ accent }: { accent: string }) {
    return (
        <View style={styles.tabContent}>
            <View style={[styles.section, { borderColor: accent + '20' }]}>
                <Text style={[styles.sectionTitle, { color: accent }]}>◈ INSÍGNIAS KANTO</Text>
                <Text style={{ color: '#ffffff35', fontSize: isWeb ? 8 : 6.5, fontWeight: '700', letterSpacing: 1 }}>8/8 CONQUISTADAS</Text>
                <View style={styles.statBarBg}>
                    <View style={[styles.statBarFill, { width: '100%', backgroundColor: accent }]} />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isWeb ? 8 : 6, marginTop: 4 }}>
                    {BADGES.map((badge, i) => (
                        <View key={i} style={[styles.badgeCard, { borderColor: badge.color + '55', backgroundColor: badge.color + '12' }]}>
                            <Text style={{ fontSize: isWeb ? 22 : 18, color: badge.color }}>{badge.icon}</Text>
                            <Text style={{ fontSize: isWeb ? 5.5 : 5, fontWeight: '900', color: badge.color, letterSpacing: 0.5, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined }}>{badge.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

function PokemonsTab({ accent }: { accent: string }) {
    return (
        <View style={styles.tabContent}>
            <View style={[styles.section, { borderColor: accent + '20' }]}>
                <Text style={[styles.sectionTitle, { color: accent }]}>◈ CAPTURAS RECENTES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isWeb ? 10 : 6 }}>
                    {RECENT_CATCHES.map((pk) => {
                        const ptTypes = pk.tipos.map(mapType);
                        const pc = getColor(ptTypes);
                        return (
                            <View key={pk.index} style={[styles.recentCard, { borderColor: pc.accent + '45', backgroundColor: pc.accent + '10' }]}>
                                <View style={[styles.recentImgWrap, { borderColor: pc.accent + '40', backgroundColor: pc.accent + '12' }]}>
                                    <Image source={{ uri: pk.imagem }} style={styles.recentImg} resizeMode="contain" />
                                </View>
                                <Text style={{ fontSize: isWeb ? 7 : 6, fontWeight: '700', color: pc.accent + '80' }}>#{String(pk.index).padStart(3, '0')}</Text>
                                <Text style={{ fontSize: isWeb ? 6 : 5.5, fontWeight: '900', color: pc.accent, letterSpacing: 0.5, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined }} numberOfLines={1}>{pk.nome.slice(0, 8).toUpperCase()}</Text>
                                <View style={{ flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {ptTypes.map((type) => {
                                        const tc = getColor([type]);
                                        return (
                                            <View key={type} style={{ paddingHorizontal: isWeb ? 4 : 3, paddingVertical: 2, borderRadius: 99, borderWidth: 1, backgroundColor: tc.accent + '22', borderColor: tc.accent + '55' }}>
                                                <Text style={{ fontSize: isWeb ? 5.5 : 5, fontWeight: '800', color: tc.accent }}>{type.slice(0, 3).toUpperCase()}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

// ─── Screen principal ─────────────────────────────────────────────────────────
export default function Profile() {
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState<UserStats | null>(null);
    const { user, userId, token, signOut } = useAuth();

    const accent = getColor([mapType('electric')]).accent;

    useEffect(() => {
        async function loadStats() {
            if (!userId) return;
            try {
                const data = await getUserStats(userId, token ?? '');
                setStats(data);
            } catch (e) {
                console.error('Erro ao carregar perfil:', e);
            }
        }
        loadStats();
    }, [userId]);

    function handleLogout() {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm('Tem certeza que deseja sair da conta?');
        if (confirmed) {
            signOut().then(() => router.replace('/'));
        }
    } else {
        Alert.alert(
            'SAIR',
            'Tem certeza que deseja sair da conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/');
                    },
                },
            ]
        );
    }
}

    const vitorias = Number(stats?.vitorias ?? 0);
    const derrotas = Number(stats?.derrotas ?? 0);
    const level = Number(stats?.level ?? 1);

    return (
        <View style={styles.wrapper}>
            {isWeb && (
                <View style={styles.bg} pointerEvents="none">
                    <View style={styles.bgGrid}>
                        {Array.from({ length: 80 }).map((_, i) => (
                            <Text key={i} style={styles.bgPokeball}>◉</Text>
                        ))}
                    </View>
                    <View style={styles.scanLines} />
                    <View style={[styles.orb, styles.orbRed]} />
                    <View style={[styles.orb, styles.orbBlue]} />
                    <View style={[styles.orb, styles.orbYellow]} />
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerDot}>●</Text>
                    <Text style={styles.headerDot2}>●</Text>
                    <Text style={styles.headerDot3}>●</Text>
                </View>
                <Text style={styles.title}>PERFIL</Text>
                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: '#ff3b3b50' }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutBtnText, { color: '#ff3b3b' }]}>SAIR</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={[styles.profileHero, { borderColor: accent + '35' }]}>
                    <View style={[styles.cardGlow, { backgroundColor: accent + '08' }]} />
                    <View style={styles.pokeballWatermark}>
                        <Text style={[styles.pokeballMark, { color: accent + '08' }]}>◉</Text>
                    </View>

                    <View style={styles.heroRow}>
                        <View style={[styles.avatarOuter, { borderColor: accent + '70' }]}>
                            <View style={[styles.avatarInner, { backgroundColor: accent + '18' }]}>
                                <Image
                                    source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
                                    style={styles.avatarImg}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <View style={styles.heroInfo}>
                            <View style={[styles.rankBadge, { backgroundColor: '#ffd70022', borderColor: '#ffd70055' }]}>
                                <Text style={[styles.rankText, { color: '#ffd700' }]}>LVL {level}</Text>
                            </View>
                            <Text style={[styles.profileName, { color: '#ffffff' }]}>
                                {(stats?.username ?? user ?? 'TREINADOR').toUpperCase()}
                            </Text>
                            <Text style={styles.profileUsername}>
                                @{stats?.username ?? user ?? 'treinador'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: accent + '25' }]} />
                    <View style={styles.statsRow}>
                        <StatCard label="VITÓRIAS" value={vitorias} accent='#3bff6b' />
                        <StatCard label="DERROTAS" value={derrotas} accent='#ff3b3b' />
                        <StatCard label="NÍVEL" value={level} accent={accent} />
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabBar, { borderColor: accent + '25' }]}>
                    {TABS.map((tab, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.tabItem, activeTab === i && { borderBottomColor: accent, borderBottomWidth: 2 }]}
                            onPress={() => setActiveTab(i)}
                        >
                            <Text style={[styles.tabLabel, { color: activeTab === i ? accent : '#ffffff35' }]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 0 && <OverviewTab accent={accent} vitorias={vitorias} derrotas={derrotas} />}
                {activeTab === 1 && <BadgesTab accent={accent} />}
                {activeTab === 2 && <PokemonsTab accent={accent} />}
            </ScrollView>

            <BottomNavbar />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#0a0a0f', position: 'relative', overflow: 'hidden' },
    bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    bgGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.06 },
    bgPokeball: { color: '#ff6b35', fontSize: isWeb ? 52 : 40, width: isWeb ? 80 : 60, height: isWeb ? 80 : 60, textAlign: 'center', lineHeight: isWeb ? 80 : 60 },
    scanLines: { ...StyleSheet.absoluteFillObject, ...(isWeb ? { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' } as any : {}) },
    orb: { position: 'absolute', borderRadius: 9999, opacity: 0.12, ...(isWeb ? { filter: 'blur(120px)' } as any : {}) },
    orbRed: { width: 600, height: 600, backgroundColor: '#ff2d2d', top: -200, right: -150 },
    orbBlue: { width: 500, height: 500, backgroundColor: '#1a6bff', bottom: -100, left: -100 },
    orbYellow: { width: 400, height: 400, backgroundColor: '#ffd700', top: '40%' as any, left: '30%' as any, opacity: 0.06 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 24 : 14, paddingVertical: isWeb ? 16 : 10,
        borderBottomWidth: 1, borderBottomColor: '#ff6b3530', zIndex: 2,
        backgroundColor: 'rgba(10,10,15,0.85)',
        ...(isWeb ? { backdropFilter: 'blur(10px)' } as any : {}),
    },
    headerLeft: { flexDirection: 'row', gap: 5, alignItems: 'center' },
    headerDot: { color: '#ff3b3b', fontSize: isWeb ? 16 : 12 },
    headerDot2: { color: '#ffd700', fontSize: isWeb ? 16 : 12 },
    headerDot3: { color: '#3bff6b', fontSize: isWeb ? 16 : 12 },
    title: { color: '#ff6b35', fontSize: isWeb ? 13 : 10, fontWeight: '900', letterSpacing: 4, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    logoutBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
    logoutBtnText: { fontSize: isWeb ? 8 : 7, fontWeight: '800', letterSpacing: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },

    scrollContent: { padding: isWeb ? 20 : 12, gap: isWeb ? 14 : 10, zIndex: 1 },

    profileHero: {
        backgroundColor: 'rgba(18,18,28,0.92)', borderRadius: isWeb ? 14 : 10, borderWidth: 1.5,
        padding: isWeb ? 18 : 12, gap: isWeb ? 14 : 10, overflow: 'hidden', position: 'relative',
        ...(isWeb ? { backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' } as any : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
        }),
    },
    cardGlow: { ...StyleSheet.absoluteFillObject, borderRadius: isWeb ? 14 : 10 },
    pokeballWatermark: { position: 'absolute', bottom: -30, right: -30, zIndex: 0 },
    pokeballMark: { fontSize: isWeb ? 160 : 120, lineHeight: isWeb ? 160 : 120 },
    heroRow: { flexDirection: 'row', gap: isWeb ? 16 : 12, alignItems: 'center', zIndex: 1 },
    avatarOuter: { width: isWeb ? 90 : 72, height: isWeb ? 90 : 72, borderRadius: 99, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
    avatarInner: { width: isWeb ? 78 : 62, height: isWeb ? 78 : 62, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
    avatarImg: { width: isWeb ? 66 : 52, height: isWeb ? 66 : 52 },
    heroInfo: { flex: 1, gap: isWeb ? 5 : 4 },
    rankBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
    rankText: { fontSize: isWeb ? 7 : 6, fontWeight: '900', letterSpacing: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    profileName: { fontSize: isWeb ? 13 : 11, fontWeight: '900', letterSpacing: 2, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    profileUsername: { color: '#ffffff45', fontSize: isWeb ? 9 : 7, fontWeight: '600', letterSpacing: 1 },
    divider: { height: 1, zIndex: 1 },
    statsRow: { flexDirection: 'row', gap: isWeb ? 10 : 6, zIndex: 1 },

    tabBar: { flexDirection: 'row', borderBottomWidth: 1, backgroundColor: 'rgba(18,18,28,0.7)', borderRadius: isWeb ? 10 : 8, overflow: 'hidden' },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: isWeb ? 12 : 9, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabLabel: { fontSize: isWeb ? 7 : 6, fontWeight: '800', letterSpacing: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },

    tabContent: { gap: isWeb ? 12 : 8 },
    section: { backgroundColor: 'rgba(18,18,28,0.85)', borderRadius: isWeb ? 12 : 8, borderWidth: 1, padding: isWeb ? 16 : 12, gap: isWeb ? 10 : 8, ...(isWeb ? { backdropFilter: 'blur(12px)' } as any : {}) },
    sectionTitle: { fontSize: isWeb ? 9 : 8, fontWeight: '900', letterSpacing: 2, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    statBarBg: { height: 5, backgroundColor: '#ffffff10', borderRadius: 99, overflow: 'hidden' },
    statBarFill: { height: '100%', borderRadius: 99, opacity: 0.9 },

    badgeCard: { alignItems: 'center', justifyContent: 'center', gap: 4, width: isWeb ? 72 : 56, height: isWeb ? 80 : 62, borderRadius: 10, borderWidth: 1 },

    recentCard: { width: isWeb ? 90 : 70, alignItems: 'center', gap: isWeb ? 5 : 4, padding: isWeb ? 8 : 6, borderRadius: 10, borderWidth: 1 },
    recentImgWrap: { width: isWeb ? 56 : 44, height: isWeb ? 56 : 44, borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    recentImg: { width: isWeb ? 46 : 36, height: isWeb ? 46 : 36 },
});
