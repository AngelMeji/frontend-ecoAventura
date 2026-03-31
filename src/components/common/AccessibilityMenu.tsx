import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface AccessibilityMenuProps {
    isMobile?: boolean;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isMobile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { language, setLanguage, t } = useLanguage();

    // Initialize state from localStorage or default values
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('accessibility_fontSize');
        return saved ? parseInt(saved, 10) : 100;
    });
    const [invertColors, setInvertColors] = useState(() => {
        return localStorage.getItem('accessibility_invertColors') === 'true';
    });
    const [grayscale, setGrayscale] = useState(() => {
        return localStorage.getItem('accessibility_grayscale') === 'true';
    });

    // Apply styles whenever state changes and save to localStorage
    useEffect(() => {
        const root = document.documentElement;

        // Font Size
        root.style.fontSize = `${fontSize}%`;
        localStorage.setItem('accessibility_fontSize', fontSize.toString());

        // Invert Colors
        if (invertColors) {
            root.classList.add('invert-colors');
        } else {
            root.classList.remove('invert-colors');
        }
        localStorage.setItem('accessibility_invertColors', invertColors.toString());

        // Grayscale
        if (grayscale) {
            root.classList.add('grayscale');
        } else {
            root.classList.remove('grayscale');
        }
        localStorage.setItem('accessibility_grayscale', grayscale.toString());

    }, [fontSize, invertColors, grayscale]);

    // Close menu when clicking outside (only for desktop dropdown)
    useEffect(() => {
        if (isMobile) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isMobile]);

    const resetSettings = () => {
        setFontSize(100);
        setInvertColors(false);
        setGrayscale(false);
        setLanguage('es');
    };

    const renderPanel = () => (
        <div className={isMobile ? "mt-4 space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100" : "absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in-up origin-top-right"}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">{t('accessibility.title')}</h3>
                <button
                    onClick={resetSettings}
                    className="text-xs text-eco-primary-600 hover:underline"
                >
                    {t('accessibility.reset')}
                </button>
            </div>

            <div className="space-y-4">
                {/* Language */}
                <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('accessibility.language')}</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setLanguage('es')}
                            className={`flex-1 py-1 px-3 rounded-md transition-all text-sm font-medium ${language === 'es' ? 'bg-white shadow-sm text-eco-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            Español
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-1 px-3 rounded-md transition-all text-sm font-medium ${language === 'en' ? 'bg-white shadow-sm text-eco-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            English
                        </button>
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <span className="text-sm text-gray-600 block mb-2">{t('accessibility.fontSize')}</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                            className="flex-1 py-1 px-3 hover:bg-white rounded-md transition-colors text-sm font-bold"
                            aria-label="Decrease font size"
                        >
                            A-
                        </button>
                        <span className="flex-1 py-1 text-center text-sm font-medium border-l border-r border-gray-200">
                            {fontSize}%
                        </span>
                        <button
                            onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                            className="flex-1 py-1 px-3 hover:bg-white rounded-md transition-colors text-sm font-bold"
                            aria-label="Increase font size"
                        >
                            A+
                        </button>
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                    <button
                        onClick={() => setInvertColors(!invertColors)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${invertColors ? 'bg-eco-primary-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                        <span className="text-sm font-medium">{t('accessibility.invertColors')}</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${invertColors ? 'bg-white/30' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${invertColors ? 'translate-x-5' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={() => setGrayscale(!grayscale)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${grayscale ? 'bg-gray-800 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                        <span className="text-sm font-medium">{t('accessibility.grayscale')}</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${grayscale ? 'bg-white/30' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${grayscale ? 'translate-x-5' : ''}`} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full text-left text-2xl font-display font-medium transition-colors flex items-center justify-between ${isOpen ? 'text-eco-primary-600' : 'text-gray-800'}`}
                >
                    <span>{t('accessibility.title')}</span>
                    <svg
                        className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && renderPanel()}
            </div>
        );
    }

    return (
        <div className="relative z-50" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label={t('accessibility.options')}
                title={t('accessibility.title')}
            >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="7.5" r="1.5" />
                    <path d="M12 9v6" />
                    <path d="M8 12l4-2 4 2" />
                    <path d="M9 19l3-4 3 4" />
                </svg>
            </button>

            {isOpen && renderPanel()}
        </div>
    );
};

export default AccessibilityMenu;
