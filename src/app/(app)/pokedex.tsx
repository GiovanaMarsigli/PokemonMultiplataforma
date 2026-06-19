import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    Platform,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';

import { PokeballLoading } from '@/components/pokeball-loading';
import { getColor, Colors } from '@/constants/colors';
import { getPokemons } from '@/integration/pokemonIntegration';
import { Pokemon, Poder } from '@/@types/pokemon';
import { TYPE_MAP } from '@/constants/pokemon';
import { BottomNavbar } from '@/components/bottom-navbar';

const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';

const STAT_ABBR: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SPATK',
    'special-defense': 'SPDEF',
    speed: 'SPD',
};

const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;

const COLUMNS = 3;
const GAP = isWeb ? 14 : 8;
const PADDING = isWeb ? 20 : 12;
const CARD_WIDTH = isWeb
    ? `calc((100% - ${PADDING * 2 + GAP * (COLUMNS - 1)}px) / ${COLUMNS})`
    : (screenWidth - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export default function Pokedex() {
    const [loading, setLoading] = useState(true);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getPokemons(151);
                setPokemons(data);
            } catch (e) {
                console.error('Erro ao carregar pokémons:', e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const renderPokemonCard = useCallback((pokemon: Pokemon) => {
        const ptTypes = pokemon.tipos.map(mapType);
        const colors = getColor(ptTypes);

        return (
            <View
                style={[
                    styles.card,
                    {
                        borderColor: colors.accent + '70',
                        width: isWeb ? CARD_WIDTH : CARD_WIDTH,
                    },
                ]}
            >
                <View style={[styles.cardGlow, { backgroundColor: colors.accent + '18' }]} />
                <View style={styles.pokeballWatermark}>
                    <Text style={[styles.pokeballMark, { color: colors.accent + '12' }]}>◉</Text>
                </View>
                <View style={[styles.indexBadge, { backgroundColor: colors.accent + '22', borderColor: colors.accent + '44' }]}>
                    <Text style={[styles.indexText, { color: colors.accent }]}>#{String(pokemon.index).padStart(3, '0')}</Text>
                </View>
                <View style={[styles.imageContainer, { borderColor: colors.accent + '40', backgroundColor: colors.accent + '10' }]}>
                    <Image source={{ uri: pokemon.imagem }} style={styles.image} resizeMode="contain" />
                </View>
                <Text style={styles.pokemonName} numberOfLines={1}>
                    {pokemon.nome.toUpperCase()}
                </Text>
                <View style={styles.typesRow}>
                    {ptTypes.map((type) => {
                        const tc = getColor([type]);
                        return (
                            <View key={type} style={[styles.typeBadge, { backgroundColor: tc.accent + '28', borderColor: tc.accent + '60' }]}>
                                <Text style={[styles.typeBadgeText, { color: tc.accent }]}>{type.toUpperCase()}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={[styles.divider, { backgroundColor: colors.accent + '30' }]} />
                <View style={styles.statsContainer}>
                    {pokemon.poderes.slice(0, 3).map((poder: Poder) => (
                        <View key={poder.nome} style={styles.statRow}>
                            <Text style={styles.statLabel}>
                                {STAT_ABBR[poder.nome] ?? poder.nome.slice(0, 5).toUpperCase()}
                            </Text>
                            <View style={styles.statBarBg}>
                                <View style={[styles.statBarFill, { width: `${Math.min((poder.forca / 150) * 100, 100)}%` as any, backgroundColor: colors.accent }]} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.accent }]}>{poder.forca}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }, []);

    if (loading) {
        return <PokeballLoading />;
    }

    const rows: Pokemon[][] = [];
    for (let i = 0; i < pokemons.length; i += COLUMNS) {
        rows.push(pokemons.slice(i, i + COLUMNS));
    }

    return (
        <View style={styles.wrapper}>
            {}
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

            {}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerDot}>●</Text>
                    <Text style={styles.headerDot2}>●</Text>
                    <Text style={styles.headerDot3}>●</Text>
                </View>
                <Text style={styles.title}>POKÉDEX</Text>
                <Text style={styles.subtitle}>{pokemons.length} POKÉMONS</Text>
            </View>

            {}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((pokemon) => (
                            <React.Fragment key={pokemon.index}>
                                {renderPokemonCard(pokemon)}
                            </React.Fragment>
                        ))}
                        {row.length < COLUMNS &&
                            Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                                <View key={`empty-${i}`} style={[styles.card, styles.cardEmpty, { width: isWeb ? CARD_WIDTH : CARD_WIDTH as any }]} />
                            ))
                        }
                    </View>
                ))}
            </ScrollView>

            {}
            <BottomNavbar />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#0a0a0f', position: 'relative', overflow: 'hidden' },
    bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    bgGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.06 },
    bgPokeball: { color: '#ff6b35', fontSize: isWeb ? 52 : 40, width: isWeb ? 80 : 60, height: isWeb ? 80 : 60, textAlign: 'center', lineHeight: isWeb ? 80 : 60 },
    scanLines: { ...StyleSheet.absoluteFillObject, // @ts-ignore
        backgroundImage: isWeb ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' : undefined },
    orb: { position: 'absolute', borderRadius: 9999, // @ts-ignore
        filter: isWeb ? 'blur(120px)' : undefined, opacity: 0.12 },
    orbRed: { width: 600, height: 600, backgroundColor: '#ff2d2d', top: -200, right: -150 },
    orbBlue: { width: 500, height: 500, backgroundColor: '#1a6bff', bottom: -100, left: -100 },
    orbYellow: { width: 400, height: 400, backgroundColor: '#ffd700', top: '40%', left: '30%', opacity: 0.06 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 24 : 14, paddingVertical: isWeb ? 16 : 10,
        borderBottomWidth: 1, borderBottomColor: '#ff6b3530', zIndex: 2,
        backdropFilter: isWeb ? 'blur(10px)' : undefined,
        backgroundColor: 'rgba(10,10,15,0.85)',
    },
    headerLeft: { flexDirection: 'row', gap: 5, alignItems: 'center' },
    headerDot: { color: '#ff3b3b', fontSize: isWeb ? 16 : 12 },
    headerDot2: { color: '#ffd700', fontSize: isWeb ? 16 : 12 },
    headerDot3: { color: '#3bff6b', fontSize: isWeb ? 16 : 12 },
    title: { color: '#ff6b35', fontSize: isWeb ? 13 : 10, fontWeight: '900', letterSpacing: 4, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    subtitle: { color: '#ffffff40', fontSize: isWeb ? 9 : 7, fontWeight: '700', letterSpacing: 2, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    scrollContent: { padding: PADDING, gap: GAP, zIndex: 1 },
    row: { flexDirection: 'row', gap: GAP, justifyContent: 'flex-start' },
    card: {
        backgroundColor: 'rgba(18, 18, 28, 0.92)', borderRadius: isWeb ? 14 : 10, borderWidth: 1.5,
        padding: isWeb ? 12 : 8, gap: isWeb ? 8 : 6, overflow: 'hidden', position: 'relative',
        backdropFilter: isWeb ? 'blur(12px)' : undefined,
        ...Platform.select({
            web: { boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' } as any,
            default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }
        }),
    },
    cardEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
    cardGlow: { ...StyleSheet.absoluteFillObject, borderRadius: isWeb ? 14 : 10 },
    pokeballWatermark: { position: 'absolute', bottom: -10, right: -10, zIndex: 0 },
    pokeballMark: { fontSize: isWeb ? 80 : 60, lineHeight: isWeb ? 80 : 60 },
    indexBadge: { alignSelf: 'flex-end', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, zIndex: 1 },
    indexText: { fontSize: isWeb ? 8 : 7, fontWeight: '800', letterSpacing: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    imageContainer: { alignSelf: 'center', width: isWeb ? 72 : 52, height: isWeb ? 72 : 52, borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    image: { width: isWeb ? 60 : 44, height: isWeb ? 60 : 44 },
    pokemonName: { color: '#ffffff', fontSize: isWeb ? 9 : 7, fontWeight: '900', letterSpacing: 1, textAlign: 'center', zIndex: 1, fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined },
    typesRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap', zIndex: 1 },
    typeBadge: { paddingHorizontal: isWeb ? 6 : 4, paddingVertical: 2, borderRadius: 99, borderWidth: 1 },
    typeBadgeText: { fontSize: isWeb ? 7 : 6, fontWeight: '800', letterSpacing: 0.5 },
    divider: { height: 1, zIndex: 1 },
    statsContainer: { gap: isWeb ? 4 : 3, zIndex: 1 },
    statRow: { flexDirection: 'row', alignItems: 'center', gap: isWeb ? 5 : 3 },
    statLabel: { color: '#ffffff50', fontSize: isWeb ? 7 : 6, fontWeight: '700', letterSpacing: 0.3, width: isWeb ? 38 : 30 },
    statBarBg: { flex: 1, height: 3, backgroundColor: '#ffffff10', borderRadius: 99, overflow: 'hidden' },
    statBarFill: { height: '100%', borderRadius: 99, opacity: 0.9 },
    statValue: { fontSize: isWeb ? 8 : 7, fontWeight: '800', width: isWeb ? 22 : 18, textAlign: 'right' },
});
