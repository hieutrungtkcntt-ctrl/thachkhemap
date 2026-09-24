import React, { useState, useEffect } from 'react';
import { communeInfo, villagesData, mapLocations, communeBoundary } from './data';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
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

function getDirectionIcon(type, modifier) {
  if (type === 'arrive') return '🏁';
  if (modifier?.includes('right')) return '↪️';
  if (modifier?.includes('left')) return '↩️';
  return '⬆️';
}

function translateManeuver(step) {
  const maneuver = step.maneuver;
  if (maneuver.type === 'arrive') return 'Đến điểm đến của bạn';
  if (maneuver.type === 'depart') return 'Bắt đầu di chuyển';
  
  let text = 'Đi tiếp';
  if (maneuver.type === 'turn') {
    const mod = maneuver.modifier;
    if (mod?.includes('right')) text = 'Quẹo phải';
    else if (mod?.includes('left')) text = 'Quẹo trái';
    else text = 'Tiếp tục rẽ';
  }

  if (step.name) {
    text += ` vào ${step.name}`;
  }
  return text;
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); 
  const [mapStyle, setMapStyle] = useState('satellite'); 

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [navigatingTarget, setNavigatingTarget] = useState(null); 
  const [userLocation, setUserLocation] = useState(null); 
  const [routeCoordinates, setRouteCoordinates] = useState([]); 
  const [routeSteps, setRouteSteps] = useState([]); 
  const [routeDistance, setRouteDistance] = useState(null); 
  const [routeDuration, setRouteDuration] = useState(null); 
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(null);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '📍' },
    { id: 'admin', label: 'Hành chính', icon: '🏛️' },
    { id: 'security', label: 'An ninh', icon: '🛡️' },
    { id: 'school', label: 'Giáo dục', icon: '🏫' },
    { id: 'health', label: 'Y tế', icon: '🏥' },
    { id: 'temple', label: 'Di tích - Tâm linh', icon: '🛕' },
    { id: 'culture', label: 'Nhà văn hóa', icon: '🏮' },
    { id: 'tourism', label: 'Khu du lịch', icon: '🏖️' },
    { id: 'restaurant', label: 'Nhà hàng', icon: '🍽️' },
    { id: 'hotel', label: 'Khách sạn', icon: '🏨' },
    { id: 'eco', label: 'Khu sinh thái', icon: '🌳' },
  ];

  const filteredLocations = mapLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loc.info.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const defaultCenter = communeBoundary && communeBoundary.length > 0 
    ? communeBoundary[Math.floor(communeBoundary.length / 2)] 
    : [18.4250, 105.9160];

  const currentCenter = mapCenter || defaultCenter;

  const mapBounds = (() => {
    if (!communeBoundary || communeBoundary.length === 0) return null;
    const lats = communeBoundary.map(coord => coord[0]);
    const lngs = communeBoundary.map(coord => coord[1]);
    return [
      [Math.min(...lats) - 0.03, Math.min(...lngs) - 0.03],
      [Math.max(...lats) + 0.03, Math.max(...lngs) + 0.03]
    ];
  })();

  const handleSelectLocation = (loc) => {
    setSelectedVillage(null);
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(16);
  };

  const handleSelectVillage = (village) => {
    setSelectedVillage(village);
    if (village.center) {
      setMapCenter(village.center);
      setMapZoom(15);
    }
  };

  const fetchRoadRoute = async (startLat, startLng, destLat, destLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        let latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        const finalDest = [destLat, destLng];
        const lastPoint = latLngs[latLngs.length - 1];
        const distanceToDest = Math.hypot(lastPoint[0] - finalDest[0], lastPoint[1] - finalDest[1]);
        if (distanceToDest > 0.0001) {
          latLngs.push(finalDest);
        }

        setRouteCoordinates(latLngs);
        setRouteDistance((route.distance / 1000).toFixed(1)); 
        setRouteDuration(Math.round(route.duration / 60)); 

        if (route.legs && route.legs[0] && route.legs[0].steps) {
          setRouteSteps(route.legs[0].steps);
        }
      } else {
        setRouteCoordinates([[startLat, startLng], [destLat, destLng]]);
        setRouteSteps([]);
      }
    } catch (err) {
      console.error("Lỗi định tuyến:", err);
      setRouteCoordinates([[startLat, startLng], [destLat, destLng]]);
      setRouteSteps([]);
    }
  };

  const handleDirectGPSRoute = (loc) => {
    setNavigatingTarget(loc);
    setActiveStepIndex(null);
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(15);

    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ GPS!');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        fetchRoadRoute(lat, lng, loc.lat, loc.lng);
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        const fallbackLat = 18.4250;
        const fallbackLng = 105.9160;
        setUserLocation([fallbackLat, fallbackLng]);
        fetchRoadRoute(fallbackLat, fallbackLng, loc.lat, loc.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleStepClick = (step, index) => {
    setActiveStepIndex(index);
    if (step.maneuver && step.maneuver.location) {
      const [lng, lat] = step.maneuver.location;
      setMapCenter([lat, lng]);
      setMapZoom(17);
    }
  };

  const getCategoryEmoji = (type) => {
    const found = categories.find(c => c.id === type);
    return found ? found.icon : '📍';
  };

  const getCategoryName = (type) => {
    const found = categories.find(c => c.id === type);
    return found ? found.label : 'Địa điểm khác';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* HEADER TỈNH TẮN, THANH THOÁT */}
      <header className="bg-white shadow-sm border-b border-slate-200 py-3 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-blue-900 tracking-tight">
                Bản đồ số {communeInfo.name}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Ứng dụng tích hợp thông tin địa bàn, giúp tra cứu thông tin và tiếp cận dịch vụ thuận tiện.
              </p>
            </div>

            <div className="flex items-center gap-3 text-slate-600 font-medium text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>Diện tích: <strong className="text-slate-900">{communeInfo.totalArea}</strong></span>
              <span>•</span>
              <span>Số hộ: <strong className="text-slate-900">{communeInfo.totalHouseholds}</strong></span>
              <span>•</span>
              <span>Nhân khẩu: <strong className="text-slate-900">{communeInfo.totalPopulation}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setActiveTab('overview'); setSelectedVillage(null); }}
                className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                ℹ️ Thông tin chung & Dịch vụ
              </button>
              <button 
                onClick={() => setActiveTab('villages')}
                className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${activeTab === 'villages' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                👥 Danh sách 11 Thôn
              </button>
            </div>
          </div>

          {/* THANH LỌC DANH MỤC */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1">Danh mục:</span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab('overview');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-4 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Ô TÌM KIẾM ĐƯỢC CHUYỂN XUỐNG CỘT TRÁI CHO DỄ THAO TÁC */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🔍 Tìm kiếm nhanh</span>
            <input
              type="text"
              placeholder="Nhập tên địa điểm cần tìm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          {navigatingTarget ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🧭 Thông tin hành trình
                </h2>
                <button 
                  onClick={() => { setNavigatingTarget(null); setRouteCoordinates([]); setRouteSteps([]); setUserLocation(null); setActiveStepIndex(null); }}
                  className="text-xs text-slate-400 hover:text-red-600 font-bold"
                >
                  ✕ Đóng
                </button>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Điểm đến</span>
                <h4 className="font-bold text-xs text-blue-900">{navigatingTarget.name}</h4>
                <p className="text-[11px] text-slate-600">{navigatingTarget.info}</p>
              </div>

              {gpsLoading ? (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center text-xs font-semibold text-blue-600 animate-pulse">
                  🛰️ Đang lấy GPS và tìm đường đi thực tế...
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 font-medium flex flex-col gap-1">
                  <div>✅ <strong>Đã định tuyến thành công!</strong></div>
                  {routeDistance && (
                    <div className="flex gap-3 text-emerald-900 font-bold pt-1 border-t border-emerald-200">
                      <span>📏 {routeDistance} km</span>
                      <span>⏱️ ~{routeDuration} phút</span>
                    </div>
                  )}
                </div>
              )}

              {/* NÚT GOOGLE MAPS ĐÃ ĐƯỢC ĐỒNG BỘ MÀU XANH DƯƠNG CHUẨN GIAO DIỆN */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${navigatingTarget.lat},${navigatingTarget.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition shadow-sm flex items-center justify-center gap-1.5"
              >
                🗺️ Mở chỉ đường bằng Google Maps
              </a>

              <button
                onClick={() => handleDirectGPSRoute(navigatingTarget)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                🔄 Cập nhật lại vị trí GPS
              </button>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  📍 Địa điểm hiển thị ({filteredLocations.length})
                </h2>
                {selectedCategory !== 'all' && (
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Đang lọc danh mục
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredLocations.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Không tìm thấy địa điểm phù hợp.
                  </div>
                ) : (
                  filteredLocations.map((loc) => (
                    <div 
                      key={loc.id} 
                      className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition flex flex-col gap-2"
                    >
                      <div className="flex items-start gap-2.5 cursor-pointer" onClick={() => handleSelectLocation(loc)}>
                        <span className="text-lg mt-0.5">{getCategoryEmoji(loc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-blue-900 truncate">{loc.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{loc.info}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                            {getCategoryName(loc.type)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDirectGPSRoute(loc)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        🧭 Chỉ đường đường bộ (GPS)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  👥 Danh sách 11 Thôn
                </h2>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {villagesData.map((village) => {
                  const isVillageSelected = selectedVillage && selectedVillage.id === village.id;
                  return (
                    <div 
                      key={village.id} 
                      onClick={() => handleSelectVillage(village)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${isVillageSelected ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-300' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: village.color }}></span>
                          <h3 className="font-bold text-blue-900 text-xs">{village.name}</h3>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">{village.area}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>Số hộ: <strong className="text-slate-900">{village.households}</strong></div>
                        <div>Nhân khẩu: <strong className="text-slate-900">{village.population}</strong></div>
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex flex-col gap-0.5">
                        <div>Bí thư: <strong className="text-slate-700">{village.secretary}</strong> ({village.secPhone})</div>
                        <div>Trưởng thôn: <strong className="text-slate-700">{village.leader}</strong> ({village.leadPhone})</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* CỘT PHẢI: BẢN ĐỒ VÀ BẢNG CHỈ DẪN */}
        <div className="lg:col-span-8 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="font-semibold text-slate-700 text-xs md:text-sm">
              🗺️ Không gian bản đồ số 
              {selectedVillage && <span className="text-blue-600 font-bold ml-1">— Phân vùng: {selectedVillage.name}</span>}
              {navigatingTarget && <span className="text-emerald-600 font-bold ml-1">— Đang hướng dẫn: {navigatingTarget.name}</span>}
            </h2>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Rê chuột hoặc nhấp vào ghim để xem chi tiết</span>
          </div>

          <div className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
            
            {/* NÚT CHUYỂN NỀN BẢN ĐỒ */}
            <div className="absolute top-3 right-3 z-[1000] group">
              <div className="bg-white hover:bg-slate-50 w-9 h-9 rounded-lg shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition text-base select-none">
                🗺️
              </div>

              <div className="absolute right-0 top-0 hidden group-hover:flex bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-xl border border-slate-200 flex-row gap-1 items-center">
                <button 
                  onClick={() => setMapStyle('voyager')} 
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition whitespace-nowrap ${mapStyle === 'voyager' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  🗺️ Bản đồ màu
                </button>
                <button 
                  onClick={() => setMapStyle('satellite')} 
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition whitespace-nowrap ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  🛰️ Vệ tinh Esri
                </button>
              </div>
            </div>

            {/* BẢNG CHỈ ĐƯỜNG BẰNG CHỮ (NỔI GÓC PHẢI) */}
            {routeSteps && routeSteps.length > 0 && (
              <div className="absolute top-14 right-3 z-[1000] w-72 md:w-80 max-h-[350px] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden text-xs">
                <div className="flex items-center justify-between bg-blue-600 text-white px-3 py-2">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    🧭 Hướng dẫn chi tiết
                  </span>
                  <button 
                    onClick={() => { setRouteSteps([]); setActiveStepIndex(null); }}
                    className="text-white hover:bg-blue-700 rounded w-5 h-5 flex items-center justify-center text-xs font-bold transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 p-1.5 flex flex-col gap-0.5">
                  {routeSteps.map((step, idx) => {
                    const isSelected = activeStepIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleStepClick(step, idx)}
                        className={`flex items-start gap-2 py-2 px-2 rounded-lg cursor-pointer transition ${
                          isSelected ? 'bg-blue-600 text-white shadow-2xs' : 'hover:bg-blue-50/60 text-slate-800'
                        }`}
                      >
                        <span className={`text-sm mt-0.5 shrink-0 ${isSelected ? 'text-white' : ''}`}>
                          {getDirectionIcon(step.maneuver.type, step.maneuver.modifier)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold leading-snug ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {translateManeuver(step)}
                          </p>
                          <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {step.distance >= 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <MapContainer 
              center={defaultCenter} 
              zoom={mapZoom} 
              minZoom={12}
              maxZoom={19}
              maxBounds={mapBounds}
              maxBoundsViscosity={1.0}
              scrollWheelZoom={true} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapViewController center={currentCenter} zoom={mapZoom} />

              {userLocation && (
                <Marker position={userLocation} icon={gpsPinIcon}>
                  <Popup>
                    <div className="p-1 text-xs font-semibold text-blue-900">
                      📍 Vị trí hiện tại của thiết bị (GPS)
                    </div>
                  </Popup>
                </Marker>
              )}

              {routeCoordinates.length > 0 && (
                <Polyline 
                  positions={routeCoordinates} 
                  pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }} 
                />
              )}

              {mapStyle === 'satellite' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              ) : (
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />
              )}
              
              {communeBoundary && communeBoundary.length > 0 && (
                <Polygon 
                  positions={communeBoundary} 
                  pathOptions={{ 
                    color: mapStyle === 'satellite' ? '#facc15' : '#2563eb',      
                    weight: mapStyle === 'satellite' ? 3 : 2,            
                    fillColor: '#3b82f6',   
                    fillOpacity: mapStyle === 'satellite' ? 0.05 : 0.02      
                  }} 
                />
              )}

              {selectedVillage && selectedVillage.boundary && (
                <Polygon
                  positions={selectedVillage.boundary}
                  pathOptions={{
                    color: '#f59e0b',
                    weight: 3,
                    fillColor: selectedVillage.color || '#3b82f6',
                    fillOpacity: 0.45
                  }}
                >
                  <Popup>
                    <div className="p-1.5 min-w-[160px]">
                      <h3 className="font-bold text-blue-900 text-xs">📍 {selectedVillage.name}</h3>
                      <p className="text-[11px] text-slate-600 mt-0.5">Diện tích: {selectedVillage.area}</p>
                      <p className="text-[11px] text-slate-600">Số hộ: {selectedVillage.households} | Khẩu: {selectedVillage.population}</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {filteredLocations.map((loc) => {
                const isSelected = mapCenter && mapCenter[0] === loc.lat && mapCenter[1] === loc.lng;

                return (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={createPinIcon(loc, isSelected)}
                    eventHandlers={{ click: () => handleSelectLocation(loc) }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[180px] flex flex-col gap-1.5">
                        <div>
                          <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded mb-1">
                            {getCategoryEmoji(loc.type)} {getCategoryName(loc.type)}
                          </span>
                          <h3 className="font-bold text-blue-900 text-xs leading-snug">{loc.name}</h3>
                          <p className="text-[11px] text-slate-600 mt-0.5">{loc.info}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleDirectGPSRoute(loc)}
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
        </div>

      </main>
    </div>
  );
}