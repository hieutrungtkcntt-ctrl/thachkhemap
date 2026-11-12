import React, { useState } from 'react';
import AdminSidebar from './admin/AdminSidebar';
import DashboardOverview from './admin/DashboardOverview';
import ReportManagement from './admin/ReportManagement';
import VillageManagement from './admin/VillageManagement';
import LocationManagement from './admin/LocationManagement';
import AccountManagement from './admin/AccountManagement';
import AdminProfile from './admin/AdminProfile';
import NewsManagement from './admin/NewsManagement';

export default function AdminReports({ 
  reports = [], 
  locations = [], 
  villages = [],
  accounts = [],
  currentUser,
  onUpdateReportStatus, 
  onToggleHideReport, 
  onAddLocation, 
  onUpdateLocation, 
  onDeleteLocation, 
  onAddVillage,
  onUpdateVillage,
  onDeleteVillage,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUpdateProfile,
  onLogout 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const pendingCount = reports.filter(r => r.status === 'Chờ xử lý').length;

  // Danh sách chuẩn đầy đủ 27 danh mục của sếp
  const fullCategories = [
    { id: 'admin', label: 'Cơ sở hành chính', icon: '🏢' },
    { id: 'restaurant', label: 'Nhà hàng - Quán ăn', icon: '🍽️' },
    { id: 'market', label: 'Chợ', icon: '🏪' },
    { id: 'shopping-cart', label: 'Cửa hàng - Siệu thị', icon: '🛒' },
    { id: 'landmark', label: 'Di tích Văn hoá', icon: '🛕' },
    { id: 'church', label: 'Cơ sở tín ngưỡng, tôn giáo', icon: '🏛️' },
    { id: 'award', label: 'Sản phẩm Ocop', icon: '🏅' },
    { id: 'coffee', label: 'Quán cà phê', icon: '☕' },
    { id: 'fuel', label: 'Cửa hàng xăng dầu', icon: '⛽' },
    { id: 'users', label: 'Dịch vụ xã hội', icon: '🤝' },
    { id: 'hotel', label: 'Cơ sở lưu trú', icon: '🏨' },
    { id: 'map-pin', label: 'Điểm du lịch', icon: '📍' },
    { id: 'building-2', label: 'Khu kinh tế', icon: '🏭' },
    { id: 'sun', label: 'Bãi biển', icon: '🏖️' },
    { id: 'briefcase', label: 'Hợp tác xã', icon: '🚜' },
    { id: 'calendar', label: 'Sự kiện lễ hội', icon: '🎪' },
    { id: 'mail', label: 'Bưu chính chuyển phát', icon: '📮' },
    { id: 'leaf', label: 'Sinh thái môi trường', icon: '🌱' },
    { id: 'camera', label: 'Du lịch tham quan', icon: '📷' },
    { id: 'bank', label: 'Ngân hàng - ATM', icon: '🏦' },
    { id: 'wrench', label: 'Sửa chữa bảo dưỡng', icon: '🔧' },
    { id: 'package', label: 'Bưu chính chuyển phát (Gói hàng)', icon: '📦' },
    { id: 'activity', label: 'Văn hoá - Thể thao', icon: '⚽' },
    { id: 'shield', label: 'An ninh quốc phòng', icon: '🛡️' },
    { id: 'trash-2', label: 'Điểm tập kết rác', icon: '♻️' },
    { id: 'school', label: 'Cơ sở giáo dục', icon: '🏫' },
    { id: 'heatlh', label: 'Cơ sở y tế', icon: '🏥' },
  ];

  return (
    <div className="h-full min-h-0 bg-slate-100 flex flex-col md:flex-row font-sans">
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        totalReports={reports.length}
        pendingCount={pendingCount}
        currentUser={currentUser}
      />

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        {activeTab === 'overview' && (
          <DashboardOverview reports={reports} villagesData={villages} locations={locations} />
        )}
        {activeTab === 'reports' && (
          <ReportManagement 
            reports={reports}
            onUpdateReportStatus={onUpdateReportStatus}
            onToggleHideReport={onToggleHideReport}
          />
        )}
        {activeTab === 'villages' && (
          <VillageManagement 
            villages={villages}
            onAddVillage={onAddVillage}
            onUpdateVillage={onUpdateVillage}
            onDeleteVillage={onDeleteVillage}
          />
        )}
        {activeTab === 'locations' && (
          <LocationManagement 
            locations={locations}
            categories={fullCategories}
            onAddLocation={onAddLocation}
            onUpdateLocation={onUpdateLocation}
            onDeleteLocation={onDeleteLocation}
          />
        )}
        {activeTab === 'accounts' && currentUser?.role === 'admin' && (
          <AccountManagement 
            accounts={accounts}
            onAddAccount={onAddAccount}
            onUpdateAccount={onUpdateAccount}
            onDeleteAccount={onDeleteAccount}
          />
        )}
        {activeTab === 'profile' && (
          <AdminProfile 
            currentUser={currentUser}
            onUpdateProfile={onUpdateProfile}
          />
        )}
        {activeTab === 'news' && <NewsManagement />}
      </div>
    </div>
  );
}