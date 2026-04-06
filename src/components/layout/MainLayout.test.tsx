import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from './MainLayout';
import { BrowserRouter } from 'react-router-dom';

// Mock Header and Footer to isolate MainLayout test
vi.mock('./Header', () => ({ default: () => <header data-testid="mock-header" /> }));
vi.mock('./Footer', () => ({ default: () => <footer data-testid="mock-footer" /> }));

describe('MainLayout Component', () => {
    it('renders Header, Outlet, and Footer', () => {
        render(
            <BrowserRouter>
                <MainLayout />
            </BrowserRouter>
        );

        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
        
        // The main element should exist
        expect(screen.getByRole('main')).toBeInTheDocument();
    });
});
