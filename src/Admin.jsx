import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Đảm bảo đường dẫn này trỏ đúng tới file firebase.js của bạn

// Import các module quản trị con
import DashboardOverview from './admin/DashboardOverview';
import LocationManagement from './admin/LocationManagement';
import VillageManagement from './admin/VillageManagement';
import ReportManagement from './admin/ReportManagement';

export default function Admin({ reports = [], setReports, communeInfo, villagesData = [], onLocationsUpdate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, locations, villages, reports

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải danh sách Địa điểm và Danh mục từ Firebase Firestore khi đăng nhập thành công
  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        // Tải danh sách địa điểm
        const locSnap = await getDocs(collection(db, "locations"));
        const locList = locSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocations(locList);
        if (onLocationsUpdate) onLocationsUpdate(locList);

        // Tải danh mục
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Lỗi tải dữ liệu quản trị từ Firebase:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '123456') { // Mã PIN mặc định của xã
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // 1. Thêm địa điểm mới lên Firestore
  const handleAddLocation = async (newLoc) => {
    try {
      const { id, ...locData } = newLoc;
      const docRef = await addDoc(collection(db, "locations"), locData);
      const updatedList = [...locations, { id: docRef.id, ...locData }];
      setLocations(updatedList);
      if (onLocationsUpdate) onLocationsUpdate(updatedList);
      alert('Thêm địa điểm và lưu hình ảnh thành công!');
    } catch (err) {
      console.error("Lỗi khi thêm địa điểm:", err);
      alert('Thêm địa điểm thất bại: ' + err.message);
    }
  };

  // 2. Cập nhật địa điểm lên Firestore (Dùng setDoc với merge: true)
  const handleUpdateLocation = async (updatedLoc) => {
    try {
      const { id, ...locData } = updatedLoc;
      const locRef = doc(db, "locations", String(id));
      
      // Ghi trực tiếp lên Firestore
      await setDoc(locRef, locData, { merge: true });
      
      const updatedList = locations.map(item => item.id === id ? updatedLoc : item);
      setLocations(updatedList);
      if (onLocationsUpdate) onLocationsUpdate(updatedList);
      
      alert('Cập nhật thông tin và hình ảnh lên Firebase thành công!');
    } catch (err) {
      console.error("Lỗi khi cập nhật địa điểm:", err);
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  // 3. Xóa địa điểm khỏi Firestore
  const handleDeleteLocation = async (id) => {
    try {
      await deleteDoc(doc(db, "locations", String(id)));
      const updatedList = locations.filter(item => item.id !== id);
      setLocations(updatedList);
      if (onLocationsUpdate) onLocationsUpdate(updatedList);
      alert('Đã xóa địa điểm thành công!');
    } catch (err) {
      console.error("Lỗi khi xóa địa điểm:", err);
      alert('Xóa thất bại!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2">🔒</span> Đăng nhập Quản trị
          </h3>
          <p className="text-sm text-gray-500 mb-6">Hệ thống bản đồ số UBND xã Thạch Khê</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập mã PIN (123456)" 
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer">
              Truy cập hệ thống
            </button>
            {error && <p className="text-red-500 text-sm text-center">Mã PIN không chính xác!</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-lg font-bold">Quản Trị Bản Đồ Số & Phản Ánh - Xã Thạch Khê</h1>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
        >
          Đăng xuất
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-3 border-b pb-3 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            📊 Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === 'locations' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            📍 Quản lý Địa điểm ({locations.length})
          </button>
          <button 
            onClick={() => setActiveTab('villages')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === 'villages' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            🏘️ Quản lý 11 Thôn
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center cursor-pointer ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            💬 Phản ánh hiện trường 
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reports.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm animate-pulse">Đang đồng bộ dữ liệu với cơ sở dữ liệu đám mây...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview reports={reports} communeInfo={communeInfo} villagesData={villagesData} />
            )}
            {activeTab === 'locations' && (
              <LocationManagement 
                locations={locations} 
                categories={categories} 
                onAddLocation={handleAddLocation} 
                onUpdateLocation={handleUpdateLocation} 
                onDeleteLocation={handleDeleteLocation} 
              />
            )}
            {activeTab === 'villages' && (
              <VillageManagement villagesData={villagesData} />
            )}
            {activeTab === 'reports' && (
              <ReportManagement reports={reports} setReports={setReports} />
            )}
          </>
        )}
      </main>
    </div>
  );
}