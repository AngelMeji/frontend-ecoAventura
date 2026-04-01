import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { placesService } from '../../services/placesService';
import type { Place } from '../../models/Place.model';
import Header from '../../components/layout/Header';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import PlaceChatbot from '../../components/places/PlaceChatbot';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import SafeImage from '../../components/common/SafeImage';

const PlaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'chatbot'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reviews state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Inline editing state
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ rating: 0, comment: '' });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        reviewId: number | null;
    }>({ isOpen: false, reviewId: null });

    const user = authService.getCurrentUser();

    useEffect(() => {
        const statePlace = location.state?.placeData;
        if (statePlace) {
            // Show statePlace immediately for fast render, but always reload from
            // the API so is_favorite (and other live data) reflects current state
            setPlace(statePlace);
            setLoading(false);
            loadPlace(statePlace.slug || statePlace.id);
        } else if (id) {
            loadPlace(id);
        }
    }, [id, location.state]);

    const loadPlace = async (placeId: string) => {
        try {
            setLoading(true);
            const data: any = await placesService.getOne(placeId);
            // Manejar respuesta envuelta de Laravel Resource (data.data)
            const loadedPlace = data.data || data;

            // V2: El backend en rutas públicas no parsea Bearer tokens de Sanctum
            // de forma fiable si no usa middleware. Siempre consultamos el estado
            // real de favoritos cuando hay usuario logueado.
            if (user) {
                try {
                    const favorites = await placesService.getFavorites();
                    const isFav = favorites.some((f: Place) => f.id === loadedPlace.id);
                    loadedPlace.is_favorite = isFav;
                } catch (e) {
                    console.error('Error verificando favoritos:', e);
                }
            }

            setPlace(loadedPlace);
        } catch (error) {
            console.error('Error cargando lugar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!place) return;
        if (rating === 0) {
            setMessage({ type: 'error', text: 'Por favor selecciona una calificación' });
            return;
        }
        try {
            await placesService.createReview(place.id, { rating, comment });
            setMessage({ type: 'success', text: '¡Reseña enviada con éxito!' });
            setComment('');
            setRating(0);

            // Reload to see new review
            const updated = await placesService.getOne(place.id);
            // Handle wrapper
            const p = (updated as any).data || updated;
            setPlace(p);
            setActiveTab('reviews');
        } catch (error: any) {
            // Manejo específico para errores de validación (422)
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                const validationErrors = data.errors;
                let msgText = '';

                if (validationErrors) {
                    // Usar solo los errores detallados, ignorando el resumen automático de Laravel
                    msgText = Object.values(validationErrors).flat().join('\n');
                } else {
                    msgText = data.message || 'Error de validación';
                }
                setMessage({ type: 'error', text: msgText });
            } else {
                // Mensaje genérico para otros errores
                setMessage({ type: 'error', text: error.message || 'Error al enviar reseña. Por favor intenta nuevamente.' });
            }
        }
    };

    const handleDeleteReview = async () => {
        if (!confirmModal.reviewId) return;

        try {
            await placesService.deleteReview(confirmModal.reviewId);
            setPlace(prev => prev ? {
                ...prev,
                reviews: prev.reviews?.filter(r => r.id !== confirmModal.reviewId)
            } : null);
            setMessage({ type: 'success', text: 'Reseña eliminada correctamente' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Error eliminando reseña' });
        } finally {
            setConfirmModal({ isOpen: false, reviewId: null });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-eco-bg flex-col gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-eco-primary-600"></div>
                <p className="text-xl font-display text-eco-primary-800 animate-pulse">Cargando...</p>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-eco-bg p-4 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 max-w-lg w-full animate-fade-in-up">
                    <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center animate-bounce-short">
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-800 mb-3">Lugar no encontrado</h2>
                    <p className="text-eco-text-light mb-8 max-w-md mx-auto">
                        Es posible que el lugar que buscas haya sido eliminado o no esté disponible actualmente.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/home')}
                            className="auth-button shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Ir al Mapa
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full border-2 border-eco-primary-200 text-eco-primary-700 font-semibold hover:bg-eco-primary-50 transition-colors"
                        >
                            Volver Atrás
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const images = place.images && place.images.length > 0
        ? place.images
        : [{ id: 0, image_path: 'https://via.placeholder.com/800x600?text=No+Image' }];

    return (
        <div className="min-h-screen bg-eco-bg pb-12">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white text-eco-primary-700 rounded-full shadow-md hover:shadow-lg hover:bg-eco-primary-50 transition-all duration-300 transform hover:-translate-y-0.5 mb-8 border border-eco-primary-100"
                >
                    <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-semibold text-sm tracking-wide uppercase">Volver</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header Image / Carousel */}
                    <div className="relative h-[400px] md:h-[500px] bg-gray-200 group">
                        <SafeImage
                            src={images[currentImageIndex].full_url ? getOptimizedImageUrl(images[currentImageIndex].full_url) : getOptimizedImageUrl(images[currentImageIndex].image_path)}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                        {images.length > 1 && (
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between p-4 transition-opacity duration-300 z-30">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                    className="bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 transition-all transform hover:scale-110 shadow-xl border border-white/20"
                                    aria-label="Imagen anterior"
                                >
                                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                    className="bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 transition-all transform hover:scale-110 shadow-xl border border-white/20"
                                    aria-label="Siguiente imagen"
                                >
                                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}

                        {/* Image Counter Badge */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-black/50 backdrop-blur-md text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium z-30">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}

                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!place) return;
                                    try {
                                        if (place.is_favorite) {
                                            await placesService.removeFavorite(place.id);
                                            setPlace({ ...place, is_favorite: false });
                                        } else {
                                            await placesService.addFavorite(place.id);
                                            setPlace({ ...place, is_favorite: true });
                                        }
                                    } catch (error) {
                                        console.error('Error al cambiar el estado de favorito', error);
                                    }
                                }}
                                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 shrink-0 ${place.is_favorite
                                    ? 'bg-white text-red-500 shadow-red-500/30'
                                    : 'bg-white/70 backdrop-blur-md text-gray-700 hover:bg-white hover:text-red-500'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill={place.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-eco-primary-500/80 backdrop-blur-md rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                                    {place.category?.name}
                                </span>
                                {(place.average_rating || 0) > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-400/90 backdrop-blur-sm text-black px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold">
                                        <span>★</span>
                                        <span>{place.average_rating}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-5xl font-bold font-display leading-tight mb-1 md:mb-2 text-shadow-sm">
                                {place.name}
                            </h1>
                            <div className="flex items-center gap-1 md:gap-2 text-white/90 text-sm md:text-lg">
                                <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p className="truncate max-w-[80vw] md:max-w-none">{place.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    {/* Content Logic based on Auth */}
                    {!user ? (
                        <div className="p-8 text-center animate-fade-in">
                            <div className="max-w-3xl mx-auto">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Información del Lugar</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed break-words">
                                        {place.short_description || place.description?.substring(0, 200) + '...'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-eco-primary-50 to-white p-8 rounded-3xl border border-eco-primary-100 shadow-sm">
                                    <div className="w-16 h-16 bg-eco-primary-100 text-eco-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                                        🔒
                                    </div>
                                    <h4 className="text-xl font-display font-bold text-eco-primary-900 mb-3">
                                        Contenido Exclusivo para Miembros
                                    </h4>
                                    <p className="text-gray-600 mb-8">
                                        Inicia sesión para acceder a la descripción detallada, galería completa, reseñas de la comunidad y nuestro asistente de viaje con IA.
                                    </p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-eco-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-eco-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="border-b border-gray-100 flex px-8 pt-4">
                                <button
                                    className={`mr-8 pb-4 text-center font-medium transition-all relative ${activeTab === 'info'
                                        ? 'text-eco-primary-700'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    Información
                                    {activeTab === 'info' && (
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    className={`pb-4 text-center font-medium transition-all relative ${activeTab === 'reviews'
                                        ? 'text-eco-primary-700'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    Reseñas <span className="ml-1 text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">{place.reviews?.length || 0}</span>
                                    {activeTab === 'reviews' && (
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    className={`ml-8 pb-4 text-center font-medium transition-all relative ${activeTab === 'chatbot'
                                        ? 'text-eco-primary-700'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    onClick={() => setActiveTab('chatbot')}
                                >
                                    Asistente IA
                                    {activeTab === 'chatbot' && (
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />
                                    )}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-8 bg-white min-h-[300px]">
                                {activeTab === 'info' && (
                                    <div className="animate-fade-in">
                                        <p className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-line break-words">
                                            {place.description}
                                        </p>

                                        <h3 className="text-2xl font-display font-bold text-eco-primary-900 mb-6">Detalles de la Experiencia</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Dificultad</h3>
                                                <p className="text-eco-primary-700 capitalize font-medium">{place.difficulty || 'No especificada'}</p>
                                            </div>
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Horario</h3>
                                                <p className="text-eco-primary-700 font-medium">{place.duration || 'No especificada'}</p>
                                            </div>
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Mejor Temporada</h3>
                                                <p className="text-eco-primary-700 font-medium">{place.best_season || 'Todas'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-12 bg-eco-primary-50/30 rounded-3xl p-8 border border-eco-primary-100/50">
                                            <h3 className="text-2xl font-display font-bold text-eco-primary-900 mb-6 flex items-center gap-2">
                                                <svg className="w-6 h-6 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Ubicación
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección Exacta</p>
                                                    <p className="text-gray-800 text-lg">{place.address}</p>
                                                </div>
                                                <div className="pt-4 border-t border-eco-primary-100/50 flex flex-wrap gap-8">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Latitud</p>
                                                        <p className="font-mono text-eco-primary-700">{place.latitude}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Longitud</p>
                                                        <p className="font-mono text-eco-primary-700">{place.longitude}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="animate-fade-in space-y-8">
                                        <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                                            {user ? (
                                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">Escribe tu opinión</h3>
                                                        <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-gray-200">
                                                            <span className="text-sm text-gray-500 mr-2">Calificación:</span>
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    type="button"
                                                                    key={star}
                                                                    onClick={() => setRating(star)}
                                                                    className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {message && (
                                                        <Alert
                                                            type={message.type}
                                                            message={message.text}
                                                            onClose={() => setMessage(null)}
                                                            className="mb-4"
                                                        />
                                                    )}

                                                    <textarea
                                                        value={comment}
                                                        onChange={e => setComment(e.target.value)}
                                                        className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 outline-none transition-all resize-y min-h-[100px]"
                                                        placeholder="¿Qué te pareció este lugar? Comparte tu experiencia..."
                                                    ></textarea>
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={rating === 0}
                                                            className="auth-button w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Publicar Reseña
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="flex items-center gap-4 bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                                                    <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </div>
                                                    <p className="font-medium">Inicia sesión para compartir tu experiencia con otros viajeros.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-4">
                                                Comentarios ({place.reviews?.length || 0})
                                            </h3>

                                            {place.reviews && place.reviews.length > 0 ? (
                                                place.reviews.map((rev: any, idx: number) => (
                                                    <div key={idx} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                                        {editingReviewId === rev.id ? (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-sm font-medium text-gray-700">Editar Calificación:</span>
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <button
                                                                            key={star}
                                                                            onClick={() => setEditForm({ ...editForm, rating: star })}
                                                                            className={`text-xl focus:outline-none ${star <= editForm.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                                            type="button"
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <textarea
                                                                    value={editForm.comment}
                                                                    onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-primary-400 focus:outline-none"
                                                                    rows={3}
                                                                ></textarea>
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setEditingReviewId(null)}
                                                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (!editForm.comment || editForm.rating === 0) return setMessage({ type: 'error', text: 'Completa los campos' });
                                                                            placesService.updateReview(rev.id, editForm)
                                                                                .then(() => {
                                                                                    setEditingReviewId(null);
                                                                                    loadPlace(place.id.toString());
                                                                                    setMessage({ type: 'success', text: 'Reseña actualizada con éxito' });
                                                                                })
                                                                                .catch((error: any) => {
                                                                                    if (error.response?.status === 422) {
                                                                                        const data = error.response.data;
                                                                                        const validationErrors = data.errors;
                                                                                        let msgText = '';

                                                                                        if (validationErrors && typeof validationErrors === 'object') {
                                                                                            msgText = Object.values(validationErrors).flat().join('\n');
                                                                                        } else if (data.message) {
                                                                                            msgText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
                                                                                        } else {
                                                                                            msgText = 'Error de validación';
                                                                                        }
                                                                                        setMessage({ type: 'error', text: msgText });
                                                                                    } else {
                                                                                        const serverMsg = error.response?.data?.message || error.message || 'Error actualizando';
                                                                                        setMessage({ type: 'error', text: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg) });
                                                                                    }
                                                                                });
                                                                        }}
                                                                        className="px-4 py-2 bg-eco-primary-600 text-white rounded-lg text-sm font-medium hover:bg-eco-primary-700"
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-primary-100 to-eco-primary-200 flex items-center justify-center text-eco-primary-700 font-bold text-lg">
                                                                            {(rev.user?.name || 'U')[0].toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-gray-900">{rev.user?.name || 'Viajero'}</div>
                                                                            <div className="flex text-yellow-400 text-sm">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {(user?.role === 'admin' || user?.id === rev.user_id) && (
                                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {user?.id === rev.user_id && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingReviewId(rev.id);
                                                                                        setEditForm({ rating: rev.rating, comment: rev.comment });
                                                                                        setMessage(null);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                                                    title="Editar"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => setConfirmModal({ isOpen: true, reviewId: rev.id })}
                                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                                title="Eliminar"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className={`leading-relaxed text-sm break-words ${rev.is_hidden ? 'italic text-gray-400' : 'text-gray-600'}`}>
                                                                    {rev.is_hidden ? 'Este comentario ha sido ocultado por moderación.' : rev.comment}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-gray-500 italic">Aún no hay reseñas para este lugar.</p>
                                                    <p className="text-eco-primary-600 font-medium mt-2">¡Sé el primero en compartir tu aventura!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'chatbot' && (
                                    <div className="animate-fade-in">
                                        <PlaceChatbot place={place} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title="¿Eliminar reseña?"
                    message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este comentario?"
                    confirmText="Sí, eliminar"
                    cancelText="Cancelar"
                    onConfirm={handleDeleteReview}
                    onCancel={() => setConfirmModal({ isOpen: false, reviewId: null })}
                />
            </main >
        </div >
    );
};

export default PlaceDetail;
