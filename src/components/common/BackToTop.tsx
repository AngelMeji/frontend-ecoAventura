import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // No mostrar en rutas de administración o dashboard
    const isAdminRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.includes('/admin/');

    useEffect(() => {
        let isTicking = false;

        const handleScroll = () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    setIsVisible(window.scrollY > 300);
                    isTicking = false;
                });
                isTicking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (isAdminRoute) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-500 z-50 
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
                bg-eco-primary-600 hover:bg-eco-primary-700 text-white hover:animate-bounce`}
            aria-label="Volver arriba"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
};

export default BackToTop;
