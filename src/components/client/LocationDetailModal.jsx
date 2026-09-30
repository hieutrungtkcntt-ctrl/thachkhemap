import React from 'react';

export default function LocationDetailModal({ isOpen = true, onClose, location, getCategoryName, onDirectGPSRoute }) {
  if (!isOpen || !location) return null;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header xanh đậm */}
        <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between relative">
          <div className="space-y-1.5 pr-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">{location.name}</h2>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <span>★</span><span>★</span><span>★</span><span className="text-slate-400">★</span><span className="text-slate-400">★</span>
            </div>
            <div>
              <span className="inline-block text-[11px] bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                🏷️ Lĩnh vực: {typeof getCategoryName === 'function' ? getCategoryName(location.type) : location.type}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition absolute top-4 right-4"
          >
            ✕
          </button>
        </div>

        {/* Nội dung cuộn */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {location.image && (
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
              <img src={location.image} alt={location.name} className="w-full h-48 sm:h-64 object-cover" />
            </div>
          )}

          {/* Danh sách thông tin chi tiết */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs divide-y divide-slate-100">
            
            {/* Điện thoại */}
            <div className="flex items-start gap-3 p-3">
              <span className="text-base text-slate-400 mt-0.5">📞</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Số điện thoại liên hệ</span>
                <a href={`tel:${location.phone || ''}`} className="font-bold text-blue-600 hover:underline text-sm">
                  {location.phone || 'Đang cập nhật'}
                </a>
              </div>
            </div>

            {/* Địa bàn */}
            <div className="flex items-start gap-3 p-3">
              <span className="text-base text-slate-400 mt-0.5">📍</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Địa bàn hoạt động</span>
                <span className="font-semibold text-slate-800">{location.village || location.locationName || 'Xã Thạch Khê'}</span>
              </div>
            </div>

            {/* Tọa độ / Địa chỉ */}
            <div className="flex items-start gap-3 p-3">
              <span className="text-base text-slate-400 mt-0.5">🗺️</span>
              <div className="flex-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vị trí / Địa chỉ chi tiết</span>
                <div className="font-medium text-slate-800">
                  Định vị: <span className="font-mono text-slate-900">{location.lat}, {location.lng}</span>
                </div>
                <button
                  onClick={() => {
                    if (typeof onDirectGPSRoute === 'function') {
                      onDirectGPSRoute(location.lat, location.lng, location);
                    }
                    onClose();
                  }}
                  className="text-blue-600 hover:underline font-semibold text-xs mt-1 inline-flex items-center gap-1"
                >
                  🧭 Xem bản đồ định vị GPS
                </button>
              </div>
            </div>

            {/* Thời gian hoạt động */}
            <div className="flex items-start gap-3 p-3">
              <span className="text-base text-slate-400 mt-0.5">⏰</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thời gian hoạt động</span>
                <span className="font-semibold text-slate-800">{location.openTime || '7:00 - 22:00'}</span>
              </div>
            </div>

            {/* Ghi chú / Thông tin đặc trưng */}
            <div className="flex items-start gap-3 p-3">
              <span className="text-base text-slate-400 mt-0.5">🏷️</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thông tin đặc trưng / Ghi chú</span>
                <span className="text-slate-600">{location.description || location.info || 'Hỗ trợ 24/7'}</span>
              </div>
            </div>

          </div>

          {/* VỊ TRÍ ĐÁNH DẤU TRÊN BẢN ĐỒ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>📍</span> Vị trí đánh dấu trên bản đồ
              </h3>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Mở bằng Google Maps ↗
              </a>
            </div>
            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
              <iframe
                title="Google Map Marker"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapEmbedUrl}
                allowFullScreen=""
              ></iframe>
            </div>
          </div>

          {/* MÃ QR CHIA SẺ DỊCH VỤ */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 text-center space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <span>📱</span> Chia sẻ dịch vụ
              </span>
              <span className="text-[11px] text-slate-500">Quét mã QR để truy cập</span>
            </div>

            <div className="max-w-[260px] mx-auto bg-gradient-to-b from-[#991b1b] to-[#0f172a] rounded-xl p-4 text-white shadow-md space-y-3">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-red-200">
                Cổng thông tin địa bàn và dịch vụ tiện ích[cite: 4]
              </div>
              <div className="bg-white p-2.5 rounded-lg w-36 h-36 mx-auto flex items-center justify-center shadow">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-bold text-xs tracking-wide uppercase text-amber-300">
                {location.name}
              </div>
              <div className="text-[9px] text-slate-300 border-t border-white/10 pt-1.5">
                Quét mã QR để xem thông tin dịch vụ[cite: 4]
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Mã QR chia sẻ thông tin <strong className="text-slate-700">{location.name}</strong>[cite: 4]. Người dùng quét mã để xem chi tiết dịch vụ[cite: 4].
            </p>

            <button 
              onClick={() => alert('Chức năng tải về mã QR đang được thực hiện!')}
              className="inline-flex items-center justify-center gap-2 bg-[#0f2942] hover:bg-[#1e3a8a] text-white font-bold text-xs py-2 px-5 rounded-xl shadow transition"
            >
              📥 Tải về
            </button>
          </div>

        </div>

        {/* Footer đóng modal */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-5 rounded-xl transition text-xs sm:text-sm"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}