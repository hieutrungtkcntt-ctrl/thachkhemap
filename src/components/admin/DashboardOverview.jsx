import React from 'react';
import { communeInfo, villagesData } from '../../data';

export default function DashboardOverview({ reports = [] }) {
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Chờ xử lý').length;
  const completedReports = reports.filter(r => r.status === 'Đã hoàn thành').length;

  return (
    <div className="p-6 space-y-6 text-xs max-h-[calc(100vh-60px)] overflow-y-auto">
      <div>
        <h1 className="text-lg font-bold text-slate-900">📊 Tổng Quan Hệ Thống Quản Trị</h1>
        <p className="text-slate-500 text-xs">Số liệu hành chính và thống kê tình hình tiếp nhận phản ánh sự cố trên địa bàn.</p>
      </div>

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold">Tổng diện tích xã</span>
          <div className="text-xl font-bold text-blue-900">{communeInfo.area || '4,631.8 ha'}</div>
          <p className="text-[11px] text-emerald-600 font-medium">11 thôn trực thuộc</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold">Tổng số hộ dân</span>
          <div className="text-xl font-bold text-blue-900">{communeInfo.households || '4,639'} hộ</div>
          <p className="text-[11px] text-slate-500 font-medium">Nhân khẩu: {communeInfo.population || '17,515'} người</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold">Phản ánh chờ xử lý</span>
          <div className="text-xl font-bold text-red-600">{pendingReports} sự cố</div>
          <p className="text-[11px] text-amber-600 font-medium">Cần xử lý gấp</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold">Phản ánh đã hoàn thành</span>
          <div className="text-xl font-bold text-emerald-600">{completedReports} sự cố</div>
          <p className="text-[11px] text-slate-500 font-medium">Đã giải quyết xong</p>
        </div>
      </div>

      {/* Bảng danh sách tóm tắt 11 thôn */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">👥 Thống kê quy mô các thôn</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-2.5 font-bold">Tên thôn</th>
                <th className="p-2.5 font-bold">Khu vực</th>
                <th className="p-2.5 font-bold">Số hộ</th>
                <th className="p-2.5 font-bold">Nhân khẩu</th>
                <th className="p-2.5 font-bold">Cán bộ phụ trách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {villagesData.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-blue-900">{v.name}</td>
                  <td className="p-2.5">{v.area}</td>
                  <td className="p-2.5 font-mono">{v.households}</td>
                  <td className="p-2.5 font-mono">{v.population}</td>
                  <td className="p-2.5">
                    Trưởng thôn: <strong className="text-slate-900">{v.leader}</strong> ({v.leadPhone})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}