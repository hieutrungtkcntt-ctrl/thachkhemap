// ==========================================
// 1. RANH GIỚI GỐC GEOJSON CỦA XÃ THẠCH KHÊ
// ==========================================
const rawGeojsonData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [105.9027094, 18.4011053], [105.9038154, 18.402084], [105.9056478, 18.4047463], [105.9073554, 18.4064514],
            [105.909641, 18.4084188], [105.9169221, 18.4138084], [105.9188898, 18.4164793], [105.9197554, 18.4188762],
            [105.9200885, 18.4211715], [105.9192229, 18.4235057], [105.9166107, 18.4267474], [105.914974, 18.429185],
            [105.914243, 18.4307391], [105.9113026, 18.4373084], [105.9105065, 18.439256], [105.9104213, 18.4401266],
            [105.9105878, 18.4415656], [105.9111396, 18.4428979], [105.9117815, 18.443808], [105.9128052, 18.4449696],
            [105.9151709, 18.4468172], [105.9164047, 18.4472364], [105.9177313, 18.4474111], [105.9199249, 18.4466781],
            [105.9209566, 18.4467487], [105.9233288, 18.4485483], [105.9247837, 18.4510504], [105.9269504, 18.4497551],
            [105.9272651, 18.4501646], [105.9275883, 18.4503348], [105.9280642, 18.4507978], [105.9287692, 18.4512518],
            [105.9291426, 18.4517431], [105.929516, 18.4521407], [105.9299455, 18.4527931], [105.9298863, 18.4531408],
            [105.929754, 18.4534566], [105.9297981, 18.4536766], [105.9299113, 18.4538625], [105.9302762, 18.4540935],
            [105.9307558, 18.454664], [105.9309492, 18.4550432], [105.9310202, 18.4554153], [105.9310106, 18.4558164],
            [105.9311313, 18.4563333], [105.9314556, 18.4566746], [105.9317719, 18.4568652], [105.9318895, 18.4570606],
            [105.9319018, 18.4571982], [105.9319667, 18.4577881], [105.9321999, 18.4585299], [105.932188, 18.4594368],
            [105.9319841, 18.459694], [105.9319379, 18.4601427], [105.9317921, 18.4603192], [105.9314714, 18.4604986],
            [105.9312257, 18.4607752], [105.9314417, 18.4610553], [105.9319117, 18.4613662], [105.9322102, 18.4613495],
            [105.9329804, 18.4616153], [105.9333502, 18.4618119], [105.933695, 18.4622403], [105.9336866, 18.462757],
            [105.9339492, 18.4633119], [105.9343039, 18.4640081], [105.934722, 18.4643435], [105.9351121, 18.4645909],
            [105.9354036, 18.465116], [105.935746, 18.4653515], [105.9357903, 18.4659247], [105.9360039, 18.4663636],
            [105.9361803, 18.4665787], [105.9367825, 18.4668818], [105.9377849, 18.4669223], [105.9387663, 18.4666078],
            [105.9391211, 18.466761], [105.9392581, 18.4669627], [105.9391431, 18.4677341], [105.9388782, 18.4688984],
            [105.9387874, 18.4695908], [105.938956, 18.4700548], [105.9394746, 18.4706155], [105.9404953, 18.4709248],
            [105.9405966, 18.4710612], [105.9405843, 18.4712305], [105.9404808, 18.4713515], [105.940699, 18.4715453],
            [105.9409513, 18.4717458], [105.9419495, 18.4720425], [105.9422475, 18.4717978], [105.9425095, 18.4714855],
            [105.9427618, 18.4714126], [105.942784, 18.4712196], [105.9429562, 18.4709788], [105.9435305, 18.4695271],
            [105.9434686, 18.4691512], [105.9434903, 18.468892], [105.9431979, 18.4683998], [105.9431503, 18.4679489],
            [105.9432607, 18.4677232], [105.943032, 18.4674457], [105.9426406, 18.467359], [105.9421178, 18.4669487],
            [105.9411893, 18.4665957], [105.9403149, 18.4667311], [105.9398001, 18.4666015], [105.9397495, 18.4664121],
            [105.9398353, 18.4661263], [105.9396219, 18.4657019], [105.9391535, 18.4655411], [105.9388777, 18.4653221],
            [105.9388232, 18.4647715], [105.9388309, 18.4638237], [105.9391643, 18.4627887], [105.9395958, 18.4617038],
            [105.9405961, 18.4596029], [105.9460067, 18.4501641], [105.9515724, 18.4410623], [105.956009, 18.4343562],
            [105.9562913, 18.4333841], [105.9576898, 18.4313545], [105.9582517, 18.4303747], [105.9588751, 18.429644],
            [105.9599991, 18.4276842], [105.9612449, 18.4263463], [105.9615593, 18.4254189], [105.9632172, 18.4230084],
            [105.9644706, 18.4213835], [105.9686569, 18.4154692], [105.9689563, 18.4148384], [105.9707606, 18.4126694],
            [105.9712743, 18.4116913], [105.9718376, 18.411031], [105.9720878, 18.410415], [105.9727712, 18.4098026],
            [105.9735455, 18.4085697], [105.9751713, 18.4066963], [105.9757437, 18.405642], [105.9769591, 18.4044546],
            [105.9773264, 18.4038592], [105.9778576, 18.4033675], [105.9780497, 18.4027956], [105.9783022, 18.4026822],
            [105.978608, 18.4024034], [105.9791072, 18.4022664], [105.9792541, 18.4015312], [105.9800482, 18.4007064],
            [105.9802928, 18.3999849], [105.9805962, 18.3996357], [105.9808157, 18.3991855], [105.9813551, 18.3986774],
            [105.9816425, 18.3981322], [105.9821565, 18.3976172], [105.9824441, 18.3970996], [105.9818466, 18.3964491],
            [105.9814271, 18.3965516], [105.980991, 18.3967875], [105.9806823, 18.3966516], [105.9800123, 18.3955193],
            [105.9787013, 18.3946282], [105.977932, 18.3943866], [105.977175, 18.3938881], [105.9717272, 18.3892583],
            [105.967113, 18.382074], [105.9647182, 18.38002], [105.9643679, 18.3801618], [105.9635956, 18.3798412],
            [105.9635411, 18.3786117], [105.9640438, 18.3781876], [105.9633502, 18.3778724], [105.9626251, 18.3770461],
            [105.9625981, 18.3760762], [105.9620565, 18.3753966], [105.9612821, 18.3751228], [105.9607127, 18.374703],
            [105.9599859, 18.3747193], [105.9584423, 18.374278], [105.9581891, 18.3742115], [105.9577541, 18.3740234],
            [105.9568156, 18.3741377], [105.9560361, 18.3738494], [105.9553545, 18.3739016], [105.9547175, 18.373615],
            [105.9531532, 18.3733316], [105.9529269, 18.3731997], [105.9527623, 18.3730942], [105.952613, 18.3730091],
            [105.9522927, 18.3724637], [105.9519802, 18.3722914], [105.9513965, 18.3722623], [105.9503747, 18.3726346],
            [105.9497108, 18.3725373], [105.949434, 18.3723217], [105.9494937, 18.3715722], [105.949109, 18.3712263],
            [105.9481218, 18.3715052], [105.946812, 18.3711646], [105.9454765, 18.3714884], [105.9449676, 18.3720554],
            [105.9444779, 18.3719717], [105.9432002, 18.371143], [105.9423783, 18.3712199], [105.9429166, 18.3732955], [105.9420594, 18.3736529],
            [105.9409257, 18.3737497], [105.9389994, 18.3728941], [105.9389816, 18.3698314], [105.9384996, 18.3686751],
            [105.9380357, 18.3682252], [105.9350815, 18.3672061], [105.9351273, 18.3674372], [105.9349641, 18.3680291],
            [105.9346232, 18.3685178], [105.934382, 18.3688338], [105.9341863, 18.3689357], [105.9323739, 18.3701229],
            [105.9318085, 18.3706993], [105.9310567, 18.3716674], [105.9298006, 18.3738837], [105.9293008, 18.3764153],
            [105.9294539, 18.3780003], [105.9307218, 18.3818835], [105.9316088, 18.3857473], [105.9316441, 18.3882965],
            [105.9313244, 18.3894633], [105.9307849, 18.3903296], [105.9298368, 18.3909592], [105.9279386, 18.3914902],
            [105.9262227, 18.3923444], [105.9257209, 18.3928388], [105.9237542, 18.3946402], [105.9213951, 18.3960855],
            [105.9203816, 18.3964803], [105.9186182, 18.3968292], [105.9162869, 18.3969636], [105.9148299, 18.3965472],
            [105.9104607, 18.3936344], [105.9091787, 18.3935067], [105.9084234, 18.3936415], [105.9080767, 18.3938243], [105.9072253, 18.394257], [105.9057843, 18.395644], [105.9039314, 18.398424], [105.9027094, 18.4011053]
          ]
        ]
      }
    }
  ]
};

const rawPolygonCoords = rawGeojsonData.features[0].geometry.coordinates[0];
export const communeBoundary = rawPolygonCoords.map(coord => [coord[1], coord[0]]);

// ==========================================
// 2. THÔNG TIN CHUNG XÃ THẠCH KHÊ
// ==========================================
export const communeInfo = {
  name: "Xã Thạch Khê",
  area: "4,631.8 ha",
  households: "4,639",
  population: "17,515",
  description: "Hệ thống thông tin không gian & Đô thị thông minh Xã Thạch Khê"
};

// Danh mục địa điểm trên bản đồ
export const mapCategories = [
  { id: 'admin', label: 'Hành chính', icon: '🏛️' },
  { id: 'security', label: 'An ninh trật tự', icon: '🛡️' },
  { id: 'culture', label: 'Văn hóa - Thể thao', icon: '🏮' },
  { id: 'health', label: 'Y tế', icon: '🏥' },
  { id: 'school', label: 'Giáo dục', icon: '🏫' },
  { id: 'temple', label: 'Di tích - Tâm linh', icon: '🛕' },
  { id: 'tourism', label: 'Du lịch - Bãi biển', icon: '🏖️' },
  { id: 'eco', label: 'Sinh thái - Môi trường', icon: '🌳' },
  { id: 'restaurant', label: 'Ẩm thực - Nhà hàng', icon: '🍽️' },
  { id: 'hotel', label: 'Lưu trú - Khách sạn', icon: '🏨' }
];

// ==========================================
// 3. DANH SÁCH 11 THÔN (CHUẨN DỮ LIỆU TRANG CHỦ & ADMIN)
// ==========================================
export const villagesData = [
  { 
    id: 1, name: "Trường Xuân", households: 394, population: 1487, area: "249.5 ha", color: "#22c55e", 
    partySecretary: "Trần Đình Nam", secPhone: "0912345602", leader: "Trần Văn B", leadPhone: "0912345678",
    fatherlandFront: "Lê Thị Hoa", center: [18.3971, 105.9433],
    boundary: [
      [18.4050, 105.9260], [18.4020, 105.9320], [18.3950, 105.9300], 
      [18.3850, 105.9350], [18.3800, 105.9480], [18.3950, 105.9420]
    ]
  },
  { 
    id: 2, name: "Thanh Lan", households: 361, population: 1251, area: "221.7 ha", color: "#2563eb", 
    partySecretary: "Nguyễn Văn A", secPhone: "0912345678", leader: "Nguyễn Văn C", leadPhone: "0912345679",
    fatherlandFront: "Lê Thị C", center: [18.3925, 105.9468],
    boundary: [
      [18.4010, 105.9350], [18.4020, 105.9520], [18.3880, 105.9620], 
      [18.3800, 105.9480], [18.3850, 105.9350]
    ]
  },
  { 
    id: 3, name: "Đông Giang", households: 391, population: 1557, area: "425.6 ha", color: "#7c3aed", 
    partySecretary: "Vũ Quốc Khánh", secPhone: "0912345606", leader: "Lê Văn D", leadPhone: "0912345680",
    fatherlandFront: "Nguyễn Thị Lan", center: [18.3750, 105.9500],
    boundary: [
      [18.3800, 105.9380], [18.3800, 105.9480], [18.3880, 105.9620], 
      [18.3750, 105.9680], [18.3600, 105.9450], [18.3680, 105.9320]
    ]
  },
  { 
    id: 4, name: "Long Phúc", households: 389, population: 1400, area: "199.3 ha", color: "#cbd5e1", 
    partySecretary: "Đặng Sỹ Lâm", secPhone: "---", leader: "Phạm Văn E", leadPhone: "0912345681",
    fatherlandFront: "Hồ Thị Thắm", center: [18.3810, 105.9630],
    boundary: [
      [18.3880, 105.9620], [18.3750, 105.9680], [18.3700, 105.9750], 
      [18.3800, 105.9800], [18.3890, 105.9700]
    ]
  },
  { 
    id: 5, name: "Minh Hải", households: 542, population: 2065, area: "736.1 ha", color: "#eab308", 
    partySecretary: "Lê Văn Thắng", secPhone: "---", leader: "Hoàng Văn F", leadPhone: "0912345682",
    fatherlandFront: "Nguyễn Thị Cúc", center: [18.4307, 105.9419],
    boundary: [
      [18.4520, 105.9150], [18.4650, 105.9350], [18.4300, 105.9750], 
      [18.4100, 105.9500], [18.4150, 105.9300]
    ]
  },
  { 
    id: 6, name: "Hải Tiến", households: 410, population: 1520, area: "310.2 ha", color: "#c084fc", 
    partySecretary: "Mai Văn Đức", secPhone: "---", leader: "Đặng Văn G", leadPhone: "0912345683",
    fatherlandFront: "Trần Thị Hằng", center: [18.3989, 105.9653],
    boundary: [
      [18.4200, 105.9450], [18.4300, 105.9750], [18.3800, 105.9850], 
      [18.3700, 105.9750], [18.3880, 105.9620], [18.4020, 105.9520]
    ]
  },
  { 
    id: 7, name: "Tân Tiến", households: 350, population: 1310, area: "280.4 ha", color: "#ec4899", 
    partySecretary: "Nguyễn Văn Quân", secPhone: "---", leader: "Bùi Văn H", leadPhone: "0912345684",
    fatherlandFront: "Lý Thị Phương", center: [18.4192, 105.9212],
    boundary: [
      [18.4280, 105.9180], [18.4270, 105.9290], [18.4120, 105.9280], 
      [18.4100, 105.9200], [18.4150, 105.9150]
    ]
  },
  { 
    id: 8, name: "Đông Hải", households: 420, population: 1600, area: "345.8 ha", color: "#facc15", 
    partySecretary: "Phạm Quốc Bảo", secPhone: "---", leader: "Vũ Văn I", leadPhone: "0912345685",
    fatherlandFront: "Vũ Thị Nguyệt", center: [18.3971, 105.9433],
    boundary: [
      [18.4180, 105.9020], [18.4280, 105.9180], [18.4100, 105.9200], 
      [18.3980, 105.9150], [18.3850, 105.9200]
    ]
  },
  { 
    id: 9, name: "Trung Hải", households: 380, population: 1450, area: "290.0 ha", color: "#06b6d4", 
    partySecretary: "Đỗ Văn Kiên", secPhone: "---", leader: "Ngô Văn K", leadPhone: "0912345686",
    fatherlandFront: "Hoàng Thị Dung", center: [18.4058, 105.9336],
    boundary: [
      [18.4150, 105.9300], [18.4150, 105.9480], [18.4020, 105.9520], 
      [18.4010, 105.9350], [18.4050, 105.9260]
    ]
  },
  { 
    id: 10, name: "Văn Hải", households: 460, population: 1750, area: "380.5 ha", color: "#16a34a", 
    partySecretary: "Trương Văn Hùng", secPhone: "---", leader: "Dương Văn L", leadPhone: "0912345687",
    fatherlandFront: "Bùi Thị Hoa", center: [18.4199, 105.9367],
    boundary: [
      [18.4270, 105.9290], [18.4350, 105.9450], [18.4200, 105.9580], 
      [18.4150, 105.9480], [18.4150, 105.9300]
    ]
  },
  { 
    id: 11, name: "Nam Hải", households: 542, population: 2138, area: "518.4 ha", color: "#dc2626", 
    partySecretary: "Lê Đình Chi", secPhone: "---", leader: "Hồ Văn M", leadPhone: "0912345688",
    fatherlandFront: "Phạm Thị Sâm", center: [18.4412, 105.9332],
    boundary: [
      [18.4520, 105.9150], [18.4400, 105.9100], [18.4280, 105.9180], 
      [18.4350, 105.9450], [18.4520, 105.9350]
    ]
  }
];

// ==========================================
// 4. DANH SÁCH ĐỊA ĐIỂM (23 ĐỊA ĐIỂM)
// ==========================================
export const mapLocations = [
  { id: 1, name: "Ủy ban nhân dân xã Thạch Khê", type: "admin", category: "Hành chính", lat: 18.3858, lng: 105.9505, phone: "02393.850.111", info: "Trụ sở làm việc hành chính xã Thạch Khê", scale: "25 Cán bộ công chức", workingHours: "07:30 - 17:00 (Thứ 2 - Thứ 6)", mediaUrl: "", qrCode: "" },
  { id: 2, name: "Đảng ủy xã Thạch Khê", type: "admin", category: "Hành chính", lat: 18.3998, lng: 105.9770, phone: "02393.850.112", info: "Trụ sở Đảng ủy xã Thạch Khê", scale: "15 Cán bộ", workingHours: "07:30 - 17:00 (Thứ 2 - Thứ 6)", mediaUrl: "", qrCode: "" },
  { id: 3, name: "Công an xã Thạch Khê", type: "security", category: "An ninh trật tự", lat: 18.4058, lng: 105.9336, phone: "02393.850.333", info: "Trụ sở Công an xã Thạch Khê", scale: "8 Đồng chí công an", workingHours: "24/7", mediaUrl: "", qrCode: "" },
  { id: 4, name: "Đền thờ Đại học sĩ Trương Quốc Dụng", type: "temple", category: "Di tích - Tâm linh", lat: 18.3819, lng: 105.9567, phone: "---", info: "Di tích lịch sử văn hóa cấp quốc gia", scale: "Khu di tích lịch sử", workingHours: "08:00 - 17:00 hàng ngày", mediaUrl: "", qrCode: "" },
  { id: 5, name: "Chùa Tam Bảo", type: "temple", category: "Di tích - Tâm linh", lat: 18.4164, lng: 105.9643, phone: "---", info: "Cơ sở tôn giáo, sinh hoạt tâm linh", scale: "Khuôn viên chùa", workingHours: "06:00 - 20:00 hàng ngày", mediaUrl: "", qrCode: "" },
  { id: 6, name: "Nhà Văn Hoá Thôn Liên Hải", type: "culture", category: "Văn hóa - Thể thao", lat: 18.3910, lng: 105.9691, phone: "---", info: "Sinh hoạt cộng đồng thôn Liên Hải", scale: "Sức chứa 200 chỗ ngồi", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 7, name: "Nhà Văn Hoá Thôn Phúc Thanh", type: "culture", category: "Văn hóa - Thể thao", lat: 18.3931, lng: 105.9378, phone: "---", info: "Sinh hoạt cộng đồng thôn Phúc Thanh", scale: "Sức chứa 200 chỗ ngồi", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 8, name: "Nhà Văn Hoá Thôn Đan Khê", type: "culture", category: "Văn hóa - Thể thao", lat: 18.3971, lng: 105.9433, phone: "---", info: "Sinh hoạt cộng đồng thôn Đan Khê", scale: "Sức chứa 200 chỗ ngồi", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 9, name: "Nhà Văn Hoá Thôn Thanh Lan", type: "culture", category: "Văn hóa - Thể thao", lat: 18.3925, lng: 105.9468, phone: "---", info: "Sinh hoạt cộng đồng thôn Thanh Lan", scale: "Sức chứa 200 chỗ ngồi", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 10, name: "Nhà văn hoá thôn Thanh Long", type: "culture", category: "Văn hóa - Thể thao", lat: 18.4199, lng: 105.9367, phone: "---", info: "Sinh hoạt cộng đồng thôn Thanh Long", scale: "Sức chứa 200 chỗ ngồi", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 11, name: "Đồi Hoa Cát Biển - Thạch Hải", type: "tourism", category: "Du lịch - Bãi biển", lat: 18.3989, lng: 105.9653, phone: "---", info: "Khu du lịch sinh thái, điểm check-in nổi tiếng", scale: "Khu du lịch rộng lớn", workingHours: "07:00 - 18:00", mediaUrl: "", qrCode: "" },
  { id: 12, name: "Tuyệt Tình Cốc Hà Tĩnh", type: "tourism", category: "Du lịch - Bãi biển", lat: 18.4307, lng: 105.9419, phone: "---", info: "Điểm tham quan du lịch cảnh quan", scale: "Danh lam thắng cảnh", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 13, name: "Bãi sú vẹt", type: "eco", category: "Sinh thái - Môi trường", lat: 18.4192, lng: 105.9212, phone: "---", info: "Khu vực hệ sinh thái bãi sú vẹt phòng hộ", scale: "Hệ sinh thái ngập mặn", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 14, name: "Rú Bể (rú voi)", type: "eco", category: "Sinh thái - Môi trường", lat: 18.4412, lng: 105.9332, phone: "---", info: "Khu vực địa danh Rú Bể sinh thái", scale: "Rừng phòng hộ", workingHours: "Cả ngày", mediaUrl: "", qrCode: "" },
  { id: 15, name: "Ngoại Resort", type: "hotel", category: "Lưu trú - Khách sạn", lat: 18.4263, lng: 105.9368, phone: "02393.999.888", info: "Khu nghỉ dưỡng ven biển cao cấp", scale: "50 phòng nghỉ", workingHours: "24/7", mediaUrl: "", qrCode: "" },
  { id: 16, name: "Nhà hàng Hồng Ngọc", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4011, lng: 105.9785, phone: "0912333444", info: "Hải sản và ẩm thực địa phương tươi sống", scale: "Phục vụ 200 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 17, name: "Nhà Hàng Thái Ất", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4013, lng: 105.9783, phone: "0912333555", info: "Chuyên hải sản biển tươi ngon", scale: "Phục vụ 150 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 18, name: "Nhà hàng Nga Sự", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4014, lng: 105.9782, phone: "0912333666", info: "Ẩm thực hải sản phong phú", scale: "Phục vụ 150 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 19, name: "Nhà hàng Nhật Hạnh", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4016, lng: 105.9781, phone: "0912333777", info: "Đặc sản biển tươi sống chất lượng", scale: "Phục vụ 180 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 20, name: "Nhà Hàng Nhà Nghỉ Mạnh Hướng", type: "hotel", category: "Lưu trú - Khách sạn", lat: 18.4032, lng: 105.9766, phone: "0912333888", info: "Lưu trú kết hợp nhà hàng hải sản", scale: "20 phòng nghỉ", workingHours: "24/7", mediaUrl: "", qrCode: "" },
  { id: 21, name: "Nhà Hàng Tri Kỉ", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4007, lng: 105.9787, phone: "0912333999", info: "Ẩm thực ven biển uy tín", scale: "Phục vụ 120 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 22, name: "Nhà Hàng Hào Giáp", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4003, lng: 105.9790, phone: "0912334000", info: "Ăn uống uy tín khu vực biển Thạch Khê", scale: "Phục vụ 200 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" },
  { id: 23, name: "Nhà Hàng Hiền Thành", type: "restaurant", category: "Ẩm thực - Nhà hàng", lat: 18.4000, lng: 105.9792, phone: "0912334111", info: "Hải sản tươi ngon giá bình dân", scale: "Phục vụ 150 khách", workingHours: "09:00 - 22:00", mediaUrl: "", qrCode: "" }
];

// ==========================================
// 5. TÀI KHOẢN QUẢN TRỊ HỆ THỐNG
// ==========================================
export const initialAccounts = [
  { id: 1, username: 'admin', name: 'Quản trị viên tối cao', role: 'admin', phone: '0904123456', email: 'admin@thachkhe.gov.vn', password: '123' },
  { id: 2, username: 'canboxuly', name: 'Nguyễn Văn Xử Lý', role: 'xuly', phone: '0912345678', email: 'xuly@thachkhe.gov.vn', password: '123' }
];

// ==========================================
// 6. PHẢN ÁNH HIỆN TRƯỜNG BAN ĐẦU
// ==========================================
export const initialReports = [
  { 
    id: 1, 
    sender: 'Lê Văn Tám', 
    phone: '0988111222', 
    time: '2026-09-25 08:30', 
    category: 'Hạ tầng giao thông', 
    content: 'Ổ gà lớn xuất hiện tại ngã ba đường liên thôn Trường Xuân gây nguy hiểm cho người tham gia giao thông.', 
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80', 
    lat: '18.3971', 
    lng: '105.9433', 
    locationName: 'Trường Xuân', 
    status: 'Chờ xử lý', 
    note: '', 
    resultImage: '' 
  }
];