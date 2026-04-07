export const placeTranslations: Record<number, { en: { name: string; description: string; shortDescription: string; duration?: string; bestSeason?: string } }> = {
    1: {
        en: {
            name: 'Santa Rosa de Cabal Thermal Springs',
            description: 'Natural thermal waters surrounded by lush tropical vegetation. Enjoy hot water pools fed by natural sources and an impressive 200-meter high waterfall.',
            shortDescription: 'Thermal waters with natural waterfalls',
            duration: '4-6 hours',
            bestSeason: 'All year'
        }
    },
    2: {
        en: {
            name: 'Otún Quimbaya Flora and Fauna Sanctuary',
            description: 'Protected area of 489 hectares preserving Andean ecosystems. Home to endemic species like the howler monkey and over 200 bird species. Ecological trails and natural viewpoints.',
            shortDescription: 'Protected flora and fauna sanctuary',
            duration: '3-4 hours',
            bestSeason: 'All year'
        }
    },
    3: {
        en: {
            name: 'Los Nevados National Natural Park',
            description: 'Majestic national park with paramo and glacier ecosystems. Includes the Ruiz, Tolima, and Santa Isabel snowy peaks. Unique high mountain landscapes with glacial lagoons and frailejones.',
            shortDescription: 'High mountain paramos and glaciers',
            duration: 'Full day',
            bestSeason: 'Jan-Feb / Jul-Aug'
        }
    },
    4: {
        en: {
            name: 'Ukumarí Biopark',
            description: 'Thematic biopark dedicated to the conservation of Colombian biodiversity. Houses over 200 animals of 50 different species in natural environments. Educational and conservation experience.',
            shortDescription: 'Conservation and educational biopark',
            duration: '4-5 hours',
            bestSeason: 'All year'
        }
    },
    5: {
        en: {
            name: 'El Fraile Waterfall',
            description: 'Impressive 200-meter high waterfall located in the middle of the tropical rainforest. Surrounded by lush vegetation and wildlife. Access via well-marked ecological trail.',
            shortDescription: 'Impressive waterfall in tropical rainforest',
            duration: '3 hours',
            bestSeason: 'All year'
        }
    },
    6: {
        en: {
            name: 'Green Mountain Trail',
            description: 'Hiking route that crosses cloud forests and offers spectacular panoramic views of the Risaralda valley. Ideal for bird watching and landscape photography.',
            shortDescription: 'Hiking route with panoramic views',
            duration: '3-4 hours',
            bestSeason: 'Dry season'
        }
    }
};

export const getTranslatedPlace = (place: any, language: 'es' | 'en') => {
    if (language === 'es') return place;

    const translation = placeTranslations[place.id]?.en;
    if (translation) {
        return {
            ...place,
            name: translation.name,
            description: translation.description,
            short_description: translation.shortDescription, // Note: Model uses snake_case sometimes, ensuring compatibility
            shortDescription: translation.shortDescription,   // covering camelCase too just in case
            duration: translation.duration || place.duration,
            best_season: translation.bestSeason || place.best_season
        };
    }
    return place;
};
