import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import ClientHome from './components/ClientHome';
import AdminReports from './components/AdminReports';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [currentView, setCurrentView] = useState('client'); // 'client', 'admin-login', 'admin'
  
  const [locations, setLocations] = useState([]);
  const [villages, setVillages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [reports, setReports] = useState([]);
  const [communeBoundary, setCommuneBoundary] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);

  // Lưu thông tin user đang đăng nhập
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('thachkhe_current_user');
    return saved ? JSON.parse(saved) : { name: 'Quản trị viên', role: 'admin', username: 'admin' };
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch toàn bộ dữ liệu từ Firebase Firestore khi khởi động app
  useEffect(() => {
    async function fetchAppData() {
      try {
        setLoadingApp(true);

        // 1. Lấy locations và chuẩn hóa toàn bộ cấu trúc ảnh thành mảng images
        const locSnap = await getDocs(collection(db, "locations"));
        const locList = locSnap.docs.map(docSnap => {
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

        // 2. Lấy villages
        const vilSnap = await getDocs(collection(db, "villages"));
        const vilList = vilSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        vilList.sort((a, b) => (a.id || 0) - (b.id || 0));
        setVillages(vilList);

        // 3. Lấy accounts
        const accSnap = await getDocs(collection(db, "accounts"));
        if (!accSnap.empty) {
          setAccounts(accSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setAccounts([
            { id: '1', username: 'admin', password: '123', name: 'Quản trị viên', role: 'admin' }
          ]);
        }

        // 4. Lấy reports phản ánh
        const repSnap = await getDocs(collection(db, "reports"));
        if (!repSnap.empty) {
          setReports(repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setReports([
            {
              id: 1740000001001,
              sender: 'Nguyễn Văn Hùng',
              phone: '0912345678',
              category: 'Hạ tầng / Giao thông',
              content: 'Ổ gà lớn xuất hiện giữa đường liên thôn gây nguy hiểm.',
              lat: '18.3971',
              lng: '105.9433',
              locationName: 'Trường Xuân',
              time: '24/09/2026 14:30:00',
              status: 'Chờ xử lý',
              note: '',
              image: null,
              resultImage: null,
              isMapHidden: false
            }
          ]);
        }

        // 5. Lấy ranh giới xã communeBoundary
        const communeSnap = await getDocs(collection(db, "commune_info"));
        if (!communeSnap.empty) {
          const generalData = communeSnap.docs[0].data();
          if (generalData.boundary) {
            setCommuneBoundary(generalData.boundary);
          }
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Firestore:", error);
      } finally {
        setLoadingApp(false);
      }
    }

    fetchAppData();
  }, []);

  useEffect(() => {
    localStorage.setItem('thachkhe_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

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

      const docRef = await addDoc(collection(db, "locations"), payload);
      const savedLoc = { id: docRef.id, ...payload };
      setLocations(prev => [savedLoc, ...prev]);
      alert('Thêm địa điểm và bộ sưu tập hình ảnh lên Firebase thành công!');
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
      
      const savedUpdatedLoc = { id, ...payload };
      setLocations(prev => prev.map(loc => loc.id === id ? savedUpdatedLoc : loc));
      alert('Cập nhật thông tin và bộ sưu tập hình ảnh lên Firebase thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật địa điểm:", error);
      alert('Cập nhật thất bại: ' + error.message);
    }
  };

  // Xóa địa điểm khỏi Firestore
  const handleDeleteLocation = async (id) => {
    try {
      await deleteDoc(doc(db, "locations", String(id)));
      setLocations(prev => prev.filter(loc => loc.id !== id));
      alert('Xóa địa điểm thành công!');
    } catch (error) {
      console.error("Lỗi khi xóa địa điểm:", error);
      alert('Xóa thất bại: ' + error.message);
    }
  };

  const handleAddVillage = (newV) => setVillages([newV, ...villages]);
  const handleUpdateVillage = (updatedV) => setVillages(villages.map(v => v.id === updatedV.id ? updatedV : v));
  const handleDeleteVillage = (id) => setVillages(villages.filter(v => v.id !== id));

  const handleAddAccount = (newAcc) => setAccounts([newAcc, ...accounts]);
  const handleUpdateAccount = (updatedAcc) => setAccounts(accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a));
  const handleDeleteAccount = (id) => setAccounts(accounts.filter(a => a.id !== id));

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
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Đang khởi tạo hệ thống Bản đồ số Thạch Khê từ Firebase...</p>
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
          <button 
            type="button"
            onClick={() => { setCurrentView('client'); setLoginError(''); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
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
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl shadow transition text-xs cursor-pointer"
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
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <AdminReports 
          reports={reports}
          onUpdateReportStatus={handleUpdateReportStatus}
          onToggleHideReport={handleToggleHideReport}
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans">
      <ClientHome 
        locations={locations}
        villages={villages}
        communeBoundary={communeBoundary}
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
        onAddNewReport={(newRep) => setReports([{ ...newRep, isMapHidden: false }, ...reports])}
        reports={reports}
      />
    </div>
  );
}