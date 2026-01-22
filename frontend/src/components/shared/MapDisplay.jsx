import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { REACT_APP_GOOGLE_MAPS_API_KEY } from '../../utils/mapKey';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  border: '1px solid #d1d5db'
};

const MapDisplay = ({ latitude, longitude, address }) => {
  const center = {
    lat: latitude,
    lng: longitude
  };

  // Check if API key is available
  const hasApiKey = REACT_APP_GOOGLE_MAPS_API_KEY && REACT_APP_GOOGLE_MAPS_API_KEY.trim() !== '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: REACT_APP_GOOGLE_MAPS_API_KEY,
    language: 'th', // Set language to Thai
    region: 'TH',   // Set region to Thailand
    // skip: !hasApiKey // Skip loading if API key is not available
  });

  const onLoad = useCallback(function callback(map) {
    // No action needed for read-only map
  }, []);

  const onUnmount = useCallback(function callback(map) {
    // No action needed for read-only map
  }, []);

  const openInGoogleMaps = () => {
    if (latitude && longitude) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const copyCoordinates = () => {
    if (latitude && longitude) {
      const coordsText = `${latitude},${longitude}`;
      navigator.clipboard.writeText(coordsText).then(() => {
        alert('คัดลอกพิกัดเรียบร้อย: ' + coordsText);
      });
    }
  };

  return (
    <div className="w-full">
      {!hasApiKey ? (
        <div className="w-full h-72 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 text-center">
          <div className="mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">ไม่สามารถโหลดแผนที่ได้</p>
          <p className="text-sm text-gray-400">ยังไม่ได้ตั้งค่า Google Maps API Key</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 w-full">
            <div className="text-sm text-gray-700 break-words mb-1">
              <strong>ที่อยู่:</strong> {address || 'ไม่ระบุ'}
            </div>
            <div className="text-sm text-gray-700">
              <strong>พิกัด:</strong> {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </div>
          </div>
        </div>
      ) : isLoaded ? (
        <div>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              zoomControl: true,
              language: 'th', // Language for map controls
              region: 'TH',   // Region for map
              gestureHandling: 'auto' // Allow interaction but keep it simple
            }}
          >
            <Marker
              position={center}
              icon={{
                url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%2310B981' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
          </GoogleMap>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-700 break-words mb-1">
              <strong>ที่อยู่:</strong> {address || 'ไม่ระบุ'}
            </div>
            <div className="text-sm text-gray-700">
              <strong>พิกัด:</strong> {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openInGoogleMaps}
                className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
              >
                เปิดใน Google Maps
              </button>
              <button
                type="button"
                onClick={copyCoordinates}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
              >
                คัดลอกพิกัด
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-72 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">กำลังโหลดแผนที่...</p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;