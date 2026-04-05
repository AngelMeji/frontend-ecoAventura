import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { placesService } from '../services/placesService';
import type { Place } from '../models/Place.model';
import AdminUsersTable from '../components/dashboard/AdminUsersTable';
import AdminReviewsTable from '../components/dashboard/AdminReviewsTable';
import AdminStatsDashboard from '../components/dashboard/AdminStatsDashboard';
import Alert from '../components/common/Alert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import SafeImage from '../components/common/SafeImage';

const Dashboard: React.FC = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [pendingPlaces, setPendingPlaces] = useState<Place[]>([]);
    const [allPlaces, setAllPlaces] = useState<Place[]>([]);
    const [adminPagination, setAdminPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
    }>({ currentPage: 1, lastPage: 1, total: 0 });
    const [pendingPagination, setPendingPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
    }>({ currentPage: 1, lastPage: 1, total: 0 });
    const [partnerPlaces, setPartnerPlaces] = useState<Place[]>([]);
    const [favorites, setFavorites] = useState<Place[]>([]);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
    const [modal, setModal] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

    if (!authService.isAuthenticated() || !user) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        loadDashboardData();
    }, [user.role]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            if (user.role === 'admin') {
                // Paralelo: las 3 peticiones al mismo tiempo en vez de secuencial
                const [dashData] = await Promise.all([
                    placesService.getAdminDashboard(),
                    loadPendingPlaces(1),
                    loadAdminPlaces(1),
                ]);
                setStats(dashData?.stats || {});

            } else if (user.role === 'partner') {
                // Intentar obtener dashboard del partner
                let dashboardData: any = null;
                try {
                    dashboardData = await placesService.getPartnerDashboard();
                    setStats(dashboardData?.stats || {});
                } catch (error) {
                    console.warn('⚠️ Partner dashboard endpoint falló (probablemente error de backend), usando fallback:', error);
                    // Si falla, al menos inicializamos stats vacío
                    setStats({});
                }

                // Robust extraction for Partner Places
                let pPlaces: Place[] = [];

                // 1. Try direct from dashboard (si funcionó)
                if (dashboardData?.places && Array.isArray(dashboardData.places)) {
                    pPlaces = dashboardData.places;
                } else if (dashboardData?.places?.data && Array.isArray(dashboardData.places.data)) {
                    pPlaces = dashboardData.places.data;
                }

                // 2. Fallback: Fetch all usando /api/places?user_id=X (siempre intentar si está vacío)
                if (pPlaces.length === 0) {
                    try {
                        const allResp: any = await placesService.getAll({ user_id: user.id });
                        pPlaces = Array.isArray(allResp) ? allResp : allResp.data || [];
                    } catch (e) {
                        console.error('❌ Fallo al obtener socios (fallback):', e);
                    }
                }
                setPartnerPlaces(pPlaces);
                // Obtener favoritos para el socio también
                try {
                    const favs = await placesService.getFavorites();
                    setFavorites(Array.isArray(favs) ? favs : []);
                } catch (e) {
                    setFavorites([]);
                }
            } else {
                // Lógica para el Dashboard de Usuario (Optimizado V2) - Paralelizado
                const [dashboardResult, favsResult] = await Promise.allSettled([
                    placesService.getUserDashboard(),
                    placesService.getFavorites()
                ]);

                if (dashboardResult.status === 'fulfilled') {
                    setStats(dashboardResult.value?.stats || {});
                } else {
                    setStats({});
                }

                if (favsResult.status === 'fulfilled') {
                    setFavorites(favsResult.value);
                } else {
                    console.error('❌ Fallo al obtener favoritos:', favsResult.reason);
                    setFavorites([]);
                }
            }
        } catch (error) {
            console.error('Error al cargar el panel:', error);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    const loadAdminPlaces = async (page: number) => {
        try {
            const response = await placesService.getAdminAllPlaces(page);
            setAllPlaces(response.data || []);
            setAdminPagination({
                currentPage: response.current_page,
                lastPage: response.last_page,
                total: response.total
            });
        } catch (error) {
            console.error('Error al cargar lugares de administrador:', error);
            setAllPlaces([]);
        }
    };

    const loadPendingPlaces = async (page: number) => {
        try {
            const response = await placesService.getPendingPlaces(page);
            setPendingPlaces(response.data || []);
            setPendingPagination({
                currentPage: response.current_page,
                lastPage: response.last_page,
                total: response.total
            });
        } catch (error) {
            console.error('Error al cargar lugares pendientes:', error);
            setPendingPlaces([]);
        }
    };

    // Map for translating statuses
    const statusMap: { [key: string]: string } = {
        'pending': t('home.dashboard.status.pending'),
        'approved': t('home.dashboard.status.approved'),
        'rejected': t('home.dashboard.status.rejected'),
        'needs_fix': t('home.dashboard.status.needs_fix')
    };

    const handleApprove = (id: number) => {
        setModal({
            title: t('home.dashboard.actions.approve'),
            message: t('home.dashboard.messages.confirmApprove'),
            type: 'success',
            onConfirm: async () => {
                try {
                    await placesService.approve(id);
                    setAlert({ type: 'success', message: t('home.dashboard.messages.approveSuccess') });
                    setPendingPlaces(prev => prev.filter(p => p.id !== id));
                    // Refresh current admin page if we are on admin view
                    if (user.role === 'admin') {
                        loadAdminPlaces(adminPagination.currentPage);
                    }
                    await loadPendingPlaces(pendingPagination.currentPage);
                    loadDashboardData();
                } catch (error) {
                    setAlert({ type: 'error', message: t('home.dashboard.messages.approveError') });
                }
                setModal(null);
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-primary-600"></div>
                <p className="text-lg font-medium text-gray-600 animate-pulse">{t('home.dashboard.messages.loading')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="container mx-auto px-4 py-8 relative">
                {/* Global Feedback */}
                {alert && (
                    <div className="fixed top-24 right-4 z-[10000] w-full max-w-sm animate-fade-in">
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                {modal && (
                    <ConfirmationModal
                        isOpen={!!modal}
                        title={modal.title}
                        message={modal.message}
                        type={modal.type}
                        onConfirm={modal.onConfirm}
                        onCancel={() => setModal(null)}
                    />
                )}
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-eco-primary-900 via-eco-primary-800 to-eco-primary-700 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-eco-accent/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-eco-secondary/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {user.avatar ? (
                            <SafeImage
                                src={user.full_avatar || getOptimizedImageUrl(user.avatar)}
                                alt={user.name}
                                className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/10 shadow-xl">
                                {user.name[0]}
                            </div>
                        )}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{t('home.dashboard.welcome.hello')}, {user.name}</h1>
                            <p className="text-eco-primary-100 text-lg mb-4 opacity-90">{t('home.dashboard.welcome.subtitle')}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium tracking-wide border border-white/10">
                                    {user.role === 'partner' ? (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            {t('home.dashboard.welcome.verifiedPartner')}
                                        </span>
                                    ) : user.role === 'admin' ? (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            {t('home.dashboard.welcome.admin')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            {t('home.dashboard.welcome.explorer')}
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-full text-sm font-bold transition-all border border-white/10 flex items-center gap-2"
                                >
                                    {t('home.dashboard.welcome.editProfile')}
                                </button>
                                {(user.role === 'admin' || user.role === 'partner') && (
                                    <button
                                        onClick={() => navigate('/places/new')}
                                        className="bg-eco-accent hover:bg-eco-accent-hover text-eco-primary-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        {t('home.dashboard.welcome.createPlace')}
                                    </button>
                                )}
                                {(user.role === 'partner' || user.role === 'user') && (
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('favorites-section');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-100 px-6 py-2 rounded-full text-sm font-bold border border-red-500/20 transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                        Sitios Fav
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ADMIN DASHBOARD --- */}
                {user.role === 'admin' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {[
                                { label: t('home.dashboard.stats.totalUsers'), value: stats?.total_users || 0, bgClass: 'bg-blue-50', textClass: 'text-blue-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', section: 'users' },
                                { label: t('home.dashboard.stats.totalPlaces'), value: stats?.total_places || 0, bgClass: 'bg-green-50', textClass: 'text-green-600', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', section: 'all-places' },
                                { label: t('home.dashboard.stats.pendingPlaces'), value: stats?.pending_places || 0, bgClass: 'bg-yellow-50', textClass: 'text-yellow-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', section: 'pending' },
                                { label: t('home.dashboard.stats.totalReviews'), value: stats?.reviews_count || 0, bgClass: 'bg-purple-50', textClass: 'text-purple-600', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', section: 'reviews' }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        const element = document.getElementById(stat.section);
                                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer"
                                >
                                    <div className={`p-3 rounded-xl ${stat.bgClass} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <svg className={`w-6 h-6 ${stat.textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className="text-3xl font-display font-bold text-gray-800">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Top Stats / Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                    {t('home.dashboard.stats.topRated')}
                                </h3>
                                <div className="text-sm text-gray-500">{t('home.dashboard.stats.basedOnReviews')}</div>
                                {stats?.top_rated ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-yellow-600 truncate">{stats.top_rated.name}</div>
                                        <div className="text-xs text-gray-400">{Number(stats.top_rated.rating).toFixed(1)} ★ ({stats.top_rated.count} {t('home.dashboard.stats.reviews')})</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">{t('home.dashboard.stats.noData')}</div>}
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {t('home.dashboard.stats.mostPopular')}
                                </h3>
                                <div className="text-sm text-gray-500">{t('home.dashboard.stats.mostFavorites')}</div>
                                {stats?.most_popular ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-red-600 truncate">{stats.most_popular.name}</div>
                                        <div className="text-xs text-gray-400">{stats.most_popular.favorites} {t('home.dashboard.stats.saved')}</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">{t('home.dashboard.stats.noData')}</div>}
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                                    {t('home.dashboard.stats.topCategory')}
                                </h3>
                                <div className="text-sm text-gray-500">{t('home.dashboard.stats.mostPlaces')}</div>
                                {stats?.top_category ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-blue-600 truncate">{stats.top_category.name}</div>
                                        <div className="text-xs text-gray-400">{stats.top_category.count} {t('home.dashboard.stats.places')}</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">{t('home.dashboard.stats.noData')}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {/* HU012 - Admin Statistics Dashboard */}
                            <AdminStatsDashboard initialStats={stats} />

                            {/* Admin Partner Requests Management */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                                <div className="p-6 border-b border-gray-100 bg-teal-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        Solicitudes de Socios
                                    </h2>
                                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">Gestión</span>
                                </div>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <p className="text-gray-600 mb-6 max-w-lg">
                                        Administra las solicitudes de usuarios que desean convertirse en socios. Revisa sus propuestas y aprueba o rechaza sus peticiones.
                                    </p>
                                    <button
                                        onClick={() => navigate('/admin/partner-requests')}
                                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        Gestionar Solicitudes
                                    </button>
                                </div>
                            </div>

                            {/* Pending Places Table */}
                            <div id="pending" className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <div className="p-6 border-b border-gray-100 bg-yellow-50/50">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t('home.dashboard.sections.pendingPlaces')}
                                    </h2>
                                </div>
                                {pendingPlaces.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>{t('home.dashboard.messages.allUpToDate')}</p>
                                    </div>
                                ) : (<>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">{t('home.dashboard.tables.place')}</th>
                                                    <th className="p-4">{t('home.dashboard.tables.partner')}</th>
                                                    <th className="p-4 text-right">{t('home.dashboard.tables.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pendingPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <p className="font-bold text-gray-900">{place.name}</p>
                                                            <p className="text-xs text-gray-500">{place.category?.name}</p>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">{place.user?.name}</td>
                                                        <td className="p-4 text-right space-x-2 flex justify-end">
                                                            <button
                                                                onClick={() => handleApprove(place.id)}
                                                                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-bold flex items-center whitespace-nowrap"
                                                                title={t('home.dashboard.actions.approve')}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                {t('home.dashboard.actions.approve').toUpperCase()}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setModal({
                                                                        title: t('home.dashboard.actions.reject'),
                                                                        message: t('home.dashboard.messages.confirmReject'),
                                                                        type: 'danger',
                                                                        onConfirm: async () => {
                                                                            try {
                                                                                await placesService.reject(place.id);
                                                                                setAlert({ type: 'success', message: t('home.dashboard.messages.rejectSuccess') });
                                                                                setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                                if (user.role === 'admin') {
                                                                                    loadAdminPlaces(adminPagination.currentPage);
                                                                                }
                                                                                await loadPendingPlaces(pendingPagination.currentPage);
                                                                                loadDashboardData();
                                                                            } catch (e) {
                                                                                setAlert({ type: 'error', message: t('home.dashboard.messages.rejectError') });
                                                                            }
                                                                            setModal(null);
                                                                        }
                                                                    });
                                                                }}
                                                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold flex items-center whitespace-nowrap"
                                                                title={t('home.dashboard.actions.reject')}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                {t('home.dashboard.actions.reject').toUpperCase()}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setModal({
                                                                        title: t('home.dashboard.actions.changes'),
                                                                        message: t('home.dashboard.messages.confirmChanges'),
                                                                        type: 'warning',
                                                                        onConfirm: async () => {
                                                                            try {
                                                                                await placesService.needsFix(place.id);
                                                                                setAlert({ type: 'success', message: t('home.dashboard.messages.changesSuccess') });
                                                                                setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                                if (user.role === 'admin') {
                                                                                    loadAdminPlaces(adminPagination.currentPage);
                                                                                }
                                                                                await loadPendingPlaces(pendingPagination.currentPage);
                                                                                loadDashboardData();
                                                                            } catch (e) {
                                                                                setAlert({ type: 'error', message: t('home.dashboard.messages.changesError') });
                                                                            }
                                                                            setModal(null);
                                                                        }
                                                                    });
                                                                }}
                                                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs font-bold flex items-center whitespace-nowrap"
                                                                title={t('home.dashboard.actions.changes')}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                {t('home.dashboard.actions.changes').toUpperCase()}
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-2 py-1 bg-eco-primary-50 text-eco-primary-700 rounded hover:bg-eco-primary-100 text-xs font-bold transition-colors flex items-center whitespace-nowrap"
                                                                title={t('home.dashboard.actions.view')}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                {t('home.dashboard.actions.view').toUpperCase()}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards (Pending) */}
                                    <div className="md:hidden space-y-4 p-4">
                                        {pendingPlaces.map(place => (
                                            <div key={place.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{place.name}</p>
                                                        <p className="text-xs text-eco-primary-600 font-bold">{place.category?.name}</p>
                                                    </div>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {place.user?.name}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleApprove(place.id)}
                                                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        APROBAR
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                        className="px-3 py-2 bg-eco-primary-50 text-eco-primary-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        VER
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setModal({
                                                                title: 'Rechazar Lugar',
                                                                message: '¿Estás seguro de que deseas rechazar este lugar?',
                                                                type: 'danger',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await placesService.reject(place.id);
                                                                        setAlert({ type: 'success', message: 'Lugar rechazado correctamente' });
                                                                        setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                        if (user.role === 'admin') {
                                                                            loadAdminPlaces(adminPagination.currentPage);
                                                                        }
                                                                        await loadPendingPlaces(pendingPagination.currentPage);
                                                                        loadDashboardData();
                                                                    } catch (e) {
                                                                        setAlert({ type: 'error', message: 'Error al rechazar el lugar' });
                                                                    }
                                                                    setModal(null);
                                                                }
                                                            });
                                                        }}
                                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                                    >
                                                        Rechazar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setModal({
                                                                title: 'Solicitar Cambios',
                                                                message: '¿El lugar requiere correcciones por parte del socio?',
                                                                type: 'warning',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await placesService.needsFix(place.id);
                                                                        setAlert({ type: 'success', message: 'Solicitud de cambios enviada correctamente' });
                                                                        setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                        if (user.role === 'admin') {
                                                                            loadAdminPlaces(adminPagination.currentPage);
                                                                        }
                                                                        await loadPendingPlaces(pendingPagination.currentPage);
                                                                        loadDashboardData();
                                                                    } catch (e) {
                                                                        setAlert({ type: 'error', message: 'Error al enviar la solicitud' });
                                                                    }
                                                                    setModal(null);
                                                                }
                                                            });
                                                        }}
                                                        className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                                    >
                                                        Cambios
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pending Places Pagination */}
                                    {pendingPagination.lastPage > 1 && (
                                        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="text-xs text-gray-500">
                                                Página <span className="font-bold">{pendingPagination.currentPage}</span> de <span className="font-bold">{pendingPagination.lastPage}</span> ({pendingPagination.total} pendientes)
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => loadPendingPlaces(pendingPagination.currentPage - 1)}
                                                    disabled={pendingPagination.currentPage === 1}
                                                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    onClick={() => loadPendingPlaces(pendingPagination.currentPage + 1)}
                                                    disabled={pendingPagination.currentPage === pendingPagination.lastPage}
                                                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>)}
                            </div>

                            {/* ALL Places Table (Management) */}
                            <div id="all-places" className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Administrar Todos los Lugares
                                    </h2>
                                </div>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                            <tr>
                                                <th className="p-4 pl-6">Lugar</th>
                                                <th className="p-4">Socio</th>
                                                <th className="p-4">Estado</th>
                                                <th className="p-4 text-right pr-6">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {allPlaces && allPlaces.map(place => (
                                                <tr key={place.id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                                                                {place.images && place.images[0] && (
                                                                    <SafeImage src={getOptimizedImageUrl(place.images[0].image_path)} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{place.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">{place.user?.name}</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={place.status}
                                                            onChange={(e) => {
                                                                const newStatus = e.target.value;
                                                                setModal({
                                                                    title: 'Cambiar Estado',
                                                                    message: `¿Estás seguro de que deseas cambiar el estado a "${statusMap[newStatus] || newStatus}"?`,
                                                                    type: 'success',
                                                                    onConfirm: async () => {
                                                                        try {
                                                                            if (newStatus === 'approved') await placesService.approve(place.id);
                                                                            else if (newStatus === 'rejected') await placesService.reject(place.id);
                                                                            else if (newStatus === 'needs_fix') await placesService.needsFix(place.id);
                                                                            else if (newStatus === 'pending') await placesService.setPending(place.id);
                                                                            setAlert({ type: 'success', message: 'Estado actualizado correctamente' });
                                                                            loadAdminPlaces(adminPagination.currentPage);
                                                                            loadDashboardData();
                                                                        } catch (error) {
                                                                            setAlert({ type: 'error', message: 'Error cambiando el estado' });
                                                                        }
                                                                        setModal(null);
                                                                    }
                                                                });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-eco-primary-500 transition-shadow ${place.status === 'approved' ? 'bg-eco-primary-100 text-eco-primary-700' :
                                                                place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    place.status === 'needs_fix' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="approved">Aprobado</option>
                                                            <option value="needs_fix">Requiere Cambios</option>
                                                            <option value="rejected">Rechazado</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setModal({
                                                                    title: 'Eliminar Lugar',
                                                                    message: '¿Estás seguro de que deseas eliminar este lugar? Esta acción no se puede deshacer.',
                                                                    type: 'danger',
                                                                    onConfirm: async () => {
                                                                        try {
                                                                            await placesService.delete(place.id);
                                                                            setAlert({ type: 'success', message: 'Lugar eliminado correctamente' });
                                                                            loadAdminPlaces(adminPagination.currentPage);
                                                                            loadDashboardData();
                                                                        } catch (e) {
                                                                            setAlert({ type: 'error', message: 'Error eliminando lugar' });
                                                                        }
                                                                        setModal(null);
                                                                    }
                                                                });
                                                            }}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold"
                                                        >
                                                            ELIMINAR
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/places/${place.id}/edit`)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-bold"
                                                        >
                                                            EDITAR
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile Cards (All Places) */}
                                <div className="md:hidden space-y-4 p-4">
                                    {allPlaces && allPlaces.map(place => (
                                        <div key={place.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {place.images && place.images[0] && (
                                                        <SafeImage src={getOptimizedImageUrl(place.images[0].image_path)} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{place.name}</p>
                                                    <p className="text-sm text-gray-500">{place.user?.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex-1">
                                                    <select
                                                        value={place.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            setModal({
                                                                title: 'Cambiar Estado',
                                                                message: `¿Estás seguro de que deseas cambiar el estado a "${statusMap[newStatus] || newStatus}"?`,
                                                                type: 'success',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        if (newStatus === 'approved') await placesService.approve(place.id);
                                                                        else if (newStatus === 'rejected') await placesService.reject(place.id);
                                                                        else if (newStatus === 'needs_fix') await placesService.needsFix(place.id);
                                                                        else if (newStatus === 'pending') await placesService.setPending(place.id);
                                                                        setAlert({ type: 'success', message: 'Estado actualizado correctamente' });
                                                                        await loadAdminPlaces(adminPagination.currentPage);
                                                                        loadDashboardData();
                                                                    } catch (error) {
                                                                        setAlert({ type: 'error', message: 'Error al cambiar el estado' });
                                                                    }
                                                                    setModal(null);
                                                                }
                                                            });
                                                        }}
                                                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold border-none transition-shadow ${place.status === 'approved' ? 'bg-eco-primary-100 text-eco-primary-700' :
                                                            place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                place.status === 'needs_fix' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        <option value="pending">Pendiente</option>
                                                        <option value="approved">Aprobado</option>
                                                        <option value="needs_fix">Requiere Cambios</option>
                                                        <option value="rejected">Rechazado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                                <button
                                                    onClick={() => navigate(`/places/${place.id}/edit`)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setModal({
                                                            title: 'Eliminar Lugar',
                                                            message: '¿Estás seguro de que deseas eliminar este lugar? Esta acción no se puede deshacer.',
                                                            type: 'danger',
                                                            onConfirm: async () => {
                                                                try {
                                                                    await placesService.delete(place.id);
                                                                    setAlert({ type: 'success', message: 'Lugar eliminado correctamente' });
                                                                    await loadAdminPlaces(adminPagination.currentPage);
                                                                    loadDashboardData();
                                                                } catch (e) {
                                                                    setAlert({ type: 'error', message: 'Error eliminando lugar' });
                                                                }
                                                                setModal(null);
                                                            }
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Admin Places Pagination UI */}
                                {adminPagination.lastPage > 1 && (
                                    <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500">
                                            Mostrando página <span className="font-bold text-gray-700">{adminPagination.currentPage}</span> de <span className="font-bold text-gray-700">{adminPagination.lastPage}</span>
                                            <span className="ml-1 text-xs">({adminPagination.total} lugares en total)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => loadAdminPlaces(adminPagination.currentPage - 1)}
                                                disabled={adminPagination.currentPage === 1}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                            >
                                                Anterior
                                            </button>
                                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                                                {Array.from({ length: adminPagination.lastPage }, (_, i) => i + 1)
                                                    .filter(p => {
                                                        // Show first, last, and pages around current
                                                        return p === 1 || p === adminPagination.lastPage || Math.abs(p - adminPagination.currentPage) <= 1;
                                                    })
                                                    .map((p, index, array) => (
                                                        <React.Fragment key={p}>
                                                            {index > 0 && array[index - 1] !== p - 1 && (
                                                                <span className="px-2 text-gray-400">...</span>
                                                            )}
                                                            <button
                                                                onClick={() => loadAdminPlaces(p)}
                                                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${adminPagination.currentPage === p
                                                                    ? 'bg-eco-primary-600 text-white shadow-md scale-110'
                                                                    : 'text-gray-600 hover:bg-white hover:text-eco-primary-600'}`}
                                                            >
                                                                {p}
                                                            </button>
                                                        </React.Fragment>
                                                    ))}
                                            </div>
                                            <button
                                                onClick={() => loadAdminPlaces(adminPagination.currentPage + 1)}
                                                disabled={adminPagination.currentPage === adminPagination.lastPage}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Admin Users Table Component */}
                            <div id="users" className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        Gestión de Usuarios
                                    </h2>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin Only</span>
                                </div>
                                <div className="p-0">
                                    <AdminUsersTable
                                        onNotify={(a) => setAlert(a)}
                                        onConfirm={(c) => setModal(c)}
                                        initialUsers={(stats as any)?.recent_users}
                                    />
                                </div>
                            </div>

                            {/* Admin Reviews Table Component */}
                            <div id="reviews" className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-purple-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                        Moderación de Reseñas
                                    </h2>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Comentarios</span>
                                </div>
                                <AdminReviewsTable onNotify={setAlert} initialReviews={(stats as any)?.recent_reviews} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PARTNER DASHBOARD --- */}
                {user.role === 'partner' && stats && (
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {/* Partner Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-eco-primary-500">
                                <p className="text-gray-500">{t('home.dashboard.stats.myPlaces')}</p>
                                <p className="text-3xl font-bold">{stats.total_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <p className="text-gray-500">{t('home.dashboard.stats.approved')}</p>
                                <p className="text-3xl font-bold">{stats.approved_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                                <p className="text-gray-500">{t('home.dashboard.stats.inReview')}</p>
                                <p className="text-3xl font-bold">{(stats.total_places || 0) - (stats.approved_places || 0)}</p>
                            </div>
                        </div>

                        {/* Partner Actions and Places List */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-eco-primary-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
                            <div className="p-10 text-center relative z-10">
                                <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">{t('home.dashboard.partner.manageDestinations')}</h2>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg font-light">
                                    {t('home.dashboard.partner.manageSubtitle')}
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => navigate('/places/new')}
                                        className="bg-eco-primary-600 text-white px-8 py-4 rounded-full hover:bg-eco-primary-700 shadow-xl shadow-eco-primary-500/30 font-bold flex items-center gap-2 transform transition hover:scale-105 active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        {t('home.dashboard.partner.publishNew')}
                                    </button>
                                </div>
                            </div>

                            {/* Partner Places Table */}
                            {true && (
                                <div className="p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                        {t('home.dashboard.partner.myPublications')}
                                        <span className="text-sm font-normal text-gray-500">({partnerPlaces.length})</span>
                                    </h3>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">{t('home.dashboard.tables.place')}</th>
                                                    <th className="p-4">{t('home.dashboard.tables.status')}</th>
                                                    <th className="p-4 text-right">{t('home.dashboard.tables.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {partnerPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                                                                    {place.images && place.images[0] && (
                                                                        <img src={getOptimizedImageUrl(place.images[0].image_path)} className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{place.name}</p>
                                                                    <p className="text-xs text-gray-500">{t(`home.categories.names.${place.category?.slug}`) !== `home.categories.names.${place.category?.slug}` ? t(`home.categories.names.${place.category?.slug}`) : place.category?.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {place.status === 'approved' ? t('home.dashboard.status.published') : place.status === 'pending' ? t('home.dashboard.status.pending') : t('home.dashboard.status.rejected')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-3 py-1 bg-eco-primary-50 text-eco-primary-700 rounded hover:bg-eco-primary-100 text-xs font-bold font-display"
                                                            >
                                                                {t('home.dashboard.actions.view').toUpperCase()}
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/places/${place.id}/edit`)}
                                                                className="px-3 py-1 bg-eco-secondary-light text-eco-secondary-hover rounded hover:bg-eco-secondary-light/80 text-xs font-bold transition-colors"
                                                            >
                                                                {t('home.dashboard.actions.edit').toUpperCase()}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Mobile Cards (Partner Places) */}
                                    <div className="md:hidden space-y-4 p-4">
                                        {partnerPlaces.map(place => (
                                            <div key={place.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                                                        {place.images && place.images[0] && (
                                                            <img src={getOptimizedImageUrl(place.images[0].image_path)} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{place.name}</p>
                                                        <p className="text-xs text-gray-500 mb-1">{place.category?.name}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {place.status === 'approved' ? t('home.dashboard.status.published') : place.status === 'pending' ? t('home.dashboard.status.pending') : t('home.dashboard.status.rejected')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                                    <button
                                                        onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                        className="px-3 py-1.5 bg-eco-primary-50 text-eco-primary-700 rounded-lg text-sm font-medium"
                                                    >
                                                        {t('home.dashboard.actions.view')}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/places/${place.id}/edit`)}
                                                        className="px-3 py-1.5 bg-eco-secondary-light/50 text-eco-secondary-hover rounded-lg text-sm font-medium"
                                                    >
                                                        {t('home.dashboard.actions.edit')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- USER DASHBOARD --- */}
                {user.role === 'user' && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-eco-primary-500">
                                <p className="text-gray-500">{t('home.dashboard.user.favoritePlaces')}</p>
                                <p className="text-3xl font-bold">{stats.favorites_count || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-eco-secondary">
                                <p className="text-gray-500">{t('home.dashboard.user.writtenReviews')}</p>
                                <p className="text-3xl font-bold">{stats.reviews_count || 0}</p>
                            </div>
                        </div>

                        {/* Favorites List - Solo Users */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100" id="favorites-section">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                    {t('home.dashboard.user.myFavorites')}
                                </h2>
                            </div>
                            {favorites.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 text-lg mb-4">{t('home.dashboard.user.noFavoritesYet')}</p>
                                    <button onClick={() => navigate('/home')} className="text-eco-primary-600 font-bold hover:underline">{t('home.dashboard.user.exploreMap')}</button>
                                </div>
                            ) : (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {favorites.map(place => (
                                        <div
                                            key={place.id}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                            onClick={() => navigate(`/place/${place.slug || place.id}`)}
                                        >
                                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={getOptimizedImageUrl(
                                                        (place.images && place.images.length > 0 && place.images[0])
                                                            ? (place.images[0].full_url || place.images[0].image_path)
                                                            : '/logo_Ecoaventura_fondo.jpeg'
                                                    )}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    alt={place.name}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        if (!target.src.includes('logo_Ecoaventura')) {
                                                            target.src = '/logo_Ecoaventura_fondo.jpeg';
                                                        }
                                                    }}
                                                />
                                                {/* Overlays */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                                    <div className="bg-white/90 backdrop-blur-sm w-8 h-8 flex items-center justify-center rounded-full text-red-500 shadow-md">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                                    </div>
                                                    {place.category?.name && (
                                                        <div className="bg-eco-primary-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm text-center">
                                                            {place.category.name}
                                                        </div>
                                                    )}
                                                </div>

                                                {place.average_rating !== undefined && place.average_rating > 0 && (
                                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                        <span className="text-yellow-500 text-xs">★</span>
                                                        <span className="text-xs font-bold text-gray-800">{place.average_rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-display font-bold text-gray-800 group-hover:text-eco-primary-600 transition-colors mb-1 truncate">
                                                    {place.name || 'Lugar sin nombre'}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- FAVORITES SECTION FOR PARTNERS --- */}
                {user.role === 'partner' && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100" id="favorites-section">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                {t('home.dashboard.user.myFavorites')}
                            </h2>
                        </div>
                        {favorites.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-400 text-lg mb-4">{t('home.dashboard.user.noFavoritesYet')}</p>
                                <button onClick={() => navigate('/home')} className="text-eco-primary-600 font-bold hover:underline">{t('home.dashboard.user.exploreMap')}</button>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {favorites.map(place => (
                                    <div
                                        key={place.id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                        onClick={() => navigate(`/place/${place.slug || place.id}`)}
                                    >
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={getOptimizedImageUrl(
                                                    (place.images && place.images.length > 0 && place.images[0])
                                                        ? (place.images[0].full_url || place.images[0].image_path)
                                                        : '/logo_Ecoaventura_fondo.jpeg'
                                                )}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt={place.name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes('logo_Ecoaventura')) {
                                                        target.src = '/logo_Ecoaventura_fondo.jpeg';
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                                <div className="bg-white/90 backdrop-blur-sm w-8 h-8 flex items-center justify-center rounded-full text-red-500 shadow-md">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                                </div>
                                                {place.category?.name && (
                                                    <div className="bg-eco-primary-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm text-center">
                                                        {place.category.name}
                                                    </div>
                                                )}
                                            </div>
                                            {place.average_rating !== undefined && place.average_rating > 0 && (
                                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                    <span className="text-yellow-500 text-xs">★</span>
                                                    <span className="text-xs font-bold text-gray-800">{place.average_rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-display font-bold text-gray-800 group-hover:text-eco-primary-600 transition-colors mb-1 truncate">
                                                {place.name || 'Lugar sin nombre'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <p className="text-xs truncate">{place.address || 'Sin dirección'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;