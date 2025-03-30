
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { Search, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface MapLocation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  category: string;
}

interface SearchMapProps {
  query: string;
}

const SearchMap = ({ query }: SearchMapProps) => {
  const { isLoading } = useSearch();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapToken, setMapToken] = useState<string>("");
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  // Mock locations based on query
  useEffect(() => {
    if (!query) return;
    
    // Generate mock locations based on search query
    const mockLocations: MapLocation[] = [
      {
        id: "loc1",
        name: `${query} Headquarters`,
        address: `123 Main St, New York, NY 10001`,
        coordinates: [-74.005, 40.7128], // New York
        category: "business"
      },
      {
        id: "loc2",
        name: `${query} Store`,
        address: `456 Market St, San Francisco, CA 94103`,
        coordinates: [-122.4194, 37.7749], // San Francisco
        category: "shop"
      },
      {
        id: "loc3",
        name: `${query} Factory`,
        address: `789 Michigan Ave, Chicago, IL 60611`,
        coordinates: [-87.6298, 41.8781], // Chicago
        category: "industrial"
      },
      {
        id: "loc4",
        name: `${query} Office`,
        address: `101 Sunset Blvd, Los Angeles, CA 90028`,
        coordinates: [-118.2437, 34.0522], // Los Angeles
        category: "business"
      },
      {
        id: "loc5",
        name: `${query} Research Center`,
        address: `202 Congress Ave, Austin, TX 78701`,
        coordinates: [-97.7431, 30.2672], // Austin
        category: "research"
      }
    ];
    
    setLocations(mockLocations);
  }, [query]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Default to US center if location access is denied
          setUserCoordinates([-98.5795, 39.8283]);
        }
      );
    }
  }, []);

  // Initialize and load map
  useEffect(() => {
    if (!mapContainer.current || !mapToken || markers.current.length > 0) return;
    
    const initializeMap = async () => {
      try {
        // Dynamically import mapboxgl to avoid SSR issues
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.default.accessToken = mapToken;
        
        const initialCoordinates = userCoordinates || [-98.5795, 39.8283]; // US center as default
        
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: initialCoordinates,
          zoom: userCoordinates ? 10 : 3
        });
        
        // Add navigation control
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Add user location marker if available
          if (userCoordinates) {
            const userMarker = new mapboxgl.default.Marker({ color: '#3b82f6' })
              .setLngLat(userCoordinates)
              .setPopup(new mapboxgl.default.Popup().setHTML('<h3>Your Location</h3>'))
              .addTo(map.current);
            
            markers.current.push(userMarker);
          }
          
          // Add location markers
          locations.forEach(location => {
            const marker = new mapboxgl.default.Marker({ color: '#ef4444' })
              .setLngLat(location.coordinates)
              .setPopup(
                new mapboxgl.default.Popup().setHTML(
                  `<h3>${location.name}</h3><p>${location.address}</p>`
                )
              )
              .addTo(map.current);
            
            markers.current.push(marker);
          });
          
          // Fit bounds to include all markers if we have locations
          if (locations.length > 0) {
            const bounds = new mapboxgl.default.LngLatBounds();
            
            if (userCoordinates) {
              bounds.extend(userCoordinates);
            }
            
            locations.forEach(location => {
              bounds.extend(location.coordinates);
            });
            
            map.current.fitBounds(bounds, { padding: 50 });
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
    
    initializeMap();
    
    return () => {
      // Clean up map and markers when component unmounts
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapToken, locations, userCoordinates]);

  if (isLoading) {
    return (
      <div className="w-full py-4 animate-fade-in">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  // If map token is not set, show input for token
  if (!mapToken) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Map Functionality</h3>
        <p className="text-gray-500 text-center mb-6">
          Please enter your Mapbox access token to enable the map feature.
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Enter Mapbox token..."
            value={mapToken}
            onChange={(e) => setMapToken(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => {
              if (mapToken) {
                localStorage.setItem("mapbox_token", mapToken);
              }
            }}
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Get your token at <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          Map results for "{query}"
        </h2>
        {userCoordinates && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (map.current && userCoordinates) {
                map.current.flyTo({
                  center: userCoordinates,
                  zoom: 14,
                  essential: true
                });
              }
            }}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span>My Location</span>
          </Button>
        )}
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[500px] rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-gray-50"
      />
      
      {locations.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-medium">Locations ({locations.length})</h3>
          <div className="space-y-2">
            {locations.map(location => (
              <div 
                key={location.id} 
                className="p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm cursor-pointer"
                onClick={() => {
                  if (map.current) {
                    map.current.flyTo({
                      center: location.coordinates,
                      zoom: 15,
                      essential: true
                    });
                    
                    // Find and open the popup for this marker
                    const marker = markers.current.find(
                      m => m._lngLat && 
                      m._lngLat.lng === location.coordinates[0] && 
                      m._lngLat.lat === location.coordinates[1]
                    );
                    
                    if (marker && marker.getPopup) {
                      marker.togglePopup();
                    }
                  }
                }}
              >
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-gray-500">{location.address}</p>
                    <p className="text-xs text-gray-400 mt-1">Category: {location.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMap;
