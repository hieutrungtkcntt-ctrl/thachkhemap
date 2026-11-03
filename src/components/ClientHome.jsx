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

  const [activeTab, setActiveTab] = useState('db_search');
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

      {/* BANNER THÔNG BÁO FULL MÀN HÌNH */}
      <div className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-sm border-b border-blue-600/30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 z-10 min-w-0 w-full">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 text-lg border border-white/20">
              🏛️
            </div>

            <div className="min-w-0 flex-1 leading-snug">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  HÀNH CHÍNH SỐ
                </span>
                <h2 className="font-extrabold text-xs sm:text-sm md:text-base text-white tracking-tight break-words">
                  Bản Đồ Số & Cổng Thông Tin Địa Bàn Xã Thạch Khê
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-1">
                Tra cứu dữ liệu 11 thôn, các di tích lịch sử, cơ quan hành chính công và hệ thống tiện ích số xã Thạch Khê.
              </p>
            </div>
          </div>
        </div>
      </div>

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
      
      {/* Tab 3 */}
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
                
                <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <IconFilter className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tích chọn Thể loại / Phân loại ({categories.length})</span>
                    </span>
                    {selectedCatIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCatIds([])}
                        className="text-[11px] text-blue-600 font-bold hover:underline"
                      >
                        Bỏ chọn thể loại ({selectedCatIds.length})
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 scrollbar-thin">
                    {categories.map(cat => {
                      const catIdStr = String(cat.id);
                      const isChecked = selectedCatIds.includes(catIdStr);
                      return (
                        <label
                          key={cat.id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none border ${
                            isChecked
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDbCat(catIdStr)}
                            className="w-3.5 h-3.5 accent-blue-700 rounded cursor-pointer"
                          />
                          <span>{cat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

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

                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 scrollbar-thin">
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
                            <p className="text-[11px] text-slate-500 truncate">
                              Trưởng thôn: <span className="font-semibold text-slate-700">{v.leader || 'Chưa cập nhật'}</span>
                            </p>
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
                      <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <IconBuilding className="w-4 h-4 text-blue-700" />
                          <span>Thông tin {selectedVillage.name || selectedVillage.tenThon}</span>
                        </h3>
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
                        
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] text-slate-400 block font-medium">Bí thư chi bộ</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                              {selectedVillage.partySecretary || 'Đang cập nhật'}
                            </span>
                          </div>
                          {selectedVillage.secPhone && selectedVillage.secPhone !== "---" ? (
                            <a 
                              href={`tel:${selectedVillage.secPhone}`} 
                              className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shrink-0"
                            >
                              📞 {selectedVillage.secPhone}
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic shrink-0">Chưa có SĐT</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] text-slate-400 block font-medium">Thôn trưởng</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                              {selectedVillage.leader || 'Đang cập nhật'}
                            </span>
                          </div>
                          {selectedVillage.leadPhone && selectedVillage.leadPhone !== "---" ? (
                            <a 
                              href={`tel:${selectedVillage.leadPhone}`} 
                              className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shrink-0"
                            >
                              📞 {selectedVillage.leadPhone}
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

      {/* ==================== TAB 3: ĐỊA ĐIỂM & CƠ SỞ ==================== */}
      
{/* ==================== TAB 3: ĐỊA ĐIỂM & CƠ SỞ ==================== */}
{activeTab === 'overview' && (
  <div className="flex-1 min-h-[460px] relative flex flex-col p-2 sm:p-3 bg-slate-100">

    {/* KHUNG BẢN ĐỒ */}
    <div className="w-full max-w-[1800px] mx-auto flex-1 min-h-0 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white">

      {/* NÚT MỞ TRA CỨU */}
      {!isSearchDrawerOpen && (
       <div className="absolute top-[82px] left-3 sm:top-[82px] sm:left-3 z-[999]">
          <button
            type="button"
            onClick={() => setIsSearchDrawerOpen(true)}
           className="w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-3 ..."
          >
            <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
              <IconSearch className="w-4 h-4 text-blue-600" />
            </span>
            <span className="hidden sm:inline">Khám phá địa điểm</span>
            <span className="hidden sm:inline bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
              {filteredLocations.length}
            </span>
          </button>
        </div>
      )}

      {/* ==================== BẢNG TRA CỨU ==================== */}
      {isSearchDrawerOpen && (
        <aside className="absolute top-0 left-0 bottom-0 z-[1001] w-full sm:w-[390px] md:w-[410px] max-w-full bg-white border-r border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">

          {/* HEADER */}
          <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#12366b] to-[#1d4ed8] px-5 py-5 text-white">
            <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-12 -bottom-14 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <IconSearch className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-[10px] font-bold tracking-[1.5px] text-blue-100 uppercase">
                    BẢN ĐỒ SỐ THẠCH KHÊ
                  </span>
                </div>

                <h3 className="font-extrabold text-lg tracking-tight">
                  Khám phá địa điểm
                </h3>
                <p className="text-[11px] text-blue-100 mt-1">
                  Tìm kiếm cơ sở, tiện ích và di tích
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSearchDrawerOpen(false)}
                className="w-9 h-9 shrink-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition"
                aria-label="Đóng bảng tra cứu"
              >
                ✕
              </button>
            </div>

            <div className="relative mt-4 flex items-center gap-2">
              <div className="bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-base font-extrabold">
                  {filteredLocations.length}
                </span>
                <span className="text-[10px] text-blue-100 font-medium">
                  địa điểm phù hợp
                </span>
              </div>
            </div>
          </div>

          {/* KHU VỰC TÌM KIẾM VÀ LỌC */}
          <div className="shrink-0 p-4 bg-white border-b border-slate-100 space-y-4">

            {/* Ô TÌM KIẾM */}
            <div className="relative group">
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                placeholder="Tìm tên địa điểm, cơ sở..."
                className="w-full h-11 pl-11 pr-10 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              />

              <IconSearch className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-blue-600 transition" />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm && setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  aria-label="Xóa từ khóa"
                >
                  ✕
                </button>
              )}
            </div>

            {/* TIÊU ĐỀ BỘ LỌC */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                Danh mục địa điểm
              </span>
              <button
                type="button"
                onClick={() => setSelectedCats([])}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
              >
                Xóa bộ lọc
              </button>
            </div>

            {/* DANH MỤC */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCats([])}
                className={`h-8 px-4 rounded-lg text-[11px] font-extrabold shrink-0 transition-all ${
                  selectedCats.length === 0
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Tất cả
              </button>

              {(categories || []).map(cat => {
                const isSelected =
                  selectedCats.includes(String(cat.id)) ||
                  selectedCats.includes(String(cat.label));

                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat)}
                    className={`h-8 px-3.5 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {cat.label}
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DANH SÁCH ĐỊA ĐIỂM */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-50/80 space-y-2.5 scrollbar-thin">

            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                Danh sách kết quả
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {filteredLocations.length} địa điểm
              </span>
            </div>

            {filteredLocations.length > 0 ? (
              filteredLocations.map(loc => {
                const isSelected = overviewSelectedLocation?.id === loc.id;

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      handleSelectOverviewLocation(loc);
                      setIsSearchDrawerOpen(false);
                    }}
                    className={`group bg-white rounded-2xl transition-all cursor-pointer p-3 flex gap-3 relative overflow-hidden border ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/70 ring-2 ring-blue-500/10 shadow-sm'
                        : 'border-slate-200/80 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* ẢNH ĐỊA ĐIỂM */}
                    <div className="relative w-[88px] h-[88px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={loc.mediaUrl || loc.image || loc.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"}
                        alt={loc.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
                    </div>

                    {/* THÔNG TIN */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wide truncate">
                            {getCategoryName(loc.type || loc.category)}
                          </span>

                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                          {loc.name}
                        </h4>

                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                          {loc.info || loc.desc || 'Thuộc địa bàn xã Thạch Khê'}
                        </p>
                      </div>

                      {/* NÚT CHỨC NĂNG */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(loc);
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                        >
                          Chi tiết
                        </button>

                        {loc.lat && loc.lng && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectGPSRoute(loc.lat, loc.lng, loc);
                              setIsSearchDrawerOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-white bg-slate-900 hover:bg-blue-700 transition flex items-center gap-1"
                          >
                            <span>🧭</span>
                            Chỉ đường
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <IconSearch className="w-7 h-7 text-blue-300" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-700">
                  Không tìm thấy địa điểm
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Thử thay đổi từ khóa hoặc danh mục tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm && setSearchTerm('');
                    setSelectedCats([]);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* FOOTER BẢNG TRA CỨU */}
          <div className="shrink-0 px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Bản đồ số xã Thạch Khê
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              Dữ liệu địa điểm
            </span>
          </div>
        </aside>
      )}

      {/* THÔNG TIN LỘ TRÌNH GPS */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-[1000] sm:max-w-[360px] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/10 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Đang chỉ đường GPS
              </p>
              <p className="text-xs sm:text-sm font-extrabold truncate text-white">
                {overviewSelectedLocation?.name || "Lộ trình di chuyển"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearRoute}
            className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ml-3"
          >
            ✕ Hủy
          </button>
        </div>
      )}

      {/* BẢN ĐỒ LEAFLET */}
      <div className="absolute inset-0 w-full h-full min-h-0">
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
          selectedVillage={null}
          hideVillageNames={true}
          hideLocationPins={false}
          filteredLocations={filteredLocations}
          selectedLocation={overviewSelectedLocation}
          onSelectLocation={handleSelectOverviewLocation}
          onDirectGPSRoute={handleDirectGPSRoute}
          getCategoryName={getCategoryName}
          reports={[]}
          onOpenDetail={handleOpenDetailModal}
          onClearRoute={handleClearRoute}
        />
      </div>

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
<footer className="
  w-full shrink-0
  bg-white
  border-t border-slate-200
  text-slate-500 text-center
  text-[11px] sm:text-xs
  py-3 px-4
  font-medium
">
  Phát triển bởi{" "}
  <strong className="text-slate-800 font-extrabold">
    Đội ngũ Chuyển đổi số UBND xã Thạch Khê
  </strong>{" "}
  © 2026
</footer>
    </div>
  );
}