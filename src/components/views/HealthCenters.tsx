import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Navigation, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api/apiService';
import { twkService } from '../../services/twk/twkService'; 
import type { HealthCenter } from '../../types/healthCenter';
import { colors } from '../../styles/colors';
import { env } from '../../config/env';
import { useAnalytics

 } from '../../hooks/useAnalytics';
const HealthCenters: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [healthCenter, setHealthCenter] = useState<HealthCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRTL = document.documentElement.dir === 'rtl' || document.dir === 'rtl';
  
  // Default coordinates (Riyadh)
  const defaultCoordinates = { lat: 24.7136, lng: 46.6753 };
  const { trackPageView, trackClick } = useAnalytics(); // Add analytics hook
  
    useEffect(() => {
      trackPageView("HealthCenters", "/health-centers");
    }, [trackPageView]);
  // Fetch user location and health center data
  useEffect(() => {
    const getUserLocationAndCenter = async () => {
      setLoading(true);
      
      try {
        // Get user location from TWK service (handles both real and mock)
        let userCoordinates = { ...defaultCoordinates };
        
        try {
          const locationResponse = await twkService.getUserLocation();
          
          if (locationResponse.success && locationResponse.result.data) {
            const { latitude, longitude } = locationResponse.result.data;
            userCoordinates = { lat: latitude, lng: longitude };
            console.log("Got location from TWK service:", userCoordinates);
          }
        } catch (locationError) {  
          console.warn("Using default location");
        }
        
        setUserLocation(userCoordinates);
        
        // Get health center data
        const response = await apiService.getNearestHealthCenter({
          latitude: userCoordinates.lat,
          longitude: userCoordinates.lng
        });
        
        if (response.success && response.data) {
          setHealthCenter(response.data);
        } else {
          console.error("Failed to get health center data:", response);
          setError(t('healthCenters.errors.loadFailed'));
        }
      } catch (error) {
        console.error('Error loading health center data:', error);
        setError(t('healthCenters.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    getUserLocationAndCenter();
  }, [t]);
  
  // Handle navigation to maps app
  const handleOpenDirections = () => {
    if (!healthCenter || !userLocation) return;
    
    // Create maps URL with coordinates
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${healthCenter.location.latitude},${healthCenter.location.longitude}`;
    
    // Use twkService to open URL (handles both real and mock)
    twkService.openUrl(mapsUrl, 1);
  };
  
  // Handle phone call
  const handleCall = () => {
    if (!healthCenter) return;
    
    const telUrl = `tel:${healthCenter.phone}`;
    
    // Use twkService to open URL (handles both real and mock)
    twkService.openUrl(telUrl, 2);
  };
  
  return (
    <div className={`${colors.background.primary} rounded-lg shadow-sm p-6`}>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full hover:${colors.background.tertiary} transition-colors mr-2`}
          aria-label={t("actions.back")}
        >
          {isRTL ? (
            <ArrowRight size={20} className={colors.text.primary} />
          ) : (
            <ArrowLeft size={20} className={colors.text.primary} />
          )}
        </button>
        <h2 className={`text-xl font-bold ${colors.text.primary}`}>
          {t("healthCenters.title")}
        </h2>
      </div>

      {loading ? (
        <div className={`${colors.background.secondary} rounded-lg p-6 mb-6 flex justify-center items-center min-h-[200px]`}>
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin dark:border-blue-800 dark:border-t-blue-400"></div>
        </div>
      ) : error ? (
        <div className={`${colors.background.secondary} rounded-lg p-6 mb-6 text-center`}>
          <AlertCircle size={32} className="mx-auto mb-4 text-red-500" />
          <p className={colors.text.secondary}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : healthCenter ? (
        <>
          {/* Map section */}
          <div className={`${colors.background.tertiary} rounded-lg h-48 mb-6 relative overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={32} className="text-red-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className={`absolute bottom-3 right-3 ${colors.background.primary} p-2 rounded-lg shadow text-sm font-medium ${colors.text.primary}`}>
              {healthCenter.name}
            </div>
          </div>

          {/* Health center details */}
          <div className={`${colors.background.primary} ${colors.border.primary} border rounded-lg p-4 mb-6`}>
            <div className="flex justify-between items-start">
              <h3 className={`font-bold text-lg ${colors.text.primary}`}>
                {healthCenter.name}
              </h3>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                {healthCenter.distance} {t('healthCenters.km')}
              </span>
            </div>

            <p className={colors.text.secondary}>{healthCenter.address}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <span className={`text-xs ${colors.text.tertiary}`}>{t('healthCenters.workingHours')}:</span>
                <p className={`text-sm ${colors.text.primary}`}>
                  {healthCenter.workingHours}
                </p>
              </div>
              <div>
                <span className={`text-xs ${colors.text.tertiary}`}>{t('healthCenters.phone')}:</span>
                <p className={`text-sm ${colors.text.primary}`}>
                  {healthCenter.phone}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span className={`text-xs ${colors.text.tertiary} block mb-1`}>
                {t('healthCenters.availableServices')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {healthCenter.services && Array.isArray(healthCenter.services) ? (
                  healthCenter.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded"
                    >
                      {t(`healthCenters.services.${service}`)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">
                    {t('healthCenters.noServices')}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleOpenDirections}
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                <Navigation size={16} className={isRTL ? "ml-1" : "mr-1"} />
                {t('healthCenters.directions')}
              </button>
              <button
                onClick={handleCall}
                className={`flex items-center justify-center ${colors.background.secondary} ${colors.text.primary} py-2 px-4 rounded-md hover:opacity-90 transition-opacity`}
              >
                <Phone size={16} className={isRTL ? "ml-1" : "mr-1"} />
                {t('healthCenters.call')}
              </button>
            </div>
          </div>

          <div className={`text-center text-sm ${colors.text.tertiary}`}>
            {t('healthCenters.assignedCenter')}
          </div>
        </>
      ) : (
        <div className={`${colors.background.secondary} rounded-lg p-6 mb-6 text-center`}>
          <AlertCircle size={32} className="mx-auto mb-4 text-yellow-500" />
          <p className={colors.text.secondary}>{t('healthCenters.errors.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default HealthCenters;
