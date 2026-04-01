import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { placesService } from '../services/placesService';
import AdminUsersTable from '../components/dashboard/AdminUsersTable';
import Alert from '../components/common/Alert';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SafeImage from '../components/common/SafeImage';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import type { Place } from '../models/Place.model';

const Dashboard: React.FC = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const [partnerPlaces, setPartnerPlaces] = useState<Place[]>([]);
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
                const [dashData] = await Promise.all([
                    placesService.getAdminDashboard(),
                    loadPendingPlaces(1),
                    loadAdminPlaces(1)
                ]);
                setStats(dashData?.stats || {});
            } else if (user.role === 'partner') {
                const dashData = await placesService.getPartnerDashboard();
                setPartnerPlaces(dashData?.recent_places || []);
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

    const statusMap: { [key: string]: string } = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'needs_fix': 'Necesita corrección'
    };

    const handleApprove = (id: number) => {
        setModal({
            title: 'Aprobar Lugar',
            message: '¿Estás seguro de que deseas aprobar este lugar?',
            type: 'success',
            onConfirm: async () => {
                try {
                    await placesService.approve(id);
                    setAlert({ type: 'success', message: 'Lugar aprobado exitosamente' });
                    setPendingPlaces(prev => prev.filter(p => p.id !== id));
                    if (user.role === 'admin') {
                        loadAdminPlaces(adminPagination.currentPage);
                    }
                    await loadPendingPlaces(pendingPagination.currentPage);
                    loadDashboardData();
                } catch (error) {
                    setAlert({ type: 'error', message: 'Error al aprobar el lugar' });
                }
                setModal(null);
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-primary-600"></div>
                <p className="text-lg font-medium text-gray-600 animate-pulse">Cargando Panel de Control...</p>
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
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Bienvenido, {user.name}</h1>
                            <p className="text-eco-primary-100 text-lg mb-4 opacity-90">Panel de Administración de EcoAventura</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium tracking-wide border border-white/10">
                                    {user.role === 'admin' && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Administrador General
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-full text-sm font-bold transition-all border border-white/10 flex items-center gap-2"
                                >
                                    Editar Perfil
                                </button>
                                {(user.role === 'admin' || user.role === 'partner') && (
                                    <button
                                        onClick={() => navigate('/admin/places/new')}
                                        className="bg-eco-accent hover:bg-eco-accent-hover text-eco-primary-900 px-6 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Crear Lugar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ADMIN DASHBOARD --- */}
                {user.role === 'admin' ? (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {[
                                { label: 'Total Usuarios', value: stats?.total_users || 0, bgClass: 'bg-blue-50', textClass: 'text-blue-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                                { label: 'Lugares en total', value: stats?.total_places || 0, bgClass: 'bg-green-50', textClass: 'text-green-600', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { label: 'Lugares Pendientes', value: stats?.pending_places || 0, bgClass: 'bg-yellow-50', textClass: 'text-yellow-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { label: 'Total Reseñas', value: stats?.reviews_count || 0, bgClass: 'bg-purple-50', textClass: 'text-purple-600', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group"
                                >
                                    <div className={`p-3 rounded-xl ${stat.bgClass} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <svg className={`w-6 h-6 ${stat.textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className="text-3xl font-display font-bold text-gray-800">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
                                        Lugares Pendientes de Aprobación
                                    </h2>
                                </div>
                                {pendingPlaces.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No hay lugares pendientes.</p>
                                    </div>
                                ) : (<>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">Lugar</th>
                                                    <th className="p-4">Socio</th>
                                                    <th className="p-4 text-right">Acciones</th>
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
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                APROBAR
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
                                                                                setAlert({ type: 'success', message: 'Lugar rechazado exitosamente' });
                                                                                setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                                loadAdminPlaces(adminPagination.currentPage);
                                                                                await loadPendingPlaces(pendingPagination.currentPage);
                                                                                loadDashboardData();
                                                                            } catch (e) {
                                                                                setAlert({ type: 'error', message: 'Error al rechazar' });
                                                                            }
                                                                            setModal(null);
                                                                        }
                                                                    });
                                                                }}
                                                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold flex items-center whitespace-nowrap"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                RECHAZAR
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
                                                                                setAlert({ type: 'success', message: 'Cambios solicitados' });
                                                                                setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                                loadAdminPlaces(adminPagination.currentPage);
                                                                                await loadPendingPlaces(pendingPagination.currentPage);
                                                                                loadDashboardData();
                                                                            } catch (e) {
                                                                                setAlert({ type: 'error', message: 'Error al solicitar cambios' });
                                                                            }
                                                                            setModal(null);
                                                                        }
                                                                    });
                                                                }}
                                                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs font-bold flex items-center whitespace-nowrap"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                CAMBIOS
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-2 py-1 bg-eco-primary-50 text-eco-primary-700 rounded hover:bg-eco-primary-100 text-xs font-bold transition-colors flex items-center whitespace-nowrap"
                                                            >
                                                                VER
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {pendingPagination.lastPage > 1 && (
                                        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
                                            <span>Página {pendingPagination.currentPage} de {pendingPagination.lastPage}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => loadPendingPlaces(pendingPagination.currentPage - 1)} disabled={pendingPagination.currentPage === 1} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Anterior</button>
                                                <button onClick={() => loadPendingPlaces(pendingPagination.currentPage + 1)} disabled={pendingPagination.currentPage === pendingPagination.lastPage} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Siguiente</button>
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
                                                                    <img src={getOptimizedImageUrl(place.images[0].image_path)} className="w-full h-full object-cover" />
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
                                                                            loadPendingPlaces(pendingPagination.currentPage);
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
                                                            onClick={() => navigate(`/admin/places/${place.id}/edit`)}
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
                                {adminPagination.lastPage > 1 && (
                                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span>Página {adminPagination.currentPage} de {adminPagination.lastPage}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => loadAdminPlaces(adminPagination.currentPage - 1)} disabled={adminPagination.currentPage === 1} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Anterior</button>
                                            <button onClick={() => loadAdminPlaces(adminPagination.currentPage + 1)} disabled={adminPagination.currentPage === adminPagination.lastPage} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Siguiente</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* USER MANAGEMENT SECTION */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        Gestión de Usuarios
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Crea, edita o elimina cuentas de usuarios y socios.</p>
                                </div>
                                <div className="p-0">
                                    {/* Pasamos a la tabla de usuarios sólo la interfaz de callbacks */}
                                    <AdminUsersTable 
                                        onNotify={(a) => setAlert(a)} 
                                        onConfirm={(c) => setModal(c)} 
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                ) : user.role === 'partner' ? (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                                    Mis Publicaciones
                                </h2>
                                <button
                                    onClick={() => navigate('/admin/places/new')}
                                    className="bg-eco-primary-600 hover:bg-eco-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Publicar Lugar
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="p-4 font-semibold">Lugar</th>
                                            <th className="p-4 font-semibold">Categoría</th>
                                            <th className="p-4 font-semibold">Estado</th>
                                            <th className="p-4 font-semibold">Calif.</th>
                                            <th className="p-4 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {partnerPlaces.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                                    No tienes publicaciones aún.
                                                </td>
                                            </tr>
                                        ) : partnerPlaces.map(place => (
                                            <tr key={place.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <SafeImage
                                                            src={place.images?.[0] ? getOptimizedImageUrl(place.images[0].full_url || place.images[0].image_path) : undefined}
                                                            alt={place.name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        />
                                                        <span className="font-bold text-gray-800">{place.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">{place.category?.name || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold leading-none ${place.status === 'approved' ? 'bg-green-100 text-green-700' : place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : place.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {place.status === 'approved' ? 'Aprobado' : place.status === 'pending' ? 'Pendiente' : place.status === 'rejected' ? 'Rechazado' : 'Requiere Cambios'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        <span className="font-bold">{place.reviews_avg_rating ? Number(place.reviews_avg_rating).toFixed(1) : '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/places/${place.id}/edit`)}
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
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center animate-fade-in-up">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Panel de Usuario en Construcción</h2>
                        <p className="text-gray-500">Pronto podrás ver tus estadísticas y actividad aquí.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
