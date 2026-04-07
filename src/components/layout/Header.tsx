import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import AccessibilityMenu from '../common/AccessibilityMenu';
import NotificationBell from '../common/NotificationBell';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import SafeImage from '../common/SafeImage';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const Header: React.FC = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isAuthenticated = !!user;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { t } = useLanguage();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        // Clear local storage immediately
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Call backend to invalidate token (optional, don't await blocking UI)
        authService.logout().catch(console.error);

        // Force reload
        window.location.href = '/login';
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="bg-white border-b border-eco-primary-100 sticky top-0 z-[9999] shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link
                    to="/home"
                    onClick={(e) => {
                        if (location.pathname === '/home') {
                            e.preventDefault();
                            window.location.reload();
                        }
                    }}
                    className="flex-shrink-0 hover:scale-105 transition-transform z-50 relative"
                >
                    <Logo />
                </Link>

                {/* Hamburger Button (Spin & Cross Animation) */}
                <button
                    className="md:hidden z-50 relative w-12 h-12 flex justify-center items-center focus:outline-none rounded-full hover:bg-gray-50 transition-colors group"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <div className={`flex flex-col justify-between w-6 h-[18px] transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'rotate-180' : ''}`}>
                        <span className={`block h-0.5 w-full bg-eco-primary-700 rounded-full transition-all duration-300 ease-in-out origin-center ${isMenuOpen ? 'translate-y-[8px] rotate-45' : ''}`} />
                        <span className={`block h-0.5 w-full bg-eco-primary-700 rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                        <span className={`block h-0.5 w-full bg-eco-primary-700 rounded-full transition-all duration-300 ease-in-out origin-center ${isMenuOpen ? '-translate-y-[8px] -rotate-45' : ''}`} />
                    </div>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-4 items-center">
                    <AccessibilityMenu />

                    <Link
                        to="/home"
                        onClick={(e) => {
                            if (location.pathname === '/home') {
                                e.preventDefault();
                                window.location.reload();
                            }
                        }}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/home')
                            ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                            : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {t('header.home')}
                    </Link>


                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/dashboard')
                                    ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                                    : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                {user.role === 'admin' ? t('header.adminPanel') : (user.role === 'partner' ? t('header.partnerPanel') : t('header.myAccount'))}
                            </Link>

                            <NotificationBell />

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-eco-primary-100 flex items-center justify-center text-eco-primary-700 font-bold text-sm overflow-hidden border border-eco-primary-200 shrink-0">
                                    {user?.full_avatar || user?.avatar ? (
                                        <SafeImage
                                            src={user.full_avatar || getOptimizedImageUrl(user.avatar)}
                                            alt={user.name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-full font-medium text-eco-accent-red hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            >
                                {t('header.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/login')
                                    ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                                    : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                {t('header.login')}
                            </Link>
                            <Link
                                to="/register"
                                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 shadow-lg shadow-eco-primary-500/20 ${isActive('/register')
                                    ? 'bg-eco-primary-700 text-white'
                                    : 'bg-gradient-to-r from-eco-primary-600 to-eco-primary-500 text-white hover:to-eco-primary-400 hover:-translate-y-0.5'
                                    }`}
                            >
                                {t('header.register')}
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`fixed inset-0 bg-white transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-40 flex flex-col pt-24 px-6 md:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
                    <div className="flex flex-col gap-6">

                        <Link
                            to="/home"
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-2xl font-display font-medium transition-colors ${isActive('/home') ? 'text-eco-primary-600' : 'text-gray-800'}`}
                        >
                            {t('header.home')}
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-2xl font-display font-medium transition-colors ${isActive('/dashboard') ? 'text-eco-primary-600' : 'text-gray-800'}`}
                                >
                                    {user.role === 'admin' ? t('header.adminPanel') : (user.role === 'partner' ? t('header.partnerPanel') : t('header.myAccount'))}
                                </Link>
                                <div className="flex items-center gap-3 py-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-eco-primary-100 flex items-center justify-center text-eco-primary-700 font-bold text-lg overflow-hidden border border-eco-primary-200 shrink-0">
                                        {user?.full_avatar || user?.avatar ? (
                                            <SafeImage
                                                src={user.full_avatar || getOptimizedImageUrl(user.avatar)}
                                                alt={user.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-lg font-medium text-gray-700">
                                        {user?.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="text-left text-xl text-eco-accent-red font-medium py-2"
                                >
                                    {t('header.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-2xl font-display font-medium transition-colors ${isActive('/login') ? 'text-eco-primary-600' : 'text-gray-800'}`}
                                >
                                    {t('header.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-display font-medium bg-gradient-to-r from-eco-primary-600 to-eco-primary-500 bg-clip-text text-transparent"
                                >
                                    {t('header.register')}
                                </Link>
                            </>
                        )}
                        <AccessibilityMenu isMobile={true} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
