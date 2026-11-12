import React, { useMemo, useState } from 'react';

export default function LocationManagement({ locations = [], categories = [], onAddLocation, onUpdateLocation, onDeleteLocation }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: categories.length > 0 ? categories[0].id : 'admin',
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

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({ 
      name: '', 
      category: categories.length > 0 ? categories[0].id : 'admin', 
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
      category: loc.type || loc.category || (categories.length > 0 ? categories[0].id : 'admin'),
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
        alert(`⚠️ Ảnh "${file.name}" có dung lượng lớn (>1.5MB). Vui lòng chọn ảnh nhẹ hơn.`);
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

  const filteredLocations = useMemo(() => {
    const keyword = searchTerm.trim().toLocaleLowerCase('vi');
    return locations.filter(loc => {
      const categoryId = loc.type || loc.category || '';
      const matchesCategory = categoryFilter === 'all' || String(categoryId) === String(categoryFilter);
      const matchesSearch = !keyword || [loc.name, loc.address, loc.phone, loc.desc, loc.info]
        .filter(Boolean).some(value => String(value).toLocaleLowerCase('vi').includes(keyword));
      return matchesCategory && matchesSearch;
    });
  }, [locations, categoryFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLocations = filteredLocations.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstItem = filteredLocations.length ? (safePage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(safePage * pageSize, filteredLocations.length);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm font-sans">
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

      <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] gap-3 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Phân loại địa điểm</label>
          <select 
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer font-semibold text-blue-900"
  >
    {categories.length > 0 ? (
      categories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.icon ? `${cat.icon} ` : ''}{cat.label}
        </option>
      ))
    ) : (
      <option value="admin">Cơ sở hành chính</option>
    )}
  </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Tìm kiếm địa điểm</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Tên địa điểm, địa chỉ, số điện thoại..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={() => { setCategoryFilter('all'); setSearchTerm(''); setCurrentPage(1); }} className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs whitespace-nowrap cursor-pointer">
            Đặt lại lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                <th className="p-3 font-bold w-[28%]">Tên & Danh mục</th>
                <th className="p-3 font-bold w-[25%]">Giới thiệu & Quy mô</th>
                <th className="p-3 font-bold w-[22%]">Thời gian hoạt động & Liên hệ</th>
                <th className="p-3 font-bold w-[15%]">Hình ảnh & QR</th>
                <th className="p-3 font-bold text-center w-[10%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {paginatedLocations.map(loc => {
                let locImages = [];
                if (loc.images) {
                  if (Array.isArray(loc.images)) locImages = [...loc.images];
                  else if (typeof loc.images === 'object') locImages = Object.values(loc.images);
                }
                if (locImages.length === 0) {
                  locImages = [loc.mediaUrl || loc.image || loc.imageUrl].filter(Boolean);
                }

                const descriptionText = loc.desc || loc.info;

                return (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition align-top">
                    <td className="p-3 space-y-1">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[11px] border border-blue-100">
                        {getCategoryLabel(loc.type || loc.category)}
                      </span>
                      <div className="font-extrabold text-slate-900 text-sm leading-snug">{loc.name}</div>
                      <div className="text-slate-500 font-medium">📍 {loc.address || 'Xã Thạch Khê'}</div>
                    </td>
                    <td className="p-3 space-y-1">
                      {descriptionText ? (
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">
                          <strong className="text-slate-900">Mô tả:</strong> {descriptionText}
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">Chưa có giới thiệu</p>
                      )}
                      {loc.scale && <div className="text-slate-600 font-medium">⚖️ <strong className="text-slate-800">Quy mô:</strong> {loc.scale}</div>}
                    </td>
                    <td className="p-3 space-y-1">
                      <div className="text-slate-600">🕒 {loc.workingHours || '07:30 - 17:00 (Thứ 2 - Thứ 6)'}</div>
                      <div className="font-mono text-blue-600 font-semibold">📞 {loc.phone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="p-3 space-y-2">
                      {locImages.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[150px] pb-1">
                            {locImages.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`Media ${idx + 1}`} 
                                onClick={() => setPreviewImage(img)}
                                className="w-10 h-9 object-cover rounded-md border border-slate-200 cursor-pointer hover:opacity-80 shrink-0 shadow-2xs" 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-blue-700 font-bold block">({locImages.length} ảnh)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded block text-center w-fit">Chưa có ảnh</span>
                      )}

                      {loc.qrCode && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <img 
                            src={loc.qrCode} 
                            alt="QR" 
                            onClick={() => setPreviewImage(loc.qrCode)}
                            className="w-8 h-8 object-contain border bg-slate-50 rounded cursor-pointer p-0.5 shadow-2xs" 
                            title="Mã QR định vị"
                          />
                          <span className="text-[10px] text-purple-700 font-bold">Mã QR</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center space-x-1 whitespace-nowrap">
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
              {paginatedLocations.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">⌕</div>
                  <div className="font-semibold text-slate-600">Không tìm thấy địa điểm phù hợp</div>
                  <div className="text-xs mt-1">Thử thay đổi danh mục hoặc từ khóa tìm kiếm.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-slate-100 bg-slate-50/70 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
            <span>Hiển thị <strong className="text-slate-800">{firstItem}–{lastItem}</strong> / <strong className="text-slate-800">{filteredLocations.length}</strong> địa điểm</span>
            <label className="flex items-center gap-2">Số dòng:
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold cursor-pointer">
                {[10, 20, 30, 40, 50].map(size => <option key={size} value={size}>{size} / trang</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="h-8 px-3 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer">← Trước</button>
            <span className="font-semibold text-slate-600 tabular-nums">Trang {safePage} / {totalPages}</span>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="h-8 px-3 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer">Sau →</button>
          </div>
        </div>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-3xl space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">
                {editingLoc ? '✏️ Chỉnh Sửa Địa Điểm' : '➕ Thêm Địa Điểm Mới'}
              </h3>
              <button type="button" onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">📍</span>
                  <div><h4 className="font-bold text-slate-800 text-sm">Thông tin cơ bản</h4><p className="text-[11px] text-slate-400">Tên gọi và nhóm phân loại hiển thị trên bản đồ</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tên địa điểm <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ví dụ: Trường Mầm non Thạch Khê"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Danh mục:</label>
                    <select 
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer font-semibold text-blue-900"
                    >
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))
                      ) : (
                        <option value="admin">Cơ sở hành chính</option>
                      )}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">☎</span>
                  <div><h4 className="font-bold text-slate-800 text-sm">Thông tin liên hệ & hoạt động</h4><p className="text-[11px] text-slate-400">Địa chỉ thôn, số điện thoại, quy mô và thời gian phục vụ</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Địa chỉ / Thôn:</label>
                    <input 
                      type="text" 
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Ví dụ: Thôn Vĩnh Hòa"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Điện thoại liên hệ:</label>
                    <input 
                      type="text" 
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0239..."
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quy mô:</label>
                    <input 
                      type="text" 
                      value={form.scale}
                      onChange={(e) => setForm({ ...form, scale: e.target.value })}
                      placeholder="Ví dụ: 15 cán bộ, 20 lớp học"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Thời gian hoạt động:</label>
                    <input 
                      type="text" 
                      value={form.workingHours}
                      onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                      placeholder="07:30 - 17:00 (Thứ 2 - Thứ 6)"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">ℹ</span>
                  <div><h4 className="font-bold text-slate-800 text-sm">Nội dung giới thiệu</h4><p className="text-[11px] text-slate-400">Mô tả chi tiết về lịch sử hoặc chức năng</p></div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới thiệu chung:</label>
                  <textarea 
                    rows="3"
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    placeholder="Thông tin chi tiết giới thiệu về địa điểm..."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  ></textarea>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold">⌖</span>
                  <div><h4 className="font-bold text-slate-800 text-sm">Vị trí trên bản đồ</h4><p className="text-[11px] text-slate-400">Tọa độ GPS định vị chính xác</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vĩ độ (Latitude):</label>
                    <input 
                      type="text" 
                      value={form.lat}
                      onChange={(e) => setForm({ ...form, lat: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kinh độ (Longitude):</label>
                    <input 
                      type="text" 
                      value={form.lng}
                      onChange={(e) => setForm({ ...form, lng: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/70 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-mono"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">🖼️</span>
                  <div><h4 className="font-bold text-slate-800 text-sm">Hình ảnh & Mã QR</h4><p className="text-[11px] text-slate-400">Ảnh đầu tiên sẽ làm ảnh đại diện</p></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Bộ sưu tập hình ảnh địa điểm (Chọn nhiều ảnh):</label>
                    <span className="text-[10px] text-blue-600 font-bold">{form.images.length} ảnh đã chọn</span>
                  </div>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImagesUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingMedia && <p className="text-[10px] text-blue-600 animate-pulse mt-1">Đang tải và xử lý hình ảnh...</p>}

                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {form.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border shadow-2xs">
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
                              Đại diện
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã QR riêng (Không bắt buộc):</label>
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
                    <span className="text-[10px] text-slate-400 block mt-1">Nếu không tải ảnh QR, hệ thống sẽ tự động sinh mã QR chuẩn theo thông tin.</span>
                  )}
                </div>
              </section>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition cursor-pointer"
                >
                  {editingLoc ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="sm:min-w-24 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-3 rounded-xl transition cursor-pointer"
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
            <button type="button" onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 bg-white text-black font-bold px-3 py-1 rounded-full text-sm cursor-pointer shadow">✕ Đóng</button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}