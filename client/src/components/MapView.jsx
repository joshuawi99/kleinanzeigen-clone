import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix für Standard Marker Icon (wegen Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Beispiel Koordinaten für Städte (statt echte Geokodierung)
const plzToCoords = {
  '50667': [50.9381, 6.9603],   // Köln Innenstadt
  '51503': [50.9403, 7.1587],   // Rösrath
  // Füge weitere PLZ -> [lat, lon] hinzu, oder nutze Geokodierungs-API
};

function MapView({ ads }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const pos = ads
      .map(ad => {
        const coords = plzToCoords[ad.zipCode];
        if (coords) return { ...ad, coords };
        return null;
      })
      .filter(Boolean);
    setPositions(pos);
  }, [ads]);

  return (
    <MapContainer center={[50.94, 7.0]} zoom={11} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap-Mitwirkende'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.map(ad => (
        <Marker key={ad._id} position={ad.coords}>
          <Popup>
            <strong>{ad.title}</strong><br />
            {ad.price} €<br />
            <a href={`/ads/${ad._id}`} target="_blank" rel="noreferrer">Details</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
