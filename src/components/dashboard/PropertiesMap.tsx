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
}

interface PropertiesMapProps {
  properties: Property[] | undefined;
  center: { lat: number; lng: number };
  zoom: number;
}

export const PropertiesMap = ({ properties, center, zoom }: PropertiesMapProps) => {
  const markers = useMemo(() => {
    return properties?.map((property, index) => ({
      position: {
        lat: property.address_latitude || 0,
        lng: property.address_longitude || 0,
      },
      title: property.address_formattedStreet || `Property ${index + 1}`,
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
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};