import { placesService } from '../services/placesService';
import type { Place, PaginatedResponse } from '../models/Place.model';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * DestinationController (Refactorizado)
 * Adaptador entre la Vista y el Servicio de Lugares (Backend)
 */
export class DestinationController {

    /**
     * Obtiene todos los destinos desde el backend con paginación
     */
    static async getAllDestinations(page: number = 1, perPage: number = 12): Promise<PaginatedResponse<Place>> {
        return await placesService.getAll({ page, per_page: perPage });
    }

    /**
     * Obtiene destinos filtrados por categoría con paginación
     */
    static async getDestinationsByCategory(categorySlug: string, page: number = 1, perPage: number = 12): Promise<PaginatedResponse<Place>> {
        if (categorySlug === 'Todos' || categorySlug === '') {
            return this.getAllDestinations(page, perPage);
        }
        return await placesService.getAll({ category: categorySlug, page, per_page: perPage });
    }

    /**
     * Busca destinos por texto con paginación
     */
    static async searchDestinations(query: string, page: number = 1, perPage: number = 12): Promise<PaginatedResponse<Place>> {
        return await placesService.getAll({ search: query, page, per_page: perPage });
    }

    /**
     * Obtiene un destino por ID
     */
    static async getDestinationById(id: number): Promise<Place> {
        return await placesService.getOne(id);
    }

    /**
     * Obtiene estadísticas de categorías dinámicamente desde el backend
     */
    static async getCategoryStats(): Promise<{ name: string; slug: string; count: number; avgRating: number; icon: string }[]> {
        try {
            // Obtenemos las categorías directamente del backend
            const backendCategories = await placesService.getCategories();

            // Si el backend no devuelve nada o hay error, devolvemos array vacío
            if (!backendCategories || !Array.isArray(backendCategories)) {
                return [];
            }

            // Mapeamos las categorías del backend al formato que necesita el frontend
            return backendCategories.map((cat: any) => ({
                name: cat.name,
                slug: cat.slug || cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-'),
                count: cat.count || cat.places_count || 0,
                avgRating: cat.avgRating || cat.avg_rating || 4.5, // Valor por defecto si no viene
                icon: cat.icon || getCategoryIcon(cat.slug || cat.name)
            }));

        } catch (error) {
            console.error('Error al obtener categorías del servidor:', error);
            return [];
        }
    }

    static async getFeaturedDestinations(): Promise<Place[]> {
        // Usar filtro del backend
        const response = await placesService.getAll({ featured: 1 });
        return response.data;
    }

    static async getPopularDestinations(): Promise<Place[]> {
        // Idealmente endpoint de backend, por ahora obtenemos todos y ordenamos
        // O si el backend soportara ?sort=rating
        const response = await placesService.getAll();
        return response.data.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 4);
    }
}
