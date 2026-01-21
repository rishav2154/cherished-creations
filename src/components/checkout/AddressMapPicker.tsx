import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressMapPickerProps {
  onAddressSelect: (address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  }) => void;
  initialAddress?: string;
}

// Component to handle map interactions
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16);
  }, [position, map]);
  return null;
}

export function AddressMapPicker({ onAddressSelect, initialAddress }: AddressMapPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([12.9716, 77.5946]); // Default: Bangalore
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      const data: AddressResult = await response.json();
      return data;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  };

  // Extract and send address components
  const processAddress = (result: AddressResult) => {
    const addr = result.address;
    const addressLine1 = [addr.house_number, addr.road].filter(Boolean).join(' ') || result.display_name.split(',')[0];
    const addressLine2 = addr.suburb || '';
    const city = addr.city || addr.town || addr.village || '';
    const state = addr.state || '';
    const pincode = addr.postcode || '';

    onAddressSelect({
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    });
  };

  // Handle location selection from search results
  const handleResultSelect = (result: AddressResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setSelectedPosition([lat, lon]);
    setSearchQuery(result.display_name);
    setSelectedAddress(result.display_name);
    setShowResults(false);
    setMapKey(prev => prev + 1);
    processAddress(result);
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    
    const result = await reverseGeocode(lat, lng);
    if (result) {
      setSearchQuery(result.display_name);
      setSelectedAddress(result.display_name);
      processAddress(result);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setSelectedPosition([lat, lon]);
        setMapKey(prev => prev + 1);

        const result = await reverseGeocode(lat, lon);
        if (result) {
          setSearchQuery(result.display_name);
          setSelectedAddress(result.display_name);
          processAddress(result);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Unable to get your location. Please search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={resultsRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search for your address..."
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="shrink-0"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleResultSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-accent mt-1 shrink-0" />
                  <span className="text-sm line-clamp-2">{result.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border border-border h-64 md:h-80">
        <MapContainer
          key={mapKey}
          center={selectedPosition}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={selectedPosition} />
          <MapEvents onLocationSelect={handleMapClick} />
          <MapRecenter position={selectedPosition} />
        </MapContainer>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-accent/10 border border-accent/20"
        >
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">{selectedAddress}</p>
          </div>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Click on the map or search to select your delivery location
      </p>
    </div>
  );
}
