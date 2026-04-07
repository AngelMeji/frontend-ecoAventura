import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile.view';
import { authService } from '../services/authService';

// Mock heavy layout components
vi.mock('../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'home.profile.title': 'Mi Perfil',
                'home.profile.messages.profileUpdateSuccess': 'Perfil actualizado correctamente',
                'home.profile.messages.passwordMismatch': 'Las contraseñas no coinciden',
                'auth.register.validation.passwordMin': 'La contraseña debe tener entre 8 y 12 caracteres',
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock('../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
        updateProfile: vi.fn(),
        updatePassword: vi.fn(),
    },
}));

// Mock window.alert
vi.spyOn(window, 'alert').mockImplementation(() => {});

const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    bio: 'Mi bio',
    avatar: '',
};

describe('Profile View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderProfile = () =>
        render(<BrowserRouter><Profile /></BrowserRouter>);

    it('redirects to /login if user is not authenticated', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);
        renderProfile();

        // Navigate component would redirect; check that profile content is NOT shown
        expect(screen.queryByText('Mi Perfil')).not.toBeInTheDocument();
    });

    it('renders profile page with user name when authenticated', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        renderProfile();

        expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
        expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('pre-fills the Name field with the current user name', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        renderProfile();

        const nameInput = screen.getByDisplayValue('Test User');
        expect(nameInput).toBeInTheDocument();
    });

    it('shows success message after successful profile update', async () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.updateProfile).mockResolvedValueOnce({ success: true, message: 'Perfil actualizado correctamente' } as any);
        const { container } = renderProfile();

        const form = container.querySelectorAll('form')[0];
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
        });
    });

    it('shows validation error when new passwords do not match', async () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        const { container } = renderProfile();

        // Fill password form
        const passwordInputs = screen.getAllByDisplayValue('');
        // Find the password inputs by label - Contraseña Actual, Nueva Contraseña, Confirmar Contraseña
        const [, newPassInput, confirmPassInput] = passwordInputs;
        
        if (newPassInput && confirmPassInput) {
            fireEvent.change(newPassInput, { target: { value: 'Strong123!' } });
            fireEvent.change(confirmPassInput, { target: { value: 'Strong124!' } });
        }

        const passwordForm = container.querySelectorAll('form')[1];
        fireEvent.submit(passwordForm);

        await waitFor(() => {
            expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
        });
    });

    it('shows validation error when new password is too short', async () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        const { container } = renderProfile();

        // Get all password inputs (current, new, confirm)
        const passwordInputs = container.querySelectorAll('input[type="password"]');
        const newPassInput = passwordInputs[1]; // Nueva Contraseña
        const confirmPassInput = passwordInputs[2]; // Confirmar Contraseña

        fireEvent.change(newPassInput, { target: { value: '123' } });
        fireEvent.change(confirmPassInput, { target: { value: '123' } });

        const passwordForm = container.querySelectorAll('form')[1];
        fireEvent.submit(passwordForm);

        await waitFor(() => {
            expect(screen.getByText('La contraseña debe tener entre 8 y 12 caracteres')).toBeInTheDocument();
        });
    });
});
