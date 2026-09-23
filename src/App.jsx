import React, { useState } from 'react';
import { communeInfo, villagesData, mapLocations, communeBoundary } from './data';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component phụ trợ di chuyển tâm bản đồ mượt mà khi chọn địa điểm hoặc thôn
function MapViewController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Hàm tạo icon ghim dạng ẩn tên, chỉ giữ logo, hiện title khi rê chuột
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

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' hoặc 'villages'
  const [mapStyle, setMapStyle] = useState('colored'); 

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedVillage, setSelectedVillage] = useState(null); // Lưu thông tin thôn đang được chọn phân vùng

  // Lọc danh sách địa điểm theo từ khóa và danh mục
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
    setSelectedVillage(null); // Bỏ chọn thôn nếu click điểm dịch vụ
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

  const getCategoryEmoji = (type) => {
    switch (type) {
      case 'admin': return '🏛️';
      case 'security': return '🛡️';
      case 'culture': return '🏮';
      case 'health': return '🏥';
      case 'school': return '🏫';
      case 'temple': return '🛕';
      case 'tourism': return '🏖️';
      case 'restaurant': return '🍽️';
      case 'hotel': return '🏨';
      case 'eco': return '🌳';
      default: return '📍';
    }
  };

  const getCategoryName = (type) => {
    switch (type) {
      case 'admin': return 'Cơ quan hành chính nhà nước';
      case 'security': return 'An ninh trật tự';
      case 'culture': return 'Nhà văn hóa TDP';
      case 'health': return 'Cơ sở y tế';
      case 'school': return 'Cơ sở Giáo dục';
      case 'temple': return 'Di tích lịch sử văn hóa';
      case 'tourism': return 'Khu du lịch';
      case 'restaurant': return 'Nhà hàng, quán ăn';
      case 'hotel': return 'Khách sạn, nhà nghỉ';
      case 'eco': return 'Khu sinh thái - Địa danh';
      default: return 'Địa điểm khác';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* ================= HEADER ĐÔ THỊ THÔNG MINH ================= */}
      <header className="bg-white shadow-sm border-b border-slate-200 py-3.5 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2">
                Bản đồ số {communeInfo.name}
              </h1>
              <p className="text-slate-600 text-xs md:text-sm mt-0.5">
                Ứng dụng tích hợp thông tin địa bàn, giúp người dân và du khách tra cứu thông tin, tiếp cận dịch vụ thuận tiện.
              </p>
            </div>

            {/* Khung tìm kiếm & Lọc */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 mb-1">Tìm địa điểm</span>
                <input
                  type="text"
                  placeholder="Nhập tên địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52 bg-white"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 mb-1">Loại địa điểm</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 w-full sm:w-48"
                >
                  <option value="all">Tất cả loại địa điểm</option>
                  <option value="admin">🏛️ Cơ quan hành chính</option>
                  <option value="security">🛡️ An ninh trật tự</option>
                  <option value="school">🏫 Cơ sở Giáo dục</option>
                  <option value="health">🏥 Cơ sở y tế</option>
                  <option value="temple">🛕 Di tích lịch sử văn hóa</option>
                  <option value="culture">🏮 Nhà văn hóa TDP</option>
                  <option value="tourism">🏖️ Khu du lịch</option>
                  <option value="restaurant">🍽️ Nhà hàng, quán ăn</option>
                  <option value="hotel">🏨 Khách sạn, nhà nghỉ</option>
                  <option value="eco">🌳 Khu sinh thái</option>
                </select>
              </div>

              {(searchTerm || selectedCategory !== 'all') && (
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-medium transition"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Tab chuyển đổi & Thống kê */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-medium">
            <button 
              onClick={() => { setActiveTab('overview'); setSelectedVillage(null); }}
              className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 ${activeTab === 'overview' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              ℹ️ Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab('villages')}
              className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 ${activeTab === 'villages' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              👥 Danh sách 11 Thôn
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Tổng diện tích: <strong>{communeInfo.totalArea}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Tổng số hộ: <strong>{communeInfo.totalHouseholds}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Tổng nhân khẩu: <strong>{communeInfo.totalPopulation}</strong>
            </span>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTAINER: 2 CỘT ================= */}
      <main className="max-w-7xl mx-auto px-4 py-4 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CỘT TRÁI: DANH SÁCH THÔN HOẶC ĐIỂM DỊCH VỤ */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {activeTab === 'overview' ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  📍 Danh sách điểm hiển thị ({filteredLocations.length})
                </h2>
              </div>
              
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredLocations.map((loc) => (
                  <div 
                    key={loc.id} 
                    onClick={() => handleSelectLocation(loc)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/70 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition flex items-start gap-3 shadow-sm"
                  >
                    <span className="text-xl mt-0.5">{getCategoryEmoji(loc.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-blue-900 truncate">{loc.name}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{loc.info}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-200/80 text-slate-700 text-[10px] font-medium rounded">
                        {getCategoryName(loc.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  👥 Danh sách 11 Thôn (Nhấp để phân vùng)
                </h2>
              </div>

              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {villagesData.map((village) => {
                  const isVillageSelected = selectedVillage && selectedVillage.id === village.id;
                  return (
                    <div 
                      key={village.id} 
                      onClick={() => handleSelectVillage(village)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col gap-2 shadow-sm ${isVillageSelected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: village.color }}></span>
                          <h3 className="font-bold text-blue-900 text-sm">{village.name}</h3>
                        </div>
                        <span className="text-[11px] bg-slate-200 px-2.5 py-0.5 rounded font-medium text-slate-700">{village.area}</span>
                      </div>
                      <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>🏠 Số hộ: <strong className="text-slate-900">{village.households}</strong></div>
                        <div>👥 Nhân khẩu: <strong className="text-slate-900">{village.population}</strong></div>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex flex-col gap-0.5">
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

        {/* CỘT PHẢI: BẢN ĐỒ TƯƠNG TÁC LỚN */}
        <div className="lg:col-span-8 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="font-semibold text-slate-700 text-sm">
              🗺️ Không gian bản đồ số 
              {selectedVillage && <span className="text-blue-600 font-bold ml-1.5">— Đang chọn phân vùng: {selectedVillage.name}</span>}
            </h2>
            <span className="text-xs text-slate-500">Rê chuột hoặc nhấp vào biểu tượng để xem thông tin</span>
          </div>

          <div className="w-full h-[660px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
            
            {/* Nút chọn kiểu bản đồ kiểu Google Maps (Hover xổ ra ở góc trên bên phải) */}
            <div className="absolute top-3 right-3 z-[1000] group">
              <div className="bg-white hover:bg-slate-50 w-10 h-10 rounded-lg shadow-md border border-slate-300 flex items-center justify-center cursor-pointer transition text-lg select-none">
                🗺️
              </div>

              <div className="absolute right-0 top-0 hidden group-hover:flex bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-xl border border-slate-300 flex-row gap-1.5 items-center">
                <button 
                  onClick={() => setMapStyle('colored')} 
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition whitespace-nowrap ${mapStyle === 'colored' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  🗺️ Bản đồ màu
                </button>
                <button 
                  onClick={() => setMapStyle('satellite')} 
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition whitespace-nowrap ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  🛰️ Vệ tinh
                </button>
              </div>
            </div>

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
              
              {/* Ranh giới tổng của Xã */}
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

              {/* PHÂN VÙNG THÔN ĐƯỢC CHỌN (SÁNG RỰC LÊN KHI CLICK) */}
              {selectedVillage && selectedVillage.boundary && (
                <Polygon
                  positions={selectedVillage.boundary}
                  pathOptions={{
                    color: '#f59e0b',
                    weight: 4,
                    fillColor: selectedVillage.color || '#3b82f6',
                    fillOpacity: 0.55 // Làm cho vùng sáng rực hơn hẳn so với nền
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[180px]">
                      <h3 className="font-bold text-blue-900 text-sm">📍 {selectedVillage.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">Diện tích: {selectedVillage.area}</p>
                      <p className="text-xs text-slate-600">Số hộ: {selectedVillage.households} | Khẩu: {selectedVillage.population}</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {/* Hiển thị các điểm đánh dấu địa điểm dịch vụ */}
              {filteredLocations.map((loc) => {
                const isSelected = mapCenter && mapCenter[0] === loc.lat && mapCenter[1] === loc.lng;
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;

                return (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={createPinIcon(loc, isSelected)}
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