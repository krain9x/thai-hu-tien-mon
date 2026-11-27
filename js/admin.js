// ==================== THÁI HƯ TIÊN MÔN — GM ADMIN DASHBOARD (DUAL FIREBASE + PYTHON SERVER) ====================
(() => {
  const VIP_THRESHOLDS = [0, 200, 600, 1500, 3000, 6000, 10000, 18000, 30000, 50000, 80000];
  function calcVip(exp) {
    let lv = 0;
    for (let i = 1; i < VIP_THRESHOLDS.length; i++) if (exp >= VIP_THRESHOLDS[i]) lv = i;
    return lv;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtN(n) { return Math.floor(n || 0).toLocaleString('vi-VN'); }
  function toast(msg) {
    const box = document.getElementById('gm-toast-box');
    box.textContent = msg;
    box.classList.remove('hidden');
    clearTimeout(box._t);
    box._t = setTimeout(() => box.classList.add('hidden'), 3200);
  }

  let backendMode = 'firebase';
  let fbApp = null, auth = null, db = null;
  let pyToken = localStorage.getItem('thai_hu_online_token') || '';
  let currentUser = null;
  let activeTab = 'players';
  let cache = { users: [], guilds: [], orders: [], codes: [], boss: null, rooms: [], chat: [] };
  let searchQ = '';
  let includeBots = false;

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
    const headers = { 'Content-Type': 'application/json' };
    if (pyToken) headers['Authorization'] = `Bearer ${pyToken}`;
    const opts = { method, headers };
    if (body !== null) opts.body = JSON.stringify(body);
    const r = await fetch(path, opts);
    return await r.json().catch(() => ({ ok: false, error: 'Lỗi server' }));
  }

  async function loadAllData() {
    if (backendMode === 'firebase') {
      const [uS, gS, oS, cS, bD, rS, chS] = await Promise.all([
        db.collection('tm_users').orderBy('power', 'desc').limit(120).get(),
        db.collection('tm_guilds').get(),
        db.collection('tm_orders').limit(80).get(),
        db.collection('tm_giftcodes').get(),
        db.collection('tm_meta').doc('world_boss').get(),
        db.collection('tm_coop_rooms').limit(30).get(),
        db.collection('tm_chat').orderBy('created_at', 'desc').limit(30).get()
      ]);
      cache.users = uS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.guilds = gS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.orders = oS.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      cache.codes = cS.docs.map(d => ({ code: d.id, ...d.data() }));
      cache.boss = bD.exists ? bD.data() : null;
      cache.rooms = rS.docs.map(d => ({ id: d.id, ...d.data() }));
      cache.chat = chS.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const r = await pyApi('/api/admin/overview', 'GET');
      if (!r || !r.ok) { toast((r && r.error) || 'Không tải được dữ liệu Admin'); return; }
      cache = {
        users: r.users || [], guilds: r.guilds || [], orders: r.orders || [],
        codes: r.codes || [], boss: r.boss || null, rooms: r.rooms || [], chat: r.chat || []
      };
    }
    renderStats();
    renderPanel();
  }

  function renderStats() {
    const realUsers = cache.users.filter(u => !u.is_bot);
    const now = Date.now() / 1000;
    const activeRecent = realUsers.filter(u => now - (u.last_seen || 0) < 300).length;
    const pendingOrd = cache.orders.filter(o => o.status === 'pending').length;
    const boss = cache.boss || { name: '?', lv: 1, hp: 0, maxHp: 1 };
    document.getElementById('gm-stats-row').innerHTML = `
      <div class="gm-stat"><div class="k">Người Chơi Thật</div><div class="v">${realUsers.length} <span style="font-size:12px;color:var(--sub);">(${activeRecent} online)</span></div></div>
      <div class="gm-stat"><div class="k">Liên Minh / Bang Hội</div><div class="v">${cache.guilds.length}</div></div>
      <div class="gm-stat"><div class="k">Đơn Nạp Chờ Duyệt</div><div class="v" style="color:${pendingOrd ? 'var(--gold)' : 'var(--jade)'};">${pendingOrd}</div></div>
      <div class="gm-stat"><div class="k">World Boss · Lv.${boss.lv}</div><div class="v" style="font-size:15px;color:#ff8a95;">${esc(boss.name)}<br><span style="font-size:12px;">${fmtN(boss.hp)} / ${fmtN(boss.maxHp)}</span></div></div>
    `;
  }

  function renderPanel() {
    const body = document.getElementById('gm-panel-body');
    if (activeTab === 'players') {
      const q = searchQ.toLowerCase();
      const filtered = cache.users.filter(u => (includeBots || !u.is_bot) && (!q || String(u.username).toLowerCase().includes(q) || String(u.sect_name).toLowerCase().includes(q)));
      body.innerHTML = `
        <div class="gm-box-grid" style="margin-bottom:14px;">
          <div class="gm-subcard">
            <div style="font-weight:900;color:var(--gold);margin-bottom:8px;">🎁 Bơm Quà / Phát Thư Nhanh</div>
            <div class="gm-row">
              <select id="gm-gift-target" class="gm-sel" style="flex:1;">
                <option value="__ALL__">🌐 Toàn Bộ Người Chơi Thật (${cache.users.filter(u => !u.is_bot).length})</option>
                ${cache.users.filter(u => !u.is_bot).map(u => `<option value="${esc(u.id)}">${esc(u.username)} · ${esc(u.sect_name)}</option>`).join('')}
              </select>
            </div>
            <div class="gm-row">
              <input id="gm-g-jade" class="gm-inp" type="number" style="width:105px;" value="500" title="Tiên Ngọc" placeholder="Ngọc" />
              <input id="gm-g-coin" class="gm-inp" type="number" style="width:115px;" value="10000" title="Linh Thạch" placeholder="Linh Thạch" />
              <input id="gm-g-herb" class="gm-inp" type="number" style="width:95px;" value="20" title="Linh Thảo" placeholder="Thảo" />
              <input id="gm-g-core" class="gm-inp" type="number" style="width:95px;" value="20" title="Yêu Đan" placeholder="Yêu Đan" />
              <input id="gm-g-ess" class="gm-inp" type="number" style="width:95px;" value="20" title="Tinh Thạch" placeholder="Tinh Thạch" />
            </div>
            <div class="gm-row">
              <input id="gm-g-title" class="gm-inp" style="flex:1;" value="Quà Hỗ Trợ Từ GM Thái Hư" />
              <button id="btn-gm-send-gift" class="gm-btn jade">📤 Phát Thư Quà</button>
            </div>
          </div>

          <div class="gm-subcard">
            <div style="font-weight:900;color:var(--gold);margin-bottom:8px;">👑 Cấp VIP EXP Trực Tiếp</div>
            <div class="gm-row">
              <select id="gm-vip-target" class="gm-sel" style="flex:1;">
                ${cache.users.filter(u => !u.is_bot).map(u => `<option value="${esc(u.id)}">${esc(u.username)} (Hiện tại: VIP ${u.vip_lv || 0})</option>`).join('')}
              </select>
            </div>
            <div class="gm-row">
              <input id="gm-vip-exp" class="gm-inp" type="number" style="width:130px;" value="1500" />
              <button id="btn-gm-grant-vip" class="gm-btn gold">⚡ Cộng VIP EXP</button>
            </div>
            <div style="font-size:11.5px;color:var(--sub);">Mốc VIP: V1=200 · V2=600 · V3=1500 · V5=6000 · V7=18000 · V10=80000</div>
          </div>
        </div>

        <div class="gm-row">
          <input id="gm-search-u" class="gm-inp" style="flex:1;min-width:190px;" value="${esc(searchQ)}" placeholder="🔍 Tìm tên Đạo Hiệu hoặc Tông Môn..." />
          <label style="font-size:12.5px;display:flex;align-items:center;gap:5px;cursor:pointer;">
            <input id="gm-chk-bots" type="checkbox" ${includeBots ? 'checked' : ''} /> Hiện cả Bot NPC
          </label>
        </div>

        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Đạo Hiệu</th><th>Tông Môn</th><th>Chiến Lực</th><th>Ải / ELO</th><th>VIP</th><th>Bang Hội</th><th>Thao Tác</th></tr></thead>
            <tbody id="gm-players-tbody"></tbody>
          </table>
        </div>
      `;
      const renderPlayerRows = () => {
        const q = searchQ.toLowerCase();
        const filtered = cache.users.filter(u => (includeBots || !u.is_bot) && (!q || String(u.username).toLowerCase().includes(q) || String(u.sect_name).toLowerCase().includes(q)));
        const tbody = document.getElementById('gm-players-tbody');
        if (!tbody) return;
        tbody.innerHTML = filtered.map(u => `
          <tr>
            <td><b>${esc(u.username)}</b> ${u.is_bot ? '<span class="gm-badge" style="color:#ffd257;">BOT</span>' : ''} ${u.banned ? '<span class="gm-badge" style="color:var(--red);">BANNED</span>' : ''}</td>
            <td>${esc(u.sect_name)}</td>
            <td><b>${fmtN(u.power)}</b></td>
            <td>Ải ${u.max_stage || 1} · ${u.arena_score || 1000}</td>
            <td>VIP ${u.vip_lv || 0}</td>
            <td>${u.guild_tag ? `[${esc(u.guild_tag)}] ${esc(u.guild_name)}` : '-'}</td>
            <td>
              ${!u.is_bot ? `<button class="gm-btn" style="padding:5px 9px;font-size:11.5px;" data-pick-gift="${esc(u.id)}">🎁 Chọn Bơm</button>
              <button class="gm-btn ${u.banned ? 'jade' : 'red'}" style="padding:5px 9px;font-size:11.5px;" data-toggle-ban="${esc(u.id)}">${u.banned ? 'Mở Khóa' : 'Khóa'}</button>` : '-'}
            </td>
          </tr>
        `).join('');
        tbody.querySelectorAll('[data-pick-gift]').forEach(b => {
          b.onclick = () => {
            document.getElementById('gm-gift-target').value = b.getAttribute('data-pick-gift');
            document.getElementById('gm-vip-target').value = b.getAttribute('data-pick-gift');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          };
        });
        tbody.querySelectorAll('[data-toggle-ban]').forEach(b => {
          b.onclick = () => adminToggleBan(b.getAttribute('data-toggle-ban'));
        });
      };
      renderPlayerRows();
      document.getElementById('gm-search-u').oninput = (e) => { searchQ = e.target.value; renderPlayerRows(); };
      document.getElementById('gm-chk-bots').onchange = (e) => { includeBots = e.target.checked; renderPlayerRows(); };
      document.getElementById('btn-gm-send-gift').onclick = async () => {
        const target = document.getElementById('gm-gift-target').value;
        const att = {};
        for (const [elId, key] of [['gm-g-jade','jade'],['gm-g-coin','coin'],['gm-g-herb','herb'],['gm-g-core','core'],['gm-g-ess','essence']]) {
          const v = parseInt(document.getElementById(elId).value || '0', 10);
          if (v > 0) att[key] = v;
        }
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
      body.innerHTML = `
        <div style="font-weight:900;color:var(--gold);margin-bottom:10px;">💳 Danh Sách Đơn Nạp Thẻ / VietQR / MoMo (${cache.orders.length})</div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Mã Đơn</th><th>Người Chơi ID</th><th>Gói Nạp</th><th>Số Tiền</th><th>Kênh</th><th>Trạng Thái</th><th>Thao Tác</th></tr></thead>
            <tbody>
              ${cache.orders.map(o => {
                const u = cache.users.find(x => String(x.id) === String(o.user_id));
                const uName = u ? u.username : o.user_id;
                return `<tr>
                  <td><b>${esc(o.order_code || o.orderCode)}</b></td>
                  <td>${esc(uName)}</td>
                  <td>${esc(o.pack_name)}</td>
                  <td><b>${fmtN(o.amount_vnd)}₫</b></td>
                  <td>${esc((o.method || '').toUpperCase())} ${o.card_info ? `(${esc(o.card_info)})` : ''}</td>
                  <td><span class="gm-badge" style="color:${o.status === 'paid' ? 'var(--jade)' : 'var(--gold)'};">${o.status === 'paid' ? 'Đã Duyệt' : 'Chờ Duyệt'}</span></td>
                  <td>
                    ${o.status === 'pending' ? `<button class="gm-btn jade" style="padding:5px 9px;font-size:11.5px;" data-approve-ord="${esc(o.order_code || o.orderCode)}">✅ Duyệt &amp; Cộng Ngọc</button>` : '✓'}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      body.querySelectorAll('[data-approve-ord]').forEach(b => {
        b.onclick = () => adminApproveOrder(b.getAttribute('data-approve-ord'));
      });
    } else if (activeTab === 'codes') {
      body.innerHTML = `
        <div class="gm-box-grid">
          <div class="gm-subcard">
            <div style="font-weight:900;color:var(--gold);margin-bottom:8px;">🎫 Tạo Mã Giftcode Mới</div>
            <div class="gm-row">
              <input id="gm-gc-code" class="gm-inp" style="flex:1;text-transform:uppercase;" placeholder="MÃ CODE (vd: TET2026)" />
              <input id="gm-gc-max" class="gm-inp" type="number" style="width:110px;" value="500" title="Số lượt tối đa" />
            </div>
            <input id="gm-gc-title" class="gm-inp" style="width:100%;margin-bottom:8px;" placeholder="Mô tả quà (vd: Quà Sự Kiện Cuối Tuần)" />
            <div class="gm-row">
              <input id="gm-gc-jade" class="gm-inp" type="number" style="width:100px;" value="500" title="Ngọc" />
              <input id="gm-gc-coin" class="gm-inp" type="number" style="width:110px;" value="15000" title="Linh Thạch" />
              <input id="gm-gc-herb" class="gm-inp" type="number" style="width:90px;" value="25" title="Thảo" />
              <input id="gm-gc-core" class="gm-inp" type="number" style="width:90px;" value="25" title="Yêu Đan" />
            </div>
            <button id="btn-gm-mkcode" class="gm-btn jade" style="width:100%;">✨ Phát Hành Giftcode</button>
          </div>
          <div class="gm-subcard">
            <div style="font-weight:900;color:var(--gold);margin-bottom:8px;">📢 Thông Báo Toàn Máy Chủ (Chat Thế Giới)</div>
            <textarea id="gm-bc-txt" class="gm-inp" rows="4" style="width:100%;margin-bottom:8px;" placeholder="Nhập nội dung Thiên Đạo Thông Báo gửi tới mọi người..."></textarea>
            <button id="btn-gm-bc" class="gm-btn gold" style="width:100%;">📣 Phát Thông Báo Ngay</button>
          </div>
        </div>
        <div style="font-weight:900;margin:12px 0 8px;">📜 Giftcode Tạo Thêm (${cache.codes.length}) + Mặc định (THAIHU2026, TANTHU, TIENMONVIP)</div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Mã</th><th>Tên Quà</th><th>Phần Thưởng</th><th>Đã Dùng</th><th>Xóa</th></tr></thead>
            <tbody>
              ${cache.codes.map(c => `<tr>
                <td><b style="color:var(--gold);">${esc(c.code)}</b></td>
                <td>${esc(c.title)}</td>
                <td><code>${esc(JSON.stringify(c.rewards || c.rewards_json || {}))}</code></td>
                <td>${c.used_count || 0} / ${c.max_uses || 99999}</td>
                <td><button class="gm-btn red" style="padding:4px 8px;font-size:11px;" data-del-gc="${esc(c.code)}">Xóa</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('btn-gm-mkcode').onclick = adminCreateGiftcode;
      document.getElementById('btn-gm-bc').onclick = adminBroadcastChat;
      body.querySelectorAll('[data-del-gc]').forEach(b => {
        b.onclick = () => adminDeleteGiftcode(b.getAttribute('data-del-gc'));
      });
    } else if (activeTab === 'world') {
      const boss = cache.boss || { name: '?', lv: 1, hp: 0, maxHp: 1 };
      body.innerHTML = `
        <div class="gm-box-grid" style="margin-bottom:12px;">
          <div class="gm-subcard">
            <div style="font-weight:900;color:#ff8a95;margin-bottom:6px;">🐉 Điều Khiển Boss Thế Giới</div>
            <div style="font-size:13px;margin-bottom:8px;">Boss: <b>${esc(boss.name)}</b> (Lv.${boss.lv}) · HP: <b>${fmtN(boss.hp)} / ${fmtN(boss.maxHp)}</b></div>
            <button id="btn-gm-respawn-boss" class="gm-btn gold">🔄 Hồi Đầy Máu / Chuyển Boss Mới</button>
          </div>
          <div class="gm-subcard">
            <div style="font-weight:900;color:var(--jade);margin-bottom:6px;">🌀 Phòng Co-op Đang Mở (${cache.rooms.length})</div>
            ${cache.rooms.length ? cache.rooms.map(r => `<div class="gm-row" style="justify-content:space-between;">
              <span style="font-size:12.5px;">${esc(r.name)} (${(r.members || []).length}/4 · ${esc(r.status)})</span>
              <button class="gm-btn red" style="padding:4px 8px;font-size:11px;" data-del-room="${esc(r.id)}">Dọn</button>
            </div>`).join('') : `<div style="font-size:12.5px;color:var(--sub);">Không có phòng Co-op tồn đọng.</div>`}
          </div>
        </div>
        <div style="font-weight:900;margin-bottom:8px;">💬 Kiểm Duyệt Chat Gần Đây (${cache.chat.length})</div>
        <div class="gm-tbl-wrap">
          <table>
            <thead><tr><th>Kênh</th><th>Người Gửi</th><th>Nội Dung</th><th>Xóa</th></tr></thead>
            <tbody>
              ${cache.chat.map(m => `<tr>
                <td>${esc(m.channel)}</td>
                <td><b>${esc(m.sender_name)}</b></td>
                <td>${esc(m.text)}</td>
                <td><button class="gm-btn red" style="padding:4px 8px;font-size:11px;" data-del-chat="${esc(m.id)}">Xóa</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('btn-gm-respawn-boss').onclick = adminResetBoss;
      body.querySelectorAll('[data-del-room]').forEach(b => { b.onclick = () => adminDeleteDoc('tm_coop_rooms', b.getAttribute('data-del-room')); });
      body.querySelectorAll('[data-del-chat]').forEach(b => { b.onclick = () => adminDeleteDoc('tm_chat', b.getAttribute('data-del-chat')); });
    }
  }

  async function adminGrantMail(targetUid, title, attachments) {
    if (!Object.keys(attachments).length) { toast('Nhập ít nhất 1 phần quà!'); return; }
    if (backendMode === 'firebase') {
      const targets = targetUid === '__ALL__' ? cache.users.filter(u => !u.is_bot).map(u => u.id) : [targetUid];
      const now = Date.now() / 1000;
      const batch = db.batch();
      targets.forEach(tid => {
        batch.set(db.collection('tm_mails').doc(), {
          to_user_id: tid, from_name: 'GM Thái Hư Tiên Môn', title, body: 'Quà hỗ trợ trực tiếp từ Quản Trị Viên.',
          attachments, claimed: false, created_at: now
        });
      });
      await batch.commit();
      toast(`🎁 Đã gửi thư quà tới ${targets.length} người chơi!`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'grant_mail', targetId: targetUid, title, attachments });
      toast(r.ok ? '🎁 Đã phát thư quà!' : (r.error || 'Lỗi'));
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
      toast(!u.banned ? `🚫 Đã khóa ${u.username}` : `✅ Đã mở khóa ${u.username}`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'toggle_ban', targetId: uid });
      if (!r || !r.ok) { toast((r && r.error) || 'Lỗi khóa tài khoản'); return; }
      toast(r.banned ? `🚫 Đã khóa ${u.username}` : `✅ Đã mở khóa ${u.username}`);
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
        const nextB = {
          ...b,
          total_vnd: (b.total_vnd || 0) + (ord.amount_vnd || 0),
          vip_exp: newExp,
          vip_lv: newLv,
          firstPacks: fp,
          first_packs: fp
        };
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
      toast(`✅ Đã duyệt đơn ${orderCode}: gửi +${fmtN(res.totalJade)} Ngọc & +${res.vipGain} VIP EXP!`);
    } else {
      const r = await pyApi('/api/admin/action', 'POST', { kind: 'approve_order', orderCode });
      toast(r.ok ? `✅ Đã duyệt đơn ${orderCode}!` : (r.error || 'Lỗi'));
    }
    loadAllData();
  }

  async function adminCreateGiftcode() {
    const code = document.getElementById('gm-gc-code').value.trim().toUpperCase();
    if (!code) { toast('Nhập mã Giftcode!'); return; }
    const title = document.getElementById('gm-gc-title').value.trim() || `Quà ${code}`;
    const maxUses = parseInt(document.getElementById('gm-gc-max').value || '500', 10);
    const rewards = {};
    for (const [id, k] of [['gm-gc-jade','jade'],['gm-gc-coin','coin'],['gm-gc-herb','herb'],['gm-gc-core','core']]) {
      const v = parseInt(document.getElementById(id).value || '0', 10);
      if (v > 0) rewards[k] = v;
    }
    if (backendMode === 'firebase') {
      await db.collection('tm_giftcodes').doc(code).set({ title, rewards, max_uses: maxUses, used_count: 0, created_at: Date.now() / 1000 });
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'create_giftcode', code, title, rewards, maxUses });
    }
    toast(`🎫 Đã phát hành Giftcode ${code}!`);
    loadAllData();
  }

  async function adminDeleteGiftcode(code) {
    if (backendMode === 'firebase') await db.collection('tm_giftcodes').doc(code).delete();
    else await pyApi('/api/admin/action', 'POST', { kind: 'delete_giftcode', code });
    toast(`Đã xóa mã ${code}`);
    loadAllData();
  }

  async function adminBroadcastChat() {
    const text = document.getElementById('gm-bc-txt').value.trim();
    if (!text) return;
    if (backendMode === 'firebase') {
      await db.collection('tm_chat').add({
        channel: 'world', user_id: null, sender_name: 'Thiên Đạo Thông Báo', sect_name: 'GM',
        realm_name: 'Hệ Thống', text: `📢 ${text}`, created_at: Date.now() / 1000
      });
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'broadcast', text });
    }
    document.getElementById('gm-bc-txt').value = '';
    toast('📢 Đã phát thông báo toàn server!');
    loadAllData();
  }

  async function adminResetBoss() {
    if (backendMode === 'firebase') {
      const cur = cache.boss || { lv: 0 };
      const nlv = (cur.lv || 1) + 1;
      const nmax = Math.round(2500000 * (1 + (nlv - 1) * 0.45));
      const pool = ['Thái Cổ Huyết Lôi Ma Đế', 'Cửu U Ma Long Vương', 'Huyền Minh Thiên Ma Tôn', 'Hỗn Độn Yêu Hoàng'];
      await db.collection('tm_meta').doc('world_boss').set({ name: pool[(nlv - 1) % pool.length], lv: nlv, hp: nmax, maxHp: nmax, dmg_board: {} });
    } else {
      await pyApi('/api/admin/action', 'POST', { kind: 'reset_boss' });
    }
    toast('🐉 Đã triệu hồi Boss Thế Giới mới đầy máu!');
    loadAllData();
  }

  async function adminDeleteDoc(col, docId) {
    if (backendMode === 'firebase') {
      await db.collection(col).doc(String(docId)).delete();
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

    // Check existing session
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
      document.getElementById('gm-login-view').classList.remove('hidden');
    } else {
      document.getElementById('gm-login-view').classList.remove('hidden');
    }
  }
  bootstrap();
})();
