import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslatedPlace } from '../../translations/places';
import { getCategoryIcon } from '../../utils/categoryIcons';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with category icon
const createCustomIcon = (categorySlug: string) => {
    const svgIcon = getCategoryIcon(categorySlug || '');

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: #14b8a6;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 20px;
          height: 20px;
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${svgIcon.replace('w-8 h-8', 'w-full h-full')}
        </div>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

interface InteractiveMapProps {
    destinations: any[];
    onMarkerClick?: (destinationId: number) => void;
    highlightedDestination?: number | null;
    shouldAutoFit?: boolean;
}

// Component helper to update map bounds
const MapBoundsUpdater: React.FC<{ destinations: any[]; shouldAutoFit?: boolean }> = ({ destinations, shouldAutoFit }) => {
    const map = useMap();

    React.useEffect(() => {
        if (destinations.length > 0 && shouldAutoFit) {
            const timeoutId = setTimeout(() => {
                try {
                    const bounds = L.latLngBounds(destinations.map(d => [Number(d.latitude), Number(d.longitude)]));
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                } catch (e) {
                    console.error("Error al actualizar los límites del mapa:", e);
                }
            }, 100); // Small delay to prevent synchronous forced reflows

            return () => clearTimeout(timeoutId);
        }
    }, [destinations, map, shouldAutoFit]);

    return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
    destinations,
    onMarkerClick,
    highlightedDestination: _highlightedDestination,
    shouldAutoFit = false
}) => {
    const mapRef = useRef<L.Map>(null);
    const { t, language } = useLanguage();

    // State for managing hover interaction with delay
    const [activeId, setActiveId] = React.useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Center of Risaralda, Colombia (Pereira)
    const center: [number, number] = [4.8143, -75.6946];

    const handleMarkerClick = (destinationId: number) => {
        if (onMarkerClick) {
            onMarkerClick(destinationId);
        }
    };

    const handleMouseEnter = (id: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveId(id);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveId(null);
        }, 500); // 500ms delay
    };

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg relative">
            {/* Legend */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-[400] bg-white/90 backdrop-blur-sm md:bg-white rounded-lg shadow-md p-2 md:p-3 max-w-[150px] md:max-w-[200px] pointer-events-none">
                <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-1 md:mb-2">{t('home.map.legend')}</h4>
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-eco-teal-500 rounded-full border border-white shadow"></div>
                    <span>{t('home.map.available')}</span>
                </div>
                <p className="hidden md:block text-xs text-gray-500 mt-2">
                    {t('home.map.hint')}
                </p>
            </div>

            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                dragging={!L.Browser.mobile}
                className="w-full h-full z-0"
                ref={mapRef}
            >
                <MapBoundsUpdater destinations={destinations} shouldAutoFit={shouldAutoFit} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {destinations.map((rawDest) => {
                    const destination = getTranslatedPlace(rawDest, language);
                    const isActive = activeId === destination.id;
                    const categorySlug = rawDest.category?.slug || rawDest.category_slug || ''; // Try to get slug from category relation or flat field

                    return (
                        <Marker
                            key={destination.id}
                            position={[Number((destination as any).latitude), Number((destination as any).longitude)]}
                            icon={createCustomIcon(categorySlug)}
                            eventHandlers={{
                                click: () => handleMarkerClick(destination.id),
                                mouseover: () => handleMouseEnter(destination.id),
                                mouseout: handleMouseLeave
                            }}
                        >
                            {isActive && (
                                <Tooltip
                                    direction="top"
                                    offset={[0, -5]}
                                    opacity={1}
                                    permanent={true}
                                    interactive={true}
                                    className="custom-tooltip z-[1000]"
                                >
                                    <div
                                        className="p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                                        onMouseEnter={() => {
                                            if (timeoutRef.current) {
                                                clearTimeout(timeoutRef.current);
                                                timeoutRef.current = null;
                                            }
                                        }}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent map click
                                            handleMarkerClick(destination.id);
                                        }}
                                    >
                                        <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap flex items-center gap-1">
                                            {destination.name}
                                            <svg className="w-3 h-3 text-eco-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </h3>
                                    </div>
                                </Tooltip>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div >
    );
};

export default InteractiveMap;
