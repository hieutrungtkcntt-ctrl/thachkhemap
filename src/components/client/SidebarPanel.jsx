import React from 'react';
import { villagesData } from '../../data';

export default function SidebarPanel({ 
  navigatingTarget, 
  onCloseNavigation, 
  routeDistance, 
  routeDuration, 
  activeTab, 
  selectedVillage, 
  onSelectVillage, 
  searchTerm, 
  setSearchTerm, 
  filteredLocations, 
  locations, 
  selectedLocation, 
  onSelectLocation, 
  onDirectGPSRoute, 
  getCategoryName 
}) {
  return (
    <div className="w-full md:w-96 bg-white border-r border-slate-200 p-4 flex flex-col gap-3 shadow-sm z-10">
      {navigatingTarget ? (
        <div className="bg-blue-50/90 p-3.5 rounded-xl border border-blue-200 flex flex-col gap-2 shadow-2xs">
          <div className="flex justify-between items-center border-b border-blue-200 pb-2">
            <h3 className="font-bold text-blue-900 text-xs">🧭 Hướng dẫn chỉ đường GPS</h3>
            <button onClick={onCloseNavigation} className="text-xs text-slate-400 hover:text-red-600 font-bold">✕ Đóng</button>
          </div>
          <p className="font-bold text-xs text-blue-900">{navigatingTarget.name}</p>
          {routeDistance && (
            <div className="flex gap-3 text-emerald-800 font-bold text-xs bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
              <span>📏 {routeDistance} km</span>
              <span>⏱️ ~{routeDuration} phút</span>
            </div>
          )}
        </div>
      ) : activeTab === 'villages' ? (
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-220px)] pr-1">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Danh sách 11 thôn trên địa bàn</h3>
          {villagesData.map(village => {
            const isSelected = selectedVillage?.id === village.id;
            return (
              <div 
                key={village.id}
                onClick={() => onSelectVillage(village)}
                className={`p-3 border rounded-xl transition cursor-pointer flex flex-col gap-2 ${isSelected ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: village.color || '#3b82f6' }}></span>
                    <h4 className="font-bold text-xs text-blue-900">{village.name}</h4>
                  </div>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-medium">{village.area}</span>
                </div>
                <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-slate-100">
                  <div>Số hộ: <strong className="text-slate-900">{village.households}</strong></div>
                  <div>Nhân khẩu: <strong className="text-slate-900">{village.population}</strong></div>
                </div>
                
                {/* Hiển thị đầy đủ bộ 3 cán bộ phụ trách thôn */}
                <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-100 flex flex-col gap-1">
                  <div>
                    <span className="text-slate-400">🔹 Bí thư:</span> <strong className="text-slate-800">{village.partySecretary || 'Đang cập nhật'}</strong> {village.secPhone && village.secPhone !== '---' && <span className="text-blue-600 font-mono">({village.secPhone})</span>}
                  </div>
                  <div>
                    <span className="text-slate-400">🔸 Thôn trưởng:</span> <strong className="text-slate-800">{village.leader || 'Đang cập nhật'}</strong> {village.leadPhone && village.leadPhone !== '---' && <span className="text-blue-600 font-mono">({village.leadPhone})</span>}
                  </div>
                  <div>
                    <span className="text-slate-400">🔸 UBMTTQ:</span> <strong className="text-slate-800">{village.fatherlandFront || 'Đang cập nhật'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🔍 Tìm kiếm nhanh</span>
            <input 
              type="text" 
              placeholder="Nhập tên địa điểm cần tìm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">📍 Tất cả địa điểm ({filteredLocations.length} / {locations.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-290px)] pr-1">
            {filteredLocations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Không tìm thấy địa điểm phù hợp.</p>
            ) : (
              filteredLocations.map(loc => (
                <div 
                  key={loc.id} 
                  className={`p-3 border rounded-xl transition flex flex-col gap-2 ${selectedLocation?.id === loc.id ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-300' : 'bg-slate-50 hover:bg-blue-50/40 border-slate-200'}`}
                >
                  <div className="cursor-pointer" onClick={() => onSelectLocation(loc)}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-xs">{loc.name}</h3>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">{getCategoryName(loc.type)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{loc.info}</p>
                  </div>

                  <button
                    onClick={() => onDirectGPSRoute(loc.lat, loc.lng, loc)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    🧭 Chỉ đường đường bộ (GPS)
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}