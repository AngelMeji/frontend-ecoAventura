import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard.view';
import { authService } from '../services/authService';
import { placesService } from '../services/placesService';

// Mock language context
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key })
}));

// Mock sub-components
vi.mock('../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../components/dashboard/AdminUsersTable', () => ({ default: () => <div data-testid="admin-users" /> }));
vi.mock('../components/dashboard/AdminReviewsTable', () => ({ default: () => <div data-testid="admin-reviews" /> }));

vi.mock('../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
    },
}));

vi.mock('../services/placesService', () => ({
    placesService: {
        getAdminDashboard: vi.fn(),
        getPartnerDashboard: vi.fn(),
        getUserDashboard: vi.fn(),
        getFavorites: vi.fn(),
        getAdminAllPlaces: vi.fn(),
        getPendingPlaces: vi.fn(),
        getAll: vi.fn(),
    },
}));

const mockAdminUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
const mockPartnerUser = { id: 2, name: 'Partner', email: 'partner@test.com', role: 'partner' as const };
const mockNormalUser = { id: 3, name: 'User', email: 'user@test.com', role: 'user' as const };

describe('Dashboard View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderDashboard = () =>
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<div data-testid="login-redirect" />} />
                </Routes>
            </MemoryRouter>
        );

    it('redirects to /login if not authenticated', () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderDashboard();

        expect(screen.getByTestId('login-redirect')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockAdminUser);
        
        // Ensure promise does not resolve immediately
        vi.mocked(placesService.getAdminDashboard).mockReturnValue(new Promise(() => {}) as any);
        
        renderDashboard();
        expect(screen.getByText('home.dashboard.messages.loading')).toBeInTheDocument();
    });

    it('renders Admin dashboard correctly', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockAdminUser);
        
        vi.mocked(placesService.getAdminDashboard).mockResolvedValue({
            stats: { total_users: 10, total_places: 20, pending_places: 5, reviews_count: 50 }
        } as any);
        vi.mocked(placesService.getPendingPlaces).mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 } as any);
        vi.mocked(placesService.getAdminAllPlaces).mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 } as any);

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument(); // total users
            expect(screen.getByText('20')).toBeInTheDocument(); // total places
            expect(screen.getByText('5')).toBeInTheDocument(); // pending places
            expect(screen.getByText('home.dashboard.welcome.hello, Admin')).toBeInTheDocument();
        });
    });

    it('renders Partner dashboard correctly', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockPartnerUser);
        
        vi.mocked(placesService.getPartnerDashboard).mockResolvedValue({
            stats: { total_places: 3, total_reviews: 10, average_rating: 4.5 },
            places: []
        } as any);
        vi.mocked(placesService.getAll).mockResolvedValue({ data: [] } as any);

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('home.dashboard.welcome.hello, Partner')).toBeInTheDocument();
            expect(screen.getByText('home.dashboard.welcome.verifiedPartner')).toBeInTheDocument();
        });
    });

    it('renders User dashboard with favorites correctly', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockNormalUser);
        
        vi.mocked(placesService.getUserDashboard).mockResolvedValue({
            stats: { reviews_count: 2, favorites_count: 1 }
        } as any);
        
        const mockFavPlaces = [
            { id: 10, name: 'Cascada de Fuego', category: { name: 'Cascada' } }
        ];
        vi.mocked(placesService.getFavorites).mockResolvedValue(mockFavPlaces as any);

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('home.dashboard.welcome.hello, User')).toBeInTheDocument();
            expect(screen.getByText('home.dashboard.welcome.explorer')).toBeInTheDocument();
            expect(screen.getByText('Cascada de Fuego')).toBeInTheDocument();
        });
    });
});
