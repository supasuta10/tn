import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { REACT_APP_GOOGLE_MAPS_API_KEY } from '../../utils/mapKey';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '1px solid #d1d5db'
};

// Default to Thailand's center coordinates
const defaultCenter = {
  lat: 15.8700,
  lng: 100.9925
};

const MapPicker = ({ onLocationSelect, initialAddress = '', initialLat = null, initialLng = null }) => {
  const [address, setAddress] = useState(initialAddress);
  const [selectedPosition, setSelectedPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: REACT_APP_GOOGLE_MAPS_API_KEY,
    language: 'th', // Set language to Thai
    region: 'TH'    // Set region to Thailand
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setSelectedPosition({ lat, lng });

    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setAddress(address);
        onLocationSelect({ address, latitude: lat, longitude: lng });
      } else {
        console.error('Geocoder failed due to: ' + status);
        // If geocoding fails, still allow user to set coordinates
        onLocationSelect({ address: `(${lat}, ${lng})`, latitude: lat, longitude: lng });
      }
    });
  }, [onLocationSelect]);

  // Handle search function if needed
  const handleSearch = (searchAddress) => {
    // Handle both direct string input and event object
    const addressToSearch = typeof searchAddress === 'string' ? searchAddress : address;

    if (addressToSearch && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressToSearch }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          setSelectedPosition({ lat, lng });
          setAddress(results[0].formatted_address);
          onLocationSelect({
            address: results[0].formatted_address,
            latitude: lat,
            longitude: lng
          });

          // If map is loaded, pan to the selected location
          if (map) {
            map.panTo({ lat, lng });
          }
        } else {
          console.error('Geocoding failed: ' + status);
        }
      });
    }
  };

  return (
    <div className="w-full">
      {/* Location name input field first */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ชื่อสถานที่จัดงาน"
          className="w-full input input-bordered border-green-200 map-search-input mb-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e.target.value);
            }
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              handleSearch(address);
            }}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* Then the map */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPosition || defaultCenter}
          zoom={selectedPosition ? 15 : 7}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            language: 'th', // Language for map controls
            region: 'TH',   // Region for map
          }}
        >
          {selectedPosition && (
            <Marker
              position={selectedPosition}
              icon={{
                url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%2310B981' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">กำลังโหลดแผนที่...</p>
        </div>
      )}

      {selectedPosition && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-700 mb-2">ตำแหน่งที่เลือก:</h4>
          <p className="text-sm text-gray-700 break-words">{address}</p>
          <p className="text-xs text-gray-500 mt-1">
            ละติจูด: {selectedPosition.lat.toFixed(6)}, ลองจิจูด: {selectedPosition.lng.toFixed(6)}
          </p>

          {/* Google Maps and Share Options */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedPosition.lat},${selectedPosition.lng}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              เปิดใน Google Maps
            </button>
            <button
              type="button"
              onClick={() => {
                const coordsText = `${selectedPosition.lat},${selectedPosition.lng}`;
                navigator.clipboard.writeText(coordsText).then(() => {
                  // Optional: Show a confirmation message
                  alert('คัดลอกพิกัดเรียบร้อย: ' + coordsText);
                });
              }}
              className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
            >
              คัดลอกพิกัด
            </button>
            <button
              type="button"
              onClick={() => {
                // Create a Google Maps URL that works in LINE
                const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`ตำแหน่งที่อยู่จัดงาน: ${address} | แผนที่: https://www.google.com/maps/search/?api=1&query=${selectedPosition.lat},${selectedPosition.lng}`)}`;
                window.open(lineShareUrl, '_blank');
              }}
              className="btn btn-sm bg-green-500 text-white hover:bg-green-600 flex items-center"
            >
              <span className="mr-1">💬</span>
              แชร์ไป LINE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;