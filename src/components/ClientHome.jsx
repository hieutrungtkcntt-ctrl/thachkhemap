import React, { useState } from 'react';
import { villagesData, mapLocations, communeBoundary } from '../data';
import ReportModal from './client/ReportModal';
import SearchProgressModal from './client/SearchProgressModal';
import SidebarPanel from './client/SidebarPanel';
import MapComponent from './client/MapComponent';

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
  const [activeTab, setActiveTab] = useState('villages');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const [isPickingMap, setIsPickingMap] = useState(false);
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [detectedLocationName, setDetectedLocationName] = useState('');

  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [navigatingTarget, setNavigatingTarget] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);

  const [reportForm, setReportForm] = useState({
    sender: '',
    phone: '',
    category: 'Hạ tầng / Giao thông',
    content: '',
    lat: '18.4250',
    lng: '105.9160',
    image: null
  });

  const defaultCenter = communeBoundary && communeBoundary.length > 0 
    ? communeBoundary[Math.floor(communeBoundary.length / 2)] 
    : [18.4250, 105.9160];

  const currentCenter = mapCenter || defaultCenter;

  const filteredLocations = locations.filter(loc => {
    const matchesCategory = selectedCategory === 'all' || loc.type === selectedCategory;
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loc.info?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        <div className="flex items-center justify-between md:justify-end gap-2 relative">
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

      {/* Thanh tab lựa chọn & Danh mục */}
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
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="font-semibold text-slate-400 mr-1 whitespace-nowrap hidden sm:inline">Danh mục:</span>
          {categories && categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setActiveTab('overview'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === cat.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nội dung chính: Trên mobile là cột dọc tự cuộn, trên PC (md) gộp thành 1 khung tràn màn hình tuyệt đối không cuộn trang */}
      <div className="flex-1 flex flex-col md:flex-row relative md:overflow-hidden" style={{ height: 'auto', minHeight: 0 }} id="main-content-layout">
        <style>{`
          @media (min-width: 768px) {
            #main-content-layout {
              height: calc(100vh - 105px) !important;
            }
          }
        `}</style>

        <SidebarPanel 
          navigatingTarget={navigatingTarget}
          onCloseNavigation={() => { setNavigatingTarget(null); setRouteCoordinates([]); setUserLocation(null); }}
          routeDistance={routeDistance}
          routeDuration={routeDuration}
          activeTab={activeTab}
          selectedVillage={selectedVillage}
          onSelectVillage={handleSelectVillage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredLocations={filteredLocations}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onDirectGPSRoute={handleDirectGPSRoute}
          getCategoryName={getCategoryName}
        />

        <MapComponent 
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
        />
      </div>

      {/* Các Modal Tra cứu & Phản ánh */}
      <SearchProgressModal 
        isOpen={isSearchModalOpen}
        onClose={() => { setIsSearchModalOpen(false); setSearchResult(null); setSearchPhone(''); }}
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        onSearchSubmit={handleSearchProgress}
        searchResult={searchResult}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onOpenMapPicker={() => { setIsReportModalOpen(false); setIsPickingMap(true); }}
        onGetGPS={() => {
          if (!navigator.geolocation) {
            alert('Trình duyệt không hỗ trợ GPS!');
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const fixedLat = lat.toFixed(6);
              const fixedLng = lng.toFixed(6);
              setReportForm(prev => ({ ...prev, lat: fixedLat, lng: fixedLng }));
              setPickedLatLng([fixedLat, fixedLng]);
            },
            () => alert('Không thể lấy được vị trí GPS hiện tại!'),
            { enableHighAccuracy: true }
          );
        }}
        detectedLocationName={detectedLocationName}
        onHandleSubmit={handleReportSubmit}
      />
    </div>
  );
}