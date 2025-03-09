import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { twkService } from '../services/twk/twkService';
import { apiService } from '../services/api/apiService';
import { HealthCenterSkeleton } from './common/skeletons/HealthCenterSkeleton';
import type { Location, HealthCenter } from '../types/healthCenter';
import 'leaflet/dist/leaflet.css';

// Custom markers for map
const userIcon = new Icon({
  iconUrl: '/icons/user-location.svg',
  iconSize: [32, 32],
});

const centerIcon = new Icon({
  iconUrl: '/icons/health-center.svg',
  iconSize: [32, 32],
});

// Map bounds adjuster component
const MapBoundsAdjuster: React.FC<{
  userLocation: Location;
  centerLocation: Location;
}> = ({ userLocation, centerLocation }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = new LatLngBounds(
      [userLocation.latitude, userLocation.longitude],
      [centerLocation.latitude, centerLocation.longitude]
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [userLocation, centerLocation, map]);

  return null;
};

const HealthCenters: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [healthCenter, setHealthCenter] = useState<HealthCenter | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = await twkService.getUserLocation();
      setUserLocation(location);
      
      if (location) {
        await getNearestHealthCenter(location);
      }
    } catch (err) {
      console.error('Error getting user location:', err);
      setError(t('errors.locationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getNearestHealthCenter = async (location: Location) => {
    try {
      const response = await apiService.getNearestHealthCenter(location);
      if (response.success && response.data) {
        setHealthCenter(response.data);
      } else {
        setError(t('errors.healthCenterFailed'));
      }
    } catch (err) {
      console.error('Failed to get health center:', err);
      setError(t('errors.unexpected'));
    }
  };

  const handleOpenDirections = async () => {
    if (!healthCenter) return;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
      healthCenter.location.latitude
    },${healthCenter.location.longitude}`;

    const opened = await twkService.openUrl(mapsUrl, 1); // 1 is UrlType.http
    if (!opened) {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleCall = async () => {
    if (!healthCenter?.phone) return;
    
    const telUrl = `tel:${healthCenter.phone}`;
    const opened = await twkService.openUrl(telUrl, 2); // 2 is UrlType.tel
    if (!opened) {
      window.location.href = telUrl;
    }
  };

  if (loading) {
    return <HealthCenterSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <h3 className="font-bold mb-2">{t('errors.title')}</h3>
        <p>{error}</p>
        <button
          onClick={getUserLocation}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {t('actions.retry')}
        </button>
      </div>
    );
  }

  if (!userLocation || !healthCenter) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('alerts.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{healthCenter.name}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {t('healthCenter.distance', { distance: healthCenter.distance })} km
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-500">
              {t('healthCenter.workingHours')}:
            </span>
            <p className="text-sm">{healthCenter.workingHours}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">
              {t('healthCenter.phone')}:
            </span>
            <p className="text-sm">{healthCenter.phone}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleOpenDirections}
            className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {t('actions.directions')}
          </button>
          <button
            onClick={handleCall}
            className="flex items-center justify-center bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
          >
            {t('actions.call')}
          </button>
        </div>
      </div>

      <div className="h-[400px] rounded-lg overflow-hidden">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>{t('healthCenter.yourLocation')}</Popup>
          </Marker>

          <Marker
            position={[healthCenter.location.latitude, healthCenter.location.longitude]}
            icon={centerIcon}
          >
            <Popup>{healthCenter.name}</Popup>
          </Marker>

          <MapBoundsAdjuster
            userLocation={userLocation}
            centerLocation={healthCenter.location}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default HealthCenters;