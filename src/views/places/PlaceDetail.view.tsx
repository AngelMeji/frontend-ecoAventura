import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { placesService } from '../../services/placesService';
import type { Place } from '../../models/Place.model';

import { authService } from '../../services/authService';
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

    const user = authService.getCurrentUser();

    useEffect(() => {
        const statePlace = location.state?.placeData;
        if (statePlace) {
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
            const loadedPlace = data.data || data;
            setPlace(loadedPlace);
        } catch (error) {
            console.error('Error cargando lugar:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 flex-col gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-eco-primary-600"></div>
                <p className="text-xl font-display text-eco-primary-800 animate-pulse">Cargando...</p>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="flex flex-col items-center justify-center py-32 p-4 text-center">
                <h2 className="text-3xl font-display font-bold text-gray-800 mb-3">Lugar no encontrado</h2>
                <div className="flex gap-4 mt-4">
                    <button onClick={() => navigate('/home')} className="px-6 py-3 rounded-full border-2 border-eco-primary-200 text-eco-primary-700 font-semibold hover:bg-eco-primary-50 transition-colors">Volver al Inicio</button>
                </div>
            </div>
        );
    }

    const images = place.images && place.images.length > 0
        ? place.images
        : [{ id: 0, image_path: 'https://via.placeholder.com/800x600?text=No+Image' }];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    };

    return (
        <div className="bg-eco-bg pb-12">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <button
                    onClick={() => navigate('/home')}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white text-eco-primary-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 mb-8 border border-eco-primary-100"
                >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-semibold text-sm tracking-wide uppercase">Volver</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative h-[400px] md:h-[500px] bg-gray-200 group">
                         <SafeImage
                            src={images[currentImageIndex].full_url ? getOptimizedImageUrl(images[currentImageIndex].full_url) : getOptimizedImageUrl(images[currentImageIndex].image_path)}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                        {images.length > 1 && (
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between p-4 transition-opacity duration-300 z-30">
                                <button
                                    onClick={prevImage}
                                    className="bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 transition-all shadow-xl"
                                >
                                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="bg-white/80 hover:bg-white p-2 md:p-3 rounded-full text-gray-800 transition-all shadow-xl"
                                >
                                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}

                        <div className="absolute top-6 right-6 z-10">
                            <button
                                className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 shrink-0 bg-white/70 text-gray-400 cursor-not-allowed"
                                title="Funcionalidad de Favoritos en desarrollo"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        {images.length > 1 && (
                            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-black/50 backdrop-blur-md text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium z-30">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-eco-primary-500/80 backdrop-blur-md rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                                    {place.category?.name || 'Destino'}
                                </span>
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

                    {!user ? (
                        <div className="p-8 text-center bg-gray-50">
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
                                        Inicia sesión para acceder a la descripción detallada de este lugar.
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
                                <button className={`mr-8 pb-4 font-medium transition-all relative ${activeTab === 'info' ? 'text-eco-primary-700' : 'text-gray-400'}`} onClick={() => setActiveTab('info')}>
                                    Información
                                    {activeTab === 'info' && <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />}
                                </button>
                                <button className={`pb-4 font-medium transition-all relative ${activeTab === 'reviews' ? 'text-eco-primary-700' : 'text-gray-400'}`} onClick={() => setActiveTab('reviews')}>
                                    Reseñas <span className="ml-1 text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">0</span>
                                    {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />}
                                </button>
                                <button className={`ml-8 pb-4 font-medium transition-all relative ${activeTab === 'chatbot' ? 'text-eco-primary-700' : 'text-gray-400'}`} onClick={() => setActiveTab('chatbot')}>
                                    Asistente IA
                                    {activeTab === 'chatbot' && <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />}
                                </button>
                            </div>

                            <div className="p-4 md:p-8 bg-white min-h-[300px]">
                                {activeTab === 'info' && (
                                    <div className="animate-fade-in">
                                        <p className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-line break-words">
                                            {place.description}
                                        </p>
                                        <h3 className="text-2xl font-display font-bold text-eco-primary-900 mb-6">Detalles de la Experiencia</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Dificultad</h3>
                                                <p className="text-eco-primary-700 capitalize font-medium">{place.difficulty || 'Baja'}</p>
                                            </div>
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Horario</h3>
                                                <p className="text-eco-primary-700 font-medium">{place.duration || 'todos los días'}</p>
                                            </div>
                                            <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100">
                                                <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">Mejor Temporada</h3>
                                                <p className="text-eco-primary-700 font-medium">{place.best_season || 'todo el año'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-12 bg-eco-primary-50/30 rounded-3xl p-8 border border-eco-primary-100/50">
                                            <h3 className="text-2xl font-bold text-eco-primary-900 mb-6 flex items-center gap-2">
                                                <svg className="w-6 h-6 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Ubicación
                                            </h3>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección Exacta</p>
                                            <p className="text-gray-800 text-lg mb-4">{place.address}</p>
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
                                )}
                                {activeTab === 'reviews' && (
                                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="italic">La sección de reseñas está siendo desarrollada por otro equipo y estará disponible pronto.</p>
                                    </div>
                                )}
                                {activeTab === 'chatbot' && (
                                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="italic">El Asistente Inteligente está siendo desarrollado por otro equipo y estará disponible pronto.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;
