// ==================== HỆ THỐNG TRANG BỊ 6 Ô · 38 MÓN · 6 PHẨM · 5 BỘ · LINH CHÂU ====================
window.GEAR_SLOTS_DEF = [
  { id: 'weapon', name: 'Vũ Khí 3D', short: 'Vũ Khí' },
  { id: 'helm',   name: 'Đạo Quán',  short: 'Đạo Quán' },
  { id: 'armor',  name: 'Đạo Bào',   short: 'Đạo Bào' },
  { id: 'jade',   name: 'Ngọc Bội',  short: 'Ngọc Bội' },
  { id: 'ring',   name: 'Linh Giới', short: 'Linh Giới' },
  { id: 'boots',  name: 'Thần Ngoa', short: 'Thần Ngoa' }
];

window.GEAR_GRADES_CFG = {
  'Phàm Phẩm': { tier: 0, col: '#7da8a8', subCount: 1, sockets: 1, subMul: 0.7 },
  'Linh Phẩm': { tier: 1, col: '#48c8ff', subCount: 2, sockets: 2, subMul: 1.0 },
  'Địa Phẩm':  { tier: 2, col: '#ff7840', subCount: 2, sockets: 2, subMul: 1.25 },
  'Thiên Phẩm':{ tier: 3, col: '#b074ff', subCount: 3, sockets: 3, subMul: 1.55 },
  'Tiên Phẩm': { tier: 4, col: '#ffd858', subCount: 3, sockets: 3, subMul: 1.9 },
  'Hồng Mông': { tier: 5, col: '#ff4252', subCount: 4, sockets: 3, subMul: 2.35 }
};

window.GEAR_SETS_DEF = [
  {
    id: 'thanhlam', name: 'Bộ Thanh Lam Đạo Vận', minGrade: 'Linh Phẩm', col: '#48c8ff',
    bonuses: {
      2: { atkPct: 0.14, hpPct: 0.14, desc: '+14% Công & Máu' },
      4: { atkPct: 0.28, hpPct: 0.28, crit: 0.05, lifesteal: 0.04, desc: '+28% Công/Máu, +5% Bạo, +4% Hút Máu' },
      6: { atkPct: 0.45, hpPct: 0.45, crit: 0.08, lifesteal: 0.08, qiMul: 0.35, desc: '+45% Công/Máu, +8% Bạo, +8% Hút Máu, +35% Hấp Linh' }
    }
  },
  {
    id: 'xichviem', name: 'Bộ Xích Viêm Phần Thiên', minGrade: 'Địa Phẩm', col: '#ff7038',
    bonuses: {
      2: { atkPct: 0.20, bossDmg: 0.15, desc: '+20% Công, +15% ST Thủ Lĩnh' },
      4: { atkPct: 0.38, hpPct: 0.25, bossDmg: 0.30, critDmg: 0.25, desc: '+38% Công, +25% Máu, +30% ST Thủ Lĩnh, +25% Sát Bạo' },
      6: { atkPct: 0.62, hpPct: 0.45, bossDmg: 0.50, critDmg: 0.50, pierce: 0.15, desc: '+62% Công, +50% ST Thủ Lĩnh & Sát Bạo, +15% Xuyên Giáp' }
    }
  },
  {
    id: 'cuutieu', name: 'Bộ Cửu Tiêu Lôi Đình', minGrade: 'Thiên Phẩm', col: '#b074ff',
    bonuses: {
      2: { atkPct: 0.28, crit: 0.08, desc: '+28% Công, +8% Bạo Kích' },
      4: { atkPct: 0.52, hpPct: 0.35, crit: 0.14, cdr: 0.08, desc: '+52% Công, +35% Máu, +14% Bạo, -8% Hồi Chiêu' },
      6: { atkPct: 0.85, hpPct: 0.60, crit: 0.22, cdr: 0.15, pierce: 0.22, desc: '+85% Công, +22% Bạo & Xuyên Giáp, -15% Hồi Chiêu' }
    }
  },
  {
    id: 'thaihu', name: 'Bộ Thái Hư Tinh Thần', minGrade: 'Tiên Phẩm', col: '#38f5cc',
    bonuses: {
      2: { atkPct: 0.35, hpPct: 0.35, dmgCut: 0.06, desc: '+35% Công/Máu, -6% ST nhận' },
      4: { atkPct: 0.68, hpPct: 0.68, crit: 0.14, dmgCut: 0.12, desc: '+68% Công/Máu, +14% Bạo, -12% ST nhận' },
      6: { atkPct: 1.10, hpPct: 1.10, crit: 0.24, critDmg: 0.60, dmgCut: 0.18, lifesteal: 0.10, desc: '+110% Công/Máu, +24% Bạo, +60% Sát Bạo, +10% Hút Máu, -18% ST nhận' }
    }
  },
  {
    id: 'hongmong', name: 'Bộ Hồng Mông Hỗn Độn', minGrade: 'Hồng Mông', col: '#ff4252',
    bonuses: {
      2: { atkPct: 0.55, hpPct: 0.55, pierce: 0.12, desc: '+55% Công/Máu, +12% Xuyên Giáp' },
      4: { atkPct: 1.05, hpPct: 0.95, pierce: 0.25, lifesteal: 0.10, dmgCut: 0.15, desc: '+105% Công, +95% Máu, +25% Xuyên Giáp, +10% Hút Máu' },
      6: { atkPct: 1.75, hpPct: 1.50, crit: 0.30, critDmg: 0.90, pierce: 0.38, lifesteal: 0.16, dmgCut: 0.24, cdr: 0.18, desc: '+175% Công, +150% Máu, +30% Bạo, +90% Sát Bạo, +38% Xuyên Giáp, +16% Hút Máu, -24% ST nhận' }
    }
  }
];

window.GEAR_SUBSTAT_POOL = [
  { key: 'atkPct',   name: 'Công Kích',      unit: '%', min: 4,  max: 12 },
  { key: 'hpPct',    name: 'Sinh Lực',       unit: '%', min: 5,  max: 14 },
  { key: 'crit',     name: 'Bạo Kích',       unit: '%', min: 2,  max: 7 },
  { key: 'critDmg',  name: 'Sát Thương Bạo', unit: '%', min: 8,  max: 24 },
  { key: 'lifesteal',name: 'Hút Máu',        unit: '%', min: 2,  max: 6 },
  { key: 'pierce',   name: 'Xuyên Giáp',     unit: '%', min: 4,  max: 12 },
  { key: 'bossDmg',  name: 'ST Thủ Lĩnh',    unit: '%', min: 6,  max: 18 },
  { key: 'cdr',      name: 'Giảm Hồi Chiêu', unit: '%', min: 2,  max: 7 },
  { key: 'dmgCut',   name: 'Giảm ST Nhận',   unit: '%', min: 2,  max: 7 }
];

window.GEMS_DEF = [
  { id: 'kim',  name: 'Kim Sát Linh Châu',  elem: 'Kim',  col: '#ffd858', statKey: 'atk',     baseVal: 45,   pctKey: 'atkPct',  pctVal: 0.04, desc: 'Tăng Tấn Công phẳng & +ATK% (hợp thành tối đa Lv.5)' },
  { id: 'moc',  name: 'Mộc Sinh Linh Châu', elem: 'Mộc',  col: '#52e898', statKey: 'hp',      baseVal: 260,  pctKey: 'lifesteal',pctVal: 0.015, desc: 'Tăng Sinh Lực & Hút Máu khi tấn công' },
  { id: 'thuy', name: 'Thủy Linh Bảo Châu', elem: 'Thủy', col: '#48c8ff', statKey: 'crit',    baseVal: 0.03, pctKey: 'cdr',     pctVal: 0.015, desc: 'Tăng Tỉ Lệ Bạo Kích & Giảm Hồi Chiêu' },
  { id: 'hoa',  name: 'Hỏa Viêm Linh Châu', elem: 'Hỏa',  col: '#ff6438', statKey: 'critDmg', baseVal: 0.12, pctKey: 'bossDmg', pctVal: 0.05, desc: 'Tăng Sát Thương Bạo & Sát Thương Thủ Lĩnh' },
  { id: 'tho',  name: 'Thổ Hộ Linh Châu',   elem: 'Thổ',  col: '#d4a647', statKey: 'def',     baseVal: 24,   pctKey: 'dmgCut',  pctVal: 0.02, desc: 'Tăng Phòng Thủ & Giảm Sát Thương nhận vào' }
];

// 38 distinct Xianxia Equipment items across all 6 slots (keeps all 12 legacy IDs intact!)
window.XIANXIA_EQUIPMENT_DEF = [
  // ==================== 1. VŨ KHÍ 3D (8 Món — Phàm -> Hồng Mông) ====================
  {
    id: 'wp_iron_jian', slot: 'weapon', setId: null, name: 'Thanh Lam Phàm Kiếm', grade: 'Phàm Phẩm', gradeCol: '#7da8a8',
    img: 'eq_wp_iron_jian', mesh: 'Weapon_Jian', ttMesh: 'TT_Wp_IronJian', isCustomSword: false, arrayKind: 'customSword', animStyle: 'sword',
    bladeCol: [0.76, 0.96, 0.98], hiltCol: [0.88, 0.76, 0.44], haloCol: [0.54, 0.96, 0.96], trailHex: '#7beeff',
    atk: 14, hp: 20, def: 0, crit: 0.02, critDmg: 0, perLv: { atk: 7, hp: 10 }, cost: { coin: 0, herb: 0, core: 0 },
    desc: 'Thanh linh kiếm cổ tại Thanh Lam Phế Đỉnh. Dàn phi kiếm sau lưng mang thanh quang cơ bản.'
  },
  {
    id: 'wp_frost_jian', slot: 'weapon', setId: 'thanhlam', name: 'Hàn Băng Tuyết Liên Kiếm', grade: 'Linh Phẩm', gradeCol: '#48c8ff',
    img: 'eq_wp_frost_jian', mesh: 'Weapon_Jian', ttMesh: 'TT_Wp_FrostJian', isCustomSword: true, arrayKind: 'customSword', animStyle: 'sword',
    bladeCol: [0.46, 0.94, 1.0], hiltCol: [0.84, 0.96, 1.0], haloCol: [0.42, 0.90, 1.0], trailHex: '#4be8ff',
    atk: 38, hp: 90, def: 4, crit: 0.05, critDmg: 0.20, perLv: { atk: 14, hp: 32 }, cost: { coin: 260, herb: 8, core: 6 },
    desc: 'Tiên kiếm băng tinh cầm tay 3D. Dàn Phi Kiếm sau lưng biến thành Tuyết Liên Băng Kiếm phát lam quang.'
  },
  {
    id: 'wp_flame_dao', slot: 'weapon', setId: 'xichviem', name: 'Xích Viêm Trảm Long Đao', grade: 'Địa Phẩm', gradeCol: '#ff7038',
    img: 'eq_wp_flame_dao', mesh: 'Weapon_BigDao', ttMesh: 'TT_Wp_FlameDao', isCustomSword: false, arrayKind: 'dao', animStyle: 'dao',
    bladeCol: [1.0, 0.44, 0.16], hiltCol: [1.0, 0.78, 0.28], haloCol: [1.0, 0.42, 0.14], trailHex: '#ff5a24',
    atk: 64, hp: 140, def: 6, crit: 0.07, critDmg: 0.22, perLv: { atk: 20, hp: 46 }, cost: { coin: 420, herb: 12, core: 10 },
    desc: 'Đại đao Hỏa Viêm bốc cháy trên tay (đổi thế đánh sang Đao Pháp). Dàn sau lưng hóa thành Xích Viêm Phi Đao 3D!'
  },
  {
    id: 'wp_jade_staff', slot: 'weapon', setId: 'xichviem', name: 'Huyền Thiên Hỗn Nguyên Côn', grade: 'Địa Phẩm', gradeCol: '#f2c144',
    img: 'eq_wp_jade_staff', mesh: 'Weapon_Staff', ttMesh: 'TT_Wp_JadeStaff', isCustomSword: false, arrayKind: 'staff', animStyle: 'staff',
    bladeCol: [1.0, 0.86, 0.36], hiltCol: [0.98, 0.72, 0.24], haloCol: [1.0, 0.84, 0.34], trailHex: '#ffd858',
    atk: 68, hp: 300, def: 18, crit: 0.07, critDmg: 0.22, perLv: { atk: 21, hp: 95, def: 5 }, cost: { coin: 520, herb: 15, core: 12 },
    desc: 'Kim côn Hỗn Nguyên nặng ngàn cân (đổi thế đánh sang Toàn Phong Côn). Dàn sau lưng hóa thành Kim Cang Thần Côn 3D!'
  },
  {
    id: 'wp_thunder_spear', slot: 'weapon', setId: 'cuutieu', name: 'Cửu Tiêu Lôi Đình Thương', grade: 'Thiên Phẩm', gradeCol: '#b074ff',
    img: 'eq_wp_thunder_spear', mesh: 'Weapon_Spear', ttMesh: 'TT_Wp_ThunderSpear', isCustomSword: false, arrayKind: 'spear', animStyle: 'spear',
    bladeCol: [0.80, 0.56, 1.0], hiltCol: [0.58, 0.88, 1.0], haloCol: [0.76, 0.48, 1.0], trailHex: '#b47cff',
    atk: 98, hp: 240, def: 12, crit: 0.12, critDmg: 0.34, perLv: { atk: 30, hp: 72 }, cost: { coin: 760, herb: 18, core: 16 },
    desc: 'Thần thương dẫn Cửu Thiên Lôi Điện (đổi thế đánh sang Thương Pháp). Dàn sau lưng biến thành Cửu Tiêu Lôi Thương 3D!'
  },
  {
    id: 'wp_immortal_jian', slot: 'weapon', setId: 'thaihu', name: 'Thái Hư Tru Tiên Thần Kiếm', grade: 'Tiên Phẩm', gradeCol: '#38f5cc',
    img: 'eq_wp_immortal_jian', mesh: 'Weapon_Jian', ttMesh: 'TT_Wp_ImmortalJian', isCustomSword: true, arrayKind: 'customSword', animStyle: 'sword',
    bladeCol: [0.46, 1.0, 0.88], hiltCol: [1.0, 0.84, 0.28], haloCol: [0.42, 1.0, 0.90], trailHex: '#48ffea',
    atk: 145, hp: 420, def: 20, crit: 0.15, critDmg: 0.50, perLv: { atk: 42, hp: 115, def: 6 }, cost: { coin: 1150, herb: 26, core: 24 },
    desc: 'Chí bảo trấn phái Thái Hư Tiên Môn — chuôi sen vàng, lưỡi lục ngọc ăn Bloom. Dàn sau lưng khai mở Tru Tiên Kiếm Trận!'
  },
  {
    id: 'wp_chaos_sword', slot: 'weapon', setId: 'hongmong', name: 'Hồng Mông Phá Thiên Thần Kiếm', grade: 'Hồng Mông', gradeCol: '#ff4252',
    img: 'eq_wp_immortal_jian', mesh: 'Weapon_Jian', ttMesh: 'TT_Wp_ImmortalJian', isCustomSword: true, arrayKind: 'customSword', animStyle: 'sword',
    bladeCol: [1.0, 0.32, 0.38], hiltCol: [1.0, 0.84, 0.32], haloCol: [1.0, 0.28, 0.42], trailHex: '#ff4258',
    atk: 240, hp: 750, def: 34, crit: 0.20, critDmg: 0.78, perLv: { atk: 65, hp: 185, def: 10 }, cost: { coin: 2400, herb: 45, core: 40 },
    desc: 'Thần binh Hồng Mông chí tôn sinh ra từ Hỗn Độn Thượng Giới — vệt chém huyết kim xé toạc không gian, dàn Phi Kiếm rực đỏ rực rỡ!'
  },
  {
    id: 'wp_chaos_dao', slot: 'weapon', setId: 'hongmong', name: 'Cửu U Ma Đế Đồ Long Đao', grade: 'Hồng Mông', gradeCol: '#ff4252',
    img: 'eq_wp_flame_dao', mesh: 'Weapon_BigDao', ttMesh: 'TT_Wp_FlameDao', isCustomSword: false, arrayKind: 'dao', animStyle: 'dao',
    bladeCol: [1.0, 0.22, 0.30], hiltCol: [0.95, 0.75, 0.25], haloCol: [1.0, 0.24, 0.36], trailHex: '#ff3648',
    atk: 265, hp: 680, def: 28, crit: 0.18, critDmg: 0.85, perLv: { atk: 72, hp: 165, def: 8 }, cost: { coin: 2600, herb: 48, core: 44 },
    desc: 'Ma Đao thượng cổ kết tinh từ Cửu U Huyết Vực — sát thương bạo kích hủy diệt, chuyên trị Boss Thế Giới & PK Chí Tôn!'
  },

  // ==================== 2. ĐẠO QUÁN / MŨ (6 Món) ====================
  { id: 'hm_straw',     slot: 'helm', setId: null,        name: 'Thanh Lam Bố Quán',       grade: 'Phàm Phẩm', gradeCol: '#7da8a8', img: 'ut_pk_mind',    atk: 6,   hp: 90,   def: 6,  crit: 0.01, critDmg: 0,    perLv: { atk: 3,  hp: 30,  def: 2 }, cost: { coin: 120,  herb: 4,  core: 2 }, desc: 'Mũ vải đạo sĩ nhập môn giúp tĩnh tâm định thần.' },
  { id: 'hm_thanhlam',  slot: 'helm', setId: 'thanhlam',  name: 'Thanh Lam Ngọc Quán',       grade: 'Linh Phẩm', gradeCol: '#48c8ff', img: 'ut_pk_mind',    atk: 16,  hp: 210,  def: 12, crit: 0.03, critDmg: 0.08, perLv: { atk: 6,  hp: 65,  def: 4 }, cost: { coin: 250,  herb: 9,  core: 6 }, desc: 'Ngọc quán phát thanh quang của Bộ Thanh Lam Đạo Vận.' },
  { id: 'hm_xichviem',  slot: 'helm', setId: 'xichviem',  name: 'Xích Viêm Long Lân Quán',   grade: 'Địa Phẩm',  gradeCol: '#ff7038', img: 'ut_doc1',       atk: 34,  hp: 340,  def: 18, crit: 0.05, critDmg: 0.18, perLv: { atk: 11, hp: 95,  def: 6 }, cost: { coin: 460,  herb: 14, core: 12 }, desc: 'Mũ chiến khảm vảy hỏa long, tăng mạnh công kích và chí mạng.' },
  { id: 'hm_cuutieu',   slot: 'helm', setId: 'cuutieu',   name: 'Cửu Tiêu Lôi Đình Quán',    grade: 'Thiên Phẩm',gradeCol: '#b074ff', img: 'ut_doc2',       atk: 58,  hp: 520,  def: 26, crit: 0.08, critDmg: 0.26, perLv: { atk: 18, hp: 140, def: 8 }, cost: { coin: 740,  herb: 18, core: 18 }, desc: 'Vương miện dẫn lôi khí giúp xuất chiêu nhanh và sắc bén.' },
  { id: 'hm_thaihu',    slot: 'helm', setId: 'thaihu',    name: 'Thái Hư Tinh Quang Miện',    grade: 'Tiên Phẩm', gradeCol: '#ffd858', img: 'ut_realm7',     atk: 88,  hp: 780,  def: 38, crit: 0.10, critDmg: 0.35, perLv: { atk: 26, hp: 200, def: 11}, cost: { coin: 1100, herb: 24, core: 22 }, desc: 'Tiên miện ánh sao cửu thiên, tăng toàn diện công thủ.' },
  { id: 'hm_hongmong',  slot: 'helm', setId: 'hongmong',  name: 'Hồng Mông Hỗn Độn Thiên Miện',grade: 'Hồng Mông', gradeCol: '#ff4252', img: 'ut_realm9',     atk: 145, hp: 1320, def: 58, crit: 0.14, critDmg: 0.55, perLv: { atk: 42, hp: 310, def: 16}, cost: { coin: 2200, herb: 40, core: 38 }, desc: 'Vương miện chí tôn Hồng Mông hội tụ linh khí sơ khai vũ trụ.' },

  // ==================== 3. ĐẠO BÀO / GIÁP (6 Món) ====================
  { id: 'ar_linen',          slot: 'armor', setId: null,       name: 'Thanh Lam Bố Y',            grade: 'Phàm Phẩm', gradeCol: '#7da8a8', img: 'eq_ar_cloud_robe',     atk: 2,   hp: 130,  def: 8,  crit: 0,    critDmg: 0,    perLv: { hp: 42,  def: 3 }, cost: { coin: 120,  herb: 5,  core: 2 }, desc: 'Đạo bào vải thô giúp tránh phong hàn trên núi Thanh Lam.' },
  { id: 'ar_cloud_robe',     slot: 'armor', setId: 'thanhlam', name: 'Thanh Vân Đạo Bào',         grade: 'Linh Phẩm', gradeCol: '#48c8ff', img: 'eq_ar_cloud_robe',     atk: 8,   hp: 260,  def: 16, crit: 0.01, critDmg: 0,    perLv: { hp: 82,  def: 5 }, cost: { coin: 240,  herb: 10, core: 6 }, desc: 'Đạo bào dệt từ tơ mây Thanh Lam, hộ thể vững chắc và tăng mạnh Sinh Lực.' },
  { id: 'ar_xichviem',       slot: 'armor', setId: 'xichviem', name: 'Xích Viêm Phần Thiên Giáp',  grade: 'Địa Phẩm',  gradeCol: '#ff7038', img: 'eq_ar_cloud_robe',     atk: 22,  hp: 460,  def: 26, crit: 0.02, critDmg: 0.10, perLv: { atk: 6,  hp: 125, def: 8 }, cost: { coin: 480,  herb: 15, core: 12 }, desc: 'Chiến bào rực lửa hộ thân, phản chấn kẻ địch tấn công.' },
  { id: 'ar_cuutieu',        slot: 'armor', setId: 'cuutieu',  name: 'Cửu Tiêu Lôi Văn Bảo Y',    grade: 'Thiên Phẩm',gradeCol: '#b074ff', img: 'eq_ar_celestial_robe', atk: 32,  hp: 700,  def: 38, crit: 0.04, critDmg: 0.16, perLv: { atk: 9,  hp: 175, def: 11}, cost: { coin: 780,  herb: 20, core: 18 }, desc: 'Bảo y dệt từ Lôi Tơ Cửu Thiên, kháng bạo kích cực tốt.' },
  { id: 'ar_celestial_robe', slot: 'armor', setId: 'thaihu',   name: 'Thái Hư Tinh Thần Bảo Y',   grade: 'Tiên Phẩm', gradeCol: '#38f5cc', img: 'eq_ar_celestial_robe', atk: 44,  hp: 1020, def: 52, crit: 0.05, critDmg: 0.22, dmgCut: 0.10, perLv: { atk: 12, hp: 245, def: 15}, cost: { coin: 1120, herb: 26, core: 24 }, desc: 'Tiên y dệt từ tinh quang cửu thiên, giảm 10% sát thương nhận vào và tăng mạnh phòng ngự.' },
  { id: 'ar_hongmong',       slot: 'armor', setId: 'hongmong', name: 'Hồng Mông Bất Diệt Thần Bào',grade: 'Hồng Mông', gradeCol: '#ff4252', img: 'eq_ar_celestial_robe', atk: 78,  hp: 1850, def: 86, crit: 0.08, critDmg: 0.35, dmgCut: 0.16, perLv: { atk: 24, hp: 420, def: 24}, cost: { coin: 2300, herb: 44, core: 40 }, desc: 'Thần bào bất hoại giảm 16% mọi sát thương nhận vào, trấn áp mọi Ma Tôn.' },

  // ==================== 4. HỘ TÂM NGỌC / NGỌC BỘI (6 Món) ====================
  { id: 'jd_pebble',   slot: 'jade', setId: null,       name: 'Linh Khê Thạch Bội',       grade: 'Phàm Phẩm', gradeCol: '#7da8a8', img: 'eq_jd_lotus',  atk: 8,   hp: 70,   def: 3,  crit: 0.01, critDmg: 0.05, perLv: { atk: 3,  hp: 25 }, cost: { coin: 110,  herb: 5,  core: 2 }, desc: 'Miếng ngọc mài thô giúp giữ tâm thanh tịnh.' },
  { id: 'jd_lotus',    slot: 'jade', setId: 'thanhlam', name: 'Bích Liên Hộ Tâm Ngọc',     grade: 'Linh Phẩm', gradeCol: '#48c8ff', img: 'eq_jd_lotus',  atk: 20,  hp: 160,  def: 7,  crit: 0.03, critDmg: 0.12, qiMul: 0.25, perLv: { atk: 8,  hp: 50 }, cost: { coin: 260,  herb: 12, core: 5 }, desc: 'Ngọc bội hoa sen dưỡng thần, tăng +25% tốc độ hấp thụ Linh Khí khi tu luyện.' },
  { id: 'jd_xichviem', slot: 'jade', setId: 'xichviem', name: 'Xích Viêm Hỏa Phượng Bội',  grade: 'Địa Phẩm',  gradeCol: '#ff7038', img: 'eq_jd_lotus',  atk: 42,  hp: 280,  def: 12, crit: 0.05, critDmg: 0.24, qiMul: 0.35, perLv: { atk: 14, hp: 80 }, cost: { coin: 460,  herb: 15, core: 12 }, desc: 'Ngọc bội khắc hình Hỏa Phượng thiêu đốt tinh huyết địch thủ.' },
  { id: 'jd_cuutieu',  slot: 'jade', setId: 'cuutieu',  name: 'Cửu Tiêu Thiên Lôi Bội',    grade: 'Thiên Phẩm',gradeCol: '#b074ff', img: 'eq_jd_dragon', atk: 66,  hp: 420,  def: 18, crit: 0.08, critDmg: 0.36, qiMul: 0.45, perLv: { atk: 20, hp: 110}, cost: { coin: 740,  herb: 20, core: 18 }, desc: 'Ngọc bội tích tụ Thiên Lôi, phóng đại sát thương kỹ năng & bạo kích.' },
  { id: 'jd_dragon',   slot: 'jade', setId: 'thaihu',   name: 'Cửu Long Tiên Ngọc Bội',    grade: 'Tiên Phẩm', gradeCol: '#ffd858', img: 'eq_jd_dragon', atk: 96,  hp: 620,  def: 26, crit: 0.10, critDmg: 0.48, qiMul: 0.60, perLv: { atk: 28, hp: 150}, cost: { coin: 1120, herb: 24, core: 22 }, desc: 'Cửu Long Tiên Ngọc khắc trận tụ linh, tăng +60% tốc độ hấp thụ Linh Khí & Sát Thương Bạo Kích.' },
  { id: 'jd_hongmong', slot: 'jade', setId: 'hongmong', name: 'Hồng Mông Tạo Hóa Ngọc Điệp',grade: 'Hồng Mông', gradeCol: '#ff4252', img: 'eq_jd_dragon', atk: 162, hp: 1080, def: 42, crit: 0.15, critDmg: 0.72, qiMul: 1.00, perLv: { atk: 46, hp: 250}, cost: { coin: 2300, herb: 42, core: 38 }, desc: 'Mảnh Tạo Hóa Ngọc Điệp truyền thuyết — gấp đôi tốc độ Hấp Linh Khí và bạo thương chí tử!' },

  // ==================== 5. LINH GIỚI / NHẪN (6 Món) ====================
  { id: 'rg_copper',   slot: 'ring', setId: null,       name: 'Thanh Đồng Cổ Giới',        grade: 'Phàm Phẩm', gradeCol: '#7da8a8', img: 'eq_rg_storage', atk: 10,  hp: 45,   def: 2,  crit: 0.02, critDmg: 0.06, perLv: { atk: 4,  hp: 16 }, cost: { coin: 110,  herb: 4,  core: 3 }, desc: 'Nhẫn đồng cổ có chút không gian trữ vật nhỏ.' },
  { id: 'rg_storage',  slot: 'ring', setId: 'thanhlam', name: 'Thanh Lam Trữ Vật Giới',    grade: 'Linh Phẩm', gradeCol: '#48c8ff', img: 'eq_rg_storage', atk: 24,  hp: 95,   def: 5,  crit: 0.05, critDmg: 0.15, perLv: { atk: 10, hp: 30 }, cost: { coin: 260,  herb: 8,  core: 8 }, desc: 'Nhẫn không gian trữ vật khảm linh thạch, tăng Tấn Công và Tỉ Lệ Bạo Kích.' },
  { id: 'rg_xichviem', slot: 'ring', setId: 'xichviem', name: 'Xích Viêm Ma Huyết Giới',    grade: 'Địa Phẩm',  gradeCol: '#ff7038', img: 'eq_rg_storage', atk: 46,  hp: 190,  def: 9,  crit: 0.08, critDmg: 0.28, perLv: { atk: 16, hp: 55 }, cost: { coin: 460,  herb: 12, core: 14 }, desc: 'Nhẫn ma huyết tinh luyện từ Yêu Đan Hỏa Cốc.' },
  { id: 'rg_cuutieu',  slot: 'ring', setId: 'cuutieu',  name: 'Cửu Tiêu Phá Kiếp Giới',    grade: 'Thiên Phẩm',gradeCol: '#b074ff', img: 'eq_rg_void',    atk: 74,  hp: 310,  def: 15, crit: 0.11, critDmg: 0.40, perLv: { atk: 24, hp: 80 }, cost: { coin: 740,  herb: 18, core: 20 }, desc: 'Linh giới khắc phù chú Thiên Lôi, cường hóa xuyên phá.' },
  { id: 'rg_void',     slot: 'ring', setId: 'thaihu',   name: 'Thái Hư Không Gian Thần Giới',grade:'Tiên Phẩm', gradeCol: '#ffd858', img: 'eq_rg_void',    atk: 108, hp: 460,  def: 22, crit: 0.14, critDmg: 0.54, perLv: { atk: 34, hp: 115}, cost: { coin: 1140, herb: 22, core: 24 }, desc: 'Thần giới chứa không gian hỗn độn, kích phát bạo kích chí mạng.' },
  { id: 'rg_hongmong', slot: 'ring', setId: 'hongmong', name: 'Hồng Mông Giới Chỉ Chí Tôn', grade: 'Hồng Mông', gradeCol: '#ff4252', img: 'eq_rg_void',    atk: 185, hp: 820,  def: 36, crit: 0.18, critDmg: 0.80, perLv: { atk: 54, hp: 200}, cost: { coin: 2400, herb: 40, core: 42 }, desc: 'Chí tôn thần giới Hồng Mông thống ngự vạn kiếm & không gian.' },

  // ==================== 6. ĐẠP VÂN NGOA / GIÀY (6 Món) ====================
  { id: 'bt_sandal',   slot: 'boots', setId: null,       name: 'Thanh Lam Thảo Ngoa',       grade: 'Phàm Phẩm', gradeCol: '#7da8a8', img: 'ut_pk_bond',    atk: 6,   hp: 80,   def: 4,  crit: 0.01, critDmg: 0,    perLv: { atk: 3,  hp: 26 }, cost: { coin: 110,  herb: 4,  core: 2 }, desc: 'Giày cỏ nhẹ giúp di chuyển linh hoạt trong rừng núi.' },
  { id: 'bt_thanhlam', slot: 'boots', setId: 'thanhlam', name: 'Thanh Vân Đạp Vân Ngoa',    grade: 'Linh Phẩm', gradeCol: '#48c8ff', img: 'ut_pk_bond',    atk: 16,  hp: 185,  def: 10, crit: 0.03, critDmg: 0.10, perLv: { atk: 6,  hp: 58 }, cost: { coin: 250,  herb: 9,  core: 6 }, desc: 'Giày ngự phong lướt nhẹ trên mây, tăng bạo kích & thân pháp.' },
  { id: 'bt_xichviem', slot: 'boots', setId: 'xichviem', name: 'Xích Viêm Hỏa Luân Ngoa',   grade: 'Địa Phẩm',  gradeCol: '#ff7038', img: 'ut_doc0',       atk: 34,  hp: 310,  def: 16, crit: 0.05, critDmg: 0.18, perLv: { atk: 12, hp: 90 }, cost: { coin: 460,  herb: 14, core: 12 }, desc: 'Mỗi bước chân để lại hỏa ấn thiêu đốt đất đai.' },
  { id: 'bt_cuutieu',  slot: 'boots', setId: 'cuutieu',  name: 'Cửu Tiêu Súc Địa Thành Thốn',grade:'Thiên Phẩm',gradeCol: '#b074ff', img: 'ut_doc3',       atk: 56,  hp: 490,  def: 24, crit: 0.08, critDmg: 0.28, perLv: { atk: 18, hp: 130}, cost: { coin: 740,  herb: 18, core: 18 }, desc: 'Thần ngoa lôi tốc giúp lách đòn Boss chuẩn xác.' },
  { id: 'bt_thaihu',   slot: 'boots', setId: 'thaihu',   name: 'Thái Hư Lăng Ba Thần Ngoa',  grade: 'Tiên Phẩm', gradeCol: '#ffd858', img: 'ut_realm6',     atk: 86,  hp: 740,  def: 35, crit: 0.11, critDmg: 0.38, perLv: { atk: 26, hp: 185}, cost: { coin: 1100, herb: 24, core: 22 }, desc: 'Lăng Ba Vi Bộ tuyệt đỉnh tiên giới, cộng mạnh công thủ & bạo.' },
  { id: 'bt_hongmong', slot: 'boots', setId: 'hongmong', name: 'Hồng Mông Bước Đạp Tinh Hà', grade: 'Hồng Mông', gradeCol: '#ff4252', img: 'ut_realm8',     atk: 148, hp: 1280, def: 54, crit: 0.14, critDmg: 0.60, perLv: { atk: 44, hp: 300}, cost: { coin: 2200, herb: 40, core: 38 }, desc: 'Một bước vượt ngàn dặm tinh hà, đạp tan mọi giới hạn cảnh giới!' }
];

// ==================== 5. NGOẠI TRANG 3D: TIÊN DỰC & HÀO QUANG ĐẾ TÔN ====================
window.COSMETICS_DEF = {
  wings: [
    { id: 'wing_none',      name: 'Ẩn Tiên Dực',                grade: 'Thường',   col: '#8aa4a0', atkPct: 0,    hpPct: 0,    crit: 0,    unlockHint: 'Mặc định', rgba: null },
    { id: 'wing_thanhlam',  name: 'Thanh Lam Phi Dực',          grade: 'Linh Phẩm', col: '#40ebff', atkPct: 0.05, hpPct: 0.05, crit: 0,    unlockHint: 'Đạt Trúc Cơ hoặc Vượt Ải 4 (hoặc VIP 1)', check: (st) => (st.realmIdx || 0) >= 1 || (st.maxStage || 1) >= 4 || (st.vipLv || 0) >= 1, rgba: [0.22, 0.92, 1.00, 0.90], span: 1.05, tag: 'Thanh Lam' },
    { id: 'wing_xichviem',  name: 'Xích Viêm Phượng Dực',       grade: 'Địa Phẩm',  col: '#ff6a30', atkPct: 0.10, hpPct: 0.08, crit: 0.03, unlockHint: 'Lực Chiến Kim Đan / ELO ≥ 1,050 / VIP 1', check: (st) => (st.realmIdx || 0) >= 2 || (st.arenaScore || 1000) >= 1050 || (st.vipLv || 0) >= 1, rgba: [1.00, 0.36, 0.14, 0.92], span: 1.18, tag: 'Xích Viêm' },
    { id: 'wing_cuutieu',   name: 'Cửu Tiêu Lôi Dực',           grade: 'Thiên Phẩm',col: '#b86dff', atkPct: 0.16, hpPct: 0.12, crit: 0.05, unlockHint: 'Cảnh Giới Nguyên Anh+ / Ải 25 / VIP 3', check: (st) => (st.realmIdx || 0) >= 4 || (st.maxStage || 1) >= 25 || (st.vipLv || 0) >= 3, rgba: [0.72, 0.40, 1.00, 0.94], span: 1.30, tag: 'Cửu Tiêu' },
    { id: 'wing_hongmong',  name: 'Hồng Mông Chí Tôn Thần Dực',  grade: 'Hồng Mông', col: '#ffd84d', atkPct: 0.25, hpPct: 0.20, crit: 0.08, unlockHint: 'Hóa Thần+ / ELO ≥ 1,300 / VIP 5', check: (st) => (st.realmIdx || 0) >= 6 || (st.arenaScore || 1000) >= 1300 || (st.vipLv || 0) >= 5, rgba: [1.00, 0.82, 0.26, 0.96], span: 1.44, tag: 'Hồng Mông' }
  ],
  auras: [
    { id: 'aura_none',  name: 'Tắt Hào Quang',           grade: 'Thường',   col: '#8aa4a0', atkPct: 0,    hpPct: 0,    crit: 0,    unlockHint: 'Mặc định', rgba: null },
    { id: 'aura_jade',  name: 'Thanh Ngọc Tu Tiên Luân', grade: 'Linh Phẩm', col: '#48f5c8', atkPct: 0.04, hpPct: 0.06, crit: 0,    unlockHint: 'Khai Phái Hoàn Thành Mở Đầu', check: (st) => !!st.prologueDone, rgba: [0.28, 0.96, 0.78, 0.78] },
    { id: 'aura_gold',  name: 'Hoàng Kim Đế Tôn Trận',   grade: 'Thiên Phẩm',col: '#ffd84d', atkPct: 0.10, hpPct: 0.10, crit: 0.02, unlockHint: 'Kim Đan+ / ELO ≥ 1,030 / VIP 1', check: (st) => (st.realmIdx || 0) >= 2 || (st.arenaScore || 1000) >= 1030 || (st.vipLv || 0) >= 1, rgba: [1.00, 0.80, 0.22, 0.86] },
    { id: 'aura_chaos', name: 'Hồng Mông Tạo Hóa Luân',   grade: 'Hồng Mông', col: '#ff4270', atkPct: 0.18, hpPct: 0.15, crit: 0.04, unlockHint: 'Nguyên Anh+ / Thông Thiên 10 / VIP 4', check: (st) => (st.realmIdx || 0) >= 4 || (st.towerFloor || 1) >= 10 || (st.vipLv || 0) >= 4, rgba: [0.98, 0.26, 0.48, 0.92] }
  ]
};
