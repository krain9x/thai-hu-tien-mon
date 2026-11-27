// ==================== THÁI HƯ TIÊN MÔN — THIÊN ĐẠO GM DASHBOARD (DUAL FIREBASE + PYTHON SERVER) ====================
(() => {
  const VIP_THRESHOLDS = [0, 200, 600, 1500, 3000, 6000, 10000, 18000, 30000, 50000, 80000];
  const REALM_NAMES = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Chân Tiên'];
  const BOSS_POOL = [
    { name: 'Thái Cổ Huyết Lôi Ma Đế', img: 'assets/img/boss_ch5.png' },
    { name: 'Cửu U Ma Long Vương', img: 'assets/img/boss_ch4.png' },
    { name: 'Huyền Minh Thiên Ma Tôn', img: 'assets/img/boss_ch2.png' },
    { name: 'Hỗn Độn Yêu Hoàng', img: 'assets/img/boss_ch3.png' },
    { name: 'Phá Thiên Kiếm Ma Đế', img: 'assets/img/boss_ch1.png' }
  ];
  const GIFT_PRESETS = [
    { label: '🌱 Gói Tân Thủ', title: 'Quà Tân Thủ Khai Tông', rw: { jade: 300, coin: 12000, herb: 30, core: 20, essence: 10, chaosShard: 0, pill: 3, scroll: 5 } },
    { label: '⚡ Gói Đột Phá', title: 'Quà Hỗ Trợ Đột Phá Cảnh Giới', rw: { jade: 600, coin: 25000, herb: 60, core: 50, essence: 35, chaosShard: 2, pill: 8, scroll: 8 } },
    { label: '🌀 Gói Luyện Khí Hỗn Độn', title: 'Tiếp Tế Nguyên Tinh Hỗn Độn', rw: { jade: 1000, coin: 50000, herb: 120, core: 100, essence: 90, chaosShard: 6, pill: 5, scroll: 0 } },
    { label: '🛠 Đền Bù Bảo Trì', title: 'Quà Đền Bù Bảo Trì Máy Chủ', rw: { jade: 800, coin: 30000, herb: 50, core: 50, essence: 30, chaosShard: 3, pill: 4, scroll: 6 } }
  ];

  function calcVip(exp) {
    let lv = 0;
    for (let i = 1; i < VIP_THRESHOLDS.length; i++) if (exp >= VIP_THRESHOLDS[i]) lv = i;
    return lv;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtN(n) { return Math.floor(n || 0).toLocaleString('vi-VN'); }
  function fmtTime(ts) {
    if (!ts) return '-';
    const d = new Date(ts * 1000);
    return d.toLocaleString('vi-VN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  function toast(msg) {
    const box = document.getElementById('gm-toast-box');
    box.textContent = msg;
    box.classList.remove('hidden');
    clearTimeout(box._t);
    box._t = setTimeout(() => box.classList.add('hidden'), 3400);
  }
  function getBossPortrait(name) {
    const hit = BOSS_POOL.find(b => b.name === name);
    return hit ? hit.img : 'assets/img/boss_ch5.png';
  }

  let backendMode = 'firebase';
  let fbApp = null, auth = null, db = null;
  let pyToken = localStorage.getItem('thai_hu_online_token') || '';
  let currentUser = null;
  let activeTab = 'players';
  let cache = { users: [], guilds: [], orders: [], codes: [], boss: null, rooms: [], chat: [], logs: [], revenue: {} };
  let searchQ = '';
  let playerFilter = 'real'; // 'real' | 'online' | 'banned' | 'vip' | 'all'
  let playerSort = 'power';  // 'power' | 'stage' | 'arena' | 'vip' | 'recent'
  let orderFilter = 'all';   // 'all' | 'pending' | 'paid' | 'rejected'

  const isAdminName = (uname) => {
    const allow = window.TIENMON_ADMIN_USERNAMES || ['krain9x', 'admin'];
    return allow.includes(String(uname || '').toLowerCase());
  };

  async function detectMode() {
    const mode = window.TIENMON_ONLINE_MODE || 'auto';
    const hasFb = !!(window.firebase && window.TIENMON_FIREBASE_CONFIG);
    const isStatic = location.protocol === 'file:' || location.hostname.endsWith('github.io') || location.hostname.endsWith('web.app');
    if (mode === 'firebase' || (isStatic && hasFb)) {
      backendMode = 'firebase';
    } else {
      try {
        const c = new AbortController();
        const tid = setTimeout(() => c.abort(), 1100);
        const r = await fetch('/api/worldboss', { signal: c.signal });
        clearTimeout(tid);
        backendMode = r.ok ? 'server' : 'firebase';
      } catch (_) {
        backendMode = hasFb ? 'firebase' : 'server';
      }
    }
    if (backendMode === 'firebase') {
      fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.TIENMON_FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
    }
    document.getElementById('gm-mode-badge').textContent = backendMode === 'firebase' ? '🔥 Firebase Cloud' : '🐍 Python Server';
  }

  async function pyApi(path, method = 'GET', body = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (pyToken) headers['Authorization'] = `Bearer ${pyToken}`;
      const opts = { method, headers };
      if (body !== null) opts.body = JSON.stringify(body);
      const r = await fetch(path, opts);
      return await r.json().catch(() => ({ ok: false, error: 'Lỗi server' }));
    } catch (_) {
      return { ok: false, error: 'Mất kết nối máy chủ' };
    }
  }

  async function fbLogAudit(kind, target, detail) {
    if (backendMode !== 'firebase' || !db) return;
    try {
      await db.collection('tm_gm_logs').add({
        gm_name: currentUser || 'GM', action_kind: kind, target_label: String(target || '').slice(0, 80),
        detail: String(detail || '').slice(0, 220), created_at: Date.now() / 1000
      });
    } catch (_) {}
  }

  async function loadAllData() {
    if (backendMode === 'firebase') {
      const [uS, gS, oS, cS, bD, rS, chS, lS] = await Promise.all([
        db.collection('tm_users').orderBy('power', 'desc').limit(160).get(),
        db.collection('tm_guilds').get(),
        db.collection('tm_orders').limit(100).get(),
        db.collection('tm_giftcodes').get(),
        db.collection('tm_meta').doc('world_boss').get(),
        db.collection('tm_coop_rooms').limit(30).get(),
        db.collection('tm_chat').orderBy('created_at', 'desc').limit(40).get(),
        db.collection('tm_gm_logs').orderBy('created_at', 'desc').limit(50).get().catch(() => ({ docs: [] }))
      ]);
      cache.users = uS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.guilds = gS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.orders = oS.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      cache.codes = cS.docs.map(d => ({ code: d.id, ...d.data() }));
      cache.boss = bD.exists ? bD.data() : null;
      cache.rooms = rS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.chat = chS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.logs = lS.docs.map(d => ({ id: d.id, ...d.data() }));
      const paid = cache.orders.filter(o => o.status === 'paid');
      cache.revenue = {
        totalPaidVnd: paid.reduce((s, o) => s + (o.amount_vnd || 0), 0),
        paidCount: paid.length,
        pendingCount: cache.orders.filter(o => o.status === 'pending').length,
        rejectedCount: cache.orders.filter(o => o.status === 'rejected').length
      };
    } else {
      const r = await pyApi('/api/admin/overview', 'GET');
      if (!r || !r.ok) { toast((r && r.error) || 'Không tải được dữ liệu Admin'); return; }
      cache = {
        users: r.users || [], guilds: r.guilds || [], orders: r.orders || [],
        codes: r.codes || [], boss: r.boss || null, rooms: r.rooms || [],
        chat: r.chat || [], logs: r.logs || [], revenue: r.revenue || {}
      };
    }
    renderStats();
    renderPanel();
  }

  function renderStats() {
    const realUsers = cache.users.filter(u => !u.is_bot);
    const now = Date.now() / 1000;
    const activeRecent = realUsers.filter(u => now - (u.last_seen || 0) < 300).length;
    const bannedCnt = realUsers.filter(u => !!u.banned).length;
    const rev = cache.revenue || {};
    const pendingOrd = rev.pendingCount != null ? rev.pendingCount : cache.orders.filter(o => o.status === 'pending').length;
    const boss = cache.boss || { name: '?', lv: 1, hp: 0, maxHp: 1 };
    const bossPct = Math.max(0, Math.min(100, Math.round(((boss.hp || 0) / Math.max(1, boss.maxHp || 1)) * 100)));
    document.getElementById('gm-stats-row').innerHTML = `
      <div class="gm-stat">
        <img class="gm-stat-ico" src="assets/img/port_master.png" alt="" />
        <div class="gm-stat-info">
          <div class="k">Đạo Hữu Thật</div>
          <div class="v">${realUsers.length} <span style="font-size:12px;color:#42ff9e;">(${activeRecent} online)</span></div>
          <div class="s">Đang khóa: <b style="color:${bannedCnt ? 'var(--red)' : 'var(--sub)'};">${bannedCnt}</b> · Bot NPC: ${cache.users.length - realUsers.length}</div>
        </div>
      </div>
      <div class="gm-stat">
        <img class="gm-stat-ico" src="assets/img/jade.png" alt="" />
        <div class="gm-stat-info">
          <div class="k">Doanh Thu &amp; Đơn Nạp</div>
          <div class="v" style="color:var(--gold);font-size:18px;">${fmtN(rev.totalPaidVnd || 0)}₫</div>
          <div class="s">Chờ duyệt: <b style="color:${pendingOrd ? 'var(--gold)' : 'var(--jade)'};">${pendingOrd}</b> · Đã duyệt: ${rev.paidCount || 0}</div>
        </div>
      </div>
      <div class="gm-stat">
        <img class="gm-stat-ico" src="assets/img/ut_hall_main.png" alt="" />
        <div class="gm-stat-info">
          <div class="k">Tông Minh &amp; Co-op</div>
          <div class="v">${cache.guilds.length} Minh</div>
          <div class="s">Phòng Co-op mở: <b>${cache.rooms.length}</b> · Chat: ${cache.chat.length}</div>
        </div>
      </div>
      <div class="gm-stat">
        <img class="gm-stat-ico" src="${getBossPortrait(boss.name)}" alt="" style="border-color:var(--red);" />
        <div class="gm-stat-info">
          <div class="k">World Boss · Lv.${boss.lv}</div>
          <div class="v" style="font-size:14.5px;color:#ff8a95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(boss.name)}</div>
          <div class="gm-hpbar"><i style="width:${bossPct}%;"></i></div>
          <div class="s">${fmtN(boss.hp)} / ${fmtN(boss.maxHp)} (${bossPct}%)</div>
        </div>
      </div>
    `;
  }

  function closeModal() {
    document.getElementById('gm-modal-bg').classList.add('hidden');
  }

  async function openInspectModal(uid) {
    const u = cache.users.find(x => String(x.id) === String(uid));
    if (!u) return;
    const bg = document.getElementById('gm-modal-bg');
    const card = document.getElementById('gm-modal-card');
    bg.classList.remove('hidden');
    card.innerHTML = `<div style="padding:20px;text-align:center;">⏳ Đang đọc hồ sơ Đạo Hữu <b>${esc(u.username)}</b>...</div>`;

    let detail = null;
    if (backendMode === 'server') {
      const r = await pyApi(`/api/player/${encodeURIComponent(uid)}/inspect`, 'GET');
      if (r && r.ok) detail = r;
    } else {
      const dDoc = await db.collection('tm_users').doc(String(uid)).get().catch(() => null);
      if (dDoc && dDoc.exists) {
        const d = dDoc.data();
        detail = { player: d, equipped: (d.snapshot && d.snapshot.equipped) || {} };
      }
    }

    const pl = (detail && detail.player) || u;
    const eq = (detail && detail.equipped) || (pl.snapshot && pl.snapshot.equipped) || {};
    const gearDef = window.XIANXIA_EQUIPMENT_DEF || [];
    const slotDefs = [
      ['weapon', 'Vũ Khí'], ['helm', 'Đạo Quán'], ['armor', 'Đạo Bào'],
      ['jade', 'Ngọc Bội'], ['ring', 'Linh Giới'], ['boots', 'Thần Ngoa']
    ];
    const rName = REALM_NAMES[Math.min(REALM_NAMES.length - 1, Math.max(0, u.realm_idx || 0))] || 'Phàm Nhân';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="gm-avatar-wrap">
            <img class="face" src="assets/img/port_master.png" alt="" />
            <img class="frame" src="assets/img/ui_tt/03_orb_frame.png" alt="" />
          </div>
          <div>
            <div style="font-size:17px;font-weight:900;color:var(--gold);display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
              ${esc(u.username)}
              <span class="gm-badge gold">VIP ${u.vip_lv || 0}</span>
              ${u.banned ? '<span class="gm-badge red">ĐANG KHÓA</span>' : '<span class="gm-badge">HOẠT ĐỘNG</span>'}
            </div>
            <div style="font-size:12.5px;color:var(--sub);margin-top:2px;">
              Tông Môn: <b>${esc(u.sect_name)}</b> · Cảnh Giới: <b style="color:var(--jade);">${rName}</b> · Bang: <b>${u.guild_tag ? `[${esc(u.guild_tag)}] ${esc(u.guild_name)}` : 'Chưa gia nhập'}</b>
            </div>
            <div style="font-size:12px;color:var(--sub);margin-top:2px;">
              ⚡ Chiến Lực: <b style="color:#fff;">${fmtN(u.power)}</b> · Ải <b>${u.max_stage || 1}</b> · Tháp <b>T.${u.tower_floor || 1}</b> · ELO <b>${u.arena_score || 1000}</b> · Tổng nạp: <b style="color:var(--gold);">${fmtN(u.total_vnd || 0)}₫</b>
            </div>
          </div>
        </div>
        <button id="btn-m-close" class="gm-btn sm red">✕</button>
      </div>

      <div style="font-weight:900;font-size:12.5px;color:var(--gold);margin-bottom:4px;">⚔ 6 Ô Trang Bị Đang Mặc</div>
      <div class="gm-equip-grid">
        ${slotDefs.map(([sk, sLabel]) => {
          const raw = eq[sk];
          const gid = raw && typeof raw === 'object' ? raw.id : raw;
          const glv = raw && typeof raw === 'object' ? (raw.lv || 1) : 1;
          const def = gid ? gearDef.find(g => g.id === gid) : null;
          return `<div class="gm-eq-slot">
            <img src="assets/img/${def ? def.img : 'ui_tt/03_orb_frame'}.png" onerror="this.src='assets/img/coin.png'" alt="" />
            <div style="min-width:0;">
              <div style="font-size:10px;color:var(--sub);">${sLabel}</div>
              <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${def ? def.gradeCol : '#7b92a1'};">
                ${def ? `${esc(def.name)} +${glv}` : 'Trống'}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="gm-box-grid" style="margin-top:12px;">
        <div class="gm-subcard">
          <div style="font-weight:900;color:var(--jade);font-size:12.5px;margin-bottom:6px;">🏛 Đổi Tên Tông Môn</div>
          <div class="gm-row" style="margin-bottom:0;">
            <input id="m-sect-inp" class="gm-inp" style="flex:1;" value="${esc(u.sect_name)}" maxlength="32" />
            <button id="btn-m-rename" class="gm-btn jade sm">Lưu Tên</button>
          </div>
        </div>
        <div class="gm-subcard">
          <div style="font-weight:900;color:var(--gold);font-size:12.5px;margin-bottom:6px;">⚡ Thao Tác Nhanh</div>
          <div class="gm-row" style="margin-bottom:0;">
            <button id="btn-m-pick-gift" class="gm-btn gold sm">🎁 Bơm Quà Đạo Hữu Này</button>
            <button id="btn-m-ban" class="gm-btn ${u.banned ? 'jade' : 'red'} sm">${u.banned ? '✅ Mở Khóa' : '🚫 Khóa Nick'}</button>
          </div>
        </div>
      </div>

      <div class="gm-subcard" style="margin-top:10px;">
        <div style="font-weight:900;color:var(--blue);font-size:12.5px;margin-bottom:6px;">✉ Gửi Thư Riêng / Cảnh Cáo</div>
        <div class="gm-row" style="margin-bottom:6px;">
          <input id="m-mail-title" class="gm-inp" style="flex:1;" value="Thông Báo Từ Thiên Đạo GM" />
        </div>
        <div class="gm-row" style="margin-bottom:0;">
          <input id="m-mail-body" class="gm-inp" style="flex:1;" placeholder="Nhập nội dung thư hoặc cảnh cáo vi phạm..." />
          <button id="btn-m-send-msg" class="gm-btn jade sm">Gửi Thư</button>
        </div>
      </div>
    `;

    document.getElementById('btn-m-close').onclick = closeModal;
    document.getElementById('btn-m-rename').onclick = async () => {
      const nm = document.getElementById('m-sect-inp').value.trim();
      if (!nm) return;
      await adminRenameSect(u.id, nm);
      closeModal();
    };
    document.getElementById('btn-m-pick-gift').onclick = () => {
      closeModal();
      document.getElementById('gm-gift-target').value = String(u.id);
      document.getElementById('gm-vip-target').value = String(u.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.getElementById('btn-m-ban').onclick = async () => {
      await adminToggleBan(u.id);
      closeModal();
    };
    document.getElementById('btn-m-send-msg').onclick = async () => {
      const t = document.getElementById('m-mail-title').value.trim() || 'Thư GM';
      const b = document.getElementById('m-mail-body').value.trim();
      if (!b) { toast('Nhập nội dung thư!'); return; }
      await adminGrantMail(String(u.id), t, {}, b);
      closeModal();
    };
  }

  function renderResourceGrid(prefix, defaults) {
    const items = [
      ['jade', 'Tiên Ngọc', 'img:jade.png', defaults.jade || 0],
      ['coin', 'Linh Thạch', 'img:coin.png', defaults.coin || 0],
      ['herb', 'Linh Thảo', 'img:res_herb.png', defaults.herb || 0],
      ['core', 'Yêu Đan', 'img:res_core.png', defaults.core || 0],
      ['essence', 'Tinh Thạch', 'ico:💠', defaults.essence || 0],
      ['chaosShard', 'Nguyên Tinh H.Đ', 'ico:🌀', defaults.chaosShard || 0],
      ['pill', 'Đan Đột Phá', 'ico:💊', defaults.pill || 0],
      ['scroll', 'Ngọc Giản', 'ico:📜', defaults.scroll || 0]
    ];
    return `<div class="gm-res-grid">
      ${items.map(([k, lbl, icon, val]) => `
        <div class="gm-res-chip">
          ${icon.startsWith('img:') ? `<img src="assets/img/${icon.slice(4)}" alt="" />` : `<span class="ico">${icon.slice(4)}</span>`}
          <div style="min-width:0;flex:1;">
            <label>${lbl}</label>
            <input id="${prefix}-${k}" type="number" min="0" value="${val}" />
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  function readResourceGrid(prefix) {
    const res = {};
    for (const k of ['jade', 'coin', 'herb', 'core', 'essence', 'chaosShard', 'pill', 'scroll']) {
      const el = document.getElementById(`${prefix}-${k}`);
      const v = parseInt((el && el.value) || '0', 10);
      if (v > 0) res[k] = v;
    }
    return res;
  }

  function renderPanel() {
    const body = document.getElementById('gm-panel-body');
    const now = Date.now() / 1000;

    if (activeTab === 'players') {
      const realList = cache.users.filter(u => !u.is_bot);
      body.innerHTML = `
        <div class="gm-box-grid" style="margin-bottom:14px;">
          <div class="gm-subcard">
            <div class="gm-sec-title">
              <span>🎁 Phát Thư Quà &amp; Tài Nguyên</span>
              <span style="font-size:11px;color:var(--sub);">Hỗ trợ đủ 8 loại tài nguyên</span>
            </div>
            <div class="gm-chip-bar">
              ${GIFT_PRESETS.map((p, idx) => `<button class="gm-chip" data-preset="${idx}">${p.label}</button>`).join('')}
            </div>
            <div class="gm-row">
              <select id="gm-gift-target" class="gm-sel" style="flex:1;">
                <option value="__ALL__">🌐 Toàn Bộ Đạo Hữu Thật (${realList.length})</option>
                ${realList.map(u => `<option value="${esc(u.id)}">${esc(u.username)} · ${esc(u.sect_name)}</option>`).join('')}
              </select>
            </div>
            ${renderResourceGrid('gm-g', { jade: 500, coin: 10000, herb: 20, core: 20, essence: 20, chaosShard: 0, pill: 0, scroll: 0 })}
            <div class="gm-row" style="margin-bottom:0;">
              <input id="gm-g-title" class="gm-inp" style="flex:1;" value="Quà Hỗ Trợ Từ GM Thái Hư" />
              <button id="btn-gm-send-gift" class="gm-btn jade">📤 Phát Thư Quà</button>
            </div>
          </div>

          <div class="gm-subcard">
            <div class="gm-sec-title"><span>👑 Cấp VIP EXP &amp; Đặc Quyền</span></div>
            <div class="gm-row">
              <select id="gm-vip-target" class="gm-sel" style="flex:1;">
                ${realList.map(u => `<option value="${esc(u.id)}">${esc(u.username)} (VIP ${u.vip_lv || 0} · ${fmtN(u.vip_exp || 0)} EXP)</option>`).join('')}
              </select>
            </div>
            <div class="gm-row">
              <input id="gm-vip-exp" class="gm-inp" type="number" style="width:130px;" value="1500" />
              <button id="btn-gm-grant-vip" class="gm-btn gold">⚡ Cộng VIP EXP</button>
            </div>
            <div class="gm-chip-bar" style="margin-top:4px;">
              ${[200, 600, 1500, 6000, 18000].map(v => `<button class="gm-chip" data-vip-q="${v}">+${fmtN(v)}</button>`).join('')}
            </div>
            <div style="font-size:11.5px;color:var(--sub);">Mốc VIP: V1=200 · V2=600 · V3=1500 · V5=6000 · V7=18000 · V10=80000</div>
          </div>
        </div>

        <div class="gm-row">
          <input id="gm-search-u" class="gm-inp" style="flex:1;min-width:190px;" value="${esc(searchQ)}" placeholder="🔍 Tìm tên Đạo Hiệu, Tông Môn hoặc Bang Hội..." />
          <select id="gm-filter-u" class="gm-sel">
            <option value="real" ${playerFilter === 'real' ? 'selected' : ''}>Đạo Hữu Thật (${realList.length})</option>
            <option value="online" ${playerFilter === 'online' ? 'selected' : ''}>🟢 Đang Online</option>
            <option value="vip" ${playerFilter === 'vip' ? 'selected' : ''}>👑 Có VIP</option>
            <option value="banned" ${playerFilter === 'banned' ? 'selected' : ''}>🚫 Đang Bị Khóa</option>
            <option value="all" ${playerFilter === 'all' ? 'selected' : ''}>Tất cả (gồm Bot NPC)</option>
          </select>
          <select id="gm-sort-u" class="gm-sel">
            <option value="power" ${playerSort === 'power' ? 'selected' : ''}>Xếp: Chiến Lực</option>
            <option value="stage" ${playerSort === 'stage' ? 'selected' : ''}>Xếp: Ải Cao Nhất</option>
            <option value="arena" ${playerSort === 'arena' ? 'selected' : ''}>Xếp: Điểm ELO</option>
            <option value="vip" ${playerSort === 'vip' ? 'selected' : ''}>Xếp: VIP</option>
            <option value="recent" ${playerSort === 'recent' ? 'selected' : ''}>Xếp: Hoạt Động Gần Đây</option>
          </select>
        </div>

        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Đạo Hiệu</th><th>Cảnh Giới</th><th>Chiến Lực</th><th>Ải / ELO</th><th>VIP / Nạp</th><th>Bang Hội</th><th>Thao Tác</th></tr></thead>
            <tbody id="gm-players-tbody"></tbody>
          </table>
        </div>
      `;

      const renderPlayerRows = () => {
        const q = searchQ.toLowerCase();
        const filtered = cache.users.filter(u => {
          if (playerFilter === 'real' && u.is_bot) return false;
          if (playerFilter === 'online' && (u.is_bot || now - (u.last_seen || 0) >= 300)) return false;
          if (playerFilter === 'vip' && (u.is_bot || (u.vip_lv || 0) <= 0)) return false;
          if (playerFilter === 'banned' && !u.banned) return false;
          if (!q) return true;
          return String(u.username || '').toLowerCase().includes(q)
            || String(u.sect_name || '').toLowerCase().includes(q)
            || String(u.guild_name || '').toLowerCase().includes(q);
        }).sort((a, b) => {
          if (playerSort === 'stage') return (b.max_stage || 0) - (a.max_stage || 0);
          if (playerSort === 'arena') return (b.arena_score || 0) - (a.arena_score || 0);
          if (playerSort === 'vip') return (b.vip_lv || 0) - (a.vip_lv || 0);
          if (playerSort === 'recent') return (b.last_seen || 0) - (a.last_seen || 0);
          return (b.power || 0) - (a.power || 0);
        });
        const tbody = document.getElementById('gm-players-tbody');
        if (!tbody) return;
        tbody.innerHTML = filtered.length ? filtered.map(u => {
          const isOn = !u.is_bot && now - (u.last_seen || 0) < 300;
          const rName = REALM_NAMES[Math.min(REALM_NAMES.length - 1, Math.max(0, u.realm_idx || 0))] || 'Phàm Nhân';
          return `<tr>
            <td>
              <div class="u-cell">
                <img class="u-ava" src="assets/img/port_master.png" alt="" />
                <div>
                  <div><span class="${isOn ? 'dot-live' : 'dot-off'}"></span><b>${esc(u.username)}</b> ${u.is_bot ? '<span class="gm-badge gold">BOT</span>' : ''} ${u.banned ? '<span class="gm-badge red">BANNED</span>' : ''}</div>
                  <div style="font-size:11.5px;color:var(--sub);">${esc(u.sect_name)}</div>
                </div>
              </div>
            </td>
            <td><span class="gm-badge">${esc(rName)}</span></td>
            <td><b style="color:var(--jade);">${fmtN(u.power)}</b></td>
            <td>Ải <b>${u.max_stage || 1}</b> · ${u.arena_score || 1000}</td>
            <td><span class="gm-badge ${(u.vip_lv || 0) >= 5 ? 'purple' : 'gold'}">VIP ${u.vip_lv || 0}</span><div style="font-size:11px;color:var(--sub);">${fmtN(u.total_vnd || 0)}₫</div></td>
            <td>${u.guild_tag ? `[${esc(u.guild_tag)}] ${esc(u.guild_name)}` : '-'}</td>
            <td>
              <div style="display:flex;gap:5px;flex-wrap:wrap;">
                <button class="gm-btn sm" data-inspect="${esc(u.id)}">👁 Chi Tiết</button>
                ${!u.is_bot ? `<button class="gm-btn gold sm" data-pick-gift="${esc(u.id)}">🎁</button>
                <button class="gm-btn ${u.banned ? 'jade' : 'red'} sm" data-toggle-ban="${esc(u.id)}">${u.banned ? 'Mở' : 'Khóa'}</button>` : ''}
              </div>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="7" style="text-align:center;color:var(--sub);padding:18px;">Không tìm thấy Đạo Hữu nào phù hợp bộ lọc.</td></tr>`;

        tbody.querySelectorAll('[data-inspect]').forEach(b => { b.onclick = () => openInspectModal(b.getAttribute('data-inspect')); });
        tbody.querySelectorAll('[data-pick-gift]').forEach(b => {
          b.onclick = () => {
            document.getElementById('gm-gift-target').value = b.getAttribute('data-pick-gift');
            document.getElementById('gm-vip-target').value = b.getAttribute('data-pick-gift');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          };
        });
        tbody.querySelectorAll('[data-toggle-ban]').forEach(b => { b.onclick = () => adminToggleBan(b.getAttribute('data-toggle-ban')); });
      };

      renderPlayerRows();
      document.getElementById('gm-search-u').oninput = (e) => { searchQ = e.target.value; renderPlayerRows(); };
      document.getElementById('gm-filter-u').onchange = (e) => { playerFilter = e.target.value; renderPlayerRows(); };
      document.getElementById('gm-sort-u').onchange = (e) => { playerSort = e.target.value; renderPlayerRows(); };
      body.querySelectorAll('[data-preset]').forEach(b => {
        b.onclick = () => {
          const pr = GIFT_PRESETS[parseInt(b.getAttribute('data-preset'), 10)];
          if (!pr) return;
          document.getElementById('gm-g-title').value = pr.title;
          for (const [k, v] of Object.entries(pr.rw)) {
            const el = document.getElementById(`gm-g-${k}`);
            if (el) el.value = String(v);
          }
          toast(`Đã nạp mẫu ${pr.label}`);
        };
      });
      body.querySelectorAll('[data-vip-q]').forEach(b => {
        b.onclick = () => { document.getElementById('gm-vip-exp').value = b.getAttribute('data-vip-q'); };
      });
      document.getElementById('btn-gm-send-gift').onclick = async () => {
        const target = document.getElementById('gm-gift-target').value;
        const att = readResourceGrid('gm-g');
        const title = document.getElementById('gm-g-title').value.trim() || 'Quà GM';
        await adminGrantMail(target, title, att);
      };
      document.getElementById('btn-gm-grant-vip').onclick = async () => {
        const uid = document.getElementById('gm-vip-target').value;
        const exp = parseInt(document.getElementById('gm-vip-exp').value || '0', 10);
        if (!uid || exp <= 0) return;
        await adminGrantVip(uid, exp);
      };
    } else if (activeTab === 'orders') {
      const rev = cache.revenue || {};
      const byMethod = {};
      cache.orders.filter(o => o.status === 'paid').forEach(o => {
        const m = String(o.method || 'other').toUpperCase();
        byMethod[m] = (byMethod[m] || 0) + (o.amount_vnd || 0);
      });
      const shownOrders = cache.orders.filter(o => orderFilter === 'all' || o.status === orderFilter);
      body.innerHTML = `
        <div class="gm-box-grid" style="margin-bottom:12px;">
          <div class="gm-subcard">
            <div class="gm-sec-title"><span>💰 Thống Kê Doanh Thu Đã Duyệt</span></div>
            <div style="font-size:24px;font-weight:900;color:var(--gold);margin-bottom:6px;">${fmtN(rev.totalPaidVnd || 0)}₫</div>
            <div class="gm-row" style="margin:0;">
              ${Object.entries(byMethod).length ? Object.entries(byMethod).map(([m, v]) => `<span class="gm-badge gold">${esc(m)}: ${fmtN(v)}₫</span>`).join('') : '<span style="font-size:12px;color:var(--sub);">Chưa có giao dịch thành công.</span>'}
            </div>
          </div>
          <div class="gm-subcard">
            <div class="gm-sec-title"><span>🔍 Lọc Trạng Thái Đơn (${cache.orders.length})</span></div>
            <div class="gm-chip-bar" style="margin-bottom:0;">
              <button class="gm-chip ${orderFilter === 'all' ? 'active' : ''}" data-of="all">Tất cả (${cache.orders.length})</button>
              <button class="gm-chip ${orderFilter === 'pending' ? 'active' : ''}" data-of="pending">⏳ Chờ Duyệt (${rev.pendingCount || 0})</button>
              <button class="gm-chip ${orderFilter === 'paid' ? 'active' : ''}" data-of="paid">✅ Đã Duyệt (${rev.paidCount || 0})</button>
              <button class="gm-chip ${orderFilter === 'rejected' ? 'active' : ''}" data-of="rejected">❌ Đã Hủy (${rev.rejectedCount || 0})</button>
            </div>
          </div>
        </div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Mã Đơn</th><th>Đạo Hữu</th><th>Gói Nạp</th><th>Số Tiền</th><th>Kênh / Thời Gian</th><th>Trạng Thái</th><th>Thao Tác</th></tr></thead>
            <tbody>
              ${shownOrders.length ? shownOrders.map(o => {
                const u = cache.users.find(x => String(x.id) === String(o.user_id));
                const uName = u ? u.username : o.user_id;
                const oc = o.order_code || o.orderCode;
                const stBadge = o.status === 'paid'
                  ? '<span class="gm-badge">Đã Duyệt</span>'
                  : (o.status === 'rejected' ? '<span class="gm-badge red">Từ Chối</span>' : '<span class="gm-badge gold">Chờ Duyệt</span>');
                return `<tr>
                  <td><b>${esc(oc)}</b></td>
                  <td>${esc(uName)}</td>
                  <td>${esc(o.pack_name)}</td>
                  <td><b style="color:var(--gold);">${fmtN(o.amount_vnd)}₫</b></td>
                  <td>${esc((o.method || '').toUpperCase())} ${o.card_info ? `(${esc(o.card_info)})` : ''}<div style="font-size:11px;color:var(--sub);">${fmtTime(o.created_at)}</div></td>
                  <td>${stBadge}</td>
                  <td>
                    ${o.status === 'pending' ? `<div style="display:flex;gap:5px;">
                      <button class="gm-btn jade sm" data-approve-ord="${esc(oc)}">✅ Duyệt</button>
                      <button class="gm-btn red sm" data-reject-ord="${esc(oc)}">❌ Hủy</button>
                    </div>` : '✓'}
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="7" style="text-align:center;color:var(--sub);padding:18px;">Không có đơn hàng nào.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
      body.querySelectorAll('[data-of]').forEach(b => { b.onclick = () => { orderFilter = b.getAttribute('data-of'); renderPanel(); }; });
      body.querySelectorAll('[data-approve-ord]').forEach(b => { b.onclick = () => adminApproveOrder(b.getAttribute('data-approve-ord')); });
      body.querySelectorAll('[data-reject-ord]').forEach(b => { b.onclick = () => adminRejectOrder(b.getAttribute('data-reject-ord')); });
    } else if (activeTab === 'codes') {
      body.innerHTML = `
        <div class="gm-box-grid">
          <div class="gm-subcard">
            <div class="gm-sec-title">
              <span>🎫 Tạo Mã Giftcode Mới</span>
              <button id="btn-gm-randcode" class="gm-btn sm">🎲 Ngẫu Nhiên</button>
            </div>
            <div class="gm-row">
              <input id="gm-gc-code" class="gm-inp" style="flex:1;text-transform:uppercase;" placeholder="MÃ CODE (vd: HONGMONG88)" />
              <input id="gm-gc-max" class="gm-inp" type="number" style="width:110px;" value="500" title="Số lượt tối đa" />
            </div>
            <input id="gm-gc-title" class="gm-inp" style="width:100%;margin-bottom:8px;" placeholder="Mô tả quà (vd: Quà Ra Mắt Vũ Khí Hỗn Độn)" />
            ${renderResourceGrid('gm-gc', { jade: 500, coin: 15000, herb: 25, core: 25, essence: 15, chaosShard: 2, pill: 2, scroll: 0 })}
            <button id="btn-gm-mkcode" class="gm-btn jade" style="width:100%;justify-content:center;">✨ Phát Hành Giftcode</button>
          </div>
          <div class="gm-subcard">
            <div class="gm-sec-title"><span>📢 Thiên Đạo Thông Báo (Chat Thế Giới)</span></div>
            <div class="gm-chip-bar">
              <button class="gm-chip" data-bc-tpl="🐉 Boss Thế Giới vừa giáng lâm! Mời toàn thể Đạo Hữu cùng hội chiến đoạt bảo!">🐉 Gọi Boss</button>
              <button class="gm-chip" data-bc-tpl="🎁 Giftcode mới vừa phát hành! Nhập ngay trong mục Online -> Giftcode!">🎁 Báo Giftcode</button>
              <button class="gm-chip" data-bc-tpl="⚙ Máy chủ chuẩn bị bảo trì nhẹ 5 phút — vui lòng bấm Lưu Cloud!">🛠 Báo Bảo Trì</button>
            </div>
            <textarea id="gm-bc-txt" class="gm-inp" rows="5" style="width:100%;margin-bottom:8px;" placeholder="Nhập nội dung Thiên Đạo Thông Báo gửi tới mọi người..."></textarea>
            <button id="btn-gm-bc" class="gm-btn gold" style="width:100%;justify-content:center;">📣 Phát Thông Báo Ngay</button>
          </div>
        </div>
        <div style="font-weight:900;margin:14px 0 8px;">📜 Giftcode Đang Lưu Hành (${cache.codes.length}) + Mặc định (THAIHU2026, TANTHU, TIENMONVIP)</div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Mã</th><th>Tên Quà</th><th>Phần Thưởng</th><th>Tiến Độ Sử Dụng</th><th>Xóa</th></tr></thead>
            <tbody>
              ${cache.codes.map(c => {
                const used = c.used_count || 0;
                const maxU = c.max_uses || 99999;
                const pct = Math.min(100, Math.round((used / Math.max(1, maxU)) * 100));
                const rw = c.rewards || c.rewards_json || {};
                const rwStr = typeof rw === 'string' ? rw : Object.entries(rw).map(([k, v]) => `${k}:${v}`).join(' · ');
                return `<tr>
                  <td><b style="color:var(--gold);">${esc(c.code)}</b></td>
                  <td>${esc(c.title)}</td>
                  <td><code style="font-size:11.5px;color:#aeead8;">${esc(rwStr)}</code></td>
                  <td style="min-width:130px;">
                    <div style="font-size:11.5px;">${used} / ${maxU} (${pct}%)</div>
                    <div class="gm-hpbar"><i style="width:${pct}%;background:var(--jade);"></i></div>
                  </td>
                  <td><button class="gm-btn red sm" data-del-gc="${esc(c.code)}">Xóa</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('btn-gm-randcode').onclick = () => {
        const words = ['TIENMON', 'THAIHU', 'HONGMONG', 'KHAITONG', 'TRUTIEN'];
        const w = words[Math.floor(Math.random() * words.length)];
        document.getElementById('gm-gc-code').value = `${w}${Math.floor(100 + Math.random() * 899)}`;
      };
      body.querySelectorAll('[data-bc-tpl]').forEach(b => {
        b.onclick = () => { document.getElementById('gm-bc-txt').value = b.getAttribute('data-bc-tpl'); };
      });
      document.getElementById('btn-gm-mkcode').onclick = adminCreateGiftcode;
      document.getElementById('btn-gm-bc').onclick = adminBroadcastChat;
      body.querySelectorAll('[data-del-gc]').forEach(b => { b.onclick = () => adminDeleteGiftcode(b.getAttribute('data-del-gc')); });
    } else if (activeTab === 'world') {
      const boss = cache.boss || { name: '?', lv: 1, hp: 0, maxHp: 1, topDamage: [] };
      const bPct = Math.max(0, Math.min(100, Math.round(((boss.hp || 0) / Math.max(1, boss.maxHp || 1)) * 100)));
      const topDmg = boss.topDamage || [];
      body.innerHTML = `
        <div class="gm-box-grid" style="margin-bottom:12px;">
          <div class="gm-subcard">
            <div class="gm-sec-title"><span>🐉 Triệu Hồi &amp; Điều Phối World Boss</span></div>
            <div class="gm-boss-banner">
              <img class="gm-boss-img" src="${getBossPortrait(boss.name)}" alt="" />
              <div style="flex:1;min-width:180px;">
                <div style="font-size:15.5px;font-weight:900;color:#ff8a95;">${esc(boss.name)} <span class="gm-badge gold">Lv.${boss.lv}</span></div>
                <div style="font-size:12px;color:var(--sub);margin-top:3px;">HP: <b style="color:#fff;">${fmtN(boss.hp)} / ${fmtN(boss.maxHp)}</b> (${bPct}%)</div>
                <div class="gm-hpbar"><i style="width:${bPct}%;"></i></div>
              </div>
            </div>
            <div class="gm-row">
              <select id="gm-wb-name" class="gm-sel" style="flex:1;">
                ${BOSS_POOL.map(b => `<option value="${esc(b.name)}" ${b.name === boss.name ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
              </select>
              <input id="gm-wb-lv" class="gm-inp" type="number" min="1" style="width:90px;" value="${(boss.lv || 1) + 1}" title="Cấp Boss" />
              <button id="btn-gm-spawn-boss" class="gm-btn gold">⚡ Triệu Hồi Mới</button>
            </div>
            <div style="font-weight:800;font-size:12px;color:var(--sub);margin-bottom:5px;">🏆 Top Sát Thương Boss Hiện Tại (${topDmg.length})</div>
            <div style="max-height:140px;overflow-y:auto;font-size:12px;background:#0a1218;border-radius:8px;padding:7px 9px;border:1px solid var(--line);">
              ${topDmg.length ? topDmg.slice(0, 8).map((r, i) => `<div style="display:flex;justify-content:space-between;padding:2px 0;">
                <span><b>#${i + 1}</b> ${esc(r.name || r.username || 'Đạo Hữu')}</span>
                <b style="color:var(--gold);">${fmtN(r.dmg)}</b>
              </div>`).join('') : '<span style="color:var(--sub);">Chưa có ai đánh Boss lượt này.</span>'}
            </div>
          </div>

          <div class="gm-subcard">
            <div class="gm-sec-title"><span>🏛 Liên Minh / Bang Hội (${cache.guilds.length}) &amp; Co-op (${cache.rooms.length})</span></div>
            <div style="max-height:190px;overflow-y:auto;margin-bottom:10px;">
              ${cache.guilds.length ? cache.guilds.map(g => `<div class="gm-row" style="justify-content:space-between;padding:6px 8px;background:#0a1218;border-radius:8px;margin-bottom:5px;">
                <div style="min-width:0;">
                  <div style="font-size:12.5px;font-weight:800;">[${esc(g.tag)}] ${esc(g.name)} <span class="gm-badge">Lv.${g.lv || 1}</span></div>
                  <div style="font-size:11px;color:var(--sub);">Minh Chủ: ${esc(g.leader_name || '-')} · ${g.member_count || 1} TV · Điểm tuần: ${fmtN(g.week_score || 0)}</div>
                </div>
                <button class="gm-btn red sm" data-del-guild="${esc(g.id)}">Giải Tán</button>
              </div>`).join('') : '<div style="font-size:12px;color:var(--sub);">Chưa có Liên Minh nào.</div>'}
            </div>
            <div style="font-weight:800;font-size:12px;color:var(--jade);margin-bottom:5px;">🌀 Phòng Co-op Đang Mở (${cache.rooms.length})</div>
            ${cache.rooms.length ? cache.rooms.map(r => `<div class="gm-row" style="justify-content:space-between;">
              <span style="font-size:12.5px;">${esc(r.name)} (${(r.members || []).length}/4 · ${esc(r.status)})</span>
              <button class="gm-btn red sm" data-del-room="${esc(r.id)}">Dọn</button>
            </div>`).join('') : `<div style="font-size:12px;color:var(--sub);">Không có phòng Co-op tồn đọng.</div>`}
          </div>
        </div>

        <div class="gm-sec-title">
          <span>💬 Kiểm Duyệt Chat Gần Đây (${cache.chat.length})</span>
          <button id="btn-gm-clear-chat" class="gm-btn red sm">🧹 Dọn Sạch Chat Thế Giới</button>
        </div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Kênh</th><th>Người Gửi</th><th>Nội Dung</th><th>Thời Gian</th><th>Thao Tác</th></tr></thead>
            <tbody>
              ${cache.chat.length ? cache.chat.map(m => `<tr>
                <td><span class="gm-badge">${esc(m.channel)}</span></td>
                <td><b>${esc(m.sender_name)}</b></td>
                <td>${esc(m.text)}</td>
                <td style="font-size:11.5px;color:var(--sub);">${fmtTime(m.created_at)}</td>
                <td><button class="gm-btn red sm" data-del-chat="${esc(m.id)}">Xóa</button></td>
              </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--sub);padding:14px;">Chưa có tin nhắn nào.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('btn-gm-spawn-boss').onclick = () => {
        const nm = document.getElementById('gm-wb-name').value;
        const lv = parseInt(document.getElementById('gm-wb-lv').value || '1', 10);
        adminSpawnBoss(nm, lv);
      };
      document.getElementById('btn-gm-clear-chat').onclick = adminClearChat;
      body.querySelectorAll('[data-del-guild]').forEach(b => { b.onclick = () => adminDeleteGuild(b.getAttribute('data-del-guild')); });
      body.querySelectorAll('[data-del-room]').forEach(b => { b.onclick = () => adminDeleteDoc('tm_coop_rooms', b.getAttribute('data-del-room')); });
      body.querySelectorAll('[data-del-chat]').forEach(b => { b.onclick = () => adminDeleteDoc('tm_chat', b.getAttribute('data-del-chat')); });
    } else if (activeTab === 'logs') {
      body.innerHTML = `
        <div class="gm-sec-title">
          <span>📜 Nhật Ký Thao Tác Quản Trị GM (${cache.logs.length})</span>
          <span style="font-size:11.5px;color:var(--sub);">Ghi nhận mọi thao tác bơm quà, duyệt/hủy đơn, khóa nick, điều phối Boss</span>
        </div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Thời Gian</th><th>GM</th><th>Hành Động</th><th>Đối Tượng</th><th>Chi Tiết</th></tr></thead>
            <tbody>
              ${cache.logs.length ? cache.logs.map(l => `<tr>
                <td style="font-size:11.5px;color:var(--sub);">${fmtTime(l.created_at)}</td>
                <td><b>${esc(l.gm_name)}</b></td>
                <td><span class="gm-badge gold">${esc(l.action_kind)}</span></td>
                <td><b>${esc(l.target_label)}</b></td>
                <td style="font-size:12px;">${esc(l.detail)}</td>
              </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--sub);padding:18px;">Chưa có thao tác GM nào được ghi nhận.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  async function adminGrantMail(targetUid, title, attachments, customBody = 'Quà hỗ trợ trực tiếp từ Quản Trị Viên.') {
    if (!Object.keys(attachments).length && customBody === 'Quà hỗ trợ trực tiếp từ Quản Trị Viên.') {
      toast('Nhập ít nhất 1 phần quà!'); return;
    }
    if (backendMode === 'firebase') {
      const targets = targetUid === '__ALL__' ? cache.users.filter(u => !u.is_bot).map(u => u.id) : [targetUid];
      const now = Date.now() / 1000;
      const batch = db.batch();
      targets.forEach(tid => {
        batch.set(db.collection('tm_mails').doc(), {
          to_user_id: tid, from_name: 'GM Thái Hư Tiên Môn', title, body: customBody,
          attachments, claimed: false, created_at: now
        });
      });
      await batch.commit();
      await fbLogAudit('grant_mail', targetUid === '__ALL__' ? `All (${targets.length})` : targetUid, `${title} ${JSON.stringify(attachments)}`);
      toast(`🎁 Đã gửi thư tới ${targets.length} Đạo Hữu!`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'grant_mail', targetId: targetUid, title, body: customBody, attachments });
      toast(r.ok ? `🎁 Đã gửi thư tới ${r.count || 1} Đạo Hữu!` : (r.error || 'Lỗi'));
    }
    loadAllData();
  }

  async function adminGrantVip(uid, addExp) {
    if (backendMode === 'firebase') {
      const bRef = db.collection('tm_billing').doc(uid);
      const b = (await bRef.get()).data() || { total_vnd: 0, vip_exp: 0, vip_lv: 0, first_topup_claimed: 0, firstPacks: {}, vipClaimed: {}, pass_30_until: 0 };
      const newExp = (b.vip_exp || 0) + addExp;
      const newLv = calcVip(newExp);
      await bRef.set({ ...b, vip_exp: newExp, vip_lv: newLv }, { merge: true });
      await db.collection('tm_users').doc(uid).update({ vip_lv: newLv });
      await fbLogAudit('grant_vip', uid, `+${addExp} VIP EXP -> VIP ${newLv}`);
      toast(`👑 Đã cộng +${fmtN(addExp)} VIP EXP (lên VIP ${newLv})!`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'grant_vip', targetId: uid, addExp });
      toast(r.ok ? `👑 Đã cộng +${fmtN(addExp)} VIP EXP!` : (r.error || 'Lỗi'));
    }
    loadAllData();
  }

  async function adminToggleBan(uid) {
    const u = cache.users.find(x => String(x.id) === String(uid));
    if (!u) return;
    if (backendMode === 'firebase') {
      await db.collection('tm_users').doc(uid).update({ banned: !u.banned });
      await fbLogAudit('toggle_ban', u.username, !u.banned ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA');
      toast(!u.banned ? `🚫 Đã khóa ${u.username}` : `✅ Đã mở khóa ${u.username}`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'toggle_ban', targetId: uid });
      if (!r || !r.ok) { toast((r && r.error) || 'Lỗi khóa tài khoản'); return; }
      toast(r.banned ? `🚫 Đã khóa ${u.username}` : `✅ Đã mở khóa ${u.username}`);
    }
    loadAllData();
  }

  async function adminRenameSect(uid, sectName) {
    if (backendMode === 'firebase') {
      await db.collection('tm_users').doc(String(uid)).update({ sect_name: sectName });
      await fbLogAudit('rename_sect', uid, `Đổi thành ${sectName}`);
      toast(`🏛 Đã đổi tên Tông Môn thành ${sectName}`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'rename_sect', targetId: uid, sectName });
      toast(r.ok ? `🏛 Đã đổi tên Tông Môn thành ${sectName}` : (r.error || 'Lỗi'));
    }
    loadAllData();
  }

  const GM_PACK_REWARDS = {
    jade_20k:       { vnd: 20000,   vipExp: 200,   jade: 300 },
    jade_50k:       { vnd: 50000,   vipExp: 500,   jade: 800 },
    jade_100k:      { vnd: 100000,  vipExp: 1000,  jade: 1700 },
    jade_200k:      { vnd: 200000,  vipExp: 2000,  jade: 3600 },
    jade_500k:      { vnd: 500000,  vipExp: 5000,  jade: 9500 },
    jade_1000k:     { vnd: 1000000, vipExp: 10000, jade: 20000 },
    starter_pack:   { vnd: 49000,   vipExp: 500,   jade: 1200, extra: { coin: 30000, pill: 10, scroll: 15 }, once: true },
    monthly_card:   { vnd: 99000,   vipExp: 1000,  jade: 1000, flag: 'pass30' },
    season_pass:    { vnd: 129000,  vipExp: 1300,  jade: 500,  flag: 'seasonPass', once: true },
    privilege_card: { vnd: 199000,  vipExp: 2000,  jade: 1500, flag: 'noAds', once: true }
  };

  async function adminApproveOrder(orderCode) {
    if (backendMode === 'firebase') {
      const ordRef = db.collection('tm_orders').doc(orderCode);
      const res = await db.runTransaction(async tx => {
        const oDoc = await tx.get(ordRef);
        if (!oDoc.exists) throw new Error('Không tìm thấy đơn');
        const ord = oDoc.data();
        if (ord.status === 'paid') throw new Error('Đơn đã duyệt trước đó!');
        const uid = ord.user_id;
        const pDef = GM_PACK_REWARDS[ord.pack_id] || null;
        const bRef = db.collection('tm_billing').doc(uid);
        const bSnap = await tx.get(bRef);
        const b = bSnap.exists ? bSnap.data() : { total_vnd: 0, vip_exp: 0, vip_lv: 0, first_packs: {} };
        const fp = { ...(b.first_packs || {}) };
        let baseJade = pDef ? pDef.jade : Math.round((ord.amount_vnd || 20000) / 50);
        let bonusJade = 0;
        if (pDef && !pDef.once && !fp[ord.pack_id]) {
          bonusJade = baseJade;
          fp[ord.pack_id] = true;
        }
        const totalJade = baseJade + bonusJade;
        const vipGain = pDef ? pDef.vipExp : Math.round((ord.amount_vnd || 20000) / 100);
        const newExp = (b.vip_exp || 0) + vipGain;
        const newLv = calcVip(newExp);
        const now = Date.now() / 1000;
        const nextB = { ...b, total_vnd: (b.total_vnd || 0) + (ord.amount_vnd || 0), vip_exp: newExp, vip_lv: newLv, firstPacks: fp, first_packs: fp };
        if (pDef && pDef.flag === 'noAds') nextB.no_ads = 1;
        if (pDef && pDef.flag === 'seasonPass') nextB.season_pass = 1;
        if (pDef && pDef.flag === 'pass30') nextB.pass_30_until = Math.max(now, b.pass_30_until || 0) + 30 * 86400;
        tx.set(bRef, nextB, { merge: true });
        tx.update(db.collection('tm_users').doc(uid), { vip_lv: newLv });
        tx.update(ordRef, { status: 'paid', jade_granted: totalJade, paid_at: now });
        const att = { jade: totalJade, ...(pDef && pDef.extra ? pDef.extra : {}) };
        return { uid, ord, totalJade, vipGain, att, now };
      }).catch(e => ({ err: e.message }));
      if (res && res.err) { toast(`⚠ ${res.err}`); return; }
      await db.collection('tm_mails').add({
        to_user_id: res.uid, from_name: 'GM Thanh Toán', title: `Duyệt Đơn ${orderCode}`,
        body: `Đơn nạp ${res.ord.pack_name} đã được duyệt! Nhận ngay phần thưởng đính kèm:`,
        attachments: res.att, claimed: false, created_at: res.now
      });
      await fbLogAudit('approve_order', orderCode, `+${res.totalJade} Ngọc, +${res.vipGain} VIP EXP`);
      toast(`✅ Đã duyệt đơn ${orderCode}: +${fmtN(res.totalJade)} Ngọc!`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'approve_order', orderCode });
      toast(r.ok ? `✅ Đã duyệt đơn ${orderCode}!` : (r.error || 'Lỗi'));
    }
    loadAllData();
  }

  async function adminRejectOrder(orderCode) {
    const reason = 'Thông tin giao dịch chưa khớp hoặc hết hạn.';
    if (backendMode === 'firebase') {
      const ordRef = db.collection('tm_orders').doc(orderCode);
      const oDoc = await ordRef.get();
      if (!oDoc.exists || oDoc.data().status !== 'pending') { toast('Chỉ hủy được đơn chờ duyệt!'); return; }
      await ordRef.update({ status: 'rejected' });
      await db.collection('tm_mails').add({
        to_user_id: oDoc.data().user_id, from_name: 'GM Thanh Toán', title: `Đơn ${orderCode} Bị Từ Chối`,
        body: `Đơn ${oDoc.data().pack_name} chưa được duyệt. Lý do: ${reason}`, attachments: {}, claimed: false, created_at: Date.now() / 1000
      });
      await fbLogAudit('reject_order', orderCode, reason);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'reject_order', orderCode, reason });
      if (!r || !r.ok) { toast((r && r.error) || 'Lỗi hủy đơn'); return; }
    }
    toast(`❌ Đã hủy đơn ${orderCode}`);
    loadAllData();
  }

  async function adminCreateGiftcode() {
    const code = document.getElementById('gm-gc-code').value.trim().toUpperCase();
    if (!code) { toast('Nhập mã Giftcode!'); return; }
    const title = document.getElementById('gm-gc-title').value.trim() || `Quà ${code}`;
    const maxUses = parseInt(document.getElementById('gm-gc-max').value || '500', 10);
    const rewards = readResourceGrid('gm-gc');
    if (backendMode === 'firebase') {
      await db.collection('tm_giftcodes').doc(code).set({ title, rewards, max_uses: maxUses, used_count: 0, created_at: Date.now() / 1000 });
      await fbLogAudit('create_giftcode', code, JSON.stringify(rewards));
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'create_giftcode', code, title, rewards, maxUses });
    }
    toast(`🎫 Đã phát hành Giftcode ${code}!`);
    loadAllData();
  }

  async function adminDeleteGiftcode(code) {
    if (backendMode === 'firebase') {
      await db.collection('tm_giftcodes').doc(code).delete();
      await fbLogAudit('delete_giftcode', code, 'Xóa Giftcode');
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'delete_giftcode', code });
    }
    toast(`Đã xóa mã ${code}`);
    loadAllData();
  }

  async function adminBroadcastChat() {
    const bcEl = document.getElementById('gm-bc-txt');
    const text = bcEl ? bcEl.value.trim() : '';
    if (!text) return;
    if (bcEl) bcEl.value = '';
    if (backendMode === 'firebase') {
      await db.collection('tm_chat').add({
        channel: 'world', user_id: null, sender_name: 'Thiên Đạo Thông Báo', sect_name: 'GM',
        realm_name: 'Hệ Thống', text: `📢 ${text}`, created_at: Date.now() / 1000
      });
      await fbLogAudit('broadcast', 'Thế Giới', text);
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'broadcast', text });
    }
    toast('📢 Đã phát thông báo toàn server!');
    loadAllData();
  }

  async function adminSpawnBoss(name, lv) {
    const nlv = Math.max(1, lv || 1);
    const nmax = Math.round(2500000 * (1 + (nlv - 1) * 0.45));
    if (backendMode === 'firebase') {
      await db.collection('tm_meta').doc('world_boss').set({ name, lv: nlv, hp: nmax, maxHp: nmax, dmg_board: {} });
      await fbLogAudit('spawn_boss', `${name} Lv.${nlv}`, `HP ${nmax}`);
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'spawn_boss', name, lv: nlv });
    }
    toast(`🐉 Đã triệu hồi ${name} Lv.${nlv} đầy máu!`);
    loadAllData();
  }

  async function adminDeleteGuild(gid) {
    if (backendMode === 'firebase') {
      await db.collection('tm_guilds').doc(String(gid)).delete();
      await fbLogAudit('delete_guild', gid, 'Giải tán liên minh');
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'delete_guild', guildId: gid });
    }
    toast('🏛 Đã giải tán Liên Minh!');
    loadAllData();
  }

  async function adminClearChat() {
    if (backendMode === 'firebase') {
      const snap = await db.collection('tm_chat').limit(40).get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await fbLogAudit('clear_chat', 'world', `Xóa ${snap.size} tin`);
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'clear_chat', channel: 'world' });
    }
    toast('🧹 Đã dọn sạch Chat Thế Giới!');
    loadAllData();
  }

  async function adminDeleteDoc(col, docId) {
    if (backendMode === 'firebase') {
      await db.collection(col).doc(String(docId)).delete();
      await fbLogAudit('delete_item', col, docId);
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'delete_item', col, id: docId });
    }
    toast('🗑 Đã dọn!');
    loadAllData();
  }

  async function showAdminApp(uname) {
    currentUser = uname;
    document.getElementById('gm-login-view').classList.add('hidden');
    document.getElementById('gm-app-view').classList.remove('hidden');
    document.getElementById('gm-admin-who').textContent = `GM: ${uname}`;
    await loadAllData();
  }

  async function bootstrap() {
    await detectMode();
    document.getElementById('gm-modal-bg').onclick = (e) => { if (e.target.id === 'gm-modal-bg') closeModal(); };
    document.querySelectorAll('.gm-tab').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.getAttribute('data-gtab');
        document.querySelectorAll('.gm-tab').forEach(x => x.classList.toggle('active', x === btn));
        renderPanel();
      };
    });
    document.getElementById('btn-gm-refresh').onclick = loadAllData;
    document.getElementById('btn-gm-logout').onclick = async () => {
      if (backendMode === 'firebase') await auth.signOut();
      else { localStorage.removeItem('thai_hu_online_token'); pyToken = ''; }
      location.reload();
    };
    document.getElementById('btn-gm-login').onclick = async () => {
      const uname = document.getElementById('gm-user').value.trim().toLowerCase();
      const pass = document.getElementById('gm-pass').value;
      const errEl = document.getElementById('gm-login-err');
      errEl.classList.add('hidden');
      if (!isAdminName(uname)) {
        errEl.textContent = `Tài khoản「${uname}」không nằm trong danh sách GM Admin!`;
        errEl.classList.remove('hidden');
        return;
      }
      if (backendMode === 'firebase') {
        try {
          await auth.signInWithEmailAndPassword(`${uname}@tienmon.local`, pass);
          await showAdminApp(uname);
        } catch (e) {
          errEl.textContent = e.message || 'Sai tài khoản hoặc mật khẩu Firebase!';
          errEl.classList.remove('hidden');
        }
      } else {
        const r = await pyApi('/api/auth/login', 'POST', { username: uname, password: pass });
        if (!r || !r.ok) {
          errEl.textContent = (r && r.error) || 'Sai tài khoản hoặc mật khẩu!';
          errEl.classList.remove('hidden');
          return;
        }
        pyToken = r.token;
        localStorage.setItem('thai_hu_online_token', pyToken);
        await showAdminApp(uname);
      }
    };

    if (backendMode === 'firebase') {
      auth.onAuthStateChanged(async fbUser => {
        if (fbUser && fbUser.email) {
          const uname = fbUser.email.split('@')[0];
          if (isAdminName(uname)) { await showAdminApp(uname); return; }
        }
        document.getElementById('gm-login-view').classList.remove('hidden');
      });
    } else if (pyToken) {
      const me = await pyApi('/api/auth/me', 'GET');
      if (me && me.ok && me.user && isAdminName(me.user.username)) {
        await showAdminApp(me.user.username);
        return;
      }
      localStorage.removeItem('thai_hu_online_token');
      pyToken = '';
      document.getElementById('gm-login-view').classList.remove('hidden');
    } else {
      document.getElementById('gm-login-view').classList.remove('hidden');
    }
  }
  bootstrap();
})();
