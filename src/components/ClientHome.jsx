import React, { useState, useRef, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MapComponent from './client/MapComponent';
import LocationDetailModal from './client/LocationDetailModal';

// ===== ICONS =====
const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
const IconFileText = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const IconLock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const IconCompass = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);
const IconFilter = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
);
const IconGrid = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const IconList = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const IconRefresh = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
  searchTerm = '', 
  setSearchTerm, 
  onGoToAdmin
}) {
  const [villagesData, setVillagesData] = useState(villages);
  const [categories, setCategories] = useState([]);
  const [communeInfo, setCommuneInfo] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // ĐÃ SỔ GIÁ TRỊ MẶC ĐỊNH THÀNH 'villages' ĐỂ MỞ LÊN LÀ HIỆN THÔN XÓM TRƯỚC
  const [activeTab, setActiveTab] = useState('villages');
  
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [weather, setWeather] = useState({ temp: '27°C', condition: 'Đang cập nhật...', icon: '🌤️' });

  const [dbKeyword, setDbKeyword] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [selectedVillageIds, setSelectedVillageIds] = useState([]);
  const [dbSortBy, setDbSortBy] = useState('name_asc');
  const [dbViewMode, setDbViewMode] = useState('grid');
  const [dbPageSize, setDbPageSize] = useState(10);
  const [dbCurrentPage, setDbCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://wttr.in/Ha+Tinh?format=j1');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (data && data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];
          const temp = current.temp_C;
          const desc = current.weatherDesc && current.weatherDesc[0] ? current.weatherDesc[0].value : 'Quang mây';
          
          setWeather({ 
            temp: `${temp}°C`, 
            condition: desc.includes('Cloud') ? 'Có mây' : (desc.includes('Rain') ? 'Có mưa' : 'Trời quang'), 
            icon: desc.includes('Rain') ? '🌧️' : (desc.includes('Cloud') ? '⛅' : '☀️') 
          });
        }
      } catch (err) {
        console.warn("Lỗi gọi API thời tiết:", err);
        setWeather({ temp: '28°C', condition: 'Thạch Khê', icon: '🌤️' });
      }
    }
    fetchWeather();
  }, []);

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
  const [villageSearch, setVillageSearch] = useState('');

  const [activeLocationDetail, setActiveLocationDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetailModal = (loc) => {
    const rawLoc = locations.find(l => String(l.id) === String(loc?.id)) || loc;
    
    let allImages = [];
    if (rawLoc.images) {
      if (Array.isArray(rawLoc.images)) {
        allImages = [...rawLoc.images];
      } else if (typeof rawLoc.images === 'object') {
        allImages = Object.values(rawLoc.images);
      }
    }

    if (Array.isArray(rawLoc.photos)) allImages = [...allImages, ...rawLoc.photos];
    if (Array.isArray(rawLoc.gallery)) allImages = [...allImages, ...rawLoc.gallery];

    allImages = [
      ...allImages,
      rawLoc.mediaUrl,
      rawLoc.image,
      rawLoc.imageUrl,
      rawLoc.photo,
      rawLoc.thumbnail
    ];

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
      images: cleanImages,
      mediaUrl: cleanImages.length > 0 ? cleanImages[0] : (rawLoc.mediaUrl || '')
    };

    setActiveLocationDetail(freshLoc);
    setIsDetailModalOpen(true);
  };

  const [mapCenter, setMapCenter] = useState([18.3950, 105.9550]);
  const [overviewMapCenter, setOverviewMapCenter] = useState([18.3950, 105.9550]);
  
  const [mapZoom, setMapZoom] = useState(12);
  const [overviewMapZoom, setOverviewMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('streets');
  
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

  const defaultCenter = [18.3950, 105.9550];

  const filteredLocations = locations.filter(loc => {
    const locType = String(loc.type || loc.category || '').trim().toLowerCase();
    
    const matchesCategory = selectedCats.length === 0 || selectedCats.some(catKey => {
      const matchedCat = categories.find(c => 
        String(c.id).trim().toLowerCase() === String(catKey).trim().toLowerCase() ||
        String(c.label).trim().toLowerCase() === String(catKey).trim().toLowerCase()
      );
      if (!matchedCat) return locType === String(catKey).trim().toLowerCase();
      
      return locType === String(matchedCat.id).trim().toLowerCase() ||
             locType === String(matchedCat.label).trim().toLowerCase();
    });

    const locName = (loc.name || '').toLocaleLowerCase('vi-VN');
    const locInfo = (loc.info || loc.desc || '').toLocaleLowerCase('vi-VN');
    const query = (searchTerm || '').trim().toLocaleLowerCase('vi-VN');

    const matchesSearch = !query || locName.includes(query) || locInfo.includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleToggleCategory = (cat) => {
    const identifier = String(cat.id || cat.label).trim();
    setSelectedCats(current =>
      current.includes(identifier) 
        ? current.filter(item => item !== identifier) 
        : [...current, identifier]
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
    setActiveTab('overview');
    setSelectedLocation(null);
    setOverviewSelectedLocation(null);

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    setOverviewMapCenter([numLat, numLng]);
    setOverviewMapZoom(16);

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

  const handleClearRoute = () => {
    setRouteCoordinates([]);
    setUserLocation(null);
  };

  const getCategoryName = (typeId) => {
    const found = categories?.find(c => String(c.id) === String(typeId) || String(c.label) === String(typeId));
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

  const handleToggleDbCat = (catId) => {
    const idStr = String(catId);
    setSelectedCatIds(prev => prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  };

  const handleToggleDbVillage = (vId) => {
    const idStr = String(vId);
    setSelectedVillageIds(prev => prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  };

  const handleResetDbFilters = () => {
    setDbKeyword('');
    setSelectedCatIds([]);
    setSelectedVillageIds([]);
    setDbSortBy('name_asc');
  };

  const dbFilteredData = useMemo(() => {
    return locations.filter(loc => {
      const q = dbKeyword.trim().toLocaleLowerCase('vi-VN');
      const name = String(loc.name || '').toLocaleLowerCase('vi-VN');
      const info = String(loc.info || loc.desc || '').toLocaleLowerCase('vi-VN');
      const addr = String(loc.address || loc.diaChi || '').toLocaleLowerCase('vi-VN');
      const matchesKw = !q || name.includes(q) || info.includes(q) || addr.includes(q);

      const locType = String(loc.type || loc.category || '').trim().toLowerCase();
      const matchesCat = selectedCatIds.length === 0 || selectedCatIds.some(catId => {
        const catObj = categories.find(c => String(c.id).toLowerCase() === catId.toLowerCase() || String(c.label).toLowerCase() === catId.toLowerCase());
        if (!catObj) return locType === catId.toLowerCase();
        return locType === String(catObj.id).toLowerCase() || locType === String(catObj.label).toLowerCase();
      });

      const locVillageId = String(loc.villageId ?? loc.thonId ?? loc.village_id ?? '');
      const locVillageName = String(loc.villageName || loc.thon || loc.address || '').toLocaleLowerCase('vi-VN');
      const matchesVillage = selectedVillageIds.length === 0 || selectedVillageIds.some(vId => {
        const vObj = villagesData.find(v => String(v.id) === vId);
        const vName = vObj ? String(vObj.name || vObj.tenThon).toLocaleLowerCase('vi-VN') : '';
        return (locVillageId !== '' && locVillageId === vId) || (vName && locVillageName.includes(vName));
      });

      return matchesKw && matchesCat && matchesVillage;
    }).sort((a, b) => {
      if (dbSortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'vi');
      if (dbSortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '', 'vi');
      return 0;
    });
  }, [locations, dbKeyword, selectedCatIds, selectedVillageIds, dbSortBy, categories, villagesData]);

  // PHÂN TRANG KẾT QUẢ TRA CỨU (sau khi đã lọc và sắp xếp)
  const dbTotalPages = Math.max(1, Math.ceil(dbFilteredData.length / dbPageSize));
  const safeDbCurrentPage = Math.min(dbCurrentPage, dbTotalPages);
  const dbStartIndex = (safeDbCurrentPage - 1) * dbPageSize;
  const dbPaginatedData = dbFilteredData.slice(dbStartIndex, dbStartIndex + dbPageSize);

  // Quay về trang đầu khi điều kiện tra cứu hoặc số lượng mỗi trang thay đổi
  useEffect(() => {
    setDbCurrentPage(1);
  }, [dbKeyword, selectedCatIds, selectedVillageIds, dbSortBy, dbPageSize]);

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
    <div className="w-full min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white relative">
      {/* Header */}
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
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                <IconCompass className="w-4 h-4 text-amber-400" />
                <span>Bản Đồ Số Xã Thạch Khê</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Ứng dụng tích hợp thông tin địa bàn và tra cứu thuận tiện.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2.5 relative flex-wrap">
          <div className="h-11 bg-gradient-to-r from-blue-50 to-sky-50 text-slate-700 text-xs px-3.5 rounded-xl font-semibold border border-blue-100 shadow-2xs flex items-center gap-2.5 whitespace-nowrap">
            <span className="text-xl leading-none">{weather.icon}</span>
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Thạch Khê</span>
              <span className="font-extrabold text-blue-800 text-xs mt-0.5">
                {weather.temp} - {weather.condition}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex h-11 bg-gradient-to-r from-blue-50 to-sky-50 text-slate-700 text-xs px-3.5 rounded-xl font-semibold border border-blue-100 shadow-2xs items-center gap-2.5 whitespace-nowrap">
            <span className="text-slate-600">Diện tích: <strong className="text-blue-700 font-extrabold">{communeInfo?.area || '4,631.8 ha'}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Số hộ: <strong className="text-blue-700 font-extrabold">{communeInfo?.households || '4,639'}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Nhân khẩu: <strong className="text-blue-700 font-extrabold">{communeInfo?.population || '17,515'}</strong></span>
          </div>

          <button 
            type="button"
            onClick={onGoToAdmin}
            className="h-11 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs px-3.5 rounded-xl font-semibold border border-slate-200 shadow-2xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <IconLock className="w-3.5 h-3.5 text-slate-400" />
            <span>Quản trị</span>
          </button>
        </div>
      </header>

      

{/* THANH TAB ĐIỀU HƯỚNG 4 MỤC CHÍNH */}
<div className="bg-[#f4f7fb] px-2 sm:px-7 py-2.5 z-10 shrink-0 border-b border-slate-200/60">
  <div className="max-w-5xl mx-auto flex items-center justify-center">
    <div className="grid grid-cols-4 items-center gap-1 p-1 sm:p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 w-full sm:w-auto shadow-inner">
      
      {/* Tab 1 */}
      <button 
        type="button"
        onClick={() => setActiveTab('db_search')}
        className={`px-1.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer ${
          activeTab === 'db_search' 
            ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
            : 'text-slate-600 hover:text-blue-800 hover:bg-white'
        }`}
      >
        <IconSearch className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${activeTab === 'db_search' ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="truncate">Tra cứu</span>
      </button>

      {/* Tab 2 */}
      <button 
        type="button"
        onClick={() => setActiveTab('villages')}
        className={`px-1.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer ${
          activeTab === 'villages' 
            ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
            : 'text-slate-600 hover:text-blue-800 hover:bg-white'
        }`}
      >
        <IconUsers className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${activeTab === 'villages' ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="truncate">Thôn xóm</span>
      </button>
      
      {/*  */}
      <button 
        type="button"
        onClick={() => setActiveTab('overview')}
        className={`px-1.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer ${
          activeTab === 'overview' 
            ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
            : 'text-slate-600 hover:text-blue-800 hover:bg-white'
        }`}
      >
        <IconMapPin className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${activeTab === 'overview' ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="truncate">Địa điểm</span>
      </button>

      {/* Tab 4 */}
      <button 
        type="button"
        onClick={() => setActiveTab('utilities')}
        className={`px-1.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer ${
          activeTab === 'utilities' 
            ? 'bg-blue-700 text-white shadow-sm shadow-blue-900/15' 
            : 'text-slate-600 hover:text-blue-800 hover:bg-white'
        }`}
      >
        <IconZap className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${activeTab === 'utilities' ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="truncate">Tiện ích</span>
      </button>

    </div>
  </div>
</div>

 {/* ==================== TAB 1: TRA CỨU CSDL FIREBASE ==================== */}
{activeTab === 'db_search' && (
  <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
    <div className="max-w-[1700px] mx-auto space-y-6">

      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <IconSearch className="w-6 h-6 text-blue-700" />
              <span>Tra cứu & Tìm kiếm Cơ sở dữ liệu CSDL</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hiện có <strong className="text-blue-700 font-extrabold">{locations.length}</strong> địa điểm trong hệ thống CSDL. Tích chọn các nội dung để lọc kết quả.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDbFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start md:self-auto shrink-0"
          >
            <IconRefresh className="w-4 h-4 text-slate-500" />
            <span>Bỏ chọn & Đặt lại</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={dbKeyword}
            onChange={(e) => setDbKeyword(e.target.value)}
            placeholder="Nhập tên địa điểm, từ khóa nội dung, địa chỉ..."
            className="w-full h-12 sm:h-13 pl-12 pr-10 rounded-2xl text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium text-sm sm:text-base transition-all shadow-inner"
          />
          <IconSearch className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
          {dbKeyword && (
            <button
              type="button"
              onClick={() => setDbKeyword('')}
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          
          {/* PHẦN LỌC THỂ LOẠI (DẠNG 1 HÀNG DỌC CÓ CHECKBOX, ICON & SỐ LƯỢNG) */}
          <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <IconFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Lĩnh vực / Danh mục ({categories.length})</span>
              </span>
              {selectedCatIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCatIds([])}
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Bỏ chọn thể loại ({selectedCatIds.length})
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {categories.map(cat => {
                const catIdStr = String(cat.id);
                const isChecked = selectedCatIds.includes(catIdStr);
                const catColor = cat.color || '#2563EB';

                const count = locations.filter(loc => 
                  String(loc.type || loc.category) === catIdStr || String(loc.type || loc.category) === String(cat.label)
                ).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleDbCat(catIdStr)}
                    style={{
                      borderColor: isChecked ? catColor : undefined,
                      backgroundColor: isChecked ? `${catColor}08` : '#ffffff'
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                      isChecked ? 'shadow-2xs ring-1' : 'border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDbCat(catIdStr)}
                        className="w-4 h-4 rounded cursor-pointer shrink-0 ml-0.5"
                        style={{ accentColor: catColor }}
                      />
                      <span 
                        style={{
                          backgroundColor: `${catColor}15`,
                          color: catColor
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition"
                      >
                        {cat.icon || '📌'}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">{cat.label}</span>
                    </div>

                    <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PHẦN LỌC THÔN / ĐỊA BÀN */}
          <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                📍 <span>Tích chọn Thôn / Địa bàn ({villagesData.length})</span>
              </span>
              {selectedVillageIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedVillageIds([])}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  Bỏ chọn thôn ({selectedVillageIds.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1 scrollbar-thin">
              {villagesData.map(v => {
                const vIdStr = String(v.id);
                const isChecked = selectedVillageIds.includes(vIdStr);
                return (
                  <label
                    key={v.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none border ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDbVillage(vIdStr)}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                    />
                    <span>{v.name || v.tenThon}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN HIỂN THỊ (SỐ LƯỢNG, SẮP XẾP, GRID/LIST) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
        <div className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-2">
          <span>Hiển thị</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
            {dbFilteredData.length} / {locations.length}
          </span>
          <span>địa điểm phù hợp</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 whitespace-nowrap">
            <span>Số lượng:</span>
            <select
              value={dbPageSize}
              onChange={(e) => setDbPageSize(Number(e.target.value))}
              className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Số địa điểm hiển thị mỗi trang"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={30}>30 / trang</option>
              <option value={40}>40 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </label>

          <select
            value={dbSortBy}
            onChange={(e) => setDbSortBy(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="name_asc">Sắp xếp: Tên (A - Z)</option>
            <option value="name_desc">Sắp xếp: Tên (Z - A)</option>
          </select>

          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setDbViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${dbViewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Dạng lưới"
            >
              <IconGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDbViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${dbViewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Dạng danh sách"
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HIỂN THỊ DANH SÁCH ĐỊA ĐIỂM (GRID HOẶC LIST) */}
      {dbFilteredData.length > 0 ? (
        dbViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {dbPaginatedData.map(loc => (
              <div
                key={loc.id}
                onClick={() => handleOpenDetailModal(loc)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col p-3 group"
              >
                <div className="h-44 w-full rounded-xl bg-slate-100 relative overflow-hidden">
                  <img
                    src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-sm">
                    {getCategoryName(loc.type || loc.category)}
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                      {loc.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {loc.info || loc.desc || 'Chưa có thông tin mô tả chi tiết cho địa điểm này.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700">Xem chi tiết</span>
                    {loc.lat && loc.lng && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectGPSRoute(loc.lat, loc.lng, loc);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                      >
                        🧭 Chỉ đường
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {dbPaginatedData.map(loc => (
              <div
                key={loc.id}
                onClick={() => handleOpenDetailModal(loc)}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"}
                    alt={loc.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0 space-y-1">
                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {getCategoryName(loc.type || loc.category)}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors truncate">
                      {loc.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {loc.info || loc.desc || 'Chưa có thông tin mô tả chi tiết.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailModal(loc);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Chi tiết
                  </button>
                  {loc.lat && loc.lng && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectGPSRoute(loc.lat, loc.lng, loc);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      🧭 Chỉ đường
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Không tìm thấy địa điểm phù hợp</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Không tìm thấy địa điểm nào khớp với các thể loại hoặc từ khóa bạn đã chọn.
          </p>
          <button
            type="button"
            onClick={handleResetDbFilters}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition cursor-pointer"
          >
            Xem lại tất cả CSDL địa điểm
          </button>
        </div>
      )}

      {/* THANH PHÂN TRANG */}
      {dbFilteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Đang hiển thị <strong className="text-slate-800">
              {dbStartIndex + 1}–{Math.min(dbStartIndex + dbPageSize, dbFilteredData.length)}
            </strong> trong tổng số <strong className="text-blue-700">{dbFilteredData.length}</strong> địa điểm
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              disabled={safeDbCurrentPage <= 1}
              onClick={() => setDbCurrentPage(page => Math.max(1, page - 1))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ‹ Trước
            </button>

            {Array.from({ length: dbTotalPages }, (_, index) => index + 1)
              .filter(page => page === 1 || page === dbTotalPages || Math.abs(page - safeDbCurrentPage) <= 2)
              .reduce((items, page, index, pages) => {
                if (index > 0 && page - pages[index - 1] > 1) items.push('ellipsis-' + page);
                items.push(page);
                return items;
              }, [])
              .map(page => typeof page === 'string' ? (
                <span key={page} className="px-1 text-slate-400 text-xs">…</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setDbCurrentPage(page)}
                  aria-current={safeDbCurrentPage === page ? 'page' : undefined}
                  className={`min-w-9 h-9 px-2 rounded-xl text-xs font-extrabold transition ${
                    safeDbCurrentPage === page
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              disabled={safeDbCurrentPage >= dbTotalPages}
              onClick={() => setDbCurrentPage(page => Math.min(dbTotalPages, page + 1))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Sau ›
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
)}

      {/* ==================== TAB 2: 11 THÔN ==================== */}
      {activeTab === 'villages' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="w-full max-w-[1800px] mx-auto flex-1 min-h-[420px] relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
              
              <div className="lg:col-span-8 h-[clamp(20rem,55vh,32rem)] lg:h-[calc(100vh-220px)] bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm overflow-hidden relative flex flex-col">
                <div className="w-full h-full rounded-xl overflow-hidden relative flex-1">
                  <MapComponent 
                    key="villages-map"
                    villages={villagesData}
                    selectedVillageId={selectedVillage?.id} 
                    communeBoundary={communeInfo?.boundary}
                    defaultCenter={defaultCenter}
                    currentCenter={mapCenter}
                    mapZoom={mapZoom}
                    mapStyle={mapStyle}
                    setMapStyle={setMapStyle}
                    isPickingMap={false}
                    setIsPickingMap={() => {}}
                    setIsReportModalOpen={() => {}}
                    setReportForm={() => {}}
                    setPickedLatLng={() => {}}
                    setDetectedLocationName={() => {}}
                    pickedLatLng={null}
                    userLocation={null}
                    routeCoordinates={[]}
                    selectedVillage={selectedVillage}
                    onSelectVillage={handleSelectVillage}
                    fixedVillageOverview={false}
                    hideVillageNames={false}
                    hideLocationPins={true}
                    filteredLocations={filteredLocations}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                    onDirectGPSRoute={handleDirectGPSRoute}
                    getCategoryName={getCategoryName}
                    reports={[]}
                    onOpenDetail={handleOpenDetailModal}
                    onClearRoute={handleClearRoute}
                    disableVillagePopup={true}
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

                <div className="p-3 overflow-y-auto space-y-2.5 max-h-[320px] lg:max-h-none lg:h-1/2 border-b border-slate-200 scrollbar-thin sm:p-3.5">
                  {villagesData.map(v => {
                    const isSelected = selectedVillage?.id === v.id;
                    const villageColor = v.color || '#3b82f6';

                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVillage(v)}
                        className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-400 shadow-md ring-2 ring-blue-100 scale-[1.01]'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-black/10" 
                            style={{ backgroundColor: villageColor }} 
                          />

                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">
                              {v.name || v.tenThon}
                            </h4>
                            
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pl-2">
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-700 block">
                              {v.population !== undefined ? `${v.population} dân` : '---'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {v.households !== undefined ? `${v.households} hộ` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              <div className="p-4 bg-slate-50/70 lg:h-1/2 overflow-y-auto space-y-4 scrollbar-thin">
  {selectedVillage ? (
    <div className="space-y-3.5">
      {/* Tiêu đề & Thông tin mô tả lịch sử thôn */}
      <div className="border-b border-slate-200 pb-2.5">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <IconBuilding className="w-4 h-4 text-blue-700 shrink-0" />
          <span>Thông tin {selectedVillage.name || selectedVillage.tenThon}</span>
        </h3>
        
        {/* Hiển thị trường infor ở đây */}
        {selectedVillage.infor && (
          <p className="text-xs text-slate-600 mt-1 pl-6 leading-relaxed bg-white/60 p-2 rounded-lg border border-slate-100">
            {selectedVillage.infor}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Dân số</span>
          <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
            {selectedVillage.population !== undefined ? selectedVillage.population : '---'} 
            {selectedVillage.households !== undefined ? ` (${selectedVillage.households} hộ)` : ''}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Diện tích</span>
          <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
            {selectedVillage.area || '---'}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <span className="text-[11px] text-slate-500 block uppercase font-extrabold tracking-wider">Ban điều hành thôn</span>
        
        {/* Bí thư chi bộ */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Bí thư chi bộ</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
              {selectedVillage.partySecretary || 'Đang cập nhật'}
            </span>
          </div>
          {selectedVillage.secPhone && selectedVillage.secPhone !== "---" ? (
            <a href={`tel:${selectedVillage.secPhone}`} className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shrink-0">
              📞 {selectedVillage.secPhone}
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 italic shrink-0">Chưa có SĐT</span>
          )}
        </div>

        {/* Thôn trưởng */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Thôn trưởng</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
              {selectedVillage.leader || 'Đang cập nhật'}
            </span>
          </div>
          {selectedVillage.leadPhone && selectedVillage.leadPhone !== "---" ? (
            <a href={`tel:${selectedVillage.leadPhone}`} className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shrink-0">
              📞 {selectedVillage.leadPhone}
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 italic shrink-0">Chưa có SĐT</span>
          )}
        </div>

        {/* Trưởng Ban CTMT */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Trưởng Ban CTMT</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
              {selectedVillage.frontLeader || 'Đang cập nhật'}
            </span>
          </div>
          {selectedVillage.frontPhone && selectedVillage.frontPhone !== "---" ? (
            <a href={`tel:${selectedVillage.frontPhone}`} className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shrink-0">
              📞 {selectedVillage.frontPhone}
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 italic shrink-0">Chưa có SĐT</span>
          )}
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
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                      <IconMapPin className="w-4.5 h-4.5 text-blue-700" />
                      <span>Thư viện Địa điểm & Tiện ích tại {selectedVillage.name || selectedVillage.tenThon}</span>
                    </h3>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-100 shrink-0">
                    {villageLocations.length} địa điểm
                  </span>
                </div>

                {villageLocations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {villageLocations.map(loc => (
                      <div 
                        key={loc.id} 
                        onClick={() => handleOpenDetailModal(loc)}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col p-3 group"
                      >
                        <div className="h-48 w-full rounded-xl bg-slate-100 relative overflow-hidden">
                          <img 
                            src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"} 
                            alt={loc.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold shadow-sm">
                            {getCategoryName(loc.type || loc.category)}
                          </div>
                        </div>

                        <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                              {loc.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {loc.info || loc.desc || 'Chưa có thông tin mô tả chi tiết cho địa điểm này.'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                            <span>Xem chi tiết</span>
                            <span className="text-sm leading-none group-hover:translate-x-1 transition-transform">›</span>
                          </div>
                        </div>
                      </div>
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
{/* ==================== TAB 3: ĐỊA ĐIỂM & CƠ SỞ (TỐI ƯU ẨN DANH SÁCH TRÊN MOBILE) ==================== */}
{activeTab === 'overview' && (
  <div className="relative w-full h-[calc(100vh-115px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row p-1.5 sm:p-3 bg-slate-100 gap-2 overflow-hidden">

    {/* ==================== BẢNG TRA CỨU BÊN TRÁI (ẨN TRÊN MOBILE: DÙNG class "hidden md:flex") ==================== */}
    <aside
      className="
        hidden md:flex
        w-full md:w-[460px] lg:w-[500px] shrink-0
        bg-white
        border border-slate-200/80
        rounded-2xl sm:rounded-3xl
        shadow-sm
        flex-col
        h-full
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#12366b] to-[#1d4ed8] px-3 py-2 sm:px-4 sm:py-3 text-white">
        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="w-4 h-4 rounded bg-white/15 flex items-center justify-center text-[10px]">📍</span>
              <span className="text-[9px] font-bold tracking-wider text-blue-100 uppercase">
                BẢN ĐỒ SỐ THẠCH KHÊ
              </span>
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm tracking-tight">
              Khám phá địa điểm
            </h3>
          </div>

          <div className="bg-white/15 rounded-xl px-2 py-0.5 text-right shrink-0">
            <span className="text-xs font-extrabold">{filteredLocations.length}</span>
            <span className="text-[8px] text-blue-100 block">kết quả</span>
          </div>
        </div>
      </div>

      {/* KHU VỰC TÌM KIẾM VÀ BỘ LỌC THOÁNG ĐÃNG CÓ DROPDOWN GỢI Ý */}
      <div className="shrink-0 p-2 bg-white border-b border-slate-100 space-y-1.5 relative z-20">
        
        {/* Ô TÌM KIẾM CÓ MENU GỢI Ý TỰ ĐỘNG */}
        <div className="relative group">
          <input
            type="text"
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            placeholder="Tìm tên địa điểm, cơ sở..."
            className="w-full h-8.5 pl-8.5 pr-7 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 group-focus-within:text-blue-600 transition" />
          
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm && setSearchTerm('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
            >
              ✕
            </button>
          )}

          {/* DROPDOWN HIỂN THỊ DANH SÁCH GỢI Ý KHI NHẬP TỪ KHÓA */}
          {searchTerm && searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y divide-slate-100 scrollbar-thin">
              <div className="bg-slate-900 text-white text-[10px] font-extrabold uppercase px-3 py-1.5 tracking-wider sticky top-0 z-10 flex items-center justify-between">
                <span>Tra cứu kết quả ({filteredLocations.length})</span>
                <span className="text-slate-400 text-[9px] font-normal">Nhấp để chọn</span>
              </div>

              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const catName = getCategoryName(loc.type || loc.category);
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        handleSelectOverviewLocation(loc);
                        setSearchTerm(loc.name);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/80 transition flex flex-col justify-center group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 leading-tight transition">
                        {loc.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                        (Lĩnh vực: <strong className="text-blue-600 font-semibold">{catName}</strong>)
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-center text-xs text-slate-500 font-medium">
                  Không tìm thấy địa điểm phù hợp với từ khóa "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* DANH MỤC LĨNH VỰC: THIẾT KẾ DẠNG LƯỚI 2 CỘT GỌN GÀNG, THOÁNG MẮT */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Lĩnh vực ({categories.length + 1})
            </span>
            {selectedCats.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCats([])}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 max-h-24 sm:max-h-28 overflow-y-auto pr-1 scrollbar-thin">
            {/* Nút Tất cả */}
            <div
              onClick={() => setSelectedCats([])}
              className={`flex items-center justify-between p-1.5 rounded-xl border transition cursor-pointer select-none ${
                selectedCats.length === 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs ${
                  selectedCats.length === 0 ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  🗺️
                </span>
                <span className="text-[11px] font-extrabold truncate">Tất cả</span>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                selectedCats.length === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {locations.length}
              </span>
            </div>

            {/* Các danh mục CSDL */}
            {(categories || []).map(cat => {
              const catId = String(cat.id || cat.label);
              const isSelected = selectedCats.includes(catId) || selectedCats.includes(String(cat.label));
              const catColor = cat.color || '#2563EB';
              
              const count = locations.filter(loc => 
                String(loc.type || loc.category) === catId || String(loc.type || loc.category) === String(cat.label)
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCats([]);
                    } else {
                      setSelectedCats([catId]);
                    }
                  }}
                  style={{
                    borderColor: isSelected ? catColor : '#e2e8f0',
                    backgroundColor: isSelected ? catColor : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155'
                  }}
                  className="flex items-center justify-between p-1.5 rounded-xl border transition cursor-pointer select-none shadow-2xs hover:border-blue-300 min-w-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span 
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${catColor}15`,
                        color: isSelected ? '#ffffff' : catColor
                      }}
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px] transition"
                    >
                      {cat.icon || '📌'}
                    </span>
                    <span className="text-[11px] font-bold truncate">{cat.label}</span>
                  </div>

                  <span 
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569'
                    }}
                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0"
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DANH SÁCH ĐỊA ĐIỂM */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 bg-slate-50/80 space-y-2.5 scrollbar-thin">
        {filteredLocations.length > 0 ? (
          filteredLocations.map(loc => {
            const isSelected = overviewSelectedLocation?.id === loc.id;
            const imageUrl = loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961dbe?w=500";
            
            return (
              <div
                key={loc.id}
                onClick={() => handleSelectOverviewLocation(loc)}
                className={`group bg-white rounded-2xl transition-all cursor-pointer p-2.5 flex flex-col gap-2 relative overflow-hidden border shadow-2xs ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/10 shadow-md'
                    : 'border-slate-200/80 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="relative w-full h-32 sm:h-40 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-xs">
                  <img
                    src={imageUrl}
                    alt={loc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-blue-700 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                    {getCategoryName(loc.type || loc.category)}
                  </span>
                </div>

                <div className="min-w-0 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                      {loc.name}
                    </h4>

                    <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-400 shrink-0 font-medium">ĐC:</span>
                        <span className="truncate font-medium text-slate-700">{loc.address || loc.info || 'Thôn Thạch Hải, Xã Thạch Khê'}</span>
                      </div>
                      {loc.workingHours && (
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-slate-400 shrink-0 font-medium">Giờ:</span>
                          <span className="font-medium text-slate-700 truncate">{loc.workingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1.5 border-t border-slate-100 gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailModal(loc);
                      }}
                      className="px-3 py-1 rounded-xl text-[10px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                    >
                      Chi tiết
                    </button>

                    {loc.lat && loc.lng && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectGPSRoute(loc.lat, loc.lng, loc);
                        }}
                        className="px-3 py-1 rounded-xl text-[10px] font-extrabold text-white bg-slate-900 hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        <span>🧭</span>
                        <span>Đường đi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg mb-1.5">🔍</div>
            <p className="text-xs text-slate-600 font-bold">Không tìm thấy địa điểm phù hợp</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm && setSearchTerm('');
                setSelectedCats && setSelectedCats([]);
              }}
              className="mt-2 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* ==================== KHUNG BẢN ĐỒ BÊN PHẢI (CHIẾM TRỌN MÀN HÌNH TRÊN MOBILE) ==================== */}
    <div className="flex-1 h-full relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
      <MapComponent
        key="overview-map"
        villages={villagesData}
        communeBoundary={communeInfo?.boundary}
        defaultCenter={defaultCenter}
        currentCenter={overviewMapCenter}
        mapZoom={overviewMapZoom}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        isPickingMap={false}
        setIsPickingMap={() => {}}
        setIsReportModalOpen={() => {}}
        setReportForm={() => {}}
        setPickedLatLng={() => {}}
        setDetectedLocationName={() => {}}
        pickedLatLng={null}
        userLocation={userLocation}
        routeCoordinates={routeCoordinates}
        setRouteCoordinates={setRouteCoordinates}
        selectedVillage={null}
        hideVillageNames={false}
        hideLocationPins={false}
        filteredLocations={filteredLocations}
        selectedLocation={overviewSelectedLocation}
        onSelectLocation={handleSelectOverviewLocation}
        onDirectGPSRoute={handleDirectGPSRoute}
        getCategoryName={getCategoryName}
        reports={[]}
        onOpenDetail={handleOpenDetailModal}
        onClearRoute={handleClearRoute}
        disableVillageHover={true}
        disableVillagePopup={true}
      />
    </div>

  </div>
)}
      {/* ==================== TAB 4: TIỆN ÍCH SỐ ==================== */}
      {activeTab === 'utilities' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm">
            <div className="max-w-2xl space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl tracking-tight">Tiện ích số & Dịch vụ công trực tuyến</h3>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Cung cấp các liên kết và công cụ tra cứu số phục vụ người dân và cán bộ xã Thạch Khê.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="min-h-14 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-800">
                <span className="block text-sm font-bold text-blue-700">Cổng Dịch Vụ Công Trực Tuyến</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-600">Thực hiện các thủ tục hành chính công mức độ 3, 4</span>
              </div>
              <div className="min-h-14 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-800">
                <span className="block text-sm font-bold text-blue-700">Tra cứu quy hoạch đất đai</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-600">Thông tin bản đồ địa chính và thông số quy hoạch</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nút bật/tắt nhạc nền (nâng z-index lên z-50 để đè lên footer) */}
      {/* NÚT ĐIỀU KHIỂN NHẠC NỀN */}
<div className="fixed bottom-12 right-4 sm:right-5 z-50">
  <button
    type="button"
    onClick={handleToggleBackgroundMusic}
    className={`w-11 h-11 sm:w-auto sm:h-auto flex items-center justify-center gap-2 sm:px-3.5 sm:py-2.5 rounded-full shadow-lg font-bold text-xs transition-all duration-300 cursor-pointer ${
      isMusicPlaying
        ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-200'
        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
    }`}
    title={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
    aria-label={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
  >
    {isMusicPlaying ? (
      <>
        <IconMusic className="w-5 h-5 sm:w-4 sm:h-4 text-amber-300 animate-spin" />
        <span className="hidden sm:inline">Đang phát nhạc</span>
      </>
    ) : (
      <>
        <IconVolumeOff className="w-5 h-5 sm:w-4 sm:h-4 text-slate-400" />
        <span className="hidden sm:inline">Bật nhạc nền</span>
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
      
      {/* Modal chi tiết địa điểm */}
      <LocationDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        location={activeLocationDetail}
        getCategoryName={getCategoryName}
        onDirectGPSRoute={handleDirectGPSRoute}
      />
      {/* FOOTER CUỐI TRANG */}
<footer className="w-full shrink-0 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 pb-6 border-b border-slate-800/80">
            
            {/* Cột 1: Thông tin cơ quan */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">🏛</span>
                <h4 className="font-extrabold text-white text-sm tracking-wide">
                XÃ THẠCH KHÊ
                </h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hệ thống Bản đồ số & Cổng thông tin hành chính công tích hợp tiện ích đời sống, tra cứu địa điểm và dữ liệu thôn xóm.
              </p>
            </div>

            {/* Cột 2: Thông tin liên hệ */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
                Thông tin liên hệ
              </h5>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center gap-2">
                  <span>📍</span> Địa chỉ: Trụ sở UBND xã Thạch Khê, thôn Đồng Giang, tỉnh Hà Tĩnh
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span> Email: thachkhe@hatinh.gov.vn
                </li>
                <li className="flex items-center gap-2">
                  <span>🕒</span> Giờ làm việc: Thứ Hai - Thứ Sáu (Sáng: 7h30 - 11h30, Chiều: 14h00 - 17h30)
                </li>
              </ul>
            </div>

            {/* Cột 3: Đơn vị vận hành */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
                Đơn vị thực hiện
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Được xây dựng và phát triển bởi <strong className="text-white font-bold">Đội ngũ Chuyển đổi số xã Thạch Khê</strong> nhằm phục vụ công tác cải cách hành chính và chuyển đổi số cộng đồng.
              </p>
            </div>

          </div>

          {/* Dòng bản quyền copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>© 2026 Bản quyền thuộc về UBND xã Thạch Khê. Bảo lưu mọi quyền.</p>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
