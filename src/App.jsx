import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import ClientHome from './components/ClientHome';
import AdminReports from './components/AdminReports';
import 'leaflet/dist/leaflet.css';

const CATEGORIES = [
  { id: 'admin', label: 'Cơ sở hành chính', icon: '🏢', color: '#2563EB', active: true },
  { id: 'restaurant', label: 'Nhà hàng - Quán ăn', icon: '🍽️', color: '#EA580C', active: true },
  { id: 'market', label: 'Chợ', icon: '🏪', color: '#EA580C', active: true },
  { id: 'shopping-cart', label: 'Cửa hàng - Siệu thị', icon: '🛒', color: '#EA580C', active: true },
  { id: 'landmark', label: 'Di tích Văn hoá', icon: '🛕', color: '#D97706', active: true },
  { id: 'church', label: 'Cơ sở tín ngưỡng, tôn giáo', icon: '🏛️', color: '#D97706', active: true },
  { id: 'award', label: 'Sản phẩm Ocop', icon: '🏅', color: '#EA580C', active: true },
  { id: 'coffee', label: 'Quán cà phê', icon: '☕', color: '#EA580C', active: true },
  { id: 'fuel', label: 'Cửa hàng xăng dầu', icon: '⛽', color: '#EA580C', active: true },
  { id: 'users', label: 'Dịch vụ xã hội', icon: '🤝', color: '#2563EB', active: true },
  { id: 'hotel', label: 'Cơ sở lưu trú', icon: '🏨', color: '#D97706', active: true },
  { id: 'map-pin', label: 'Điểm du lịch', icon: '📍', color: '#D97706', active: true },
  { id: 'building-2', label: 'Khu kinh tế', icon: '🏭', color: '#059669', active: true },
  { id: 'sun', label: 'Bãi biển', icon: '🏖️', color: '#D97706', active: true },
  { id: 'briefcase', label: 'Hợp tác xã', icon: '🚜', color: '#EA580C', active: true },
  { id: 'calendar', label: 'Sự kiện lễ hội', icon: '🎪', color: '#D97706', active: true },
  { id: 'mail', label: 'Bưu chính chuyển phát', icon: '📮', color: '#2563EB', active: true },
  { id: 'leaf', label: 'Sinh thái môi trường', icon: '🌱', color: '#059669', active: true },
  { id: 'camera', label: 'Du lịch tham quan', icon: '📷', color: '#D97706', active: true },
  { id: 'bank', label: 'Ngân hàng - ATM', icon: '🏦', color: '#EA580C', active: true },
  { id: 'wrench', label: 'Sửa chữa bảo dưỡng', icon: '🔧', color: '#EA580C', active: true },
  { id: 'package', label: 'Bưu chính chuyển phát (Gói hàng)', icon: '📦', color: '#2563EB', active: true },
  { id: 'activity', label: 'Văn hoá - Thể thao', icon: '⚽', color: '#D97706', active: true },
  { id: 'shield', label: 'An ninh quốc phòng', icon: '🛡️', color: '#2563EB', active: true },
  { id: 'trash-2', label: 'Điểm tập kết rác', icon: '♻️', color: '#2563EB', active: true },
  { id: 'school', label: 'Cơ sở giáo dục', icon: '🏫', color: '#2563EB', active: false },
  { id: 'heatlh', label: 'Cơ sở y tế', icon: '🏥', color: '#EA580C', active: true },
];

export default function App() {
  // Lưu thông tin user đang đăng nhập
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('thachkhe_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Đọc trạng thái view hiện tại từ localStorage để giữ nguyên trang khi F5
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('thachkhe_current_view');
    const savedUser = localStorage.getItem('thachkhe_current_user');
    if (savedView === 'admin' && savedUser) {
      return 'admin';
    }
    return 'client';
  });

  const [locations, setLocations] = useState([]);
  const [villages, setVillages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [reports, setReports] = useState([]);
  const [communeBoundary, setCommuneBoundary] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Lắng nghe dữ liệu thời gian thực (Real-time sync) từ Firebase Firestore
  useEffect(() => {
    setLoadingApp(true);

    // 1. Lắng nghe real-time collection "locations"
    const unsubLocations = onSnapshot(collection(db, "locations"), (snapshot) => {
      const locList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let candidates = [];

        if (data.images) {
          if (Array.isArray(data.images)) candidates = [...data.images];
          else if (typeof data.images === 'object') candidates = Object.values(data.images);
        }
        if (Array.isArray(data.photos)) candidates = [...candidates, ...data.photos];
        if (Array.isArray(data.gallery)) candidates = [...candidates, ...data.gallery];

        candidates = [
          ...candidates,
          data.mediaUrl,
          data.image,
          data.imageUrl,
          data.photo,
          data.thumbnail
        ];

        const cleanUrls = [...new Set(
          candidates
            .map(item => {
              if (typeof item === 'string') return item.trim();
              if (item && typeof item === 'object') {
                return (item.url || item.src || item.imageUrl || item.image || '').trim();
              }
              return '';
            })
            .filter(url => url && url.toLowerCase() !== 'null' && url.toLowerCase() !== 'undefined')
        )];

        return {
          id: docSnap.id,
          ...data,
          images: cleanUrls,
          mediaUrl: cleanUrls.length > 0 ? cleanUrls[0] : (data.mediaUrl || '')
        };
      });
      setLocations(locList);
    }, (error) => {
      console.error("Lỗi lắng nghe locations:", error);
    });

    // 2. Lắng nghe real-time collection "villages"
    const unsubVillages = onSnapshot(collection(db, "villages"), (snapshot) => {
      const vilList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      vilList.sort((a, b) => (a.id || 0) - (b.id || 0));
      setVillages(vilList);
    }, (error) => {
      console.error("Lỗi lắng nghe villages:", error);
    });

    // 3. Lắng nghe real-time collection "accounts" (100% từ Firestore, không dùng tài khoản cứng)
    const unsubAccounts = onSnapshot(collection(db, "accounts"), (snapshot) => {
      if (!snapshot.empty) {
        setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setAccounts([]);
      }
    }, (error) => {
      console.error("Lỗi lắng nghe accounts:", error);
      setAccounts([]);
    });

    // 4. Lấy ranh giới xã commune_info
    getDocs(collection(db, "commune_info")).then((communeSnap) => {
      if (!communeSnap.empty) {
        const generalData = communeSnap.docs[0].data();
        if (generalData.boundary) {
          setCommuneBoundary(generalData.boundary);
        }
      }
    }).catch(err => console.error("Lỗi tải ranh giới xã:", err));

    setLoadingApp(false);

    return () => {
      unsubLocations();
      unsubVillages();
      unsubAccounts();
    };
  }, []);

  // Đồng bộ currentUser và currentView vào localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('thachkhe_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('thachkhe_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView === 'admin') {
      localStorage.setItem('thachkhe_current_view', 'admin');
    } else {
      localStorage.removeItem('thachkhe_current_view');
    }
  }, [currentView]);

  // Thêm địa điểm mới lên Firestore
  const handleAddLocation = async (newLoc) => {
    try {
      const { id, ...locData } = newLoc;
      const imagesArray = Array.isArray(locData.images) ? locData.images.filter(Boolean) : [];
      const payload = {
        ...locData,
        images: imagesArray,
        mediaUrl: imagesArray.length > 0 ? imagesArray[0] : (locData.mediaUrl || '')
      };

      await addDoc(collection(db, "locations"), payload);
      alert('Thêm địa điểm thành công!');
    } catch (error) {
      console.error("Lỗi khi thêm địa điểm:", error);
      alert('Thêm địa điểm thất bại: ' + error.message);
    }
  };

  // Cập nhật địa điểm lên Firestore
  const handleUpdateLocation = async (updatedLoc) => {
    try {
      const { id, ...locData } = updatedLoc;
      const imagesArray = Array.isArray(locData.images) ? locData.images.filter(Boolean) : [];
      const payload = {
        ...locData,
        images: imagesArray,
        mediaUrl: imagesArray.length > 0 ? imagesArray[0] : (locData.mediaUrl || '')
      };

      const locRef = doc(db, "locations", String(id));
      await setDoc(locRef, payload, { merge: true });
      alert('Cập nhật địa điểm thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật địa điểm:", error);
      alert('Cập nhật thất bại: ' + error.message);
    }
  };

  // Xóa địa điểm khỏi Firestore
  const handleDeleteLocation = async (id) => {
    try {
      await deleteDoc(doc(db, "locations", String(id)));
      alert('Xóa địa điểm thành công!');
    } catch (error) {
      console.error("Lỗi khi xóa địa điểm:", error);
      alert('Xóa thất bại: ' + error.message);
    }
  };

  // Thôn (Villages) lưu trữ trực tiếp lên Firestore
  const handleAddVillage = async (newV) => {
    try {
      const { id, ...data } = newV;
      await addDoc(collection(db, "villages"), data);
      alert('Thêm thôn thành công!');
    } catch (error) {
      console.error("Lỗi thêm thôn:", error);
      alert('Thêm thôn thất bại: ' + error.message);
    }
  };

  const handleUpdateVillage = async (updatedV) => {
    try {
      const { id, ...data } = updatedV;
      await setDoc(doc(db, "villages", String(id)), data, { merge: true });
      alert('Cập nhật thôn thành công!');
    } catch (error) {
      console.error("Lỗi cập nhật thôn:", error);
      alert('Cập nhật thất bại: ' + error.message);
    }
  };

  const handleDeleteVillage = async (id) => {
    try {
      await deleteDoc(doc(db, "villages", String(id)));
      alert('Xóa thôn thành công!');
    } catch (error) {
      console.error("Lỗi xóa thôn:", error);
      alert('Xóa thất bại: ' + error.message);
    }
  };

  // Tài khoản (Accounts) lưu trữ trực tiếp lên Firestore
  const handleAddAccount = async (newAcc) => {
    try {
      const { id, ...data } = newAcc;
      await addDoc(collection(db, "accounts"), data);
      alert('Thêm tài khoản thành công!');
    } catch (error) {
      console.error("Lỗi thêm tài khoản:", error);
      alert('Thêm tài khoản thất bại: ' + error.message);
    }
  };

  const handleUpdateAccount = async (updatedAcc) => {
    try {
      const { id, ...data } = updatedAcc;
      await setDoc(doc(db, "accounts", String(id)), data, { merge: true });
      alert('Cập nhật tài khoản thành công!');
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
      alert('Cập nhật thất bại: ' + error.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteDoc(doc(db, "accounts", String(id)));
      alert('Xóa tài khoản thành công!');
    } catch (error) {
      console.error("Lỗi xóa tài khoản:", error);
      alert('Xóa thất bại: ' + error.message);
    }
  };

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (accounts.length === 0) {
      setLoginError('Đang tải dữ liệu tài khoản từ hệ thống, vui lòng thử lại sau giây lát!');
      return;
    }

    const foundAcc = accounts.find(
      a => a.username === loginForm.username.trim() && a.password === loginForm.password
    );
    if (foundAcc) {
      setCurrentUser(foundAcc);
      setCurrentView('admin');
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('client');
    localStorage.removeItem('thachkhe_current_user');
    localStorage.removeItem('thachkhe_current_view');
  };

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

  const handleToggleHideReport = (id) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return { ...r, isMapHidden: !r.isMapHidden };
      }
      return r;
    }));
  };

  if (loadingApp) {
    return (
      <div className="h-dvh w-full bg-slate-900 flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Đang khởi tạo hệ thống Bản đồ số Thạch Khê ...</p>
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div className="h-dvh w-full bg-slate-950 flex items-center justify-center p-4 font-sans overflow-y-auto">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
          <button 
            type="button"
            onClick={() => { setCurrentView('client'); setLoginError(''); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
          <div className="text-center mb-7">
            <img src="/logo.png" alt="Logo Xã Thạch Khê" className="mx-auto h-12 w-12 object-contain" />
            <h2 className="text-xl font-bold text-slate-900 mt-3">Đăng Nhập Cổng Quản Trị</h2>
            <p className="text-sm text-slate-600 mt-1">Dành riêng cho cán bộ UBND xã Thạch Khê</p>
          </div>
          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl font-medium text-center">
              {loginError}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-5 text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
              <input 
                type="text" 
                required 
                placeholder="Nhập tên đăng nhập..."
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full min-h-11 px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full min-h-11 px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full min-h-11 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl shadow transition text-sm cursor-pointer"
              >
                Đăng Nhập Hệ Thống
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="h-dvh w-full min-h-0 overflow-hidden flex flex-col">
        <AdminReports 
          reports={reports}
          onUpdateReportStatus={handleUpdateReportStatus}
          onToggleHideReport={handleToggleHideReport}
          onLogout={handleLogout}
          currentUser={currentUser}
          onUpdateProfile={(updatedUser) => {
            setCurrentUser(updatedUser);
            setAccounts(accounts.map(a => a.id === updatedUser.id ? updatedUser : a));
          }}
          locations={locations}
          categories={CATEGORIES}
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
    <div className="w-full min-h-screen flex flex-col bg-slate-100 font-sans">
      <ClientHome 
        locations={locations}
        villages={villages}
        communeBoundary={communeBoundary}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onGoToAdmin={() => setCurrentView(currentUser ? 'admin' : 'admin-login')}
        onAddNewReport={(newRep) => setReports([{ ...newRep, isMapHidden: false }, ...reports])}
        reports={reports}
      />
    </div>
  );
}