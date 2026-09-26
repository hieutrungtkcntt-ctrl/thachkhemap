import React, { useState, useEffect } from 'react';
import ClientHome from './components/ClientHome';
import AdminReports from './components/AdminReports';
import { mapLocations, villagesData, initialAccounts } from './data';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [currentView, setCurrentView] = useState('client'); // 'client', 'admin-login', 'admin'
  
  // Khởi tạo locations từ localStorage hoặc data.js
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('thachkhe_locations');
    return saved ? JSON.parse(saved) : mapLocations;
  });

  // Khởi tạo villages từ localStorage hoặc data.js
  const [villages, setVillages] = useState(() => {
    const saved = localStorage.getItem('thachkhe_villages');
    return saved ? JSON.parse(saved) : villagesData;
  });

  // Khởi tạo accounts từ localStorage hoặc data.js
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('thachkhe_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  // Lưu thông tin user đang đăng nhập
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('thachkhe_current_user');
    return saved ? JSON.parse(saved) : { name: 'Quản trị viên', role: 'admin', username: 'admin' };
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // KHỞI TẠO SẴN PHẢN ÁNH MẪU
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('thachkhe_reports');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1740000001001,
        sender: 'Nguyễn Văn Hùng',
        phone: '0912345678',
        category: 'Hạ tầng / Giao thông',
        content: 'Ổ gà lớn xuất hiện giữa đường liên thôn gây nguy hiểm cho người tham gia giao thông ban đêm.',
        lat: '18.3971',
        lng: '105.9433',
        locationName: 'Trường Xuân',
        time: '24/09/2026 14:30:00',
        status: 'Chờ xử lý',
        note: '',
        image: null,
        resultImage: null
      }
    ];
  });

  // Lưu localStorage
  useEffect(() => {
    localStorage.setItem('thachkhe_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('thachkhe_villages', JSON.stringify(villages));
  }, [villages]);

  useEffect(() => {
    localStorage.setItem('thachkhe_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('thachkhe_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('thachkhe_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Các hàm quản lý Địa điểm
  const handleAddLocation = (newLoc) => setLocations([newLoc, ...locations]);
  const handleUpdateLocation = (updatedLoc) => setLocations(locations.map(loc => loc.id === updatedLoc.id ? updatedLoc : loc));
  const handleDeleteLocation = (id) => setLocations(locations.filter(loc => loc.id !== id));

  // Các hàm quản lý Thôn
  const handleAddVillage = (newV) => setVillages([newV, ...villages]);
  const handleUpdateVillage = (updatedV) => setVillages(villages.map(v => v.id === updatedV.id ? updatedV : v));
  const handleDeleteVillage = (id) => setVillages(villages.filter(v => v.id !== id));

  // Các hàm quản lý Tài khoản
  const handleAddAccount = (newAcc) => setAccounts([newAcc, ...accounts]);
  const handleUpdateAccount = (updatedAcc) => setAccounts(accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a));
  const handleDeleteAccount = (id) => setAccounts(accounts.filter(a => a.id !== id));

  // Đăng nhập Admin
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const foundAcc = accounts.find(a => a.username === loginForm.username && a.password === loginForm.password);
    if (foundAcc) {
      setCurrentUser(foundAcc);
      setCurrentView('admin');
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  // Cập nhật trạng thái phản ánh
  const handleUpdateReportStatus = (id, newStatus, note, resultImage) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          status: newStatus, 
          note: note !== '' ? note : r.note,
          resultImage: resultImage !== undefined ? resultImage : r.resultImage,
          completedTime: newStatus === 'Đã hoàn thành' ? new Date().toLocaleString('vi-VN') : r.completedTime 
        };
      }
      return r;
    }));
  };

  if (currentView === 'admin-login') {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
          <button 
            onClick={() => { setCurrentView('client'); setLoginError(''); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm"
          >
            ✕
          </button>
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">Đăng Nhập Cổng Quản Trị</h2>
            <p className="text-xs text-slate-500 mt-1">Dành riêng cho cán bộ UBND xã Thạch Khê</p>
          </div>
          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium text-center">
              {loginError}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
              <input 
                type="text" 
                required 
                placeholder="Nhập tên đăng nhập..."
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3.5 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3.5 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl shadow transition text-xs"
              >
                Đăng Nhập Hệ Thống
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-[11px] text-slate-400 border-t pt-4">
            Tài khoản mẫu: <code className="text-slate-600 font-bold">admin</code> / <code className="text-slate-600 font-bold">123</code>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <AdminReports 
          reports={reports}
          onUpdateReportStatus={handleUpdateReportStatus}
          onLogout={() => setCurrentView('client')}
          currentUser={currentUser}
          onUpdateProfile={(updatedUser) => {
            setCurrentUser(updatedUser);
            setAccounts(accounts.map(a => a.id === updatedUser.id ? updatedUser : a));
          }}
          locations={locations}
          onAddLocation={handleAddLocation}
          onUpdateLocation={handleUpdateLocation}
          onDeleteLocation={handleDeleteLocation}
          villages={villages}
          onAddVillage={handleAddVillage}
          onUpdateVillage={handleUpdateVillage}
          onDeleteVillage={handleDeleteVillage}
          accounts={accounts}
          onAddAccount={handleAddAccount}
          onUpdateAccount={handleUpdateAccount}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    );
  }

  return (
    /* Khung bao bọc trang chủ Client bắt buộc phải có h-screen, w-screen và overflow-hidden để các thành phần con co giãn chuẩn tuyệt đối */
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans">
      <ClientHome 
        locations={locations}
        categories={[
          { id: 'all', label: 'Tất cả', icon: '📋' },
          { id: 'admin', label: 'Hành chính', icon: '🏛️' },
          { id: 'security', label: 'An ninh', icon: '🛡️' },
          { id: 'school', label: 'Giáo dục', icon: '🏫' },
          { id: 'health', label: 'Y tế', icon: '🏥' },
          { id: 'temple', label: 'Di tích - Tâm linh', icon: '🛕' },
          { id: 'culture', label: 'Nhà văn hóa', icon: '🏮' },
          { id: 'tourism', label: 'Khu du lịch', icon: '🏖️' },
          { id: 'restaurant', label: 'Nhà hàng', icon: '🍽️' },
          { id: 'hotel', label: 'Khách sạn', icon: '🏨' },
          { id: 'eco', label: 'Khu sinh thái', icon: '🌳' },
        ]}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onGoToAdmin={() => setCurrentView('admin-login')}
        onAddNewReport={(newRep) => setReports([newRep, ...reports])}
        reports={reports}
      />
    </div>
  );
}