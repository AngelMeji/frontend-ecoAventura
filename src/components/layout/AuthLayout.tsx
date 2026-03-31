import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen relative bg-eco-light flex flex-col">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591187428867-0744654974f0?q=80&w=2070&auto=format&fit=crop')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-eco-primary-900/40 to-eco-primary-800/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-20 w-full">
                <Header />
            </div>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <div className="relative z-20 w-full text-white/80">
                <Footer />
            </div>
        </div>
    );
};

export default AuthLayout;
