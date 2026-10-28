import React, { useState, useRef, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ReportModal from './client/ReportModal';
import SearchProgressModal from './client/SearchProgressModal';
import MapComponent from './client/MapComponent';
import LocationDetailModal from './client/LocationDetailModal';

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
const IconBuilding = ({ className = "w-4 h-4 text-blue-700" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const IconZap = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const IconChevronDown = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
);
const IconFileText = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const IconLock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const IconCompass = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const IconMusic = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>
);
const IconVolumeOff = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5 6 9H3v6h3l5 4V5zm5 4 5 6m0-6-5 6" /></svg>
);

export default function ClientHome({ 
  locations = [], 
  villages = [], 
  communeBoundary = [],
  searchTerm = '', 
  setSearchTerm, 
  onGoToAdmin,
  onAddNewReport,
  reports = []
}) {
  const [villagesData, setVillagesData] = useState(villages);
  const [categories, setCategories] = useState([]);
  const [communeInfo, setCommuneInfo] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState('villages');
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const backgroundMusicRef = useRef(null);

  const handleToggleBackgroundMusic = async () => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch (err) {
        console.warn("Không thể phát nhạc nền:", err);
      }
    }
  };

  useEffect(() => {
    if (villages && villages.length > 0) {
      setVillagesData(villages);
    }
  }, [villages]);

  useEffect(() => {
    async function fetchFirebaseData() {
      try {
        setLoadingData(true);
        if (!villages || villages.length === 0) {
          const villagesSnap = await getDocs(collection(db, "villages"));
          const villagesList = villagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          villagesList.sort((a, b) => (a.id || 0) - (b.id || 0));
          setVillagesData(villagesList);
        }

        const catSnap = await getDocs(collection(db, "categories"));
        const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        catList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(catList);

        const communeSnap = await getDocs(collection(db, "commune_info"));
        if (!communeSnap.empty) {
          setCommuneInfo(communeSnap.docs[0].data());
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Firebase Firestore:", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchFirebaseData();
  }, [villages]);

  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [overviewSelectedLocation, setOverviewSelectedLocation] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [villageSearch, setVillageSearch] = useState('');

  const [activeLocationDetail, setActiveLocationDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  
  // 🛠️ Chuẩn hóa và quét toàn diện để lấy đầy đủ mảng images cho Modal chi tiết
  const handleOpenDetailModal = (loc) => {
    // Tìm địa điểm cập nhật mới nhất từ state locations của app
    const rawLoc = locations.find(l => String(l.id) === String(loc?.id)) || loc;
    
    let allImages = [];
    
    // 1. Lấy từ mảng hoặc object images
    if (rawLoc.images) {
      if (Array.isArray(rawLoc.images)) {
        allImages = [...rawLoc.images];
      } else if (typeof rawLoc.images === 'object') {
        allImages = Object.values(rawLoc.images);
      }
    }

    // 2. Lấy thêm từ photos hoặc gallery nếu có
    if (Array.isArray(rawLoc.photos)) allImages = [...allImages, ...rawLoc.photos];
    if (Array.isArray(rawLoc.gallery)) allImages = [...allImages, ...rawLoc.gallery];

    // 3. Dự phòng các trường ảnh đơn lẻ
    allImages = [
      ...allImages,
      rawLoc.mediaUrl,
      rawLoc.image,
      rawLoc.imageUrl,
      rawLoc.photo,
      rawLoc.thumbnail
    ];

    // Lọc sạch các url hợp lệ, loại bỏ trùng lặp và rỗng
    const cleanImages = [...new Set(
      allImages
        .map(item => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return (item.url || item.src || item.imageUrl || item.image || '').trim();
          }
          return '';
        })
        .filter(url => {
          if (!url) return false;
          const lower = url.toLowerCase();
          return (
            lower !== 'null' &&
            lower !== 'undefined' &&
            lower !== '' &&
            !lower.endsWith('/null') &&
            !lower.endsWith('/undefined')
          );
        })
    )];

    const freshLoc = {
      ...rawLoc,
      images: cleanImages, // Đảm bảo gán mảng đầy đủ nhiều ảnh vào đây
      mediaUrl: cleanImages.length > 0 ? cleanImages[0] : (rawLoc.mediaUrl || '')
    };

    setActiveLocationDetail(freshLoc);
    setIsDetailModalOpen(true);
  };

  const [isPickingMap, setIsPickingMap] = useState(false);
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [detectedLocationName, setDetectedLocationName] = useState('');

  const [mapCenter, setMapCenter] = useState([18.3950, 105.9550]);
  const [overviewMapCenter, setOverviewMapCenter] = useState([18.3950, 105.9550]);
  
  const [mapZoom, setMapZoom] = useState(12);
  const [overviewMapZoom, setOverviewMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('streets');

  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

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

  const filteredLocations = locations.filter(loc => {
    const locType = String(loc.type || loc.category || '');
    const matchesCategory = selectedCats.length === 0 || selectedCats.includes(locType);

    const locName = (loc.name || '').toLocaleLowerCase('vi-VN');
    const locInfo = (loc.info || loc.desc || '').toLocaleLowerCase('vi-VN');
    const query = (searchTerm || '').trim().toLocaleLowerCase('vi-VN');

    const matchesSearch = locName.includes(query) || locInfo.includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleToggleCategory = (categoryId) => {
    const id = String(categoryId);
    setSelectedCats(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleSelectLocation = (loc) => {
    setSelectedVillage(null);
    setSelectedLocation(loc);
    if (loc && loc.lat && loc.lng) {
      setMapCenter([parseFloat(loc.lat), parseFloat(loc.lng)]);
      setMapZoom(16);
    }
  };

  const handleSelectOverviewLocation = (loc) => {
    setOverviewSelectedLocation(loc);
    if (loc && loc.lat && loc.lng) {
      setOverviewMapCenter([parseFloat(loc.lat), parseFloat(loc.lng)]);
      setOverviewMapZoom(16);
    }
  };

  const handleSelectVillage = (village) => {
    setSelectedVillage(current => current?.id === village?.id ? null : village);
    setSelectedLocation(null);
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
      }
    } catch (err) {
      console.error("Lỗi định tuyến:", err);
    }
  };

  const handleDirectGPSRoute = (lat, lng, targetObj) => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    setMapCenter([numLat, numLng]);
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
        fetchRoadRoute(curLat, curLng, numLat, numLng);
      },
      () => {
        const fallbackLat = 18.4250;
        const fallbackLng = 105.9160;
        setUserLocation([fallbackLat, fallbackLng]);
        fetchRoadRoute(fallbackLat, fallbackLng, numLat, numLng);
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
      alert('Gửi phản ánh thành công! UBND xã đã ghi nhận thông tin.');
    } catch (err) {
      console.error("Lỗi khi gửi phản ánh:", err);
      alert('Đã xảy ra lỗi khi gửi phản ánh.');
    }
  };

  const handleSearchProgress = (e) => {
    e.preventDefault();
    const inputPhone = (searchPhone || '').trim();
    const found = reports.filter(r => r.phone && r.phone.trim() === inputPhone);
    setSearchResult(found);
  };

  const getCategoryName = (typeId) => {
    const found = categories?.find(c => String(c.id) === String(typeId));
    return found ? found.label : (typeId || 'Địa điểm khác');
  };

  const currentVillageName = selectedVillage?.name || selectedVillage?.tenThon || '';

  const villageLocations = selectedVillage ? locations.filter(l => {
    const villageId = String(selectedVillage.id ?? '');
    const locationVillageId = String(l.villageId ?? l.thonId ?? l.village_id ?? '');
    const villageFields = [l.villageName, l.village, l.thon, l.tenThon, l.address, l.diaChi, l.info]
      .filter(Boolean)
      .map(value => String(value).toLocaleLowerCase('vi-VN'));
    const villageName = currentVillageName.toLocaleLowerCase('vi-VN');
    const isDirectMatch = locationVillageId !== '' && locationVillageId === villageId;
    const isInfoMatch = villageName && villageFields.some(value => value.includes(villageName));
    const query = villageSearch.trim().toLocaleLowerCase('vi-VN');
    const matchesSearch = !query ||
      String(l.name || '').toLocaleLowerCase('vi-VN').includes(query) ||
      String(l.info || l.desc || '').toLocaleLowerCase('vi-VN').includes(query);
    return (isDirectMatch || isInfoMatch) && matchesSearch;
  }) : [];

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700">Đang tải dữ liệu Bản đồ Xã Thạch Khê từ hệ thống đám mây...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white relative">
      
      <header className="bg-white text-slate-900 shadow-sm px-4 sm:px-7 py-3 sm:py-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 z-30 shrink-0 border-b border-slate-200">
        <div className="flex items-center justify-between md:justify-start space-x-3">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Logo Xã Thạch Khê" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-wide text-slate-900 flex items-center gap-1.5">
                <IconCompass className="w-4 h-4 text-amber-400" />
                <span>Bản Đồ Số Xã Thạch Khê</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Ứng dụng tích hợp thông tin địa bàn và tra cứu thuận tiện.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 relative flex-wrap">
          <a 
            href="tel:02393888111" 
            className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <IconPhone className="w-3.5 h-3.5" />
            <span>Hotline: <strong>0239.3.888.111</strong></span>
          </a>

          <div className="hidden xl:flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600">Diện tích: <strong className="text-blue-700 font-extrabold">{communeInfo?.area || '4,631.8 ha'}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">Số hộ: <strong className="text-blue-700 font-extrabold">{communeInfo?.households || '4,639'}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">Nhân khẩu: <strong className="text-blue-700 font-extrabold">{communeInfo?.population || '17,515'}</strong></span>
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <button 
              type="button"
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full text-left px-4 py-2.5 hover:bg-rose-50 hover:text-rose-600 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <IconAlert className="w-4 h-4 text-rose-500" />
                  <span>Gửi phản ánh sự cố mới</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsActionMenuOpen(false); setIsSearchModalOpen(true); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 hover:text-blue-700 font-semibold flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
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
            className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs px-3.5 py-2.5 rounded-xl font-semibold border border-slate-200 shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <IconLock className="w-3.5 h-3.5 text-slate-400" />
            <span>Quản trị</span>
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-4 sm:px-7 py-3 shadow-sm z-10 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full sm:w-auto justify-stretch sm:justify-center overflow-x-auto scrollbar-none">
            
            <button 
              type="button"
              onClick={() => setActiveTab('villages')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'villages' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
                  : 'text-slate-600 hover:text-blue-800 hover:bg-white'
              }`}
            >
              <IconUsers className={`w-4.5 h-4.5 ${activeTab === 'villages' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>11 Thôn</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'villages' ? 'bg-blue-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {villagesData.length}
              </span>
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
                  : 'text-slate-600 hover:text-blue-800 hover:bg-white'
              }`}
            >
              <IconMapPin className={`w-4.5 h-4.5 ${activeTab === 'overview' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Địa điểm</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'overview' ? 'bg-blue-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {locations.length}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('utilities')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'utilities' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
                  : 'text-slate-600 hover:text-blue-800 hover:bg-white'
              }`}
            >
              <IconZap className={`w-4.5 h-4.5 ${activeTab === 'utilities' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Tiện ích số</span>
            </button>

          </div>
        </div>
      </div>

      {activeTab === 'villages' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="w-full max-w-[1800px] mx-auto px-0 sm:px-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-8 h-[400px] lg:h-[calc(100vh-220px)] bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm overflow-hidden relative flex flex-col">
                <div className="w-full h-full rounded-xl overflow-hidden relative flex-1">
                  <MapComponent 
                    key="villages-map"
                    villages={villagesData}
                    defaultCenter={defaultCenter}
                    currentCenter={mapCenter}
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
                    onSelectVillage={handleSelectVillage}
                    fixedVillageOverview={true}
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

              <div className="lg:col-span-4 h-auto lg:h-[calc(100vh-220px)] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-2">
                    <IconFileText className="w-4.5 h-4.5 text-blue-700" />
                    <span>Danh sách các Thôn ({villagesData.length})</span>
                  </span>
                </div>

                <div className="p-3.5 overflow-y-auto space-y-2 max-h-[260px] lg:max-h-none lg:h-1/2 border-b border-slate-200 scrollbar-thin">
                  {villagesData.map(v => {
                    const isSelected = selectedVillage?.id === v.id;
                    return (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => handleSelectVillage(v)}
                        aria-pressed={isSelected}
                        className={`w-full text-left px-4 py-3 rounded-xl border font-semibold cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-sm ring-2 ring-blue-100'
                            : 'bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: v.color || '#64748b', boxShadow: isSelected ? '0 0 0 4px rgba(59,130,246,0.16)' : 'none' }} />
                          <span className="truncate text-sm font-bold">{v.name || v.tenThon}</span>
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>{isSelected ? 'Đang chọn' : 'Chọn'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50/70 lg:h-1/2 overflow-y-auto space-y-4 scrollbar-thin">
                  {selectedVillage ? (
                    <div className="space-y-3.5">
                      <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <IconBuilding className="w-4 h-4 text-blue-700" />
                          <span>Thông tin {currentVillageName}</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Dân số</span>
                          <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                            {selectedVillage.population !== undefined ? selectedVillage.population : '---'} 
                            {selectedVillage.households !== undefined ? ` (${selectedVillage.households} hộ)` : ''}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Diện tích</span>
                          <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                            {selectedVillage.area || '---'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Ban điều hành thôn</span>
                        
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Bí thư chi bộ</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {selectedVillage.cadres?.partySecretary?.name || selectedVillage.partySecretary || 'Đang cập nhật'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Thôn trưởng</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {selectedVillage.cadres?.villageLeader?.name || selectedVillage.leader || 'Đang cập nhật'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-8">Chọn một thôn trong danh sách để xem thông tin chi tiết.</p>
                  )}
                </div>
              </div>
            </div>

            {selectedVillage && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                      <IconMapPin className="w-4.5 h-4.5 text-blue-700" />
                      <span>Thư viện Địa điểm & Tiện ích tại {currentVillageName}</span>
                    </h3>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-100 shrink-0">
                    {villageLocations.length} địa điểm
                  </span>
                </div>

                {villageLocations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {villageLocations.map(loc => (
                      <article key={loc.id} className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                          <img 
                            src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"} 
                            alt={loc.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <p className="text-[9px] uppercase tracking-wide font-bold text-slate-500 mb-1">{getCategoryName(loc.type || loc.category)}</p>
                          <h4 className="font-extrabold text-blue-700 text-xs leading-snug">{loc.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{loc.info || loc.desc}</p>
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(loc)}
                            className="mt-3 pt-2.5 border-t border-slate-100 w-full flex items-center justify-between text-[10px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                          >
                            <span>Chi tiết tiện ích</span><span className="text-sm leading-none">›</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-8">Không tìm thấy địa điểm nào phù hợp tại thôn này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="w-full max-w-[1800px] mx-auto px-0 sm:px-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Tra cứu địa điểm</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tổng số: {locations.length} địa điểm</p>
                  </div>
                  {selectedCats.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setSelectedCats([])}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700 mb-1.5 block">Từ khóa</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                        placeholder="Nhập tên địa điểm..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
                      />
                      <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </label>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Thể loại địa điểm</span>
                      <span className="text-[10px] text-slate-400">({selectedCats.length} chọn)</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {(categories || []).map(cat => {
                        const isSelected = selectedCats.includes(String(cat.id));
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => handleToggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-200' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>

              <section className="lg:col-span-9 h-[420px] sm:h-[500px] lg:h-[calc(100vh-260px)] bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm overflow-hidden relative flex flex-col">
                <div className="w-full rounded-xl overflow-hidden relative flex-1 min-h-0">
                  <MapComponent
                    key="overview-map"
                    villages={villagesData}
                    defaultCenter={defaultCenter}
                    currentCenter={overviewMapCenter}
                    mapZoom={overviewMapZoom}
                    mapStyle={mapStyle}
                    setMapStyle={setMapStyle}
                    isPickingMap={false}
                    setIsPickingMap={() => {}}
                    setIsReportModalOpen={setIsReportModalOpen}
                    setReportForm={setReportForm}
                    setPickedLatLng={() => {}}
                    setDetectedLocationName={() => {}}
                    pickedLatLng={null}
                    userLocation={userLocation}
                    routeCoordinates={routeCoordinates}
                    selectedVillage={null}
                    filteredLocations={filteredLocations}
                    selectedLocation={overviewSelectedLocation}
                    onSelectLocation={handleSelectOverviewLocation}
                    onDirectGPSRoute={handleDirectGPSRoute}
                    getCategoryName={getCategoryName}
                    reports={reports}
                    onOpenDetail={handleOpenDetailModal}
                  />
                </div>
              </section>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <IconMapPin className="w-4.5 h-4.5 text-blue-700" />
                  <span>Danh sách địa điểm & Cơ sở ({filteredLocations.length})</span>
                </h3>
                <span className="text-xs text-slate-500">Tự động trượt mượt mà ↔</span>
              </div>

              {filteredLocations.length > 0 ? (
                <div className="relative group">
                  <div 
                    id="location-carousel"
                    className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
                  >
                    {filteredLocations.map(loc => (
                      <div 
                        key={loc.id} 
                        onClick={() => handleSelectOverviewLocation(loc)}
                        className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-slate-200 hover:border-blue-500 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group/card"
                      >
                        <div>
                          <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                            <img 
                              src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"} 
                              alt={loc.name} 
                              className="w-full h-full object-cover group-hover/card:scale-105 transition duration-500 ease-out"
                            />
                            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                              {getCategoryName(loc.type || loc.category)}
                            </span>
                          </div>

                          <div className="p-3.5 pb-2 space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1">{loc.name}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{loc.info || loc.desc || loc.address || 'Địa điểm thuộc xã Thạch Khê'}</p>
                          </div>
                        </div>

                        <div className="p-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(loc);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-[11px] cursor-pointer"
                          >
                            Xem chi tiết →
                          </button>
                          {loc.lat && loc.lng && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectGPSRoute(loc.lat, loc.lng, loc);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] transition shadow-xs cursor-pointer"
                            >
                              🧭 Chỉ đường
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-6">Không tìm thấy địa điểm nào phù hợp với từ khóa hoặc danh mục đã chọn.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'utilities' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Tiện ích số & Dịch vụ công trực tuyến</h3>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={handleToggleBackgroundMusic}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg font-bold text-xs transition-all duration-300 cursor-pointer ${
            isMusicPlaying 
              ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-200' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          title={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        >
          {isMusicPlaying ? (
            <>
              <IconMusic className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Đang phát nhạc</span>
            </>
          ) : (
            <>
              <IconVolumeOff className="w-4 h-4 text-slate-400" />
              <span>Bật nhạc nền</span>
            </>
          )}
        </button>
      </div>

      <audio
        ref={backgroundMusicRef}
        src="/music/background-music.mp3"
        loop
        preload="auto"
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onSubmit={handleReportSubmit}
        id="report-modal"
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
        onSearch={handleSearchProgress}
        searchResult={searchResult}
      />

      <LocationDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        location={activeLocationDetail}
        getCategoryName={getCategoryName}
        onDirectGPSRoute={handleDirectGPSRoute}
      />
    </div>
  );
}