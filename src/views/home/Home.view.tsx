import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import HeroSection from '../../components/home/HeroSection';
import DestinationCard from '../../components/destination/DestinationCard';
import FilterBar from '../../components/home/FilterBar';
import CategorySection from '../../components/home/CategorySection';
import DestinationModal from '../../components/destination/DestinationModal';
import { destinations, getDestinationsByCategory, searchDestinations } from '../../data/destinations';
import type { Destination } from '../../types/destination';

const Home: React.FC = () => {
    const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(destinations);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let result = destinations;
        if (searchQuery) {
            result = searchDestinations(searchQuery);
        } else if (activeCategory !== 'Todos') {
            result = getDestinationsByCategory(activeCategory);
        }
        setFilteredDestinations(result);
    }, [activeCategory, searchQuery]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setActiveCategory('Todos');
    };

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setSearchQuery('');
    };

    const handleCardClick = (destination: any) => {
        setSelectedDestination(destination);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDestination(null);
    };

    const ecoIcons = {
        Naturaleza: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M12 2L6 12h3v8l6-10H12l3-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        Aventura: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M8 12l2-2m0 0l2 2m-2-2v8M16 12l2-2m0 0l2 2m-2-2v8M4 12l2-2m0 0l2 2m-2-2v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        Cascadas: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M12 4v16m0-16c3.314 0 6 2.686 6 6 0 1.657-1.343 3-3 3s-3 1.343-3 3c0 1.657 1.343 3 3 3M12 4c-3.314 0-6 2.686-6 6 0 1.657 1.343 3 3 3s3 1.343 3 3c0 1.657-1.343 3-3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        Fauna: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        Termales: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M12 3v18m0-18C8.686 3 6 5.686 6 9c0 1.657 1.343 3 3 3s3 1.343 3 3c0 1.657-1.343 3-3 3m6-18c3.314 0 6 2.686 6 6 0 1.657-1.343 3-3 3s-3 1.343-3 3c0 1.657 1.343 3 3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        Senderismo: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor"><path d="M7 11v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-7a1 1 0 011-1h3a4 4 0 004-4V4a1 1 0 011-1h2a1 1 0 011 1v4a4 4 0 004 4h3a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-8M7 11h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    const categoriesList = ['Naturaleza', 'Aventura', 'Cascadas', 'Fauna', 'Termales', 'Senderismo'];

    const categoriesStats = categoriesList.map(name => ({
        name,
        slug: name,
        count: getDestinationsByCategory(name).length,
        avgRating: 4.5,
        icon: ecoIcons[name as keyof typeof ecoIcons] || ''
    })).filter(cat => cat.count > 0);

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

            {!searchQuery && (
                <div className="w-full max-w-7xl px-4 my-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <CategorySection
                        categories={categoriesStats}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            )}

            <main className="w-full max-w-7xl px-4 mt-12 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-eco-primary-50 rounded-2xl text-eco-primary-600 shadow-sm border border-eco-primary-100/50">
                        <MapPin className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 font-display tracking-tight">
                            Buscando destinos...
                        </h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">
                            {filteredDestinations.length} destinos encontrados
                        </p>
                    </div>
                </div>

                {filteredDestinations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-eco-text-light text-xl">No se encontraron destinos que coincidan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDestinations.map((destination) => (
                            <DestinationCard
                                key={destination.id}
                                destination={destination}
                                onClick={() => handleCardClick(destination)}
                            />
                        ))}
                    </div>
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
