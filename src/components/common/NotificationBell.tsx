import React, { useState, useEffect, useRef } from 'react';
import { partnerService } from '../../services/partnerService';
import { authService } from '../../services/authService';

const NotificationBell: React.FC = () => {
    const user = authService.getCurrentUser();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [adminCount, setAdminCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Poll notifications every 60 seconds
    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const data = await partnerService.getNotifications();
            
            const generic = data.generic_notifications || [];
            
            if (data.type === 'admin') {
                setAdminCount(data.count ?? 0);
                // Admins also get generic DB notifications mapped to the bell
                setNotifications([...generic].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
            } else {
                const partnerReqs = data.notifications || [];
                const combined = [...partnerReqs, ...generic].sort((a, b) => 
                    new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
                );
                setNotifications(combined);
                setAdminCount(0);
            }
        } catch {
            // Silently fail — notifications are non-critical
        }
    };

    const handleMarkAsRead = async (id: string | number) => {
        try {
            setLoading(true);
            await partnerService.markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await Promise.all(notifications.map(n => partnerService.markAsRead(n.id)));
            setNotifications([]);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = user?.role === 'admin' ? adminCount : notifications.length;

    const statusLabel = (status: string) => {
        switch (status) {
            case 'approved': return { text: 'Aprobada ✓', cls: 'text-green-700 bg-green-50 border-green-200' };
            case 'rejected': return { text: 'Rechazada ✗', cls: 'text-red-700 bg-red-50 border-red-200' };
            default: return { text: 'Pendiente', cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 rounded-full text-gray-500 hover:text-eco-primary-600 hover:bg-eco-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-eco-primary-400 outline-none"
                aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
                aria-expanded={open}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-short">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[10000] animate-fade-in-up overflow-hidden"
                    role="dialog"
                    aria-label="Panel de notificaciones"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notificaciones
                        </h3>
                        <div className="flex items-center gap-2">
                            {notifications.length > 1 && user?.role !== 'admin' && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="text-xs text-eco-primary-600 hover:underline disabled:opacity-50"
                                >
                                    Marcar todo leído
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Cerrar notificaciones"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                        {/* ADMIN VIEW */}
                        {user?.role === 'admin' && (
                            adminCount === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    No hay solicitudes pendientes
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800">
                                                {adminCount} solicitud{adminCount !== 1 ? 'es' : ''} pendiente{adminCount !== 1 ? 's' : ''}
                                            </p>
                                            <a href="/admin/partner-requests" className="text-xs text-yellow-700 hover:underline" onClick={() => setOpen(false)}>
                                                Ver solicitudes →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* USER OR ADMIN GENERIC VIEW */}
                        {(user?.role !== 'admin' || notifications.length > 0) && (
                            notifications.length === 0 && user?.role !== 'admin' ? (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Sin notificaciones nuevas
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {notifications.map(n => {
                                        if (n.type === 'App\\Notifications\\ReviewSuspendedNotification') {
                                            return (
                                                <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 break-words">
                                                                Tu reseña en {n.data?.place_name || 'un lugar'} ha sido ocultada.
                                                            </p>
                                                            <p className="text-xs text-red-600 mt-1 italic break-words">
                                                                Motivo: {n.data?.reason}
                                                            </p>
                                                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border text-red-700 bg-red-50 border-red-200">
                                                                Suspendida
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            disabled={loading}
                                                            className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40"
                                                            aria-label="Marcar como leída"
                                                            title="Cerrar notificación"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        } else if (n.type === 'App\\Notifications\\ReviewRestoredNotification') {
                                            return (
                                                <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 break-words">
                                                                Tu reseña en {n.data?.place_name || 'un lugar'} ha sido restaurada.
                                                            </p>
                                                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border text-green-700 bg-green-50 border-green-200">
                                                                Activa
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            disabled={loading}
                                                            className="p-1 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors flex-shrink-0 disabled:opacity-40"
                                                            aria-label="Marcar como leída"
                                                            title="Cerrar notificación"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        }

                                        const { text, cls } = statusLabel(n.status);
                                        return (
                                            <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                            Tu solicitud: {n.place_name}
                                                        </p>
                                                        <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
                                                            {text}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                        disabled={loading}
                                                        className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40"
                                                        aria-label="Marcar como leída"
                                                        title="Cerrar notificación"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
