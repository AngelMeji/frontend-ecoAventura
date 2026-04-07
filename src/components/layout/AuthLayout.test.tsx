import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthLayout from './AuthLayout';
import { BrowserRouter } from 'react-router-dom';

// Mock Header and Footer to isolate AuthLayout test
vi.mock('./Header', () => ({ default: () => <header data-testid="mock-header" /> }));
vi.mock('./Footer', () => ({ default: () => <footer data-testid="mock-footer" /> }));

describe('AuthLayout Component', () => {
    it('renders Header, children, and Footer', () => {
        render(
            <BrowserRouter>
                <AuthLayout>
                    <div data-testid="auth-content">Contenido de autenticación</div>
                </AuthLayout>
            </BrowserRouter>
        );

        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
        
        // The children should be rendered
        expect(screen.getByTestId('auth-content')).toBeInTheDocument();
        expect(screen.getByText('Contenido de autenticación')).toBeInTheDocument();
    });
});
