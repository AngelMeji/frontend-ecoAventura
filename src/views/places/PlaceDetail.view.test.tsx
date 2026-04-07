import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlaceDetail from './PlaceDetail.view';
import { placesService } from '../../services/placesService';
import { authService } from '../../services/authService';

// Mock layout & heavy components
vi.mock('../../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/places/PlaceChatbot', () => ({ default: () => <div data-testid="chatbot" /> }));
vi.mock('../../utils/imageUtils', () => ({ getOptimizedImageUrl: (url: string) => url }));

vi.mock('../../services/placesService', () => ({
    placesService: {
        getOne: vi.fn(),
        getFavorites: vi.fn(),
        createReview: vi.fn(),
        deleteReview: vi.fn(),
        updateReview: vi.fn(),
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
    },
}));

vi.mock('../../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
    },
}));

const mockPlace = {
    id: 1,
    name: 'Cascada Marimba',
    address: 'Km 5 vía Pereira',
    description: 'Una hermosa cascada en Risaralda.',
    short_description: 'Cascada impresionante',
    category: { name: 'Cascada', id: 1 },
    images: [{ id: 1, image_path: 'https://example.com/img.jpg', full_url: 'https://example.com/img.jpg' }],
    average_rating: 4.5,
    reviews: [],
    is_favorite: false,
    difficulty: 'Fácil',
    duration: '2 horas',
    best_season: 'Todo el año',
    latitude: 4.8,
    longitude: -75.6,
};

describe('PlaceDetail View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPlaceDetail = (id = '1') =>
        render(
            <MemoryRouter initialEntries={[`/places/${id}`]}>
                <Routes>
                    <Route path="/places/:id" element={<PlaceDetail />} />
                </Routes>
            </MemoryRouter>
        );

    it('shows loading state initially', () => {
        vi.mocked(placesService.getOne).mockReturnValue(new Promise(() => {}) as any); // never resolves
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderPlaceDetail();
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('shows "Lugar no encontrado" when place is null after loading', async () => {
        vi.mocked(placesService.getOne).mockRejectedValueOnce(new Error('Not found'));
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderPlaceDetail();

        await waitFor(() => {
            expect(screen.getByText('Lugar no encontrado')).toBeInTheDocument();
        });
    });

    it('renders place name and address when data loads', async () => {
        vi.mocked(placesService.getOne).mockResolvedValueOnce(mockPlace as any);
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderPlaceDetail();

        await waitFor(() => {
            expect(screen.getByText('Cascada Marimba')).toBeInTheDocument();
            expect(screen.getByText('Km 5 vía Pereira')).toBeInTheDocument();
        });
    });

    it('shows login CTA for guest users instead of tabs', async () => {
        vi.mocked(placesService.getOne).mockResolvedValueOnce(mockPlace as any);
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderPlaceDetail();

        await waitFor(() => {
            expect(screen.getByText('Contenido Exclusivo para Miembros')).toBeInTheDocument();
            expect(screen.queryByText('Información')).not.toBeInTheDocument();
        });
    });

    it('shows Información, Reseñas and Asistente IA tabs for authenticated users', async () => {
        vi.mocked(placesService.getOne).mockResolvedValueOnce(mockPlace as any);
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'User', email: 'u@u.com', role: 'user' });
        renderPlaceDetail();

        await waitFor(() => {
            expect(screen.getByText('Información')).toBeInTheDocument();
            expect(screen.getByText(/Reseñas/)).toBeInTheDocument();
            expect(screen.getByText('Asistente IA')).toBeInTheDocument();
        });
    });

    it('switches tab to Reseñas when clicked by authenticated user', async () => {
        vi.mocked(placesService.getOne).mockResolvedValueOnce(mockPlace as any);
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'User', email: 'u@u.com', role: 'user' });
        renderPlaceDetail();

        await waitFor(() => screen.getByText('Información'));

        fireEvent.click(screen.getByText(/Reseñas/));

        await waitFor(() => {
            expect(screen.getByText('Escribe tu opinión')).toBeInTheDocument();
            expect(screen.getByText('Comentarios (0)')).toBeInTheDocument();
        });
    });

    it('shows error when submitting review without a rating selection', async () => {
        vi.mocked(placesService.getOne).mockResolvedValueOnce(mockPlace as any);
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'User', email: 'u@u.com', role: 'user' as const });
        renderPlaceDetail();

        await waitFor(() => screen.getByText('Información'));
        fireEvent.click(screen.getByText(/Reseñas/));
        await waitFor(() => screen.getByText('Escribe tu opinión'));

        // Submit the review form directly without setting a rating (submit instead of clicking disabled button)
        const reviewForm = document.querySelector('form')!;
        fireEvent.submit(reviewForm);

        await waitFor(() => {
            expect(screen.getByText('Por favor selecciona una calificación')).toBeInTheDocument();
        });
    });
});
