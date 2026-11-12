import React, { useState } from 'react';

export default function VillageManagement({ villages = [], onAddVillage, onUpdateVillage, onDeleteVillage }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    area: '',
    households: '',
    population: '',
    leader: '',
    leadPhone: '',
    partySecretary: '',
    secPhone: '',
    frontLeader: '',
    frontPhone: '',
    infor: '',
    color: '#0d9488',
    slug: ''
  });

  const handleOpenAdd = () => {
    setEditingVillage(null);
    setForm({
      name: '',
      area: '',
      households: '',
      population: '',
      leader: '',
      leadPhone: '',
      partySecretary: '',
      secPhone: '',
      frontLeader: '',
      frontPhone: '',
      infor: '',
      color: '#0d9488',
      slug: ''
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVillage(v);
    setForm({
      name: v.name || '',
      area: v.area || '',
      households: v.households || '',
      population: v.population || '',
      leader: v.leader || '',
      leadPhone: v.leadPhone || '',
      partySecretary: v.partySecretary || '',
      secPhone: v.secPhone || '',
      frontLeader: v.frontLeader || '',
      frontPhone: v.frontPhone || '',
      infor: v.infor || '',
      color: v.color || '#0d9488',
      slug: v.slug || ''
    });
    setIsOpenModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('Vui lòng nhập tên thôn!');
      return;
    }

    const payload = {
      ...form,
      households: form.households !== '' ? Number(form.households) : 0,
      population: form.population !== '' ? Number(form.population) : 0,
      slug: form.slug || form.name.toLowerCase().replace(/đ/g, 'd').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')
    };

    if (editingVillage) {
      onUpdateVillage({ ...editingVillage, ...payload });
    } else {
      onAddVillage({ id: Date.now(), ...payload });
    }
    setIsOpenModal(false);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">🏘️ Quản Lý Thông Tin Thôn & Cán Bộ Phụ Trách</h1>
          <p className="text-slate-500 text-xs">Dữ liệu được đồng bộ trực tiếp từ cơ sở dữ liệu Firebase Firestore.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
        >
          <span>➕</span> Thêm thôn mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {(!villages || villages.length === 0) ? (
          <div className="text-center py-12 text-slate-400">Chưa có dữ liệu thôn nào trên hệ thống.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <th className="p-3 font-bold">Tên thôn / Diện tích</th>
                  <th className="p-3 font-bold">Quy mô dân cư</th>
                  <th className="p-3 font-bold">Cán bộ phụ trách (Thôn trưởng / Bí thư / Mặt trận)</th>
                  <th className="p-3 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {villages.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: v.color || '#0d9488' }} />
                        <span className="font-bold text-blue-900 text-sm">{v.name}</span>
                      </div>
                      <div className="text-slate-500 font-medium mt-0.5">Diện tích: {v.area || 'Đang cập nhật'}</div>
                      {v.slug && <div className="text-[10px] text-slate-400 font-mono">slug: {v.slug}</div>}
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div>🏠 Số hộ: <strong className="text-slate-900">{v.households || 0}</strong></div>
                      <div>👥 Nhân khẩu: <strong className="text-slate-900">{v.population || 0}</strong></div>
                    </td>
                    <td className="p-3 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">🔹 Thôn trưởng:</span> 
                        <strong className="text-slate-800">{v.leader || 'Đang cập nhật'}</strong> 
                        {v.leadPhone && <span className="text-blue-600 font-mono">({v.leadPhone})</span>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">🔸 Bí thư chi bộ:</span> 
                        <strong className="text-slate-800">{v.partySecretary || 'Đang cập nhật'}</strong> 
                        {v.secPhone && <span className="text-blue-600 font-mono">({v.secPhone})</span>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">🔸 UBMTTQ:</span> 
                        <strong className="text-slate-800">{v.frontLeader || 'Đang cập nhật'}</strong>
                        {v.frontPhone && <span className="text-blue-600 font-mono">({v.frontPhone})</span>}
                      </div>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa thông tin thôn "${v.name}" không?`)) {
                            onDeleteVillage(v.id);
                          }
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa thôn */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">
                {editingVillage ? '✏️ Chỉnh Sửa Thông Tin Thôn' : '➕ Thêm Thôn Mới'}
              </h3>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên thôn (*):</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Trường Xuân"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diện tích (area):</label>
                  <input 
                    type="text" 
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="249,3 ha"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Màu sắc (color):</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={form.color || '#0d9488'}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 p-1 border rounded-xl cursor-pointer bg-slate-50"
                    />
                    <input 
                      type="text" 
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="#0ff54"
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tổng số hộ (households):</label>
                  <input 
                    type="number" 
                    value={form.households}
                    onChange={(e) => setForm({ ...form, households: e.target.value })}
                    placeholder="394"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tổng nhân khẩu (population):</label>
                  <input 
                    type="number" 
                    value={form.population}
                    onChange={(e) => setForm({ ...form, population: e.target.value })}
                    placeholder="1682"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thông tin / Giới thiệu thôn (infor):</label>
                <textarea 
                  rows={2}
                  value={form.infor}
                  onChange={(e) => setForm({ ...form, infor: e.target.value })}
                  placeholder="Lịch sử hình thành, đặc điểm..."
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="border-t pt-3 space-y-2.5">
                <h4 className="font-bold text-slate-800">Cán bộ phụ trách thôn:</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Thôn trưởng (leader):</label>
                    <input 
                      type="text" 
                      value={form.leader}
                      onChange={(e) => setForm({ ...form, leader: e.target.value })}
                      placeholder="Họ tên thôn trưởng..."
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">SĐT Thôn trưởng (leadPhone):</label>
                    <input 
                      type="text" 
                      value={form.leadPhone}
                      onChange={(e) => setForm({ ...form, leadPhone: e.target.value })}
                      placeholder="0916924626"
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Bí thư chi bộ (partySecretary):</label>
                    <input 
                      type="text" 
                      value={form.partySecretary}
                      onChange={(e) => setForm({ ...form, partySecretary: e.target.value })}
                      placeholder="Họ tên bí thư..."
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">SĐT Bí thư (secPhone):</label>
                    <input 
                      type="text" 
                      value={form.secPhone}
                      onChange={(e) => setForm({ ...form, secPhone: e.target.value })}
                      placeholder="0394332405"
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">UBMTTQ / Ban CTMT (frontLeader):</label>
                    <input 
                      type="text" 
                      value={form.frontLeader}
                      onChange={(e) => setForm({ ...form, frontLeader: e.target.value })}
                      placeholder="Họ tên cán bộ mặt trận..."
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">SĐT UBMTTQ (frontPhone):</label>
                    <input 
                      type="text" 
                      value={form.frontPhone}
                      onChange={(e) => setForm({ ...form, frontPhone: e.target.value })}
                      placeholder="0373672246"
                      className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition cursor-pointer"
                >
                  {editingVillage ? 'Lưu thay đổi' : 'Thêm thôn mới'}
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
    </div>
  );
}