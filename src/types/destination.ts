export interface Coordinates {
    lat: number;
    lng: number;
}

export type DestinationCategory =
    | 'Naturaleza'
    | 'Aventura'
    | 'Cascadas'
    | 'Termal'
    | 'Fauna'
    | 'Senderismo';

export type DifficultyLevel = 'Fácil' | 'Moderado' | 'Difícil';

export interface Destination {
    id: number;
    name: string;
    description: string;
    shortDescription: string;
    coordinates: Coordinates;
    category: DestinationCategory;
    difficulty: DifficultyLevel;
    imageUrl: string;
    activities: string[];
    duration: string;
    bestSeason: string;
}
