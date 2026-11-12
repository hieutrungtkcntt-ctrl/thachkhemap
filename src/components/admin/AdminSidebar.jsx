import React from 'react';

export default function AdminSidebar({ activeTab, setActiveTab, totalReports, pendingCount, currentUser, onLogout }) {
  return (
    <div className="w-full md:w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between gap-3 md:gap-0 p-3 sm:p-4 shadow-md">
      <div className="space-y-3 md:space-y-4">
        {/* Thông tin user đang đăng nhập */}
        <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div>
              <h2 className="font-bold text-white text-xs">{currentUser?.name || 'Quản Trị Viên'}</h2>
              <p className="text-[10px] text-blue-400 font-medium">
                {currentUser?.role === 'admin' ? 'Quyền: Admin' : 'Quyền: Xử lý'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto whitespace-nowrap text-xs font-medium md:flex-col md:space-y-1 md:overflow-visible scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
              activeTab === 'overview' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">📊 Tổng quan hệ thống</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
              activeTab === 'reports' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">🚨 Quản lý phản ánh</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('villages')}
            className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
              activeTab === 'villages' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">🏘️ Quản lý thôn & Cán bộ</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
              activeTab === 'locations' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">📍 Quản lý địa điểm</span>
          </button>

          {/* MỤC QUẢN LÝ TIN TỨC VỪA THÊM */}
          <button
            onClick={() => setActiveTab('news')}
            className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
              activeTab === 'news' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">📰 Quản lý Tin tức</span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-max md:w-full shrink-0 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition focus-visible:z-10 ${
                activeTab === 'accounts' ? 'bg-blue-600 text-white font-bold shadow' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">👥 Quản lý tài khoản</span>
            </button>
          )}
        </nav>
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-800 md:pt-4 md:flex-col">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 md:w-full text-xs py-2.5 px-3 rounded-xl font-medium transition flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <span>⚙️</span> Thông tin cá nhân & Mật khẩu
        </button>

        <button
          onClick={onLogout}
          className="flex-1 md:w-full bg-red-950/50 hover:bg-red-900 text-red-300 text-xs py-2.5 px-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          <span>🚪</span> Đăng xuất (Về trang chủ)
        </button>
      </div>
    </div>
  );
}