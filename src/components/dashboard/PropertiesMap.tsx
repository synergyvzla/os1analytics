import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 28.5383,
  lng: -81.3792,
};

const mapOptions = {
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  zoom: 9,
  styles: [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#000000" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e9e9e9" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }]
    }
  ]
};

interface Property {
  address_latitude: number | null;
  address_longitude: number | null;
  address_formattedStreet: string | null;
  combined_score: number | null;
}

interface PropertiesMapProps {
  properties: Property[] | undefined;
  center: { lat: number; lng: number };
  zoom: number;
}

const getMarkerIcon = (score: number | null) => {
  let color = '#ea384c'; // Default rojo para score 1
  if (score === 2) {
    color = '#F97316'; // Naranja para score 2
  } else if (score === 3) {
    color = '#008f39'; // Verde para score 3
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.9,
    strokeWeight: 1,
    strokeColor: '#ffffff',
    scale: 10,
  };
};

const Legend = () => (
  <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-sm font-semibold mb-2">Leyenda</h3>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#ea384c]" />
        <span className="text-xs">Alto riesgo (Score 1)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#F97316]" />
        <span className="text-xs">Riesgo medio (Score 2)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#008f39]" />
        <span className="text-xs">Bajo riesgo (Score 3)</span>
      </div>
    </div>
  </div>
);

export const PropertiesMap = ({ properties, center, zoom }: PropertiesMapProps) => {
  const markers = useMemo(() => {
    return properties?.map((property, index) => ({
      position: {
        lat: property.address_latitude || 0,
        lng: property.address_longitude || 0,
      },
      title: property.address_formattedStreet || `Property ${index + 1}`,
      icon: getMarkerIcon(property.combined_score),
    })) || [];
  }, [properties]);

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey="AIzaSyC2q-Pl2npZHP0T33HBbZpstTJE3UDWPog">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
        >
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker.position}
              title={marker.title}
              icon={marker.icon}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      <Legend />
    </div>
  );
};