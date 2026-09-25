import React, { useState } from 'react';

export default function AdminProfile({ currentUser, onUpdateProfile }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSaveInfo = (e) => {
    e.preventDefault();
    onUpdateProfile({ ...currentUser, name, phone, email });
    alert('Cập nhật thông tin cá nhân thành công!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPass) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    onUpdateProfile({ ...currentUser, password: newPass });
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    alert('Đổi mật khẩu thành công!');
  };

  return (
    <div className="p-6 space-y-6 text-xs max-h-[calc(100vh-60px)] overflow-y-auto max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-slate-900">⚙️ Thông Tin Cá Nhân & Đổi Mật Khẩu</h1>
        <p className="text-slate-500 text-xs">Quản lý hồ sơ tài khoản đang đăng nhập và bảo mật mật khẩu hệ thống.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-bold text-blue-900 text-sm border-b pb-2">👤 Thông tin tài khoản</h2>
        <form onSubmit={handleSaveInfo} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập:</label>
              <input 
                type="text" 
                value={currentUser?.username || 'admin'} 
                disabled 
                className="w-full p-2.5 bg-slate-100 border rounded-xl font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại:</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition"
          >
            Lưu thông tin cá nhân
          </button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-bold text-blue-900 text-sm border-b pb-2">🔑 Đổi mật khẩu bảo mật</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại:</label>
            <input 
              type="password" 
              value={oldPass} 
              onChange={(e) => setOldPass(e.target.value)} 
              placeholder="••••••••"
              className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới:</label>
              <input 
                type="password" 
                value={newPass} 
                onChange={(e) => setNewPass(e.target.value)} 
                placeholder="••••••••"
                className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới:</label>
              <input 
                type="password" 
                value={confirmPass} 
                onChange={(e) => setConfirmPass(e.target.value)} 
                placeholder="••••••••"
                className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition"
          >
            Cập nhật mật khẩu mới
          </button>
        </form>
      </div>
    </div>
  );
}