import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Place } from '../../models/Place.model';
import { authService } from '../../services/authService';
import { placesService } from '../../services/placesService';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslatedPlace } from '../../translations/places';
import ConfirmationModal from '../common/ConfirmationModal';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import SafeImage from '../common/SafeImage';

// URL base para las imágenes (storage)

interface DestinationModalProps {
    destination: Place;
    isOpen: boolean;
    onClose: () => void;
}

const DestinationModal: React.FC<DestinationModalProps> = ({
    destination: initialDestination,
    isOpen,
    onClose
}) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    // Unwrap the initial destination if it comes from a Laravel Resource (nested in data)
    const getUnwrappedDestination = (dest: any) => dest?.data || dest;

    const [destination, setDestination] = useState<Place>(() =>
        getTranslatedPlace(getUnwrappedDestination(initialDestination), language)
    );

    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Editing state
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ rating: 0, comment: '' });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        reviewId: number | null;
    }>({ isOpen: false, reviewId: null });

    // Memoize user to avoid infinite re-render loops — getCurrentUser() returns
    // a new object reference on every render, so we stabilize on the user ID.
    const user = authService.getCurrentUser();
    const userId = useMemo(() => user?.id ?? null, [user?.id]);

    // Re-translate when language changes or destination changes
    useEffect(() => {
        // Solo re-traducir cuando el modal está cerrado.
        // Cuando está abierto, el useEffect de sincronización ya se encarga.
        if (!isOpen) {
            setDestination(getTranslatedPlace(getUnwrappedDestination(initialDestination), language));
        }
    }, [initialDestination, language, isOpen]);

    // Bloquear el scroll de fondo cuando el modal esté abierto
    useEffect(() => {
        if (isOpen) {
            const currentCount = parseInt(document.body.dataset.modalCount || '0', 10);
            document.body.dataset.modalCount = (currentCount + 1).toString();
            document.body.style.overflow = 'hidden';

            return () => {
                const newCount = parseInt(document.body.dataset.modalCount || '0', 10) - 1;
                document.body.dataset.modalCount = newCount.toString();
                if (newCount <= 0) {
                    document.body.style.overflow = 'unset';
                    document.body.dataset.modalCount = '0';
                }
            };
        }
    }, [isOpen]);

    // Sincronizar estado local cuando cambia la prop inicial o se abre el modal.
    // Cuando el usuario está autenticado, SIEMPRE consulta el estado real de favoritos
    // desde el servidor, porque la API pública devuelve is_favorite: false sin token.
    useEffect(() => {
        if (isOpen) {
            const rawDest = getUnwrappedDestination(initialDestination);
            const initialDest = getTranslatedPlace(rawDest, language);

            // Mostrar el lugar inmediatamente (puede tener is_favorite incorrecto)
            setDestination(initialDest);
            setMessage(null);
            setRating(0);
            setComment('');
            setActiveTab('info');
            setEditingReviewId(null);

            // Consultar el estado real de favoritos desde el servidor
            if (userId) {
                placesService.getFavorites()
                    .then(favorites => {
                        const favList = Array.isArray(favorites)
                            ? favorites
                            : (Array.isArray((favorites as any)?.data) ? (favorites as any).data : []);
                        const isFav = favList.some((f: Place) => f.id === rawDest?.id);
                        // Usar functional update para no sobreescribir otros campos que ya se actualizaron
                        setDestination(prev => prev.id === rawDest?.id ? { ...prev, is_favorite: isFav } : prev);
                    })
                    .catch(e => console.error('Error al consultar favoritos para el modal', e));
            }
        }
    }, [isOpen, initialDestination, language, userId]);

    if (!isOpen) return null;

    const images = destination.images && destination.images.length > 0
        ? destination.images
        : [{ id: 0, image_path: '/assets/images/placeholder.jpg' }];

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleRating = (value: number) => {
        setRating(value);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (rating === 0) {
            setMessage({ type: 'error', text: t('home.modal.messages.selectRating') });
            return;
        }

        setSubmitting(true);
        try {
            await placesService.createReview(destination.id, { rating, comment });
            setMessage({ type: 'success', text: t('home.modal.messages.success') });
            setComment('');
            setRating(0);

            const updated: any = await placesService.getOne(destination.id);
            const loadedPlace = updated.data || updated;
            setDestination(loadedPlace);

        } catch (error: any) {
            console.error('Error enviando reseña:', error);
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                const validationErrors = data.errors;
                let msgText = '';

                if (validationErrors) {
                    msgText = Object.values(validationErrors).flat().join('\n');
                } else {
                    msgText = data.message || t('home.modal.messages.error');
                }
                setMessage({ type: 'error', text: msgText });
            } else {
                // Better error message for 500s or other errors
                const serverMsg = error.response?.data?.message || error.message;
                setMessage({ type: 'error', text: `${t('home.modal.messages.error')}: ${serverMsg}` });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateReview = async (reviewId: number) => {
        if (!editForm.comment || editForm.rating === 0) return;

        try {
            setSubmitting(true);
            await placesService.updateReview(reviewId, editForm);
            setEditingReviewId(null);

            // Reload place data
            const updated: any = await placesService.getOne(destination.id);
            const loadedPlace = updated.data || updated;
            setDestination(loadedPlace);
            setMessage({ type: 'success', text: t('home.modal.messages.success') });
        } catch (error: any) {
            console.error('Error al actualizar la reseña:', error);

            // Check for specific validation errors from Laravel first
            if (error.response?.status === 422) {
                const data = error.response.data;
                const validationErrors = data.errors;
                let msgText = '';

                if (validationErrors && typeof validationErrors === 'object') {
                    // Si errors es un objeto, sacamos los valores [{ field: [...] }]
                    msgText = Object.values(validationErrors).flat().join('\n');
                } else if (data.message) {
                    // Si el backend mandó el mensaje directamente en data.message
                    msgText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
                } else {
                    msgText = t('home.modal.messages.error');
                }
                setMessage({ type: 'error', text: msgText });
            } else {
                // Generic or unhandled error fallback
                const serverMsg = error.response?.data?.message || error.message || t('home.modal.messages.error');
                setMessage({ type: 'error', text: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg) });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!confirmModal.reviewId) return;

        try {
            setSubmitting(true);
            await placesService.deleteReview(confirmModal.reviewId);
            setDestination(prev => ({
                ...prev,
                reviews: prev.reviews?.filter(r => r.id !== confirmModal.reviewId)
            }));
            setMessage({ type: 'success', text: t('home.modal.messages.success') });
        } catch (error: any) {
            console.error('Error al eliminar la reseña:', error);
            const serverMsg = error.response?.data?.message || error.message;
            setMessage({ type: 'error', text: `${t('home.modal.messages.error')}: ${serverMsg}` });
        } finally {
            setSubmitting(false);
            setConfirmModal({ isOpen: false, reviewId: null });
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            setMessage({ type: 'error', text: t('home.modal.messages.loginRequired') });
            return;
        }

        try {
            if (destination.is_favorite) {
                await placesService.removeFavorite(destination.id);
                setDestination({ ...destination, is_favorite: false });
            } else {
                await placesService.addFavorite(destination.id);
                setDestination({ ...destination, is_favorite: true });
            }
        } catch (error) {
            console.error('Error al cambiar el estado de favorito', error);
        }
    };

    const categoryName = destination.category?.name || 'General';
    const currentRating = destination.average_rating || 0;
    const reviewCount = destination.reviews?.length || 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-eco-primary-700">{destination.name}</h2>
                    <div className="flex items-center gap-2">
                        {user && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`p-2 transition-colors rounded-full hover:bg-gray-100 ${destination.is_favorite
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-400 hover:text-red-400'
                                    }`}
                                title={destination.is_favorite ? t('home.modal.actions.removeFromFavorites') : t('home.modal.actions.addToFavorites')}
                            >
                                <svg className="w-6 h-6" fill={destination.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Logic based on Auth */}
                {!user ? (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col items-center text-center">
                        {/* Image (Single) */}
                        <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden mb-6 relative shadow-md flex-shrink-0">
                            <SafeImage
                                src={images[0] ? (images[0].full_url ? getOptimizedImageUrl(images[0].full_url) : getOptimizedImageUrl(images[0].image_path)) : getOptimizedImageUrl('/assets/images/placeholder.jpg')}
                                alt={`${destination.name}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>

                        <div className="mb-8 max-w-lg">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.modal.info.description')}</h3>
                            <p className="text-gray-600 leading-relaxed break-words">
                                {destination.short_description || destination.description?.substring(0, 150) + '...'}
                            </p>
                        </div>

                        <div className="w-full p-6 bg-gradient-to-br from-eco-primary-50 to-white border border-eco-primary-100 rounded-2xl shadow-sm">
                            <div className="w-16 h-16 bg-eco-primary-100 text-eco-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                🔒
                            </div>
                            <h4 className="text-xl font-display font-bold text-eco-primary-900 mb-2">
                                ¿Quieres ver más detalles?
                            </h4>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Para ver la información completa, reseñas y acceder al Asistente IA, necesitas iniciar sesión.
                            </p>
                            <a
                                href="/login"
                                className="inline-block bg-eco-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-eco-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Iniciar Sesión / Registrarse
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'info'
                                    ? 'bg-eco-primary-100 text-eco-primary-800 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {t('home.modal.tabs.info')}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'reviews'
                                    ? 'bg-eco-primary-100 text-eco-primary-800 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {t('home.modal.tabs.reviews')}
                                </span>
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'info' ? (
                                <div className="space-y-6">
                                    {/* Carousel */}
                                    <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                                        <SafeImage
                                            src={images[currentImageIndex].full_url ? getOptimizedImageUrl(images[currentImageIndex].full_url) : getOptimizedImageUrl(images[currentImageIndex].image_path)}
                                            alt={`${destination.name}`}
                                            className="w-full h-full object-cover transition-transform duration-500"
                                        />

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-30"
                                                >
                                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-30"
                                                >
                                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </>
                                        )}

                                        {/* Image Counter Badge */}
                                        {images.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-medium z-30">
                                                {currentImageIndex + 1} / {images.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-3 py-1 bg-eco-primary-100 text-eco-primary-800 rounded-full text-sm font-medium">
                                            {destination.category?.slug
                                                ? (t(`home.categories.names.${destination.category.slug}`) !== `home.categories.names.${destination.category.slug}`
                                                    ? t(`home.categories.names.${destination.category.slug}`)
                                                    : categoryName)
                                                : categoryName}
                                        </span>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize">
                                            {destination.difficulty
                                                ? (t(`home.card.difficulty.${destination.difficulty}`) !== `home.card.difficulty.${destination.difficulty}`
                                                    ? t(`home.card.difficulty.${destination.difficulty}`)
                                                    : destination.difficulty)
                                                : t('home.modal.info.difficulty_na')}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {destination.duration || t('home.modal.info.duration_na')}
                                        </span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                            {destination.best_season || t('home.modal.info.season_na')}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-eco-primary-700 mb-2">{t('home.modal.info.description')}</h3>
                                        <p className="text-gray-600 leading-relaxed break-words">
                                            {destination.description}
                                        </p>
                                    </div>

                                    {/* Location */}
                                    <div className="bg-eco-primary-50 rounded-xl p-4 border border-eco-primary-100">
                                        <h4 className="font-bold text-eco-primary-800">{t('home.modal.info.location')}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{destination.address}</p>
                                        <p className="text-gray-500 text-xs mt-1 font-mono">
                                            {t('home.modal.info.coordinates')}: {destination.latitude}, {destination.longitude}
                                        </p>
                                    </div>

                                    {/* Botón Más detalles - solo para usuarios logueados */}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            onClick={() => {
                                                onClose();
                                                navigate(`/place/${destination.id}`);
                                            }}
                                            className="inline-flex items-center gap-2 bg-eco-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-eco-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Más detalles
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Rating Summary */}
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-gray-800">{currentRating.toFixed(1)}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{reviewCount} {t('home.modal.reviews.reviewsCount')}</p>
                                        </div>
                                    </div>

                                    {/* Write Review Form */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        {user ? (
                                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                                    <h4 className="font-bold text-gray-800">{t('home.modal.reviews.title')}</h4>
                                                    <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-gray-200">
                                                        <span className="text-sm text-gray-500 mr-2">{t('home.modal.reviews.ratingLabel')}</span>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => handleRating(star)}
                                                                className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {message && (
                                                    <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}>
                                                        {message.type === 'success' ? (
                                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        )}
                                                        <p className="whitespace-pre-line text-sm">{message.text}</p>
                                                    </div>
                                                )}

                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder={t('home.modal.reviews.placeholder')}
                                                    className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 outline-none transition-all resize-y min-h-[100px]"
                                                    rows={3}
                                                />

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={rating === 0 || submitting}
                                                        className="bg-eco-primary-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-eco-primary-700 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {submitting ? t('home.modal.actions.submitting') : t('home.modal.actions.submitReview')}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex items-center gap-4 bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                                                <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                </div>
                                                <p className="font-medium text-sm">{t('home.modal.reviews.loginToReview')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">
                                            {t('home.modal.reviews.usersReviewsTitle')} ({destination.reviews?.length || 0})
                                        </h4>

                                        {destination.reviews && destination.reviews.length > 0 ? (
                                            <div className="space-y-4">
                                                {destination.reviews.map((rev: any, idx: number) => (
                                                    <div key={idx} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                                                        {editingReviewId === rev.id ? (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-sm font-medium text-gray-700">{t('home.modal.reviews.ratingLabel')}</span>
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
                                                                        {t('home.modal.reviews.actions.cancel')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateReview(rev.id)}
                                                                        disabled={submitting}
                                                                        className="px-4 py-2 bg-eco-primary-600 text-white rounded-lg text-sm font-medium hover:bg-eco-primary-700 disabled:opacity-50"
                                                                    >
                                                                        {t('home.modal.reviews.actions.save')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-eco-primary-100 flex items-center justify-center text-eco-primary-700 font-bold">
                                                                            {(rev.user?.name || 'U')[0].toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-gray-900 text-sm">{rev.user?.name || t('home.modal.reviews.anonymous')}</p>
                                                                            <div className="flex text-yellow-400 text-xs">
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
                                                                                    title={t('home.modal.reviews.actions.edit')}
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => setConfirmModal({ isOpen: true, reviewId: rev.id })}
                                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                                title={t('home.modal.reviews.actions.delete')}
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className={`text-sm leading-relaxed break-words ${rev.is_hidden ? 'italic text-gray-400' : 'text-gray-600'}`}>
                                                                    {rev.is_hidden ? t('home.modal.reviews.hiddenComment') : rev.comment}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-gray-500 italic text-sm">{t('home.modal.reviews.noReviews')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={t('home.modal.reviews.actions.confirmDeleteTitle')}
                    message={t('home.modal.reviews.actions.confirmDeleteMessage')}
                    confirmText={t('home.modal.reviews.actions.delete')}
                    cancelText={t('home.modal.reviews.actions.cancel')}
                    onConfirm={handleDeleteReview}
                    onCancel={() => setConfirmModal({ isOpen: false, reviewId: null })}
                    type="danger"
                />
            </div>
        </div >
    );
};

export default DestinationModal;
