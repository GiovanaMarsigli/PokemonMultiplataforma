import { useState } from 'react';
import { router } from 'expo-router';

import {
    View,
    Text,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';

import Button from '@/components/button';
import { Input } from '@/components/input';
import { Pokeball } from '@/components/pokeball';
import { PokeballLoading } from '@/components/pokeball-loading';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [confirmarSenha, setConfirmarSenha] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();

    async function handleRegister() {
        if (!name.trim() || !senha.trim() || !confirmarSenha.trim()) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Senhas diferentes', 'As senhas digitadas não coincidem.');
            return;
        }

        if (senha.length < 6) {
            Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        const result = await signUp(name.trim(), senha);

        if (result.success) {
            router.replace('/(app)/pokedex');
        } else {
            setIsLoading(false);
            Alert.alert('Erro ao cadastrar', result.error ?? 'Tente um nome de usuário diferente.');
        }
    }

    if (isLoading) {
        return <PokeballLoading />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled">

                {Platform.OS === 'web' && (
                    <>
                        <View style={styles.orbBlue} />
                        <View style={styles.orbOrange} />
                    </>
                )}

                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <Pokeball size={Platform.OS === 'web' ? 28 : 22} />
                        <Text style={styles.logoText}>Pokemon Gibs e Mary</Text>
                        <Pokeball size={Platform.OS === 'web' ? 28 : 22} />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>CADASTRO</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Nome</Text>
                        <Input
                            placeholder=""
                            onChangeText={setName}
                            value={name}
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <Input
                            placeholder=""
                            secureTextEntry
                            onChangeText={setSenha}
                            value={senha}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Confirmar Senha</Text>
                        <Input
                            placeholder=""
                            secureTextEntry
                            onChangeText={setConfirmarSenha}
                            value={confirmarSenha}
                        />
                    </View>

                    <Button title="Cadastrar" onPress={handleRegister} style={{ marginTop: 8 }} />

                    {}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.loginLink}>
                        <Text style={styles.loginLinkText}>
                            Já tem conta?{' '}
                            <Text style={styles.loginLinkBold}>Entrar</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isWeb ? 32 : 24,
        minHeight: '100%' as any,
        gap: 24,
        position: 'relative',
    },
    orbBlue: {
        position: 'absolute', width: 500, height: 500, borderRadius: 250,
        backgroundColor: Colors.semantic.info.border, top: -200, left: -200, opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    orbOrange: {
        position: 'absolute', width: 400, height: 400, borderRadius: 200,
        backgroundColor: Colors.btnPrimary, bottom: -100, right: -150, opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    header: { alignItems: 'center', gap: 8, width: '100%', maxWidth: isWeb ? 440 : undefined },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    logoText: {
        color: Colors.white, fontSize: isWeb ? 22 : 18, fontWeight: '900', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    card: {
        width: '100%', maxWidth: isWeb ? 440 : undefined,
        backgroundColor: Colors.surface, borderRadius: isWeb ? 20 : 16,
        borderWidth: 1.5, borderColor: Colors.primaryAlpha['30'],
        padding: isWeb ? 28 : 20, gap: 16,
        ...Platform.select({
            web: { boxShadow: '0 0 40px rgba(255,107,53,0.15), 0 0 80px rgba(0,0,0,0.6)' } as any,
            default: {
                shadowColor: Colors.btnPrimary, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
            },
        }),
    },
    cardTitle: {
        color: Colors.btnPrimary, fontSize: isWeb ? 11 : 10, fontWeight: '800',
        letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    fieldGroup: { gap: 6 },
    label: {
        color: Colors.whiteAlpha['50'], fontSize: 12,
        fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    },
    loginLink: { alignItems: 'center', paddingTop: 4 },
    loginLinkText: {
        color: Colors.whiteAlpha['50'], fontSize: 12, fontWeight: '600',
    },
    loginLinkBold: {
        color: Colors.btnPrimary, fontWeight: '800',
    },
});
