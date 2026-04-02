import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500); // Delay for better UX
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-[9999] animate-fade-in-up">
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-eco-primary-100 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍪</span>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-gray-800 text-lg">Control de Privacidad</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Utilizamos cookies para ofrecerte la mejor experiencia en nuestro paraíso natural. Al navegar, aceptas nuestras políticas. 
                            <Link to="/privacy" className="text-eco-primary-600 hover:underline mx-1 font-semibold">Leer más</Link>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={acceptCookies}
                            className="flex-1 bg-eco-primary-600 hover:bg-eco-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-eco-primary-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Aceptar
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-400 py-3 px-6 rounded-xl transition-colors font-medium"
                        >
                            Configurar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
