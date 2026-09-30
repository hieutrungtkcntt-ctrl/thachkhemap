import React, { useState } from 'react';
import { villagesData, mapLocations, communeBoundary } from '../data';
import ReportModal from './client/ReportModal';
import SearchProgressModal from './client/SearchProgressModal';
import MapComponent from './client/MapComponent';
import LocationDetailModal from './client/LocationDetailModal';

export default function ClientHome({ 
  locations = mapLocations, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm, 
  onGoToAdmin,
  onAddNewReport,
  reports = []
}) {
  const [activeTab, setActiveTab] = useState('villages'); // 'villages', 'overview', 'utilities'
  const [selectedVillage, setSelectedVillage] = useState(villagesData[0] || null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // State quản lý hiển thị LocationDetailModal
  const [activeLocationDetail, setActiveLocationDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetailModal = (loc) => {
    setActiveLocationDetail(loc);
    setIsDetailModalOpen(true);
  };

  const [isPickingMap, setIsPickingMap] = useState(false);
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [detectedLocationName, setDetectedLocationName] = useState('');

  const [mapCenter, setMapCenter] = useState(villagesData[0]?.center || [18.3950, 105.9550]);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [navigatingTarget, setNavigatingTarget] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);

  // State bộ lọc bổ sung cho Sidebar tìm kiếm ở Tab Địa điểm
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [quickFilter, setQuickFilter] = useState({ nearby: false, verified: false, open: false });
  const [distance, setDistance] = useState('Trong bán kính 2 km');

  const [reportForm, setReportForm] = useState({
    sender: '',
    phone: '',
    category: 'Hạ tầng / Giao thông',
    content: '',
    lat: '18.4250',
    lng: '105.9160',
    image: null
  });

  const defaultCenter = [18.3950, 105.9550];
  const currentCenter = mapCenter || defaultCenter;

  const filteredLocations = locations.filter(loc => {
    const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(loc.type) || selectedCategory === 'all' || loc.type === selectedCategory;
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loc.info?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (catKey) => {
    if (catKey === 'all') {
      setSelectedCategories(['all']);
      setSelectedCategory('all');
    } else {
      let updated = selectedCategories.filter(c => c !== 'all');
      if (updated.includes(catKey)) {
        updated = updated.filter(c => c !== catKey);
      } else {
        updated.push(catKey);
      }
      if (updated.length === 0) updated = ['all'];
      setSelectedCategories(updated);
      setSelectedCategory(updated[0] || 'all');
    }
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedCategories(['all']);
    setSelectedCategory('all');
    setQuickFilter({ nearby: false, verified: false, open: false });
    setDistance('Trong bán kính 2 km');
  };

  const handleSelectLocation = (loc) => {
    setSelectedVillage(null);
    setSelectedLocation(loc);
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(16);
  };

  const handleSelectVillage = (village) => {
    setSelectedVillage(village);
    setSelectedLocation(null);
    if (village.center) {
      setMapCenter(village.center);
      setMapZoom(15);
    }
  };

  const fetchRoadRoute = async (startLat, startLng, destLat, destLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        let latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(latLngs);
        setRouteDistance((route.distance / 1000).toFixed(1)); 
        setRouteDuration(Math.round(route.duration / 60)); 
      }
    } catch (err) {
      console.error("Lỗi định tuyến:", err);
    }
  };

  const handleDirectGPSRoute = (lat, lng, targetObj) => {
    setNavigatingTarget(targetObj);
    setMapCenter([lat, lng]);
    setMapZoom(15);

    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ GPS!');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const curLat = position.coords.latitude;
        const curLng = position.coords.longitude;
        setUserLocation([curLat, curLng]);
        fetchRoadRoute(curLat, curLng, lat, lng);
      },
      () => {
        const fallbackLat = 18.4250;
        const fallbackLng = 105.9160;
        setUserLocation([fallbackLat, fallbackLng]);
        fetchRoadRoute(fallbackLat, fallbackLng, lat, lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.sender.trim() || !reportForm.phone.trim() || !reportForm.content.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung phản ánh!');
      return;
    }

    try {
      if (onAddNewReport && typeof onAddNewReport === 'function') {
        onAddNewReport({
          ...reportForm,
          id: Date.now(),
          time: new Date().toLocaleString('vi-VN'),
          status: 'Chờ xử lý',
          note: '',
          locationName: detectedLocationName
        });
      }

      setIsReportModalOpen(false);
      setPickedLatLng(null);
      setDetectedLocationName('');
      setReportForm({ sender: '', phone: '', category: 'Hạ tầng / Giao thông', content: '', lat: '18.4250', lng: '105.9160', image: null });
      alert('Gửi phản ánh thành công! UBND xã đã ghi nhận thông tin và hình ảnh hiện trường.');
    } catch (err) {
      console.error("Lỗi khi gửi phản ánh:", err);
      alert('Đã xảy ra lỗi khi gửi phản ánh. Vui lòng thử lại!');
    }
  };

  const handleSearchProgress = (e) => {
    e.preventDefault();
    const found = reports.filter(r => r.phone.trim() === searchPhone.trim());
    setSearchResult(found);
  };

  const getCategoryName = (typeId) => {
    const found = categories?.find(c => c.id === typeId);
    return found ? found.label : 'Địa điểm khác';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Chính */}
      <header className="bg-blue-900 text-white shadow-md px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5 z-20 shrink-0">
        <div className="flex items-center justify-between md:justify-start space-x-3">
          <div className="flex items-center space-x-2.5">
            <img 
              src="/logo.png" 
              alt="Logo Xã Thạch Khê" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white">Bản Đồ Số Xã Thạch Khê</h1>
              <p className="text-[10px] sm:text-[11px] text-blue-300 hidden sm:block">Ứng dụng tích hợp thông tin địa bàn và tra cứu thuận tiện.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 relative flex-wrap">
          <a href="tel:02393888111" className="bg-red-700 hover:bg-red-800 text-white text-[11px] sm:text-xs px-3 py-2 rounded-xl font-bold shadow transition flex items-center gap-1.5 whitespace-nowrap">
            📞 Hotline: <strong>0239.3.888.111</strong>
          </a>

          <div className="hidden xl:flex items-center gap-3 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800 text-xs">
            <span>Diện tích: <strong className="text-yellow-400">4,631.8 ha</strong></span>
            <span>•</span>
            <span>Số hộ: <strong className="text-yellow-400">4,639</strong></span>
            <span>•</span>
            <span>Nhân khẩu: <strong className="text-yellow-400">17,515</strong></span>
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs px-3 sm:px-4 py-2 rounded-xl font-bold shadow transition flex items-center justify-center gap-1.5 animate-bounce"
            >
              🚨 Phản Ánh & Tra Cứu ▾
            </button>

            {isActionMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 text-xs">
                <button 
                  onClick={() => { setIsActionMenuOpen(false); setIsReportModalOpen(true); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-600 font-semibold flex items-center gap-2 transition"
                >
                  <span>🚨</span> Gửi phản ánh sự cố mới
                </button>
                <button 
                  onClick={() => { setIsActionMenuOpen(false); setIsSearchModalOpen(true); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 font-semibold flex items-center gap-2 transition border-t border-slate-100"
                >
                  <span>🔍</span> Tra cứu tiến độ xử lý
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={onGoToAdmin}
            className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] sm:text-xs px-3 py-2 rounded-xl font-medium shadow transition whitespace-nowrap"
          >
            🔐 Quản trị
          </button>
        </div>
      </header>

      {/* Thanh tab lựa chọn phía trên */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs shadow-xs z-10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveTab('villages')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'villages' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            👥 11 Thôn ({villagesData.length})
          </button>
          <button 
            onClick={() => { setActiveTab('overview'); setSelectedVillage(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            📍 Địa điểm ({locations.length})
          </button>
          <button 
            onClick={() => { setActiveTab('utilities'); setSelectedVillage(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'utilities' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            ⚡ Tiện ích số
          </button>
        </div>

       
      </div>

      {/* ================= 1. TAB 11 THÔN ================= */}
      {activeTab === 'villages' && (
        <div className="flex-1 flex flex-col md:flex-row relative md:overflow-hidden" style={{ height: 'auto', minHeight: 0 }} id="villages-layout">
          <style>{`
            @media (min-width: 768px) {
              #villages-layout {
                height: calc(100vh - 155px) !important;
              }
            }
          `}</style>

          {/* Bản đồ bên trái */}
          <div className="w-full md:w-7/12 lg:w-8/12 h-[350px] md:h-full relative">
            <MapComponent 
              villages={villagesData}
              defaultCenter={defaultCenter}
              currentCenter={currentCenter}
              mapZoom={mapZoom}
              mapStyle={mapStyle}
              setMapStyle={setMapStyle}
              isPickingMap={isPickingMap}
              setIsPickingMap={setIsPickingMap}
              setIsReportModalOpen={setIsReportModalOpen}
              setReportForm={setReportForm}
              setPickedLatLng={setPickedLatLng}
              setDetectedLocationName={setDetectedLocationName}
              pickedLatLng={pickedLatLng}
              userLocation={userLocation}
              routeCoordinates={routeCoordinates}
              selectedVillage={selectedVillage}
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onDirectGPSRoute={handleDirectGPSRoute}
              getCategoryName={getCategoryName}
              reports={reports}
              onOpenDetail={handleOpenDetailModal}
            />
          </div>

          {/* Danh sách thôn & Chi tiết thôn bên phải */}
          <div className="w-full md:w-5/12 lg:w-4/12 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto z-10">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center justify-between sticky top-0 z-20">
              <span className="flex items-center gap-1.5"><span>📑</span> Danh sách các Thôn ({villagesData.length})</span>
            </div>

            <div className="p-3 space-y-1.5 border-b border-slate-200 bg-white">
              {villagesData.map(v => {
                const isSelected = selectedVillage?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVillage(v)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{v.name || v.tenThon}</span>
                    <span className="text-slate-400">&gt;</span>
                  </div>
                );
              })}
            </div>

            {selectedVillage && (
              <div className="p-4 space-y-4 bg-slate-50/50 flex-1">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                    <span>🏘</span> {selectedVillage.name || selectedVillage.tenThon}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedVillage.description || selectedVillage.moTa || 'Khu dân cư thuộc xã Thạch Khê, tỉnh Hà Tĩnh.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Quy mô dân số</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {selectedVillage.population !== undefined ? selectedVillage.population : 'Đang cập nhật'} {selectedVillage.households !== undefined ? `(${selectedVillage.households} hộ)` : ''}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Diện tích</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {selectedVillage.area || 'Đang cập nhật'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Ban điều hành & Tổ chức thôn</span>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bí thư chi bộ</span>
                        <span className="font-bold text-slate-800">
                          {selectedVillage.partySecretary || selectedVillage.secretary || selectedVillage.biThu || 'Đang cập nhật'}
                        </span>
                      </div>
                      {(selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu) && selectedVillage.secPhone !== "---" && (
                        <a href={`tel:${selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu}`} className="text-blue-600 font-bold hover:underline">
                          {selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Thôn trưởng</span>
                        <span className="font-bold text-slate-800">
                          {selectedVillage.leader || selectedVillage.head || selectedVillage.thonTruong || 'Đang cập nhật'}
                        </span>
                      </div>
                      {(selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong) && selectedVillage.leadPhone !== "---" && (
                        <a href={`tel:${selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong}`} className="text-blue-600 font-bold hover:underline">
                          {selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong}
                        </a>
                      )}
                    </div>

                    {selectedVillage.fatherlandFront && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Trưởng ban CTMT / MTTQ</span>
                          <span className="font-bold text-slate-800">{selectedVillage.fatherlandFront}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span> Địa điểm & Tiện ích tại thôn
                  </h4>
                  {locations.filter(l => l.villageId === selectedVillage.id || l.info?.includes(selectedVillage.name)).length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {locations
                        .filter(l => l.villageId === selectedVillage.id || l.info?.includes(selectedVillage.name))
                        .map(loc => (
                          <div key={loc.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div className="overflow-hidden pr-2">
                              <span className="font-bold text-slate-800 block truncate">{loc.name}</span>
                              <span className="text-[10px] text-slate-500 truncate block">{getCategoryName(loc.type)}</span>
                            </div>
                            <button 
                              onClick={() => handleSelectLocation(loc)}
                              className="bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md hover:bg-blue-600 hover:text-white transition shrink-0"
                            >
                              Xem
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Đang cập nhật địa điểm cụ thể thuộc thôn này.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. TAB ĐỊA ĐIỂM ================= */}
      {activeTab === 'overview' && (
        <div className="flex-1 flex flex-col md:flex-row relative md:overflow-hidden" style={{ height: 'auto', minHeight: 0 }} id="main-content-layout">
          <style>{`
            @media (min-width: 768px) {
              #main-content-layout {
                height: calc(100vh - 155px) !important;
              }
            }
          `}</style>

          {/* Sidebar Tìm kiếm & Lọc kết quả */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-md z-10 shrink-0 overflow-y-auto">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                🔍 Tìm kiếm & Lọc kết quả
              </span>
              <button 
                onClick={handleResetFilter}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                🔄 Đặt lại
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">TỪ KHÓA</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên địa điểm, dịch vụ..."
                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-slate-400">🔍</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">LĨNH VỰC</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes('all')} 
                        onChange={() => handleCategoryChange('all')}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="text-slate-800 font-medium">Tất cả lĩnh vực</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{locations.length}</span>
                  </label>

                  {[
                    { key: 'hotel', label: 'Cơ sở lưu trú', icon: '🏨' },
                    { key: 'restaurant', label: 'Nhà hàng - Quán ăn', icon: '🍽️' },
                    { key: 'admin', label: 'Hành chính xã', icon: '🏛' },
                    { key: 'health', label: 'Dịch vụ y tế', icon: '🏥' },
                    { key: 'school', label: 'Giáo dục - Trường học', icon: '🏫' },
                    { key: 'temple', label: 'Di tích - Tâm linh', icon: '🛕' },
                    { key: 'tourism', label: 'Điểm du lịch', icon: '🏖' },
                    { key: 'eco', label: 'Khu sinh thái', icon: '🌳' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(item.key)} 
                          onChange={() => handleCategoryChange(item.key)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-slate-700">{item.icon} {item.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">BỘ LỌC NHANH</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setQuickFilter(prev => ({ ...prev, nearby: !prev.nearby }))}
                    className={`py-1.5 px-2 rounded-lg border text-left font-medium transition flex items-center gap-1 ${quickFilter.nearby ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    📍 Gần tôi
                  </button>
                  <button 
                    onClick={() => setQuickFilter(prev => ({ ...prev, verified: !prev.verified }))}
                    className={`py-1.5 px-2 rounded-lg border text-left font-medium transition flex items-center gap-1 ${quickFilter.verified ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    ✅ Đã xác minh
                  </button>
                  <button 
                    onClick={() => setQuickFilter(prev => ({ ...prev, open: !prev.open }))}
                    className={`py-1.5 px-2 rounded-lg border text-left font-medium transition flex items-center gap-1 ${quickFilter.open ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    🔓 Mở cửa
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">KHOẢNG CÁCH</label>
                <select 
                  value={distance} 
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>Trong bán kính 1 km</option>
                  <option>Trong bán kính 2 km</option>
                  <option>Trong bán kính 5 km</option>
                  <option>Trong bán kính 10 km</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleResetFilter}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition text-xs"
                >
                  🔄 Bật lại bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Bản đồ bên phải */}
          <div className="flex-1 h-full relative">
            <MapComponent 
              villages={villagesData}
              defaultCenter={defaultCenter}
              currentCenter={currentCenter}
              mapZoom={mapZoom}
              mapStyle={mapStyle}
              setMapStyle={setMapStyle}
              isPickingMap={isPickingMap}
              setIsPickingMap={setIsPickingMap}
              setIsReportModalOpen={setIsReportModalOpen}
              setReportForm={setReportForm}
              setPickedLatLng={setPickedLatLng}
              setDetectedLocationName={setDetectedLocationName}
              pickedLatLng={pickedLatLng}
              userLocation={userLocation}
              routeCoordinates={routeCoordinates}
              selectedVillage={selectedVillage}
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onDirectGPSRoute={handleDirectGPSRoute}
              getCategoryName={getCategoryName}
              reports={reports}
              onOpenDetail={handleOpenDetailModal}
            />
          </div>
        </div>
      )}

      {/* ================= 3. TAB TIỆN ÍCH SỐ ================= */}
      {activeTab === 'utilities' && (
        <div className="flex-1 p-6 bg-slate-100 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>⚡</span> Tiện ích hỗ trợ người dân & Doanh nghiệp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Tra cứu thủ tục hành chính</h4>
                    <p className="text-xs text-slate-600 mt-1">Cập nhật nhanh các dịch vụ công trực tuyến, mức phí và hồ sơ.</p>
                  </div>
                  <button 
                    onClick={() => alert('Tính năng đang được cập nhật!')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs w-full transition"
                  >
                    Truy cập Cổng dịch vụ công
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Đường dây nóng & Danh bạ</h4>
                    <p className="text-xs text-slate-600 mt-1">Danh sách số điện thoại lãnh đạo UBND, Công an xã và các ban ngành.</p>
                  </div>
                  <button 
                    onClick={() => alert('Hotline UBND xã: 0239.3.888.111')}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs w-full transition"
                  >
                    Xem danh bạ liên hệ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS & POPUPS ================= */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onSubmit={handleReportSubmit}
        isPickingMap={isPickingMap}
        setIsPickingMap={setIsPickingMap}
        pickedLatLng={pickedLatLng}
        detectedLocationName={detectedLocationName}
      />

      <SearchProgressModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        searchResult={searchResult}
        onSearch={handleSearchProgress}
      />

      <LocationDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        location={activeLocationDetail}
        getCategoryName={getCategoryName}
        onDirectGPSRoute={handleDirectGPSRoute}
      />

      {/* ================= FOOTER CHÍNH CỦA TRANG ================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <p className="font-semibold text-slate-300">Bản Đồ Số & Quản Lý Thông Tin Xã Thạch Khê, Tỉnh Hà Tĩnh</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cơ quan chủ quản: UBND Xã Thạch Khê. Phục vụ công tác chuyển đổi số cộng đồng.</p>
        </div>
        <div className="text-[11px] text-slate-500">
          <span>Phiên bản 2.0 • Phát triển bởi Đội ngũ Chuyển đổi số</span>
        </div>
      </footer>
    </div>
  );
}
