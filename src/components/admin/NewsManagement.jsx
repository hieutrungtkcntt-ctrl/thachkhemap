import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function NewsManagement() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    category: 'thong-bao',
    summary: '',
    content: '',
    author: 'UBND xã Thạch Khê',
    date: new Date().toISOString().split('T')[0],
    thumbnail: '', // Ảnh đại diện
    gallery: [],   // Danh sách ảnh chi tiết kèm chú thích trong bài [{url: '', caption: ''}]
    isPinned: false
  });

  const categories = [
    { id: 'thong-bao', label: 'Thông báo hành chính' },
    { id: 'hoat-dong', label: 'Hoạt động địa phương' },
    { id: 'van-hoa', label: 'Văn hóa - Xã hội' },
    { id: 'an-ninh', label: 'An ninh - Trật tự' },
  ];

  const fetchNews = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "news"));
      const list = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNewsList(list);
    } catch (error) {
      console.error("Lỗi tải danh sách tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'thong-bao',
      summary: '',
      content: '',
      author: 'UBND xã Thạch Khê',
      date: new Date().toISOString().split('T')[0],
      thumbnail: '',
      gallery: [],
      isPinned: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      category: item.category || 'thong-bao',
      summary: item.summary || '',
      content: item.content || '',
      author: item.author || 'UBND xã Thạch Khê',
      date: item.date || new Date().toISOString().split('T')[0],
      thumbnail: item.thumbnail || '',
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      isPinned: item.isPinned || false
    });
    setIsModalOpen(true);
  };

  // Tải ảnh đại diện (Thumbnail)
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, thumbnail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Thêm một ảnh mới vào danh sách ảnh chi tiết trong bài (gallery)
  const handleAddGalleryItem = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        gallery: [...prev.gallery, { url: reader.result, caption: '' }]
      }));
    };
    reader.readAsDataURL(file);
  };

  // Cập nhật chú thích (caption) của ảnh trong gallery
  const handleGalleryCaptionChange = (index, newCaption) => {
    const updatedGallery = [...form.gallery];
    updatedGallery[index].caption = newCaption;
    setForm(prev => ({ ...prev, gallery: updatedGallery }));
  };

  // Xóa ảnh trong gallery
  const handleRemoveGalleryItem = (index) => {
    const updatedGallery = form.gallery.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, gallery: updatedGallery }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bản tin!');
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content: form.content.trim(),
        author: form.author.trim(),
        date: form.date,
        thumbnail: form.thumbnail.trim(),
        gallery: form.gallery,
        isPinned: Boolean(form.isPinned)
      };

      if (editingId) {
        const docRef = doc(db, "news", editingId);
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        alert('Cập nhật bản tin thành công!');
      } else {
        await addDoc(collection(db, "news"), { ...payload, createdAt: serverTimestamp() });
        alert('Đăng tải bản tin mới thành công!');
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error("Lỗi khi lưu bản tin:", error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản tin này không?')) return;
    try {
      await deleteDoc(doc(db, "news", id));
      alert('Đã xóa bản tin thành công!');
      fetchNews();
    } catch (error) {
      console.error("Lỗi xóa bản tin:", error);
      alert('Không thể xóa bản tin.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Bản tin & Thông báo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Đăng tải, chỉnh sửa và quản lý các thông báo hành chính, hoạt động của xã.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>➕</span>
          <span>Đăng bản tin mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-extrabold text-xs sm:text-sm text-slate-800">
          Danh sách bản tin ({newsList.length})
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Đang tải danh sách bản tin...</div>
        ) : newsList.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="p-4">Tiêu đề bản tin</th>
                  <th className="p-4">Chuyên mục</th>
                  <th className="p-4">Ngày đăng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {newsList.map(item => {
                  const catLabel = categories.find(c => c.id === item.category)?.label || item.category;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 font-extrabold text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[11px]">
                          {catLabel}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{item.date}</td>
                      <td className="p-4">
                        {item.isPinned ? (
                          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                            📌 Tiêu điểm
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Thường</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold transition cursor-pointer"
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
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">Chưa có bản tin nào trên hệ thống.</div>
        )}
      </div>

      {/* Modal Thêm / Sửa Bản tin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {editingId ? 'Chỉnh sửa bản tin' : 'Đăng tải bản tin mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Tiêu đề bản tin *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Ngày đăng</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Tóm tắt ngắn (Sapo)</label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })}
                  placeholder="Đoạn tóm tắt ngắn gọn hiển thị ngoài trang chủ..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Nội dung chi tiết văn bản *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Nhập nội dung chính của bản tin..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Phần quản lý ảnh minh họa đại diện */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Ảnh đại diện (Thumbnail)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {form.thumbnail && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border">
                    <img src={form.thumbnail} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* PHẦN QUAN TRỌNG: Thêm nhiều ảnh kèm chú thích chèn trong bài */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-sm">
                    🖼️ Thêm ảnh chi tiết kèm chú thích trong bài ({form.gallery.length})
                  </label>
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs">
                    + Thêm ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddGalleryItem}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {form.gallery.map((item, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <img src={item.url} alt={`Gallery ${index}`} className="w-24 h-16 object-cover rounded-lg border shrink-0" />
                      <div className="flex-1 w-full space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">Chú thích ảnh (Caption):</span>
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => handleGalleryCaptionChange(index, e.target.value)}
                          placeholder="Ví dụ: Đại biểu tham dự buổi lễ..."
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(index)}
                        className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  {form.gallery.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">Chưa có ảnh chi tiết nào được thêm vào bài viết.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 accent-blue-700 rounded cursor-pointer"
                />
                <label htmlFor="isPinned" className="font-extrabold text-slate-800 cursor-pointer">
                  Ghim làm tin nổi bật (Hiển thị to ở trang chủ)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition cursor-pointer shadow-xs"
                >
                  {editingId ? 'Lưu thay đổi' : 'Đăng bản tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}