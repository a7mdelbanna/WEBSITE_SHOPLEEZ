'use client';

/**
 * Map Location Picker Component
 *
 * Interactive Google Maps picker with draggable pin for address selection.
 *
 * Features:
 * - Google Maps integration with draggable marker
 * - "Use My Location" GPS button (floating on map)
 * - Real-time coordinate updates
 * - Loading states for map initialization
 * - Error handling (GPS denied, map load failure)
 * - RTL/Arabic support
 * - Mobile responsive
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Loader2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLocation {
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  initialCenter?: MapLocation;
  onLocationSelect: (location: MapLocation) => void;
  selectedLocation: MapLocation | null;
  isRTL?: boolean;
}

export function MapLocationPicker({
  initialCenter,
  onLocationSelect,
  selectedLocation,
  isRTL = false,
}: MapLocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState('');

  // Map container styling
  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '500px',
    borderRadius: '20px',
  }), []);

  // Map options
  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy', // One-finger pan on mobile
  }), []);

  // Default center (Cairo, Egypt)
  const defaultCenter = useMemo<MapLocation>(() => ({
    lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT || '30.0444'),
    lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG || '31.2357'),
  }), []);

  // Use initialCenter or default
  const center = useMemo(() =>
    selectedLocation || initialCenter || defaultCenter,
    [selectedLocation, initialCenter, defaultCenter]
  );

  // Handle marker drag
  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation: MapLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      onLocationSelect(newLocation);
    }
  }, [onLocationSelect]);

  // Handle map click (set marker)
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation: MapLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      onLocationSelect(newLocation);
    }
  }, [onLocationSelect]);

  // "Use My Location" button handler
  const handleUseMyLocation = useCallback(() => {
    setIsLocating(true);
    setMapError('');

    if (!navigator.geolocation) {
      setMapError(isRTL ? 'الموقع غير مدعوم في متصفحك' : 'Geolocation not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: MapLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationSelect(newLocation);

        // Pan map to new location with smooth animation
        if (map) {
          map.panTo(newLocation);
          map.setZoom(17); // Zoom closer for street level
        }

        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = isRTL ? 'تعذر الحصول على موقعك' : 'Could not get your location';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = isRTL
            ? 'تم رفض الوصول إلى الموقع. يرجى سحب الدبوس يدوياً.'
            : 'Location access denied. Please drag the pin manually.';
        }

        setMapError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map, onLocationSelect, isRTL]);

  // Auto-select center on first load if no location selected
  useEffect(() => {
    if (!selectedLocation && center) {
      onLocationSelect(center);
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      loadingElement={
        <div className="w-full h-[500px] rounded-[20px] bg-[#F5F5F7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="text-[14px] text-[#6B7280]">
              {isRTL ? 'جاري تحميل الخريطة...' : 'Loading map...'}
            </p>
          </div>
        </div>
      }
    >
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={mapOptions}
          onLoad={setMap}
          onClick={handleMapClick}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>

        {/* Floating "Use My Location" Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={cn(
            "absolute bottom-4 bg-white rounded-full shadow-lg",
            "px-4 py-3 flex items-center gap-2",
            "hover:bg-[#F5F5F7] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isRTL ? "left-4" : "right-4"
          )}
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
          ) : (
            <Navigation className="w-5 h-5 text-[var(--color-primary)]" />
          )}
          <span className="text-[14px] font-medium text-[#1A1A1A]">
            {isRTL ? 'استخدم موقعي' : 'Use My Location'}
          </span>
        </button>

        {/* Error Message */}
        {mapError && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-[12px] p-3">
            <p className="text-[13px] text-red-600 text-center">{mapError}</p>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
