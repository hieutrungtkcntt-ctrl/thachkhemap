import React, { useState } from 'react';
import { communeInfo, villagesData, mapLocations, communeBoundary } from './data';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLocations = mapLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loc.info.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const centerPosition = [18.4250, 105.9300];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md py-4 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              🗺️ Bản đồ số & Đô thị thông minh Xã Thạch Khê
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1">
              Chuyên trách CNTT - UBND Xã Thạch Khê, Tỉnh Hà Tĩnh
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex gap-4 text-xs md:text-sm bg-blue-800 px-4 py-2 rounded-lg border border-blue-600 shadow-inner">
            <div>Diện tích: <strong className="text-white">{communeInfo.totalArea}</strong></div>
            <div>|</div>
            <div>Số hộ: <strong className="text-white">{communeInfo.totalHouseholds}</strong></div>
            <div>|</div>
            <div>Nhân khẩu: <strong className="text-white">{communeInfo.totalPopulation}</strong></div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Cột trái: Tra cứu & danh sách thôn xóm */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-700 mb-3 text-sm">🔍 Tra cứu điểm số & Cơ sở</h2>
            <input
              type="text"
              placeholder="Nhập tên địa điểm, cơ quan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tất cả</button>
              <button onClick={() => setSelectedCategory('admin')} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${selectedCategory === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🏛️ Hành chính</button>
              <button onClick={() => setSelectedCategory('school')} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${selectedCategory === 'school' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🏫 Giáo dục</button>
              <button onClick={() => setSelectedCategory('health')} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${selectedCategory === 'health' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🏥 Y tế</button>
              <button onClick={() => setSelectedCategory('culture')} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${selectedCategory === 'culture' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>⛩️ Văn hóa</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-700 mb-3 border-b pb-2 text-sm">📋 Danh sách Thôn / Xóm</h2>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {villagesData.map((village) => (
                <div key={village.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-300 transition">
                  <h3 className="font-bold text-blue-900 text-sm">{village.name}</h3>
                  <div className="text-xs text-slate-600 mt-1 grid grid-cols-2 gap-1">
                    <div>🏠 Số hộ: <strong>{village.households}</strong></div>
                    <div>👥 Nhân khẩu: <strong>{village.population}</strong></div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-200 flex flex-col gap-1">
                    <div>Bí thư: <span className="font-medium text-slate-700">{village.secretary}</span> ({village.secPhone})</div>
                    <div>Trưởng thôn: <span className="font-medium text-slate-700">{village.leader}</span> ({village.leadPhone})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Bản đồ hiển thị */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h2 className="font-semibold text-slate-700 mb-2 px-1 text-sm">🗺️ Bản đồ không gian Xã Thạch Khê</h2>
          <div className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
            <MapContainer 
              center={centerPosition} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ width: '100%', height: '100%' }}
            >
              {/* Sử dụng TileLayer tiêu chuẩn OpenStreetMap (miễn phí, không yêu cầu API Key) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Đường ranh giới hành chính xã Thạch Khê từ GeoJSON */}
              <Polygon 
                positions={communeBoundary} 
                pathOptions={{ color: '#1e3a8a', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2.5 }} 
              />

              {/* Các điểm ghim định vị bên trong */}
              {filteredLocations.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-blue-800 text-sm">{loc.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{loc.info}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

      </main>
    </div>
  );
}