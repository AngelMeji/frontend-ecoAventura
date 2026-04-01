import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslatedPlace } from '../../translations/places';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import SafeImage from '../common/SafeImage';


// URL base para las imágenes (asumiendo que vienen relativas del backend)
// Si VITE_API_URL es http://localhost:8000/api, las imagenes estan en http://localhost:8000/storage/

interface DestinationCardProps {
    destination: any;
    isHighlighted?: boolean;
    onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
    destination: rawDestination,
    isHighlighted = false,
    onClick
}) => {
    const { t, language } = useLanguage();
    const destination = getTranslatedPlace(rawDestination, language);

    // Obtener color por categoría (ajustar lógica si category es objeto o string)
    const getCategoryColor = (categoryName: string) => {
        const colors: Record<string, string> = {
            'Naturaleza': 'bg-eco-primary-100 text-eco-primary-800 border-eco-primary-200',
            'Aventura': 'bg-orange-100 text-orange-800 border-orange-200',
            'Cascadas': 'bg-blue-100 text-blue-800 border-blue-200',
            'Termales': 'bg-pink-100 text-pink-800 border-pink-200',
            'Fauna': 'bg-green-100 text-green-800 border-green-200',
            'Senderismo': 'bg-amber-100 text-amber-800 border-amber-200',
        };
        return colors[categoryName] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const imageUrl = destination.images && destination.images.length > 0 && destination.images[0] 
        ? getOptimizedImageUrl(destination.images[0].full_url || destination.images[0].image_path)
        : getOptimizedImageUrl('/assets/images/placeholder.jpg');

    const categoryName = destination.category?.name || 'General';

    return (
        <div
            onClick={onClick}
            className={`group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 flex flex-col h-full ${isHighlighted
                ? 'ring-4 ring-eco-accent/50 shadow-2xl scale-[1.02]'
                : 'hover:border-eco-primary-200'
                }`}
        >
            {/* Contenedor de imagen con aspect-ratio para evitar deformaciones */}
            <div className="relative aspect-video shrink-0 overflow-hidden bg-gray-100">
                <SafeImage
                    src={imageUrl}
                    alt={destination.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border backdrop-blur-md bg-white/90 ${getCategoryColor(categoryName)}`}>
                        {destination.category?.slug
                            ? (t(`home.categories.names.${destination.category.slug}`) !== `home.categories.names.${destination.category.slug}`
                                ? t(`home.categories.names.${destination.category.slug}`)
                                : categoryName)
                            : categoryName}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <h3 className="text-xl font-display font-bold text-gray-800 group-hover:text-eco-primary-700 transition-colors line-clamp-1">
                        {destination.name}
                    </h3>
                    <div className="h-1 w-12 bg-eco-accent rounded-full mt-2 group-hover:w-20 transition-all duration-300"></div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-light leading-relaxed flex-grow">
                    {destination.short_description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                        <svg className="w-3.5 h-3.5 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{destination.duration || t('home.card.na')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                        <svg className="w-3.5 h-3.5 text-eco-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="capitalize">
                            {destination.difficulty
                                ? (t(`home.card.difficulty.${destination.difficulty}`) !== `home.card.difficulty.${destination.difficulty}`
                                    ? t(`home.card.difficulty.${destination.difficulty}`)
                                    : destination.difficulty)
                                : t('home.card.na')}
                        </span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Uso de navegación SPA si es posible, o window.location como fallback
                        if (onClick) onClick();
                        else window.location.href = `/place/${destination.slug || destination.id}`;
                    }}
                    className="w-full bg-eco-primary-600/90 hover:bg-eco-primary-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn"
                >
                    <span>{t('home.card.viewDetails')}</span>
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DestinationCard;
