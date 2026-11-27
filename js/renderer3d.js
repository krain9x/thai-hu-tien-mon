// ============================================================================
// Võ Lâm Khai Nghiệp (무림개업 1.2.3) — 24-Bone GPU Skeletal Animation + 3D BattleFx
// Authentic Unity 6 Left-Handed Renderer:
//   - Full 24-bone GPU skinning (game3d.bin + anims.bin, 20 original 30fps clips)
//   - RightHand & LeftHand 3D weapon bone-socket attachment (incl. dual sabers)
//   - Murim.View.BattleFx 3D procedural sword-qi ribbons, sky pillars, lances,
//     runic seals, shockwave rings, ground fissures, sparks & impact dim
//   - Full UV-textured 3D Town (level1) & Field Arenas (level0) + Ink Outlines
// ============================================================================

const HALL_ANCHORS = {
  main:     { x:   0.00, y: 6.60, z:  21.00 },
  yard:     { x:   0.00, y: 3.00, z:   2.00 },
  gate:     { x:   0.00, y: 6.00, z: -11.00 },
  library:  { x: -19.90, y: 4.60, z:  21.50 },
  dorm:     { x: -17.00, y: 3.90, z:   2.20 },
  pharmacy: { x:  20.00, y: 4.50, z:  19.80 },
  smithy:   { x:  20.90, y: 4.20, z:   3.75 },
  vault:    { x:  20.50, y: 4.60, z: -10.70 }
};

const TOWN_NPC_SLOTS = [
  // Upper Main Hall Terrace (y = 1.60) — Master (TT_Char_ThaiHu) is 100% UNIQUE; every disciple uses a distinct sect model!
  { group: 'main', reqId: 'master',    mesh: 'TT_Char_ThaiHu',   tex: 'TT_Tex_Char_ThaiHu',     weapon: 'TT_Wp_IronJian',     x:   0.00, y: 1.60, z:  16.90, yawDeg: -180, clip: 'Idle' },
  { group: 'main', reqId: 'yeonhwa',   mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Char_BichDao',    weapon: 'TT_Wp_FrostJian',    dual: true, x: -3.10, y: 1.60, z: 17.30, yawDeg: -172, clip: 'Stance' },
  { group: 'main', reqId: 'cheolsan',  mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_DaiNhat',    weapon: 'TT_Wp_JadeStaff',    x:  -5.80, y: 1.60, z:  17.50, yawDeg: -165, clip: 'Stance' },
  { group: 'main', reqId: 'cheonga',   mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_ThanhVan',   weapon: 'TT_Wp_JadeSpear',    x:   3.10, y: 1.60, z:  17.30, yawDeg:  172, clip: 'Idle' },
  { group: 'main', reqId: 'heugyeong', mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Char_CuuU',       weapon: 'TT_Wp_FlameDao',     x:   5.80, y: 1.60, z:  17.50, yawDeg:  165, clip: 'Stance' },

  // Martial Training Yard — 12 Distinct Non-Master Sect Trainees (DaiNhat / CuuU / HuyetSat / MacMon / VanHon — ZERO Master clones!)
  { group: 'yard', mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Trainee_Jade',  weapon: 'TT_Wp_IronJian',  x: -5.05, y: 0.00, z: -1.50, yawDeg:  90, clip: 'SwordSlash' },
  { group: 'yard', mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Trainee_Frost', weapon: 'TT_Wp_JadeSpear', x: -5.05, y: 0.00, z:  2.50, yawDeg:  90, clip: 'SpearThrust' },
  { group: 'yard', mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Trainee_Flame', weapon: 'TT_Wp_FlameDao',  x: -5.05, y: 0.00, z:  6.50, yawDeg:  90, clip: 'SaberSlash' },
  { group: 'yard', mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Trainee_Frost', weapon: 'TT_Wp_JadeSpear', x: -8.80, y: 0.00, z: -1.50, yawDeg:  90, clip: 'SpearThrust' },
  { group: 'yard', mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_MacMon',   weapon: '',                x: -8.80, y: 0.00, z:  2.50, yawDeg:  90, clip: 'Combo' },
  { group: 'yard', mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_MocThanh', weapon: 'TT_Wp_IronJian',  x: -8.80, y: 0.00, z:  6.50, yawDeg:  90, clip: 'SwordSlash' },
  { group: 'yard', mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Trainee_Flame', weapon: 'TT_Wp_FlameDao',  x:  5.05, y: 0.00, z: -1.50, yawDeg: -90, clip: 'SaberSlash' },
  { group: 'yard', mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Trainee_Jade',  weapon: 'TT_Wp_IronJian',  x:  5.05, y: 0.00, z:  2.50, yawDeg: -90, clip: 'Combo' },
  { group: 'yard', mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Trainee_Frost', weapon: 'TT_Wp_JadeSpear', x:  5.05, y: 0.00, z:  6.50, yawDeg: -90, clip: 'SpearThrust' },
  { group: 'yard', mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_HuyenThien', weapon: 'TT_Wp_JadeSpear', x: 8.80, y: 0.00, z: -1.50, yawDeg: -90, clip: 'SpearThrust' },
  { group: 'yard', mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_XichLoi',  weapon: '',                x:  8.80, y: 0.00, z:  2.50, yawDeg: -90, clip: 'Punch' },
  { group: 'yard', mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Trainee_Jade',  weapon: 'TT_Wp_IronJian',  x:  8.80, y: 0.00, z:  6.50, yawDeg: -90, clip: 'SwordSlash' },

  // Mountain Gate Guards (HuyetSat Spear Guardians)
  { group: 'gate', mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_ThanhVan', weapon: 'TT_Wp_JadeSpear', x: -2.00, y: 0.00, z: -14.20, yawDeg: -180, clip: 'Stance' },
  { group: 'gate', mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_ThanhVan', weapon: 'TT_Wp_JadeSpear', x:  2.00, y: 0.00, z: -14.20, yawDeg: -180, clip: 'Stance' },

  // Library, Pharmacy, Smithy, Dorm & Common Courtyard — 100% Distinct Non-Master Sect Cast!
  { group: 'library',  reqId: 'soyul',   mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_VanHon',     weapon: 'TT_Wp_SoulBanner',   x: -17.00, y: 0.00, z:  19.30, yawDeg: -180, clip: 'Idle' },
  { group: 'library',  reqId: 'unhak',   mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_HuyenThien', weapon: 'TT_Wp_ImmortalJian', x: -23.00, y: 0.00, z:  19.30, yawDeg: -180, clip: 'Idle' },
  { group: 'library',                    mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Trainee_Jade',    weapon: '',                   x: -20.00, y: 0.00, z:  17.50, yawDeg:  160, clip: 'SitFloor' },
  { group: 'pharmacy', reqId: 'danbi',   mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_LinhNhi',    weapon: '',                   x:  20.50, y: 0.00, z:  17.50, yawDeg: -180, clip: 'Idle' },
  { group: 'pharmacy',                   mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Trainee_Jade',    weapon: '',                   x:  24.80, y: 0.00, z:  15.20, yawDeg: -160, clip: 'Carry' },
  { group: 'smithy',   reqId: 'macheol', mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Char_HuyetSat',   weapon: 'TT_Wp_FlameDao',     x:  18.90, y: 0.00, z:   1.60, yawDeg:  -90, clip: 'SaberCharged' },
  { group: 'smithy',                     mesh: 'TT_Char_HuyetSat', tex: 'TT_Tex_Trainee_Flame',   weapon: '',                   x:  23.50, y: 0.00, z:   0.40, yawDeg: -160, clip: 'HorseStance' },
  { group: 'dorm',                       mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_MocThanh',   weapon: '',                   x: -15.50, y: 0.00, z:  -2.50, yawDeg: -150, clip: 'SitFloor' },
  { group: 'dorm',                       mesh: 'TT_Char_CuuU',     tex: 'TT_Tex_Trainee_Frost',   weapon: '',                   x: -18.50, y: 0.00, z:  -2.00, yawDeg:  150, clip: 'Idle' },
  { group: 'common',   reqId: 'makdong', mesh: 'TT_Char_DaiNhat',  tex: 'TT_Tex_Char_TieuBao',    weapon: '',                   x:  -5.00, y: 0.00, z:  10.20, yawDeg: -160, clip: 'Cheer' },
  { group: 'common',   reqId: 'sundeok', mesh: 'TT_Char_VanHon',   tex: 'TT_Tex_Char_MocThanh',   weapon: 'TT_Wp_JadeSpear',    x:  10.80, y: 0.00, z:  -2.00, yawDeg: -110, clip: 'Idle' },
  { group: 'common',   reqId: 'dolsoe',  mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_MacMon',     weapon: '',                   x: -10.80, y: 0.00, z:  -8.50, yawDeg:  120, clip: 'Punch' },
  { group: 'common',   reqId: 'harang',  mesh: 'TT_Char_MacMon',   tex: 'TT_Tex_Char_XichLoi',    weapon: '',                   x:   6.50, y: 0.00, z:  -8.80, yawDeg: -160, clip: 'Punch' }
];

// Fast Column-Major Matrix & Quaternion Math
function mulMat4(out, A, B) {
  const a00=A[0], a01=A[1], a02=A[2], a03=A[3], a10=A[4], a11=A[5], a12=A[6], a13=A[7],
        a20=A[8], a21=A[9], a22=A[10],a23=A[11],a30=A[12],a31=A[13],a32=A[14],a33=A[15];
  for (let c = 0; c < 4; c++) {
    const b0 = B[c*4], b1 = B[c*4+1], b2 = B[c*4+2], b3 = B[c*4+3];
    out[c*4]   = a00*b0 + a10*b1 + a20*b2 + a30*b3;
    out[c*4+1] = a01*b0 + a11*b1 + a21*b2 + a31*b3;
    out[c*4+2] = a02*b0 + a12*b1 + a22*b2 + a32*b3;
    out[c*4+3] = a03*b0 + a13*b1 + a23*b2 + a33*b3;
  }
}

function trsMat4(out, px, py, pz, qx, qy, qz, qw, sx, sy, sz) {
  const xx = qx*qx, yy = qy*qy, zz = qz*qz;
  const xy = qx*qy, xz = qx*qz, yz = qy*qz;
  const wx = qw*qx, wy = qw*qy, wz = qw*qz;
  out[0] = (1 - 2*(yy + zz))*sx; out[1] = (2*(xy + wz))*sx;     out[2] = (2*(xz - wy))*sx;     out[3] = 0;
  out[4] = (2*(xy - wz))*sy;     out[5] = (1 - 2*(xx + zz))*sy; out[6] = (2*(yz + wx))*sy;     out[7] = 0;
  out[8] = (2*(xz + wy))*sz;     out[9] = (2*(yz - wx))*sz;     out[10]= (1 - 2*(xx + yy))*sz; out[11]= 0;
  out[12]= px;                   out[13]= py;                   out[14]= pz;                   out[15]= 1;
}

function mulQuat(out, a, b) {
  const ax=a[0], ay=a[1], az=a[2], aw=a[3];
  const bx=b[0], by=b[1], bz=b[2], bw=b[3];
  out[0] = aw*bx + ax*bw + ay*bz - az*by;
  out[1] = aw*by - ax*bz + ay*bw + az*bx;
  out[2] = aw*bz + ax*by - ay*bx + az*bw;
  out[3] = aw*bw - ax*bx - ay*by - az*bz;
}

function nlerpQuat(out, a, b, t) {
  let bx=b[0], by=b[1], bz=b[2], bw=b[3];
  if (a[0]*bx + a[1]*by + a[2]*bz + a[3]*bw < 0) {
    bx = -bx; by = -by; bz = -bz; bw = -bw;
  }
  const it = 1 - t;
  let x = a[0]*it + bx*t, y = a[1]*it + by*t, z = a[2]*it + bz*t, w = a[3]*it + bw*t;
  const ln = Math.hypot(x, y, z, w) || 1;
  out[0] = x/ln; out[1] = y/ln; out[2] = z/ln; out[3] = w/ln;
}

function rotVecByQuat(out, q, vx, vy, vz) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  out[0] = vx + w * tx + (y * tz - z * ty);
  out[1] = vy + w * ty + (z * tx - x * tz);
  out[2] = vz + w * tz + (x * ty - y * tx);
}

function hexToRgb(hex) {
  if (Array.isArray(hex)) return hex;
  const s = (hex || '#66e3ff').replace('#', '');
  const n = parseInt(s, 16) || 0x66e3ff;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

class MurimRenderer3D {
  constructor(glCanvas, fxCanvas) {
    this.glCanvas = glCanvas;
    this.fxCanvas = fxCanvas;
    this.gl = glCanvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.ctx = fxCanvas.getContext('2d');

    this.width = 1280;
    this.height = 720;
    this.gfxQuality = (typeof localStorage !== 'undefined' && localStorage.getItem('tienmon_gfx_quality')) || 'high';
    this.dprCap = this.gfxQuality === 'low' ? 1.0 : (this.gfxQuality === 'med' ? 1.35 : 2.0);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.useBloom = (this.gfxQuality !== 'low');
    this.shadowSkip = this.gfxQuality === 'low' ? 0 : (this.gfxQuality === 'med' ? 2 : 1);
    this.outlineMode = this.gfxQuality === 'high' ? 'full' : 'hero';
    this._frameCounter = 0;

    this.mode = 'field';
    this.ready = false;
    this.animsReady = false;
    this.townReady = false;
    this.fieldReady = false;

    this.meshes = {};
    this.animManifest = null;
    this.animView = null;
    this.townGroups = {};
    this.fieldGroups = {};
    this.textures = {};
    this.texArray = null;
    this.icons2D = {};

    this.camTarget = { x: 0, y: 0, z: 6 };
    this.townPan = { x: 0, z: 0 };
    this.townOverview = false;
    this.townZoom = 1.0;
    this.shakeTime = 0;
    this.shakeMag = 0;
    this.impactDim = 0; // Dramatic anime/manhwa screen contrast dim on skills & ultimates!

    this.matProj = new Float32Array(16);
    this.matView = new Float32Array(16);
    this.matVP = new Float32Array(16);
    this.matLightVP = new Float32Array(16);
    this.matModel = new Float32Array(16);
    this.env3d = null;
    this.shadowSize = this.gfxQuality === 'med' ? 1024 : (this.gfxQuality === 'low' ? 512 : 2048);
    this.shadowFbo = null;
    this.shadowTex = null;
    this._lightPosBuf = new Float32Array(8 * 4);
    this._lightColBuf = new Float32Array(8 * 4);
    this._curLights = [];
    this._curTheme = null;
    this._curSunDir = [-0.40, 0.84, -0.36];
    this._emptyVao = null;

    // Reusable scratch buffers for 24-bone skeletal evaluation (zero GC allocations per frame!)
    this._bonePalette = new Float32Array(24 * 16);
    this._boneWorlds = Array.from({ length: 24 }, () => new Float32Array(16));
    this._localMat = new Float32Array(16);
    this._weapMat = new Float32Array(16);
    this._weapWorld = new Float32Array(16);
    this._canonQuats = Array.from({ length: 24 }, () => new Float32Array([0, 0, 0, 1]));
    this._qTmpA = new Float32Array(4);
    this._qTmpB = new Float32Array(4);
    this._qTmpC = new Float32Array(4);
    this._vTmp = new Float32Array(3);
    this._hipsPos = [0, 0.78, 0];

    // 3D BattleFx instances + Next-Gen Cultivation VFX (Bloom, Weapon Trails, Flying Swords, 3D Lightning!)
    this.vfx3D = [];
    this.flyingSwords3D = []; // Vạn Kiếm Quy Tông real 3D diving spirit weapons!
    this.backFlights = [];    // Live autonomous back-weapons physically launching off Master's back, striking & returning!
    this.backFlightTrails = []; // Curved glowing ribbons trailing live launching back-weapons!
    this.lightningBolts = []; // Cửu Thiên Thần Lôi jagged branching lightning!
    this.weaponTrailPts = []; // Dynamic weapon ribbon trail tracking RightHand!
    this.lightningFlash = 0;
    this.impactLinesT = 0;
    this.camZoomPulse = 0;
    this.camPos = [0, 12, -16];
    this.hitStopT = 0;
    this._tribTimer = 1.6;
    this.bloomReady = false;
    this.sparks2D = [];
    this.cracks2D = [];
    this.popups = [];
    this.coins = [];
    this.petals = [];
    for (let i = 0; i < 58; i++) {
      this.petals.push({
        x: (Math.random() - 0.5) * 34,
        y: Math.random() * 10 + 0.8,
        z: (Math.random() - 0.5) * 34 + 8,
        vx: -0.75 - Math.random() * 0.75,
        vy: -0.45 - Math.random() * 0.42,
        vz: 0.30 + Math.random() * 0.50,
        rot: Math.random() * 6.28,
        phase: Math.random() * 6.28,
        sz: 2.8 + Math.random() * 3.6
      });
    }

    this.hallScreenPos = {};
    this.townNpcScreenPos = {}; // Screen coords of named disciples in 3D Town for direct click interaction!
    this.dashGhosts = [];       // Thân Pháp dodge luminous 3D afterimage trails!

    if (this.gl) {
      this.initGL();
    }
    this.preload2DIcons();
    this.setupTownDrag();
    this.resize();
    const onWinResize = () => {
      this.resize();
      setTimeout(() => this.resize(), 120);
    };
    window.addEventListener('resize', onWinResize);
    window.addEventListener('orientationchange', onWinResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onWinResize);
  }

  preload2DIcons() {
    const names = [
      'coin', 'jade', 'res_scroll', 'res_pill', 'mg_st_scar', 'mg_st_bleed',
      'mg_st_break', 'mg_st_daze', 'seal_foot', 'ring_warn', 'hammer'
    ];
    for (const nm of names) {
      const img = new Image();
      img.src = `assets/img/${nm}.png`;
      this.icons2D[nm] = img;
    }
  }

  toggleTownOverview() {
    this.townOverview = !this.townOverview;
    this.townZoom = this.townOverview ? 1.38 : 0.96;
    if (this.townOverview) {
      this.townPan.x = 0;
      this.townPan.z = 2.0;
    }
    return this.townOverview;
  }

  setupTownDrag() {
    let dragging = false;
    let lastX = 0, lastY = 0;
    const activePts = new Map();
    let prevPinchDist = 0;

    this.fxCanvas.addEventListener('pointerdown', e => {
      if (this.mode !== 'town') return;
      activePts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePts.size === 1) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      } else if (activePts.size === 2) {
        dragging = false;
        const pts = Array.from(activePts.values());
        prevPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      }
    });
    window.addEventListener('pointermove', e => {
      if (this.mode !== 'town') return;
      if (activePts.has(e.pointerId)) {
        activePts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (activePts.size === 2) {
        const pts = Array.from(activePts.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        if (prevPinchDist > 5 && dist > 5) {
          const delta = (prevPinchDist - dist) * 0.0045;
          this.townZoom = Math.max(0.62, Math.min(1.55, this.townZoom + delta));
        }
        prevPinchDist = dist;
        return;
      }
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const yaw = 28 * Math.PI / 180;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const scale = 0.042 * this.townZoom;
      this.townPan.x = Math.max(-18, Math.min(18, this.townPan.x - dx * cy * scale + dy * sy * scale * 1.2));
      this.townPan.z = Math.max(-14, Math.min(18, this.townPan.z + dx * sy * scale + dy * cy * scale * 1.2));
    });
    const endPt = (e) => {
      activePts.delete(e.pointerId);
      if (activePts.size < 2) prevPinchDist = 0;
      if (activePts.size === 0) dragging = false;
    };
    window.addEventListener('pointerup', endPt);
    window.addEventListener('pointercancel', endPt);
    this.fxCanvas.addEventListener('wheel', e => {
      if (this.mode !== 'town') return;
      this.townZoom = Math.max(0.62, Math.min(1.55, this.townZoom + (e.deltaY > 0 ? 0.09 : -0.09)));
    }, { passive: true });
  }

  resize() {
    const rect = this.glCanvas.parentElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap || 2.0);
    this.width = Math.max(320, Math.floor(rect.width));
    this.height = Math.max(200, Math.floor(rect.height));
    this.glCanvas.width = Math.floor(this.width * this.dpr);
    this.glCanvas.height = Math.floor(this.height * this.dpr);
    this.fxCanvas.width = Math.floor(this.width * this.dpr);
    this.fxCanvas.height = Math.floor(this.height * this.dpr);
    if (this.gl) {
      this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
      this.initBloomFBOs();
    }
  }

  setQuality(mode = 'high') {
    const q = (mode === 'low' || mode === 'med') ? mode : 'high';
    this.gfxQuality = q;
    this.dprCap = q === 'low' ? 1.0 : (q === 'med' ? 1.35 : 2.0);
    this.useBloom = (q !== 'low');
    this.shadowSkip = q === 'low' ? 0 : (q === 'med' ? 2 : 1);
    this.outlineMode = q === 'high' ? 'full' : 'hero';
    try { localStorage.setItem('tienmon_gfx_quality', q); } catch (_) {}
    const targetSh = q === 'med' ? 1024 : (q === 'low' ? 512 : 2048);
    if (this.gl && this.shadowTex && this.shadowFbo) {
      const gl = this.gl;
      if (this.shadowSize !== targetSh) {
        this.shadowSize = targetSh;
        gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, targetSh, targetSh, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
      }
      // Clear depth to 1.0 when dynamic shadows are off in Low mode so nothing casts dark artifacts
      if (this.shadowSkip === 0) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
        gl.viewport(0, 0, this.shadowSize, this.shadowSize);
        gl.clearDepth(1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
    this.resize();
    return q;
  }

  initBloomFBOs() {
    const gl = this.gl;
    if (!gl || !this.bloomExtractProg) return;
    const w = Math.max(64, this.glCanvas.width);
    const h = Math.max(64, this.glCanvas.height);
    if (this._bloomW === w && this._bloomH === h && this.bloomReady) return;
    this._bloomW = w;
    this._bloomH = h;
    const bw = Math.max(32, w >> 1);
    const bh = Math.max(32, h >> 1);

    const makeColorTex = (tw, th) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };

    // Full-res Scene FBO (Color + Depth)
    this.sceneColorTex = makeColorTex(w, h);
    this.sceneDepthRb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.sceneDepthRb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
    this.sceneFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneColorTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.sceneDepthRb);

    // Half-res Ping-Pong Bloom FBOs
    this.bloomTexA = makeColorTex(bw, bh);
    this.bloomFboA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.bloomTexA, 0);

    this.bloomTexB = makeColorTex(bw, bh);
    this.bloomFboB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.bloomTexB, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.bloomReady = true;
  }

  compileProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    return prog;
  }

  initGL() {
    const gl = this.gl;

    // 1. 24-Bone GPU Skinned Character / Weapon Toon + Soft Shadow + Rim + Ink-Outline Shader
    const charVs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec2 aUv;
      layout(location=2) in vec3 aNorm;
      layout(location=3) in vec4 aJoints;
      layout(location=4) in vec4 aWeights;

      uniform mat4 uVP;
      uniform mat4 uLightVP;
      uniform mat4 uModel;
      uniform mat4 uBones[24];
      uniform float uSkinned;
      uniform vec2 uUvScale;
      uniform float uOutline;

      out vec2 vUv;
      out vec3 vNorm;
      out vec3 vWorldPos;
      out vec4 vLightPos;

      void main() {
        vec3 localPos = aPos;
        vec3 localNorm = aNorm;
        if (uSkinned > 0.5) {
          ivec4 j = ivec4(aJoints + 0.5);
          mat4 skin = uBones[j.x] * aWeights.x
                    + uBones[j.y] * aWeights.y
                    + uBones[j.z] * aWeights.z
                    + uBones[j.w] * aWeights.w;
          localPos = (skin * vec4(aPos, 1.0)).xyz;
          localNorm = normalize(mat3(skin) * aNorm);
        }
        localPos += localNorm * uOutline;
        vec4 wp = uModel * vec4(localPos, 1.0);
        vWorldPos = wp.xyz;
        vLightPos = uLightVP * wp;
        vNorm = normalize(mat3(uModel) * localNorm);
        vUv = aUv * uUvScale;
        gl_Position = uVP * wp;
      }
    `;
    const charFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      in vec3 vNorm;
      in vec3 vWorldPos;
      in vec4 vLightPos;
      uniform sampler2D uTex;
      uniform sampler2D uShadowMap;
      uniform vec4 uTint;
      uniform float uUseTex;
      uniform float uFlash;
      uniform float uUnlit;
      uniform float uIsOutline;
      uniform vec3 uSunDir;
      uniform vec3 uSunCol;
      uniform vec3 uAmbCol;
      uniform vec3 uCamPos;
      uniform vec4 uRimCol;
      out vec4 outColor;
      void main() {
        if (uIsOutline > 0.5) {
          // Crisp Donghua deep indigo-ink silhouette outline (cleaner than muddy black!)
          outColor = vec4(0.08, 0.09, 0.14, uTint.a);
          return;
        }
        vec4 base = uUseTex > 0.5 ? texture(uTex, vUv) : vec4(1.0);
        base *= uTint;
        if (base.a < 0.12) discard;
        vec3 col = base.rgb;
        if (uUnlit < 0.5) {
          vec3 N = normalize(vNorm);
          vec3 L = normalize(uSunDir);
          vec3 V = normalize(uCamPos - vWorldPos);
          vec3 H = normalize(L + V);

          // 3-band Donghua stylized cel-shading (matte silk fabric, zero wet plastic shine!)
          float ndl = dot(N, L) * 0.5 + 0.5;
          float band1 = smoothstep(0.36, 0.46, ndl);
          float band2 = smoothstep(0.64, 0.76, ndl);
          vec3 shadowCol = uAmbCol * vec3(0.92, 0.96, 1.10);
          vec3 midCol = mix(uAmbCol * 1.08, uSunCol * 0.94, 0.58);
          vec3 hiCol = uSunCol * 1.02;
          vec3 litCol = mix(shadowCol, midCol, band1);
          litCol = mix(litCol, hiCol, band2 * 0.52);

          // Subtle warm ground bounce fill on lower surfaces
          float bounce = clamp(-N.y * 0.5 + 0.5, 0.0, 1.0) * 0.08;
          col = col * (litCol + vec3(0.22, 0.26, 0.24) * bounce);

          // Soft matte fabric sheen (replaces wet glossy specular highlight)
          float spec = pow(max(dot(N, H), 0.0), 18.0) * smoothstep(0.52, 0.74, ndl) * 0.055;
          col += uSunCol * spec;

          // Tight edge-only Fresnel silhouette rim (pow 4.6 keeps fabric crisp & dry!)
          float fres = pow(clamp(1.0 - max(dot(N, V), 0.0), 0.0, 1.0), 4.6);
          col += uRimCol.rgb * fres * uRimCol.a;
        }
        col = mix(col, vec3(1.0, 0.97, 0.90), clamp(uFlash, 0.0, 1.0));
        outColor = vec4(col, base.a);
      }
    `;
    this.charProg = this.compileProgram(charVs, charFs);
    this.uChar = {
      VP: gl.getUniformLocation(this.charProg, 'uVP'),
      LightVP: gl.getUniformLocation(this.charProg, 'uLightVP'),
      Model: gl.getUniformLocation(this.charProg, 'uModel'),
      Bones: gl.getUniformLocation(this.charProg, 'uBones[0]'),
      Skinned: gl.getUniformLocation(this.charProg, 'uSkinned'),
      UvScale: gl.getUniformLocation(this.charProg, 'uUvScale'),
      Outline: gl.getUniformLocation(this.charProg, 'uOutline'),
      Tex: gl.getUniformLocation(this.charProg, 'uTex'),
      ShadowMap: gl.getUniformLocation(this.charProg, 'uShadowMap'),
      Tint: gl.getUniformLocation(this.charProg, 'uTint'),
      UseTex: gl.getUniformLocation(this.charProg, 'uUseTex'),
      Flash: gl.getUniformLocation(this.charProg, 'uFlash'),
      Unlit: gl.getUniformLocation(this.charProg, 'uUnlit'),
      IsOutline: gl.getUniformLocation(this.charProg, 'uIsOutline'),
      SunDir: gl.getUniformLocation(this.charProg, 'uSunDir'),
      SunCol: gl.getUniformLocation(this.charProg, 'uSunCol'),
      AmbCol: gl.getUniformLocation(this.charProg, 'uAmbCol'),
      CamPos: gl.getUniformLocation(this.charProg, 'uCamPos'),
      RimCol: gl.getUniformLocation(this.charProg, 'uRimCol')
    };

    // 2. Full 3D Wuxia Diorama Scene Shader (Shadows + Animated Water + Wind Sway + Point Lights + Mist!)
    const sceneVs = `#version 300 es
      layout(location=0) in vec3 aPosNorm;
      layout(location=1) in vec2 aUv;
      layout(location=2) in vec3 aNorm;
      layout(location=3) in float aLayer;
      layout(location=4) in vec4 aColor;
      layout(location=5) in float aFlags;

      uniform mat4 uVP;
      uniform mat4 uLightVP;
      uniform vec3 uBboxMin;
      uniform vec3 uBboxSpan;
      uniform float uOutline;
      uniform float uTime;
      uniform float uIsEnv;

      out vec2 vUv;
      out vec3 vNorm;
      out float vLayer;
      out vec4 vColor;
      out float vFlags;
      out vec3 vWorldPos;
      out vec4 vLightPos;

      bool isTownAlphaOrWater(float ly) {
        int id = int(ly + 0.5);
        return (id == 2 || id == 8 || id == 11 || id == 13 || id == 14 || id == 15
             || id == 20 || id == 22 || id == 23 || id == 26 || id == 28 || id == 29
             || id == 31 || id == 32);
      }

      void main() {
        vec3 wp = uBboxMin + aPosNorm * uBboxSpan;

        // Live wind sway on foliage canopies, bamboo, grass tufts & silk clan banners!
        bool doSway = (uIsEnv > 0.5 && aFlags > 1.5 && aFlags < 2.5)
                   || (uIsEnv < 0.5 && isTownAlphaOrWater(aLayer) && int(aLayer + 0.5) != 2);
        if (doSway) {
          float hFactor = clamp((wp.y - 0.12) * 0.28, 0.0, 1.2);
          float w = sin(uTime * 2.1 + wp.x * 0.45 + wp.z * 0.35) * 0.095
                  + cos(uTime * 3.4 + wp.z * 0.70) * 0.035;
          wp.x += w * hFactor;
          wp.z += w * 0.55 * hFactor;
        }

        if (uOutline > 0.0001) {
          bool skipOut = (aFlags > 0.5) || length(wp.xz) > 52.0 || (uIsEnv < 0.5 && isTownAlphaOrWater(aLayer));
          if (skipOut) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            return;
          }
          wp += normalize(aNorm) * uOutline;
        }

        vWorldPos = wp;
        vLightPos = uLightVP * vec4(wp, 1.0);
        vUv = aUv;
        vNorm = normalize(aNorm);
        vLayer = aLayer;
        vColor = vec4(aColor.rgb * 2.0, aColor.a);
        vFlags = aFlags;
        gl_Position = uVP * vec4(wp, 1.0);
      }
    `;
    const sceneFs = `#version 300 es
      precision highp float;
      precision highp sampler2DArray;
      in vec2 vUv;
      in vec3 vNorm;
      in float vLayer;
      in vec4 vColor;
      in float vFlags;
      in vec3 vWorldPos;
      in vec4 vLightPos;

      uniform sampler2DArray uTexArr;
      uniform sampler2D uShadowMap;
      uniform vec3 uFogColor;
      uniform vec3 uSceneTint;
      uniform vec3 uSunDir;
      uniform vec3 uSunCol;
      uniform vec3 uAmbCol;
      uniform float uTime;
      uniform float uIsOutline;
      uniform float uIsEnv;
      uniform int uLightCount;
      uniform vec4 uLightPos[8];
      uniform vec4 uLightCol[8];
      out vec4 outColor;

      float sampleShadow(vec4 lp, float ndl) {
        vec3 sc = lp.xyz / lp.w * 0.5 + 0.5;
        if (sc.x <= 0.01 || sc.x >= 0.99 || sc.y <= 0.01 || sc.y >= 0.99 || sc.z > 0.995 || sc.z < 0.0) {
          return 1.0;
        }
        float bias = max(0.0014, 0.0032 * (1.0 - max(0.0, ndl)));
        vec2 texel = vec2(1.0 / 2048.0);
        float vis = 0.0;
        for (int ox = -1; ox <= 1; ox++) {
          for (int oy = -1; oy <= 1; oy++) {
            float d = texture(uShadowMap, sc.xy + vec2(float(ox), float(oy)) * texel).r;
            vis += (sc.z - bias <= d) ? 1.0 : 0.0;
          }
        }
        return vis / 9.0;
      }

      void main() {
        float ly = floor(vLayer + 0.5);
        vec4 texCol = ly > 0.5 ? texture(uTexArr, vec3(vUv, ly)) : vec4(1.0);
        float alpha = texCol.a * vColor.a;
        if (alpha < 0.32) discard;

        if (uIsOutline > 0.5) {
          outColor = vec4(0.11, 0.09, 0.09, 1.0);
          return;
        }

        vec3 N = normalize(vNorm);
        vec3 L = normalize(uSunDir);

        // Animated Glowing Molten Lava River (procedural dark basalt crust + flowing crimson-orange magma veins!)
        if (uIsEnv > 0.5 && vFlags > 4.5) {
          vec2 wp = vWorldPos.xz * 0.42;
          float w1 = sin(wp.x * 1.7 + uTime * 0.65 + cos(wp.y * 1.4 - uTime * 0.45));
          float w2 = cos(wp.y * 2.3 - uTime * 0.55 + sin(wp.x * 1.9 + uTime * 0.35));
          float w3 = sin((wp.x + wp.y) * 3.1 + uTime * 0.9);
          float vein = abs(w1 * 0.5 + w2 * 0.35 + w3 * 0.15);
          float heat = 1.0 - smoothstep(0.06, 0.56, vein);
          vec3 crust = vec3(0.16, 0.06, 0.07);
          vec3 magma = vec3(0.95, 0.24, 0.05);
          vec3 hot   = vec3(1.15, 0.66, 0.14);
          vec3 lCol = mix(crust, magma, smoothstep(0.15, 0.72, heat));
          lCol = mix(lCol, hot, smoothstep(0.72, 0.98, heat));
          outColor = vec4(clamp(lCol, 0.0, 1.0), 1.0);
          return;
        }

        // Emissive glowing lanterns, flames, spirit crystals & Bagua runes!
        if (uIsEnv > 0.5 && vFlags > 3.5) {
          float pulse = 0.94 + 0.14 * sin(uTime * 6.5 + vWorldPos.x * 1.7 + vWorldPos.z * 1.3);
          vec3 glow = texCol.rgb * vColor.rgb * 1.24 * pulse;
          outColor = vec4(clamp(glow, 0.0, 1.0), 1.0);
          return;
        }

        // Animated Crystal Jade Water (flowing dual ripples, sun glints & shoreline sheen!)
        bool isWater = (uIsEnv > 0.5 && vFlags > 2.5 && vFlags < 3.5) || (uIsEnv < 0.5 && int(ly) == 2);
        if (isWater) {
          vec2 uvA = vUv + vec2(uTime * 0.14, uTime * 0.05);
          vec2 uvB = vUv * 1.55 + vec2(-uTime * 0.11, uTime * 0.09);
          vec3 tA = texture(uTexArr, vec3(uvA, ly)).rgb;
          vec3 tB = texture(uTexArr, vec3(uvB, ly)).rgb;
          float wave = (tA.r + tB.g) * 0.5;
          float sparkle = smoothstep(0.62, 0.92, tA.b * tB.b * 1.65) * (0.65 + 0.35 * sin(uTime * 4.5 + vWorldPos.x * 2.4 + vWorldPos.z * 1.7));
          vec3 deepCol = vColor.rgb * vec3(0.20, 0.48, 0.58);
          vec3 shalCol = vColor.rgb * vec3(0.36, 0.74, 0.78);
          vec3 wCol = mix(deepCol, shalCol, clamp(wave * 1.25, 0.0, 1.0)) * uSceneTint;
          float sh = sampleShadow(vLightPos, 0.8);
          wCol *= mix(0.62, 1.04, sh);
          wCol += uSunCol * sparkle * 0.48;
          // Warm lantern reflections dancing on water
          for (int i = 0; i < 8; i++) {
            if (i >= uLightCount) break;
            vec3 lp = uLightPos[i].xyz;
            float rad = uLightPos[i].w;
            float d = length(lp - vWorldPos);
            float att = clamp(1.0 - d / rad, 0.0, 1.0);
            wCol += uLightCol[i].rgb * att * att * (0.28 + 0.28 * wave);
          }
          float fd = clamp(max(0.0, length(vWorldPos.xz - vec2(0.0, 10.0)) - 34.0) * 0.014, 0.0, 0.68);
          wCol = mix(wCol, uFogColor, fd);
          outColor = vec4(clamp(wCol, 0.0, 1.0), 0.95);
          return;
        }

        // Standard Stylized Wuxia Terrain & Architecture Shading (Rich Painterly Exposure + Crisp Shadows!)
        vec3 base = texCol.rgb * vColor.rgb * uSceneTint;

        // Subtle world-space painterly tonal modulation on ground so large surfaces feel hand-painted
        if (N.y > 0.72) {
          float patchN = sin(vWorldPos.x * 0.27) * cos(vWorldPos.z * 0.23) * 0.08
                       + sin((vWorldPos.x - vWorldPos.z) * 0.58) * 0.04;
          base *= (1.0 + patchN);
        }

        float rawNdl = dot(N, L);
        float ndl = (uIsEnv < 0.5 && vFlags > 0.5) ? 0.72 : rawNdl;
        float sh = sampleShadow(vLightPos, max(0.0, rawNdl));

        // Crisp stylized sunlight vs cool atmospheric mountain shadows!
        float sunMask = smoothstep(-0.08, 0.35, ndl) * sh;
        vec3 hemiAmb = mix(uAmbCol * 0.54, uAmbCol * 0.78, clamp(N.y * 0.5 + 0.5, 0.0, 1.0));
        vec3 direct = uSunCol * (0.58 + 0.46 * max(0.0, ndl));
        vec3 col = base * mix(hemiAmb, direct, sunMask);

        // Subtle warm rim catchlight on vertical silhouettes (roofs, cliffs, trunks, balustrades)
        float rim = pow(clamp(1.0 - abs(N.y), 0.0, 1.0), 2.2) * max(0.0, rawNdl + 0.25) * 0.08 * sh;
        col += uSunCol * rim;

        // Live Dynamic Warm Point Lights (Lanterns, Fire Braziers, Spirit Censers!)
        for (int i = 0; i < 8; i++) {
          if (i >= uLightCount) break;
          vec3 lp = uLightPos[i].xyz;
          float rad = uLightPos[i].w;
          vec3 toL = lp - vWorldPos;
          float d = length(toL);
          if (d < rad) {
            float att = 1.0 - d / rad;
            att = att * att;
            float ldot = max(0.25, dot(N, normalize(toL)) * 0.55 + 0.45);
            col += base * uLightCol[i].rgb * att * ldot * 0.48;
          }
        }

        // Valley & Distance Atmospheric Mountain Mist
        float dist = length(vWorldPos.xz - vec2(0.0, 10.0));
        float distFog = clamp(max(0.0, dist - 30.0) * 0.015, 0.0, 0.72);
        float heightMist = clamp((1.2 - vWorldPos.y) * 0.04, 0.0, 0.10) * clamp(dist * 0.025, 0.0, 1.0);
        col = mix(col, uFogColor, clamp(distFog + heightMist, 0.0, 0.76));

        // Crisp Wuxia painterly vibrance & grounded contrast (NO overexposure!)
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(luma), col, 1.18);
        col = clamp(pow(max(col, vec3(0.0)), vec3(1.06)), 0.0, 1.0);
        outColor = vec4(col, 1.0);
      }
    `;
    this.sceneProg = this.compileProgram(sceneVs, sceneFs);
    this.uScene = {
      VP: gl.getUniformLocation(this.sceneProg, 'uVP'),
      LightVP: gl.getUniformLocation(this.sceneProg, 'uLightVP'),
      BboxMin: gl.getUniformLocation(this.sceneProg, 'uBboxMin'),
      BboxSpan: gl.getUniformLocation(this.sceneProg, 'uBboxSpan'),
      Outline: gl.getUniformLocation(this.sceneProg, 'uOutline'),
      Time: gl.getUniformLocation(this.sceneProg, 'uTime'),
      IsEnv: gl.getUniformLocation(this.sceneProg, 'uIsEnv'),
      TexArr: gl.getUniformLocation(this.sceneProg, 'uTexArr'),
      ShadowMap: gl.getUniformLocation(this.sceneProg, 'uShadowMap'),
      FogColor: gl.getUniformLocation(this.sceneProg, 'uFogColor'),
      SceneTint: gl.getUniformLocation(this.sceneProg, 'uSceneTint'),
      SunDir: gl.getUniformLocation(this.sceneProg, 'uSunDir'),
      SunCol: gl.getUniformLocation(this.sceneProg, 'uSunCol'),
      AmbCol: gl.getUniformLocation(this.sceneProg, 'uAmbCol'),
      IsOutline: gl.getUniformLocation(this.sceneProg, 'uIsOutline'),
      LightCount: gl.getUniformLocation(this.sceneProg, 'uLightCount'),
      LightPos: gl.getUniformLocation(this.sceneProg, 'uLightPos[0]'),
      LightCol: gl.getUniformLocation(this.sceneProg, 'uLightCol[0]')
    };

    // 2b. Painted Shan-Shui Wuxia Sky & Distant Ink-Wash Mountain Backdrop Shader
    const skyVs = `#version 300 es
      out vec2 vUv;
      void main() {
        vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
        vUv = p * 0.5 + 0.5;
        gl_Position = vec4(p, 0.9999, 1.0);
      }
    `;
    const skyFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform vec3 uSkyTop;
      uniform vec3 uSkyMid;
      uniform vec3 uSkyHor;
      uniform vec3 uMtnCol;
      uniform float uTime;
      uniform float uMoon;
      out vec4 outColor;
      void main() {
        float y = clamp(vUv.y, 0.0, 1.0);
        vec3 col = mix(uSkyHor, uSkyMid, smoothstep(0.0, 0.55, y));
        col = mix(col, uSkyTop, smoothstep(0.45, 1.0, y));

        // Luminous Sun or Pale Moon Disc with atmospheric halo
        vec2 sunP = vec2(0.76, 0.82);
        float sd = length((vUv - sunP) * vec2(1.75, 1.0));
        vec3 discCol = uMoon > 0.5 ? vec3(0.95, 0.96, 1.0) : vec3(1.0, 0.95, 0.80);
        col += discCol * exp(-sd * 5.2) * 0.42;
        col = mix(col, discCol * 1.15, smoothstep(0.055, 0.036, sd));

        // Drifting silk ink-wash clouds
        float c1 = sin(vUv.x * 7.5 + uTime * 0.06) * cos(vUv.y * 12.0 - 1.2) * 0.5 + 0.5;
        float c2 = sin(vUv.x * 13.0 - uTime * 0.04 + 2.1) * 0.5 + 0.5;
        float cloud = smoothstep(0.58, 0.88, c1 * 0.65 + c2 * 0.35) * smoothstep(0.42, 0.88, y);
        col = mix(col, mix(uSkyHor, vec3(1.0), 0.45), cloud * 0.28);

        // Two subtle layered Shan-Shui ink-wash mountain ranges along the horizon
        float m1 = 0.52 + 0.075 * sin(vUv.x * 6.2 + 0.6) + 0.035 * sin(vUv.x * 15.5 + 2.1);
        float m2 = 0.46 + 0.065 * sin(vUv.x * 8.4 + 2.8) + 0.025 * cos(vUv.x * 19.0);
        if (y < m1) col = mix(col, mix(uMtnCol, uSkyHor, 0.42), smoothstep(m1, m1 - 0.015, y) * 0.55);
        if (y < m2) col = mix(col, mix(uMtnCol, uSkyHor, 0.22), smoothstep(m2, m2 - 0.015, y) * 0.65);

        outColor = vec4(col, 1.0);
      }
    `;
    this.skyProg = this.compileProgram(skyVs, skyFs);
    this.uSky = {
      SkyTop: gl.getUniformLocation(this.skyProg, 'uSkyTop'),
      SkyMid: gl.getUniformLocation(this.skyProg, 'uSkyMid'),
      SkyHor: gl.getUniformLocation(this.skyProg, 'uSkyHor'),
      MtnCol: gl.getUniformLocation(this.skyProg, 'uMtnCol'),
      Time: gl.getUniformLocation(this.skyProg, 'uTime'),
      Moon: gl.getUniformLocation(this.skyProg, 'uMoon')
    };
    this._emptyVao = gl.createVertexArray();

    // 2c. Real-Time 2048x2048 Directional Sun Shadow Depth Programs & FBO!
    const shSceneVs = `#version 300 es
      layout(location=0) in vec3 aPosNorm;
      layout(location=3) in float aLayer;
      layout(location=5) in float aFlags;
      uniform mat4 uLightVP;
      uniform vec3 uBboxMin;
      uniform vec3 uBboxSpan;
      uniform float uIsEnv;
      void main() {
        if (uIsEnv > 0.5 && aFlags > 2.5) {
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          return;
        }
        vec3 wp = uBboxMin + aPosNorm * uBboxSpan;
        gl_Position = uLightVP * vec4(wp, 1.0);
      }
    `;
    const shCharVs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=3) in vec4 aJoints;
      layout(location=4) in vec4 aWeights;
      uniform mat4 uLightVP;
      uniform mat4 uModel;
      uniform mat4 uBones[24];
      uniform float uSkinned;
      void main() {
        vec3 lp = aPos;
        if (uSkinned > 0.5) {
          ivec4 j = ivec4(aJoints + 0.5);
          mat4 skin = uBones[j.x] * aWeights.x + uBones[j.y] * aWeights.y
                    + uBones[j.z] * aWeights.z + uBones[j.w] * aWeights.w;
          lp = (skin * vec4(aPos, 1.0)).xyz;
        }
        gl_Position = uLightVP * (uModel * vec4(lp, 1.0));
      }
    `;
    const shFs = `#version 300 es
      precision mediump float;
      void main() {}
    `;
    this.shadowSceneProg = this.compileProgram(shSceneVs, shFs);
    this.uShScene = {
      LightVP: gl.getUniformLocation(this.shadowSceneProg, 'uLightVP'),
      BboxMin: gl.getUniformLocation(this.shadowSceneProg, 'uBboxMin'),
      BboxSpan: gl.getUniformLocation(this.shadowSceneProg, 'uBboxSpan'),
      IsEnv: gl.getUniformLocation(this.shadowSceneProg, 'uIsEnv')
    };
    this.shadowCharProg = this.compileProgram(shCharVs, shFs);
    this.uShChar = {
      LightVP: gl.getUniformLocation(this.shadowCharProg, 'uLightVP'),
      Model: gl.getUniformLocation(this.shadowCharProg, 'uModel'),
      Bones: gl.getUniformLocation(this.shadowCharProg, 'uBones[0]'),
      Skinned: gl.getUniformLocation(this.shadowCharProg, 'uSkinned')
    };

    // Create 2048x2048 DEPTH_COMPONENT24 Shadow FBO
    const sSz = this.shadowSize;
    this.shadowTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, sSz, sSz, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.shadowFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTex, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Initialize Procedural Stylized Xianxia 3D Diorama Map Engine (Field + Floating Immortal Sect Town!)
    if (window.MurimEnv3D) {
      this.env3d = new window.MurimEnv3D(gl);
      this.fieldReady = true;
      this.townReady = true;
    }

    // 2d. Offscreen WebGL2 Post-Processing Bloom Shaders (Radiant Immortal VFX Glow!)
    const postVs = `#version 300 es
      out vec2 vUv;
      void main() {
        vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
        vUv = p * 0.5 + 0.5;
        gl_Position = vec4(p, 0.0, 1.0);
      }
    `;
    const bloomExtFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uSrc;
      out vec4 outColor;
      void main() {
        vec3 c = texture(uSrc, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float soft = smoothstep(0.87, 1.04, br);
        outColor = vec4(c * soft, 1.0);
      }
    `;
    const bloomBlurFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uSrc;
      uniform vec2 uDir;
      out vec4 outColor;
      void main() {
        vec3 sum = texture(uSrc, vUv).rgb * 0.227027;
        float w[4] = float[4](0.1945946, 0.1216216, 0.054054, 0.016216);
        for (int i = 1; i <= 4; i++) {
          vec2 off = uDir * float(i) * 1.6;
          sum += texture(uSrc, vUv + off).rgb * w[i - 1];
          sum += texture(uSrc, vUv - off).rgb * w[i - 1];
        }
        outColor = vec4(sum, 1.0);
      }
    `;
    const bloomCompFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uScene;
      uniform sampler2D uBloom;
      uniform float uFlash;
      out vec4 outColor;
      void main() {
        vec3 base = texture(uScene, vUv).rgb;
        vec3 glow = texture(uBloom, vUv).rgb;
        // Soft highlight compression before bloom so white jade steps stay detailed while VFX still radiate!
        vec3 hdr = base * 0.96 + glow * 0.44 + vec3(0.75, 0.90, 1.0) * uFlash * 0.42;
        // ACES Filmic Tone-Mapping for rich Donghua contrast & vibrant jade/gold saturation
        vec3 mapped = (hdr * (2.51 * hdr + 0.03)) / (hdr * (2.43 * hdr + 0.59) + 0.14);
        // Subtle cinematic ink-jade edge vignette
        vec2 d = vUv - 0.5;
        float vig = 1.0 - dot(d, d) * 0.30;
        mapped *= clamp(vig, 0.76, 1.0);
        outColor = vec4(clamp(mapped, 0.0, 1.0), 1.0);
      }
    `;
    this.bloomExtractProg = this.compileProgram(postVs, bloomExtFs);
    this.bloomBlurProg = this.compileProgram(postVs, bloomBlurFs);
    this.bloomCompositeProg = this.compileProgram(postVs, bloomCompFs);
    this.uBloomExt = { Src: gl.getUniformLocation(this.bloomExtractProg, 'uSrc') };
    this.uBloomBlur = { Src: gl.getUniformLocation(this.bloomBlurProg, 'uSrc'), Dir: gl.getUniformLocation(this.bloomBlurProg, 'uDir') };
    this.uBloomComp = {
      Scene: gl.getUniformLocation(this.bloomCompositeProg, 'uScene'),
      Bloom: gl.getUniformLocation(this.bloomCompositeProg, 'uBloom'),
      Flash: gl.getUniformLocation(this.bloomCompositeProg, 'uFlash')
    };

    // 3. Murim.View.BattleFx 3D Procedural Sword-Qi & Martial VFX Shader
    const vfxVs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec2 aUv;
      uniform mat4 uVP;
      uniform mat4 uModel;
      out vec2 vUv;
      void main() {
        vUv = aUv;
        gl_Position = uVP * (uModel * vec4(aPos, 1.0));
      }
    `;
    const vfxFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform vec4 uColor;      // rgb + alpha
      uniform vec3 uCoreColor;  // white-hot inner qi core
      uniform float uProg;      // 0..1 animation progress
      uniform float uStyle;     // 0=crescentArc, 1=shockRing, 2=skyPillar, 3=lance, 4=runicSeal
      out vec4 outColor;

      void main() {
        float u = vUv.x; // along arc / circumference (0..1)
        float v = vUv.y; // across width / height (0..1)
        float alpha = 0.0;
        vec3 col = uColor.rgb;

        if (uStyle < 0.5) {
          // 0: Donghua Sweeping Crescent Sword-Qi — vivid elemental plasma + crisp bright cutting edge (no white-out!)
          float headFade = smoothstep(0.0, 0.14, u) * smoothstep(1.0, 0.52 - uProg * 0.28, u);
          float outerEdge = smoothstep(0.04, 0.84, v) * smoothstep(1.0, 0.86, v);
          float plasma = 0.66 + 0.22 * sin(v * 28.0 + u * 14.0 - uProg * 18.0) + 0.14 * cos(v * 48.0 - u * 22.0 + uProg * 12.0);
          alpha = headFade * outerEdge * plasma * 0.85;
          float hot = smoothstep(0.68, 0.94, v) * (0.85 + 0.15 * sin(u * 25.0 - uProg * 16.0));
          col = mix(uColor.rgb * 1.05, uCoreColor * 1.08, hot * 0.62);
        } else if (uStyle < 1.5) {
          // 1: ShockRing — crisp expanding Xianxia qi shockwave with inner rune ripple
          float rim = smoothstep(0.18, 0.80, v) * smoothstep(1.0, 0.86, v);
          float inner = smoothstep(0.30, 0.36, v) * smoothstep(0.44, 0.36, v) * 0.42;
          float wave = 0.78 + 0.22 * sin(u * 50.265 + uProg * 16.0);
          alpha = (rim + inner) * wave * 0.72;
          col = mix(uColor.rgb * 1.05, uCoreColor * 1.05, smoothstep(0.68, 0.92, v) * 0.52);
        } else if (uStyle < 2.5) {
          // 2: SkyStroke / PillarMesh — towering translucent celestial sword-qi sky pillar (saturated color, never solid white!)
          float baseGlow = smoothstep(1.0, 0.08, v);
          float streaks = 0.46 + 0.32 * sin(u * 50.265 - uProg * 24.0 + v * 6.0) + 0.22 * cos(u * 88.0 + uProg * 18.0);
          alpha = baseGlow * streaks * 0.54;
          col = mix(uColor.rgb * 1.02, uCoreColor * 1.05, smoothstep(0.42, 0.0, v) * 0.48);
        } else if (uStyle < 3.5) {
          // 3: SwordLine / Needle / Lance — razor-sharp piercing celestial beam!
          float lenMask = smoothstep(0.0, 0.18, u) * smoothstep(1.0, 0.60, u);
          float coreMask = 1.0 - abs(v * 2.0 - 1.0);
          alpha = lenMask * pow(max(0.0, coreMask), 1.45) * 0.86;
          col = mix(uColor.rgb * 1.05, uCoreColor * 1.10, pow(max(0.0, coreMask), 2.8) * 0.70);
        } else if (uStyle < 4.5) {
          // 4: CastSeal — luminous rotating Xianxia Bagua & Celestial Trigram Array!
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;
          float a = atan(p.y, p.x);
          float outerRing = smoothstep(0.038, 0.0, abs(r - 0.91));
          float midRing = smoothstep(0.022, 0.0, abs(r - 0.73));
          float innerRing = smoothstep(0.036, 0.0, abs(r - 0.54));
          float spokes = (r > 0.53 && r < 0.92) ? smoothstep(0.048, 0.0, abs(sin(a * 4.0))) : 0.0;
          float runes = (r > 0.60 && r < 0.86) ? step(0.35, sin(a * 24.0 + uProg * 4.0)) * 0.62 : 0.0;
          float star = (r < 0.53) ? smoothstep(0.052, 0.0, abs(r - (0.32 + 0.14 * cos(a * 4.0)))) * 0.68 : 0.0;
          float fillGlow = (1.0 - r) * 0.12;
          alpha = clamp(outerRing + midRing * 0.6 + innerRing + spokes * 0.75 + runes + star + fillGlow, 0.0, 1.0) * 0.68;
          col = mix(uColor.rgb * 1.04, uCoreColor * 1.06, clamp(outerRing + innerRing + star, 0.0, 1.0) * 0.45);
        } else if (uStyle < 5.5) {
          // 5: 3D Ascending Dragon-Qi Double Helix Spiral Ribbon!
          float tail = smoothstep(0.0, 0.16, u) * smoothstep(1.0, 0.72, u);
          float core = 1.0 - abs(v * 2.0 - 1.0);
          float pulse = 0.72 + 0.28 * sin(u * 30.0 - uProg * 22.0);
          alpha = tail * pow(max(0.0, core), 1.45) * pulse * 0.68;
          col = mix(uColor.rgb * 1.05, uCoreColor * 1.08, pow(max(0.0, core), 2.8) * 0.55);
        } else {
          // 6: Blooming 8-Petal Celestial Immortal Lotus Mandala!
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;
          float a = atan(p.y, p.x);
          float petalEdge = 0.58 + 0.36 * abs(sin(a * 4.0));
          float petalOutline = smoothstep(0.052, 0.0, abs(r - petalEdge));
          float innerPetal = smoothstep(0.044, 0.0, abs(r - (0.28 + 0.24 * abs(cos(a * 4.0)))));
          float fill = smoothstep(petalEdge, 0.15, r) * 0.16;
          alpha = clamp(petalOutline + innerPetal * 0.78 + fill, 0.0, 1.0) * 0.66;
          col = mix(uColor.rgb * 1.05, uCoreColor * 1.08, clamp(petalOutline + innerPetal, 0.0, 1.0) * 0.48);
        }

        alpha *= uColor.a * (1.0 - pow(uProg, 1.8));
        if (alpha < 0.02) discard;
        outColor = vec4(col, alpha);
      }
    `;
    this.vfxProg = this.compileProgram(vfxVs, vfxFs);
    this.uVfx = {
      VP: gl.getUniformLocation(this.vfxProg, 'uVP'),
      Model: gl.getUniformLocation(this.vfxProg, 'uModel'),
      Color: gl.getUniformLocation(this.vfxProg, 'uColor'),
      CoreColor: gl.getUniformLocation(this.vfxProg, 'uCoreColor'),
      Prog: gl.getUniformLocation(this.vfxProg, 'uProg'),
      Style: gl.getUniformLocation(this.vfxProg, 'uStyle')
    };

    this.whiteTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    this.meshes._quad = this.createUnriggedMesh(
      new Float32Array([
        -0.5, 0, -0.5,  0, 1,  0, 1, 0,
        -0.5, 0,  0.5,  0, 0,  0, 1, 0,
         0.5, 0,  0.5,  1, 0,  0, 1, 0,
         0.5, 0, -0.5,  1, 1,  0, 1, 0
      ]),
      new Uint32Array([0, 1, 2, 0, 2, 3])
    );
    this.meshes._disc = this.buildDiscMesh(24);
    this.meshes._orb = this.buildOrbMesh(12, 8);
    this.meshes._furnace = this.buildFurnaceMesh(10);
    // Procedural painted metallic/rune weapon textures (Damascus blade + engraved imperial gold!)
    this.initProceduralWeaponTextures();
    this.initSculptedPetMeshes();
    // 4 Bespoke High-Detail Multi-Part 3D Xianxia Weapon Sets (Sword, Dragon Dao, Halberd Spear, Lotus Staff!)
    this.meshes._swordBlade = this.buildCelestialSwordBladeMesh();
    this.meshes._swordHilt = this.buildCelestialSwordHiltMesh();
    this.meshes._swordCore = this.buildCelestialSwordCoreMesh();
    this.meshes._daoBlade = this.buildDragonDaoBladeMesh();
    this.meshes._daoHilt = this.buildDragonDaoHiltMesh();
    this.meshes._daoCore = this.buildDragonDaoCoreMesh();
    this.meshes._spearBlade = this.buildThunderHalberdBladeMesh();
    this.meshes._spearHilt = this.buildThunderHalberdHiltMesh();
    this.meshes._spearCore = this.buildThunderHalberdCoreMesh();
    this.meshes._staffBlade = this.buildLotusStaffBladeMesh();
    this.meshes._staffHilt = this.buildLotusStaffHiltMesh();
    this.meshes._staffCore = this.buildLotusStaffCoreMesh();
    this.meshes._haloRing = this.buildHaloRingMesh(32, 0.88, 1.0);

    // Build 3D BattleFx Procedural Geometries
    this.vfxMeshes = {
      arc: this.buildVfxSlashArcMesh(30, Math.PI * 1.38),
      spin: this.buildVfxSlashArcMesh(36, Math.PI * 1.88),
      ring: this.buildVfxRingMesh(32),
      pillar: this.buildVfxPillarMesh(20),
      lance: this.buildVfxLanceMesh(),
      seal: this.buildVfxQuadMesh(),
      helix: this.buildVfxHelixMesh(44)
    };
  }

  createVfxMesh(verts5, indices16) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts5, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return { vao, count: indices16.length };
  }

  buildVfxSlashArcMesh(segs = 30, sweepRad = Math.PI * 1.38) {
    // Tapered crescent ribbon centered on +Z forward (a=0 is +Z, sweeping from -sweep/2 to +sweep/2)
    const v = [];
    const idx = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const a = (u - 0.5) * sweepRad;
      const taper = Math.sin(u * Math.PI); // 0 at tips -> 1 at apex!
      const rIn = Math.max(0.18, 1.0 - 0.62 * taper);
      const rOut = 1.0 + 0.14 * taper;
      const sa = Math.sin(a), ca = Math.cos(a);
      v.push(sa * rIn,  0, ca * rIn,  u, 0.0);
      v.push(sa * rOut, 0, ca * rOut, u, 1.0);
    }
    for (let i = 0; i < segs; i++) {
      const o = i * 2;
      idx.push(o, o + 1, o + 3, o, o + 3, o + 2);
    }
    return this.createVfxMesh(new Float32Array(v), new Uint16Array(idx));
  }

  buildVfxRingMesh(segs = 32) {
    const v = [];
    const idx = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const a = u * Math.PI * 2;
      const sa = Math.sin(a), ca = Math.cos(a);
      v.push(sa * 0.62, 0.03, ca * 0.62, u, 0.0);
      v.push(sa * 1.00, 0.03, ca * 1.00, u, 1.0);
    }
    for (let i = 0; i < segs; i++) {
      const o = i * 2;
      idx.push(o, o + 1, o + 3, o, o + 3, o + 2);
    }
    return this.createVfxMesh(new Float32Array(v), new Uint16Array(idx));
  }

  buildVfxPillarMesh(segs = 20) {
    const v = [];
    const idx = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const a = u * Math.PI * 2;
      const sa = Math.sin(a), ca = Math.cos(a);
      v.push(sa * 0.50, 0.0, ca * 0.50, u, 0.0);
      v.push(sa * 0.34, 1.0, ca * 0.34, u, 1.0);
    }
    for (let i = 0; i < segs; i++) {
      const o = i * 2;
      idx.push(o, o + 1, o + 3, o, o + 3, o + 2);
    }
    return this.createVfxMesh(new Float32Array(v), new Uint16Array(idx));
  }

  buildVfxLanceMesh() {
    // Crossed X-fin 3D glowing lance/beam along Z in [-0.5 .. +0.5]
    const v = [
      // Horizontal fin
      -0.5, 0, -0.5, 0, 0,   0.5, 0, -0.5, 0, 1,   0.5, 0, 0.5, 1, 1,  -0.5, 0, 0.5, 1, 0,
      // Vertical fin
       0, -0.5, -0.5, 0, 0,  0, 0.5, -0.5, 0, 1,   0, 0.5, 0.5, 1, 1,   0, -0.5, 0.5, 1, 0
    ];
    const idx = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];
    return this.createVfxMesh(new Float32Array(v), new Uint16Array(idx));
  }

  buildVfxQuadMesh() {
    const v = [
      -0.5, 0.03, -0.5, 0, 0,
      -0.5, 0.03,  0.5, 0, 1,
       0.5, 0.03,  0.5, 1, 1,
       0.5, 0.03, -0.5, 1, 0
    ];
    return this.createVfxMesh(new Float32Array(v), new Uint16Array([0, 1, 2, 0, 2, 3]));
  }

  buildVfxHelixMesh(segs = 44) {
    // 3D Ascending Double-Helix Immortal Qi Spiral Ribbon (2 intertwined strands rising 0..1!)
    const v = [], idx = [];
    for (let strand = 0; strand < 2; strand++) {
      const baseV = v.length / 5;
      const ph = strand * Math.PI;
      for (let i = 0; i <= segs; i++) {
        const u = i / segs;
        const a = u * Math.PI * 4.5 + ph;
        const r = 0.58 + 0.36 * Math.sin(u * Math.PI);
        const cx = Math.cos(a) * r, cz = Math.sin(a) * r, cy = u;
        const w = 0.16 * Math.sin(u * Math.PI);
        v.push(cx, cy - w, cz, u, 0.0);
        v.push(cx * 1.15, cy + w, cz * 1.15, u, 1.0);
      }
      for (let i = 0; i < segs; i++) {
        const o = baseV + i * 2;
        idx.push(o, o + 1, o + 3, o, o + 3, o + 2);
      }
    }
    return this.createVfxMesh(new Float32Array(v), new Uint16Array(idx));
  }

  // Procedural Painted Metallic/Rune Weapon Textures (crisp Donghua anime weapon sheen & carved runes!)
  initProceduralWeaponTextures() {
    const gl = this.gl;
    const makeTex = (drawFn) => {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const c = cv.getContext('2d');
      drawFn(c, 256, 256);
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return t;
    };

    // 1. Tempered Crystal-Damascus Blade with luminous beveled cutting edge & carved Xianxia fuller runes!
    this.textures._wpBladeTex = makeTex((c, w, h) => {
      const g = c.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0.00, '#ffffff');
      g.addColorStop(0.16, '#d4f6ff');
      g.addColorStop(0.38, '#6f90a8');
      g.addColorStop(0.50, '#ffffff'); // Central luminous spine ridge!
      g.addColorStop(0.62, '#6f90a8');
      g.addColorStop(0.84, '#d4f6ff');
      g.addColorStop(1.00, '#ffffff');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      // Subtle vertical metallic streaks + carved celestial rune diamonds along center fuller
      c.fillStyle = 'rgba(255,255,255,0.22)';
      for (let y = 0; y < h; y += 14) c.fillRect(0, y, w, 3);
      c.strokeStyle = 'rgba(255,255,255,0.92)';
      c.lineWidth = 4;
      for (let y = 24; y < h - 20; y += 36) {
        c.beginPath();
        c.moveTo(w * 0.5, y - 10); c.lineTo(w * 0.5 + 14, y);
        c.lineTo(w * 0.5, y + 10); c.lineTo(w * 0.5 - 14, y);
        c.closePath(); c.stroke();
      }
    });

    // 2. Antique Imperial Gold-Bronze Filigree + Silk-Wrapped Grip texture!
    this.textures._wpGoldTex = makeTex((c, w, h) => {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0.0, '#fff2b0');
      g.addColorStop(0.35, '#d6a034');
      g.addColorStop(0.7, '#7c4d14');
      g.addColorStop(1.0, '#f8d268');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(42, 24, 8, 0.45)';
      c.lineWidth = 5;
      for (let i = -h; i < w + h; i += 24) {
        c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke();
        c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke();
      }
      c.strokeStyle = 'rgba(255, 246, 198, 0.55)';
      c.lineWidth = 3;
      for (let y = 20; y < h; y += 42) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      }
    });

    // 3. Painted Phoenix Plumage Texture (Emerald-Jade Feathers with Golden Barbs & Luminous Tips!)
    this.textures._petFeatherTex = makeTex((c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0.00, '#105c56');
      g.addColorStop(0.45, '#26b89e');
      g.addColorStop(0.80, '#62f2d2');
      g.addColorStop(1.00, '#ffe378');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let row = 0; row < 8; row++) {
        const y = row * (h / 8);
        c.strokeStyle = row > 5 ? 'rgba(255, 232, 128, 0.72)' : 'rgba(8, 42, 42, 0.36)';
        c.lineWidth = 3;
        for (let x = 0; x < w; x += 28) {
          c.beginPath();
          c.moveTo(x, y); c.quadraticCurveTo(x + 14, y + 18, x + 28, y);
          c.stroke();
        }
      }
      c.strokeStyle = 'rgba(255, 250, 210, 0.42)';
      c.lineWidth = 2;
      for (let x = 14; x < w; x += 28) {
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
      }
    });

    // 4. Painted Celestial Thunder Dragon Scales Texture (Royal Sapphire-Indigo + Electric Cyan Rim!)
    this.textures._petScaleTex = makeTex((c, w, h) => {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0.0, '#1e1b6e');
      g.addColorStop(0.5, '#3b2ea8');
      g.addColorStop(1.0, '#2248a8');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let r = 0; r < 10; r++) {
        for (let col = 0; col < 10; col++) {
          const cx = col * 28 + (r % 2) * 14, cy = r * 26;
          c.fillStyle = (r + col) % 3 === 0 ? 'rgba(92, 198, 255, 0.28)' : 'rgba(18, 12, 54, 0.34)';
          c.beginPath(); c.arc(cx, cy, 13, 0, Math.PI); c.fill();
          c.strokeStyle = 'rgba(130, 224, 255, 0.58)';
          c.lineWidth = 2;
          c.beginPath(); c.arc(cx, cy, 13, 0.15, Math.PI - 0.15); c.stroke();
        }
      }
    });

    // 5. Painted Mystic Xuanwu Tortoise Shell Texture (Jade-Emerald Hex Plates + Carved Gold Bagua Lines!)
    this.textures._petShellTex = makeTex((c, w, h) => {
      c.fillStyle = '#14583c';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#f2cc5c';
      c.lineWidth = 4;
      for (let y = 0; y <= h; y += 44) {
        for (let x = 0; x <= w; x += 48) {
          const ox = x + ((y / 44) % 2) * 24;
          c.fillStyle = 'rgba(34, 148, 98, 0.55)';
          c.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2;
            const px = ox + Math.cos(a) * 20, py = y + Math.sin(a) * 20;
            if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.closePath(); c.fill(); c.stroke();
        }
      }
    });

    // 6. Painted Nine-Tailed Celestial Fox Fur Texture (Pearl-Cream to Vibrant Sakura-Rose Ombre!)
    this.textures._petFurTex = makeTex((c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0.00, '#fff7fb');
      g.addColorStop(0.55, '#ffd4e6');
      g.addColorStop(0.85, '#ff78ad');
      g.addColorStop(1.00, '#e63e7c');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      c.lineWidth = 2;
      for (let x = 8; x < w; x += 16) {
        c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + 5, h * 0.5, x - 3, h); c.stroke();
      }
    });
  }

  // Geometry helper for crisp sculpted 3D Xianxia weapons (lofted cross-sections & swept curved wings!)
  _weaponLoft(v, idx, rings, capBottom = false, capTopTip = null) {
    const addTri = (a, b, c, ua, ub, uc) => {
      const ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2];
      const vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2];
      let nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const o = v.length / 8;
      v.push(a[0],a[1],a[2], ua[0],ua[1], nx,ny,nz, b[0],b[1],b[2], ub[0],ub[1], nx,ny,nz, c[0],c[1],c[2], uc[0],uc[1], nx,ny,nz);
      idx.push(o, o+1, o+2);
    };
    const m = rings[0].length;
    for (let i = 0; i < rings.length - 1; i++) {
      const v0 = i / Math.max(1, rings.length - 1), v1 = (i + 1) / Math.max(1, rings.length - 1);
      for (let k = 0; k < m; k++) {
        const kn = (k + 1) % m;
        const u0 = k / m, u1 = (k + 1) / m;
        addTri(rings[i][k], rings[i][kn], rings[i+1][kn], [u0, v0], [u1, v0], [u1, v1]);
        addTri(rings[i][k], rings[i+1][kn], rings[i+1][k], [u0, v0], [u1, v1], [u0, v1]);
      }
    }
    if (capBottom && rings.length > 0) {
      const r0 = rings[0];
      let cx = 0, cy = 0, cz = 0;
      for (const p of r0) { cx += p[0]; cy += p[1]; cz += p[2]; }
      const ctr = [cx / m, cy / m, cz / m];
      for (let k = 0; k < m; k++) addTri(r0[(k+1)%m], r0[k], ctr, [0,0], [1,0], [0.5,0.5]);
    }
    if (capTopTip && rings.length > 0) {
      const rl = rings[rings.length - 1];
      for (let k = 0; k < m; k++) addTri(rl[k], rl[(k+1)%m], capTopTip, [k/m, 0.9], [(k+1)/m, 0.9], [0.5, 1.0]);
    }
  }

  _weaponRing(cx, cy, cz, rx, rz, segs = 8) {
    const out = [];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      out.push([cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz]);
    }
    return out;
  }

  // ===== 1. SCULPTED XIANXIA CELESTIAL IMMORTAL SWORD (6-Facet Beveled Jian + Swept Lotus Wings!) =====
  buildCelestialSwordBladeMesh() {
    const v = [], idx = [];
    // 6-vertex beveled double-edged Xianxia Jian profile (sharp edges + broad fuller faces!)
    const makeProf = (y, w, t) => [
      [ w, y, 0], [ w*0.42, y,  t], [-w*0.42, y,  t],
      [-w, y, 0], [-w*0.42, y, -t], [ w*0.42, y, -t]
    ];
    const rings = [
      makeProf(0.04, 0.115, 0.032),
      makeProf(0.22, 0.092, 0.028),
      makeProf(0.55, 0.106, 0.029), // Subtle graceful leaf flare mid-blade!
      makeProf(1.02, 0.088, 0.025),
      makeProf(1.36, 0.056, 0.018)
    ];
    this._weaponLoft(v, idx, rings, true, [0, 1.72, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildCelestialSwordHiltMesh() {
    const v = [], idx = [];
    // Tapered octagonal wrapped grip + flared pommel bell!
    const grip = [
      this._weaponRing(0, -0.44, 0, 0.068, 0.068, 8),
      this._weaponRing(0, -0.37, 0, 0.085, 0.085, 8),
      this._weaponRing(0, -0.30, 0, 0.042, 0.042, 8),
      this._weaponRing(0, -0.04, 0, 0.046, 0.046, 8),
      this._weaponRing(0,  0.04, 0, 0.095, 0.058, 8)
    ];
    this._weaponLoft(v, idx, grip, true, [0, 0.09, 0]);
    // Swept Curved Winged Lotus Crossguard (left & right curving upward like Donghua immortal swords!)
    for (const sgn of [-1, 1]) {
      const wing = [
        [[0.04*sgn, -0.02,  0.048], [0.04*sgn, 0.07,  0.042], [0.04*sgn, 0.07, -0.042], [0.04*sgn, -0.02, -0.048]],
        [[0.15*sgn,  0.01,  0.036], [0.15*sgn, 0.09,  0.030], [0.15*sgn, 0.09, -0.030], [0.15*sgn,  0.01, -0.036]],
        [[0.26*sgn,  0.08,  0.022], [0.25*sgn, 0.14,  0.018], [0.25*sgn, 0.14, -0.018], [0.26*sgn,  0.08, -0.022]]
      ];
      this._weaponLoft(v, idx, wing, false, [0.33*sgn, 0.21, 0]);
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildCelestialSwordCoreMesh() {
    const v = [], idx = [];
    // Blazing recessed Spirit Crystal Core Spine + Guard Medallion Gem + Floating Pommel Jewel!
    const core = [
      this._weaponRing(0, 0.12, 0, 0.024, 0.040, 4),
      this._weaponRing(0, 0.65, 0, 0.028, 0.038, 4),
      this._weaponRing(0, 1.25, 0, 0.016, 0.026, 4)
    ];
    this._weaponLoft(v, idx, core, true, [0, 1.54, 0]);
    const gem = [
      this._weaponRing(0, -0.01, 0, 0.056, 0.068, 6),
      this._weaponRing(0,  0.04, 0, 0.072, 0.082, 6),
      this._weaponRing(0,  0.09, 0, 0.042, 0.058, 6)
    ];
    this._weaponLoft(v, idx, gem, true, [0, 0.12, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  // ===== 2. SCULPTED XÍCH VIÊM TRẢM LONG ĐẠI ĐAO (Curved Swept Chinese Dragon Broadsword!) =====
  buildDragonDaoBladeMesh() {
    const v = [], idx = [];
    // Curved broad Guan Dao / Trảm Long Đao: spine curves gently backward, wide cutting belly flares near tip!
    const st = [
      { y: 0.04, xBack: -0.06, xEdge: 0.11, t: 0.036 },
      { y: 0.34, xBack: -0.07, xEdge: 0.15, t: 0.034 },
      { y: 0.72, xBack: -0.09, xEdge: 0.20, t: 0.032 },
      { y: 1.12, xBack: -0.14, xEdge: 0.26, t: 0.030 },
      { y: 1.44, xBack: -0.20, xEdge: 0.22, t: 0.024 },
      { y: 1.62, xBack: -0.14, xEdge: 0.10, t: 0.016 }
    ];
    const rings = st.map(r => [
      [r.xEdge, r.y, 0],
      [(r.xBack + r.xEdge)*0.5, r.y,  r.t],
      [r.xBack, r.y,  r.t*0.65],
      [r.xBack, r.y, -r.t*0.65],
      [(r.xBack + r.xEdge)*0.5, r.y, -r.t]
    ]);
    this._weaponLoft(v, idx, rings, true, [-0.04, 1.78, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildDragonDaoHiltMesh() {
    const v = [], idx = [];
    const grip = [
      this._weaponRing(0, -0.58, 0, 0.088, 0.088, 8),
      this._weaponRing(0, -0.46, 0, 0.048, 0.048, 8),
      this._weaponRing(0, -0.05, 0, 0.055, 0.055, 8),
      this._weaponRing(0.02, 0.05, 0, 0.155, 0.090, 8), // Bold dragon-jaw collar guard!
      this._weaponRing(0.02, 0.12, 0, 0.115, 0.065, 8)
    ];
    this._weaponLoft(v, idx, grip, true, [0.02, 0.16, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildDragonDaoCoreMesh() {
    const v = [], idx = [];
    // Molten glowing lava cutting edge running along the curved broadsword belly!
    const st = [
      { y: 0.14, x0: 0.07, x1: 0.135, t: 0.018 },
      { y: 0.56, x0: 0.12, x1: 0.205, t: 0.018 },
      { y: 1.08, x0: 0.18, x1: 0.280, t: 0.016 },
      { y: 1.46, x0: 0.14, x1: 0.235, t: 0.014 }
    ];
    const rings = st.map(r => [
      [r.x1, r.y, 0], [r.x0, r.y, r.t], [r.x0, r.y, -r.t]
    ]);
    this._weaponLoft(v, idx, rings, true, [-0.02, 1.78, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  // ===== 3. SCULPTED CỬU TIÊU LÔI ĐÌNH PHƯƠNG THIÊN HỌA KÍCH (Twin-Crescent Halberd Spear!) =====
  buildThunderHalberdBladeMesh() {
    const v = [], idx = [];
    // Central leaf-shaped spear point (y = 1.05..1.98)
    const spear = [
      [[ 0.075, 1.05, 0], [0, 1.05,  0.032], [-0.075, 1.05, 0], [0, 1.05, -0.032]],
      [[ 0.105, 1.32, 0], [0, 1.32,  0.036], [-0.105, 1.32, 0], [0, 1.32, -0.036]],
      [[ 0.072, 1.66, 0], [0, 1.66,  0.024], [-0.072, 1.66, 0], [0, 1.66, -0.024]]
    ];
    this._weaponLoft(v, idx, spear, true, [0, 2.02, 0]);
    // Twin Swept Crescent Moon Halberd Side-Blades (iconic Donghua Phương Thiên Họa Kích!)
    for (const sgn of [-1, 1]) {
      const cres = [
        [[0.05*sgn, 1.02,  0.022], [0.05*sgn, 1.24,  0.022], [0.05*sgn, 1.24, -0.022], [0.05*sgn, 1.02, -0.022]],
        [[0.22*sgn, 0.94,  0.018], [0.24*sgn, 1.30,  0.018], [0.24*sgn, 1.30, -0.018], [0.22*sgn, 0.94, -0.018]],
        [[0.30*sgn, 1.06,  0.012], [0.28*sgn, 1.44,  0.012], [0.28*sgn, 1.44, -0.012], [0.30*sgn, 1.06, -0.012]]
      ];
      this._weaponLoft(v, idx, cres, false, [0.20*sgn, 1.62, 0]);
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildThunderHalberdHiltMesh() {
    const v = [], idx = [];
    const shaft = [
      this._weaponRing(0, -0.78, 0, 0.015, 0.015, 6),
      this._weaponRing(0, -0.62, 0, 0.058, 0.058, 8),
      this._weaponRing(0, -0.48, 0, 0.038, 0.038, 8),
      this._weaponRing(0,  0.94, 0, 0.042, 0.042, 8),
      this._weaponRing(0,  1.06, 0, 0.095, 0.095, 8), // Ornate collar under spearhead!
      this._weaponRing(0,  1.15, 0, 0.058, 0.058, 8)
    ];
    this._weaponLoft(v, idx, shaft, true, [0, 1.18, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildThunderHalberdCoreMesh() {
    const v = [], idx = [];
    // Glowing thunder orb nestled in the halberd collar + blazing spear ridge!
    const orb = [
      this._weaponRing(0, 1.00, 0, 0.045, 0.065, 6),
      this._weaponRing(0, 1.12, 0, 0.088, 0.095, 6),
      this._weaponRing(0, 1.24, 0, 0.045, 0.065, 6)
    ];
    this._weaponLoft(v, idx, orb, true, [0, 1.88, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  // ===== 4. SCULPTED HUYỀN THIÊN HỖN NGUYÊN CÔN / LOTUS VAJRA STAFF! =====
  buildLotusStaffBladeMesh() {
    const v = [], idx = [];
    // 4-Petal Open Golden Lotus Crown Finial cradling the blazing spirit pearl!
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a), pa = -sa, pb = ca;
      const petal = [
        [[ca*0.06+pa*0.04, 1.12, sa*0.06+pb*0.04], [ca*0.06-pa*0.04, 1.12, sa*0.06-pb*0.04], [ca*0.10-pa*0.03, 1.12, sa*0.10-pb*0.03], [ca*0.10+pa*0.03, 1.12, sa*0.10+pb*0.03]],
        [[ca*0.18+pa*0.05, 1.36, sa*0.18+pb*0.05], [ca*0.18-pa*0.05, 1.36, sa*0.18-pb*0.05], [ca*0.23-pa*0.04, 1.36, sa*0.23-pb*0.04], [ca*0.23+pa*0.04, 1.36, sa*0.23+pb*0.04]]
      ];
      this._weaponLoft(v, idx, petal, true, [ca*0.12, 1.66, sa*0.12]);
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildLotusStaffHiltMesh() {
    const v = [], idx = [];
    const body = [
      this._weaponRing(0, -0.80, 0, 0.082, 0.082, 8),
      this._weaponRing(0, -0.66, 0, 0.046, 0.046, 8),
      this._weaponRing(0,  0.00, 0, 0.044, 0.044, 8),
      this._weaponRing(0,  0.96, 0, 0.052, 0.052, 8),
      this._weaponRing(0,  1.12, 0, 0.115, 0.115, 8)
    ];
    this._weaponLoft(v, idx, body, true, [0, 1.18, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildLotusStaffCoreMesh() {
    const v = [], idx = [];
    // Radiant Spirit Pearl floating inside the 4-petal Golden Lotus Crown!
    const pearl = [
      this._weaponRing(0, 1.24, 0, 0.06, 0.06, 8),
      this._weaponRing(0, 1.38, 0, 0.14, 0.14, 8),
      this._weaponRing(0, 1.52, 0, 0.06, 0.06, 8)
    ];
    this._weaponLoft(v, idx, pearl, true, [0, 1.58, 0]);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  // Unified Renderer for all 3D Xianxia Weapons (Hand, Back-Array & Live Flights! Uses Cel-Stylized Tu-Tien 3D Pack + Procedural Fallback!)
  drawSculptedWeapon3D(arrayKind, modelMat, wVis, alpha = 1.0, glowBoost = 0) {
    // 1. Prefer high-detail Donghua Cel-Shaded 3D Xianxia Weapon meshes from tutien_pack!
    const ttKey = (wVis && wVis.ttMesh)
      || (arrayKind === 'dao' ? 'TT_Wp_FlameDao'
        : (arrayKind === 'spear' ? 'TT_Wp_ThunderSpear'
          : (arrayKind === 'staff' ? 'TT_Wp_JadeStaff' : 'TT_Wp_IronJian')));
    const ttMesh = this.meshes[ttKey];
    if (ttMesh && ttMesh.texName) {
      const bright = 1.04 + glowBoost * 0.14;
      this.drawCharMesh(ttKey, modelMat, ttMesh.texName, [bright, bright, bright, alpha], 1, 1, glowBoost * 0.22, 0, true, false);
      return;
    }
    const bladeCol = (wVis && wVis.bladeCol) || [0.56, 1.0, 0.98];
    const hiltCol = (wVis && wVis.hiltCol) || [0.98, 0.80, 0.32];
    const key = arrayKind === 'dao' ? 'dao' : (arrayKind === 'spear' ? 'spear' : (arrayKind === 'staff' ? 'staff' : 'sword'));
    const mHilt = `_${key}Hilt`, mBlade = `_${key}Blade`, mCore = `_${key}Core`;
    if (!this.meshes[mBlade]) return;
    // 1. Ornate Imperial Gold-Bronze Hilt / Shaft / Lotus Guard (textured + crisp outline!)
    this.drawCharMesh(mHilt, modelMat, '_wpGoldTex', [hiltCol[0], hiltCol[1], hiltCol[2], alpha], 1, 1, 0.12 + glowBoost * 0.25, 0, true, false);
    // 2. Tempered Crystal-Damascus Engraved Blade / Halberd / Lotus Crown (textured + crisp rim!)
    const bladeUnlit = glowBoost > 0.25 ? 1 : 0;
    this.drawCharMesh(mBlade, modelMat, '_wpBladeTex', [bladeCol[0] * 1.08, bladeCol[1] * 1.08, bladeCol[2] * 1.08, alpha], 1, 1, 0.22 + glowBoost * 0.35, bladeUnlit, true, false);
    // 3. Blazing Unlit Elemental Core Rune / Lava Edge / Spirit Pearl (triggers radiant Post-Processing Bloom!)
    this.drawCharMesh(mCore, modelMat, '', [Math.min(1.2, bladeCol[0] * 1.25), Math.min(1.2, bladeCol[1] * 1.25), Math.min(1.2, bladeCol[2] * 1.25), alpha], 1, 1, 0.55 + glowBoost * 0.3, 1, false, false);
  }

  buildHaloRingMesh(segs = 28, rIn = 0.86, rOut = 1.0) {
    const v = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      v.push(c * rIn, s * rIn, 0, i / segs, 0, 0, 0, 1);
      v.push(c * rOut, s * rOut, 0, i / segs, 1, 0, 0, 1);
    }
    for (let i = 0; i < segs; i++) {
      const o = i * 2;
      idx.push(o, o+1, o+3, o, o+3, o+2);
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  createUnriggedMesh(verts8, indices32) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts8, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);
    gl.disableVertexAttribArray(3);
    gl.disableVertexAttribArray(4);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices32, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return { vao, count: indices32.length, skinned: false };
  }

  createSkinnedCharVAO(binBuf, meta, isSkinned) {
    const gl = this.gl;
    const vc = meta.vCount;
    const ic = meta.iCount;
    const [minX, minY, minZ, spanX, spanY, spanZ] = meta.bbox;
    const dv = new DataView(binBuf);

    // Unpack positions/UVs/normals to Float32 + keep joints4 & weights4 in interleaved 40B VBO
    const buf = new ArrayBuffer(vc * 40);
    const f32 = new Float32Array(buf);
    const u8 = new Uint8Array(buf);
    let vo = meta.vOff;
    for (let i = 0; i < vc; i++) {
      const qx = dv.getUint16(vo, true);
      const qy = dv.getUint16(vo + 2, true);
      const qz = dv.getUint16(vo + 4, true);
      const qu = dv.getUint16(vo + 6, true);
      const qv = dv.getUint16(vo + 8, true);
      const qnx = dv.getInt8(vo + 12);
      const qny = dv.getInt8(vo + 13);
      const qnz = dv.getInt8(vo + 14);
      const fb = i * 10;
      f32[fb]     = minX + (qx / 65535) * spanX;
      f32[fb + 1] = minY + (qy / 65535) * spanY;
      f32[fb + 2] = minZ + (qz / 65535) * spanZ;
      f32[fb + 3] = qu / 65535;
      f32[fb + 4] = qv / 65535;
      f32[fb + 5] = qnx / 127;
      f32[fb + 6] = qny / 127;
      f32[fb + 7] = qnz / 127;
      const ub = i * 40 + 32;
      u8[ub]     = dv.getUint8(vo + 16);
      u8[ub + 1] = dv.getUint8(vo + 17);
      u8[ub + 2] = dv.getUint8(vo + 18);
      u8[ub + 3] = dv.getUint8(vo + 19);
      u8[ub + 4] = dv.getUint8(vo + 20);
      u8[ub + 5] = dv.getUint8(vo + 21);
      u8[ub + 6] = dv.getUint8(vo + 22);
      u8[ub + 7] = dv.getUint8(vo + 23);
      vo += 24;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 40, 20);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.UNSIGNED_BYTE, false, 40, 32);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 4, gl.UNSIGNED_BYTE, true, 40, 36);

    const indices = new Uint32Array(binBuf, meta.iOff, ic);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    return {
      vao,
      count: ic,
      texName: meta.tex || '',
      skinned: !!isSkinned,
      rig: isSkinned ? {
        armMat: new Float32Array(meta.armMat),
        parents: meta.parents,
        boneMap: meta.boneMap,
        hasSpine: meta.boneMap.includes(3),
        hasNeck: meta.boneMap.includes(4),
        rhIdx: meta.rhIdx,
        lhIdx: meta.lhIdx,
        restPos: meta.restPos,
        restRot: meta.restRot,
        restScale: meta.restScale,
        twRot: meta.twRot,
        twOff: meta.twOff,
        twScale: meta.twScale,
        bindPoses: meta.bindPoses.map(bp => new Float32Array(bp)),
        weaponR: meta.weaponR ? new Float32Array(meta.weaponR) : null,
        weaponL: meta.weaponL ? new Float32Array(meta.weaponL) : null
      } : null
    };
  }

  buildDiscMesh(seg = 24) {
    const v = [0, 0.02, 0, 0.5, 0.5, 0, 1, 0];
    const idx = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      v.push(c * 0.5, 0.02, s * 0.5, c * 0.5 + 0.5, 0.5 - s * 0.5, 0, 1, 0);
    }
    for (let i = 1; i <= seg; i++) idx.push(0, i + 1, i);
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildOrbMesh(lonSegs = 12, latSegs = 8) {
    const v = [], idx = [];
    for (let y = 0; y <= latSegs; y++) {
      const phi = (y / latSegs) * Math.PI;
      const sp = Math.sin(phi), cp = Math.cos(phi);
      for (let x = 0; x <= lonSegs; x++) {
        const th = (x / lonSegs) * Math.PI * 2;
        const nx = sp * Math.cos(th), ny = cp, nz = sp * Math.sin(th);
        v.push(nx * 0.5, ny * 0.5, nz * 0.5, x / lonSegs, y / latSegs, nx, ny, nz);
      }
    }
    const stride = lonSegs + 1;
    for (let y = 0; y < latSegs; y++) {
      for (let x = 0; x < lonSegs; x++) {
        const a = y * stride + x, b = a + 1, c = a + stride, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  buildFurnaceMesh(segs = 10) {
    // Stylized Xianxia 3D Alchemy Cauldron (Lathe vessel with belly, narrow neck & flared rim)
    const prof = [
      [0.00, -0.42], [0.34, -0.38], [0.52, -0.10], [0.50, 0.16],
      [0.34, 0.30], [0.46, 0.42], [0.36, 0.44], [0.00, 0.34]
    ];
    const v = [], idx = [];
    for (let p = 0; p < prof.length; p++) {
      const [r, py] = prof[p];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const ny = (p === 0) ? -1 : (p === prof.length - 1 ? 1 : 0.15);
        v.push(ca * r, py, sa * r, i / segs, p / (prof.length - 1), ca, ny, sa);
      }
    }
    const st = segs + 1;
    for (let p = 0; p < prof.length - 1; p++) {
      for (let i = 0; i < segs; i++) {
        const a = p * st + i, b = a + 1, c = a + st, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
  }

  // Sculpted Articulated 3D Spirit Pet Part Meshes (phoenix body/wings/beak/crest, undulating dragon head/horns/fins, tortoise shell, celestial fox!)
  initSculptedPetMeshes() {
    const mkRing = (cx, cy, cz, rx, ry, segs = 8) => Array.from({ length: segs }, (_, k) => {
      const a = (k / segs) * Math.PI * 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, cz];
    });
    // 1. Sculpted Graceful Phoenix / Avian Body + Arched Swan Neck + Crested Head (+Z forward)
    {
      const v = [], idx = [];
      const rings = [
        mkRing(0, -0.02, -0.34, 0.06, 0.05, 8),
        mkRing(0,  0.00, -0.16, 0.17, 0.14, 8),
        mkRing(0,  0.02,  0.04, 0.21, 0.18, 8),
        mkRing(0,  0.10,  0.22, 0.13, 0.13, 8),
        mkRing(0,  0.24,  0.30, 0.09, 0.09, 8),
        mkRing(0,  0.34,  0.36, 0.12, 0.11, 8),
        mkRing(0,  0.34,  0.46, 0.07, 0.06, 8)
      ];
      this._weaponLoft(v, idx, rings, true, [0, 0.32, 0.54]);
      this.meshes._petAvianBody = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 2. Sharp Curved Golden Beak (+Z forward)
    {
      const v = [], idx = [];
      const rings = [
        [[0.0, 0.04, 0.0], [0.04, 0.0, 0.0], [0.0, -0.03, 0.0], [-0.04, 0.0, 0.0]],
        [[0.0, 0.025, 0.10], [0.022, -0.005, 0.10], [0.0, -0.022, 0.10], [-0.022, -0.005, 0.10]]
      ];
      this._weaponLoft(v, idx, rings, true, [0, -0.035, 0.20]);
      this.meshes._petBeak = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 3. Separate Positive-Winding Right (+X) & Left (-X) Multi-Feather Serrated Immortal Wings (ZERO negative scale = ZERO inverted black outline!)
    const buildWingSide = (sideSign) => {
      const v = [], idx = [];
      const xform = (pt) => [pt[0] * sideSign, pt[1], pt[2]];
      const addFeatherBlade = (ringsRaw, tipRaw) => {
        const rings = ringsRaw.map(r => {
          const mapped = r.map(xform);
          return sideSign < 0 ? mapped.slice().reverse() : mapped;
        });
        this._weaponLoft(v, idx, rings, true, xform(tipRaw));
      };
      // Primary Leading Swept Airfoil Wing
      addFeatherBlade([
        [[0.00, 0.032, 0.13], [0.00, 0.00, 0.18], [0.00, -0.028, 0.06], [0.00, 0.00, -0.14]],
        [[0.26, 0.058, 0.15], [0.28, 0.015, 0.20], [0.24, -0.020, 0.02], [0.20, 0.008, -0.22]],
        [[0.58, 0.070, 0.06], [0.60, 0.022, 0.10], [0.54, -0.012, -0.08], [0.46, 0.006, -0.30]],
        [[0.90, 0.036, -0.10], [0.92, 0.00, -0.06], [0.84, -0.010, -0.20], [0.76, 0.00, -0.36]]
      ], [1.22, 0.01, -0.34]);
      // Secondary Pinion Feather Blade #2
      addFeatherBlade([
        [[0.16, 0.015, -0.02], [0.18, -0.012, 0.02], [0.16, -0.022, -0.12], [0.14, 0.005, -0.16]],
        [[0.50, 0.020, -0.14], [0.52, -0.008, -0.10], [0.46, -0.016, -0.26], [0.42, 0.004, -0.28]],
        [[0.78, 0.012, -0.30], [0.80, -0.006, -0.26], [0.74, -0.010, -0.40], [0.70, 0.002, -0.42]]
      ], [1.06, 0.00, -0.54]);
      // Trailing Inner Pinion Feather Blade #3
      addFeatherBlade([
        [[0.10, 0.008, -0.10], [0.12, -0.014, -0.08], [0.10, -0.018, -0.20], [0.08, 0.002, -0.22]],
        [[0.36, 0.010, -0.26], [0.38, -0.010, -0.24], [0.34, -0.014, -0.38], [0.30, 0.002, -0.40]]
      ], [0.68, -0.01, -0.56]);
      return this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    };
    this.meshes._petWingR = buildWingSide(1);
    this.meshes._petWingL = buildWingSide(-1);
    this.meshes._petWing = this.meshes._petWingR;
    // 4. Long Graceful S-Curved Spirit Tail / Phoenix Plume / Fox Tail (-Z back, +Y lift)
    {
      const v = [], idx = [];
      const rings = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const r = Math.sin(t * Math.PI * 0.82 + 0.18) * 0.17 * (1 - t * 0.30);
        const cz = -t * 0.88;
        const cy = t * 0.44 + Math.sin(t * Math.PI) * 0.18;
        rings.push(mkRing(0, cy, cz, r, r * 0.82, 7));
      }
      this._weaponLoft(v, idx, rings, true, [0, 0.62, -1.08]);
      this.meshes._petTail = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 5. Faceted Domed Hexagonal Mystic Tortoise Shell (Xuanwu)
    {
      const v = [], idx = [];
      const mkHex = (y, rx, rz) => Array.from({ length: 6 }, (_, k) => {
        const a = (k / 6) * Math.PI * 2;
        return [Math.cos(a) * rx, y, Math.sin(a) * rz];
      });
      const rings = [mkHex(-0.08, 0.40, 0.48), mkHex(0.03, 0.48, 0.56), mkHex(0.20, 0.36, 0.42), mkHex(0.32, 0.18, 0.22)];
      this._weaponLoft(v, idx, rings, true, [0, 0.38, 0]);
      this.meshes._petShell = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 6. Sculpted Eastern Celestial Dragon Head (Broad Brow Ridge + Elongated Snout)
    {
      const v = [], idx = [];
      const rings = [
        mkRing(0, 0.00, -0.18, 0.18, 0.15, 8),
        mkRing(0, 0.04,  0.00, 0.22, 0.18, 8),
        mkRing(0, 0.02,  0.20, 0.16, 0.12, 8),
        mkRing(0, 0.00,  0.38, 0.11, 0.09, 8)
      ];
      this._weaponLoft(v, idx, rings, true, [0, 0.02, 0.48]);
      this.meshes._petDragonHead = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 7. Curved Dragon Antler / Fox Ear / Crown Horn
    {
      const v = [], idx = [];
      const rings = [
        mkRing(0, 0.00,  0.00, 0.042, 0.042, 6),
        mkRing(0, 0.14, -0.06, 0.032, 0.032, 6),
        mkRing(0, 0.28, -0.16, 0.020, 0.020, 6)
      ];
      this._weaponLoft(v, idx, rings, true, [0, 0.40, -0.26]);
      this.meshes._petHorn = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 8. Swept Dorsal Lightning Spine Fin / Phoenix Crown Plume
    {
      const v = [], idx = [];
      const rings = [
        [[0.025, 0.0, 0.12], [0.0, 0.0, 0.16], [-0.025, 0.0, 0.12], [0.0, 0.0, -0.14]],
        [[0.016, 0.16, 0.04], [0.0, 0.18, 0.07], [-0.016, 0.16, 0.04], [0.0, 0.12, -0.22]]
      ];
      this._weaponLoft(v, idx, rings, true, [0, 0.30, -0.32]);
      this.meshes._petFin = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 9. Sleek Arched Celestial Spirit Fox Body + Slender Snout
    {
      const v = [], idx = [];
      const rings = [
        mkRing(0, -0.04, -0.36, 0.08, 0.07, 8),
        mkRing(0,  0.00, -0.14, 0.16, 0.14, 8),
        mkRing(0,  0.04,  0.10, 0.18, 0.16, 8),
        mkRing(0,  0.16,  0.26, 0.15, 0.14, 8),
        mkRing(0,  0.14,  0.42, 0.09, 0.08, 8)
      ];
      this._weaponLoft(v, idx, rings, true, [0, 0.12, 0.54]);
      this.meshes._petFoxBody = this.createUnriggedMesh(new Float32Array(v), new Uint32Array(idx));
    }
    // 10. Keep billboard quad available if needed for future VFX cards
    {
      const v = new Float32Array([
        -0.5, -0.5, 0,  0, 1,  0, 0, 1,
         0.5, -0.5, 0,  1, 1,  0, 0, 1,
         0.5,  0.5, 0,  1, 0,  0, 0, 1,
        -0.5,  0.5, 0,  0, 0,  0, 0, 1
      ]);
      this.meshes._petQuad = this.createUnriggedMesh(v, new Uint32Array([0, 1, 2, 0, 2, 3]));
    }
  }

  createSceneGroupVAO(binBuf, meta) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vSlice = new Uint8Array(binBuf, meta.vOff, meta.vCount * 24);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vSlice, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.UNSIGNED_SHORT, true, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.BYTE, true, 24, 16);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.UNSIGNED_BYTE, false, 24, 6);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 4, gl.UNSIGNED_BYTE, true, 24, 20);
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.UNSIGNED_BYTE, false, 24, 7);

    const iSlice = new Uint32Array(binBuf, meta.iOff, meta.iCount);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, iSlice, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return {
      vao,
      count: meta.iCount,
      bboxMin: new Float32Array([meta.bbox[0], meta.bbox[1], meta.bbox[2]]),
      bboxSpan: new Float32Array([meta.bbox[3], meta.bbox[4], meta.bbox[5]])
    };
  }

  initSceneTexArray(layerNames) {
    if (!this.gl || this.texArray) return;
    const gl = this.gl;
    const W = 512, H = 512;
    const depth = Math.max(1, layerNames.length);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 9, gl.RGBA8, W, H, depth);

    const white = new Uint8Array(W * H * 4);
    white.fill(255);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, W, H, 1, gl.RGBA, gl.UNSIGNED_BYTE, white);

    const neutral = new Uint8Array(W * H * 4);
    for (let i = 0; i < W * H * 4; i += 4) {
      neutral[i] = 225; neutral[i+1] = 220; neutral[i+2] = 210; neutral[i+3] = 255;
    }
    for (let l = 1; l < depth; l++) {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, l, W, H, 1, gl.RGBA, gl.UNSIGNED_BYTE, neutral);
    }
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    this.texArray = tex;

    const scratchCvs = document.createElement('canvas');
    scratchCvs.width = W;
    scratchCvs.height = H;
    const sctx = scratchCvs.getContext('2d');

    let pendingMip = false;
    const scheduleMip = () => {
      if (pendingMip) return;
      pendingMip = true;
      requestAnimationFrame(() => {
        pendingMip = false;
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
        gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      });
    };

    layerNames.forEach((nm, idx) => {
      if (idx === 0 || !nm) return;
      const img = new Image();
      img.onload = () => {
        sctx.clearRect(0, 0, W, H);
        sctx.drawImage(img, 0, 0, W, H);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, idx, W, H, 1, gl.RGBA, gl.UNSIGNED_BYTE, scratchCvs);
        scheduleMip();
      };
      img.src = `assets/tex3d/${nm}.png`;
    });
  }

  async loadAssets() {
    if (!this.gl) return;
    try {
      // Phase 1 (Fast First-Frame Boot): Load core animations + primary Xianxia pack + minimal Master/Weapon fallback!
      const [gMan, gBuf, aMan, aBuf, ttMan, ttBuf] = await Promise.all([
        fetch('assets/meshes/game3d.json').then(r => r.json()),
        fetch('assets/meshes/game3d.bin').then(r => r.arrayBuffer()),
        fetch('assets/meshes/anims.json?v=32').then(r => r.json()),
        fetch('assets/meshes/anims.bin?v=32').then(r => r.arrayBuffer()),
        fetch('assets/meshes/tutien_pack.json?v=32').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('assets/meshes/tutien_pack.bin?v=32').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
      ]);

      this.animManifest = aMan;
      this.animView = new DataView(aBuf);
      this.animsReady = true;

      // Step 5 GPU Optimization: Only build Master fallback VAO from legacy game3d.bin (skipping 22 unused Murim Bandit/Kind/Disciple VAOs!)
      const keepLegacyChars = new Set(['Master']);
      for (const [k, m] of Object.entries(gMan.characters || {})) {
        if (!keepLegacyChars.has(k)) continue;
        this.meshes[k] = this.createSkinnedCharVAO(gBuf, m, true);
      }
      for (const [k, m] of Object.entries(gMan.props || {})) {
        this.meshes[k] = this.createSkinnedCharVAO(gBuf, m, false);
      }
      if (ttMan && ttBuf) {
        for (const [k, m] of Object.entries(ttMan.characters || {})) {
          this.meshes[k] = this.createSkinnedCharVAO(ttBuf, m, true);
          if (m.tex) this.loadTexture3D(m.tex);
        }
        for (const [k, m] of Object.entries(ttMan.staticBosses || {})) {
          this.meshes[k] = this.createSkinnedCharVAO(ttBuf, m, false);
          if (m.tex) this.loadTexture3D(m.tex);
        }
        for (const [k, m] of Object.entries(ttMan.props || {})) {
          this.meshes[k] = this.createSkinnedCharVAO(ttBuf, m, false);
          if (m.tex) this.loadTexture3D(m.tex);
        }
        [
          'TT_Tex_Boss_CuuU', 'TT_Tex_Char_BichDao', 'TT_Tex_Char_ThanhVan', 'TT_Tex_Char_HuyenThien',
          'TT_Tex_Char_LinhNhi', 'TT_Tex_Char_XichLoi', 'TT_Tex_Char_MocThanh', 'TT_Tex_Char_TieuBao',
          'TT_Tex_Trainee_Jade', 'TT_Tex_Trainee_Frost', 'TT_Tex_Trainee_Flame'
        ].forEach(t => this.loadTexture3D(t));
      }
      ['WaterRipple', 'FieldGroundMap', 'Courtyard', 'TownEmblemTex'].forEach(t => this.loadTexture3D(t));
      this.ready = true;

      // Phase 2 (Background Lazy-Load): Stream 14 Xianxia Chibi Monsters + 3D Artifacts & 4 Chibi Spirit Pets without blocking first frame!
      this._loadSecondaryPacks();
    } catch (err) {
      console.error('3D asset load error:', err);
    }
  }

  async _loadSecondaryPacks() {
    try {
      const [tmMan, tmBuf, apMan, apBuf] = await Promise.all([
        fetch('assets/meshes/tutien_monsters.json?v=30').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('assets/meshes/tutien_monsters.bin?v=30').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
        fetch('assets/meshes/tutien_artifacts_pets.json?v=30').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('assets/meshes/tutien_artifacts_pets.bin?v=30').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
      ]);
      if (tmMan && tmBuf) {
        for (const [k, m] of Object.entries(tmMan.mobs || {})) {
          const vaoObj = this.createSkinnedCharVAO(tmBuf, m, false);
          vaoObj.motion = m.motion || 'hop';
          this.meshes[k] = vaoObj;
          if (m.tex) this.loadTexture3D(m.tex);
        }
      }
      if (apMan && apBuf) {
        for (const [k, m] of Object.entries(apMan.artifacts || {})) {
          this.meshes[k] = this.createSkinnedCharVAO(apBuf, m, false);
          if (m.tex) this.loadTexture3D(m.tex);
        }
        for (const [k, m] of Object.entries(apMan.pets || {})) {
          this.meshes[k] = this.createSkinnedCharVAO(apBuf, m, false);
          if (m.tex) this.loadTexture3D(m.tex);
        }
      }
    } catch (err) {
      console.warn('Secondary 3D pack lazy-load skipped:', err);
    }
  }

  loadTexture3D(name) {
    if (!this.gl || this.textures[name]) return;
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([215, 208, 195, 255]));
    this.textures[name] = tex;

    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.src = `assets/tex3d/${name}.png?v=32`;
  }

  // ==================== SKELETAL ANIMATION POSE EVALUATOR ====================
  sampleClipIntoCanon(clipName, timeSec, loopOverride = null) {
    if (!this.animsReady || !this.animManifest) return null;
    const clip = this.animManifest.clips[clipName] || this.animManifest.clips.Idle;
    if (!clip) return null;

    const doLoop = loopOverride !== null ? loopOverride : clip.loop;
    const nF = clip.frames;
    let normT = clip.dur > 0.001 ? (timeSec / clip.dur) : 0;
    if (doLoop) {
      normT = ((normT % 1.0) + 1.0) % 1.0;
    } else {
      normT = Math.max(0, Math.min(1, normT));
    }
    const fPos = normT * (nF - 1);
    const f0 = Math.min(nF - 1, Math.floor(fPos));
    const f1 = Math.min(nF - 1, f0 + 1);
    const frac = fPos - f0;

    const dv = this.animView;
    const off0 = clip.off + f0 * 204;
    const off1 = clip.off + f1 * 204;

    const hx0 = dv.getFloat32(off0, true), hy0 = dv.getFloat32(off0 + 4, true), hz0 = dv.getFloat32(off0 + 8, true);
    const hx1 = dv.getFloat32(off1, true), hy1 = dv.getFloat32(off1 + 4, true), hz1 = dv.getFloat32(off1 + 8, true);
    this._hipsPos[0] = hx0 + (hx1 - hx0) * frac;
    this._hipsPos[1] = hy0 + (hy1 - hy0) * frac;
    this._hipsPos[2] = hz0 + (hz1 - hz0) * frac;

    const qA = this._qTmpA, qB = this._qTmpB;
    for (let bi = 0; bi < 24; bi++) {
      const bo0 = off0 + 12 + bi * 8;
      const bo1 = off1 + 12 + bi * 8;
      qA[0] = dv.getInt16(bo0, true) / 32767;
      qA[1] = dv.getInt16(bo0 + 2, true) / 32767;
      qA[2] = dv.getInt16(bo0 + 4, true) / 32767;
      qA[3] = dv.getInt16(bo0 + 6, true) / 32767;
      qB[0] = dv.getInt16(bo1, true) / 32767;
      qB[1] = dv.getInt16(bo1 + 2, true) / 32767;
      qB[2] = dv.getInt16(bo1 + 4, true) / 32767;
      qB[3] = dv.getInt16(bo1 + 6, true) / 32767;
      nlerpQuat(this._canonQuats[bi], qA, qB, frac);
    }
    return clip;
  }

  evaluateRigMatrices(rig, clipName, timeSec, loopOverride = null) {
    const clip = this.sampleClipIntoCanon(clipName, timeSec, loopOverride);
    const nb = rig.parents.length;
    const useWorldDelta = !!(this.animManifest && this.animManifest.worldDelta && rig.twRot && rig.twOff);

    if (useWorldDelta) {
      const refHy = (clip && clip.refHy > 0.2) ? clip.refHy : 0.77;
      const hyScale = rig.twOff[0][1] / refHy;
      const identQ = [0, 0, 0, 1];
      for (let i = 0; i < nb; i++) {
        const cIdx = rig.boneMap[i];
        const pidx = rig.parents[i];
        const dq = clip ? this._canonQuats[cIdx] : identQ;
        const off = rig.twOff[i];

        let wx, wy, wz;
        if (pidx < 0) {
          // Match Unity Animator.applyRootMotion = false; preserve exact T-pose height for non-root orphan bones (Neck/Shoulders on Bandit*/KindRonin/Cheonga/Macheol/Unhak)!
          const rootY = clip ? this._hipsPos[1] * hyScale : rig.twOff[0][1];
          const dyRoot = rootY - rig.twOff[0][1];
          wx = off[0];
          wy = (i === 0) ? rootY : (off[1] + dyRoot);
          wz = (clip && clipName === 'Die') ? this._hipsPos[2] * 0.25 : off[2];
        } else {
          const pWorld = this._boneWorlds[pidx];
          const pDq = clip ? this._canonQuats[rig.boneMap[pidx]] : identQ;
          rotVecByQuat(this._vTmp, pDq, off[0], off[1], off[2]);
          wx = pWorld[12] + this._vTmp[0];
          wy = pWorld[13] + this._vTmp[1];
          wz = pWorld[14] + this._vTmp[2];
        }

        mulQuat(this._qTmpC, dq, rig.twRot[i]);
        const sc = rig.twScale[i];
        trsMat4(this._boneWorlds[i], wx, wy, wz, this._qTmpC[0], this._qTmpC[1], this._qTmpC[2], this._qTmpC[3], sc[0], sc[1], sc[2]);
        mulMat4(this._localMat, this._boneWorlds[i], rig.bindPoses[i]);
        this._bonePalette.set(this._localMat, i * 16);
      }
      return;
    }

    const hzScale = (clip && clip.refHz > 0.2) ? (rig.restPos[0][2] / clip.refHz) : 1.0;
    for (let i = 0; i < nb; i++) {
      const cIdx = rig.boneMap[i];
      let px, py, pz;
      if (i === 0 && clip) {
        px = this._hipsPos[0] * 0.35;
        py = this._hipsPos[1] * 0.35;
        pz = this._hipsPos[2] * hzScale;
      } else {
        px = rig.restPos[i][0];
        py = rig.restPos[i][1];
        pz = rig.restPos[i][2];
      }
      const q = clip ? this._canonQuats[cIdx] : rig.restRot[i];
      const rs = rig.restScale[i];
      trsMat4(this._localMat, px, py, pz, q[0], q[1], q[2], q[3], rs[0], rs[1], rs[2]);
      const pidx = rig.parents[i];
      mulMat4(this._boneWorlds[i], pidx < 0 ? rig.armMat : this._boneWorlds[pidx], this._localMat);
      mulMat4(this._localMat, this._boneWorlds[i], rig.bindPoses[i]);
      this._bonePalette.set(this._localMat, i * 16);
    }
  }

  selectUnitClip(u, now, game) {
    if (u.fixedClip) {
      return { clip: u.fixedClip, t: now * 1.15 + (u.seed || 0), loop: true };
    }
    if (u.dead) {
      // Die clip collapses onto the floor over ~0.95s and stays collapsed!
      return { clip: 'Die', t: Math.min(2.15, (u.corpseT || 0) * 2.2), loop: false };
    }
    if (u.isMaster && game && game.state && game.state.meditating) {
      return { clip: 'SitFloor', t: now * 0.65, loop: true };
    }
    const isFlying = !!(u.isMaster && (u.swordFlying || (this.mode === 'town' && game && game.state && game.state.swordFlightOn)));
    if (isFlying && u.animT <= 0) {
      // Heroic poised Xianxia sword-riding stance (NEVER runs in mid-air on top of the flying sword in Field OR Town!)
      return { clip: 'Stance', t: now * 0.45, loop: true };
    }
    if (game && game.combat && game.combat.ended && u.isAlly && (!game.combat.master || !game.combat.master.dead)) {
      return { clip: 'Cheer', t: now * 1.2 + (u.seed || 0), loop: true };
    }
    if (u.statuses && u.statuses.daze && u.statuses.daze.t > 0) {
      return { clip: 'Hit', t: now * 1.4, loop: true };
    }
    if (u.animT > 0) {
      const clipName = u.animClip || this.defaultAttackClip(u);
      const clipMeta = this.animManifest && this.animManifest.clips[clipName];
      const clipDur = clipMeta ? clipMeta.dur : 1.5;
      const animDur = Math.max(0.18, u.animDur || 0.48);
      const progress = Math.max(0, Math.min(1, 1 - u.animT / animDur));
      return { clip: clipName, t: progress * clipDur, loop: clipName === 'SwordSpin' || clipName === 'ChiefSpin' };
    }
    if (u.moving) {
      return { clip: 'Run', t: now * 1.18 + (u.seed || 0), loop: true };
    }
    if (u.guardT && u.guardT > 0) {
      return { clip: 'Block', t: now, loop: true };
    }
    return { clip: u.isAlly || u.isBoss ? 'Stance' : 'Idle', t: now * 0.9 + (u.seed || 0), loop: true };
  }

  defaultAttackClip(u) {
    const w = u.weaponMesh || '';
    if (u.isBoss && u.mesh === 'BanditBoss') return 'SaberCharged';
    if (w === 'Weapon_Jian') return (u.comboIdx && u.comboIdx % 3 === 0) ? 'Combo' : 'SwordSlash';
    if (w === 'Weapon_Dao') return 'SaberSlash';
    if (w === 'Weapon_BigDao') return 'SaberCharged';
    if (w === 'Weapon_Spear') return 'SpearThrust';
    if (w === 'Weapon_Staff' || w === 'Weapon_Club') return 'ChiefSpin';
    return 'Punch';
  }

  // ==================== 3D BATTLEFX & HIT FEEL ====================
  triggerShake(mag = 0.35, dur = 0.22) {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeTime = Math.max(this.shakeTime, dur);
  }

  triggerImpactDim(amount = 0.35) {
    this.impactDim = Math.max(this.impactDim, amount);
  }

  pushVfx3D(opts) {
    if (opts.mesh === 'ring') {
      // Cap overlapping additive shock rings so peak 9-sword + pet bursts never white-out the ground!
      let rCnt = 0;
      for (const fx of this.vfx3D) if (fx.mesh === 'ring') rCnt++;
      if (rCnt >= 10) return;
    }
    if (this.vfx3D.length > 72) this.vfx3D.shift();
    this.vfx3D.push({
      mesh: opts.mesh || 'arc',
      style: opts.style ?? 0,
      x: opts.x || 0,
      y: opts.y ?? 0.85,
      z: opts.z || 0,
      vx: opts.vx || 0,
      vy: opts.vy || 0,
      vz: opts.vz || 0,
      yaw: opts.yaw || 0,
      spinYaw: opts.spinYaw || 0,
      pitch: opts.pitch || 0,
      roll: opts.roll || 0,
      s0: opts.s0 ?? 1.5,
      s1: opts.s1 ?? 2.4,
      sy0: opts.sy0 ?? opts.sy ?? opts.s0 ?? 1.0,
      sy1: opts.sy1 ?? opts.sy ?? opts.s1 ?? 1.0,
      color: hexToRgb(opts.color || '#66e3ff'),
      core: hexToRgb(opts.core || '#ffffff'),
      alpha: opts.alpha ?? 0.95,
      additive: opts.additive !== false,
      delay: opts.delay || 0,
      t: 0,
      dur: opts.dur || 0.36
    });
  }

  addHitSparks(x, y, z, color = '#ffe89e', count = 7) {
    for (let i = 0; i < count; i++) {
      if (this.sparks2D.length > 110) this.sparks2D.shift();
      const a = Math.random() * Math.PI * 2;
      const spd = 2.2 + Math.random() * 5.2;
      this.sparks2D.push({
        x, y: y + (Math.random() - 0.3) * 0.4, z,
        vx: Math.cos(a) * spd,
        vy: 1.5 + Math.random() * 3.8,
        vz: Math.sin(a) * spd,
        color,
        ink: i % 3 === 0,
        t: 0,
        dur: 0.28 + Math.random() * 0.18
      });
    }
  }

  addGroundCracks(x, z, radius = 3.2, color = '#ffcc55', spokes = 7) {
    if (this.cracks2D.length > 16) this.cracks2D.shift();
    const lines = [];
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      lines.push({ a, len: radius * (0.65 + Math.random() * 0.45), jag: (Math.random() - 0.5) * 0.35 });
    }
    this.cracks2D.push({ x, z, color, lines, t: 0, dur: 0.72 });
  }

  // Backwards-compatible wrapper upgraded to 3D BattleFx!
  addSlashFx(x, z, angle, radius, color = '#7de8ff', style = 'arc', dur = 0.32, roll = null) {
    if (style === 'ring') {
      this.pushVfx3D({ mesh: 'ring', style: 1, x, y: 0.08, z, yaw: angle, spinYaw: 2.5, s0: radius * 0.35, s1: radius * 1.15, color, dur });
    } else if (style === 'rays') {
      this.spawnUltimateVfx(x, z, color, radius);
    } else {
      const rTilt = roll !== null ? roll : ((Math.random() < 0.5 ? 1 : -1) * (0.32 + Math.random() * 0.25));
      // Ink shadow under-arc + Glowing additive sword-qi arc!
      this.pushVfx3D({ mesh: 'arc', style: 0, x, y: 0.88, z, yaw: angle, roll: rTilt, spinYaw: 3.2, s0: radius * 0.78, s1: radius * 1.16, color: [0.09, 0.11, 0.14], core: [0.18, 0.2, 0.24], alpha: 0.65, additive: false, dur: dur * 1.08 });
      this.pushVfx3D({ mesh: 'arc', style: 0, x, y: 0.92, z, yaw: angle, roll: rTilt, spinYaw: 3.8, s0: radius * 0.75, s1: radius * 1.12, color, core: '#ffffff', alpha: 0.98, additive: true, dur });
    }
  }

  triggerHitStop(sec = 0.045) {
    this.hitStopT = Math.max(this.hitStopT, sec);
  }

  // Next-Gen Vạn Kiếm Quy Tông: Spawns real 3D Weapon_Jian Flying Swords hovering in sky halo then diving into targets!
  spawnFlyingSwordBarrage(cx, cz, count = 10, color = '#60fff0', radius = 4.2) {
    for (let i = 0; i < count; i++) {
      if (this.flyingSwords3D.length > 48) this.flyingSwords3D.shift();
      const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const rr = (i === 0 ? 0.3 : (0.9 + Math.random() * radius * 0.85));
      const tx = cx + Math.cos(ang) * rr;
      const tz = cz + Math.sin(ang) * rr;
      this.flyingSwords3D.push({
        sx: tx + (Math.random() - 0.5) * 1.8,
        sy: 7.5 + Math.random() * 2.5,
        sz: tz - 1.8 + (Math.random() - 0.5) * 1.4,
        tx, ty: 0.15, tz,
        delay: i * 0.032,
        hoverT: 0.16,
        diveT: 0.20,
        stickT: 0.55,
        t: 0,
        hitDone: false,
        color,
        rgb: hexToRgb(color)
      });
    }
  }

  // Live Autonomous Back-Weapon Launch: detaches an actual blade from Lâm Phong's back fan,
  // curves through the target enemy with a blazing trail, strikes & deals damage, then swoops back into formation!
  launchBackWeapon(slotIdx, master, target, wVis, onHitCb, totalSlots = 1) {
    if (this.backFlights.length > 12) return false;
    const sl = this.computeBackSwordSlot(master, 0, slotIdx, Math.max(1, totalSlots), performance.now() * 0.001, 0);
    const sx = sl.sx, sy = sl.sy, sz = sl.sz;
    const side = (slotIdx % 2 === 0 ? 1 : -1) * (1.8 + Math.random() * 1.4);
    const tx = target.x, ty = 0.95, tz = target.z;
    const dx = tx - sx, dz = tz - sz;
    const dl = Math.hypot(dx, dz) || 1;
    // Control point curves dramatically out to the flank like a true Xianxia flying sword arc!
    const cx = (sx + tx) * 0.5 + (-dz / dl) * side;
    const cy = Math.max(sy, ty) + 1.15;
    const cz = (sz + tz) * 0.5 + (dx / dl) * side;
    const rgb = hexToRgb((wVis && wVis.trailHex) || '#52fff0');
    this.backFlights.push({
      slotIdx,
      sx, sy, sz,
      cx, cy, cz,
      tx, ty, tz,
      target,
      wVis,
      rgb,
      colorRgba: `rgba(${Math.round(rgb[0]*255)}, ${Math.round(rgb[1]*255)}, ${Math.round(rgb[2]*255)}, ALPHA)`,
      onHitCb,
      hitDone: false,
      t: 0,
      goDur: 0.30,
      retDur: 0.38,
      trail: []
    });
    return true;
  }

  // Homing 3D Spirit Sword strike fired by equipped Thái Hư Phi Kiếm Artifact!
  spawnArtifactSwordStrike(mx, mz, tx, tz, color = '#58fff0') {
    if (this.flyingSwords3D.length > 48) this.flyingSwords3D.shift();
    this.flyingSwords3D.push({
      sx: mx + (Math.random() - 0.5) * 1.1,
      sy: 2.1 + Math.random() * 0.6,
      sz: mz + (Math.random() - 0.5) * 1.1,
      tx, ty: 0.75, tz,
      delay: 0,
      hoverT: 0.04,
      diveT: 0.22,
      stickT: 0.24,
      t: 0,
      hitDone: false,
      color,
      rgb: hexToRgb(color)
    });
  }

  // Boss/Ultimate 3D Flying Sword Rain (Vạn Kiếm Tông Chủ & Cửu U Ma Kiếm Đế signature heavy skill!)
  spawnFlyingSwords3D(tx, tz, color = '#52e8ff', count = 6) {
    const rgb = hexToRgb(color);
    for (let i = 0; i < count; i++) {
      if (this.flyingSwords3D.length > 56) this.flyingSwords3D.shift();
      const ang = (i / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.3;
      const rad = 0.6 + Math.random() * 2.1;
      const ix = tx + Math.cos(ang) * rad;
      const iz = tz + Math.sin(ang) * rad;
      this.flyingSwords3D.push({
        sx: ix + (Math.random() - 0.5) * 1.2,
        sy: 7.4 + Math.random() * 1.8,
        sz: iz + (Math.random() - 0.5) * 1.2,
        tx: ix, ty: 0.15, tz: iz,
        delay: i * 0.045,
        hoverT: 0.12,
        diveT: 0.20,
        stickT: 0.36,
        t: 0,
        hitDone: false,
        color,
        rgb
      });
    }
    this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.10, z: tz, s0: 0.6, s1: 3.8, color, dur: 0.45 });
  }

  // Next-Gen Cửu Thiên Thần Lôi: 3D jagged branching lightning bolts from heaven + dramatic sky flash!
  spawnLightningBolt(tx, tz, color = '#9c78ff', count = 2) {
    this.lightningFlash = Math.min(1.0, this.lightningFlash + 0.65);
    this.triggerShake(0.42, 0.22);
    for (let b = 0; b < count; b++) {
      if (this.lightningBolts.length > 18) this.lightningBolts.shift();
      const bx = tx + (b === 0 ? 0 : (Math.random() - 0.5) * 3.0);
      const bz = tz + (b === 0 ? 0 : (Math.random() - 0.5) * 3.0);
      const pts = [];
      const segs = 9;
      for (let i = 0; i <= segs; i++) {
        const f = i / segs;
        const jit = (i === 0 || i === segs) ? 0 : (1.0 - Math.abs(f - 0.5) * 1.4) * 1.3;
        pts.push([bx + (Math.random() - 0.5) * jit, 12.5 * (1 - f) + 0.15, bz + (Math.random() - 0.5) * jit]);
      }
      const branches = [];
      for (let k = 2; k <= 6; k += 2) {
        const p = pts[k];
        branches.push([p, [p[0] + (Math.random() - 0.5) * 2.2, p[1] - 1.6, p[2] + (Math.random() - 0.5) * 2.2]]);
      }
      this.lightningBolts.push({ pts, branches, color, t: 0, dur: 0.34, delay: b * 0.05 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: bx, y: 0.08, z: bz, s0: 0.4, s1: 2.8, color, dur: 0.36, delay: b * 0.05 });
    }
  }

  // Dedicated rich 3D choreography for all 22 Cultivation Immortal Arts!
  spawnSkillVfx(sk, master, target, angle) {
    const id = sk.id;
    const famCols = ['#52fff0', '#b078ff', '#ff642e', '#6bf5c2'];
    const col = famCols[sk.fam || 0] || '#52fff0';
    const mx = master.x, mz = master.z;
    const tx = target ? target.x : mx + Math.sin(angle) * 2.5;
    const tz = target ? target.z : mz + Math.cos(angle) * 2.5;
    const reach = Math.min(6.2, sk.reach || 3.8);

    // Every cultivation art opens a crisp translucent Celestial Lotus Mandala + Qi Helix under Lâm Phong (never white-outs!)
    this.pushVfx3D({ mesh: 'seal', style: 6, x: mx, y: 0.05, z: mz, yaw: angle, spinYaw: 2.6, s0: 2.0, s1: 3.3, color: col, core: '#fff8d6', alpha: 0.62, dur: 0.58 });
    this.pushVfx3D({ mesh: 'helix', style: 5, x: mx, y: 0.05, z: mz, yaw: angle, spinYaw: 6.5, s0: 0.9, s1: 1.5, sy0: 1.5, sy1: 3.0, color: col, core: '#ffffff', alpha: 0.60, dur: 0.44 });
    this.triggerImpactDim(0.22);
    this.triggerHitStop(0.036);

    if (id === 'blades' || id === 'meteor') {
      // Vạn Kiếm Quy Tông / Lưu Tinh Kiếm Vũ: Real 3D Celestial Sword Barrage raining from a sky halo!
      this.triggerImpactDim(0.34);
      this.triggerShake(0.48, 0.30);
      this.impactLinesT = Math.max(this.impactLinesT, 0.22);
      this.spawnFlyingSwordBarrage(tx, tz, id === 'blades' ? 14 : 8, col, reach * 0.85);
      this.pushVfx3D({ mesh: 'seal', style: 4, x: tx, y: 0.06, z: tz, spinYaw: -3.2, s0: reach * 1.1, s1: reach * 1.6, color: col, dur: 0.72 });
      this.pushVfx3D({ mesh: 'helix', style: 5, x: tx, y: 0.05, z: tz, spinYaw: -8.0, s0: 1.4, s1: 2.6, sy0: 2.2, sy1: 5.2, color: col, dur: 0.56 });
      return;
    }
    if (id === 'storm' || id === 'burst' || id === 'shadow') {
      // Cửu Thiên Thần Lôi / Lôi Đình Bộc Phát: 3D Branching Heavenly Lightning Bolts!
      this.spawnLightningBolt(tx, tz, '#a682ff', id === 'storm' ? 4 : 2);
      this.addGroundCracks(tx, tz, reach * 0.85, '#b692ff', 7);
      this.addHitSparks(tx, 0.9, tz, '#c8b2ff', 16);
      return;
    }

    if (id === 'wave') {
      this.addSlashFx(mx + Math.sin(angle) * 1.1, mz + Math.cos(angle) * 1.1, angle, 2.5, col, 'arc', 0.34, 0.18);
      this.pushVfx3D({
        mesh: 'arc', style: 0, x: mx + Math.sin(angle) * 1.2, y: 0.85, z: mz + Math.cos(angle) * 1.2,
        vx: Math.sin(angle) * 15, vz: Math.cos(angle) * 15, yaw: angle, roll: 0.05,
        s0: 2.2, s1: 3.4, color: col, dur: 0.44
      });
    } else if (id === 'crescent' || id === 'shadow_mark') {
      this.addSlashFx(tx, tz, angle, 2.8, col, 'arc', 0.36, 0.58);
      this.addSlashFx(tx, tz, angle + 0.25, 2.8, col, 'arc', 0.38, -0.58);
      if (id === 'shadow_mark') {
        this.pushVfx3D({ mesh: 'lance', style: 3, x: (mx + tx) * 0.5, y: 0.9, z: (mz + tz) * 0.5, yaw: angle, s0: 0.65, s1: 0.2, sy0: 1.4, sy1: 1.8, color: col, dur: 0.34 });
      }
    } else if (id === 'blood_opening' || id === 'meridian_recall') {
      this.pushVfx3D({ mesh: 'pillar', style: 2, x: mx, y: 0, z: mz, s0: 1.4, s1: reach * 0.85, sy0: 5.0, sy1: 7.0, color: col, dur: 0.44 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: mx, y: 0.08, z: mz, spinYaw: 4, s0: 0.8, s1: reach * 1.1, color: col, dur: 0.44 });
      this.addHitSparks(mx, 1.0, mz, col, 16);
    } else if (id === 'leap' || id === 'quake' || id === 'heaven' || id === 'heaven_pressure') {
      this.triggerImpactDim(0.32);
      this.triggerShake(0.48, 0.26);
      this.pushVfx3D({ mesh: 'pillar', style: 2, x: tx, y: 0, z: tz, s0: 1.7, s1: reach * 0.95, sy0: 9.0, sy1: 5.5, color: col, dur: 0.48 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.08, z: tz, spinYaw: 3, s0: 0.6, s1: reach * 1.2, color: col, dur: 0.45 });
      this.addGroundCracks(tx, tz, reach * 0.95, col, 8);
      this.addHitSparks(tx, 0.6, tz, col, 18);
    } else if (id === 'flash') {
      this.pushVfx3D({ mesh: 'lance', style: 3, x: (mx + tx) * 0.5, y: 0.9, z: (mz + tz) * 0.5, yaw: angle, s0: 0.72, s1: 0.18, sy0: 1.6, sy1: 2.0, color: col, dur: 0.32 });
      for (let k = 0; k < 3; k++) {
        this.pushVfx3D({
          mesh: 'arc', style: 0, x: tx + (Math.random() - 0.5) * 1.4, y: 0.8 + k * 0.25, z: tz + (Math.random() - 0.5) * 1.4,
          yaw: angle + k * 2.1, roll: (k - 1) * 0.65, spinYaw: 5, s0: 1.9, s1: 2.8, color: col, dur: 0.3, delay: k * 0.06
        });
      }
    } else if (id === 'whirl' || id === 'sweep') {
      for (let k = 0; k < 3; k++) {
        this.pushVfx3D({
          mesh: 'spin', style: 0, x: mx, y: 0.45 + k * 0.48, z: mz,
          yaw: angle + k * 1.8, roll: (k - 1) * 0.14, spinYaw: 11 * (k % 2 === 0 ? 1 : -1),
          s0: reach * (0.55 + k * 0.12), s1: reach * (0.98 + k * 0.12), color: col, dur: 0.48
        });
      }
    } else if (id === 'pull' || id === 'united_seal') {
      this.pushVfx3D({ mesh: 'seal', style: 4, x: mx, y: 0.05, z: mz, spinYaw: -3.2, s0: reach * 1.6, s1: reach * 2.0, color: col, dur: 0.60 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: mx, y: 0.25, z: mz, spinYaw: 5, s0: reach * 1.2, s1: 0.5, color: col, dur: 0.44 });
    } else if (id === 'aegis' || id === 'clear_counter') {
      this.pushVfx3D({ mesh: 'spin', style: 0, x: mx, y: 0.9, z: mz, yaw: 0, roll: 0.35, spinYaw: 8, s0: 1.9, s1: 2.3, color: '#ffe478', dur: 0.58 });
      this.pushVfx3D({ mesh: 'spin', style: 0, x: mx, y: 0.9, z: mz, yaw: 2.1, roll: -0.35, spinYaw: -8, s0: 1.9, s1: 2.3, color: col, dur: 0.58 });
    } else {
      this.addSlashFx(mx + Math.sin(angle) * 1.5, mz + Math.cos(angle) * 1.5, angle, reach * 0.72, col, 'arc', 0.36, 0.0);
      this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.4, z: tz, yaw: angle, s0: 0.6, s1: reach * 0.85, color: col, dur: 0.38 });
    }
  }

  spawnMateSkillVfx(mt, target) {
    const id = mt.id;
    const a = mt.facing || 0;
    const tx = target.x, tz = target.z;
    const palette = {
      yeonhwa: '#5ceaff', cheolsan: '#ffd24a', unhak: '#b884ff', cheonga: '#62f5a8',
      heugyeong: '#9b6bff', soyul: '#64f2d8', macheol: '#ff6428', danbi: '#9be858',
      harang: '#ff7838', dolsoe: '#e0aa58', sundeok: '#48e898', makdong: '#ffd862'
    };
    const col = palette[id] || '#80d4ff';

    if (id === 'cheonga') {
      // Thanh Liên Hồi Xuân — Jade Lotus Seal around team + healing rays!
      this.pushVfx3D({ mesh: 'seal', style: 6, x: mt.x, y: 0.06, z: mt.z, spinYaw: 2.2, s0: 1.6, s1: 3.4, color: col, dur: 0.55 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.08, z: tz, s0: 0.4, s1: 2.4, color: col, dur: 0.40 });
    } else if (id === 'danbi' || id === 'makdong') {
      // Lưu Tinh Tiên Tiễn / Linh Châu Tán Xạ — 5 glowing homing bolts!
      for (let k = -2; k <= 2; k++) {
        const ang = a + k * 0.16;
        this.pushVfx3D({
          mesh: 'lance', style: 3, x: mt.x, y: 0.95, z: mt.z,
          vx: Math.sin(ang) * 17, vz: Math.cos(ang) * 17, yaw: ang, s0: 0.34, s1: 0.22, color: col, dur: 0.34
        });
      }
    } else if (id === 'yeonhwa') {
      // Hàn Băng Kiếm Vũ — Crossed frost-cyan dual sword arcs + ice ring!
      this.addSlashFx(tx, tz, a, 2.7, col, 'arc', 0.40, 0.52);
      this.addSlashFx(tx, tz, a + 0.45, 2.7, '#b4f6ff', 'arc', 0.40, -0.52);
      this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.07, z: tz, s0: 0.5, s1: 2.9, color: col, dur: 0.42 });
    } else if (id === 'unhak') {
      // Cửu Thiên Lôi Kiếm — Violet Heavenly Lightning Bolt + Sword Spin!
      this.spawnLightningBolt(tx, tz, col, 2);
      this.pushVfx3D({ mesh: 'spin', style: 0, x: tx, y: 0.78, z: tz, yaw: a, spinYaw: 12, s0: 1.4, s1: 2.8, color: col, dur: 0.44 });
    } else if (id === 'soyul') {
      // Chu Thiên Tinh Trận — Rotating Celestial Bagua Array!
      this.pushVfx3D({ mesh: 'seal', style: 4, x: tx, y: 0.06, z: tz, spinYaw: 3.2, s0: 1.5, s1: 3.4, color: col, dur: 0.62 });
      this.pushVfx3D({ mesh: 'pillar', style: 2, x: tx, y: 0, z: tz, s0: 0.8, s1: 1.8, sy0: 5.0, sy1: 3.5, color: col, dur: 0.44 });
    } else if (id === 'macheol') {
      // Chu Tước Viêm Trảm — Blazing Crimson Phoenix Cleave + Fiery Crack!
      this.addSlashFx(tx, tz, a, 3.0, col, 'arc', 0.42, 0.35);
      this.pushVfx3D({ mesh: 'pillar', style: 2, x: tx, y: 0, z: tz, s0: 0.9, s1: 2.2, sy0: 5.2, sy1: 3.6, color: '#ff9638', dur: 0.42 });
      this.addGroundCracks(tx, tz, 2.6, col, 6);
    } else if (id === 'cheolsan' || id === 'dolsoe' || id === 'harang') {
      // Kim Cương Trấn Yêu / Bàn Thạch Nhất Kích / Lôi Bạo Phá Sơn
      if (id === 'harang') this.spawnLightningBolt(tx, tz, '#ffae42', 2);
      this.pushVfx3D({ mesh: 'pillar', style: 2, x: tx, y: 0, z: tz, s0: 1.0, s1: 2.4, sy0: 5.5, sy1: 4.0, color: col, dur: 0.42 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x: tx, y: 0.07, z: tz, s0: 0.5, s1: 3.0, color: col, dur: 0.42 });
      this.addGroundCracks(tx, tz, 2.5, col, 6);
    } else {
      // U Minh Phá Không / Thanh Trúc Đột Kích — Piercing spirit spear lance!
      this.pushVfx3D({ mesh: 'lance', style: 3, x: (mt.x + tx) * 0.5, y: 0.9, z: (mt.z + tz) * 0.5, yaw: a, s0: 0.65, s1: 0.24, sy0: 2.4, sy1: 2.8, color: col, dur: 0.34 });
      this.addSlashFx(tx, tz, a, 2.3, col, 'arc', 0.36, 0.22);
    }
    this.addHitSparks(tx, 0.9, tz, col, 10);
  }

  spawnUltimateVfx(x, z, color = '#64fff2', radius = 7.0, famIdx = -1, facing = 0) {
    this.triggerImpactDim(0.58);
    this.triggerShake(0.76, 0.45);
    this.triggerHitStop(0.060);
    this.camZoomPulse = 1.0;
    this.impactLinesT = 0.42;

    if (famIdx === 0) {
      // VẠN KIẾM QUY TÔNG (Ngự Kiếm — 8 Piercing Cyan-Silver Sword-Qi Rays + 18 Orbiting Swords!)
      const c = '#58f6ff';
      this.spawnFlyingSwordBarrage(x, z, 18, c, radius * 0.92);
      this.pushVfx3D({ mesh: 'seal', style: 4, x, y: 0.05, z, spinYaw: 4.2, s0: radius * 1.1, s1: radius * 2.1, color: c, dur: 0.92 });
      for (let i = 0; i < 8; i++) {
        const ang = facing + (i / 8) * Math.PI * 2;
        const sx = Math.sin(ang), sz = Math.cos(ang);
        this.pushVfx3D({
          mesh: 'lance', style: 3, x: x + sx * 1.0, y: 0.92, z: z + sz * 1.0,
          vx: sx * 16.5, vz: sz * 16.5, yaw: ang, s0: 0.85, s1: 0.45, sy0: 3.4, sy1: 4.2, color: c, core: '#ffffff', dur: 0.62
        });
      }
      this.pushVfx3D({ mesh: 'ring', style: 1, x, y: 0.12, z, s0: 1.2, s1: radius * 1.45, color: '#a6fcff', dur: 0.65 });
      this.addGroundCracks(x, z, radius * 0.95, c, 8);
      this.addHitSparks(x, 1.1, z, c, 34);
    } else if (famIdx === 1) {
      // BẠO PHONG HUYẾT VŨ (Cửu Lôi — Crimson-Violet Blood-Thunder Tornado Helix + Storm Rings!)
      const c = '#e83878', c2 = '#a464ff';
      this.spawnLightningBolt(x, z, c2, 5);
      this.pushVfx3D({ mesh: 'seal', style: 4, x, y: 0.05, z, spinYaw: -5.5, s0: radius * 1.2, s1: radius * 2.0, color: c, dur: 1.15 });
      this.pushVfx3D({ mesh: 'helix', style: 5, x, y: 0.05, z, spinYaw: 14.0, s0: 2.2, s1: radius * 0.85, sy0: 3.5, sy1: 11.0, color: c, core: '#ffd4e6', dur: 1.10 });
      this.pushVfx3D({ mesh: 'helix', style: 5, x, y: 0.08, z, spinYaw: -11.5, s0: 1.6, s1: radius * 0.70, sy0: 2.8, sy1: 9.2, color: c2, core: '#ffffff', dur: 1.05 });
      for (let k = 0; k < 4; k++) {
        this.pushVfx3D({ mesh: 'spin', style: 0, x, y: 0.45 + k * 0.65, z, yaw: k * 1.57, spinYaw: 16 * (k % 2 ? -1 : 1), s0: 1.8, s1: radius * 1.15, color: k % 2 ? c2 : c, dur: 0.85 });
      }
      this.addGroundCracks(x, z, radius * 0.95, c, 10);
      this.addHitSparks(x, 1.2, z, c, 36);
    } else if (famIdx === 2) {
      // BÁ VƯƠNG NHẤT ĐAO (Chu Tước — Colossal 16m Blazing Phoenix-Flame Cleave Line!)
      const c = '#ff5418', c2 = '#ffbe38';
      const fx = Math.sin(facing), fz = Math.cos(facing);
      this.addSlashFx(x + fx * 1.8, z + fz * 1.8, facing, 5.2, c, 'arc', 0.68, 0.25);
      this.pushVfx3D({
        mesh: 'lance', style: 3, x: x + fx * 6.5, y: 1.0, z: z + fz * 6.5,
        yaw: facing, s0: 3.4, s1: 1.8, sy0: 14.0, sy1: 16.0, color: c, core: '#fff6b0', dur: 0.72
      });
      for (let step = 1; step <= 4; step++) {
        const px = x + fx * (step * 3.4), pz = z + fz * (step * 3.4);
        this.pushVfx3D({ mesh: 'pillar', style: 2, x: px, y: 0, z: pz, s0: 1.4, s1: 2.8, sy0: 8.5 + step * 1.2, sy1: 5.5, color: step % 2 ? c : c2, dur: 0.62 });
        this.addGroundCracks(px, pz, 2.8, c, 5);
      }
      this.pushVfx3D({ mesh: 'ring', style: 1, x: x + fx * 3.0, y: 0.10, z: z + fz * 3.0, s0: 1.0, s1: 6.2, color: c2, dur: 0.58 });
      this.addHitSparks(x + fx * 5.0, 1.2, z + fz * 5.0, c2, 36);
    } else if (famIdx === 3) {
      // THIÊN LÔI THẦN CHƯỞNG (Thái Hư — Crisp Azure-Gold Heavenly Thunder Pillar + Lotus Mandala, ZERO white-out!)
      const c = '#2c9cff', c2 = '#f0be38';
      this.spawnLightningBolt(x, z, '#70c8ff', 6);
      this.pushVfx3D({ mesh: 'seal', style: 6, x, y: 0.06, z, spinYaw: 2.8, s0: radius * 1.0, s1: radius * 1.85, color: c2, core: '#ffd86b', dur: 0.95 });
      this.pushVfx3D({ mesh: 'seal', style: 4, x, y: 0.08, z, spinYaw: -3.2, s0: radius * 0.72, s1: radius * 1.45, color: c, core: '#82d4ff', dur: 0.88 });
      this.pushVfx3D({ mesh: 'pillar', style: 2, x, y: 0, z, s0: 1.6, s1: 3.2, sy0: 14.0, sy1: 10.0, color: c, core: '#9ad8ff', dur: 0.72 });
      this.pushVfx3D({ mesh: 'ring', style: 1, x, y: 0.12, z, s0: 1.2, s1: radius * 1.38, color: c2, core: '#ffe280', dur: 0.65 });
      this.addGroundCracks(x, z, radius * 1.05, c, 10);
      this.addHitSparks(x, 1.3, z, c2, 28);
    } else {
      // BASE: THÁI HƯ VẠN KIẾM QUYẾT — Crisp Jade-Gold Celestial Sword Rain + Bagua (ZERO white-out!)
      this.spawnFlyingSwordBarrage(x, z, 14, color, radius * 0.88);
      this.spawnLightningBolt(x, z, '#68b4ff', 4);
      this.pushVfx3D({ mesh: 'seal', style: 4, x, y: 0.05, z, spinYaw: 3.0, s0: radius * 1.1, s1: radius * 1.85, color, core: '#9efcf0', dur: 0.90 });
      this.pushVfx3D({ mesh: 'seal', style: 6, x, y: 0.07, z, spinYaw: -2.4, s0: radius * 0.75, s1: radius * 1.45, color: '#eab838', core: '#ffe078', dur: 0.85 });
      this.pushVfx3D({ mesh: 'helix', style: 5, x, y: 0.05, z, spinYaw: 8.5, s0: 1.5, s1: 3.2, sy0: 2.2, sy1: 7.5, color, core: '#a8fff4', dur: 0.72 });
      this.pushVfx3D({ mesh: 'pillar', style: 2, x, y: 0, z, s0: 1.3, s1: 2.6, sy0: 11.5, sy1: 8.5, color, core: '#a6fff4', dur: 0.62 });
      for (let k = 0; k < 2; k++) {
        this.pushVfx3D({
          mesh: 'spin', style: 0, x, y: 0.6 + k * 0.55, z, yaw: k * 2.1, roll: (k - 1) * 0.24,
          spinYaw: 13 * (k % 2 === 0 ? 1 : -1), s0: radius * 0.45, s1: radius * 1.12, color, core: '#c2fff8', dur: 0.68
        });
      }
      this.addGroundCracks(x, z, radius * 1.0, color, 10);
      this.addHitSparks(x, 1.2, z, color, 26);
    }
  }

  addPopup(x, y, z, text, color = '#fff6d6', scale = 1.0) {
    let raw = String(text || '');
    const isCrit = raw.startsWith('BẠO!');
    const isChain = raw.startsWith('LIÊN KÍCH');
    const isBanner = raw.length > 9 && !/^[-+]?\d/.test(raw) && !isCrit && !isChain;

    // Compact long combat prefixes into razor-sharp badges so multi-hit numbers never form yellow text soup!
    if (isCrit) raw = '💥 ' + raw.replace(/^BẠO!\s*/i, '');
    else if (isChain) raw = '⚡' + raw.replace(/^LIÊN KÍCH\s*/i, '');

    if (isBanner) {
      for (const old of this.popups) {
        if (old.text === raw && old.t < 0.48) return;
      }
    } else {
      // Cap active floating damage numbers to 8 so battlefield stays crisp & readable
      let dmgCnt = 0;
      for (let i = 0; i < this.popups.length; i++) if (!this.popups[i].isBanner) dmgCnt++;
      if (dmgCnt >= 8) {
        const dropIdx = this.popups.findIndex(p => !p.isBanner && !p.isCrit);
        if (dropIdx >= 0) this.popups.splice(dropIdx, 1);
        else if (!isCrit) return;
      }
    }

    // Golden-angle radial fan distribution eliminates overlapping numbers over the Boss!
    // Skill banners live on a higher dedicated vertical tier so they NEVER touch 💥/⚡ numbers!
    let ox, oy, oz;
    if (isBanner) {
      let activeBanners = 0;
      for (const old of this.popups) if (old.isBanner && old.t < 0.65) activeBanners++;
      ox = (activeBanners % 2 === 0 ? -0.35 : 0.35);
      oy = y + 3.05 + activeBanners * 0.56;
      oz = 0;
    } else {
      this._popupSeq = ((this._popupSeq || 0) + 1) % 12;
      const fanAng = this._popupSeq * 2.39996;
      const fanR = 0.55 + (this._popupSeq % 3) * 0.42;
      ox = Math.cos(fanAng) * fanR;
      oz = Math.sin(fanAng) * fanR * 0.5;
      oy = y + 1.52 + (this._popupSeq % 4) * 0.22;
    }

    const tieredScale = isBanner
      ? Math.min(scale, 0.94)
      : (isCrit ? Math.min(1.18, Math.max(1.02, scale)) : (isChain ? 0.92 : 0.78));
    const tieredCol = (!isBanner && !isCrit && !isChain && color === '#fff6d6') ? '#eef6ff' : color;
    this.popups.push({
      x: x + ox, y: oy, z: z + oz,
      text: raw, color: tieredCol, scale: tieredScale,
      isBanner, isCrit, isChain,
      t: 0, dur: isBanner ? 0.92 : (isCrit ? 0.82 : 0.64)
    });
  }

  addCoinDrop(x, z, count = 2) {
    const n = Math.min(4, count);
    for (let i = 0; i < n; i++) {
      if (this.coins.length > 28) this.coins.shift();
      this.coins.push({
        x, y: 0.4, z,
        vx: (Math.random() - 0.5) * 3.2,
        vy: 3.8 + Math.random() * 2.0,
        vz: (Math.random() - 0.5) * 3.2,
        t: 0
      });
    }
  }

  // --- Camera & Projection Matrices ---
  computeCameraMatrices(dt) {
    const aspect = this.width / Math.max(1, this.height);
    const isPortrait = aspect < 0.92;
    const baseFov = this.mode === 'town' ? 30.0 : 32.0;
    const fovDeg = isPortrait ? (baseFov + Math.min(18.0, (0.95 - aspect) * 28.0)) : baseFov;
    const portDistMul = isPortrait ? Math.min(1.42, 1.0 + (0.95 - aspect) * 0.55) : 1.0;
    const fov = fovDeg * Math.PI / 180;
    const near = 0.8, far = 950.0;
    const f = 1.0 / Math.tan(fov / 2);

    const P = this.matProj;
    P.fill(0);
    P[0] = f / aspect;
    P[5] = f;
    P[10] = (far + near) / (far - near);
    P[11] = 1.0;
    P[14] = -(2.0 * far * near) / (far - near);

    let ex, ey, ez, tx, ty, tz;
    if (this.mode === 'town') {
      tx = this.townPan.x;
      ty = 0.8;
      tz = 2.0 + this.townPan.z;
      const baseDist = 38.0 * this.townZoom;
      const pitch = 34.0 * Math.PI / 180;
      const yaw = 28.0 * Math.PI / 180;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      ex = tx - baseDist * cp * sy;
      ey = ty + baseDist * sp;
      ez = tz - baseDist * cp * cy;
    } else {
      tx = this.camTarget.x;
      ty = 0.6;
      tz = this.camTarget.z;
      if (this.shakeTime > 0) {
        this.shakeTime = Math.max(0, this.shakeTime - dt);
        const s = this.shakeMag * (this.shakeTime / 0.25);
        tx += (Math.random() - 0.5) * s;
        tz += (Math.random() - 0.5) * s;
        if (this.shakeTime <= 0) this.shakeMag = 0;
      }
      const zoomMul = (1.0 - this.camZoomPulse * 0.14) * portDistMul;
      ex = tx;
      ey = ty + 11.4 * zoomMul;
      ez = tz - 16.2 * zoomMul;
    }

    this.camPos[0] = ex;
    this.camPos[1] = ey;
    this.camPos[2] = ez;

    let fx = tx - ex, fy = ty - ey, fz = tz - ez;
    let flen = Math.hypot(fx, fy, fz) || 1;
    fx /= flen; fy /= flen; fz /= flen;

    let rx = fz, ry = 0, rz = -fx;
    let rlen = Math.hypot(rx, ry, rz) || 1;
    rx /= rlen; rz /= rlen;

    const ux = fy * rz - fz * ry;
    const uy = fz * rx - fx * rz;
    const uz = fx * ry - fy * rx;

    const V = this.matView;
    V[0] = rx; V[4] = ry; V[8]  = rz; V[12] = -(rx * ex + ry * ey + rz * ez);
    V[1] = ux; V[5] = uy; V[9]  = uz; V[13] = -(ux * ex + uy * ey + uz * ez);
    V[2] = fx; V[6] = fy; V[10] = fz; V[14] = -(fx * ex + fy * ey + fz * ez);
    V[3] = 0;  V[7] = 0;  V[11] = 0;  V[15] = 1;

    mulMat4(this.matVP, P, V);
  }

  setModelMatrix(x, y, z, rotY, sx, sy, sz, leanX = 0, rollZ = 0) {
    const M = this.matModel;
    const cy = Math.cos(rotY), sy_ = Math.sin(rotY);
    const cx = Math.cos(leanX), sx_ = Math.sin(leanX);
    const cz = Math.cos(rollZ), sz_ = Math.sin(rollZ);

    M[0] = (cy * cz + sy_ * sx_ * sz_) * sx;
    M[1] = (cx * sz_) * sx;
    M[2] = (-sy_ * cz + cy * sx_ * sz_) * sx;
    M[3] = 0;

    M[4] = (-cy * sz_ + sy_ * sx_ * cz) * sy;
    M[5] = (cx * cz) * sy;
    M[6] = (sy_ * sz_ + cy * sx_ * cz) * sy;
    M[7] = 0;

    M[8] = (sy_ * cx) * sz;
    M[9] = (-sx_) * sz;
    M[10] = (cy * cx) * sz;
    M[11] = 0;

    M[12] = x;
    M[13] = y;
    M[14] = z;
    M[15] = 1;
  }

  worldToScreen(x, y, z) {
    const m = this.matVP;
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.1) return null;
    return {
      x: ((cx / cw) * 0.5 + 0.5) * this.width,
      y: (0.5 - (cy / cw) * 0.5) * this.height,
      w: cw
    };
  }

  screenToGround(clientX, clientY) {
    const rect = this.fxCanvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((clientY - rect.top) / rect.height) * 2;
    const inv = this.invert4x4(this.matVP);
    if (!inv) return null;
    const unproj = (zNdc) => {
      const x = inv[0] * nx + inv[4] * ny + inv[8] * zNdc + inv[12];
      const y = inv[1] * nx + inv[5] * ny + inv[9] * zNdc + inv[13];
      const z = inv[2] * nx + inv[6] * ny + inv[10] * zNdc + inv[14];
      const w = inv[3] * nx + inv[7] * ny + inv[11] * zNdc + inv[15] || 1;
      return { x: x / w, y: y / w, z: z / w };
    };
    const p0 = unproj(-1);
    const p1 = unproj(0.95);
    const dy = p1.y - p0.y;
    if (Math.abs(dy) < 1e-5) return null;
    const t = -p0.y / dy;
    if (t < 0) return null;
    return { x: p0.x + (p1.x - p0.x) * t, z: p0.z + (p1.z - p0.z) * t };
  }

  invert4x4(m) {
    const inv = new Float32Array(16);
    inv[0] = m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];
    inv[4] = -m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    inv[8] = m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];
    inv[12]= -m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    inv[1] = -m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];
    inv[5] = m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    inv[9] = -m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];
    inv[13]= m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    inv[2] = m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];
    inv[6] = -m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    inv[10]= m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];
    inv[14]= -m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    inv[3] = -m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];
    inv[7] = m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    inv[11]= -m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];
    inv[15]= m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];
    let det = m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12];
    if (Math.abs(det) < 1e-8) return null;
    det = 1.0 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;
    return inv;
  }

  drawCharMesh(meshKey, modelMat, texName, tint, uvScaleX = 1, uvScaleY = 1, flash = 0, unlit = 0, withOutline = false, useSkinning = false) {
    const gl = this.gl;
    const mesh = this.meshes[meshKey];
    if (!mesh) return;
    gl.uniformMatrix4fv(this.uChar.Model, false, modelMat);
    gl.uniform1f(this.uChar.Skinned, useSkinning ? 1.0 : 0.0);
    if (useSkinning) {
      gl.uniformMatrix4fv(this.uChar.Bones, false, this._bonePalette);
    }
    gl.uniform2f(this.uChar.UvScale, uvScaleX, uvScaleY);
    gl.uniform4fv(this.uChar.Tint, tint);
    gl.uniform1f(this.uChar.Flash, flash);
    gl.uniform1f(this.uChar.Unlit, unlit);

    gl.bindVertexArray(mesh.vao);

    const allowOutline = withOutline && tint[3] > 0.5 && !(this.outlineMode === 'hero' && (meshKey.startsWith('TT_Mob_') || meshKey.startsWith('TT_Art_')));
    if (allowOutline) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);
      // Thinner razor-crisp outline on high-detail TT_* Xianxia meshes so tassels, crowns & horns stay clean!
      gl.uniform1f(this.uChar.Outline, meshKey.startsWith('TT_') ? 0.0095 : 0.015);
      gl.uniform1f(this.uChar.IsOutline, 1.0);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    }

    gl.disable(gl.CULL_FACE);
    gl.uniform1f(this.uChar.Outline, 0.0);
    gl.uniform1f(this.uChar.IsOutline, 0.0);
    const t = texName && this.textures[texName];
    gl.activeTexture(gl.TEXTURE0);
    if (t) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1f(this.uChar.UseTex, 1.0);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, this.whiteTex);
      gl.uniform1f(this.uChar.UseTex, 0.0);
    }
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
  }

  computeLightVP(cx, cz, halfExtent, sunDir) {
    let lx = sunDir[0], ly = sunDir[1], lz = sunDir[2];
    const sl = Math.hypot(lx, ly, lz) || 1;
    lx /= sl; ly /= sl; lz /= sl;
    const dist = 56.0;
    const ex = cx + lx * dist, ey = ly * dist, ez = cz + lz * dist;
    let fx = cx - ex, fy = -ey, fz = cz - ez;
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;

    let rx = fz, ry = 0, rz = -fx;
    const rl = Math.hypot(rx, ry, rz) || 1;
    rx /= rl; rz /= rl;

    const ux = fy * rz - fz * ry;
    const uy = fz * rx - fx * rz;
    const uz = fx * ry - fy * rx;

    const V = new Float32Array(16);
    V[0] = rx; V[4] = ry; V[8]  = rz; V[12] = -(rx * ex + ry * ey + rz * ez);
    V[1] = ux; V[5] = uy; V[9]  = uz; V[13] = -(ux * ex + uy * ey + uz * ez);
    V[2] = fx; V[6] = fy; V[10] = fz; V[14] = -(fx * ex + fy * ey + fz * ez);
    V[3] = 0;  V[7] = 0;  V[11] = 0;  V[15] = 1;

    const near = 4.0, far = 135.0;
    const O = new Float32Array(16);
    O[0] = 1.0 / halfExtent;
    O[5] = 1.0 / halfExtent;
    O[10] = 2.0 / (far - near);
    O[14] = -(far + near) / (far - near);
    O[15] = 1.0;

    mulMat4(this.matLightVP, O, V);
  }

  renderShadowPass(groupList, isEnv, units, now, zoneDef, game) {
    if (!this.shadowFbo || this.shadowSkip === 0) return;
    if (this.shadowSkip > 1 && (this._frameCounter % this.shadowSkip) !== 0) return;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.viewport(0, 0, this.shadowSize, this.shadowSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(2.0, 4.0);

    if (groupList && groupList.length) {
      gl.useProgram(this.shadowSceneProg);
      gl.uniformMatrix4fv(this.uShScene.LightVP, false, this.matLightVP);
      gl.uniform1f(this.uShScene.IsEnv, isEnv ? 1.0 : 0.0);
      for (const g of groupList) {
        if (!g) continue;
        gl.uniform3fv(this.uShScene.BboxMin, g.bboxMin);
        gl.uniform3fv(this.uShScene.BboxSpan, g.bboxSpan);
        gl.bindVertexArray(g.vao);
        gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_INT, 0);
      }
    }

    if (units && units.length) {
      gl.useProgram(this.shadowCharProg);
      gl.uniformMatrix4fv(this.uShChar.LightVP, false, this.matLightVP);
      for (const u of units) {
        if (!u || u.dead) continue;
        const meshKey = this.meshes[u.mesh] ? u.mesh : (this.meshes.TT_Char_CuuU ? 'TT_Char_CuuU' : 'Master');
        const meshObj = this.meshes[meshKey];
        if (!meshObj) continue;
        const scale = u.scale || 1.0;
        const baseH = zoneDef ? this.getTerrainHeight(zoneDef, u.x, u.z) : (u.groundY || 0);
        const jumpArc = (u.jumpT > 0 && u.jumpDur > 0) ? Math.sin((u.jumpT / u.jumpDur) * Math.PI) * 1.85 : 0;
        const medLift = (u.isMaster && game && game.state && game.state.meditating) ? (0.42 + Math.sin(now * 2.8) * 0.12) : 0;
        const useSkin = !!(meshObj.skinned && meshObj.rig && this.animsReady);
        if (useSkin) {
          const sel = this.selectUnitClip(u, now, game);
          this.evaluateRigMatrices(meshObj.rig, sel.clip, sel.t, sel.loop);
          gl.uniformMatrix4fv(this.uShChar.Bones, false, this._bonePalette);
        }
        this.setModelMatrix(u.x, baseH + jumpArc + medLift, u.z, u.facing || 0, scale, scale, scale, 0, 0);
        gl.uniformMatrix4fv(this.uShChar.Model, false, this.matModel);
        gl.uniform1f(this.uShChar.Skinned, useSkin ? 1.0 : 0.0);
        gl.bindVertexArray(meshObj.vao);
        gl.drawElements(gl.TRIANGLES, meshObj.count, gl.UNSIGNED_INT, 0);
      }
    }

    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  renderSkyDome(theme, now) {
    const gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.useProgram(this.skyProg);
    gl.uniform3fv(this.uSky.SkyTop, theme.skyTop);
    gl.uniform3fv(this.uSky.SkyMid, theme.skyMid);
    gl.uniform3fv(this.uSky.SkyHor, theme.skyHor);
    gl.uniform3fv(this.uSky.MtnCol, theme.mtnCol);
    gl.uniform1f(this.uSky.Time, now);
    gl.uniform1f(this.uSky.Moon, theme.moon ? 1.0 : 0.0);
    gl.bindVertexArray(this._emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }

  drawSceneGroups(groupList, fog, sceneTint = [1, 1, 1], opts = {}) {
    const useEnv = !!opts.isEnv;
    const texArr = useEnv ? (this.env3d && this.env3d.texArray) : this.texArray;
    if (!groupList.length || !texArr) return;
    const gl = this.gl;
    const now = opts.now || 0;
    const theme = opts.theme || { sunDir: [-0.4, 0.84, -0.35], sunCol: [1.05, 1.0, 0.9], ambCol: [0.55, 0.62, 0.72] };
    const lights = opts.lights || [];

    gl.useProgram(this.sceneProg);
    gl.uniformMatrix4fv(this.uScene.VP, false, this.matVP);
    gl.uniformMatrix4fv(this.uScene.LightVP, false, this.matLightVP);
    gl.uniform3fv(this.uScene.FogColor, fog);
    gl.uniform3fv(this.uScene.SceneTint, sceneTint);
    gl.uniform3fv(this.uScene.SunDir, theme.sunDir);
    gl.uniform3fv(this.uScene.SunCol, theme.sunCol);
    gl.uniform3fv(this.uScene.AmbCol, theme.ambCol);
    gl.uniform1f(this.uScene.Time, now);
    gl.uniform1f(this.uScene.IsEnv, useEnv ? 1.0 : 0.0);

    const nLights = Math.min(8, lights.length);
    for (let i = 0; i < nLights; i++) {
      const L = lights[i];
      const flk = 1.0 + Math.sin(now * 7.2 + i * 2.3) * (L.flicker || 0.12)
                + Math.cos(now * 13.4 + i * 4.1) * ((L.flicker || 0.12) * 0.4);
      this._lightPosBuf[i * 4]     = L.x;
      this._lightPosBuf[i * 4 + 1] = L.y;
      this._lightPosBuf[i * 4 + 2] = L.z;
      this._lightPosBuf[i * 4 + 3] = L.radius || 10.0;
      this._lightColBuf[i * 4]     = L.r * flk;
      this._lightColBuf[i * 4 + 1] = L.g * flk;
      this._lightColBuf[i * 4 + 2] = L.b * flk;
      this._lightColBuf[i * 4 + 3] = 1.0;
    }
    gl.uniform1i(this.uScene.LightCount, nLights);
    if (nLights > 0) {
      gl.uniform4fv(this.uScene.LightPos, this._lightPosBuf);
      gl.uniform4fv(this.uScene.LightCol, this._lightColBuf);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArr);
    gl.uniform1i(this.uScene.TexArr, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex || this.whiteTex);
    gl.uniform1i(this.uScene.ShadowMap, 1);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.uniform1f(this.uScene.IsOutline, 1.0);
    gl.uniform1f(this.uScene.Outline, useEnv ? 0.022 : 0.028);
    for (const g of groupList) {
      if (!g) continue;
      gl.uniform3fv(this.uScene.BboxMin, g.bboxMin);
      gl.uniform3fv(this.uScene.BboxSpan, g.bboxSpan);
      gl.bindVertexArray(g.vao);
      gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_INT, 0);
    }

    gl.disable(gl.CULL_FACE);
    gl.uniform1f(this.uScene.IsOutline, 0.0);
    gl.uniform1f(this.uScene.Outline, 0.0);
    for (const g of groupList) {
      if (!g) continue;
      gl.uniform3fv(this.uScene.BboxMin, g.bboxMin);
      gl.uniform3fv(this.uScene.BboxSpan, g.bboxSpan);
      gl.bindVertexArray(g.vao);
      gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_INT, 0);
    }
  }

  renderVfx3DBatch(dt) {
    if (!this.vfx3D.length) return;
    const gl = this.gl;
    gl.useProgram(this.vfxProg);
    gl.uniformMatrix4fv(this.uVfx.VP, false, this.matVP);
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false);

    for (let i = this.vfx3D.length - 1; i >= 0; i--) {
      const fx = this.vfx3D[i];
      if (fx.delay > 0) {
        fx.delay -= dt;
        continue;
      }
      fx.t += dt;
      if (fx.t >= fx.dur) {
        this.vfx3D.splice(i, 1);
        continue;
      }
      fx.x += fx.vx * dt;
      fx.y += fx.vy * dt;
      fx.z += fx.vz * dt;
      fx.yaw += fx.spinYaw * dt;

      const prog = fx.t / fx.dur;
      const ease = 1 - Math.pow(1 - prog, 2.6);
      const sxz = fx.s0 + (fx.s1 - fx.s0) * ease;
      const sy = fx.sy0 + (fx.sy1 - fx.sy0) * ease;
      const m = this.vfxMeshes[fx.mesh];
      if (!m) continue;

      if (fx.additive) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }

      if (fx.mesh === 'lance') {
        this.setModelMatrix(fx.x, fx.y, fx.z, fx.yaw, sxz, sxz, Math.max(2.2, sy * 3.2), fx.pitch, fx.roll);
      } else if (fx.mesh === 'ring' || fx.mesh === 'seal') {
        // Keep ground shockrings & lotus/Bagua mandalas razor-flat on terrain instead of floating upward!
        this.setModelMatrix(fx.x, fx.y, fx.z, fx.yaw, sxz, 1.0, sxz, fx.pitch, fx.roll);
      } else {
        this.setModelMatrix(fx.x, fx.y, fx.z, fx.yaw, sxz, sy, sxz, fx.pitch, fx.roll);
      }
      gl.uniformMatrix4fv(this.uVfx.Model, false, this.matModel);
      gl.uniform4f(this.uVfx.Color, fx.color[0], fx.color[1], fx.color[2], fx.alpha);
      gl.uniform3f(this.uVfx.CoreColor, fx.core[0], fx.core[1], fx.core[2]);
      gl.uniform1f(this.uVfx.Prog, prog);
      gl.uniform1f(this.uVfx.Style, fx.style);
      gl.bindVertexArray(m.vao);
      gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
    }

    gl.depthMask(true);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  getTerrainHeight(zoneDef, x, z) {
    if (!zoneDef || !zoneDef.high) return 0;
    let maxH = 0;
    for (const h of zoneDef.high) {
      if (h.r !== undefined) {
        if (Math.hypot(x - h.x, z - h.z) <= h.r) {
          maxH = Math.max(maxH, h.h || 0.5);
        }
      } else if (x >= h.x0 && x <= h.x1 && z >= h.z0 && z <= h.z1) {
        let elev = h.h || 0;
        if (h.ramp === 'z' && h.h1 !== undefined) {
          const t = Math.max(0, Math.min(1, (z - h.z0) / Math.max(0.01, h.z1 - h.z0)));
          elev = (h.h || 0) + (h.h1 - (h.h || 0)) * t;
        } else if (h.ramp === 'x' && h.h1 !== undefined) {
          const t = Math.max(0, Math.min(1, (x - h.x0) / Math.max(0.01, h.x1 - h.x0)));
          elev = (h.h || 0) + (h.h1 - (h.h || 0)) * t;
        }
        maxH = Math.max(maxH, elev);
      }
    }
    return maxH;
  }

  render(game, dt) {
    if (!this.gl) return;
    // Prevent stretched/distorted 3D characters in iOS WebClip/Standalone when viewport settles late
    const cRect = this.glCanvas.getBoundingClientRect();
    if (cRect.width > 10 && cRect.height > 10 && (Math.abs(Math.floor(cRect.width) - this.width) > 2 || Math.abs(Math.floor(cRect.height) - this.height) > 2)) {
      this.resize();
    }
    const gl = this.gl;
    const now = performance.now() * 0.001;

    if (this.impactDim > 0) this.impactDim = Math.max(0, this.impactDim - dt * 1.15);
    if (this.lightningFlash > 0) this.lightningFlash = Math.max(0, this.lightningFlash - dt * 3.8);
    if (this.impactLinesT > 0) this.impactLinesT = Math.max(0, this.impactLinesT - dt);
    if (this.camZoomPulse > 0) this.camZoomPulse = Math.max(0, this.camZoomPulse - dt * 1.9);
    if (this.hitStopT > 0) this.hitStopT = Math.max(0, this.hitStopT - dt);

    if (this.mode === 'field' && game && game.combat && game.combat.master) {
      const m = game.combat.master;
      this.camTarget.x += (m.x * 0.65 - this.camTarget.x) * Math.min(1, dt * 6);
      this.camTarget.z += ((m.z + 1.5) - this.camTarget.z) * Math.min(1, dt * 6);
    }

    this.computeCameraMatrices(dt);

    const zoneId = (game && game.combat && game.combat.zoneDef && game.combat.zoneDef.id) || 'camp';
    const regIdx = (game && game.combat && game.combat.regionIdx) || 0;
    const cMode = (game && game.combat && game.combat.mode) || 'field';
    const theme = this.mode === 'town'
      ? {
          skyTop: [0.18, 0.50, 0.78], skyMid: [0.52, 0.78, 0.88], skyHor: [0.94, 0.94, 0.88],
          sunDir: [-0.40, 0.85, -0.35], sunCol: [1.06, 1.02, 0.90], ambCol: [0.50, 0.64, 0.74],
          fogCol: [0.72, 0.85, 0.86], tint: [0.98, 1.03, 1.02], mtnCol: [0.30, 0.52, 0.60], weather: 'gold'
        }
      : (window.getMurimBiomeTheme ? window.getMurimBiomeTheme(zoneId, regIdx, cMode) : {
          skyTop: [0.18, 0.50, 0.76], skyMid: [0.50, 0.78, 0.86], skyHor: [0.92, 0.94, 0.86],
          sunDir: [-0.42, 0.84, -0.34], sunCol: [1.06, 1.02, 0.90], ambCol: [0.48, 0.64, 0.72],
          fogCol: [0.70, 0.84, 0.84], tint: [0.98, 1.03, 1.00], mtnCol: [0.30, 0.50, 0.58], weather: 'gold'
        });
    this._curTheme = theme;
    const fog = theme.fogCol;

    // Periodic ambient heavenly tribulation lightning in Lôi Kiếp Đài!
    if (this.mode === 'field' && cMode === 'shadow') {
      this._tribTimer -= dt;
      if (this._tribTimer <= 0) {
        this._tribTimer = 2.4 + Math.random() * 2.2;
        const a = Math.random() * Math.PI * 2;
        this.spawnLightningBolt(0.5 + Math.cos(a) * 5.2, 10.5 + Math.sin(a) * 5.2, '#82b6ff', 1);
      }
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    // Shadow pass executes first (binds shadowFbo), then main scene renders into sceneFbo for Post-Processing Bloom!
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._frameCounter = (this._frameCounter + 1) & 0x3fffffff;
    if (this.mode === 'town') {
      this.renderTown3D(game, dt, now, fog, ctx, theme);
    } else {
      this.renderField3D(game, dt, now, fog, ctx, theme);
    }

    // Apply Offscreen WebGL2 Post-Processing Bloom Composite to default framebuffer!
    if (this.useBloom && this.bloomReady && this.sceneFbo) {
      this.runBloomComposite();
    }

    gl.bindVertexArray(null);
    ctx.restore();
  }

  bindMainSceneTarget(fog) {
    const gl = this.gl;
    if (this.useBloom && this.bloomReady && this.sceneFbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
      gl.viewport(0, 0, this._bloomW, this._bloomH);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
    }
    gl.clearColor(fog[0], fog[1], fog[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  runBloomComposite() {
    const gl = this.gl;
    const bw = Math.max(32, this._bloomW >> 1);
    const bh = Math.max(32, this._bloomH >> 1);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this._emptyVao);

    // 1. Bright-pass extract into bloomFboA
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboA);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(this.bloomExtractProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneColorTex);
    gl.uniform1i(this.uBloomExt.Src, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. Horizontal Gaussian blur bloomA -> bloomB
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboB);
    gl.useProgram(this.bloomBlurProg);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomTexA);
    gl.uniform1i(this.uBloomBlur.Src, 0);
    gl.uniform2f(this.uBloomBlur.Dir, 1.0 / bw, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 3. Vertical Gaussian blur bloomB -> bloomA
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboA);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomTexB);
    gl.uniform2f(this.uBloomBlur.Dir, 0.0, 1.0 / bh);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 4. Composite Scene + Radiant Bloom + Lightning Flash onto screen!
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
    gl.useProgram(this.bloomCompositeProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneColorTex);
    gl.uniform1i(this.uBloomComp.Scene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomTexA);
    gl.uniform1i(this.uBloomComp.Bloom, 1);
    gl.uniform1f(this.uBloomComp.Flash, this.lightningFlash);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  renderBiomeWeather(weather, dt, now, ctx, centerX = 0, centerZ = 10) {
    const isEmber = weather === 'embers';
    const isSpirit = weather === 'spirit';
    const isGold = weather === 'gold';
    const isFirefly = weather === 'firefly';
    const isAutumn = weather === 'autumn';
    const isMist = weather === 'mist';
    const isSnow = weather === 'snow';

    // Subtle warm sunbeams / moonlight shafts from upper-right!
    ctx.save();
    const grad = ctx.createRadialGradient(this.width * 0.82, this.height * 0.08, 20, this.width * 0.82, this.height * 0.08, this.width * 0.62);
    if (isSpirit) {
      grad.addColorStop(0, 'rgba(140, 175, 255, 0.14)');
      grad.addColorStop(1, 'rgba(140, 175, 255, 0)');
    } else if (isEmber) {
      grad.addColorStop(0, 'rgba(255, 110, 62, 0.16)');
      grad.addColorStop(1, 'rgba(255, 110, 62, 0)');
    } else {
      grad.addColorStop(0, 'rgba(255, 242, 198, 0.15)');
      grad.addColorStop(1, 'rgba(255, 242, 198, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    // Subtle shimmering spirit river glints when petals/mist drift over jade water
    if (weather === 'petals' || weather === 'mist') {
      ctx.save();
      for (let s = 0; s < 14; s++) {
        const wx = centerX + Math.sin(s * 2.3 + now * 0.22) * 11.5;
        const wz = 9.5 + ((s * 0.93) % 5.0);
        const sc = this.worldToScreen(wx, 0.04, wz);
        if (!sc) continue;
        const tw = Math.pow(Math.max(0, Math.sin(now * 3.4 + s * 1.7)), 3);
        if (tw < 0.15) continue;
        ctx.fillStyle = `rgba(225, 255, 255, ${(tw * 0.72).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(sc.x, sc.y, 7 * tw, 1.8 * tw, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const p of this.petals) {
      if (isEmber || isSpirit || isGold) {
        p.x += Math.sin(now * 1.4 + p.phase) * 0.45 * dt;
        p.y += (0.85 + (p.sz * 0.15)) * dt;
        p.z += Math.cos(now * 1.1 + p.phase) * 0.35 * dt;
        if (p.y > 10.5) {
          p.x = centerX + (Math.random() - 0.5) * 32;
          p.y = 0.2 + Math.random() * 1.2;
          p.z = centerZ + (Math.random() - 0.5) * 28;
        }
      } else if (isFirefly) {
        p.x += Math.sin(now * 1.2 + p.phase) * 0.9 * dt;
        p.y = 0.9 + Math.sin(now * 1.8 + p.phase * 1.7) * 0.85 + (p.sz * 0.25);
        p.z += Math.cos(now * 1.0 + p.phase) * 0.9 * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.rot += dt * 1.9;
        if (p.y < 0.15 || p.x < centerX - 20) {
          p.x = centerX + 16 + Math.random() * 6;
          p.y = 7.5 + Math.random() * 5;
          p.z = centerZ + (Math.random() - 0.5) * 30;
        }
      }

      const sc = this.worldToScreen(p.x, p.y, p.z);
      if (!sc || sc.x < -30 || sc.x > this.width + 30 || sc.y < -30 || sc.y > this.height + 30) continue;

      ctx.save();
      if (isEmber) {
        const a = 0.55 + 0.4 * Math.sin(now * 9 + p.phase);
        ctx.fillStyle = `rgba(255, ${130 + Math.floor((p.phase * 30) % 90)}, 42, ${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, p.sz * 0.65, 0, Math.PI * 2);
        ctx.fill();
      } else if (isSpirit) {
        const a = 0.45 + 0.35 * Math.sin(now * 4 + p.phase);
        ctx.fillStyle = `rgba(145, 218, 255, ${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, p.sz * 0.85, 0, Math.PI * 2);
        ctx.fill();
      } else if (isGold) {
        const a = 0.5 + 0.38 * Math.sin(now * 5 + p.phase);
        ctx.fillStyle = `rgba(255, 224, 128, ${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, p.sz * 0.72, 0, Math.PI * 2);
        ctx.fill();
      } else if (isFirefly) {
        const a = 0.35 + 0.55 * Math.abs(Math.sin(now * 2.8 + p.phase));
        ctx.fillStyle = `rgba(182, 255, 138, ${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, p.sz * 0.75, 0, Math.PI * 2);
        ctx.fill();
      } else if (isAutumn) {
        ctx.translate(sc.x, sc.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = (p.phase > 3.1) ? 'rgba(232, 92, 42, 0.85)' : 'rgba(246, 182, 54, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.sz * 1.15, p.sz * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (isSnow) {
        ctx.fillStyle = 'rgba(244, 250, 255, 0.88)';
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, p.sz * 0.72, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.translate(sc.x, sc.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = isMist ? 'rgba(220, 252, 250, 0.62)' : 'rgba(255, 206, 226, 0.86)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.sz * (isMist ? 1.4 : 1.0), p.sz * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  renderField3D(game, dt, now, fog, ctx, theme) {
    const gl = this.gl;
    const c = game && game.combat;
    if (!c) return;
    const zone = c.zoneDef || { id: 'camp' };

    const dimMul = Math.max(0.45, 1.0 - this.impactDim);
    const allUnits = [c.master, ...(c.mates || []), ...(c.foes || [])].filter(u => u && (!u.dead || u.corpseT < 1.35));

    // 1. Resolve handcrafted Wuxia 3D Diorama for current zone & chapter!
    let envScene = null;
    if (this.env3d) {
      let zDefForEnv = zone;
      if (c.mode === 'shadow') zDefForEnv = (game.data && game.data.game && game.data.game.fight.zones.find(z => z.id === 'shadow')) || { id: 'shadow' };
      else if (c.mode === 'tower') zDefForEnv = (game.data && game.data.game && game.data.game.fight.zones.find(z => z.id === 'tower')) || { id: 'tower' };
      envScene = this.env3d.getZoneScene(zDefForEnv, c.regionIdx || 0);
    }

    // 2. Real-time 2048x2048 Directional Sun Shadow Pass (terrain + architecture + 24-bone characters!)
    this.computeLightVP(this.camTarget.x, this.camTarget.z, 26.0, theme.sunDir);
    if (envScene) {
      this.renderShadowPass([envScene.group], true, allUnits, now, zone, game);
    }

    // 2b. Bind offscreen Scene FBO for Post-Processing Bloom!
    this.bindMainSceneTarget(fog);

    // 3. Painted Shan-Shui Ink-Wash Sky & Distant Mountain Horizon
    this.renderSkyDome(theme, now);

    // 4. Draw Handcrafted Wuxia 3D Diorama with Soft Shadows, Animated Water, Wind Sway & Dynamic Lantern Lights!
    if (envScene) {
      const tint = [theme.tint[0] * dimMul, theme.tint[1] * dimMul, theme.tint[2] * dimMul];
      this.drawSceneGroups([envScene.group], fog, tint, { isEnv: true, now, theme, lights: envScene.lights });
    } else if (this.fieldReady) {
      let zKey = `Zone_${zone.id || 'camp'}`;
      if (c.mode === 'shadow') zKey = 'Zone_shadow';
      else if (c.mode === 'tower') zKey = 'Zone_tower';
      if (!this.fieldGroups[zKey]) zKey = 'Zone_camp';
      const toDraw = [this.fieldGroups[zKey]];
      this.drawSceneGroups(toDraw, fog, [dimMul, dimMul, dimMul], { isEnv: false, now, theme });
    }

    gl.useProgram(this.charProg);
    gl.uniformMatrix4fv(this.uChar.VP, false, this.matVP);
    gl.uniformMatrix4fv(this.uChar.LightVP, false, this.matLightVP);
    gl.uniform3fv(this.uChar.SunDir, theme.sunDir);
    gl.uniform3fv(this.uChar.SunCol, theme.sunCol);
    gl.uniform3fv(this.uChar.AmbCol, theme.ambCol);
    gl.uniform3fv(this.uChar.CamPos, this.camPos);
    gl.uniform4f(this.uChar.RimCol, 0.55, 0.92, 0.95, 0.35);
    gl.uniform1i(this.uChar.Tex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex || this.whiteTex);
    gl.uniform1i(this.uChar.ShadowMap, 1);

    // Active Storm / Poison Zones
    for (const hz of (c.zonesActive || [])) {
      const col = hz.kind === 'poison' ? [0.48, 0.88, 0.24, 0.58] : [0.42, 0.86, 1.0, 0.52];
      this.setModelMatrix(hz.x, 0.06, hz.z, now * 2.5, hz.r * 2, 1, hz.r * 2);
      this.drawCharMesh('_disc', this.matModel, 'WaterRipple', col, 1, 1, 0, 1, false, false);
    }

    // Ground Cracks & Boss Red Telegraphs on 2D FX layer
    this.renderGroundCracks2D(dt, ctx);
    for (const tel of (c.telegraphs || [])) {
      const prog = Math.min(1, tel.t / Math.max(0.1, tel.dur));
      if (tel.shape === 'circle') {
        this.drawGroundCircle2D(ctx, tel.x, tel.z, tel.r, `rgba(225, 48, 42, ${0.22 + prog * 0.28})`, '#ff4d42');
        this.drawGroundCircle2D(ctx, tel.x, tel.z, tel.r * prog, 'rgba(255, 85, 65, 0.25)', null);
      } else if (tel.shape === 'line') {
        this.drawGroundLine2D(ctx, tel.x, tel.z, tel.angle, tel.reach, tel.width || 1.4, prog);
      }
    }

    // Subtle Master Jade-Gold Foot Ring (crisp & refined — never hides floor stonework!)
    if (c.master && c.master.hp > 0) {
      const gy = this.getTerrainHeight(zone, c.master.x, c.master.z);
      this.setModelMatrix(c.master.x, gy + 0.05, c.master.z, now * 0.8, 1.75, 1, 1.75);
      this.drawCharMesh('_disc', this.matModel, 'WaterRipple', [1.0, 0.88, 0.48, 0.26], 1, 1, 0, 1, false, false);
    }

    // Render All 24-Bone Skinned Combat Units!
    for (const u of allUnits) {
      const baseH = this.getTerrainHeight(zone, u.x, u.z);
      this.renderUnit3D(u, now, baseH, game);
    }

    // Render Orbiting 3D Spirit Weapons (Standalone Ngự Kiếm Trận: 0 → 9 blades, 3 Formations!), Artifacts & 3D Spirit Pet!
    const eqWeapVis = (game && game.getEquippedWeaponVisual) ? game.getEquippedWeaponVisual() : null;
    if (c.master && !c.master.dead) {
      const gy = this.getTerrainHeight(zone, c.master.x, c.master.z);
      const st = (game && game.state) || {};
      const swArr = st.swordArray || { lv: 0, active: true, formation: 'fan' };
      const swordCount = (c.mode === 'prologue' || !swArr.active) ? 0 : Math.max(0, Math.min(9, swArr.lv || 0));
      if (swordCount > 0 || this.backFlights.length > 0) {
        this.renderOrbitingSwords3D(c.master, gy, swordCount, now, eqWeapVis, dt, swArr.formation || 'fan');
      }
      if (c.mode !== 'prologue') {
        this.renderOrbitingArtifacts3D(c.master, gy, st, now);
        this.renderSpiritPet3D(c.master, gy, st, now, game);
      }
      // Render crystal-clear Runic Kiếm Vực (Sword Domain) dual Bagua + Lotus mandala (never obscures characters!)
      if (c.swordDomainT && c.swordDomainT > 0 && this.vfxMeshes && this.vfxMeshes.seal) {
        gl.useProgram(this.vfxProg);
        gl.uniformMatrix4fv(this.uVfx.VP, false, this.matVP);
        gl.disable(gl.CULL_FACE);
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        this.setModelMatrix(c.master.x, gy + 0.08, c.master.z, now * 1.4, 7.6, 1, 7.6);
        gl.uniformMatrix4fv(this.uVfx.Model, false, this.matModel);
        gl.uniform4f(this.uVfx.Color, 0.24, 0.96, 0.88, 0.65);
        gl.uniform3f(this.uVfx.CoreColor, 0.96, 1.0, 0.82);
        gl.uniform1f(this.uVfx.Prog, 0.22);
        gl.uniform1f(this.uVfx.Style, 4.0);
        gl.bindVertexArray(this.vfxMeshes.seal.vao);
        gl.drawElements(gl.TRIANGLES, this.vfxMeshes.seal.count, gl.UNSIGNED_SHORT, 0);

        this.setModelMatrix(c.master.x, gy + 0.10, c.master.z, -now * 1.1, 5.2, 1, 5.2);
        gl.uniformMatrix4fv(this.uVfx.Model, false, this.matModel);
        gl.uniform4f(this.uVfx.Color, 1.0, 0.86, 0.42, 0.50);
        gl.uniform3f(this.uVfx.CoreColor, 1.0, 0.98, 0.85);
        gl.uniform1f(this.uVfx.Prog, 0.28);
        gl.uniform1f(this.uVfx.Style, 6.0);
        gl.drawElements(gl.TRIANGLES, this.vfxMeshes.seal.count, gl.UNSIGNED_SHORT, 0);

        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.charProg);
      }
      // Render Thân Pháp Dodge 3D luminous cyan afterimage silhouettes!
      this.renderDashGhosts3D(dt, zone);
      if (st.meditating) {
        // Spinning Golden-Jade Lotus Bagua Array beneath floating meditating Master!
        gl.useProgram(this.vfxProg);
        gl.uniformMatrix4fv(this.uVfx.VP, false, this.matVP);
        gl.disable(gl.CULL_FACE);
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        this.setModelMatrix(c.master.x, gy + 0.08, c.master.z, now * 1.35, 3.3, 1, 3.3);
        gl.uniformMatrix4fv(this.uVfx.Model, false, this.matModel);
        gl.uniform4f(this.uVfx.Color, 0.36, 1.0, 0.88, 0.92);
        gl.uniform3f(this.uVfx.CoreColor, 1.0, 0.94, 0.62);
        gl.uniform1f(this.uVfx.Prog, 0.12);
        gl.uniform1f(this.uVfx.Style, 4.0);
        gl.bindVertexArray(this.vfxMeshes.seal.vao);
        gl.drawElements(gl.TRIANGLES, this.vfxMeshes.seal.count, gl.UNSIGNED_SHORT, 0);
        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.charProg);
        if (Math.random() < 0.35) {
          const ang = Math.random() * Math.PI * 2;
          const rr = 0.7 + Math.random() * 0.9;
          this.addHitSparks(c.master.x + Math.cos(ang) * rr, gy + 0.3, c.master.z + Math.sin(ang) * rr, '#66fff0', 1);
        }
      }
    }
    this.renderFlyingSwords3D(dt, now, eqWeapVis);

    // Render All 3D BattleFx Meshes (Sword-Qi Crescents, Sky Pillars, Lances, Shockwaves, Seals)
    this.renderVfx3DBatch(dt);

    // Atmospheric Biome Weather Particles & Sun/Moon Shafts!
    this.renderBiomeWeather(theme.weather || 'petals', dt, now, ctx, this.camTarget.x, this.camTarget.z);

    // 2D Weapon Ribbon Trail, 3D Branching Lightning Bolts, Sparks, Overhead Bars, Coins, Damage Popups
    this.renderWeaponTrailAndLightning2D(dt, ctx);
    this.renderFieldOverlay2D(c, allUnits, dt, ctx);
  }

  // Exact 1.10x Original Weapon_Jian Scale Helper (original Weapon_Jian = 0.972m; sculpted = 2.16m -> scale 0.49 = 1.06m!)
  getWeaponScaleForKind(arrayKind) {
    if (arrayKind === 'dao') return 0.50;
    if (arrayKind === 'spear') return 0.56;
    if (arrayKind === 'staff') return 0.55;
    return 0.49; // 1.06m = exact 1.09x of original Weapon_Jian (0.972m)!
  }

  // Exact Centered-Behind-Head Slot Coordinates for Ngự Kiếm Trận (3 Formations: 'fan', 'ring', 'domain'!)
  computeBackSwordSlot(master, groundY, i, count, now, atkFlare = 0, formation = 'fan') {
    const facing = master.facing || 0;
    const backX = -Math.sin(facing), backZ = -Math.cos(facing);
    const rightX = Math.cos(facing), rightZ = -Math.sin(facing);
    const bob = Math.sin(now * 3.2 + i * 1.15) * 0.06;

    if (formation === 'ring') {
      // Hộ Thể Kiếm Hoàn: 360° spinning protective sword circle orbiting Master!
      const ang = (i / Math.max(1, count)) * Math.PI * 2 + now * 1.65;
      const rr = 1.05 + atkFlare * 0.14;
      return {
        sx: master.x + Math.cos(ang) * rr,
        sy: groundY + 1.25 + bob,
        sz: master.z + Math.sin(ang) * rr,
        arcAngle: 0,
        customYaw: ang + Math.PI * 0.5,
        customPitch: 0.18
      };
    }
    if (formation === 'domain') {
      // Vạn Kiếm Kiếm Vực: high soaring vertical sword crown hovering above Master's head!
      const ang = (i / Math.max(1, count)) * Math.PI * 2 - now * 1.1;
      const rr = count === 1 ? 0.0 : (0.58 + Math.min(0.45, count * 0.05));
      return {
        sx: master.x + Math.cos(ang) * rr + backX * 0.25,
        sy: groundY + 2.08 + bob * 1.2,
        sz: master.z + Math.sin(ang) * rr + backZ * 0.25,
        arcAngle: 0,
        customYaw: facing,
        customPitch: Math.PI * 0.92 // Pointing dramatically downward ready to strike!
      };
    }

    // Default 'fan' (Liên Xạ Kiếm Phiến): centered dead-behind-head arc!
    const step = count <= 3 ? 0.25 : (count <= 5 ? 0.21 : (count <= 7 ? 0.18 : 0.155));
    const arcAngle = (i - (count - 1) * 0.5) * (step + atkFlare * 0.03);
    const cx = master.x + backX * 0.40;
    const cy = groundY + 1.44;
    const cz = master.z + backZ * 0.40;
    const fanR = 0.64 + atkFlare * 0.10;
    const sx = cx + rightX * Math.sin(arcAngle) * fanR;
    const sy = cy + (Math.cos(arcAngle) - 1.0) * 0.36 + bob;
    const sz = cz + rightZ * Math.sin(arcAngle) * fanR;
    return { sx, sy, sz, arcAngle };
  }

  renderOrbitingSwords3D(master, groundY, count, now, wVis = null, dt = 0.016, formation = 'fan') {
    const arrayKind = (wVis && wVis.arrayKind) || 'customSword';
    const hiltCol = (wVis && wVis.hiltCol) || [0.98, 0.80, 0.32];
    const haloCol = (wVis && wVis.haloCol) || [0.46, 0.98, 0.94];
    const facing = master.facing || 0;
    const backX = -Math.sin(facing), backZ = -Math.cos(facing);
    const atkFlare = master.animT > 0 ? Math.min(1.0, master.animT * 3.2) : 0;
    const wpSc = this.getWeaponScaleForKind(arrayKind); // 1:1 exact same size as hand weapon!

    const launchedSlots = new Set(this.backFlights.map(bf => bf.slotIdx));
    const slotPositions = [];

    // 1. Luminous Weapon-Array Halo Ring centered directly behind head (adapts to formation!)
    if (count > 0 && this.meshes._haloRing) {
      const isRing = formation === 'ring';
      const hx = master.x + (isRing ? 0 : backX * 0.44);
      const hy = groundY + (formation === 'domain' ? 2.10 : (isRing ? 1.15 : 1.56)) + Math.sin(now * 2.4) * 0.04;
      const hz = master.z + (isRing ? 0 : backZ * 0.44);
      const rSc = (isRing ? 1.05 : (0.34 + count * 0.032)) + atkFlare * 0.08;
      this.setModelMatrix(hx, hy, hz, facing, rSc, rSc, rSc, isRing ? Math.PI * 0.5 : 0.12, now * 1.4);
      this.drawCharMesh('_haloRing', this.matModel, '', [haloCol[0], haloCol[1], haloCol[2], 0.56], 1, 1, 0.40, 1, false, false);
      this.setModelMatrix(hx, hy, hz, facing, rSc * 0.72, rSc * 0.72, rSc * 0.72, isRing ? Math.PI * 0.5 : 0.12, -now * 2.1);
      this.drawCharMesh('_haloRing', this.matModel, '', [hiltCol[0], hiltCol[1], hiltCol[2], 0.60], 1, 1, 0.32, 1, false, false);
    }

    // 2. Sculpted 3D Spirit Weapons in active Formation (1..9 blades, 1:1 hand weapon scale!)
    for (let i = 0; i < count; i++) {
      const sl = this.computeBackSwordSlot(master, groundY, i, count, now, atkFlare, formation);
      slotPositions[i] = [sl.sx, sl.sy, sl.sz];
      if (launchedSlots.has(i)) continue;
      const pitchFwd = sl.customPitch !== undefined ? sl.customPitch : (0.10 + atkFlare * 0.55);
      const yawUse = sl.customYaw !== undefined ? sl.customYaw : facing;
      this.setModelMatrix(sl.sx, sl.sy, sl.sz, yawUse, wpSc, wpSc, wpSc, pitchFwd, -sl.arcAngle * 0.85);
      this.drawSculptedWeapon3D(arrayKind, this.matModel, wVis, 0.98, 0.42);
    }

    // 3. Step & Render Live Launching / Piercing / Returning Back-Weapons (1:1 exact weapon scale!)
    for (let i = this.backFlights.length - 1; i >= 0; i--) {
      const bf = this.backFlights[i];
      bf.t += dt;
      const totalDur = bf.goDur + bf.retDur;
      if (bf.t >= totalDur) {
        this.backFlights.splice(i, 1);
        continue;
      }
      if (!bf.hitDone && bf.target && !bf.target.dead) {
        bf.tx = bf.target.x;
        bf.tz = bf.target.z;
      }
      let px, py, pz, vx, vy, vz;
      const retSlot = slotPositions[bf.slotIdx % Math.max(1, slotPositions.length)] || [master.x, groundY + 1.50, master.z];

      if (bf.t < bf.goDur) {
        const u = bf.t / bf.goDur;
        const e = u * u * (3 - 2 * u);
        const ie = 1 - e;
        px = ie*ie*bf.sx + 2*ie*e*bf.cx + e*e*bf.tx;
        py = ie*ie*bf.sy + 2*ie*e*bf.cy + e*e*bf.ty;
        pz = ie*ie*bf.sz + 2*ie*e*bf.cz + e*e*bf.tz;
        vx = 2*ie*(bf.cx - bf.sx) + 2*e*(bf.tx - bf.cx);
        vy = 2*ie*(bf.cy - bf.sy) + 2*e*(bf.ty - bf.cy);
        vz = 2*ie*(bf.cz - bf.sz) + 2*e*(bf.tz - bf.cz);
      } else {
        if (!bf.hitDone) {
          bf.hitDone = true;
          if (bf.onHitCb) bf.onHitCb(bf.tx, bf.tz);
        }
        const u = (bf.t - bf.goDur) / bf.retDur;
        const e = u * u * (3 - 2 * u);
        const ie = 1 - e;
        const rcx = (bf.tx + retSlot[0]) * 0.5 - (bf.cx - bf.sx) * 0.35;
        const rcy = Math.max(bf.ty, retSlot[1]) + 0.85;
        const rcz = (bf.tz + retSlot[2]) * 0.5 - (bf.cz - bf.sz) * 0.35;
        px = ie*ie*bf.tx + 2*ie*e*rcx + e*e*retSlot[0];
        py = ie*ie*bf.ty + 2*ie*e*rcy + e*e*retSlot[1];
        pz = ie*ie*bf.tz + 2*ie*e*rcz + e*e*retSlot[2];
        vx = 2*ie*(rcx - bf.tx) + 2*e*(retSlot[0] - rcx);
        vy = 2*ie*(rcy - bf.ty) + 2*e*(retSlot[1] - rcy);
        vz = 2*ie*(rcz - bf.tz) + 2*e*(retSlot[2] - rcz);
      }

      bf.trail.push([px, py, pz]);
      if (bf.trail.length > 10) bf.trail.shift();

      const yaw = Math.atan2(vx, vz);
      const horiz = Math.hypot(vx, vz) || 0.001;
      const lean = Math.atan2(horiz, vy);
      const spinRoll = (arrayKind === 'dao' && bf.t < bf.goDur + 0.12) ? (now * 24.0) : (now * 4.5);
      const flSc = wpSc * 1.05;
      this.setModelMatrix(px, py, pz, yaw, flSc, flSc, flSc, lean, spinRoll);
      this.drawSculptedWeapon3D(arrayKind, this.matModel, bf.wVis || wVis, 1.0, 0.80);
    }
  }

  renderOrbitingArtifacts3D(master, groundY, st, now) {
    const art = st.artifacts || {};
    const medOff = st.meditating ? 0.42 : 0;
    const baseY = groundY + 1.18 + medOff;

    // 1. Bát Quái Hộ Thân Kính / Kim Chung Pháp Bảo — Sculpted 3D Golden Immortal Bell + Glowing Halo Ring!
    if (art.mirror && art.mirror.lv > 0 && art.mirror.eq) {
      const a = now * 1.65;
      const mx = master.x + Math.cos(a) * 1.32;
      const mz = master.z + Math.sin(a) * 1.32;
      const my = baseY + 0.16 + Math.sin(now * 3.1) * 0.12;
      if (this.meshes.TT_Art_Bell) {
        this.setModelMatrix(mx, my, mz, now * 1.8, 0.72, 0.72, 0.72, Math.sin(now * 2.4) * 0.10, 0);
        this.drawCharMesh('TT_Art_Bell', this.matModel, 'TT_Tex_Art_Bell', [1.0, 0.96, 0.86, 1.0], 1, 1, 0.24, 0, false, false);
        if (this.meshes._haloRing) {
          this.setModelMatrix(mx, my - 0.16, mz, now * 2.4, 0.44, 0.44, 0.44, Math.PI * 0.5, now * 1.6);
          this.drawCharMesh('_haloRing', this.matModel, '', [1.0, 0.86, 0.34, 0.88], 1, 1, 0.42, 1, false, false);
        }
      } else {
        if (this.meshes._haloRing) {
          this.setModelMatrix(mx, my, mz, -a + Math.PI * 0.5, 0.34, 0.34, 0.34, 0, now * 2.2);
          this.drawCharMesh('_haloRing', this.matModel, '', [1.0, 0.84, 0.32, 0.98], 1, 1, 0.35, 1, false, false);
        }
        this.setModelMatrix(mx, my, mz, -a + Math.PI * 0.5, 0.48, 0.48, 0.48, Math.PI * 0.48, -now * 2.0);
        this.drawCharMesh('_disc', this.matModel, 'WaterRipple', [0.52, 1.0, 0.94, 0.95], 1, 1, 0.45, 1, false, false);
      }
    }

    // 2. Cửu Tiêu Lôi Châu / Tử Tiêu Linh Đăng — Sculpted 3D Violet-Thunder Lotus Lantern + Twin Spinning Lightning Rings!
    if (art.orb && art.orb.lv > 0 && art.orb.eq) {
      const a = now * 2.1 + 2.1;
      const ox = master.x + Math.cos(a) * 1.44;
      const oz = master.z + Math.sin(a) * 1.44;
      const oy = baseY + 0.48 + Math.cos(now * 4.2) * 0.12;
      if (this.meshes.TT_Art_Lantern) {
        this.setModelMatrix(ox, oy, oz, now * 1.5, 0.78, 0.78, 0.78, Math.sin(now * 3.0) * 0.08, 0);
        this.drawCharMesh('TT_Art_Lantern', this.matModel, 'TT_Tex_Art_Lantern', [1.0, 0.92, 1.0, 1.0], 1, 1, 0.34, 0, false, false);
        if (this.meshes._haloRing) {
          this.setModelMatrix(ox, oy, oz, now * 4.2, 0.42, 0.42, 0.42, 0.95, now * 5.0);
          this.drawCharMesh('_haloRing', this.matModel, '', [0.74, 0.48, 1.0, 0.85], 1, 1, 0.55, 1, false, false);
          this.setModelMatrix(ox, oy, oz, -now * 3.8, 0.36, 0.36, 0.36, -0.95, -now * 4.4);
          this.drawCharMesh('_haloRing', this.matModel, '', [0.58, 0.88, 1.0, 0.78], 1, 1, 0.50, 1, false, false);
        }
      } else if (this.meshes._orb) {
        const pulse = 0.26 + Math.sin(now * 9.0) * 0.04;
        this.setModelMatrix(ox, oy, oz, now * 3.2, pulse, pulse, pulse, 0, 0);
        this.drawCharMesh('_orb', this.matModel, '', [0.96, 0.92, 1.0, 1.0], 1, 1, 0.78, 1, false, false);
        if (this.meshes._haloRing) {
          this.setModelMatrix(ox, oy, oz, now * 4.2, 0.36, 0.36, 0.36, 0.95, now * 5.0);
          this.drawCharMesh('_haloRing', this.matModel, '', [0.74, 0.48, 1.0, 0.92], 1, 1, 0.55, 1, false, false);
          this.setModelMatrix(ox, oy, oz, -now * 3.8, 0.32, 0.32, 0.32, -0.95, -now * 4.4);
          this.drawCharMesh('_haloRing', this.matModel, '', [0.58, 0.88, 1.0, 0.85], 1, 1, 0.50, 1, false, false);
        }
      }
    }

    // 3. Chu Tước Luyện Đan Lô / Hồng Liên Nghiệp Hỏa — Sculpted 3D Flaming Spirit Lotus + Spirit Fire Core!
    if (art.furnace && art.furnace.lv > 0 && art.furnace.eq) {
      const a = now * 1.3 + 4.2;
      const fx = master.x + Math.cos(a) * 1.48;
      const fz = master.z + Math.sin(a) * 1.48;
      const fy = baseY + 0.18 + Math.sin(now * 2.6 + 1.2) * 0.10;
      if (this.meshes.TT_Art_Lotus) {
        this.setModelMatrix(fx, fy, fz, now * 1.4, 0.76, 0.76, 0.76, -0.45, Math.sin(now * 2.2) * 0.14);
        this.drawCharMesh('TT_Art_Lotus', this.matModel, 'TT_Tex_Art_Lotus', [1.0, 0.94, 0.84, 1.0], 1, 1, 0.32, 0, false, false);
      } else if (this.meshes._furnace) {
        this.setModelMatrix(fx, fy, fz, now * 1.5, 0.48, 0.48, 0.48, 0, 0);
        this.drawCharMesh('_furnace', this.matModel, '', [0.96, 0.56, 0.22, 0.98], 1, 1, 0.24, 0, true, false);
      }
      if (this.meshes._orb) {
        const fl = 0.16 + Math.sin(now * 11.0) * 0.035;
        this.setModelMatrix(fx, fy + 0.26, fz, now * 3.0, fl, fl * 1.45, fl, 0, 0);
        this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.86, 0.36, 0.96], 1, 1, 0.72, 1, false, false);
        this.setModelMatrix(fx, fy + 0.30, fz, -now * 4.0, fl * 1.30, fl * 1.70, fl * 1.30, 0, 0);
        this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.38, 0.12, 0.44], 1, 1, 0.45, 1, false, false);
      }
    }

    // 4. Active Bát Quái Kính Shield Aura, Bạo Huyết Đan Crimson Halo & Equipped 3D Gear Visual Auras!
    const eqG = st.gearEquipped || {};
    if (eqG.armor === 'ar_celestial_robe' && this.meshes._haloRing) {
      // Shimmering Starlight Celestial Robe floating shoulder silk aura!
      this.setModelMatrix(master.x, groundY + 1.05 + medOff, master.z, now * 1.1, 1.02, 1.02, 1.02, Math.PI * 0.5 + 0.22, now * 0.8);
      this.drawCharMesh('_haloRing', this.matModel, '', [0.42, 0.96, 1.0, 0.45], 1, 1, 0.35, 1, false, false);
    }
    if ((eqG.jade === 'jd_lotus' || eqG.jade === 'jd_dragon') && this.meshes._haloRing) {
      const jCol = eqG.jade === 'jd_dragon' ? [1.0, 0.84, 0.32, 0.52] : [0.42, 0.98, 0.74, 0.46];
      this.setModelMatrix(master.x, groundY + 0.10, master.z, -now * 1.2, 1.28, 1.28, 1.28, Math.PI * 0.5, 0);
      this.drawCharMesh('_haloRing', this.matModel, '', jCol, 1, 1, 0.30, 1, false, false);
    }
    if (master.shieldHp && master.shieldHp > 0 && this.meshes._haloRing) {
      this.setModelMatrix(master.x, groundY + 0.88 + medOff, master.z, now * 1.4, 1.05, 1.05, 1.05, Math.PI * 0.5, 0);
      this.drawCharMesh('_haloRing', this.matModel, '', [0.46, 0.98, 0.88, 0.58], 1, 1, 0.28, 1, false, false);
    }
    if (st.atkBuffT && st.atkBuffT > 0) {
      this.setModelMatrix(master.x, groundY + 0.09, master.z, -now * 2.5, 2.25, 1, 2.25, 0, 0);
      this.drawCharMesh('_disc', this.matModel, 'WaterRipple', [1.0, 0.34, 0.20, 0.42], 1, 1, 0.25, 1, false, false);
    }
  }

  // ==================== GROUNDED CHIBI 3D SPIRIT PETS WITH SMOOTH FOLLOW & PER-SPECIES LOCOMOTION ====================
  renderSpiritPet3D(master, groundY, st, now, game, isTown = false) {
    if (!st || !st.petActive || !this.meshes._petAvianBody) return;
    const petSt = (st.pets && st.pets[st.petActive]) || null;
    if (!petSt || (petSt.lv || 0) <= 0) return;

    const lv = petSt.lv || 1;
    const evo = lv >= 10 ? 3 : (lv >= 5 ? 2 : 1); // 1: Ấu Thể, 2: Thành Thể, 3: Thánh Thú!
    const pid = st.petActive;
    const facing = master.facing || 0;
    const rightX = Math.cos(facing), rightZ = -Math.sin(facing);
    const fwdX = Math.sin(facing), fwdZ = Math.cos(facing);
    const castBoost = (!isTown && game && game.combat && game.combat.petCastT > 0)
      ? Math.sin((game.combat.petCastT / 0.45) * Math.PI) : 0;

    // Grounded target beside Master's open right flank (or lunging forward slightly during active pet skill!)
    let tx, tz, tyaw;
    if (isTown) {
      tx = master.x + 1.85;
      tz = master.z - 0.45;
      tyaw = Math.PI - 0.25 + Math.sin(now * 1.4) * 0.16;
    } else {
      tx = master.x + rightX * 1.48 + fwdX * (-0.28 + castBoost * 1.15);
      tz = master.z + rightZ * 1.48 + fwdZ * (-0.28 + castBoost * 1.15);
      tyaw = facing;
    }

    // Smooth ground-follow physics so the Spirit Pet physically runs/hops/waddles beside Master!
    if (!this._petTrack || this._petTrack.isTown !== isTown || Math.hypot(tx - this._petTrack.x, tz - this._petTrack.z) > 10.0) {
      this._petTrack = { x: tx, z: tz, yaw: tyaw, isTown, moveAmt: 0 };
    }
    const tr = this._petTrack;
    const dx = tx - tr.x, dz = tz - tr.z;
    const dist = Math.hypot(dx, dz);
    const followStep = Math.min(1, 0.14);
    if (dist > 0.06) {
      tr.x += dx * followStep;
      tr.z += dz * followStep;
      const moveYaw = Math.atan2(dx, dz);
      const diff = ((moveYaw - tr.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      tr.yaw += diff * 0.18;
    } else {
      const diff = ((tyaw - tr.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      tr.yaw += diff * 0.12;
    }
    const targetMove = Math.min(1, dist * 1.35 + (master.moving ? 0.55 : 0));
    tr.moveAmt += (targetMove - tr.moveAmt) * 0.16;

    const zone = (!isTown && game && game.combat) ? game.combat.zone : null;
    const petGroundY = zone ? this.getTerrainHeight(zone, tr.x, tr.z) : groundY;
    const px = tr.x, pz = tr.z, yaw = tr.yaw;
    const moveAmt = isTown ? 0.12 : tr.moveAmt;

    const sc = 0.62 + evo * 0.065 + castBoost * 0.08;
    const palettes = {
      qingluan: { ring: [0.22, 0.96, 0.84, 0.82], gold: [1.0, 0.84, 0.30, 0.86], hex: '#48ffe8' },
      leilong:  { ring: [0.58, 0.40, 1.0, 0.84],  gold: [0.46, 0.94, 1.0, 0.84], hex: '#b47cff' },
      xuanwu:   { ring: [0.24, 0.90, 0.56, 0.82], gold: [1.0, 0.84, 0.34, 0.86], hex: '#52e898' },
      jiuwei:   { ring: [1.0, 0.44, 0.72, 0.84],  gold: [1.0, 0.88, 0.50, 0.84], hex: '#ff7ec4' }
    };
    const pal = palettes[pid] || palettes.qingluan;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);

    // 1. Grounded 3D Contact Shadow flush under paws
    this.setModelMatrix(px, petGroundY + 0.03, pz, 0, 0.84 * sc, 1, 0.84 * sc);
    this.drawCharMesh('_disc', this.matModel, '', [0.06, 0.08, 0.12, 0.34], 1, 1, 0, 1, false, false);

    // Per-species grounded locomotion animation (feet flush on y=0.0 in mesh space!)
    const ttPetMap = {
      qingluan: { mesh: 'TT_Pet_QingLuan', tex: 'TT_Tex_Pet_QingLuan', scMul: 1.38, gait: 'owl' },
      leilong:  { mesh: 'TT_Pet_LeiLong',  tex: 'TT_Tex_Pet_LeiLong',  scMul: 1.44, gait: 'qilin' },
      xuanwu:   { mesh: 'TT_Pet_XuanWu',   tex: 'TT_Tex_Pet_XuanWu',   scMul: 1.42, gait: 'tortoise' },
      jiuwei:   { mesh: 'TT_Pet_JiuWei',   tex: 'TT_Tex_Pet_JiuWei',   scMul: 1.36, gait: 'bunny' }
    };
    const ttPet = ttPetMap[pid] || ttPetMap.qingluan;
    const glow = castBoost * 0.42;

    if (this.meshes[ttPet.mesh]) {
      const pSc = sc * ttPet.scMul;
      let hopY = 0, pitch = 0, roll = 0, squash = 1.0;
      if (ttPet.gait === 'bunny') {
        // Tiên Hoa Ngọc Thỏ: energetic parabolic bunny hops + cute squash-stretch on landing!
        const ph = now * (4.6 + moveAmt * 4.4);
        const s = Math.abs(Math.sin(ph));
        hopY = Math.pow(s, 1.25) * (0.06 + moveAmt * 0.28) + castBoost * 0.24;
        squash = 1.0 + (s - 0.42) * (0.07 + moveAmt * 0.10);
        pitch = Math.cos(ph) * (0.06 + moveAmt * 0.14) - castBoost * 0.22;
        roll = Math.sin(ph * 0.5) * 0.06;
      } else if (ttPet.gait === 'qilin') {
        // Cửu Tiêu Lôi Kỳ Lân: agile 4-leg prance/gallop bounce + electric forward lunge!
        const ph = now * (5.2 + moveAmt * 5.0);
        const s = Math.abs(Math.sin(ph));
        hopY = s * (0.03 + moveAmt * 0.18) + castBoost * 0.20;
        squash = 1.0 + (s - 0.45) * (0.05 + moveAmt * 0.08);
        pitch = Math.sin(ph) * (0.05 + moveAmt * 0.13) - castBoost * 0.26;
        roll = Math.cos(ph * 0.5) * (0.04 + moveAmt * 0.08);
      } else if (ttPet.gait === 'tortoise') {
        // Huyền Vũ Cổ Tùng Quy: heavy grounded rhythmic waddle sway + sturdy step!
        const ph = now * (3.2 + moveAmt * 3.4);
        hopY = Math.abs(Math.sin(ph)) * (0.015 + moveAmt * 0.045) + castBoost * 0.08;
        squash = 1.0 + Math.sin(ph * 2.0) * 0.025 + castBoost * 0.07;
        roll = Math.sin(ph) * (0.04 + moveAmt * 0.10);
        pitch = -castBoost * 0.14;
      } else {
        // Thanh Ngọc Tuyết Cú: grounded hop-perch when idle, light wing-flutter skim when moving!
        const ph = now * (5.0 + moveAmt * 3.8);
        hopY = 0.03 + moveAmt * 0.14 + Math.abs(Math.sin(ph)) * (0.05 + moveAmt * 0.09) + castBoost * 0.28;
        squash = 1.0 + Math.sin(ph) * 0.06 + castBoost * 0.08;
        roll = Math.sin(ph * 0.5) * (0.06 + moveAmt * 0.12);
        pitch = moveAmt * 0.12 - castBoost * 0.26;
      }
      const py = petGroundY + hopY;

      // 2. Evolution Sacred Spinning 3D Halos behind Grounded Pet (Thành Thể = 1 ring, Thánh Thú = dual rings!)
      if (this.meshes._haloRing && evo >= 2) {
        const hx = px - fx * 0.28, hz = pz - fz * 0.28;
        const hy = py + 0.48 * pSc;
        const r1 = (0.42 + evo * 0.07 + castBoost * 0.12) * sc;
        this.setModelMatrix(hx, hy, hz, yaw, r1, r1, r1, 0, now * 2.1);
        this.drawCharMesh('_haloRing', this.matModel, '', pal.ring, 1, 1, 0.45, 1, false, false);
        if (evo >= 3) {
          const r2 = r1 * 0.76;
          this.setModelMatrix(hx - fx * 0.05, hy, hz - fz * 0.05, yaw, r2, r2, r2, 0, -now * 2.8);
          this.drawCharMesh('_haloRing', this.matModel, '', pal.gold, 1, 1, 0.55, 1, false, false);
        }
      }

      const sxz = pSc / Math.sqrt(Math.max(0.75, squash));
      this.setModelMatrix(px, py, pz, yaw, sxz, pSc * squash, sxz, pitch, roll);
      this.drawCharMesh(ttPet.mesh, this.matModel, ttPet.tex, [1.0, 1.0, 1.0, 1.0], 1, 1, glow + 0.06, 0, true, false);

      // Subtle elemental spirit motes rising from paws/aura when moving or casting!
      if (Math.random() < (0.10 + moveAmt * 0.18 + evo * 0.04)) {
        this.addHitSparks(px + (Math.random() - 0.5) * 0.42, py + 0.22 + Math.random() * 0.35, pz + (Math.random() - 0.5) * 0.42, pal.hex, 1);
      }
      return;
    }

    const py = petGroundY + 0.65 + Math.sin(now * 3.4) * 0.08;
    if (pid === 'qingluan') {
      // === THANH LOAN TIÊN ĐIỂU: Articulated Flapping Jade-Gold Spirit Phoenix (Positive-Winding _petWingL/_petWingR + Painted Plumage!) ===
      const flap = Math.sin(now * 8.4 + castBoost * 4.0) * 0.52 + castBoost * 0.32;
      const flap2 = Math.sin(now * 8.4 - 0.36) * 0.44;
      const pitch = Math.sin(now * 3.6) * 0.09 - castBoost * 0.24;

      // Sculpted sleek turquoise-jade torso + arched swan neck + head
      this.setModelMatrix(px, py, pz, yaw, sc, sc, sc, pitch, 0);
      this.drawCharMesh('_petAvianBody', this.matModel, '_petFeatherTex', [0.85, 1.0, 0.96, 1.0], 1, 1, glow, 0, true, false);
      // Radiant golden breast jewel
      this.setModelMatrix(px + fx * 0.18 * sc, py + 0.02 * sc, pz + fz * 0.18 * sc, yaw, 0.11 * sc, 0.13 * sc, 0.09 * sc);
      this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.88, 0.36, 1.0], 1, 1, 0.55, 1, false, false);
      // Sharp curved golden beak
      this.setModelMatrix(px + fx * 0.48 * sc, py + 0.34 * sc, pz + fz * 0.48 * sc, yaw, sc, sc, sc, pitch + 0.12, 0);
      this.drawCharMesh('_petBeak', this.matModel, '_wpGoldTex', [1.0, 0.92, 0.52, 1.0], 1, 1, 0.25, 0, true, false);
      // Luminous golden eyes
      for (const s of [-1, 1]) {
        this.setModelMatrix(px + fx * 0.40 * sc + rx * (s * 0.09 * sc), py + 0.36 * sc, pz + fz * 0.40 * sc + rz * (s * 0.09 * sc), yaw, 0.038 * sc, 0.038 * sc, 0.038 * sc);
        this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.96, 0.58, 1.0], 1, 1, 0.88, 1, false, false);
      }
      // 3-Feather Sweeping Golden Crown Plumes
      const crestCnt = evo >= 2 ? 3 : 1;
      for (let c = 0; c < crestCnt; c++) {
        const off = (c - (crestCnt - 1) * 0.5) * 0.24;
        this.setModelMatrix(px + fx * 0.32 * sc, py + 0.42 * sc, pz + fz * 0.32 * sc, yaw + off, 0.86 * sc, 0.96 * sc, 0.96 * sc, -0.35 + Math.sin(now * 5 + c) * 0.08, off);
        this.drawCharMesh('_petFin', this.matModel, '_wpGoldTex', [1.0, 0.90, 0.42, 1.0], 1, 1, 0.42, 0, true, false);
      }
      // Dual-Tier Articulated Flapping Multi-Feather Wings (Separate Positive-Winding _petWingR & _petWingL — NEVER black!)
      for (const s of [-1, 1]) {
        const wKey = s > 0 ? '_petWingR' : '_petWingL';
        const wx = px + rx * (s * 0.14 * sc) + fx * 0.04 * sc;
        const wz = pz + rz * (s * 0.14 * sc) + fz * 0.04 * sc;
        // Primary Layered Jade-Gold Wing
        this.setModelMatrix(wx, py + 0.08 * sc, wz, yaw, sc * 1.12, sc, sc * 1.08, pitch * 0.5, s * flap);
        this.drawCharMesh(wKey, this.matModel, '_petFeatherTex', [0.92, 1.04, 1.0, 1.0], 1, 1, glow + 0.08, 0, true, false);
        // Secondary Glowing Golden-Jade Feather Tier (flaps slightly behind primary!)
        this.setModelMatrix(wx - fx * 0.07 * sc, py + 0.05 * sc, wz - fz * 0.07 * sc, yaw - s * 0.14, sc * 0.94, sc * 0.84, sc * 0.94, pitch * 0.5, s * (flap2 - 0.12));
        this.drawCharMesh(wKey, this.matModel, '_wpGoldTex', [1.0, 0.92, 0.48, 0.96], 1, 1, 0.38 + glow, 0, false, false);
      }
      // 3->5 Undulating Articulated Phoenix Tail Streamers
      const tCnt = evo === 3 ? 5 : (evo === 2 ? 3 : 2);
      for (let k = 0; k < tCnt; k++) {
        const spread = (k - (tCnt - 1) * 0.5) * 0.28;
        const wave = Math.sin(now * 5.2 + k * 0.85) * 0.18;
        const tSc = sc * (1.0 - Math.abs(spread) * 0.32);
        const tex = (k % 2 === 0) ? '_petFeatherTex' : '_wpGoldTex';
        const col = (k % 2 === 0) ? [0.85, 1.04, 0.98, 1.0] : [1.0, 0.90, 0.42, 1.0];
        this.setModelMatrix(px - fx * 0.26 * sc, py - 0.02 * sc, pz - fz * 0.26 * sc, yaw + spread + wave * 0.4, tSc * 0.78, tSc * 0.96, tSc * 1.18, -0.22 + wave, spread * 0.5);
        this.drawCharMesh('_petTail', this.matModel, tex, col, 1, 1, 0.24 + glow, 0, true, false);
      }
    } else if (pid === 'leilong') {
      // === CỬU TIÊU LÔI LONG TỬ: 8-Segment Undulating Scaled 3D Celestial Thunder Dragon! ===
      const segs = 8;
      const dSc = sc * 1.16;
      for (let i = segs - 1; i >= 0; i--) {
        const ph = now * 5.4 - i * 0.62;
        const sideW = Math.sin(ph) * (0.16 + i * 0.036) * dSc;
        const vertW = Math.cos(ph * 0.85) * (0.10 + i * 0.020) * dSc;
        const backDist = (i - 1.5) * 0.25 * dSc;
        const sx = px - fx * backDist + rx * sideW;
        const sy = py + vertW;
        const sz = pz - fz * backDist + rz * sideW;
        const sYaw = yaw + Math.cos(ph) * 0.34;
        if (i === 0) {
          this.setModelMatrix(sx, sy, sz, sYaw, dSc * 1.04, dSc * 1.04, dSc * 1.04, -castBoost * 0.22, 0);
          this.drawCharMesh('_petDragonHead', this.matModel, '_petScaleTex', [0.82, 0.86, 1.15, 1.0], 1, 1, glow + 0.10, 0, true, false);
          for (const s of [-1, 1]) {
            this.setModelMatrix(sx + rx * (s * 0.12 * dSc), sy + 0.12 * dSc, sz + rz * (s * 0.12 * dSc), sYaw + s * 0.25, dSc * 1.0, dSc * 1.10, dSc * 1.0, -0.15, s * 0.34);
            this.drawCharMesh('_petHorn', this.matModel, '_wpGoldTex', [1.0, 0.90, 0.44, 1.0], 1, 1, 0.40, 0, true, false);
            this.setModelMatrix(sx + fx * 0.14 * dSc + rx * (s * 0.11 * dSc), sy + 0.06 * dSc, sz + fz * 0.14 * dSc + rz * (s * 0.11 * dSc), sYaw, 0.048 * dSc, 0.048 * dSc, 0.048 * dSc);
            this.drawCharMesh('_orb', this.matModel, '', [0.58, 0.98, 1.0, 1.0], 1, 1, 0.95, 1, false, false);
          }
          this.setModelMatrix(sx + fx * 0.62 * dSc, sy + 0.06 * dSc + Math.sin(now * 7) * 0.05, sz + fz * 0.62 * dSc, now * 3, 0.14 * dSc, 0.14 * dSc, 0.14 * dSc);
          this.drawCharMesh('_orb', this.matModel, '', [0.52, 0.94, 1.0, 1.0], 1, 1, 0.85, 1, false, false);
        } else {
          const rad = (0.21 - i * 0.015) * dSc;
          this.setModelMatrix(sx, sy, sz, sYaw, rad, rad * 0.94, rad * 1.48);
          this.drawCharMesh('_orb', this.matModel, '_petScaleTex', [0.78, 0.86, 1.15, 1.0], 1, 1, glow + 0.08, 0, true, false);
          this.setModelMatrix(sx, sy + rad * 0.72, sz, sYaw, rad * 2.4, rad * 2.8, rad * 2.8);
          this.drawCharMesh('_petFin', this.matModel, '', [0.44, 0.96, 1.0, 0.98], 1, 1, 0.56, 1, true, false);
          if (i === segs - 1) {
            this.setModelMatrix(sx, sy, sz, sYaw, dSc * 0.68, dSc * 0.68, dSc * 0.82);
            this.drawCharMesh('_petTail', this.matModel, '_wpGoldTex', [0.64, 0.94, 1.0, 0.98], 1, 1, 0.52, 0, true, false);
          }
        }
      }
    } else if (pid === 'xuanwu') {
      // === HUYỀN VŨ LINH QUY: Engraved Jade-Gold Hexagonal Tortoise + Coiled Spirit Serpent! ===
      const hoverY = py - 0.10;
      const xSc = sc * 1.15;
      this.setModelMatrix(px, hoverY, pz, yaw, xSc * 1.05, xSc * 1.05, xSc * 1.05);
      this.drawCharMesh('_petShell', this.matModel, '_petShellTex', [0.92, 1.02, 0.94, 1.0], 1, 1, glow, 0, true, false);
      if (this.meshes._haloRing) {
        this.setModelMatrix(px, hoverY + 0.06 * xSc, pz, now * 1.4, 0.54 * xSc, 0.54 * xSc, 0.54 * xSc, Math.PI * 0.5, 0);
        this.drawCharMesh('_haloRing', this.matModel, '', [1.0, 0.84, 0.34, 0.95], 1, 1, 0.44, 1, false, false);
      }
      this.setModelMatrix(px + fx * 0.48 * xSc, hoverY + 0.04 * xSc + Math.sin(now * 3.2) * 0.04, pz + fz * 0.48 * xSc, yaw, xSc * 0.76, xSc * 0.72, xSc * 0.80);
      this.drawCharMesh('_petDragonHead', this.matModel, '_petShellTex', [0.76, 0.98, 0.82, 1.0], 1, 1, glow, 0, true, false);
      for (const [lx, lz, ph] of [[-0.36, 0.28, 0], [0.36, 0.28, 1.5], [-0.34, -0.28, 3.0], [0.34, -0.28, 4.5]]) {
        const pad = Math.sin(now * 4.5 + ph) * 0.24;
        this.setModelMatrix(px + rx * lx * xSc + fx * lz * xSc, hoverY - 0.06 * xSc, pz + rz * lx * xSc + fz * lz * xSc, yaw, 0.14 * xSc, 0.08 * xSc, 0.20 * xSc, pad, 0);
        this.drawCharMesh('_orb', this.matModel, '', [0.16, 0.58, 0.42, 1.0], 1, 1, 0, 0, true, false);
      }
      for (let s = 0; s < 6; s++) {
        const t = s / 5;
        const ang = now * 3.4 - s * 0.65;
        const sx = px - fx * (0.34 - t * 0.48 - castBoost * 0.4) * xSc + rx * (Math.sin(ang) * 0.22 * xSc);
        const sy = hoverY + (0.18 + t * 0.58) * xSc;
        const sz = pz - fz * (0.34 - t * 0.48 - castBoost * 0.4) * xSc + rz * (Math.sin(ang) * 0.22 * xSc);
        if (s === 5) {
          this.setModelMatrix(sx, sy, sz, yaw + Math.cos(ang) * 0.35, xSc * 0.64, xSc * 0.64, xSc * 0.74, 0.15, 0);
          this.drawCharMesh('_petDragonHead', this.matModel, '_petFeatherTex', [0.72, 1.05, 0.88, 1.0], 1, 1, 0.28 + glow, 0, true, false);
        } else {
          const r = (0.115 - t * 0.02) * xSc;
          this.setModelMatrix(sx, sy, sz, yaw, r, r, r * 1.35);
          this.drawCharMesh('_orb', this.matModel, '_petShellTex', [0.72, 1.0, 0.84, 1.0], 1, 1, 0.20, 0, true, false);
        }
      }
    } else {
      // === CỬU VĨ THIÊN HỒ: High-Contrast Sakura-Crimson & Pearl Celestial Fox + 3/6/9 Waving Painted Tails! ===
      const fSc = sc * 1.12;
      const pitch = Math.sin(now * 3.2) * 0.08 - castBoost * 0.20;
      this.setModelMatrix(px, py, pz, yaw, fSc * 0.96, fSc * 0.96, fSc * 0.96, pitch, 0);
      this.drawCharMesh('_petFoxBody', this.matModel, '_petFurTex', [1.0, 0.92, 0.96, 1.0], 1, 1, glow + 0.06, 0, true, false);
      for (const s of [-1, 1]) {
        this.setModelMatrix(px + fx * 0.24 * fSc + rx * (s * 0.10 * fSc), py + 0.24 * fSc, pz + fz * 0.24 * fSc + rz * (s * 0.10 * fSc), yaw, fSc * 0.74, fSc * 0.74, fSc * 0.74, 0.18, -s * 0.25);
        this.drawCharMesh('_petHorn', this.matModel, '', [0.96, 0.36, 0.62, 1.0], 1, 1, 0.22, 0, true, false);
        this.setModelMatrix(px + fx * 0.36 * fSc + rx * (s * 0.08 * fSc), py + 0.18 * fSc, pz + fz * 0.36 * fSc + rz * (s * 0.08 * fSc), yaw, 0.038 * fSc, 0.038 * fSc, 0.038 * fSc);
        this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.88, 0.42, 1.0], 1, 1, 0.90, 1, false, false);
      }
      this.setModelMatrix(px + fx * 0.54 * fSc, py + 0.02 * fSc + Math.sin(now * 5.5) * 0.05, pz + fz * 0.54 * fSc, now * 2.5, 0.13 * fSc, 0.13 * fSc, 0.13 * fSc);
      this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.52, 0.78, 1.0], 1, 1, 0.80, 1, false, false);

      const tailCnt = evo === 3 ? 9 : (evo === 2 ? 6 : 3);
      for (let k = 0; k < tailCnt; k++) {
        const frac = tailCnt > 1 ? (k / (tailCnt - 1) - 0.5) * 2.0 : 0;
        const fanYaw = frac * 1.12;
        const fanRoll = frac * 0.64;
        const wave = Math.sin(now * 4.4 + k * 0.72) * 0.18;
        const tCol = (k % 2 === 0) ? [1.0, 0.84, 0.92, 1.0] : [1.0, 0.56, 0.78, 1.0];
        this.setModelMatrix(px - fx * 0.28 * fSc, py - 0.02 * fSc, pz - fz * 0.28 * fSc, yaw + fanYaw + wave * 0.35, fSc * 0.82, fSc * 0.88, fSc * 0.94, -0.18 + Math.abs(frac) * 0.22 + wave, fanRoll);
        this.drawCharMesh('_petTail', this.matModel, '_petFurTex', tCol, 1, 1, 0.22 + glow, 0, true, false);
      }
    }

    // 3. Continuous sparkling elemental spirit motes trailing behind the living 3D Spirit Beast!
    if (Math.random() < (0.18 + evo * 0.06)) {
      this.addHitSparks(px + (Math.random() - 0.5) * 0.45, py + (Math.random() - 0.5) * 0.3, pz, pal.hex, 1);
    }
  }

  // ==================== THÂN PHÁP DODGE 3D AFTERIMAGES ====================
  spawnDashGhosts(sx, sz, tx, tz, facing) {
    for (let i = 0; i < 3; i++) {
      const f = i / 3;
      this.dashGhosts.push({
        x: sx + (tx - sx) * f,
        z: sz + (tz - sz) * f,
        facing,
        t: 0,
        dur: 0.36 + i * 0.07
      });
    }
  }

  renderDashGhosts3D(dt, zone) {
    const ghostMesh = this.meshes.TT_Char_ThaiHu ? 'TT_Char_ThaiHu' : 'Master';
    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      const g = this.dashGhosts[i];
      g.t += dt;
      if (g.t >= g.dur) { this.dashGhosts.splice(i, 1); continue; }
      const alpha = (1.0 - g.t / g.dur) * 0.46;
      const gy = this.getTerrainHeight(zone, g.x, g.z);
      this.setModelMatrix(g.x, gy + 0.05, g.z, g.facing, 1.02, 1.02, 1.02, 0, 0);
      this.drawCharMesh(ghostMesh, this.matModel, '', [0.36, 1.0, 0.94, alpha], 1, 1, 0.65, 1, false, false);
    }
  }

  renderFlyingSwords3D(dt, now, wVis = null) {
    const arrayKind = (wVis && wVis.arrayKind) || 'customSword';
    if (!this.flyingSwords3D.length) return;
    for (let i = this.flyingSwords3D.length - 1; i >= 0; i--) {
      const s = this.flyingSwords3D[i];
      if (s.delay > 0) { s.delay -= dt; continue; }
      s.t += dt;
      const total = s.hoverT + s.diveT + s.stickT;
      if (s.t >= total) { this.flyingSwords3D.splice(i, 1); continue; }
      let x = s.sx, y = s.sy, z = s.sz, alpha = 1.0;
      if (s.t < s.hoverT) {
        const p = s.t / s.hoverT;
        y = s.sy + Math.sin(p * Math.PI) * 0.4;
        alpha = Math.min(1, p * 2.5);
      } else if (s.t < s.hoverT + s.diveT) {
        const p = (s.t - s.hoverT) / s.diveT;
        const e = p * p;
        x = s.sx + (s.tx - s.sx) * e;
        y = s.sy + (s.ty - s.sy) * e;
        z = s.sz + (s.tz - s.sz) * e;
      } else {
        x = s.tx; y = s.ty; z = s.tz;
        if (!s.hitDone) {
          s.hitDone = true;
          this.pushVfx3D({ mesh: 'ring', style: 1, x, y: 0.08, z, s0: 0.25, s1: 1.85, color: s.color, alpha: 0.44, dur: 0.28 });
          this.addHitSparks(x, 0.4, z, s.color, 6);
        }
        alpha = 1.0 - (s.t - s.hoverT - s.diveT) / s.stickT;
      }
      const fSc = this.getWeaponScaleForKind(arrayKind) * 1.15;
      this.setModelMatrix(x, y + 0.72, z, now * 4.5 + i, fSc, fSc, fSc, Math.PI, 0);
      this.drawSculptedWeapon3D(arrayKind, this.matModel, wVis, Math.max(0, alpha), 0.75);
    }
  }

  renderWeaponTrailAndLightning2D(dt, ctx) {
    // 1. Silky Glowing Sword-Qi Ribbon Trail attached to Master's swinging blade!
    for (let i = this.weaponTrailPts.length - 1; i >= 0; i--) {
      this.weaponTrailPts[i].age += dt;
      if (this.weaponTrailPts[i].age > 0.20) this.weaponTrailPts.splice(i, 1);
    }
    if (this.weaponTrailPts.length >= 2) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i < this.weaponTrailPts.length; i++) {
        const a = this.weaponTrailPts[i - 1], b = this.weaponTrailPts[i];
        const life = Math.max(0, 1.0 - b.age / 0.20);
        const sa0 = this.worldToScreen(a.bx, a.by, a.bz), sa1 = this.worldToScreen(a.tx, a.ty, a.tz);
        const sb0 = this.worldToScreen(b.bx, b.by, b.bz), sb1 = this.worldToScreen(b.tx, b.ty, b.tz);
        if (!sa0 || !sa1 || !sb0 || !sb1) continue;
        ctx.fillStyle = b.colorRgba ? b.colorRgba.replace('ALPHA', (life * 0.52).toFixed(3)) : `rgba(92, 255, 242, ${(life * 0.48).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(sa0.x, sa0.y); ctx.lineTo(sa1.x, sa1.y);
        ctx.lineTo(sb1.x, sb1.y); ctx.lineTo(sb0.x, sb0.y);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(245, 255, 255, ${(life * 0.88).toFixed(3)})`;
        ctx.lineWidth = Math.max(1.2, life * 3.8);
        ctx.beginPath(); ctx.moveTo(sa1.x, sa1.y); ctx.lineTo(sb1.x, sb1.y); ctx.stroke();
      }
      ctx.restore();
    }

    // 1b. Glowing Curved Comet Trails behind Live Autonomous Launching Back-Weapons!
    if (this.backFlights.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (const bf of this.backFlights) {
        if (!bf.trail || bf.trail.length < 2) continue;
        for (let k = 1; k < bf.trail.length; k++) {
          const frac = k / bf.trail.length;
          const p0 = this.worldToScreen(bf.trail[k - 1][0], bf.trail[k - 1][1], bf.trail[k - 1][2]);
          const p1 = this.worldToScreen(bf.trail[k][0], bf.trail[k][1], bf.trail[k][2]);
          if (!p0 || !p1) continue;
          ctx.strokeStyle = bf.colorRgba.replace('ALPHA', (frac * 0.72).toFixed(3));
          ctx.lineWidth = 2.0 + frac * 7.5;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${(frac * 0.90).toFixed(3)})`;
          ctx.lineWidth = 1.0 + frac * 2.8;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 2. Jagged 3D Branching Heavenly Lightning Bolts (Cửu Thiên Thần Lôi)!
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const lb = this.lightningBolts[i];
      if (lb.delay > 0) { lb.delay -= dt; continue; }
      lb.t += dt;
      if (lb.t >= lb.dur) { this.lightningBolts.splice(i, 1); continue; }
      const alpha = Math.max(0, 1.0 - lb.t / lb.dur);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const drawPoly = (pts, wOuter, wCore) => {
        const spts = pts.map(p => this.worldToScreen(p[0], p[1], p[2])).filter(Boolean);
        if (spts.length < 2) return;
        ctx.strokeStyle = lb.color;
        ctx.globalAlpha = alpha * 0.72;
        ctx.lineWidth = wOuter;
        ctx.beginPath();
        ctx.moveTo(spts[0].x, spts[0].y);
        for (let k = 1; k < spts.length; k++) ctx.lineTo(spts[k].x, spts[k].y);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = wCore;
        ctx.stroke();
      };
      drawPoly(lb.pts, 12 * alpha + 3.5, 4.6 * alpha + 1.4);
      for (const br of lb.branches) drawPoly(br, 5.5 * alpha + 1.5, 2.2 * alpha + 0.6);
      // Ground lightning impact corona flash!
      const tip = lb.pts[lb.pts.length - 1];
      const st = this.worldToScreen(tip[0], tip[1], tip[2]);
      if (st && Number.isFinite(st.x) && Number.isFinite(st.y)) {
        const rg = ctx.createRadialGradient(st.x, st.y, 2, st.x, st.y, 44 * alpha + 10);
        rg.addColorStop(0, `rgba(255,255,255,${(alpha * 0.9).toFixed(2)})`);
        rg.addColorStop(0.45, `rgba(166,130,255,${(alpha * 0.55).toFixed(2)})`);
        rg.addColorStop(1, 'rgba(166,130,255,0)');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(st.x, st.y, 44 * alpha + 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // 3. Donghua Anime Radial Impact Speed-Lines on Ultimate & Major Bursts!
    if (this.impactLinesT > 0) {
      const a = Math.min(1, this.impactLinesT / 0.25) * 0.42;
      const cx = this.width * 0.5, cy = this.height * 0.5;
      const rMax = Math.hypot(cx, cy);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(180, 255, 250, ${a.toFixed(3)})`;
      for (let k = 0; k < 28; k++) {
        const ang = (k / 28) * Math.PI * 2 + this.impactLinesT * 1.4;
        const rIn = rMax * (0.58 + (k % 3) * 0.08);
        ctx.lineWidth = (k % 2 === 0 ? 3.2 : 1.6);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
        ctx.lineTo(cx + Math.cos(ang) * rMax, cy + Math.sin(ang) * rMax);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  renderTown3D(game, dt, now, fog, ctx, theme) {
    const gl = this.gl;
    const st = (game && game.state) || { halls: {}, disciples: {} };

    // Use 100% Brand-New 3D Floating Immortal Sect Sanctuary from env3d.js (replaces Murim town3d.bin!)
    const townEnv = this.env3d ? this.env3d.getTownScene(st.halls) : null;
    const groups = [];
    if (townEnv) {
      groups.push(townEnv.group);
    } else if (this.townReady) {
      groups.push(this.townGroups.town_static);
      const hallIds = ['main', 'yard', 'gate', 'library', 'dorm', 'pharmacy', 'smithy', 'vault'];
      for (const hid of hallIds) {
        const hs = (st.halls && st.halls[hid]) || { lv: hid === 'main' ? 1 : 0, buildEnd: 0 };
        const building = hs.buildEnd && hs.buildEnd > Date.now();
        if ((hs.lv || 0) > 0) {
          groups.push(this.townGroups[`hall_${hid}_built`] || this.townGroups[`hall_${hid}_ruin`]);
          if (building && this.townGroups[`hall_${hid}_scaffold`]) groups.push(this.townGroups[`hall_${hid}_scaffold`]);
        } else {
          if (this.townGroups[`hall_${hid}_ruin`]) groups.push(this.townGroups[`hall_${hid}_ruin`]);
          if (building && this.townGroups[`hall_${hid}_scaffold`]) groups.push(this.townGroups[`hall_${hid}_scaffold`]);
        }
      }
    }

    // Build visible town NPC list once so they cast crisp real-time shadows too!
    const townUnits = [];
    for (let i = 0; i < TOWN_NPC_SLOTS.length; i++) {
      const npc = TOWN_NPC_SLOTS[i];
      if (npc.reqId && npc.reqId !== 'master' && !(st.disciples && st.disciples[npc.reqId])) continue;
      if (npc.group !== 'common' && npc.group !== 'main') {
        const hLv = (st.halls && st.halls[npc.group] && st.halls[npc.group].lv) || 0;
        if (hLv <= 0 && npc.group !== 'gate') continue;
      }
      const isM = npc.reqId === 'master';
      const eqW = (isM && game && game.getEquippedWeaponVisual) ? game.getEquippedWeaponVisual().mesh : npc.weapon;
      townUnits.push({
        isMaster: isM, isAlly: true, reqId: npc.reqId || '',
        mesh: npc.mesh, tex: npc.tex, weaponMesh: eqW, dualWeapon: !!npc.dual,
        fixedClip: npc.clip, x: npc.x, z: npc.z, groundY: npc.y,
        facing: (npc.yawDeg * Math.PI) / 180, scale: 0.96, seed: i * 0.77
      });
    }

    // Multiplayer Shared 3D Town Plaza Players (synced via WS plaza_sync / REST /api/plaza)!
    const onCl = window.onlineClient;
    const plazaList = (onCl && Array.isArray(onCl.plazaPlayers)) ? onCl.plazaPlayers : [];
    const myUname = (onCl && onCl.user && onCl.user.username) ? onCl.user.username : '';
    const plazaEntries = [];
    for (let i = 0; i < plazaList.length; i++) {
      const p = plazaList[i];
      if (!p || (myUname && p.username === myUname)) continue;
      const wpDef = (window.XIANXIA_EQUIPMENT_DEF || []).find(w => w.id === p.weapon);
      const px = typeof p.x === 'number' ? p.x : ((i % 2 === 0 ? -3.4 : 3.4) + (i * 0.4));
      const pz = typeof p.z === 'number' ? p.z : (4.2 + i * 1.1);
      const py = 0.02;
      const pu = {
        isPlazaPlayer: true, isAlly: true, plazaId: p.id, plazaMeta: p,
        mesh: i % 2 === 0 ? 'TT_Char_VanHon' : 'TT_Char_ThaiHu',
        tex: i % 2 === 0 ? 'TT_Tex_Char_HuyenThien' : 'TT_Tex_Char_ThaiHu',
        weaponMesh: (wpDef && wpDef.ttMesh) || 'TT_Wp_ImmortalJian',
        cosmetics: p.cosmetics || { wing: 'wing_none', aura: 'aura_none' },
        fixedClip: 'Idle', x: px, z: pz, groundY: py,
        facing: typeof p.facing === 'number' ? p.facing : ((i % 2 === 0 ? 0.3 : -0.3)),
        scale: 0.94, seed: 9.1 + i * 1.3
      };
      townUnits.push(pu);
      plazaEntries.push(pu);
    }

    // Real-time 2048x2048 Directional Sun Shadow Pass for the entire Floating Immortal Sect!
    this.computeLightVP(this.townPan.x, 4.0 + this.townPan.z, 34.0, theme.sunDir);
    if (groups.length) {
      this.renderShadowPass(groups, !!townEnv, townUnits, now, null, game);
    }

    // Bind Offscreen Bloom FBO for 3D Immortal Sect!
    this.bindMainSceneTarget(fog);

    // Painted Sky Dome behind Floating Immortal Mountain Sect
    this.renderSkyDome(theme, now);

    const townLights = townEnv ? townEnv.lights : [
      { x: -3.2, y: 4.2, z: 18.0, r: 1.0, g: 0.72, b: 0.34, radius: 11.5, flicker: 0.12 },
      { x:  3.2, y: 4.2, z: 18.0, r: 1.0, g: 0.72, b: 0.34, radius: 11.5, flicker: 0.12 }
    ];

    if (groups.length) {
      this.drawSceneGroups(groups, fog, theme.tint, { isEnv: !!townEnv, now, theme, lights: townLights });
    }

    this.hallScreenPos = {};
    this.townNpcScreenPos = {};
    this.townPlazaScreenPos = [];
    for (const [hid, anc] of Object.entries(HALL_ANCHORS)) {
      const sp = this.worldToScreen(anc.x, anc.y, anc.z);
      if (sp) this.hallScreenPos[hid] = sp;
    }
    for (const u of townUnits) {
      if (u.isPlazaPlayer && u.plazaMeta) {
        const sp = this.worldToScreen(u.x, u.groundY + 1.55, u.z);
        if (sp) this.townPlazaScreenPos.push({ ...u.plazaMeta, x: sp.x, y: sp.y });
      } else if (u.reqId && u.reqId !== 'master') {
        const sp = this.worldToScreen(u.x, u.groundY + 1.45, u.z);
        if (sp) this.townNpcScreenPos[u.reqId] = sp;
      }
    }

    gl.useProgram(this.charProg);
    gl.uniformMatrix4fv(this.uChar.VP, false, this.matVP);
    gl.uniformMatrix4fv(this.uChar.LightVP, false, this.matLightVP);
    gl.uniform3fv(this.uChar.SunDir, theme.sunDir);
    gl.uniform3fv(this.uChar.SunCol, theme.sunCol);
    gl.uniform3fv(this.uChar.AmbCol, theme.ambCol);
    gl.uniform3fv(this.uChar.CamPos, this.camPos);
    gl.uniform4f(this.uChar.RimCol, 0.55, 0.92, 0.95, 0.35);
    gl.uniform1i(this.uChar.Tex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex || this.whiteTex);
    gl.uniform1i(this.uChar.ShadowMap, 1);

    // Legacy Murim emblem disc only if fallback town3d.bin is used (env3d renders glowing 3D Bagua Spirit Array!)
    if (!townEnv) {
      this.setModelMatrix(0.0, 0.06, 2.0, 0, 5.65, 1, 5.65);
      this.drawCharMesh('_disc', this.matModel, 'TownEmblemTex', [1, 1, 1, 0.98], 1, 1, 0, 0, false, false);
    }

    // Render All Active 24-Bone Skinned Town Disciples & Practicing Trainees!
    for (const u of townUnits) {
      this.renderUnit3D(u, now, u.groundY, game);
    }

    // Showcase Master's Ngự Kiếm Trận, Pháp Bảo Hộ Thân & 3D Spirit Pet right beside Him on Thái Hư Chính Điện Terrace!
    const townMaster = townUnits.find(u => u.isMaster);
    if (townMaster && st) {
      const eqWeapVis = (game && game.getEquippedWeaponVisual) ? game.getEquippedWeaponVisual() : null;
      const swArr = st.swordArray || { lv: 0, active: true, formation: 'fan' };
      const swCnt = swArr.active ? Math.max(0, Math.min(9, swArr.lv || 0)) : 0;
      if (swCnt > 0) this.renderOrbitingSwords3D(townMaster, townMaster.groundY, swCnt, now, eqWeapVis, dt, swArr.formation || 'fan');
      this.renderOrbitingArtifacts3D(townMaster, townMaster.groundY, st, now);
      this.renderSpiritPet3D(townMaster, townMaster.groundY, st, now, game, true);
    }

    // Floating Golden Immortal Spirit Motes rising around the Jade Sanctuary!
    this.renderBiomeWeather('gold', dt, now, ctx, this.townPan.x, 4.0 + this.townPan.z);
  }

  renderUnit3D(u, now, groundY = 0, game = null) {
    const meshKey = this.meshes[u.mesh] ? u.mesh : (u.isMaster ? (this.meshes.TT_Char_ThaiHu ? 'TT_Char_ThaiHu' : 'Master') : (this.meshes.TT_Char_CuuU ? 'TT_Char_CuuU' : 'Master'));
    const meshObj = this.meshes[meshKey];
    if (!meshObj) return;
    const texName = (meshKey === u.mesh && u.tex && this.textures[u.tex]) ? u.tex : (meshObj.texName || 'TT_Tex_Char_ThaiHu');
    const scale = u.scale || 1.0;

    // Leap / Jump vertical arc during aerial skills + Hovering Lotus Meditation + 3D Ngự Kiếm Phi Hành!
    const jumpArc = (u.jumpT > 0 && u.jumpDur > 0) ? Math.sin((u.jumpT / u.jumpDur) * Math.PI) * 1.85 : 0;
    const medLift = (u.isMaster && !u.dead && game && game.state && game.state.meditating) ? (0.42 + Math.sin(now * 2.8) * 0.12) : 0;
    const isRidingSword = !!(u.isMaster && !u.dead && (u.swordFlying || (this.mode === 'town' && game && game.state && game.state.swordFlightOn)) && medLift <= 0);
    const flyLift = isRidingSword ? (0.58 + Math.sin(now * 4.2) * 0.09) : 0;
    let yOff = groundY + jumpArc + medLift + flyLift;

    let alpha = 1.0;
    if (u.dead) {
      alpha = Math.max(0, 1 - Math.max(0, ((u.corpseT || 0) - 0.75) / 0.6));
    }

    // Ground Contact Shadow
    if (!u.dead) {
      this.setModelMatrix(u.x, groundY + 0.03, u.z, 0, 1.06 * scale, 1, 1.06 * scale);
      this.drawCharMesh('_disc', this.matModel, '', [0.08, 0.08, 0.10, 0.38], 1, 1, 0, 1, false, false);
    }

    // Evaluate 24-Bone Skeletal Animation!
    const useSkin = !!(meshObj.skinned && meshObj.rig && this.animsReady);
    if (useSkin) {
      const sel = this.selectUnitClip(u, now, game);
      this.evaluateRigMatrices(meshObj.rig, sel.clip, sel.t, sel.loop);
    }

    // Per-unit Donghua Fresnel Silhouette Rim (subtle matte-cloth edge highlight; Boss Phase 2 keeps fierce Crimson!)
    const eqArmor = (u.isMaster && game && game.state && game.state.gearEquipped) ? game.state.gearEquipped.armor : null;
    if (u.isMaster) {
      if (eqArmor === 'ar_celestial_robe') this.gl.uniform4f(this.uChar.RimCol, 0.36, 0.96, 0.88, 0.36);
      else if (eqArmor === 'ar_cloud_robe') this.gl.uniform4f(this.uChar.RimCol, 0.44, 0.80, 0.98, 0.30);
      else this.gl.uniform4f(this.uChar.RimCol, 0.46, 0.92, 0.86, 0.24);
    } else if (u.isAlly) {
      this.gl.uniform4f(this.uChar.RimCol, 0.96, 0.90, 0.58, 0.28);
    } else if (u.isBoss && u.phase === 2) {
      this.gl.uniform4f(this.uChar.RimCol, 1.0, 0.14, 0.26, 0.82);
    } else if (u.isBoss || u.isLeader) {
      this.gl.uniform4f(this.uChar.RimCol, 1.0, 0.30, 0.48, 0.48);
    } else {
      this.gl.uniform4f(this.uChar.RimCol, 0.68, 0.76, 0.98, 0.20);
    }

    // Lively procedural motion for non-humanoid Xianxia Bosses & 14 Chibi 3D Xianxia Monsters!
    let sx = scale, sy = scale, sz = scale, leanX = 0, rollZ = 0;
    if (!useSkin && (meshKey.startsWith('TT_Boss_') || meshKey.startsWith('TT_Mob_'))) {
      const ph = now * 3.8 + (u.seed || 0) * 1.7;
      if (u.dead) {
        const dP = Math.min(1, (u.corpseT || 0) * 2.4);
        leanX = -dP * 1.38;
        yOff += (1 - dP) * 0.10;
      } else {
        const atkP = (u.animT > 0) ? Math.sin(Math.min(1, u.animT / Math.max(0.15, u.animDur || 0.36)) * Math.PI) : 0;
        const hitRec = (u.flashT > 0) ? -Math.min(1, u.flashT * 6.0) * 0.16 : 0;
        const moveBob = u.moving ? Math.abs(Math.sin(now * 9.5 + (u.seed || 0))) * 0.16 : 0;
        const mk = meshObj.motion || (meshKey === 'TT_Boss_VanKiem' ? 'hover' : (meshKey === 'TT_Boss_LinhKhe' ? 'hop' : (meshKey === 'TT_Boss_BacHai' ? 'wave' : 'stomp')));
        if (mk === 'hover') {
          yOff += (meshKey.startsWith('TT_Boss_') ? 0.28 : 0.20) + Math.sin(ph * 0.9) * 0.11 + atkP * 0.20;
          leanX = atkP * 0.28 + hitRec;
          rollZ = Math.sin(ph * 0.7) * 0.06;
        } else if (mk === 'hop') {
          const hop = Math.max(0, Math.sin(ph * 1.18));
          yOff += hop * hop * 0.12 + moveBob * 1.35 + atkP * 0.22;
          sy = scale * (1.0 + Math.sin(ph * 1.18) * 0.045 + atkP * 0.08);
          sx = sz = scale * (1.0 - Math.sin(ph * 1.18) * 0.025);
          leanX = atkP * 0.24 + hitRec;
        } else if (mk === 'wave') {
          yOff += 0.06 + Math.sin(ph * 0.9) * 0.06 + moveBob * 0.6;
          rollZ = Math.sin(ph * 0.9) * 0.07;
          leanX = atkP * 0.24 + hitRec;
        } else if (mk === 'waddle') {
          yOff += moveBob * 0.75 + atkP * 0.16;
          sy = scale * (1.0 + Math.sin(ph) * 0.03);
          rollZ = (u.moving ? Math.sin(now * 9.5 + (u.seed || 0)) * 0.11 : Math.sin(ph * 0.7) * 0.035);
          leanX = atkP * 0.30 + (u.moving ? 0.08 : 0) + hitRec;
        } else {
          // stomp / prance
          yOff += moveBob * 0.95 + atkP * 0.20;
          sy = scale * (1.0 + Math.sin(ph) * 0.035);
          leanX = atkP * 0.28 - moveBob * 0.35 + hitRec;
          rollZ = u.moving ? Math.sin(now * 8.5 + (u.seed || 0)) * 0.07 : 0;
        }
      }
    }

    const tint = u.tint ? [...u.tint, alpha] : (u.isBoss && u.phase === 2 ? [1.15, 0.78, 0.84, alpha] : [1, 1, 1, alpha]);
    if (isRidingSword && useSkin) {
      // Graceful forward wind-lean while standing poised on the Flying Sword!
      leanX = u.moving ? 0.15 : 0.04;
      rollZ = Math.sin(now * 2.8) * 0.04;
    }
    this.setModelMatrix(u.x, yOff, u.z, u.facing || 0, sx, sy, sz, leanX, rollZ);
    this.drawCharMesh(meshKey, this.matModel, texName, tint, 1, 1, u.flashT > 0 ? 0.78 : 0, 0, true, useSkin);

    // Boss Phase 2 Demonic Enrage Halo Ring!
    if (u.isBoss && u.phase === 2 && !u.dead && this.meshes._haloRing) {
      this.setModelMatrix(u.x, groundY + 0.12, u.z, -now * 2.8, 2.35, 2.35, 2.35, Math.PI * 0.5, 0);
      this.drawCharMesh('_haloRing', this.matModel, '', [1.0, 0.16, 0.30, 0.72], 1, 1, 0.55, 1, false, false);
    }

    // Wait-free entry into renderUnitCosmetics3D helper added below renderUnit3D

    // 3D Ngự Kiếm Phi Hành (Rides Equipped Sculpted 3D Weapon flat beneath Master's boots!)
    if (isRidingSword) {
      const fYaw = u.facing || 0;
      const fx = Math.sin(fYaw), fz = Math.cos(fYaw);
      const eqVis = (game && game.getEquippedWeaponVisual) ? game.getEquippedWeaponVisual() : null;
      const eqTT = eqVis && eqVis.ttMesh && this.meshes[eqVis.ttMesh] ? eqVis.ttMesh : null;
      const swMesh = eqTT || (this.meshes.TT_Wp_ImmortalJian ? 'TT_Wp_ImmortalJian' : (this.meshes.TT_Wp_IronJian ? 'TT_Wp_IronJian' : null));
      if (swMesh) {
        // Center blade directly under Master's boots (hilt behind heel, luminous tip pointing forward along travel yaw!)
        this.setModelMatrix(u.x - fx * 0.66, yOff - 0.05, u.z - fz * 0.66, fYaw, 1.15, 1.15, 1.15, Math.PI * 0.5, 0);
        this.drawCharMesh(swMesh, this.matModel, this.meshes[swMesh].texName || '', [1.0, 1.06, 1.10, 1.0], 1, 1, 0.34, 0, true, false);
      }
      if (this.meshes._haloRing) {
        this.setModelMatrix(u.x, yOff - 0.09, u.z, now * 3.8, 0.78, 0.78, 0.78, Math.PI * 0.5, 0);
        this.drawCharMesh('_haloRing', this.matModel, '', [0.36, 0.98, 0.94, 0.62], 1, 1, 0.52, 1, false, false);
      }
      if (u.moving && Math.random() < 0.45) {
        this.addHitSparks(u.x - fx * 0.72, yOff - 0.04, u.z - fz * 0.72, (eqVis && eqVis.trailHex) || '#64fff0', 1);
      }
    }

    // Permanent 3D Cultivation Realm Breakthrough Auras (Trúc Cơ -> Kim Đan -> Nguyên Anh -> Hóa Thần+!)
    if (u.isMaster && !u.dead && game && game.state) {
      const rIdx = game.state.realmIdx || 0;
      const fYaw = u.facing || 0;
      const bx = u.x - Math.sin(fYaw) * 0.34, bz = u.z - Math.cos(fYaw) * 0.34;
      // Trúc Cơ (2+): Cyan-Jade Rotating Qi Foot Ring
      if (rIdx >= 2 && this.meshes._haloRing) {
        this.setModelMatrix(u.x, groundY + 0.08, u.z, now * 1.6, 1.18, 1.18, 1.18, Math.PI * 0.5, 0);
        this.drawCharMesh('_haloRing', this.matModel, '', [0.32, 0.96, 0.88, 0.48], 1, 1, 0.38, 1, false, false);
      }
      // Kim Đan (3+): Radiant Golden Core Orb orbiting upper back!
      if (rIdx >= 3 && this.meshes._orb) {
        const coreY = yOff + 1.12 + Math.sin(now * 3.4) * 0.07;
        this.setModelMatrix(bx, coreY, bz, now * 2.4, 0.22, 0.22, 0.22);
        this.drawCharMesh('_orb', this.matModel, '', [1.0, 0.88, 0.36, 0.96], 1, 1, 0.82, 1, false, false);
        if (this.meshes._haloRing) {
          this.setModelMatrix(bx, coreY, bz, fYaw, 0.42, 0.42, 0.42, 0, now * 2.2);
          this.drawCharMesh('_haloRing', this.matModel, '', [1.0, 0.82, 0.28, 0.72], 1, 1, 0.52, 1, false, false);
        }
      }
      // Nguyên Anh (4+): Celestial Twin Counter-Rotating Dorsal Halos!
      if (rIdx >= 4 && this.meshes._haloRing) {
        const haloY = yOff + 1.18;
        this.setModelMatrix(bx, haloY, bz, fYaw, 0.78, 0.78, 0.78, 0, -now * 1.8);
        this.drawCharMesh('_haloRing', this.matModel, '', [0.42, 0.98, 0.94, 0.65], 1, 1, 0.56, 1, false, false);
        // Hóa Thần+ (5+): Imperial Violet-Gold Outer Ascension Crown Ring!
        if (rIdx >= 5) {
          this.setModelMatrix(bx, haloY, bz, fYaw, 1.02, 1.02, 1.02, 0, now * 1.4);
          this.drawCharMesh('_haloRing', this.matModel, '', [0.84, 0.56, 1.0, 0.58], 1, 1, 0.64, 1, false, false);
        }
      }
    }

    // 3D Tiên Dực (Animated Luminous 3D Wings) & Hào Quang Đế Tôn (for Master, Plaza Players, Co-op Peers & PK Opponents!)
    if (!u.dead) {
      this.renderUnitCosmetics3D(u, yOff, groundY, now, game);
    }

    // Render All 15 Signature 3D Character Props RIGIDLY BONE-PARENTED to Live Animated Skeleton Bones (zero floating hats or detached hoods!)
    if (!u.dead && meshKey.startsWith('Kind')) {
      // [propMesh, rgbColor, canonicalBoneId, localTposeOffsetXYZ]
      // Canonical bones: 0=Hips, 2=Spine, 3=Chest, 5=Head, 9=LUpperArm, 10=LForearm, 13=RUpperArm, 15=RHand
      const kindProps = {
        KindDart:   [
          // Skip oversized bulbous KindDart_Hood (0.74m balloon); keep crisp ninja face mask locked to Head!
          ['KindDart_Mask', [0.16, 0.14, 0.22], 5, [0, -0.04, -0.02]]
        ],
        KindRonin:  [
          // Snug bamboo ronin kasa sitting directly on brow/crown with zero floating gap!
          ['KindRonin_Hat', [0.36, 0.20, 0.18], 5, [0, -0.17, 0.02]]
        ],
        KindShield: [
          ['KindShield_PauldronL',  [0.30, 0.36, 0.48], 9,  [0, 0, 0]],
          ['KindShield_PauldronR',  [0.30, 0.36, 0.48], 13, [0, 0, 0]],
          ['KindShield_Shield',     [0.24, 0.28, 0.38], 10, [0, 0, 0]],
          ['KindShield_ShieldRim',  [0.88, 0.72, 0.34], 10, [0, 0, 0]],
          ['KindShield_ShieldBoss', [1.00, 0.80, 0.36], 10, [0, 0, 0]]
        ],
        KindToxin:  [
          ['KindToxin_BeltPotL', [0.24, 0.62, 0.32], 0,  [0, 0, 0]],
          ['KindToxin_BeltPotR', [0.24, 0.62, 0.32], 0,  [0, 0, 0]],
          ['KindToxin_Pot',      [0.18, 0.52, 0.28], 15, [0, 0, 0]],
          ['KindToxin_PotTop',   [0.46, 0.96, 0.44], 15, [0, 0, 0]]
        ],
        KindMonk:   [
          // Center lopsided Dharma Bead Halo symmetrically behind shoulders (original bbox cx=+0.252, z=-0.58)
          ['KindMonk_Beads',   [0.78, 0.52, 0.22], 3, [-0.25, -0.26, 0.44]],
          ['KindMonk_BeadTop', [1.00, 0.80, 0.32], 3, [-0.25, -0.26, 0.44]],
          ['KindMonk_Sash',    [0.82, 0.22, 0.20], 2, [0, 0, 0]]
        ]
      };
      const props = kindProps[meshKey];
      if (props) {
        this.setModelMatrix(u.x, yOff, u.z, u.facing || 0, scale, scale, scale, 0, 0);
        const unitMat = new Float32Array(this.matModel);
        const rigBM = (useSkin && meshObj.rig && meshObj.rig.boneMap) ? meshObj.rig.boneMap : null;
        for (const [pMesh, pCol, canonBone, off] of props) {
          if (!this.meshes[pMesh]) continue;
          let propWorld = unitMat;
          if (rigBM) {
            const bIdx = rigBM.indexOf(canonBone);
            if (bIdx >= 0) {
              const palSlice = this._bonePalette.subarray(bIdx * 16, bIdx * 16 + 16);
              if (off && (off[0] || off[1] || off[2])) {
                trsMat4(this._localMat, off[0], off[1], off[2], 0, 0, 0, 1, 1, 1, 1);
                mulMat4(this._weapMat, palSlice, this._localMat);
                mulMat4(this._weapWorld, unitMat, this._weapMat);
              } else {
                mulMat4(this._weapWorld, unitMat, palSlice);
              }
              propWorld = this._weapWorld;
            }
          }
          this.drawCharMesh(pMesh, propWorld, '', [pCol[0], pCol[1], pCol[2], alpha], 1, 1, u.flashT > 0 ? 0.65 : 0.08, 0, true, false);
        }
      }
    }

    // Bolt 3D Weapon(s) Directly to Animated RightHand (hides hand copy while Master is standing on his ridden Flying Sword unless swinging!)
    const mVis = (u.isMaster && game && game.getEquippedWeaponVisual) ? game.getEquippedWeaponVisual() : null;
    const activeWeaponMesh = mVis ? mVis.mesh : u.weaponMesh;
    const hideWhileRiding = !!(isRidingSword && u.animT <= 0);
    if (!hideWhileRiding && activeWeaponMesh && (this.meshes[activeWeaponMesh] || (mVis && mVis.isCustomSword && this.meshes._swordBlade)) && !u.dead) {
      if (useSkin && meshObj.rig.rhIdx >= 0) {
        const rhBone = this._boneWorlds[meshObj.rig.rhIdx];
        if (meshObj.rig.weaponR) {
          mulMat4(this._weapMat, rhBone, meshObj.rig.weaponR);
        } else {
          trsMat4(this._localMat, -0.015, 0.067, -0.014, 0.148, 0.582, 0.797, -0.060, 1, 1, 1);
          mulMat4(this._weapMat, rhBone, this._localMat);
        }
        this.setModelMatrix(u.x, yOff, u.z, u.facing || 0, scale, scale, scale, 0, 0);
        mulMat4(this._weapWorld, this.matModel, this._weapMat);

        // Sample Master's live weapon base & tip (local +Z of _weapWorld matches original Weapon_Jian blade axis!)
        if (u.isMaster && u.animT > 0) {
          const M = this._weapWorld;
          const bx = M[12], by = M[13], bz = M[14];
          const tx = bx + M[8] * 1.08, ty = by + M[9] * 1.08, tz = bz + M[10] * 1.08;
          const rgb = mVis ? hexToRgb(mVis.trailHex) : [0.36, 1.0, 0.95];
          const rgbaStr = `rgba(${Math.round(rgb[0]*255)}, ${Math.round(rgb[1]*255)}, ${Math.round(rgb[2]*255)}, ALPHA)`;
          this.weaponTrailPts.push({ bx, by, bz, tx, ty, tz, age: 0, colorRgba: rgbaStr });
          if (this.weaponTrailPts.length > 16) this.weaponTrailPts.shift();
        }

        if (mVis) {
          // Align sculpted +Y weapon onto hand socket's +Z grip axis (Rx +90deg); TT_Wp_* grip is exact origin (zOff = 0.0)!
          const handSc = this.getWeaponScaleForKind(mVis.arrayKind);
          const hasTT = !!(mVis.ttMesh && this.meshes[mVis.ttMesh]);
          const zOff = hasTT ? 0.0 : (mVis.arrayKind === 'spear' || mVis.arrayKind === 'staff' ? 0.02 : 0.14);
          trsMat4(this._localMat, 0, 0, zOff, 0.7071068, 0, 0, 0.7071068, handSc, handSc, handSc);
          mulMat4(this._weapMat, this._weapWorld, this._localMat);
          this.drawSculptedWeapon3D(mVis.arrayKind, this._weapMat, mVis, alpha, u.flashT > 0 ? 0.65 : (mVis.id === 'wp_iron_jian' ? 0.10 : 0.35));
        } else if (activeWeaponMesh.startsWith('TT_Wp_') && this.meshes[activeWeaponMesh]) {
          const isPole = activeWeaponMesh.includes('Spear') || activeWeaponMesh.includes('Staff') || activeWeaponMesh.includes('Banner');
          const hSc = isPole ? 0.54 : 0.48;
          trsMat4(this._localMat, 0, 0, 0.0, 0.7071068, 0, 0, 0.7071068, hSc, hSc, hSc);
          mulMat4(this._weapMat, this._weapWorld, this._localMat);
          this.drawCharMesh(activeWeaponMesh, this._weapMat, this.meshes[activeWeaponMesh].texName, [1.02, 1.02, 1.02, alpha], 1, 1, u.flashT > 0 ? 0.65 : 0.06, 0, true, false);
        } else {
          this.drawCharMesh(activeWeaponMesh, this._weapWorld, '', [0.88, 0.90, 0.94, alpha], 1, 1, u.flashT > 0 ? 0.65 : 0, 0, true, false);
        }

        if ((u.dualWeapon || u.mesh === 'Yeonhwa' || u.reqId === 'yeonhwa' || u.id === 'yeonhwa') && meshObj.rig.lhIdx >= 0 && meshObj.rig.weaponL) {
          mulMat4(this._weapMat, this._boneWorlds[meshObj.rig.lhIdx], meshObj.rig.weaponL);
          this.setModelMatrix(u.x, yOff, u.z, u.facing || 0, scale, scale, scale, 0, 0);
          mulMat4(this._weapWorld, this.matModel, this._weapMat);
          if (activeWeaponMesh.startsWith('TT_Wp_') && this.meshes[activeWeaponMesh]) {
            trsMat4(this._localMat, 0, 0, 0.0, 0.7071068, 0, 0, 0.7071068, 0.46, 0.46, 0.46);
            mulMat4(this._weapMat, this._weapWorld, this._localMat);
            this.drawCharMesh(activeWeaponMesh, this._weapMat, this.meshes[activeWeaponMesh].texName, [1.02, 1.02, 1.02, alpha], 1, 1, u.flashT > 0 ? 0.65 : 0.06, 0, true, false);
          } else {
            this.drawCharMesh(u.weaponMesh, this._weapWorld, '', [0.88, 0.90, 0.94, alpha], 1, 1, u.flashT > 0 ? 0.65 : 0, 0, true, false);
          }
        }
      }
    }
  }

  renderUnitCosmetics3D(u, yOff, groundY, now, game) {
    const cos = (u.isMaster && game && game.state && game.state.cosmetics) ? game.state.cosmetics : (u.cosmetics || null);
    if (!cos) return;
    const def = window.COSMETICS_DEF;
    if (!def) return;
    const fYaw = u.facing || 0;
    const fx = Math.sin(fYaw), fz = Math.cos(fYaw);
    const rx = Math.cos(fYaw), rz = -Math.sin(fYaw); // right vector

    // 1) Hào Quang Đế Tôn 3D (Dual Counter-Rotating Ground Halo + Orbiting Spirit Spark)
    if (cos.aura && cos.aura !== 'aura_none' && this.meshes._haloRing) {
      const aDef = (def.auras || []).find(a => a.id === cos.aura);
      if (aDef && aDef.rgba) {
        const c = aDef.rgba;
        this.setModelMatrix(u.x, groundY + 0.09, u.z, now * 2.1, 1.48, 1.48, 1.48, Math.PI * 0.5, 0);
        this.drawCharMesh('_haloRing', this.matModel, '', c, 1, 1, 0.72, 1, false, false);
        this.setModelMatrix(u.x, groundY + 0.11, u.z, -now * 1.45, 1.95, 1.95, 1.95, Math.PI * 0.5, 0);
        this.drawCharMesh('_haloRing', this.matModel, '', [c[0], c[1], c[2], c[3] * 0.6], 1, 1, 0.58, 1, false, false);
        if (this.meshes._orb) {
          for (let k = 0; k < 3; k++) {
            const aAng = now * 2.8 + (k * Math.PI * 2) / 3;
            this.setModelMatrix(u.x + Math.cos(aAng) * 0.92, groundY + 0.25 + Math.sin(now * 4 + k) * 0.08, u.z + Math.sin(aAng) * 0.92, 0, 0.13, 0.13, 0.13);
            this.drawCharMesh('_orb', this.matModel, '', c, 1, 1, 0.92, 1, false, false);
          }
        }
      }
    }

    // 2) Tiên Dực 3D (Dual Animated Luminous Sculpted Energy Wings behind Back!)
    if (cos.wing && cos.wing !== 'wing_none') {
      const wDef = (def.wings || []).find(w => w.id === cos.wing);
      const bladeMesh = this.meshes.TT_Wp_ImmortalJian ? 'TT_Wp_ImmortalJian' : (this.meshes.TT_Wp_IronJian ? 'TT_Wp_IronJian' : null);
      if (wDef && wDef.rgba && bladeMesh) {
        const c = wDef.rgba;
        const span = wDef.span || 1.1;
        const flap = Math.sin(now * 5.0 + (u.seed || 0)) * 0.16;
        const backX = u.x - fx * 0.24;
        const backZ = u.z - fz * 0.24;
        const wingY = yOff + 1.05;
        for (const side of [-1, 1]) {
          for (let k = 0; k < 4; k++) {
            const fanSpread = side * (0.42 + k * 0.26 + flap * (0.6 + k * 0.15));
            const bladeLen = (0.72 - k * 0.09) * span;
            const ox = backX + rx * (side * (0.12 + k * 0.07)) - fx * (k * 0.04);
            const oz = backZ + rz * (side * (0.12 + k * 0.07)) - fz * (k * 0.04);
            const oy = wingY + (1.5 - k) * 0.06;
            this.setModelMatrix(ox, oy, oz, fYaw, bladeLen * 0.36, bladeLen, bladeLen * 0.24, -0.28 + k * 0.06, fanSpread);
            this.drawCharMesh(bladeMesh, this.matModel, '', c, 1, 1, 0.85, 1, false, false);
          }
        }
      }
    }
  }

  renderGroundCracks2D(dt, ctx) {
    for (let i = this.cracks2D.length - 1; i >= 0; i--) {
      const cr = this.cracks2D[i];
      cr.t += dt;
      if (cr.t >= cr.dur) { this.cracks2D.splice(i, 1); continue; }
      const p = cr.t / cr.dur;
      const fade = (1 - p) * (1 - p * 0.4);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const ln of cr.lines) {
        // Multi-kinked jagged fissure starting cleanly outside character center (no crude spider-web X!)
        const rLen = ln.len * 0.72;
        const pts = [];
        for (let s = 0; s <= 3; s++) {
          const f = 0.22 + (s / 3) * 0.78;
          const kAng = ln.a + (s === 1 ? ln.jag * 0.9 : (s === 2 ? -ln.jag * 0.7 : 0));
          const sp = this.worldToScreen(cr.x + Math.cos(kAng) * rLen * f, 0.05, cr.z + Math.sin(kAng) * rLen * f);
          if (sp && Number.isFinite(sp.x) && Number.isFinite(sp.y)) pts.push(sp);
        }
        if (pts.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
        ctx.globalAlpha = fade * 0.55;
        ctx.strokeStyle = '#18141a';
        ctx.lineWidth = Math.max(1.0, 2.6 * (1 - p * 0.4));
        ctx.stroke();
        ctx.globalAlpha = fade * 0.78;
        ctx.strokeStyle = cr.color;
        ctx.lineWidth = Math.max(0.8, 1.35 * (1 - p * 0.5));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Rotating Demonic Runic Boss Telegraph Spell Array (replaces flat red circles with 2-tier Donghua magic circle!)
  drawGroundCircle2D(ctx, wx, wz, r, fill, stroke) {
    const now = performance.now() * 0.001;
    const drawRing = (rad, spin, dashed, lw, col, doFill) => {
      ctx.beginPath();
      const steps = 32;
      let started = false;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2 + spin;
        const sp = this.worldToScreen(wx + Math.cos(a) * rad, 0.08, wz + Math.sin(a) * rad);
        if (!sp) continue;
        if (!started) { ctx.moveTo(sp.x, sp.y); started = true; }
        else ctx.lineTo(sp.x, sp.y);
      }
      if (!started) return;
      ctx.closePath();
      if (doFill && fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (col) {
        ctx.save();
        if (dashed) ctx.setLineDash([10, 7]);
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.restore();
      }
    };
    drawRing(r, now * 0.85, false, 2.4, stroke, true);
    if (stroke) {
      drawRing(r * 0.84, -now * 1.25, true, 1.8, 'rgba(255, 206, 108, 0.85)', false);
      // 8 rotating demonic sigil spokes connecting inner & outer rune rings
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 118, 88, 0.72)';
      ctx.lineWidth = 1.6;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + now * 0.85;
        const p0 = this.worldToScreen(wx + Math.cos(a) * r * 0.72, 0.08, wz + Math.sin(a) * r * 0.72);
        const p1 = this.worldToScreen(wx + Math.cos(a) * r, 0.08, wz + Math.sin(a) * r);
        if (p0 && p1) { ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); }
      }
      ctx.restore();
    }
  }

  drawGroundLine2D(ctx, wx, wz, angle, reach, width, prog) {
    const dx = Math.sin(angle), dz = Math.cos(angle);
    const px = dz * (width * 0.5), pz = -dx * (width * 0.5);
    const pts = [
      this.worldToScreen(wx - px, 0.08, wz - pz),
      this.worldToScreen(wx + px, 0.08, wz + pz),
      this.worldToScreen(wx + dx * reach + px, 0.08, wz + dz * reach + pz),
      this.worldToScreen(wx + dx * reach - px, 0.08, wz + dz * reach - pz)
    ];
    if (pts.some(p => !p)) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgba(225, 36, 48, ${0.20 + prog * 0.28})`;
    ctx.fill();
    ctx.strokeStyle = '#ff574a';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // Advancing inner charge core lane
    const cr = reach * prog;
    const cPts = [
      this.worldToScreen(wx - px * 0.75, 0.09, wz - pz * 0.75),
      this.worldToScreen(wx + px * 0.75, 0.09, wz + pz * 0.75),
      this.worldToScreen(wx + dx * cr + px * 0.75, 0.09, wz + dz * cr + pz * 0.75),
      this.worldToScreen(wx + dx * cr - px * 0.75, 0.09, wz + dz * cr - pz * 0.75)
    ];
    if (!cPts.some(p => !p)) {
      ctx.beginPath();
      ctx.moveTo(cPts[0].x, cPts[0].y);
      cPts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 198, 92, 0.34)';
      ctx.fill();
    }
    ctx.restore();
  }

  renderFieldOverlay2D(c, allUnits, dt, ctx) {
    // 1. Crisp Hit Sparks & Ink Droplets
    for (let i = this.sparks2D.length - 1; i >= 0; i--) {
      const spk = this.sparks2D[i];
      spk.t += dt;
      if (spk.t >= spk.dur) { this.sparks2D.splice(i, 1); continue; }
      const p = spk.t / spk.dur;
      const x0 = spk.x, y0 = spk.y, z0 = spk.z;
      spk.x += spk.vx * dt;
      spk.y += spk.vy * dt;
      spk.z += spk.vz * dt;
      spk.vy -= 12.0 * dt;
      const s0 = this.worldToScreen(x0, y0, z0);
      const s1 = this.worldToScreen(spk.x, spk.y, spk.z);
      if (!s0 || !s1) continue;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      if (spk.ink) {
        ctx.fillStyle = '#1d2224';
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, 3.5 * (1 - p * 0.6), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = spk.color;
        ctx.lineWidth = 2.8 * (1 - p * 0.5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s0.x, s0.y);
        ctx.lineTo(s1.x, s1.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Sleek Rounded Gradient Overhead HP Bars + Boss 50% Phase Divider + Status Icons
    for (const u of allUnits) {
      if (u.dead) continue;
      if (u.isMinion && u.hp >= u.maxHp && !u.hasStatus) continue;
      const sp = this.worldToScreen(u.x, (u.scale || 1) * 1.98, u.z);
      if (!sp || !Number.isFinite(sp.x) || !Number.isFinite(sp.y)) continue;
      const bw = u.isBoss ? 86 : (u.isLeader ? 62 : 44);
      const bh = u.isBoss ? 8 : 5.5;
      const bx = sp.x - bw * 0.5, by = sp.y;
      const ratio = Math.max(0, Math.min(1, u.hp / Math.max(1, u.maxHp)));

      ctx.save();
      ctx.fillStyle = 'rgba(14, 20, 24, 0.85)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, bh + 3, 4) : ctx.rect(bx - 1.5, by - 1.5, bw + 3, bh + 3);
      ctx.fill();

      const gr = ctx.createLinearGradient(bx, by, bx + bw, by);
      if (u.isMaster) { gr.addColorStop(0, '#28b878'); gr.addColorStop(1, '#68ffd8'); }
      else if (u.isAlly) { gr.addColorStop(0, '#3688e8'); gr.addColorStop(1, '#78d4ff'); }
      else if (u.isBoss) { gr.addColorStop(0, '#c81c2e'); gr.addColorStop(1, u.phase === 2 ? '#ff8844' : '#ff4d58'); }
      else { gr.addColorStop(0, '#c83430'); gr.addColorStop(1, '#ff6e52'); }
      ctx.fillStyle = gr;
      if (bw * ratio > 0.5) {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw * ratio, bh, 3) : ctx.rect(bx, by, bw * ratio, bh);
        ctx.fill();
      }
      if (u.isBoss) {
        // 50% Phase 2 Enrage notch on Boss overhead bar!
        ctx.fillStyle = 'rgba(255, 240, 170, 0.92)';
        ctx.fillRect(bx + bw * 0.5 - 0.8, by - 1, 1.6, bh + 2);
      }
      ctx.restore();

      if (u.statuses) {
        let sx = bx;
        for (const stKey of ['scar', 'bleed', 'break', 'daze']) {
          const st = u.statuses[stKey];
          if (st && st.t > 0) {
            const ic = this.icons2D[`mg_st_${stKey}`];
            if (ic && ic.complete) {
              ctx.drawImage(ic, sx, by - 15, 13, 13);
              sx += 14;
            }
          }
        }
      }
    }

    // 3. Coin Drops
    const coinImg = this.icons2D.coin;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const cn = this.coins[i];
      cn.t += dt;
      if (cn.t < 0.45) {
        cn.x += cn.vx * dt;
        cn.z += cn.vz * dt;
        cn.y = Math.max(0.15, cn.y + cn.vy * dt);
        cn.vy -= 14 * dt;
      } else if (c.master) {
        cn.x += (c.master.x - cn.x) * Math.min(1, dt * 11);
        cn.z += (c.master.z - cn.z) * Math.min(1, dt * 11);
        cn.y += (0.9 - cn.y) * Math.min(1, dt * 11);
      }
      if (cn.t > 0.85) { this.coins.splice(i, 1); continue; }
      const sp = this.worldToScreen(cn.x, cn.y, cn.z);
      if (sp && coinImg && coinImg.complete) {
        ctx.drawImage(coinImg, sp.x - 9, sp.y - 9, 18, 18);
      }
    }

    // 4. Crisp Anti-Overlap Floating Damage & Skill Popups (with screen-space pill collision nudging!)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const placedBanners = [];
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.t += dt;
      if (p.t >= p.dur) { this.popups.splice(i, 1); continue; }
      const prog = p.t / p.dur;
      const rise = p.isBanner ? (0.65 * Math.sin(Math.min(1, prog * 1.3) * Math.PI * 0.5)) : (prog * 1.12);
      const sp = this.worldToScreen(p.x, p.y + rise, p.z);
      if (!sp) continue;
      let drawX = p.isBanner ? Math.max(255, Math.min(this.width - 255, sp.x)) : sp.x;
      let drawY = p.isBanner ? Math.max(158, sp.y) : Math.max(116, sp.y);
      if (p.isBanner) {
        for (const pb of placedBanners) {
          if (Math.abs(pb.x - drawX) < 175 && Math.abs(pb.y - drawY) < 30) {
            drawY = pb.y + 32;
          }
        }
        placedBanners.push({ x: drawX, y: drawY });
      }
      ctx.save();
      ctx.globalAlpha = prog < 0.08 ? (prog / 0.08) : (prog > 0.62 ? (1 - prog) / 0.38 : 1);
      const popBounce = prog < 0.14 ? (1.0 + Math.sin((prog / 0.14) * Math.PI) * 0.24) : 1.0;
      const fsz = Math.round((p.isBanner ? 13 : 14) * p.scale * popBounce);
      ctx.font = `800 ${fsz}px "MurimJua", "MurimSans", sans-serif`;
      if (p.isBanner) {
        const tw = ctx.measureText(p.text).width;
        const pw = tw + 18, ph = fsz + 10;
        ctx.fillStyle = 'rgba(8, 28, 36, 0.84)';
        ctx.strokeStyle = 'rgba(246, 206, 108, 0.82)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(drawX - pw * 0.5, drawY - ph * 0.5, pw, ph, 999) : ctx.rect(drawX - pw * 0.5, drawY - ph * 0.5, pw, ph);
        ctx.fill();
        ctx.stroke();
      }
      ctx.lineWidth = p.isBanner ? 2.6 : 3.8;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(14, 18, 22, 0.92)';
      ctx.strokeText(p.text, drawX, drawY);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, drawX, drawY);
      ctx.restore();
    }
  }
}

window.MurimRenderer3D = MurimRenderer3D;
