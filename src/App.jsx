import React, { useState } from 'react';
import { communeInfo, villagesData, mapLocations, communeBoundary } from './data';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component phụ trợ di chuyển tâm bản đồ mượt mà khi chọn địa điểm
function MapViewController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Hàm tạo icon ghim trực quan theo từng loại hình
const createPinIcon = (type, isSelected) => {
  let emoji = '📍';
  let bgColor = '#3b82f6';

  switch (type) {
    case 'admin': emoji = '🏛️'; bgColor = '#2563eb'; break;
    case 'health': emoji = '🏥'; bgColor = '#dc2626'; break;
    case 'school': emoji = '🏫'; bgColor = '#16a34a'; break;
    case 'temple': emoji = '🛕'; bgColor = '#d97706'; break;
    case 'tourism': emoji = '🏖️'; bgColor = '#0284c7'; break;
    case 'restaurant': emoji = '🍽️'; bgColor = '#ea580c'; break;
    case 'hotel': emoji = '🏨'; bgColor = '#7c3aed'; break;
    default: emoji = '📍'; bgColor = '#3b82f6';
  }

  const size = isSelected ? '38px' : '32px';
  const border = isSelected ? '3px solid #f59e0b' : `2px solid ${bgColor}`;

  return L.divIcon({
    className: 'custom-pin-marker',
    html: `<div style="
      background-color: white;
      border: ${border};
      width: ${size};
      height: ${size};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.35);
      transition: all 0.3s ease;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' hoặc 'villages'
  const [mapStyle, setMapStyle] = useState('colored'); // 'colored' hoặc 'satellite'

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);

  // Lọc địa điểm theo từ khóa và danh mục
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

  // Khóa biên giới bản đồ chống trôi ra ngoài xã
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
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(16);
  };

  const getCategoryEmoji = (type) => {
    switch (type) {
      case 'admin': return '🏛️';
      case 'health': return '🏥';
      case 'school': return '🏫';
      case 'temple': return '🛕';
      case 'tourism': return '🏖️';
      case 'restaurant': return '🍽️';
      case 'hotel': return '🏨';
      default: return '📍';
    }
  };

  const getCategoryName = (type) => {
    switch (type) {
      case 'admin': return 'Hành chính nhà nước';
      case 'health': return 'Cơ sở Y tế';
      case 'school': return 'Cơ sở Giáo dục';
      case 'temple': return 'Đền, Chùa, Tâm linh';
      case 'tourism': return 'Khu du lịch';
      case 'restaurant': return 'Quán ăn, Ẩm thực';
      case 'hotel': return 'Khách sạn, Nhà nghỉ';
      default: return 'Địa điểm khác';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header Cổng thông tin đô thị thông minh */}
      <header className="bg-white shadow-sm border-b border-slate-200 py-4 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2">
                🗺️ Bản đồ số {communeInfo.name}
              </h1>
              <p className="text-slate-600 text-xs md:text-sm mt-0.5">
                Ứng dụng tích hợp thông tin địa bàn, giúp người dân và du khách tra cứu thông tin, tiếp cận dịch vụ thuận tiện.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button 
                onClick={() => setMapStyle('colored')} 
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mapStyle === 'colored' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🗺️ Bản đồ màu
              </button>
              <button 
                onClick={() => setMapStyle('satellite')} 
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🛰️ Vệ tinh
              </button>
            </div>
          </div>

          {/* Thanh công cụ tìm kiếm & lọc */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 pt-2 border-t border-slate-100">
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                ℹ️ Thông tin & Tiện ích
              </button>
              <button 
                onClick={() => setActiveTab('villages')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${activeTab === 'villages' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                👥 Danh sách 11 Thôn
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tên địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 bg-white"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="all">Tất cả loại địa điểm</option>
                <option value="admin">🏛️ Cơ quan hành chính</option>
                <option value="school">🏫 Cơ sở Giáo dục</option>
                <option value="health">🏥 Cơ sở Y tế</option>
                <option value="temple">🛕 Đền, Chùa, Tâm linh</option>
                <option value="tourism">🏖️ Khu du lịch</option>
                <option value="restaurant">🍽️ Quán ăn, Ẩm thực</option>
                <option value="hotel">🏨 Khách sạn, Nhà nghỉ</option>
              </select>

              {(searchTerm || selectedCategory !== 'all') && (
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-medium transition"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Thanh chỉ mục nhanh dạng Pill Buttons đầy đủ */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'all' ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              📋 Tất cả ({mapLocations.length})
            </button>
            <button 
              onClick={() => setSelectedCategory('admin')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'admin' ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🏛️ Hành chính
            </button>
            <button 
              onClick={() => setSelectedCategory('school')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'school' ? 'bg-green-50 border-green-300 text-green-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🏫 Giáo dục
            </button>
            <button 
              onClick={() => setSelectedCategory('health')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'health' ? 'bg-red-50 border-red-300 text-red-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🏥 Y tế
            </button>
            <button 
              onClick={() => setSelectedCategory('temple')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'temple' ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🛕 Đền, Chùa
            </button>
            <button 
              onClick={() => setSelectedCategory('tourism')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'tourism' ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🏖️ Du lịch
            </button>
            <button 
              onClick={() => setSelectedCategory('restaurant')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'restaurant' ? 'bg-orange-50 border-orange-300 text-orange-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🍽️ Quán ăn
            </button>
            <button 
              onClick={() => setSelectedCategory('hotel')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedCategory === 'hotel' ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              🏨 Khách sạn
            </button>
          </div>

        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 py-4 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Cột trái */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {activeTab === 'overview' ? (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
              <h2 className="font-bold text-slate-800 text-sm border-b pb-2">
                📊 Tổng quan & Điểm dịch vụ
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-[11px] text-blue-600 font-medium">Tổng diện tích</div>
                  <div className="text-sm font-bold text-blue-900 mt-0.5">{communeInfo.totalArea}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="text-[11px] text-emerald-600 font-medium">Tổng số hộ</div>
                  <div className="text-sm font-bold text-emerald-900 mt-0.5">{communeInfo.totalHouseholds}</div>
                </div>
              </div>

              <div className="mt-1">
                <h3 className="font-semibold text-xs text-slate-700 mb-2">📍 Danh sách điểm hiển thị ({filteredLocations.length}):</h3>
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredLocations.map((loc) => (
                    <div 
                      key={loc.id} 
                      onClick={() => handleSelectLocation(loc)}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition flex items-start gap-2.5"
                    >
                      <span className="text-base mt-0.5">{getCategoryEmoji(loc.type)}</span>
                      <div>
                        <h4 className="font-bold text-xs text-blue-900">{loc.name}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{loc.info}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-semibold text-slate-700 mb-3 border-b pb-2 text-sm">
                <span>📋 Danh sách 11 Thôn</span>
              </h2>
              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                {villagesData.map((village) => (
                  <div key={village.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: village.color }}></span>
                        <h3 className="font-bold text-blue-900 text-sm">{village.name}</h3>
                      </div>
                      <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-600">{village.area}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-2 grid grid-cols-2 gap-1 bg-white p-2 rounded border border-slate-200">
                      <div>🏠 Hộ: <strong>{village.households}</strong></div>
                      <div>👥 Khẩu: <strong>{village.population}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Bản đồ tương tác */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="font-semibold text-slate-700 text-sm">
              🗺️ Bản đồ trực quan ({filteredLocations.length} địa điểm)
            </h2>
            <span className="text-xs text-slate-500">Nhấp vào biểu tượng để xem thông tin & chỉ đường</span>
          </div>

          <div className="w-full h-[620px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
            <MapContainer 
              center={defaultCenter} 
              zoom={mapZoom} 
              minZoom={12}
              maxZoom={18}
              maxBounds={mapBounds}
              maxBoundsViscosity={1.0}
              scrollWheelZoom={true} 
              style={{ width: '100%', height: '100%' }}
            >
              <MapViewController center={currentCenter} zoom={mapZoom} />

              {mapStyle === 'satellite' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              ) : (
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />
              )}
              
              {communeBoundary && communeBoundary.length > 0 && (
                <Polygon 
                  positions={communeBoundary} 
                  pathOptions={{ 
                    color: mapStyle === 'satellite' ? '#facc15' : '#2563eb',       
                    weight: mapStyle === 'satellite' ? 3 : 2.5,            
                    fillColor: '#3b82f6',   
                    fillOpacity: mapStyle === 'satellite' ? 0.05 : 0.02       
                  }} 
                />
              )}

              {filteredLocations.map((loc) => {
                const isSelected = mapCenter && mapCenter[0] === loc.lat && mapCenter[1] === loc.lng;
                
                // URL Google Maps mở trực tiếp tính năng chỉ đường tới tọa độ điểm đó
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;

                return (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={createPinIcon(loc.type, isSelected)}
                    eventHandlers={{ click: () => handleSelectLocation(loc) }}
                  >
                    <Popup>
                      <div className="p-1.5 min-w-[200px] flex flex-col gap-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded mb-1">
                            {getCategoryEmoji(loc.type)} {getCategoryName(loc.type)}
                          </span>
                          <h3 className="font-bold text-blue-900 text-sm leading-snug">{loc.name}</h3>
                          <p className="text-xs text-slate-600 mt-1">{loc.info}</p>
                        </div>
                        
                        {/* Nút chỉ đường chuyên nghiệp */}
                        <a 
                          href={googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          🚗 Chỉ đường (Google Maps)
                        </a>
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