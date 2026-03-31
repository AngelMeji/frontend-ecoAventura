import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import AccessibilityMenu from '../common/AccessibilityMenu';
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

    const [notifications, setNotifications] = React.useState<{ type: 'admin' | 'user'; count?: number; notifications?: any[] } | null>(null);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const notificationsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };

        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotifOpen]);

    React.useEffect(() => {
        if (isAuthenticated) {
            loadNotifications();
            // Poll every 2 minutes (reducido desde 30s para no saturar el servidor)
            const interval = setInterval(loadNotifications, 120000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const loadNotifications = async () => {
        try {
            const data = await import('../../services/partnerService').then(m => m.partnerService.getNotifications());
            setNotifications(data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await import('../../services/partnerService').then(m => m.partnerService.markAsRead(id));

            // Optimistically update the UI by filtering out the marked notification
            if (notifications?.type === 'user' && notifications.notifications) {
                setNotifications({
                    ...notifications,
                    notifications: notifications.notifications.filter(n => n.id !== id)
                });
            }

            // Also reload in the background to ensure consistency
            loadNotifications();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
            // If there's an error, reload to restore correct state
            loadNotifications();
        }
    };

    const hasUnread = notifications?.type === 'admin'
        ? (notifications.count || 0) > 0
        : (notifications?.notifications?.length || 0) > 0;

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

                    {isAuthenticated && (
                        /* Notification Bell */
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none relative"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {hasUnread && (
                                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[10000] animate-fade-in-up">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Notificaciones</h3>
                                        {hasUnread && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Nuevo</span>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications?.type === 'admin' ? (
                                            notifications.count! > 0 ? (
                                                <Link
                                                    to="/admin/partner-requests"
                                                    onClick={() => setIsNotifOpen(false)}
                                                    className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">Solicitudes Pendientes</p>
                                                            <p className="text-xs text-gray-500 mt-1">Tienes {notifications.count} nuevas solicitudes de socios.</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 text-sm">No hay notificaciones nuevas.</div>
                                            )
                                        ) : (
                                            notifications?.notifications && notifications.notifications.length > 0 ? (
                                                notifications.notifications.map(notif => (
                                                    <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 flex gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                            {notif.status === 'approved' ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-800 text-sm">
                                                                {notif.status === 'approved' ? 'Solicitud Aprobada' : 'Solicitud Rechazada'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Tu solicitud para "{notif.place_name}" ha sido {notif.status === 'approved' ? 'aprobada' : 'rechazada'}.
                                                            </p>
                                                            <button
                                                                onClick={() => handleMarkAsRead(notif.id)}
                                                                className="text-xs text-eco-primary-600 font-bold mt-2 hover:underline"
                                                            >
                                                                Marcar como leído
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 text-sm">No tienes notificaciones.</div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
