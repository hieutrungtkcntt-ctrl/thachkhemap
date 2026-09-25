import React, { useState } from 'react';

export default function LocationManagement({ locations = [], onAddLocation, onUpdateLocation, onDeleteLocation }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Hành chính',
    address: '',
    lat: '18.3500',
    lng: '105.9000',
    phone: '',
    desc: '',
    scale: '',           
    workingHours: '07:30 - 17:00 (Thứ 2 - Thứ 6)', // Mặc định thời gian
    mediaUrl: '',        // Hình ảnh / Video
    qrCode: ''           // Mã QR
  });

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({ 
      name: '', category: 'Hành chính', address: '', lat: '18.3500', lng: '105.9000', 
      phone: '', desc: '', scale: '', workingHours: '07:30 - 17:00 (Thứ 2 - Thứ 6)', mediaUrl: '', qrCode: '' 
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setForm({
      name: loc.name || '',
      category: loc.category || 'Hành chính',
      address: loc.address || '',
      lat: loc.lat || '18.3500',
      lng: loc.lng || '105.9000',
      phone: loc.phone || '',
      desc: loc.desc || '',
      scale: loc.scale || '',
      workingHours: loc.workingHours || '07:30 - 17:00 (Thứ 2 - Thứ 6)',
      mediaUrl: loc.mediaUrl || '',
      qrCode: loc.qrCode || ''
    });
    setIsOpenModal(true);
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('Vui lòng nhập tên địa điểm!');
      return;
    }

    if (editingLoc) {
      onUpdateLocation({ ...editingLoc, ...form });
    } else {
      onAddLocation({ id: Date.now(), ...form });
    }
    setIsOpenModal(false);
  };

  return (
    <div className="p-6 space-y-4 text-xs max-h-[calc(100vh-60px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">📍 Quản Lý Danh Mục & Địa Điểm</h1>
          <p className="text-slate-500 text-xs">Quản lý danh mục gốc, tải lên hình ảnh/video, mã QR và thiết lập thời gian hoạt động linh hoạt.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
        >
          <span>➕</span> Thêm địa điểm mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 font-bold">Tên & Danh mục</th>
                <th className="p-3 font-bold">Giới thiệu & Quy mô</th>
                <th className="p-3 font-bold">Thời gian hoạt động & Liên hệ</th>
                <th className="p-3 font-bold">Hình ảnh / Mã QR</th>
                <th className="p-3 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 space-y-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{loc.category}</span>
                    <div className="font-bold text-slate-900 text-sm">{loc.name}</div>
                    <div className="text-slate-500">{loc.address || 'Xã Thạch Khê'}</div>
                  </td>
                  <td className="p-3 space-y-1 max-w-xs">
                    <p className="text-slate-700 line-clamp-2"><strong>Mô tả:</strong> {loc.desc || 'Chưa có giới thiệu'}</p>
                    {loc.scale && <div className="text-slate-600"><strong>Quy mô:</strong> {loc.scale}</div>}
                  </td>
                  <td className="p-3 space-y-1">
                    <div>🕒 {loc.workingHours || 'Giờ hành chính'}</div>
                    <div className="font-mono text-blue-600">📞 {loc.phone || 'Chưa cập nhật'}</div>
                  </td>
                  <td className="p-3 space-y-1">
                    {loc.mediaUrl && (
                      <img 
                        src={loc.mediaUrl} 
                        alt="Media" 
                        onClick={() => setPreviewImage(loc.mediaUrl)}
                        className="w-16 h-12 object-cover rounded border cursor-pointer hover:opacity-80" 
                      />
                    )}
                    {loc.qrCode && (
                      <img 
                        src={loc.qrCode} 
                        alt="QR" 
                        onClick={() => setPreviewImage(loc.qrCode)}
                        className="w-10 h-10 object-contain border bg-slate-50 rounded cursor-pointer" 
                      />
                    )}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-semibold transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa địa điểm "${loc.name}" không?`)) {
                          onDeleteLocation(loc.id);
                        }
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Địa Điểm */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">
                {editingLoc ? '✏️ Chỉnh Sửa Địa Điểm' : '➕ Thêm Địa Điểm Mới'}
              </h3>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-red-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên địa điểm (*):</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Trạm Y tế Xã Thạch Khê"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Danh mục:</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Hành chính">Hành chính</option>
                    <option value="Y tế">Y tế</option>
                    <option value="Giáo dục">Giáo dục</option>
                    <option value="Văn hóa - Thể thao">Văn hóa - Thể thao</option>
                    <option value="Hạ tầng - Môi trường">Hạ tầng - Môi trường</option>
                    <option value="Du lịch - Di tích">Du lịch - Di tích</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Địa chỉ:</label>
                  <input 
                    type="text" 
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Thôn..."
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điện thoại liên hệ:</label>
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0239..."
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quy mô:</label>
                  <input 
                    type="text" 
                    value={form.scale}
                    onChange={(e) => setForm({ ...form, scale: e.target.value })}
                    placeholder="Ví dụ: 15 cán bộ, 20 giường bệnh"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian hoạt động (Chọn hoặc nhập):</label>
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      value={form.workingHours}
                      onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                      placeholder="07:30 - 17:00 (Thứ 2 - Thứ 6)"
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="time" 
                      onChange={(e) => setForm({ ...form, workingHours: `${form.workingHours} (Cập nhật lúc ${e.target.value})` })}
                      className="p-2 border rounded-xl bg-slate-50 cursor-pointer"
                      title="Chọn giờ nhanh"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giới thiệu chung:</label>
                <textarea 
                  rows="2"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="Thông tin chi tiết giới thiệu về địa điểm..."
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vĩ độ (Lat):</label>
                  <input 
                    type="text" 
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kinh độ (Lng):</label>
                  <input 
                    type="text" 
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Tải lên Hình ảnh / Video và Mã QR */}
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tải lên Hình ảnh / Video:</label>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload('mediaUrl', e)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {form.mediaUrl && <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Đã tải tệp media</span>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tải lên Mã QR:</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload('qrCode', e)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  {form.qrCode && <span className="text-[10px] text-purple-600 font-bold block mt-1">✓ Đã tải mã QR</span>}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition"
                >
                  {editingLoc ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 bg-white text-black font-bold px-3 py-1 rounded-full text-sm">✕ Đóng</button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border" />
          </div>
        </div>
      )}
    </div>
  );
}