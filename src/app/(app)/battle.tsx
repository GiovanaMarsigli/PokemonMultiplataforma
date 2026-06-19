import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, Platform, Image, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { getColor } from '@/constants/colors';
import { TYPE_MAP } from '@/constants/pokemon';
import { getPokemons } from '@/integration/pokemonIntegration';
import { getTeam } from '@/integration/teamIntegration';
import { updateUserStats, getUserStats } from '@/@types/authIntegration';
import { useAuth } from '@/context/AuthContext';
import { PokeballLoading } from '@/components/pokeball-loading';
import { BottomNavbar } from '@/components/bottom-navbar';
import { Pokemon } from '@/@types/pokemon';

const mapType = (t: string) => TYPE_MAP[t] ?? 'normal';
const isWeb = Platform.OS === 'web';
const BATTLE_STATS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const STAT_ABBR: Record<string, string> = {
    hp: 'HP', attack: 'ATK', defense: 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
};
type BattlePhase = 'loading' | 'choosing' | 'rolling' | 'result' | 'ended';
interface BattlePokemon extends Pokemon { alive: boolean; }
interface RoundResult { stat: string; playerValue: number; enemyValue: number; winner: 'player' | 'enemy' | 'draw'; }

function pickEnemyTeam(all: Pokemon[], count = 5): BattlePokemon[] {
    return [...all].sort(() => Math.random() - 0.5).slice(0, count).map(p => ({ ...p, alive: true }));
}

function HpBar({ current, max }: { current: number; max: number }) {
    const pct = Math.max(0, Math.min((current / max) * 100, 100));
    const color = pct > 50 ? '#3bff6b' : pct > 25 ? '#ffd700' : '#ff3b3b';
    return (
        <View style={{ flex: 1, height: 6, backgroundColor: '#ffffff15', borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%` as any, height: '100%', backgroundColor: color, borderRadius: 99 }} />
        </View>
    );
}

function BattleCard({ pokemon, label, currentHp, isActive, fainted }: { pokemon: BattlePokemon; label: string; currentHp: number; isActive: boolean; fainted: boolean; }) {
    const ptTypes = pokemon.tipos.map(mapType);
    const colors = getColor(ptTypes);
    const maxHp = pokemon.poderes.find(p => p.nome === 'hp')?.forca ?? 100;
    return (
        <View style={[bStyles.card, { borderColor: fainted ? '#ffffff15' : colors.accent + (isActive ? 'cc' : '44') }, fainted && { opacity: 0.5 }]}>
            <View style={[StyleSheet.absoluteFillObject, { borderRadius: isWeb ? 12 : 8, backgroundColor: fainted ? 'transparent' : colors.accent + '10' }]} />
            <Text style={[bStyles.label, { color: fainted ? '#ffffff20' : colors.accent + '90' }]}>{label}</Text>
            <View style={[bStyles.imgWrap, { borderColor: fainted ? '#ffffff15' : colors.accent + '50', backgroundColor: fainted ? '#ffffff05' : colors.accent + '12' }]}>
                <Image source={{ uri: pokemon.imagem }} style={[bStyles.img, fainted && { opacity: 0.2 }]} resizeMode="contain" />
                {fainted && <Text style={{ position: 'absolute', color: '#ff3b3b', fontSize: 20, fontWeight: '900' }}>✕</Text>}
            </View>
            <Text style={[bStyles.name, { color: fainted ? '#ffffff20' : '#ffffff' }]} numberOfLines={1}>{pokemon.nome.toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: '#ffffff40', fontSize: isWeb ? 6 : 5.5, fontWeight: '800', width: 16 }}>HP</Text>
                <HpBar current={currentHp} max={maxHp} />
                <Text style={{ color: fainted ? '#ffffff20' : colors.accent, fontSize: isWeb ? 7 : 6, fontWeight: '800', width: isWeb ? 24 : 20, textAlign: 'right' }}>{Math.max(0, currentHp)}</Text>
            </View>
        </View>
    );
}

export default function Battle() {
    const { userId, token, user } = useAuth();
    const [phase, setPhase] = useState<BattlePhase>('loading');
    const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
    const [enemyTeam, setEnemyTeam] = useState<BattlePokemon[]>([]);
    const [playerIdx, setPlayerIdx] = useState(0);
    const [enemyIdx, setEnemyIdx] = useState(0);
    const [playerHps, setPlayerHps] = useState<number[]>([]);
    const [enemyHps, setEnemyHps] = useState<number[]>([]);
    const [playerWins, setPlayerWins] = useState(0);
    const [enemyWins, setEnemyWins] = useState(0);
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [battleWinner, setBattleWinner] = useState<'player' | 'enemy' | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollingText, setRollingText] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const allPokemons = await getPokemons(151);
                let myTeam: BattlePokemon[] = [];
                if (userId && token) {
                    try {
                        const teamData = await getTeam(userId, token);
                        if (teamData.team?.length > 0) {
                            const ids = teamData.team.map((t: any) => Number(t.id ?? t));
                            myTeam = allPokemons.filter(p => ids.includes(Number(p.index))).slice(0, 5).map(p => ({ ...p, alive: true }));
                        }
                    } catch { }
                }
                if (myTeam.length === 0) myTeam = pickEnemyTeam(allPokemons, 5);
                const enemy = pickEnemyTeam(allPokemons, 5);
                setPlayerTeam(myTeam);
                setEnemyTeam(enemy);
                setPlayerHps(myTeam.map(p => p.poderes.find(s => s.nome === 'hp')?.forca ?? 100));
                setEnemyHps(enemy.map(p => p.poderes.find(s => s.nome === 'hp')?.forca ?? 100));
                setPhase('choosing');
            } catch (e) { console.error(e); }
        }
        load();
    }, []);

    async function endBattle(winner: 'player' | 'enemy', pw: number, ew: number) {
    setBattleWinner(winner);
    setPhase('ended');
    setIsRolling(false);

    console.log('=== END BATTLE ===');
    console.log('userId:', userId);
    console.log('winner:', winner);

    if (userId) {
        try {
            const current = await getUserStats(userId, token ?? '');
            console.log('stats atuais:', current);

            const currentLevel = Number(current.level ?? 1);
            const currentVitorias = Number(current.vitorias ?? 0);
            const currentDerrotas = Number(current.derrotas ?? 0);

            const payload = {
                level: String(winner === 'player' ? currentLevel + 1 : currentLevel),
                vitorias: String(winner === 'player' ? currentVitorias + 1 : currentVitorias),
                derrotas: String(winner === 'enemy' ? currentDerrotas + 1 : currentDerrotas),
            };

            console.log('payload enviado:', payload);
            const result = await updateUserStats(userId, payload, token ?? '');
            console.log('resultado:', result);
        } catch (e) {
            console.error('Erro ao salvar resultado da batalha:', e);
        }
    } else {
        console.log('SEM userId — não salvou!');
    }
}

    const rollBattle = useCallback(async () => {
        if (isRolling || phase === 'ended') return;
        setIsRolling(true);
        setPhase('rolling');
        const player = playerTeam[playerIdx];
        const enemy = enemyTeam[enemyIdx];
        for (let i = 0; i < 12; i++) {
            setRollingText(STAT_ABBR[BATTLE_STATS[Math.floor(Math.random() * BATTLE_STATS.length)]]);
            await new Promise(r => setTimeout(r, 80));
        }
        const chosenStat = BATTLE_STATS[Math.floor(Math.random() * BATTLE_STATS.length)];
        setRollingText(STAT_ABBR[chosenStat]);
        await new Promise(r => setTimeout(r, 400));
        const pVal = player.poderes.find(p => p.nome === chosenStat)?.forca ?? 0;
        const eVal = enemy.poderes.find(p => p.nome === chosenStat)?.forca ?? 0;
        const winner = pVal > eVal ? 'player' : pVal < eVal ? 'enemy' : 'draw';
        setRoundResult({ stat: chosenStat, playerValue: pVal, enemyValue: eVal, winner });
        const dmg = Math.abs(pVal - eVal);
        const newPHps = [...playerHps];
        const newEHps = [...enemyHps];
        if (winner === 'player') newEHps[enemyIdx] = Math.max(0, newEHps[enemyIdx] - dmg);
        else if (winner === 'enemy') newPHps[playerIdx] = Math.max(0, newPHps[playerIdx] - dmg);
        setPlayerHps(newPHps);
        setEnemyHps(newEHps);
        const logMsg = winner === 'draw'
            ? `EMPATE em ${STAT_ABBR[chosenStat]}! (${pVal} vs ${eVal})`
            : winner === 'player'
                ? `${player.nome.toUpperCase()} venceu em ${STAT_ABBR[chosenStat]}! (${pVal} > ${eVal})`
                : `${enemy.nome.toUpperCase()} venceu em ${STAT_ABBR[chosenStat]}! (${eVal} > ${pVal})`;
        setBattleLog(prev => [logMsg, ...prev].slice(0, 8));
        let newPW = playerWins;
        let newEW = enemyWins;
        const nextPTeam = [...playerTeam];
        const nextETeam = [...enemyTeam];
        let nextPIdx = playerIdx;
        let nextEIdx = enemyIdx;
        if (newEHps[enemyIdx] <= 0) {
            nextETeam[enemyIdx] = { ...nextETeam[enemyIdx], alive: false };
            newPW += 1;
            const n = nextETeam.findIndex((p, i) => i > enemyIdx && p.alive);
            if (n >= 0) nextEIdx = n;
        }
        if (newPHps[playerIdx] <= 0) {
            nextPTeam[playerIdx] = { ...nextPTeam[playerIdx], alive: false };
            newEW += 1;
            const n = nextPTeam.findIndex((p, i) => i > playerIdx && p.alive);
            if (n >= 0) nextPIdx = n;
        }
        setPlayerTeam(nextPTeam);
        setEnemyTeam(nextETeam);
        setPlayerWins(newPW);
        setEnemyWins(newEW);
        setPlayerIdx(nextPIdx);
        setEnemyIdx(nextEIdx);
        const pAlive = nextPTeam.filter(p => p.alive).length;
        const eAlive = nextETeam.filter(p => p.alive).length;
        if (newPW >= 3 || eAlive === 0) await endBattle('player', newPW, newEW);
        else if (newEW >= 3 || pAlive === 0) await endBattle('enemy', newPW, newEW);
        else { setPhase('result'); setIsRolling(false); }
    }, [playerTeam, enemyTeam, playerIdx, enemyIdx, playerHps, enemyHps, playerWins, enemyWins, isRolling, phase]);

    if (phase === 'loading' || playerTeam.length === 0) return <PokeballLoading />;
    const playerPoke = playerTeam[playerIdx];
    const enemyPoke = enemyTeam[enemyIdx];
    const playerColors = getColor(playerPoke.tipos.map(mapType));
    const enemyColors = getColor(enemyPoke.tipos.map(mapType));

    return (
        <View style={styles.wrapper}>
            {isWeb && (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.06 }}>
                        {Array.from({ length: 80 }).map((_, i) => <Text key={i} style={{ color: '#ff6b35', fontSize: 52, width: 80, height: 80, textAlign: 'center', lineHeight: 80 }}>◉</Text>)}
                    </View>
                    <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 9999, backgroundColor: playerColors.accent, top: -100, left: -100, opacity: 0.08, filter: 'blur(100px)' } as any} />
                    <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 9999, backgroundColor: enemyColors.accent, bottom: -100, right: -100, opacity: 0.08, filter: 'blur(100px)' } as any} />
                </View>
            )}

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Text style={{ color: '#ff3b3b', fontSize: isWeb ? 16 : 12 }}>●</Text>
                    <Text style={{ color: '#ffd700', fontSize: isWeb ? 16 : 12 }}>●</Text>
                    <Text style={{ color: '#3bff6b', fontSize: isWeb ? 16 : 12 }}>●</Text>
                </View>
                <Text style={styles.title}>BATALHA</Text>
                <Text style={styles.score}>
                    <Text style={{ color: '#3bff6b' }}>{playerWins}</Text>
                    <Text style={{ color: '#ffffff40' }}> — </Text>
                    <Text style={{ color: '#ff3b3b' }}>{enemyWins}</Text>
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {}
                <View style={styles.arenaRow}>
                    <BattleCard pokemon={playerPoke} label={user?.toUpperCase() ?? 'VOCÊ'} currentHp={playerHps[playerIdx]} isActive fainted={!playerPoke.alive || playerHps[playerIdx] <= 0} />
                    <View style={styles.vsBlock}>
                        {phase === 'rolling' ? (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <Text style={{ color: '#ffd70080', fontSize: isWeb ? 6 : 5, fontWeight: '800', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P'" : undefined }}>ATRIB.</Text>
                                <Text style={{ color: '#ffd700', fontSize: isWeb ? 11 : 9, fontWeight: '900', fontFamily: isWeb ? "'Press Start 2P'" : undefined }}>{rollingText}</Text>
                            </View>
                        ) : <Text style={styles.vsText}>VS</Text>}
                    </View>
                    <BattleCard pokemon={enemyPoke} label="INIMIGO" currentHp={enemyHps[enemyIdx]} isActive fainted={!enemyPoke.alive || enemyHps[enemyIdx] <= 0} />
                </View>

                {}
                {roundResult && phase === 'result' && (
                    <View style={[styles.resultBox, {
                        borderColor: roundResult.winner === 'player' ? '#3bff6b44' : roundResult.winner === 'enemy' ? '#ff3b3b44' : '#ffd70044',
                        backgroundColor: roundResult.winner === 'player' ? '#3bff6b08' : roundResult.winner === 'enemy' ? '#ff3b3b08' : '#ffd70008',
                    }]}>
                        <Text style={styles.resultStat}>ATRIBUTO: <Text style={{ color: '#ffd700' }}>{STAT_ABBR[roundResult.stat]}</Text></Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <Text style={[styles.resultVal, { color: '#3bff6b' }]}>{roundResult.playerValue}</Text>
                            <Text style={{ color: '#ffffff30', fontSize: 16, fontWeight: '900' }}>×</Text>
                            <Text style={[styles.resultVal, { color: '#ff3b3b' }]}>{roundResult.enemyValue}</Text>
                        </View>
                        <Text style={[styles.resultWinner, {
                            color: roundResult.winner === 'draw' ? '#ffd700' : roundResult.winner === 'player' ? '#3bff6b' : '#ff3b3b'
                        }]}>
                            {roundResult.winner === 'draw' ? 'EMPATE!' : roundResult.winner === 'player' ? '✓ VOCÊ VENCEU A RODADA!' : '✗ INIMIGO VENCEU A RODADA!'}
                        </Text>
                    </View>
                )}

                {}
                {phase === 'ended' && (
                    <View style={[styles.endBox, {
                        borderColor: battleWinner === 'player' ? '#3bff6b55' : '#ff3b3b55',
                        backgroundColor: battleWinner === 'player' ? '#3bff6b08' : '#ff3b3b08',
                    }]}>
                        <Text style={[styles.endTitle, { color: battleWinner === 'player' ? '#3bff6b' : '#ff3b3b' }]}>
                            {battleWinner === 'player' ? '🏆 VITÓRIA!' : '💀 DERROTA!'}
                        </Text>
                        <Text style={styles.endScore}>{playerWins} — {enemyWins}</Text>
                        <Text style={styles.endSub}>{battleWinner === 'player' ? '+1 vitória salva no perfil' : '+1 derrota salva no perfil'}</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                            <TouchableOpacity style={[styles.endBtn, { borderColor: '#ff6b3555', backgroundColor: '#ff6b3510' }]} onPress={() => router.replace('/(app)/battle')}>
                                <Text style={[styles.endBtnTxt, { color: '#ff6b35' }]}>NOVA BATALHA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.endBtn, { borderColor: '#ffffff20', backgroundColor: '#ffffff08' }]} onPress={() => router.replace('/(app)/pokedex')}>
                                <Text style={[styles.endBtnTxt, { color: '#ffffff60' }]}>POKÉDEX</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {}
                <View style={styles.teamsRow}>
                    {[{ team: playerTeam, hps: playerHps, idx: playerIdx, label: 'SEU TIME' }, { team: enemyTeam, hps: enemyHps, idx: enemyIdx, label: 'INIMIGO' }].map(({ team, hps, idx, label }) => (
                        <View key={label} style={styles.teamMini}>
                            <Text style={styles.teamMiniLabel}>{label}</Text>
                            <View style={{ flexDirection: 'row', gap: isWeb ? 5 : 3, flexWrap: 'wrap' }}>
                                {team.map((p, i) => {
                                    const pc = getColor(p.tipos.map(mapType));
                                    const fainted = !p.alive || hps[i] <= 0;
                                    return (
                                        <View key={i} style={[styles.miniSlot, {
                                            borderColor: fainted ? '#ffffff10' : pc.accent + (i === idx ? 'ff' : '60'),
                                            backgroundColor: fainted ? '#ffffff05' : pc.accent + '12',
                                        }]}>
                                            <Image source={{ uri: p.imagem }} style={[styles.miniImg, fainted && { opacity: 0.15 }]} resizeMode="contain" />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                {}
                {(phase === 'choosing' || phase === 'result') && (
                    <TouchableOpacity style={styles.fightBtn} onPress={phase === 'result' ? () => { setRoundResult(null); setPhase('choosing'); } : rollBattle} activeOpacity={0.8}>
                        <Text style={styles.fightBtnTxt}>{phase === 'result' ? '▶ PRÓXIMA RODADA' : '⚔ SORTEAR ATRIBUTO'}</Text>
                    </TouchableOpacity>
                )}
                {phase === 'rolling' && (
                    <View style={[styles.fightBtn, { borderColor: '#ffd70060', backgroundColor: '#ffd70008' }]}>
                        <Text style={[styles.fightBtnTxt, { color: '#ffd700' }]}>SORTEANDO...</Text>
                    </View>
                )}

                {}
                {battleLog.length > 0 && (
                    <View style={styles.logBox}>
                        <Text style={styles.logTitle}>◈ LOG DA BATALHA</Text>
                        {battleLog.map((log, i) => <Text key={i} style={[styles.logLine, { opacity: 1 - i * 0.1 }]}>{log}</Text>)}
                    </View>
                )}
            </ScrollView>
            <BottomNavbar />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#0a0a0f', overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: isWeb ? 24 : 14, paddingVertical: isWeb ? 16 : 10, borderBottomWidth: 1, borderBottomColor: '#ff6b3530', zIndex: 2, backgroundColor: 'rgba(10,10,15,0.85)', ...(isWeb ? { backdropFilter: 'blur(10px)' } as any : {}) },
    title: { color: '#ff6b35', fontSize: isWeb ? 13 : 10, fontWeight: '900', letterSpacing: 4, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    score: { fontSize: isWeb ? 14 : 12, fontWeight: '900', fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    scroll: { padding: isWeb ? 20 : 12, gap: isWeb ? 14 : 10, zIndex: 1 },
    arenaRow: { flexDirection: 'row', gap: isWeb ? 12 : 8, alignItems: 'stretch' },
    vsBlock: { alignItems: 'center', justifyContent: 'center', minWidth: isWeb ? 80 : 56 },
    vsText: { color: '#ffffff20', fontSize: isWeb ? 18 : 14, fontWeight: '900', fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    resultBox: { borderRadius: 12, borderWidth: 1, padding: isWeb ? 16 : 12, alignItems: 'center', gap: isWeb ? 8 : 6 },
    resultStat: { color: '#ffffff60', fontSize: isWeb ? 8 : 7, fontWeight: '700', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    resultVal: { fontSize: isWeb ? 28 : 22, fontWeight: '900', fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    resultWinner: { fontSize: isWeb ? 9 : 8, fontWeight: '900', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    endBox: { borderRadius: 14, borderWidth: 1.5, padding: isWeb ? 24 : 16, alignItems: 'center', gap: isWeb ? 12 : 8 },
    endTitle: { fontSize: isWeb ? 18 : 14, fontWeight: '900', letterSpacing: 2, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    endScore: { color: '#ffffff80', fontSize: isWeb ? 22 : 18, fontWeight: '900', fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    endSub: { color: '#ffffff40', fontSize: isWeb ? 8 : 7, fontWeight: '600', letterSpacing: 1 },
    endBtn: { paddingHorizontal: isWeb ? 16 : 12, paddingVertical: isWeb ? 10 : 8, borderRadius: 8, borderWidth: 1 },
    endBtnTxt: { fontSize: isWeb ? 8 : 7, fontWeight: '900', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    teamsRow: { flexDirection: 'row', gap: isWeb ? 14 : 8 },
    teamMini: { flex: 1, backgroundColor: 'rgba(18,18,28,0.85)', borderRadius: 10, borderWidth: 1, borderColor: '#ffffff12', padding: isWeb ? 10 : 8, gap: isWeb ? 8 : 5 },
    teamMiniLabel: { color: '#ffffff30', fontSize: isWeb ? 7 : 6, fontWeight: '800', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    miniSlot: { width: isWeb ? 36 : 28, height: isWeb ? 36 : 28, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    miniImg: { width: isWeb ? 28 : 22, height: isWeb ? 28 : 22 },
    fightBtn: { alignItems: 'center', paddingVertical: isWeb ? 16 : 12, borderRadius: 12, borderWidth: 1.5, backgroundColor: '#ff6b3510', borderColor: '#ff6b3560' },
    fightBtnTxt: { color: '#ff6b35', fontSize: isWeb ? 11 : 9, fontWeight: '900', letterSpacing: 2, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    logBox: { backgroundColor: 'rgba(18,18,28,0.85)', borderRadius: 10, borderWidth: 1, borderColor: '#ffffff10', padding: isWeb ? 12 : 10, gap: isWeb ? 5 : 4 },
    logTitle: { color: '#ff6b3580', fontSize: isWeb ? 7 : 6, fontWeight: '900', letterSpacing: 1, marginBottom: 2, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    logLine: { color: '#ffffff60', fontSize: isWeb ? 8 : 7, fontWeight: '600' },
});

const bStyles = StyleSheet.create({
    card: { flex: 1, backgroundColor: 'rgba(18,18,28,0.92)', borderRadius: isWeb ? 12 : 8, borderWidth: 1.5, padding: isWeb ? 12 : 8, gap: isWeb ? 8 : 5, overflow: 'hidden', position: 'relative', ...(isWeb ? { backdropFilter: 'blur(12px)' } as any : {}) },
    label: { fontSize: isWeb ? 6 : 5.5, fontWeight: '800', letterSpacing: 1, fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
    imgWrap: { alignSelf: 'center', width: isWeb ? 72 : 54, height: isWeb ? 72 : 54, borderRadius: 99, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    img: { width: isWeb ? 58 : 44, height: isWeb ? 58 : 44 },
    name: { fontSize: isWeb ? 7 : 6, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center', fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined },
});
