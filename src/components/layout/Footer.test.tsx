import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';
import { authService } from '../../services/authService';

// Mock the language context
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'es',
        setLanguage: vi.fn(),
        t: (key: string) => key, // returns the key as-is
    }),
}));

// Mock authService
vi.mock('../../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        logout: vi.fn(),
    },
}));

describe('Footer Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderFooter = () =>
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );

    it('renders within a footer element and displays brand name', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderFooter();
        expect(screen.getByText('EcoAventura')).toBeInTheDocument();
    });

    it('displays navigation sections (Explorar, Soporte)', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderFooter();
        expect(screen.getByText('Explorar')).toBeInTheDocument();
        expect(screen.getByText('Soporte')).toBeInTheDocument();
    });

    it('shows Ser Socio and partner CTA for guest users', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderFooter();
        expect(screen.getByText('Ser Socio')).toBeInTheDocument();
        expect(screen.getByText('Solicitar ser Socio')).toBeInTheDocument();
    });

    it('hides Ser Socio section when user is an admin', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'Admin', email: 'a@a.com', role: 'admin' });
        renderFooter();
        expect(screen.queryByText('Solicitar ser Socio')).not.toBeInTheDocument();
    });

    it('hides Ser Socio section when user is a partner', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 2, name: 'Socio', email: 'p@p.com', role: 'partner' });
        renderFooter();
        expect(screen.queryByText('Solicitar ser Socio')).not.toBeInTheDocument();
    });
});
