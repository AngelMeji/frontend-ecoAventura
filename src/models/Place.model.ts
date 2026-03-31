import type { User } from './User.model';

// Interfaz para la Categoría
export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
}

// Interfaz para Imágenes de Lugares
export interface PlaceImage {
    id: number;
    place_id?: number;
    image_path: string; // Ruta relativa en storage
    full_url?: string; // V2: URL completa desde el backend
    is_primary?: boolean;
}

// Interfaz para Reseñas
export interface Review {
    id: number;
    user_id: number;
    place_id: number;
    rating: number;
    comment: string;
    created_at: string;
    user?: User; // Incluye datos del usuario si viene en la relación
}

// Interfaz Principal de Lugar (Place) coincidiendo con Laravel
export interface Place {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    address: string;
    latitude: number;
    longitude: number;
    status: 'approved' | 'pending' | 'rejected' | 'needs_fix';
    is_featured: boolean | number;

    // Nuevos campos
    difficulty?: 'baja' | 'media' | 'alta' | 'experto' | null;
    duration?: string;
    best_season?: string;

    // Relaciones
    category_id?: number;
    category?: Category;
    user_id?: number;
    user?: User;
    images?: PlaceImage[];
    reviews?: Review[];

    // Atributos calculados
    average_rating?: number;
    is_favorite?: boolean;

    created_at?: string;
    updated_at?: string;
}

// Estructura para la respuesta paginada de Laravel
export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
