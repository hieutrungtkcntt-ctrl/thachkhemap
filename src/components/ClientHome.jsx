import React, { useState } from 'react';
import { villagesData, mapLocations, communeBoundary } from '../data';
import ReportModal from './client/ReportModal';
import SearchProgressModal from './client/SearchProgressModal';
import MapComponent from './client/MapComponent';
import LocationDetailModal from './client/LocationDetailModal';

// ==========================================
// INLINE SVG ICON COMPONENTS
// ==========================================
const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const IconPhone = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const IconAlert = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const IconMapPin = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const IconUsers = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const IconBuilding = ({ className = "w-4 h-4 text-indigo-600" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const IconZap = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const IconChevronDown = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
);
const IconChevronRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);
const IconRotateCcw = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const IconLock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const IconFileText = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const IconFilter = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
);
const IconEye = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const IconCompass = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const IconNavigation = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const IconExternalLink = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
);

export default function ClientHome({ 
  locations = mapLocations, 
  categories, 
  searchTerm = '', 
  setSearchTerm, 
  onGoToAdmin,
  onAddNewReport,
  reports = []
}) {
  const [activeTab, setActiveTab] = useState('villages');
  const [selectedVillage, setSelectedVillage] = useState(villagesData[0] || null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [villageSearch, setVillageSearch] = useState('');

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
  const [mapZoom, setMapZoom] = useState(12);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [navigatingTarget, setNavigatingTarget] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);

  const [selectedCat, setSelectedCat] = useState('all');

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
    const locType = loc.type || '';
    const matchesCategory = selectedCat === 'all' || locType === selectedCat;
    
    const locName = (loc.name || '').toLowerCase();
    const locInfo = (loc.info || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();

    const matchesSearch = locName.includes(query) || locInfo.includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleResetFilter = () => {
    if (setSearchTerm) setSearchTerm('');
    setSelectedCat('all');
  };

  const handleSelectLocation = (loc) => {
    setSelectedVillage(null);
    setSelectedLocation(loc);
    if (loc && loc.lat && loc.lng) {
      setMapCenter([loc.lat, loc.lng]);
      setMapZoom(16); // Zoom sát vào vị trí địa điểm khi chọn

      const mapElement = document.getElementById('map-top-section');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectVillage = (village) => {
    setSelectedVillage(village);
    setSelectedLocation(null);
    if (village && village.center) {
      setMapCenter(village.center);
      setMapZoom(13);
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
    setMapZoom(16);

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
    const sender = (reportForm.sender || '').trim();
    const phone = (reportForm.phone || '').trim();
    const content = (reportForm.content || '').trim();

    if (!sender || !phone || !content) {
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
    const inputPhone = (searchPhone || '').trim();
    const found = reports.filter(r => r.phone && r.phone.trim() === inputPhone);
    setSearchResult(found);
  };

  const getCategoryName = (typeId) => {
    const found = categories?.find(c => c.id === typeId);
    return found ? found.label : 'Địa điểm khác';
  };

  const currentVillageName = selectedVillage?.name || selectedVillage?.tenThon || '';

  const villageLocations = selectedVillage ? locations.filter(l => {
    const isDirectMatch = l.villageId === selectedVillage.id;
    const isInfoMatch = l.info && currentVillageName && l.info.toLowerCase().includes(currentVillageName.toLowerCase());
    const matchesSearch = !villageSearch.trim() || 
                          l.name.toLowerCase().includes(villageSearch.toLowerCase()) || 
                          (l.info && l.info.toLowerCase().includes(villageSearch.toLowerCase()));
    return (isDirectMatch || isInfoMatch) && matchesSearch;
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. HEADER CHÍNH */}
      <header className="bg-slate-900 text-white shadow-md px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5 z-30 shrink-0 border-b border-slate-800">
        <div className="flex items-center justify-between md:justify-start space-x-3">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Logo Xã Thạch Khê" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
                <IconCompass className="w-4 h-4 text-amber-400" />
                <span>Bản Đồ Số Xã Thạch Khê</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">Ứng dụng tích hợp thông tin địa bàn và tra cứu thuận tiện.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 relative flex-wrap">
          <a 
            href="tel:02393888111" 
            className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[11px] sm:text-xs px-3 py-2 rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <IconPhone className="w-3.5 h-3.5" />
            <span>Hotline: <strong>0239.3.888.111</strong></span>
          </a>

          <div className="hidden xl:flex items-center gap-3 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-300">Diện tích: <strong className="text-amber-400 font-extrabold">4,631.8 ha</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Số hộ: <strong className="text-amber-400 font-extrabold">4,639</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Nhân khẩu: <strong className="text-amber-400 font-extrabold">17,515</strong></span>
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <button 
              type="button"
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-[11px] sm:text-xs px-3.5 py-2 rounded-xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IconAlert className="w-3.5 h-3.5" />
              <span>Phản Ánh & Tra Cứu</span>
              <IconChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {isActionMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 text-xs">
                <button 
                  type="button"
                  onClick={() => { setIsActionMenuOpen(false); setIsReportModalOpen(true); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-rose-50 hover:text-rose-600 font-semibold flex items-center gap-2.5 transition-colors"
                >
                  <IconAlert className="w-4 h-4 text-rose-500" />
                  <span>Gửi phản ánh sự cố mới</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsActionMenuOpen(false); setIsSearchModalOpen(true); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 font-semibold flex items-center gap-2.5 transition-colors border-t border-slate-100"
                >
                  <IconSearch className="w-4 h-4 text-indigo-500" />
                  <span>Tra cứu tiến độ xử lý</span>
                </button>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={onGoToAdmin}
            className="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-[11px] sm:text-xs px-3 py-2 rounded-xl font-medium border border-slate-700 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <IconLock className="w-3.5 h-3.5 text-slate-400" />
            <span>Quản trị</span>
          </button>
        </div>
      </header>

      {/* 2. THANH TAB LỰA CHỌN PHÍA TRÊN (Tự động reset selectedLocation khi sang mục Thôn hoặc Tiện ích số) */}
      <div className="bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs shadow-xs z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button 
            type="button"
            onClick={() => { 
              setActiveTab('villages'); 
              setSelectedLocation(null); // Tự động đóng cửa sổ popup địa điểm khi sang mục Thôn
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'villages' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <IconUsers className="w-4 h-4" />
            <span>11 Thôn ({villagesData.length})</span>
          </button>
          
          <button 
            type="button"
            onClick={() => { setActiveTab('overview'); setSelectedVillage(null); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <IconMapPin className="w-4 h-4" />
            <span>Địa điểm ({locations.length})</span>
          </button>

          <button 
            type="button"
            onClick={() => { 
              setActiveTab('utilities'); 
              setSelectedVillage(null); 
              setSelectedLocation(null); // Tự động đóng cửa sổ popup địa điểm khi sang Tiện ích số
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'utilities' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <IconZap className="w-4 h-4" />
            <span>Tiện ích số</span>
          </button>
        </div>
      </div>

      {/* ================= 1. TAB 11 THÔN ================= */}
      {activeTab === 'villages' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">
          <div className="w-full px-1 sm:px-4 space-y-5">
            <div id="map-top-section" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-8 h-[350px] lg:h-[calc(100vh-220px)] bg-white rounded-2xl p-2 border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden relative flex flex-col">
                <div className="w-full h-full rounded-xl overflow-hidden relative flex-1">
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

              <div className="lg:col-span-4 h-auto lg:h-[calc(100vh-220px)] bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-900 flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-2">
                    <IconFileText className="w-4 h-4 text-indigo-600" />
                    <span>Danh sách các Thôn ({villagesData.length})</span>
                  </span>
                </div>

                <div className="p-2.5 overflow-y-auto space-y-1 max-h-[260px] lg:max-h-none lg:h-1/2 border-b border-slate-100 scrollbar-thin">
                  {villagesData.map(v => {
                    const isSelected = selectedVillage?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVillage(v)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-xs' 
                            : 'bg-white border-slate-200/60 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate font-bold text-[11.5px]">{v.name || v.tenThon}</span>
                        <IconChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50/60 lg:h-1/2 overflow-y-auto space-y-2.5 scrollbar-thin">
                  {selectedVillage ? (
                    <div className="space-y-2.5">
                      <div className="border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <IconBuilding className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Thông tin: {currentVillageName}</span>
                        </h3>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {selectedVillage.description || selectedVillage.moTa || 'Khu dân cư thuộc xã Thạch Khê, tỉnh Hà Tĩnh.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Dân số</span>
                          <span className="text-xs font-extrabold text-slate-800 block">
                            {selectedVillage.population !== undefined ? selectedVillage.population : '---'} 
                            {selectedVillage.households !== undefined ? ` (${selectedVillage.households} hộ)` : ''}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Diện tích</span>
                          <span className="text-xs font-extrabold text-slate-800 block">
                            {selectedVillage.area || '---'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Ban điều hành thôn</span>
                        
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Bí thư chi bộ</span>
                            <span className="font-bold text-slate-900">
                              {selectedVillage.partySecretary || selectedVillage.secretary || selectedVillage.biThu || 'Đang cập nhật'}
                            </span>
                          </div>
                          {(selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu) && selectedVillage.secPhone !== "---" && (
                            <a 
                              href={`tel:${selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu}`} 
                              className="inline-flex items-center space-x-1 text-indigo-600 font-bold hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60"
                            >
                              <IconPhone className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{selectedVillage.secPhone || selectedVillage.secretaryPhone || selectedVillage.sdtBiThu}</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Thôn trưởng</span>
                            <span className="font-bold text-slate-900">
                              {selectedVillage.leader || selectedVillage.head || selectedVillage.thonTruong || 'Đang cập nhật'}
                            </span>
                          </div>
                          {(selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong) && selectedVillage.leadPhone !== "---" && (
                            <a 
                              href={`tel:${selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong}`} 
                              className="inline-flex items-center space-x-1 text-indigo-600 font-bold hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60"
                            >
                              <IconPhone className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{selectedVillage.leadPhone || selectedVillage.headPhone || selectedVillage.sdtThonTruong}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-6">Chọn 1 thôn phía trên để xem chi tiết.</p>
                  )}
                </div>
              </div>
            </div>

            {selectedVillage && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-indigo-600" />
                      <span>Thư viện Địa điểm & Tiện ích tại {currentVillageName}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Danh sách toàn bộ công trình hành chính, y tế, giáo dục, di tích và dịch vụ thuộc thôn</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Tìm địa điểm trong thôn..."
                        value={villageSearch}
                        onChange={(e) => setVillageSearch(e.target.value)}
                        className="pl-7 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                      />
                      <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                    </div>

                    <span className="bg-indigo-50 text-indigo-700 font-bold text-[11px] px-3 py-1 rounded-xl border border-indigo-100 shrink-0">
                      {villageLocations.length} địa điểm
                    </span>
                  </div>
                </div>

                {villageLocations.length > 0 ? (
                  <div className={`grid gap-4 ${
                    villageLocations.length === 1 
                      ? 'grid-cols-1 max-w-md' 
                      : villageLocations.length === 2 
                      ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {villageLocations.map(loc => (
                      <div key={loc.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-3 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all group">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-100/80 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider">
                              {getCategoryName(loc.type)}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{loc.name}</h4>
                          {loc.info && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{loc.info}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button 
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 font-bold py-1.5 px-2 rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            <span>Bản đồ</span>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => handleOpenDetailModal(loc)}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold py-1.5 px-2 rounded-lg transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <IconNavigation className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                    <IconMapPin className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Không tìm thấy địa điểm tiện ích nào trong thôn này.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. TAB ĐỊA ĐIỂM ================= */}
      {activeTab === 'overview' && (
        <div className="flex-1 flex flex-col md:flex-row relative md:overflow-hidden h-auto min-h-0 md:h-[calc(100vh-140px)] bg-slate-50">
          
          <div className="order-2 md:order-1 w-full md:w-[420px] bg-white border-r border-slate-200/80 flex flex-col shadow-sm z-10 shrink-0 h-auto md:h-full overflow-hidden">
            
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <IconFilter className="w-4 h-4 text-indigo-600" />
                <span>Danh sách Địa điểm ({filteredLocations.length})</span>
              </span>
              <button 
                type="button"
                onClick={handleResetFilter}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <IconRotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>

            <div className="p-3 space-y-2.5 border-b border-slate-100 bg-white shrink-0 text-xs">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm địa điểm, dịch vụ..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs bg-slate-50/50"
                />
                <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCat('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                    selectedCat === 'all' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({locations.length})
                </button>
                {[
                  { key: 'admin', label: 'Hành chính' },
                  { key: 'hotel', label: 'Lưu trú' },
                  { key: 'restaurant', label: 'Ẩm thực' },
                  { key: 'health', label: 'Y tế' },
                  { key: 'school', label: 'Giáo dục' },
                  { key: 'temple', label: 'Tâm linh' },
                  { key: 'tourism', label: 'Du lịch' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCat(cat.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                      selectedCat === cat.key 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin bg-slate-50/50 max-h-[380px] md:max-h-none">
              {filteredLocations.length > 0 ? (
                filteredLocations.map(loc => {
                  const isSelected = selectedLocation?.id === loc.id;
                  return (
                    <div 
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-indigo-50/90 border-indigo-300 shadow-sm ring-1 ring-indigo-500' 
                          : 'bg-white border-slate-200/70 hover:border-indigo-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9.5px] font-bold uppercase tracking-wider">
                            {getCategoryName(loc.type)}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">{loc.name}</h4>
                        {loc.info && (
                          <p className="text-[11px] text-slate-500 truncate">{loc.info}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(loc); }}
                          className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl text-[10.5px] transition-colors"
                        >
                          Chi tiết
                        </button>
                        <span className="bg-indigo-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10.5px] shadow-xs">
                          Bản đồ
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <IconMapPin className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Không tìm thấy địa điểm phù hợp.</p>
                </div>
              )}
            </div>

          </div>

          <div className="order-1 md:order-2 flex-1 h-[360px] md:h-full relative">
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
        <div className="flex-1 p-4 sm:p-8 bg-slate-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-6">
              
              <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <IconZap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Trung tâm Tiện ích số & Dịch vụ công</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Cổng thông tin tương tác trực tuyến phục vụ người dân và doanh nghiệp xã Thạch Khê</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <IconFileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Cổng Dịch vụ công trực tuyến</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Nộp hồ sơ trực tuyến, tra cứu tiến độ giải quyết thủ tục hành chính, hộ tịch, đất đai.</p>
                  </div>
                  <a 
                    href="https://dichvucong.gov.vn" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs w-full transition-all shadow-xs cursor-pointer"
                  >
                    <span>Truy cập Cổng dịch vụ công</span>
                    <IconExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <IconPhone className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Đường dây nóng & Danh bạ</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Liên hệ trực tiếp Thường trực UBND, Công an xã, Trạm Y tế và các ban ngành đoàn thể.</p>
                  </div>
                  <a 
                    href="tel:02393888111"
                    className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs w-full transition-all shadow-xs cursor-pointer"
                  >
                    <IconPhone className="w-3.5 h-3.5" />
                    <span>Gọi Hotline: 0239.3.888.111</span>
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100/80 flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                      <IconUsers className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Sự kiện & Hoạt động xã</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Cập nhật thông tin sinh hoạt cộng đồng, hội diễn văn nghệ Ví Giặm, ngày hội hiến máu nhân đạo.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setActiveTab('villages'); setSelectedLocation(null); }}
                    className="inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs w-full transition-all shadow-xs cursor-pointer"
                  >
                    <span>Xem lịch hoạt động 11 thôn</span>
                    <IconChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100/80 flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <IconMapPin className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Tra cứu Bản đồ & Địa điểm</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Khám phá ranh giới 11 thôn, các di tích lịch sử, cơ sở y tế, trường học và địa điểm dịch vụ.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs w-full transition-all shadow-xs cursor-pointer"
                  >
                    <span>Mở Bản đồ tổng quan</span>
                    <IconMapPin className="w-3.5 h-3.5" />
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
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <div>
          <p className="font-bold text-slate-200">Bản Đồ Số & Quản Lý Thông Tin Xã Thạch Khê, Tỉnh Hà Tĩnh</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cơ quan chủ quản: UBND Xã Thạch Khê. Phục vụ công tác chuyển đổi số cộng đồng.</p>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          <span>Phiên bản 2.0 • Phát triển bởi Đội ngũ Chuyển đổi số</span>
        </div>
      </footer>
    </div>
  );
}