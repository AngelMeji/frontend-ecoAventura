import api from './authService';
import type { Place, PaginatedResponse, Category } from '../models/Place.model';

// Definición de parámetros para filtrar lugares
export interface PlaceFilters {
    page?: number;
    category?: string; // slug de categoría
    search?: string;
    featured?: number; // 1 o 0
    user_id?: number | string;
    per_page?: number;
}

export const placesService = {
    // 3.3 Lugares (Places)
    // Listado Público (Home/Búsqueda)
    async getAll(filters: PlaceFilters = {}): Promise<PaginatedResponse<Place>> {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
        if (filters.user_id) params.append('user_id', filters.user_id.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());

        const response = await api.get<PaginatedResponse<Place>>(`/places?${params.toString()}`);
        return response.data;
    },

    // Detalle de Lugar
    async getOne(idOrSlug: string | number): Promise<Place> {
        const response = await api.get<Place>(`/places/${idOrSlug}`);
        return response.data;
    },

    // Crear Lugar (Partner/Admin)
    async create(data: FormData): Promise<Place> {
        const response = await api.post<Place>('/places', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Editar Lugar
    async update(id: number, data: FormData): Promise<Place> {
        // Usamos POST con _method=PUT para compatibilidad con subida de archivos
        data.append('_method', 'PUT');
        const response = await api.post<Place>(`/places/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Eliminar Lugar
    async delete(id: number): Promise<void> {
        await api.delete(`/places/${id}`);
    },

    // 3.4 Interacción Social
    // Reseñas
    async createReview(placeId: number, review: { rating: number; comment: string }): Promise<any> {
        const response = await api.post(`/places/${placeId}/reviews`, review);
        return response.data;
    },

    async deleteReview(reviewId: number): Promise<void> {
        await api.delete(`/reviews/${reviewId}`);
    },

    // Note: Update review route not explicitly listed in provided routes, trying standard PUT
    async updateReview(reviewId: number, review: { rating: number; comment: string }): Promise<any> {
        // If this 404s, backend needs Route::put('/reviews/{id}', ...)
        const response = await api.put(`/reviews/${reviewId}`, review);
        return response.data;
    },

    // Favoritos
    async getFavorites(): Promise<Place[]> {
        const response = await api.get<Place[]>('/favorites');
        return Array.isArray(response.data) ? response.data : [];
    },

    async addFavorite(placeId: number): Promise<void> {
        await api.post('/favorites', { place_id: placeId });
    },

    async removeFavorite(placeId: number): Promise<void> {
        await api.delete(`/favorites/${placeId}`);
    },

    // 3.5 Categorías
    async getCategories(): Promise<Category[]> {
        try {
            const response = await api.get('/categories');
            const data = response.data;

            // Handle various response structures
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            if (data?.categories && Array.isArray(data.categories)) return data.categories; // New check

            console.warn('Unexpected category response structure:', data);
            return [];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    },

    // 3.6 Administración (Panel & Dashboard)
    // Dashboards (Stats)
    async getAdminDashboard(): Promise<any> {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    async getPartnerDashboard(): Promise<any> {
        const response = await api.get('/partner/dashboard');
        return response.data;
    },

    async getUserDashboard(): Promise<any> {
        const response = await api.get('/user/dashboard');
        return response.data;
    },

    // Moderación de Lugares (Solo Admin)
    async getPendingPlaces(page: number = 1): Promise<PaginatedResponse<Place>> {
        const response = await api.get<PaginatedResponse<Place>>(`/admin/places/pending?page=${page}`);
        return response.data;
    },

    async getAdminAllPlaces(page: number = 1): Promise<PaginatedResponse<Place>> {
        const response = await api.get<PaginatedResponse<Place>>('/admin/places', { params: { page } });
        return response.data;
    },

    // SPEC: PATCH /places/{id}/approve
    async approve(id: number): Promise<Place> {
        const response = await api.patch<Place>(`/places/${id}/approve`);
        return response.data;
    },

    // SPEC: PATCH /places/{id}/reject
    async reject(id: number): Promise<Place> {
        const response = await api.patch<Place>(`/places/${id}/reject`);
        return response.data;
    },

    // SPEC: PATCH /places/{id}/set-pending
    async setPending(id: number): Promise<Place> {
        const response = await api.patch<Place>(`/places/${id}/set-pending`);
        return response.data;
    },

    // SPEC: PATCH /places/{id}/needs-fix
    async needsFix(id: number): Promise<Place> {
        const response = await api.patch<Place>(`/places/${id}/needs-fix`);
        return response.data;
    },

    // Gestión de Usuarios (CRUD Admin)
    async getAllUsers(page: number = 1): Promise<PaginatedResponse<any>> {
        const response = await api.get<PaginatedResponse<any>>(`/admin/users?page=${page}`);
        return response.data;
    },

    // SPEC: POST /admin/users
    async createUser(data: any): Promise<any> {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    // SPEC: PUT /admin/users/{id}
    async updateUser(id: number, data: Partial<any>): Promise<any> {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    // SPEC: DELETE /admin/users/{id}
    async deleteUser(id: number): Promise<void> {
        await api.delete(`/admin/users/${id}`);
    },

    // === ADMIN REVIEW MODERATION ===
    async getAllReviews(page: number = 1): Promise<PaginatedResponse<any>> {
        const response = await api.get<PaginatedResponse<any>>(`/admin/reviews?page=${page}`);
        return response.data;
    },


    async toggleHideReview(id: number): Promise<any> {
        const response = await api.patch(`/admin/reviews/${id}/toggle-hide`);
        return response.data;
    },

    // 3.7 Chatbot AI
    async chatWithPlace(placeId: number, message: string): Promise<{ response: string }> {
        const response = await api.post<{ response: string }>(`/places/${placeId}/chat`, { message });
        return response.data;
    }
};

