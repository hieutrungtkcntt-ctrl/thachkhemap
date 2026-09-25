import React, { useState } from 'react';

export default function Admin({ initialPois, onSavePoi, onDeletePoi }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('pois');
  
  // State modal thêm/sửa điểm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPoi, setCurrentPoi] = useState({ id: '', name: '', category: 'hanh-chinh', lat: '', lng: '', desc: '' });

  // Dữ liệu phản ánh mẫu (có thể tích hợp API sau)
  const [reports, setReports] = useState([
    { id: 1, time: "2026-09-25 08:30", content: "Đèn chiếu sáng tuyến đường thôn Đông bị hỏng bóng.", image: "#", status: "Chờ xử lý" }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '123456') { // Mã PIN mặc định của xã, anh có thể đổi ở đây
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleOpenModal = (poi = null) => {
    if (poi) {
      setCurrentPoi(poi);
    } else {
      setCurrentPoi({ id: Date.now(), name: '', category: 'hanh-chinh', lat: '', lng: '', desc: '' });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSavePoi(currentPoi);
    setIsModalOpen(false);
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
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
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
          className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Đăng xuất
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b pb-3">
          <button 
            onClick={() => setActiveTab('pois')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition ${activeTab === 'pois' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            📍 Quản lý Điểm (POI)
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition flex items-center ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            💬 Phản ánh hiện trường 
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{reports.length}</span>
          </button>
        </div>

        {/* Tab 1: Quản lý POI */}
        {activeTab === 'pois' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Danh sách điểm dịch vụ & hạ tầng ({initialPois.length})</h2>
              <button 
                onClick={() => handleOpenModal()} 
                className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 shadow transition flex items-center space-x-2"
              >
                <span>➕ Thêm điểm mới</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b text-sm">
                    <th className="p-4">Tên địa điểm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Tọa độ</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-600">
                  {initialPois.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{p.category}</span></td>
                      <td className="p-4 font-mono text-xs">{p.lat}, {p.lng}</td>
                      <td className="p-4">{p.desc}</td>
                      <td className="p-4 text-center space-x-3">
                        <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                        <button onClick={() => onDeletePoi(p.id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Quản lý Phản ánh */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Danh sách phản ánh, kiến nghị từ người dân</h2>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b text-sm">
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Nội dung phản ánh</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-600">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-4">{r.time}</td>
                      <td className="p-4 font-medium text-gray-900">{r.content}</td>
                      <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">{r.status}</span></td>
                      <td className="p-4 text-center">
                        <button onClick={() => alert("Đã cập nhật trạng thái xử lý phản ánh!")} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700">Đổi trạng thái</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{currentPoi.id ? 'Cập nhật điểm bản đồ' : 'Thêm điểm bản đồ mới'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên địa điểm</label>
                <input 
                  type="text" 
                  value={currentPoi.name} 
                  onChange={(e) => setCurrentPoi({...currentPoi, name: e.target.value})} 
                  required 
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select 
                  value={currentPoi.category} 
                  onChange={(e) => setCurrentPoi({...currentPoi, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="hanh-chinh">Hành chính công</option>
                  <option value="giao-duc">Trường học</option>
                  <option value="y-te">Y tế</option>
                  <option value="ha-tang">Hạ tầng</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Lat)</label>
                  <input 
                    type="text" 
                    value={currentPoi.lat} 
                    onChange={(e) => setCurrentPoi({...currentPoi, lat: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 border rounded-xl" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Lng)</label>
                  <input 
                    type="text" 
                    value={currentPoi.lng} 
                    onChange={(e) => setCurrentPoi({...currentPoi, lng: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 border rounded-xl" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea 
                  rows="3" 
                  value={currentPoi.desc} 
                  onChange={(e) => setCurrentPoi({...currentPoi, desc: e.target.value})}
                  className="w-full px-3 py-2 border rounded-xl"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}