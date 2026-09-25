import React, { useState } from 'react';

export default function AccountManagement({ accounts = [], onAddAccount, onUpdateAccount, onDeleteAccount }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);

  const [form, setForm] = useState({
    username: '',
    name: '',
    role: 'xuly', // Mặc định là quyền xử lý
    phone: '',
    email: '',
    password: '123'
  });

  const handleOpenAdd = () => {
    setEditingAcc(null);
    setForm({ username: '', name: '', role: 'xuly', phone: '', email: '', password: '123' });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAcc(acc);
    setForm({
      username: acc.username || '',
      name: acc.name || '',
      role: acc.role || 'xuly',
      phone: acc.phone || '',
      email: acc.email || '',
      password: acc.password || '123'
    });
    setIsOpenModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.name) {
      alert('Vui lòng nhập tên đăng nhập và họ tên!');
      return;
    }

    if (editingAcc) {
      onUpdateAccount({ ...editingAcc, ...form });
    } else {
      onAddAccount({ id: Date.now(), ...form });
    }
    setIsOpenModal(false);
  };

  return (
    <div className="p-6 space-y-4 text-xs max-h-[calc(100vh-60px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">👥 Quản Lý Tài Khoản & Phân Quyền</h1>
          <p className="text-slate-500 text-xs">Phân quyền tài khoản quản trị (Admin) và cán bộ (Xử lý), cấp lại mật khẩu từ dữ liệu gốc.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
        >
          <span>➕</span> Thêm tài khoản mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 font-bold">Họ tên / Tên đăng nhập</th>
                <th className="p-3 font-bold">Phân quyền</th>
                <th className="p-3 font-bold">Liên hệ (SĐT / Email)</th>
                <th className="p-3 font-bold">Mật khẩu</th>
                <th className="p-3 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{acc.name}</div>
                    <div className="font-mono text-[11px] text-blue-600">@{acc.username}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      acc.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {acc.role === 'admin' ? '👑 Admin (Toàn quyền)' : '⚡ Xử lý (Nghiệp vụ)'}
                    </span>
                  </td>
                  <td className="p-3 space-y-0.5">
                    <div>📞 {acc.phone || 'Chưa có SĐT'}</div>
                    <div className="text-slate-400">✉️ {acc.email || 'Chưa có email'}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    •••••• <button 
                      onClick={() => alert(`Mật khẩu của tài khoản @${acc.username} là: ${acc.password || '123'}`)}
                      className="text-blue-600 underline text-[10px] ml-1 font-semibold"
                    >Xem</button>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-semibold transition"
                    >
                      Sửa / Đổi MK
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${acc.username}" không?`)) {
                          onDeleteAccount(acc.id);
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

      {/* Modal Thêm / Sửa Tài khoản */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">
                {editingAcc ? '✏️ Chỉnh Sửa Tài Khoản & Phân Quyền' : '➕ Thêm Tài Khoản Mới'}
              </h3>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-red-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập (*):</label>
                  <input 
                    type="text" 
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="username..."
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân quyền hệ thống:</label>
                <select 
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold"
                >
                  <option value="admin">👑 Admin (Quản trị toàn bộ hệ thống)</option>
                  <option value="xuly">⚡ Xử lý (Xử lý phản ánh, địa điểm, thôn)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại:</label>
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0912..."
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email:</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@thachkhe.gov.vn"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới / Cấp lại:</label>
                <input 
                  type="text" 
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mật khẩu..."
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition"
                >
                  {editingAcc ? 'Lưu thay đổi' : 'Tạo tài khoản'}
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
    </div>
  );
}