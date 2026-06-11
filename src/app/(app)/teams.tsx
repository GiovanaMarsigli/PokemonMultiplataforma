import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Platform,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    FlatList,
} from 'react-native';

import { getColor } from '@/constants/colors';
import { BottomNavbar } from '@/components/bottom-navbar';
import { TYPE_MAP } from '@/constants/pokemon';
import { Pokemon } from '@/@types/pokemon';

const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;

// ─── Mock de times ───────────────────────────────────────────────────────────
const MOCK_TEAMS: Team[] = [
    {
        id: '1',
        name: 'FIRE SQUAD',
        description: 'Ofensivo e agressivo',
        members: [
            { index: 6, nome: 'Charizard', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', tipos: ['fire', 'flying'], poderes: [{ nome: 'hp', forca: 78 }, { nome: 'attack', forca: 84 }, { nome: 'speed', forca: 100 }] },
            { index: 38, nome: 'Ninetales', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png', tipos: ['fire'], poderes: [{ nome: 'hp', forca: 73 }, { nome: 'attack', forca: 76 }, { nome: 'speed', forca: 100 }] },
            { index: 59, nome: 'Arcanine', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png', tipos: ['fire'], poderes: [{ nome: 'hp', forca: 90 }, { nome: 'attack', forca: 110 }, { nome: 'speed', forca: 95 }] },
            { index: 78, nome: 'Rapidash', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png', tipos: ['fire'], poderes: [{ nome: 'hp', forca: 65 }, { nome: 'attack', forca: 100 }, { nome: 'speed', forca: 105 }] },
            { index: 126, nome: 'Magmar', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png', tipos: ['fire'], poderes: [{ nome: 'hp', forca: 65 }, { nome: 'attack', forca: 95 }, { nome: 'speed', forca: 93 }] },
            { index: 146, nome: 'Moltres', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png', tipos: ['fire', 'flying'], poderes: [{ nome: 'hp', forca: 90 }, { nome: 'attack', forca: 100 }, { nome: 'speed', forca: 90 }] },
        ],
    },
    {
        id: '2',
        name: 'OCEAN FORCE',
        description: 'Equilibrado e resistente',
        members: [
            { index: 9, nome: 'Blastoise', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', tipos: ['water'], poderes: [{ nome: 'hp', forca: 79 }, { nome: 'attack', forca: 83 }, { nome: 'speed', forca: 78 }] },
            { index: 55, nome: 'Golduck', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png', tipos: ['water'], poderes: [{ nome: 'hp', forca: 80 }, { nome: 'attack', forca: 82 }, { nome: 'speed', forca: 85 }] },
            { index: 62, nome: 'Poliwrath', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png', tipos: ['water', 'fighting'], poderes: [{ nome: 'hp', forca: 90 }, { nome: 'attack', forca: 95 }, { nome: 'speed', forca: 70 }] },
            { index: 91, nome: 'Cloyster', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/91.png', tipos: ['water', 'ice'], poderes: [{ nome: 'hp', forca: 50 }, { nome: 'attack', forca: 95 }, { nome: 'speed', forca: 70 }] },
            { index: 117, nome: 'Seadra', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/117.png', tipos: ['water'], poderes: [{ nome: 'hp', forca: 55 }, { nome: 'attack', forca: 65 }, { nome: 'speed', forca: 85 }] },
            { index: 131, nome: 'Lapras', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', tipos: ['water', 'ice'], poderes: [{ nome: 'hp', forca: 130 }, { nome: 'attack', forca: 85 }, { nome: 'speed', forca: 60 }] },
        ],
    },
    {
        id: '3',
        name: 'THUNDER KINGS',
        description: 'Velocidade máxima',
        members: [
            { index: 26, nome: 'Raichu', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', tipos: ['electric'], poderes: [{ nome: 'hp', forca: 60 }, { nome: 'attack', forca: 90 }, { nome: 'speed', forca: 110 }] },
            { index: 82, nome: 'Magneton', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png', tipos: ['electric', 'steel'], poderes: [{ nome: 'hp', forca: 50 }, { nome: 'attack', forca: 60 }, { nome: 'speed', forca: 70 }] },
            { index: 101, nome: 'Electrode', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png', tipos: ['electric'], poderes: [{ nome: 'hp', forca: 60 }, { nome: 'attack', forca: 50 }, { nome: 'speed', forca: 150 }] },
            { index: 125, nome: 'Electabuzz', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png', tipos: ['electric'], poderes: [{ nome: 'hp', forca: 65 }, { nome: 'attack', forca: 83 }, { nome: 'speed', forca: 105 }] },
            { index: 135, nome: 'Jolteon', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png', tipos: ['electric'], poderes: [{ nome: 'hp', forca: 65 }, { nome: 'attack', forca: 65 }, { nome: 'speed', forca: 130 }] },
            { index: 145, nome: 'Zapdos', imagem: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png', tipos: ['electric', 'flying'], poderes: [{ nome: 'hp', forca: 90 }, { nome: 'attack', forca: 90 }, { nome: 'speed', forca: 100 }] },
        ],
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
    index: number;
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: { nome: string; forca: number }[];
}

interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
}

// ─── Slot vazio ───────────────────────────────────────────────────────────────
function EmptySlot({ accentColor }: { accentColor: string }) {
    return (
        <View style={[styles.memberSlot, { borderColor: accentColor + '25', backgroundColor: accentColor + '06' }]}>
            <Text style={[styles.emptySlotIcon, { color: accentColor + '30' }]}>+</Text>
        </View>
    );
}

// ─── Mini card de membro ──────────────────────────────────────────────────────
function MemberSlot({ member, accentColor }: { member: TeamMember; accentColor: string }) {
    const ptTypes = member.tipos.map(mapType);
    return (
        <View style={[styles.memberSlot, { borderColor: accentColor + '40', backgroundColor: accentColor + '10' }]}>
            <Image source={{ uri: member.imagem }} style={styles.memberImage} resizeMode="contain" />
            <Text style={[styles.memberName, { color: accentColor }]} numberOfLines={1}>
                {member.nome.slice(0, 8).toUpperCase()}
            </Text>
        </View>
    );
}

// ─── Card de time ─────────────────────────────────────────────────────────────
function TeamCard({ team, onPress }: { team: Team; onPress: () => void }) {
    const firstType = mapType(team.members[0]?.tipos[0] ?? 'normal');
    const colors = getColor([firstType]);

    // Calcula poder médio do time
    const avgPower = Math.round(
        team.members.reduce((acc, m) => acc + m.poderes.reduce((a, p) => a + p.forca, 0) / m.poderes.length, 0) / team.members.length
    );

    const slots = Array.from({ length: 6 }, (_, i) => team.members[i] ?? null);

    return (
        <TouchableOpacity
            style={[styles.teamCard, { borderColor: colors.accent + '55' }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Glow bg */}
            <View style={[styles.cardGlow, { backgroundColor: colors.accent + '10' }]} />

            {/* Pokeball watermark */}
            <View style={styles.pokeballWatermark}>
                <Text style={[styles.pokeballMark, { color: colors.accent + '10' }]}>◉</Text>
            </View>

            {/* Header do card */}
            <View style={styles.teamCardHeader}>
                <View>
                    <Text style={[styles.teamName, { color: colors.accent }]}>{team.name}</Text>
                    <Text style={styles.teamDesc}>{team.description}</Text>
                </View>
                <View style={[styles.powerBadge, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '50' }]}>
                    <Text style={[styles.powerLabel, { color: colors.accent + '99' }]}>AVG</Text>
                    <Text style={[styles.powerValue, { color: colors.accent }]}>{avgPower}</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.accent + '25' }]} />

            {/* Grid 3×2 de membros */}
            <View style={styles.memberGrid}>
                {slots.map((member, i) =>
                    member
                        ? <MemberSlot key={i} member={member} accentColor={colors.accent} />
                        : <EmptySlot key={i} accentColor={colors.accent} />
                )}
            </View>

            {/* Footer */}
            <View style={styles.teamFooter}>
                <Text style={[styles.teamFooterLabel, { color: colors.accent + '70' }]}>
                    {team.members.length}/6 POKÉMONS
                </Text>
                <Text style={[styles.viewBtn, { color: colors.accent }]}>VER TIME ›</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Modal de detalhes do time ────────────────────────────────────────────────
function TeamDetailModal({ team, visible, onClose }: { team: Team | null; visible: boolean; onClose: () => void }) {
    if (!team) return null;

    const firstType = mapType(team.members[0]?.tipos[0] ?? 'normal');
    const colors = getColor([firstType]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { borderColor: colors.accent + '40' }]}>
                    {/* Glow */}
                    <View style={[styles.cardGlow, { backgroundColor: colors.accent + '08' }]} />

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={[styles.modalTitle, { color: colors.accent }]}>{team.name}</Text>
                            <Text style={styles.teamDesc}>{team.description}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.accent + '40' }]}>
                            <Text style={[styles.closeBtnText, { color: colors.accent }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.accent + '25' }]} />

                    {/* Lista de membros */}
                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {team.members.map((member, i) => {
                            const ptTypes = member.tipos.map(mapType);
                            const mc = getColor(ptTypes);
                            return (
                                <View key={i} style={[styles.detailRow, { borderColor: mc.accent + '25', backgroundColor: mc.accent + '08' }]}>
                                    <View style={[styles.detailImageWrap, { borderColor: mc.accent + '40', backgroundColor: mc.accent + '12' }]}>
                                        <Image source={{ uri: member.imagem }} style={styles.detailImage} resizeMode="contain" />
                                    </View>
                                    <View style={styles.detailInfo}>
                                        <View style={styles.detailNameRow}>
                                            <Text style={styles.detailIndex}>#{String(member.index).padStart(3, '0')}</Text>
                                            <Text style={[styles.detailName, { color: mc.accent }]}>
                                                {member.nome.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.typesRow}>
                                            {ptTypes.map((type) => {
                                                const tc = getColor([type]);
                                                return (
                                                    <View key={type} style={[styles.typeBadge, { backgroundColor: tc.accent + '25', borderColor: tc.accent + '55' }]}>
                                                        <Text style={[styles.typeBadgeText, { color: tc.accent }]}>{type.toUpperCase()}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        {/* Stats bars */}
                                        <View style={styles.detailStats}>
                                            {member.poderes.map((p) => (
                                                <View key={p.nome} style={styles.statRow}>
                                                    <Text style={styles.statLabel}>{p.nome.slice(0, 3).toUpperCase()}</Text>
                                                    <View style={styles.statBarBg}>
                                                        <View style={[styles.statBarFill, {
                                                            width: `${Math.min((p.forca / 150) * 100, 100)}%` as any,
                                                            backgroundColor: mc.accent,
                                                        }]} />
                                                    </View>
                                                    <Text style={[styles.statValue, { color: mc.accent }]}>{p.forca}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Screen principal ─────────────────────────────────────────────────────────
export default function Teams() {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openTeam = useCallback((team: Team) => {
        setSelectedTeam(team);
        setModalVisible(true);
    }, []);

    return (
        <View style={styles.wrapper}>
            {/* ── Fundo nerd Pokémon ── */}
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
                <Text style={styles.title}>TIMES</Text>
                <Text style={styles.subtitle}>{MOCK_TEAMS.length} TIMES</Text>
            </View>

            {/* Lista de times */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Botão criar novo time */}
                <TouchableOpacity style={styles.newTeamBtn} activeOpacity={0.7}>
                    <Text style={styles.newTeamIcon}>+</Text>
                    <Text style={styles.newTeamLabel}>CRIAR NOVO TIME</Text>
                </TouchableOpacity>

                {MOCK_TEAMS.map((team) => (
                    <TeamCard key={team.id} team={team} onPress={() => openTeam(team)} />
                ))}
            </ScrollView>

            {/* Navbar */}
            <BottomNavbar />

            {/* Modal */}
            <TeamDetailModal
                team={selectedTeam}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
    },

    // Background (mesmo padrão do pokedex)
    bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    bgGrid: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        flexDirection: 'row', flexWrap: 'wrap', opacity: 0.06,
    },
    bgPokeball: {
        color: '#ff6b35', fontSize: isWeb ? 52 : 40,
        width: isWeb ? 80 : 60, height: isWeb ? 80 : 60,
        textAlign: 'center', lineHeight: isWeb ? 80 : 60,
    },
    scanLines: {
        ...StyleSheet.absoluteFillObject,
        // @ts-ignore
        backgroundImage: isWeb
            ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)'
            : undefined,
    },
    orb: { position: 'absolute', borderRadius: 9999, opacity: 0.12, ...(isWeb ? { filter: 'blur(120px)' } as any : {}) },
    orbRed: { width: 600, height: 600, backgroundColor: '#ff2d2d', top: -200, right: -150 },
    orbBlue: { width: 500, height: 500, backgroundColor: '#1a6bff', bottom: -100, left: -100 },
    orbYellow: { width: 400, height: 400, backgroundColor: '#ffd700', top: '40%' as any, left: '30%' as any, opacity: 0.06 },

    // Header
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
    title: {
        color: '#ff6b35', fontSize: isWeb ? 13 : 10, fontWeight: '900', letterSpacing: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    subtitle: {
        color: '#ffffff40', fontSize: isWeb ? 9 : 7, fontWeight: '700', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },

    // Scroll
    scrollContent: { padding: isWeb ? 20 : 12, gap: isWeb ? 14 : 10, zIndex: 1 },

    // Botão novo time
    newTeamBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        borderWidth: 1.5, borderColor: '#ff6b3545', borderRadius: isWeb ? 14 : 10,
        borderStyle: 'dashed', paddingVertical: isWeb ? 14 : 10,
        backgroundColor: 'rgba(255,107,53,0.04)',
        ...(isWeb ? { cursor: 'pointer' } as any : {}),
    },
    newTeamIcon: {
        color: '#ff6b3570', fontSize: isWeb ? 18 : 14, fontWeight: '900',
    },
    newTeamLabel: {
        color: '#ff6b3570', fontSize: isWeb ? 9 : 8, fontWeight: '800', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },

    // Team card
    teamCard: {
        backgroundColor: 'rgba(18,18,28,0.92)', borderRadius: isWeb ? 14 : 10, borderWidth: 1.5,
        padding: isWeb ? 16 : 12, gap: isWeb ? 12 : 8, overflow: 'hidden', position: 'relative',
        ...(isWeb ? { backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' } as any : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
        }),
    },
    cardGlow: { ...StyleSheet.absoluteFillObject, borderRadius: isWeb ? 14 : 10 },
    pokeballWatermark: { position: 'absolute', bottom: -20, right: -20, zIndex: 0 },
    pokeballMark: { fontSize: isWeb ? 120 : 90, lineHeight: isWeb ? 120 : 90 },

    teamCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 },
    teamName: {
        fontSize: isWeb ? 11 : 9, fontWeight: '900', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    teamDesc: { color: '#ffffff40', fontSize: isWeb ? 9 : 7, fontWeight: '600', letterSpacing: 1, marginTop: 4 },

    powerBadge: {
        alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8, borderWidth: 1,
    },
    powerLabel: { fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 1 },
    powerValue: { fontSize: isWeb ? 14 : 12, fontWeight: '900', letterSpacing: 1 },

    divider: { height: 1, zIndex: 1 },

    // Grid de membros (3×2)
    memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: isWeb ? 8 : 5, zIndex: 1 },
    memberSlot: {
        width: isWeb ? 72 : 54, height: isWeb ? 88 : 68,
        borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
        gap: 3, overflow: 'hidden',
    },
    memberImage: { width: isWeb ? 48 : 36, height: isWeb ? 48 : 36 },
    memberName: {
        fontSize: isWeb ? 5.5 : 5, fontWeight: '800', letterSpacing: 0.3, textAlign: 'center',
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    emptySlotIcon: { fontSize: isWeb ? 22 : 18, fontWeight: '300' },

    teamFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
    teamFooterLabel: { fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 1 },
    viewBtn: {
        fontSize: isWeb ? 8 : 7, fontWeight: '900', letterSpacing: 1,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: isWeb ? 24 : 12 },
    modalContainer: {
        width: '100%', maxWidth: isWeb ? 560 : undefined, maxHeight: '90%' as any,
        backgroundColor: 'rgba(14,14,22,0.98)', borderRadius: isWeb ? 16 : 12, borderWidth: 1.5,
        padding: isWeb ? 20 : 14, overflow: 'hidden', position: 'relative',
        ...(isWeb ? { backdropFilter: 'blur(20px)' } as any : {}),
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 },
    modalTitle: {
        fontSize: isWeb ? 13 : 11, fontWeight: '900', letterSpacing: 3,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    closeBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { fontSize: 14, fontWeight: '700' },

    modalScroll: { marginTop: isWeb ? 12 : 8, zIndex: 1 },

    detailRow: {
        flexDirection: 'row', gap: isWeb ? 12 : 8, padding: isWeb ? 10 : 8,
        borderRadius: 10, borderWidth: 1, marginBottom: isWeb ? 8 : 6,
    },
    detailImageWrap: {
        width: isWeb ? 60 : 48, height: isWeb ? 60 : 48,
        borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, alignSelf: 'center',
    },
    detailImage: { width: isWeb ? 48 : 38, height: isWeb ? 48 : 38 },
    detailInfo: { flex: 1, gap: isWeb ? 5 : 3 },
    detailNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailIndex: { color: '#ffffff30', fontSize: isWeb ? 8 : 7, fontWeight: '700' },
    detailName: {
        fontSize: isWeb ? 8 : 7, fontWeight: '900', letterSpacing: 1,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    typesRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
    typeBadge: { paddingHorizontal: isWeb ? 5 : 4, paddingVertical: 2, borderRadius: 99, borderWidth: 1 },
    typeBadgeText: { fontSize: isWeb ? 6 : 5.5, fontWeight: '800', letterSpacing: 0.5 },

    detailStats: { gap: isWeb ? 3 : 2 },
    statRow: { flexDirection: 'row', alignItems: 'center', gap: isWeb ? 5 : 3 },
    statLabel: { color: '#ffffff40', fontSize: isWeb ? 6 : 5.5, fontWeight: '700', width: isWeb ? 26 : 20 },
    statBarBg: { flex: 1, height: 3, backgroundColor: '#ffffff10', borderRadius: 99, overflow: 'hidden' },
    statBarFill: { height: '100%', borderRadius: 99, opacity: 0.9 },
    statValue: { fontSize: isWeb ? 7 : 6, fontWeight: '800', width: isWeb ? 22 : 18, textAlign: 'right' },
});
