import axios, { AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User, AuthError } from '../models/User.model';

// URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuración de la instancia de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem('accessibility_language');
    if (lang) {
        config.headers['Accept-Language'] = lang;
    }

    return config;
});

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        // Manejo de Errores V2: El backend devuelve { success: false, message: '...', errors: {...} }
        if (error.response) {
            const { status, data } = error.response;

            // 401: No autorizado (Token vencido o inválido)
            if (status === 401) {
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Si hay un mensaje de error del backend, lo propagamos
            if (data && data.message) {
                // Aquí podrías disparar una notificación global (Toast)
                console.warn('Backend Error:', data.message);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    // Iniciar sesión
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/login', credentials);

            // Guardar token y usuario si la respuesta es exitosa
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('Error de inicio de sesión:', error);
            if (axios.isAxiosError(error) && error.response?.data) {
                throw error.response.data as AuthError;
            }
            throw new Error('Error de conexión con el servidor');
        }
    },

    // Registrar usuario
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/register', data);

            // Auto-login al registrarse (si el backend devuelve token)
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('Error en el registro:', error);
            if (axios.isAxiosError(error) && error.response?.data) {
                throw error.response.data as AuthError;
            }
            throw new Error('Error al registrar usuario');
        }
    },

    // Cerrar sesión
    async logout(): Promise<void> {
        try {
            await api.post('/logout'); // Invalida el token en backend
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpia sesión local independientemente del error en backend
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    // Obtener usuario actual desde el backend (validar token)
    async getProfile(): Promise<User> {
        const response = await api.get<User>('/me');
        localStorage.setItem('user', JSON.stringify(response.data)); // Actualizar cache local
        return response.data;
    },

    // Actualizar perfil
    async updateProfile(data: Partial<User> | FormData): Promise<any> {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
        }

        const response = await api.post<any>('/me/profile', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });

        // Actualizar localStorage con el usuario actualizado
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        } else if (response.data.id) {
            // Fallback: si el backend devuelve el user directamente
            localStorage.setItem('user', JSON.stringify(response.data));
        }

        // Devolver la respuesta completa para que la vista pueda verificar 'success'
        return response.data;
    },

    // Actualizar contraseña
    async updatePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<any> {
        const response = await api.put('/me/password', data);
        return response.data;
    },

    // Recuperar contraseña
    async forgotPassword(email: string): Promise<any> {
        const response = await api.post('/password/email', { email });
        return response.data;
    },

    async resetPassword(data: any): Promise<any> {
        const response = await api.post('/password/reset', data);
        return response.data;
    },

    // Métodos auxiliares locales
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default api; // Exportamos la instancia de axios por si se necesita en otros servicios
