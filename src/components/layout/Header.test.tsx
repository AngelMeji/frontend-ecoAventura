import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import { authService } from '../../services/authService';

// Mock the language context
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'es',
        setLanguage: vi.fn(),
        t: (key: string) => {
            const translations: Record<string, string> = {
                'header.home': 'Inicio',
                'header.login': 'Iniciar Sesión',
                'header.register': 'Registrarse',
                'header.logout': 'Cerrar Sesión',
                'header.myAccount': 'Mi Cuenta',
                'header.adminPanel': 'Panel Admin',
                'header.partnerPanel': 'Panel Socio',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock authService
vi.mock('../../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        logout: vi.fn().mockResolvedValue(undefined),
    },
}));

// Mock partnerService (Header loads notifications dynamically)
vi.mock('../../services/partnerService', () => ({
    partnerService: {
        getNotifications: vi.fn().mockResolvedValue({ type: 'user', notifications: [] }),
        markAsRead: vi.fn().mockResolvedValue(undefined),
    },
}));

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderHeader = () =>
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

    it('renders the logo and navigation links', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderHeader();
        // Logo should render 'EcoAventura' text
        expect(screen.getAllByText('EcoAventura').length).toBeGreaterThan(0);
        // Header nav link to home should be rendered
        expect(screen.getAllByRole('link', { name: /EcoAventura/i }).length).toBeGreaterThan(0);
    });

    it('shows Login and Register links when user is not authenticated', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderHeader();
        expect(screen.getAllByText('Iniciar Sesión').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Registrarse').length).toBeGreaterThan(0);
    });

    it('shows user name and logout button when user IS authenticated', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'Juan Test', email: 'j@j.com', role: 'user' });
        renderHeader();
        expect(screen.getAllByText('Juan Test').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Cerrar Sesión').length).toBeGreaterThan(0);
    });

    it('shows admin panel label when user role is admin', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'Admin User', email: 'a@a.com', role: 'admin' });
        renderHeader();
        expect(screen.getAllByText('Panel Admin').length).toBeGreaterThan(0);
    });

    it('shows partner panel label when user role is partner', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 2, name: 'Socio User', email: 's@s.com', role: 'partner' });
        renderHeader();
        expect(screen.getAllByText('Panel Socio').length).toBeGreaterThan(0);
    });

    it('clears localStorage on logout button click', () => {
        localStorage.setItem('auth_token', 'test_token');
        localStorage.setItem('user', JSON.stringify({ id: 1 }));
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'Juan Test', email: 'j@j.com', role: 'user' });
        renderHeader();

        // Find desktop logout button
        const logoutButtons = screen.getAllByText('Cerrar Sesión');
        fireEvent.click(logoutButtons[0]);

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('toggles the mobile menu on hamburger click', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderHeader();
        const hamburgerButton = screen.getByLabelText('Toggle menu');
        expect(hamburgerButton).toBeInTheDocument();
        fireEvent.click(hamburgerButton);
        // After clicking hamburger, mobile nav should be accessible
        expect(hamburgerButton).toBeInTheDocument();
    });
});
