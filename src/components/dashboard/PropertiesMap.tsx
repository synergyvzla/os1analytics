import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useMemo, useState } from 'react';

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
  address_street: string | null;
  owner_fullName: string | null;
  valuation_estimatedValue: number | null;
  combined_score: number | null;
  count_gusts: number | null;
  top_gust_1: number | null;
}

interface PropertiesMapProps {
  properties: Property[] | undefined;
  center: { lat: number; lng: number };
  zoom: number;
}

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

const formatCurrency = (value: number | null) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export const PropertiesMap = ({ properties, center, zoom }: PropertiesMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const markers = useMemo(() => {
    if (!window.google) return [];

    const getMarkerIcon = (score: number | null) => {
      let color = '#ea384c'; // Default rojo para score 1
      if (score === 2) {
        color = '#F97316'; // Naranja para score 2
      } else if (score === 3) {
        color = '#008f39'; // Verde para score 3
      }

      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 10,
      };
    };

    return properties?.map((property) => ({
      position: {
        lat: property.address_latitude || 0,
        lng: property.address_longitude || 0,
      },
      title: property.address_formattedStreet || '',
      icon: getMarkerIcon(property.combined_score),
      property: property,
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
              onClick={() => setSelectedProperty(marker.property)}
            />
          ))}
          
          {selectedProperty && (
            <InfoWindow
              position={{
                lat: selectedProperty.address_latitude || 0,
                lng: selectedProperty.address_longitude || 0
              }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-sm bg-blue-100 p-1 rounded mb-2">
                  {selectedProperty.owner_fullName}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>{selectedProperty.address_street}</p>
                  <p>Valor estimado: {formatCurrency(selectedProperty.valuation_estimatedValue)}</p>
                  <p>Puntuación de techo: {selectedProperty.combined_score}</p>
                  <p className="text-xs text-gray-600">
                    Crítico: {selectedProperty.count_gusts} ráfagas intensas, 
                    máxima de {selectedProperty.top_gust_1} mph.
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <Legend />
    </div>
  );
};