// ============================================================================
// Tiên Giới Khai Nghiệp (무림개업 1.2.3) — Complete Core Game & Combat Engine
// Implements exact formulas & data tables from APK (game, jianghu, story, online)
// ============================================================================

const LEGACY_SKILLS = [
  {
    id: 'clear_counter', name: 'Huyền Minh Phản Trận', fam: 0, path: 'jeong',
    icon: 'mg_clear_counter', shape: 'cone', reach: 4.2, arc: 180, mul: 2.8, cd: 7.5,
    apply: 'scar', guardSec: 3, guardCut: 0.35, realm: 1, cost: 20,
    desc: 'Hoá giải đòn đánh, khắc Kiếm Ngân và hộ thể giảm 35% sát thương nhận vào trong 3 giây.'
  },
  {
    id: 'shadow_mark', name: 'Hư Không Kiếm Ấn', fam: 1, path: 'sa',
    icon: 'mg_shadow_mark', shape: 'dash', reach: 7.0, width: 1.8, mul: 2.5, cd: 6.5,
    apply: 'bleed', stacks: 2, critAdd: 0.2, realm: 1, cost: 20,
    desc: 'Lướt xuyên bóng tối gây 2 tầng Xuất Huyết và tăng +20% tỉ lệ Bạo Kích.'
  },
  {
    id: 'meridian_recall', name: 'Chu Thiên Hồi Linh', fam: 1, path: 'sa',
    icon: 'mg_meridian_recall', shape: 'circle', reach: 4.5, mul: 2.6, cd: 8.5,
    exploit: 'bleed', exploitMul: 1.8, realm: 2, cost: 35,
    desc: 'Thu hồi kinh mạch, kích nổ toàn bộ Xuất Huyết gây sát thương ×1.8.'
  },
  {
    id: 'blood_opening', name: 'Lôi Huyết Khai Khiếu', fam: 2, path: 'ma',
    icon: 'mg_blood_opening', shape: 'circle', reach: 4.0, mul: 3.6, cd: 8.0,
    apply: 'break', hpCost: 0.06, realm: 1, cost: 20,
    desc: 'Thiêu đốt 6% Sinh Lực để bộc phát huyết khí, nghiền nát hộ giáp (Phá Giáp) kẻ địch xung quanh.'
  },
  {
    id: 'heaven_pressure', name: 'Phần Thiên Đế Uy', fam: 2, path: 'ma',
    icon: 'mg_heaven_pressure', shape: 'leap', reach: 4.6, mul: 4.8, cd: 12.0,
    apply: 'break', exploit: 'break', exploitMul: 1.6, realm: 3, cost: 45,
    desc: 'Giáng uy áp Thiên Ma chấn nát trận địa, sát thương ×1.6 lên mục tiêu đang Phá Giáp.'
  },
  {
    id: 'united_seal', name: 'Vạn Pháp Quy Nhất', fam: 3, path: 'indep',
    icon: 'mg_united_seal', shape: 'circle', reach: 5.5, mul: 3.1, cd: 9.0,
    apply: 'daze', pull: 2.0, ultBonus: 6, realm: 2, cost: 30,
    desc: 'Hợp nhất tam gia chân khí, hút gom kẻ địch gây Choáng và nạp nhanh +6 Tuyệt Kỹ.'
  }
];

const VILLAIN_FIG_BY_CHAPTER = [
  'boss_ch0', // Ch 0: Huyết Lang Vương Cốt Nanh
  'boss_ch1', // Ch 1: Hắc Hổ Yêu Tôn Huyền Nha
  'boss_ch2', // Ch 2: Bạch Xà Yêu Cơ Ly Sương
  'boss_ch3', // Ch 3: Xích Viêm Ma Quân Phần Thiên
  'boss_ch4', // Ch 4: Huyền Băng Kiếm Đế Hàn Tuyệt
  'boss_ch5'  // Ch 5: Cửu U Huyết Đế Vô Gián
];

const CHAPTER_TITLES = [
  'Tự Chương · Thanh Lam Phế Đỉnh',
  'Chương 1 · U Lâm Yêu Cốc',
  'Chương 2 · Bích Thủy Hàn Đàm',
  'Chương 3 · Xích Viêm Hỏa Cốc',
  'Chương 4 · Huyền Băng Tuyết Lĩnh',
  'Chương 5 · Cửu U Ma Vực'
];

function getChapterTitleForIdx(chIdx) {
  if (chIdx < CHAPTER_TITLES.length) return CHAPTER_TITLES[Math.max(0, chIdx)];
  const tier = chIdx - CHAPTER_TITLES.length + 1;
  return `Thượng Giới Vô Tận · Tầng ${tier}`;
}

const WEAPON_MESH_BY_ID = {
  master: 'TT_Wp_IronJian',
  yeonhwa: 'TT_Wp_FrostJian',
  cheolsan: 'TT_Wp_JadeStaff',
  unhak: 'TT_Wp_ImmortalJian',
  cheonga: '',
  heugyeong: 'TT_Wp_JadeSpear',
  soyul: 'TT_Wp_SoulBanner',
  macheol: 'TT_Wp_FlameDao',
  danbi: '',
  harang: '',
  dolsoe: '',
  sundeok: 'TT_Wp_JadeSpear',
  makdong: ''
};

// Synchronized Chibi 3D Xianxia Disciples mapping — TT_Char_ThaiHu is 100% EXCLUSIVE TO MASTER (ZERO CLONES!)
const TT_DISCIPLE_MODEL = {
  yeonhwa:   { mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Char_BichDao' },
  cheolsan:  { mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_DaiNhat' },
  cheonga:   { mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_ThanhVan' },
  heugyeong: { mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Char_CuuU' },
  unhak:     { mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_HuyenThien' },
  soyul:     { mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_VanHon' },
  macheol:   { mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_HuyetSat' },
  dolsoe:    { mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_MacMon' },
  danbi:     { mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_LinhNhi' },
  harang:    { mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_XichLoi' },
  sundeok:   { mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_MocThanh' },
  makdong:   { mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_TieuBao' }
};

// Chapter-Matched 3D Xianxia Bosses (Ch 0..5 + Tower/World/Guild Guardians!)
const TT_CHAPTER_BOSSES = [
  { mesh: 'TT_Boss_LinhKhe',  tex: 'TT_Tex_Boss_LinhKhe',  scale: 1.26 }, // Ch 0: Thanh Lam Phế Đỉnh
  { mesh: 'TT_Boss_ThanhLa',  tex: 'TT_Tex_Boss_ThanhLa',  scale: 1.24 }, // Ch 1: U Lâm Yêu Cốc
  { mesh: 'TT_Boss_BacHai',   tex: 'TT_Tex_Boss_BacHai',   scale: 1.28 }, // Ch 2: Bích Thủy Hàn Đàm
  { mesh: 'TT_Boss_XichViem', tex: 'TT_Tex_Boss_XichViem', scale: 1.26 }, // Ch 3: Xích Viêm Hỏa Cốc
  { mesh: 'TT_Boss_VanKiem',  tex: 'TT_Tex_Boss_VanKiem',  scale: 1.22 }, // Ch 4: Huyền Băng Tuyết Lĩnh
  { mesh: 'TT_Boss_VanKiem',  tex: 'TT_Tex_Boss_CuuU',     scale: 1.26 }  // Ch 5: Cửu U Ma Vực
];

// Chapter-Matched 3D Chibi Xianxia Spirit Beasts & Demon Cultivators (replaces Murim Bandits 100%!)
const TT_CHAPTER_MOBS = [
  // Ch 0: Thanh Lam Phế Đỉnh
  [
    { mesh: 'TT_Mob_ThoLinh',   tex: 'TT_Tex_Mob_ThoLinh',   codexId: 'minion', nm: 'Linh Khê Ngọc Thỏ',    r: 1.65, sc: 0.96 },
    { mesh: 'TT_Mob_HoaTinh',   tex: 'TT_Tex_Mob_HoaTinh',   codexId: 'toxin',  nm: 'Mẫu Đơn Hoa Tinh',     r: 4.20, sc: 0.98 }
  ],
  // Ch 1: U Lâm Yêu Cốc
  [
    { mesh: 'TT_Mob_KhiNui',    tex: 'TT_Tex_Mob_KhiNui',    codexId: 'minion', nm: 'Thanh La Sơn Hầu',     r: 1.75, sc: 0.98 },
    { mesh: 'TT_Mob_HoYeu',     tex: 'TT_Tex_Mob_HoYeu',     codexId: 'dart',   nm: 'Xích Hồ Yêu Tu',       r: 4.60, sc: 1.00 }
  ],
  // Ch 2: Bích Thủy Hàn Đàm
  [
    { mesh: 'TT_Mob_CuaSanHo',  tex: 'TT_Tex_Mob_CuaSanHo',  codexId: 'shield', nm: 'San Hô Giáp Giải',     r: 1.65, sc: 0.98 },
    { mesh: 'TT_Mob_NguNhan',   tex: 'TT_Tex_Mob_NguNhan',   codexId: 'ronin',  nm: 'Bích Hải Ngư Vệ',      r: 1.95, sc: 1.00 }
  ],
  // Ch 3: Xích Viêm Hỏa Cốc
  [
    { mesh: 'TT_Mob_NhamThach', tex: 'TT_Tex_Mob_NhamThach', codexId: 'shield', nm: 'Nham Thạch Ma Khôi',   r: 1.75, sc: 1.02 },
    { mesh: 'TT_Mob_KyNhong',   tex: 'TT_Tex_Mob_KyNhong',   codexId: 'toxin',  nm: 'Dung Nham Hỏa Thằn Lằn', r: 4.30, sc: 0.98 }
  ],
  // Ch 4: Huyền Băng Tuyết Lĩnh
  [
    { mesh: 'TT_Mob_GauTuyet',  tex: 'TT_Tex_Mob_GauTuyet',  codexId: 'monk',   nm: 'Huyền Băng Tuyết Hùng', r: 1.80, sc: 1.04 },
    { mesh: 'TT_Mob_CuTuyet',   tex: 'TT_Tex_Mob_CuTuyet',   codexId: 'dart',   nm: 'Băng Linh Tuyết Cú',    r: 4.80, sc: 0.98 }
  ],
  // Ch 5: Cửu U Ma Vực
  [
    { mesh: 'TT_Mob_KiemXuong', tex: 'TT_Tex_Mob_KiemXuong', codexId: 'ronin',  nm: 'Huyết Cốt Kiếm Khách', r: 1.95, sc: 1.02 },
    { mesh: 'TT_Mob_KiemHon',   tex: 'TT_Tex_Mob_KiemHon',   codexId: 'dart',   nm: 'U Minh Kiếm Hồn Linh', r: 4.60, sc: 1.02 }
  ]
];

// ==================== 3 PHÁP BẢO 3D HỘ THÂN (KỸ SƯ HIỆN ĐẠI × TU TIÊN) ====================
const ARTIFACTS_DEF = [
  {
    id: 'mirror',
    name: 'Thái Hư Kim Chung',
    tier: 'Kim Chung Hộ Thể',
    img: 'art_mirror',
    color: '#ffd966',
    desc: 'Kim Chung tiên gia xoay quanh Tông Chủ, mỗi 8.5 giây tạo Hộ Thuẫn Linh Lực hấp thụ sát thương & chống Thiên Kiếp.',
    statTxt: (lv) => `+${lv * 10}% Thủ · Tạo Hộ Thuẫn ${14 + lv * 4}% Máu tối đa`,
    cost: (lv) => ({ coin: 220 * (lv + 1), herb: 8 * (lv + 1), core: 5 * (lv + 1) })
  },
  {
    id: 'orb',
    name: 'Tử Tiêu Lôi Đăng',
    tier: 'Lôi Điện Cảm Ứng',
    img: 'art_orb',
    color: '#b584ff',
    desc: 'Linh đăng Tử Tiêu xoay vòng bên người, mỗi 5.2 giây dẫn Cửu Thiên Thần Lôi 3D giáng thẳng xuống tối đa 3 yêu thú và gây Choáng.',
    statTxt: (lv) => `+${lv * 3}% Bạo Kích · Giáng Lôi 3D (${Math.round((1.65 + lv * 0.35) * 100)}% Công)`,
    cost: (lv) => ({ coin: 280 * (lv + 1), herb: 10 * (lv + 1), core: 7 * (lv + 1) })
  },
  {
    id: 'furnace',
    name: 'Hồng Liên Nghiệp Hỏa',
    tier: 'Hồng Liên Hồi Phục',
    img: 'art_furnace',
    color: '#ff7038',
    desc: 'Đài sen Hồng Liên cháy rực quanh thân, mỗi 7 giây bộc phát hỏa hoàn thiêu đốt yêu thú và hồi Sinh Lực cho toàn bộ Đệ Tử.',
    statTxt: (lv) => `+${lv * 8}% Sinh Lực · Hồi ${7 + lv * 2}% Máu toàn đội + Hỏa Hoàn`,
    cost: (lv) => ({ coin: 260 * (lv + 1), herb: 12 * (lv + 1), core: 6 * (lv + 1) })
  }
];

// ==================== HỆ THỐNG RIÊNG: NGỰ KIẾM TRẬN (PHI BINH SAU LƯNG 0 → 9 CÂY!) ====================
const SWORD_ARRAY_TIERS = [
  { lv: 0, name: 'Chưa Khai Mở', count: 0, volley: 0, cd: 0, dmgMul: 0, atkPct: 0, cost: { coin: 0, herb: 0, core: 0 } },
  { lv: 1, name: 'Nhất Kiếm Ngự Không', count: 1, volley: 1, cd: 1.65, dmgMul: 1.25, atkPct: 6, cost: { coin: 160, herb: 6, core: 4 } },
  { lv: 2, name: 'Song Kiếm Hợp Bích', count: 2, volley: 1, cd: 1.50, dmgMul: 1.40, atkPct: 12, cost: { coin: 260, herb: 9, core: 6 } },
  { lv: 3, name: 'Tam Tài Kiếm Trận', count: 3, volley: 2, cd: 1.38, dmgMul: 1.55, atkPct: 18, cost: { coin: 380, herb: 12, core: 9 } },
  { lv: 4, name: 'Tứ Tượng Kiếm Trận', count: 4, volley: 2, cd: 1.28, dmgMul: 1.72, atkPct: 24, cost: { coin: 520, herb: 16, core: 12 } },
  { lv: 5, name: 'Ngũ Hành Kiếm Trận', count: 5, volley: 2, cd: 1.18, dmgMul: 1.90, atkPct: 32, cost: { coin: 700, herb: 20, core: 16 } },
  { lv: 6, name: 'Lục Hợp Kiếm Trận', count: 6, volley: 3, cd: 1.08, dmgMul: 2.10, atkPct: 40, cost: { coin: 920, herb: 25, core: 20 } },
  { lv: 7, name: 'Thất Tinh Bắc Đẩu Trận', count: 7, volley: 3, cd: 0.98, dmgMul: 2.35, atkPct: 50, cost: { coin: 1200, herb: 32, core: 26 } },
  { lv: 8, name: 'Bát Quái Chu Thiên Trận', count: 8, volley: 3, cd: 0.90, dmgMul: 2.60, atkPct: 60, cost: { coin: 1550, herb: 40, core: 32 } },
  { lv: 9, name: 'Cửu Kiếm Quy Tông Đại Trận', count: 9, volley: 4, cd: 0.80, dmgMul: 3.00, atkPct: 75, cost: { coin: 2000, herb: 50, core: 42 } }
];

// 3 Trận Hình Ngự Kiếm Trận (đổi tư thế 3D sau lưng + cơ chế chiến đấu riêng!)
const SWORD_ARRAY_FORMATIONS = [
  { id: 'fan', name: 'Liên Xạ Kiếm Phiến', tag: 'Công Tốc', desc: 'Xòe quạt sau đầu, giảm 15% hồi chiêu phóng Phi Binh tập trung dồn sát thương đơn mục tiêu & Thủ Lĩnh.' },
  { id: 'ring', name: 'Hộ Thể Kiếm Hoàn', tag: 'Phòng Ngự', desc: 'Xoay vòng 360° quanh thân, giảm 15% sát thương nhận vào và tự động phản chấn 60% Công khi bị đánh!' },
  { id: 'domain', name: 'Vạn Kiếm Kiếm Vực', tag: 'Kiếm Vực AoE', desc: 'Treo vương miện kiếm trên không, mỗi 12 giây khai mở Kiếm Vực 4 giây giáng mưa kiếm 3D diện rộng!' }
];

// ==================== HỆ THỐNG LINH THÚ HỘ MỆNH 3D (4 PHẨM CẤP: LINH → ĐỊA → THIÊN → TIÊN PHẨM!) ====================
const SPIRIT_PETS_DEF = [
  {
    id: 'jiuwei', name: 'Tiên Hoa Ngọc Thỏ', grade: 'Linh Phẩm', stars: '★★', rarity: 'rarity-linh', gradeCol: '#38b27a', elem: 'Linh · Hồi Phục & Rơi Đồ', color: '#ff8cc8',
    desc: 'Linh thú nhập môn dễ khế ước nhất — Ngọc Thỏ đội tiên hoa nhảy nhót tụ linh khí, tăng sản lượng rơi đồ & hồi Máu toàn đội mỗi 6.5s.',
    statTxt: (lv) => `+${15 + lv * 4}% Tỉ Lệ Rơi · Hồi ${5 + lv}% Máu toàn đội / 6.5s`,
    cost: (lv) => ({ coin: 160 * (lv + 1), herb: 4 * (lv + 1), core: 3 * (lv + 1) })
  },
  {
    id: 'qingluan', name: 'Thanh Ngọc Tuyết Cú', grade: 'Địa Phẩm', stars: '★★★', rarity: 'rarity-dia', gradeCol: '#2da8e8', elem: 'Phong · Tiên Hỏa', color: '#42ffe8',
    desc: 'Linh điểu Địa Phẩm tốc độ linh hoạt, tăng Tấn Công & mỗi 4.5s phóng 3 lông vũ thanh hỏa thiêu đốt yêu thú.',
    statTxt: (lv) => `+${lv * 4}% Công · Phóng 3 Hỏa Vũ (${Math.round((1.15 + lv * 0.22) * 100)}% Công / 4.5s)`,
    cost: (lv) => ({ coin: 260 * (lv + 1), herb: 7 * (lv + 1), core: 6 * (lv + 1) })
  },
  {
    id: 'xuanwu', name: 'Huyền Vũ Cổ Tùng Quy', grade: 'Thiên Phẩm', stars: '★★★★', rarity: 'rarity-thien', gradeCol: '#9b5de5', elem: 'Thổ · Hộ Thuẫn', color: '#52e898',
    desc: 'Thần thú Thiên Phẩm mang cổ tùng trên mai vững như bàn thạch, tăng mạnh Sinh Lực/Thủ & mỗi 7.5s tạo Hộ Thuẫn Linh Lực dày đặc.',
    statTxt: (lv) => `+${lv * 6}% Máu & Thủ · Hộ Thuẫn ${12 + Math.round(lv * 2.5)}% Máu / 7.5s`,
    cost: (lv) => ({ coin: 380 * (lv + 1), herb: 11 * (lv + 1), core: 9 * (lv + 1) })
  },
  {
    id: 'leilong', name: 'Cửu Tiêu Lôi Kỳ Lân', grade: 'Tiên Phẩm', stars: '★★★★★', rarity: 'rarity-tien', gradeCol: '#e6a817', elem: 'Lôi · Chí Tôn Phá Giáp', color: '#64d8ff',
    desc: 'Thánh thú Tiên Phẩm tối thượng! Lôi Kỳ Lân lam điện tăng mạnh Công + Bạo Kích & mỗi 4.5s giáng Thiên Lôi diện rộng lên 3 yêu thú, phá giáp cực mạnh!',
    statTxt: (lv) => `+${lv * 5}% Công · +${(lv * 2.0).toFixed(1)}% Bạo Kích · Thiên Lôi 3 Mục Tiêu (${Math.round((1.8 + lv * 0.35) * 100)}% Công / 4.5s)`,
    cost: (lv) => ({ coin: 560 * (lv + 1), herb: 16 * (lv + 1), core: 14 * (lv + 1) })
  }
];

// ==================== 4 LOẠI LINH ĐAN (LÒ LUYỆN ĐAN TƯƠNG TÁC) ====================
const PILLS_DEF = [
  {
    id: 'qi',
    name: 'Tụ Khí Đan',
    img: 'pill_qi',
    color: '#52fff0',
    desc: 'Ngưng tụ linh khí thiên địa. Uống vào nhận ngay +350 EXP Tu Luyện & +60 Linh Khí.',
    cost: { coin: 80, herb: 4, core: 2 },
    consumable: true
  },
  {
    id: 'heal',
    name: 'Cửu Chuyển Hồi Linh Đan',
    img: 'pill_heal',
    color: '#62f598',
    desc: 'Linh đan thượng phẩm hồi đầy 100% Sinh Lực cho toàn đội và nạp +35% Tuyệt Kỹ tức thì.',
    cost: { coin: 110, herb: 6, core: 2 },
    consumable: true
  },
  {
    id: 'fury',
    name: 'Bạo Huyết Phần Thiên Đan',
    img: 'pill_fury',
    color: '#ff6438',
    desc: 'Kích phát tiềm năng chân khí: Tăng +50% Tấn Công trong 60 giây kèm hào quang hỏa diễm 3D!',
    cost: { coin: 160, herb: 6, core: 4 },
    consumable: true
  },
  {
    id: 'trucco',
    name: 'Trúc Cơ Đột Phá Đan',
    img: 'pill_trucco',
    color: '#ffd966',
    desc: 'Chế tạo trực tiếp +1 Đan Dược Đột Phá dùng để lên Lôi Kiếp Đài độ Thiên Kiếp thăng Cảnh Giới!',
    cost: { coin: 240, herb: 10, core: 6 },
    consumable: false
  }
];

// ==================== HỆ THỐNG TRANG BỊ & THẦN BINH 3D (6 Ô · 38 MÓN · 5 BỘ · TẨY LUYỆN · LINH CHÂU!) ====================
const EQUIPMENT_DEF = window.XIANXIA_EQUIPMENT_DEF || [];

class MurimEngine {
  constructor(audio, renderer) {
    this.audio = audio;
    this.renderer = renderer;
    this.data = { game: null, jianghu: null, story: null, online: null };
    this.state = null;
    this.combat = null;
    this.onUiDirty = null;
    this.onToast = null;
    this.onStoryTrigger = null;
    this.onUltCutIn = null;
    this.onStageTransition = null;
    this.onOpenPanelRequest = null;
    this.onGotoTownRequest = null;
    this.isStoryActive = null;
    this.runAfterStory = null;
    this.saveTimer = 0;
    this.chanceTimer = 45;
  }

  async init() {
    const [game, jianghu, story, online] = await Promise.all([
      fetch('assets/data/game.json?v=8').then(r => r.json()),
      fetch('assets/data/jianghu.json?v=8').then(r => r.json()),
      fetch('assets/data/story.json?v=8').then(r => r.json()),
      fetch('assets/data/online.json?v=8').then(r => r.json())
    ]);
    // Merge Legacy Arts into fight.skills so players can learn & equip all 22 arts!
    for (const ls of LEGACY_SKILLS) {
      if (!game.fight.skills.some(s => s.id === ls.id)) {
        game.fight.skills.push(ls);
      }
    }
    this.data = { game, jianghu, story, online };
    this.loadState();
    this.setupCombat(this.state.prologueDone ? 'field' : 'prologue');
  }

  createDefaultState() {
    const halls = {};
    for (const h of this.data.game.halls) {
      halls[h.id] = {
        lv: h.id === 'main' ? 1 : 0, // Only ruined Main Hall Lv.1 stands at start; all 7 other halls start as ruins!
        stored: 0,
        buildEnd: 0,
        workers: []
      };
    }
    return {
      saveVer: 3,
      lastTickMs: Date.now(),
      coin: 0,    // Steward Thanh Linh Nhi hands over 300 Linh Thạch right after Prologue (st.intro)
      jade: 0,    // Earned logically through Prologue & Guide milestones
      xp: 0,
      scroll: 0,
      pill: 0,
      herb: 24,   // Linh Thảo rơi từ yêu thú (dùng Luyện Đan & Chế Tạo Pháp Bảo)
      core: 12,   // Yêu Đan rơi từ yêu thú & thủ lĩnh
      qi: 0,      // Linh Khí tu luyện (đầy 100 kích hoạt Chu Thiên Viên Mãn!)
      qiMax: 100,
      meditating: false,
      atkBuffT: 0,
      artifacts: {
        mirror:  { lv: 0, eq: false },
        orb:     { lv: 0, eq: false },
        furnace: { lv: 0, eq: false }
      },
      swordArray: { lv: 0, active: true, formation: 'fan' }, // Hệ thống riêng Ngự Kiếm Trận: 0 → 9 cây + 3 trận hình!
      pets: { qingluan: { lv: 0 }, leilong: { lv: 0 }, xuanwu: { lv: 0 }, jiuwei: { lv: 0 } },
      petActive: '',
      discipleBond: {},
      lastSaveAt: Date.now(),
      essence: 24,
      gearOwned: { wp_iron_jian: 1 }, // itemId -> enhanceLv (1..30)
      gearEquipped: { weapon: 'wp_iron_jian', helm: null, armor: null, jade: null, ring: null, boots: null },
      gearSubstats: {}, // itemId -> [{ key, val, grade, locked }]
      gearSockets: {},  // itemId -> [{ id, lv } | null, ...]
      gems: { kim: [2, 0, 0, 0, 0], moc: [2, 0, 0, 0, 0], thuy: [1, 0, 0, 0, 0], hoa: [1, 0, 0, 0, 0], tho: [1, 0, 0, 0, 0] },
      pills: { qi: 1, heal: 1, fury: 1 },
      karma: 0,
      fame: 0,
      rep: 0,
      honor: 0,
      merit: 0,
      salve: 2,
      salveTimer: 0,

      stage: 1,
      maxStage: 1,
      prologueDone: false,
      guideStep: 0,
      firstPickDone: false,
      huntMode: false, // false = Tiến Ải (trong cùng chương), true = Săn Bãi tại chỗ gom tiền!
      autoSkill: true,
      autoBoss: false,
      speedIdx: 0, // 0->1x, 1->1.5x, 2->2x, 3->3x
      insight: 0,

      train: { atk: 0, hp: 0, def: 0, crit: 0, critDmg: 0 },
      realmIdx: 0,
      shadowLosses: 0,

      // Starts with ZERO fancy skills during Prologue (pure basic swordplay); unlocked step-by-step!
      learnedSkills: [],
      skillLvs: {},
      equippedSkills: [null, null, null, null],

      sectPath: '', // '', 'jeong', 'sa', 'ma', 'indep'
      affiliation: 'Độc Lập',
      relations: { murim: 0, sa: 0, ma: 0 },

      // Starts SOLO in Prologue (0 disciples deployed); disciples join & deploy logically after Prologue!
      disciples: {},
      deployed: [],
      recruitTotal: 0,
      recruitPity: 0,

      halls,
      plaques: {}, // idx 0..5 -> 'hang' | 'return' | 'break'

      // Jianghu & Expedition & Regression
      lap: 1,
      rebirths: 0,
      formation: 'line',
      unlockedForms: ['line'],
      clearedNodes: {}, // 'r1.in': true
      branches: {},     // 'r1': 'a' | 'b'
      outposts: {},     // 'r1.f2': { res: 'coin', n: 300 }
      outpostStored: { coin: 0, xp: 0, scroll: 0, pill: 0 },
      doctrines: [-1, -1, -1, -1, -1],
      formUses: {},
      endingsSeen: {},
      perks: {},
      pacts: [],
      wanderFloor: 1,
      wanderRoute: 'iron',
      wanderWear: 0,
      fameTierSeen: 0,
      expStreak: 0,
      injured: {},
      raid: { pending: null, wins: 0, cleanStreak: 0, grudgeWins: 0, helpWins: 0, cooldown: 95 },
      featStats: { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 },

      // Trials, Murim, Season, Codex, Feats, Shop, Story
      dailyLeft: { coin: 2, xp: 2, scroll: 2, forge: 2 },
      dailyLv: { coin: 1, xp: 1, scroll: 1, forge: 1 },
      trialQuestClaimed: false,
      towerFloor: 1,
      arenaScore: 1000,
      arenaRunsLeft: 5,
      arenaCapLv: 0,
      arenaTierClaimed: {},
      guild: { joined: true, name: 'Thái Hư Tiên Minh', exp: 120, bld: { hall: 1, yard: 1, store: 1 }, skills: { g_coin: 0, g_xp: 0, g_hall: 0, g_reward: 0 }, bossRuns: 3, cheers: 3, weekScore: 2400, stagesClaimed: {}, borrowLeft: 2, borrowedId: null },
      season: { xp: 0, token: 20, passOwned: false, claimedFree: {}, claimedPaid: {}, dayClaimed: {}, weekClaimed: {}, tradeBought: {}, bossRuns: 2, stats: { boss: 0, train: 0, collect: 0, skill: 0, daily: 0, tower: 0, road: 0, recruit: 0 } },
      codexKills: { minion: 0, leader: 0, boss: 0, dart: 0, ronin: 0, shield: 0, toxin: 0, monk: 0 },
      codexClaimed: {},
      featsClaimed: {},
      seenScenes: {},
      shopBought: {},
      adJadeLeft: 5,
      noAds: false,
      passDaysLeft: 0,
      vipLv: 0,
      cosmetics: { wing: 'wing_none', aura: 'aura_none' }
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem('thai_hu_tien_mon_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Clean fresh start for v3 logical progression (replaces legacy v1/v2 saves with pre-unlocked skills/disciples)
        if (!parsed.saveVer || parsed.saveVer < 3) {
          localStorage.removeItem('thai_hu_tien_mon_save_v1');
          this.state = this.createDefaultState();
        } else {
          this.state = Object.assign(this.createDefaultState(), parsed);
          if (!this.state.seenScenes) this.state.seenScenes = {};
          if (!this.state.artifacts) this.state.artifacts = this.createDefaultState().artifacts;
          if (!this.state.swordArray) this.state.swordArray = { lv: 0, active: true, formation: 'fan' };
          if (!this.state.swordArray.formation) this.state.swordArray.formation = 'fan';
          if (!this.state.pets) this.state.pets = { qingluan: { lv: 0 }, leilong: { lv: 0 }, xuanwu: { lv: 0 }, jiuwei: { lv: 0 } };
          if (typeof this.state.petActive !== 'string') this.state.petActive = '';
          if (!this.state.discipleBond) this.state.discipleBond = {};
          if (!this.state.dailyLeft) this.state.dailyLeft = { coin: 2, xp: 2, scroll: 2, forge: 2 };
          if (typeof this.state.dailyLeft.forge !== 'number') this.state.dailyLeft.forge = 2;
          if (!this.state.dailyLv) this.state.dailyLv = { coin: 1, xp: 1, scroll: 1, forge: 1 };
          if (typeof this.state.dailyLv.forge !== 'number') this.state.dailyLv.forge = 1;
          if (!this.state.lastSaveAt) this.state.lastSaveAt = this.state.lastTickMs || Date.now();
          if (!this.state.gearOwned) this.state.gearOwned = { wp_iron_jian: 1 };
          if (!this.state.gearEquipped) this.state.gearEquipped = { weapon: 'wp_iron_jian', helm: null, armor: null, jade: null, ring: null, boots: null };
          for (const sl of ['weapon', 'helm', 'armor', 'jade', 'ring', 'boots']) {
            if (this.state.gearEquipped[sl] === undefined) this.state.gearEquipped[sl] = null;
          }
          if (typeof this.state.essence !== 'number') this.state.essence = 24;
          if (!this.state.gearSubstats) this.state.gearSubstats = {};
          if (!this.state.gearSockets) this.state.gearSockets = {};
          if (!this.state.gems) this.state.gems = { kim: [2, 0, 0, 0, 0], moc: [2, 0, 0, 0, 0], thuy: [1, 0, 0, 0, 0], hoa: [1, 0, 0, 0, 0], tho: [1, 0, 0, 0, 0] };
          for (const gid of Object.keys(this.state.gearOwned)) {
            if (this.state.gearOwned[gid] > 0 && !this.state.gearSubstats[gid]) {
              this.rollSubstatsForGear(gid, true);
            }
          }
          if (!this.state.pills) this.state.pills = { qi: 1, heal: 1, fury: 1 };
          if (typeof this.state.herb !== 'number') this.state.herb = 24;
          if (typeof this.state.core !== 'number') this.state.core = 12;
          if (typeof this.state.qi !== 'number') this.state.qi = 0;
          if (!this.state.qiMax) this.state.qiMax = 100;
          if (!this.state.endingsSeen || Array.isArray(this.state.endingsSeen)) this.state.endingsSeen = {};
          if (!this.state.formUses) this.state.formUses = {};
          if (!Array.isArray(this.state.doctrines) || this.state.doctrines.length < 5) {
            const oldDocs = Array.isArray(this.state.doctrines) ? this.state.doctrines : [];
            this.state.doctrines = [oldDocs[0] ?? -1, oldDocs[1] ?? -1, oldDocs[2] ?? -1, oldDocs[3] ?? -1, oldDocs[4] ?? -1];
          }
          if (typeof this.state.fameTierSeen !== 'number') this.state.fameTierSeen = 0;
          if (typeof this.state.expStreak !== 'number') this.state.expStreak = 0;
          if (!this.state.injured) this.state.injured = {};
          if (!this.state.raid) this.state.raid = { pending: null, wins: 0, cleanStreak: 0, grudgeWins: 0, helpWins: 0, cooldown: 95 };
          if (!this.state.featStats) this.state.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
          if (!this.state.wanderRoute) this.state.wanderRoute = 'iron';
          if (typeof this.state.wanderWear !== 'number') this.state.wanderWear = 0;
          if (typeof this.state.arenaCapLv !== 'number') this.state.arenaCapLv = 0;
          if (!this.state.arenaTierClaimed) this.state.arenaTierClaimed = {};
          if (this.state.guild) {
            if (!this.state.guild.bld) this.state.guild.bld = { hall: 1, yard: 1, store: 1 };
            if (typeof this.state.guild.weekScore !== 'number') this.state.guild.weekScore = 2400;
            if (!this.state.guild.stagesClaimed) this.state.guild.stagesClaimed = {};
            if (typeof this.state.guild.borrowLeft !== 'number') this.state.guild.borrowLeft = 2;
            if (typeof this.state.guild.cheers !== 'number') this.state.guild.cheers = 3;
          }
          if (this.state.season) {
            if (!this.state.season.dayClaimed) this.state.season.dayClaimed = {};
            if (!this.state.season.weekClaimed) this.state.season.weekClaimed = {};
            if (!this.state.season.tradeBought) this.state.season.tradeBought = {};
          }
          if (!this.state.cosmetics) this.state.cosmetics = { wing: 'wing_none', aura: 'aura_none' };
          this.state.meditating = false;
        }
      } else {
        this.state = this.createDefaultState();
      }
    } catch (_) {
      this.state = this.createDefaultState();
    }
  }

  // ==================== LOGICAL PROGRESSION, UNLOCKS & 6-STEP APK GUIDE ====================
  getUnlockedSkillSlots() {
    const st = this.state;
    if (!st || !st.prologueDone) return 0; // Prologue: pure basic 3-hit swordplay!
    let slots = 1; // Slot 1 unlocks after Prologue (Nhất Thiểm Kiếm Khí)
    if ((st.guideStep || 0) >= 1 || (st.train && st.train.atk >= 3)) slots = 2;
    if ((st.guideStep || 0) >= 3 || st.maxStage >= 2 || st.firstPickDone) slots = 3;
    if ((st.guideStep || 0) >= 5 || st.maxStage >= 4 || st.recruitTotal >= 1) slots = 4;
    return slots;
  }

  isUltUnlocked() {
    const st = this.state;
    return !!(st && st.prologueDone);
  }

  isFeatureUnlocked(feat) {
    const st = this.state;
    if (!st) return false;
    if (feat === 'settings') return true;
    if (!st.prologueDone) return false;
    if (feat === 'growth' || feat === 'disciple' || feat === 'town' || feat === 'story' || feat === 'artifact' || feat === 'alchemy') return true;
    if (feat === 'arts') return st.maxStage >= 2 || (st.guideStep || 0) >= 3 || st.firstPickDone;
    if (feat === 'jianghu' || feat === 'trial' || feat === 'shop' || feat === 'murim' || feat === 'season') {
      return st.maxStage >= 3 || (st.guideStep || 0) >= 6;
    }
    return true;
  }

  getFeatureLockMsg(feat) {
    if (!this.state || !this.state.prologueDone) return 'Hoàn thành Mở Đầu để mở khóa tính năng này!';
    if (feat === 'arts') return 'Vượt Chương 1 · Ải 1 để lĩnh ngộ & mở Tàng Kinh Tiên Pháp!';
    return 'Vượt Chương 1 · Ải 2 để mở khóa Tiên Giới, Bí Cảnh & Thương Điếm!';
  }

  getGuideStatus() {
    const st = this.state;
    if (!st || !st.prologueDone) return null;
    const step = st.guideStep || 0;
    const steps = [
      {
        id: 'train',
        tag: 'HỆ THỐNG · NHIỆM VỤ 1/6',
        desc: `Vào Tu Luyện cường hóa Tấn Công (${Math.min(3, st.train.atk || 0)}/3)`,
        rewardTxt: '+200 Linh Thạch · Mở Ô Tiên Pháp 2',
        done: (st.train.atk || 0) >= 3,
        panel: 'growth',
        tab: 0
      },
      {
        id: 'deploy',
        tag: 'HỆ THỐNG · NHIỆM VỤ 2/6',
        desc: `Vào Đệ Tử cho ít nhất 2 đệ tử Xuất Trận (${Math.min(2, st.deployed.length)}/2)`,
        rewardTxt: '+200 EXP Tu Luyện',
        done: st.deployed.length >= 2,
        panel: 'disciple',
        tab: 0
      },
      {
        id: 'stage1',
        tag: 'HỆ THỐNG · NHIỆM VỤ 3/6',
        desc: `Vượt Chương 1 · Ải 1 (${st.maxStage >= 2 ? '1/1' : '0/1'})`,
        rewardTxt: '+8 Ngọc Giản · +300 Tiên Ngọc · Mở Tiên Pháp',
        done: st.maxStage >= 2,
        panel: null,
        tab: 0
      },
      {
        id: 'town',
        tag: 'HỆ THỐNG · NHIỆM VỤ 4/6',
        desc: `Về Sơn Môn Tu Tiên 3D Tái Thiết Linh Thạch Khố (${(st.halls.vault.lv > 0 || st.halls.vault.buildEnd > 0) ? '1/1' : '0/1'})`,
        rewardTxt: '+400 Linh Thạch · +700 Tiên Ngọc',
        done: st.halls.vault.lv > 0 || st.halls.vault.buildEnd > 0,
        panel: 'town_scene',
        tab: 0
      },
      {
        id: 'recruit',
        tag: 'HỆ THỐNG · NHIỆM VỤ 5/6',
        desc: `Vào Đệ Tử → Chiêu Mộ đón thêm cao thủ (${Math.min(1, st.recruitTotal)}/1)`,
        rewardTxt: '+10 Ngọc Giản · Mở Ô 4 & Tuyệt Kỹ',
        done: st.recruitTotal >= 1,
        panel: 'disciple',
        tab: 1
      },
      {
        id: 'stage2',
        tag: 'HỆ THỐNG · NHIỆM VỤ 6/6',
        desc: `Vượt Chương 1 · Ải 2 mở Tiên Giới & Bí Cảnh (${st.maxStage >= 3 ? '1/1' : '0/1'})`,
        rewardTxt: '+300 Tiên Ngọc · +1 Đan Dược',
        done: st.maxStage >= 3,
        panel: null,
        tab: 0
      }
    ];
    if (step >= steps.length) return null;
    return steps[step];
  }

  claimGuideStep() {
    const g = this.getGuideStatus();
    if (!g || !g.done) return false;
    const st = this.state;
    const cur = st.guideStep || 0;
    st.guideStep = cur + 1;
    this.audio.playSfx('recruit_gold');

    if (g.id === 'train') {
      st.coin += 200;
      if (!st.learnedSkills.includes('burst')) {
        st.learnedSkills.push('burst');
        st.skillLvs.burst = 1;
      }
      if (!st.equippedSkills[1]) st.equippedSkills[1] = 'burst';
      this.toast('Hoàn thành Chỉ Dẫn 1: +200 Linh Thạch & lĩnh ngộ Hồi Toàn Trảm (Ô 2)!');
    } else if (g.id === 'deploy') {
      st.xp += 200;
      this.toast('Hoàn thành Chỉ Dẫn 2: +200 EXP Tu Luyện cho đệ tử!');
    } else if (g.id === 'stage1') {
      st.scroll += 8;
      st.jade += 300;
      this.toast('Hoàn thành Chỉ Dẫn 3: +8 Ngọc Giản, +300 Tiên Ngọc · Mở Tàng Kinh Tiên Pháp!');
      if (!st.firstPickDone) this.triggerFirstPickMartialArt();
    } else if (g.id === 'town') {
      st.coin += 400;
      st.jade += 700;
      this.toast('Hoàn thành Chỉ Dẫn 4: +400 Linh Thạch, +700 Tiên Ngọc (đủ chiêu mộ ×10)!');
    } else if (g.id === 'recruit') {
      st.scroll += 10;
      this.toast('Hoàn thành Chỉ Dẫn 5: +10 Ngọc Giản · Mở Ô Kỹ Năng 4 & Tuyệt Kỹ!');
    } else if (g.id === 'stage2') {
      st.jade += 300;
      st.pill += 1;
      this.toast('Hoàn thành toàn bộ Chỉ Dẫn Tân Thủ: Mở Tiên Giới, Bí Cảnh & Võ Tháp!');
    }

    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  triggerFirstPickMartialArt() {
    const st = this.state;
    if (st.firstPickDone || !this.onStoryTrigger) return;
    st.firstPickDone = true;
    this.saveState();
    this.onStoryTrigger({
      title: 'Ngộ Đạo Tiên Pháp · Chọn Chiêu Thức Tông Phái',
      lines: [
        {
          who: 'Tông Chủ',
          fig: 'hero_lamphong',
          text: 'Qua trận giao chiến vừa rồi, ký ức võ học kiếp trước đang dần thức tỉnh.\nTa nên khởi đầu theo đường kiếm nào trước đây?'
        }
      ],
      choices: [
        {
          label: 'Thiểm Điện Bộ [Ngự Kiếm · Kiếm Ngân]',
          onPick: () => {
            if (!st.learnedSkills.includes('flash')) {
              st.learnedSkills.push('flash');
              st.skillLvs.flash = 1;
            }
            if (!st.equippedSkills[2]) st.equippedSkills[2] = 'flash';
            this.audio.playSfx('levelup');
            this.toast('Lĩnh ngộ Thiểm Điện Bộ (gắn vào Ô 3)!');
            this.saveState();
            if (this.onUiDirty) this.onUiDirty();
          }
        },
        {
          label: 'Cửu Lôi Cước [Cửu Lôi · Xuất Huyết]',
          onPick: () => {
            if (!st.learnedSkills.includes('whirl')) {
              st.learnedSkills.push('whirl');
              st.skillLvs.whirl = 1;
            }
            if (!st.equippedSkills[2]) st.equippedSkills[2] = 'whirl';
            this.audio.playSfx('levelup');
            this.toast('Lĩnh ngộ Cửu Lôi Cước (gắn vào Ô 3)!');
            this.saveState();
            if (this.onUiDirty) this.onUiDirty();
          }
        }
      ]
    });
  }

  saveState() {
    if (!this.state) return;
    const now = Date.now();
    this.state.lastTickMs = now;
    this.state.lastSaveAt = now;
    try {
      localStorage.setItem('thai_hu_tien_mon_save_v1', JSON.stringify(this.state));
    } catch (_) {}
  }

  // ==================== BẾ QUAN NGOẠI TUYẾN (ỦY THÁC TREO MÁY ĐẦY ĐỦ) + EXPORT/IMPORT SAVE ====================
  getMaxOfflineHours() {
    const st = this.state || {};
    const awayCfg = (this.data.game && this.data.game.away) || { capHours: 12 };
    let hrs = Math.max(12, awayCfg.capHours || 12);
    if ((st.vipLv || 0) >= 1) hrs += 4;
    if (st.noAds || (st.passDaysLeft || 0) > 0) hrs += 8;
    return Math.min(24, hrs);
  }

  computeOfflineReward() {
    const st = this.state;
    if (!st || !st.prologueDone) return null;
    const prev = st.lastSaveAt || st.lastTickMs || Date.now();
    const awayCfg = (this.data.game && this.data.game.away) || { minSec: 180, capHours: 12, rate: 0.5 };
    const elapsedSec = Math.floor((Date.now() - prev) / 1000);
    const minSec = Math.min(180, awayCfg.minSec || 180);
    if (elapsedSec < minSec) return null;
    const capHours = this.getMaxOfflineHours();
    const capSec = capHours * 3600;
    const effSec = Math.min(capSec, elapsedSec);
    const mins = effSec / 60;
    const hours = effSec / 3600;
    const stageGrow = Math.pow(1.09, Math.max(0, (st.stage || 1) - 1));
    const petMul = this.getPetDropMul();
    const vipBonus = 1 + Math.min(1.0, (st.vipLv || 0) * 0.08);
    const kills = Math.max(12, Math.round(mins * 4.5));
    const coin = Math.max(25, Math.round(mins * 24 * stageGrow * petMul * vipBonus));
    const xp = Math.max(15, Math.round(mins * 14 * stageGrow * vipBonus));
    const herb = Math.max(2, Math.round(mins * 0.50 * petMul));
    const core = Math.max(1, Math.round(mins * 0.28 * petMul));
    const essence = Math.max(1, Math.round(mins * 0.22 * petMul));
    const scroll = Math.floor(hours * 1.2);
    const pill = Math.floor(hours * 0.6);
    const gems = Math.min(18, Math.floor(hours * 1.5));
    const gearCount = Math.min(4, Math.floor(hours / 2));
    return { sec: effSec, capHours, kills, coin, xp, herb, core, essence, scroll, pill, gems, gearCount };
  }

  claimOfflineReward(doubled = false) {
    const rw = this.computeOfflineReward();
    if (!rw) return null;
    const st = this.state;
    const freeX2 = (st.vipLv || 0) >= 1 || !!st.noAds || (st.passDaysLeft || 0) > 0;
    let mul = 1;
    if (doubled) {
      if (freeX2) {
        mul = 2;
      } else if ((st.jade || 0) >= 20) {
        st.jade -= 20;
        mul = 2;
      } else {
        this.toast('Cần 20 Tiên Ngọc (hoặc VIP 1 / Đặc Quyền) để Bế Quan ×2 — đã nhận mức thường!');
      }
    }
    st.coin += rw.coin * mul;
    st.xp += rw.xp * mul;
    st.herb = (st.herb || 0) + rw.herb * mul;
    st.core = (st.core || 0) + rw.core * mul;
    st.essence = (st.essence || 0) + (rw.essence || 0) * mul;
    if (rw.scroll > 0) st.scroll = (st.scroll || 0) + rw.scroll * mul;
    if (rw.pill > 0) st.pill = (st.pill || 0) + rw.pill * mul;

    // Distribute Linh Châu Ngũ Hành Lv.1 & Tier-matched Gear drops!
    const gemCount = (rw.gems || 0) * mul;
    if (gemCount > 0) {
      if (!st.gems) st.gems = { kim: [0,0,0,0,0], moc: [0,0,0,0,0], thuy: [0,0,0,0,0], hoa: [0,0,0,0,0], tho: [0,0,0,0,0] };
      const gKeys = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
      for (let i = 0; i < gemCount; i++) {
        const k = gKeys[Math.floor(Math.random() * gKeys.length)];
        if (!st.gems[k]) st.gems[k] = [0, 0, 0, 0, 0];
        st.gems[k][0]++;
      }
    }
    const gDrops = (rw.gearCount || 0) * (mul > 1 ? 1 : 1);
    const dropTier = Math.min(5, 1 + Math.floor((st.stage || 1) / 12));
    for (let i = 0; i < gDrops; i++) {
      this.grantRandomGearDrop(dropTier, '🧘 Bế Quan Ủy Thác');
    }

    st.lastSaveAt = Date.now();
    st.lastTickMs = Date.now();
    this.audio.playSfx('recruit_gold');
    this.toast(`🧘 Ủy Thác (${rw.kills} Yêu Thú): +${(rw.coin * mul).toLocaleString()} Thạch, +${(rw.xp * mul).toLocaleString()} Tu Vi, +${(rw.essence || 0) * mul} Tinh Thạch${gemCount ? `, +${gemCount} Linh Châu` : ''}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return rw;
  }

  exportSaveString() {
    this.saveState();
    const json = JSON.stringify(this.state);
    return btoa(unescape(encodeURIComponent(json)));
  }

  importSaveString(rawStr) {
    try {
      const cleaned = (rawStr || '').trim();
      if (!cleaned) return { ok: false, msg: 'Chuỗi lưu trống!' };
      const json = decodeURIComponent(escape(atob(cleaned)));
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.stage !== 'number') {
        return { ok: false, msg: 'Dữ liệu không đúng định dạng Thái Hư Tiên Môn!' };
      }
      parsed.saveVer = 3;
      localStorage.setItem('thai_hu_tien_mon_save_v1', JSON.stringify(parsed));
      this.loadState();
      this.setupCombat(this.state.prologueDone ? 'field' : 'prologue');
      if (this.onUiDirty) this.onUiDirty();
      return { ok: true, msg: 'Khôi phục dữ liệu thành công!' };
    } catch (e) {
      return { ok: false, msg: 'Mã lưu bị lỗi hoặc thiếu ký tự!' };
    }
  }

  giftDisciplePill(discipleId) {
    const st = this.state;
    if (!st || !st.disciples || !st.disciples[discipleId]) return false;
    if (!st.discipleBond) st.discipleBond = {};
    const curBond = st.discipleBond[discipleId] || 0;
    if (curBond >= 10) {
      this.toast('Độ thân thiết với đệ tử này đã đạt tối đa (Cấp 10 · Sinh Tử Chi Giao)!');
      return false;
    }
    const usePill = (st.pills && st.pills.qi > 0);
    if (usePill) {
      st.pills.qi--;
    } else if (st.coin >= 120) {
      st.coin -= 120;
    } else {
      this.toast('Cần 1 Tụ Khí Đan hoặc 120 Linh Thạch để tặng lễ đệ tử!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    st.discipleBond[discipleId] = curBond + 1;
    this.syncMasterStatsLive();
    this.audio.playSfx('collect');
    const def = this.data.game.disciples.find(d => d.id === discipleId);
    this.toast(`💚 Tặng lễ thành công! Thân thiết với ${def ? def.name : discipleId} đạt Cấp ${curBond + 1} (+2% Công/Máu toàn phái)!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getDiscipleBondBonus() {
    const b = (this.state && this.state.discipleBond) || {};
    let lvSum = 0;
    for (const v of Object.values(b)) lvSum += (v || 0);
    return lvSum * 0.02; // +2% global ATK/HP per bond level!
  }

  resetSave() {
    localStorage.removeItem('thai_hu_tien_mon_save_v1');
    this.state = this.createDefaultState();
    this.setupCombat('prologue');
    if (this.onUiDirty) this.onUiDirty();
  }

  toast(msg) {
    if (this.onToast) this.onToast(msg);
  }

  // ==================== STAT & BONUS FORMULAS ====================
  getPerkMaxLv(p) {
    if (!p) return 0;
    return p.deep && p.deep > p.max ? p.deep : p.max;
  }

  getPerkNextCost(p, lv) {
    if (!p) return 999999;
    if (lv < p.max) return (p.costBase || 20) + lv * (p.costStep || 10);
    return (p.deepCost || 60) + (lv - p.max) * (p.deepStep || 10);
  }

  hasForesight() {
    return !!((this.state && this.state.perks && this.state.perks.foresight) >= 1);
  }

  getLapMods() {
    const laps = (this.data && this.data.jianghu && this.data.jianghu.laps) || { cap: 5, foeHp: 0.25, reward: 0.25, smashCd: 0.1, smashCdMin: 0.7 };
    const cap = laps.cap || 5;
    const lapIdx = Math.max(0, Math.min(cap - 1, ((this.state && this.state.lap) || 1) - 1));
    return {
      lapIdx,
      foeHpMul: 1 + lapIdx * (laps.foeHp || 0.25),
      rewardMul: 1 + lapIdx * (laps.reward || 0.25),
      cdMul: Math.max(laps.smashCdMin || 0.7, 1 - lapIdx * (laps.smashCd || 0.1))
    };
  }

  getFameTier() {
    const fame = (this.state && this.state.fame) || 0;
    const tiers = (this.data && this.data.jianghu && this.data.jianghu.fame && this.data.jianghu.fame.tiers) || [];
    let bestIdx = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (fame >= tiers[i].at) bestIdx = i;
    }
    return { idx: bestIdx, tier: tiers[bestIdx] || { at: 0, name: 'Sơn Môn Vô Danh', mods: [], cuts: [] }, next: tiers[bestIdx + 1] || null };
  }

  getFameModVal(key) {
    const fame = (this.state && this.state.fame) || 0;
    const tiers = (this.data && this.data.jianghu && this.data.jianghu.fame && this.data.jianghu.fame.tiers) || [];
    let sum = 0;
    for (const t of tiers) {
      if (fame >= t.at) {
        for (const m of (t.mods || [])) {
          if (m.key === key) sum += m.v;
        }
      }
    }
    return sum;
  }

  addFame(amt) {
    if (!amt || amt <= 0) return;
    this.state.fame = (this.state.fame || 0) + amt;
    const ft = this.getFameTier();
    if (ft.idx > (this.state.fameTierSeen || 0)) {
      const prevSeen = this.state.fameTierSeen || 0;
      this.state.fameTierSeen = ft.idx;
      this.toast(`🏛 Danh Tiếng Sơn Môn đạt mốc「${ft.tier.name}」(+${Math.round(this.getFameModVal('hall') * 100)}% Điện Các, +${Math.round(this.getFameModVal('outpost') * 100)}% Cứ Điểm)!`);
      if (ft.tier.cuts && ft.tier.cuts.length && this.onStoryTrigger && ft.idx > prevSeen) {
        this.onStoryTrigger({ title: `DANH TIẾNG SƠN MÔN · ${ft.tier.name}`, lines: ft.tier.cuts, doneLabel: 'Tiếp Tục Hành Tẩu' });
      }
    }
  }

  getPactRewardBonus() {
    const jh = this.data && this.data.jianghu;
    if (!jh || !this.state || !Array.isArray(this.state.pacts)) return 0;
    let sum = 0;
    for (const pid of this.state.pacts) {
      const p = (jh.pacts || []).find(x => x.id === pid);
      if (p) sum += (p.karma || p.bonus || 0);
    }
    return Math.min(jh.pactCap || 1.0, sum);
  }

  togglePact(id) {
    const jh = this.data && this.data.jianghu;
    if (!jh) return false;
    if (!Array.isArray(this.state.pacts)) this.state.pacts = [];
    const idx = this.state.pacts.indexOf(id);
    if (idx >= 0) {
      this.state.pacts.splice(idx, 1);
      this.audio.playSfx('ui_click');
      this.saveState();
      if (this.onUiDirty) this.onUiDirty();
      return true;
    }
    const maxP = jh.pactMax || 4;
    if (this.state.pacts.length >= maxP) {
      this.toast(`Chỉ được lập tối đa ${maxP} Minh Ước cùng lúc!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.pacts.push(id);
    if (id === 'few') {
      const maxSlots = this.getMaxDeploySlots();
      if (this.state.deployed.length > maxSlots) this.state.deployed = this.state.deployed.slice(0, maxSlots);
    }
    if (id === 'nosalve') {
      const ms = this.getMaxSalves();
      if (this.state.salve > ms) this.state.salve = ms;
    }
    this.audio.playSfx('ui_tab');
    const pDef = (jh.pacts || []).find(x => x.id === id);
    this.toast(`📜 Đã lập Minh Ước「${pDef ? pDef.name : id}」· Tổng thưởng +${Math.round(this.getPactRewardBonus() * 100)}%`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getExpStreakBonus() {
    const exp = (this.data && this.data.jianghu && this.data.jianghu.exp) || { streakBonus: 0.15, streakMax: 0.6 };
    return Math.min(exp.streakMax || 0.6, ((this.state && this.state.expStreak) || 0) * (exp.streakBonus || 0.15));
  }

  healInjuredDisciple(id) {
    if (!this.state.injured || !this.state.injured[id]) return false;
    const cost = (this.data && this.data.jianghu && this.data.jianghu.exp && this.data.jianghu.exp.injurePill) || 10;
    if ((this.state.pill || 0) < cost) {
      this.toast(`Cần ${cost} Đan Dược Đột Phá để trị thương cho đệ tử!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.pill -= cost;
    delete this.state.injured[id];
    this.audio.playSfx('heal');
    const dDef = this.data.game.disciples.find(d => d.id === id);
    this.toast(`💚 Đã trị thương hoàn toàn cho ${dDef ? dDef.name : id}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  // ==================== RAID (TẬP KÍCH SƠN TRANG - 7 PHE) ====================
  pickRaidFaction() {
    const raid = this.data && this.data.jianghu && this.data.jianghu.raid;
    if (!raid || !raid.factions || !raid.factions.length) return null;
    const clearedRegs = ['r1', 'r2', 'r3', 'r4', 'r5'].filter(r => this.state.clearedNodes[`${r}.boss`]);
    const pool = [];
    for (const f of raid.factions) {
      if (f.when === 'Hiệp' && (this.state.rep || 0) >= (raid.repAt || 30)) pool.push(f);
      else if (f.when === 'Bá' && (this.state.rep || 0) <= -(raid.repAt || 30)) pool.push(f);
      else if (clearedRegs.includes(f.when)) pool.push(f);
    }
    if (!pool.length) pool.push(raid.factions[0]);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const isGrudge = this.hasPact('grudge') || Math.random() < 0.35;
    const hasHelp = (this.state.rep || 0) >= 20;
    return { ...picked, isGrudge, hasHelp };
  }

  triggerRaidAlert(force = false) {
    const raid = this.data && this.data.jianghu && this.data.jianghu.raid;
    if (!raid) return false;
    if (!this.state.raid) this.state.raid = { pending: null, wins: 0, cleanStreak: 0, grudgeWins: 0, helpWins: 0, cooldown: 95 };
    if (this.state.raid.pending && !force) return false;
    const fac = this.pickRaidFaction();
    if (!fac) return false;
    this.state.raid.pending = fac;
    this.audio.playSfx('boss');
    this.toast(`🚨 CẢNH BÁO TẬP KÍCH: ${fac.name} đang kéo tới Sơn Trang! Mở Bản Đồ Tiên Giới hoặc Sân Sơn Môn để nghênh chiến!`);
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  startRaidDefense() {
    const fac = this.state.raid && this.state.raid.pending;
    if (!fac) {
      this.triggerRaidAlert(true);
    }
    const activeFac = this.state.raid && this.state.raid.pending;
    if (!activeFac) return false;
    const rCfg = this.data.jianghu.raid;
    if (this.renderer && this.renderer.mode === 'town' && this.onGotoFieldRequest) this.onGotoFieldRequest();
    this.setupCombat('raid', false, {
      stage: Math.max(12, this.state.maxStage - 1),
      sec: rCfg.sec || 97,
      trait: activeFac.trait,
      title: `Tập Kích · ${activeFac.name}`,
      raidFaction: activeFac
    });
    if (activeFac.hasHelp) {
      this.toast('⚔ Đồng minh mang ơn đã tới tiếp viện (+15% Công toàn đội trong trận Thủ Sơn Trang)!');
    }
    return true;
  }

  // ==================== GUILD BUILDINGS, STAGES, CHEER, BORROW & ARENA HONOR ====================
  getGuildSkillCap() {
    const gCfg = this.data.online.guild;
    const hallLv = (this.state.guild && this.state.guild.bld && this.state.guild.bld.hall) || 1;
    const hDef = (gCfg.buildings || []).find(b => b.id === 'hall');
    return (gCfg.skillBase || 6) + hallLv * (hDef ? hDef.per : 2);
  }

  upgradeGuildBuilding(bldId) {
    const gCfg = this.data.online.guild;
    if (!this.state.guild.bld) this.state.guild.bld = { hall: 1, yard: 1, store: 1 };
    const lv = this.state.guild.bld[bldId] || 1;
    const exps = gCfg.bldExp || [0, 300, 900, 2000, 4000, 7000];
    if (lv >= exps.length) { this.toast('Công trình Minh Hội đã đạt cấp tối đa!'); return false; }
    const need = exps[lv];
    if ((this.state.guild.exp || 0) < need) {
      this.toast(`Cần ${need} EXP Minh Hội để nâng cấp công trình!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.guild.exp -= need;
    this.state.guild.bld[bldId] = lv + 1;
    this.audio.playSfx('levelup');
    const bDef = (gCfg.buildings || []).find(b => b.id === bldId);
    this.toast(`🏛 Đã nâng ${bDef ? bDef.name : bldId} lên Lv.${lv + 1}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  claimGuildStage(idx) {
    const gCfg = this.data.online.guild;
    if (!this.state.guild.stagesClaimed) this.state.guild.stagesClaimed = {};
    if (this.state.guild.stagesClaimed[idx]) return false;
    const need = (gCfg.stages || [])[idx] || 0;
    if ((this.state.guild.weekScore || 0) < need) return false;
    const yardLv = (this.state.guild.bld && this.state.guild.bld.yard) || 1;
    const yardMul = 1 + (yardLv - 1) * 0.1;
    const meritG = Math.round(((gCfg.stageMerit || [])[idx] || 20) * yardMul);
    const jadeG = (gCfg.stageJade || [])[idx] || 5;
    this.state.guild.stagesClaimed[idx] = true;
    this.state.merit = (this.state.merit || 0) + meritG;
    this.state.jade = (this.state.jade || 0) + jadeG;
    this.audio.playSfx('collect');
    this.toast(`🎁 Nhận mốc tuần Minh Hội #${idx + 1}: +${meritG} Cống Hiến, +${jadeG} Tiên Ngọc!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  cheerGuild() {
    const gCfg = this.data.online.guild;
    if ((this.state.guild.cheers || 0) <= 0) {
      this.toast('Đã hết lượt Cổ Vũ hôm nay!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.guild.cheers--;
    const meritG = gCfg.cheerMerit || 2;
    this.state.merit = (this.state.merit || 0) + meritG;
    this.state.guild.weekScore = (this.state.guild.weekScore || 0) + 250;
    const line = (gCfg.cheers || ['Cùng nhau lớn mạnh nhé'])[Math.floor(Math.random() * (gCfg.cheers || ['']).length)];
    const emo = (gCfg.emotes || ['Ôm Quyền'])[Math.floor(Math.random() * (gCfg.emotes || ['']).length)];
    this.audio.playSfx('collect');
    this.toast(`🙌 [${emo}] "${line}" · +${meritG} Cống Hiến & +250 Điểm Tuần Minh Hội!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  borrowGuildDisciple(did) {
    const gCfg = this.data.online.guild;
    if ((this.state.guild.borrowLeft ?? 2) <= 0) {
      this.toast('Đã hết lượt Mượn Đệ Tử Minh Hội hôm nay!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.guild.borrowLeft = (this.state.guild.borrowLeft ?? 2) - 1;
    this.state.guild.borrowedId = did;
    this.state.merit = (this.state.merit || 0) + (gCfg.lendMerit || 5);
    const dDef = this.data.game.disciples.find(d => d.id === did);
    this.audio.playSfx('recruit_gold');
    this.toast(`🤝 Đã mượn cao thủ Minh Hội「${dDef ? dDef.name : did}」chi viện cho trận chiến tiếp theo (+${gCfg.lendMerit || 5} Cống Hiến)!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  upgradeArenaCap() {
    const aCfg = this.data.online.arena;
    const lv = this.state.arenaCapLv || 0;
    const costs = aCfg.capCost || [200, 300, 450, 650, 900, 1200, 1600, 2100, 2700, 3400];
    if (lv >= costs.length) { this.toast('Vinh Dự Chiến Ấn đã đạt bậc tối đa!'); return false; }
    const cost = costs[lv];
    if ((this.state.honor || 0) < cost) {
      this.toast(`Cần ${cost} Vinh Dự để nâng Vinh Dự Chiến Ấn!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.honor -= cost;
    this.state.arenaCapLv = lv + 1;
    this.audio.playSfx('levelup');
    this.toast(`🏅 Nâng Vinh Dự Chiến Ấn Lv.${lv + 1}: +${(lv + 1) * 3}% Công & Máu toàn diện!`);
    this.syncMasterStatsLive();
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  claimSeasonGoal(isWeek, idx) {
    const sCfg = this.data.game.season;
    const list = isWeek ? (sCfg.weekGoals || []) : (sCfg.dayGoals || []);
    const g = list[idx];
    if (!g) return false;
    const mapKey = isWeek ? 'weekClaimed' : 'dayClaimed';
    if (!this.state.season[mapKey]) this.state.season[mapKey] = {};
    if (this.state.season[mapKey][idx]) return false;
    const cur = (this.state.season.stats && this.state.season.stats[g.kind]) || 0;
    if (cur < g.n) return false;
    this.state.season[mapKey][idx] = true;
    this.state.season.xp = (this.state.season.xp || 0) + (g.xp || 0);
    this.state.season.token = (this.state.season.token || 0) + (g.token || 0);
    this.audio.playSfx('collect');
    this.toast(`✨ Hoàn thành nhiệm vụ Tiết Khí: +${g.xp} EXP${g.token ? `, +${g.token} Tín Vật` : ''}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  buySeasonTrade(idx) {
    const sCfg = this.data.game.season;
    const item = (sCfg.trade || [])[idx];
    if (!item) return false;
    if (!this.state.season.tradeBought) this.state.season.tradeBought = {};
    const bought = this.state.season.tradeBought[idx] || 0;
    if (bought >= item.max) { this.toast('Đã đạt giới hạn đổi vật phẩm này!'); return false; }
    if ((this.state.season.token || 0) < item.cost) {
      this.toast(`Cần ${item.cost} Tín Vật Tiết Khí!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.season.token -= item.cost;
    this.state.season.tradeBought[idx] = bought + 1;
    this.grantGift(item.res, item.n);
    this.audio.playSfx('collect');
    this.toast(`🛍 Đổi thành công bằng Tín Vật Tiết Khí!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getPerkVal(key) {
    let sum = 0;
    for (const p of (this.data.jianghu.perks || [])) {
      if (p.key === key) {
        const lv = this.state.perks[p.id] || 0;
        const baseLv = Math.min(lv, p.max);
        const deepLv = Math.max(0, lv - p.max);
        sum += baseLv * p.per + deepLv * (p.deepPer || 0);
      }
    }
    return sum;
  }

  getDoctrineVal(key) {
    let sum = 0;
    const docs = this.data.jianghu.doctrines || [];
    docs.forEach((d, idx) => {
      const pick = this.state.doctrines[idx];
      if (pick >= 0 && d.opts[pick]) {
        for (const m of (d.opts[pick].mods || [])) {
          if (m.key === key) sum += m.v;
        }
      }
    });
    return sum;
  }

  getGuildBonus(key) {
    let sum = 0;
    for (const sk of (this.data.online.guild.skills || [])) {
      if (sk.key === key) {
        sum += (this.state.guild.skills[sk.id] || 0) * sk.per;
      }
    }
    return sum;
  }

  getOwnedDiscipleBonus(key) {
    let sum = 0;
    for (const d of this.data.game.disciples) {
      const owned = this.state.disciples[d.id];
      if (owned && d.bonus === key) {
        sum += d.bonusPer * (1 + owned.stars);
      }
    }
    return sum;
  }

  getCodexDmgBonus() {
    let tiers = 0;
    for (const e of this.data.game.codex.entries) {
      const kills = this.state.codexKills[e.id] || 0;
      for (const st of e.steps) {
        if (kills >= st) tiers++;
      }
    }
    return tiers * this.data.game.codex.dmg;
  }

  getSchoolResonance() {
    const counts = [0, 0, 0, 0];
    for (const sid of this.state.equippedSkills) {
      const sk = this.data.game.fight.skills.find(s => s.id === sid);
      if (sk && typeof sk.fam === 'number') counts[sk.fam]++;
    }
    const mods = { crit: 0, critDmg: 0, famCd: 0, bleed: 0, spread: 0, bleedMax: 0, famBig: 0, taken: 0, ultCharge: 0 };
    let activeUlt = this.data.game.fight.ult;
    let activeFamIdx = -1;

    this.data.game.fight.mugong.fams.forEach((fam, idx) => {
      const n = counts[idx];
      for (const r of fam.reso) {
        if (n >= r.need) {
          mods[r.key] = (mods[r.key] || 0) + r.value;
        }
      }
      if (n >= 3) {
        activeUlt = fam.ult;
        activeFamIdx = idx;
      }
    });
    return { counts, mods, activeUlt, activeFamIdx };
  }

  getRepTier() {
    const rep = (this.state && this.state.rep) || 0;
    const tiers = (this.data && this.data.jianghu && this.data.jianghu.repTiers) || [];
    let best = null;
    for (const t of tiers) {
      if ((t.at > 0 && rep >= t.at) || (t.at < 0 && rep <= t.at)) {
        if (!best || Math.abs(t.at) > Math.abs(best.at)) best = t;
      }
    }
    return best;
  }

  getRepModVal(key) {
    const rep = (this.state && this.state.rep) || 0;
    const tiers = (this.data && this.data.jianghu && this.data.jianghu.repTiers) || [];
    let sum = 0;
    for (const t of tiers) {
      if ((t.at > 0 && rep >= t.at) || (t.at < 0 && rep <= t.at)) {
        for (const m of (t.mods || [])) {
          if (m.key === key) sum += m.v;
        }
      }
    }
    return sum;
  }

  getActiveEnding() {
    const rep = (this.state && this.state.rep) || 0;
    const ends = (this.data && this.data.jianghu && this.data.jianghu.endings) || [];
    return ends.find(e => rep >= e.repMin && rep <= e.repMax) || ends[ends.length - 1] || null;
  }

  getFormationMastery(formId = null) {
    const fid = formId || (this.state && this.state.formation) || 'line';
    const uses = (this.state && this.state.formUses && this.state.formUses[fid]) || 0;
    const steps = (this.data && this.data.jianghu && this.data.jianghu.formSteps) || [5, 20, 60, 150, 320];
    const per = (this.data && this.data.jianghu && this.data.jianghu.formPer) || 0.1;
    let tier = 0, nextNeed = steps[0] || 5;
    for (let i = 0; i < steps.length; i++) {
      if (uses >= steps[i]) {
        tier = i + 1;
        nextNeed = steps[i + 1] || null;
      }
    }
    return { uses, tier, mul: 1 + tier * per, nextNeed };
  }

  getActiveTrait(c) {
    const tid = c && c.customOpts && c.customOpts.trait;
    if (!tid || !this.data || !this.data.jianghu) return null;
    const tr = (this.data.jianghu.traits || []).find(t => t.id === tid);
    if (!tr) return null;
    const countered = !!(this.state && this.state.formation === tr.counter);
    return { ...tr, countered };
  }

  getFormationMods() {
    const f = this.data.jianghu.formations.find(x => x.id === this.state.formation) || this.data.jianghu.formations[0];
    const mast = this.getFormationMastery(f.id);
    const out = { skill: 0, basic: 0, pierce: 0, crit: 0, taken: 0, big: 0, small: 0, dmg: 0, masteryTier: mast.tier };
    for (const m of (f.mods || [])) {
      // Positive buffs scale with Formation Mastery (+10% per tier); drawbacks remain fixed!
      const isGood = (m.key === 'taken') ? (m.v < 0) : (m.v > 0);
      out[m.key] = (out[m.key] || 0) + (isGood ? m.v * mast.mul : m.v);
    }
    return out;
  }

  getMasterStats() {
    const tr = this.data.game.train;
    const getT = (id) => {
      const def = tr.find(x => x.id === id);
      const lv = this.state.train[id] || 0;
      const raw = def.baseVal + lv * def.perLv;
      return def.maxVal > 0 ? Math.min(def.maxVal, raw) : raw;
    };

    const realmMul = 1 + this.state.realmIdx * 0.28;
    const reso = this.getSchoolResonance();
    const form = this.getFormationMods();

    let pathAtk = 1, pathHp = 1, pathCrit = 0;
    if (this.state.sectPath === 'jeong') { pathHp *= 1.22; }
    else if (this.state.sectPath === 'sa') { pathCrit += 0.10; }
    else if (this.state.sectPath === 'ma') { pathAtk *= 1.25; }
    else if (this.state.sectPath === 'indep') { pathAtk *= 1.12; pathHp *= 1.12; }

    const hangCount = Object.values(this.state.plaques || {}).filter(v => v === 'hang').length;
    const plaqueMul = 1 + hangCount * 0.04;
    const art = this.state.artifacts || {};
    const swTier = this.getSwordArrayTier();
    const artAtkBonus = (swTier.atkPct || 0) / 100;
    const artDefBonus = ((art.mirror && art.mirror.lv) || 0) * 0.10;
    const artCritBonus = ((art.orb && art.orb.lv) || 0) * 0.03;
    const artHpBonus = ((art.furnace && art.furnace.lv) || 0) * 0.08;
    const furyMul = (this.state.atkBuffT > 0) ? 1.5 : 1.0;
    const gSum = this.getEquipmentStatTotals();
    const gSet = this.getGearSetBonus();
    const petB = this.getPetStatBonus();
    const bondB = this.getDiscipleBondBonus();
    const arenaCapB = ((this.state && this.state.arenaCapLv) || 0) * 0.03;
    const vipAtkTbl = [0, 0.03, 0.06, 0.10, 0.14, 0.18, 0.24, 0.30, 0.38, 0.48, 0.60];
    const vipAtkB = vipAtkTbl[Math.min(10, Math.max(0, (this.state && this.state.vipLv) || 0))] || 0;
    const cosB = this.getCosmeticBonuses ? this.getCosmeticBonuses() : { atkPct: 0, hpPct: 0, crit: 0 };
    const raidHelpB = (this.combat && this.combat.mode === 'raid' && this.combat.customOpts && this.combat.customOpts.raidFaction && this.combat.customOpts.raidFaction.hasHelp) ? 0.15 : 0;
    const wanderWearCut = (this.combat && this.combat.customOpts && this.combat.customOpts.isWander)
      ? Math.max(0.55, 1 - ((this.state && this.state.wanderWear) || 0))
      : 1.0;

    const atk = Math.round(
      (getT('atk') + gSum.atk) * realmMul * pathAtk * plaqueMul * furyMul * wanderWearCut *
      (1 + vipAtkB + cosB.atkPct + arenaCapB + raidHelpB + artAtkBonus + gSet.atkPct + (gSum.atkPct || 0) + petB.atkPct + bondB + this.getPerkVal('masterAtk') + this.getDoctrineVal('masterAtk') + this.getRepModVal('masterAtk') + this.getOwnedDiscipleBonus('atk') + this.getCodexDmgBonus())
    );
    const maxHp = Math.round(
      (getT('hp') + gSum.hp) * realmMul * pathHp * plaqueMul * wanderWearCut *
      (1 + cosB.hpPct + arenaCapB + artHpBonus + gSet.hpPct + (gSum.hpPct || 0) + petB.hpPct + bondB + this.getPerkVal('masterHp') + this.getDoctrineVal('masterHp') + this.getRepModVal('masterHp') + this.getOwnedDiscipleBonus('hp'))
    );
    const def = Math.round((getT('def') + gSum.def) * (1 + artDefBonus + petB.defPct + this.getOwnedDiscipleBonus('def')));
    const crit = Math.min(0.95, getT('crit') + gSum.crit + gSet.crit + petB.crit + cosB.crit + reso.mods.crit + form.crit + pathCrit + artCritBonus);
    const critDmg = getT('critDmg') + gSum.critDmg + (gSet.critDmg || 0) + reso.mods.critDmg + this.getDoctrineVal('critDmg');

    return { atk, maxHp, def, crit, critDmg, reso, form, gearTotals: gSum, gearSet: gSet };
  }

  // ==================== 4 SIGNATURE XIANXIA SYSTEMS + 3D EQUIPMENT + LINH THÚ ====================
  getArtifactsDef() { return ARTIFACTS_DEF; }
  getPillsDef() { return PILLS_DEF; }
  getEquipmentDef() { return EQUIPMENT_DEF; }
  getSwordArrayTiers() { return SWORD_ARRAY_TIERS; }
  getSwordArrayFormations() { return SWORD_ARRAY_FORMATIONS; }
  getSpiritPetsDef() { return SPIRIT_PETS_DEF; }

  getGearSetBonus() {
    const eq = (this.state && this.state.gearEquipped) || {};
    const counts = {};
    let linhPlus = 0, tienCnt = 0;
    for (const slot of ['weapon', 'helm', 'armor', 'jade', 'ring', 'boots']) {
      const id = eq[slot];
      if (!id) continue;
      const def = EQUIPMENT_DEF.find(e => e.id === id);
      if (!def) continue;
      if (def.setId) counts[def.setId] = (counts[def.setId] || 0) + 1;
      if (def.grade === 'Tiên Phẩm' || def.grade === 'Hồng Mông') { tienCnt++; linhPlus++; }
      else if (def.grade !== 'Phàm Phẩm') { linhPlus++; }
    }
    const setsDef = window.GEAR_SETS_DEF || [];
    const activeSets = [];
    const sum = {
      name: 'Chưa Kích Hoạt Bộ', tier: 0,
      atkPct: 0, hpPct: 0, crit: 0, critDmg: 0, dmgCut: 0, lifesteal: 0, pierce: 0, bossDmg: 0, cdr: 0, qiMul: 0,
      linhPlus, tienCnt, counts, activeSets
    };
    for (const sDef of setsDef) {
      const cnt = counts[sDef.id] || 0;
      if (cnt < 2) continue;
      const tierNum = cnt >= 6 ? 6 : (cnt >= 4 ? 4 : 2);
      const b = sDef.bonuses[tierNum];
      if (!b) continue;
      sum.tier = Math.max(sum.tier, tierNum >= 6 ? 3 : (tierNum >= 4 ? 2 : 1));
      for (const k of ['atkPct', 'hpPct', 'crit', 'critDmg', 'dmgCut', 'lifesteal', 'pierce', 'bossDmg', 'cdr', 'qiMul']) {
        if (b[k]) sum[k] += b[k];
      }
      activeSets.push({ id: sDef.id, name: `${sDef.name} (${cnt}/6)`, col: sDef.col, desc: b.desc, tierNum });
    }
    if (activeSets.length) {
      sum.name = activeSets.map(a => a.name).join(' + ');
    }
    return sum;
  }

  setSwordArrayFormation(formId) {
    if (!this.state.swordArray) this.state.swordArray = { lv: 0, active: true, formation: 'fan' };
    if (!SWORD_ARRAY_FORMATIONS.some(f => f.id === formId)) return false;
    this.state.swordArray.formation = formId;
    const fDef = SWORD_ARRAY_FORMATIONS.find(f => f.id === formId);
    this.audio.playSfx('ui_tab');
    if (this.combat && this.combat.master) {
      const m = this.combat.master;
      this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.4, s1: 3.2, color: '#52fff0', dur: 0.4 });
    }
    this.toast(`⚔ Chuyển Trận Hình Ngự Kiếm: ${fDef.name} (${fDef.tag})!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getPetStatBonus() {
    const pets = (this.state && this.state.pets) || {};
    const out = { atkPct: 0, hpPct: 0, defPct: 0, crit: 0 };
    // Owned pets give 50% passive, active pet gives 100%!
    for (const def of SPIRIT_PETS_DEF) {
      const lv = (pets[def.id] && pets[def.id].lv) || 0;
      if (lv <= 0) continue;
      const w = (this.state.petActive === def.id) ? 1.0 : 0.4;
      if (def.id === 'qingluan') out.atkPct += lv * 0.04 * w;
      else if (def.id === 'leilong') { out.atkPct += lv * 0.05 * w; out.crit += lv * 0.02 * w; }
      else if (def.id === 'xuanwu') { out.hpPct += lv * 0.06 * w; out.defPct += lv * 0.06 * w; }
    }
    return out;
  }

  getPetDropMul() {
    const st = this.state;
    if (!st || !st.pets) return 1.0;
    const jv = st.pets.jiuwei && st.pets.jiuwei.lv;
    if (!jv) return 1.0;
    const mult = st.petActive === 'jiuwei' ? (0.15 + jv * 0.04) : (0.06 + jv * 0.02);
    return 1.0 + mult;
  }

  feedOrUnlockPet(petId) {
    const def = SPIRIT_PETS_DEF.find(p => p.id === petId);
    if (!def) return false;
    if (!this.state.pets) this.state.pets = { qingluan: { lv: 0 }, leilong: { lv: 0 }, xuanwu: { lv: 0 }, jiuwei: { lv: 0 } };
    const cur = this.state.pets[petId] || { lv: 0 };
    if (cur.lv >= 15) {
      this.toast(`${def.name} đã đạt Thánh Thú tối đa (Lv.15)!`);
      return false;
    }
    const cost = def.cost(cur.lv);
    if (this.state.coin < cost.coin || (this.state.herb || 0) < cost.herb || (this.state.core || 0) < cost.core) {
      this.toast(`Thiếu nguyên liệu nuôi Linh Thú! Cần ${cost.coin} Linh Thạch, ${cost.herb} Linh Thảo, ${cost.core} Yêu Đan.`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.coin -= cost.coin;
    this.state.herb -= cost.herb;
    this.state.core -= cost.core;
    cur.lv++;
    this.state.pets[petId] = cur;
    if (cur.lv === 1 && !this.state.petActive) this.state.petActive = petId;
    this.syncMasterStatsLive();
    this.audio.playSfx(cur.lv === 1 || cur.lv === 5 || cur.lv === 10 ? 'recruit_gold' : 'levelup');
    const evoMsg = cur.lv === 10 ? ' 🌟 TIẾN HÓA THÁNH THÚ!' : (cur.lv === 5 ? ' ✨ TIẾN HÓA THÀNH THỂ!' : '');
    this.toast(`🐾 ${cur.lv === 1 ? 'Khế ước thành công' : 'Bồi dưỡng'} ${def.name} Lv.${cur.lv}!${evoMsg}`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  equipPet(petId) {
    const cur = this.state.pets && this.state.pets[petId];
    if (!cur || cur.lv <= 0) return false;
    this.state.petActive = (this.state.petActive === petId) ? '' : petId;
    this.syncMasterStatsLive();
    this.audio.playSfx('ui_click');
    const def = SPIRIT_PETS_DEF.find(p => p.id === petId);
    this.toast(this.state.petActive ? `🐾 Đã triệu hoán Linh Thú 3D: ${def.name} xuất chiến!` : `Đã thu hồi Linh Thú vào Linh Thú Đại.`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getCosmeticsDef() {
    return window.COSMETICS_DEF || { wings: [], auras: [] };
  }

  isCosmeticUnlocked(kind, id) {
    const def = this.getCosmeticsDef();
    const list = kind === 'wing' ? (def.wings || []) : (def.auras || []);
    const item = list.find(x => x.id === id);
    if (!item) return false;
    if (!item.check) return true;
    return !!item.check(this.state || {});
  }

  getCosmeticBonuses() {
    const def = this.getCosmeticsDef();
    const cos = (this.state && this.state.cosmetics) || { wing: 'wing_none', aura: 'aura_none' };
    let atkPct = 0, hpPct = 0, crit = 0;
    // Any unlocked wing/aura grants passive 30% + equipped grants remaining 70% (so equipping is best!)
    for (const [kind, list] of [['wing', def.wings || []], ['aura', def.auras || []]]) {
      for (const it of list) {
        if (!it.rgba) continue;
        const unlocked = this.isCosmeticUnlocked(kind, it.id);
        const equipped = cos[kind] === it.id;
        if (equipped) {
          atkPct += it.atkPct || 0;
          hpPct += it.hpPct || 0;
          crit += it.crit || 0;
        } else if (unlocked) {
          atkPct += (it.atkPct || 0) * 0.35;
          hpPct += (it.hpPct || 0) * 0.35;
        }
      }
    }
    return { atkPct, hpPct, crit };
  }

  equipCosmetic(kind, id) {
    const def = this.getCosmeticsDef();
    const list = kind === 'wing' ? (def.wings || []) : (def.auras || []);
    const item = list.find(x => x.id === id);
    if (!item) return false;
    if (!this.isCosmeticUnlocked(kind, id)) {
      this.toast(`Chưa đủ điều kiện mở ${item.name}: ${item.unlockHint}`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    if (!this.state.cosmetics) this.state.cosmetics = { wing: 'wing_none', aura: 'aura_none' };
    this.state.cosmetics[kind] = id;
    this.syncMasterStatsLive();
    this.audio.playSfx('recruit_gold');
    if (this.renderer && this.combat && this.combat.master) {
      const m = this.combat.master;
      this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.14, z: m.z, s0: 0.4, s1: 3.4, color: item.col || '#52fff0', dur: 0.45 });
    }
    this.toast(`✨ Đã trang bị ${item.name}!`);
    this.saveState();
    if (this.online && this.online.isLoggedIn()) this.online.syncState(this);
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getSwordArrayTier(lvOverride = null) {
    const lv = Math.max(0, Math.min(9, lvOverride !== null ? lvOverride : ((this.state && this.state.swordArray && this.state.swordArray.lv) || 0)));
    return SWORD_ARRAY_TIERS[lv] || SWORD_ARRAY_TIERS[0];
  }

  upgradeSwordArray() {
    if (!this.state.swordArray) this.state.swordArray = { lv: 0, active: true };
    const curLv = this.state.swordArray.lv || 0;
    if (curLv >= 9) {
      this.toast('Ngự Kiếm Trận đã đạt cảnh giới tối đa 9/9 (Cửu Kiếm Quy Tông)!');
      return false;
    }
    const next = SWORD_ARRAY_TIERS[curLv + 1];
    const c = next.cost;
    if (this.state.coin < c.coin || (this.state.herb || 0) < c.herb || (this.state.core || 0) < c.core) {
      this.toast(`Thiếu nguyên liệu! Cần ${c.coin} Linh Thạch, ${c.herb} Linh Thảo, ${c.core} Yêu Đan.`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.coin -= c.coin;
    this.state.herb -= c.herb;
    this.state.core -= c.core;
    this.state.swordArray.lv = curLv + 1;
    this.state.swordArray.active = true;
    this.syncMasterStatsLive();
    this.audio.playSfx('recruit_gold');
    if (this.combat && this.combat.master) {
      const m = this.combat.master;
      this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.5, s1: 3.8, color: '#52fff0', dur: 0.55 });
    }
    this.toast(`⚔ Đã đột phá ${next.name} (${next.count}/9 Phi Binh sau lưng)!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  toggleSwordArrayActive() {
    if (!this.state.swordArray || (this.state.swordArray.lv || 0) <= 0) return false;
    this.state.swordArray.active = !this.state.swordArray.active;
    this.audio.playSfx('ui_click');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return this.state.swordArray.active;
  }

  rollSubstatsForGear(itemId, quiet = false) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def) return [];
    const gCfg = (window.GEAR_GRADES_CFG && window.GEAR_GRADES_CFG[def.grade]) || { subCount: 2, subMul: 1.0 };
    const pool = window.GEAR_SUBSTAT_POOL || [];
    if (!this.state.gearSubstats) this.state.gearSubstats = {};
    const existing = this.state.gearSubstats[itemId] || [];
    const out = [];
    const usedKeys = new Set(existing.filter(s => s && s.locked).map(s => s.key));
    for (let i = 0; i < gCfg.subCount; i++) {
      if (existing[i] && existing[i].locked) {
        out.push(existing[i]);
        continue;
      }
      const cands = pool.filter(p => !usedKeys.has(p.key));
      const pick = (cands.length ? cands : pool)[Math.floor(Math.random() * (cands.length || pool.length))];
      usedKeys.add(pick.key);
      const roll = Math.random();
      const rawPct = pick.min + (pick.max - pick.min) * Math.pow(roll, 1.35);
      const val = Math.max(1, Math.round(rawPct * (gCfg.subMul || 1)));
      const qGrade = roll > 0.85 ? 'Đỏ' : (roll > 0.45 ? 'Tím' : 'Lam');
      out.push({ key: pick.key, val, grade: qGrade, locked: false });
    }
    this.state.gearSubstats[itemId] = out;
    if (!quiet) this.syncMasterStatsLive();
    return out;
  }

  toggleLockSubstat(itemId, idx) {
    if (!this.state.gearSubstats || !this.state.gearSubstats[itemId] || !this.state.gearSubstats[itemId][idx]) return false;
    const arr = this.state.gearSubstats[itemId];
    if (!arr[idx].locked && arr.filter(x => x.locked).length >= arr.length - 1) {
      this.toast('Phải giữ ít nhất 1 dòng không khóa để Tẩy Luyện!');
      return false;
    }
    arr[idx].locked = !arr[idx].locked;
    this.audio.playSfx('ui_click');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  reforgeGearSubstats(itemId) {
    if (!this.state.gearOwned || !this.state.gearOwned[itemId]) return false;
    const arr = (this.state.gearSubstats && this.state.gearSubstats[itemId]) || [];
    const lockCnt = arr.filter(x => x && x.locked).length;
    const essCost = 10 + lockCnt * 6;
    const herbCost = 6;
    const coreCost = lockCnt * 5;
    if ((this.state.essence || 0) < essCost || (this.state.herb || 0) < herbCost || (this.state.core || 0) < coreCost) {
      this.toast(`Cần ${essCost} Tinh Thạch, ${herbCost} Linh Thảo${coreCost ? `, ${coreCost} Yêu Đan` : ''} để Tẩy Luyện!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.essence -= essCost;
    this.state.herb -= herbCost;
    this.state.core -= coreCost;
    this.rollSubstatsForGear(itemId, false);
    this.audio.playSfx('recruit_gold');
    this.toast('✨ Tẩy luyện dòng phụ hoàn tất — chỉ số đã đồng bộ!');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  combineGem(gemId, lvIdx) {
    // lvIdx: 0..3 -> combines 3 gems of Lv(lvIdx+1) into 1 gem of Lv(lvIdx+2)
    if (!this.state.gems || !this.state.gems[gemId] || lvIdx < 0 || lvIdx >= 4) return false;
    if ((this.state.gems[gemId][lvIdx] || 0) < 3) {
      this.toast('Cần 3 viên Linh Châu cùng cấp để Hợp Thành lên bậc cao hơn!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.gems[gemId][lvIdx] -= 3;
    this.state.gems[gemId][lvIdx + 1] = (this.state.gems[gemId][lvIdx + 1] || 0) + 1;
    this.audio.playSfx('recruit_gold');
    const gDef = (window.GEMS_DEF || []).find(g => g.id === gemId);
    this.toast(`💎 Hợp thành công 1 viên ${gDef ? gDef.name : gemId} Lv.${lvIdx + 2}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  socketGem(itemId, slotIdx, gemId, gemLv) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def || !this.state.gearOwned || !this.state.gearOwned[itemId]) return false;
    const maxS = ((window.GEAR_GRADES_CFG && window.GEAR_GRADES_CFG[def.grade]) || { sockets: 2 }).sockets || 2;
    if (slotIdx < 0 || slotIdx >= maxS) return false;
    if (!this.state.gems || !this.state.gems[gemId] || (this.state.gems[gemId][gemLv - 1] || 0) <= 0) {
      this.toast('Không có Linh Châu này trong túi!');
      return false;
    }
    if (!this.state.gearSockets) this.state.gearSockets = {};
    if (!this.state.gearSockets[itemId]) this.state.gearSockets[itemId] = [null, null, null];
    const prev = this.state.gearSockets[itemId][slotIdx];
    if (prev && this.state.gems[prev.id]) {
      this.state.gems[prev.id][prev.lv - 1] = (this.state.gems[prev.id][prev.lv - 1] || 0) + 1;
    }
    this.state.gems[gemId][gemLv - 1]--;
    this.state.gearSockets[itemId][slotIdx] = { id: gemId, lv: gemLv };
    this.syncMasterStatsLive();
    this.audio.playSfx('levelup');
    const gDef = (window.GEMS_DEF || []).find(g => g.id === gemId);
    this.toast(`💎 Đã khảm ${gDef ? gDef.name : gemId} Lv.${gemLv} vào ${def.name}!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  unsocketGem(itemId, slotIdx) {
    if (!this.state.gearSockets || !this.state.gearSockets[itemId]) return false;
    const prev = this.state.gearSockets[itemId][slotIdx];
    if (!prev) return false;
    if (!this.state.gems) this.state.gems = {};
    if (!this.state.gems[prev.id]) this.state.gems[prev.id] = [0, 0, 0, 0, 0];
    this.state.gems[prev.id][prev.lv - 1] = (this.state.gems[prev.id][prev.lv - 1] || 0) + 1;
    this.state.gearSockets[itemId][slotIdx] = null;
    this.syncMasterStatsLive();
    this.audio.playSfx('ui_click');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  salvageGear(itemId) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def || itemId === 'wp_iron_jian') { this.toast('Không thể phân giải Thanh Lam Phàm Kiếm khởi đầu!'); return false; }
    if (!this.state.gearOwned || !this.state.gearOwned[itemId]) return false;
    if (this.state.gearEquipped && this.state.gearEquipped[def.slot] === itemId) {
      this.toast('Hãy tháo trang bị này trước khi Phân Giải!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    // Return any socketed gems safely first
    const socks = (this.state.gearSockets && this.state.gearSockets[itemId]) || [];
    for (let i = 0; i < socks.length; i++) {
      if (socks[i]) this.unsocketGem(itemId, i);
    }
    const lv = this.state.gearOwned[itemId] || 1;
    const tier = ((window.GEAR_GRADES_CFG && window.GEAR_GRADES_CFG[def.grade]) || { tier: 1 }).tier || 0;
    const essGain = (12 + tier * 14) + (lv - 1) * (4 + tier * 2);
    const coreGain = 3 + tier * 3 + Math.floor(lv / 2);
    delete this.state.gearOwned[itemId];
    if (this.state.gearSubstats) delete this.state.gearSubstats[itemId];
    this.state.essence = (this.state.essence || 0) + essGain;
    this.state.core = (this.state.core || 0) + coreGain;
    this.audio.playSfx('collect');
    this.toast(`♻ Phân giải ${def.name} +${lv}: nhận +${essGain} Tinh Thạch & +${coreGain} Yêu Đan!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  grantRandomGearDrop(maxTier = 3, sourceLabel = 'Chiến Lợi Phẩm') {
    if (!this.state.gearOwned) this.state.gearOwned = { wp_iron_jian: 1 };
    const cfg = window.GEAR_GRADES_CFG || {};
    const pool = EQUIPMENT_DEF.filter(e => {
      const t = (cfg[e.grade] && cfg[e.grade].tier) || 0;
      return t >= 1 && t <= maxTier;
    });
    if (!pool.length) return '';
    const unowned = pool.filter(e => !this.state.gearOwned[e.id]);
    let msg = '';
    if (unowned.length > 0 && Math.random() < 0.72) {
      const pick = unowned[Math.floor(Math.random() * unowned.length)];
      this.state.gearOwned[pick.id] = 1;
      this.rollSubstatsForGear(pick.id, true);
      msg = `🎁 Rơi ${pick.name} [${pick.grade}]!`;
    } else {
      const essG = 14 + maxTier * 8;
      this.state.essence = (this.state.essence || 0) + essG;
      msg = `♻ Rơi Phôi trang bị hóa thành +${essG} Tinh Thạch!`;
    }
    // 55% chance also drops a random Ngũ Hành Linh Châu Lv.1!
    if (Math.random() < 0.55) {
      const gems = window.GEMS_DEF || [];
      if (gems.length) {
        const gPick = gems[Math.floor(Math.random() * gems.length)];
        if (!this.state.gems) this.state.gems = {};
        if (!this.state.gems[gPick.id]) this.state.gems[gPick.id] = [0, 0, 0, 0, 0];
        this.state.gems[gPick.id][0] = (this.state.gems[gPick.id][0] || 0) + 1;
        msg += ` + 💎 1 ${gPick.name} Lv.1!`;
      }
    }
    this.toast(`${sourceLabel}: ${msg}`);
    return msg;
  }

  getEquipmentItemStats(itemId, lvOverride = null) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def) return { atk: 0, hp: 0, def: 0, crit: 0, critDmg: 0 };
    const lv = lvOverride !== null ? lvOverride : ((this.state.gearOwned && this.state.gearOwned[itemId]) || 1);
    const up = Math.max(0, lv - 1);
    const p = def.perLv || {};
    return {
      atk: (def.atk || 0) + (p.atk || 0) * up,
      hp: (def.hp || 0) + (p.hp || 0) * up,
      def: (def.def || 0) + (p.def || 0) * up,
      crit: def.crit || 0,
      critDmg: def.critDmg || 0
    };
  }

  getEquipmentStatTotals() {
    const tot = {
      atk: 0, hp: 0, def: 0, crit: 0, critDmg: 0,
      atkPct: 0, hpPct: 0, lifesteal: 0, pierce: 0, bossDmg: 0, cdr: 0, dmgCut: 0, qiMul: 1.0
    };
    const eq = (this.state && this.state.gearEquipped) || {};
    const gemDefs = window.GEMS_DEF || [];
    for (const slot of ['weapon', 'helm', 'armor', 'jade', 'ring', 'boots']) {
      const id = eq[slot];
      if (!id) continue;
      const def = EQUIPMENT_DEF.find(e => e.id === id);
      const s = this.getEquipmentItemStats(id);
      tot.atk += s.atk; tot.hp += s.hp; tot.def += s.def;
      tot.crit += s.crit; tot.critDmg += s.critDmg;
      if (def && def.qiMul) tot.qiMul += def.qiMul;
      if (def && def.dmgCut) tot.dmgCut += def.dmgCut;

      // Rolled Substats
      const subs = (this.state && this.state.gearSubstats && this.state.gearSubstats[id]) || [];
      for (const sub of subs) {
        if (sub && sub.key) tot[sub.key] = (tot[sub.key] || 0) + (sub.val / 100);
      }

      // Socketed Ngũ Hành Linh Châu
      const socks = (this.state && this.state.gearSockets && this.state.gearSockets[id]) || [];
      for (const sk of socks) {
        if (!sk || !sk.id) continue;
        const gDef = gemDefs.find(g => g.id === sk.id);
        if (!gDef) continue;
        const mul = Math.pow(2, (sk.lv || 1) - 1);
        tot[gDef.statKey] = (tot[gDef.statKey] || 0) + gDef.baseVal * mul;
        tot[gDef.pctKey] = (tot[gDef.pctKey] || 0) + gDef.pctVal * sk.lv;
      }
    }
    const gSet = this.getGearSetBonus();
    if (gSet) {
      tot.critDmg += gSet.critDmg || 0;
      tot.lifesteal += gSet.lifesteal || 0;
      tot.pierce += gSet.pierce || 0;
      tot.bossDmg += gSet.bossDmg || 0;
      tot.cdr += gSet.cdr || 0;
      tot.qiMul += gSet.qiMul || 0;
    }
    return tot;
  }

  getEquippedWeaponVisual() {
    const wid = (this.state && this.state.gearEquipped && this.state.gearEquipped.weapon) || 'wp_iron_jian';
    const def = EQUIPMENT_DEF.find(e => e.id === wid && e.slot === 'weapon') || EQUIPMENT_DEF[0];
    return {
      id: def.id,
      name: def.name,
      mesh: def.mesh || 'Weapon_Jian',
      ttMesh: def.ttMesh || 'TT_Wp_IronJian',
      isCustomSword: !!def.isCustomSword,
      arrayKind: def.arrayKind || 'customSword',
      animStyle: def.animStyle || 'sword',
      bladeCol: def.bladeCol || [0.76, 0.96, 0.98],
      hiltCol: def.hiltCol || [0.92, 0.78, 0.36],
      haloCol: def.haloCol || [0.52, 0.98, 0.96],
      trailHex: def.trailHex || '#66f2ff'
    };
  }

  getGearCost(itemId, isUpgrade = false) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def) return { coin: 0, herb: 0, core: 0, essence: 0 };
    const smithyLv = (this.state.halls && this.state.halls.smithy && this.state.halls.smithy.lv) || 0;
    const disc = Math.max(0.45, 1 - smithyLv * 0.04); // Luyện Khí Đường giảm 4%/cấp!
    if (!isUpgrade) {
      return {
        coin: Math.round((def.cost.coin || 0) * disc),
        herb: Math.max(def.cost.herb ? 1 : 0, Math.round((def.cost.herb || 0) * disc)),
        core: Math.max(def.cost.core ? 1 : 0, Math.round((def.cost.core || 0) * disc)),
        essence: 0
      };
    }
    const lv = (this.state.gearOwned && this.state.gearOwned[itemId]) || 1;
    const baseCoin = Math.max(120, Math.round((def.cost.coin || 180) * 0.55));
    return {
      coin: Math.round(baseCoin * (1 + lv * 0.42) * disc),
      herb: Math.max(2, Math.round((3 + lv * 2) * disc)),
      core: Math.max(2, Math.round((2 + lv * 2) * disc)),
      essence: lv >= 15 ? (lv - 13) * 4 : 0
    };
  }

  forgeOrUpgradeGear(itemId) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def) return false;
    if (!this.state.gearOwned) this.state.gearOwned = { wp_iron_jian: 1 };
    if (!this.state.gearEquipped) this.state.gearEquipped = { weapon: 'wp_iron_jian', helm: null, armor: null, jade: null, ring: null, boots: null };
    const curLv = this.state.gearOwned[itemId] || 0;
    if (curLv >= 30) {
      this.toast(`${def.name} đã đạt cấp tối đa (+30)!`);
      return false;
    }
    const isUp = curLv > 0;
    const cost = this.getGearCost(itemId, isUp);
    if (this.state.coin < cost.coin || (this.state.herb || 0) < cost.herb || (this.state.core || 0) < cost.core || (this.state.essence || 0) < (cost.essence || 0)) {
      this.toast(`Thiếu nguyên liệu luyện khí! Cần ${cost.coin} Linh Thạch, ${cost.herb} Linh Thảo, ${cost.core} Yêu Đan${cost.essence ? `, ${cost.essence} Tinh Thạch` : ''}.`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.coin -= cost.coin;
    this.state.herb -= cost.herb;
    this.state.core -= cost.core;
    if (cost.essence) this.state.essence -= cost.essence;
    this.state.gearOwned[itemId] = curLv + 1;
    if (!isUp) {
      this.rollSubstatsForGear(itemId, true);
      // Auto-equip newly forged gear immediately so 3D weapon & back-array change live!
      this.state.gearEquipped[def.slot] = itemId;
    }
    this.syncMasterStatsLive();
    this.audio.playSfx(isUp ? 'levelup' : 'recruit_gold');
    this.toast(isUp
      ? `🔨 Cường hóa thành công ${def.name} +${this.state.gearOwned[itemId]}!`
      : `⚔ Đã rèn & trang bị ${def.name}! Vũ khí 3D & dàn Phi Binh đã đổi hình thái!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  equipGear(itemId) {
    const def = EQUIPMENT_DEF.find(e => e.id === itemId);
    if (!def || !this.state.gearOwned || !this.state.gearOwned[itemId]) return false;
    if (!this.state.gearEquipped) this.state.gearEquipped = { weapon: 'wp_iron_jian', armor: null, jade: null, ring: null };
    this.state.gearEquipped[def.slot] = itemId;
    this.syncMasterStatsLive();
    this.audio.playSfx('ui_click');
    if (def.slot === 'weapon' && this.combat && this.combat.master) {
      const m = this.combat.master;
      this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.5, s1: 3.4, color: def.trailHex || '#52fff0', dur: 0.45 });
      this.toast(`⚔ Đã đổi sang ${def.name} — Vũ khí cầm tay & Phi Kiếm sau lưng đồng bộ tức thì!`);
    } else {
      this.toast(`✨ Đã trang bị ${def.name}!`);
    }
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  syncMasterStatsLive() {
    if (!this.combat || !this.combat.master) return;
    const ms = this.getMasterStats();
    const m = this.combat.master;
    const prevMax = Math.max(1, m.maxHp || ms.maxHp);
    const ratio = m.hp / prevMax;
    m.atk = ms.atk;
    m.maxHp = ms.maxHp;
    m.def = ms.def;
    m.crit = ms.crit;
    m.critDmg = ms.critDmg;
    const wVis = this.getEquippedWeaponVisual();
    m.weaponMesh = wVis.mesh;
    if (!m.dead) m.hp = Math.min(m.maxHp, Math.max(1, Math.round(m.maxHp * ratio)));
  }

  toggleMeditate() {
    const st = this.state;
    const c = this.combat;
    if (!st || !c || !c.master || c.master.dead) return false;
    if (c.mode === 'prologue') {
      this.toast('Hoàn thành Mở Đầu để bắt đầu Ngồi Thiền Hấp Linh!');
      return false;
    }
    st.meditating = !st.meditating;
    if (st.meditating) {
      st.swordFlightOn = false;
      c.moveTarget = null;
      c.master.moving = false;
      c.master.swordFlying = false;
      this.audio.playSfx('collect');
      this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: c.master.x, y: 0.08, z: c.master.z, s0: 0.6, s1: 3.4, color: '#58fff0', dur: 0.55 });
      this.toast('🧘 Đã khai mở Ngồi Thiền Hấp Linh — Linh Khí ×3 & hồi Sinh Lực nhanh!');
    } else {
      this.toast('⚔ Thu công xuất chiến!');
    }
    if (this.onUiDirty) this.onUiDirty();
    return st.meditating;
  }

  toggleSwordFlight() {
    const st = this.state;
    const c = this.combat;
    if (!st) return false;
    if (c && c.mode === 'prologue') {
      this.toast('Hoàn thành Mở Đầu để Ngự Kiếm Phi Hành!');
      return false;
    }
    st.swordFlightOn = !st.swordFlightOn;
    if (st.swordFlightOn) {
      st.meditating = false;
      if (c && c.master) c.master.swordFlying = true;
      this.audio.playSfx('swing_0');
      if (c && c.master) {
        this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: c.master.x, y: 0.12, z: c.master.z, s0: 0.4, s1: 2.8, color: '#64fff0', dur: 0.42 });
      }
      this.toast('⚔ Khai mở Ngự Kiếm Phi Hành 3D — Đạp thần binh phi lướt (+42% tốc độ)!');
    } else {
      if (c && c.master) c.master.swordFlying = false;
      this.audio.playSfx('ui_click');
      this.toast('Đã hạ phi kiếm (tự động đạp kiếm khi chạy xa).');
    }
    if (this.onUiDirty) this.onUiDirty();
    return st.swordFlightOn;
  }

  craftOrUpgradeArtifact(artId) {
    const def = ARTIFACTS_DEF.find(a => a.id === artId);
    if (!def) return false;
    if (!this.state.artifacts) this.state.artifacts = {};
    const cur = this.state.artifacts[artId] || { lv: 0, eq: false };
    const cost = def.cost(cur.lv);
    if (this.state.coin < cost.coin || (this.state.herb || 0) < cost.herb || (this.state.core || 0) < cost.core) {
      this.toast(`Thiếu nguyên liệu! Cần ${cost.coin} Linh Thạch, ${cost.herb} Linh Thảo, ${cost.core} Yêu Đan.`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.coin -= cost.coin;
    this.state.herb -= cost.herb;
    this.state.core -= cost.core;
    cur.lv = (cur.lv || 0) + 1;
    if (cur.lv === 1) cur.eq = true;
    this.state.artifacts[artId] = cur;
    this.syncMasterStatsLive();
    this.audio.playSfx('levelup');
    this.toast(`✨ Đã luyện thành ${def.name} Cấp ${cur.lv}! Pháp Bảo đã hiển hiện 3D quanh Tông Chủ!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  toggleEquipArtifact(artId) {
    const cur = this.state.artifacts && this.state.artifacts[artId];
    if (!cur || cur.lv <= 0) return false;
    cur.eq = !cur.eq;
    this.audio.playSfx('ui_click');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return cur.eq;
  }

  refinePill(pillId, tier = 'trung') {
    const def = PILLS_DEF.find(p => p.id === pillId);
    if (!def) return null;
    const cost = def.cost;
    if (this.state.coin < cost.coin || (this.state.herb || 0) < cost.herb || (this.state.core || 0) < cost.core) {
      this.toast(`Thiếu nguyên liệu luyện đan! Cần ${cost.coin} Linh Thạch, ${cost.herb} Linh Thảo, ${cost.core} Yêu Đan.`);
      this.audio.playSfx('ui_deny');
      return null;
    }
    this.state.coin -= cost.coin;
    this.state.herb -= cost.herb;
    this.state.core -= cost.core;

    const qty = (tier === 'cuc' || tier === 'thuong') ? 2 : 1;
    const tierNames = { ha: 'Hạ Phẩm', trung: 'Trung Phẩm', thuong: 'Thượng Phẩm (×2)', cuc: 'Cực Phẩm Kim Đan (×2 + Linh Khí!)' };
    if (pillId === 'trucco') {
      this.state.pill = (this.state.pill || 0) + qty;
    } else {
      if (!this.state.pills) this.state.pills = { qi: 0, heal: 0, fury: 0 };
      this.state.pills[pillId] = (this.state.pills[pillId] || 0) + qty;
    }
    if (tier === 'cuc') {
      this.state.qi = Math.min(this.state.qiMax || 100, (this.state.qi || 0) + 35);
      this.state.xp += 120;
    } else if (tier === 'trung') {
      this.state.qi = Math.min(this.state.qiMax || 100, (this.state.qi || 0) + 12);
    }
    this.audio.playSfx(tier === 'cuc' ? 'recruit_gold' : 'levelup');
    this.toast(`🔥 Luyện thành ${qty}× ${def.name} [${tierNames[tier] || 'Trung Phẩm'}]!`);
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return { qty, tier, label: tierNames[tier] || 'Trung Phẩm' };
  }

  consumePill(pillId) {
    const def = PILLS_DEF.find(p => p.id === pillId);
    if (!def || !def.consumable) return false;
    if (!this.state.pills || (this.state.pills[pillId] || 0) <= 0) {
      this.toast(`Chưa có ${def.name} — Hãy vào Lò Luyện Đan để luyện chế!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.pills[pillId]--;
    const c = this.combat;
    const m = c && c.master;
    if (pillId === 'qi') {
      const xpGain = Math.round(350 * Math.pow(1.08, (this.state.stage || 1) - 1));
      this.state.xp += xpGain;
      this.state.qi = Math.min(this.state.qiMax || 100, (this.state.qi || 0) + 60);
      if (m) {
        this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.5, s1: 3.6, color: '#52fff0', dur: 0.5 });
        this.renderer.addPopup(m.x, 1.0, m.z, `+${xpGain} EXP · +60 Linh Khí`, '#52fff0', 1.25);
      }
      this.toast(`💊 Uống Tụ Khí Đan: +${xpGain.toLocaleString()} EXP & +60 Linh Khí!`);
    } else if (pillId === 'heal') {
      if (c && m) {
        for (const ally of [m, ...(c.mates || [])]) {
          if (ally && !ally.dead) ally.hp = ally.maxHp;
        }
        m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.35);
        this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.6, s1: 4.0, color: '#62f598', dur: 0.55 });
        this.renderer.addPopup(m.x, 1.0, m.z, 'HỒI LINH TOÀN ĐỘI!', '#62f598', 1.3);
      }
      this.toast('🌿 Uống Hồi Linh Đan: Hồi đầy 100% Sinh Lực toàn đội & +35% Tuyệt Kỹ!');
    } else if (pillId === 'fury') {
      this.state.atkBuffT = Math.max(this.state.atkBuffT || 0, 60);
      this.syncMasterStatsLive();
      if (m) {
        this.renderer.pushVfx3D({ mesh: 'pillar', style: 2, x: m.x, y: 0, z: m.z, s0: 1.2, s1: 2.6, sy0: 6.5, sy1: 4.5, color: '#ff5a2c', dur: 0.5 });
        this.renderer.addPopup(m.x, 1.1, m.z, 'BẠO HUYẾT +50% CÔNG!', '#ff7648', 1.35);
      }
      this.toast('🔥 Uống Bạo Huyết Đan: +50% Tấn Công toàn diện trong 60 giây!');
    }
    this.audio.playSfx('collect');
    this.saveState();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  getDiscipleStats(id) {
    const def = this.data.game.disciples.find(d => d.id === id);
    const st = this.state.disciples[id];
    if (!def || !st) return null;
    const dlv = this.data.game.discipleLv;
    const lvMul = 1 + (st.lv - 1) * dlv.growth;
    const starMul = 1 + st.stars * dlv.starGrow;
    const mateBonus = 1 + this.getPerkVal('mate') + this.getDoctrineVal('mate');
    return {
      id,
      def,
      lv: st.lv,
      stars: st.stars,
      shards: st.shards,
      capLv: dlv.capByStar[Math.min(4, st.stars)],
      atk: Math.round(def.atk * lvMul * starMul * mateBonus),
      maxHp: Math.round(def.hp * lvMul * starMul * mateBonus),
      defStat: Math.round(def.def * lvMul * starMul)
    };
  }

  getSectPower() {
    const ms = this.getMasterStats();
    let p = ms.atk * 5 + ms.maxHp * 0.35 + ms.def * 8 + Math.round(ms.crit * 400 * ms.critDmg);
    for (const id of this.state.deployed) {
      const ds = this.getDiscipleStats(id);
      if (ds) p += ds.atk * 3.5 + ds.maxHp * 0.25 + ds.defStat * 4;
    }
    for (const sid of this.state.equippedSkills) {
      p += (this.state.skillLvs[sid] || 1) * 35;
    }
    return Math.round(p);
  }

  // ==================== UPGRADES, REALMS, SKILLS, DISCIPLES ====================
  getTrainCost(id) {
    const def = this.data.game.train.find(x => x.id === id);
    const lv = this.state.train[id] || 0;
    return Math.round(def.costBase + lv * def.costStep);
  }

  upgradeStat(id, count = 1) {
    const realmCap = this.data.game.realms[this.state.realmIdx].cap;
    const def = this.data.game.train.find(x => x.id === id);
    let done = 0;
    for (let i = 0; i < count; i++) {
      const lv = this.state.train[id] || 0;
      if (lv >= realmCap) break;
      if (def.maxVal > 0 && def.baseVal + lv * def.perLv >= def.maxVal) break;
      const cost = this.getTrainCost(id);
      if (this.state.coin < cost) break;
      this.state.coin -= cost;
      this.state.train[id] = lv + 1;
      this.state.season.stats.train++;
      done++;
    }
    if (done > 0) {
      this.audio.playSfx('levelup', 0.7);
      this.refreshAllyStatsInCombat();
      this.checkFeats();
      if (this.onUiDirty) this.onUiDirty();
      return true;
    }
    this.audio.playSfx('ui_deny', 0.6);
    return false;
  }

  canBreakthroughRealm() {
    const nextIdx = this.state.realmIdx + 1;
    if (nextIdx >= this.data.game.realms.length) return { ok: false, reason: 'Đã đạt đỉnh phong Hóa Thần' };
    const nextR = this.data.game.realms[nextIdx];
    if (this.state.maxStage < nextR.needStage) {
      return { ok: false, reason: `Cần vượt Ải ${nextR.needStage}` };
    }
    if (this.state.pill < nextR.pill) {
      return { ok: false, reason: `Cần ${nextR.pill} Đan Dược` };
    }
    return { ok: true, nextR };
  }

  startRealmShadowDuel() {
    const chk = this.canBreakthroughRealm();
    if (!chk.ok) {
      this.toast(chk.reason);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.setupCombat('shadow');
    this.toast('Bước vào Lôi Kiếp Đài — Đánh bại Thiên Kiếp Ma Ảnh để đột phá cảnh giới!');
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  learnOrUpgradeSkill(skillId) {
    const sk = this.data.game.fight.skills.find(s => s.id === skillId);
    if (!sk) return false;
    if (!this.state.learnedSkills.includes(skillId)) {
      const reqRealm = sk.realm || 0;
      const cost = sk.cost || 8;
      if (this.state.realmIdx < reqRealm) {
        const rName = this.data.game.realms[reqRealm].name;
        this.toast(`Cần đạt cảnh giới ${rName} để lĩnh ngộ!`);
        this.audio.playSfx('ui_deny');
        return false;
      }
      if (this.state.scroll < cost) {
        this.toast(`Cần ${cost} Ngọc Giản để lĩnh ngộ!`);
        this.audio.playSfx('ui_deny');
        return false;
      }
      this.state.scroll -= cost;
      this.state.learnedSkills.push(skillId);
      this.state.skillLvs[skillId] = 1;
      const maxSlots = this.getUnlockedSkillSlots();
      const emptyIdx = this.state.equippedSkills.findIndex((x, i) => !x && i < maxSlots);
      if (emptyIdx >= 0) this.state.equippedSkills[emptyIdx] = skillId;
      this.audio.playSfx('levelup');
      this.toast(`Đã lĩnh ngộ tuyệt học: ${sk.name}!`);
      if (this.onUiDirty) this.onUiDirty();
      return true;
    } else {
      const slvCfg = this.data.game.skillLv;
      const cap = slvCfg.capByRealm[this.state.realmIdx] || 10;
      const curLv = this.state.skillLvs[skillId] || 1;
      if (curLv >= cap) {
        this.toast('Đã đạt giới hạn cấp võ công của cảnh giới hiện tại!');
        this.audio.playSfx('ui_deny');
        return false;
      }
      const cost = slvCfg.costBase + (curLv - 1) * slvCfg.costStep;
      if (this.state.scroll < cost) {
        this.toast(`Cần ${cost} Ngọc Giản để tinh luyện!`);
        this.audio.playSfx('ui_deny');
        return false;
      }
      this.state.scroll -= cost;
      this.state.skillLvs[skillId] = curLv + 1;
      this.state.season.stats.skill++;
      this.audio.playSfx('levelup', 0.75);
      if (this.onUiDirty) this.onUiDirty();
      return true;
    }
  }

  equipSkill(skillId, slotIdx) {
    if (!this.state.learnedSkills.includes(skillId)) return;
    if (slotIdx < 0 || slotIdx >= this.getUnlockedSkillSlots()) {
      this.toast(`Ô Kỹ Năng ${slotIdx + 1} chưa mở khóa — Hoàn thành Chỉ Dẫn để mở!`);
      this.audio.playSfx('ui_deny');
      return;
    }
    const prevIdx = this.state.equippedSkills.indexOf(skillId);
    if (prevIdx >= 0) {
      this.state.equippedSkills[prevIdx] = this.state.equippedSkills[slotIdx] || null;
    }
    this.state.equippedSkills[slotIdx] = skillId;
    this.audio.playSfx('ui_click');
    if (this.onUiDirty) this.onUiDirty();
  }

  recruitDisciples(count = 1) {
    const rec = this.data.game.recruit;
    const cost = count === 10 ? rec.costTen : rec.costOne;
    if (this.state.jade < cost) {
      this.toast(`Không đủ Tiên Ngọc (Cần ${cost} Tiên Ngọc)!`);
      this.audio.playSfx('ui_deny');
      return null;
    }
    this.state.jade -= cost;
    const results = [];
    let highGradeFound = false;

    for (let i = 0; i < count; i++) {
      this.state.recruitTotal++;
      this.state.recruitPity++;
      this.state.season.stats.recruit++;

      let lvEntry = rec.levels[0];
      for (const l of rec.levels) {
        if (this.state.recruitTotal >= l.need) lvEntry = l;
      }

      let grade = 0;
      if (this.state.recruitPity >= rec.pity) {
        grade = rec.pityGrade;
        this.state.recruitPity = 0;
      } else {
        const totalW = lvEntry.odds.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalW;
        for (let g = 0; g < lvEntry.odds.length; g++) {
          r -= lvEntry.odds[g];
          if (r <= 0) { grade = g; break; }
        }
        if (grade >= rec.pityGrade) this.state.recruitPity = 0;
      }
      if (grade >= 3) highGradeFound = true;

      const pool = this.data.game.disciples.filter(d => d.grade === grade);
      const picked = pool[Math.floor(Math.random() * pool.length)] || this.data.game.disciples[0];
      const isNew = !this.state.disciples[picked.id];
      if (isNew) {
        this.state.disciples[picked.id] = { lv: 1, stars: 0, shards: 0 };
        if (this.state.deployed.length < this.data.game.start.deploySlots) {
          this.state.deployed.push(picked.id);
        }
      } else {
        this.state.disciples[picked.id].shards += rec.dupShard;
      }
      results.push({ disciple: picked, isNew });
    }

    if (highGradeFound) {
      this.audio.playSfx('recruit_gold');
      this.audio.playVoice('narrator_recruit_gold');
    } else {
      this.audio.playSfx('recruit');
    }
    const firstNew = results.find(r => r.isNew);
    if (firstNew) {
      this.audio.playVoice(`${firstNew.disciple.id}_join`);
    }
    this.setupCombat(this.combat ? this.combat.mode : 'field', true);
    this.checkFeats();
    if (this.onUiDirty) this.onUiDirty();
    return results;
  }

  levelUpDisciple(id) {
    const st = this.state.disciples[id];
    if (!st) return false;
    const dlv = this.data.game.discipleLv;
    const cap = dlv.capByStar[Math.min(4, st.stars)];
    if (st.lv >= cap) {
      this.toast('Đã đạt cấp tối đa — Hãy Thăng Sao để mở giới hạn!');
      return false;
    }
    const cost = Math.round(dlv.costBase + (st.lv - 1) * dlv.costStep);
    if (this.state.xp < cost) {
      this.toast(`Cần ${cost} điểm Tu Luyện!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.xp -= cost;
    st.lv++;
    this.audio.playSfx('levelup', 0.75);
    this.refreshAllyStatsInCombat();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  starUpDisciple(id) {
    const st = this.state.disciples[id];
    if (!st || st.stars >= 4) return false;
    const need = this.data.game.recruit.starNeed[st.stars];
    if (st.shards < need) {
      this.toast(`Cần ${need} Mảnh Sao cùng đệ tử!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    st.shards -= need;
    st.stars++;
    this.audio.playSfx('recruit_gold', 0.85);
    this.refreshAllyStatsInCombat();
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  hasPact(id) {
    if (!this.state || !Array.isArray(this.state.pacts)) return false;
    const low = String(id || '').toLowerCase();
    return this.state.pacts.some(p => String(p).toLowerCase() === low);
  }

  getMaxDeploySlots() {
    const base = (this.data && this.data.game && this.data.game.start && this.data.game.start.deploySlots) || 4;
    return this.hasPact('few') ? Math.min(3, base) : base;
  }

  getMaxSalves() {
    const exp = (this.data && this.data.jianghu && this.data.jianghu.exp) || {};
    const phLv = (this.state && this.state.halls && this.state.halls.pharmacy && this.state.halls.pharmacy.lv) || 0;
    const base = Math.min(exp.salveCap || 5, (exp.salveBase || 2) + Math.floor(phLv / (exp.salvePerLv || 4)));
    return this.hasPact('nosalve') ? Math.max(0, base - 2) : base;
  }

  toggleDeployDisciple(id) {
    if (!this.state.disciples[id]) return;
    const idx = this.state.deployed.indexOf(id);
    if (idx >= 0) {
      this.state.deployed.splice(idx, 1);
      this.audio.playSfx('ui_click');
    } else {
      const maxSlots = this.getMaxDeploySlots();
      while (this.state.deployed.length >= maxSlots) {
        this.state.deployed.shift();
      }
      this.state.deployed.push(id);
      this.audio.playVoice(`${id}_deploy_1`);
    }
    this.setupCombat(this.combat ? this.combat.mode : 'field', true);
    if (this.onUiDirty) this.onUiDirty();
  }

  // ==================== SECT COURTYARD HALLS ====================
  getHallUpgradeCost(id) {
    const def = this.data.game.halls.find(h => h.id === id);
    const st = this.state.halls[id];
    return Math.round(def.costBase * Math.pow(def.costMul, st.lv));
  }

  getHallBuildSec(id) {
    const def = this.data.game.halls.find(h => h.id === id);
    const st = this.state.halls[id];
    return Math.max(8, Math.round(def.secBase * Math.pow(def.secMul, Math.min(8, st.lv)) * 0.35));
  }

  getHallHourlyRate(id) {
    const def = this.data.game.halls.find(h => h.id === id);
    const st = this.state.halls[id];
    if (!def || !def.res || st.lv <= 0) return 0;
    let base = def.prodStep > 0
      ? def.prodBase + (st.lv - 1) * def.prodStep
      : def.prodBase * Math.pow(def.prodMul, st.lv - 1);

    let workerBonus = 0;
    for (const wid of (st.workers || [])) {
      const dDef = this.data.game.disciples.find(x => x.id === wid);
      const dSt = this.state.disciples[wid];
      if (dDef && dSt) {
        const gWork = this.data.game.grades[dDef.grade].work;
        workerBonus += gWork * (1 + dSt.stars * 0.25);
      }
    }
    const vipHallTbl = [0, 0.04, 0.08, 0.12, 0.16, 0.22, 0.28, 0.35, 0.44, 0.55, 0.70];
    const vipHallB = (vipHallTbl[Math.min(10, Math.max(0, (this.state && this.state.vipLv) || 0))] || 0) + (this.state && this.state.noAds ? 0.20 : 0);
    const hallMod = 1 + workerBonus + this.getDoctrineVal('hall') + this.getGuildBonus('hall') + this.getFameModVal('hall') + vipHallB;
    return Math.round(base * hallMod * 10) / 10;
  }

  startBuildHall(id) {
    const def = this.data.game.halls.find(h => h.id === id);
    const st = this.state.halls[id];
    if (!def || def.locked) {
      this.toast('Luyện Khí Đường sẽ mở trong bản cập nhật trang bị!');
      return false;
    }
    if (st.buildEnd > Date.now()) {
      this.toast('Điện các này đang được thi công!');
      return false;
    }
    const mainLv = this.state.halls.main.lv;
    if (id !== 'main' && st.lv >= mainLv) {
      this.toast(`Cần nâng cấp Tông Chủ Điện lên Lv.${mainLv + 1} trước!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    if (st.lv >= def.maxLv) {
      this.toast('Đã đạt cấp tối đa!');
      return false;
    }
    const qMain = (this.data.game.town && this.data.game.town.queueMain) || [1, 5];
    const maxQueue = mainLv >= (qMain[1] || 5) ? 2 : 1;
    const activeBuilds = Object.values(this.state.halls).filter(h => h.buildEnd > Date.now()).length;
    if (activeBuilds >= maxQueue) {
      this.toast(`Hàng đợi xây dựng đã đầy (${activeBuilds}/${maxQueue})!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    const cost = this.getHallUpgradeCost(id);
    if (this.state.coin < cost) {
      this.toast(`Không đủ Linh Thạch (Cần ${cost.toLocaleString()})!`);
      this.audio.playSfx('ui_deny');
      return false;
    }
    this.state.coin -= cost;
    st.buildEnd = Date.now() + this.getHallBuildSec(id) * 1000;
    this.audio.playSfx('ui_click');
    this.toast(`Bắt đầu tu sửa ${def.name}!`);
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  collectHall(id) {
    const def = this.data.game.halls.find(h => h.id === id);
    const st = this.state.halls[id];
    if (!def || !st || st.stored < 1) return false;
    const amt = Math.floor(st.stored);
    st.stored -= amt;
    this.state[def.res] = (this.state[def.res] || 0) + amt;
    this.state.season.stats.collect++;
    this.audio.playSfx('collect');
    this.toast(`Thu hoạch ${def.name}: +${amt.toLocaleString()}!`);
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  assignHallWorker(hallId, discipleId) {
    const def = this.data.game.halls.find(h => h.id === hallId);
    const st = this.state.halls[hallId];
    if (!def || !st || def.slots <= 0) return;
    // Remove from any other hall first
    for (const h of Object.values(this.state.halls)) {
      h.workers = (h.workers || []).filter(x => x !== discipleId);
    }
    const tCfg = this.data.game.town || {};
    const maxSlots = def.slots + (this.state.halls.dorm.lv > 0 ? (tCfg.workerPerDorm || 1) : 0);
    if (st.workers.length >= maxSlots) st.workers.shift();
    st.workers.push(discipleId);
    this.audio.playSfx('ui_click');
    if (this.onUiDirty) this.onUiDirty();
  }

  // ==================== REAL-TIME 3D COMBAT SIMULATION ====================
  setupCombat(mode = 'field', preserveWave = false, customOpts = {}) {
    const fCfg = this.data.game.fight;
    const ms = this.getMasterStats();
    const prev = preserveWave && this.combat ? this.combat : null;

    const masterUnit = {
      id: 'master',
      name: 'Tông Chủ',
      mesh: 'TT_Char_ThaiHu',
      tex: 'TT_Tex_Char_ThaiHu',
      weaponMesh: 'TT_Wp_IronJian',
      isAlly: true,
      isMaster: true,
      x: prev && prev.master ? prev.master.x : 0,
      z: prev && prev.master ? prev.master.z : 2.5,
      hp: prev && prev.master ? Math.min(ms.maxHp, prev.master.hp) : ms.maxHp,
      maxHp: ms.maxHp,
      atk: ms.atk,
      def: ms.def,
      crit: ms.crit,
      critDmg: ms.critDmg,
      speed: fCfg.master.speed,
      range: fCfg.master.range,
      rate: fCfg.master.rate,
      cd: 0,
      comboIdx: 0,
      guardT: 0,
      guardCut: 0,
      dodgeCd: 0,
      invulnT: 0,
      facing: prev && prev.master ? prev.master.facing : 0,
      moving: false,
      scale: 1.04,
      seed: 0.1,
      animT: 0,
      animDur: 0.3,
      flashT: 0,
      lunge: null,
      skillCds: prev && prev.master ? [...prev.master.skillCds] : [0, 0, 0, 0],
      ultCharge: prev && prev.master ? (prev.master.ultCharge || 0) : 0,
      ultMax: fCfg.ult.charge
    };

    const prevMateMap = {};
    if (prev && prev.mates) {
      for (const pm of prev.mates) prevMateMap[pm.id] = pm;
    }

    const maxParty = this.getMaxDeploySlots();
    const downHpRatio = (this.data && this.data.jianghu && this.data.jianghu.exp && this.data.jianghu.exp.downHp) || 0.25;
    const isExpOrRaid = (mode === 'jianghu' || mode === 'raid');
    const mates = this.state.deployed.slice(0, maxParty).map((did, idx) => {
      const ds = this.getDiscipleStats(did);
      if (!ds) return null;
      const isRanged = fCfg.mate.rangedWeapons.includes(ds.def.weapon);
      const meshName = did.charAt(0).toUpperCase() + did.slice(1);
      const ttOv = TT_DISCIPLE_MODEL[did];
      const pm = prevMateMap[did];
      const startHp = pm ? Math.min(ds.maxHp, pm.hp)
        : ((isExpOrRaid && this.state.injured && this.state.injured[did]) ? Math.max(1, Math.round(ds.maxHp * downHpRatio)) : ds.maxHp);
      return {
        id: did,
        name: ds.def.name,
        mesh: ttOv ? ttOv.mesh : meshName,
        tex: ttOv ? ttOv.tex : ((ds.def && ds.def.tex3d) ? ds.def.tex3d : `${meshName}_BaseColor`),
        weaponMesh: WEAPON_MESH_BY_ID[did] || '',
        isAlly: true,
        isMate: true,
        x: pm ? pm.x : masterUnit.x + (idx - 1.5) * 1.6,
        z: pm ? pm.z : Math.max(-1.8, masterUnit.z - 1.7),
        hp: startHp,
        maxHp: ds.maxHp,
        atk: ds.atk,
        def: ds.defStat,
        crit: 0.08,
        critDmg: 1.5,
        speed: fCfg.mate.speed,
        range: isRanged ? fCfg.mate.rangedRange : fCfg.mate.meleeRange,
        rate: fCfg.mate.rate,
        cd: Math.random() * 0.5,
        skillCd: 3 + idx * 1.5,
        facing: pm ? pm.facing : 0,
        moving: false,
        scale: 0.96,
        seed: (idx + 1) * 1.3,
        animT: 0,
        animDur: 0.35,
        flashT: 0
      };
    }).filter(Boolean);

    // Borrowed Guild Ally (chi viện từ Tiên Giới Minh!)
    const borrowId = this.state.guild && this.state.guild.borrowedId;
    if (borrowId && mode !== 'prologue' && mode !== 'shadow' && mode !== 'coop' && mode !== 'pvp_rt' && !mates.some(m => m.id === borrowId)) {
      const bDef = this.data.game.disciples.find(d => d.id === borrowId);
      if (bDef) {
        const ttOv = TT_DISCIPLE_MODEL[borrowId];
        const isRanged = fCfg.mate.rangedWeapons.includes(bDef.weapon);
        const bHp = Math.round(ms.maxHp * 0.95);
        mates.push({
          id: borrowId,
          name: `[Minh Viện] ${bDef.name}`,
          mesh: ttOv ? ttOv.mesh : 'TT_Char_VanHon',
          tex: ttOv ? ttOv.tex : 'TT_Tex_Char_HuyenThien',
          weaponMesh: WEAPON_MESH_BY_ID[borrowId] || '',
          isAlly: true,
          isMate: true,
          isBorrowed: true,
          x: masterUnit.x + 2.2,
          z: Math.max(-1.8, masterUnit.z - 1.8),
          hp: bHp,
          maxHp: bHp,
          atk: Math.round(ms.atk * 0.85),
          def: Math.round(ms.def * 0.8),
          crit: 0.14,
          critDmg: 1.7,
          speed: fCfg.mate.speed * 1.05,
          range: isRanged ? fCfg.mate.rangedRange : fCfg.mate.meleeRange,
          rate: fCfg.mate.rate,
          cd: 0.3,
          skillCd: 2.5,
          facing: 0,
          moving: false,
          scale: 1.0,
          seed: 7.7,
          animT: 0,
          animDur: 0.35,
          flashT: 0
        });
      }
    }

    // Real-time Co-op Party Peers rendered in 3D with their own Weapons, Wings & Auras!
    if (mode === 'coop' && customOpts.peers && customOpts.peers.length) {
      const myUid = this.online && this.online.user ? String(this.online.user.id) : '';
      let pIdx = 0;
      for (const p of customOpts.peers) {
        if (String(p.id) === myUid) continue;
        const eqW = EQUIPMENT_DEF.find(e => e.id === p.weapon);
        const startX = (pIdx % 2 === 0 ? -2.2 : 2.2) * (1 + Math.floor(pIdx / 2) * 0.6);
        const startZ = 2.0 + Math.floor(pIdx / 2) * 1.4;
        mates.push({
          id: `coop_${p.id}`,
          coopUid: p.id,
          name: `[Đội] ${p.username}`,
          mesh: 'TT_Char_VanHon',
          tex: 'TT_Tex_Char_HuyenThien',
          weaponMesh: (eqW && eqW.ttMesh) || 'TT_Wp_ImmortalJian',
          cosmetics: p.cosmetics || { wing: 'wing_none', aura: 'aura_none' },
          isAlly: true,
          isMate: true,
          isCoopPeer: true,
          x: startX, z: startZ, targetX: startX, targetZ: startZ,
          hp: p.maxHp || 2000, maxHp: p.maxHp || 2000,
          atk: p.atk || 200, def: 20, crit: 0.1, critDmg: 1.5,
          speed: 4.5, range: 2.2, rate: 1.2, cd: 999, skillCd: 999,
          facing: 0, moving: false, scale: 1.02, seed: 3.1 + pIdx * 1.7,
          animT: 0, animDur: 0.4, flashT: 0
        });
        pIdx++;
      }
    }

    const stage = customOpts.stage || this.state.stage;
    const chapterIdx = Math.floor((stage - 1) / 10);
    const gateInChap = ((stage - 1) % 10) + 1;
    const isBossGate = mode === 'field' ? (gateInChap === 10 || !!customOpts.forceBoss) : (mode !== 'prologue');

    const xianxiaChapZones = ['camp', 'grove', 'ford', 'pass', 'ridge', 'gate'];
    const clampedChap = Math.max(0, chapterIdx) % xianxiaChapZones.length;
    let zoneId = xianxiaChapZones[clampedChap];
    if (mode === 'prologue') zoneId = 'camp';
    else if (mode === 'tower') zoneId = 'tower';
    else if (mode === 'shadow' || mode === 'pvp_rt' || mode === 'arena') zoneId = 'shadow';
    else if (mode === 'worldBoss' || mode === 'coop') zoneId = 'gate';
    else if (isBossGate && chapterIdx === 0) zoneId = 'ford';
    const zoneDef = prev && prev.zoneDef ? prev.zoneDef : (fCfg.zones.find(z => z.id === zoneId) || fCfg.zones[0]);

    const breaks = prev && prev.breaks
      ? prev.breaks
      : (zoneDef.breaks || []).map(b => ({ ...b, curHp: b.hp || 10 }));

    const proGoal = (this.data.story && this.data.story.chapters && this.data.story.chapters[0] && this.data.story.chapters[0].fight) || 3;

    const jhNodeWaves = (this.data.jianghu && this.data.jianghu.nodeWaves) || [12, 13, 15];
    const raidWaves = (this.data.jianghu && this.data.jianghu.raid && this.data.jianghu.raid.waves) || [12, 14];
    const computedKillsGoal = mode === 'prologue' ? proGoal
      : (mode === 'raid' ? raidWaves.reduce((a, b) => a + b, 0) * 0.55
      : (mode === 'jianghu' ? (customOpts.isWanderBoss ? 8 : Math.round(jhNodeWaves[Math.min(2, Math.floor((stage - 1) / 20))] || 13))
      : (isBossGate ? 14 : 18)));
    const defaultTimer = mode === 'jianghu' ? (customOpts.sec || (this.data.jianghu && this.data.jianghu.nodeSec) || 90)
      : (mode === 'raid' ? (customOpts.sec || (this.data.jianghu && this.data.jianghu.raid && this.data.jianghu.raid.sec) || 97)
      : ((mode === 'field' || mode === 'prologue') ? (isBossGate ? 60 : 0) : (customOpts.sec || 60)));

    this.combat = {
      mode, // 'prologue' | 'field' | 'shadow' | 'daily' | 'tower' | 'jianghu' | 'raid' | 'seasonBoss' | 'arena' | 'guildBoss'
      customOpts,
      stage,
      chapterIdx: Math.max(0, chapterIdx),
      regionIdx: Math.min(4, Math.max(0, chapterIdx - 1)),
      gateInChap,
      isBossGate,
      zoneDef,
      breaks,
      master: masterUnit,
      mates,
      foes: prev ? prev.foes : [],
      telegraphs: prev ? prev.telegraphs : [],
      zonesActive: prev ? prev.zonesActive : [],
      kills: prev ? prev.kills : 0,
      killsGoal: Math.max(3, Math.round(computedKillsGoal)),
      bossSpawned: prev ? prev.bossSpawned : false,
      usedSalve: prev ? !!prev.usedSalve : false,
      timer: defaultTimer,
      rageTimer: 0,
      spawnAcc: 0,
      waveIdx: prev ? prev.waveIdx : 0,
      comboCount: prev ? prev.comboCount : 0,
      comboResetT: 0,
      moveTarget: null,
      swordDomainT: 0,
      swordDomainCd: 4.0,
      swordDomainTick: 0,
      petCd: 2.5,
      dpsStats: { t: 0, master: 0, swordArray: 0, artifact: 0, pet: 0, mates: {} },
      ended: false
    };

    // Ensure allies start on valid dry ground inside zone bounds
    const mFixed = this.resolveZoneCollision(this.combat, masterUnit.x, masterUnit.z, 0.42);
    masterUnit.x = mFixed.x;
    masterUnit.z = mFixed.z;
    for (const mt of mates) {
      const p = this.resolveZoneCollision(this.combat, mt.x, mt.z, 0.42);
      mt.x = p.x;
      mt.z = p.z;
    }

    // Snap camera directly to new zone start when entering a fresh zone (no swooping across old map)
    if (!preserveWave && this.renderer && this.renderer.camTarget) {
      this.renderer.camTarget.x = masterUnit.x * 0.65;
      this.renderer.camTarget.z = masterUnit.z + 1.5;
    }

    // Switch Xianxia BGM per Town / Chapter / Tower / Arena / Boss!
    if (this.renderer.mode === 'town') {
      this.audio.playBgm('bgm_town');
    } else if (isBossGate || mode === 'shadow' || mode === 'seasonBoss' || mode === 'guildBoss') {
      this.audio.playBgm('bgm_boss');
    } else if (mode === 'tower') {
      this.audio.playBgm('bgm_tower');
    } else if (mode === 'arena') {
      this.audio.playBgm('bgm_arena');
    } else {
      this.audio.playBgm(`bgm_ch${Math.max(0, Math.min(5, chapterIdx || 0))}`);
    }

    // In 'prologue', pre-position the 3 debt collectors up the road (frozen during dialogue, no pop-in!)
    if (!preserveWave) {
      if (mode === 'prologue') {
        this.spawnPrologueFoes();
      } else if (mode === 'seasonBoss' || mode === 'guildBoss') {
        this.spawnWaveFoes(3);
        this.spawnBossOrLeader(true);
      } else if (mode === 'worldBoss' || mode === 'pvp_rt' || mode === 'coop') {
        this.spawnWaveFoes(1);
      } else {
        this.spawnWaveFoes(mode === 'shadow' ? 1 : (mode === 'arena' ? 1 : 6));
      }
    }
  }

  spawnPrologueFoes() {
    const c = this.combat;
    if (!c || c.mode !== 'prologue') return;
    if (c.foes.length > 0) return;
    const fCfg = this.data.game.fight;
    const spots = [
      { x: -1.6, z: 12.6 },
      { x: 0.3, z: 13.5 },
      { x: 2.1, z: 12.4 }
    ];
    for (let i = 0; i < spots.length; i++) {
      const sp = this.resolveZoneCollision(c, spots[i].x, spots[i].z, 0.42);
      const isEven = i % 2 === 0;
      c.foes.push({
        id: `pro_foe_${i}`,
        name: isEven ? 'Linh Khê Ngọc Thỏ' : 'Thanh La Sơn Hầu',
        codexId: 'minion',
        mesh: isEven ? 'TT_Mob_ThoLinh' : 'TT_Mob_KhiNui',
        tex: isEven ? 'TT_Tex_Mob_ThoLinh' : 'TT_Tex_Mob_KhiNui',
        weaponMesh: '',
        isMinion: true,
        x: sp.x,
        z: sp.z,
        hp: 85,
        maxHp: 85,
        atk: 4,
        def: 0,
        speed: fCfg.minion.speed * 0.9,
        range: fCfg.minion.range,
        rate: fCfg.minion.rate,
        cd: 0.6 + i * 0.2,
        scale: 0.92,
        seed: i * 1.4,
        statuses: {},
        animT: 0,
        flashT: 0
      });
    }
  }

  // ==================== ZONE COLLISION, RIVER/BRIDGE & WAYPOINT PATHFINDING ====================
  getZoneBounds(zoneDef) {
    const fCfg = this.data.game.fight;
    const ax = (fCfg && fCfg.arenaX) || 15;
    return {
      x0: zoneDef && zoneDef.x0 !== undefined ? zoneDef.x0 + 0.5 : -ax + 0.6,
      x1: zoneDef && zoneDef.x1 !== undefined ? zoneDef.x1 - 0.5 : ax - 0.6,
      z0: zoneDef && zoneDef.z0 !== undefined ? zoneDef.z0 + 0.5 : ((fCfg && fCfg.arenaZMin) || -3) + 0.6,
      z1: zoneDef && zoneDef.z1 !== undefined ? zoneDef.z1 - 0.5 : ((fCfg && fCfg.arenaZMax) || 31) - 0.8
    };
  }

  getZoneObstacles(c) {
    const z = c && c.zoneDef;
    if (!z) return [];
    const out = [];
    if (z.walls) for (const w of z.walls) out.push(w);
    if (z.water) for (const w of z.water) out.push(w);
    if (c.breaks) {
      for (const b of c.breaks) {
        if (b.curHp > 0) out.push(b);
      }
    }
    return out;
  }

  pointHitsObstacle(x, z, r, obs) {
    if (obs.r !== undefined) {
      const dx = x - obs.x, dz = z - obs.z;
      const minD = obs.r + r;
      return (dx * dx + dz * dz) < (minD * minD);
    }
    const cx = Math.max(obs.x0, Math.min(obs.x1, x));
    const cz = Math.max(obs.z0, Math.min(obs.z1, z));
    const dx = x - cx, dz = z - cz;
    return (dx * dx + dz * dz) < (r * r);
  }

  resolveZoneCollision(c, x, z, r = 0.42) {
    const bnd = this.getZoneBounds(c && c.zoneDef);
    let px = Math.max(bnd.x0, Math.min(bnd.x1, x));
    let pz = Math.max(bnd.z0, Math.min(bnd.z1, z));
    const obsList = this.getZoneObstacles(c);

    for (let iter = 0; iter < 3; iter++) {
      for (const obs of obsList) {
        if (obs.r !== undefined) {
          const dx = px - obs.x, dz = pz - obs.z;
          const d = Math.hypot(dx, dz);
          const minD = obs.r + r;
          if (d < minD) {
            if (d > 1e-4) {
              px = obs.x + (dx / d) * minD;
              pz = obs.z + (dz / d) * minD;
            } else {
              px = obs.x + minD;
            }
          }
        } else {
          const cx = Math.max(obs.x0, Math.min(obs.x1, px));
          const cz = Math.max(obs.z0, Math.min(obs.z1, pz));
          const dx = px - cx, dz = pz - cz;
          const d2 = dx * dx + dz * dz;
          if (d2 < r * r) {
            if (d2 > 1e-6) {
              const d = Math.sqrt(d2);
              px = cx + (dx / d) * r;
              pz = cz + (dz / d) * r;
            } else {
              // Inside AABB: push out along nearest edge
              const dL = Math.abs(px - obs.x0), dR = Math.abs(obs.x1 - px);
              const dB = Math.abs(pz - obs.z0), dT = Math.abs(obs.z1 - pz);
              const m = Math.min(dL, dR, dB, dT);
              if (m === dL) px = obs.x0 - r;
              else if (m === dR) px = obs.x1 + r;
              else if (m === dB) pz = obs.z0 - r;
              else pz = obs.z1 + r;
            }
          }
        }
      }
      px = Math.max(bnd.x0, Math.min(bnd.x1, px));
      pz = Math.max(bnd.z0, Math.min(bnd.z1, pz));
    }
    return { x: px, z: pz };
  }

  hasClearLine(c, x0, z0, x1, z1, r = 0.36) {
    const obsList = this.getZoneObstacles(c);
    if (!obsList.length) return true;
    const dist = Math.hypot(x1 - x0, z1 - z0);
    const steps = Math.max(2, Math.ceil(dist / 0.55));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const sx = x0 + (x1 - x0) * t;
      const sz = z0 + (z1 - z0) * t;
      for (const obs of obsList) {
        if (this.pointHitsObstacle(sx, sz, r, obs)) return false;
      }
    }
    return true;
  }

  getZoneWaypoints(zoneDef) {
    const pts = [];
    if (zoneDef && zoneDef.nodes) {
      for (let i = 0; i + 1 < zoneDef.nodes.length; i += 2) {
        pts.push({ x: zoneDef.nodes[i], z: zoneDef.nodes[i + 1] });
      }
    }
    // Add explicit bridge, stair, and gap midpoints so pathing smoothly crosses every choke point
    if (zoneDef && zoneDef.id === 'ford') {
      pts.push({ x: 0.0, z: 9.2 });    // Bridge south entrance
      pts.push({ x: 0.0, z: 12.0 });   // Wooden bridge center
      pts.push({ x: 0.0, z: 14.8 });   // Bridge north exit
      pts.push({ x: 9.75, z: 12.0 });  // Shallow eastern ford center
    } else if (zoneDef && zoneDef.id === 'camp') {
      pts.push({ x: 8.8, z: 5.7 });    // Stream crossing west approach
      pts.push({ x: 13.8, z: 5.7 });   // Stream crossing east bank
    } else if (zoneDef && zoneDef.id === 'gate') {
      pts.push({ x: -7.25, z: 14.5 }); // Palisade western breach center
      pts.push({ x: 5.0, z: 14.5 });   // Main gate doorway center (passable once door breaks)
    } else if (zoneDef && zoneDef.id === 'pass') {
      pts.push({ x: 0.0, z: 16.0 });   // Cliff stairs center
    } else if (zoneDef && zoneDef.id === 'ridge') {
      pts.push({ x: 0.0, z: 10.5 });   // Ridge front stairs center
    } else if (zoneDef && zoneDef.id === 'tower') {
      pts.push({ x: 2.5, z: 14.5 });   // Dais stairs center
    }
    return pts;
  }

  findBlockingBreak(c, ux, uz, tx, tz, reach = 2.6) {
    if (!c || !c.breaks || !c.breaks.length) return null;
    const dist = Math.hypot(tx - ux, tz - uz);
    const steps = Math.max(2, Math.ceil(dist / 0.55));
    let bestBr = null, bestD = Infinity;
    for (const br of c.breaks) {
      if (br.curHp <= 0) continue;
      if (!this.pointHitsObstacle(ux, uz, reach, br)) continue;
      // Prefer barricades that lie directly on the line to target or closest to unit
      let blocksLine = false;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        if (this.pointHitsObstacle(ux + (tx - ux) * t, uz + (tz - uz) * t, 0.40, br)) {
          blocksLine = true;
          break;
        }
      }
      const bx = (br.x0 + br.x1) * 0.5, bz = (br.z0 + br.z1) * 0.5;
      const d = Math.hypot(bx - ux, bz - uz) - (blocksLine ? 4.0 : 0);
      if (d < bestD) { bestD = d; bestBr = br; }
    }
    return bestBr;
  }

  findNextWaypoint(c, sx, sz, tx, tz) {
    if (this.hasClearLine(c, sx, sz, tx, tz, 0.34)) {
      return { x: tx, z: tz };
    }
    const wps = this.getZoneWaypoints(c && c.zoneDef);
    if (!wps.length) return { x: tx, z: tz };

    // Graph nodes: 0 = start, 1..M = waypoints, M+1 = target
    const nodes = [{ x: sx, z: sz }, ...wps, { x: tx, z: tz }];
    const n = nodes.length;
    const goalIdx = n - 1;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const used = new Array(n).fill(false);
    dist[0] = 0;

    for (let iter = 0; iter < n; iter++) {
      let u = -1, best = Infinity;
      for (let i = 0; i < n; i++) {
        if (!used[i] && dist[i] < best) { best = dist[i]; u = i; }
      }
      if (u === -1 || u === goalIdx) break;
      used[u] = true;
      for (let v = 1; v < n; v++) {
        if (used[v]) continue;
        const d = Math.hypot(nodes[v].x - nodes[u].x, nodes[v].z - nodes[u].z);
        if (dist[u] + d < dist[v] && this.hasClearLine(c, nodes[u].x, nodes[u].z, nodes[v].x, nodes[v].z, 0.30)) {
          dist[v] = dist[u] + d;
          prev[v] = u;
        }
      }
    }

    let cur = goalIdx;
    if (prev[cur] === -1) {
      // Fallback: pick reachable waypoint strictly away from start (>0.65m) that gets closer to target!
      const startToGoal = Math.hypot(sx - tx, sz - tz);
      let bestIdx = -1, bestD = startToGoal - 0.15;
      for (let i = 1; i < goalIdx; i++) {
        if (dist[i] < Infinity) {
          const fromStart = Math.hypot(nodes[i].x - sx, nodes[i].z - sz);
          if (fromStart < 0.65) continue; // Never self-lock onto a waypoint we are already standing on!
          const d = Math.hypot(nodes[i].x - tx, nodes[i].z - tz);
          if (d < bestD) { bestD = d; bestIdx = i; }
        }
      }
      if (bestIdx === -1) return { x: tx, z: tz };
      cur = bestIdx;
    }
    while (prev[cur] > 0) cur = prev[cur];
    if (Math.hypot(nodes[cur].x - sx, nodes[cur].z - sz) < 0.22 && cur !== goalIdx) {
      return { x: tx, z: tz };
    }
    return nodes[cur];
  }

  steerUnitToward(c, unit, tx, tz, speed, dt, radius = 0.42) {
    let wp = this.findNextWaypoint(c, unit.x, unit.z, tx, tz);
    let dx = wp.x - unit.x, dz = wp.z - unit.z;
    let d = Math.hypot(dx, dz);
    if (d < 0.05) {
      dx = tx - unit.x; dz = tz - unit.z;
      d = Math.hypot(dx, dz);
      if (d < 0.05) {
        unit.moving = false;
        return;
      }
    }
    const step = Math.min(d, speed * dt);
    const dirX = dx / d, dirZ = dz / d;
    const oldX = unit.x, oldZ = unit.z;
    let bestPos = this.resolveZoneCollision(c, oldX + dirX * step, oldZ + dirZ * step, radius);
    let bestMoved = Math.hypot(bestPos.x - oldX, bestPos.z - oldZ);

    // Tangent wall-sliding recovery: if direct step snags on a bridge rail, cliff corner, tree, or ledge, glide smoothly around it!
    if (bestMoved < step * 0.30 && step > 0.005) {
      const baseAng = Math.atan2(dirX, dirZ);
      const sgn = unit._slideDir || 1;
      const offsets = [sgn * 0.65, -sgn * 0.65, sgn * 1.18, -sgn * 1.18, sgn * 1.65, -sgn * 1.65];
      let bestScore = -1e9;
      let chosenSign = sgn;
      for (let k = 0; k < offsets.length; k++) {
        const off = offsets[k];
        const a = baseAng + off;
        const cand = this.resolveZoneCollision(c, oldX + Math.sin(a) * step, oldZ + Math.cos(a) * step, radius);
        const mv = Math.hypot(cand.x - oldX, cand.z - oldZ);
        if (mv > step * 0.25) {
          const progress = (Math.hypot(tx - oldX, tz - oldZ) - Math.hypot(tx - cand.x, tz - cand.z));
          const score = mv * 0.8 + progress * 1.4 - Math.abs(off) * 0.04;
          if (score > bestScore) {
            bestScore = score;
            bestPos = cand;
            bestMoved = mv;
            chosenSign = off >= 0 ? 1 : -1;
          }
        }
      }
      unit._slideDir = chosenSign;
    }

    unit.x = bestPos.x;
    unit.z = bestPos.z;
    const moveDx = unit.x - oldX, moveDz = unit.z - oldZ;
    const faceAng = (Math.hypot(moveDx, moveDz) > 0.004) ? Math.atan2(moveDx, moveDz) : Math.atan2(dx, dz);
    unit.facing = this.lerpAngle(unit.facing || 0, faceAng, Math.min(1, dt * 14));
    unit.moving = true;
  }

  refreshAllyStatsInCombat() {
    if (!this.combat || !this.combat.master) return;
    const ms = this.getMasterStats();
    const ratio = this.combat.master.hp / Math.max(1, this.combat.master.maxHp);
    this.combat.master.maxHp = ms.maxHp;
    this.combat.master.hp = Math.max(1, Math.round(ms.maxHp * ratio));
    this.combat.master.atk = ms.atk;
    this.combat.master.def = ms.def;
    this.combat.master.crit = ms.crit;
    this.combat.master.critDmg = ms.critDmg;
  }

  getEnemyScaleForStage(stage) {
    const fCfg = this.data.game.fight;
    const chap = Math.floor((stage - 1) / 10);
    const gate = (stage - 1) % 10;
    const gGrows = fCfg.foeGateGrows || [1.06, 1.06, 1.16, 1.1, 1.1, 1.1];
    const gGrow = (gGrows[Math.min(gGrows.length - 1, chap)] || 1.08) * 1.02;
    // Rebalanced difficulty curve accounting for Sword Array, 3 Artifacts, 4 Spirit Pets, Equipment Sets & 12 Disciple skills!
    const rosterRampHp = 1.22 + Math.min(0.78, Math.max(0, stage - 1) * 0.045);
    const rosterRampAtk = 1.18 + Math.min(0.62, Math.max(0, stage - 1) * 0.032);
    const pactHpMul = this.hasPact('strong') ? 1.30 : 1.0;
    const lapMods = this.getLapMods();
    const hpMul = rosterRampHp * Math.pow(2.75, chap) * Math.pow(gGrow, gate) * lapMods.foeHpMul * pactHpMul;
    const atkMul = rosterRampAtk * Math.pow(1.92, chap) * Math.pow(1.07, gate) * (1 + lapMods.lapIdx * 0.16);
    const insightCut = this.combat && this.combat.mode === 'field' ? Math.max(0.58, 1 - this.state.insight) : 1;
    return { hpMul: hpMul * insightCut, atkMul: atkMul * insightCut };
  }

  lerpAngle(cur, target, t) {
    let diff = ((target - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return cur + diff * Math.min(1, t);
  }

  getActiveFightPlan(c) {
    const fCfg = this.data.game.fight;
    const plans = fCfg.plans || [];
    let planId = 'g1';
    if (c.mode === 'shadow') planId = 'shadow';
    else if (c.mode === 'tower') planId = 'tower';
    else if (c.mode === 'daily') planId = `daily.${c.customOpts.dailyId || 'coin'}`;
    else if (c.mode === 'seasonBoss' || c.mode === 'guildBoss') planId = 'raid';
    else if (c.isBossGate) planId = 'boss';
    else {
      const gp = fCfg.gatePlans || ['g1'];
      planId = gp[(c.gateInChap - 1) % gp.length] || 'g1';
    }
    return plans.find(p => p.id === planId) || plans[0];
  }

  pickLaneSpot(laneId, master) {
    const c = this.combat;
    const zLanes = (c && c.zoneDef && c.zoneDef.lanes) || [];
    const gLanes = this.data.game.fight.lanes || [];
    const lane = zLanes.find(l => l.id === laneId) || gLanes.find(l => l.id === laneId);
    if (lane) {
      const sx = lane.x0 + Math.random() * Math.max(0.4, lane.x1 - lane.x0);
      const sz = lane.z0 + Math.random() * Math.max(0.4, lane.z1 - lane.z0);
      return this.resolveZoneCollision(c, sx, sz, 0.55);
    }
    return this.resolveZoneCollision(c, master.x + (Math.random() - 0.5) * 6, master.z + 8 + Math.random() * 3, 0.55);
  }

  spawnWaveFoes(count = 4) {
    const c = this.combat;
    if (!c || c.ended) return;
    const fCfg = this.data.game.fight;
    const sc = this.getEnemyScaleForStage(c.stage);

    if (c.mode === 'shadow') {
      if (c.bossSpawned) return;
      c.bossSpawned = true;
      const ms = this.getMasterStats();
      const easeMul = Math.max(this.data.jianghu.shadow.floor, 1 - this.state.shadowLosses * this.data.jianghu.shadow.ease);
      c.foes.push({
        id: 'shadow_boss',
        name: 'Thiên Kiếp Ma Ảnh Bản Ngã',
        codexId: 'boss',
        mesh: 'TT_Char_ThaiHu',
        tex: 'TT_Tex_Char_ThaiHu',
        weaponMesh: 'TT_Wp_ImmortalJian',
        tint: [0.42, 0.28, 0.58],
        isBoss: true,
        x: 0.5,
        z: 12.5,
        hp: Math.round(ms.maxHp * 2.2 * easeMul),
        maxHp: Math.round(ms.maxHp * 2.2 * easeMul),
        atk: Math.round(ms.atk * 1.15 * easeMul),
        def: Math.round(ms.def * 0.6),
        speed: 3.1,
        range: 2.1,
        rate: 1.4,
        cd: 1.0,
        heavyCd: 5.5,
        scale: 1.18,
        seed: 3.3,
        statuses: {},
        animT: 0,
        flashT: 0
      });
      return;
    }

    if (c.mode === 'worldBoss') {
      if (c.bossSpawned) return;
      c.bossSpawned = true;
      const wb = c.customOpts.bossInfo || { name: 'Thái Cổ Huyết Lôi Ma Đế', lv: 1, hp: 2500000, maxHp: 2500000 };
      const ms = this.getMasterStats();
      c.wbDmgAcc = 0;
      c.wbFlushT = 0;
      c.foes.push({
        id: 'world_boss',
        name: `${wb.name} Lv.${wb.lv}`,
        codexId: 'boss',
        mesh: 'TT_Boss_KyLan',
        tex: 'TT_Tex_Boss_KyLan',
        weaponMesh: '',
        isBoss: true,
        isWorldBoss: true,
        x: 0,
        z: 13.0,
        hp: Math.max(1000, wb.hp || 2500000),
        maxHp: Math.max(1000, wb.maxHp || 2500000),
        atk: Math.max(25, Math.round(ms.atk * 0.45)),
        def: Math.round(12 + (wb.lv || 1) * 6),
        speed: 2.8,
        range: 2.5,
        rate: 1.5,
        cd: 1.0,
        heavyCd: 5.0,
        scale: 1.48,
        seed: 5.5,
        statuses: {},
        animT: 0,
        flashT: 0
      });
      this.audio.playBgm('bgm_boss');
      return;
    }

    if (c.mode === 'pvp_rt') {
      if (c.bossSpawned) return;
      c.bossSpawned = true;
      const opp = c.customOpts.opp || { username: 'Đối Thủ', sectName: 'Tiên Môn', maxHp: 2000, atk: 120, weapon: 'wp_iron_jian' };
      const eqDef = EQUIPMENT_DEF.find(e => e.id === opp.weapon) || EQUIPMENT_DEF[0];
      c.pkSyncT = 0;
      c.master.maxHp = (c.customOpts.me && c.customOpts.me.maxHp) || c.master.maxHp;
      c.master.hp = c.master.maxHp;
      c.master.x = c.customOpts.side === 0 ? -4.0 : 4.0;
      c.master.z = 8.0;
      c.foes.push({
        id: 'pvp_remote_opp',
        name: `${opp.username} (${opp.sectName})`,
        codexId: 'leader',
        mesh: 'TT_Char_VanHon',
        tex: 'TT_Tex_Char_HuyenThien',
        weaponMesh: (eqDef && eqDef.ttMesh) || 'TT_Wp_ImmortalJian',
        isBoss: true,
        isRemotePlayer: true,
        x: c.customOpts.side === 0 ? 4.0 : -4.0,
        z: 8.0,
        targetX: c.customOpts.side === 0 ? 4.0 : -4.0,
        targetZ: 8.0,
        hp: opp.maxHp || 2000,
        maxHp: opp.maxHp || 2000,
        atk: opp.atk || 120,
        def: 20,
        speed: 4.5,
        range: 2.2,
        rate: 1.2,
        cd: 999,
        heavyCd: 999,
        scale: 1.08,
        seed: 2.4,
        statuses: {},
        animT: 0,
        flashT: 0
      });
      this.audio.playBgm('bgm_arena');
      return;
    }

    if (c.mode === 'coop') {
      if (c.bossSpawned) return;
      c.bossSpawned = true;
      const b = c.customOpts.boss || { name: 'U Lam Ma Giao Vương', lv: 45, hp: 260000, maxHp: 260000, atk: 95 };
      c.coopDmgAcc = 0;
      c.coopFlushT = 0;
      c.coopSyncT = 0;
      c.foes.push({
        id: 'coop_boss',
        name: `${b.name} Lv.${b.lv}`,
        codexId: 'boss',
        mesh: 'TT_Boss_KyLan',
        tex: 'TT_Tex_Boss_KyLan',
        weaponMesh: '',
        isBoss: true,
        isCoopBoss: true,
        x: 0,
        z: 13.0,
        hp: Math.max(1000, b.hp || 260000),
        maxHp: Math.max(1000, b.maxHp || 260000),
        atk: b.atk || 95,
        def: 15,
        speed: 2.8,
        range: 2.5,
        rate: 1.5,
        cd: 1.0,
        heavyCd: 5.0,
        scale: 1.45,
        seed: 6.6,
        statuses: {},
        animT: 0,
        flashT: 0
      });
      this.audio.playBgm('bgm_boss');
      return;
    }

    if (c.mode === 'arena') {
      if (c.bossSpawned) return;
      c.bossSpawned = true;
      const foeMul = c.customOpts.foeMul || 1.0;
      const snap = c.customOpts.foeSnap || null;
      const ms = this.getMasterStats();
      const eqDef = snap && snap.weapon ? EQUIPMENT_DEF.find(e => e.id === snap.weapon) : null;
      const foeHp = snap && snap.maxHp ? Math.max(600, Math.round(snap.maxHp)) : Math.round(ms.maxHp * 1.8 * foeMul);
      const foeAtk = snap && snap.atk ? Math.max(30, Math.round(snap.atk)) : Math.round(ms.atk * 0.95 * foeMul);
      c.foes.push({
        id: 'arena_foe',
        name: c.customOpts.foeName || 'Cao Thủ Tiên Giới',
        codexId: 'leader',
        mesh: 'TT_Char_VanHon',
        tex: 'TT_Tex_Char_HuyenThien',
        weaponMesh: (eqDef && eqDef.ttMesh) || 'TT_Wp_ImmortalJian',
        isBoss: true,
        x: 0,
        z: 13.5,
        hp: foeHp,
        maxHp: foeHp,
        atk: foeAtk,
        def: snap && snap.def ? Math.round(snap.def) : Math.round(ms.def * 0.5),
        speed: 3.3,
        range: 2.0,
        rate: 1.2,
        cd: 0.8,
        heavyCd: 6.0,
        scale: 1.08,
        seed: 2.1,
        statuses: {},
        animT: 0,
        flashT: 0
      });
      return;
    }

    // Use APK fight.plans & directional fight.lanes so squads advance cleanly instead of random 360° scatter
    const plan = this.getActiveFightPlan(c);
    const waveList = (plan && plan.waves && plan.waves.length) ? plan.waves : ['camp'];
    const waveSpec = waveList[(c.waveIdx || 0) % waveList.length];
    c.waveIdx = (c.waveIdx || 0) + 1;
    const laneIds = waveSpec.split('+');
    const squadCenters = laneIds.map(lid => this.pickLaneSpot(lid, c.master));

    const activeTrait = this.getActiveTrait(c);
    const spawnCount = (activeTrait && !activeTrait.countered && activeTrait.count > 1)
      ? Math.round(count * activeTrait.count)
      : count;
    const traitHpMul = ((activeTrait && !activeTrait.countered && activeTrait.hp) ? activeTrait.hp : 1.0) * (c.customOpts.routeHpMul || 1.0);
    const traitAtkMul = ((activeTrait && !activeTrait.countered && activeTrait.atk) ? activeTrait.atk : 1.0) * (c.customOpts.routeAtkMul || 1.0);

    for (let i = 0; i < spawnCount; i++) {
      if (c.foes.filter(f => !f.dead).length >= 24) break;
      const ctr = squadCenters[i % squadCenters.length];
      const sp = this.resolveZoneCollision(c, ctr.x + (Math.random() - 0.5) * 2.6, ctr.z + (Math.random() - 0.5) * 2.6, 0.5);
      const sx = sp.x;
      const sz = sp.z;

      // 100% Biome-Matched Chibi 3D Xianxia Monsters (TT_CHAPTER_MOBS + Elite Spirit Beasts!)
      const chPool = TT_CHAPTER_MOBS[(c.chapterIdx || 0) % TT_CHAPTER_MOBS.length] || TT_CHAPTER_MOBS[0];
      const pick = chPool[Math.random() < 0.62 ? 0 : 1];
      let mesh = pick.mesh;
      let foeTex = pick.tex;
      let weaponMesh = '';
      let codexId = pick.codexId || 'minion';
      let name = pick.nm;
      let range = pick.r || fCfg.minion.range;
      let mobScale = pick.sc || 0.98;
      // Occasional elite spirit beast variety in higher waves!
      if (this.state.prologueDone && Math.random() < 0.14) {
        const isToad = Math.random() < 0.5;
        mesh = isToad ? 'TT_Mob_CocDoc' : 'TT_Mob_ThachKyLan';
        foeTex = isToad ? 'TT_Tex_Mob_CocDoc' : 'TT_Tex_Mob_ThachKyLan';
        codexId = isToad ? 'toxin' : 'monk';
        name = isToad ? 'Độc Đầm Yêu Thiềm' : 'Thạch Kỳ Lân Thủ Vệ';
        range = isToad ? 4.2 : 1.85;
        mobScale = 1.06;
      }

      const hp = Math.max(30, Math.round(fCfg.minion.hp * sc.hpMul * traitHpMul));
      const atk = Math.max(4, Math.round(fCfg.minion.atk * sc.atkMul * traitAtkMul));
      const foeDef = Math.round(3 + Math.max(0, c.stage - 1) * 1.5);
      c.foes.push({
        id: `m_${Date.now()}_${Math.random()}`,
        name,
        codexId,
        mesh,
        tex: foeTex,
        tint: null,
        weaponMesh,
        isMinion: true,
        scale: mobScale,
        x: sx,
        z: sz,
        hp,
        maxHp: hp,
        atk,
        def: foeDef,
        speed: fCfg.minion.speed * (0.94 + Math.random() * 0.2),
        range,
        rate: fCfg.minion.rate,
        cd: 0.35 + Math.random() * 0.55,
        seed: Math.random() * 6,
        statuses: {},
        animT: 0,
        flashT: 0
      });
    }
  }

  spawnBossOrLeader(isWarlord = true) {
    const c = this.combat;
    if (!c || c.bossSpawned) return;
    c.bossSpawned = true;
    c.moveTarget = null; // Clear any stale click-to-move so Master immediately engages Boss!
    const fCfg = this.data.game.fight;
    const sc = this.getEnemyScaleForStage(c.stage);
    const base = isWarlord ? fCfg.boss : fCfg.leader;
    const chIdx = Math.min(fCfg.duelists.length - 1, c.chapterIdx || 0);
    const duelist = fCfg.duelists[chIdx];
    const activeTrait = this.getActiveTrait(c);
    const traitBigHp = ((activeTrait && !activeTrait.countered && activeTrait.bigHp > 1) ? Math.min(2.6, activeTrait.bigHp) : ((activeTrait && !activeTrait.countered && activeTrait.hp) ? activeTrait.hp : 1.0)) * (c.customOpts.routeHpMul || 1.0);
    const traitBossAtk = ((activeTrait && !activeTrait.countered && (activeTrait.raidBossAtk || activeTrait.atk)) ? (activeTrait.raidBossAtk || activeTrait.atk) : 1.0) * (c.customOpts.routeAtkMul || 1.0);
    const hpMulExtra = c.mode === 'seasonBoss' ? 12 : (c.mode === 'guildBoss' ? 16 : (c.mode === 'raid' ? 1.55 : (isWarlord ? 1.38 : 1.18)));
    const rageAtkMul = (isWarlord && this.hasPact('rage')) ? 1.30 : 1.0;

    const hp = Math.round(base.hp * sc.hpMul * hpMulExtra * traitBigHp);
    const atk = Math.round(base.atk * sc.atkMul * rageAtkMul * traitBossAtk);
    const bossDef = Math.round((base.def || 8) + Math.max(0, c.stage - 1) * 3.6);

    const plan = this.getActiveFightPlan(c);
    const bossSpot = this.pickLaneSpot((plan && plan.leader) || 'pass', c.master);

    // Select Chapter-Matched Cel-Stylized 3D Xianxia Boss & Elite Leader (replaces recycled Bandits 100%!)
    let bossMesh = isWarlord ? 'TT_Boss_LinhKhe' : 'TT_Mob_ThachKyLan';
    let bossTex = isWarlord ? 'TT_Tex_Boss_LinhKhe' : 'TT_Tex_Mob_ThachKyLan';
    let bossWeap = '';
    let bossScale = isWarlord ? 1.28 : 1.18;
    if (!isWarlord) {
      const useToad = ((c.chapterIdx || 0) % 2) === 1;
      bossMesh = useToad ? 'TT_Mob_CocDoc' : 'TT_Mob_ThachKyLan';
      bossTex = useToad ? 'TT_Tex_Mob_CocDoc' : 'TT_Tex_Mob_ThachKyLan';
    } else {
      if (c.mode === 'seasonBoss' || c.mode === 'guildBoss') {
        bossMesh = 'TT_Boss_KyLan'; bossTex = 'TT_Tex_Boss_KyLan'; bossWeap = ''; bossScale = 1.36;
      } else if (c.mode === 'tower') {
        const fl = (c.customOpts && c.customOpts.towerFloor) || (this.state.towerFloor || 1);
        const tPool = [
          { mesh: 'TT_Boss_ThanhLa',  tex: 'TT_Tex_Boss_ThanhLa',  scale: 1.24 },
          { mesh: 'TT_Boss_BacHai',   tex: 'TT_Tex_Boss_BacHai',   scale: 1.28 },
          { mesh: 'TT_Boss_XichViem', tex: 'TT_Tex_Boss_XichViem', scale: 1.26 },
          { mesh: 'TT_Boss_VanKiem',  tex: 'TT_Tex_Boss_VanKiem',  scale: 1.24 },
          { mesh: 'TT_Boss_KyLan',    tex: 'TT_Tex_Boss_KyLan',    scale: 1.32 }
        ];
        const tp = tPool[Math.max(0, fl - 1) % tPool.length];
        bossMesh = tp.mesh; bossTex = tp.tex; bossWeap = ''; bossScale = tp.scale;
      } else {
        const cb = TT_CHAPTER_BOSSES[chIdx % TT_CHAPTER_BOSSES.length];
        if (cb) {
          bossMesh = cb.mesh; bossTex = cb.tex; bossWeap = ''; bossScale = cb.scale;
        }
      }
    }

    c.foes.push({
      id: 'stage_boss',
      name: c.customOpts.bossName || (isWarlord ? `${duelist.alias} · ${duelist.name}` : 'Yêu Tướng Trấn Ải'),
      codexId: isWarlord ? 'boss' : 'leader',
      mesh: bossMesh,
      tex: bossTex,
      weaponMesh: bossWeap,
      isBoss: isWarlord,
      isLeader: !isWarlord,
      duelistIdx: chIdx,
      x: bossSpot.x,
      z: bossSpot.z,
      hp,
      maxHp: hp,
      atk,
      def: bossDef,
      speed: base.speed,
      range: base.range,
      rate: base.rate,
      cd: 0.7,
      heavyCd: 4.5,
      scale: bossScale,
      seed: 4.2,
      statuses: {},
      animT: 0,
      flashT: 0
    });

    // Pact 'grudge' (Ân Oán): extra ambush squad arrives alongside the Boss!
    if (isWarlord && this.hasPact('grudge')) {
      this.spawnWaveFoes(3);
      this.toast('⚔ Thề Ước Ân Oán kích hoạt — Địch viện binh xuất hiện cùng Thủ Lĩnh!');
    }

    this.audio.playSfx('boss');
    if (isWarlord) {
      if (this.renderer) this.renderer.camZoomPulse = Math.max(this.renderer.camZoomPulse || 0, 0.45);
      this.audio.playBgm('bgm_boss');
      this.audio.playVoice('narrator_boss');
      this.toast(`⚠ Thủ Lĩnh xuất hiện: ${duelist.alias} ${duelist.name}!`);
      // Authentic APK Boss Pre-Duel Taunt Cutscene (skipped when Auto Boss is active so auto-push flows smoothly!)
      if (c.mode === 'field' && this.onStoryTrigger && duelist && !this.state.autoBoss) {
        const tauntKey = `__boss_taunt_${chIdx}`;
        const seenBefore = !!(this.state.seenScenes && this.state.seenScenes[tauntKey]);
        if (!this.state.seenScenes) this.state.seenScenes = {};
        this.state.seenScenes[tauntKey] = true;
        this.onStoryTrigger({
          title: `${CHAPTER_TITLES[chIdx] || 'Quyết Đấu Thủ Lĩnh'} · ${duelist.title}`,
          lines: [
            {
              who: `${duelist.alias} · ${duelist.name}`,
              fig: VILLAIN_FIG_BY_CHAPTER[chIdx] || '',
              text: seenBefore ? (duelist.tauntAgain || duelist.taunt) : duelist.taunt
            }
          ],
          doneLabel: 'Rút Kiếm Quyết Đấu!'
        });
      }
    }
  }

  useSalve() {
    const c = this.combat;
    if (!c || !c.master || c.master.dead) return false;
    if (this.state.salve <= 0) {
      this.toast('Đã hết Hồi Linh Đan — Tự động hồi thêm theo thời gian!');
      this.audio.playSfx('ui_deny');
      return false;
    }
    if (c.master.hp >= c.master.maxHp) return false;
    this.state.salve--;
    c.usedSalve = true;
    const healRatio = (this.data && this.data.jianghu && this.data.jianghu.exp && this.data.jianghu.exp.salveHeal) || 0.5;
    const heal = Math.round(c.master.maxHp * healRatio);
    c.master.hp = Math.min(c.master.maxHp, c.master.hp + heal);
    this.renderer.addPopup(c.master.x, 0.5, c.master.z, `+${heal} Sinh Lực`, '#62f598', 1.2);
    this.audio.playSfx('collect');
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  // ==================== THÂN PHÁP LƯỚT NÉ (SPACE / HUD BUTTON, I-FRAME + 3D AFTERIMAGES) ====================
  performDodge() {
    const c = this.combat;
    if (!c || !c.master || c.master.dead || c.ended) return false;
    const m = c.master;
    if (m.dodgeCd > 0) {
      this.audio.playSfx('ui_deny');
      return false;
    }
    if (this.state.meditating) this.state.meditating = false;
    m.dodgeCd = 3.2;
    m.invulnT = 0.60;
    c.moveTarget = null;

    let dirAng = (m.facing || 0) + Math.PI * 0.55;
    let perfectDodge = false;
    for (const tel of (c.telegraphs || [])) {
      const d = Math.hypot(m.x - tel.x, m.z - tel.z);
      if (d <= (tel.r || tel.reach || 3.4) + 1.2) {
        dirAng = Math.atan2(m.x - tel.x, m.z - tel.z) + (Math.random() < 0.5 ? 0.35 : -0.35);
        perfectDodge = true;
        break;
      }
    }
    const sx = m.x, sz = m.z;
    const dest = this.resolveZoneCollision(c, sx + Math.sin(dirAng) * 4.2, sz + Math.cos(dirAng) * 4.2, 0.42);
    m.lunge = { sx, sz, tx: dest.x, tz: dest.z, t: 0, dur: 0.22 };
    m.facing = dirAng;
    m.animClip = 'SwordSlash';
    m.animDur = 0.28;
    m.animT = 0.28;

    if (this.renderer.spawnDashGhosts) this.renderer.spawnDashGhosts(sx, sz, dest.x, dest.z, dirAng);
    this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: sx, y: 0.12, z: sz, s0: 0.4, s1: 2.6, color: '#52fff0', dur: 0.32 });
    this.audio.playSfx('swing_0');
    if (perfectDodge) {
      m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.20);
      this.renderer.addPopup(dest.x, 1.35, dest.z, '⚡ NÉ HOÀN HẢO! +20% NỘ', '#ffe878', 1.25);
    } else {
      this.renderer.addPopup(dest.x, 1.2, dest.z, 'THÂN PHÁP!', '#64fff0', 1.08);
    }
    if (this.onUiDirty) this.onUiDirty();
    return true;
  }

  castSkillSlot(slotIdx, fromAuto = false) {
    const c = this.combat;
    if (!c || !c.master || c.master.dead || c.ended) return false;
    if (!fromAuto && this.state && this.state.meditating) this.state.meditating = false;
    if (slotIdx >= this.getUnlockedSkillSlots()) return false;
    const sid = this.state.equippedSkills[slotIdx];
    if (!sid) return false;
    if (c.master.skillCds[slotIdx] > 0) return false;

    const sk = this.data.game.fight.skills.find(s => s.id === sid);
    if (!sk) return false;

    const livingFoes = c.foes.filter(f => !f.dead);
    if (!livingFoes.length) return false;

    const reach = sk.reach || 4.0;
    const sorted = livingFoes.slice().sort((a, b) =>
      Math.hypot(a.x - c.master.x, a.z - c.master.z) - Math.hypot(b.x - c.master.x, b.z - c.master.z)
    );
    const bossFoe = sorted.find(f => f.isBoss && Math.hypot(f.x - c.master.x, f.z - c.master.z) <= reach + 3.2);
    const target = bossFoe || sorted[0];
    const targetDist = Math.hypot(target.x - c.master.x, target.z - c.master.z);

    // Wait until Master runs into proper combat distance when auto-casting (prevents cross-map snap/whiff)
    const engageDist = (sk.shape === 'dash' || sk.shape === 'leap')
      ? Math.max(reach + 1.4, 5.2)
      : Math.max(reach + 0.9, 3.6);
    if (fromAuto && targetDist > engageDist) return false;

    const ms = this.getMasterStats();
    const lapMods = this.getLapMods();
    const gearCdr = (ms.gearTotals && ms.gearTotals.cdr) || 0;
    const cdMul = Math.max(0.35, (1 - (ms.reso.mods.famCd || 0) - this.getDoctrineVal('cd') - gearCdr) * lapMods.cdMul);
    c.master.skillCds[slotIdx] = sk.cd * cdMul;

    // Pay HP if Demonic Blood art
    if (sk.hpCost) {
      c.master.hp = Math.max(1, Math.round(c.master.hp * (1 - sk.hpCost)));
    }
    if (sk.guardSec) {
      c.master.guardT = sk.guardSec;
      c.master.guardCut = sk.guardCut || 0.4;
    }

    const angle = Math.atan2(target.x - c.master.x, target.z - c.master.z);
    c.master.facing = angle;

    // Select exact skeletal AnimationClip & aerial jump arc per Martial Art!
    const skClipMap = {
      whirl: 'SwordSpin', storm: 'SwordSpin', sweep: 'ChiefSpin',
      leap: 'SaberCharged', meteor: 'SaberCharged', quake: 'SaberCharged',
      heaven: 'SaberCharged', heaven_pressure: 'SaberCharged', blood_opening: 'SaberCharged',
      flash: 'SwordSlash', shadow: 'Combo', shadow_mark: 'Combo',
      aegis: 'Block', clear_counter: 'Block', palm: 'Punch', pull: 'Punch', united_seal: 'Combo'
    };
    c.master.animClip = skClipMap[sid] || sk.clip || 'Combo';
    c.master.animDur = (c.master.animClip === 'SwordSpin' || c.master.animClip === 'ChiefSpin') ? 0.72 : 0.56;
    c.master.animT = c.master.animDur;

    if (sid === 'leap' || sid === 'heaven_pressure') {
      c.master.jumpDur = 0.42;
      c.master.jumpT = 0.42;
    }

    // Smooth Dash / Leap movement (interpolated over time + collision-checked, never jumps into water/walls!)
    let impactX = c.master.x;
    let impactZ = c.master.z;
    if (sk.shape === 'dash' || sk.shape === 'leap') {
      const stepDist = Math.min(3.8, Math.max(0, targetDist - 1.0));
      if (stepDist > 0.35 && this.hasClearLine(c, c.master.x, c.master.z, c.master.x + Math.sin(angle) * stepDist, c.master.z + Math.cos(angle) * stepDist, 0.40)) {
        const dest = this.resolveZoneCollision(c, c.master.x + Math.sin(angle) * stepDist, c.master.z + Math.cos(angle) * stepDist, 0.42);
        c.master.lunge = {
          sx: c.master.x,
          sz: c.master.z,
          tx: dest.x,
          tz: dest.z,
          t: 0,
          dur: sk.shape === 'leap' ? 0.44 : 0.36
        };
        impactX = dest.x;
        impactZ = dest.z;
      }
    }

    // Skill Lv multiplier
    const slv = this.state.skillLvs[sid] || 1;
    const lvMul = 1 + (slv - 1) * this.data.game.skillLv.perLv;
    const formMul = 1 + (ms.form.skill || 0);
    const hits = sk.hits || 1;

    if (this.renderer.spawnSkillVfx) {
      this.renderer.spawnSkillVfx(sk, { ...c.master, x: impactX, z: impactZ }, target, angle);
    } else {
      const famColors = ['#66e3ff', '#ff5964', '#ffbe3d', '#82f2b8'];
      this.renderer.addSlashFx(impactX, impactZ, angle, reach * 0.65, famColors[sk.fam || 0], 'arc', 0.36);
    }
    this.audio.playSkillAudio(sid);

    if (sk.shape === 'zone') {
      c.zonesActive.push({ kind: 'storm', x: target.x, z: target.z, r: reach, t: 0, dur: sk.zoneSec || 3, tickAcc: 0, mul: sk.mul * lvMul });
    }

    // Check Heavy Blow Interrupt!
    let interrupted = false;
    for (let ti = c.telegraphs.length - 1; ti >= 0; ti--) {
      const tel = c.telegraphs[ti];
      if (tel.owner && !tel.owner.dead && Math.hypot(tel.owner.x - impactX, tel.owner.z - impactZ) <= reach + 2.2) {
        c.telegraphs.splice(ti, 1);
        tel.owner.statuses.daze = { t: 2.2 };
        interrupted = true;
        this.renderer.triggerShake(0.45, 0.25);
        this.renderer.addPopup(tel.owner.x, 1.0, tel.owner.z, 'CẮT ĐỨT!', '#ffe066', 1.45);
        this.audio.playSfx('overhaul_break');
      }
    }

    // Apply exact APK skill shape hitbox (line/dash corridor, cone arc, or radial circle/leap/zone)
    const fxDir = Math.sin(angle), fzDir = Math.cos(angle);
    const bleedCap = 3 + (ms.reso.mods.bleedMax || 0);
    const crossFamCombo = (c.master.lastSkillFam !== undefined && c.master.lastSkillFam !== sk.fam);
    c.master.lastSkillFam = sk.fam;
    let hitCount = 0;

    for (const f of livingFoes) {
      const rx = f.x - impactX, rz = f.z - impactZ;
      const dist = Math.hypot(rx, rz);
      let inArea = false;
      if (sk.shape === 'line' || sk.shape === 'dash') {
        const ox = f.x - c.master.x, oz = f.z - c.master.z;
        const along = ox * fxDir + oz * fzDir;
        const perp = Math.abs(ox * fzDir - oz * fxDir);
        const halfW = ((sk.width || 1.8) * 0.5) + 0.9;
        inArea = (along >= -0.8 && along <= reach + 1.0 && perp <= halfW) || dist <= 1.6;
      } else if (sk.shape === 'cone') {
        if (dist <= reach + 0.9) {
          const halfArc = ((sk.arc || 160) * 0.5) * Math.PI / 180;
          const fa = Math.atan2(rx, rz);
          const diff = Math.abs(((fa - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          inArea = diff <= halfArc || dist <= 1.4;
        }
      } else {
        inArea = dist <= reach + 1.0;
      }
      if (!inArea) continue;
      hitCount++;

      let totalMul = sk.mul * lvMul * formMul * hits;
      let exploited = false;

      if (sk.exploit && f.statuses[sk.exploit] && f.statuses[sk.exploit].t > 0) {
        totalMul *= (sk.exploitMul || 1.6);
        f.statuses[sk.exploit].t = 0;
        exploited = true;
      }

      if (sk.apply) {
        const durMap = {
          scar: 6,
          bleed: 4,
          break: 5 + (ms.reso.mods.breakSec || 0),
          daze: 1.5 + (ms.reso.mods.dazeSec || 0)
        };
        const prevStacks = (f.statuses[sk.apply] && f.statuses[sk.apply].stacks) || 0;
        f.statuses[sk.apply] = {
          t: durMap[sk.apply] || 4,
          stacks: Math.min(sk.apply === 'bleed' ? bleedCap : 5, prevStacks + (sk.stacks || 1))
        };
        f.hasStatus = true;
      }

      if (sk.pull) {
        const pf = this.resolveZoneCollision(c, f.x + (impactX - f.x) * 0.45, f.z + (impactZ - f.z) * 0.45, 0.42);
        f.x = pf.x;
        f.z = pf.z;
      } else if (sk.push) {
        const pa = Math.atan2(f.x - impactX, f.z - impactZ);
        const pf = this.resolveZoneCollision(c, f.x + Math.sin(pa) * 1.4, f.z + Math.cos(pa) * 1.4, 0.42);
        f.x = pf.x;
        f.z = pf.z;
      }

      this.dealDamage(c.master, f, totalMul, sk.critAdd || 0, exploited || interrupted);
    }

    const ultMul = 1 + (ms.reso.mods.ult || 0);
    const crossBonus = (crossFamCombo && hitCount > 0) ? 4 : 0; // APK: 다른 계통 무공 연계 궁극 +4
    c.master.ultCharge = Math.min(c.master.ultMax, c.master.ultCharge + (3 + (sk.ultBonus || 0) + crossBonus) * ultMul);
    return true;
  }

  castUltimate() {
    const c = this.combat;
    if (!c || !c.master || c.master.dead || c.ended) return false;
    if (!this.isUltUnlocked()) return false;
    if (c.master.ultCharge < c.master.ultMax) return false;
    const livingFoes = c.foes.filter(f => !f.dead);
    if (!livingFoes.length) return false;

    c.master.ultCharge = 0;
    const ms = this.getMasterStats();
    const famIdx = (ms.reso && ms.reso.activeFamIdx !== undefined) ? ms.reso.activeFamIdx : -1;
    const ult = ms.reso.activeUlt || this.data.game.fight.ult;
    const ultColors = ['#58f6ff', '#e83878', '#ff5418', '#58b4ff'];
    const ultCol = famIdx >= 0 ? (ultColors[famIdx] || '#ffd95e') : '#ffd95e';

    // Aim toward nearest living foe so directional ultimates (Bá Vương Nhất Đao 16m line!) cleave cleanly!
    let nearest = livingFoes[0], minD = Infinity;
    for (const f of livingFoes) {
      const d = Math.hypot(f.x - c.master.x, f.z - c.master.z);
      if (d < minD) { minD = d; nearest = f; }
    }
    if (nearest) c.master.facing = Math.atan2(nearest.x - c.master.x, nearest.z - c.master.z);
    const fYaw = c.master.facing || 0;

    this.audio.playSfx('ult');
    this.audio.playRandom(['master_ult_1', 'master_ult_2', 'master_ult_3'], true);
    if (this.renderer) {
      this.renderer.hitStopT = Math.max(this.renderer.hitStopT || 0, 0.065);
      this.renderer.camZoomPulse = Math.max(this.renderer.camZoomPulse || 0, 0.55);
    }
    c.master.animClip = ult.clip || 'SwordSpin';
    c.master.animDur = ult.windup ? Math.max(0.72, ult.windup + 0.15) : 0.82;
    c.master.animT = c.master.animDur;
    c.master.jumpDur = (ult.clip === 'Punch' || ult.clip === 'SaberCharged') ? 0.34 : 0.52;
    c.master.jumpT = c.master.jumpDur;
    if (this.renderer.spawnUltimateVfx) {
      this.renderer.spawnUltimateVfx(c.master.x, c.master.z, ultCol, ult.radius || 7.5, famIdx, fYaw);
    } else {
      this.renderer.triggerShake(0.65, 0.35);
      this.renderer.addSlashFx(c.master.x, c.master.z, fYaw, 6.5, ultCol, 'rays', 0.55);
    }

    if (this.onUltCutIn) {
      this.onUltCutIn('hero_lamphong', ult.name);
    }

    c.telegraphs.length = 0; // Clears all active enemy telegraphs!

    // Persistent 3s Blood-Thunder Storm Zone for Bạo Phong Huyết Vũ (famIdx === 1)!
    if (ult.zoneSec) {
      c.zonesActive.push({
        kind: 'storm', ownerId: 'master',
        x: c.master.x, z: c.master.z,
        r: ult.zoneR || 4.0, t: 0, dur: ult.zoneSec, tickAcc: 0, mul: (ult.mul || 6) * 0.65
      });
    }

    const fx = Math.sin(fYaw), fz = Math.cos(fYaw);
    for (const f of livingFoes) {
      const dx = f.x - c.master.x, dz = f.z - c.master.z;
      const dist = Math.hypot(dx, dz);
      let inHit = false;
      if (ult.shape === 'line') {
        // Bá Vương Nhất Đao: 16m × 4.5m forward blazing corridor + close-range cleave around Master!
        const proj = dx * fx + dz * fz;
        const perp = Math.abs(dx * fz - dz * fx);
        inHit = (proj >= -1.2 && proj <= (ult.reach || 16) && perp <= (ult.width || 4.5) * 0.65) || dist <= 3.2;
      } else {
        inHit = dist <= (ult.radius || 8) + 2;
      }
      if (inHit) {
        if (ult.apply) {
          const prevSt = (f.statuses[ult.apply] && f.statuses[ult.apply].stacks) || 0;
          f.statuses[ult.apply] = {
            t: ult.stateSec || (ult.apply === 'daze' ? 2.5 : 5.5),
            stacks: Math.min(5, Math.max(prevSt, ult.stacks || 3))
          };
          f.hasStatus = true;
        }
        this.dealDamage(c.master, f, ult.mul || 9, ult.sure ? 1.0 : 0.25, true);
      }
    }
    return true;
  }

  dealDamage(attacker, target, mul = 1.0, extraCrit = 0, isCombo = false, sourceTag = '') {
    if (!target || target.dead) return;
    const c = this.combat;
    // Thân Pháp I-Frame full dodge immunity!
    if (target.isMaster && target.invulnT > 0 && attacker && !attacker.isAlly) {
      this.renderer.addPopup(target.x, 1.15, target.z, 'NÉ TRÁNH!', '#66fff0', 1.05);
      return;
    }
    const ms = this.getMasterStats();

    let critChance = (attacker.crit || 0.05) + extraCrit;
    let critDmgMul = attacker.critDmg || 1.5;
    // Scar (Kiếm Ngân — Ngự Kiếm): each stack boosts Crit Chance +10% & Crit Damage +12%!
    if (target.statuses && target.statuses.scar && target.statuses.scar.t > 0) {
      const scStacks = Math.min(5, target.statuses.scar.stacks || 1);
      critChance += scStacks * 0.10;
      critDmgMul += scStacks * 0.12;
    }
    const isCrit = Math.random() < critChance;
    const critFactor = isCrit ? critDmgMul : 1.0;
    // Soyul (Tử Vi — Chu Thiên Tinh Trận) +18% Team ATK Buff!
    const teamBuffMul = (attacker.isAlly && c && c.teamAtkBuffT > 0) ? 1.18 : 1.0;

    // Smooth diminishing-returns defense + armor pierce (Chùy Hành Trận + Trang Bị Xuyên Giáp)
    const gearPierce = (ms.gearTotals && ms.gearTotals.pierce) || 0;
    const effDef = Math.max(0, (target.def || 0) * Math.max(0.15, 1 - (attacker.isMaster ? ((ms.form.pierce || 0) + gearPierce) : 0)));
    let defCut = 100 / (100 + effDef * 3.5);

    // Status damage amplifiers (Phá Giáp + Choáng + Chu Tước resonance)
    if (target.statuses && target.statuses.break && target.statuses.break.t > 0) {
      defCut *= (1.25 + (ms.reso.mods.breakTaken || 0));
    }
    if (target.statuses && target.statuses.daze && target.statuses.daze.t > 0) {
      defCut *= 1.20;
    }

    // Ally damage mitigation (Guard skills + Phương Viên Trận + Thái Hư 2-piece + Bảo Y + Set Bonus + Kiếm Hoàn + Phương Châm Kim Cương!)
    if (target.isAlly && attacker && !attacker.isAlly) {
      if (target.guardT > 0) defCut *= (1 - target.guardCut);
      const gearCut = target.isMaster ? (this.getEquipmentStatTotals().dmgCut || 0) : 0;
      const setCut = target.isMaster ? (this.getGearSetBonus().dmgCut || 0) : 0;
      const swSt = this.state && this.state.swordArray;
      const ringCut = (target.isMaster && swSt && swSt.lv > 0 && swSt.active && swSt.formation === 'ring') ? 0.15 : 0;
      const docTaken = this.getDoctrineVal('taken'); // negative reduces damage taken!
      const takenMod = Math.max(0.30, 1 + (ms.form.taken || 0) + (ms.reso.mods.taken || 0) + docTaken - gearCut - setCut - ringCut);
      defCut *= takenMod;
    }

    // Jianghu Region Trait 'wall' (Thiết Bích): enemies take -37% damage unless countered by Chu Tước Trận!
    const actTrait = this.getActiveTrait(c);
    if (!target.isAlly && actTrait && !actTrait.countered && actTrait.defAdd > 0) {
      defCut *= (1 / (1 + actTrait.defAdd));
    }

    // Thiết Thuẫn (shield) enemy frontal 60% damage reduction (flank/backstab deals full damage!)
    if (!target.isAlly && target.codexId === 'shield' && attacker && attacker.x !== undefined) {
      const toAtk = Math.atan2(attacker.x - target.x, attacker.z - target.z);
      const angDiff = Math.abs(((toAtk - (target.facing || 0) + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (angDiff <= (60 * Math.PI / 180)) {
        defCut *= 0.40;
      }
    }

    let sizeMod = 1.0;
    if (attacker.isAlly) {
      if (target.isBoss || target.isLeader) {
        sizeMod += (ms.form.big || 0) + (ms.reso.mods.famBig || 0) + (attacker.isMaster ? ((ms.gearTotals && ms.gearTotals.bossDmg) || 0) : 0);
      } else {
        sizeMod += (ms.form.small || 0);
      }
      sizeMod += (ms.form.dmg || 0) + this.getDoctrineVal('dmg');
      if (attacker.isMate) sizeMod += this.getDoctrineVal('mateDmg');
      sizeMod *= teamBuffMul;
    }

    let dmg = Math.max(1, Math.round(attacker.atk * mul * critFactor * defCut * Math.max(0.4, sizeMod) * (0.94 + Math.random() * 0.12)));

    // Sword Mark (Kiếm Ngân) extra burst + Ngự Kiếm 3-piece resonance (+100%!)
    if (attacker.isAlly && target.statuses && target.statuses.scar && target.statuses.scar.t > 0) {
      const scarMul = 0.60 * (1 + (ms.reso.mods.scar || 0));
      dmg += Math.round(attacker.atk * scarMul);
    }

    // Bát Quái Hộ Thân Kính Energy Shield absorbs incoming hits before HP!
    if (target.isMaster && target.shieldHp > 0 && attacker && !attacker.isAlly) {
      const absorbed = Math.min(target.shieldHp, dmg);
      target.shieldHp -= absorbed;
      dmg -= absorbed;
      if (absorbed > 0) {
        this.renderer.addPopup(target.x, 0.9, target.z, `HỘ THUẪN -${absorbed}`, '#66ffe8', 1.0);
      }
      if (dmg <= 0) return;
    }

    if (target.isRemotePlayer && c && c.mode === 'pvp_rt') {
      target.flashT = 0.12;
      if (this.online && c.customOpts && c.customOpts.roomId) {
        this.online.sendPkAction(c.customOpts.roomId, sourceTag || 'basic', dmg, isCrit);
      }
      if (this.renderer.addHitSparks) this.renderer.addHitSparks(target.x, 0.85, target.z, isCrit ? '#ffa94d' : '#d8f4ff', isCrit ? 8 : 4);
      this.renderer.addPopup(target.x, 0.65, target.z, `${isCrit ? 'BẠO! ' : ''}${dmg.toLocaleString()}`, isCrit ? '#ff9f43' : '#fff8e7', isCrit ? 1.2 : 0.96);
      return;
    }

    target.hp -= dmg;
    if (target.isWorldBoss && c) {
      c.wbDmgAcc = (c.wbDmgAcc || 0) + dmg;
      c.wbTotalDmg = (c.wbTotalDmg || 0) + dmg;
    }
    if (target.isCoopBoss && c) {
      c.coopDmgAcc = (c.coopDmgAcc || 0) + dmg;
      if (target.hp < 1) target.hp = 1; // Server-authoritative kill via WS coop_end
    }
    target.flashT = 0.12;
    if (attacker.isMaster && isCrit && !sourceTag && this.renderer) {
      this.renderer.hitStopT = Math.max(this.renderer.hitStopT || 0, 0.036);
    }
    if (this.renderer.addHitSparks && (isCrit || isCombo || Math.random() < 0.45)) {
      this.renderer.addHitSparks(target.x, 0.85, target.z, isCombo ? '#ffe066' : (isCrit ? '#ffa94d' : '#d8f4ff'), isCrit || isCombo ? 8 : 4);
    }

    if (attacker.isAlly) {
      c.comboCount++;
      c.comboResetT = 2.5;
      // Equipment / Set / Gem Lifesteal on Master hits
      if (attacker.isMaster && ms.gearTotals && ms.gearTotals.lifesteal > 0 && attacker.hp < attacker.maxHp) {
        const lsHeal = Math.max(1, Math.round(dmg * ms.gearTotals.lifesteal));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + lsHeal);
      }
      // Live DPS Meter Breakdown!
      if (c && c.dpsStats) {
        if (sourceTag === 'swordArray') c.dpsStats.swordArray += dmg;
        else if (sourceTag === 'artifact') c.dpsStats.artifact += dmg;
        else if (sourceTag === 'pet') c.dpsStats.pet += dmg;
        else if (attacker.isMate) c.dpsStats.mates[attacker.id] = (c.dpsStats.mates[attacker.id] || 0) + dmg;
        else c.dpsStats.master += dmg;
      }
      const col = isCombo ? '#ffe066' : (isCrit ? '#ff9f43' : '#fff8e7');
      const prefix = isCombo ? 'LIÊN KÍCH ' : (isCrit ? 'BẠO! ' : '');
      this.renderer.addPopup(target.x, 0.6, target.z, `${prefix}${dmg.toLocaleString()}`, col, isCrit || isCombo ? 1.22 : 0.96);
    } else {
      this.renderer.addPopup(target.x, 0.6, target.z, `-${dmg}`, '#ff6b6b', 0.92);
      // Hộ Thể Kiếm Hoàn ('ring' formation) automatic 60% ATK thorn counter!
      const swSt = this.state && this.state.swordArray;
      if (target.isMaster && attacker && !attacker.dead && swSt && swSt.lv > 0 && swSt.active && swSt.formation === 'ring') {
        const refl = Math.max(5, Math.round(target.atk * 0.60));
        attacker.hp = Math.max(0, attacker.hp - refl);
        this.renderer.addPopup(attacker.x, 1.0, attacker.z, `PHẢN KIẾM ${refl}`, '#64fff0', 0.96);
        if (c && c.dpsStats) c.dpsStats.swordArray += refl;
        if (attacker.hp <= 0) {
          attacker.dead = true;
          attacker.corpseT = 0;
          this.onFoeKilled(attacker);
        }
      }
    }

    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
      target.corpseT = 0;
      // Clear poison zones owned by a killed Độc Nhân (exact game.json rule!)
      if (!target.isAlly && target.codexId === 'toxin') {
        c.zonesActive = c.zonesActive.filter(z => z.ownerId !== target.id);
      }
      // Knockback fling on killed minions!
      if (!target.isAlly && attacker) {
        const ka = Math.atan2(target.x - attacker.x, target.z - attacker.z);
        target.flingVx = Math.sin(ka) * (isCombo || isCrit ? 6.5 : 3.4);
        target.flingVz = Math.cos(ka) * (isCombo || isCrit ? 6.5 : 3.4);
      }
      if (!target.isAlly) {
        this.onFoeKilled(target);
      } else if (target.isMate && !target.isBorrowed && (c.mode === 'jianghu' || c.mode === 'raid')) {
        if (!this.state.injured) this.state.injured = {};
        this.state.injured[target.id] = true;
        this.toast(`⚠ Đệ tử ${target.name} bị trọng thương — có thể trị thương bằng Đan Dược!`);
      }
    }
  }

  onFoeKilled(foe) {
    const c = this.combat;
    c.kills++;
    this.audio.playRandom(['kill_0', 'kill_1']);

    if (foe.codexId && this.state.codexKills[foe.codexId] !== undefined) {
      this.state.codexKills[foe.codexId]++;
    }

    // Spread bleed if Whirlwind 3-piece resonance active
    const ms = this.getMasterStats();
    if (ms.reso.mods.spread && foe.statuses && foe.statuses.bleed && foe.statuses.bleed.t > 0) {
      for (const other of c.foes) {
        if (!other.dead && Math.hypot(other.x - foe.x, other.z - foe.z) < 3.0) {
          other.statuses.bleed = { t: 4, stacks: 2 };
          other.hasStatus = true;
        }
      }
    }

    const ultDocMul = 1 + this.getDoctrineVal('ult');
    c.master.ultCharge = Math.min(c.master.ultMax, c.master.ultCharge + (foe.isBoss || foe.isLeader ? 6 : 1.3) * ultDocMul);
    // Drop Linh Thảo, Yêu Đan & Linh Khí (boosted by Cửu Vĩ Thiên Hồ!)
    if (c.mode !== 'prologue') {
      const petDrop = this.getPetDropMul();
      const herbDrop = Math.round((foe.isBoss ? 10 : (foe.isLeader ? 4 : (Math.random() < 0.65 ? 1 : 0))) * petDrop);
      const coreDrop = Math.round((foe.isBoss ? 6 : (foe.isLeader ? 2 : (Math.random() < 0.45 ? 1 : 0))) * petDrop);
      if (herbDrop > 0) this.state.herb = (this.state.herb || 0) + herbDrop;
      if (coreDrop > 0) this.state.core = (this.state.core || 0) + coreDrop;
      this.state.qi = Math.min(this.state.qiMax || 100, (this.state.qi || 0) + (foe.isBoss ? 18 : 4));
    }

    if (c.mode === 'prologue') {
      this.state.coin += 12;
      this.state.xp += 6;
      this.renderer.addCoinDrop(foe.x, foe.z, 2);
      if (c.kills >= c.killsGoal) {
        c.ended = true;
        this.audio.playSfx('clear');
        this.audio.playRandom(['master_clear_1', 'master_clear_2', 'master_clear_3'], true);
        setTimeout(() => this.completePrologue(), 750);
      }
      return;
    }

    if (c.mode === 'field') {
      const chap = Math.floor((c.stage - 1) / 10);
      const lapMods = this.getLapMods();
      const pactBonus = this.getPactRewardBonus();
      const vipCoinTbl = [0, 0.05, 0.10, 0.15, 0.22, 0.30, 0.40, 0.50, 0.65, 0.80, 1.00];
      const vipResB = vipCoinTbl[Math.min(10, Math.max(0, (this.state && this.state.vipLv) || 0))] || 0;
      const coinMul = (1 + vipResB + this.getPerkVal('coin') + this.getDoctrineVal('coin') + this.getDoctrineVal('reward') + this.getRepModVal('reward') + this.getGuildBonus('coin') + this.getOwnedDiscipleBonus('coin') + pactBonus) * lapMods.rewardMul;
      const xpMul = (1 + vipResB + this.getPerkVal('xp') + this.getDoctrineVal('xp') + this.getGuildBonus('xp') + pactBonus * 0.5) * lapMods.rewardMul;

      const baseCoin = foe.isBoss ? 320 : (foe.isLeader ? 65 : 4);
      const baseXp = foe.isBoss ? 160 : (foe.isLeader ? 32 : 2);
      const stageGrow = Math.pow(1.09, c.stage - 1);

      const gainCoin = Math.max(1, Math.round(baseCoin * stageGrow * coinMul));
      const gainXp = Math.max(1, Math.round(baseXp * stageGrow * xpMul));
      this.state.coin += gainCoin;
      this.state.xp += gainXp;
      this.renderer.addCoinDrop(foe.x, foe.z, foe.isBoss ? 6 : 2);

      if (foe.isLeader) {
        this.state.scroll += 1;
        if (Math.random() < 0.5) this.state.pill += 1;
      }
      if (foe.isBoss) {
        this.state.jade += 30;
        this.state.pill += 3;
        this.state.scroll += 5;
        this.addFame(this.data.jianghu.fame.boss);
        this.state.season.stats.boss++;
        if (!this.state.featStats) this.state.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
        if (c.master && c.master.hp / Math.max(1, c.master.maxHp) <= 0.25) {
          this.state.featStats.gritWins = (this.state.featStats.gritWins || 0) + 1;
          this.addFame(this.data.jianghu.fame.grit || 10);
          this.toast('🔥 Tử Chiến thắng lợi khi sinh lực nguy kịch (+Danh Vọng)!');
        }
        if (!c.mates || c.mates.length === 0) {
          this.state.featStats.soloWins = (this.state.featStats.soloWins || 0) + 1;
        }
        // Chance to drop Tier-matched Equipment & Spirit Gem directly from Chapter Boss!
        const dropTier = Math.min(5, 1 + Math.floor(c.stage / 12));
        if (Math.random() < 0.72) {
          this.grantRandomGearDrop(dropTier, '🎁 Chiến Lợi Phẩm Thủ Lĩnh');
        }
        this.completeCombatVictory();
        return;
      }

      if (!c.isBossGate && c.kills >= c.killsGoal - 1 && !c.bossSpawned && !this.state.huntMode) {
        this.spawnBossOrLeader(false);
      } else if (c.isBossGate && c.kills >= 6 && !c.bossSpawned) {
        this.spawnBossOrLeader(true);
      } else if (!c.isBossGate && c.kills >= c.killsGoal) {
        if (this.state.huntMode) {
          // Stay farming peacefully on this exact map (APK 사냥 / Hunt loop) — never switch maps!
          c.kills = 0;
          c.bossSpawned = false;
          const bonusCoin = Math.round(35 * Math.pow(1.09, c.stage - 1));
          this.state.coin += bonusCoin;
          this.toast(`Săn Bãi hoàn tất vòng · +${bonusCoin.toLocaleString()} Linh Thạch!`);
        } else {
          this.completeCombatVictory();
        }
      }
    } else if (foe.isBoss || (c.kills >= c.killsGoal && !c.bossSpawned)) {
      if (!c.bossSpawned && (c.mode === 'daily' || c.mode === 'tower' || c.mode === 'jianghu' || c.mode === 'raid' || c.mode === 'seasonBoss' || c.mode === 'guildBoss')) {
        this.spawnBossOrLeader(true);
      } else if (foe.isBoss) {
        if (!this.state.featStats) this.state.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
        if (c.master && c.master.hp / Math.max(1, c.master.maxHp) <= 0.25) {
          this.state.featStats.gritWins = (this.state.featStats.gritWins || 0) + 1;
          this.addFame(this.data.jianghu.fame.grit || 10);
        }
        if (!c.mates || c.mates.length === 0) {
          this.state.featStats.soloWins = (this.state.featStats.soloWins || 0) + 1;
        }
        this.completeCombatVictory();
      }
    }
  }

  scheduleNextCombat(fromCombat, nextMode = 'field', delayMs = 1350) {
    const runTransition = () => {
      if (this.combat !== fromCombat) return;
      if (this.onStageTransition) {
        this.onStageTransition(() => {
          if (this.combat !== fromCombat) return;
          this.setupCombat(nextMode);
          if (this.onUiDirty) this.onUiDirty();
        });
      } else {
        this.setupCombat(nextMode);
        if (this.onUiDirty) this.onUiDirty();
      }
    };
    // Never switch maps mid-cutscene: if any story is open/queued, wait until ALL story lines finish!
    if (this.isStoryActive && this.isStoryActive() && this.runAfterStory) {
      this.runAfterStory(runTransition);
      return;
    }
    setTimeout(() => {
      if (this.combat !== fromCombat) return;
      if (this.isStoryActive && this.isStoryActive() && this.runAfterStory) {
        this.runAfterStory(runTransition);
      } else {
        runTransition();
      }
    }, delayMs);
  }

  completeCombatVictory() {
    const c = this.combat;
    if (!c || c.ended) return;
    c.ended = true;
    this.audio.playSfx('clear');
    this.audio.playRandom(['master_clear_1', 'master_clear_2', 'master_clear_3'], true);
    // Increment Formation Mastery counter & notify on new tier!
    if (c.mode !== 'prologue' && this.state.formation) {
      if (!this.state.formUses) this.state.formUses = {};
      const beforeTier = this.getFormationMastery(this.state.formation).tier;
      this.state.formUses[this.state.formation] = (this.state.formUses[this.state.formation] || 0) + 1;
      const after = this.getFormationMastery(this.state.formation);
      if (after.tier > beforeTier) {
        const fDef = this.data.jianghu.formations.find(x => x.id === this.state.formation);
        this.toast(`⭐ Trận Pháp ${fDef ? fDef.name : this.state.formation} đạt Thông Thạo Bậc ${after.tier} (+${Math.round((after.mul - 1) * 100)}% hiệu lực)!`);
      }
    }

    if (c.mode === 'field') {
      const clearedStage = c.stage;
      // If player toggled Săn Bãi (huntMode) on a non-boss gate, NEVER advance stage/maxStage or switch maps!
      if (this.state.huntMode && !c.isBossGate) {
        c.ended = false;
        c.kills = 0;
        c.bossSpawned = false;
        const bonusCoin = Math.round(35 * Math.pow(1.09, clearedStage - 1));
        this.state.coin += bonusCoin;
        this.toast(`Săn Bãi hoàn tất vòng · +${bonusCoin.toLocaleString()} Linh Thạch!`);
        if (this.onUiDirty) this.onUiDirty();
        return;
      }

      this.state.insight = 0;
      const chIdx = c.chapterIdx || 0;
      if (clearedStage >= this.state.maxStage) {
        this.state.maxStage = clearedStage + 1;
      }
      this.checkFeats();

      if (c.isBossGate) {
        // Chapter Boss Cleared! Supports endless Thượng Giới Vô Tận chapters beyond Stage 60!
        const nextStage = clearedStage + 1;
        const curChapTitle = getChapterTitleForIdx(chIdx);
        const nextChapTitle = getChapterTitleForIdx(chIdx + 1);
        const showChapterEndChoices = () => {
          if (!this.onStoryTrigger) {
            this.state.stage = nextStage;
            this.setupCombat('field');
            return;
          }
          this.onStoryTrigger({
            title: `Hoàn Thành ${curChapTitle}`,
            lines: [
              {
                who: 'Thanh Linh Nhi',
                fig: '',
                text: `Tông Chủ đã bình định xong ${curChapTitle}!\nNgười muốn tiến quân sang ${nextChapTitle} ngay, hay ở lại săn bãi & tu luyện củng cố thực lực trước?`
              }
            ],
            choices: [
              {
                label: `Tiến Sang ${nextChapTitle} ▸`,
                onPick: () => {
                  this.state.stage = nextStage;
                  this.state.huntMode = false;
                  this.saveState();
                  if (this.onStageTransition) {
                    this.onStageTransition(() => {
                      this.setupCombat('field');
                      if (this.onUiDirty) this.onUiDirty();
                    });
                  } else {
                    this.setupCombat('field');
                    if (this.onUiDirty) this.onUiDirty();
                  }
                }
              },
              {
                label: 'Ở Lại Săn Bãi & Tu Luyện',
                onPick: () => {
                  this.state.stage = Math.max(1, clearedStage - 1);
                  this.state.huntMode = true;
                  this.saveState();
                  this.setupCombat('field');
                  if (this.onOpenPanelRequest) this.onOpenPanelRequest('growth', 0);
                  if (this.onUiDirty) this.onUiDirty();
                }
              },
              {
                label: 'Về Sân Sơn Môn Tu Tiên 3D',
                onPick: () => {
                  this.state.stage = Math.max(1, clearedStage - 1);
                  this.state.huntMode = true;
                  this.saveState();
                  this.setupCombat('field');
                  if (this.onGotoTownRequest) this.onGotoTownRequest();
                  if (this.onUiDirty) this.onUiDirty();
                }
              }
            ]
          });
        };

        this.toast(`🏆 Chinh phục ${curChapTitle}! Đã mở khóa ${nextChapTitle}!`);
        if (this.onVictoryBanner) this.onVictoryBanner('TRẢM THỦ LĨNH · CHIẾN THẮNG!', curChapTitle);
        // Auto-Boss mode: automatically advance smoothly into the next Chapter!
        if (this.state.autoBoss) {
          this.state.stage = nextStage;
          this.state.huntMode = false;
          this.saveState();
          this.scheduleNextCombat(c, 'field', 1800);
          return;
        }
        if (chIdx <= 5 && !this.state.plaques[chIdx] && this.onStoryTrigger) {
          this.triggerBossVictoryAndPlaque(chIdx, showChapterEndChoices);
        } else {
          this.checkAutoStoryTriggers();
          if (this.runAfterStory) this.runAfterStory(showChapterEndChoices);
          else showChapterEndChoices();
        }
        return;
      }

      // Gate 9 cleared -> DO NOT auto-charge into Chapter Boss (Gate 10) unless autoBoss is enabled!
      if (clearedStage % 10 === 9 && !this.state.autoBoss) {
        this.state.stage = clearedStage;
        this.state.huntMode = true;
        this.toast(`⚔ Đã mở Thủ Lĩnh Ải ${clearedStage + 1}! Đang Săn Bãi — bấm「⚔ Đấu Thủ Lĩnh」khi sẵn sàng!`);
        this.checkAutoStoryTriggers();
        this.scheduleNextCombat(c, 'field', 1400);
        return;
      }

      // Normal gates 1..8 inside the same chapter advance smoothly (unless user toggled Săn Bãi)
      this.state.stage = clearedStage + 1;
      this.toast(`Vượt Ải ${clearedStage} thành công! Tiến sang Ải ${this.state.stage}!`);
      if (this.onVictoryBanner) this.onVictoryBanner('PHÁ ẢI THÀNH CÔNG!', `Tiến sang Ải ${this.state.stage}`);
      this.checkAutoStoryTriggers();
      this.scheduleNextCombat(c, 'field', 1500);
    } else if (c.mode === 'shadow') {
      const nextIdx = this.state.realmIdx + 1;
      const nextR = this.data.game.realms[nextIdx];
      this.state.pill = Math.max(0, this.state.pill - nextR.pill);
      const wasClean = (this.state.shadowLosses || 0) === 0;
      this.state.realmIdx = nextIdx;
      this.state.shadowLosses = 0;
      if (wasClean) {
        if (!this.state.featStats) this.state.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
        this.state.featStats.shadowCleanWins = (this.state.featStats.shadowCleanWins || 0) + 1;
      }
      this.addFame(this.data.jianghu.fame.realm);
      this.audio.playVoice(`narrator_realm${Math.min(5, nextIdx)}`);
      if (this.renderer && c.master) {
        this.renderer.camZoomPulse = 0.65;
        this.renderer.pushVfx3D({ mesh: 'pillar', style: 2, x: c.master.x, y: 0.05, z: c.master.z, s0: 1.4, s1: 2.8, sy: 9.0, color: '#ffe066', dur: 0.95 });
        this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: c.master.x, y: 0.14, z: c.master.z, s0: 0.5, s1: 6.5, color: '#64fff0', dur: 0.85 });
        this.renderer.pushVfx3D({ mesh: 'helix', style: 5, x: c.master.x, y: 0.10, z: c.master.z, s0: 1.2, s1: 3.4, sy0: 2.5, sy1: 5.5, color: '#ffd866', dur: 0.95 });
      }
      this.toast(`🌟 Đột phá cảnh giới ${nextR.name}! Mở khóa Hào Quang Cảnh Giới 3D & tăng trần Lv.${nextR.cap}!`);
      if (this.onVictoryBanner) this.onVictoryBanner(`ĐỘT PHÁ · ${nextR.name.toUpperCase()}!`, `Trần tu vi mở lên Lv.${nextR.cap}`);
      this.checkFeats();
      this.scheduleNextCombat(c, 'field', 1100);
    } else if (c.mode === 'daily') {
      const dId = c.customOpts.dailyId;
      const dDef = this.data.game.trial.daily.find(x => x.id === dId);
      const lv = this.state.dailyLv[dId] || 1;
      const gateBonus = 1 + (this.state.halls.gate.lv || 0) * 0.1;
      const amt = Math.round(
        (dDef.rewardStep > 0 ? dDef.rewardBase + (lv - 1) * dDef.rewardStep : dDef.rewardBase * Math.pow(dDef.rewardMul, lv - 1)) * gateBonus
      );
      if (dId === 'forge') {
        const herbG = amt;
        const coreG = Math.max(8, Math.round(amt * 0.85));
        const coinG = Math.round(800 * Math.pow(1.12, lv - 1) * gateBonus);
        this.state.herb = (this.state.herb || 0) + herbG;
        this.state.core = (this.state.core || 0) + coreG;
        this.state.coin += coinG;
        // High chance to drop Tier-matched Equipment & Spirit Gem directly from Luyện Khí Bí Cảnh!
        const forgeTier = Math.min(5, 1 + Math.floor(lv / 4));
        const dropMsg = Math.random() < 0.80 ? (' · ' + this.grantRandomGearDrop(forgeTier, '🔥 Lò Luyện Bí Cảnh')) : '';
        this.toast(`🔥 Hoàn thành Luyện Khí Bí Cảnh Bậc ${lv}: +${herbG} Linh Thảo, +${coreG} Yêu Đan, +${coinG.toLocaleString()} Linh Thạch${dropMsg}`);
      } else {
        this.state[dDef.res] += amt;
        this.toast(`Hoàn thành ${dDef.name}: +${amt.toLocaleString()}!`);
      }
      this.state.dailyLeft[dId] = Math.max(0, (this.state.dailyLeft[dId] || 0) - 1);
      this.state.dailyLv[dId] = Math.min(dDef.maxLv, lv + 1);
      this.state.season.stats.daily++;
      if (this.state.guild) this.state.guild.borrowedId = null;
      this.scheduleNextCombat(c, 'field', 1000);
    } else if (c.mode === 'tower') {
      const fl = this.state.towerFloor;
      const isBossFl = fl % 5 === 0;
      const jadeGain = isBossFl ? this.data.game.trial.tower.jadeBoss : this.data.game.trial.tower.jade;
      this.state.jade += jadeGain;
      this.state.scroll += this.data.game.trial.tower.scroll;
      this.state.towerFloor++;
      this.state.season.stats.tower++;
      if (this.state.guild) this.state.guild.borrowedId = null;
      this.toast(`Vượt Thông Thiên Tháp tầng ${fl}: +${jadeGain} Tiên Ngọc, +2 Ngọc Giản!`);
      this.scheduleNextCombat(c, 'field', 1000);
    } else if (c.mode === 'jianghu') {
      if (!c.customOpts.isWander) {
        this.state.expStreak = (this.state.expStreak || 0) + 1;
        if (c.customOpts.isRegionBoss) {
          if (!this.state.featStats) this.state.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
          this.state.featStats.expWins = (this.state.featStats.expWins || 0) + 1;
          if (!c.usedSalve) this.state.featStats.noSalveWins = (this.state.featStats.noSalveWins || 0) + 1;
          this.addFame(this.data.jianghu.fame.exp || 30);
        }
      }
      if (this.state.guild) this.state.guild.borrowedId = null;
      if (c.customOpts.onWin) c.customOpts.onWin(c);
      this.checkFeats();
      this.checkAutoStoryTriggers();
      this.scheduleNextCombat(c, 'field', 1000);
    } else if (c.mode === 'raid') {
      const fac = c.customOpts.raidFaction || (this.state.raid && this.state.raid.pending);
      if (!this.state.raid) this.state.raid = { pending: null, wins: 0, cleanStreak: 0, grudgeWins: 0, helpWins: 0, cooldown: 95 };
      this.state.raid.pending = null;
      this.state.raid.wins = (this.state.raid.wins || 0) + 1;
      this.state.raid.cleanStreak = (this.state.raid.cleanStreak || 0) + 1;
      if (fac && fac.isGrudge) this.state.raid.grudgeWins = (this.state.raid.grudgeWins || 0) + 1;
      if (fac && fac.hasHelp) this.state.raid.helpWins = (this.state.raid.helpWins || 0) + 1;
      this.state.raid.cooldown = 160;
      const rwMul = this.getLapMods().rewardMul * (1 + this.getPactRewardBonus());
      if (fac && fac.reward) {
        for (const rw of fac.reward) {
          this.grantGift(rw.res, Math.round(rw.n * rwMul));
        }
      }
      this.addFame(this.data.jianghu.fame.raid || 15);
      if (this.state.guild) this.state.guild.borrowedId = null;
      this.toast(`🛡 Đẩy lùi thành công ${fac ? fac.name : 'đợt Tập Kích'}! (+${this.data.jianghu.fame.raid || 15} Danh Vọng)`);
      this.checkFeats();
      this.scheduleNextCombat(c, 'field', 1100);
    } else if (c.mode === 'arena') {
      const aCfg = this.data.online.arena;
      const foeMul = (c.customOpts && c.customOpts.foeMul) || 1.0;
      const pts = Math.max(aCfg.winMin || 12, Math.min(aCfg.winMax || 40, Math.round((aCfg.win || 25) + (foeMul - 1.0) * 60)));
      const honorG = aCfg.honorWin || 20;
      this.state.arenaScore += pts;
      this.state.honor += honorG;
      this.state.arenaRunsLeft = Math.max(0, this.state.arenaRunsLeft - 1);
      // Award first-time Arena Tier promotion honor!
      if (!this.state.arenaTierClaimed) this.state.arenaTierClaimed = {};
      for (const t of (aCfg.tiers || [])) {
        if (this.state.arenaScore >= t.at && !this.state.arenaTierClaimed[t.id]) {
          this.state.arenaTierClaimed[t.id] = true;
          if (t.honor > 0) {
            this.state.honor += t.honor;
            this.toast(`🏆 Thăng bậc ${t.name}: Thưởng +${t.honor} Vinh Dự!`);
          }
        }
      }
      if (this.state.guild) this.state.guild.borrowedId = null;
      if (this.online && this.online.isLoggedIn() && c.customOpts && c.customOpts.defenderId) {
        this.online.api('/api/pvp/async_result', 'POST', { defenderId: c.customOpts.defenderId, win: true }).catch(() => {});
      }
      this.toast(`Chiến thắng Luận Kiếm Đài: +${pts} Điểm Xếp Hạng, +${honorG} Vinh Dự!`);
      this.scheduleNextCombat(c, 'field', 1000);
    } else if (c.mode === 'worldBoss') {
      if (this.online && this.online.isLoggedIn() && c.wbDmgAcc > 0) {
        const rem = Math.round(c.wbDmgAcc);
        c.wbDmgAcc = 0;
        this.online.api('/api/worldboss/hit', 'POST', { dmg: rem }).catch(() => {});
      }
      const totalD = Math.round(c.wbTotalDmg || 0);
      const coinG = Math.max(500, Math.round(totalD * 0.25));
      this.state.coin += coinG;
      this.toast(`🔥 Hoàn thành đợt công kích Boss Thế Giới: gây ${totalD.toLocaleString()} sát thương (+${coinG.toLocaleString()} Linh Thạch)!`);
      this.scheduleNextCombat(c, 'field', 1000);
    } else if (c.mode === 'seasonBoss' || c.mode === 'guildBoss') {
      if (c.mode === 'seasonBoss') {
        const bCfg = this.data.game.season.boss;
        this.state.season.xp += (bCfg.xp || 30) * 2;
        this.state.season.token += (bCfg.tokenPer || 25);
        this.state.season.bossRuns = Math.max(0, this.state.season.bossRuns - 1);
        this.toast(`Đánh bại ${bCfg.name}: +${(bCfg.xp || 30) * 2} EXP Tu Luyện Lục, +${bCfg.tokenPer || 25} Tín Vật!`);
      } else {
        const gCfg = this.data.online.guild;
        const meritG = (gCfg.bossMerit || 8) + 17;
        const scoreAdd = Math.round((gCfg.botPerRun || 400) * 4.5 + (this.state.maxStage * 45));
        this.state.merit += meritG;
        this.state.guild.exp += 40;
        this.state.guild.weekScore = (this.state.guild.weekScore || 0) + scoreAdd;
        this.state.guild.bossRuns = Math.max(0, this.state.guild.bossRuns - 1);
        if (this.online && this.online.isLoggedIn()) {
          const totalG = Math.round((c.dpsStats && (c.dpsStats.master + c.dpsStats.swordArray + c.dpsStats.artifact + c.dpsStats.pet)) || 18000);
          this.online.api('/api/guilds/action', 'POST', { kind: 'boss_hit', dmg: totalG }).catch(() => {});
        }
        this.toast(`Chinh phạt Thủ Lĩnh Tiên Giới Minh: +${meritG} Cống Hiến, +${scoreAdd.toLocaleString()} Điểm Tuần!`);
      }
      if (this.state.guild) this.state.guild.borrowedId = null;
      this.scheduleNextCombat(c, 'field', 1000);
    }
  }

  onCombatDefeat(reason = 'Kiệt sức') {
    const c = this.combat;
    if (!c || c.ended) return;
    c.ended = true;
    this.audio.playSfx('fail');
    this.audio.playRandom(['master_fail_1', 'master_fail_2'], true);
    if (this.state.guild) this.state.guild.borrowedId = null;

    if (c.mode === 'prologue') {
      setTimeout(() => {
        this.setupCombat('prologue');
        this.spawnPrologueFoes();
        if (this.onUiDirty) this.onUiDirty();
      }, 1000);
      return;
    }

    if (c.mode === 'field') {
      this.state.insight = Math.min(0.45, this.state.insight + 0.06);
      this.state.huntMode = true; // APK 사냥으로: stay & farm peacefully after defeat until ready to advance!
      if (c.isBossGate) {
        const duelist = this.data.game.fight.duelists[Math.min(5, c.chapterIdx || 0)];
        if (c.stage > 1) this.state.stage = c.stage - 1;
        if (this.state.autoBoss) {
          this.state.autoBoss = false;
          this.toast(`⚠ Thủ Lĩnh Ải ${c.stage} quá mạnh — Tự tắt Auto Boss, lui về Săn Bãi Ải ${this.state.stage} tu luyện!`);
        } else {
          this.toast(duelist && duelist.loseLine
            ? `${duelist.name}: "${duelist.loseLine}" · Chuyển sang Săn Bãi gom tiền!`
            : `${reason} · Chuyển sang Săn Bãi (Nhìn Thấu ${Math.round(this.state.insight * 100)}%)!`);
        }
      } else {
        this.toast(`${reason} · Chuyển sang Săn Bãi gom tiền (Nhìn Thấu ${Math.round(this.state.insight * 100)}%)!`);
      }
    } else if (c.mode === 'shadow') {
      this.state.shadowLosses++;
      this.toast('Thất bại trước Thiên Kiếp Ma Ảnh — Đan Dược được giữ nguyên, Thiên Kiếp Ma Ảnh lần tới yếu đi 10%!');
    } else if (c.mode === 'raid') {
      const fac = c.customOpts.raidFaction || (this.state.raid && this.state.raid.pending);
      const rCfg = this.data.jianghu.raid;
      if (this.state.raid) {
        this.state.raid.pending = null;
        this.state.raid.cleanStreak = 0;
        this.state.raid.cooldown = 140;
      }
      if (fac && fac.hall && this.state.halls && this.state.halls[fac.hall]) {
        const lost = Math.round((this.state.halls[fac.hall].stored || 0) * (rCfg.cut || 0.5));
        this.state.halls[fac.hall].stored = Math.max(0, (this.state.halls[fac.hall].stored || 0) - lost);
      }
      this.toast(`⚠ Thất thủ trước ${fac ? fac.name : 'Tập Kích'} — mất một phần sản lượng tích trữ của Điện Các!`);
    } else if (c.mode === 'arena') {
      const aCfg = this.data.online.arena;
      const foeMul = (c.customOpts && c.customOpts.foeMul) || 1.0;
      const loss = Math.max(aCfg.loseMin || 5, Math.min(aCfg.loseMax || 28, Math.round((aCfg.lose || 18) - (foeMul - 1.0) * 30)));
      this.state.arenaScore = Math.max(0, this.state.arenaScore - loss);
      this.state.honor += (aCfg.honorLose || 6);
      this.state.arenaRunsLeft = Math.max(0, this.state.arenaRunsLeft - 1);
      if (this.online && this.online.isLoggedIn() && c.customOpts && c.customOpts.defenderId) {
        this.online.api('/api/pvp/async_result', 'POST', { defenderId: c.customOpts.defenderId, win: false }).catch(() => {});
      }
      this.toast(`Thất bại Luận Kiếm Đài: -${loss} Điểm, +${aCfg.honorLose || 6} Vinh Dự an ủi!`);
    } else if (c.mode === 'worldBoss') {
      if (this.online && this.online.isLoggedIn() && c.wbDmgAcc > 0) {
        const rem = Math.round(c.wbDmgAcc);
        c.wbDmgAcc = 0;
        this.online.api('/api/worldboss/hit', 'POST', { dmg: rem }).catch(() => {});
      }
      const totalD = Math.round(c.wbTotalDmg || 0);
      const coinG = Math.max(300, Math.round(totalD * 0.20));
      this.state.coin += coinG;
      this.toast(`🔥 Kết thúc đợt công kích Boss Thế Giới: gây ${totalD.toLocaleString()} sát thương (+${coinG.toLocaleString()} Linh Thạch)!`);
    } else if (c.mode === 'jianghu') {
      this.state.expStreak = 0;
      this.toast(`${reason} — Chuỗi thắng Viễn Chinh đặt lại về 0, hãy củng cố đội hình rồi thử lại!`);
    } else {
      this.toast(`${reason} — Không mất tài nguyên, hãy cường hóa rồi thử lại!`);
    }

    this.scheduleNextCombat(c, 'field', 1200);
  }

  // ==================== MAIN TICK LOOP ====================
  tick(rawDt) {
    if (!this.state || !this.data.game) return;
    if (this.renderer && this.renderer.hitStopT > 0) {
      this.renderer.hitStopT = Math.max(0, this.renderer.hitStopT - rawDt);
      return;
    }
    const speeds = [1.0, 1.5, 2.0, 3.0];
    const spd = speeds[this.state.speedIdx || 0] || 1.0;
    const dt = Math.min(0.1, rawDt) * spd;

    // 1. Passive Sect Hall Production & Build Completion (real-time rawDt)
    const nowMs = Date.now();
    const capHrs = this.data.game.town.capHours || 8;
    for (const hDef of this.data.game.halls) {
      const st = this.state.halls[hDef.id];
      if (!st) continue;
      if (st.buildEnd > 0 && nowMs >= st.buildEnd) {
        st.buildEnd = 0;
        st.lv++;
        this.audio.playVoice('narrator_hall_done');
        this.toast(`🏛 Đã hoàn thành nâng cấp ${hDef.name} Lv.${st.lv}!`);
        this.checkFeats();
        if (this.onUiDirty) this.onUiDirty();
      }
      if (hDef.res && st.lv > 0) {
        const ratePerSec = this.getHallHourlyRate(hDef.id) / 3600;
        const capAmt = this.getHallHourlyRate(hDef.id) * capHrs;
        st.stored = Math.min(capAmt, (st.stored || 0) + ratePerSec * rawDt * 12); // slightly brisker pacing for web playability
      }
    }

    // Outpost passive harvest (boosted by Doctrine + RepTier + FameTiers, clamped by outpostCapHours!)
    const outpostMul = 1 + this.getDoctrineVal('outpost') + this.getRepModVal('outpost') + this.getFameModVal('outpost');
    const opCapHrs = (this.data.jianghu && this.data.jianghu.outpostCapHours) || 8;
    const opCaps = {};
    for (const op of Object.values(this.state.outposts || {})) {
      if (op && op.res && op.n) {
        opCaps[op.res] = (opCaps[op.res] || 0) + op.n * opCapHrs * outpostMul;
        this.state.outpostStored[op.res] = Math.min(
          opCaps[op.res],
          (this.state.outpostStored[op.res] || 0) + (op.n / 600) * rawDt * outpostMul
        );
      }
    }

    // Salve recharge (respects 'nosalve' pact & exp.salveSec web-scaled timer!)
    const maxSalve = this.getMaxSalves();
    const salvePeriod = Math.max(60, Math.round(((this.data.jianghu && this.data.jianghu.exp && this.data.jianghu.exp.salveSec) || 900) / 10));
    if (this.state.salve > maxSalve) this.state.salve = maxSalve;
    if (this.state.salve < maxSalve) {
      this.state.salveTimer += rawDt;
      if (this.state.salveTimer >= salvePeriod) {
        this.state.salveTimer = 0;
        this.state.salve++;
      }
    }

    // Periodic Sect Raid Alert (after raid.fromStage = 15, only during idle field!)
    const rCfg = this.data.jianghu && this.data.jianghu.raid;
    if (rCfg && this.state.prologueDone && this.state.maxStage >= (rCfg.fromStage || 15) && this.state.raid && !this.state.raid.pending && this.combat && this.combat.mode === 'field' && !(this.isStoryActive && this.isStoryActive())) {
      this.state.raid.cooldown = (this.state.raid.cooldown ?? 95) - rawDt;
      if (this.state.raid.cooldown <= 0) {
        this.state.raid.cooldown = 160;
        this.triggerRaidAlert(false);
      }
    }

    // Periodic autosave + Cloud Save sync when logged in!
    this.saveTimer += rawDt;
    if (this.saveTimer >= 8) {
      this.saveTimer = 0;
      this.saveState();
      if (this.online && this.online.isLoggedIn()) {
        this.online.syncAcc = (this.online.syncAcc || 0) + 8;
        if (this.online.syncAcc >= 16) {
          this.online.syncAcc = 0;
          this.online.syncState(this);
        }
      }
    }

    // Random Jianghu Chance Event check (only after completing the 6-step Guide & never during story cutscenes!)
    this.chanceTimer -= rawDt;
    if (this.chanceTimer <= 0 && this.state.prologueDone && (this.state.guideStep >= 6 || this.state.maxStage >= 4) && !(this.isStoryActive && this.isStoryActive()) && this.combat && this.combat.mode === 'field') {
      this.chanceTimer = 110 + Math.random() * 60;
      const evs = this.data.game.chance.events;
      const ev = evs[Math.floor(Math.random() * evs.length)];
      if (ev && this.onStoryTrigger) {
        this.triggerChanceEvent(ev);
      }
    }

    // 2. Step Active 3D Combat
    this.stepCombat(dt);
  }

  stepCombat(dt) {
    const c = this.combat;
    if (!c || c.ended) return;

    const m = c.master;
    // Timer check for timed modes
    if (c.timer > 0) {
      c.timer -= dt;
      if (c.timer <= 0) {
        c.timer = 0;
        this.onCombatDefeat('Hết thời gian');
        return;
      }
    }

    if (c.comboResetT > 0) {
      c.comboResetT -= dt;
      if (c.comboResetT <= 0) c.comboCount = 0;
    }

    // Online Real-Time 1v1 PK state relay (~15 Hz) & Shared World Boss periodic damage flush!
    if (c.mode === 'pvp_rt' && this.online && c.customOpts && c.customOpts.roomId) {
      c.pkSyncT = (c.pkSyncT || 0) + dt;
      if (c.pkSyncT >= 0.07) {
        c.pkSyncT = 0;
        this.online.sendPkState(c.customOpts.roomId, {
          x: Math.round(m.x * 100) / 100,
          z: Math.round(m.z * 100) / 100,
          facing: Math.round((m.facing || 0) * 100) / 100,
          animClip: m.animT > 0 ? (m.animClip || 'Combo') : '',
          moving: !!m.moving
        });
      }
    } else if (c.mode === 'worldBoss' && this.online && this.online.isLoggedIn()) {
      c.wbFlushT = (c.wbFlushT || 0) + dt;
      if (c.wbFlushT >= 1.2 && c.wbDmgAcc > 0) {
        c.wbFlushT = 0;
        const batch = Math.round(c.wbDmgAcc);
        c.wbDmgAcc = 0;
        this.online.api('/api/worldboss/hit', 'POST', { dmg: batch }).then(res => {
          if (res && res.ok && res.boss) {
            const wbFoe = c.foes.find(f => f.isWorldBoss);
            if (wbFoe) { wbFoe.hp = res.boss.hp; wbFoe.maxHp = res.boss.maxHp; }
            if (res.killed) this.completeCombatVictory();
          }
        }).catch(() => {});
      }
    } else if (c.mode === 'coop' && this.online && c.customOpts && c.customOpts.roomId) {
      c.coopSyncT = (c.coopSyncT || 0) + dt;
      if (c.coopSyncT >= 0.08) {
        c.coopSyncT = 0;
        this.online.sendCoopState(c.customOpts.roomId, {
          x: Math.round(m.x * 100) / 100,
          z: Math.round(m.z * 100) / 100,
          facing: Math.round((m.facing || 0) * 100) / 100,
          animClip: m.animT > 0 ? (m.animClip || 'Combo') : '',
          moving: !!m.moving
        });
      }
      c.coopFlushT = (c.coopFlushT || 0) + dt;
      if (c.coopFlushT >= 0.45 && c.coopDmgAcc > 0) {
        c.coopFlushT = 0;
        const batch = Math.round(c.coopDmgAcc);
        c.coopDmgAcc = 0;
        this.online.sendCoopHit(c.customOpts.roomId, batch);
      }
    }

    // Spawn cohesive waves one squad at a time + infallible Boss/Zero-Foe watchdog (prevents huntMode 17/18 & Boss-spawn stalls!)
    c.spawnAcc += dt;
    if (c.mode !== 'prologue' && c.mode !== 'shadow' && c.mode !== 'arena' && c.mode !== 'worldBoss' && c.mode !== 'pvp_rt' && c.mode !== 'coop' && c.spawnAcc >= 0.6) {
      const aliveFoes = c.foes.filter(f => !f.dead).length;
      const aliveMinions = c.foes.filter(f => !f.dead && !f.isBoss).length;

      // Guarantee Boss / Leader always spawns once kill threshold is hit (even across multi-kills)
      if (!c.bossSpawned) {
        if (c.mode === 'field' && c.isBossGate && c.kills >= 6) {
          c.spawnAcc = 0;
          this.spawnBossOrLeader(true);
        } else if (c.mode === 'field' && !c.isBossGate && !this.state.huntMode && c.kills >= c.killsGoal - 1) {
          c.spawnAcc = 0;
          this.spawnBossOrLeader(false);
        } else if (c.mode !== 'field' && c.kills >= c.killsGoal) {
          c.spawnAcc = 0;
          this.spawnBossOrLeader(true);
        }
      }

      const needMinionCap = (c.mode === 'field' && this.state.huntMode && !c.isBossGate) ? c.killsGoal : (c.killsGoal - 1);
      if (!c.bossSpawned && aliveMinions <= 1 && c.kills < needMinionCap) {
        c.spawnAcc = 0;
        this.spawnWaveFoes(5);
      } else if (aliveFoes === 0 && !c.ended) {
        // Hard safety net: never leave an active non-ended stage with 0 living foes!
        c.spawnAcc = 0;
        if (!c.bossSpawned && (c.isBossGate || c.mode !== 'field')) {
          this.spawnBossOrLeader(true);
        } else {
          this.spawnWaveFoes(4);
        }
      } else if (c.bossSpawned && aliveMinions === 0 && c.spawnAcc >= 5.5) {
        c.spawnAcc = 0;
        this.spawnWaveFoes(3);
      }
    }

    // Active Zones (Poison / Storm)
    for (let i = c.zonesActive.length - 1; i >= 0; i--) {
      const hz = c.zonesActive[i];
      hz.t += dt;
      hz.tickAcc += dt;
      if (hz.tickAcc >= 0.5) {
        hz.tickAcc = 0;
        if (hz.kind === 'storm') {
          for (const f of c.foes) {
            if (!f.dead && Math.hypot(f.x - hz.x, f.z - hz.z) <= hz.r + 0.8) {
              f.statuses.bleed = { t: 4, stacks: Math.min(5, ((f.statuses.bleed && f.statuses.bleed.stacks) || 0) + 1) };
              f.hasStatus = true;
              this.dealDamage(m, f, hz.mul * 0.35);
            }
          }
        } else if (hz.kind === 'poison') {
          if (!m.dead && Math.hypot(m.x - hz.x, m.z - hz.z) <= hz.r) {
            this.dealDamage({ atk: hz.atk || 10 }, m, 0.35);
          }
        }
      }
      if (hz.t >= hz.dur) c.zonesActive.splice(i, 1);
    }

    // Step Telegraphs (Boss/Ronin Heavy Blows)
    for (let i = c.telegraphs.length - 1; i >= 0; i--) {
      const tel = c.telegraphs[i];
      tel.t += dt;
      if (tel.owner && tel.owner.dead) {
        c.telegraphs.splice(i, 1);
        continue;
      }
      if (tel.t >= tel.dur) {
        c.telegraphs.splice(i, 1);
        // Interactive Heavenly Tribulation Lightning Bolt (Lôi Kiếp Đài!)
        if (tel.isTribulation) {
          if (this.renderer.spawnLightningBolt) this.renderer.spawnLightningBolt(tel.x, tel.z, '#78c4ff', 3);
          if (this.renderer.addGroundCracks) this.renderer.addGroundCracks(tel.x, tel.z, tel.r || 2.8, '#88d4ff', 7);
          this.renderer.triggerShake(0.45, 0.25);
          this.audio.playSfx('overhaul_break');
          const distM = Math.hypot(m.x - tel.x, m.z - tel.z);
          if (!m.dead && distM <= (tel.r || 2.8)) {
            if (m.invulnT > 0) {
              m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.25);
              m.hp = Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.08));
              this.renderer.addPopup(m.x, 1.45, m.z, '⚡ NÉ THIÊN KIẾP! +25% NỘ', '#ffe878', 1.32);
            } else {
              const tribDmg = Math.round(m.maxHp * (tel.hpFrac || 0.14));
              this.dealDamage({ atk: tribDmg, crit: 0 }, m, 1.0);
            }
          } else if (!m.dead && distM <= (tel.r || 2.8) + 2.8) {
            m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.15);
            this.renderer.addPopup(m.x, 1.35, m.z, '⚡ VƯỢT LÔI KIẾP! +15% NỘ', '#66fff0', 1.18);
          }
          continue;
        }
        // Step 4: Distinct Signature 3D Boss Heavy Skill VFX per Boss Mesh!
        const bMesh = (tel.owner && tel.owner.mesh) || '';
        const bTex = (tel.owner && tel.owner.tex) || '';
        const bRad = tel.r || 3.2;
        if (bMesh === 'TT_Boss_VanKiem') {
          const swCol = bTex === 'TT_Tex_Boss_CuuU' ? '#ff3a66' : '#52e8ff';
          if (this.renderer.spawnFlyingSwords3D) this.renderer.spawnFlyingSwords3D(tel.x, tel.z, swCol, 6);
          if (this.renderer.addGroundCracks) this.renderer.addGroundCracks(tel.x, tel.z, bRad * 0.85, swCol, 6);
        } else if (bMesh === 'TT_Boss_XichViem') {
          for (let p = 0; p < 3; p++) {
            const ang = (p / 3) * Math.PI * 2;
            const px = tel.x + (p === 0 ? 0 : Math.cos(ang) * 1.4);
            const pz = tel.z + (p === 0 ? 0 : Math.sin(ang) * 1.4);
            this.renderer.pushVfx3D({ mesh: 'pillar', style: 2, x: px, y: 0.05, z: pz, s0: 1.1, s1: 1.9, sy: 6.5, color: '#ff4820', dur: 0.55, delay: p * 0.05 });
          }
          this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: tel.x, y: 0.12, z: tel.z, s0: 0.5, s1: bRad * 1.25, color: '#ff7030', dur: 0.48 });
          if (this.renderer.addGroundCracks) this.renderer.addGroundCracks(tel.x, tel.z, bRad, '#ff5e28', 8);
        } else if (bMesh === 'TT_Boss_BacHai') {
          this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: tel.x, y: 0.12, z: tel.z, s0: 0.4, s1: bRad * 1.35, color: '#46f2ff', dur: 0.55 });
          this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: tel.x, y: 0.35, z: tel.z, s0: 0.8, s1: bRad * 1.05, color: '#9cfaff', dur: 0.46, delay: 0.08 });
          this.renderer.pushVfx3D({ mesh: 'helix', style: 5, x: tel.x, y: 0.08, z: tel.z, s0: 1.0, s1: 2.8, sy0: 1.8, sy1: 3.8, color: '#40e8ff', dur: 0.50 });
        } else if (bMesh === 'TT_Boss_KyLan') {
          if (this.renderer.spawnLightningBolt) this.renderer.spawnLightningBolt(tel.x, tel.z, '#ffd866', 4);
          if (this.renderer.addGroundCracks) this.renderer.addGroundCracks(tel.x, tel.z, bRad, '#ffd866', 7);
        } else {
          // TT_Boss_ThanhLa / TT_Boss_LinhKhe / Leaders: Leap Slam + Jade/Gold Ground Fissures!
          const slamCol = bMesh === 'TT_Boss_LinhKhe' ? '#58ff9c' : '#ffaa38';
          this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: tel.x, y: 0.10, z: tel.z, s0: 0.5, s1: bRad * 1.22, color: slamCol, dur: 0.45 });
          if (this.renderer.addGroundCracks) this.renderer.addGroundCracks(tel.x, tel.z, bRad * 0.95, slamCol, 7);
        }
        this.renderer.triggerShake(0.32, 0.18);
        if (!m.dead && Math.hypot(m.x - tel.x, m.z - tel.z) <= (tel.r || tel.reach || 3.2)) {
          this.dealDamage(tel.owner || { atk: 20 }, m, tel.mul || 2.3);
          this.renderer.triggerShake(0.42, 0.24);
          this.audio.playSfx('hit_big');
        }
      }
    }

    // Master Update
    if (!m.dead) {
      // Tick Bạo Huyết Đan ATK buff
      if (this.state.atkBuffT > 0) {
        this.state.atkBuffT = Math.max(0, this.state.atkBuffT - dt);
        if (this.state.atkBuffT === 0) this.syncMasterStatsLive();
      }
      // Linh Khí Cultivation & Meditation (3x Qi rate + Hộ Tâm Ngọc bonus + rapid HP regen!)
      if (c.mode !== 'prologue') {
        const qiMul = this.getEquipmentStatTotals().qiMul || 1.0;
        const qiRate = (this.state.meditating ? 14.5 : 2.6) * qiMul;
        this.state.qi = (this.state.qi || 0) + qiRate * dt;
        if (this.state.qi >= (this.state.qiMax || 100)) {
          this.state.qi = 0;
          const bonusXp = Math.round(65 * Math.pow(1.08, (this.state.stage || 1) - 1) * (1 + (this.state.realmIdx || 0) * 0.4));
          this.state.xp += bonusXp;
          m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.14);
          this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.10, z: m.z, s0: 0.5, s1: 4.2, color: '#64fff0', dur: 0.6 });
          this.renderer.addPopup(m.x, 1.25, m.z, `CHU THIÊN VIÊN MÃN +${bonusXp} EXP`, '#ffe878', 1.22);
        }
      }
      // Interactive 3-Wave Heavenly Lightning Tribulation on Lôi Kiếp Đài (dodge with Space or absorb with Pháp Bảo!)
      if (c.mode === 'shadow') {
        const sb = c.foes.find(f => !f.dead && f.isBoss);
        if (sb) {
          c.tribWave = c.tribWave || 0;
          const hpFrac = sb.hp / Math.max(1, sb.maxHp);
          const thresholds = [0.78, 0.48, 0.18];
          if (c.tribWave < 3 && hpFrac <= thresholds[c.tribWave]) {
            c.tribWave++;
            this.renderer.spawnLightningBolt(sb.x, sb.z, '#b684ff', 2);
            this.audio.playSfx('boss');
            this.toast(`⚡ THIÊN KIẾP ĐỢT ${c.tribWave}/3 — BẤM SPACE NÉ VÙNG SÉT HOẶC BẬT KHIÊN PHÁP BẢO!`);
            // Spawn 1 -> 2 -> 3 telegraphed heavenly lightning zones!
            for (let k = 0; k < c.tribWave; k++) {
              const ang = (k / Math.max(1, c.tribWave)) * Math.PI * 2 + Math.random() * 0.6;
              const offR = k === 0 ? 0 : (2.4 + Math.random() * 1.4);
              const tx = m.x + Math.cos(ang) * offR;
              const tz = m.z + Math.sin(ang) * offR;
              c.telegraphs.push({
                owner: sb,
                isTribulation: true,
                shape: 'circle',
                x: tx,
                z: tz,
                angle: 0,
                r: 2.6 + c.tribWave * 0.25,
                t: 0,
                dur: 1.55 + k * 0.28,
                hpFrac: 0.12 + c.tribWave * 0.02
              });
            }
          }
        }
      }

      const hpRegenRate = (this.state.meditating ? 0.065 : 0.015) * (1 + this.getDoctrineVal('regen'));
      m.hp = Math.min(m.maxHp, m.hp + m.maxHp * hpRegenRate * dt);
      m.ultCharge = Math.min(m.ultMax, m.ultCharge + 0.45 * (1 + this.getDoctrineVal('ult')) * dt);
      if (c.dpsStats) c.dpsStats.t += dt;
      if (c.teamAtkBuffT > 0) c.teamAtkBuffT = Math.max(0, c.teamAtkBuffT - dt);
      if (m.guardT > 0) m.guardT = Math.max(0, m.guardT - dt);
      if (m.dodgeCd > 0) m.dodgeCd = Math.max(0, m.dodgeCd - dt);
      if (m.invulnT > 0) m.invulnT = Math.max(0, m.invulnT - dt);
      if (m.animT > 0) m.animT = Math.max(0, m.animT - dt);
      if (m.jumpT > 0) m.jumpT = Math.max(0, m.jumpT - dt);
      if (m.flashT > 0) m.flashT = Math.max(0, m.flashT - dt);
      if (m.cd > 0) m.cd = Math.max(0, m.cd - dt);
      for (let s = 0; s < 4; s++) {
        if (m.skillCds[s] > 0) m.skillCds[s] = Math.max(0, m.skillCds[s] - dt);
      }

      const livingFoes = c.foes.filter(f => !f.dead);

      // Auto-Firing 3D Floating Artifacts (Pháp Bảo Hộ Thân — fires even during Meditation!)
      if (c.mode !== 'prologue') {
        if (!c.artCds) c.artCds = { sword: 1.8, mirror: 3.0, orb: 3.5, furnace: 4.5 };
        const art = this.state.artifacts || {};
        // 1. Standalone Ngự Kiếm Trận (0 → 9 Live Back-Weapons + 3 Formations: fan / ring / domain!)
        const swSt = this.state.swordArray || { lv: 0, active: true, formation: 'fan' };
        const swTier = this.getSwordArrayTier(swSt.lv || 0);
        const swForm = swSt.formation || 'fan';
        if (swTier.count > 0 && swSt.active && livingFoes.length > 0) {
          // Vạn Kiếm Kiếm Vực ('domain' formation): every 12s opens a 4s AoE Sword Domain raining 3D swords!
          if (swForm === 'domain') {
            if (c.swordDomainT > 0) {
              c.swordDomainT = Math.max(0, c.swordDomainT - dt);
              c.swordDomainTick = (c.swordDomainTick || 0) - dt;
              if (c.swordDomainTick <= 0) {
                c.swordDomainTick = 0.65;
                const wVis = this.getEquippedWeaponVisual();
                if (this.renderer.spawnFlyingSwordBarrage) {
                  this.renderer.spawnFlyingSwordBarrage(m.x, m.z, Math.min(9, swTier.count + 2), wVis.trailHex || '#52fff0', 4.6);
                }
                for (const foe of livingFoes) {
                  if (Math.hypot(foe.x - m.x, foe.z - m.z) <= 5.2) {
                    this.dealDamage(m, foe, swTier.dmgMul * 0.65, 0.14, true, 'swordArray');
                  }
                }
              }
            } else {
              c.swordDomainCd = (c.swordDomainCd ?? 5.0) - dt;
              if (c.swordDomainCd <= 0) {
                c.swordDomainCd = 12.0;
                c.swordDomainT = 4.0;
                c.swordDomainTick = 0.05;
                this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.6, s1: 5.5, color: '#52fff0', dur: 0.55 });
                this.renderer.addPopup(m.x, 1.45, m.z, '⚔ VẠN KIẾM KIẾM VỰC!', '#52fff0', 1.25);
              }
            }
          }

          c.artCds.sword -= dt;
          if (c.artCds.sword <= 0) {
            c.artCds.sword = (swTier.cd || 1.4) * (swForm === 'fan' ? 0.85 : 1.0);
            const wVis = this.getEquippedWeaponVisual();
            const totalSlots = swTier.count;
            const nLaunch = Math.min(swTier.volley || 1, totalSlots);
            const sortedF = livingFoes.slice().sort((a, b) => Math.hypot(a.x - m.x, a.z - m.z) - Math.hypot(b.x - m.x, b.z - m.z));
            c.backSlotCursor = c.backSlotCursor || 0;

            for (let k = 0; k < Math.min(nLaunch, sortedF.length); k++) {
              const tf = sortedF[k];
              const slotIdx = (c.backSlotCursor++) % Math.max(1, totalSlots);
              const baseMul = (wVis.id === 'wp_immortal_jian' ? 1.25 : 1.0) * swTier.dmgMul;
              const extraCrit = wVis.id === 'wp_immortal_jian' ? 0.25 : 0.12;
              const onBackHit = (hx, hz) => {
                if (!c || c.ended) return;
                const col = wVis.trailHex || '#52fff0';
                this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: hx, y: 0.10, z: hz, s0: 0.32, s1: 1.9, color: col, alpha: 0.46, dur: 0.28 });
                this.renderer.addHitSparks(hx, 0.9, hz, col, 6);
                if (wVis.arrayKind === 'dao') {
                  for (const foe of c.foes) {
                    if (!foe.dead && Math.hypot(foe.x - hx, foe.z - hz) <= 2.4) {
                      foe.statuses.bleed = { t: 4.0, stacks: Math.min(5, ((foe.statuses.bleed && foe.statuses.bleed.stacks) || 0) + 1) };
                      foe.hasStatus = true;
                      this.dealDamage(m, foe, baseMul, extraCrit, false, 'swordArray');
                    }
                  }
                  this.renderer.addPopup(hx, 1.35, hz, 'PHI ĐAO THIÊU ĐỐT!', '#ff7638', 1.05);
                } else if (wVis.arrayKind === 'spear') {
                  if (tf && !tf.dead) {
                    tf.statuses.break = { t: 4.5, stacks: 1 };
                    tf.hasStatus = true;
                    this.dealDamage(m, tf, baseMul * 1.15, extraCrit + 0.08, true, 'swordArray');
                  }
                  this.renderer.spawnLightningBolt(hx, hz, '#b684ff', 1);
                  this.renderer.addPopup(hx, 1.35, hz, 'LÔI THƯƠNG PHÁ GIÁP!', '#c49aff', 1.05);
                } else if (wVis.arrayKind === 'staff') {
                  if (tf && !tf.dead) {
                    tf.statuses.daze = { t: 0.9 };
                    tf.hasStatus = true;
                    this.dealDamage(m, tf, baseMul, extraCrit, false, 'swordArray');
                  }
                  m.shieldHp = Math.min(Math.round(m.maxHp * 0.45), (m.shieldHp || 0) + Math.round(m.maxHp * 0.05));
                  this.renderer.addPopup(hx, 1.35, hz, 'KIM CÔN TRẤN ÁP!', '#ffe066', 1.05);
                } else {
                  if (tf && !tf.dead) {
                    tf.statuses.scar = { t: 5.0, stacks: 1 };
                    tf.hasStatus = true;
                    this.dealDamage(m, tf, baseMul, extraCrit, wVis.id === 'wp_immortal_jian', 'swordArray');
                  }
                  this.renderer.addPopup(hx, 1.35, hz, wVis.id === 'wp_frost_jian' ? 'BĂNG KIẾM TRẢM!' : 'NGỰ PHI KIẾM!', col, 1.05);
                }
              };

              if (this.renderer.launchBackWeapon) {
                this.renderer.launchBackWeapon(slotIdx, m, tf, wVis, onBackHit, totalSlots);
              } else {
                onBackHit(tf.x, tf.z);
              }
            }
          }
        }
        // 5. Linh Thú Hộ Mệnh 3D Active Skill!
        if (c.petCastT > 0) c.petCastT = Math.max(0, c.petCastT - dt);
        if (this.state.petActive && this.state.pets && this.state.pets[this.state.petActive] && this.state.pets[this.state.petActive].lv > 0) {
          const pid = this.state.petActive;
          const plv = this.state.pets[pid].lv;
          c.petCd = (c.petCd ?? 3.0) - dt;
          if (c.petCd <= 0) {
            c.petCastT = 0.45;
            if (pid === 'qingluan' && livingFoes.length > 0) {
              c.petCd = 4.5;
              const tgts = livingFoes.slice(0, 3);
              for (const tf of tgts) {
                this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: tf.x, y: 0.12, z: tf.z, s0: 0.3, s1: 1.85, color: '#42ffe8', alpha: 0.48, dur: 0.30 });
                this.dealDamage(m, tf, 1.15 + plv * 0.22, 0.10, false, 'pet');
              }
              this.renderer.addPopup(m.x, 1.65, m.z, '🐾 TUYẾT CÚ HỎA VŨ!', '#42ffe8', 1.05);
            } else if (pid === 'leilong' && livingFoes.length > 0) {
              // Tiên Phẩm Chí Tôn: Cửu Tiêu Lôi Kỳ Lân strikes up to 3 foes with heavy AoE Thunder + Armor Break!
              c.petCd = 4.5;
              const tgts = livingFoes.slice(0, 3);
              for (const tf of tgts) {
                this.renderer.spawnLightningBolt(tf.x, tf.z, '#b47cff', 2);
                tf.statuses.break = { t: 5.0, stacks: 1 };
                tf.hasStatus = true;
                this.dealDamage(m, tf, 1.80 + plv * 0.35, 0.24, true, 'pet');
              }
              this.renderer.addPopup(tgts[0].x, 1.55, tgts[0].z, '⚡ THIÊN LÔI KỲ LÂN!', '#c49aff', 1.16);
            } else if (pid === 'xuanwu') {
              c.petCd = 7.5;
              const sh = Math.round(m.maxHp * (0.12 + plv * 0.025));
              m.shieldHp = Math.min(Math.round(m.maxHp * 0.70), (m.shieldHp || 0) + sh);
              this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.12, z: m.z, s0: 0.5, s1: 2.8, color: '#52e898', dur: 0.45 });
              this.renderer.addPopup(m.x, 1.5, m.z, `🐾 CỔ TÙNG QUY THUẪN +${sh}`, '#52e898', 1.05);
            } else if (pid === 'jiuwei') {
              c.petCd = 6.5;
              const hPct = 0.05 + plv * 0.01;
              for (const ally of [m, ...(c.mates || [])]) {
                if (ally && !ally.dead) {
                  const h = Math.round(ally.maxHp * hPct);
                  ally.hp = Math.min(ally.maxHp, ally.hp + h);
                  this.renderer.addPopup(ally.x, 1.1, ally.z, `+${h}`, '#ff9ad0', 0.96);
                }
              }
              this.renderer.addPopup(m.x, 1.6, m.z, '🐾 NGỌC THỎ LINH DƯỠNG!', '#ff8cc8', 1.05);
            }
          }
        }
        // 2. Bát Quái Hộ Thân Kính: periodic golden energy shield
        if (art.mirror && art.mirror.lv > 0 && art.mirror.eq) {
          c.artCds.mirror -= dt;
          if (c.artCds.mirror <= 0) {
            c.artCds.mirror = 8.5;
            const sh = Math.round(m.maxHp * (0.14 + art.mirror.lv * 0.04));
            m.shieldHp = Math.max(m.shieldHp || 0, sh);
            this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.4, s1: 2.5, color: '#ffd966', dur: 0.45 });
            this.renderer.addPopup(m.x, 1.0, m.z, `KIM CHUNG HỘ THUẪN +${sh}`, '#ffd966', 1.08);
          }
        }
        // 3. Cửu Tiêu Lôi Châu: 3D branching lightning strikes
        if (art.orb && art.orb.lv > 0 && art.orb.eq && livingFoes.length > 0) {
          c.artCds.orb -= dt;
          if (c.artCds.orb <= 0) {
            c.artCds.orb = 5.2;
            const targets = livingFoes.slice(0, 3);
            for (const tf of targets) {
              this.renderer.spawnLightningBolt(tf.x, tf.z, '#b584ff', 1);
              tf.statuses.daze = { t: 0.85 };
              tf.hasStatus = true;
              this.dealDamage(m, tf, 1.65 + art.orb.lv * 0.35, 0.18, true, 'artifact');
            }
          }
        }
        // 4. Chu Tước Luyện Đan Lô: team heal + crimson fire ring
        if (art.furnace && art.furnace.lv > 0 && art.furnace.eq) {
          c.artCds.furnace -= dt;
          if (c.artCds.furnace <= 0) {
            c.artCds.furnace = 7.0;
            const healPct = 0.07 + art.furnace.lv * 0.02;
            for (const ally of [m, ...(c.mates || [])]) {
              if (ally && !ally.dead) {
                const h = Math.round(ally.maxHp * healPct);
                ally.hp = Math.min(ally.maxHp, ally.hp + h);
                this.renderer.addPopup(ally.x, 0.85, ally.z, `+${h}`, '#ff9b54', 1.0);
              }
            }
            this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: m.x, y: 0.1, z: m.z, s0: 0.6, s1: 4.5, color: '#ff642e', dur: 0.5 });
            for (const tf of livingFoes) {
              if (Math.hypot(tf.x - m.x, tf.z - m.z) <= 4.6) {
                this.dealDamage(m, tf, 1.2 + art.furnace.lv * 0.25, 0, false, 'artifact');
              }
            }
          }
        }
      }

      if (this.state.meditating) {
        m.moving = false;
        m.swordFlying = false;
      } else if (m.lunge) {
        m.swordFlying = false;
        m.lunge.t += dt;
        const pRaw = Math.min(1, m.lunge.t / Math.max(0.05, m.lunge.dur));
        // Smooth sine ease-in-out eliminates abrupt velocity spikes on flash/leap
        const p = 0.5 - 0.5 * Math.cos(pRaw * Math.PI);
        const nx = m.lunge.sx + (m.lunge.tx - m.lunge.sx) * p;
        const nz = m.lunge.sz + (m.lunge.tz - m.lunge.sz) * p;
        const fixed = this.resolveZoneCollision(c, nx, nz, 0.42);
        m.x = fixed.x;
        m.z = fixed.z;
        m.moving = false;
        if (pRaw >= 1) m.lunge = null;
      } else if (c.moveTarget) {
        const d = Math.hypot(c.moveTarget.x - m.x, c.moveTarget.z - m.z);
        if (d > 0.45) {
          m.swordFlying = (!!this.state.swordFlightOn || d > 3.2) && c.mode !== 'prologue';
          this.steerUnitToward(c, m, c.moveTarget.x, c.moveTarget.z, m.speed * (m.swordFlying ? 1.42 : 1.0), dt, 0.42);
        } else {
          c.moveTarget = null;
          m.moving = false;
          m.swordFlying = !!this.state.swordFlightOn && c.mode !== 'prologue';
        }
      } else if (livingFoes.length > 0) {
        // Sticky target selection: prevents erratic flipping between equidistant enemies!
        let nearest = livingFoes.find(f => f.id === m.targetId) || null;
        let curD = nearest ? (Math.hypot(nearest.x - m.x, nearest.z - m.z) - (nearest.isBoss ? 1.5 : 0)) : Infinity;
        for (const f of livingFoes) {
          const d = Math.hypot(f.x - m.x, f.z - m.z) - (f.isBoss ? 1.5 : 0);
          if (!nearest || d < curD - 1.35) {
            curD = d;
            nearest = f;
          }
        }
        m.targetId = nearest.id;
        const dx = nearest.x - m.x, dz = nearest.z - m.z;
        const dist = Math.hypot(dx, dz);
        const stopRange = m.moving ? m.range : (m.range + 0.35);

        const blockingBr = (dist > stopRange || !this.hasClearLine(c, m.x, m.z, nearest.x, nearest.z, 0.25))
          ? this.findBlockingBreak(c, m.x, m.z, nearest.x, nearest.z, m.range + 1.15)
          : null;

        if (blockingBr) {
          const bx = (blockingBr.x0 + blockingBr.x1) * 0.5, bz = (blockingBr.z0 + blockingBr.z1) * 0.5;
          m.facing = this.lerpAngle(m.facing || 0, Math.atan2(bx - m.x, bz - m.z), Math.min(1, dt * 16));
          m.moving = false;
          if (m.cd <= 0) {
            m.cd = m.rate;
            const wVis = this.getEquippedWeaponVisual();
            m.animClip = wVis.animStyle === 'dao' ? 'SaberSlash' : (wVis.animStyle === 'spear' ? 'SpearThrust' : 'SwordSlash');
            m.animDur = 0.44;
            m.animT = 0.44;
            this.audio.playRandom(['swing_0', 'swing_1', 'swing_2']);
            this.renderer.addSlashFx(m.x + Math.sin(m.facing) * 0.95, m.z + Math.cos(m.facing) * 0.95, m.facing, 2.0, wVis.trailHex || '#8ceeff', 'arc', 0.28, 0.25);
            blockingBr.curHp -= 4;
            if (this.renderer.addHitSparks) this.renderer.addHitSparks(bx, 0.85, bz, '#ffd966', 6);
            this.renderer.addPopup(bx, 0.9, bz, blockingBr.curHp <= 0 ? 'PHÁ VỠ RÀO CHẮN!' : 'PHÁ RÀO!', '#ffd966', 1.0);
            this.audio.playRandom(['hit_0', 'hit_1', 'hit_2']);
          }
        } else if (dist > stopRange || !this.hasClearLine(c, m.x, m.z, nearest.x, nearest.z, 0.25)) {
          m.swordFlying = (!!this.state.swordFlightOn || dist > 4.6) && c.mode !== 'prologue' && this.hasClearLine(c, m.x, m.z, nearest.x, nearest.z, 0.35);
          this.steerUnitToward(c, m, nearest.x, nearest.z, m.speed * (m.swordFlying ? 1.42 : 1.0), dt, 0.42);
        } else {
          m.swordFlying = !!this.state.swordFlightOn && c.mode !== 'prologue' && m.animT <= 0;
          m.facing = this.lerpAngle(m.facing || 0, Math.atan2(dx, dz), Math.min(1, dt * 16));
          m.moving = false;
          if (m.cd <= 0) {
            m.cd = m.rate;
            const stepIdx = m.comboIdx % 3;
            m.comboIdx++;
            const wVis = this.getEquippedWeaponVisual();
            if (wVis.animStyle === 'dao') {
              m.animClip = stepIdx === 2 ? 'SaberCharged' : 'SaberSlash';
            } else if (wVis.animStyle === 'spear') {
              m.animClip = 'SpearThrust';
            } else if (wVis.animStyle === 'staff') {
              m.animClip = 'ChiefSpin';
            } else {
              m.animClip = stepIdx === 2 ? 'Combo' : 'SwordSlash';
            }
            m.animDur = stepIdx === 2 ? 0.56 : 0.46;
            m.animT = m.animDur;
            const comboMuls = this.data.game.fight.master.combo || [1, 1, 1.6];
            const cm = comboMuls[stepIdx % comboMuls.length];
            this.audio.playRandom(['swing_0', 'swing_1', 'swing_2']);
            const fxRoll = stepIdx === 0 ? 0.36 : (stepIdx === 1 ? -0.42 : 0.08);
            const fxCol = stepIdx === 2 ? '#ffe074' : (wVis.trailHex || '#8ceeff');
            this.renderer.addSlashFx(m.x + Math.sin(m.facing) * 0.95, m.z + Math.cos(m.facing) * 0.95, m.facing, stepIdx === 2 ? 2.3 : 1.85, fxCol, 'arc', 0.28, fxRoll);
            if (stepIdx === 2) {
              this.renderer.addSlashFx(m.x + Math.sin(m.facing) * 0.95, m.z + Math.cos(m.facing) * 0.95, m.facing + 0.3, 2.1, wVis.trailHex || '#66e3ff', 'arc', 0.28, -0.45);
            }

            // Cleave nearby enemies in front arc & damage adjacent destructible barricades
            for (const f of livingFoes) {
              if (Math.hypot(f.x - m.x, f.z - m.z) <= m.range + 0.85) {
                this.dealDamage(m, f, cm * (1 + (this.getFormationMods().basic || 0)));
              }
            }
            for (const br of (c.breaks || [])) {
              if (br.curHp > 0 && this.pointHitsObstacle(m.x, m.z, m.range + 0.9, br)) {
                br.curHp -= 4;
              }
            }
            this.audio.playRandom(['hit_0', 'hit_1', 'hit_2']);
          }
        }

        // Auto-Skill & Auto-Ultimate (only fires once within actual engagement range & line of sight!)
        if (this.state.autoSkill && !m.lunge) {
          if (m.ultCharge >= m.ultMax && (livingFoes.length >= 4 || livingFoes.some(f => f.isBoss))) {
            this.castUltimate();
          } else {
            for (let s = 0; s < 4; s++) {
              if (m.skillCds[s] <= 0 && this.state.equippedSkills[s]) {
                if (this.castSkillSlot(s, true)) break;
              }
            }
          }
        }
      } else {
        m.moving = false;
      }
    } else {
      this.onCombatDefeat('Tông Chủ trọng thương');
      return;
    }

    // Mates Update
    for (const mt of c.mates) {
      if (mt.dead) continue;
      if (mt.animT > 0) mt.animT = Math.max(0, mt.animT - dt);
      if (mt.flashT > 0) mt.flashT = Math.max(0, mt.flashT - dt);
      if (mt.cd > 0) mt.cd = Math.max(0, mt.cd - dt);
      if (mt.skillCd > 0) mt.skillCd = Math.max(0, mt.skillCd - dt);
      if (mt.isCoopPeer) {
        if (typeof mt.targetX === 'number' && typeof mt.targetZ === 'number') {
          const lerpK = Math.min(1, dt * 14);
          mt.x += (mt.targetX - mt.x) * lerpK;
          mt.z += (mt.targetZ - mt.z) * lerpK;
        }
        continue;
      }

      const livingFoes = c.foes.filter(f => !f.dead);
      if (!livingFoes.length) {
        // Follow Master along valid walkable paths
        const d = Math.hypot(m.x - mt.x, (m.z - 1.5) - mt.z);
        if (d > 1.8) {
          this.steerUnitToward(c, mt, m.x, m.z - 1.5, mt.speed, dt, 0.42);
        } else mt.moving = false;
        continue;
      }

      let target = livingFoes.find(f => f.id === mt.targetId) || null;
      let bestMtD = target ? Math.hypot(target.x - mt.x, target.z - mt.z) : Infinity;
      for (const f of livingFoes) {
        const d = Math.hypot(f.x - mt.x, f.z - mt.z);
        if (!target || d < bestMtD - 1.3) { bestMtD = d; target = f; }
      }
      mt.targetId = target.id;

      const dx = target.x - mt.x, dz = target.z - mt.z;
      const dist = Math.hypot(dx, dz);
      const mtStopRange = mt.moving ? mt.range : (mt.range + 0.35);

      if (dist > mtStopRange || !this.hasClearLine(c, mt.x, mt.z, target.x, target.z, 0.25)) {
        this.steerUnitToward(c, mt, target.x, target.z, mt.speed, dt, 0.42);
      } else {
        mt.facing = this.lerpAngle(mt.facing || 0, Math.atan2(dx, dz), Math.min(1, dt * 16));
        mt.moving = false;
        if (mt.skillCd <= 0) {
          mt.skillCd = 8.5;
          const wm = mt.weaponMesh || '';
          mt.animClip = wm.includes('Spear') ? 'SpearThrust'
            : (wm.includes('Jian') ? 'Combo'
              : (wm.includes('Dao') ? 'SaberSlash'
                : (wm.includes('Staff') || wm.includes('Banner') ? 'SaberCharged' : 'Punch')));
          mt.animDur = 0.56;
          mt.animT = 0.56;
          if (Math.random() < 0.55) {
            this.audio.playRandom([`${mt.id}_ult_1`, `${mt.id}_ult_2`], true);
          }
          if (this.renderer.spawnMateSkillVfx) {
            this.renderer.spawnMateSkillVfx(mt, target);
          } else {
            this.renderer.addSlashFx(target.x, target.z, mt.facing, 2.2, '#80d4ff', 'ring', 0.3);
          }
          // Unique Signature Effects for ALL 12 Immortal Disciples!
          const did = mt.id;
          if (did === 'cheonga') {
            // Thanh Vân — Thanh Liên Hồi Xuân: Heals entire team 14% MaxHP!
            for (const ally of [m, ...c.mates]) {
              if (ally && !ally.dead && ally.hp < ally.maxHp) {
                const healAmt = Math.round(ally.maxHp * 0.14);
                ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
                this.renderer.addPopup(ally.x, 0.7, ally.z, `+${healAmt}`, '#62f598', 1.05);
              }
            }
          } else if (did === 'cheolsan') {
            // Kim Cang — Kim Cương Trấn Yêu: Grants Master a 12% MaxHP Golden Shield!
            const shAmt = Math.round(m.maxHp * 0.12);
            m.shield = Math.min(Math.round(m.maxHp * 0.55), (m.shield || 0) + shAmt);
            this.renderer.addPopup(m.x, 1.35, m.z, `🛡 Kim Cương +${shAmt}`, '#ffd24a', 1.05);
          } else if (did === 'soyul') {
            // Tử Vi — Chu Thiên Tinh Trận: +18% Team ATK (5s) & +12% Ult Charge!
            c.teamAtkBuffT = 5.0;
            m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.12);
            this.renderer.addPopup(mt.x, 1.35, mt.z, '✦ Tinh Trận +18% Công', '#64f2d8', 1.05);
          } else if (did === 'sundeok') {
            // Mộc Thanh — Thanh Trúc Đột Kích: Restores 6% Master HP!
            if (m && !m.dead && m.hp < m.maxHp) {
              const hAmt = Math.round(m.maxHp * 0.06);
              m.hp = Math.min(m.maxHp, m.hp + hAmt);
              this.renderer.addPopup(m.x, 0.85, m.z, `+${hAmt}`, '#48e898', 0.95);
            }
          } else if (did === 'makdong') {
            // Tiểu Bảo — Linh Châu Tán Xạ: +10% Ult Charge + bonus Linh Thạch!
            m.ultCharge = Math.min(m.ultMax, m.ultCharge + m.ultMax * 0.10);
            const bonusCoin = Math.max(8, Math.round(8 + c.stage * 3));
            this.state.coin += bonusCoin;
            this.renderer.addPopup(mt.x, 1.30, mt.z, `+${bonusCoin} Linh Thạch`, '#ffd862', 1.0);
          }

          // Multi-target ranged burst for Linh Nhi & Tiểu Bảo; AoE + unique debuffs for melee/casters!
          const hitPool = (did === 'danbi' || did === 'makdong')
            ? livingFoes.slice().sort((a, b) => Math.hypot(a.x - mt.x, a.z - mt.z) - Math.hypot(b.x - mt.x, b.z - mt.z)).slice(0, 3)
            : livingFoes.filter(f => Math.hypot(f.x - target.x, f.z - target.z) <= 2.8);

          for (const f of hitPool) {
            let exCrit = 0, skMul = 2.2;
            if (did === 'yeonhwa') { f.statuses.slow = { t: 3.5, stacks: 1 }; f.hasStatus = true; skMul = 2.35; }
            else if (did === 'unhak') { exCrit = 0.45; skMul = 2.45; }
            else if (did === 'heugyeong' || did === 'sundeok') { f.statuses.bleed = { t: 4.5, stacks: 3 }; f.hasStatus = true; }
            else if (did === 'macheol') { f.statuses.break = { t: 5.0, stacks: 2 }; f.hasStatus = true; skMul = 2.4; }
            else if (did === 'danbi') { f.statuses.scar = { t: 5.0, stacks: 2 }; f.hasStatus = true; }
            else if (did === 'harang') { f.statuses.daze = { t: 1.5, stacks: 1 }; f.hasStatus = true; }
            else if (did === 'dolsoe') { f.statuses.daze = { t: 1.8, stacks: 1 }; f.statuses.break = { t: 4.0, stacks: 1 }; f.hasStatus = true; }
            this.dealDamage(mt, f, skMul, exCrit);
          }
        } else if (mt.cd <= 0) {
          mt.cd = mt.rate;
          mt.animClip = null;
          mt.animDur = 0.45;
          mt.animT = 0.45;
          this.dealDamage(mt, target, 1.0);
        }
      }
    }

    // Foes Update
    for (let i = c.foes.length - 1; i >= 0; i--) {
      const f = c.foes[i];
      if (f.dead) {
        f.corpseT = (f.corpseT || 0) + dt;
        if (f.corpseT < 0.35 && (f.flingVx || f.flingVz)) {
          const damp = 1 - f.corpseT / 0.35;
          const kf = this.resolveZoneCollision(c, f.x + (f.flingVx || 0) * damp * dt, f.z + (f.flingVz || 0) * damp * dt, 0.42);
          f.x = kf.x;
          f.z = kf.z;
        }
        if (f.corpseT > 1.35) c.foes.splice(i, 1);
        continue;
      }
      if (f.animT > 0) f.animT = Math.max(0, f.animT - dt);
      if (f.flashT > 0) f.flashT = Math.max(0, f.flashT - dt);
      if (f.cd > 0) f.cd = Math.max(0, f.cd - dt);

      // Remote Real-Time PK opponent: interpolate smoothly from server WS packets instead of local AI!
      if (f.isRemotePlayer) {
        if (typeof f.targetX === 'number' && typeof f.targetZ === 'number') {
          const lerpK = Math.min(1, dt * 14);
          f.x += (f.targetX - f.x) * lerpK;
          f.z += (f.targetZ - f.z) * lerpK;
        }
        continue;
      }

      // Tick Statuses (Bleed DoT, Stun/Daze)
      let stunned = false;
      if (f.statuses) {
        let any = false;
        for (const [skKey, stObj] of Object.entries(f.statuses)) {
          if (stObj.t > 0) {
            stObj.t -= dt;
            any = true;
            if (skKey === 'daze') stunned = true;
            if (skKey === 'bleed') {
              stObj.tick = (stObj.tick || 0) + dt;
              if (stObj.tick >= 0.6) {
                stObj.tick = 0;
                this.dealDamage(m, f, 0.22 * (stObj.stacks || 1));
                if (f.dead) break;
              }
            }
          }
        }
        f.hasStatus = any;
      }
      if (f.dead || stunned) continue;

      // Boss Phase 2 Enrage at ≤50% HP (or ≤65% HP with 'rage' Pact — faster speed, +25% ATK, dual telegraphs!)
      const enrageFrac = this.hasPact('rage') ? 0.65 : 0.50;
      if (f.isBoss && f.phase !== 2 && f.hp <= f.maxHp * enrageFrac) {
        f.phase = 2;
        f.speed *= 1.20;
        f.atk = Math.round(f.atk * 1.25);
        f.heavyCd = Math.min(f.heavyCd || 2.8, 2.0);
        this.renderer.triggerShake(0.55, 0.35);
        this.renderer.pushVfx3D({ mesh: 'ring', style: 1, x: f.x, y: 0.14, z: f.z, s0: 0.6, s1: 5.2, color: '#ff2846', dur: 0.55 });
        this.renderer.addPopup(f.x, 1.75, f.z, '🔥 HÓA MA CUỒNG NỘ!', '#ff3858', 1.35);
        this.audio.playSfx('boss');
        this.toast(`🔥 ${f.name} tiến vào GIAI ĐOẠN 2 (Cuồng Nộ) — Bấm Space (Thân Pháp) để né đòn nặng!`);
      }

      // Boss / Leader Heavy Blow Telegraph (harder punishing strikes rewarding Space dodge!)
      if ((f.isBoss || f.isLeader) && f.heavyCd !== undefined) {
        f.heavyCd -= dt;
        if (f.heavyCd <= 0) {
          f.heavyCd = (f.phase === 2) ? 3.8 : 5.8;
          c.telegraphs.push({
            owner: f,
            shape: Math.random() < 0.65 ? 'circle' : 'line',
            x: m.x,
            z: m.z,
            angle: Math.atan2(m.x - f.x, m.z - f.z),
            r: f.phase === 2 ? 3.7 : 3.3,
            reach: 8.2,
            width: 2.4,
            t: 0,
            dur: f.phase === 2 ? 1.35 : 1.55,
            mul: f.phase === 2 ? 3.4 : 2.9
          });
          if (f.phase === 2) {
            c.telegraphs.push({
              owner: f,
              shape: 'circle',
              x: f.x,
              z: f.z,
              angle: 0,
              r: 3.6,
              t: 0,
              dur: 1.45,
              mul: 2.7
            });
          }
        }
      }

      // Huyết Tăng (monk) heals nearby foes every 5s (exact game.json kind mechanic!)
      if (f.codexId === 'monk') {
        f.mendCd = (f.mendCd ?? 4.5) - dt;
        if (f.mendCd <= 0) {
          f.mendCd = 5.0;
          for (const allyFoe of c.foes) {
            if (!allyFoe.dead && Math.hypot(allyFoe.x - f.x, allyFoe.z - f.z) <= 5.0) {
              const hAmt = Math.max(5, Math.round(allyFoe.maxHp * 0.08));
              allyFoe.hp = Math.min(allyFoe.maxHp, allyFoe.hp + hAmt);
            }
          }
          this.renderer.addPopup(f.x, 0.8, f.z, 'Hồi Huyết!', '#ff8fb1', 0.95);
        }
      }

      const dx = m.x - f.x, dz = m.z - f.z;
      const dist = Math.hypot(dx, dz);
      const fStopRange = f.moving ? f.range : (f.range + 0.3);

      const slowMul = (f.statuses && f.statuses.slow && f.statuses.slow.t > 0) ? 0.60 : 1.0;
      const fEffSpeed = f.speed * slowMul;
      // Phi Đao Thủ (dart) kites back when Master closes within 2.5m
      if (f.codexId === 'dart' && dist < 2.5 && dist > 0.2) {
        const back = this.resolveZoneCollision(c, f.x - (dx / dist) * fEffSpeed * 0.75 * dt, f.z - (dz / dist) * fEffSpeed * 0.75 * dt, 0.42);
        f.x = back.x;
        f.z = back.z;
        f.facing = this.lerpAngle(f.facing || 0, Math.atan2(dx, dz), Math.min(1, dt * 14));
        f.moving = true;
      } else if (dist > fStopRange || !this.hasClearLine(c, f.x, f.z, m.x, m.z, 0.25)) {
        this.steerUnitToward(c, f, m.x, m.z, fEffSpeed, dt, 0.42);
      } else {
        f.facing = this.lerpAngle(f.facing || 0, Math.atan2(dx, dz), Math.min(1, dt * 14));
        f.moving = false;
        if (f.cd <= 0) {
          f.cd = f.rate;
          f.animT = 0.28;
          this.dealDamage(f, m, 1.0);
          if (f.codexId === 'toxin' && Math.random() < 0.35) {
            c.zonesActive.push({ kind: 'poison', ownerId: f.id, x: m.x, z: m.z, r: 1.6, t: 0, dur: 3.0, tickAcc: 0, atk: f.atk });
          }
        }
      }
    }

    // Soft unit-vs-unit separation (respecting walls & water) so characters don't stack on top of each other
    const activeUnits = [m, ...c.mates, ...c.foes].filter(u => u && !u.dead);
    for (let i = 0; i < activeUnits.length; i++) {
      for (let j = i + 1; j < activeUnits.length; j++) {
        const a = activeUnits[i], b = activeUnits[j];
        const dx = b.x - a.x, dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const minD = 0.68;
        if (d > 1e-4 && d < minD) {
          const push = (minD - d) * 0.35;
          const ux = dx / d, uz = dz / d;
          const fa = this.resolveZoneCollision(c, a.x - ux * push, a.z - uz * push, 0.42);
          const fb = this.resolveZoneCollision(c, b.x + ux * push, b.z + uz * push, 0.42);
          a.x = fa.x; a.z = fa.z;
          b.x = fb.x; b.z = fb.z;
        }
      }
    }
  }

  // ==================== STORY, CHANCE EVENTS, FEATS, JIANGHU ====================
  triggerChanceEvent(ev) {
    if (!this.onStoryTrigger) return;
    this.onStoryTrigger({
      title: `Kỳ Ngộ Tiên Giới · ${ev.title}`,
      lines: ev.lines.map(t => ({ who: ev.title, fig: '', text: t })),
      choices: [
        {
          label: ev.a.label,
          onPick: () => {
            if (ev.a.rep) this.state.rep += ev.a.rep;
            for (const g of (ev.a.gifts || [])) {
              this.grantGift(g.res, g.n);
            }
            if (ev.a.say) this.toast(ev.a.say);
            if (this.onUiDirty) this.onUiDirty();
          }
        },
        {
          label: ev.b.label,
          onPick: () => {
            if (ev.b.rep) this.state.rep += ev.b.rep;
            for (const g of (ev.b.gifts || [])) {
              this.grantGift(g.res, g.n);
            }
            if (ev.b.say) this.toast(ev.b.say);
            if (this.onUiDirty) this.onUiDirty();
          }
        }
      ]
    });
  }

  grantGift(resKey, n) {
    if (resKey === 'coinMin') {
      const amt = Math.max(120, Math.round(n * 35 * Math.pow(1.08, this.state.maxStage)));
      this.state.coin += amt;
    } else if (resKey === 'xpMin') {
      const amt = Math.max(80, Math.round(n * 22 * Math.pow(1.08, this.state.maxStage)));
      this.state.xp += amt;
    } else if (this.state[resKey] !== undefined) {
      this.state[resKey] += n;
    }
  }

  getFeatProgress(ft) {
    const st = this.state;
    const fs = st.featStats || {};
    const rd = st.raid || {};
    if (ft.kind === 'stage') return st.maxStage || 1;
    if (ft.kind === 'realm') return st.realmIdx || 0;
    if (ft.kind === 'disciples') return Object.keys(st.disciples || {}).length;
    if (ft.kind === 'main') return (st.halls && st.halls.main && st.halls.main.lv) || 1;
    if (ft.kind === 'forms') return (st.unlockedForms || []).length;
    if (ft.kind === 'rebirth') return st.rebirths || 0;
    if (ft.kind === 'wander') return Math.max(0, (st.wanderFloor || 1) - 1);
    if (ft.kind === 'hyeop') return Math.max(0, st.rep || 0);
    if (ft.kind === 'pae') return Math.max(0, -(st.rep || 0));
    if (ft.kind === 'region') return ['r1', 'r2', 'r3', 'r4', 'r5'].filter(r => st.clearedNodes && st.clearedNodes[`${r}.boss`]).length;
    if (ft.kind === 'exp') return fs.expWins || 0;
    if (ft.kind === 'grit') return fs.gritWins || 0;
    if (ft.kind === 'noSalve') return fs.noSalveWins || 0;
    if (ft.kind === 'solo') return fs.soloWins || 0;
    if (ft.kind === 'shadowClean') return fs.shadowCleanWins || 0;
    if (ft.kind === 'pactFull') return fs.pactFullWins || 0;
    if (ft.kind === 'pactLap') return fs.pactLapWins || 0;
    if (ft.kind === 'raid') return rd.wins || 0;
    if (ft.kind === 'raidClean') return rd.cleanStreak || 0;
    if (ft.kind === 'grudge') return rd.grudgeWins || 0;
    if (ft.kind === 'help') return rd.helpWins || 0;
    return 0;
  }

  checkFeats() {
    for (const ft of (this.data.jianghu.feats || [])) {
      if (this.state.featsClaimed[ft.id]) continue;
      const val = this.getFeatProgress(ft);
      if (val >= ft.n) {
        this.state.featsClaimed[ft.id] = true;
        this.state.jade += ft.jade;
        this.addFame(ft.fame);
        this.toast(`🏆 Đạt Kỳ Tích「${ft.name}」: +${ft.jade} Tiên Ngọc, +${ft.fame} Danh Vọng!`);
      }
    }
  }

  triggerLoreScene(sceneId, extraOpts = {}) {
    if (!this.onStoryTrigger || !this.data.story || !this.data.story.lore) return false;
    if (this.state.seenScenes[sceneId]) return false;
    const lore = this.data.story.lore;
    const sc = lore.scenes.find(x => x.id === sceneId);
    if (!sc) return false;

    const lineMap = {};
    for (const ln of lore.lines) lineMap[ln.id] = ln;
    const resolved = (sc.lines || []).map(lid => {
      const pickId = lid.includes('|') ? (this.state.rep >= 0 ? lid.split('|')[0] : lid.split('|')[1]) : lid;
      return lineMap[pickId];
    }).filter(Boolean);
    if (!resolved.length) return false;

    this.state.seenScenes[sceneId] = true;
    this.saveState();

    const chMeta = (sc.ch >= 0 && lore.chapters && lore.chapters[sc.ch]) ? lore.chapters[sc.ch] : null;
    this.onStoryTrigger({
      title: extraOpts.title || sc.title || (chMeta ? chMeta.title : 'Chính Tuyến · Thái Hư Tiên Môn'),
      lines: resolved,
      choices: extraOpts.choices || null,
      doneLabel: extraOpts.doneLabel || 'Tiếp Tục Hành Tẩu',
      onDone: () => {
        if (sc.jade) this.state.jade += sc.jade;
        if (sc.scroll) this.state.scroll += sc.scroll;
        if (extraOpts.onDone) extraOpts.onDone();
        if (this.onUiDirty) this.onUiDirty();
      }
    });
    return true;
  }

  triggerBossVictoryAndPlaque(chIdx, onAllFinished = null) {
    const duelist = this.data.game.fight.duelists[chIdx];
    const faction = (this.data.game.fight.relay && this.data.game.fight.relay.factions && this.data.game.fight.relay.factions[chIdx]) || { name: 'Thanh Lam Đỉnh' };
    const lineMap = {};
    for (const ln of (this.data.story.lore.lines || [])) lineMap[ln.id] = ln;

    const pickPlaque = (way) => {
      this.state.plaques[chIdx] = way;
      if (way === 'return') this.state.rep += 10;
      else if (way === 'break') this.state.rep -= 10;
      this.refreshAllyStatsInCombat();
      this.saveState();
      const wayTxt = way === 'hang' ? 'Treo lên Hộ Sơn Linh Trận (+4% Công & Máu)' : (way === 'return' ? 'Trả lại giữ thể diện (+10 Tiên Đức)' : 'Đập nát Linh Ấn (+10 Ma Tính)');
      this.toast(`Linh Ấn ${faction.name}: ${wayTxt}!`);

      const reactLine = lineMap[`pl.p${chIdx}.${way}`];
      const afterReact = () => {
        this.checkAutoStoryTriggers();
        if (onAllFinished) {
          if (this.runAfterStory) this.runAfterStory(onAllFinished);
          else onAllFinished();
        }
        if (this.onUiDirty) this.onUiDirty();
      };
      if (reactLine && this.onStoryTrigger) {
        this.onStoryTrigger({
          title: `Linh Ấn · ${faction.name}`,
          lines: [reactLine],
          doneLabel: 'Tiếp Tục',
          onDone: afterReact
        });
      } else {
        afterReact();
      }
    };

    const lines = [];
    if (duelist) {
      lines.push({
        who: `${duelist.alias} · ${duelist.name}`,
        fig: VILLAIN_FIG_BY_CHAPTER[chIdx] || '',
        text: duelist.winLine
      });
    }
    lines.push({
      who: 'Thanh Linh Nhi',
      fig: '',
      text: `Đã đánh bại ${duelist ? duelist.name : 'Thủ Lĩnh'} và đoạt được tấm Linh Ấn của ${faction.name}.\nTông Chủ định xử lý tấm Linh Ấn này thế nào?`
    });

    this.onStoryTrigger({
      title: `Chiến Thắng · ${CHAPTER_TITLES[chIdx] || faction.name}`,
      lines,
      choices: [
        { label: 'Treo lên Hộ Sơn Linh Trận (+4% Công & Máu)', onPick: () => pickPlaque('hang') },
        { label: 'Trả Lại giữ thể diện (+10 Tiên Đức)', onPick: () => pickPlaque('return') },
        { label: 'Đập Nát thị uy (+10 Ma Tính)', onPick: () => pickPlaque('break') }
      ]
    });
  }

  checkAutoStoryTriggers() {
    if (!this.state.seenScenes) this.state.seenScenes = {};

    // 1. Complete Prologue
    if (!this.state.prologueDone && this.state.maxStage >= 3) {
      this.completePrologue();
      return true;
    }

    if (!this.state.prologueDone) return false;

    // 2. Steward Thanh Linh Nhi intro right after Prologue (hands over 300 Linh Thạch!)
    if (!this.state.seenScenes['st.intro']) {
      this.triggerLoreScene('st.intro', {
        title: 'Mở Đầu · Thanh Linh Nhi · Kiếm Linh',
        doneLabel: 'Nhận 300 Linh Thạch',
        onDone: () => {
          this.state.coin += this.data.game.start.coin || 300;
          this.toast('Thanh Linh Nhi · Kiếm Linh trao +300 Linh Thạch · Làm theo Chỉ Dẫn góc trên trái!');
          this.saveState();
        }
      });
      return true;
    }

    // 2b. APK mugong.firstPickStage: 1 — Choose first martial art after clearing Stage 1!
    if (!this.state.firstPickDone && this.state.maxStage >= 2) {
      this.triggerFirstPickMartialArt();
      return true;
    }

    // 3. Exact APK story.json cond="plaque:0:1" — Ancestral Tablet of Thái Hư Tổ Sư (right after defeating Huyết Lang Vương Cốt Nanh & Plaque 0!)
    if (!this.state.seenScenes['m0.tablet'] && this.state.plaques[0]) {
      this.triggerLoreScene('m0.tablet', {
        title: 'Tông Chủ Điện · Thái Hư Linh Bia · Cơ Duyên Xuyên Không',
        onDone: () => this.checkAutoStoryTriggers()
      });
      return true;
    }

    // 4. Exact APK story.json cond="cross&seen:m0.tablet" — Crossroads of Jianghu right after m0.tablet!
    if (!this.state.seenScenes['m0.cross'] && this.state.seenScenes['m0.tablet']) {
      this.triggerLoreScene('m0.cross', {
        title: 'Ngã Rẽ Tiên Giới · Định Đạo Lộ Sơn Môn',
        choices: [
          {
            label: 'Chính Đạo (+22% Sinh Lực)',
            onPick: () => {
              this.state.sectPath = 'jeong';
              this.state.rep += 15;
              this.refreshAllyStatsInCombat();
              this.toast('Thái Hư Tiên Môn lập thệ theo Chính Đạo!');
              this.saveState();
              if (this.onUiDirty) this.onUiDirty();
            }
          },
          {
            label: 'Tà Đạo (+10% Bạo Kích)',
            onPick: () => {
              this.state.sectPath = 'sa';
              this.state.rep -= 10;
              this.refreshAllyStatsInCombat();
              this.toast('Thái Hư Tiên Môn bước vào đường Tà Đạo quỷ dị!');
              this.saveState();
              if (this.onUiDirty) this.onUiDirty();
            }
          },
          {
            label: 'Ma Đạo (+25% Công Lực)',
            onPick: () => {
              this.state.sectPath = 'ma';
              this.state.rep -= 20;
              this.refreshAllyStatsInCombat();
              this.toast('Thái Hư Tiên Môn khai mở bá đạo Ma Công!');
              this.saveState();
              if (this.onUiDirty) this.onUiDirty();
            }
          },
          {
            label: 'Độc Lập (+12% Công & Máu)',
            onPick: () => {
              this.state.sectPath = 'indep';
              this.refreshAllyStatsInCombat();
              this.toast('Thái Hư Tiên Môn tự lập đường riêng, không phụ thuộc ai!');
              this.saveState();
              if (this.onUiDirty) this.onUiDirty();
            }
          }
        ]
      });
      return true;
    }

    // 5. Chapter 1..5 Main Story Auto Scenes matching exact APK story.json plaque & boss conditions!
    const chTriggers = [
      { id: 'm1.boss', ok: !!(this.state.clearedNodes['r1.boss'] || this.state.plaques[1]) },
      { id: 'm1.night', ok: !!(this.state.seenScenes['m1.boss'] && this.state.plaques[1]) },
      { id: 'm2.boss', ok: !!(this.state.clearedNodes['r2.boss'] || this.state.plaques[2]) },
      { id: 'm2.end', ok: !!(this.state.seenScenes['m2.boss'] && this.state.plaques[2]) },
      { id: 'm3.clinic', ok: !!(this.state.clearedNodes['r3.f1'] || this.state.maxStage >= 31) },
      { id: 'm3.boss', ok: !!(this.state.clearedNodes['r3.boss'] || this.state.plaques[3]) },
      { id: 'm3.end', ok: !!(this.state.seenScenes['m3.boss'] && this.state.plaques[3]) },
      { id: 'm4.reunion', ok: !!this.state.disciples.unhak },
      { id: 'm4.boss', ok: !!(this.state.clearedNodes['r4.boss'] || this.state.plaques[4]) },
      { id: 'm4.end', ok: !!(this.state.seenScenes['m4.boss'] && this.state.plaques[4]) },
      { id: 'm5.boss', ok: !!(this.state.clearedNodes['r5.boss'] || this.state.plaques[5]) },
      { id: 'm5.end', ok: !!(this.state.seenScenes['m5.boss'] && this.state.plaques[5]) }
    ];
    for (const tr of chTriggers) {
      if (tr.ok && !this.state.seenScenes[tr.id]) {
        this.triggerLoreScene(tr.id, { onDone: () => this.checkAutoStoryTriggers() });
        return true;
      }
    }
    return false;
  }

  completePrologue() {
    if (this.state.prologueDone) return;
    this.state.prologueDone = true;
    const ch0 = this.data.story.chapters[0];
    // Caretakers Thạch Hạo & Mộc Thanh + Prologue trio Xích Lôi, Linh Nhi, Tiểu Bảo join the sect (player deploys them in Guide 2!)
    const initialRoster = [...(this.data.game.start.disciples || []), ...(ch0.join || [])];
    for (const jid of initialRoster) {
      if (!this.state.disciples[jid]) {
        this.state.disciples[jid] = { lv: 1, stars: 0, shards: 0 };
      }
    }
    // Master awakens first basic martial art: Nhất Thiểm Kiếm Khí (Slot 1)
    if (!this.state.learnedSkills.includes('wave')) {
      this.state.learnedSkills.push('wave');
      this.state.skillLvs.wave = 1;
    }
    if (!this.state.equippedSkills[0]) {
      this.state.equippedSkills[0] = 'wave';
    }
    this.saveState();
    this.toast('【HỆ THỐNG】: Thái Hư Tiên Môn khai sơn! Lĩnh ngộ tiên pháp đầu tiên: Thanh Liên Kiếm Khí!');
    const enterFieldAfterAllPrologueStories = () => {
      if (this.onStageTransition) {
        this.onStageTransition(() => {
          this.setupCombat('field');
          if (this.onUiDirty) this.onUiDirty();
        });
      } else {
        this.setupCombat('field');
        if (this.onUiDirty) this.onUiDirty();
      }
    };
    const chainStewardIntro = () => {
      // Play Steward Thanh Linh Nhi (st.intro) right after ch0.close BEFORE switching to Stage 1 battlefield!
      if (!this.state.seenScenes['st.intro']) {
        this.triggerLoreScene('st.intro', {
          title: 'Mở Đầu · Thanh Linh Nhi · Kiếm Linh',
          doneLabel: 'Nhận 300 Linh Thạch & Xuất Sơn!',
          onDone: () => {
            this.state.coin += this.data.game.start.coin || 300;
            this.toast('Thanh Linh Nhi · Kiếm Linh trao +300 Linh Thạch · Làm theo Chỉ Dẫn góc trên trái!');
            this.saveState();
            enterFieldAfterAllPrologueStories();
          }
        });
      } else {
        enterFieldAfterAllPrologueStories();
      }
    };
    if (this.onStoryTrigger && ch0 && ch0.close) {
      this.onStoryTrigger({
        title: ch0.title,
        lines: ch0.close,
        voPrefix: 'pro_close',
        doneLabel: 'Trùng Kiến Thái Hư Tiên Môn!',
        onDone: chainStewardIntro
      });
    } else {
      chainStewardIntro();
    }
    if (this.onUiDirty) this.onUiDirty();
  }
}

window.MurimEngine = MurimEngine;
