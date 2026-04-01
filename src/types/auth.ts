export interface User {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'socio';
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export interface AuthError {
    message: string;
    errors?: Record<string, string[]>;
}
