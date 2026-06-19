import api from '@/integration/api';

export interface AuthCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: string;
    username: string;
}

export interface UserStats {
    userId: string;
    username: string;
    level: string;
    vitorias: string;
    derrotas: string;
}

export interface UpdateStatsPayload {
    level: string;
    vitorias: string;
    derrotas: string;
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/v1/register', credentials);
    return response.data;
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/v1/login', credentials);
    return response.data;
}

export async function getUserStats(userId: string, token?: string): Promise<UserStats> {
    const response = await api.get<UserStats>(`/auth/v1/stats/${userId}`);
    return response.data;
}

export async function updateUserStats(
    userId: string,
    payload: UpdateStatsPayload,
    token?: string
): Promise<UserStats> {
    const response = await api.put<UserStats>(`/auth/v1/stats/${userId}`, payload);
    return response.data;
}
