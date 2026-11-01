import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../firebase';

export default function LocationDetailModal({
  isOpen = true,
  onClose,
  location,
  getCategoryName,
  onDirectGPSRoute
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Trích xuất và chuẩn hóa mảng ảnh siêu an toàn từ mọi định dạng Firestore trả về
  const galleryImages = useMemo(() => {
    if (!location) return [];

    let candidates = [];

    if (location.images) {
      if (Array.isArray(location.images)) {
        candidates = [...location.images];
      } else if (typeof location.images === 'object') {
        candidates = Object.values(location.images);
      }
    }

    if (location.photos) {
      if (Array.isArray(location.photos)) {
        candidates = [...candidates, ...location.photos];
      } else if (typeof location.photos === 'object') {
        candidates = [...candidates, ...Object.values(location.photos)];
      }
    }

    if (location.gallery) {
      if (Array.isArray(location.gallery)) {
        candidates = [...candidates, ...location.gallery];
      } else if (typeof location.gallery === 'object') {
        candidates = [...candidates, ...Object.values(location.gallery)];
      }
    }

    candidates = [
      ...candidates,
      location.mediaUrl,
      location.image,
      location.imageUrl,
      location.photo,
      location.photoUrl,
      location.thumbnail
    ];

    const urls = candidates
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return (item.url || item.src || item.imageUrl || item.photoUrl || item.image || '').trim();
        }
        return '';
      })
      .filter((url) => {
        if (!url) return false;
        const lower = url.toLowerCase();
        return (
          lower !== 'null' &&
          lower !== 'undefined' &&
          lower !== '' &&
          !lower.endsWith('/null') &&
          !lower.endsWith('/undefined')
        );
      });

    return [...new Set(urls)];
  }, [location]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [location]);

  // Tự động chuyển ảnh slideshow nhẹ nhàng khi có từ 2 ảnh trở lên
  useEffect(() => {
    if (!isOpen || galleryImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % galleryImages.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isOpen, galleryImages]);

  if (!isOpen || !location) return null;

  const lat = location.lat || '18.4250';
  const lng = location.lng || '105.9550';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  const showPreviousImage = () => {
    setActiveImageIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % galleryImages.length);
  };

  const categoryLabel = typeof getCategoryName === 'function' 
    ? getCategoryName(location.type || location.category) 
    : (location.type || location.category || 'Địa điểm khác');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header xanh đậm */}
        <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between relative shrink-0">
          <div className="space-y-1.5 pr-8">
            <h2 className="text-base sm:text-lg font-extrabold tracking-wide leading-snug">{location.name}</h2>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <span>★</span><span>★</span><span>★</span><span className="text-slate-400">★</span><span className="text-slate-400">★</span>
            </div>
            <div>
              <span className="inline-block text-[11px] bg-white/10 text-slate-200 px-3 py-0.5 rounded-full font-semibold">
                🏷️ Lĩnh vực: {categoryLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition absolute top-4 right-4 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Nội dung cuộn chính */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm scrollbar-thin">

          {/* KHUNG TRÌNH DIỄN HÌNH ẢNH */}
          <section className="space-y-2.5" aria-label="Thư viện hình ảnh địa điểm">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span>🖼️</span> Hình ảnh địa điểm {galleryImages.length > 0 ? `(${galleryImages.length} ảnh)` : ''}
              </h3>
            </div>

            {galleryImages.length > 0 ? (
              <div className="space-y-2">
                {/* Ảnh chính tỷ lệ cân đối 16:10 */}
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                  <img
                    key={galleryImages[activeImageIndex]}
                    src={galleryImages[activeImageIndex]}
                    alt={`${location.name} ảnh ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    onError={(event) => {
                      event.currentTarget.parentElement.style.display = 'none';
                    }}
                  />

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Ảnh trước"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-base flex items-center justify-center shadow transition cursor-pointer"
                      >‹</button>
                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Ảnh tiếp theo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-base flex items-center justify-center shadow transition cursor-pointer"
                      >›</button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 text-white px-3 py-0.5 text-[10px] font-bold tracking-wide">
                        {activeImageIndex + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Danh sách ảnh thu nhỏ (Thumbnails) cân đối */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                    {galleryImages.map((imageUrl, index) => (
                      <button
                        type="button"
                        key={`${imageUrl}-${index}`}
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Xem ảnh ${index + 1}`}
                        className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shadow-2xs ${
                          activeImageIndex === index
                            ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* KHUNG THÔNG BÁO KHI CHƯA CÓ ẢNH */
              <div className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-6 shadow-inner">
                <span className="text-3xl mb-2 opacity-80">📷</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">Ảnh đang được bổ sung</span>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Hình ảnh thực tế của địa điểm này sẽ sớm được cập nhật đồng bộ lên hệ thống.
                </p>
              </div>
            )}
          </section>

          {/* DANH SÁCH THÔNG TIN CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            <div className="flex items-start gap-3.5 p-3.5">
              <span className="text-base text-slate-400 mt-0.5">📞</span>
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Số điện thoại liên hệ</span>
                <a href={`tel:${location.phone || ''}`} className="font-bold text-blue-600 hover:underline text-xs sm:text-sm mt-0.5 inline-block">
                  {location.phone || 'Đang cập nhật'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5">
              <span className="text-base text-slate-400 mt-0.5">📍</span>
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Địa bàn hoạt động</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 inline-block">{location.village || location.locationName || location.address || 'Xã Thạch Khê'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5">
              <span className="text-base text-slate-400 mt-0.5">🗺️</span>
              <div className="flex-1">
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Vị trí / Tọa độ GPS</span>
                <div className="font-medium text-slate-800 text-xs sm:text-sm mt-0.5">
                  Định vị: <span className="font-mono font-bold text-slate-900">{lat}, {lng}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onDirectGPSRoute === 'function') {
                      onDirectGPSRoute(lat, lng, location);
                    }
                    onClose();
                  }}
                  className="text-blue-600 hover:underline font-extrabold text-xs mt-1.5 inline-flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg transition"
                >
                  🧭 Xem bản đồ định vị GPS
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5">
              <span className="text-base text-slate-400 mt-0.5">⏰</span>
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Thời gian hoạt động</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 inline-block">{location.workingHours || location.openTime || '7:30 - 17:00'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5">
              <span className="text-base text-slate-400 mt-0.5">🏷️</span>
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Thông tin chi tiết / Ghi chú</span>
                <span className="text-slate-600 text-xs sm:text-sm mt-0.5 inline-block leading-relaxed">{location.description || location.info || location.desc || 'Hỗ trợ 24/7'}</span>
              </div>
            </div>
          </div>

          {/* VỊ TRÍ ĐÁNH DẤU TRÊN BẢN ĐỒ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>📍</span> Vị trí đánh dấu trên bản đồ
              </h3>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Mở bằng Google Maps ↗
              </a>
            </div>
            <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
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
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 text-center space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <span>📱</span> Chia sẻ dịch vụ
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Quét mã QR để truy cập</span>
            </div>

            <div className="max-w-[260px] mx-auto bg-gradient-to-b from-[#991b1b] to-[#0f172a] rounded-2xl p-4 text-white shadow-md space-y-3">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-red-200">
                Cổng thông tin địa bàn và dịch vụ tiện ích
              </div>
              <div className="bg-white p-2.5 rounded-xl w-32 h-32 mx-auto flex items-center justify-center shadow">
                <img
                  src={location.qrCode && location.qrCode.trim() !== '' ? location.qrCode : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-extrabold text-xs tracking-wide uppercase text-amber-300 truncate">
                {location.name}
              </div>
              <div className="text-[9px] text-slate-300 border-t border-white/10 pt-1.5">
                Quét mã QR để xem thông tin dịch vụ
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto">
              Mã QR chia sẻ thông tin <strong className="text-slate-700">{location.name}</strong>. Người dùng có thể quét mã trực tiếp bằng điện thoại.
            </p>

            <button
              type="button"
              onClick={() => alert('Chức năng tải về mã QR đang được thực hiện!')}
              className="inline-flex items-center justify-center gap-2 bg-[#0f2942] hover:bg-[#1e3a8a] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow transition cursor-pointer"
            >
              📥 Tải về mã QR
            </button>
          </div>

        </div>

        {/* Footer đóng modal */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition text-xs sm:text-sm cursor-pointer shadow-2xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}