# 🎮 Pokemon Gibs e Mari

Aplicativo multiplataforma de Pokémon desenvolvido com **React Native + Expo Router**, com backend próprio hospedado na AWS.

---

## 👥 Integrantes

| Nome | Função |
|------|--------|
| Giovana Marsigli Rodrigues | Desenvolvimento |
| Mariana Akemi Arashiro Santos Feitosa | Desenvolvimento |

**Instituição:** Fatec Zona Leste — Análise e Desenvolvimento de Sistemas  

---

## 🔑 Credenciais de acesso ao app

| Campo | Valor |
|-------|-------|
| Usuário | `gibsemari2309` |
| Senha | `Pipoca@pipoca` |

> Ou crie uma conta nova pela tela de **Cadastro**.

---

## 📱 Funcionalidades

- **Pokédex** — listagem dos 151 pokémons da 1ª geração com stats, tipos e imagens
- **Times** — visualização e gerenciamento do time de Pokémons do usuário
- **Batalha** — sistema de batalha por atributo sorteado aleatoriamente (melhor de 5, vence quem fizer 3 pontos)
- **Perfil** — estatísticas do treinador (vitórias, derrotas, nível) sincronizadas com a API
- **Autenticação** — login e cadastro com sessão persistida via AsyncStorage

---

## ✅ Requisitos do Projeto

### 1. Integração com APIs
- **PokeAPI** (`https://pokeapi.co/api/v2`) — busca dados dos 151 pokémons (nome, tipos, stats, imagem)
- **API Pokemon** (`https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon`) — autenticação, perfil, times e capturas

### 2. Proteção de rotas (não acessa URL sem login)
O arquivo `src/app/(app)/_layout.tsx` verifica autenticação antes de renderizar qualquer tela do app:
```tsx
if (!isAuthenticated) {
    return <Redirect href="/" />;
}
```

### 3. Sessão persistida (usuário logado salvo)
O `AuthContext` salva `token`, `userId` e `username` no **AsyncStorage** ao fazer login/cadastro, e os restaura automaticamente ao reabrir o app:
```ts
await AsyncStorage.multiSet([
    ['@Auth:user', data.username],
    ['@Auth:userId', data.userId],
    ['@Auth:token', data.token],
]);
```

### 4. Banco de dados integrado com a API
A API backend (AWS Lambda + DynamoDB) persiste:
- Usuários (registro/login)
- Estatísticas do treinador (vitórias, derrotas, nível)
- Time de Pokémons do usuário
- Pokémons capturados

### 5. Separação por contextos/responsabilidades

```
src/
  @types/          → tipagens TypeScript (Pokemon, Poder...)
  app/
    (auth)/        → telas públicas (login, cadastro)
    (app)/         → telas protegidas (pokedex, times, batalha, perfil)
    _layout.tsx    → layout raiz com AuthProvider
  components/      → componentes reutilizáveis (Button, Input, Pokeball, BottomNavbar...)
  constants/       → cores, tipos de pokémon
  context/
    AuthContext.tsx → estado global de autenticação
  integration/
    api.ts              → cliente axios (base URL da API)
    authIntegration.ts  → register, login, getStats, updateStats
    teamIntegration.ts  → getTeam, updateTeam, addCaptured, deleteCaptured
    pokemonIntegration.ts → busca pokémons na PokeAPI
```

### 6. Novo layout padrão — BottomNavbar
Foi adicionado um componente de navegação inferior (`src/components/bottom-navbar/index.tsx`) presente em todas as telas protegidas. Conforme solicitado, está documentado aqui no README.

---

## 🗂️ Estrutura de pastas

```
PokemonMultiplataforma/
├── assets/
├── src/
│   ├── @types/
│   │   └── pokemon.ts
│   ├── app/
│   │   ├── _layout.tsx          ← layout raiz (AuthProvider + fontes)
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx        ← tela de login
│   │   │   └── register.tsx     ← tela de cadastro
│   │   └── (app)/
│   │       ├── _layout.tsx      ← proteção de rota
│   │       ├── pokedex.tsx
│   │       ├── teams.tsx
│   │       ├── battle.tsx
│   │       └── profile.tsx
│   ├── components/
│   │   ├── bottom-navbar/
│   │   │   └── index.tsx
│   │   ├── button/
│   │   ├── input/
│   │   ├── pokeball/
│   │   ├── pokeball-loading/
│   │   └── pokemon-card/
│   ├── constants/
│   │   ├── colors.ts
│   │   └── pokemon.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── integration/
│       ├── api.ts
│       ├── authIntegration.ts
│       ├── teamIntegration.ts
│       └── pokemonIntegration.ts
├── package.json
└── README.md
```

---

## 🌐 API — Endpoints

Base URL: `https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/v1/register` | Registrar novo usuário |
| POST | `/auth/v1/login` | Login — retorna `token` e `userId` |
| GET | `/auth/v1/stats/:userId` | Retornar perfil/stats |
| PUT | `/auth/v1/stats/:userId` | Atualizar stats (vitórias, derrotas, nível) |
| GET | `/pokemon/v1/team?user-id=` | Retornar time do usuário |
| PUT | `/pokemon/v1/team?user-id=&removed-pokemon=&new-pokemon=` | Atualizar time |
| PUT | `/pokemon/v1/captured?user-id=&pokemon-id=` | Adicionar pokémon capturado |
| DELETE | `/pokemon/v1/captured?user-id=&pokemon-id=` | Remover pokémon capturado |

---

## ⚔️ Sistema de Batalha

1. Cada jogador entra com **5 Pokémons** (do time cadastrado ou aleatórios)
2. A cada rodada, um **atributo é sorteado aleatoriamente** (HP, ATK, DEF, SP.ATK, SP.DEF, SPD)
3. Os valores de cada Pokémon naquele atributo são comparados
4. Quem tiver o **valor maior vence a rodada** e causa dano proporcional ao adversário
5. Quando o HP de um Pokémon zera, ele é eliminado
6. **Vence a batalha** quem fizer **3 vitórias** primeiro (ou eliminar todo o time inimigo)
7. Resultado (vitória ou derrota) é **salvo automaticamente no perfil** via API

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js v20 LTS → https://nodejs.org
- Git → https://git-scm.com
- Expo Go no celular (opcional)

### Instalação
```bash
git clone https://github.com/SEU_USUARIO/PokemonMultiplataforma.git
cd PokemonMultiplataforma
npm install
npx expo start
```

Pressione `w` para abrir no navegador, ou escaneie o QR code com o Expo Go.

