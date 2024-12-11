import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { formatCurrency } from '../../utils/format';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  onEventClick?: (eventId: number) => void;
}

const BROOKLYN_BOUNDS = {
  coordinates: [
    [
      [-73.95, 40.65],
      [-73.95, 40.7],
      [-73.85, 40.7],
      [-73.85, 40.65],
      [-73.95, 40.65],
    ],
  ],
};

export function InteractiveMap({ 
  center = [-73.94, 40.68],
  zoom = 13,
  onEventClick 
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { events, loading: eventsLoading } = useEvents();

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('brooklyn-area', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: BROOKLYN_BOUNDS.coordinates,
          },
          properties: {},
        },
      });

      map.current.addLayer({
        id: 'brooklyn-area-fill',
        type: 'fill',
        source: 'brooklyn-area',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.1,
        },
      });

      map.current.addLayer({
        id: 'brooklyn-area-line',
        type: 'line',
        source: 'brooklyn-area',
        paint: {
          'line-color': '#0080ff',
          'line-width': 2,
        },
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current || !events.length) return;

    const markers = document.getElementsByClassName('marker');
    while (markers[0]) {
      markers[0].remove();
    }

    events.forEach((event) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = event.is_featured
        ? 'url(https://img.icons8.com/color/48/star--v1.png)'
        : 'url(https://img.icons8.com/color/48/event-accepted.png)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      const popupContent = `
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <img src="${event.image}" alt="${
        event.title
      }" class="w-16 h-16 object-cover rounded"/>
            <div>
              <h3 class="font-bold text-lg">${event.title}</h3>
              <p class="text-sm text-gray-600">${event.venue}</p>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm">
              <span class="font-semibold">${formatCurrency(
                event.price_amount,
                event.price_currency
              )}</span>
              <span class="px-2 py-1 ml-2 bg-pink-100 text-pink-800 rounded-full text-xs">
                ${event.category}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-yellow-500">★</span>
              <span class="text-sm font-medium">${event.rating}</span>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent)
        .on('open', () => {
          const popupElement = popup.getElement();
          popupElement.addEventListener('click', () => {
            onEventClick?.(event.id);
          });
        });

      new mapboxgl.Marker(el)
        .setLngLat([event.longitude, event.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        popup.addTo(map.current!);
      });
    });
  }, [events, onEventClick]);

  const handleSearch = async () => {
    if (!searchQuery || !map.current) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&bbox=-74.04,40.61,-73.85,40.7`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          essential: true,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search locations in Brooklyn..."
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-md"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
              onClick={handleSearch}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}