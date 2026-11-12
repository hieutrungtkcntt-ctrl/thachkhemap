import React from 'react';

export default function DashboardOverview({ reports = [], communeInfo = null, villagesData = [], locations = [] }) {
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Chờ xử lý').length;
  const completedReports = reports.filter(r => r.status === 'Đã hoàn thành').length;

  // Tự động tính toán tổng số hộ và tổng nhân khẩu từ danh sách các thôn trong CSDL
  const totalHouseholdsCalc = villagesData.reduce((sum, v) => sum + (Number(v.households) || 0), 0);
  const totalPopulationCalc = villagesData.reduce((sum, v) => sum + (Number(v.population) || 0), 0);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm font-sans">
      <div>
        <h1 className="text-lg font-bold text-slate-900">📊 Tổng Quan Hệ Thống Quản Trị</h1>
        <p className="text-slate-500 text-xs">Số liệu hành chính và thống kê tình hình tiếp nhận phản ánh sự cố trên địa bàn xã Thạch Khê.</p>
      </div>

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold text-xs">Tổng diện tích xã</span>
          <div className="text-xl font-bold text-blue-900">{communeInfo?.area || '4,631.8 ha'}</div>
          <p className="text-[11px] text-emerald-600 font-medium">{villagesData.length || 11} thôn trực thuộc</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold text-xs">Tổng số hộ dân</span>
          <div className="text-xl font-bold text-blue-900">{totalHouseholdsCalc > 0 ? totalHouseholdsCalc.toLocaleString('vi-VN') : (communeInfo?.households || '4,639')} hộ</div>
          <p className="text-[11px] text-slate-500 font-medium">Nhân khẩu: {totalPopulationCalc > 0 ? totalPopulationCalc.toLocaleString('vi-VN') : (communeInfo?.population || '17,515')} người</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold text-xs">Phản ánh chờ xử lý</span>
          <div className="text-xl font-bold text-red-600">{pendingReports} sự cố</div>
          <p className="text-[11px] text-amber-600 font-medium">Cần xử lý gấp</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 font-semibold text-xs">Phản ánh đã hoàn thành</span>
          <div className="text-xl font-bold text-emerald-600">{completedReports} sự cố</div>
          <p className="text-[11px] text-slate-500 font-medium">Đã giải quyết xong (Tổng: {totalReports})</p>
        </div>
      </div>

      {/* Bảng danh sách tóm tắt quy mô và cán bộ các thôn */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">👥 Thống kê quy mô, Địa điểm & Cán bộ phụ trách các thôn</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 font-bold">Tên thôn</th>
                <th className="p-3 font-bold">Diện tích</th>
                <th className="p-3 font-bold">Số hộ / Dân số</th>
                <th className="p-3 font-bold text-center">Tổng địa điểm</th>
                <th className="p-3 font-bold">Cán bộ phụ trách (Thôn trưởng / Bí thư / UBMTTQ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {villagesData && villagesData.length > 0 ? (
                villagesData.map(v => {
                  // Đảm bảo quét mọi trường có thể liên kết giữa location và village
                  const villageLocCount = locations.filter(loc => {
                    const matchId = (loc.villageId && String(loc.villageId) === String(v.id)) ||
                                    (loc.village && String(loc.village) === String(v.id));
                    
                    const vName = (v.name || '').toLowerCase().trim();
                    const locInfo = (loc.info || '').toLowerCase();
                    const locAddress = (loc.address || '').toLowerCase();
                    const locName = (loc.name || '').toLowerCase();
                    const locVillage = (loc.village || '').toLowerCase();
                    
                    const matchText = vName && (
                      locInfo.includes(vName) || 
                      locAddress.includes(vName) || 
                      locName.includes(vName) || 
                      locVillage.includes(vName)
                    );
                    
                    return matchId || matchText;
                  }).length;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: v.color || '#0d9488' }} />
                          <span className="font-bold text-blue-900 text-sm">{v.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{v.area || '---'}</td>
                      <td className="p-3 space-y-0.5">
                        <div className="font-mono">🏠 {v.households !== undefined ? v.households : '---'} hộ</div>
                        <div className="font-mono">👥 {v.population !== undefined ? v.population : '---'} người</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold rounded-lg border border-blue-200">
                          {villageLocCount} điểm
                        </span>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div>🔹 Thôn trưởng: <strong className="text-slate-900">{v.leader || 'Đang cập nhật'}</strong> {v.leadPhone && <span className="text-blue-600 font-mono">({v.leadPhone})</span>}</div>
                        <div>🔸 Bí thư chi bộ: <strong className="text-slate-900">{v.partySecretary || 'Đang cập nhật'}</strong> {v.secPhone && <span className="text-blue-600 font-mono">({v.secPhone})</span>}</div>
                        <div>🔸 UBMTTQ: <strong className="text-slate-900">{v.frontLeader || 'Đang cập nhật'}</strong> {v.frontPhone && <span className="text-blue-600 font-mono">({v.frontPhone})</span>}</div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400 italic">Đang đồng bộ dữ liệu các thôn từ cơ sở dữ liệu...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}