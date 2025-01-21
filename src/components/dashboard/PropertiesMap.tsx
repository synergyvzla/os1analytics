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
  // Define el color según el score
  let color = '#ea384c'; // Default rojo para score 1
  if (score === 2) {
    color = '#F97316'; // Amarillo para score 2
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
  );
};