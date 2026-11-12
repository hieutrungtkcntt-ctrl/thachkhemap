import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const THACH_KHE_CENTER = [18.3950, 105.9550];

// Helper lấy biểu tượng & màu sắc đồng bộ theo lĩnh vực
function getCategoryVisual(typeRaw) {
  const key = String(typeRaw || '').trim().toLowerCase();
  const map = {
    admin: { emoji: '🏛️', color: '#2563eb' },
    'cơ sở hành chính': { emoji: '🏛️', color: '#2563eb' },
    security: { emoji: '🛡️', color: '#1e40af' },
    'an ninh - quốc phòng': { emoji: '🛡️', color: '#1e40af' },
    culture: { emoji: '🏮', color: '#0284c7' },
    'văn hoá - thể thao': { emoji: '⚽', color: '#0284c7' },
    sport: { emoji: '⚽', color: '#0284c7' },
    health: { emoji: '🏥', color: '#e11d48' },
    heatlh: { emoji: '🏥', color: '#e11d48' },
    'cơ sở y tế': { emoji: '🏥', color: '#e11d48' },
    school: { emoji: '🏫', color: '#16a34a' },
    'cơ sở giáo dục': { emoji: '🏫', color: '#16a34a' },
    temple: { emoji: '🛕', color: '#d97706' },
    'di tích văn hoá': { emoji: '🛕', color: '#d97706' },
    tourism: { emoji: '🏖️', color: '#0d9488' },
    'du lịch': { emoji: '🏖️', color: '#0d9488' },
    restaurant: { emoji: '🍽️', color: '#ea580c' },
    'nhà hàng - quán ăn': { emoji: '🍽️', color: '#ea580c' },
    market: { emoji: '🛒', color: '#db2777' },
    'chợ': { emoji: '🛒', color: '#db2777' },
    shop: { emoji: '🏪', color: '#9333ea' },
    'cửa hàng - siêu thị': { emoji: '🏪', color: '#9333ea' },
    hotel: { emoji: '🏨', color: '#7c3aed' },
    'lưu trú': { emoji: '🏨', color: '#7c3aed' },
    eco: { emoji: '🌳', color: '#059669' },
  };
  return map[key] || { emoji: '📍', color: '#2563eb' };
}

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const targetCenter =
      center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])
        ? center
        : THACH_KHE_CENTER;

    map.flyTo(targetCenter, zoom || 15, { duration: 1.1 });
  }, [center, zoom, map]);
  return null;
}

function RouteBoundsController({ userLocation, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && Array.isArray(routeCoordinates) && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds([userLocation, ...routeCoordinates]);
      map.fitBounds(bounds, {
        padding: typeof window !== 'undefined' && window.innerWidth < 640 ? [40, 40] : [72, 72],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [userLocation, routeCoordinates, map]);

  return null;
}

function ZoomTracker({ onZoomChange }) {
  const map = useMap();
  useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

function MapSizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    let frameId;
    const refresh = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };

    refresh();
    const container = map.getContainer();
    let observer;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(refresh);
      observer.observe(container);
      if (container.parentElement) observer.observe(container.parentElement);
    }

    window.addEventListener('resize', refresh);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', refresh);
    };
  }, [map]);

  return null;
}

function isPointInPolygon(point, polygon) {
  if (!point || !polygon || !Array.isArray(polygon)) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
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
      console.error('Lỗi parse boundary JSON:', e);
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

  coords.forEach((pt) => {
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
    if (coords.length > 0 && isPointInPolygon([lat, lng], coords)) {
      return v.name;
    }
  }
  return 'Khu vực trung tâm / Địa bàn xã Thạch Khê';
}

// Trả về URL ảnh hợp lệ đầu tiên hoặc '' nếu chưa có ảnh (tuyệt đối không dùng ảnh mẫu dễ vỡ)
function getSingleImage(loc) {
  if (!loc) return '';

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
    loc.thumbnail,
  ];

  for (let item of candidates) {
    let url = '';
    if (typeof item === 'string') url = item.trim();
    else if (item && typeof item === 'object') {
      url = (item.url || item.src || item.imageUrl || item.image || '').trim();
    }

    if (url) {
      const lower = url.toLowerCase();
      if (
        lower !== 'null' &&
        lower !== 'undefined' &&
        !lower.endsWith('/null') &&
        !lower.endsWith('/undefined') &&
        !lower.includes('unsplash.com/photo-1507525428034')
      ) {
        return url;
      }
    }
  }

  return '';
}

function MapClickPicker({ isPicking, onPickLocation, communeBoundary }) {
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

function LocationMarker({
  loc,
  isSelected,
  isDimmed,
  onSelectLocation,
  getCategoryName,
  onOpenDetail,
  onDirectRouteCustom,
  isPickingMap,
  isVillageMode,
}) {
  const markerRef = useRef(null);
  const map = useMap();

  const [imgError, setImgError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    return loc.stats || 12;
  });

  const singleImageUrl = getSingleImage(loc);

  useEffect(() => {
    setImgError(false);
  }, [singleImageUrl]);

  useEffect(() => {
    if (isSelected && markerRef.current && !isVillageMode) {
      map.closePopup();
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 280);
    }
  }, [isSelected, map, isVillageMode]);

  if (!loc.lat || !loc.lng) return null;

  const visual = getCategoryVisual(loc.type || loc.category);
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
        : savedList.filter((id) => id !== loc.id);
      localStorage.setItem('thach_khe_saved_locs', JSON.stringify(updatedList));

      const customStats = JSON.parse(localStorage.getItem('thach_khe_stats') || '{}');
      customStats[loc.id] = newCount;
      localStorage.setItem('thach_khe_stats', JSON.stringify(customStats));
    } catch (err) {
      console.error('Lỗi lưu localStorage:', err);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: loc.name, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    }
  };

  const createPinIcon = (isSelectedPin, isDimmedPin) => {
    const size = isSelectedPin ? '44px' : isDimmedPin ? '22px' : '28px';
    const fontSize = isSelectedPin ? '20px' : isDimmedPin ? '10px' : '13px';
    const border = isSelectedPin
      ? '3.5px solid #1d4ed8'
      : isDimmedPin
      ? '1.5px solid #94a3b8'
      : `2px solid ${visual.color}`;
    const opacity = isDimmedPin ? '0.28' : '1';
    const transform = isSelectedPin ? 'scale(1.18) translateY(-4px)' : 'scale(1)';
    const zIndex = isSelectedPin ? 9999 : 1;

    return L.divIcon({
      className: isSelectedPin ? 'custom-pin-marker selected-pin-glow' : 'custom-pin-marker',
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
            box-shadow: ${isSelectedPin ? '0 10px 24px rgba(37, 99, 235, 0.45)' : '0 3px 8px rgba(15, 23, 42, 0.18)'};
            cursor: pointer;
            transform: ${transform};
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${zIndex};
          "
        >${visual.emoji}</div>
      `,
      iconSize: [isSelectedPin ? 44 : 28, isSelectedPin ? 44 : 28],
      iconAnchor: [isSelectedPin ? 22 : 14, isSelectedPin ? 22 : 14],
      popupAnchor: [0, isSelectedPin ? -24 : -14],
    });
  };

  const hasValidImage = Boolean(singleImageUrl) && !imgError;

  return (
    <Marker
      ref={markerRef}
      position={[loc.lat, loc.lng]}
      icon={createPinIcon(isSelected, isDimmed)}
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
        },
      }}
    >
      {!isPickingMap && !isVillageMode && (
        <Popup>
          <div className="w-[min(295px,calc(100vw-48px))] max-w-[295px] flex flex-col font-sans text-xs bg-white rounded-2xl overflow-hidden relative">
            {/* Khung ảnh hoặc Fallback Icon tinh tế đồng bộ với ClientHome */}
            <div className="w-full h-36 relative overflow-hidden">
              {hasValidImage ? (
                <img
                  src={singleImageUrl}
                  alt={loc.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  style={{ backgroundColor: `${visual.color}12` }}
                  className="w-full h-full flex flex-col items-center justify-center border-b border-slate-100 select-none"
                >
                  <span className="text-4xl leading-none">{visual.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5">
                    Chưa có hình ảnh
                  </span>
                </div>
              )}

              {/* Nút đóng Popup */}
              <button
                type="button"
                onClick={() => {
                  map.closePopup();
                  if (onSelectLocation) onSelectLocation(null);
                }}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/95 hover:bg-white text-slate-700 rounded-full flex items-center justify-center shadow-sm border border-slate-200/70 transition cursor-pointer font-bold text-xs"
                title="Đóng"
              >
                ✕
              </button>

              {/* Nhãn danh mục */}
              <span
                style={{ color: visual.color }}
                className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-xs border border-slate-200/60 flex items-center gap-1"
              >
                <span>{visual.emoji}</span>
                <span>{loc.badge || categoryLabel}</span>
              </span>
            </div>

            {/* Nội dung thông tin */}
            <div className="p-3.5 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                {loc.name}
              </h4>

              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 shrink-0">📍</span>
                  <span className="text-slate-600 font-medium leading-tight">
                    {loc.address || loc.villageName || 'Địa bàn xã Thạch Khê'}, xã Thạch Khê, Hà Tĩnh
                  </span>
                </div>

                {loc.workingHours && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 shrink-0">🕒</span>
                    <span>{loc.workingHours}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 shrink-0">🔖</span>
                  <span>{statsCount} lượt quan tâm</span>
                </div>
              </div>
            </div>

            {/* Thanh hành động đáy Popup */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpenDetail && onOpenDetail(loc)}
                className="text-blue-700 hover:text-blue-800 font-extrabold text-xs tracking-tight transition cursor-pointer flex items-center gap-1 hover:underline"
              >
                <span>Xem chi tiết</span>
                <span>→</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  title={isSaved ? 'Đã lưu' : 'Lưu địa điểm'}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isSaved ? '❤️' : '📌'}
                </button>

                <button
                  type="button"
                  title="Chia sẻ liên kết"
                  onClick={handleShareClick}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer text-[11px] font-bold"
                >
                  {copiedLink ? '✓ Đã chép' : '🔗'}
                </button>

                <button
                  type="button"
                  onClick={() => onDirectRouteCustom && onDirectRouteCustom(loc)}
                  title="Chỉ đường GPS"
                  className="h-8 px-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                >
                  <span>🧭</span>
                  <span>Đi tới</span>
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
    popupAnchor: [0, -15],
  });
};

const gpsPinIcon = L.divIcon({
  className: 'gps-user-marker',
  html: `
    <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #2563eb; opacity: 0.3; transform: scale(1.8);"></div>
      <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(37, 99, 235, 0.5);"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
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
  disableVillageHover = false,
  disableVillagePopup = false,
  onClearRoute,
}) {
  const [isMapStyleOpen, setIsMapStyleOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(mapZoom || 12);
  const [hoveredVillageKey, setHoveredVillageKey] = useState(null);

  // Chuẩn hóa ranh giới tổng xã (giữ nguyên thứ tự [lat, lng])
  const parsedCommuneBoundary = React.useMemo(() => {
    const raw = parseBoundary(communeBoundary);
    return raw.filter((pt) => Array.isArray(pt) && pt.length >= 2);
  }, [communeBoundary]);

  const handleDirectRouteCustom = (loc) => {
    if (onSelectLocation) onSelectLocation(null);
    if (onDirectGPSRoute) onDirectGPSRoute(loc.lat, loc.lng, loc);
  };

  const safeCenter =
    currentCenter && Array.isArray(currentCenter) && !isNaN(currentCenter[0]) && !isNaN(currentCenter[1])
      ? currentCenter
      : THACH_KHE_CENTER;

  const currentVillageName = selectedVillage?.name || selectedVillage?.tenThon || '';
  const isVillageMode = Boolean(selectedVillage) && !selectedLocation;
  const hasActiveRoute = Array.isArray(routeCoordinates) && routeCoordinates.length > 0;

  return (
    <div className="w-full h-full min-h-0 flex-1 relative bg-slate-100 z-0 overflow-hidden isolate">
      <style>{`
        .leaflet-control-attribution { display: none !important; }
        .clean-light-map .leaflet-tile { filter: brightness(1.02) contrast(96%) saturate(85%); }
        .clean-light-map .leaflet-container { background-color: #f8fafc !important; }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.65); }
          70% { box-shadow: 0 0 0 14px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .selected-pin-glow div { animation: pulse-glow 1.8s infinite; }
        .leaflet-popup-content-wrapper { padding: 0 !important; overflow: hidden; border-radius: 16px !important; box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.18) !important; border: 1px solid rgba(226, 232, 240, 0.9); }
        .leaflet-popup-content { margin: 0 !important; line-height: 1.4 !important; width: auto !important; }
        .leaflet-popup-close-button { display: none !important; }
        .leaflet-container { width: 100%; height: 100%; font-family: inherit; }
        .leaflet-control-zoom { border: 1px solid rgba(226, 232, 240, 0.9) !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important; }
        .leaflet-control-zoom a { width: 34px !important; height: 34px !important; line-height: 34px !important; color: #334155 !important; font-weight: 700 !important; }
        .leaflet-control-zoom a:hover { background-color: #f8fafc !important; color: #1d4ed8 !important; }
        @media (max-width: 640px) {
          .leaflet-control-zoom { margin-right: 10px !important; margin-bottom: 12px !important; }
          .leaflet-bottom { bottom: env(safe-area-inset-bottom, 0px); }
        }
      `}</style>

      {/* Thanh thông báo chế độ chọn điểm sự cố */}
      {isPickingMap && (
        <div className="absolute top-3 left-3 right-14 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[1000] bg-amber-500/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-lg font-bold text-xs border border-amber-400 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Nhấp lên bản đồ để chọn vị trí tại Thạch Khê
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPickingMap(false);
              setIsReportModalOpen(true);
            }}
            className="shrink-0 bg-black/20 hover:bg-black/35 px-2.5 py-1 rounded-lg text-[11px] transition font-bold cursor-pointer"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Thanh điều khiển gọn khi đang chỉ đường */}
      {hasActiveRoute && !isPickingMap && (
        <div className="absolute top-3 left-14 sm:left-1/2 sm:-translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-xl shadow-md border border-blue-200 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-extrabold text-blue-700">
            <span>🧭</span>
            <span>Đang hiển thị tuyến đường GPS</span>
          </span>
          {onClearRoute && (
            <button
              type="button"
              onClick={onClearRoute}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-[11px] transition cursor-pointer"
            >
              ✕ Tắt chỉ đường
            </button>
          )}
        </div>
      )}

      {/* Nút chọn kiểu bản đồ (Đường phố / Vệ tinh) */}
      <div className="absolute top-3 right-3 z-[1000]">
        <div className="relative">
          <button
            type="button"
            title="Chọn kiểu bản đồ"
            onClick={() => setIsMapStyleOpen(!isMapStyleOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-700 rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </button>

          <div
            className={`absolute right-0 top-full pt-1.5 transition-all duration-200 transform ${
              isMapStyleOpen
                ? 'opacity-100 visible translate-y-0'
                : 'opacity-0 invisible translate-y-1 pointer-events-none'
            }`}
          >
            <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/90 flex flex-col gap-1 min-w-[145px]">
              <button
                type="button"
                onClick={() => {
                  setMapStyle && setMapStyle('voyager');
                  setIsMapStyleOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  mapStyle !== 'satellite'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🗺️</span>
                <span>Bản đồ sáng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapStyle && setMapStyle('satellite');
                  setIsMapStyleOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  mapStyle === 'satellite'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🛰️</span>
                <span>Ảnh vệ tinh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MapContainer
        key={`map-${isPickingMap ? 'picking' : 'normal'}`}
        center={safeCenter}
        zoom={mapZoom}
        minZoom={12}
        maxZoom={18}
        scrollWheelZoom={true}
        className={
          mapStyle !== 'satellite'
            ? 'clean-light-map w-full h-full absolute inset-0'
            : 'w-full h-full absolute inset-0'
        }
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          cursor: isPickingMap ? 'crosshair' : 'grab',
        }}
      >
        {!fixedVillageOverview && <MapViewController center={safeCenter} zoom={mapZoom} />}

        {userLocation && hasActiveRoute && (
          <RouteBoundsController userLocation={userLocation} routeCoordinates={routeCoordinates} />
        )}

        <ZoomTracker onZoomChange={setZoomLevel} />
        <MapSizeInvalidator />

        <MapClickPicker
          isPicking={isPickingMap}
          communeBoundary={parsedCommuneBoundary}
          onPickLocation={(lat, lng) => {
            const fixedLat = lat.toFixed(6);
            const fixedLng = lng.toFixed(6);
            const locName = getVillageNameByCoord(lat, lng, villages);

            setReportForm((prev) => ({ ...prev, lat: fixedLat, lng: fixedLng }));
            setPickedLatLng([fixedLat, fixedLng]);
            setDetectedLocationName(locName);
            setIsPickingMap(false);
            setIsReportModalOpen(true);
          }}
        />

        {!fixedVillageOverview &&
          !isPickingMap &&
          reports &&
          reports.map((rep, index) => {
            if (!rep.lat || !rep.lng || rep.isMapHidden === true) return null;
            const latNum = parseFloat(rep.lat);
            const lngNum = parseFloat(rep.lng);
            if (isNaN(latNum) || isNaN(lngNum)) return null;

            return (
              <Marker
                key={`report-${rep.id || index}`}
                position={[latNum, lngNum]}
                icon={getReportIcon(rep.status)}
              >
                <Popup>
                  <div className="p-3 min-w-[220px] text-xs space-y-2 font-sans">
                    <div className="flex items-center justify-between font-bold text-rose-600 border-b border-slate-100 pb-1.5">
                      <span>🚨 Phản ánh sự cố</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px]">
                        {rep.status || 'Chờ xử lý'}
                      </span>
                    </div>
                    <div className="text-slate-700">
                      <strong>Nội dung:</strong> {rep.content}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {!fixedVillageOverview && pickedLatLng && (
          <Marker position={pickedLatLng} icon={getReportIcon('Chờ xử lý')}>
            <Popup>
              <div className="p-2.5 text-xs font-bold text-rose-600">📍 Vị trí sự cố đang chọn</div>
            </Popup>
          </Marker>
        )}

        {!fixedVillageOverview && userLocation && (
          <Marker position={userLocation} icon={gpsPinIcon}>
            <Popup>
              <div className="p-2.5 text-xs font-bold text-blue-700">📍 Vị trí hiện tại của bạn</div>
            </Popup>
          </Marker>
        )}

        {!fixedVillageOverview && hasActiveRoute && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#1d4ed8', weight: 6, opacity: 0.85, lineCap: 'round' }}
            />
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#60a5fa', weight: 3, opacity: 1, dashArray: '6, 10' }}
            />
          </>
        )}

        {mapStyle === 'satellite' ? (
          <TileLayer
            attribution=""
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Lớp làm nổi bật ranh giới xã Thạch Khê */}
        {parsedCommuneBoundary.length > 0 && (
          <Polygon
            positions={[
              [
                [-90, -180],
                [-90, 180],
                [90, 180],
                [90, -180],
              ],
              parsedCommuneBoundary,
            ]}
            interactive={false}
            pathOptions={{
              color: '#2563eb',
              weight: 1.5,
              fillColor: '#0f172a',
              fillOpacity: mapStyle === 'satellite' ? 0.35 : 0.42,
            }}
          />
        )}

        {/* Ranh giới các thôn */}
        {villages &&
          villages.map((village, idx) => {
            const villageCoords = parseBoundary(village.boundary);
            if (villageCoords.length === 0) return null;

            const villageKey = village.id ?? village.name ?? idx;
            const isSelected =
              selectedVillage &&
              (selectedVillage.name === village.name || selectedVillage.id === village.id);
            const isHovered = hoveredVillageKey === villageKey;
            const isAnyVillageSelected = selectedVillage !== null && selectedVillage !== undefined;
            const isAnyVillageHovered = hoveredVillageKey !== null;

            const polygonColor = village.color || '#2563eb';
            const fillColor = village.color || '#2563eb';
            const centerCoord = getPolygonCenter(villageCoords);

            const labelIcon = L.divIcon({
              className: 'village-name-label-fixed',
              html: `
               <div style="
                  background: ${isSelected || isHovered ? '#1d4ed8' : 'rgba(255, 255, 255, 0.94)'};
                  padding: 2px 8px; border-radius: 8px;
                  border: 1px solid ${isSelected || isHovered ? '#1e40af' : 'rgba(203, 213, 225, 0.95)'};
                  font-size: 10px; font-weight: 700;
                  color: ${isSelected || isHovered ? '#ffffff' : '#1e293b'};
                  white-space: nowrap; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
                  display: inline-flex; align-items: center; gap: 3px;
                  pointer-events: none; transition: all 0.2s ease;
                  opacity: ${(isAnyVillageSelected && !isSelected && !isHovered) || (isAnyVillageHovered && !isHovered && !isSelected) ? '0.45' : '1'};
               ">
                  <span style="font-size: 9px;">🏘</span>
                  <span>${village.name}</span>
               </div>
              `,
              iconSize: [96, 22],
              iconAnchor: [48, 26],
            });

            return (
              <React.Fragment key={idx}>
                <Polygon
                  positions={villageCoords}
                  interactive={!isPickingMap}
                  eventHandlers={{
                    mouseover: () => {
                      if (!isPickingMap && !disableVillageHover) setHoveredVillageKey(villageKey);
                    },
                    mouseout: () => {
                      if (!disableVillageHover)
                        setHoveredVillageKey((current) => (current === villageKey ? null : current));
                    },
                    click: () => {
                      if (!isPickingMap && onSelectVillage) onSelectVillage(village);
                    },
                  }}
                  pathOptions={{
                    className:
                      isHovered && !disableVillageHover
                        ? 'village-polygon-hovered'
                        : isSelected
                        ? 'village-polygon-selected'
                        : 'village-polygon',
                    color: polygonColor,
                    weight: isHovered && !disableVillageHover ? 2.5 : isSelected ? 2.5 : 1.2,
                    dashArray: isSelected ? undefined : '4, 6',
                    fillColor: fillColor,
                    fillOpacity: (isHovered && !disableVillageHover) || isSelected ? 0.35 : 0.12,
                  }}
                >
                  {!disableVillagePopup && !isPickingMap && !fixedVillageOverview && (
                    <Popup>
                      <div className="p-3 min-w-[160px] font-sans">
                        <h4 className="font-extrabold text-slate-900 text-xs">🏘 {village.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Số hộ: <strong className="text-slate-700">{village.households || '---'}</strong> · Dân số:{' '}
                          <strong className="text-slate-700">{village.population || '---'}</strong>
                        </p>
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

        {/* Các điểm địa điểm (Pins) */}
        {!hideLocationPins &&
          (fixedVillageOverview || zoomLevel >= 12 || selectedVillage || selectedLocation) &&
          filteredLocations &&
          filteredLocations
            .filter((loc) => {
              if (!fixedVillageOverview) return true;
              const type = String(loc.type || loc.category || loc.categoryId || '')
                .trim()
                .toLowerCase();
              const nameInfo = `${loc.name || ''} ${loc.info || ''} ${loc.description || ''}`.toLowerCase();
              const isVillageCultureHouse = /nhà\s*văn\s*hóa(?:\s*thôn)?|nhà\s*sinh\s*hoạt\s*cộng\s*đồng/.test(
                nameInfo
              );
              const isGovernmentAgency =
                ['admin', 'security'].includes(type) ||
                /ủy\s*ban\s*nhân\s*dân|ubnd|công\s*an|trạm\s*y\s*tế|trung\s*tâm\s*phục\s*vụ\s*hành\s*chính\s*công|cơ\s*quan\s*nhà\s*nước/.test(
                  nameInfo
                );
              return isVillageCultureHouse || isGovernmentAgency;
            })
            .map((loc) => {
              if (!loc.lat || !loc.lng) return null;
              const isSelected = selectedLocation?.id === loc.id;

              let isDimmed = false;
              if (hasActiveRoute) {
                isDimmed = !isSelected;
              } else if (selectedLocation) {
                isDimmed = !isSelected;
              } else if (selectedVillage) {
                const isDirectMatch = String(loc.villageId) === String(selectedVillage.id);
                const isInfoMatch =
                  loc.info &&
                  currentVillageName &&
                  loc.info.toLowerCase().includes(currentVillageName.toLowerCase());
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