
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/context/SearchContext";
import { Search, MapPin, Navigation, RefreshCw, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

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
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const userMarker = useRef<any>(null);
  const locationWatchId = useRef<number | null>(null);

  // Load mapToken from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setMapToken(savedToken);
    }
  }, []);

  // Generate more realistic mock locations based on query and user coordinates
  useEffect(() => {
    if (!query) return;
    
    // Generate mock locations based on search query and user location
    const generateLocations = () => {
      const center = userCoordinates || [-98.5795, 39.8283]; // Use user location or US center
      const randomLocations: MapLocation[] = [];
      
      // Create between 5-12 locations
      const locationCount = Math.floor(Math.random() * 8) + 5;
      
      const categories = ["business", "shop", "restaurant", "office", "landmark", "industrial", "research", "park", "entertainment"];
      
      for (let i = 0; i < locationCount; i++) {
        // Generate random coordinates within searchRadius km of center
        // 0.01 deg ~= 1.11 km, so multiply by searchRadius/111
        const kmToDeg = searchRadius / 111;
        const randLng = center[0] + (Math.random() * 2 - 1) * kmToDeg * Math.cos(center[1] * Math.PI / 180);
        const randLat = center[1] + (Math.random() * 2 - 1) * kmToDeg;
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const streetNames = ["Main St", "Oak Ave", "Maple Rd", "Washington Blvd", "Park Lane", "Market St"];
        const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
        const streetNum = Math.floor(Math.random() * 1000) + 1;
        
        // Get a city name based on approximate region
        let cityState = "Anytown, US";
        
        if (randLat > 40 && randLng < -70) cityState = "Boston, MA";
        else if (randLat > 40 && randLng < -80) cityState = "New York, NY";
        else if (randLat > 38 && randLng < -75) cityState = "Washington, DC";
        else if (randLat > 33 && randLng < -80) cityState = "Atlanta, GA";
        else if (randLat > 25 && randLng < -80) cityState = "Miami, FL";
        else if (randLat > 41 && randLng < -87) cityState = "Chicago, IL";
        else if (randLat > 29 && randLng < -95) cityState = "Houston, TX";
        else if (randLat > 32 && randLng < -97) cityState = "Dallas, TX";
        else if (randLat > 33 && randLng < -112) cityState = "Phoenix, AZ";
        else if (randLat > 37 && randLng < -122) cityState = "San Francisco, CA";
        else if (randLat > 34 && randLng < -118) cityState = "Los Angeles, CA";
        else if (randLat > 47 && randLng < -122) cityState = "Seattle, WA";
        
        randomLocations.push({
          id: `loc${i}`,
          name: `${query} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          address: `${streetNum} ${streetName}, ${cityState}`,
          coordinates: [randLng, randLat],
          category
        });
      }
      
      return randomLocations;
    };
    
    setLocations(generateLocations());
  }, [query, userCoordinates, searchRadius]);

  // Start tracking user's location
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation services.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTrackingLocation(true);
    
    // Clear any existing watch
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
    }
    
    // Set up continuous location watching
    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserCoordinates(newCoords);
        
        // Update user marker on map if it exists
        if (map.current && userMarker.current) {
          userMarker.current.setLngLat(newCoords);
        }
        
        // If we're actively tracking, center map on user
        if (isTrackingLocation && map.current) {
          map.current.flyTo({
            center: newCoords,
            duration: 1000
          });
        }
      },
      (error) => {
        console.error("Error watching position:", error);
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive"
        });
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  };
  
  // Stop tracking user's location
  const stopLocationTracking = () => {
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    setIsTrackingLocation(false);
  };

  // Get initial user's location
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
    
    // Cleanup location tracking on unmount
    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
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
          zoom: userCoordinates ? 12 : 3
        });
        
        // Add navigation control
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Add user location marker if available
          if (userCoordinates) {
            userMarker.current = new mapboxgl.default.Marker({ 
              color: '#3b82f6',
              element: createPulsingDot()
            })
              .setLngLat(userCoordinates)
              .setPopup(new mapboxgl.default.Popup().setHTML('<h3>Your Location</h3>'))
              .addTo(map.current);
          }
          
          // Add location markers
          locations.forEach(location => {
            // Choose marker color based on category
            let markerColor = '#ef4444'; // default red
            if (location.category === 'restaurant') markerColor = '#f97316'; // orange
            else if (location.category === 'shop') markerColor = '#84cc16'; // lime
            else if (location.category === 'park') markerColor = '#22c55e'; // green
            else if (location.category === 'business') markerColor = '#3b82f6'; // blue
            else if (location.category === 'entertainment') markerColor = '#8b5cf6'; // purple
            
            const marker = new mapboxgl.default.Marker({ color: markerColor })
              .setLngLat(location.coordinates)
              .setPopup(
                new mapboxgl.default.Popup({
                  offset: 25,
                  closeButton: false
                }).setHTML(
                  `<div>
                    <h3 class="font-medium text-sm">${location.name}</h3>
                    <p class="text-xs text-gray-500">${location.address}</p>
                    <p class="text-xs text-gray-400 mt-1">Category: ${location.category}</p>
                  </div>`
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
            
            map.current.fitBounds(bounds, { padding: 70 });
          }
          
          // Add search radius circle if we have user coordinates
          if (userCoordinates) {
            addSearchRadiusCircle(userCoordinates, searchRadius);
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        toast({
          title: "Map initialization error",
          description: "Could not initialize map. Please check your token and try again.",
          variant: "destructive"
        });
      }
    };
    
    // Create pulsing dot for user location
    const createPulsingDot = () => {
      const el = document.createElement('div');
      el.className = 'pulsing-dot';
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 0 rgba(59, 130, 246, 0.4)';
      el.style.animation = 'pulse 2s infinite';
      
      // Add pulse animation style
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `;
      document.head.appendChild(style);
      
      return el;
    };
    
    // Add search radius circle to map
    const addSearchRadiusCircle = (center: [number, number], radiusKm: number) => {
      if (!map.current || !map.current.getSource('search-radius')) {
        // Convert radius from km to meters
        const radiusMeters = radiusKm * 1000;
        
        if (map.current.getSource('search-radius')) {
          map.current.removeLayer('search-radius-fill');
          map.current.removeLayer('search-radius-border');
          map.current.removeSource('search-radius');
        }
        
        // Create a GeoJSON source with the circle
        map.current.addSource('search-radius', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: center
            },
            properties: {
              radius: radiusMeters
            }
          }
        });
        
        // Add fill layer
        map.current.addLayer({
          id: 'search-radius-fill',
          type: 'circle',
          source: 'search-radius',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#3b82f6',
            'circle-opacity': 0.1,
            'circle-radius-transition': { duration: 500 }
          }
        });
        
        // Add border layer
        map.current.addLayer({
          id: 'search-radius-border',
          type: 'circle',
          source: 'search-radius',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#3b82f6',
            'circle-opacity': 0,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#3b82f6',
            'circle-stroke-opacity': 0.4,
            'circle-radius-transition': { duration: 500 }
          }
        });
      } else {
        // Update existing source with new radius
        map.current.getSource('search-radius').setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: center
          },
          properties: {
            radius: radiusKm * 1000
          }
        });
      }
    };
    
    initializeMap();
    
    return () => {
      // Clean up map and markers when component unmounts
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (userMarker.current) {
        userMarker.current.remove();
        userMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapToken, locations, userCoordinates]);
  
  // Update search radius circle when user coordinates or search radius changes
  useEffect(() => {
    if (!map.current || !userCoordinates || !mapLoaded) return;
    
    const updateSearchRadiusCircle = () => {
      if (map.current.getSource('search-radius')) {
        map.current.getSource('search-radius').setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: userCoordinates
          },
          properties: {
            radius: searchRadius * 1000
          }
        });
      } else {
        // Add circle if it doesn't exist
        map.current.addSource('search-radius', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: userCoordinates
            },
            properties: {
              radius: searchRadius * 1000
            }
          }
        });
        
        // Add fill layer
        map.current.addLayer({
          id: 'search-radius-fill',
          type: 'circle',
          source: 'search-radius',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#3b82f6',
            'circle-opacity': 0.1
          }
        });
        
        // Add border layer
        map.current.addLayer({
          id: 'search-radius-border',
          type: 'circle',
          source: 'search-radius',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#3b82f6',
            'circle-opacity': 0,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#3b82f6',
            'circle-stroke-opacity': 0.4
          }
        });
      }
    };
    
    // Wait for map style to be loaded
    if (map.current.isStyleLoaded()) {
      updateSearchRadiusCircle();
    } else {
      map.current.once('style.load', updateSearchRadiusCircle);
    }
  }, [userCoordinates, searchRadius, mapLoaded]);

  // If still loading
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
                toast({
                  title: "Token saved",
                  description: "Your Mapbox token has been saved."
                });
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-medium">
          Map results for "{query}"
        </h2>
        <div className="flex gap-2">
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
          
          <Button 
            variant={isTrackingLocation ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isTrackingLocation) {
                stopLocationTracking();
              } else {
                startLocationTracking();
              }
            }}
            className="flex items-center gap-2"
          >
            <Compass className={`h-4 w-4 ${isTrackingLocation ? 'animate-pulse' : ''}`} />
            <span>{isTrackingLocation ? "Tracking" : "Track Me"}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset map and regenerate locations
              if (map.current && locations.length > 0) {
                // Clear old markers
                markers.current.forEach(marker => marker.remove());
                markers.current = [];
                
                // Regenerate locations by forcing a state update
                setLocations([]);
                setTimeout(() => {
                  if (query) {
                    // This will trigger the useEffect to generate new locations
                    setSearchRadius(prev => prev === 5 ? 5.1 : 5);
                  }
                }, 50);
                
                toast({
                  title: "Refreshed results",
                  description: "Map results have been refreshed.",
                });
              }
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm mr-2">Search Radius: {searchRadius} km</span>
          <input
            type="range"
            min="1"
            max="20"
            value={searchRadius}
            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
        <span className="text-xs text-gray-500">
          {locations.length} results found
        </span>
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
                className="p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm cursor-pointer transition-all"
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
