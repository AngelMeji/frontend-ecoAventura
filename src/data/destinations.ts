import type { Destination } from '../types/destination';

export const destinations: Destination[] = [
    {
        id: 1,
        name: 'Termales de Santa Rosa de Cabal',
        description: 'Aguas termales naturales rodeadas de exuberante vegetación tropical. Disfruta de piscinas de agua caliente alimentadas por fuentes naturales y una impresionante cascada de 200 metros de altura.',
        shortDescription: 'Aguas termales con cascadas naturales',
        coordinates: {
            lat: 4.8385,
            lng: -75.5492
        },
        category: 'Termal',
        difficulty: 'Fácil',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
        activities: ['Baños termales', 'Senderismo', 'Fotografía', 'Observación de aves'],
        duration: '4-6 horas',
        bestSeason: 'Todo el año'
    },
    {
        id: 2,
        name: 'Santuario de Fauna y Flora Otún Quimbaya',
        description: 'Área protegida de 489 hectáreas que conserva ecosistemas andinos. Hogar de especies endémicas como el mono aullador y más de 200 especies de aves. Senderos ecológicos y miradores naturales.',
        shortDescription: 'Santuario de flora y fauna protegida',
        coordinates: {
            lat: 4.7236,
            lng: -75.5792
        },
        category: 'Fauna',
        difficulty: 'Moderado',
        imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
        activities: ['Observación de fauna', 'Senderismo', 'Fotografía de naturaleza', 'Educación ambiental'],
        duration: '5-7 horas',
        bestSeason: 'Diciembre a Marzo'
    },
    {
        id: 3,
        name: 'Parque Nacional Natural Los Nevados',
        description: 'Majestuoso parque nacional con ecosistemas de páramo y glaciares. Incluye los nevados del Ruiz, Tolima y Santa Isabel. Paisajes únicos de alta montaña con lagunas glaciares y frailejones.',
        shortDescription: 'Páramos y glaciares de alta montaña',
        coordinates: {
            lat: 4.8000,
            lng: -75.3667
        },
        category: 'Naturaleza',
        difficulty: 'Difícil',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        activities: ['Trekking de altura', 'Montañismo', 'Fotografía de paisajes', 'Observación de flora'],
        duration: 'Día completo',
        bestSeason: 'Junio a Septiembre'
    },
    {
        id: 4,
        name: 'Bioparque Ukumarí',
        description: 'Bioparque temático dedicado a la conservación de la biodiversidad colombiana. Alberga más de 200 animales de 50 especies diferentes en ambientes naturales. Experiencia educativa y de conservación.',
        shortDescription: 'Bioparque de conservación y educación',
        coordinates: {
            lat: 4.8017,
            lng: -75.8124
        },
        category: 'Fauna',
        difficulty: 'Fácil',
        imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80',
        activities: ['Observación de animales', 'Tours guiados', 'Educación ambiental', 'Fotografía'],
        duration: '3-4 horas',
        bestSeason: 'Todo el año'
    },
    {
        id: 5,
        name: 'Cascada El Fraile',
        description: 'Impresionante cascada de 200 metros de altura ubicada en medio de la selva tropical. Rodeada de vegetación exuberante y fauna silvestre. Acceso por sendero ecológico bien señalizado.',
        shortDescription: 'Impresionante cascada en selva tropical',
        coordinates: {
            lat: 4.8730,
            lng: -75.6194
        },
        category: 'Cascadas',
        difficulty: 'Moderado',
        imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
        activities: ['Senderismo', 'Fotografía', 'Observación de aves', 'Picnic'],
        duration: '4-5 horas',
        bestSeason: 'Abril a Noviembre'
    },
    {
        id: 6,
        name: 'Sendero Montaña Verde',
        description: 'Ruta de senderismo que atraviesa bosques de niebla y ofrece vistas panorámicas espectaculares del valle de Risaralda. Ideal para observación de aves y fotografía de paisajes.',
        shortDescription: 'Ruta de senderismo con vistas panorámicas',
        coordinates: {
            lat: 4.8500,
            lng: -75.6000
        },
        category: 'Senderismo',
        difficulty: 'Moderado',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
        activities: ['Senderismo', 'Observación de aves', 'Fotografía', 'Camping'],
        duration: '6-8 horas',
        bestSeason: 'Mayo a Octubre'
    }
];

// Helper function to get destinations by category
export const getDestinationsByCategory = (category: string): Destination[] => {
    if (category === 'Todos') return destinations;
    return destinations.filter(dest => dest.category === category);
};

// Helper function to search destinations
export const searchDestinations = (query: string): Destination[] => {
    const lowerQuery = query.toLowerCase();
    return destinations.filter(dest =>
        dest.name.toLowerCase().includes(lowerQuery) ||
        dest.description.toLowerCase().includes(lowerQuery) ||
        dest.category.toLowerCase().includes(lowerQuery)
    );
};
