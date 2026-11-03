import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const THACH_KHE_CENTER = [18.3950, 105.9550];

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const targetCenter = (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) 
      ? center 
      : THACH_KHE_CENTER;
    
    map.flyTo(targetCenter, zoom || 15, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Controller tự động thu/phóng ôm trọn đoạn đường giữa vị trí người dùng và điểm đến khi bật chỉ đường
function RouteBoundsController({ userLocation, selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const bounds = L.latLngBounds(
        [userLocation[0], userLocation[1]], 
        [selectedLocation.lat, selectedLocation.lng]
      );
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 15,
        animate: true
      });
    }
  }, [userLocation, selectedLocation, map]);

  return null;
}

function ZoomTracker({ onZoomChange }) {
  const map = useMap();
  useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    }
  });
  return null;
}

function VillageOverviewController({ villages, enabled }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (!enabled || hasFitted.current || !Array.isArray(villages)) return;

    const points = villages
      .flatMap(v => {
        let b = v.boundary;
        if (typeof b === 'string') {
          try { b = JSON.parse(b); } catch (e) { b = []; }
        }
        return Array.isArray(b) ? b : [];
      })
      .filter(point => Array.isArray(point) && point.length >= 2 &&
        Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])));

    if (!points.length) return;

    map.fitBounds(L.latLngBounds(points), {
      padding: [32, 32],
      maxZoom: 13,
      animate: false
    });
    hasFitted.current = true;
  }, [enabled, villages, map]);

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

function parseBoundary(boundary) {
  if (!boundary) return [];
  if (Array.isArray(boundary)) return boundary;
  if (typeof boundary === 'string') {
    try {
      const parsed = JSON.parse(boundary);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Lỗi parse boundary JSON:", e);
      return [];
    }
  }
  return [];
}

function getPolygonCenter(boundary) {
    const coords = parseBoundary(boundary);
    if (coords.length === 0) return [18.3858, 105.9505];

    let latSum = 0;
    let lngSum = 0;
    let validCount = 0;
    
    coords.forEach(pt => {
        if (Array.isArray(pt) && pt.length >= 2) {
            latSum += Number(pt[0]) || 0;
            lngSum += Number(pt[1]) || 0;
            validCount++;
        }
    });

    if (validCount === 0) return [18.3858, 105.9505];
    return [latSum / validCount, lngSum / validCount];
}

function getVillageNameByCoord(lat, lng, villagesList) {
  const list = villagesList && villagesList.length > 0 ? villagesList : [];
  for (let v of list) {
    const coords = parseBoundary(v.boundary);
    if (coords.length > 0) {
      if (isPointInPolygon([lat, lng], coords)) {
        return v.name;
      }
    }
  }
  return "Khu vực trung tâm / Địa bàn xã Thạch Khê";
}

function getSingleImage(loc) {
  if (!loc) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500";

  let candidates = [];
  if (loc.images) {
    if (Array.isArray(loc.images)) candidates = [...loc.images];
    else if (typeof loc.images === 'object') candidates = Object.values(loc.images);
  }
  if (Array.isArray(loc.photos)) candidates = [...candidates, ...loc.photos];
  if (Array.isArray(loc.gallery)) candidates = [...candidates, ...loc.gallery];

  candidates = [
    ...candidates,
    loc.mediaUrl,
    loc.image,
    loc.imageUrl,
    loc.photo,
    loc.thumbnail
  ];

  for (let item of candidates) {
    if (typeof item === 'string' && item.trim() !== '') {
      const lower = item.trim().toLowerCase();
      if (lower !== 'null' && lower !== 'undefined' && !lower.endsWith('/null') && !lower.endsWith('/undefined')) {
        return item.trim();
      }
    }
    if (item && typeof item === 'object') {
      const url = (item.url || item.src || item.imageUrl || item.image || '').trim();
      if (url && url.toLowerCase() !== 'null' && url.toLowerCase() !== 'undefined') {
        return url;
      }
    }
  }

  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500";
}

function MapClickPicker({ isPicking, onPickLocation, villages, communeBoundary }) {
  useMapEvents({
    click(e) {
      if (!isPicking) return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const parsedCommuneBoundary = parseBoundary(communeBoundary);
      if (parsedCommuneBoundary.length > 0) {
        const insideCommune = isPointInPolygon([lat, lng], parsedCommuneBoundary);
        if (!insideCommune) {
          alert('⚠️ Điểm bạn vừa chọn nằm NGOÀI ranh giới xã Thạch Khê! Vui lòng chọn điểm nằm bên trong đường viền ranh giới.');
          return;
        }
      }

      onPickLocation(lat, lng);
    },
  });
  return null;
}

function LocationMarker({ loc, isSelected, isDimmed, onSelectLocation, getCategoryName, onOpenDetail, onDirectRouteCustom, isPickingMap, isVillageMode }) {
  const markerRef = useRef(null);
  const map = useMap();

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('thach_khe_saved_locs') || '[]');
      return savedList.includes(loc.id);
    } catch (e) {
      return false;
    }
  });

  const [statsCount, setStatsCount] = useState(() => {
    try {
      const customStats = JSON.parse(localStorage.getItem('thach_khe_stats') || '{}');
      if (customStats[loc.id] !== undefined) {
        return customStats[loc.id];
      }
    } catch (e) {}
    return loc.stats || Math.floor(Math.random() * 15) + 3;
  });

  useEffect(() => {
    if (isSelected && markerRef.current && !isVillageMode) {
      map.closePopup();
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 300);
    }
  }, [isSelected, map, isVillageMode]);

  if (!loc.lat || !loc.lng) return null;

  const singleImageUrl = getSingleImage(loc);
  const categoryLabel = getCategoryName ? getCategoryName(loc.type || loc.category) : 'Địa điểm';

  const handleSaveClick = (e) => {
    e.stopPropagation();
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    const newCount = nextSavedState ? statsCount + 1 : Math.max(0, statsCount - 1);
    setStatsCount(newCount);

    try {
      const savedList = JSON.parse(localStorage.getItem('thach_khe_saved_locs') || '[]');
      const updatedList = nextSavedState 
        ? [...savedList, loc.id] 
        : savedList.filter(id => id !== loc.id);
      localStorage.setItem('thach_khe_saved_locs', JSON.stringify(updatedList));

      const customStats = JSON.parse(localStorage.getItem('thach_khe_stats') || '{}');
      customStats[loc.id] = newCount;
      localStorage.setItem('thach_khe_stats', JSON.stringify(customStats));
    } catch (err) {
      console.error("Lỗi lưu localStorage:", err);
    }
  };

  const createPinIcon = (loc, isSelected, isDimmed) => {
    let emoji = '📍';
    let bgColor = '#0284c7';

    switch (loc.type || loc.category) {
      case 'admin': emoji = '🏛'; bgColor = '#2563eb'; break;
      case 'security': emoji = '🛡️'; bgColor = '#1e40af'; break;
      case 'culture': emoji = '🏮'; bgColor = '#0284c7'; break;
      case 'health': emoji = '🏥'; bgColor = '#e11d48'; break;
      case 'school': emoji = '🏫'; bgColor = '#16a34a'; break;
      case 'temple': emoji = '🛕'; bgColor = '#d97706'; break;
      case 'tourism': emoji = '🏖️'; bgColor = '#0d9488'; break;
      case 'restaurant': emoji = '🍽️'; bgColor = '#ea580c'; break;
      case 'hotel': emoji = '🏨'; bgColor = '#7c3aed'; break;
      case 'eco': emoji = '🌳'; bgColor = '#059669'; break;
      default: emoji = '📍'; bgColor = '#0284c7';
    }

    const size = isSelected ? '52px' : (isDimmed ? '22px' : '28px');
    const fontSize = isSelected ? '24px' : (isDimmed ? '10px' : '13px');
    const border = isSelected ? '4px solid #059669' : (isDimmed ? '1.5px solid #94a3b8' : `2px solid ${bgColor}`);
    const opacity = isDimmed ? '0.25' : '1';
    const transform = isSelected ? 'scale(1.4) translateY(-8px)' : 'scale(1)';
    const zIndex = isSelected ? 9999 : 1;

    return L.divIcon({
      className: isSelected ? 'custom-pin-marker selected-pin-glow' : 'custom-pin-marker',
      html: `
        <div 
          title="${loc.name}"
          style="
            background-color: #ffffff;
            border: ${border};
            width: ${size};
            height: ${size};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize};
            opacity: ${opacity};
            box-shadow: ${isSelected ? '0 12px 30px rgba(5, 150, 105, 0.7)' : '0 4px 10px rgba(15, 23, 42, 0.2)'};
            cursor: pointer;
            transform: ${transform};
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${zIndex};
          "
        >${emoji}</div>
      `,
      iconSize: [isSelected ? 52 : 28, isSelected ? 52 : 28],
      iconAnchor: [isSelected ? 26 : 14, isSelected ? 26 : 14],
      popupAnchor: [0, isSelected ? -28 : -14]
    });
  };

  return (
    <Marker 
      ref={markerRef}
      position={[loc.lat, loc.lng]} 
      icon={createPinIcon(loc, isSelected, isDimmed)}
      interactive={!isPickingMap && !isVillageMode}
      eventHandlers={{ 
        click: () => { 
          if (!isPickingMap && !isVillageMode && onSelectLocation) {
            onSelectLocation(loc); 
          }
        },
        popupclose: () => {
          if (!isPickingMap && !isVillageMode && onSelectLocation && isSelected) {
            onSelectLocation(null); 
          }
        }
      }}
    >
      {!isPickingMap && !isVillageMode && (
        <Popup>
          <style>{`
            .leaflet-popup-content-wrapper { padding: 0 !important; overflow: hidden; border-radius: 20px !important; }
            .leaflet-popup-content { margin: 0 !important; line-height: 1.4 !important; }
            .leaflet-popup-close-button { display: none !important; }
          `}</style>

          <div className="w-[300px] flex flex-col font-sans text-xs bg-white rounded-2xl overflow-hidden shadow-sm relative">
            <div className="w-full h-44 relative bg-slate-100">
              <img src={singleImageUrl} alt={loc.name} className="w-full h-full object-cover" />
              
              <button
                type="button"
                onClick={() => {
                  map.closePopup();
                  if (onSelectLocation) onSelectLocation(null);
                }}
                className="absolute top-3 right-3 w-7 h-7 bg-white/90 hover:bg-white text-slate-700 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition cursor-pointer font-bold text-xs"
                title="Đóng"
              >
                ✕
              </button>

              <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
                {loc.badge || categoryLabel}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{loc.name}</h4>
              
             <div className="space-y-1.5 text-slate-600 text-[11.5px]">
                {/* Địa chỉ / thông tin vị trí */}
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-500 shrink-0">📍</span>
                  <span className="text-blue-600 cursor-pointer font-medium leading-tight">
                    {loc.address || loc.info || loc.desc || 'Địa bàn xã Thạch Khê'} <span>, xã Thạch Khê, tỉnh Hà Tĩnh</span>
                  </span>
                </div>

                {loc.workingHours && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-500 shrink-0">🕒</span>
                    <span>{loc.workingHours}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="text-rose-500 shrink-0">🔖</span>
                  <span>{statsCount} lượt quan tâm</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mx-4" />

            <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
              <button 
                type="button"
                onClick={() => onOpenDetail && onOpenDetail(loc)}
                className="text-blue-600 hover:text-blue-700 font-extrabold text-xs tracking-wide transition cursor-pointer flex items-center gap-0.5"
              >
                <span>TÌM HIỂU THÊM</span>
                <span className="text-sm">›</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handleSaveClick}
                  title={isSaved ? "Đã lưu" : "Lưu địa điểm"}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    isSaved 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isSaved ? '❤️' : '📌'}
                </button>

                <button 
                  type="button"
                  title="Chia sẻ"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: loc.name, url: window.location.href }).catch(() => {});
                    } else {
                      alert("Đã sao chép liên kết địa điểm!");
                    }
                  }}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  ↩️
                </button>

                <button 
                  type="button"
                  onClick={() => onDirectRouteCustom && onDirectRouteCustom(loc)}
                  title="Chỉ đường"
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                >
                  🗺️
                </button>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
}

const getReportIcon = (status) => {
  const isDone = status === 'Đã hoàn thành';
  const bg = isDone ? '#059669' : '#e11d48';
  const emoji = isDone ? '✅' : '🚨';

  return L.divIcon({
    className: 'report-pin-marker',
    html: `
      <div style="
        background-color: ${bg};
        border: 2px solid #ffffff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
        cursor: pointer;
      ">${emoji}</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const gpsPinIcon = L.divIcon({
  className: 'gps-user-marker',
  html: `
    <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #0284c7; opacity: 0.35; transform: scale(1.8);"></div>
      <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(2, 132, 199, 0.5);"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function MapComponent({ 
  villages = [],
  communeBoundary = [],
  defaultCenter = THACH_KHE_CENTER, 
  currentCenter = THACH_KHE_CENTER, 
  mapZoom = 12, 
  mapStyle = 'voyager', 
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
  setRouteCoordinates,
  selectedVillage,
  onSelectVillage,
  fixedVillageOverview = false,
  filteredLocations = [], 
  selectedLocation, 
  onSelectLocation, 
  onDirectGPSRoute, 
  onOpenDetail, 
  getCategoryName,
  reports = [],
  hideVillageNames = false,
  hideLocationPins = false,
  onClearRoute 
}) {
  const [zoomLevel, setZoomLevel] = useState(mapZoom || 12);
  const [hoveredVillageKey, setHoveredVillageKey] = useState(null);

  const [routeSteps, setRouteSteps] = useState([]);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  
  const [travelMode, setTravelMode] = useState('driving');
  const [routeSummary, setRouteSummary] = useState({ distance: '', duration: '' });

  const fetchRouteByMode = async (mode, start, dest) => {
    if (!start || !dest) return;
    try {
      const [startLat, startLng] = start;
      const destLat = dest.lat;
      const destLng = dest.lng;
      
      const url = `https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        if (setRouteCoordinates) setRouteCoordinates(coords);

        const distKm = route.distance >= 1000 ? `${(route.distance / 1000).toFixed(1)} km` : `${Math.round(route.distance)} m`;
        const durationMin = Math.round(route.duration / 60);
        const durationText = durationMin >= 60 ? `${Math.floor(durationMin / 60)} giờ ${durationMin % 60} phút` : `${durationMin} phút`;
        
        setRouteSummary({ distance: distKm, duration: durationText });

        if (route.legs && route.legs[0]) {
          const steps = route.legs[0].steps || [];
          const formattedSteps = steps.map((s, idx) => ({
            id: idx,
            instruction: s.maneuver.instruction || 'Tiếp tục di chuyển',
            distance: s.distance > 1000 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`,
            name: s.name ? `trên đường ${s.name}` : ''
          }));
          setRouteSteps(formattedSteps);
        }
        setShowRoutePanel(true);
      }
    } catch (err) {
      console.error("Lỗi lấy chỉ đường OSRM:", err);
    }
  };

  const handleDirectRouteCustom = (loc) => {
    if (onSelectLocation) onSelectLocation(null); 
    const startPoint = userLocation || THACH_KHE_CENTER;
    fetchRouteByMode(travelMode, startPoint, loc);
    if (onDirectGPSRoute) onDirectGPSRoute(loc.lat, loc.lng, loc);
  };

  useEffect(() => {
    if (selectedLocation && userLocation && showRoutePanel) {
      fetchRouteByMode(travelMode, userLocation, selectedLocation);
    }
  }, [travelMode]);

  const safeCenter = (currentCenter && Array.isArray(currentCenter) && !isNaN(currentCenter[0]) && !isNaN(currentCenter[1])) 
    ? currentCenter 
    : THACH_KHE_CENTER;

  const currentVillageName = selectedVillage?.name || selectedVillage?.tenThon || '';
  const isVillageMode = Boolean(selectedVillage) && !selectedLocation;
  const parsedCommuneBoundary = parseBoundary(communeBoundary);

  return (
    <div className="w-full h-full flex-1 relative bg-slate-100 z-0 min-h-[350px]">
      
      <style>{`
        .clean-light-map .leaflet-tile {
          filter: brightness(1.03) contrast(95%) saturate(75%);
        }
        .clean-light-map .leaflet-container {
          background-color: #f8fafc !important;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.8); }
          70% { box-shadow: 0 0 0 16px rgba(5, 150, 105, 0); }
          100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }
        .selected-pin-glow div {
          animation: pulse-glow 1.8s infinite;
        }
        .village-polygon-selected {
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.95));
        }
        .village-polygon-hovered {
          filter: drop-shadow(0 0 8px rgba(15, 23, 42, 0.6));
          cursor: pointer;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          padding: 4px !important;
          box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.2) !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
          line-height: 1.4 !important;
        }
      `}</style>

      {/* NÚT NỔI TẮT CHỈ ĐƯỜNG (Chỉ ẩn tuyến đường và bảng hướng dẫn, giữ nguyên vẹn toàn bộ vùng bản đồ và các thôn) */}
      {showRoutePanel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Đang chỉ đường đến: <strong className="text-emerald-300">{selectedLocation?.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setShowRoutePanel(false);
              if (setRouteCoordinates) setRouteCoordinates([]);
              if (onSelectLocation) onSelectLocation(null);
              if (onClearRoute) onClearRoute();
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-full text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1"
          >
            <span>✕ Tắt chỉ đường</span>
          </button>
        </div>
      )}

      {/* BẢNG HƯỚNG DẪN CHI TIẾT TỪNG BƯỚC */}
      {showRoutePanel && selectedLocation && (
        <div className="absolute top-16 left-3 z-[1000] w-80 max-h-[75vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wide text-emerald-400">Chỉ đường chi tiết</h4>
              <p className="text-[11px] text-slate-300 truncate max-w-[200px] font-medium">{selectedLocation.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTravelMode('driving')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                travelMode === 'driving' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚗 Ô tô
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('bike')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                travelMode === 'bike' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏍️ Xe máy
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('foot')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                travelMode === 'foot' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🚶 Đi bộ
            </button>
          </div>

          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Khoảng cách</span>
              <strong className="text-slate-900 text-sm font-extrabold">{routeSummary.distance || 'Đang tính...'}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Thời gian dự kiến</span>
              <strong className="text-emerald-700 text-sm font-extrabold">{routeSummary.duration || '...'}</strong>
            </div>
          </div>

          <div className="p-3 overflow-y-auto space-y-2.5 max-h-[250px] scrollbar-thin">
            {routeSteps.map((step, idx) => (
              <div key={step.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{step.instruction}</p>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{step.distance} {step.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPickingMap && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs border border-amber-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Nhấp chuột lên bản đồ để gắn vị trí sự cố tại Thạch Khê
          </span>
          <button 
            type="button"
            onClick={() => { setIsPickingMap(false); setIsReportModalOpen(true); }}
            className="bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded-xl text-[11px] transition font-medium cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      )}

      <div className="absolute top-3 right-3 z-[1000] flex bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 gap-1">
        <button 
          type="button"
          onClick={() => setMapStyle && setMapStyle('voyager')} 
          className={`px-3 py-1.5 text-[11px] rounded-xl font-semibold transition-all cursor-pointer ${
            mapStyle === 'voyager' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🗺️ Bản đồ màu
        </button>
        <button 
          type="button"
          onClick={() => setMapStyle && setMapStyle('satellite')} 
          className={`px-3 py-1.5 text-[11px] rounded-xl font-semibold transition-all cursor-pointer ${
            mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🛰️ Vệ tinh Esri
        </button>
      </div>

      <MapContainer 
        key={`map-${isPickingMap ? 'picking' : 'normal'}`}
        center={safeCenter} 
        zoom={mapZoom} 
        minZoom={11}
        maxZoom={19}
        scrollWheelZoom={true} 
        className={mapStyle !== 'satellite' ? 'clean-light-map w-full h-full absolute inset-0' : 'w-full h-full absolute inset-0'}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, cursor: isPickingMap ? 'crosshair' : 'grab' }}
      >
        {!fixedVillageOverview && <MapViewController center={safeCenter} zoom={mapZoom} />}
        {fixedVillageOverview && (
          <VillageOverviewController villages={villages} enabled={fixedVillageOverview} />
        )}
        
        {showRoutePanel && userLocation && selectedLocation && (
          <RouteBoundsController userLocation={userLocation} selectedLocation={selectedLocation} />
        )}

        <ZoomTracker onZoomChange={setZoomLevel} />

        <MapClickPicker 
          isPicking={isPickingMap} 
          villages={villages}
          communeBoundary={parsedCommuneBoundary}
          onPickLocation={(lat, lng) => {
            const fixedLat = lat.toFixed(6);
            const fixedLng = lng.toFixed(6);
            const locName = getVillageNameByCoord(lat, lng, villages);

            setReportForm(prev => ({ ...prev, lat: fixedLat, lng: fixedLng }));
            setPickedLatLng([fixedLat, fixedLng]);
            setDetectedLocationName(locName);
            setIsPickingMap(false);
            setIsReportModalOpen(true);
          }} 
        />

        {!fixedVillageOverview && !isPickingMap && reports && reports.map((rep, index) => {
          if (!rep.lat || !rep.lng || rep.isMapHidden === true) return null;
          const latNum = parseFloat(rep.lat);
          const lngNum = parseFloat(rep.lng);
          if (isNaN(latNum) || isNaN(lngNum)) return null;

          return (
            <Marker key={`report-${rep.id || index}`} position={[latNum, lngNum]} icon={getReportIcon(rep.status)}>
              <Popup>
                <div className="p-1 min-w-[220px] text-xs space-y-2 font-sans">
                  <div className="flex items-center justify-between font-bold text-rose-600 border-b pb-1.5">
                    <span>🚨 Phản ánh sự cố</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px]">{rep.status || 'Chờ xử lý'}</span>
                  </div>
                  <div><strong>Nội dung:</strong> {rep.content}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {!fixedVillageOverview && pickedLatLng && (
          <Marker position={pickedLatLng} icon={getReportIcon('Chờ xử lý')}>
            <Popup><div className="text-xs font-bold text-rose-600">📍 Vị trí sự cố đang chọn</div></Popup>
          </Marker>
        )}

        {!fixedVillageOverview && userLocation && (
          <Marker position={userLocation} icon={gpsPinIcon}>
            <Popup><div className="text-xs font-bold text-slate-900">📍 Vị trí hiện tại của bạn</div></Popup>
          </Marker>
        )}

        {!fixedVillageOverview && routeCoordinates && routeCoordinates.length > 0 && (
          <>
            <Polyline positions={routeCoordinates} pathOptions={{ color: '#0284c7', weight: 6, opacity: 0.85, lineCap: 'round' }} />
            <Polyline positions={routeCoordinates} pathOptions={{ color: '#38bdf8', weight: 3, opacity: 1, dashArray: '6, 10' }} />
          </>
        )}

        {mapStyle === 'satellite' ? (
          <TileLayer 
            attribution='Tiles © Esri' 
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
            maxZoom={19} 
          />
        ) : (
          <TileLayer
            attribution='© OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        
        {parsedCommuneBoundary.length > 0 && (
          <Polygon 
            positions={parsedCommuneBoundary} 
            interactive={!isPickingMap} 
            pathOptions={{ 
              color: '#0284c7', 
              weight: 2, 
              fillColor: '#0284c7', 
              fillOpacity: 0.02 
            }} 
          />
        )}

        {villages && villages.map((village, idx) => {
          const villageCoords = parseBoundary(village.boundary);
          if (villageCoords.length === 0) return null;
          
          const villageKey = village.id ?? village.name ?? idx;
          const isSelected = selectedVillage && (selectedVillage.name === village.name || selectedVillage.id === village.id);
          const isHovered = hoveredVillageKey === villageKey;
          const isAnyVillageSelected = selectedVillage !== null && selectedVillage !== undefined;
          const isAnyVillageHovered = hoveredVillageKey !== null;

          const polygonColor = village.color || '#0d9488';
          const fillColor = village.color || '#0d9488';
          const fillOpacity = isHovered ? 0.58 : (isSelected ? 0.48 : (isAnyVillageHovered ? 0.22 : 0.30));
          const weight = isHovered ? 4.5 : (isSelected ? 3.5 : 1.8);

          const centerCoord = getPolygonCenter(villageCoords);

          const labelIcon = L.divIcon({
            className: 'village-name-label-fixed',
            html: `
              <div style="
                background: ${isSelected || isHovered ? 'rgba(255, 255, 255, 0.99)' : 'rgba(255, 255, 255, 0.9)'};
                padding: 4px 10px;
                border-radius: 10px;
                border: ${isSelected || isHovered ? '3px solid' : '2px solid'} ${village.color || '#0284c7'};
                font-size: ${isHovered ? '12px' : '11px'};
                font-weight: 700;
                color: ${isSelected || isHovered ? (village.color || '#065f46') : '#0f172a'};
                white-space: nowrap;
                box-shadow: ${isSelected || isHovered ? '0 0 0 4px rgba(255,255,255,0.9), 0 5px 18px rgba(15,23,42,0.30)' : '0 3px 10px rgba(15, 23, 42, 0.12)'};
                display: flex;
                align-items: center;
                gap: 5px;
                pointer-events: none;
                opacity: ${(isAnyVillageSelected && !isSelected && !isHovered) || (isAnyVillageHovered && !isHovered && !isSelected) ? '0.45' : '1'};
              ">
                <span>🏘</span>
                <span>${village.name}</span>
              </div>
            `,
            iconSize: [140, 32],
            iconAnchor: [70, 16]
          });

          return (
            <React.Fragment key={idx}>
              <Polygon 
                positions={villageCoords} 
                interactive={!isPickingMap}
                eventHandlers={{
                  mouseover: () => { if (!isPickingMap) setHoveredVillageKey(villageKey); },
                  mouseout: () => { setHoveredVillageKey(current => current === villageKey ? null : current); },
                  click: () => {
                    if (!isPickingMap && onSelectVillage) onSelectVillage(village);
                  }
                }}
                pathOptions={{ 
                  className: isHovered ? 'village-polygon-hovered' : (isSelected ? 'village-polygon-selected' : 'village-polygon'),
                  color: polygonColor, 
                  weight: weight, 
                  fillColor: fillColor, 
                  fillOpacity: fillOpacity 
                }}
              >
                {!isPickingMap && !fixedVillageOverview && (
                  <Popup>
                    <div className="p-1 min-w-[140px]">
                      <h4 className="font-bold text-slate-900 text-xs">🏘 Thôn: {village.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Số hộ: {village.households} | Dân số: {village.population}</p>
                    </div>
                  </Popup>
                )}
              </Polygon>

              {!fixedVillageOverview && !hideVillageNames && (
                <Marker position={centerCoord} icon={labelIcon} interactive={false} />
              )}
            </React.Fragment>
          );
        })}

        {!hideLocationPins && (fixedVillageOverview || zoomLevel >= 13 || selectedVillage || selectedLocation) && filteredLocations && filteredLocations
          .filter((loc) => {
            if (!fixedVillageOverview) return true;
            const type = String(loc.type || loc.category || loc.categoryId || '').trim().toLowerCase();
            const nameInfo = `${loc.name || ''} ${loc.info || ''} ${loc.description || ''}`.toLowerCase();
            const isVillageCultureHouse = /nhà\s*văn\s*hóa(?:\s*thôn)?|nhà\s*sinh\s*hoạt\s*cộng\s*đồng/.test(nameInfo);
            const isGovernmentAgency = ['admin', 'security'].includes(type) || /ủy\s*ban\s*nhân\s*dân|ubnd|công\s*an|trạm\s*y\s*tế|trung\s*tâm\s*phục\s*vụ\s*hành\s*chính\s*công|cơ\s*quan\s*nhà\s*nước/.test(nameInfo);
            return isVillageCultureHouse || isGovernmentAgency;
          })
          .map((loc) => {
            if (!loc.lat || !loc.lng) return null;
            
            const isSelected = selectedLocation?.id === loc.id;
            
            let isDimmed = false;
            if (showRoutePanel) {
              isDimmed = !isSelected;
            } else if (selectedLocation) {
              isDimmed = !isSelected;
            } else if (selectedVillage) {
              const isDirectMatch = loc.villageId === selectedVillage.id;
              const isInfoMatch = loc.info && currentVillageName && loc.info.toLowerCase().includes(currentVillageName.toLowerCase());
              isDimmed = !(isDirectMatch || isInfoMatch);
            }

            return (
              <LocationMarker
                key={loc.id}
                loc={loc}
                isSelected={isSelected}
                isDimmed={isDimmed}
                onSelectLocation={onSelectLocation}
                getCategoryName={getCategoryName}
                onOpenDetail={onOpenDetail}
                onDirectRouteCustom={handleDirectRouteCustom}
                isPickingMap={isPickingMap}
                isVillageMode={isVillageMode || fixedVillageOverview}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}