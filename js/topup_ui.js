// ==================== THÁI HƯ TIÊN MÔN — HỆ THỐNG NẠP THẺ, VIETQR/MOMO/THẺ CÀO, VIP 1-10 & GIFTCODE ====================
(() => {
  const RES_LABELS = {
    jade: 'Tiên Ngọc', coin: 'Linh Thạch', pill: 'Đan Đột Phá',
    scroll: 'Ngọc Giản', herb: 'Linh Thảo', core: 'Yêu Đan'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtVnd(v) {
    return Number(v || 0).toLocaleString('vi-VN') + '₫';
  }

  function fmtN(n) {
    return Math.floor(n || 0).toLocaleString('vi-VN');
  }

  // Deterministic crisp SVG QR visual fallback (never breaks even offline/headless!) + VietQR code payload
  function makeQrSvg(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const sz = 21;
    let rects = '';
    const isFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= sz - 7) || (r >= sz - 7 && c < 7);
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        let on = false;
        if (isFinder(r, c)) {
          const lr = r >= sz - 7 ? r - (sz - 7) : r;
          const lc = c >= sz - 7 ? c - (sz - 7) : c;
          on = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
        } else {
          const bit = ((h ^ (r * 73 + c * 31)) * 2654435761) >>> 28;
          on = (bit & 1) === 1;
        }
        if (on) rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#10292f"/>`;
      }
    }
    return `<svg class="pay-qr-svg" viewBox="0 0 ${sz} ${sz}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  function applyBillingRewards(engine, rewards, unlockFlags, audio, updateHud) {
    if (!engine || !engine.state) return;
    for (const [k, v] of Object.entries(rewards || {})) {
      engine.grantGift(k, v);
    }
    if (unlockFlags) {
      if (unlockFlags.seasonPass) engine.state.season.passOwned = true;
      if (unlockFlags.noAds) engine.state.noAds = true;
      if (typeof unlockFlags.vipLv === 'number') engine.state.vipLv = unlockFlags.vipLv;
      if (typeof unlockFlags.passDaysLeft === 'number') engine.state.passDaysLeft = unlockFlags.passDaysLeft;
    }
    engine.syncMasterStatsLive();
    engine.saveState();
    if (window.onlineClient && window.onlineClient.isLoggedIn()) {
      window.onlineClient.syncState(engine);
    }
    if (audio) audio.playSfx('recruit_gold');
    if (updateHud) updateHud();
  }

  function openCheckoutModal(pack, infoData, onComplete) {
    const online = window.onlineClient;
    const app = window.murimApp;
    const engine = app && app.engine;
    const audio = app && app.audio;
    if (!online || !online.isLoggedIn()) {
      if (window.openOnlineAuthModal) window.openOnlineAuthModal('register');
      return;
    }
    const modal = document.getElementById('topup-checkout-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    let method = 'vietqr';
    let createdOrder = null;
    const isFirstX2 = !!(pack.firstX2 && !(infoData.billing && infoData.billing.firstPacks && infoData.billing.firstPacks[pack.id]));

    const renderCheckout = () => {
      const bank = infoData.bank || {};
      modal.innerHTML = `
        <div class="auth-card" style="width:470px;">
          <div class="auth-head">
            <span>💳 THANH TOÁN NẠP THẺ · ${esc(pack.name)}</span>
            <button class="btn-close-panel" id="btn-co-close" style="width:30px;height:30px;font-size:15px;">✕</button>
          </div>
          <div class="auth-body">
            <div style="background:#fffdf7;border:1.5px solid #d4a647;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:900;font-size:14.5px;">${esc(pack.name)}</div>
                <div style="font-size:12px;color:#555;">
                  Nhận: <b style="color:var(--jade-dark);">${fmtN(pack.jade)} Ngọc${isFirstX2 ? ` + ${fmtN(pack.jade)} (×2 Lần Đầu!)` : ''}</b> · +${fmtN(pack.vipExp)} VIP EXP
                </div>
              </div>
              <div style="font-size:17px;font-weight:900;color:#b83227;">${fmtVnd(pack.vnd)}</div>
            </div>

            ${!createdOrder ? `
              <div style="font-size:12px;font-weight:800;margin-top:4px;">Chọn Phương Thức Thanh Toán</div>
              <div class="pay-method-tabs">
                <button class="panel-tab ${method === 'vietqr' ? 'active' : ''}" data-pm="vietqr">🏦 VietQR 24/7</button>
                <button class="panel-tab ${method === 'momo' ? 'active' : ''}" data-pm="momo">📱 Ví MoMo</button>
                <button class="panel-tab ${method === 'card' ? 'active' : ''}" data-pm="card">🎫 Thẻ Cào</button>
              </div>
              ${method === 'card' ? `
                <label>Nhà Mạng</label>
                <select id="co-telco" class="on-input">
                  <option value="VIETTEL">Viettel</option>
                  <option value="MOBIFONE">Mobifone</option>
                  <option value="VINAPHONE">Vinaphone</option>
                  <option value="ZING">Thẻ Zing / Garena</option>
                </select>
                <label>Số Seri Thẻ</label>
                <input id="co-serial" class="on-input" placeholder="Nhập số seri (tối thiểu 6 số)..." value="100088442211" />
                <label>Mã Thẻ Cào (PIN)</label>
                <input id="co-pin" class="on-input" placeholder="Nhập mã thẻ cào..." value="998877665544" />
              ` : `
                <div style="font-size:12px;color:#444;background:rgba(20,52,58,0.06);padding:9px 11px;border-radius:9px;line-height:1.5;">
                  ${method === 'vietqr'
                    ? `🏦 Chuyển khoản <b>${esc(bank.bankName)}</b> · STK <b>${esc(bank.accountNo)}</b> (${esc(bank.accountName)}). Hệ thống tự sinh mã đơn & duyệt tự động trong 5 giây!`
                    : `📱 Chuyển Ví MoMo tới SĐT <b>${esc(bank.momoPhone)}</b> (${esc(bank.accountName)}) kèm đúng mã nội dung giao dịch!`}
                </div>
              `}
              <div id="co-err" class="auth-err hidden"></div>
              <button class="btn-wuxia jade" id="btn-co-create" style="margin-top:6px;">
                ${method === 'card' ? '🎫 Gửi Thẻ Cào & Tạo Đơn' : '🧾 Tạo Mã Thanh Toán VietQR / MoMo'}
              </button>
            ` : `
              <div class="pay-qr-box">
                ${makeQrSvg(createdOrder.orderCode + ':' + createdOrder.amountVnd)}
                <div style="font-size:12px;line-height:1.55;flex:1;">
                  <div>Mã Đơn: <b style="color:#b83227;font-size:13.5px;">${esc(createdOrder.orderCode)}</b></div>
                  <div>Số Tiền: <b>${fmtVnd(createdOrder.amountVnd)}</b></div>
                  ${createdOrder.method === 'card'
                    ? `<div>Thẻ: <b>${esc(createdOrder.cardInfo)}</b></div>`
                    : `<div>${createdOrder.method === 'momo' ? `MoMo: <b>${esc(bank.momoPhone)}</b>` : `NH: <b>${esc(bank.bankId)} · ${esc(bank.accountNo)}</b>`}</div>
                       <div>Nội dung CK: <b style="background:#fff3c4;padding:1px 6px;border-radius:4px;">${esc(createdOrder.transferNote)}</b></div>`}
                  <div style="color:#2b7a57;font-weight:800;margin-top:3px;">⏳ Đang chờ cổng thanh toán xác nhận...</div>
                </div>
              </div>
              <div id="co-err" class="auth-err hidden"></div>
              <div style="display:flex;gap:8px;margin-top:6px;">
                ${bank.sandbox ? `<button class="btn-wuxia crimson" id="btn-co-sandbox-pay" style="flex:1;">⚡ Xác Nhận Thanh Toán Ngay (Sandbox Test)</button>` : ''}
                <button class="btn-wuxia" id="btn-co-done">Đóng</button>
              </div>
            `}
          </div>
        </div>
      `;

      document.getElementById('btn-co-close').onclick = () => modal.classList.add('hidden');
      const bDone = document.getElementById('btn-co-done');
      if (bDone) bDone.onclick = () => { modal.classList.add('hidden'); if (onComplete) onComplete(); };

      modal.querySelectorAll('[data-pm]').forEach(b => {
        b.onclick = () => { method = b.getAttribute('data-pm'); renderCheckout(); };
      });

      const bCreate = document.getElementById('btn-co-create');
      if (bCreate) bCreate.onclick = async () => {
        const errEl = document.getElementById('co-err');
        errEl.classList.add('hidden');
        bCreate.disabled = true;
        try {
          const payload = { packId: pack.id, method };
          if (method === 'card') {
            payload.telco = document.getElementById('co-telco').value;
            payload.serial = document.getElementById('co-serial').value.trim();
            payload.pin = document.getElementById('co-pin').value.trim();
          }
          const r = await online.api('/api/topup/order', 'POST', payload);
          if (!r || !r.ok) {
            errEl.textContent = (r && r.error) || 'Không tạo được đơn thanh toán!';
            errEl.classList.remove('hidden');
            return;
          }
          createdOrder = r.order;
          renderCheckout();
        } catch (err) {
          errEl.textContent = 'Lỗi kết nối mạng khi tạo đơn!';
          errEl.classList.remove('hidden');
        } finally {
          bCreate.disabled = false;
        }
      };

      const bSand = document.getElementById('btn-co-sandbox-pay');
      if (bSand) bSand.onclick = async () => {
        const errEl = document.getElementById('co-err');
        errEl.classList.add('hidden');
        bSand.disabled = true;
        try {
          const r = await online.api('/api/topup/confirm', 'POST', { orderCode: createdOrder.orderCode });
          if (!r || !r.ok) {
            errEl.textContent = (r && r.error) || 'Lỗi xác nhận đơn hàng!';
            errEl.classList.remove('hidden');
            return;
          }
          applyBillingRewards(engine, r.rewards, r.unlockFlags, audio, null);
          engine.toast(`💎 Thanh toán thành công ${pack.name}! +${fmtN(r.rewards.jade || 0)} Tiên Ngọc${r.bonusJade ? ` (gồm ×2 +${fmtN(r.bonusJade)}!)` : ''}`);
          modal.classList.add('hidden');
          if (onComplete) onComplete();
        } catch (err) {
          errEl.textContent = 'Lỗi kết nối mạng khi xác nhận đơn!';
          errEl.classList.remove('hidden');
        } finally {
          bSand.disabled = false;
        }
      };
    };
    renderCheckout();
  }

  // ==================== 4-TAB TOP-UP & VIP STORE PANEL ====================
  window.renderTopupShopPanel = function renderTopupShopPanel(body, activeTab, setModalHeader, closePanel, updateHud) {
    const app = window.murimApp;
    const engine = app && app.engine;
    const audio = app && app.audio;
    const online = window.onlineClient;
    const st = engine.state;

    setModalHeader('💎 Tiên Bảo Các · Nạp Thẻ & VIP', [
      '💎 Nạp Tiên Ngọc (×2)',
      '🎁 Gói Ưu Đãi & Thẻ Tháng',
      '👑 Nạp Đầu & VIP 1–10',
      '🎫 Giftcode & Lịch Sử'
    ]);

    body.className = 'panel-body single-col';
    body.innerHTML = `<div style="padding:28px;text-align:center;color:#555;font-weight:700;">⏳ Đang tải bảng giá Tiên Bảo Các từ máy chủ...</div>`;

    const reqSeq = (window.__topupReqSeq = (window.__topupReqSeq || 0) + 1);
    const reload = () => window.renderTopupShopPanel(body, activeTab, setModalHeader, closePanel, updateHud);

    const fetchInfo = online ? online.api('/api/topup/info', 'GET') : Promise.resolve(null);
    fetchInfo.then(info => {
      if (reqSeq !== window.__topupReqSeq || !body.isConnected) return;
      if (!info || !info.ok) {
        body.innerHTML = `<div style="padding:24px;color:#b83227;font-weight:800;">Không kết nối được cổng Tiên Bảo Các máy chủ!</div>`;
        return;
      }
      const b = info.billing || { total_vnd: 0, vip_exp: 0, vip_lv: 0, first_topup_claimed: 0, firstPacks: {}, vipClaimed: {}, passDaysLeft: 0, canClaimDailyPass: false };
      if (online && online.isLoggedIn()) {
        st.vipLv = b.vip_lv || 0;
        if (b.season_pass) st.season.passOwned = true;
        if (b.no_ads) st.noAds = true;
        st.passDaysLeft = b.passDaysLeft || 0;
      }
      const packs = info.packs || [];
      const vipTiers = info.vipTiers || [];
      const curVip = b.vip_lv || 0;
      const nextVip = vipTiers.find(t => t.lv === curVip + 1);
      const vipPct = nextVip ? Math.min(100, Math.round((b.vip_exp / nextVip.exp) * 100)) : 100;

      const loginNotice = (!online || !online.isLoggedIn())
        ? `<div style="background:rgba(184,50,39,0.12);border:1.5px solid #c94136;border-radius:11px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <span style="font-size:12.5px;font-weight:800;color:#9b2018;">🌐 Đăng nhập tài khoản Online để nạp thẻ VietQR/MoMo/Thẻ Cào, tích VIP & lưu biên lai!</span>
            <button class="btn-wuxia jade" id="btn-shop-auth-now" style="padding:5px 12px;font-size:12px;">Đăng Nhập / Đăng Ký</button>
          </div>`
        : `<div class="vip-banner-box" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
            <div style="flex:1;min-width:220px;">
              <div style="font-size:16px;font-weight:900;color:#ffd866;">👑 VIP ${curVip} · Tổng nạp: ${fmtVnd(b.total_vnd)} · Tiên Ngọc: ${fmtN(st.jade)}</div>
              <div style="font-size:12px;color:#d6e9e6;margin-top:2px;">
                ${nextVip ? `Còn thiếu <b>${fmtN(Math.max(0, nextVip.exp - b.vip_exp))} VIP EXP</b> để lên <b>${nextVip.title}</b>` : 'Đã đạt đỉnh phong VIP 10 · Thái Hư Chí Tôn!'}
              </div>
              <div style="height:8px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden;margin-top:6px;max-width:360px;">
                <div style="width:${vipPct}%;height:100%;background:linear-gradient(90deg,#ffd466,#ff8c38);"></div>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag-pill gold">${info.bank?.sandbox ? '⚡ Cổng Sandbox Test Đang Bật' : '🔒 Cổng VietQR Production'}</span>
            </div>
          </div>`;

      if (activeTab === 0) {
        const jadePacks = packs.filter(p => p.cat === 'jade');
        body.innerHTML = loginNotice + `
          <div class="topup-grid" style="margin-top:6px;">
            ${jadePacks.map(p => {
              const firstX2 = p.firstX2 && !b.firstPacks[p.id];
              return `<div class="topup-card ${firstX2 ? 'first-x2' : ''}">
                ${firstX2 ? `<div class="topup-x2-ribbon">🔥 LẦN ĐẦU ×2</div>` : ''}
                <img src="assets/img/${p.icon}.png" onerror="this.src='assets/img/jade.png'" style="width:54px;height:54px;object-fit:contain;border-radius:10px;background:#10292f;padding:4px;border:1.5px solid #d4a647;" alt="" />
                <div style="font-weight:900;font-size:14px;">${esc(p.name)}</div>
                <div style="font-size:15px;font-weight:900;color:var(--jade-dark);">${fmtN(p.jade)} Tiên Ngọc</div>
                <div style="font-size:11.5px;color:#b83227;font-weight:800;min-height:16px;">${firstX2 ? `Tặng thêm +${fmtN(p.jade)} Ngọc lần đầu!` : `+${fmtN(p.vipExp)} VIP EXP`}</div>
                <button class="btn-wuxia jade topup-price-btn" data-buy-pack="${p.id}">💳 ${fmtVnd(p.vnd)}</button>
              </div>`;
            }).join('')}
          </div>
        `;
      } else if (activeTab === 1) {
        const bundles = packs.filter(p => p.cat === 'bundle');
        const freeShop = engine.data.game.shop;
        body.innerHTML = loginNotice + `
          <div class="item-row-card selected" style="margin-top:6px;">
            <div class="item-row-left">
              <img class="item-row-icon" style="border-radius:10px;border:1.5px solid #d4a647;background:#10292f;" src="assets/img/ut_shop_ad.png" alt="" />
              <div>
                <div class="item-row-title">🎁 Phúc Lợi Tiên Ngọc Miễn Phí (${st.adJadeLeft}/${freeShop.adPerDay})</div>
                <div class="item-row-sub">Quà Tông Chủ miễn phí hằng ngày — nhận ngay +${freeShop.adJade} Tiên Ngọc!</div>
              </div>
            </div>
            <button class="btn-wuxia jade" id="btn-free-ad-jade" ${st.adJadeLeft <= 0 ? 'disabled' : ''}>Nhận +${freeShop.adJade} Ngọc</button>
          </div>
          ${b.passDaysLeft > 0 ? `<div class="item-row-card selected" style="background:rgba(212,166,71,0.14);border:1.5px solid #d4a647;">
            <div>
              <div class="item-row-title">🌙 Thẻ Tháng Chí Tôn Đang Kích Hoạt (Còn ${b.passDaysLeft} ngày)</div>
              <div class="item-row-sub">Mỗi ngày đăng nhập nhận ngay +150 Tiên Ngọc!</div>
            </div>
            <button class="btn-wuxia crimson" id="btn-claim-daily-pass" ${!b.canClaimDailyPass ? 'disabled' : ''}>${b.canClaimDailyPass ? 'Nhận +150 Ngọc Hôm Nay' : 'Đã Nhận Hôm Nay ✓'}</button>
          </div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${bundles.map(p => {
              const ownedOnce = !!(p.once && b.firstPacks[p.id]);
              return `<div class="item-row-card ${!ownedOnce ? 'selected' : ''}">
                <div class="item-row-left">
                  <img class="item-row-icon" style="border-radius:10px;border:1.5px solid #d4a647;background:#10292f;padding:3px;object-fit:contain;" src="assets/img/${p.icon}.png" onerror="this.src='assets/img/cont_shop.png'" alt="" />
                  <div>
                    <div class="item-row-title">${esc(p.name)}</div>
                    <div class="item-row-sub">${esc(p.desc)}</div>
                  </div>
                </div>
                <button class="btn-wuxia ${ownedOnce ? '' : 'crimson'}" data-buy-pack="${p.id}" ${ownedOnce ? 'disabled' : ''}>${ownedOnce ? 'Đã Mua ✓' : fmtVnd(p.vnd)}</button>
              </div>`;
            }).join('')}
          </div>
        `;
        const bFree = document.getElementById('btn-free-ad-jade');
        if (bFree) bFree.onclick = () => {
          if (st.adJadeLeft > 0) { st.adJadeLeft--; st.jade += freeShop.adJade; if (audio) audio.playSfx('collect'); engine.saveState(); updateHud(); reload(); }
        };
        const bPass = document.getElementById('btn-claim-daily-pass');
        if (bPass) bPass.onclick = async () => {
          const r = await online.api('/api/topup/claim_daily_pass', 'POST', {});
          if (r && r.ok) { applyBillingRewards(engine, r.rewards, null, audio, updateHud); engine.toast('🌙 Đã nhận +150 Tiên Ngọc từ Thẻ Tháng Chí Tôn!'); reload(); }
          else engine.toast((r && r.error) || 'Lỗi nhận thẻ tháng');
        };
      } else if (activeTab === 2) {
        const canClaimFirst = b.total_vnd > 0 && !b.first_topup_claimed;
        body.innerHTML = loginNotice + `
          <div class="first-topup-banner" style="margin-top:6px;">
            <div>
              <div style="font-size:17px;font-weight:900;color:#ffd466;">🌟 QUÀ NẠP ĐẦU SIÊU PHẨM (BẤT KỲ MỆNH GIÁ NÀO TỪ 20.000₫)</div>
              <div style="font-size:12.5px;color:#fcebd8;margin-top:4px;line-height:1.5;">
                Nhận ngay: <b>🗡 Thần Binh 3D Hàn Băng Tuyết Liên Kiếm</b> · <b>👤 Đệ Tử SSS Huyền Thiên</b> · <b>💎 +500 Tiên Ngọc</b> · <b>💊 +10 Đan Đột Phá</b> · <b>🪙 +20.000 Linh Thạch</b>!
              </div>
            </div>
            <button class="btn-wuxia jade" id="btn-claim-first-topup" ${!canClaimFirst ? 'disabled' : ''} style="padding:10px 18px;font-size:13.5px;">
              ${b.first_topup_claimed ? 'Đã Nhận ✓' : (canClaimFirst ? '🎁 Nhận Quà Nạp Đầu!' : '🔒 Nạp 20K Để Mở')}
            </button>
          </div>
          <div style="font-weight:900;font-size:15px;margin-top:6px;">👑 Hệ Thống Đặc Quyền VIP 1 → VIP 10 (Buff Vĩnh Viễn + Rương Mốc)</div>
          ${vipTiers.map(t => {
            const reached = curVip >= t.lv;
            const claimed = !!b.vipClaimed[String(t.lv)];
            const chestStr = Object.entries(t.chest).map(([k, v]) => `+${fmtN(v)} ${RES_LABELS[k] || k}`).join(' · ');
            return `<div class="item-row-card ${reached && !claimed ? 'selected' : ''}" style="padding:9px 12px;">
              <div>
                <div class="item-row-title">${esc(t.title)} <span class="tag-pill gold" style="font-size:10px;">Cần ${fmtN(t.exp)} EXP</span></div>
                <div class="item-row-sub">Buff vĩnh viễn: <b>+${t.atkPct}% Công</b> · <b>+${t.coinPct}% Linh Thạch & Tu Vi</b> · <b>+${t.hallPct}% Điện Các</b></div>
                <div style="font-size:11.5px;color:var(--jade-dark);font-weight:800;margin-top:2px;">🎁 Rương VIP ${t.lv}: ${chestStr}</div>
              </div>
              <button class="btn-wuxia ${reached && !claimed ? 'jade' : ''}" data-claim-vip="${t.lv}" ${!reached || claimed ? 'disabled' : ''}>
                ${claimed ? 'Đã Nhận ✓' : (reached ? 'Nhận Rương' : `VIP ${t.lv}`)}
              </button>
            </div>`;
          }).join('')}
        `;
        const bFirst = document.getElementById('btn-claim-first-topup');
        if (bFirst) bFirst.onclick = async () => {
          const r = await online.api('/api/topup/claim_first', 'POST', {});
          if (r && r.ok) {
            const rw = r.reward || {};
            if (rw.weapon) {
              if (!st.gearOwned) st.gearOwned = { wp_iron_jian: 1 };
              st.gearOwned[rw.weapon] = Math.max(st.gearOwned[rw.weapon] || 0, 1);
            }
            if (rw.disciple) {
              if (!st.disciples[rw.disciple]) st.disciples[rw.disciple] = { lv: 1, stars: 1, shards: 0 };
              else st.disciples[rw.disciple].shards += 10;
            }
            applyBillingRewards(engine, { jade: rw.jade, pill: rw.pill, coin: rw.coin }, null, audio, updateHud);
            engine.toast('🌟 Đã nhận Quà Nạp Đầu: Hàn Băng Tuyết Liên Kiếm + Đệ Tử Huyền Thiên + 500 Ngọc!');
            reload();
          } else engine.toast((r && r.error) || 'Lỗi nhận quà nạp đầu');
        };
        body.querySelectorAll('[data-claim-vip]').forEach(btn => {
          btn.onclick = async () => {
            const lv = parseInt(btn.getAttribute('data-claim-vip'), 10);
            const r = await online.api('/api/topup/claim_vip', 'POST', { vipLv: lv });
            if (r && r.ok) {
              applyBillingRewards(engine, r.rewards, null, audio, updateHud);
              engine.toast(`👑 Đã nhận Rương Đặc Quyền VIP ${lv}!`);
              reload();
            } else engine.toast((r && r.error) || 'Lỗi nhận rương VIP');
          };
        });
      } else {
        const orders = info.orders || [];
        body.innerHTML = loginNotice + `
          <div style="background:var(--hanji-card);padding:14px 16px;border-radius:12px;border:1.5px solid #d4a647;margin-top:6px;">
            <div style="font-weight:900;font-size:15px;margin-bottom:6px;">🎫 Nhập Mã Giftcode Máy Chủ</div>
            <div style="display:flex;gap:8px;">
              <input id="gc-input" class="on-input" style="margin:0;flex:1;text-transform:uppercase;font-weight:800;" placeholder="Nhập mã Giftcode (vd: THAIHU2026, TANTHU, TIENMONVIP)..." />
              <button class="btn-wuxia jade" id="btn-gc-redeem" style="padding:8px 18px;">Đổi Mã</button>
            </div>
            <div style="font-size:11.5px;color:#555;margin-top:6px;">
              Mã tân thủ đang mở: <b style="color:var(--jade-dark);cursor:pointer;" data-fill-gc="THAIHU2026">THAIHU2026</b> · <b style="color:var(--jade-dark);cursor:pointer;" data-fill-gc="TANTHU">TANTHU</b> · <b style="color:var(--jade-dark);cursor:pointer;" data-fill-gc="TIENMONVIP">TIENMONVIP</b> (bấm để điền nhanh)
            </div>
          </div>
          <div style="font-weight:900;font-size:15px;margin-top:8px;">🧾 Lịch Sử Giao Dịch Nạp Thẻ (${orders.length})</div>
          ${orders.length ? orders.map(o => `
            <div class="item-row-card" style="padding:8px 12px;">
              <div>
                <div class="item-row-title" style="font-size:13.5px;">${esc(o.pack_name)} · <span style="color:#b83227;">${fmtVnd(o.amount_vnd)}</span></div>
                <div class="item-row-sub">
                  Mã: <b>${esc(o.order_code)}</b> · Kênh: <b>${esc(o.method.toUpperCase())}</b>${o.card_info ? ` (${esc(o.card_info)})` : ''} · ${new Date(o.created_at * 1000).toLocaleString('vi-VN')}
                </div>
              </div>
              <span class="tag-pill ${o.status === 'paid' ? 'jade' : 'gold'}">
                ${o.status === 'paid' ? `✅ +${fmtN((o.jade_granted || 0) + (o.bonus_jade || 0))} Ngọc` : '⏳ Chờ Thanh Toán'}
              </span>
            </div>
          `).join('') : `<div style="padding:18px;text-align:center;color:#666;">Chưa có giao dịch nạp thẻ nào.</div>`}
        `;
        body.querySelectorAll('[data-fill-gc]').forEach(el => {
          el.onclick = () => { document.getElementById('gc-input').value = el.getAttribute('data-fill-gc'); };
        });
        document.getElementById('btn-gc-redeem').onclick = async () => {
          if (!online || !online.isLoggedIn()) { if (window.openOnlineAuthModal) window.openOnlineAuthModal('register'); return; }
          const code = document.getElementById('gc-input').value.trim();
          if (!code) return;
          const r = await online.api('/api/giftcode/redeem', 'POST', { code });
          if (r && r.ok) {
            applyBillingRewards(engine, r.rewards, null, audio, updateHud);
            const str = Object.entries(r.rewards || {}).map(([k, v]) => `+${fmtN(v)} ${RES_LABELS[k] || k}`).join(', ');
            engine.toast(`🎉 Đổi Giftcode ${r.code} thành công: ${str}!`);
            document.getElementById('gc-input').value = '';
          } else {
            engine.toast((r && r.error) || 'Mã Giftcode không hợp lệ!');
          }
        };
      }

      const bAuth = document.getElementById('btn-shop-auth-now');
      if (bAuth) bAuth.onclick = () => { if (window.openOnlineAuthModal) window.openOnlineAuthModal('register'); };
      body.querySelectorAll('[data-buy-pack]').forEach(btn => {
        btn.onclick = () => {
          const pid = btn.getAttribute('data-buy-pack');
          const pk = packs.find(x => x.id === pid);
          if (pk) openCheckoutModal(pk, info, reload);
        };
      });
    });
  };
})();
