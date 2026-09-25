import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mapLocations } from '../../data';

export default function ReportManagement({ reports = [], onUpdateReportStatus }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapModalReport, setMapModalReport] = useState(null);       
  const [replyModalReport, setReplyModalReport] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null);         

  const [noteText, setNoteText] = useState('');
  const [resultImage, setResultImage] = useState('');

  // Lấy tọa độ Trụ sở UBND xã làm điểm xuất phát của Admin từ file data.js
  const adminHeadquarter = mapLocations.find(loc => loc.id === 1) || { lat: 18.3858, lng: 105.9505, name: 'Ủy ban nhân dân xã Thạch Khê' };
  const adminCoords = [adminHeadquarter.lat, adminHeadquarter.lng];

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setResultImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptReport = (id) => {
    onUpdateReportStatus(id, 'Đang xử lý', 'Đã tiếp nhận phản ánh, đang tiến hành xác minh xử lý.', '');
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    if (!replyModalReport) return;
    onUpdateReportStatus(replyModalReport.id, 'Đã hoàn thành', noteText, resultImage);
    setReplyModalReport(null);
    setNoteText('');
    setResultImage('');
  };

  return (
    <div className="p-6 space-y-4 text-xs max-h-[calc(100vh-60px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">🚨 Quản Lý Phản Ánh Sự Cố</h1>
          <p className="text-slate-500 text-xs">Kiểm tra ảnh hiện trường, định vị tuyến đường trên bản đồ Leaflet và trả lời kết quả cho người dân.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Lọc trạng thái:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả ({reports.length})</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Không có phản ánh nào phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-bold">Thời gian / Người gửi</th>
                  <th className="p-3 font-bold">Hình ảnh & Nội dung</th>
                  <th className="p-3 font-bold">Khu vực / Định vị</th>
                  <th className="p-3 font-bold">Trạng thái</th>
                  <th className="p-3 font-bold text-center">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.sender}</div>
                      <div className="font-mono text-[11px] text-blue-600">{r.phone}</div>
                      <div className="text-[10px] text-slate-400">{r.time}</div>
                    </td>
                    <td className="p-3 max-w-xs space-y-1">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{r.category}</span>
                      <p className="text-slate-700">{r.content}</p>
                      {r.image ? (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-emerald-600">📷 Ảnh hiện trường (Nhấn phóng to):</span>
                          <img 
                            src={r.image} 
                            alt="Hiện trường" 
                            onClick={() => setPreviewImage(r.image)}
                            className="w-24 h-16 object-cover rounded-lg border mt-0.5 cursor-pointer hover:opacity-80 transition shadow-2xs" 
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Không có ảnh hiện trường</span>
                      )}
                    </td>
                    <td className="p-3 space-y-1.5">
                      <div className="font-semibold text-blue-900">{r.locationName || 'Xã Thạch Khê'}</div>
                      <button 
                        onClick={() => setMapModalReport(r)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition shadow-2xs"
                      >
                        <span>🗺️</span> Xem định vị & Đường đi
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-y-1.5">
                      {r.status === 'Chờ xử lý' && (
                        <button
                          onClick={() => handleAcceptReport(r.id)}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-semibold shadow-2xs transition"
                        >
                          🚀 Tiếp nhận xử lý
                        </button>
                      )}
                      {(r.status === 'Đang xử lý' || r.status === 'Đã hoàn thành') && (
                        <button
                          onClick={() => {
                            setReplyModalReport(r);
                            setNoteText(r.note || '');
                            setResultImage(r.resultImage || '');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold shadow-2xs transition"
                        >
                          💬 Trả lời phản ánh
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Miniview bản đồ Leaflet tương tác thực tế từ UBND xã đến vị trí phản ánh */}
      {mapModalReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl shadow-2xl w-full max-w-3xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <span>🗺️</span> Chỉ đường từ Trụ sở UBND Xã đến vị trí phản ánh
              </h3>
              <button onClick={() => setMapModalReport(null)} className="text-slate-400 hover:text-red-600 font-bold text-base">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">ĐIỂM XUẤT PHÁT (ADMIN)</div>
                    <div className="font-bold text-slate-900">{adminHeadquarter.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l pl-2">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">ĐIỂM ĐẾN PHẢN ÁNH</div>
                    <div className="font-bold text-red-600">{mapModalReport.locationName || 'Khu vực thôn'}</div>
                  </div>
                </div>
              </div>

              <div><strong>Nội dung sự cố:</strong> {mapModalReport.content}</div>

              {/* Bản đồ Leaflet có định nghĩa chiều cao chuẩn trực tiếp */}
              <div className="w-full h-96 bg-slate-100 rounded-2xl overflow-hidden border shadow-inner relative z-0">
                <MapContainer 
                  center={[parseFloat(mapModalReport.lat) || adminCoords[0], parseFloat(mapModalReport.lng) || adminCoords[1]]} 
                  zoom={14} 
                  scrollWheelZoom={true} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Marker vị trí xuất phát của Admin (UBND xã) */}
                  <Marker position={adminCoords}>
                    <Popup>
                      <div className="text-xs font-bold text-blue-900">
                        🏛️ Điểm xuất phát: {adminHeadquarter.name}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Marker vị trí phản ánh của người dân */}
                  <Marker position={[parseFloat(mapModalReport.lat), parseFloat(mapModalReport.lng)]}>
                    <Popup>
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-red-600 text-sm">📍 Vị trí phản ánh sự cố</div>
                        <div>Nội dung: {mapModalReport.content}</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Đường nối chỉ đường */}
                  <Polyline 
                    positions={[
                      adminCoords, 
                      [parseFloat(mapModalReport.lat), parseFloat(mapModalReport.lng)]
                    ]} 
                    pathOptions={{ color: '#2563eb', weight: 4, dashArray: '6, 6' }} 
                  />
                </MapContainer>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${adminCoords[0]},${adminCoords[1]}&destination=${mapModalReport.lat},${mapModalReport.lng}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>🗺️</span> Mở Google Maps chỉ đường thực tế ↗
              </a>
              <button 
                onClick={() => setMapModalReport(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2 rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Trả lời phản ánh có đầy đủ Hình ảnh hiện trường và Địa chỉ */}
      {replyModalReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-blue-900">💬 Trả Lời & Gửi Kết Quả Xử Lý</h3>
              <button onClick={() => setReplyModalReport(null)} className="text-slate-400 hover:text-red-600 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>👤 Người gửi:</strong> {replyModalReport.sender}</div>
                <div><strong>📞 SĐT:</strong> <span className="font-mono text-blue-600">{replyModalReport.phone}</span></div>
              </div>
              <div><strong>📍 Địa chỉ / Khu vực:</strong> <span className="text-blue-900 font-bold">{replyModalReport.locationName || 'Xã Thạch Khê'}</span></div>
              <div><strong>📝 Nội dung phản ánh:</strong> {replyModalReport.content}</div>
              
              {replyModalReport.image && (
                <div className="pt-1">
                  <strong className="block mb-1 text-slate-700">📷 Hình ảnh hiện trường gốc (Nhấn để phóng to):</strong>
                  <img 
                    src={replyModalReport.image} 
                    alt="Hiện trường" 
                    onClick={() => setPreviewImage(replyModalReport.image)}
                    className="w-full h-32 object-cover rounded-xl border cursor-pointer hover:opacity-90 shadow-2xs" 
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleSaveReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung trả lời / Kết quả giải quyết của UBND xã:</label>
                <textarea 
                  rows="3"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Nhập kết quả xử lý chi tiết gửi đến người dân..."
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tải lên hình ảnh kết quả xử lý (nếu có):</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {resultImage && (
                  <div className="mt-2 relative">
                    <span className="text-[10px] text-emerald-600 font-bold">Ảnh kết quả đính kèm:</span>
                    <img 
                      src={resultImage} 
                      alt="Kết quả" 
                      onClick={() => setPreviewImage(resultImage)}
                      className="w-full h-28 object-cover rounded-xl border mt-1 cursor-pointer" 
                    />
                    <button 
                      type="button"
                      onClick={() => setResultImage('')} 
                      className="absolute top-6 right-2 bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow transition"
                >
                  ✅ Hoàn thành & Gửi kết quả
                </button>
                <button 
                  type="button"
                  onClick={() => setReplyModalReport(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Phóng to hình ảnh */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 bg-white text-black font-bold px-3 py-1 rounded-full text-sm shadow hover:bg-red-600 hover:text-white transition"
            >
              ✕ Đóng
            </button>
            <img src={previewImage} alt="Phóng to" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
}