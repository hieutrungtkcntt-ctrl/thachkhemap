import React, { useState } from 'react';

export default function LocationManagement({ locations = [], categories = [], onAddLocation, onUpdateLocation, onDeleteLocation }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: categories.length > 0 ? categories[0].id : 'Hành chính',
    address: '',
    lat: '18.3950',
    lng: '105.9550',
    phone: '',
    desc: '',
    scale: '',            
    workingHours: '07:30 - 17:00 (Thứ 2 - Thứ 6)',
    images: [],           // Mảng chứa danh sách ảnh bộ sưu tập
    qrCode: ''            // QR code tách biệt hoàn toàn
  });

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({ 
      name: '', 
      category: categories.length > 0 ? categories[0].id : 'Hành chính', 
      address: '', 
      lat: '18.3950', 
      lng: '105.9550', 
      phone: '', 
      desc: '', 
      scale: '', 
      workingHours: '07:30 - 17:00 (Thứ 2 - Thứ 6)', 
      images: [], 
      qrCode: '' 
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    
    let allImages = [];
    if (loc.images) {
      if (Array.isArray(loc.images)) allImages = [...loc.images];
      else if (typeof loc.images === 'object') allImages = Object.values(loc.images);
    }
    if (Array.isArray(loc.photos)) allImages = [...allImages, ...loc.photos];
    if (Array.isArray(loc.gallery)) allImages = [...allImages, ...loc.gallery];

    allImages = [
      ...allImages,
      loc.mediaUrl,
      loc.image,
      loc.imageUrl,
      loc.photo
    ];

    const cleanImages = [...new Set(
      allImages
        .map(item => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return (item.url || item.src || item.imageUrl || item.image || '').trim();
          }
          return '';
        })
        .filter(url => url && url.toLowerCase() !== 'null' && url.toLowerCase() !== 'undefined')
    )];

    setForm({
      name: loc.name || '',
      category: loc.type || loc.category || (categories.length > 0 ? categories[0].id : 'Hành chính'),
      address: loc.address || '',
      lat: loc.lat || '18.3950',
      lng: loc.lng || '105.9550',
      phone: loc.phone || '',
      desc: loc.desc || loc.info || '',
      scale: loc.scale || '',
      workingHours: loc.workingHours || '07:30 - 17:00 (Thứ 2 - Thứ 6)',
      images: cleanImages,
      qrCode: loc.qrCode || ''
    });
    setIsOpenModal(true);
  };

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingMedia(true);
    let processedCount = 0;
    const newImages = [];

    files.forEach((file) => {
      if (file.size > 1500 * 1024) {
        alert(`⚠️ Ảnh "${file.name}" có dung lượng hơi lớn (>1.5MB). Vui lòng chọn ảnh nhẹ hơn.`);
        processedCount++;
        if (processedCount === files.length) setUploadingMedia(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result);
        }
        processedCount++;
        if (processedCount === files.length) {
          setForm(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
          setUploadingMedia(false);
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === files.length) setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1000 * 1024) {
      alert('⚠️ Ảnh QR có dung lượng lớn (>1MB). Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    setUploadingQr(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, qrCode: reader.result }));
      setUploadingQr(false);
    };
    reader.onerror = () => {
      setUploadingQr(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('Vui lòng nhập tên địa điểm!');
      return;
    }

    const imagesArray = Array.isArray(form.images) ? form.images.filter(Boolean) : [];

    const payload = {
      ...form,
      type: form.category,
      mediaUrl: imagesArray.length > 0 ? imagesArray[0] : '',
      images: imagesArray
    };

    if (editingLoc) {
      onUpdateLocation({ ...editingLoc, ...payload });
    } else {
      onAddLocation({ id: Date.now(), ...payload });
    }
    setIsOpenModal(false);
  };

  const getCategoryLabel = (catId) => {
    const found = categories.find(c => String(c.id) === String(catId));
    return found ? found.label : catId;
  };

  return (
    <div className="p-6 space-y-4 text-xs max-h-[calc(100vh-60px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">📍 Quản Lý Danh Mục & Địa Điểm</h1>
          <p className="text-slate-500 text-xs">Quản lý địa điểm, cập nhật bộ sưu tập hình ảnh và mã QR trực tiếp vào cơ sở dữ liệu.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
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
                <th className="p-3 font-bold">Hình ảnh (Bộ sưu tập) / QR</th>
                <th className="p-3 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {locations.map(loc => {
                let locImages = [];
                if (loc.images) {
                  if (Array.isArray(loc.images)) locImages = [...loc.images];
                  else if (typeof loc.images === 'object') locImages = Object.values(loc.images);
                }
                if (locImages.length === 0) {
                  locImages = [loc.mediaUrl || loc.image || loc.imageUrl].filter(Boolean);
                }

                return (
                  <tr key={loc.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 space-y-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{getCategoryLabel(loc.type || loc.category)}</span>
                      <div className="font-bold text-slate-900 text-sm">{loc.name}</div>
                      <div className="text-slate-500">{loc.address || 'Xã Thạch Khê'}</div>
                    </td>
                    <td className="p-3 space-y-1 max-w-xs">
                      <p className="text-slate-700 line-clamp-2"><strong>Mô tả:</strong> {loc.desc || loc.info || 'Chưa có giới thiệu'}</p>
                      {loc.scale && <div className="text-slate-600"><strong>Quy mô:</strong> {loc.scale}</div>}
                    </td>
                    <td className="p-3 space-y-1">
                      <div>🕒 {loc.workingHours || '07:30 - 17:00 (Thứ 2 - Thứ 6)'}</div>
                      <div className="font-mono text-blue-600">📞 {loc.phone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="p-3 space-y-2">
                      {locImages.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[180px] pb-1">
                            {locImages.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`Media ${idx + 1}`} 
                                onClick={() => setPreviewImage(img)}
                                className="w-12 h-10 object-cover rounded border cursor-pointer hover:opacity-80 shrink-0 shadow-xs" 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-blue-600 font-extrabold block">({locImages.length} ảnh trong bộ sưu tập)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-1 rounded block text-center">Chưa có ảnh</span>
                      )}

                      {loc.qrCode && (
                        <img 
                          src={loc.qrCode} 
                          alt="QR" 
                          onClick={() => setPreviewImage(loc.qrCode)}
                          className="w-10 h-10 object-contain border bg-slate-50 rounded cursor-pointer mt-1" 
                          title="Mã QR định vị"
                        />
                      )}
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(loc)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa địa điểm "${loc.name}" không?`)) {
                            onDeleteLocation(loc.id);
                          }
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">
                {editingLoc ? '✏️ Chỉnh Sửa Địa Điểm' : '➕ Thêm Địa Điểm Mới'}
              </h3>
              <button type="button" onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
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
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))
                    ) : (
                      <>
                        <option value="Hành chính">Hành chính</option>
                        <option value="Y tế">Y tế</option>
                        <option value="Giáo dục">Giáo dục</option>
                        <option value="Văn hóa - Thể thao">Văn hóa - Thể thao</option>
                        <option value="Hạ tầng - Môi trường">Hạ tầng - Môi trường</option>
                        <option value="Du lịch - Di tích">Du lịch - Di tích</option>
                      </>
                    )}
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
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian hoạt động:</label>
                  <input 
                    type="text" 
                    value={form.workingHours}
                    onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    placeholder="07:30 - 17:00 (Thứ 2 - Thứ 6)"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
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

              <div className="space-y-3 border-t pt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">🖼️ Bộ sưu tập hình ảnh địa điểm (Chọn nhiều ảnh cùng lúc):</label>
                    <span className="text-[10px] text-blue-600 font-bold">{form.images.length} ảnh đã chọn</span>
                  </div>
                  
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImagesUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingMedia && <p className="text-[10px] text-blue-600 animate-pulse mt-1">Đang tải và xử lý hình ảnh bộ sưu tập...</p>}

                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {form.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border shadow-xs">
                          <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold opacity-80 hover:opacity-100 cursor-pointer shadow"
                            title="Xóa ảnh này"
                          >
                            ✕
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-blue-700/80 text-white text-[8px] text-center font-bold py-0.5">
                              Ảnh đại diện
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">🔲 Tải lên tệp Mã QR riêng (Không bắt buộc):</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  {uploadingQr && <p className="text-[10px] text-purple-600 animate-pulse mt-1">Đang xử lý mã QR...</p>}
                  {form.qrCode ? (
                    <div className="mt-2 flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-100">
                      <img src={form.qrCode} alt="QR Preview" className="w-10 h-10 object-contain bg-white border rounded" />
                      <span className="text-[11px] text-purple-700 font-bold">✓ Đã nạp mã QR thành công</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-1">Nếu không tải ảnh QR, hệ thống sẽ tự động sinh mã QR chuẩn theo thông tin địa điểm.</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition cursor-pointer"
                >
                  {editingLoc ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl">
            <button type="button" onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 bg-white text-black font-bold px-3 py-1 rounded-full text-sm cursor-pointer">✕ Đóng</button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border" />
          </div>
        </div>
      )}
    </div>
  );
}