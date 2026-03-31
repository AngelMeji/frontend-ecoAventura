// Interfaz de Usuario mapeada a la base de datos de Laravel
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'partner' | 'user'; // Roles disponibles: admin, partner, user
    bio?: string; // Biografía opcional
    avatar?: string; // Ruta relativa del avatar
    full_avatar?: string; // URL absoluta del avatar (generada por el backend)
    created_at?: string;
    updated_at?: string;
}

// Credenciales para inicio de sesión
export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

// Datos para registro de usuario
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string; // Confirmación de contraseña requerida por Laravel
    acceptTerms?: boolean;
}

// Respuesta de autenticación
export interface AuthResponse {
    user: User;
    token: string; // Token de acceso JWT
    message?: string;
}

// Estructura de error de validación de Laravel
export interface AuthError {
    message: string;
    errors?: Record<string, string[]>;
}
