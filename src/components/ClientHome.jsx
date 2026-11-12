import React, { useState, useRef, useEffect, useMemo } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
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
const IconNewspaper = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
);
const IconZap = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const IconLock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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

// Danh mục chuyên mục bản tin
const NEWS_CATEGORIES = [
  { id: 'all', label: 'Tất cả bản tin' },
  { id: 'thong-bao', label: 'Thông báo hành chính' },
  { id: 'hoat-dong', label: 'Hoạt động địa phương' },
  { id: 'van-hoa', label: 'Văn hóa - Xã hội' },
  { id: 'an-ninh', label: 'An ninh - Trật tự' },
];

// Kiểm tra URL ảnh hợp lệ
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    lower === 'test' ||
    lower === 'null' ||
    lower === 'undefined' ||
    trimmed.includes('unsplash.com/photo-1507525428034')
  ) {
    return false;
  }
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
};

// Component hiển thị ảnh địa điểm thông minh
const LocationThumbnail = ({
  src,
  alt,
  icon = '📍',
  color = '#2563EB',
  className = "w-20 h-20 rounded-xl",
  compact = false
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (!isValidImageUrl(src) || imgError) {
    return (
      <div
        style={{ backgroundColor: `${color}12`, borderColor: `${color}25` }}
        className={`${className} shrink-0 border flex flex-col items-center justify-center select-none transition-colors`}
      >
        <span className={compact ? "text-base leading-none" : "text-2xl leading-none"}>{icon}</span>
        {!compact && (
          <span className="text-[9px] font-bold text-slate-400 mt-1">Chưa có ảnh</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} shrink-0 overflow-hidden bg-slate-100 relative`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};

// Component hiển thị ảnh bản tin an toàn
const NewsImage = ({ src, alt, className = "w-full h-full object-cover", fallback = null }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (!isValidImageUrl(src) || imgError) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImgError(true)}
      className={className}
    />
  );
};

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

  // State cho Tab Tin tức + Phân trang
  const [newsList, setNewsList] = useState([]);
  const [newsCategory, setNewsCategory] = useState('all');
  const [newsSearch, setNewsSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [newsPageSize, setNewsPageSize] = useState(10);
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);

  useEffect(() => {
    setNewsCurrentPage(1);
  }, [newsCategory, newsSearch, newsPageSize]);

  const [activeTab, setActiveTab] = useState('villages');
  const [weather, setWeather] = useState({ temp: '27°C', condition: 'Đang cập nhật...', icon: '🌤️' });

  // State cho Tab Tra cứu
  const [dbKeyword, setDbKeyword] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [selectedVillageIds, setSelectedVillageIds] = useState([]);
  const [dbSortBy, setDbSortBy] = useState('name_asc');
  const [dbViewMode, setDbViewMode] = useState('grid');
  const [dbPageSize, setDbPageSize] = useState(10);
  const [dbCurrentPage, setDbCurrentPage] = useState(1);

  // State đóng/mở danh sách toàn bộ lĩnh vực ở Tab Địa điểm
  const [showAllOverviewCats, setShowAllOverviewCats] = useState(false);

  // Tải thông tin thời tiết
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

  // Nhạc nền
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

  // Tải dữ liệu danh mục, thôn xóm và thông tin xã
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
        console.error("Lỗi khi tải dữ liệu nền từ Firebase Firestore:", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchFirebaseData();
  }, [villages]);

  // Lắng nghe dữ liệu bản tin thời gian thực từ Firebase collection "news"
  useEffect(() => {
    const unsubscribeNews = onSnapshot(
      collection(db, "news"),
      (snapshot) => {
        const loadedNews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        loadedNews.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setNewsList(loadedNews);
      },
      (error) => {
        console.error("Lỗi lắng nghe collection 'news' từ Firebase:", error);
      }
    );

    return () => unsubscribeNews();
  }, []);

  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [overviewSelectedLocation, setOverviewSelectedLocation] = useState(null);

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
        .filter(url => isValidImageUrl(url))
    )];

    const freshLoc = {
      ...rawLoc,
      images: cleanImages,
      mediaUrl: cleanImages.length > 0 ? cleanImages[0] : ''
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

  const villageLocations = useMemo(() => {
    if (!selectedVillage) return [];
    return locations.filter(loc => {
      const locVillageId = String(loc.villageId ?? loc.thonId ?? loc.village_id ?? '');
      const locVillageName = String(loc.villageName || loc.thon || loc.address || '').toLocaleLowerCase('vi-VN');
      const targetId = String(selectedVillage.id);
      const targetName = String(selectedVillage.name || selectedVillage.tenThon || '').toLocaleLowerCase('vi-VN');
      
      return (locVillageId !== '' && locVillageId === targetId) || (targetName && locVillageName.includes(targetName));
    });
  }, [locations, selectedVillage]);

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

  const handleDirectGPSRoute = (lat, lng) => {
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

  const getCategoryMeta = (typeId) => {
    const key = String(typeId || '').trim().toLowerCase();
    const found = categories?.find(
      c => String(c.id).trim().toLowerCase() === key || String(c.label).trim().toLowerCase() === key
    );
    if (found) return found;

    const fallbackMap = {
      temple: { label: 'Di tích Văn hoá - Tâm linh', icon: '🛕', color: '#D97706' },
      school: { label: 'Cơ sở giáo dục', icon: '🏫', color: '#2563EB' },
      health: { label: 'Cơ sở y tế', icon: '🏥', color: '#EA580C' },
      heatlh: { label: 'Cơ sở y tế', icon: '🏥', color: '#EA580C' },
    };
    return fallbackMap[key] || { label: typeId || 'Địa điểm khác', icon: '📍', color: '#2563EB' };
  };

  const getCategoryName = (typeId) => {
    return getCategoryMeta(typeId).label;
  };

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

  const dbTotalPages = Math.max(1, Math.ceil(dbFilteredData.length / dbPageSize));
  const safeDbCurrentPage = Math.min(dbCurrentPage, dbTotalPages);
  const dbStartIndex = (safeDbCurrentPage - 1) * dbPageSize;
  const dbPaginatedData = dbFilteredData.slice(dbStartIndex, dbStartIndex + dbPageSize);

  useEffect(() => {
    setDbCurrentPage(1);
  }, [dbKeyword, selectedCatIds, selectedVillageIds, dbSortBy, dbPageSize]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3.5 bg-white px-8 py-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700">Đang tải dữ liệu Bản đồ Xã Thạch Khê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white relative">
      
      {/* ==================== HEADER ĐỒNG BỘ ==================== */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md text-slate-900 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 z-40 shrink-0 border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Xã Thạch Khê" 
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                  Bản Đồ Số Xã Thạch Khê
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                  Hà Tĩnh
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
                Cổng thông tin địa bàn, thôn xóm và dịch vụ công trực tuyến
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 flex-wrap">
          <div className="h-10 bg-slate-50 text-slate-700 text-xs px-3 rounded-xl font-semibold border border-slate-200/80 flex items-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none">{weather.icon}</span>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Thời tiết</span>
              <span className="font-extrabold text-slate-800 text-xs mt-0.5">
                {weather.temp} · {weather.condition}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex h-10 bg-blue-50/60 text-slate-700 text-xs px-3.5 rounded-xl font-semibold border border-blue-100 items-center gap-3 whitespace-nowrap">
            <span className="text-slate-600">Diện tích: <strong className="text-blue-700 font-extrabold">{communeInfo?.area || '4,631.8 ha'}</strong></span>
            <span className="text-blue-200">|</span>
            <span className="text-slate-600">Số hộ: <strong className="text-blue-700 font-extrabold">{communeInfo?.households || '4,639'}</strong></span>
            <span className="text-blue-200">|</span>
            <span className="text-slate-600">Nhân khẩu: <strong className="text-blue-700 font-extrabold">{communeInfo?.population || '17,515'}</strong></span>
          </div>

          <button 
            type="button"
            onClick={onGoToAdmin}
            className="h-10 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-blue-700 text-xs px-3.5 rounded-xl font-bold border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <IconLock className="w-3.5 h-3.5 text-slate-400" />
            <span>Quản trị</span>
          </button>
        </div>
      </header>

      {/* ==================== THANH ĐIỀU HƯỚNG 5 TAB ==================== */}
      <nav className="bg-white/80 backdrop-blur-xs px-2 sm:px-6 lg:px-8 py-2 z-30 shrink-0 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <div className="grid grid-cols-5 items-stretch gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-full sm:w-auto">
            
            <button 
              type="button"
              onClick={() => setActiveTab('db_search')}
              className={`min-w-0 h-9 sm:h-10 px-1.5 sm:px-4 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'db_search' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <IconSearch className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'db_search' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">Tra cứu</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('villages')}
              className={`min-w-0 h-9 sm:h-10 px-1.5 sm:px-4 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'villages' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <IconUsers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'villages' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">Thôn xóm</span>
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`min-w-0 h-9 sm:h-10 px-1.5 sm:px-4 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <IconMapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'overview' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">Địa điểm</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('news')}
              className={`min-w-0 h-9 sm:h-10 px-1.5 sm:px-4 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
                activeTab === 'news' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <IconNewspaper className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'news' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">Tin tức</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('utilities')}
              className={`min-w-0 h-9 sm:h-10 px-1.5 sm:px-4 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'utilities' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <IconZap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'utilities' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">Tiện ích</span>
            </button>

          </div>
        </div>
      </nav>

      {/* ==================== TAB 1: TRA CỨU CSDL FIREBASE ==================== */}
      {activeTab === 'db_search' && (
        <div className="w-full flex-1 p-3 sm:p-5 lg:p-6 pb-20">
          <div className="max-w-[1600px] w-full mx-auto space-y-5">
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <IconSearch className="w-4 h-4" />
                    </span>
                    <span>Tra cứu Cơ sở dữ liệu Địa điểm</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Hệ thống hiện quản lý <strong className="text-blue-700 font-extrabold">{locations.length}</strong> địa điểm, cơ sở trên toàn địa bàn xã.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDbFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <IconRefresh className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={dbKeyword}
                  onChange={(e) => setDbKeyword(e.target.value)}
                  placeholder="Nhập tên cơ sở, địa điểm, từ khóa mô tả hoặc địa chỉ..."
                  className="w-full h-11 pl-11 pr-10 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm transition-all"
                />
                <IconSearch className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                {dbKeyword && (
                  <button
                    type="button"
                    onClick={() => setDbKeyword('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                <div className="lg:col-span-7 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <IconFilter className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lĩnh vực / Danh mục ({categories.length})</span>
                    </span>
                    {selectedCatIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCatIds([])}
                        className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Bỏ chọn ({selectedCatIds.length})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
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
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded cursor-pointer shrink-0"
                              style={{ accentColor: catColor }}
                            />
                            <span 
                              style={{ backgroundColor: `${catColor}15`, color: catColor }}
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs"
                            >
                              {cat.icon || '📌'}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">{cat.label}</span>
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <span>📍</span>
                      <span>Địa bàn Thôn ({villagesData.length})</span>
                    </span>
                    {selectedVillageIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedVillageIds([])}
                        className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Bỏ chọn ({selectedVillageIds.length})
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-0.5 scrollbar-thin">
                    {villagesData.map(v => {
                      const vIdStr = String(v.id);
                      const isChecked = selectedVillageIds.includes(vIdStr);
                      return (
                        <label
                          key={v.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none border ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-2">
                <span>Kết quả tìm kiếm:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-extrabold text-xs">
                  {dbFilteredData.length} / {locations.length} địa điểm
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                <select
                  value={dbPageSize}
                  onChange={(e) => setDbPageSize(Number(e.target.value))}
                  className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  aria-label="Số địa điểm hiển thị mỗi trang"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={30}>30 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>

                <select
                  value={dbSortBy}
                  onChange={(e) => setDbSortBy(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="name_asc">Tên: A → Z</option>
                  <option value="name_desc">Tên: Z → A</option>
                </select>

                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setDbViewMode('grid')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${dbViewMode === 'grid' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Dạng lưới"
                  >
                    <IconGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbViewMode('list')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${dbViewMode === 'list' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Dạng danh sách"
                  >
                    <IconList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {dbFilteredData.length > 0 ? (
              dbViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {dbPaginatedData.map(loc => {
                    const meta = getCategoryMeta(loc.type || loc.category);
                    const rawImg = loc.mediaUrl || loc.image || loc.imageUrl || '';

                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleOpenDetailModal(loc)}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col p-3 group"
                      >
                        <div className="relative">
                          <LocationThumbnail
                            src={rawImg}
                            alt={loc.name}
                            icon={meta.icon}
                            color={meta.color}
                            className="h-44 w-full rounded-xl"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-slate-900/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            {meta.label}
                          </div>
                        </div>

                        <div className="pt-3 px-1 flex flex-col flex-1 justify-between space-y-3">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                              {loc.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {loc.info || loc.desc || 'Chưa có thông tin mô tả chi tiết cho địa điểm này.'}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-700 group-hover:underline">Xem chi tiết</span>
                            {loc.lat && loc.lng && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDirectGPSRoute(loc.lat, loc.lng);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[11px] transition cursor-pointer"
                              >
                                🧭 Chỉ đường
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dbPaginatedData.map(loc => {
                    const meta = getCategoryMeta(loc.type || loc.category);
                    const rawImg = loc.mediaUrl || loc.image || loc.imageUrl || '';

                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleOpenDetailModal(loc)}
                        className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <LocationThumbnail
                            src={rawImg}
                            alt={loc.name}
                            icon={meta.icon}
                            color={meta.color}
                            className="w-20 h-20 rounded-xl"
                          />
                          <div className="min-w-0 space-y-1">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              {meta.label}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition-colors truncate">
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
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                          >
                            Chi tiết
                          </button>
                          {loc.lat && loc.lng && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectGPSRoute(loc.lat, loc.lng);
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition flex items-center gap-1 cursor-pointer"
                            >
                              🧭 Chỉ đường
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
                <div className="text-4xl">🔍</div>
                <h3 className="font-extrabold text-slate-800 text-base">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Vui lòng thử thay đổi từ khóa hoặc bỏ bớt các tiêu chí lọc để xem thêm kết quả.
                </p>
                <button
                  type="button"
                  onClick={handleResetDbFilters}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition cursor-pointer"
                >
                  Xem lại tất cả địa điểm
                </button>
              </div>
            )}

            {dbFilteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Hiển thị <strong className="text-slate-800">
                    {dbStartIndex + 1}–{Math.min(dbStartIndex + dbPageSize, dbFilteredData.length)}
                  </strong> trên <strong className="text-blue-700">{dbFilteredData.length}</strong> địa điểm
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={safeDbCurrentPage <= 1}
                    onClick={() => setDbCurrentPage(page => Math.max(1, page - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
                        className={`min-w-8 h-8 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                          safeDbCurrentPage === page
                            ? 'bg-blue-700 text-white shadow-2xs'
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
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================== TAB 2: THÔN XÓM ==================== */}
      {activeTab === 'villages' && (
        <div className="w-full flex-1 p-2 sm:p-4 lg:p-5 pb-16 lg:pb-5">
          <div className="w-full max-w-[1750px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              
              <div className="lg:col-span-8 h-[60vh] lg:h-[calc(100dvh-165px)] min-h-[460px] bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden relative flex flex-col">
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

              <div className="lg:col-span-4 h-[70vh] lg:h-[calc(100dvh-165px)] min-h-[460px] bg-white rounded-xl border border-slate-200/80 flex flex-col overflow-hidden">
                <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200/80 font-extrabold text-xs sm:text-sm text-slate-900 flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-700">📋</span>
                    <span>Danh sách các Thôn ({villagesData.length})</span>
                  </span>
                  {selectedVillage && (
                    <button
                      type="button"
                      onClick={() => setSelectedVillage(null)}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>

                <div className="p-2.5 overflow-y-auto overscroll-contain space-y-1.5 h-[38%] border-b border-slate-200/80 scrollbar-thin">
                  {villagesData.map(v => {
                    const isSelected = selectedVillage?.id === v.id || selectedVillage?.name === v.name;
                    const villageColor = v.color || '#3b82f6';

                    return (
                      <div
                        key={v.id || v.name}
                        onClick={() => handleSelectVillage(v)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 shadow-2xs ring-1 ring-blue-200'
                            : 'bg-white border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0 border border-black/10" 
                            style={{ backgroundColor: villageColor }} 
                          />
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {v.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-2 text-right">
                          <span className="text-[11px] font-bold text-blue-700">
                            {v.population !== undefined ? `${v.population} dân` : '---'}
                          </span>
                          {v.households !== undefined && (
                            <span className="text-[10px] text-slate-400">
                              ({v.households} hộ)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50/60 h-[62%] min-h-0 overflow-y-auto overscroll-contain space-y-3 scrollbar-thin">
                  {selectedVillage ? (
                    <div className="space-y-3">
                      <div className="border-b border-slate-200/80 pb-2.5">
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <span className="text-blue-700">🏛️</span>
                          <span>Thông tin {selectedVillage.name}</span>
                        </h3>
                        
                        {selectedVillage.infor && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
                            {selectedVillage.infor}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Quy mô dân cư</span>
                          <span className="text-xs font-extrabold text-slate-900 block mt-0.5">
                            {selectedVillage.population !== undefined ? `${selectedVillage.population} nhân khẩu` : '---'} 
                            {selectedVillage.households !== undefined ? ` (${selectedVillage.households} hộ)` : ''}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Diện tích</span>
                          <span className="text-xs font-extrabold text-slate-900 block mt-0.5">
                            {selectedVillage.area || '---'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                        <span className="text-[10px] text-blue-700 block uppercase font-extrabold tracking-wider">Cán bộ phụ trách thôn</span>
                        
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Thôn trưởng:</span>
                          <div className="text-right">
                            <strong className="text-slate-900">{selectedVillage.leader || 'Đang cập nhật'}</strong>
                            {selectedVillage.leadPhone && <span className="text-blue-600 font-mono ml-1.5">({selectedVillage.leadPhone})</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Bí thư chi bộ:</span>
                          <div className="text-right">
                            <strong className="text-slate-900">{selectedVillage.partySecretary || 'Đang cập nhật'}</strong>
                            {selectedVillage.secPhone && <span className="text-blue-600 font-mono ml-1.5">({selectedVillage.secPhone})</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Trưởng ban CTMT:</span>
                          <div className="text-right">
                            <strong className="text-slate-900">{selectedVillage.frontLeader || 'Đang cập nhật'}</strong>
                            {selectedVillage.frontPhone && <span className="text-blue-600 font-mono ml-1.5">({selectedVillage.frontPhone})</span>}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider">
                          Địa điểm tại {selectedVillage.name} ({villageLocations.length})
                        </h4>

                        {villageLocations.length > 0 ? (
                          <div className="space-y-1.5">
                            {villageLocations.map(loc => {
                              const meta = getCategoryMeta(loc.type || loc.category);
                              const rawImg = loc.mediaUrl || loc.image || loc.imageUrl || '';

                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => handleOpenDetailModal(loc)}
                                  className="bg-white p-2 rounded-xl border border-slate-200/80 hover:border-blue-400 transition cursor-pointer flex items-center justify-between gap-2 group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <LocationThumbnail
                                      src={rawImg}
                                      alt={loc.name}
                                      icon={meta.icon}
                                      color={meta.color}
                                      className="w-9 h-9 rounded-lg"
                                      compact={true}
                                    />
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-blue-700 transition">
                                        {loc.name}
                                      </h5>
                                      <span className="text-[10px] text-blue-600 font-semibold block">
                                        {meta.label}
                                      </span>
                                    </div>
                                  </div>

                                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-700 transition px-2 py-1 bg-slate-50 rounded-lg shrink-0">
                                    Chi tiết ›
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400">Chưa có dữ liệu địa điểm trong thôn này.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                      <span className="text-2xl mb-2">🏡</span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Chọn một thôn trong danh sách phía trên để xem thông tin chi tiết, danh bạ cán bộ thôn và các địa điểm trực thuộc.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: ĐỊA ĐIỂM & BẢN ĐỒ SỐ ==================== */}
      {activeTab === 'overview' && (
        <div className="w-full flex-1 p-2 sm:p-4 lg:p-5 pb-16 lg:pb-5">
          <div className="w-full max-w-[1750px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">

            <aside className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col h-[72vh] lg:h-[calc(100dvh-165px)] min-h-[500px] overflow-hidden">
              
              <div className="shrink-0 px-4 pt-3.5 pb-3 bg-white border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                      <IconMapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                        Khám phá địa điểm
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        Tra cứu & chỉ đường trên địa bàn xã
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-extrabold shrink-0">
                    {filteredLocations.length} <span className="font-semibold text-[10px] text-blue-600/80">điểm</span>
                  </span>
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                    placeholder="Tìm tên trường học, di tích, cơ sở..."
                    className="w-full h-10 pl-9 pr-8 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                  <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-blue-600 transition" />
                  
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm && setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}

                  {searchTerm && searchTerm.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y divide-slate-100">
                      <div className="bg-slate-50 text-slate-600 text-[10px] font-extrabold uppercase px-3 py-1.5 tracking-wider sticky top-0 z-10 flex items-center justify-between border-b border-slate-100">
                        <span>Gợi ý kết quả ({filteredLocations.length})</span>
                        <span className="text-slate-400 text-[9px] font-normal">Nhấp để xem</span>
                      </div>

                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => {
                          const meta = getCategoryMeta(loc.type || loc.category);
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => {
                                handleSelectOverviewLocation(loc);
                                setSearchTerm(loc.name);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50/70 transition flex items-center gap-2.5 group cursor-pointer"
                            >
                              <span className="text-sm shrink-0">{meta.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 leading-tight block truncate">
                                  {loc.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {meta.label}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-center text-xs text-slate-500">
                          Không tìm thấy địa điểm phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <IconFilter className="w-3 h-3 text-blue-600" />
                      <span>Lọc theo lĩnh vực</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllOverviewCats(prev => !prev)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {showAllOverviewCats ? 'Thu gọn ▲' : `Tất cả (${categories.length}) ▼`}
                    </button>
                  </div>

                  {!showAllOverviewCats ? (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedCats([])}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          selectedCats.length === 0
                            ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Tất cả</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedCats.length === 0 ? 'bg-blue-600 text-blue-100' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {locations.length}
                        </span>
                      </button>

                      {(categories || []).map(cat => {
                        const catId = String(cat.id || cat.label);
                        const isSelected = selectedCats.includes(catId) || selectedCats.includes(String(cat.label));
                        const count = locations.filter(loc => 
                          String(loc.type || loc.category) === catId || String(loc.type || loc.category) === String(cat.label)
                        ).length;

                        if (count === 0 && !isSelected) return null;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCats(isSelected ? [] : [catId])}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cat.icon || '📌'}</span>
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-1.5 rounded-full ${
                              isSelected ? 'bg-blue-600 text-blue-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 pt-1 border-t border-slate-100 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => { setSelectedCats([]); setShowAllOverviewCats(false); }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer ${
                          selectedCats.length === 0
                            ? 'bg-blue-50 border-blue-500 text-blue-800'
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">📌 Tất cả</span>
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">{locations.length}</span>
                      </button>

                      {(categories || []).map(cat => {
                        const catId = String(cat.id || cat.label);
                        const isSelected = selectedCats.includes(catId) || selectedCats.includes(String(cat.label));
                        const count = locations.filter(loc => 
                          String(loc.type || loc.category) === catId || String(loc.type || loc.category) === String(cat.label)
                        ).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCats(isSelected ? [] : [catId]);
                              setShowAllOverviewCats(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-800'
                                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs shrink-0">{cat.icon || '📌'}</span>
                              <span className="text-xs font-bold truncate">{cat.label}</span>
                            </div>
                            <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md shrink-0">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 bg-slate-50/70 space-y-2.5 scrollbar-thin">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(loc => {
                    const isSelected = overviewSelectedLocation?.id === loc.id;
                    const meta = getCategoryMeta(loc.type || loc.category);
                    const rawImg = loc.mediaUrl || loc.image || loc.imageUrl || '';
                    
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectOverviewLocation(loc)}
                        className={`group bg-white rounded-2xl transition-all cursor-pointer p-2.5 flex items-center gap-3 border ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/15 shadow-xs'
                            : 'border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
                        }`}
                      >
                        <LocationThumbnail
                          src={rawImg}
                          alt={loc.name}
                          icon={meta.icon}
                          color={meta.color}
                          className="w-20 h-20 rounded-xl"
                        />

                        <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-0.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span 
                                style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold truncate max-w-full"
                              >
                                <span>{meta.icon}</span>
                                <span className="truncate">{meta.label}</span>
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-blue-700 transition">
                              {loc.name}
                            </h4>

                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                              <span className="text-slate-400 shrink-0">📍</span>
                              <span className="truncate">{loc.address || loc.villageName || loc.info || 'Xã Thạch Khê, Hà Tĩnh'}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetailModal(loc);
                              }}
                              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              Xem chi tiết →
                            </button>

                            {loc.lat && loc.lng && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDirectGPSRoute(loc.lat, loc.lng);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                                title="Chỉ đường GPS"
                              >
                                <span>🧭</span>
                                <span>Chỉ đường</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl mb-2">🔍</div>
                    <p className="text-xs text-slate-700 font-extrabold">Không tìm thấy địa điểm phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Thử tìm với từ khóa khác hoặc chọn lại lĩnh vực</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm && setSearchTerm('');
                        setSelectedCats && setSelectedCats([]);
                      }}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Hiển thị tất cả
                    </button>
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-7 xl:col-span-8 w-full h-[60vh] lg:h-[calc(100dvh-165px)] min-h-[500px] relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-white">
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
        </div>
      )}

      {/* ==================== TAB 4: TIN TỨC & BẢN TIN XÃ (CÓ PHÂN TRANG 1 2 3...) ==================== */}
      {activeTab === 'news' && (() => {
        const displaySource = Array.isArray(newsList) ? newsList : [];
        const filteredNews = displaySource.filter(item => {
          const matchCat = newsCategory === 'all' || item.category === newsCategory;
          const q = (newsSearch || '').trim().toLocaleLowerCase('vi-VN');
          const matchKw =
            !q ||
            (item.title || '').toLocaleLowerCase('vi-VN').includes(q) ||
            (item.summary || '').toLocaleLowerCase('vi-VN').includes(q) ||
            (item.content || '').toLocaleLowerCase('vi-VN').includes(q);
          return matchCat && matchKw;
        });

        const newsTotalPages = Math.max(1, Math.ceil(filteredNews.length / newsPageSize));
        const safeNewsCurrentPage = Math.min(newsCurrentPage, newsTotalPages);
        const newsStartIndex = (safeNewsCurrentPage - 1) * newsPageSize;
        const paginatedNews = filteredNews.slice(newsStartIndex, newsStartIndex + newsPageSize);

        const pinnedArticle = safeNewsCurrentPage === 1
          ? (paginatedNews.find(n => n.isPinned) || paginatedNews[0])
          : null;
        const otherArticles = pinnedArticle
          ? paginatedNews.filter(n => n.id !== pinnedArticle.id)
          : paginatedNews;

        const getNewsCatLabel = (catId) =>
          NEWS_CATEGORIES.find(c => c.id === catId)?.label || 'Bản tin xã';

        const getThumb = (art) => {
          const raw = (art?.thumbnail || art?.image || '').trim();
          return isValidImageUrl(raw) ? raw : '';
        };

        const getValidGallery = (art) => {
          if (!Array.isArray(art?.gallery)) return [];
          return art.gallery
            .map(item => {
              if (typeof item === 'string') {
                return isValidImageUrl(item) ? { url: item.trim(), caption: '' } : null;
              }
              if (item && typeof item === 'object' && isValidImageUrl(item.url)) {
                return { url: item.url.trim(), caption: item.caption || '' };
              }
              return null;
            })
            .filter(Boolean);
        };

        return (
          <div className="w-full flex-1 p-3 sm:p-5 lg:p-6 pb-20">
            <div className="max-w-5xl mx-auto space-y-5">

              {/* Thanh tiêu đề, ô tìm kiếm & chọn số lượng bản tin/trang */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                        <IconNewspaper className="w-4 h-4" />
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        Bản tin & Thông báo Xã Thạch Khê
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Cập nhật thông báo hành chính, lịch công tác và tin tức hoạt động trên địa bàn xã ({displaySource.length} bản tin).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <div className="relative flex-1 sm:w-60">
                      <input
                        type="text"
                        value={newsSearch}
                        onChange={(e) => setNewsSearch(e.target.value)}
                        placeholder="Tìm kiếm bản tin..."
                        className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                      <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      {newsSearch && (
                        <button
                          type="button"
                          onClick={() => setNewsSearch('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <select
                      value={newsPageSize}
                      onChange={(e) => setNewsPageSize(Number(e.target.value))}
                      className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 shrink-0 cursor-pointer"
                      aria-label="Số bản tin hiển thị mỗi trang"
                    >
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                      <option value={30}>30 / trang</option>
                    </select>
                  </div>
                </div>

                {/* Danh mục lọc ngang */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {NEWS_CATEGORIES.map(cat => {
                    const active = newsCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewsCategory(cat.id)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nội dung danh sách tin tức */}
              {filteredNews.length > 0 ? (
                <>
                  {pinnedArticle && (() => {
                    const thumbUrl = getThumb(pinnedArticle);
                    const validPhotos = getValidGallery(pinnedArticle);
                    return (
                      <article
                        onClick={() => setSelectedArticle(pinnedArticle)}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer overflow-hidden grid grid-cols-1 md:grid-cols-12 group"
                      >
                        <div className="md:col-span-5 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/70 border-b md:border-b-0 md:border-r border-slate-100 min-h-[200px] max-h-[260px] flex items-center justify-center relative overflow-hidden">
                          <NewsImage
                            src={thumbUrl}
                            alt={pinnedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            fallback={
                              <div className="flex flex-col items-center justify-center p-6 text-center select-none">
                                <span className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center text-2xl mb-2">
                                  📢
                                </span>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                                  Bản tin UBND xã
                                </span>
                              </div>
                            }
                          />

                          {pinnedArticle.isPinned && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                              📌 Tin tiêu điểm
                            </span>
                          )}

                          {validPhotos.length > 0 && (
                            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold backdrop-blur-xs">
                              🖼️ +{validPhotos.length} ảnh
                            </span>
                          )}
                        </div>

                        <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                                {getNewsCatLabel(pinnedArticle.category)}
                              </span>
                              {pinnedArticle.date && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500 font-semibold">🕒 {pinnedArticle.date}</span>
                                </>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition">
                              {pinnedArticle.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                              {pinnedArticle.summary || pinnedArticle.content}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">
                              Nguồn: <strong className="text-slate-700">{pinnedArticle.author || 'UBND xã Thạch Khê'}</strong>
                            </span>
                            <span className="font-extrabold text-blue-700 group-hover:underline">
                              Đọc toàn văn →
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })()}

                  {otherArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {otherArticles.map(article => {
                        const thumbUrl = getThumb(article);
                        const validPhotos = getValidGallery(article);

                        return (
                          <article
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between overflow-hidden group"
                          >
                            {thumbUrl && (
                              <div className="w-full h-44 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                                <NewsImage
                                  src={thumbUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                {validPhotos.length > 0 && (
                                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold backdrop-blur-xs">
                                    🖼️ +{validPhotos.length} ảnh
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                                    {getNewsCatLabel(article.category)}
                                  </span>
                                  <span className="text-slate-400 font-medium">{article.date}</span>
                                </div>

                                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition line-clamp-2">
                                  {article.title}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                  {article.summary || article.content}
                                </p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 font-medium truncate">
                                  {article.author || 'UBND xã Thạch Khê'}
                                </span>
                                <span className="font-bold text-blue-700 group-hover:underline shrink-0">
                                  Xem chi tiết ›
                                </span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {/* Thanh phân trang 1 2 3... */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                      Hiển thị <strong className="text-slate-800">
                        {newsStartIndex + 1}–{Math.min(newsStartIndex + newsPageSize, filteredNews.length)}
                      </strong> trên <strong className="text-blue-700">{filteredNews.length}</strong> bản tin
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        type="button"
                        disabled={safeNewsCurrentPage <= 1}
                        onClick={() => setNewsCurrentPage(page => Math.max(1, page - 1))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        ‹ Trước
                      </button>

                      {Array.from({ length: newsTotalPages }, (_, index) => index + 1)
                        .filter(page => page === 1 || page === newsTotalPages || Math.abs(page - safeNewsCurrentPage) <= 2)
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
                            onClick={() => setNewsCurrentPage(page)}
                            aria-current={safeNewsCurrentPage === page ? 'page' : undefined}
                            className={`min-w-8 h-8 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                              safeNewsCurrentPage === page
                                ? 'bg-blue-700 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      <button
                        type="button"
                        disabled={safeNewsCurrentPage >= newsTotalPages}
                        onClick={() => setNewsCurrentPage(page => Math.min(newsTotalPages, page + 1))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Sau ›
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-2">
                  <div className="text-3xl">📰</div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {displaySource.length === 0 ? 'Chưa có bản tin nào được đăng trên hệ thống' : 'Chưa có bản tin phù hợp'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {displaySource.length === 0
                      ? 'Vào mục Quản trị để đăng tải bản tin và thông báo mới lên hệ thống.'
                      : 'Thử chọn chuyên mục khác hoặc xóa từ khóa tìm kiếm.'}
                  </p>
                </div>
              )}

            </div>

            {/* Modal đọc chi tiết bản tin */}
            {selectedArticle && (() => {
              const mainThumb = getThumb(selectedArticle);
              const galleryItems = getValidGallery(selectedArticle);

              return (
                <div
                  onClick={() => setSelectedArticle(null)}
                  className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-2xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-extrabold">
                          {getNewsCatLabel(selectedArticle.category)}
                        </span>
                        {selectedArticle.date && (
                          <span className="text-xs text-slate-500 font-medium">🕒 {selectedArticle.date}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(null)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                        {selectedArticle.title}
                      </h3>

                      <div className="text-xs text-slate-500 font-medium pb-3 border-b border-slate-100">
                        Đơn vị đăng tải: <strong className="text-slate-800">{selectedArticle.author || 'UBND xã Thạch Khê'}</strong>
                      </div>

                      {selectedArticle.summary && (
                        <p className="text-xs sm:text-sm font-bold text-slate-700 bg-blue-50/50 border-l-4 border-blue-600 p-3.5 rounded-r-xl leading-relaxed">
                          {selectedArticle.summary}
                        </p>
                      )}

                      {mainThumb && (
                        <figure className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <NewsImage
                            src={mainThumb}
                            alt={selectedArticle.title}
                            className="w-full max-h-80 object-cover"
                          />
                        </figure>
                      )}

                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                        {selectedArticle.content}
                      </div>

                      {galleryItems.length > 0 && (
                        <div className="pt-3 space-y-3 border-t border-slate-100">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Hình ảnh hoạt động ({galleryItems.length})
                          </h4>
                          <div className="space-y-4">
                            {galleryItems.map((item, idx) => (
                              <figure key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <NewsImage
                                  src={item.url}
                                  alt={item.caption || `Ảnh minh họa ${idx + 1}`}
                                  className="w-full max-h-96 object-cover"
                                />
                                {item.caption && (
                                  <figcaption className="px-3.5 py-2 text-[11px] text-slate-600 italic text-center bg-slate-50 border-t border-slate-100">
                                    {item.caption}
                                  </figcaption>
                                )}
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(null)}
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Đóng bản tin
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ==================== TAB 5: TIỆN ÍCH SỐ ==================== */}
      {activeTab === 'utilities' && (
        <div className="w-full flex-1 p-3 sm:p-5 lg:p-6 pb-20">
          <div className="max-w-5xl mx-auto space-y-5">
            
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
              <div className="max-w-2xl space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Tiện ích số & Dịch vụ công trực tuyến
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
                  Cung cấp các liên kết cổng thông tin điện tử, dịch vụ công, mạng xã hội chính thức và công cụ tra cứu số phục vụ người dân và cán bộ xã Thạch Khê.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <a
                  href="https://dichvucong.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 p-4 text-left transition flex items-start gap-3.5 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">🏛️</span>
                  <div>
                    <span className="block text-sm font-extrabold text-blue-700 group-hover:underline">Cổng Dịch Vụ Công Quốc Gia ↗</span>
                    <span className="mt-1 block text-xs text-slate-600">Nộp hồ sơ trực tuyến, tra cứu tiến độ giải quyết thủ tục hành chính</span>
                  </div>
                </a>

                <a
                  href="https://dichvucong.hatinh.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 p-4 text-left transition flex items-start gap-3.5 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">📋</span>
                  <div>
                    <span className="block text-sm font-extrabold text-blue-700 group-hover:underline">Dịch Vụ Công Tỉnh Hà Tĩnh ↗</span>
                    <span className="mt-1 block text-xs text-slate-600">Hệ thống thông tin giải quyết thủ tục hành chính tỉnh Hà Tĩnh</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>⚖️</span> Tra cứu Pháp luật, Thuế & Bảo hiểm xã hội
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <a
                  href="https://vbpl.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">📜</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Văn bản Pháp luật</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">Tra cứu luật, nghị định, thông tư (vbpl.vn)</span>
                  </div>
                </a>

                <a
                  href="https://thuedientu.gdt.gov.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">💰</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Tra cứu Thuế Điện Tử</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">Nộp thuế, tra cứu nghĩa vụ thuế cá nhân/doanh nghiệp</span>
                  </div>
                </a>

                <a
                  href="https://dichvucong.baohiemxahoi.gov.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">🛡️</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Bảo hiểm Xã hội (BHXH)</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">Tra cứu quá trình tham gia, BHYT, chính sách</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>🌐</span> Kênh thông tin chính thức xã Thạch Khê
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <a
                  href="https://thachkhe.hatinh.gov.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">🌐</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Cổng Thông Tin</span>
                    <span className="block text-[11px] text-slate-500 truncate">thachkhe.hatinh.gov.vn</span>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/xathachkhe.hatinh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-lg font-bold shrink-0 group-hover:scale-105 transition">f</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Fanpage Facebook</span>
                    <span className="block text-[11px] text-slate-500 truncate">Xã Thạch Khê, Hà Tĩnh</span>
                  </div>
                </a>

                <a
                  href="https://zalo.me/4131267804791453068"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-extrabold shrink-0 group-hover:scale-105 transition">Zalo</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Zalo Official</span>
                    <span className="block text-[11px] text-slate-500 truncate">UBND xã Thạch Khê</span>
                  </div>
                </a>

                <a
                  href="https://www.tiktok.com/@thachkhe.hatinh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-extrabold shrink-0 group-hover:scale-105 transition">♪</span>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition truncate">Kênh TikTok</span>
                    <span className="block text-[11px] text-slate-500 truncate">@thachkhe.hatinh</span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Nút bật/tắt nhạc nền */}
      <div className="fixed right-3 sm:right-5 bottom-[calc(16px+env(safe-area-inset-bottom))] z-[1000]">
        <button
          type="button"
          onClick={handleToggleBackgroundMusic}
          className={`w-10 h-10 sm:w-auto sm:h-10 flex items-center justify-center gap-2 sm:px-3.5 rounded-full shadow-md font-bold text-xs transition-all duration-300 cursor-pointer ${
            isMusicPlaying
              ? 'bg-blue-700 text-white ring-4 ring-blue-100'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          title={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
          aria-label={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        >
          {isMusicPlaying ? (
            <>
              <IconMusic className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="hidden sm:inline">Đang phát nhạc</span>
            </>
          ) : (
            <>
              <IconVolumeOff className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Nhạc nền</span>
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

      {/* ==================== FOOTER ĐỒNG BỘ LIGHT MODE ==================== */}
      <footer className="w-full shrink-0 bg-white text-slate-600 border-t border-slate-200/80 text-xs mt-auto pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 pb-6 border-b border-slate-100">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-xs">🏛</span>
                <h4 className="font-extrabold text-slate-900 text-sm tracking-wide">
                  XÃ THẠCH KHÊ
                </h4>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Hệ thống Bản đồ số & Cổng thông tin hành chính công tích hợp tiện ích đời sống, tra cứu địa điểm và dữ liệu thôn xóm.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-blue-700">
                Thông tin liên hệ
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Địa chỉ: Trụ sở UBND xã Thạch Khê, thôn Đồng Giang, tỉnh Hà Tĩnh</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>Email: thachkhe@hatinh.gov.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>Giờ làm việc: Thứ Hai - Thứ Sáu (Sáng: 7h30 - 11h30, Chiều: 14h00 - 17h30)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-blue-700">
                Đơn vị thực hiện
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Được xây dựng và phát triển bởi <strong className="text-slate-800 font-bold">Đội ngũ Chuyển đổi số xã Thạch Khê</strong> nhằm phục vụ công tác cải cách hành chính và chuyển đổi số cộng đồng.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-400">
            <p>© 2026 Bản quyền thuộc về UBND xã Thạch Khê. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}