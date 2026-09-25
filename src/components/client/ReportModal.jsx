import React from 'react';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  reportForm, 
  setReportForm, 
  onOpenMapPicker, 
  onGetGPS, 
  detectedLocationName, 
  onHandleSubmit 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-xs">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-red-600">🚨 Gửi Phản Ánh Sự Cố Hạ Tầng</h3>
            <p className="text-[11px] text-slate-500">Thông tin phản ánh sẽ được gửi trực tiếp đến UBND xã Thạch Khê xử lý.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-600 font-bold text-sm">✕</button>
        </div>

        <form onSubmit={onHandleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên người gửi *</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={reportForm.sender}
                onChange={(e) => setReportForm({...reportForm, sender: e.target.value})}
                className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
              <input 
                type="tel" 
                required
                placeholder="Ví dụ: 0912345678"
                value={reportForm.phone}
                onChange={(e) => setReportForm({...reportForm, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lĩnh vực phản ánh</label>
            <select 
              value={reportForm.category}
              onChange={(e) => setReportForm({...reportForm, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Hạ tầng / Giao thông">🛣️ Hạ tầng / Giao thông</option>
              <option value="Môi trường / Rác thải">🗑️ Môi trường / Rác thải</option>
              <option value="Đất đai / Trật tự xây dựng">🏗️ Đất đai / Trật tự xây dựng</option>
              <option value="An ninh trật tự">🛡️ An ninh trật tự</option>
              <option value="Ý kiến khác">💡 Ý kiến khác</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết sự cố *</label>
            <textarea 
              rows="3" 
              required
              placeholder="Mô tả cụ thể vấn đề (Ví dụ: Ổ gà lớn tại tuyến đường thôn Nam Hải...)"
              value={reportForm.content}
              onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
              className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="font-semibold text-slate-700">📍 Tọa độ & Vị trí sự cố:</span>
              <div className="flex gap-1.5">
                <button 
                  type="button"
                  onClick={onGetGPS}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold shadow transition flex items-center gap-1 text-[11px]"
                >
                  <span>📍</span> Lấy GPS
                </button>
                <button 
                  type="button"
                  onClick={onOpenMapPicker}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg font-bold shadow transition flex items-center gap-1 text-[11px]"
                >
                  <span>🎯</span> Chọn trên bản đồ
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 font-mono bg-white p-2 rounded border">
              <div>Vĩ độ: <strong>{reportForm.lat}</strong></div>
              <div>Kinh độ: <strong>{reportForm.lng}</strong></div>
            </div>
            {detectedLocationName && (
              <div className="text-[11px] text-blue-800 font-semibold">
                🏠 Khu vực xác định: {detectedLocationName}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">📷 Hình ảnh hiện trường sự cố (nếu có)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setReportForm(prev => ({ ...prev, image: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer border rounded-xl bg-slate-50"
            />
            {reportForm.image && (
              <div className="mt-2 relative w-20 h-20">
                <img src={reportForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border shadow-2xs" />
                <button type="button" onClick={() => setReportForm(prev => ({ ...prev, image: null }))} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow">✕</button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium">Hủy bỏ</button>
            <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow">Gửi phản ánh</button>
          </div>
        </form>
      </div>
    </div>
  );
}