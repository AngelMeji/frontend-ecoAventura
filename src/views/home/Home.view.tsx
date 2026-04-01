import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import HeroSection from '../../components/home/HeroSection';
import DestinationCard from '../../components/destination/DestinationCard';
import FilterBar from '../../components/home/FilterBar';
import CategorySection from '../../components/home/CategorySection';
import DestinationModal from '../../components/destination/DestinationModal';
import InteractiveMap from '../../components/map/InteractiveMap';
import { placesService } from '../../services/placesService';
import type { Place, Category } from '../../models/Place.model';

const Home: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalPlaces, setTotalPlaces] = useState(0);
    const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isMapVisible, setIsMapVisible] = useState(false);
    const mapContainerRef = React.useRef<HTMLDivElement>(null);

    // Lazy load map when it enters the viewport (with 300px margin)
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsMapVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '300px' });

        if (mapContainerRef.current) {
            observer.observe(mapContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Cargar categorías al inicio
    useEffect(() => {
        placesService.getCategories().then(setCategories).catch(console.error);
    }, []);

    // Cargar lugares según filtros activos
    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                const filters: Record<string, any> = { page: currentPage };
                if (activeCategory !== 'Todos') filters.category = activeCategory;
                if (searchQuery) filters.search = searchQuery;

                const response = await placesService.getAll(filters);
                setPlaces(response.data);
                setLastPage(response.last_page);
                setTotalPlaces(response.total);
            } catch (error) {
                console.error('Error al cargar lugares:', error);
                setPlaces([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [activeCategory, searchQuery, currentPage]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setActiveCategory('Todos');
        setCurrentPage(1);
    };

    const handleCategoryChange = (slug: string) => {
        setActiveCategory(slug);
        setSearchQuery('');
        setCurrentPage(1);
        const grid = document.getElementById('destinations-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCardClick = async (placeId: number) => {
        try {
            const place = await placesService.getOne(placeId);
            setSelectedDestination(place);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error al cargar detalle:', error);
        }
    };

    const handleMarkerClick = React.useCallback(async (destinationId: number) => {
        try {
            const destination = await placesService.getOne(destinationId);
            if (destination) {
                setSelectedDestination(destination);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error al abrir modal desde el mapa:', error);
        }
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDestination(null);
    };

    // Construir listado de categorías para el CategorySection
    const categoriesStats = categories.map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.count ?? 0,
        avgRating: cat.avgRating ?? 4.5,
        icon: cat.icon ?? '🌿'
    }));

    return (
        <div className="w-full flex-1 flex flex-col items-center pb-20 mt-2 md:mt-6">
            <HeroSection />

            <div className="w-full max-w-7xl px-4 mt-8 animate-fade-in-up">
                <FilterBar
                    onSearchChange={handleSearchChange}
                    onCategoryChange={handleCategoryChange}
                    activeCategory={activeCategory}
                />
            </div>

            {!searchQuery && categoriesStats.length > 0 && (
                <div className="w-full max-w-7xl px-4 my-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <CategorySection
                        categories={categoriesStats}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            )}

            {/* Map Section */}
            <div ref={mapContainerRef} className="w-full max-w-7xl px-4 mt-8 mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 font-display">
                        Mapa de Destinos
                    </h2>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[500px] z-0 relative">
                    {isMapVisible ? (
                        <InteractiveMap
                            destinations={places as any[]}
                            onMarkerClick={handleMarkerClick}
                            shouldAutoFit={true}
                        />
                    ) : (
                        <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-50/50 animate-pulse text-gray-400">
                            <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Cargando mapa...</span>
                        </div>
                    )}
                </div>
            </div>

            <main id="destinations-grid" className="w-full max-w-7xl px-4 mt-12 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-eco-primary-50 rounded-2xl text-eco-primary-600 shadow-sm border border-eco-primary-100/50">
                        <MapPin className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 font-display tracking-tight">
                            {searchQuery ? 'Resultados de búsqueda' : activeCategory !== 'Todos' ? activeCategory : 'Buscando destinos...'}
                        </h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            {loading ? 'Cargando...' : `${totalPlaces} destinos encontrados`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="rounded-3xl bg-gray-100 animate-pulse h-80" />
                        ))}
                    </div>
                ) : places.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-xl">No se encontraron destinos que coincidan.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {places.map((place) => (
                                <DestinationCard
                                    key={place.id}
                                    destination={place as any}
                                    onClick={() => handleCardClick(place.id)}
                                />
                            ))}
                        </div>

                        {/* Paginación */}
                        {lastPage > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="Página anterior"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${currentPage === page
                                                ? 'bg-eco-primary-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, lastPage))}
                                    disabled={currentPage === lastPage}
                                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="Página siguiente"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </>
                )}

            </main>

            {selectedDestination && (
                <DestinationModal
                    destination={selectedDestination}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Home;