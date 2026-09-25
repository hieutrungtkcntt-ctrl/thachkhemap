import React, { useState } from 'react';
import AdminSidebar from './admin/AdminSidebar';
import DashboardOverview from './admin/DashboardOverview';
import ReportManagement from './admin/ReportManagement';
import VillageManagement from './admin/VillageManagement';
import LocationManagement from './admin/LocationManagement';
import AccountManagement from './admin/AccountManagement';
import AdminProfile from './admin/AdminProfile';

export default function AdminReports({ 
  reports = [], 
  locations = [], 
  villages = [],
  accounts = [],
  currentUser,
  onUpdateReportStatus, 
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        totalReports={reports.length}
        pendingCount={pendingCount}
        currentUser={currentUser}
      />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <DashboardOverview reports={reports} villages={villages} />
        )}
        {activeTab === 'reports' && (
          <ReportManagement 
            reports={reports}
            onUpdateReportStatus={onUpdateReportStatus}
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
      </div>
    </div>
  );
}