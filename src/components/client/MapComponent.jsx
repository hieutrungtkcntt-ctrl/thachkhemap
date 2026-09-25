import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { communeBoundary, villagesData } from '../../data';

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function isPointInPolygon(point, polygon) {
  if (!point || !polygon || !Array.isArray(polygon)) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getVillageNameByCoord(lat, lng) {
  for (let v of villagesData) {
    if (v.boundary && v.boundary.length > 0) {
      if (isPointInPolygon([lat, lng], v.boundary)) {
        return v.name;
      }
    }
  }
  return "Khu vực trung tâm / Địa bàn xã Thạch Khê";
}

function MapClickPicker({ isPicking, onPickLocation }) {
  useMapEvents({
    click(e) {
      if (!isPicking) return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (communeBoundary && communeBoundary.length > 0) {
        const insideCommune = isPointInPolygon([lat, lng], communeBoundary);
        if (!insideCommune) {
          alert('⚠️ Điểm bạn vừa chọn nằm NGOÀI ranh giới xã Thạch Khê! Vui lòng chọn điểm nằm bên trong đường viền vàng.');
          return;
        }
      }

      onPickLocation(lat, lng);
    },
  });
  return null;
}

const createPinIcon = (loc, isSelected) => {
  let emoji = '📍';
  let bgColor = '#3b82f6';

  switch (loc.type) {
    case 'admin': emoji = '🏛️'; bgColor = '#2563eb'; break;
    case 'security': emoji = '🛡️'; bgColor = '#1e3a8a'; break;
    case 'culture': emoji = '🏮'; bgColor = '#0284c7'; break;
    case 'health': emoji = '🏥'; bgColor = '#dc2626'; break;
    case 'school': emoji = '🏫'; bgColor = '#16a34a'; break;
    case 'temple': emoji = '🛕'; bgColor = '#d97706'; break;
    case 'tourism': emoji = '🏖️'; bgColor = '#0284c7'; break;
    case 'restaurant': emoji = '🍽️'; bgColor = '#ea580c'; break;
    case 'hotel': emoji = '🏨'; bgColor = '#7c3aed'; break;
    case 'eco': emoji = '🌳'; bgColor = '#059669'; break;
    default: emoji = '📍'; bgColor = '#3b82f6';
  }

  const size = isSelected ? '40px' : '34px';
  const border = isSelected ? '3px solid #f59e0b' : `2px solid ${bgColor}`;

  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div 
        title="${loc.name}"
        style="
          background-color: white;
          border: ${border};
          width: ${size};
          height: ${size};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '18px' : '15px'};
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        "
      >${emoji}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

const getReportIcon = (status) => {
  const isDone = status === 'Đã hoàn thành';
  const bg = isDone ? '#10b981' : '#dc2626';
  const emoji = isDone ? '✅' : '🚨';

  return L.divIcon({
    className: 'report-pin-marker',
    html: `
      <div style="
        background-color: ${bg};
        border: 3px solid #ffffff;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      ">${emoji}</div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

const gpsPinIcon = L.divIcon({
  className: 'gps-user-marker',
  html: `
    <div style="
      background-color: #2563eb;
      border: 3px solid white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(37,99,235,0.8);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function MapComponent({ 
  defaultCenter, 
  currentCenter, 
  mapZoom, 
  mapStyle, 
  setMapStyle, 
  isPickingMap, 
  setIsPickingMap, 
  setIsReportModalOpen, 
  setReportForm, 
  setPickedLatLng, 
  setDetectedLocationName, 
  pickedLatLng, 
  userLocation, 
  routeCoordinates, 
  selectedVillage, 
  filteredLocations, 
  selectedLocation, 
  onSelectLocation, 
  onDirectGPSRoute, 
  getCategoryName 
}) {
  return (
    <div className="flex-1 bg-slate-200 relative flex items-center justify-center min-h-[500px] z-0">
      {isPickingMap && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-xs animate-bounce flex items-center gap-2">
          <span>👉 Click trong ranh giới viền vàng để chọn điểm sự cố!</span>
          <button 
            onClick={() => { setIsPickingMap(false); setIsReportModalOpen(true); }}
            className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[11px]"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-md border border-slate-200">
        <button 
          onClick={() => setMapStyle('voyager')} 
          className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${mapStyle === 'voyager' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          🗺️ Bản đồ màu
        </button>
        <button 
          onClick={() => setMapStyle('satellite')} 
          className={`px-2.5 py-1 text-[11px] rounded font-medium transition ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          🛰️ Vệ tinh Esri
        </button>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={mapZoom} 
        minZoom={12}
        maxZoom={19}
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%', cursor: isPickingMap ? 'crosshair' : 'grab' }}
      >
        <MapViewController center={currentCenter} zoom={mapZoom} />

        <MapClickPicker 
          isPicking={isPickingMap} 
          onPickLocation={(lat, lng) => {
            const fixedLat = lat.toFixed(6);
            const fixedLng = lng.toFixed(6);
            const locName = getVillageNameByCoord(lat, lng);

            setReportForm(prev => ({ ...prev, lat: fixedLat, lng: fixedLng }));
            setPickedLatLng([fixedLat, fixedLng]);
            setDetectedLocationName(locName);
            setIsPickingMap(false);
            setIsReportModalOpen(true);
          }} 
        />

        {pickedLatLng && (
          <Marker position={pickedLatLng} icon={getReportIcon('Chờ xử lý')}>
            <Popup>
              <div className="p-1 min-w-[160px]">
                <div className="font-bold text-red-600 text-xs">📍 Vị trí sự cố đã chọn</div>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={gpsPinIcon}>
            <Popup><div className="text-xs font-bold text-blue-900">📍 Vị trí thiết bị của bạn</div></Popup>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }} />
        )}

        {mapStyle === 'satellite' ? (
          <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
        ) : (
          <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maxZoom={19} />
        )}
        
        {communeBoundary && communeBoundary.length > 0 && (
          <Polygon positions={communeBoundary} pathOptions={{ color: mapStyle === 'satellite' ? '#facc15' : '#2563eb', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.05 }} />
        )}

        {selectedVillage && selectedVillage.boundary && (
          <Polygon positions={selectedVillage.boundary} pathOptions={{ color: '#f59e0b', weight: 3, fillColor: selectedVillage.color || '#3b82f6', fillOpacity: 0.45 }}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h4 className="font-bold text-blue-900 text-xs">📍 {selectedVillage.name}</h4>
                <p className="text-[11px] text-slate-600">Số hộ: {selectedVillage.households} | Khẩu: {selectedVillage.population}</p>
              </div>
            </Popup>
          </Polygon>
        )}

        {filteredLocations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]} 
              icon={createPinIcon(loc, isSelected)}
              eventHandlers={{ click: () => onSelectLocation(loc) }}
            >
              <Popup>
                <div className="p-1 min-w-[180px] flex flex-col gap-1.5">
                  <div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded">{getCategoryName(loc.type)}</span>
                    <h4 className="font-bold text-blue-900 text-xs mt-1">{loc.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{loc.info}</p>
                  </div>
                  <button 
                    onClick={() => onDirectGPSRoute(loc.lat, loc.lng, loc)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold py-1 px-2 rounded flex items-center justify-center gap-1 transition"
                  >
                    🧭 Chỉ đường đường bộ (GPS)
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}