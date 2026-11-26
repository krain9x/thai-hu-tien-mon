// ==================== THÁI HƯ TIÊN MÔN — ONLINE HUB UI, LIVE CHAT, AUTH & REAL-TIME PK ====================
(() => {
  const ITEM_LABELS = {
    herb: 'Linh Thảo',
    core: 'Yêu Đan',
    pill: 'Đan Dược Đột Phá',
    scroll: 'Ngọc Giản Tiên Pháp',
    essence: 'Tinh Thạch Luyện Khí',
    gem_kim: 'Kim Sát Linh Châu Lv.1',
    gem_moc: 'Mộc Sinh Linh Châu Lv.1',
    gem_thuy: 'Thủy Linh Bảo Châu Lv.1',
    gem_hoa: 'Hỏa Viêm Linh Châu Lv.1',
    gem_tho: 'Thổ Hộ Linh Châu Lv.1'
  };

  function getMarketStock(st, key) {
    if (key.startsWith('gem_')) {
      const gid = key.slice(4);
      return (st.gems && st.gems[gid] && st.gems[gid][0]) || 0;
    }
    return st[key] || 0;
  }

  function addMarketStock(st, key, delta) {
    if (key.startsWith('gem_')) {
      const gid = key.slice(4);
      if (!st.gems) st.gems = {};
      if (!st.gems[gid]) st.gems[gid] = [0, 0, 0, 0, 0];
      st.gems[gid][0] = Math.max(0, (st.gems[gid][0] || 0) + delta);
      return;
    }
    st[key] = Math.max(0, (st[key] || 0) + delta);
  }

  let online = null;
  let chatChannel = 'world';
  let chatCollapsed = false;
  let lbSort = 'power';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtN(n) {
    n = Math.floor(n || 0);
    if (n >= 1e8) return (n / 1e8).toFixed(2) + ' Ức';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + ' Vạn';
    return n.toLocaleString('vi-VN');
  }

  function parseId(v) {
    const s = String(v == null ? '' : v);
    return /^\d+$/.test(s) ? parseInt(s, 10) : s;
  }

  function getApp() {
    return window.murimApp || null;
  }

  function updateOnlineHudChrome() {
    if (!online) return;
    const pill = document.getElementById('hud-online-pill');
    const txt = document.getElementById('hud-online-txt');
    const mailBadge = document.getElementById('hud-mail-badge');
    const fdBar = document.getElementById('fd-online-status');
    const authBtn = document.getElementById('btn-open-auth-fd');

    if (txt) {
      if (online.isLoggedIn()) {
        txt.innerHTML = `<span class="on-dot ${online.connected ? 'live' : ''}"></span> ${esc(online.user.username)} · <b>${online.onlineCount}</b> Online`;
      } else {
        txt.innerHTML = `<span class="on-dot"></span> Đăng Nhập Online`;
      }
    }
    if (pill) pill.classList.toggle('logged-in', online.isLoggedIn());
    if (mailBadge) {
      const n = online.unreadMails || 0;
      mailBadge.textContent = n > 99 ? '99+' : String(n);
      mailBadge.classList.toggle('hidden', n <= 0);
    }
    if (fdBar) {
      fdBar.innerHTML = online.isLoggedIn()
        ? `🟢 Đã đăng nhập Online: <b>${esc(online.user.username)}</b> (${esc(online.user.sect_name)}) · Đang đồng bộ Cloud Save`
        : `🌐 Chế độ Khách (Offline) — Đăng nhập để mở BXH, Chat Thế Giới, PK 1v1, Bang Hội & Đấu Giá!`;
    }
    if (authBtn) {
      authBtn.textContent = online.isLoggedIn() ? `👤 ${online.user.username} (Đổi Tài Khoản)` : '🌐 Đăng Nhập / Đăng Ký Tài Khoản Online';
    }
    const chatWrap = document.getElementById('live-chat-dock');
    if (chatWrap) {
      const app = getApp();
      const inGame = app && app.engine && app.engine.state && app.engine.state.prologueDone;
      chatWrap.classList.toggle('hidden', !inGame);
    }
  }

  function renderLiveChatMessages() {
    const listEl = document.getElementById('live-chat-msgs');
    if (!listEl || !online) return;
    const msgs = online.chatHistory[chatChannel] || [];
    if (!msgs.length) {
      listEl.innerHTML = `<div class="lc-empty">${chatChannel === 'guild' ? 'Chưa có tin nhắn Minh Hội.' : 'Chào mừng tới Kênh Thế Giới Thái Hư Tiên Môn!'}</div>`;
      return;
    }
    listEl.innerHTML = msgs.slice(-30).map(m => {
      const isSys = !m.user_id;
      const vipBadge = (!isSys && m.vip_lv > 0) ? `<span class="lc-vip">VIP${m.vip_lv}</span>` : '';
      const wingBadge = (!isSys && m.wing_tag) ? `<span class="lc-wing">${esc(m.wing_tag)}</span>` : '';
      return `<div class="lc-line ${isSys ? 'sys' : ''}">
        <span class="lc-realm">[${esc(m.realm_name || 'Tu Sĩ')}]</span>
        ${vipBadge}${wingBadge}<b class="lc-who">${esc(m.sender_name)}</b>: ${esc(m.text)}
      </div>`;
    }).join('');
    listEl.scrollTop = listEl.scrollHeight;
  }

  // ==================== AUTH MODAL (LOGIN / REGISTER) ====================
  function openAuthModal(defaultMode = 'login') {
    const modal = document.getElementById('online-auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    let mode = defaultMode;

    const renderAuth = () => {
      const isReg = mode === 'register';
      modal.innerHTML = `
        <div class="auth-card">
          <div class="auth-head">
            <span>🌐 THÁI HƯ TIÊN MÔN · MÁY CHỦ ONLINE</span>
            <button class="btn-close-panel" id="btn-auth-close" style="width:30px;height:30px;font-size:15px;">✕</button>
          </div>
          <div class="auth-tabs">
            <button class="panel-tab ${!isReg ? 'active' : ''}" id="auth-tab-login">Đăng Nhập</button>
            <button class="panel-tab ${isReg ? 'active' : ''}" id="auth-tab-reg">Đăng Ký Mới</button>
          </div>
          <div class="auth-body">
            <label>Tên Đạo Hiệu (3–20 ký tự không dấu)</label>
            <input id="auth-user" type="text" maxlength="20" placeholder="vd: lamphong99" autocomplete="username" />
            <label>Mật Khẩu (tối thiểu 6 ký tự)</label>
            <input id="auth-pass" type="password" maxlength="40" placeholder="••••••" autocomplete="current-password" />
            ${isReg ? `
              <label>Tên Tông Môn Của Bạn</label>
              <input id="auth-sect" type="text" maxlength="28" value="Thái Hư Tiên Môn" />
            ` : ''}
            <div id="auth-err" class="auth-err hidden"></div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button class="btn-wuxia jade" id="btn-auth-submit" style="flex:1;">${isReg ? '✨ Khai Lập Tài Khoản Online' : '⚔ Đăng Nhập Máy Chủ'}</button>
              ${online.isLoggedIn() ? `<button class="btn-wuxia crimson" id="btn-auth-logout">Đăng Xuất</button>` : ''}
            </div>
            <div style="font-size:11.5px;color:#555;margin-top:8px;line-height:1.45;">
              ${isReg ? '🎁 Đăng ký mới nhận ngay <b>+300 Tiên Ngọc, +20 Linh Thảo, +12 Yêu Đan, +3 Đan Đột Phá</b> trong Hộp Thư và tự động lưu tiến độ hiện tại lên Cloud!' : '☁ Đăng nhập sẽ tự động tải Cloud Save nhân vật của bạn từ máy chủ SQLite.'}
            </div>
          </div>
        </div>
      `;
      document.getElementById('btn-auth-close').onclick = () => modal.classList.add('hidden');
      document.getElementById('auth-tab-login').onclick = () => { mode = 'login'; renderAuth(); };
      document.getElementById('auth-tab-reg').onclick = () => { mode = 'register'; renderAuth(); };
      const bOut = document.getElementById('btn-auth-logout');
      if (bOut) bOut.onclick = () => {
        online.logout();
        updateOnlineHudChrome();
        modal.classList.add('hidden');
        const app = getApp();
        if (app) app.engine.toast('Đã đăng xuất tài khoản Online!');
      };
      document.getElementById('btn-auth-submit').onclick = async () => {
        const u = document.getElementById('auth-user').value.trim();
        const p = document.getElementById('auth-pass').value.trim();
        const errEl = document.getElementById('auth-err');
        const btn = document.getElementById('btn-auth-submit');
        btn.disabled = true;
        errEl.classList.add('hidden');
        const app = getApp();
        let res;
        if (isReg) {
          const sect = document.getElementById('auth-sect').value.trim() || 'Thái Hư Tiên Môn';
          const curState = (app && app.engine && app.engine.state) ? app.engine.state : null;
          res = await online.register(u, p, sect, curState);
        } else {
          res = await online.login(u, p);
        }
        btn.disabled = false;
        if (!res || !res.ok) {
          errEl.textContent = (res && res.error) || 'Không thể kết nối máy chủ Online!';
          errEl.classList.remove('hidden');
          return;
        }
        if (app && app.engine) {
          if (res.state && typeof res.state === 'object' && Object.keys(res.state).length > 5) {
            app.engine.state = Object.assign(app.engine.createDefaultState(), res.state);
            app.engine.saveState();
            app.engine.setupCombat(app.engine.state.prologueDone ? 'field' : 'prologue');
          } else {
            await online.syncState(app.engine);
          }
          app.engine.toast(isReg
            ? `🌟 Khai lập thành công「${online.user.username}」! Mở Hộp Thư Online để nhận Quà Tân Thủ +300 Ngọc!`
            : `☁ Chào mừng Đạo Hữu「${online.user.username}」trở lại Tiên Giới Online!`);
        }
        updateOnlineHudChrome();
        renderLiveChatMessages();
        modal.classList.add('hidden');
      };
    };
    renderAuth();
  }

  // ==================== PLAYER INSPECT MODAL (SOI ĐỒ 6 Ô + TIÊN DỰC) ====================
  window.openInspectPlayerModal = async function openInspectPlayerModal(uid) {
    const modal = document.getElementById('inspect-player-modal');
    if (!modal || !online) return;
    modal.classList.remove('hidden');
    modal.innerHTML = `<div class="insp-card" style="text-align:center;padding:30px;">⏳ Đang thám tra nguyên thần và trang bị của Đạo Hữu...</div>`;
    const res = await online.api(`/api/player/${uid}/inspect`, 'GET');
    if (!res || !res.ok || !res.player) {
      modal.innerHTML = `<div class="insp-card"><b>Không thể soi thông tin Đạo Hữu này!</b> <button class="btn-wuxia" onclick="document.getElementById('inspect-player-modal').classList.add('hidden')">Đóng</button></div>`;
      return;
    }
    const p = res.player;
    const snap = p.snapshot || {};
    const gd = snap.gearDetail || {};
    const allGear = window.XIANXIA_EQUIPMENT_DEF || [];
    const gems = window.GEMS_DEF || [];
    const cosDef = window.COSMETICS_DEF || { wings: [], auras: [] };
    const cos = p.cosmetics || {};
    const wObj = (cosDef.wings || []).find(w => w.id === cos.wing);
    const aObj = (cosDef.auras || []).find(a => a.id === cos.aura);
    const slots = window.GEAR_SLOTS_DEF || [
      { id: 'weapon', name: 'Vũ Khí 3D' }, { id: 'helm', name: 'Đạo Quán' }, { id: 'armor', name: 'Đạo Bào' },
      { id: 'jade', name: 'Ngọc Bội' }, { id: 'ring', name: 'Linh Giới' }, { id: 'boots', name: 'Thần Ngoa' }
    ];
    const isMe = online.isLoggedIn() && online.user && online.user.id === p.id;
    modal.innerHTML = `
      <div class="insp-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1.5px solid #d9c9a8;padding-bottom:10px;">
          <div>
            <div style="font-size:19px;font-weight:900;color:#123136;">
              <span class="on-dot ${p.online ? 'live' : ''}"></span> ${esc(p.username)}
              ${p.vipLv > 0 ? `<span class="plz-vip">VIP${p.vipLv}</span>` : ''}
              ${p.guild ? `<span class="tag-pill gold">[${esc(p.guild.tag)}] ${esc(p.guild.name)}</span>` : ''}
            </div>
            <div style="font-size:12.5px;color:#555;margin-top:3px;">
              Tông Môn: <b>${esc(p.sectName)}</b> · Cảnh Giới: <b style="color:#1b7a53;">${esc(p.realmName)}</b> · Ải <b>${p.maxStage}</b> · Tháp <b>T.${p.towerFloor}</b> · ELO <b>${p.arenaScore}</b>
            </div>
            <div style="font-size:12px;margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;">
              <span class="tag-pill jade">⚡ Chiến Lực: ${fmtN(p.power)}</span>
              <span class="tag-pill">⚔ Công: ${fmtN(snap.atk || 0)}</span>
              <span class="tag-pill">❤ Máu: ${fmtN(snap.maxHp || 0)}</span>
              <span class="tag-pill" style="color:${(wObj && wObj.col) || '#555'};">🕊 ${wObj ? wObj.name : 'Không Dực'}</span>
              <span class="tag-pill" style="color:${(aObj && aObj.col) || '#555'};">🌀 ${aObj ? aObj.name : 'Không Hào Quang'}</span>
            </div>
          </div>
          <button class="btn-close-panel" id="btn-insp-close" style="width:32px;height:32px;font-size:15px;">✕</button>
        </div>
        <div style="font-weight:900;font-size:14px;margin-top:10px;color:#7a4b00;">🛡 Bộ Trang Bị 6 Ô &amp; Linh Châu Đang Mặc</div>
        <div class="insp-gear-grid">
          ${slots.map(sl => {
            const gInfo = gd[sl.id];
            const def = gInfo ? allGear.find(g => g.id === gInfo.id) : null;
            if (!def) {
              return `<div class="insp-gear-item" style="opacity:0.65;">
                <div style="font-size:11px;color:#777;font-weight:800;">${sl.name}</div>
                <div style="font-size:12.5px;color:#999;">Trống</div>
              </div>`;
            }
            const sockTxt = (gInfo.sockets || []).filter(Boolean).map(s => {
              const gm = gems.find(x => x.id === s.id);
              return `<span class="tag-pill" style="font-size:10px;">${gm ? gm.name.split(' ')[0] : s.id} Lv.${s.lv}</span>`;
            }).join(' ');
            const subTxt = (gInfo.subs || []).length ? `${gInfo.subs.length} dòng phụ` : '';
            return `<div class="insp-gear-item" style="border-color:${def.gradeCol};">
              <div style="font-size:10.5px;color:#777;font-weight:800;">${sl.name} · <span style="color:${def.gradeCol};">${def.grade}</span></div>
              <div style="font-size:13px;font-weight:900;color:#222;">${esc(def.name)} <span class="tag-pill gold">+${gInfo.lv || 1}</span></div>
              <div style="font-size:11px;color:#555;margin-top:3px;">${sockTxt} ${subTxt}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
          ${!isMe && online.isLoggedIn() && p.online ? `<button class="btn-wuxia crimson" id="btn-insp-pk">⚔ Gửi Chiến Thư PK 1v1</button>` : ''}
          ${!isMe && online.isLoggedIn() ? `<button class="btn-wuxia jade" id="btn-insp-fr">➕ Kết Giao Đạo Hữu</button>` : ''}
          <button class="btn-wuxia" id="btn-insp-ok">Đóng</button>
        </div>
      </div>
    `;
    document.getElementById('btn-insp-close').onclick = () => modal.classList.add('hidden');
    document.getElementById('btn-insp-ok').onclick = () => modal.classList.add('hidden');
    const bPk = document.getElementById('btn-insp-pk');
    if (bPk) bPk.onclick = () => { online.sendPkInvite(p.id); modal.classList.add('hidden'); };
    const bFr = document.getElementById('btn-insp-fr');
    if (bFr) bFr.onclick = async () => {
      const r = await online.api('/api/friends/add', 'POST', { username: p.username });
      const app = getApp();
      if (app && app.engine) app.engine.toast((r && (r.msg || r.error)) || 'Đã gửi lời mời!');
    };
  };

  // ==================== 8-TAB ONLINE HUB MODAL ====================
  window.renderOnlineHubPanel = function renderOnlineHubPanel(body, activeTab, setModalHeader, closePanel, updateHud) {
    const app = getApp();
    const engine = app && app.engine;
    const renderer = app && app.renderer;
    const audio = app && app.audio;
    setModalHeader('🌐 Tiên Giới Trực Tuyến', [
      '🏆 Bảng Xếp Hạng',
      '⚔ PK Trực Tuyến',
      '🐉 Boss Thế Giới',
      '🌀 Tổ Đội Co-op',
      '🏛 Tiên Giới Minh',
      '⛰ Linh Mạch Bang',
      '🛍 Tiên Thị Đấu Giá',
      '💌 Đạo Hữu & Thư'
    ]);

    if (!online) return;
    body.className = 'panel-body single-col';

    if (!online.isLoggedIn() && activeTab >= 3) {
      body.innerHTML = `<div style="text-align:center;padding:38px 20px;background:var(--hanji-card);border-radius:14px;">
        <div style="font-size:19px;font-weight:900;margin-bottom:8px;">🌐 Cần Tài Khoản Online Để Sử Dụng Tính Năng Này</div>
        <p style="font-size:13.5px;color:#555;margin-bottom:14px;">Đăng ký miễn phí trong 3 giây (tự giữ nguyên tiến độ hiện tại + tặng 300 Tiên Ngọc trong Hộp Thư) để tham gia Tiên Giới Minh, Tiên Thị Đấu Giá, Kết Bạn & PK 1v1 Trực Tuyến!</p>
        <button class="btn-wuxia jade" id="btn-need-auth-open">✨ Đăng Nhập / Đăng Ký Ngay</button>
      </div>`;
      document.getElementById('btn-need-auth-open').onclick = () => openAuthModal('register');
      return;
    }

    body.innerHTML = `<div style="padding:30px;text-align:center;color:#555;font-weight:700;">⏳ Đang đồng bộ dữ liệu máy chủ Thái Hư Tiên Giới...</div>`;

    if (activeTab === 0) {
      // TAB 0: LEADERBOARD
      online.api(`/api/leaderboard?sort=${lbSort}`, 'GET').then(res => {
        if (!res || !res.ok) { body.innerHTML = `<div style="padding:20px;color:#b83227;">Không tải được Bảng Xếp Hạng!</div>`; return; }
        const list = res.list || [];
        const sorts = [
          ['power', '⚔ Chiến Lực'],
          ['stage', '🗺 Ải Cao Nhất'],
          ['arena', '🏅 Luận Kiếm ELO'],
          ['tower', '🗼 Thông Thiên Tháp']
        ];
        body.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:var(--hanji-card);padding:10px 14px;border-radius:12px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${sorts.map(([k, lbl]) => `<button class="btn-wuxia ${lbSort === k ? 'jade' : ''}" style="padding:5px 11px;font-size:12px;" data-lb-sort="${k}">${lbl}</button>`).join('')}
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag-pill jade">🟢 ${res.onlineCount || 1} Đạo Hữu Online</span>
              ${online.isLoggedIn() ? `<button class="btn-wuxia" id="btn-lb-sync" style="padding:5px 10px;font-size:12px;">☁ Cập Nhật Hạng</button>` : `<button class="btn-wuxia jade" id="btn-lb-login" style="padding:5px 10px;font-size:12px;">Đăng Nhập</button>`}
            </div>
          </div>
          ${list.map(u => {
            const isMe = online.isLoggedIn() && online.user.id === u.id;
            const medal = u.rank === 1 ? '🥇' : (u.rank === 2 ? '🥈' : (u.rank === 3 ? '🥉' : `#${u.rank}`));
            return `<div class="item-row-card ${isMe ? 'selected' : ''}" style="padding:9px 14px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="font-size:17px;font-weight:900;min-width:34px;text-align:center;color:${u.rank <= 3 ? '#c48612' : '#555'};">${medal}</div>
                <div>
                  <div class="item-row-title" style="font-size:14px;">
                    <span class="on-dot ${u.online ? 'live' : ''}"></span>
                    ${esc(u.username)} ${u.guildTag ? `<span class="tag-pill gold" style="font-size:10px;">[${esc(u.guildTag)}]</span>` : ''}
                    <span style="font-weight:600;color:#555;font-size:12px;">· ${esc(u.sectName)}</span>
                    ${isMe ? '<span class="tag-pill jade" style="font-size:10px;">Bạn</span>' : ''}
                  </div>
                  <div class="item-row-sub">
                    Cảnh giới: <b>${esc(u.realmName)}</b> · Chiến lực: <b>${fmtN(u.power)}</b> · Ải <b>${u.maxStage}</b> · ELO <b>${u.arenaScore}</b> · Tháp <b>T.${u.towerFloor}</b>
                  </div>
                </div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn-wuxia" style="padding:5px 9px;font-size:11.5px;" data-inspect-u="${u.id}">👁 Soi Đồ</button>
                ${!isMe && online.isLoggedIn() && u.online ? `<button class="btn-wuxia crimson" style="padding:5px 10px;font-size:11.5px;" data-pk-rt="${u.id}">⚔ PK 1v1</button>` : ''}
                ${!isMe && online.isLoggedIn() ? `<button class="btn-wuxia" style="padding:5px 9px;font-size:11.5px;" data-add-fr="${esc(u.username)}">➕ Kết Giao</button>` : ''}
              </div>
            </div>`;
          }).join('')}
        `;
        body.querySelectorAll('[data-inspect-u]').forEach(b => {
          b.onclick = () => window.openInspectPlayerModal(parseId(b.getAttribute('data-inspect-u')));
        });
        body.querySelectorAll('[data-lb-sort]').forEach(b => {
          b.onclick = () => { lbSort = b.getAttribute('data-lb-sort'); window.renderOnlineHubPanel(body, 0, setModalHeader, closePanel, updateHud); };
        });
        const bSync = document.getElementById('btn-lb-sync');
        if (bSync) bSync.onclick = async () => {
          await online.syncState(engine);
          engine.toast('☁ Đã đồng bộ Chiến Lực lên Bảng Xếp Hạng!');
          window.renderOnlineHubPanel(body, 0, setModalHeader, closePanel, updateHud);
        };
        const bLog = document.getElementById('btn-lb-login');
        if (bLog) bLog.onclick = () => openAuthModal('login');
        body.querySelectorAll('[data-pk-rt]').forEach(b => {
          b.onclick = () => online.sendPkInvite(parseId(b.getAttribute('data-pk-rt')));
        });
        body.querySelectorAll('[data-add-fr]').forEach(b => {
          b.onclick = async () => {
            const r = await online.api('/api/friends/add', 'POST', { username: b.getAttribute('data-add-fr') });
            engine.toast((r && (r.msg || r.error)) || 'Lỗi gửi kết giao');
          };
        });
      });
    } else if (activeTab === 1) {
      // TAB 1: REAL-TIME 1v1 PK + ASYNC REAL-PLAYER ARENA + PK LOGS
      online.api('/api/pvp/targets', 'GET').then(res => {
        if (!res || !res.ok) return;
        const onList = res.online || [];
        const targets = res.targets || [];
        const logs = res.logs || [];
        body.className = 'panel-body';
        body.innerHTML = `
          <div class="panel-col-scroll">
            <div style="font-weight:900;font-size:15px;color:#b83227;">⚡ Đạo Hữu Đang Trực Tuyến — PK 1v1 Real-Time (${onList.length})</div>
            ${onList.length ? onList.map(u => `
              <div class="item-row-card selected" style="padding:9px 12px;">
                <div>
                  <div class="item-row-title"><span class="on-dot live"></span> ${esc(u.username)} · ${esc(u.sectName)}</div>
                  <div class="item-row-sub">${esc(u.realmName)} · Chiến lực <b>${fmtN(u.power)}</b> · ELO <b>${u.arenaScore}</b></div>
                </div>
                <button class="btn-wuxia crimson" data-pk-invite="${u.id}" ${!online.isLoggedIn() ? 'disabled' : ''}>⚔ Gửi Chiến Thư 1v1</button>
              </div>
            `).join('') : `<div style="padding:12px;background:var(--hanji-card);border-radius:10px;font-size:12.5px;color:#555;">Hiện chưa có Đạo Hữu khác online trong phòng — mở thêm tab trình duyệt đăng ký tài khoản thứ 2 hoặc rủ bạn qua LAN <code>http://&lt;IP&gt;:8089</code> để đấu 1v1 Real-Time ngay!</div>`}

            <div style="font-weight:900;font-size:15px;margin-top:10px;">⚔ Luận Kiếm Với Đội Hình Thực (Async PvP)</div>
            ${targets.slice(0, 10).map(u => `
              <div class="item-row-card" style="padding:8px 12px;">
                <div>
                  <div class="item-row-title">${esc(u.username)} <span class="tag-pill jade" style="font-size:10px;">${esc(u.realmName)}</span></div>
                  <div class="item-row-sub">${esc(u.sectName)} · Chiến lực <b>${fmtN(u.power)}</b> · ELO <b>${u.arenaScore}</b></div>
                </div>
                <button class="btn-wuxia" data-pk-async="${u.id}">⚔ Luận Kiếm</button>
              </div>
            `).join('')}
          </div>
          <div class="panel-col-scroll">
            <div style="font-weight:900;font-size:15px;">📜 Chiến Báo Luận Kiếm Toàn Máy Chủ</div>
            ${logs.length ? logs.map(l => `
              <div class="item-row-card" style="padding:8px 10px;font-size:12.5px;">
                <div>
                  <b>${esc(l.challenger_name)}</b> vs <b>${esc(l.defender_name)}</b>
                  <span class="tag-pill ${l.mode === 'realtime' ? 'gold' : 'jade'}" style="font-size:10px;">${l.mode === 'realtime' ? '1v1 Real-Time' : 'Async'}</span>
                  <div style="color:#555;font-size:11.5px;margin-top:2px;">Thắng: <b style="color:var(--jade-dark);">${l.winner_id === l.challenger_id ? esc(l.challenger_name) : esc(l.defender_name)}</b> (+${l.score_delta} ELO)</div>
                </div>
              </div>
            `).join('') : `<div style="padding:16px;color:#666;font-size:12.5px;">Chưa có trận PK nào được ghi nhận trên máy chủ.</div>`}
          </div>
        `;
        body.querySelectorAll('[data-pk-invite]').forEach(b => {
          b.onclick = () => online.sendPkInvite(parseId(b.getAttribute('data-pk-invite')));
        });
        body.querySelectorAll('[data-pk-async]').forEach(b => {
          b.onclick = () => {
            const tid = parseId(b.getAttribute('data-pk-async'));
            const t = targets.find(x => x.id === tid);
            if (!t) return;
            closePanel();
            if (renderer && renderer.mode === 'town' && engine.onGotoFieldRequest) engine.onGotoFieldRequest();
            engine.setupCombat('arena', false, {
              defenderId: t.id,
              foeName: `${t.username} (${t.sectName})`,
              foeSnap: t.snapshot,
              foeMul: Math.max(0.75, Math.min(2.2, (t.power || 500) / Math.max(200, engine.getSectPower()))),
              sec: 60
            });
          };
        });
      });
    } else if (activeTab === 2) {
      // TAB 2: SHARED REAL-TIME SERVER WORLD BOSS
      online.api('/api/worldboss', 'GET').then(res => {
        if (!res || !res.ok) return;
        const wb = res.boss;
        online.worldBoss = wb;
        const pct = Math.max(0, Math.min(100, (wb.hp / Math.max(1, wb.maxHp)) * 100));
        body.innerHTML = `
          <div style="background:linear-gradient(135deg,#1d1216,#35181e);color:#fff8e8;padding:18px;border-radius:14px;border:2px solid #d4a647;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <div style="font-size:21px;font-weight:900;color:#ffd866;">🐉 ${esc(wb.name)} · Cấp ${wb.lv}</div>
                <div style="font-size:12.5px;color:#e6d5c3;margin-top:3px;">
                  Thanh máu dùng chung toàn máy chủ theo thời gian thực! Hạ gục phát thưởng Top 1 (+250 Ngọc), Top 3 (+160 Ngọc), Tham chiến (+90 Ngọc) qua Hộp Thư!
                </div>
              </div>
              <button class="btn-wuxia crimson" id="btn-enter-wb" style="padding:11px 20px;font-size:14px;" ${wb.hp <= 0 ? 'disabled' : ''}>
                ${wb.hp <= 0 ? `⏳ Hồi sinh sau ${wb.respawnIn}s` : '⚔ Xuất Chiến Công Kích!'}
              </button>
            </div>
            <div style="margin-top:12px;background:rgba(0,0,0,0.45);height:22px;border-radius:11px;overflow:hidden;border:1px solid #d4a647;position:relative;">
              <div id="wb-modal-hp-fill" style="width:${pct.toFixed(2)}%;height:100%;background:linear-gradient(90deg,#c92a2a,#ff6b35);transition:width 0.3s;"></div>
              <div id="wb-modal-hp-txt" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;text-shadow:0 1px 3px #000;">
                ${fmtN(wb.hp)} / ${fmtN(wb.maxHp)} HP (${pct.toFixed(1)}%)
              </div>
            </div>
          </div>
          <div style="font-weight:900;font-size:15px;margin-top:8px;">🔥 Bảng Sát Thương Boss Thế Giới (Đợt Hiện Tại)</div>
          ${(wb.topDamage && wb.topDamage.length) ? wb.topDamage.map((e, i) => `
            <div class="item-row-card" style="padding:8px 12px;">
              <div><b>#${i + 1} ${esc(e.username)}</b> <span style="color:#555;font-size:12px;">(${esc(e.sectName)})</span></div>
              <b style="color:#b83227;">${fmtN(e.dmg)} Sát Thương</b>
            </div>
          `).join('') : `<div style="padding:18px;text-align:center;color:#666;">Chưa có đạo hữu nào khai chiến đợt này — hãy là người mở màn!</div>`}
        `;
        const bWb = document.getElementById('btn-enter-wb');
        if (bWb) bWb.onclick = () => {
          if (!online.isLoggedIn()) { openAuthModal('register'); return; }
          closePanel();
          if (renderer && renderer.mode === 'town' && engine.onGotoFieldRequest) engine.onGotoFieldRequest();
          engine.setupCombat('worldBoss', false, { bossInfo: wb, sec: 60, title: `Boss Thế Giới · ${wb.name}` });
        };
      });
    } else if (activeTab === 3) {
      // TAB 3: CO-OP PARTY DUNGEON (2–4P REAL-TIME BOSS)
      online.api('/api/coop/rooms', 'GET').then(res => {
        const rooms = (res && res.rooms) || online.coopRooms || [];
        const curRoom = online.currentCoopRoom;
        const myId = online.user ? online.user.id : 0;
        if (curRoom) {
          const isHost = curRoom.hostId === myId;
          body.className = 'panel-body single-col';
          body.innerHTML = `
            <div style="background:linear-gradient(135deg,#12242c,#1c3b47);color:#f0fffb;padding:16px;border-radius:14px;border:2px solid #48f0c8;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                  <div style="font-size:18px;font-weight:900;color:#64fff0;">🌀 ${esc(curRoom.name)} (${curRoom.members.length}/4 Đạo Hữu)</div>
                  <div style="font-size:12.5px;color:#cdebe6;margin-top:3px;">${esc(curRoom.tierName)} · Boss: <b>${esc(curRoom.bossName)}</b> (${fmtN(curRoom.bossMaxHp)} HP)</div>
                  <div style="font-size:12px;color:#ffd866;margin-top:3px;">🎁 Thưởng hạ Boss: +${curRoom.reward.jade} Tiên Ngọc · +${curRoom.reward.essence} Tinh Thạch · +${curRoom.reward.gemQty} Linh Châu Bậc ${curRoom.reward.gemLv}</div>
                </div>
                <div style="display:flex;gap:8px;">
                  ${isHost ? `<button class="btn-wuxia gold" id="btn-coop-start">⚔ Xuất Phát Phó Bản!</button>` : `<span class="tag-pill jade">⏳ Đang chờ Chủ Phòng xuất phát...</span>`}
                  <button class="btn-wuxia crimson" id="btn-coop-leave">Rời Phòng</button>
                </div>
              </div>
            </div>
            <div style="font-weight:900;font-size:14.5px;margin-top:10px;">👥 Thành Viên Trong Tổ Đội</div>
            ${curRoom.members.map(m => `
              <div class="item-row-card selected" style="padding:9px 12px;">
                <div>
                  <div class="item-row-title">${esc(m.username)} ${m.id === curRoom.hostId ? '<span class="tag-pill gold">Đội Trưởng</span>' : ''}</div>
                  <div class="item-row-sub">${esc(m.sectName)} · Chiến lực <b>${fmtN(m.power)}</b></div>
                </div>
                <button class="btn-wuxia" style="padding:4px 9px;font-size:11px;" data-inspect-u="${m.id}">👁 Soi Đồ</button>
              </div>
            `).join('')}
          `;
          body.querySelectorAll('[data-inspect-u]').forEach(b => { b.onclick = () => window.openInspectPlayerModal(parseId(b.getAttribute('data-inspect-u'))); });
          const bStart = document.getElementById('btn-coop-start');
          if (bStart) bStart.onclick = () => online.startCoopRoom(curRoom.id);
          document.getElementById('btn-coop-leave').onclick = () => {
            online.leaveCoopRoom(curRoom.id);
            online.currentCoopRoom = null;
            window.renderOnlineHubPanel(body, 3, setModalHeader, closePanel, updateHud);
          };
          return;
        }
        body.className = 'panel-body';
        body.innerHTML = `
          <div class="panel-col-scroll">
            <div style="font-weight:900;font-size:15px;">🌀 Danh Sách Tổ Đội Co-op Đang Mở (${rooms.length})</div>
            ${rooms.length ? rooms.map(r => `
              <div class="item-row-card">
                <div>
                  <div class="item-row-title">${esc(r.name)} <span class="tag-pill jade">${r.members.length}/4</span></div>
                  <div class="item-row-sub">${esc(r.tierName)} · Boss ${esc(r.bossName)}</div>
                </div>
                <button class="btn-wuxia jade" data-coop-join="${esc(r.id)}" ${r.status !== 'waiting' || r.members.length >= 4 ? 'disabled' : ''}>${r.status === 'waiting' ? 'Vào Đội' : 'Đang Đánh'}</button>
              </div>
            `).join('') : `<div style="padding:18px;background:var(--hanji-card);border-radius:10px;color:#555;">Chưa có phòng Co-op nào — hãy lập Tổ Đội mới bên phải và rủ Đạo Hữu trên Kênh Thế Giới!</div>`}
          </div>
          <div class="panel-detail-box">
            <div>
              <div style="font-size:16.5px;font-weight:900;margin-bottom:8px;">✨ Lập Tổ Đội Đánh Boss 2–4 Người</div>
              <label style="font-size:12px;font-weight:800;">Tên Tổ Đội</label>
              <input id="coop-room-name" class="on-input" maxlength="28" value="Săn Ngọc Bậc 2-3 Cùng Hội" />
              <label style="font-size:12px;font-weight:800;">Độ Khó &amp; Phần Thưởng</label>
              <select id="coop-room-tier" class="on-input">
                <option value="1">Bậc 1 · U Lam Yêu Vương (+90 Ngọc · +2 Ngọc Lv.2)</option>
                <option value="2">Bậc 2 · Viêm Ma Đế Tôn (+160 Ngọc · +3 Ngọc Lv.2)</option>
                <option value="3">Bậc 3 · Thái Cổ Hỗn Độn (+280 Ngọc · +2 Ngọc Lv.3)</option>
              </select>
            </div>
            <button class="btn-wuxia gold" id="btn-coop-create">🌀 Tạo Phòng Tổ Đội Ngay</button>
          </div>
        `;
        document.getElementById('btn-coop-create').onclick = () => {
          const tier = parseInt(document.getElementById('coop-room-tier').value, 10) || 1;
          const nm = document.getElementById('coop-room-name').value.trim();
          online.createCoopRoom(tier, nm);
        };
        body.querySelectorAll('[data-coop-join]').forEach(b => {
          b.onclick = () => online.joinCoopRoom(b.getAttribute('data-coop-join'));
        });
      });
    } else if (activeTab === 4) {
      // TAB 4: MULTIPLAYER GUILDS
      online.api('/api/guilds', 'GET').then(res => {
        if (!res || !res.ok) return;
        const mg = res.myGuild;
        const guilds = res.guilds || [];
        online.myGuild = mg;
        if (!mg) {
          body.className = 'panel-body';
          body.innerHTML = `
            <div class="panel-col-scroll">
              <div style="font-weight:900;font-size:15px;">🏛 Danh Sách Tiên Giới Minh (${guilds.length})</div>
              ${guilds.map(g => `
                <div class="item-row-card">
                  <div>
                    <div class="item-row-title">[${esc(g.tag)}] ${esc(g.name)} <span class="tag-pill jade">${g.member_count}/30</span></div>
                    <div class="item-row-sub">Minh Chủ: <b>${esc(g.leader_name || '?')}</b> · Điểm Tuần: <b>${fmtN(g.week_score)}</b> · Boss Lv.${g.boss_lv}</div>
                  </div>
                  <button class="btn-wuxia jade" data-join-g="${g.id}">Gia Nhập</button>
                </div>
              `).join('')}
            </div>
            <div class="panel-detail-box">
              <div>
                <div style="font-size:17px;font-weight:900;margin-bottom:8px;">✨ Sáng Lập Tiên Giới Minh Mới</div>
                <label style="font-size:12px;font-weight:800;">Tên Liên Minh</label>
                <input id="cg-name" class="on-input" maxlength="26" placeholder="vd: Kiếm Tông Chí Tôn" />
                <label style="font-size:12px;font-weight:800;">Ký Hiệu Tag (2–5 ký tự)</label>
                <input id="cg-tag" class="on-input" maxlength="5" placeholder="vd: KTCT" />
                <label style="font-size:12px;font-weight:800;">Tuyên Ngôn Minh Hội</label>
                <input id="cg-notice" class="on-input" maxlength="100" value="Cùng nhau tu tiên, thảo phạt Ma Đế!" />
              </div>
              <button class="btn-wuxia crimson" id="btn-create-guild">🏛 Lập Tiên Giới Minh (Miễn Phí)</button>
            </div>
          `;
          body.querySelectorAll('[data-join-g]').forEach(b => {
            b.onclick = async () => {
              const r = await online.api('/api/guilds/join', 'POST', { guildId: parseId(b.getAttribute('data-join-g')) });
              if (r && r.ok) { engine.toast('🎉 Đã gia nhập Tiên Giới Minh!'); await online.loadInitialChat(); window.renderOnlineHubPanel(body, 4, setModalHeader, closePanel, updateHud); }
              else engine.toast((r && r.error) || 'Không thể gia nhập');
            };
          });
          document.getElementById('btn-create-guild').onclick = async () => {
            const r = await online.api('/api/guilds/create', 'POST', {
              name: document.getElementById('cg-name').value.trim(),
              tag: document.getElementById('cg-tag').value.trim(),
              notice: document.getElementById('cg-notice').value.trim()
            });
            if (r && r.ok) { engine.toast('🏛 Sáng lập Tiên Giới Minh thành công!'); await online.loadInitialChat(); window.renderOnlineHubPanel(body, 4, setModalHeader, closePanel, updateHud); }
            else engine.toast((r && r.error) || 'Lỗi tạo Liên Minh');
          };
        } else {
          const bPct = Math.max(0, Math.min(100, (mg.boss_hp / Math.max(1, mg.boss_max_hp)) * 100));
          body.className = 'panel-body';
          body.innerHTML = `
            <div class="panel-col-scroll">
              <div style="background:var(--hanji-card);padding:12px;border-radius:12px;border:1.5px solid #d4a647;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div style="font-size:17px;font-weight:900;">[${esc(mg.tag)}] ${esc(mg.name)}</div>
                  <button class="btn-wuxia" id="btn-leave-g" style="padding:4px 9px;font-size:11px;">Rời Minh</button>
                </div>
                <div style="font-size:12px;color:#555;margin:4px 0;">${esc(mg.notice)}</div>
                <div style="font-size:12.5px;margin-bottom:8px;">EXP Minh: <b>${fmtN(mg.exp)}</b> · Điểm Tuần: <b>${fmtN(mg.week_score)}</b> · Công trình: Điện Lv.${mg.bld.hall} / Võ Trường Lv.${mg.bld.yard} / Bảo Khố Lv.${mg.bld.store}</div>
                <div style="background:#261a1c;color:#fff;padding:8px 10px;border-radius:9px;margin-bottom:8px;">
                  <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;">
                    <span>👹 Ma Đầu Minh Hội Chung Lv.${mg.boss_lv}</span>
                    <span>${fmtN(mg.boss_hp)} / ${fmtN(mg.boss_max_hp)}</span>
                  </div>
                  <div style="height:8px;background:rgba(255,255,255,0.18);border-radius:4px;overflow:hidden;margin-top:4px;">
                    <div style="width:${bPct.toFixed(1)}%;height:100%;background:#e63946;"></div>
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <button class="btn-wuxia" id="btn-og-donate">💰 Quyên Góp (500 Linh Thạch)</button>
                  <button class="btn-wuxia crimson" id="btn-og-boss">⚔ Đánh Ma Đầu Chung</button>
                  <button class="btn-wuxia jade" id="btn-og-up-hall">🏛 Nâng Minh Điện</button>
                </div>
              </div>
            </div>
            <div class="panel-col-scroll">
              <div style="font-weight:900;font-size:15px;">👥 Thành Viên Minh Hội (${mg.members.length}/30)</div>
              ${mg.members.map(m => `
                <div class="item-row-card" style="padding:8px 10px;">
                  <div>
                    <div class="item-row-title" style="font-size:13px;"><span class="on-dot ${m.online ? 'live' : ''}"></span> ${esc(m.username)} <span class="tag-pill ${m.role === 'leader' ? 'gold' : 'jade'}" style="font-size:10px;">${m.role === 'leader' ? 'Minh Chủ' : 'Đệ Tử'}</span></div>
                    <div class="item-row-sub">${esc(m.sectName)} · ${esc(m.realmName)} · Chiến lực <b>${fmtN(m.power)}</b></div>
                  </div>
                  ${m.id !== online.user.id ? `<button class="btn-wuxia" style="padding:4px 8px;font-size:11px;" data-borrow-real="${esc(m.topDisciple)}">🤝 Mượn Đệ Tử</button>` : ''}
                </div>
              `).join('')}
            </div>
          `;
          document.getElementById('btn-leave-g').onclick = async () => {
            await online.api('/api/guilds/leave', 'POST', {});
            engine.toast('Đã rời Tiên Giới Minh.');
            window.renderOnlineHubPanel(body, 4, setModalHeader, closePanel, updateHud);
          };
          document.getElementById('btn-og-donate').onclick = async () => {
            if (engine.state.coin < 500) { engine.toast('Cần 500 Linh Thạch để quyên góp!'); return; }
            engine.state.coin -= 500;
            const r = await online.api('/api/guilds/action', 'POST', { kind: 'donate' });
            if (r && r.ok) { engine.state.merit += (r.merit || 25); engine.toast('💰 Quyên góp Minh Hội thành công (+25 Cống Hiến)!'); updateHud(); window.renderOnlineHubPanel(body, 4, setModalHeader, closePanel, updateHud); }
          };
          document.getElementById('btn-og-up-hall').onclick = async () => {
            const r = await online.api('/api/guilds/action', 'POST', { kind: 'upgrade_bld', bldId: 'hall' });
            if (r && r.ok) { engine.toast('🏛 Đã nâng cấp Minh Điện chung!'); window.renderOnlineHubPanel(body, 4, setModalHeader, closePanel, updateHud); }
            else engine.toast((r && r.error) || 'Chưa đủ EXP Minh Hội!');
          };
          document.getElementById('btn-og-boss').onclick = () => {
            closePanel();
            if (renderer && renderer.mode === 'town' && engine.onGotoFieldRequest) engine.onGotoFieldRequest();
            engine.setupCombat('guildBoss', false, { stage: engine.state.maxStage, sec: 60, bossName: `Ma Đầu Minh Lv.${mg.boss_lv}` });
          };
          body.querySelectorAll('[data-borrow-real]').forEach(b => {
            b.onclick = () => { if (engine.borrowGuildDisciple(b.getAttribute('data-borrow-real'))) updateHud(); };
          });
        }
      });
    } else if (activeTab === 5) {
      // TAB 5: GUILD WAR SPIRIT VEINS (TRANH ĐOẠT LINH MẠCH BANG HỘI)
      online.api('/api/guildwar', 'GET').then(res => {
        if (!res || !res.ok) return;
        const veins = res.veins || [];
        const myGid = res.myGuildId;
        const claimed = res.claimedToday || {};
        body.className = 'panel-body single-col';
        body.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:var(--hanji-card);padding:12px 14px;border-radius:12px;border:1.5px solid #2b8a6b;">
            <div>
              <div style="font-size:16.5px;font-weight:900;color:#123136;">⛰ Tranh Đoạt Linh Mạch Bang Hội</div>
              <div style="font-size:12px;color:#555;">Toàn thành viên Liên Minh đang chiếm mạch được nhận Bổng Lộc Tiên Ngọc &amp; Tinh Thạch mỗi ngày!</div>
            </div>
            <button class="btn-wuxia gold" id="btn-gw-claim" ${myGid ? '' : 'disabled'}>🎁 Thu Hoạch Bổng Lộc Hằng Ngày</button>
          </div>
          ${veins.map(v => {
            const pct = Math.max(0, Math.min(100, (v.hp / Math.max(1, v.max_hp)) * 100));
            const isMine = !!(myGid && v.guild_id === myGid);
            return `<div class="vein-card" style="${isMine ? 'border-color:#d4a647;box-shadow:0 0 12px rgba(212,166,71,0.28);' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div>
                  <div style="font-size:15px;font-weight:900;color:#123136;">
                    ⛰ ${esc(v.name)} <span class="tag-pill gold">Bậc ${v.tier}</span>
                    ${v.guild_id ? `<span class="tag-pill ${isMine ? 'jade' : ''}">[${esc(v.guild_tag)}] ${esc(v.guild_name)}</span>` : '<span class="tag-pill">Vô Chủ</span>'}
                    ${isMine && claimed[v.id] ? '<span class="tag-pill">Đã Nhận Hôm Nay</span>' : ''}
                  </div>
                  <div style="font-size:12px;color:#444;margin-top:3px;">
                    Bổng Lộc Ngày: <b style="color:#0b6e4f;">+${v.reward_jade} Tiên Ngọc</b> &amp; <b>+${v.reward_essence} Tinh Thạch</b>
                  </div>
                </div>
                <button class="btn-wuxia ${isMine ? '' : 'crimson'}" data-gw-atk="${v.id}" ${!myGid || isMine ? 'disabled' : ''}>
                  ${isMine ? '🛡 Đang Trấn Giữ' : '⚔ Công Phá Mạch'}
                </button>
              </div>
              <div style="margin-top:8px;height:14px;background:rgba(0,0,0,0.12);border-radius:7px;overflow:hidden;position:relative;">
                <div style="width:${pct.toFixed(1)}%;height:100%;background:${isMine ? '#26a678' : '#d64545'};"></div>
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#111;">Hộ Mạch Trận: ${fmtN(v.hp)} / ${fmtN(v.max_hp)}</div>
              </div>
            </div>`;
          }).join('')}
        `;
        document.getElementById('btn-gw-claim').onclick = async () => {
          const r = await online.api('/api/guildwar/claim', 'POST', {});
          if (r && r.ok) {
            if (r.jade) engine.grantGift('jade', r.jade);
            if (r.essence) engine.grantGift('essence', r.essence);
            engine.saveState();
            updateHud();
            engine.toast(`🎁 Thu hoạch Linh Mạch (${r.veinNames.join(', ')}): +${r.jade} Ngọc, +${r.essence} Tinh Thạch!`);
            window.renderOnlineHubPanel(body, 5, setModalHeader, closePanel, updateHud);
          } else engine.toast((r && r.error) || 'Chưa thể nhận!');
        };
        body.querySelectorAll('[data-gw-atk]').forEach(b => {
          b.onclick = async () => {
            const vid = parseId(b.getAttribute('data-gw-atk'));
            const r = await online.api('/api/guildwar/attack', 'POST', { veinId: vid });
            if (r && r.ok) {
              if (audio) audio.playSfx(r.captured ? 'clear' : 'collect');
              engine.toast(r.captured ? `🚩 CHIẾM ĐOẠT THÀNH CÔNG LINH MẠCH! (+60 Cống Hiến Minh)` : `⚔ Công kích Hộ Mạch Trận -${fmtN(r.dmg)} HP! (+15 Cống Hiến)`);
              window.renderOnlineHubPanel(body, 5, setModalHeader, closePanel, updateHud);
            } else engine.toast((r && r.error) || 'Lỗi công kích!');
          };
        });
      });
    } else if (activeTab === 6) {
      // TAB 6: PLAYER AUCTION HOUSE (TIÊN THỊ ĐẤU GIÁ)
      online.api('/api/market', 'GET').then(res => {
        if (!res || !res.ok) return;
        const listings = res.listings || [];
        const st = engine.state;
        body.className = 'panel-body';
        body.innerHTML = `
          <div class="panel-col-scroll">
            <div style="font-weight:900;font-size:15px;">🛍 Sạp Giao Dịch Người Chơi (Bạn có: ${fmtN(st.jade)} Tiên Ngọc)</div>
            ${listings.map(l => {
              const mine = l.seller_id === online.user.id;
              return `<div class="item-row-card" style="padding:8px 12px;">
                <div>
                  <div class="item-row-title">${ITEM_LABELS[l.item_type] || l.item_type} ×<b>${l.qty}</b></div>
                  <div class="item-row-sub">Người bán: <b>${esc(l.seller_name)}</b> · Giá: <b style="color:var(--jade-dark);">${l.price_jade} Tiên Ngọc</b></div>
                </div>
                ${mine
                  ? `<button class="btn-wuxia" data-mkt-cancel="${l.id}">Thu Hồi</button>`
                  : `<button class="btn-wuxia jade" data-mkt-buy="${l.id}" data-mkt-price="${l.price_jade}" ${st.jade < l.price_jade ? 'disabled' : ''}>Mua (${l.price_jade} Ngọc)</button>`}
              </div>`;
            }).join('')}
          </div>
          <div class="panel-detail-box">
            <div>
              <div style="font-size:16.5px;font-weight:900;margin-bottom:8px;">📦 Ký Gửi Vật Phẩm Lên Tiên Thị</div>
              <div style="font-size:12px;color:#555;margin-bottom:8px;">
                Kho: Thảo <b>${st.herb || 0}</b> · Đan Yêu <b>${st.core || 0}</b> · Tinh Thạch <b>${st.essence || 0}</b> · Đan Đột Phá <b>${st.pill || 0}</b> · Ngọc Giản <b>${st.scroll || 0}</b>
              </div>
              <label style="font-size:12px;font-weight:800;">Loại Vật Phẩm / Linh Châu</label>
              <select id="mkt-type" class="on-input">
                <option value="herb">Linh Thảo</option>
                <option value="core">Yêu Đan</option>
                <option value="essence">Tinh Thạch Luyện Khí</option>
                <option value="pill">Đan Dược Đột Phá</option>
                <option value="scroll">Ngọc Giản Tiên Pháp</option>
                <option value="gem_kim">Kim Sát Linh Châu Lv.1 (Đang có: ${getMarketStock(st, 'gem_kim')})</option>
                <option value="gem_moc">Mộc Sinh Linh Châu Lv.1 (Đang có: ${getMarketStock(st, 'gem_moc')})</option>
                <option value="gem_thuy">Thủy Linh Bảo Châu Lv.1 (Đang có: ${getMarketStock(st, 'gem_thuy')})</option>
                <option value="gem_hoa">Hỏa Viêm Linh Châu Lv.1 (Đang có: ${getMarketStock(st, 'gem_hoa')})</option>
                <option value="gem_tho">Thổ Hộ Linh Châu Lv.1 (Đang có: ${getMarketStock(st, 'gem_tho')})</option>
              </select>
              <label style="font-size:12px;font-weight:800;">Số Lượng Bán</label>
              <input id="mkt-qty" class="on-input" type="number" min="1" max="500" value="10" />
              <label style="font-size:12px;font-weight:800;">Giá Bán (Tiên Ngọc)</label>
              <input id="mkt-price" class="on-input" type="number" min="5" max="9999" value="35" />
            </div>
            <button class="btn-wuxia jade" id="btn-mkt-list">📤 Đăng Bán Lên Sàn (Phí 5%)</button>
          </div>
        `;
        document.getElementById('btn-mkt-list').onclick = async () => {
          const itype = document.getElementById('mkt-type').value;
          const qty = Math.max(1, parseInt(document.getElementById('mkt-qty').value, 10) || 1);
          const price = Math.max(5, parseInt(document.getElementById('mkt-price').value, 10) || 20);
          if (getMarketStock(st, itype) < qty) { engine.toast(`Không đủ ${ITEM_LABELS[itype]} trong kho!`); return; }
          addMarketStock(st, itype, -qty);
          const r = await online.api('/api/market/list', 'POST', { itemType: itype, qty, priceJade: price });
          if (r && r.ok) { engine.saveState(); engine.toast(`📤 Đã đăng bán ${qty} ${ITEM_LABELS[itype]} giá ${price} Ngọc!`); updateHud(); window.renderOnlineHubPanel(body, 6, setModalHeader, closePanel, updateHud); }
          else { addMarketStock(st, itype, qty); engine.toast((r && r.error) || 'Lỗi đăng bán'); }
        };
        body.querySelectorAll('[data-mkt-buy]').forEach(b => {
          b.onclick = async () => {
            const lid = parseId(b.getAttribute('data-mkt-buy'));
            const price = parseInt(b.getAttribute('data-mkt-price'), 10);
            if (st.jade < price) { engine.toast('Không đủ Tiên Ngọc!'); return; }
            const r = await online.api('/api/market/buy', 'POST', { listingId: lid });
            if (r && r.ok) {
              st.jade -= r.priceJade;
              addMarketStock(st, r.itemType, r.qty);
              engine.saveState();
              if (audio) audio.playSfx('collect');
              engine.toast(`🛍 Đã mua ${r.qty} ${ITEM_LABELS[r.itemType] || r.itemType} (-${r.priceJade} Tiên Ngọc)!`);
              updateHud();
              window.renderOnlineHubPanel(body, 6, setModalHeader, closePanel, updateHud);
            } else {
              engine.toast((r && r.error) || 'Giao dịch thất bại!');
            }
          };
        });
        body.querySelectorAll('[data-mkt-cancel]').forEach(b => {
          b.onclick = async () => {
            const lid = parseId(b.getAttribute('data-mkt-cancel'));
            const r = await online.api('/api/market/cancel', 'POST', { listingId: lid });
            if (r && r.ok) {
              addMarketStock(st, r.itemType, r.qty);
              engine.saveState();
              engine.toast(`Đã thu hồi ${r.qty} ${ITEM_LABELS[r.itemType]}!`);
              updateHud();
              window.renderOnlineHubPanel(body, 6, setModalHeader, closePanel, updateHud);
            }
          };
        });
      });
    } else {
      // TAB 7: FRIENDS + MAIL + ACCOUNT CLOUD SAVE
      Promise.all([online.api('/api/friends', 'GET'), online.api('/api/mail', 'GET')]).then(([fRes, mRes]) => {
        const friends = (fRes && fRes.friends) || [];
        const reqs = (fRes && fRes.requests) || [];
        const mails = (mRes && mRes.mails) || [];
        online.unreadMails = mails.filter(m => !m.claimed).length;
        updateOnlineHudChrome();
        body.className = 'panel-body';
        body.innerHTML = `
          <div class="panel-col-scroll">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:900;font-size:15px;">✉ Hộp Thư Tiên Giới (${mails.filter(m => !m.claimed).length} chưa nhận)</span>
              <button class="btn-wuxia jade" id="btn-mail-claim-all" style="padding:5px 10px;font-size:12px;" ${mails.some(m => !m.claimed) ? '' : 'disabled'}>🎁 Nhận Tất Cả</button>
            </div>
            ${mails.length ? mails.map(m => {
              const attStr = Object.entries(m.attachments || {}).map(([k, v]) => `+${v} ${ITEM_LABELS[k] || (k === 'jade' ? 'Tiên Ngọc' : k)}`).join(' · ');
              return `<div class="item-row-card ${!m.claimed ? 'selected' : ''}" style="padding:9px 11px;">
                <div>
                  <div class="item-row-title" style="font-size:13px;">${esc(m.title)} <span style="font-weight:500;font-size:11px;color:#666;">· ${esc(m.fromName)}</span></div>
                  <div class="item-row-sub">${esc(m.body)}</div>
                  ${attStr ? `<div style="font-size:11.5px;font-weight:800;color:var(--jade-dark);margin-top:3px;">🎁 ${attStr}</div>` : ''}
                </div>
                <button class="btn-wuxia ${!m.claimed ? 'jade' : ''}" style="padding:4px 9px;font-size:11.5px;" data-claim-mail="${m.id}" ${m.claimed ? 'disabled' : ''}>${m.claimed ? 'Đã Nhận' : 'Nhận'}</button>
              </div>`;
            }).join('') : `<div style="padding:18px;color:#666;">Hộp thư trống.</div>`}
          </div>
          <div class="panel-col-scroll">
            <div style="background:var(--hanji-card);padding:10px 12px;border-radius:11px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div>
                <div style="font-weight:900;font-size:13.5px;">👤 ${esc(online.user.username)} · ${esc(online.user.sect_name)}</div>
                <div style="font-size:11.5px;color:#555;">Cloud Save tự động lưu mỗi 16s</div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn-wuxia jade" id="btn-cloud-sync-now" style="padding:5px 9px;font-size:11.5px;">☁ Lưu Ngay</button>
                <button class="btn-wuxia" id="btn-switch-acc" style="padding:5px 9px;font-size:11.5px;">Đổi TK</button>
              </div>
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;">
              <input id="fr-add-inp" class="on-input" style="margin:0;flex:1;" placeholder="Nhập tên Đạo Hiệu kết giao..." />
              <button class="btn-wuxia jade" id="btn-fr-add-go" style="padding:6px 12px;">Kết Giao</button>
            </div>
            ${reqs.length ? `<div style="font-weight:800;font-size:12.5px;color:#b83227;">Lời Mời Kết Giao (${reqs.length})</div>` + reqs.map(r => `
              <div class="item-row-card selected" style="padding:7px 10px;">
                <div><b>${esc(r.username)}</b> · ${esc(r.sectName)} (${fmtN(r.power)})</div>
                <button class="btn-wuxia jade" data-fr-acc="${r.id}" style="padding:4px 9px;font-size:11px;">Đồng Ý</button>
              </div>
            `).join('') : ''}
            <div style="font-weight:900;font-size:14px;">🤝 Danh Sách Đạo Hữu (${friends.length})</div>
            ${friends.length ? friends.map(f => `
              <div class="item-row-card" style="padding:8px 10px;">
                <div>
                  <div class="item-row-title" style="font-size:13px;"><span class="on-dot ${f.online ? 'live' : ''}"></span> ${esc(f.username)} · ${esc(f.sectName)}</div>
                  <div class="item-row-sub">${esc(f.realmName)} · Chiến lực <b>${fmtN(f.power)}</b></div>
                </div>
                <button class="btn-wuxia ${!f.giftedToday ? 'jade' : ''}" data-fr-gift="${f.id}" style="padding:4px 9px;font-size:11px;" ${f.giftedToday ? 'disabled' : ''}>${f.giftedToday ? 'Đã Tặng' : '🎁 Tặng Ngọc'}</button>
              </div>
            `).join('') : `<div style="padding:10px;color:#666;font-size:12px;">Chưa có Đạo Hữu — bấm ➕ Kết Giao ở Bảng Xếp Hạng hoặc nhập tên ở trên!</div>`}
          </div>
        `;
        const applyRewards = (rw) => {
          for (const [k, v] of Object.entries(rw || {})) engine.grantGift(k, v);
          engine.saveState();
          if (audio) audio.playSfx('collect');
          updateHud();
        };
        const bAll = document.getElementById('btn-mail-claim-all');
        if (bAll) bAll.onclick = async () => {
          const r = await online.api('/api/mail/claim', 'POST', { mailId: 'all' });
          if (r && r.ok) { applyRewards(r.rewards); engine.toast(`🎁 Đã nhận toàn bộ ${r.claimedCount} thư!`); window.renderOnlineHubPanel(body, 7, setModalHeader, closePanel, updateHud); }
        };
        body.querySelectorAll('[data-claim-mail]').forEach(b => {
          b.onclick = async () => {
            const r = await online.api('/api/mail/claim', 'POST', { mailId: parseId(b.getAttribute('data-claim-mail')) });
            if (r && r.ok) { applyRewards(r.rewards); engine.toast('🎁 Đã nhận quà từ Hộp Thư!'); window.renderOnlineHubPanel(body, 7, setModalHeader, closePanel, updateHud); }
          };
        });
        document.getElementById('btn-cloud-sync-now').onclick = async () => {
          const ok = await online.syncState(engine);
          engine.toast(ok ? '☁ Đã lưu Cloud Save lên máy chủ!' : 'Lỗi lưu Cloud Save!');
        };
        document.getElementById('btn-switch-acc').onclick = () => openAuthModal('login');
        document.getElementById('btn-fr-add-go').onclick = async () => {
          const u = document.getElementById('fr-add-inp').value.trim();
          if (!u) return;
          const r = await online.api('/api/friends/add', 'POST', { username: u });
          engine.toast((r && (r.msg || r.error)) || 'Lỗi');
          window.renderOnlineHubPanel(body, 7, setModalHeader, closePanel, updateHud);
        };
        body.querySelectorAll('[data-fr-acc]').forEach(b => {
          b.onclick = async () => {
            await online.api('/api/friends/accept', 'POST', { friendId: parseId(b.getAttribute('data-fr-acc')) });
            engine.toast('🤝 Đã kết giao Đạo Hữu!');
            window.renderOnlineHubPanel(body, 7, setModalHeader, closePanel, updateHud);
          };
        });
        body.querySelectorAll('[data-fr-gift]').forEach(b => {
          b.onclick = async () => {
            const r = await online.api('/api/friends/gift', 'POST', { friendId: parseId(b.getAttribute('data-fr-gift')) });
            if (r && r.ok) {
              engine.state.jade += 10;
              engine.toast('🎁 Đã tặng 20 Tiên Ngọc cho Đạo Hữu (bạn nhận hồi lễ +10 Ngọc)!');
              updateHud();
              window.renderOnlineHubPanel(body, 7, setModalHeader, closePanel, updateHud);
            } else engine.toast((r && r.error) || 'Lỗi tặng quà');
          };
        });
      });
    }
  };

  // ==================== BOOTSTRAP ONLINE CLIENT & WIRE ALL LIVE EVENTS ====================
  function bootstrapOnline() {
    const app = getApp();
    if (!app || !app.engine || !window.OnlineClient) {
      setTimeout(bootstrapOnline, 150);
      return;
    }
    const engine = app.engine;
    online = new window.OnlineClient();
    window.onlineClient = online;
    app.online = online;
    engine.online = online;

    online.onToast = (m) => engine.toast(m);
    online.onAuthChange = () => updateOnlineHudChrome();
    online.onPresenceUpdate = () => updateOnlineHudChrome();
    online.onChatMessage = () => renderLiveChatMessages();

    online.onWorldBossUpdate = (wb) => {
      const f = document.getElementById('wb-modal-hp-fill');
      const t = document.getElementById('wb-modal-hp-txt');
      if (f && t) {
        const pct = Math.max(0, Math.min(100, (wb.hp / Math.max(1, wb.maxHp)) * 100));
        f.style.width = `${pct.toFixed(2)}%`;
        t.textContent = `${fmtN(wb.hp)} / ${fmtN(wb.maxHp)} HP (${pct.toFixed(1)}%)`;
      }
      if (engine.combat && engine.combat.mode === 'worldBoss') {
        const foe = engine.combat.foes.find(x => x.isWorldBoss);
        if (foe) { foe.hp = wb.hp; foe.maxHp = wb.maxHp; }
      }
    };

    // Live 1v1 Real-Time PK Invite Popup
    online.onPkInvite = (inv) => {
      const box = document.getElementById('pk-invite-banner');
      if (!box) return;
      box.classList.remove('hidden');
      box.innerHTML = `
        <div class="pk-inv-title">⚔ CHIẾN THƯ PK 1v1 TRỰC TUYẾN!</div>
        <div class="pk-inv-sub"><b>${esc(inv.from.username)}</b> (${esc(inv.from.sectName)}) · Chiến lực ${fmtN(inv.from.power)} gửi lời thách đấu!</div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="btn-wuxia crimson" id="btn-pk-accept" style="flex:1;padding:6px 12px;">⚔ Tiếp Chiến Ngay!</button>
          <button class="btn-wuxia" id="btn-pk-decline" style="padding:6px 12px;">Từ Chối</button>
        </div>
      `;
      document.getElementById('btn-pk-accept').onclick = () => { box.classList.add('hidden'); online.acceptPkInvite(inv.inviteId); };
      document.getElementById('btn-pk-decline').onclick = () => { box.classList.add('hidden'); online.declinePkInvite(inv.inviteId); };
    };

    online.onPkStart = (msg) => {
      document.getElementById('pk-invite-banner')?.classList.add('hidden');
      document.getElementById('modal-backdrop')?.classList.add('hidden');
      if (app.renderer && app.renderer.mode === 'town' && engine.onGotoFieldRequest) engine.onGotoFieldRequest();
      engine.setupCombat('pvp_rt', false, {
        roomId: msg.roomId, side: msg.side, me: msg.me, opp: msg.opp,
        sec: 90, title: `⚔ PK 1v1: ${msg.opp.username}`
      });
      engine.toast(`⚔ Bắt đầu PK 1v1 Trực Tuyến với ${msg.opp.username}!`);
    };

    online.onPkOppState = (st) => {
      const c = engine.combat;
      if (!c || c.mode !== 'pvp_rt') return;
      const opp = c.foes.find(f => f.isRemotePlayer);
      if (!opp) return;
      opp.targetX = st.x;
      opp.targetZ = st.z;
      opp.facing = st.facing;
      opp.moving = st.moving;
      if (st.animClip) { opp.animClip = st.animClip; opp.animDur = 0.45; opp.animT = 0.45; }
    };

    online.onPkHit = (ev) => {
      const c = engine.combat;
      if (!c || c.mode !== 'pvp_rt' || !online.user) return;
      const myId = String(online.user.id);
      const opp = c.foes.find(f => f.isRemotePlayer);
      if (ev.hpMap) {
        if (ev.hpMap[myId] !== undefined) c.master.hp = ev.hpMap[myId];
        for (const [k, v] of Object.entries(ev.hpMap)) {
          if (k !== myId && opp) opp.hp = v;
        }
      }
      if (String(ev.targetId) === myId && ev.dmg > 0) {
        c.master.flashT = 0.14;
        if (app.renderer) app.renderer.addPopup(c.master.x, 0.7, c.master.z, `-${ev.dmg}`, '#ff5858', 1.12);
      }
    };

    online.onPkEnd = (ev) => {
      const c = engine.combat;
      if (c && c.mode === 'pvp_rt') c.ended = true;
      engine.state.arenaScore = ev.newScore;
      engine.state.honor = (engine.state.honor || 0) + (ev.honor || 10);
      engine.saveState();
      if (engine.onVictoryBanner) {
        engine.onVictoryBanner(ev.win ? '🏆 THẮNG PK 1v1 TRỰC TUYẾN!' : 'THẤT BẠI PK 1v1', `${ev.scoreDelta >= 0 ? '+' : ''}${ev.scoreDelta} ELO · +${ev.honor} Vinh Dự`);
      }
      engine.toast(ev.win ? `🏆 Chiến thắng PK 1v1! +${ev.scoreDelta} ELO, +${ev.honor} Vinh Dự!` : `Thua trận PK 1v1 (${ev.scoreDelta} ELO, +${ev.honor} Vinh Dự).`);
      if (c) engine.scheduleNextCombat(c, 'field', 1600);
    };

    // Real-time Plaza Sync & Co-op Party Dungeon Handlers!
    const refreshCoopTabIfOpen = () => {
      const backdrop = document.getElementById('modal-backdrop');
      const titleEl = document.getElementById('modal-title');
      const bodyEl = document.getElementById('modal-body');
      const activeCoopBtn = document.querySelector('#modal-tabs .panel-tab.active');
      if (backdrop && !backdrop.classList.contains('hidden') && titleEl && titleEl.textContent.includes('Tiên Giới Trực Tuyến') && activeCoopBtn && activeCoopBtn.textContent.includes('Co-op')) {
        activeCoopBtn.click();
      }
    };
    online.onPlazaSync = () => { if (engine.onUiDirty) engine.onUiDirty(); };
    online.onCoopRooms = () => refreshCoopTabIfOpen();
    online.onCoopRoomUpdate = () => refreshCoopTabIfOpen();

    online.onCoopStart = (msg) => {
      document.getElementById('modal-backdrop')?.classList.add('hidden');
      if (app.renderer && app.renderer.mode === 'town' && engine.onGotoFieldRequest) engine.onGotoFieldRequest();
      engine.setupCombat('coop', false, {
        roomId: msg.room.id, boss: msg.boss, peers: msg.peers || [],
        sec: 120, title: `🌀 Tổ Đội Co-op: ${msg.boss.name}`
      });
      engine.toast(`🌀 Xuất phát Phó Bản Co-op: ${msg.boss.name}!`);
    };

    online.onCoopPeerState = (st) => {
      const c = engine.combat;
      if (!c || c.mode !== 'coop') return;
      const peer = (c.mates || []).find(m => m.isCoopPeer && String(m.coopUid) === String(st.userId));
      if (!peer) return;
      peer.targetX = st.x;
      peer.targetZ = st.z;
      peer.facing = st.facing;
      peer.moving = st.moving;
      if (st.animClip) { peer.animClip = st.animClip; peer.animDur = 0.45; peer.animT = 0.45; }
    };

    online.onCoopBossHp = (ev) => {
      const c = engine.combat;
      if (!c || c.mode !== 'coop') return;
      const boss = (c.foes || []).find(f => f.isCoopBoss);
      if (boss) { boss.hp = ev.hp; boss.maxHp = ev.maxHp; }
    };

    online.onCoopEnd = (ev) => {
      const c = engine.combat;
      if (c && c.mode === 'coop') c.ended = true;
      const rw = ev.rewards || {};
      if (rw.jade) engine.grantGift('jade', rw.jade);
      if (rw.essence) engine.grantGift('essence', rw.essence);
      if (rw.gemId && rw.gemLv && rw.gemQty) {
        if (!engine.state.gems) engine.state.gems = { kim: [0,0,0,0,0], moc: [0,0,0,0,0], thuy: [0,0,0,0,0], hoa: [0,0,0,0,0], tho: [0,0,0,0,0] };
        if (!engine.state.gems[rw.gemId]) engine.state.gems[rw.gemId] = [0,0,0,0,0];
        engine.state.gems[rw.gemId][Math.max(0, Math.min(4, rw.gemLv - 1))] += rw.gemQty;
      }
      engine.saveState();
      if (engine.onUiDirty) engine.onUiDirty();
      const rwTxt = `+${rw.jade || 0} Ngọc · +${rw.essence || 0} Tinh Thạch · +${rw.gemQty || 0} Linh Châu Lv.${rw.gemLv || 2}`;
      if (engine.onVictoryBanner) engine.onVictoryBanner('🏆 VƯỢT PHÓ BẢN CO-OP THÀNH CÔNG!', rwTxt);
      engine.toast(`🌀 Hạ ${ev.bossName}! Nhận ${rwTxt}!`);
      if (c) engine.scheduleNextCombat(c, 'field', 1800);
    };

    // Load public Town Plaza cultivators once on boot (works even before login!)
    online.api('/api/plaza', 'GET').then(r => {
      if (r && r.ok) { online.plazaPlayers = r.players || []; }
    }).catch(() => {});

    // Wire HUD & Front-door buttons
    document.getElementById('hud-online-pill')?.addEventListener('click', () => {
      if (online.isLoggedIn()) engine.onOpenPanelRequest('online', 0);
      else openAuthModal('register');
    });
    document.getElementById('btn-hud-mail')?.addEventListener('click', () => {
      if (online.isLoggedIn()) engine.onOpenPanelRequest('online', 7);
      else openAuthModal('register');
    });
    document.getElementById('btn-open-auth-fd')?.addEventListener('click', () => openAuthModal('login'));

    // Wire Live Chat Box
    const chatToggle = document.getElementById('lc-toggle-btn');
    const chatBody = document.getElementById('lc-body-wrap');
    if (chatToggle && chatBody) {
      chatToggle.onclick = () => {
        chatCollapsed = !chatCollapsed;
        chatBody.classList.toggle('hidden', chatCollapsed);
        chatToggle.textContent = chatCollapsed ? '💬 Mở Chat' : '— Thu Gọn';
      };
    }
    document.querySelectorAll('[data-lc-ch]').forEach(btn => {
      btn.onclick = () => {
        chatChannel = btn.getAttribute('data-lc-ch');
        document.querySelectorAll('[data-lc-ch]').forEach(x => x.classList.toggle('active', x === btn));
        renderLiveChatMessages();
      };
    });
    const sendChatAction = () => {
      const inp = document.getElementById('lc-input');
      if (!inp) return;
      const txt = inp.value.trim();
      if (!txt) return;
      if (!online.isLoggedIn()) { openAuthModal('register'); return; }
      online.sendChat(txt, chatChannel);
      inp.value = '';
    };
    document.getElementById('lc-send-btn')?.addEventListener('click', sendChatAction);
    document.getElementById('lc-input')?.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') sendChatAction();
    });

    // Auto-login if returning player
    online.tryAutoLogin().then(res => {
      if (res && res.state && typeof res.state === 'object' && Object.keys(res.state).length > 5 && engine.state) {
        if ((res.state.maxStage || 1) >= (engine.state.maxStage || 1)) {
          engine.state = Object.assign(engine.createDefaultState(), res.state);
          engine.saveState();
        }
      }
      updateOnlineHudChrome();
      renderLiveChatMessages();
    });
    setInterval(updateOnlineHudChrome, 2000);
  }

  window.openOnlineAuthModal = openAuthModal;
  bootstrapOnline();
})();
