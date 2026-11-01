import React from 'react';

export default function SearchProgressModal({ 
  isOpen, 
  onClose, 
  searchPhone, 
  setSearchPhone, 
  onSearchSubmit, 
  searchResult 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-blue-900">🔍 Tra Cứu Tiến Độ Xử Lý Phản Ánh</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-600 font-bold">✕</button>
        </div>
        <p className="text-sm text-slate-600 mb-4">Nhập số điện thoại anh/chị đã dùng khi gửi phản ánh để kiểm tra tiến độ giải quyết từ UBND xã.</p>
        
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input 
            type="text" 
            value={searchPhone} 
            onChange={(e) => setSearchPhone(e.target.value)} 
            placeholder="Nhập số điện thoại (ví dụ: 0912345678)" 
            required
            className="min-h-11 flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <button type="submit" className="min-h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow">Tra cứu</button>
        </form>

        {searchResult !== null && (
          <div className="space-y-3 max-h-64 overflow-y-auto pt-2 border-t border-slate-100 text-sm">
            {searchResult.length === 0 ? (
              <p className="text-center text-slate-400 py-4">Không tìm thấy phản ánh nào với số điện thoại này.</p>
            ) : (
              searchResult.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900">{item.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-700"><strong>Nội dung:</strong> {item.content}</p>
                  {item.note && <p className="text-emerald-700 font-medium bg-emerald-50 p-1.5 rounded">📝 Xã phản hồi: {item.note}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}