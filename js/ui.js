// ============================================================================
// Tiên Giới Khai Nghiệp (무림개업 1.2.3) — Full Vietnamese Landscape UI Controller
// Connects 3D WebGL Renderer + Audio + Core Engine + All 9 Hanji Panels
// ============================================================================

(function () {
  const audio = new MurimAudio();
  const glCanvas = document.getElementById('gl-canvas');
  const fxCanvas = document.getElementById('fx-canvas');
  const renderer = new MurimRenderer3D(glCanvas, fxCanvas);
  const engine = new MurimEngine(audio, renderer);

  // Expose for quick console inspection
  window.murimApp = { audio, renderer, engine };

  let activePanel = '';
  let activeTab = 0;
  let selectedItem = null;
  let lastGachaResults = null;
  let selectedRegionIdx = 0;
  let selectedNodeId = 'in';

  // ==================== TOAST & CUT-IN & STORY OVERLAY ====================
  engine.onToast = (msg) => {
    const box = document.getElementById('toast-container');
    while (box.children.length >= 2) box.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.remove(); }, 2500);
  };

  engine.onUltCutIn = (figName, ultName) => {
    const el = document.getElementById('ult-cutin');
    const img = document.getElementById('ult-cutin-img');
    const txt = document.getElementById('ult-cutin-name');
    img.src = `assets/img/${figName || 'hero_lamphong'}.png`;
    txt.textContent = `${ultName}!`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 1350);
  };

  let gameEntered = false;
  let storyOpen = false;
  let storyAdvanceFn = null;
  let pendingStageAction = null;
  const storyQueue = [];

  engine.isStoryActive = () => storyOpen || storyQueue.length > 0;
  engine.runAfterStory = (fn) => {
    if (storyOpen || storyQueue.length > 0) {
      pendingStageAction = fn;
    } else if (fn) {
      fn();
    }
  };

  engine.onStageTransition = (cb) => {
    if (storyOpen || storyQueue.length > 0) {
      pendingStageAction = () => engine.onStageTransition(cb);
      return;
    }
    const fade = document.getElementById('stage-fade');
    if (!fade) { if (cb) cb(); return; }
    fade.classList.add('active');
    setTimeout(() => {
      if (cb) cb();
      requestAnimationFrame(() => fade.classList.remove('active'));
    }, 260);
  };

  function finishStoryOverlay(cb) {
    const overlay = document.getElementById('story-overlay');
    const skipTop = document.getElementById('story-skip-top');
    audio.stopVoice();
    overlay.classList.add('hidden');
    overlay.classList.remove('narr-mode');
    if (skipTop) skipTop.classList.add('hidden');
    storyOpen = false;
    storyAdvanceFn = null;
    updateHud();
    if (cb) cb();
    if (!storyOpen && storyQueue.length > 0) {
      playStorySequence(storyQueue.shift());
    }
    if (!storyOpen && storyQueue.length === 0 && pendingStageAction) {
      const act = pendingStageAction;
      pendingStageAction = null;
      act();
    }
  }

  function playStorySequence(seq) {
    if (storyOpen) {
      storyQueue.push(seq);
      return;
    }
    storyOpen = true;
    const overlay = document.getElementById('story-overlay');
    const skipTop = document.getElementById('story-skip-top');
    const narrBox = document.getElementById('story-narr-box');
    const narrTitle = document.getElementById('story-narr-title');
    const narrBody = document.getElementById('story-narr-body');
    const narrStep = document.getElementById('story-narr-step');
    const narrAct = document.getElementById('story-narr-actions');
    const talkStage = document.getElementById('story-talk-stage');
    const talkStep = document.getElementById('story-talk-step');
    const figEl = document.getElementById('story-fig');
    const whoEl = document.getElementById('story-who');
    const txtEl = document.getElementById('story-text');
    const actEl = document.getElementById('story-actions');

    // Hide HUD behind story cutscenes (matches APK StoryDimNarr / StoryDimTalk!)
    document.getElementById('field-hud').classList.add('hidden');
    document.getElementById('town-hud').classList.add('hidden');

    const lines = seq.lines || [];
    let idx = 0;

    const showStep = () => {
      overlay.classList.remove('hidden');
      const cur = lines[idx] || { who: seq.title || 'Tiên Giới', fig: '', text: '' };
      const cleanTxt = (cur.text || '').replace('{이름}', 'Đệ Tử');
      const isNarr = !cur.who && !cur.fig;
      const stepLabel = `${idx + 1} / ${Math.max(1, lines.length)}`;

      // Play 100% Vietnamese neural voiceover for cutscene line!
      const voKey = cur.voKey || (seq.voPrefix ? `${seq.voPrefix}_${idx}` : '');
      audio.playCutsceneLine(voKey, cur.who || '', cleanTxt);

      // Keep Skip tucked neatly in top-right corner so players never misclick it while tapping Tiếp Tục!
      if (skipTop) {
        if (idx < lines.length - 1) {
          skipTop.classList.remove('hidden');
          skipTop.onclick = (e) => {
            e.stopPropagation();
            audio.playSfx('ui_click');
            if (seq.choices && seq.choices.length > 0) {
              idx = lines.length - 1;
              showStep();
            } else {
              finishStoryOverlay(seq.onDone);
            }
          };
        } else {
          skipTop.classList.add('hidden');
        }
      }

      let targetActEl = actEl;
      if (isNarr && narrBox && talkStage) {
        overlay.classList.add('narr-mode');
        narrBox.classList.remove('hidden');
        talkStage.classList.add('hidden');
        narrTitle.textContent = seq.title || 'Xuyên Không · Thái Hư Tiên Môn';
        narrBody.textContent = cleanTxt;
        if (narrStep) narrStep.textContent = stepLabel;
        targetActEl = narrAct;
      } else {
        overlay.classList.remove('narr-mode');
        if (narrBox) narrBox.classList.add('hidden');
        if (talkStage) talkStage.classList.remove('hidden');
        whoEl.textContent = cur.who || seq.title || 'Thái Hư Tiên Môn';
        txtEl.textContent = cleanTxt;
        if (talkStep) talkStep.textContent = stepLabel;
        if (cur.fig) {
          figEl.src = `assets/img/${cur.fig}.png?v=25`;
          figEl.classList.remove('hidden');
        } else {
          figEl.classList.add('hidden');
        }
      }

      targetActEl.innerHTML = '';
      if (idx < lines.length - 1) {
        const goNext = () => {
          idx++;
          audio.playSfx('ui_click');
          showStep();
        };
        storyAdvanceFn = goNext;
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-wuxia jade';
        nextBtn.textContent = `Tiếp Tục (${idx + 1}/${lines.length}) ▸`;
        nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
        targetActEl.appendChild(nextBtn);
      } else if (seq.choices && seq.choices.length > 0) {
        storyAdvanceFn = null;
        for (const ch of seq.choices) {
          const btn = document.createElement('button');
          btn.className = 'btn-wuxia jade';
          btn.textContent = ch.label;
          btn.onclick = (e) => {
            e.stopPropagation();
            audio.playSfx('ui_click');
            finishStoryOverlay(ch.onPick);
          };
          targetActEl.appendChild(btn);
        }
      } else {
        const finishNow = () => {
          audio.playSfx('ui_click');
          finishStoryOverlay(seq.onDone);
        };
        storyAdvanceFn = finishNow;
        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-wuxia jade';
        doneBtn.textContent = seq.doneLabel || 'Hoàn Tất';
        doneBtn.onclick = (e) => { e.stopPropagation(); finishNow(); };
        targetActEl.appendChild(doneBtn);
      }
    };
    showStep();
  }

  engine.onStoryTrigger = playStorySequence;

  let ribbonTimer = null;
  function showVictoryRibbon(title, sub = '') {
    const el = document.getElementById('victory-ribbon');
    if (!el) return;
    document.getElementById('vr-title').textContent = title || 'PHÁ ẢI THÀNH CÔNG!';
    document.getElementById('vr-sub').textContent = sub || '';
    el.classList.remove('hidden');
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    if (ribbonTimer) clearTimeout(ribbonTimer);
    ribbonTimer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, 2300);
  }
  engine.onVictoryBanner = showVictoryRibbon;

  // Populate drifting golden spirit motes & peach petals on Title Screen (FrontDoor)
  (function initFrontDoorParticles() {
    const host = document.getElementById('fd-particles');
    if (!host) return;
    let html = '';
    for (let i = 0; i < 22; i++) {
      const left = (i * 4.7 + (i % 3) * 1.9) % 98;
      const delay = (i * 0.42) % 7;
      const dur = 5.5 + (i % 5) * 1.3;
      const sz = 5 + (i % 4) * 2.5;
      const isPetal = i % 3 === 0;
      html += `<span class="fd-mote ${isPetal ? 'petal' : ''}" style="left:${left.toFixed(1)}%;width:${sz}px;height:${isPetal ? sz * 1.5 : sz}px;animation-delay:-${delay.toFixed(2)}s;animation-duration:${dur.toFixed(1)}s;"></span>`;
    }
    host.innerHTML = html;
  })();

  // ==================== HUD REFRESH ====================
  function fmt(n) {
    n = Math.floor(n || 0);
    if (n >= 1e8) return (n / 1e8).toFixed(2) + ' Ức';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + ' Vạn';
    return n.toLocaleString('vi-VN');
  }

  function updateHud() {
    if (!engine.state || !engine.data.game) return;
    const st = engine.state;
    const c = engine.combat;
    const realm = engine.data.game.realms[st.realmIdx] || engine.data.game.realms[0];

    const fieldHud = document.getElementById('field-hud');
    const townHud = document.getElementById('town-hud');
    if (gameEntered && !storyOpen) {
      fieldHud.classList.toggle('hidden', renderer.mode !== 'field');
      townHud.classList.toggle('hidden', renderer.mode !== 'town');
    } else {
      fieldHud.classList.add('hidden');
      townHud.classList.add('hidden');
    }

    document.getElementById('hud-realm-badge').textContent = realm.name;
    document.getElementById('hud-power-txt').textContent = fmt(engine.getSectPower());
    document.getElementById('hud-coin-txt').textContent = fmt(st.coin);
    document.getElementById('hud-jade-txt').textContent = fmt(st.jade);
    document.getElementById('th-coin-txt').textContent = fmt(st.coin);
    document.getElementById('th-jade-txt').textContent = fmt(st.jade);
    const herbEl = document.getElementById('hud-herb-txt');
    const coreEl = document.getElementById('hud-core-txt');
    if (herbEl) herbEl.textContent = fmt(st.herb || 0);
    if (coreEl) coreEl.textContent = fmt(st.core || 0);
    const qiPct = Math.max(0, Math.min(100, ((st.qi || 0) / Math.max(1, st.qiMax || 100)) * 100));
    const qiFill = document.getElementById('hud-master-qi');
    const qiTxt = document.getElementById('hud-qi-txt');
    if (qiFill) qiFill.style.width = `${qiPct}%`;
    if (qiTxt) {
      qiTxt.textContent = st.atkBuffT > 0
        ? `🔥 Bạo Huyết ${Math.ceil(st.atkBuffT)}s`
        : (st.meditating ? `🧘 Hấp Linh ${Math.floor(qiPct)}%` : `Linh Khí ${Math.floor(qiPct)}%`);
    }
    const medBtn = document.getElementById('btn-toggle-meditate');
    if (medBtn) {
      medBtn.classList.toggle('active', !!st.meditating);
      medBtn.textContent = st.meditating ? '🧘 Đang Thiền' : '🧘 Thiền';
    }
    const flBtn = document.getElementById('btn-toggle-flight');
    if (flBtn) {
      flBtn.classList.toggle('active', !!st.swordFlightOn);
      flBtn.textContent = st.swordFlightOn ? '⚔ Đang Bay' : '⚔ Phi Kiếm';
    }

    const pathNames = { '': 'Tán Tu', jeong: 'Chính Tiên', sa: 'Tán Tu', ma: 'Ma Đạo', indep: 'Tự Luật' };
    document.getElementById('hud-path-txt').textContent = pathNames[st.sectPath] || 'Tán Tu';

    const maxSalve = engine.getMaxSalves ? engine.getMaxSalves() : (2 + Math.floor((st.halls.pharmacy.lv || 0) / 4));
    document.getElementById('hud-salve-txt').textContent = `${st.salve}/${maxSalve}`;

    if (c && c.master) {
      const hpPct = Math.max(0, Math.min(100, (c.master.hp / Math.max(1, c.master.maxHp)) * 100));
      document.getElementById('hud-master-hp').style.width = `${hpPct}%`;

      const rawChIdx = Math.max(0, Math.floor((c.stage - 1) / 10));
      const chNames = [
        'Tự Chương · Thanh Lam Phế Đỉnh', 'Chương 1 · U Lâm Yêu Cốc', 'Chương 2 · Bích Thủy Hàn Đàm',
        'Chương 3 · Xích Viêm Hỏa Cốc', 'Chương 4 · Huyền Băng Tuyết Lĩnh', 'Chương 5 · Cửu U Ma Vực'
      ];
      const chLabel = rawChIdx < chNames.length ? chNames[rawChIdx] : `Thượng Giới Vô Tận · Tầng ${rawChIdx - chNames.length + 1}`;
      const gate = ((c.stage - 1) % 10) + 1;
      const modeNames = {
        prologue: `Xuyên Không · Bảo Vệ Thanh Lam Linh Tuyền`,
        field: `${chLabel} · Ải ${gate}/10${st.huntMode ? ' · Săn Bãi' : ''}${st.insight > 0 ? ` (Nhìn Thấu ${Math.round(st.insight * 100)}%)` : ''}`,
        shadow: `Lôi Kiếp Đài · Độ Kiếp Đột Phá`,
        daily: `Bí Cảnh Tu Tiên`,
        tower: `Thông Thiên Tháp · Tầng ${st.towerFloor}`,
        jianghu: c.customOpts.title || 'Du Lịch Tiên Giới',
        raid: c.customOpts.title || 'Thủ Sơn Trang · Đẩy Lùi Tập Kích',
        arena: `Luận Kiếm Đài · Quyết Đấu`,
        pvp_rt: c.customOpts.title || '⚔ PK 1v1 Trực Tuyến',
        worldBoss: c.customOpts.title || '🐉 Boss Thế Giới Trực Tuyến',
        seasonBoss: `Thái Cổ Lôi Thú`,
        guildBoss: `Thủ Lĩnh Tiên Minh`
      };
      document.getElementById('hud-stage-txt').textContent = modeNames[c.mode] || `Ải ${c.stage}`;
      document.getElementById('hud-kills-txt').textContent = `${c.kills} / ${c.killsGoal}`;
      const killPct = Math.max(0, Math.min(100, (c.kills / Math.max(1, c.killsGoal)) * 100));
      document.getElementById('hud-kills-fill').style.width = `${killPct}%`;

      const btnHunt = document.getElementById('btn-toggle-hunt');
      if (btnHunt) {
        btnHunt.textContent = st.huntMode ? 'Săn Bãi' : 'Tiến Ải';
        btnHunt.classList.toggle('active', !st.huntMode);
      }
      const btnAutoBoss = document.getElementById('btn-toggle-autoboss');
      if (btnAutoBoss) {
        btnAutoBoss.textContent = st.autoBoss ? '👹 Auto Boss: BẬT' : '👹 Auto Boss';
        btnAutoBoss.classList.toggle('active', !!st.autoBoss);
      }

      const btnBoss = document.getElementById('btn-boss-now');
      const btnExit = document.getElementById('btn-exit-mode');
      const nextChapAvailable = Math.floor((st.maxStage - 1) / 10) > Math.floor((st.stage - 1) / 10);
      const bossReady = (st.stage % 10 === 9 && st.maxStage >= st.stage + 1);
      if (c.mode === 'field' && !c.isBossGate && (nextChapAvailable || bossReady || st.huntMode)) {
        btnBoss.classList.remove('hidden');
        if (nextChapAvailable) btnBoss.textContent = `⚔ Sang Chương Tiếp (Ải ${st.maxStage})`;
        else if (bossReady) btnBoss.textContent = `⚔ Đấu Thủ Lĩnh (Ải ${st.stage + 1})`;
        else btnBoss.textContent = `▶ Tiếp Tục Tiến Ải`;
      } else {
        btnBoss.classList.add('hidden');
      }
      if (c.mode !== 'field' && c.mode !== 'prologue') btnExit.classList.remove('hidden');
      else btnExit.classList.add('hidden');

      const activeBoss = c.foes.find(f => !f.dead && (f.isBoss || f.isLeader));
      const bossBox = document.getElementById('hud-boss-box');
      if (activeBoss) {
        bossBox.classList.remove('hidden');
        bossBox.classList.toggle('boss-phase2', activeBoss.phase === 2);
        document.getElementById('hud-boss-name').textContent = activeBoss.phase === 2 ? `🔥 ${activeBoss.name} [CUỒNG NỘ]` : activeBoss.name;
        document.getElementById('hud-boss-timer').textContent = c.timer > 0 ? `${Math.ceil(c.timer)}s` : '';
        document.getElementById('hud-boss-hp').style.width = `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%`;
      } else {
        bossBox.classList.add('hidden');
        bossBox.classList.remove('boss-phase2');
      }
      const btnDodge = document.getElementById('btn-dodge-dash');
      if (btnDodge && c.master) {
        const dcd = c.master.dodgeCd || 0;
        btnDodge.textContent = dcd > 0.05 ? `⚡ ${dcd.toFixed(1)}s` : '⚡ Né';
        btnDodge.classList.toggle('active', dcd <= 0.05);
      }

      const intAlert = document.getElementById('hud-interrupt-btn');
      if (c.telegraphs && c.telegraphs.length > 0) intAlert.classList.remove('hidden');
      else intAlert.classList.add('hidden');

      // Hide advanced HUD chrome during Prologue duel (solo Master + basic swordplay!)
      const isPro = c.mode === 'prologue';
      const dockEl = document.querySelector('.fh-bottom-dock');
      const cardsEl = document.querySelector('.fh-content-cards');
      const matesRow = document.getElementById('hud-mates-row');
      const guideBtn = document.getElementById('hud-guide-btn');
      if (dockEl) dockEl.classList.toggle('hidden', isPro);
      if (cardsEl) cardsEl.classList.toggle('hidden', isPro);
      if (matesRow) matesRow.classList.toggle('hidden', isPro);

      // Update lock state on menu dock & content cards
      document.querySelectorAll('.fh-bottom-dock .fh-menu-btn').forEach(btn => {
        const feat = btn.id === 'btn-goto-town' ? 'town' : btn.getAttribute('data-panel');
        btn.classList.toggle('locked-feat', !engine.isFeatureUnlocked(feat));
      });
      document.querySelectorAll('.fh-content-cards .fh-cont-card').forEach(btn => {
        const feat = btn.getAttribute('data-open-panel');
        btn.classList.toggle('locked-feat', !engine.isFeatureUnlocked(feat));
      });

      // Guided Progression Banner (Exact APK 6-Step Guide)
      const gStep = engine.getGuideStatus();
      if (guideBtn) {
        if (gStep && !isPro) {
          guideBtn.classList.remove('hidden');
          guideBtn.classList.toggle('ready-claim', gStep.done);
          document.getElementById('hud-guide-tag').textContent = gStep.done ? `${gStep.tag} · XONG!` : gStep.tag;
          document.getElementById('hud-guide-reward').textContent = gStep.done ? '🎁 Bấm Nhận Thưởng' : gStep.rewardTxt;
          document.getElementById('hud-guide-desc').textContent = gStep.desc;
          guideBtn.onclick = () => {
            if (gStep.done) {
              engine.claimGuideStep();
            } else if (gStep.panel === 'town_scene') {
              setSceneMode('town');
            } else if (gStep.panel) {
              openPanel(gStep.panel, gStep.tab || 0);
            } else {
              engine.toast(gStep.desc);
            }
          };
        } else {
          guideBtn.classList.add('hidden');
        }
      }

      // 4 Circular Mate Slots (Mate0..Mate3 with b_ring.png)
      let matesHtml = '';
      for (let i = 0; i < 4; i++) {
        const mt = c.mates[i];
        if (mt) {
          const pct = Math.max(0, Math.min(100, (mt.hp / Math.max(1, mt.maxHp)) * 100));
          matesHtml += `<div class="fh-mate-slot" data-mate-click="1" title="${mt.name}">
            <div class="fh-mate-ring">
              <img class="face" src="assets/img/pt_${mt.id}.png" alt="${mt.name}" />
              <img class="fh-ring-frame" src="assets/img/b_ring.png" alt="" />
            </div>
            <div class="fh-mate-hp"><div style="width:${pct}%"></div></div>
          </div>`;
        } else {
          matesHtml += `<div class="fh-mate-slot empty-mate" data-mate-click="1" title="Bấm để chiêu mộ & xuất trận đệ tử">
            <div class="fh-mate-ring">
              <div class="empty-plus">+</div>
              <img class="fh-ring-frame" src="assets/img/b_ring.png" alt="" />
            </div>
          </div>`;
        }
      }
      matesRow.innerHTML = matesHtml;
      matesRow.querySelectorAll('[data-mate-click]').forEach(el => {
        el.onclick = () => openPanel('disciple', 0);
      });

      // KitChip Resonance + 4 Skill Slots (with logical slot locks) + Ultimate
      const skBar = document.getElementById('hud-skills-bar');
      const unlockedSlots = engine.getUnlockedSkillSlots();
      const ultUnlocked = engine.isUltUnlocked();
      const reso = engine.getSchoolResonance();
      const fams = engine.data.game.fight.mugong.fams;
      let maxCnt = 0, bestFam = -1;
      reso.counts.forEach((cnt, idx) => { if (cnt > maxCnt) { maxCnt = cnt; bestFam = idx; } });
      document.getElementById('hud-kit-chip').textContent = isPro
        ? 'Kiếm Pháp Cơ Bản'
        : (maxCnt >= 2 && fams[bestFam] ? `${fams[bestFam].name} (${maxCnt}/4)` : 'Thái Hư Ngự Kiếm');

      const ultIconMap = ['mg_ult_kwae', 'mg_ult_seon', 'mg_ult_pae', 'mg_ult_naega'];
      const ultImg = reso.activeFamIdx >= 0 ? ultIconMap[reso.activeFamIdx] : 'mg_ult_base';
      const ultReady = ultUnlocked && c.master.ultCharge >= c.master.ultMax;
      const ultPct = Math.floor((c.master.ultCharge / c.master.ultMax) * 100);

      const lockHints = ['Xong Mở Đầu', 'Chỉ Dẫn 1 (Tu Luyện)', 'Vượt Ải 1', 'Chỉ Dẫn 5 (Chiêu Mộ)'];
      let skHtml = '';
      if (!isPro) {
        for (let i = 0; i < 4; i++) {
          if (i >= unlockedSlots) {
            skHtml += `<button class="skill-slot-btn locked-slot" data-locked-slot="${i}" title="Mở khóa tại: ${lockHints[i]}">
              <span>🔒</span>
              <span class="skill-key-hint">${i + 1}</span>
            </button>`;
            continue;
          }
          const sid = st.equippedSkills[i];
          const sk = sid ? engine.data.game.fight.skills.find(s => s.id === sid) : null;
          const cd = c.master.skillCds[i] || 0;
          if (!sk) {
            skHtml += `<button class="skill-slot-btn empty-skill-slot" data-open-arts-slot="${i}" title="Ô Tiên Pháp ${i + 1} đang trống — Bấm để chọn & gắn chiêu!">
              <span class="empty-slot-plus">+ Gắn</span>
              <span class="skill-key-hint">${i + 1}</span>
            </button>`;
            continue;
          }
          const icon = sk.icon || `mg_${sk.id}`;
          const hasTelegraph = c.telegraphs && c.telegraphs.length > 0 && cd <= 0;
          skHtml += `<button class="skill-slot-btn ${hasTelegraph ? 'combo-glow' : ''}" data-skill-slot="${i}" title="${sk.name}">
            <img src="assets/img/${icon}.png" alt="" onerror="this.src='assets/img/sk_wave.png'" />
            ${cd > 0.05 ? `<div class="skill-cd-mask">${cd.toFixed(1)}</div>` : ''}
            <span class="skill-key-hint">${i + 1}</span>
          </button>`;
        }
        if (ultUnlocked) {
          skHtml += `<button class="skill-slot-btn ult-slot ${ultReady ? 'combo-glow ult-ready' : ''}" id="btn-cast-ult" style="--ult-pct:${ultPct}%" title="Tuyệt Kỹ: ${(reso.activeUlt && reso.activeUlt.name) || 'Thái Hư Vạn Kiếm Quyết'} (Phím R)">
            <span class="ult-charge-ring"></span>
            <img src="assets/img/${ultImg}.png" alt="Tuyệt Kỹ" />
            ${!ultReady ? `<div class="skill-cd-mask ult-pct-mask">${ultPct}%</div>` : ''}
            <span class="skill-key-hint">R</span>
          </button>`;
        } else {
          skHtml += `<button class="skill-slot-btn ult-slot locked-slot" id="btn-cast-ult" title="Hoàn thành Mở Đầu để mở Tuyệt Kỹ">
            <span>🔒</span>
            <span class="skill-key-hint">TUYỆT</span>
          </button>`;
        }
      }
      skBar.innerHTML = skHtml;

      skBar.querySelectorAll('[data-locked-slot]').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-locked-slot'), 10);
          engine.toast(`Ô Kỹ Năng ${idx + 1} mở khóa khi: ${lockHints[idx]}!`);
          audio.playSfx('ui_deny');
        };
      });
      skBar.querySelectorAll('[data-open-arts-slot]').forEach(btn => {
        btn.onclick = () => openPanel('arts', 0);
      });
      skBar.querySelectorAll('[data-skill-slot]').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-skill-slot'), 10);
          if (!st.equippedSkills[idx]) openPanel('arts');
          else engine.castSkillSlot(idx);
        };
      });
      const ultBtn = document.getElementById('btn-cast-ult');
      if (ultBtn) ultBtn.onclick = () => {
        if (!ultUnlocked) {
          engine.toast('Tuyệt Kỹ mở khóa sau Chỉ Dẫn 5 (Chiêu Mộ) hoặc Vượt Ải 2!');
          audio.playSfx('ui_deny');
        } else {
          engine.castUltimate();
        }
      };
    }

    // TownHud & Floating 3D Hall Tags when in 3D Sect Courtyard mode
    const townLayer = document.getElementById('town-tags-layer');
    if (renderer.mode === 'town' && gameEntered) {
      townLayer.classList.remove('hidden');
      let totalLv = 0;
      let activeBuild = null;
      for (const hDef of engine.data.game.halls) {
        const hs = st.halls[hDef.id] || { lv: 0, buildEnd: 0 };
        totalLv += hs.lv || 0;
        if (hs.buildEnd > Date.now() && !activeBuild) {
          activeBuild = { def: hDef, st: hs };
        }
      }
      document.getElementById('th-sect-lv').textContent = `Tổng Cấp ${totalLv}`;

      const bldBox = document.getElementById('th-building-box');
      if (activeBuild) {
        bldBox.classList.remove('hidden');
        const rem = Math.max(1, Math.ceil((activeBuild.st.buildEnd - Date.now()) / 1000));
        const dur = Math.max(5, activeBuild.def.secBase || 10);
        const pct = Math.max(8, Math.min(98, 100 - (rem / dur) * 100));
        document.getElementById('th-bld-thumb').src = `assets/img/hallc_${activeBuild.def.id}.png`;
        document.getElementById('th-bld-name').textContent = activeBuild.def.name;
        document.getElementById('th-bld-time').textContent = `${rem}s`;
        document.getElementById('th-bld-fill').style.width = `${pct}%`;
        bldBox.onclick = () => { selectedItem = activeBuild.def.id; openPanel('town', 0); };
      } else {
        bldBox.classList.add('hidden');
      }

      const resIconMap = { coin: 'coin', xp: 'ut_daily_xp', scroll: 'res_scroll', pill: 'res_pill', core: 'res_core', herb: 'res_herb' };
      let tagsHtml = '';
      for (const hDef of engine.data.game.halls) {
        const sp = renderer.hallScreenPos[hDef.id];
        if (!sp || sp.x < -60 || sp.x > renderer.width + 60 || sp.y < -40 || sp.y > renderer.height + 60) continue;
        const hSt = st.halls[hDef.id] || { lv: 0, stored: 0, buildEnd: 0 };
        const building = hSt.buildEnd > Date.now();
        const remSec = building ? Math.ceil((hSt.buildEnd - Date.now()) / 1000) : 0;
        const storedAmt = Math.floor(hSt.stored || 0);

        const safeTop = (hDef.id === 'main' || (sp.x > 260 && sp.x < 680)) ? Math.max(96, sp.y) : Math.max(76, sp.y);
        tagsHtml += `<div class="town-hall-tag" style="left:${sp.x}px;top:${safeTop}px;" data-hall-id="${hDef.id}">
          ${storedAmt >= 1 ? `<div class="town-harvest-bubble" data-harvest-id="${hDef.id}">
            <img src="assets/img/${resIconMap[hDef.res] || 'coin'}.png" alt="" />
            <span>+${fmt(storedAmt)}</span>
          </div>` : ''}
          <div class="town-name-plate">
            ${building ? `🔨 ${hDef.name} (${remSec}s)` : `${hDef.name}<span class="lv-chip">${hDef.locked ? 'Khoá' : (hSt.lv > 0 ? 'Lv.' + hSt.lv : '')}</span>`}
          </div>
          ${!hDef.locked && hSt.lv === 0 && !building ? `<div class="town-rebuild-badge">
            <img src="assets/img/rebuild.png" alt="" />
            <span>Tái Thiết</span>
          </div>` : ''}
        </div>`;
      }
      // Clickable 3D Town Disciple Affinity Chips (gift pill/coin directly in 3D Sect Courtyard!)
      const npcPos = renderer.townNpcScreenPos || {};
      for (const [did, sp] of Object.entries(npcPos)) {
        if (!sp || sp.x < 40 || sp.x > renderer.width - 40 || sp.y < 60 || sp.y > renderer.height - 80) continue;
        const dDef = engine.data.game.disciples.find(d => d.id === did);
        if (!dDef) continue;
        const bondLv = (st.discipleBond && st.discipleBond[did]) || 0;
        tagsHtml += `<button class="town-disc-chip" style="left:${sp.x}px;top:${sp.y}px;" data-town-disc="${did}" title="Bấm tặng lễ cho ${dDef.name} (+2% Công/Máu toàn phái mỗi cấp)">
          💚 ${dDef.name} ${bondLv > 0 ? `♥${bondLv}` : ''}
        </button>`;
      }
      // Multiplayer Shared 3D Town Plaza Cultivator Chips (Click to Inspect 6-Slot Gear!)
      const plazaPos = renderer.townPlazaScreenPos || [];
      for (const pp of plazaPos) {
        if (!pp || pp.x < 45 || pp.x > renderer.width - 45 || pp.y < 60 || pp.y > renderer.height - 90) continue;
        const vipTag = pp.vipLv > 0 ? `<span class="plz-vip">VIP${pp.vipLv}</span>` : '';
        tagsHtml += `<button class="town-plaza-chip" style="left:${pp.x}px;top:${pp.y}px;" data-inspect-pid="${pp.id}" title="Bấm soi trang bị & ngoại trang của ${pp.username}">
          <span class="on-dot ${pp.online ? 'live' : ''}"></span>${vipTag} <b>${pp.username}</b> · ⚡${fmt(pp.power)}
        </button>`;
      }
      townLayer.innerHTML = tagsHtml;
      townLayer.querySelectorAll('[data-inspect-pid]').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          const raw = el.getAttribute('data-inspect-pid');
          const pid = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
          if (window.openInspectPlayerModal) window.openInspectPlayerModal(pid);
        };
      });
      townLayer.querySelectorAll('[data-town-disc]').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          const did = el.getAttribute('data-town-disc');
          const dDef = engine.data.game.disciples.find(d => d.id === did);
          const bondLv = (st.discipleBond && st.discipleBond[did]) || 0;
          const hasQi = st.pills && st.pills.qi > 0;
          playStorySequence({
            title: `Nhân Duyên Đồng Môn · ${dDef ? dDef.name : did} (Thân Thiết Cấp ${bondLv}/10)`,
            lines: [{
              who: dDef ? `${dDef.title} · ${dDef.name}` : did,
              fig: `full_${did}`,
              text: `Tham kiến Tông Chủ! Đệ tử đang tĩnh tâm tu luyện tại sơn môn.\nĐộ thân thiết hiện tại: Cấp ${bondLv}/10 (+${bondLv * 2}% Công & Máu toàn phái).`
            }],
            choices: [
              { label: hasQi ? '🎁 Tặng 1 Tụ Khí Đan (+1 Thân Thiết)' : '🎁 Tặng 120 Linh Thạch (+1 Thân Thiết)', onPick: () => engine.giftDisciplePill(did) },
              { label: 'Tiếp Tục Tu Luyện', onPick: () => {} }
            ]
          });
        };
      });
      townLayer.querySelectorAll('[data-harvest-id]').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          engine.collectHall(el.getAttribute('data-harvest-id'));
        };
      });
      townLayer.querySelectorAll('[data-hall-id]').forEach(el => {
        el.onclick = () => {
          selectedItem = el.getAttribute('data-hall-id');
          openPanel('town', 0);
        };
      });
    } else {
      townLayer.classList.add('hidden');
    }
  }

  engine.onUiDirty = () => {
    updateHud();
    if (activePanel) renderModalContent();
  };

  // ==================== MODAL PANEL SYSTEM ====================
  function openPanel(panelName, tabIdx = 0) {
    if (!engine.isFeatureUnlocked(panelName)) {
      engine.toast(engine.getFeatureLockMsg(panelName));
      audio.playSfx('ui_deny');
      return;
    }
    activePanel = panelName;
    activeTab = tabIdx;
    audio.playSfx('ui_tab');
    document.getElementById('modal-backdrop').classList.remove('hidden');
    document.querySelectorAll('.fh-menu-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-panel') === panelName);
    });
    renderModalContent();
  }

  function closePanel() {
    activePanel = '';
    document.getElementById('modal-backdrop').classList.add('hidden');
    document.querySelectorAll('.fh-menu-btn').forEach(b => b.classList.remove('active'));
    audio.playSfx('ui_click');
  }

  document.getElementById('btn-modal-close').onclick = closePanel;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closePanel();
  };

  function setModalHeader(title, tabs = []) {
    document.getElementById('modal-title').textContent = title;
    const tabsEl = document.getElementById('modal-tabs');
    tabsEl.innerHTML = tabs.map((lbl, idx) =>
      `<button class="panel-tab ${idx === activeTab ? 'active' : ''}" data-tab-idx="${idx}">${lbl}</button>`
    ).join('');
    tabsEl.querySelectorAll('[data-tab-idx]').forEach(btn => {
      btn.onclick = () => {
        activeTab = parseInt(btn.getAttribute('data-tab-idx'), 10);
        selectedItem = null;
        audio.playSfx('ui_tab');
        renderModalContent();
      };
    });
  }

  function renderModalContent() {
    const body = document.getElementById('modal-body');
    body.className = 'panel-body';
    if (!activePanel) return;

    if (activePanel === 'growth') renderGrowthPanel(body);
    else if (activePanel === 'artifact') renderArtifactPanel(body);
    else if (activePanel === 'alchemy') renderAlchemyPanel(body);
    else if (activePanel === 'arts') renderArtsPanel(body);
    else if (activePanel === 'disciple') renderDisciplePanel(body);
    else if (activePanel === 'town') renderTownPanel(body);
    else if (activePanel === 'jianghu') renderJianghuPanel(body);
    else if (activePanel === 'trial') renderTrialPanel(body);
    else if (activePanel === 'murim') renderMurimPanel(body);
    else if (activePanel === 'season') renderSeasonPanel(body);
    else if (activePanel === 'story') renderStoryArchivePanel(body);
    else if (activePanel === 'shop') renderShopPanel(body);
    else if (activePanel === 'settings') renderSettingsPanel(body);
    else if (activePanel === 'online' && window.renderOnlineHubPanel) {
      window.renderOnlineHubPanel(body, activeTab, setModalHeader, closePanel, updateHud);
    }
  }

  // 1B. TRANG BỊ THẦN BINH 3D (ĐỔI VŨ KHÍ TRÊN TAY + ĐỔI DÀN PHI KIẾM) & PHÁP BẢO 3D HỘ THÂN
  let gearSlotFilter = 'all';

  function renderArtifactPanel(body) {
    const st = engine.state;
    const swLvNow = (st.swordArray && st.swordArray.lv) || 0;
    const petCnt = Object.values(st.pets || {}).filter(p => p && p.lv > 0).length;
    setModalHeader('Luyện Khí · Trang Bị, Kiếm Trận & Ngoại Trang', ['Trang Bị Thần Binh', `Ngự Kiếm Trận (${swLvNow}/9)`, 'Pháp Bảo Hộ Thân', `Linh Thú 3D (${petCnt}/4)`, '✨ Tiên Dực & Hào Quang']);

    if (activeTab === 0) {
      const allGear = engine.getEquipmentDef();
      const eq = st.gearEquipped || { weapon: 'wp_iron_jian', helm: null, armor: null, jade: null, ring: null, boots: null };
      const owned = st.gearOwned || { wp_iron_jian: 1 };
      const smithyLv = (st.halls && st.halls.smithy && st.halls.smithy.lv) || 0;
      const gSet = engine.getGearSetBonus();
      const slotDefs = window.GEAR_SLOTS_DEF || [
        { id: 'weapon', name: 'Vũ Khí 3D', short: 'Vũ Khí' },
        { id: 'helm',   name: 'Đạo Quán',  short: 'Đạo Quán' },
        { id: 'armor',  name: 'Đạo Bào',   short: 'Đạo Bào' },
        { id: 'jade',   name: 'Ngọc Bội',  short: 'Ngọc Bội' },
        { id: 'ring',   name: 'Linh Giới', short: 'Linh Giới' },
        { id: 'boots',  name: 'Thần Ngoa', short: 'Thần Ngoa' }
      ];
      const slotLabels = {};
      slotDefs.forEach(s => { slotLabels[s.id] = s.name; });

      const list = gearSlotFilter === 'all' ? allGear : allGear.filter(g => g.slot === gearSlotFilter);
      if (!selectedItem || !allGear.some(g => g.id === selectedItem)) selectedItem = eq.weapon || allGear[0].id;
      const sel = allGear.find(g => g.id === selectedItem) || allGear[0];
      const selLv = owned[sel.id] || 0;
      const isEq = eq[sel.slot] === sel.id;
      const statsCur = engine.getEquipmentItemStats(sel.id, Math.max(1, selLv));
      const cost = engine.getGearCost(sel.id, selLv > 0);
      const canAfford = st.coin >= cost.coin && (st.herb || 0) >= cost.herb && (st.core || 0) >= cost.core && (st.essence || 0) >= (cost.essence || 0);
      const subPool = window.GEAR_SUBSTAT_POOL || [];
      const gemDefs = window.GEMS_DEF || [];
      const gradeCfg = (window.GEAR_GRADES_CFG && window.GEAR_GRADES_CFG[sel.grade]) || { sockets: 2 };
      const selSubs = (st.gearSubstats && st.gearSubstats[sel.id]) || [];
      const selSocks = (st.gearSockets && st.gearSockets[sel.id]) || [];
      const lockCnt = selSubs.filter(x => x && x.locked).length;
      const refEss = 10 + lockCnt * 6;
      const refHerb = 6;
      const refCore = lockCnt * 5;
      const setInfo = sel.setId ? (window.GEAR_SETS_DEF || []).find(s => s.id === sel.setId) : null;

      const statLine = (s) => {
        const parts = [];
        if (s.atk) parts.push(`⚔ Công +${s.atk}`);
        if (s.hp) parts.push(`❤ Máu +${s.hp}`);
        if (s.def) parts.push(`🛡 Thủ +${s.def}`);
        if (s.crit) parts.push(`💥 Bạo +${Math.round(s.crit * 100)}%`);
        if (s.critDmg) parts.push(`🔥 Sát Bạo +${Math.round(s.critDmg * 100)}%`);
        return parts.join(' · ') || 'Cơ bản';
      };

      const availableGems = [];
      for (const gd of gemDefs) {
        const arr = (st.gems && st.gems[gd.id]) || [0, 0, 0, 0, 0];
        arr.forEach((cnt, li) => {
          if (cnt > 0) availableGems.push({ id: gd.id, name: gd.name, lv: li + 1, cnt, col: gd.col });
        });
      }

      body.innerHTML = `
        <div class="panel-col-scroll">
          <div class="tm-mat-strip">
            <span><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> <b>${fmt(st.coin)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> <b>${fmt(st.herb || 0)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> <b>${fmt(st.core || 0)}</b></span>
            <span title="Tinh Thạch Luyện Khí (đập +16..30 & Tẩy Luyện)">💠 <b>${fmt(st.essence || 0)} Tinh Thạch</b></span>
            ${smithyLv > 0 ? `<span style="color:#1b6b45;font-weight:900;">Luyện Khí Lv.${smithyLv} (-${Math.min(55, smithyLv * 4)}%)</span>` : ''}
          </div>
          <div class="tm-eq-slots-bar" style="grid-template-columns:repeat(3,1fr);">
            ${slotDefs.map(sl => {
              const eid = eq[sl.id];
              const g = eid ? allGear.find(x => x.id === eid) : null;
              const lv = eid ? (owned[eid] || 1) : 0;
              return `<div class="tm-eq-slot-chip ${g && g.id === sel.id ? 'active' : ''}" data-slot-pick="${g ? g.id : ''}" data-slot-filter="${sl.id}">
                <div class="tm-eq-slot-ico" style="border-color:${g ? g.gradeCol : '#8a9194'}">
                  ${g ? `<img src="assets/img/${g.img}.png" alt="${g.name}" />` : `<span>+</span>`}
                </div>
                <div class="tm-eq-slot-meta">
                  <div class="slot-lbl">${sl.short}</div>
                  <div class="slot-val">${g ? `${g.name.split(' ').slice(0, 2).join(' ')} +${lv}` : 'Trống'}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="tm-set-banner ${gSet.tier > 0 ? 'active' : ''}">
            <div style="font-weight:900;font-size:12.5px;">✨ Cộng Hưởng 5 Bộ Trang Bị: ${gSet.name}</div>
            <div style="font-size:11.5px;opacity:0.95;margin-top:2px;">
              ${gSet.activeSets && gSet.activeSets.length
                ? gSet.activeSets.map(as => `<span style="color:${as.col};font-weight:800;">● ${as.name}</span>: ${as.desc}`).join('<br/>')
                : 'Đeo 2 / 4 / 6 món cùng Bộ (Thanh Lam · Xích Viêm · Cửu Tiêu · Thái Hư · Hồng Mông) để kích hoạt Set Buff cực mạnh!'}
            </div>
          </div>
          <div class="tm-filter-row" style="flex-wrap:wrap;">
            ${[['all', `Tất Cả (${allGear.length})`], ...slotDefs.map(s => [s.id, s.short]), ['gems', '💎 Linh Châu']].map(([k, lbl]) =>
              `<button class="tm-filter-btn ${gearSlotFilter === k ? 'active' : ''}" data-gfilter="${k}">${lbl}</button>`
            ).join('')}
          </div>
          ${gearSlotFilter === 'gems' ? `
            <div style="font-weight:900;font-size:13.5px;margin:4px 0;">💎 Kho Ngũ Hành Linh Châu & Hợp Thành (3 → 1 Cấp Cao)</div>
            ${gemDefs.map(gd => {
              const arr = (st.gems && st.gems[gd.id]) || [0, 0, 0, 0, 0];
              return `<div class="item-row-card" style="flex-direction:column;align-items:stretch;gap:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <b style="color:#1c292b;">💎 ${gd.name} <span class="tag-pill" style="background:${gd.col};color:#111;">Hệ ${gd.elem}</span></b>
                  <span style="font-size:11px;color:#555;">${gd.desc}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                  ${arr.map((cnt, li) => `<span style="font-size:11.5px;background:rgba(20,52,58,0.08);padding:3px 7px;border-radius:6px;">Lv.${li + 1}: <b>${cnt}</b>${li < 4 && cnt >= 3 ? ` <button class="btn-wuxia jade" style="padding:1px 6px;font-size:10px;" data-comb-gem="${gd.id}" data-comb-lv="${li}">Hợp→Lv.${li + 2}</button>` : ''}</span>`).join('')}
                </div>
              </div>`;
            }).join('')}
          ` : list.map(g => {
            const lv = owned[g.id] || 0;
            const on = eq[g.slot] === g.id;
            const rCls = g.grade === 'Hồng Mông' ? 'rarity-hongmong' : ((g.grade === 'Tiên Phẩm' || g.grade === 'Thiên Phẩm') ? 'rarity-tien' : (g.grade === 'Địa Phẩm' ? 'rarity-dia' : (g.grade === 'Linh Phẩm' ? 'rarity-linh' : '')));
            return `<div class="item-row-card ${rCls} ${g.id === sel.id ? 'selected' : ''}" data-gear-sel="${g.id}">
              <div class="item-left">
                <div class="tm-art-ico" style="border-color:${g.gradeCol}"><img src="assets/img/${g.img}.png" alt="${g.name}" /></div>
                <div>
                  <div class="item-name">${g.name} <span class="tag-pill rarity-pill" style="--rar-col:${g.gradeCol}">${g.grade}</span> ${lv > 0 ? `<span class="tag-pill jade">+${lv}</span>` : ''}</div>
                  <div class="item-sub">${slotLabels[g.slot]} · ${statLine(engine.getEquipmentItemStats(g.id, Math.max(1, lv)))}</div>
                </div>
              </div>
              <div>
                ${on ? `<span class="tag-pill gold">Đang Đeo</span>` : (lv > 0 ? `<span class="tag-pill">Đã Có</span>` : `<span class="tag-pill">Chưa Rèn</span>`)}
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-detail-box" style="overflow-y:auto;">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <div class="tm-art-ico big" style="border-color:${sel.gradeCol}"><img src="assets/img/${sel.img}.png" alt="${sel.name}" /></div>
              <div>
                <h3 style="margin:0;font-family:var(--font-serif);font-size:17px;">${sel.name} ${selLv > 0 ? `+${selLv}` : ''}</h3>
                <div style="font-size:11.5px;font-weight:900;color:${sel.gradeCol};text-shadow:0 1px 1px rgba(0,0,0,0.2);">${sel.grade} · ${slotLabels[sel.slot]}${setInfo ? ` · ${setInfo.name}` : ''}</div>
              </div>
            </div>
            <p style="font-size:12.5px;line-height:1.45;color:var(--ink-mid);margin:0 0 8px;">${sel.desc}</p>
            <div class="tm-stat-box">
              <div style="font-size:11px;color:var(--ink-soft);font-weight:800;">CHỈ SỐ CƠ BẢN ${selLv > 0 ? `(+${selLv}/30)` : '(+1)'}</div>
              <div style="font-size:13px;font-weight:900;color:var(--jade-dark);margin-top:2px;">${statLine(statsCur)}</div>
              ${selLv > 0 ? `
                <div style="margin-top:8px;padding-top:6px;border-top:1px dashed #c8be9e;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:900;color:#444;">🎲 DÒNG PHỤ TẨY LUYỆN (${selSubs.length})</span>
                    <button class="btn-wuxia jade" id="btn-reforge-subs" style="padding:3px 9px;font-size:11px;">✨ Tẩy (${refEss}💠+${refHerb}🌿${refCore ? `+${refCore}🔮` : ''})</button>
                  </div>
                  ${selSubs.length ? selSubs.map((sb, sIdx) => {
                    const pDef = subPool.find(x => x.key === sb.key) || { name: sb.key, unit: '%' };
                    const qCol = sb.grade === 'Đỏ' ? '#c92a2a' : (sb.grade === 'Tím' ? '#7938b8' : '#1b6ca8');
                    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;margin-top:2px;">
                      <span style="color:${qCol};font-weight:800;">[${sb.grade}] ${pDef.name} +${sb.val}${pDef.unit}</span>
                      <button class="btn-wuxia" data-lock-sub="${sIdx}" style="padding:1px 6px;font-size:10px;">${sb.locked ? '🔒 Đã Khóa' : '🔓 Khóa'}</button>
                    </div>`;
                  }).join('') : `<div style="font-size:11px;color:#777;">Chưa có dòng phụ — bấm Tẩy Luyện để mở!</div>`}
                </div>
                <div style="margin-top:8px;padding-top:6px;border-top:1px dashed #c8be9e;">
                  <div style="font-size:11px;font-weight:900;color:#444;margin-bottom:4px;">💎 KHẢM NGŨ HÀNH LINH CHÂU (${gradeCfg.sockets} Lỗ)</div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    ${Array.from({ length: gradeCfg.sockets }, (_, si) => {
                      const sk = selSocks[si];
                      const gDef = sk ? gemDefs.find(g => g.id === sk.id) : null;
                      return sk && gDef
                        ? `<button class="btn-wuxia" style="padding:3px 8px;font-size:11px;border-color:${gDef.col};" data-unsock="${si}" title="Bấm để tháo Linh Châu">💎 ${gDef.elem} Lv.${sk.lv} ✕</button>`
                        : `<span style="font-size:11px;padding:3px 8px;border-radius:6px;border:1px dashed #999;color:#666;">Lỗ ${si + 1}: Trống</span>`;
                    }).join('')}
                  </div>
                  ${availableGems.length ? `<div style="display:flex;gap:4px;margin-top:5px;align-items:center;">
                    <select id="gem-sock-pick" class="on-input" style="margin:0;padding:3px 6px;font-size:11px;flex:1;">
                      ${availableGems.map(ag => `<option value="${ag.id}:${ag.lv}">${ag.name} Lv.${ag.lv} (×${ag.cnt})</option>`).join('')}
                    </select>
                    <button class="btn-wuxia jade" id="btn-do-socket-gem" style="padding:4px 9px;font-size:11px;">Khảm Vào</button>
                  </div>` : `<div style="font-size:11px;color:#777;margin-top:3px;">Săn Boss hoặc mua Linh Châu trên Tiên Thị để khảm!</div>`}
                </div>
              ` : ''}
            </div>
            ${selLv < 30 ? `<div class="tm-cost-box" style="margin-top:6px;">
              <div style="font-size:11px;color:var(--ink-soft);font-weight:800;margin-bottom:4px;">NGUYÊN LIỆU ${selLv > 0 ? `CƯỜNG HÓA +${selLv + 1}` : 'KHAI LÒ RÈN'}</div>
              <div class="tm-cost-pills">
                <span class="${st.coin >= cost.coin ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> ${fmt(cost.coin)}</span>
                <span class="${(st.herb || 0) >= cost.herb ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> ${cost.herb}</span>
                <span class="${(st.core || 0) >= cost.core ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> ${cost.core}</span>
                ${cost.essence ? `<span class="${(st.essence || 0) >= cost.essence ? 'ok' : 'no'}">💠 ${cost.essence}</span>` : ''}
              </div>
            </div>` : '<div class="tm-stat-box"><b>Đã đạt cảnh giới Cường Hóa tối đa (+30)!</b></div>'}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
            ${selLv === 0 ? `<button class="btn-wuxia gold" id="btn-forge-gear" style="flex:1;" ${canAfford ? '' : 'disabled'}>Rèn & Đeo Ngay!</button>` : `
              ${!isEq ? `<button class="btn-wuxia jade" id="btn-equip-gear" style="flex:1;">Trang Bị</button>` : `<button class="btn-wuxia" disabled style="opacity:0.75;">Đang Đeo</button>`}
              ${selLv < 30 ? `<button class="btn-wuxia gold" id="btn-forge-gear" style="flex:1;" ${canAfford ? '' : 'disabled'}>Đập +${selLv + 1}</button>` : ''}
              ${!isEq && sel.id !== 'wp_iron_jian' ? `<button class="btn-wuxia crimson" id="btn-salvage-gear" style="padding:6px 10px;">♻ Phân Giải</button>` : ''}
            `}
          </div>
        </div>
      `;

      body.querySelectorAll('[data-gfilter]').forEach(btn => {
        btn.onclick = () => {
          gearSlotFilter = btn.getAttribute('data-gfilter');
          audio.playSfx('ui_click');
          renderArtifactPanel(body);
        };
      });
      body.querySelectorAll('[data-slot-filter]').forEach(el => {
        el.onclick = () => {
          const gid = el.getAttribute('data-slot-pick');
          gearSlotFilter = el.getAttribute('data-slot-filter');
          if (gid) selectedItem = gid;
          audio.playSfx('ui_click');
          renderArtifactPanel(body);
        };
      });
      body.querySelectorAll('[data-gear-sel]').forEach(el => {
        el.onclick = () => {
          selectedItem = el.getAttribute('data-gear-sel');
          audio.playSfx('ui_click');
          renderArtifactPanel(body);
        };
      });
      body.querySelectorAll('[data-comb-gem]').forEach(btn => {
        btn.onclick = () => engine.combineGem(btn.getAttribute('data-comb-gem'), parseInt(btn.getAttribute('data-comb-lv'), 10));
      });
      body.querySelectorAll('[data-lock-sub]').forEach(btn => {
        btn.onclick = () => engine.toggleLockSubstat(sel.id, parseInt(btn.getAttribute('data-lock-sub'), 10));
      });
      body.querySelectorAll('[data-unsock]').forEach(btn => {
        btn.onclick = () => engine.unsocketGem(sel.id, parseInt(btn.getAttribute('data-unsock'), 10));
      });
      const bRef = document.getElementById('btn-reforge-subs');
      if (bRef) bRef.onclick = () => engine.reforgeGearSubstats(sel.id);
      const bSock = document.getElementById('btn-do-socket-gem');
      if (bSock) bSock.onclick = () => {
        const val = (document.getElementById('gem-sock-pick') || {}).value || '';
        const [gid, glvStr] = val.split(':');
        const glv = parseInt(glvStr, 10);
        const curS = (st.gearSockets && st.gearSockets[sel.id]) || [];
        let tSlot = 0;
        for (let si = 0; si < gradeCfg.sockets; si++) {
          if (!curS[si]) { tSlot = si; break; }
        }
        if (gid && glv) engine.socketGem(sel.id, tSlot, gid, glv);
      };
      const bSalv = document.getElementById('btn-salvage-gear');
      if (bSalv) bSalv.onclick = () => { if (engine.salvageGear(sel.id)) { selectedItem = eq.weapon || 'wp_iron_jian'; renderArtifactPanel(body); } };
      const forgeBtn = document.getElementById('btn-forge-gear');
      if (forgeBtn) forgeBtn.onclick = () => engine.forgeOrUpgradeGear(sel.id);
      const eqGearBtn = document.getElementById('btn-equip-gear');
      if (eqGearBtn) eqGearBtn.onclick = () => engine.equipGear(sel.id);
      return;
    }

    // Tab 1: HỆ THỐNG RIÊNG — NGỰ KIẾM TRẬN (PHI BINH SAU LƯNG 0 → 9 CÂY!)
    if (activeTab === 1) {
      const swSt = st.swordArray || { lv: 0, active: true };
      const curLv = Math.max(0, Math.min(9, swSt.lv || 0));
      const tiers = engine.getSwordArrayTiers();
      const curT = tiers[curLv];
      const nextT = curLv < 9 ? tiers[curLv + 1] : null;
      const wVis = engine.getEquippedWeaponVisual();
      const canUp = nextT && st.coin >= nextT.cost.coin && (st.herb || 0) >= nextT.cost.herb && (st.core || 0) >= nextT.cost.core;

      body.innerHTML = `
        <div class="panel-col-scroll">
          <div class="tm-mat-strip">
            <span><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> Linh Thạch: <b>${fmt(st.coin)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> Linh Thảo: <b>${fmt(st.herb || 0)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> Yêu Đan: <b>${fmt(st.core || 0)}</b></span>
          </div>
          <div class="tm-swarr-diagram">
            <div class="tm-swarr-title">${curT.name} · ${curLv}/9 Phi Binh</div>
            <div class="tm-swarr-slots">
              ${Array.from({ length: 9 }, (_, idx) => {
                const on = idx < curLv;
                const arcOff = Math.abs(idx - 4) * 5;
                return `<div class="tm-swarr-pip ${on ? 'lit' : ''}" style="transform:translateY(${arcOff}px);" title="Thanh #${idx + 1}">
                  <img src="assets/img/art_sword.png" alt="" />
                  <span>${idx + 1}</span>
                </div>`;
              }).join('')}
            </div>
            <div class="tm-swarr-sub">Đang đồng bộ hình thái 1:1 theo vũ khí cầm tay: <b style="color:#6df5e8;">${wVis.name}</b></div>
          </div>
          <div class="tm-swform-row">
            ${engine.getSwordArrayFormations().map(fm => {
              const curF = (swSt.formation || 'fan') === fm.id;
              return `<button class="tm-swform-btn ${curF ? 'active' : ''}" data-swform="${fm.id}">
                <div class="f-nm">${fm.name}</div>
                <div class="f-tag">${fm.tag}</div>
              </button>`;
            }).join('')}
          </div>
          <div style="font-size:11.5px;color:var(--ink-mid);background:rgba(40,108,79,0.08);padding:7px 10px;border-radius:8px;margin-bottom:8px;">
            ${(engine.getSwordArrayFormations().find(f => f.id === (swSt.formation || 'fan')) || engine.getSwordArrayFormations()[0]).desc}
          </div>
          ${tiers.slice(1).map(t => `
            <div class="item-row-card ${t.lv === curLv ? 'selected' : ''}" style="cursor:default;opacity:${t.lv <= curLv ? 1 : 0.72};">
              <div class="item-left">
                <div class="tm-art-ico" style="width:34px;height:34px;border-color:${t.lv <= curLv ? '#52fff0' : '#6c7578'};"><img src="assets/img/art_sword.png" alt="" /></div>
                <div>
                  <div class="item-name">Cấp ${t.lv} · ${t.name} <span class="tag-pill ${t.lv <= curLv ? 'jade' : ''}">${t.count} cây</span></div>
                  <div class="item-sub">+${t.atkPct}% Công · Phóng ${t.volley} thanh / ${t.cd.toFixed(2)}s (${Math.round(t.dmgMul * 100)}% Công)</div>
                </div>
              </div>
              <div>${t.lv <= curLv ? '<span class="tag-pill gold">Đã Đạt</span>' : (t.lv === curLv + 1 ? '<span class="tag-pill jade">Kế Tiếp</span>' : '')}</div>
            </div>
          `).join('')}
        </div>
        <div class="panel-detail-box">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div class="tm-art-ico big" style="border-color:#52fff0;"><img src="assets/img/art_sword.png" alt="Ngự Kiếm Trận" /></div>
              <div>
                <h3 style="margin:0;font-family:var(--font-serif);">Ngự Kiếm Trận (${curLv}/9)</h3>
                <div style="font-size:12px;color:var(--jade-dark);font-weight:900;">${curT.name}</div>
              </div>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--ink-mid);margin:0 0 12px;">
              Hệ thống Phi Binh độc lập phía sau lưng Tông Chủ (lấy tâm ngay chính giữa sau đầu, kích cỡ chuẩn 1:1 vũ khí cầm tay).
              Mỗi thanh Phi Binh sẽ tự tách khỏi trận bay cong chém địch rồi vòng về đội hình!
            </p>
            <div class="tm-stat-box">
              <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;">TRẠNG THÁI HIỆN TẠI</div>
              <div style="font-size:13.5px;font-weight:900;color:var(--jade-dark);margin-top:4px;">
                ${curLv === 0
                  ? 'Chưa khai mở (0/9 thanh) — Hãy nâng lên Cấp 1 để triệu hoán thanh Phi Binh đầu tiên sau đầu!'
                  : `Số lượng: ${curT.count} cây · +${curT.atkPct}% Công · Phóng ${curT.volley} thanh / ${curT.cd.toFixed(2)}s (${Math.round(curT.dmgMul * 100)}% Công)`}
              </div>
            </div>
            ${nextT ? `<div class="tm-cost-box">
              <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;margin-bottom:6px;">NGUYÊN LIỆU ${curLv === 0 ? 'KHAI MỞ NHẤT KIẾM (1/9)' : `ĐỘT PHÁ CẤP ${nextT.lv} (${nextT.count}/9 CÂY)`}</div>
              <div class="tm-cost-pills">
                <span class="${st.coin >= nextT.cost.coin ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> ${fmt(nextT.cost.coin)} Linh Thạch</span>
                <span class="${(st.herb || 0) >= nextT.cost.herb ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> ${nextT.cost.herb} Linh Thảo</span>
                <span class="${(st.core || 0) >= nextT.cost.core ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> ${nextT.cost.core} Yêu Đan</span>
              </div>
            </div>` : '<div class="tm-stat-box"><b>Đã viên mãn Cửu Kiếm Quy Tông Đại Trận (9/9 cây tối đa)!</b></div>'}
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${nextT ? `<button class="btn-wuxia gold" id="btn-up-swarr" style="flex:1;" ${canUp ? '' : 'disabled'}>
              ${curLv === 0 ? 'Khai Mở Nhất Kiếm (1/9)' : `Đột Phá Lên ${nextT.count}/9 Cây`}
            </button>` : ''}
            ${curLv > 0 ? `<button class="btn-wuxia" id="btn-toggle-swarr">${swSt.active ? 'Thu Hồi Kiếm Trận' : 'Triệu Hoán Sau Lưng'}</button>` : ''}
          </div>
        </div>
      `;

      body.querySelectorAll('[data-swform]').forEach(btn => {
        btn.onclick = () => engine.setSwordArrayFormation(btn.getAttribute('data-swform'));
      });
      const upBtn = document.getElementById('btn-up-swarr');
      if (upBtn) upBtn.onclick = () => engine.upgradeSwordArray();
      const togBtn = document.getElementById('btn-toggle-swarr');
      if (togBtn) togBtn.onclick = () => engine.toggleSwordArrayActive();
      return;
    }

    // Tab 3: HỆ THỐNG LINH THÚ HỘ MỆNH 3D (4 LOÀI × 3 BẬC TIẾN HÓA!)
    if (activeTab === 3) {
      const petsDef = engine.getSpiritPetsDef();
      if (!selectedItem || !petsDef.some(p => p.id === selectedItem)) selectedItem = st.petActive || petsDef[0].id;
      const sel = petsDef.find(p => p.id === selectedItem) || petsDef[0];
      const pSt = (st.pets && st.pets[sel.id]) || { lv: 0 };
      const lv = pSt.lv || 0;
      const evoName = lv >= 10 ? 'Thánh Thú (Bậc 3)' : (lv >= 5 ? 'Thành Thể (Bậc 2)' : (lv > 0 ? 'Ấu Thể (Bậc 1)' : 'Chưa Khế Ước'));
      const isAct = st.petActive === sel.id;
      const cost = sel.cost(lv);
      const canFeed = lv < 15 && st.coin >= cost.coin && (st.herb || 0) >= cost.herb && (st.core || 0) >= cost.core;

      body.innerHTML = `
        <div class="panel-col-scroll">
          <div class="tm-mat-strip">
            <span><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> <b>${fmt(st.coin)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> Linh Thảo: <b>${fmt(st.herb || 0)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> Yêu Đan: <b>${fmt(st.core || 0)}</b></span>
          </div>
          ${petsDef.map(p => {
            const plv = (st.pets && st.pets[p.id] && st.pets[p.id].lv) || 0;
            const eq = st.petActive === p.id;
            const evo = plv >= 10 ? 'Thánh Thú' : (plv >= 5 ? 'Thành Thể' : (plv > 0 ? 'Ấu Thể' : 'Chưa Có'));
            return `<div class="item-row-card ${p.rarity || 'rarity-linh'} ${p.id === sel.id ? 'selected' : ''}" data-pet-sel="${p.id}">
              <div class="item-left">
                <div class="tm-art-ico tm-pet-ico" style="border-color:${p.color};box-shadow:0 0 10px ${p.color}44;"><img src="assets/img/pet_${p.id}.png?v=30" alt="${p.name}" /></div>
                <div>
                  <div class="item-name">${p.name} <span class="tag-pill rarity-pill" style="--rar-col:${p.gradeCol || p.color}">${p.grade || 'Linh Phẩm'} ${p.stars || ''}</span> ${plv > 0 ? `<span class="tag-pill jade">Lv.${plv} · ${evo}</span>` : `<span class="tag-pill">Chưa Khế Ước</span>`}</div>
                  <div class="item-sub">${p.elem} · ${p.statTxt(Math.max(1, plv))}</div>
                </div>
              </div>
              <div>${eq ? '<span class="tag-pill gold">Xuất Chiến 3D</span>' : ''}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-detail-box">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div class="tm-art-ico big tm-pet-ico" style="border-color:${sel.color};box-shadow:0 0 16px ${sel.color}55;"><img src="assets/img/pet_${sel.id}.png?v=30" alt="${sel.name}" /></div>
              <div>
                <h3 style="margin:0;font-family:var(--font-serif);">${sel.name}</h3>
                <div style="font-size:12px;font-weight:900;color:var(--jade-dark);">${sel.grade || 'Linh Phẩm'} ${sel.stars || ''} · ${sel.elem} · ${evoName}</div>
              </div>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--ink-mid);margin:0 0 12px;">${sel.desc}</p>
            <div class="tm-stat-box">
              <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;">NĂNG LỰC ${lv > 0 ? `HIỆN TẠI (Lv.${lv})` : 'KHI KHẾ ƯỚC (Lv.1)'}</div>
              <div style="font-size:13.5px;font-weight:900;color:var(--jade-dark);margin-top:4px;">${sel.statTxt(Math.max(1, lv))}</div>
              <div style="font-size:11.5px;color:#555;margin-top:5px;">🌟 Tiến hóa ngoại hình 3D tại <b>Lv.5 (Thành Thể + Vòng Hào Quang)</b> và <b>Lv.10 (Thánh Thú)</b>!</div>
            </div>
            ${lv < 15 ? `<div class="tm-cost-box">
              <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;margin-bottom:6px;">NGUYÊN LIỆU ${lv === 0 ? 'KHẾ ƯỚC LINH THÚ' : `BỒI DƯỠNG LÊN Lv.${lv + 1}`}</div>
              <div class="tm-cost-pills">
                <span class="${st.coin >= cost.coin ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> ${fmt(cost.coin)} Linh Thạch</span>
                <span class="${(st.herb || 0) >= cost.herb ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> ${cost.herb} Linh Thảo</span>
                <span class="${(st.core || 0) >= cost.core ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> ${cost.core} Yêu Đan</span>
              </div>
            </div>` : '<div class="tm-stat-box"><b>Đã đạt cảnh giới Thánh Thú tối đa (Lv.15)!</b></div>'}
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${lv < 15 ? `<button class="btn-wuxia gold" id="btn-feed-pet" style="flex:1;" ${canFeed ? '' : 'disabled'}>${lv === 0 ? 'Khế Ước & Triệu Hoán 3D' : `Bồi Dưỡng Lv.${lv + 1}`}</button>` : ''}
            ${lv > 0 ? `<button class="btn-wuxia ${isAct ? '' : 'jade'}" id="btn-eq-pet">${isAct ? 'Thu Hồi Linh Thú' : 'Xuất Chiến Đồng Hành 3D'}</button>` : ''}
          </div>
        </div>
      `;
      body.querySelectorAll('[data-pet-sel]').forEach(el => {
        el.onclick = () => { selectedItem = el.getAttribute('data-pet-sel'); audio.playSfx('ui_click'); renderArtifactPanel(body); };
      });
      const fb = document.getElementById('btn-feed-pet');
      if (fb) fb.onclick = () => engine.feedOrUnlockPet(sel.id);
      const eb = document.getElementById('btn-eq-pet');
      if (eb) eb.onclick = () => engine.equipPet(sel.id);
      return;
    }

    // Tab 4: HỆ THỐNG NGOẠI TRANG 3D — TIÊN DỰC & HÀO QUANG ĐẾ TÔN!
    if (activeTab === 4) {
      const cDef = engine.getCosmeticsDef();
      const cos = st.cosmetics || { wing: 'wing_none', aura: 'aura_none' };
      const cosB = engine.getCosmeticBonuses();
      body.innerHTML = `
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;margin-bottom:6px;color:#0f5c4e;">🕊 Tiên Dực 3D Sau Lưng (Hiển thị toàn cõi + Quảng Trường)</div>
          ${(cDef.wings || []).map(w => {
            const unl = engine.isCosmeticUnlocked('wing', w.id);
            const eq = cos.wing === w.id;
            return `<div class="item-row-card ${eq ? 'selected' : ''}" style="opacity:${unl ? 1 : 0.72};">
              <div>
                <div class="item-name" style="color:${w.col};">${w.name} <span class="tag-pill">${w.grade}</span></div>
                <div class="item-sub">${w.rgba ? `+${Math.round(w.atkPct*100)}% Công · +${Math.round(w.hpPct*100)}% Máu${w.crit ? ` · +${Math.round(w.crit*100)}% Bạo` : ''}` : 'Tắt hiệu ứng cánh sau lưng'}</div>
                <div style="font-size:11px;color:${unl ? '#1b7a53' : '#b83227'};">${unl ? '✔ Đã mở khóa' : `🔒 ${w.unlockHint}`}</div>
              </div>
              <button class="btn-wuxia ${eq ? 'gold' : 'jade'}" data-eq-wing="${w.id}" ${unl && !eq ? '' : (eq ? 'disabled' : 'disabled')}>${eq ? 'Đang Đeo' : (unl ? 'Trang Bị' : 'Chưa Mở')}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-col-scroll">
          <div class="tm-stat-box" style="margin-bottom:8px;">
            <div style="font-size:11.5px;font-weight:800;color:var(--ink-soft);">TỔNG CỘNG HƯỞNG NGOẠI TRANG (Kể cả 35% nội tại các món đã mở)</div>
            <div style="font-size:14px;font-weight:900;color:var(--jade-dark);margin-top:3px;">
              +${Math.round(cosB.atkPct * 100)}% Tấn Công · +${Math.round(cosB.hpPct * 100)}% Sinh Lực · +${Math.round(cosB.crit * 100)}% Bạo Kích
            </div>
          </div>
          <div style="font-weight:900;font-size:15px;margin-bottom:6px;color:#8a5600;">🌀 Hào Quang Đế Tôn 3D Xoay Dưới Chân</div>
          ${(cDef.auras || []).map(a => {
            const unl = engine.isCosmeticUnlocked('aura', a.id);
            const eq = cos.aura === a.id;
            return `<div class="item-row-card ${eq ? 'selected' : ''}" style="opacity:${unl ? 1 : 0.72};">
              <div>
                <div class="item-name" style="color:${a.col};">${a.name} <span class="tag-pill">${a.grade}</span></div>
                <div class="item-sub">${a.rgba ? `+${Math.round(a.atkPct*100)}% Công · +${Math.round(a.hpPct*100)}% Máu${a.crit ? ` · +${Math.round(a.crit*100)}% Bạo` : ''}` : 'Tắt hào quang mặt đất'}</div>
                <div style="font-size:11px;color:${unl ? '#1b7a53' : '#b83227'};">${unl ? '✔ Đã mở khóa' : `🔒 ${a.unlockHint}`}</div>
              </div>
              <button class="btn-wuxia ${eq ? 'gold' : 'jade'}" data-eq-aura="${a.id}" ${unl && !eq ? '' : 'disabled'}>${eq ? 'Đang Bật' : (unl ? 'Trang Bị' : 'Chưa Mở')}</button>
            </div>`;
          }).join('')}
        </div>
      `;
      body.querySelectorAll('[data-eq-wing]').forEach(b => {
        b.onclick = () => engine.equipCosmetic('wing', b.getAttribute('data-eq-wing'));
      });
      body.querySelectorAll('[data-eq-aura]').forEach(b => {
        b.onclick = () => engine.equipCosmetic('aura', b.getAttribute('data-eq-aura'));
      });
      return;
    }

    // Tab 2: 3 Pháp Bảo 3D Hộ Thân
    const defs = engine.getArtifactsDef();
    if (!selectedItem || !defs.some(d => d.id === selectedItem)) selectedItem = defs[0].id;
    const sel = defs.find(d => d.id === selectedItem) || defs[0];
    const selSt = (st.artifacts && st.artifacts[sel.id]) || { lv: 0, eq: false };
    const cost = sel.cost(selSt.lv || 0);
    const canAfford = st.coin >= cost.coin && (st.herb || 0) >= cost.herb && (st.core || 0) >= cost.core;

    body.innerHTML = `
      <div class="panel-col-scroll">
        <div class="tm-mat-strip">
          <span><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> Linh Thạch: <b>${fmt(st.coin)}</b></span>
          <span><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> Linh Thảo: <b>${fmt(st.herb || 0)}</b></span>
          <span><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> Yêu Đan: <b>${fmt(st.core || 0)}</b></span>
        </div>
        ${defs.map(a => {
          const ast = (st.artifacts && st.artifacts[a.id]) || { lv: 0, eq: false };
          return `<div class="item-row-card ${a.id === sel.id ? 'selected' : ''}" data-art-sel="${a.id}">
            <div class="item-left">
              <div class="tm-art-ico" style="border-color:${a.color}"><img src="assets/img/${a.img}.png" alt="${a.name}" /></div>
              <div>
                <div class="item-name">${a.name} ${ast.lv > 0 ? `<span class="tag-pill jade">Cấp ${ast.lv}</span>` : `<span class="tag-pill">Chưa Chế</span>`}</div>
                <div class="item-sub">${a.tier} · ${ast.lv > 0 ? (ast.eq ? 'Đang Bay Quanh Thân 3D' : 'Đang Cất') : 'Cần luyện chế'}</div>
              </div>
            </div>
            <div>
              ${ast.lv > 0 ? `<span class="tag-pill ${ast.eq ? 'gold' : ''}">${ast.eq ? 'Đang Dùng' : 'Cất Kho'}</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="panel-detail-box">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <div class="tm-art-ico big" style="border-color:${sel.color}"><img src="assets/img/${sel.img}.png" alt="${sel.name}" /></div>
            <div>
              <h3 style="margin:0;font-family:var(--font-serif);">${sel.name}</h3>
              <div style="font-size:12px;color:var(--jade-dark);font-weight:800;">${sel.tier} · ${selSt.lv > 0 ? `Cấp ${selSt.lv}` : 'Bản Vẽ Linh Khí'}</div>
            </div>
          </div>
          <p style="font-size:13px;line-height:1.5;color:var(--ink-mid);margin:0 0 12px;">${sel.desc}</p>
          <div class="tm-stat-box">
            <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;">HIỆU ỨNG ${selSt.lv > 0 ? `HIỆN TẠI (CẤP ${selSt.lv})` : 'KHI CHẾ TẠO (CẤP 1)'}</div>
            <div style="font-size:13.5px;font-weight:900;color:var(--jade-dark);margin-top:3px;">${sel.statTxt(Math.max(1, selSt.lv || 0))}</div>
          </div>
          <div class="tm-cost-box">
            <div style="font-size:11.5px;color:var(--ink-soft);font-weight:800;margin-bottom:6px;">NGUYÊN LIỆU ${selSt.lv > 0 ? 'TẾ LUYỆN LÊN CẤP' : 'CHẾ TẠO PHÁP BẢO'}</div>
            <div class="tm-cost-pills">
              <span class="${st.coin >= cost.coin ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> ${fmt(cost.coin)} Linh Thạch</span>
              <span class="${(st.herb || 0) >= cost.herb ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> ${cost.herb} Linh Thảo</span>
              <span class="${(st.core || 0) >= cost.core ? 'ok' : 'no'}"><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> ${cost.core} Yêu Đan</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-wuxia jade" id="btn-craft-art" style="flex:1;" ${canAfford ? '' : 'disabled'}>
            ${selSt.lv > 0 ? `Tế Luyện Lên Cấp ${selSt.lv + 1}` : 'Khai Lò Chế Tạo Pháp Bảo'}
          </button>
          ${selSt.lv > 0 ? `<button class="btn-wuxia" id="btn-eq-art">${selSt.eq ? 'Thu Hồi Pháp Bảo' : 'Triệu Hoán Bay 3D'}</button>` : ''}
        </div>
      </div>
    `;

    body.querySelectorAll('[data-art-sel]').forEach(el => {
      el.onclick = () => {
        selectedItem = el.getAttribute('data-art-sel');
        audio.playSfx('ui_click');
        renderArtifactPanel(body);
      };
    });
    const craftBtn = document.getElementById('btn-craft-art');
    if (craftBtn) craftBtn.onclick = () => engine.craftOrUpgradeArtifact(sel.id);
    const eqBtn = document.getElementById('btn-eq-art');
    if (eqBtn) eqBtn.onclick = () => engine.toggleEquipArtifact(sel.id);
  }

  // 1C. LÒ LUYỆN ĐAN TƯƠNG TÁC (MINI-GAME CANH HỎA HẦU — DỪNG CHÍNH XÁC ĐIỂM ĐẬP + TÚI LINH ĐAN)
  let alchemyHeatPos = 0.2;
  let alchemyHeatDir = 1;
  let alchemyFreezeT = 0; // Freezes the bar right on the exact hit mark for 1.15s so He sees exact timing!
  let alchemyLastResult = null;
  let alchemySelectedPill = 'qi';

  function triggerAlchemyStrike() {
    if (alchemyFreezeT > 0) return;
    const pills = engine.getPillsDef();
    const sel = pills.find(p => p.id === alchemySelectedPill) || pills[0];
    const dist = Math.abs(alchemyHeatPos - 0.5);
    const tier = dist <= 0.065 ? 'cuc' : (dist <= 0.16 ? 'thuong' : (dist <= 0.28 ? 'trung' : 'ha'));
    const res = engine.refinePill(sel.id, tier);
    if (res) {
      alchemyFreezeT = 1.15;
      alchemyLastResult = { ...res, name: sel.name, hitPos: alchemyHeatPos };
      const body = document.getElementById('modal-body');
      if (body && activePanel === 'alchemy' && activeTab === 0) renderAlchemyPanel(body);
    }
  }

  function renderAlchemyPanel(body) {
    setModalHeader('Lò Luyện Đan Thái Hư', ['Khai Lò Luyện Đan', 'Túi Linh Đan']);
    const st = engine.state;
    const pills = engine.getPillsDef();

    if (activeTab === 0) {
      const sel = pills.find(p => p.id === alchemySelectedPill) || pills[0];
      const cost = sel.cost;
      const canAfford = st.coin >= cost.coin && (st.herb || 0) >= cost.herb && (st.core || 0) >= cost.core;
      const frozen = alchemyFreezeT > 0;

      body.innerHTML = `
        <div class="panel-col-scroll">
          <div class="tm-mat-strip">
            <span><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> <b>${fmt(st.coin)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> Linh Thảo: <b>${fmt(st.herb || 0)}</b></span>
            <span><img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> Yêu Đan: <b>${fmt(st.core || 0)}</b></span>
          </div>
          ${pills.map(p => {
            const own = p.id === 'trucco' ? (st.pill || 0) : ((st.pills && st.pills[p.id]) || 0);
            return `<div class="item-row-card ${p.id === sel.id ? 'selected' : ''}" data-pill-sel="${p.id}">
              <div class="item-left">
                <div class="tm-art-ico" style="border-color:${p.color}"><img src="assets/img/${p.img}.png" alt="${p.name}" /></div>
                <div>
                  <div class="item-name">${p.name} <span class="tag-pill jade">Đang có: ${own}</span></div>
                  <div class="item-sub">
                    <img class="tm-mini-ico" src="assets/img/coin.png" alt="" />${p.cost.coin} ·
                    <img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" />${p.cost.herb} ·
                    <img class="tm-mini-ico" src="assets/img/res_core.png" alt="" />${p.cost.core}
                  </div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-detail-box">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div class="tm-art-ico big" style="border-color:${sel.color}"><img src="assets/img/${sel.img}.png" alt="${sel.name}" /></div>
              <div>
                <h3 style="margin:0;font-family:var(--font-serif);">${sel.name}</h3>
                <div style="font-size:12px;color:var(--ink-mid);margin-top:2px;">${sel.desc}</div>
              </div>
            </div>

            <div class="tm-cauldron-box ${frozen ? 'frozen-hit' : ''}">
              <div class="tm-cauldron-title">
                ${frozen && alchemyLastResult
                  ? `★ CHỐT HỎA HẦU: ${alchemyLastResult.label.toUpperCase()} (+${alchemyLastResult.qty} VIÊN)!`
                  : 'CANH HỎA HẦU — BẤM NGƯNG ĐAN (HOẶC SPACE) ĐÚNG VÙNG VÀNG ĐỂ ĐẠT CỰC PHẨM ×2!'}
              </div>
              <div class="tm-heat-track" id="alchemy-heat-track" title="Bấm trực tiếp vào thanh hoặc nút Ngưng Đan để chốt Hỏa Hầu">
                <div class="tm-heat-zone mid"></div>
                <div class="tm-heat-zone good"></div>
                <div class="tm-heat-zone perfect"></div>
                <div class="tm-heat-cursor ${frozen ? 'frozen' : ''}" id="alchemy-heat-cursor" style="left:${(alchemyHeatPos * 100).toFixed(1)}%"></div>
              </div>
              <div class="tm-heat-legend">
                <span>Hạ Phẩm (×1)</span>
                <span style="color:#6df5ab;font-weight:900;">Thượng Phẩm (×2)</span>
                <span style="color:#ffe27a;font-weight:900;">★ Cực Phẩm (×2 + Linh Khí)</span>
              </div>
              ${alchemyLastResult ? `<div class="tm-alchemy-res">Kết quả vừa luyện: <b>${alchemyLastResult.qty}× ${alchemyLastResult.name}</b> — ${alchemyLastResult.label}</div>` : ''}
            </div>
          </div>

          <div style="display:flex;gap:10px;">
            <button class="btn-wuxia gold" id="btn-alchemy-strike" style="flex:1;font-size:14px;padding:9px 12px;white-space:normal;line-height:1.35;" ${canAfford && !frozen ? '' : 'disabled'}>
              ${frozen
                ? '✨ ĐANG NGƯNG TỤ KIM ĐAN... (CHỜ 1 GIÂY)'
                : `<div>🔥 NGƯNG ĐAN NGAY!</div><div style="font-size:11.5px;font-weight:800;opacity:0.9;margin-top:2px;"><img class="tm-mini-ico" src="assets/img/coin.png" alt="" /> ${cost.coin} · <img class="tm-mini-ico" src="assets/img/res_herb.png" alt="" /> ${cost.herb} · <img class="tm-mini-ico" src="assets/img/res_core.png" alt="" /> ${cost.core}</div>`}
            </button>
          </div>
        </div>
      `;

      body.querySelectorAll('[data-pill-sel]').forEach(el => {
        el.onclick = () => {
          alchemySelectedPill = el.getAttribute('data-pill-sel');
          alchemyFreezeT = 0;
          audio.playSfx('ui_click');
          renderAlchemyPanel(body);
        };
      });
      const strikeBtn = document.getElementById('btn-alchemy-strike');
      if (strikeBtn) strikeBtn.onclick = () => triggerAlchemyStrike();
      const trackEl = document.getElementById('alchemy-heat-track');
      if (trackEl) trackEl.onclick = () => triggerAlchemyStrike();
    } else {
      body.className = 'panel-body single-col';
      const inv = st.pills || {};
      body.innerHTML = `
        <div class="tm-pill-bag-grid">
          ${pills.filter(p => p.consumable).map(p => {
            const cnt = inv[p.id] || 0;
            return `<div class="tm-pill-card">
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="tm-art-ico big" style="border-color:${p.color}"><img src="assets/img/${p.img}.png" alt="${p.name}" /></div>
                <div>
                  <div style="font-weight:900;font-size:15px;">${p.name}</div>
                  <div class="tag-pill jade" style="margin-top:3px;">Số lượng: ${cnt}</div>
                </div>
              </div>
              <p style="font-size:12.5px;color:var(--ink-mid);margin:8px 0;">${p.desc}</p>
              <button class="btn-wuxia jade" data-use-pill="${p.id}" ${cnt > 0 ? '' : 'disabled'}>Phục Dụng Linh Đan</button>
            </div>`;
          }).join('')}
          <div class="tm-pill-card">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="tm-art-ico big" style="border-color:#ffd966"><img src="assets/img/pill_trucco.png" alt="Trúc Cơ Đan" /></div>
              <div>
                <div style="font-weight:900;font-size:15px;">Trúc Cơ Đột Phá Đan</div>
                <div class="tag-pill gold" style="margin-top:3px;">Đang có: ${st.pill || 0} viên</div>
              </div>
            </div>
            <p style="font-size:12.5px;color:var(--ink-mid);margin:8px 0;">Dùng tại mục Tu Luyện → Cảnh Giới để bước lên Lôi Kiếp Đài độ Thiên Kiếp thăng cảnh giới!</p>
            <button class="btn-wuxia gold" id="btn-goto-breakthrough">Đến Lôi Kiếp Đài ▸</button>
          </div>
        </div>
      `;
      body.querySelectorAll('[data-use-pill]').forEach(btn => {
        btn.onclick = () => engine.consumePill(btn.getAttribute('data-use-pill'));
      });
      const goBr = document.getElementById('btn-goto-breakthrough');
      if (goBr) goBr.onclick = () => openPanel('growth', 1);
    }
  }

  // 1. TU LUYỆN PANEL (Cường Hóa Chỉ Số / Cảnh Giới & Thiên Kiếp / Đồ Giám Quái)
  function renderGrowthPanel(body) {
    setModalHeader('Tu Luyện Tông Chủ', ['Căn Cốt', 'Cảnh Giới', 'Đạo Lộ & Tông Phái', 'Đồ Giám']);
    const st = engine.state;
    const ms = engine.getMasterStats();

    if (activeTab === 0) {
      const realmCap = engine.data.game.realms[st.realmIdx].cap;
      const iconMap = { atk: 'ut_st_atk', hp: 'ut_st_hp', def: 'ut_st_def', crit: 'ut_st_crit', critDmg: 'ut_st_critDmg' };
      const rows = engine.data.game.train.map(t => {
        const lv = st.train[t.id] || 0;
        const cost = engine.getTrainCost(t.id);
        const val = t.id === 'crit' || t.id === 'critDmg'
          ? `${((t.baseVal + lv * t.perLv) * 100).toFixed(1)}%`
          : fmt(t.baseVal + lv * t.perLv);
        return `<div class="item-row-card">
          <div class="item-row-left">
            <img class="item-row-icon" src="assets/img/${iconMap[t.id] || 'ut_st_atk'}.png" alt="" />
            <div>
              <div class="item-row-title">${t.name} <span style="color:#286c4f;">Lv.${lv}/${realmCap}</span></div>
              <div class="item-row-sub">Hiện tại: <b>${val}</b> · Mỗi cấp +${t.id === 'crit' || t.id === 'critDmg' ? (t.perLv * 100).toFixed(1) + '%' : t.perLv}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-wuxia" data-up-stat="${t.id}" data-up-cnt="1" ${st.coin < cost || lv >= realmCap ? 'disabled' : ''}>+1 (${fmt(cost)} Linh Thạch)</button>
            <button class="btn-wuxia jade" data-up-stat="${t.id}" data-up-cnt="10" ${st.coin < cost || lv >= realmCap ? 'disabled' : ''}>+10</button>
          </div>
        </div>`;
      }).join('');

      body.innerHTML = `
        <div class="panel-col-scroll">${rows}</div>
        <div class="panel-detail-box">
          <div style="display:flex;gap:14px;align-items:center;">
            <img src="assets/img/hero_lamphong.png" style="height:190px;object-fit:contain;" alt="Lâm Phong" />
            <div>
              <div style="font-family:var(--font-serif);font-size:19px;font-weight:900;">Tông Chủ Lâm Phong</div>
              <div style="color:var(--jade-dark);font-weight:800;margin:4px 0;">Cảnh giới: ${engine.data.game.realms[st.realmIdx].name}</div>
              <div style="font-size:13px;line-height:1.7;">
                ⚔ Công kích: <b>${fmt(ms.atk)}</b><br/>
                ❤ Sinh lực: <b>${fmt(ms.maxHp)}</b><br/>
                🛡 Phòng thủ: <b>${fmt(ms.def)}</b><br/>
                💥 Bạo kích: <b>${(ms.crit * 100).toFixed(1)}%</b> (ST Bạo <b>${(ms.critDmg * 100).toFixed(0)}%</b>)<br/>
                🔥 Tổng Chiến Lực: <b style="color:var(--crimson);">${fmt(engine.getSectPower())}</b>
              </div>
            </div>
          </div>
          <div style="background:rgba(40,108,79,0.09);padding:10px 12px;border-radius:10px;font-size:12.5px;">
            💡 Khi đạt giới hạn cấp cường hóa (${realmCap}), hãy chuyển sang thẻ <b>Cảnh Giới</b> dùng Đan Dược vượt <b>Lôi Kiếp Đài</b> để mở trần tu vi!
          </div>
        </div>
      `;
      body.querySelectorAll('[data-up-stat]').forEach(btn => {
        btn.onclick = () => engine.upgradeStat(btn.getAttribute('data-up-stat'), parseInt(btn.getAttribute('data-up-cnt'), 10));
      });
    } else if (activeTab === 1) {
      const chk = engine.canBreakthroughRealm();
      const rows = engine.data.game.realms.map((r, idx) => {
        const passed = idx <= st.realmIdx;
        const isNext = idx === st.realmIdx + 1;
        return `<div class="item-row-card ${isNext ? 'selected' : ''}">
          <div class="item-row-left">
            <img class="item-row-icon" src="assets/img/ut_realm${idx}.png" alt="" />
            <div>
              <div class="item-row-title">${r.name} ${passed ? '✅' : ''}</div>
              <div class="item-row-sub">Trần cường hóa Lv.${r.cap} · Yêu cầu: Ải ${r.reqStage ?? r.needStage ?? 1} & ${r.pill} Đan Dược</div>
            </div>
          </div>
          ${isNext ? `<button class="btn-wuxia crimson" id="btn-break-realm" ${!chk.ok ? 'disabled' : ''} title="${chk.ok ? 'Bắt đầu độ kiếp' : chk.reason}">Đấu Thiên Kiếp</button>` : `<span style="font-size:12px;font-weight:800;color:#666;">${passed ? 'Đã Đạt' : 'Chưa Mở'}</span>`}
        </div>`;
      }).join('');
      body.innerHTML = `
        <div class="panel-col-scroll">${rows}</div>
        <div class="panel-detail-box">
          <div>
            <div style="font-size:17px;font-weight:900;">Đột Phá Cảnh Giới (Thiên Kiếp 1v1)</div>
            <p style="font-size:13px;line-height:1.55;color:#4a5457;">
              Mỗi bậc cảnh giới mở rộng trần cường hóa căn cốt & cấp Tiên Pháp, đồng thời tăng mạnh uy lực Linh Lực của Tông Chủ.<br/><br/>
              Đan Dược hiện có: <b>${fmt(st.pill)}</b> · Ải cao nhất: <b>${st.maxStage}</b><br/>
              ${st.shadowLosses > 0 ? `Thiên Kiếp đã suy yếu: <b>-${st.shadowLosses * 10}%</b> chỉ số` : ''}
            </p>
          </div>
          <button class="btn-wuxia crimson" id="btn-break-main" ${!chk.ok ? 'disabled' : ''}>${chk.ok ? '⚔ Khiêu Chiến Thiên Kiếp Ngay' : chk.reason}</button>
        </div>
      `;
      const b1 = document.getElementById('btn-break-realm');
      const b2 = document.getElementById('btn-break-main');
      if (b1) b1.onclick = () => { if (engine.startRealmShadowDuel()) closePanel(); };
      if (b2) b2.onclick = () => { if (engine.startRealmShadowDuel()) closePanel(); };
    } else if (activeTab === 2) {
      const paths = [
        { id: 'jeong', name: 'Chính Tiên · Thanh Minh', icon: 'mg_clear_counter', desc: 'Sinh lực Tông Chủ +22%. Chuyên phản đòn, khắc Kiếm Ngân và hộ vệ đồng hành (Truyền thừa Thanh Minh).' },
        { id: 'sa', name: 'Tán Tu · Vô Ảnh', icon: 'mg_shadow_mark', desc: 'Tỉ lệ Bạo Kích +10%. Chuyên thân pháp tàn ảnh, cộng dồn và kích nổ Xuất Huyết (Truyền thừa Vô Ảnh).' },
        { id: 'ma', name: 'Ma Đạo · Nghịch Thiên', icon: 'mg_heaven_pressure', desc: 'Công kích Tông Chủ +25%. Thiêu đốt huyết khí đổi lấy Phá Giáp và sát thương hủy diệt (Truyền thừa Nghịch Thiên).' },
        { id: 'indep', name: 'Tán Tu · Tự Luật', icon: 'mg_united_seal', desc: 'Công & Sinh lực +12%. Không phụ thuộc thế lực, dung hợp Tiên Pháp cả 4 tông phái (Truyền thừa Quy Nhất).' }
      ];
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${paths.map(p => `<div class="item-row-card ${st.sectPath === p.id ? 'selected' : ''}" style="flex-direction:column;align-items:flex-start;padding:14px;">
          <div class="item-row-left">
            <img class="item-row-icon" src="assets/img/${p.icon}.png" alt="" />
            <div>
              <div class="item-row-title">${p.name}</div>
              <div class="item-row-sub">${st.sectPath === p.id ? 'Đang tu luyện đạo lộ này' : 'Có thể chọn hoặc đổi khi Hồi Quy'}</div>
            </div>
          </div>
          <div style="font-size:12.5px;color:#444;line-height:1.45;">${p.desc}</div>
          <button class="btn-wuxia ${st.sectPath === p.id ? 'jade' : ''}" data-pick-path="${p.id}">${st.sectPath === p.id ? '✓ Đang Chọn' : 'Chọn Đạo Lộ Này'}</button>
        </div>`).join('')}
      </div>`;
      body.querySelectorAll('[data-pick-path]').forEach(btn => {
        btn.onclick = () => {
          st.sectPath = btn.getAttribute('data-pick-path');
          audio.playSfx('levelup');
          engine.toast('Đã xác lập đạo lộ môn phái!');
          renderModalContent();
          updateHud();
        };
      });
    } else {
      const entries = engine.data.game.codex.entries;
      const codexIcons = {
        minion: 'codex_minion', leader: 'codex_leader', boss: 'codex_boss',
        dart: 'codex_dart', ronin: 'codex_ronin', shield: 'codex_shield',
        toxin: 'codex_toxin', monk: 'codex_monk'
      };
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="margin-bottom:8px;font-size:13px;font-weight:700;color:var(--jade-dark);">
        Tổng sát thương cộng thêm từ Đồ Giám: +${(engine.getCodexDmgBonus() * 100).toFixed(0)}% (Mỗi mốc tiêu diệt +2% ST toàn cục & thưởng Tiên Ngọc)
      </div>` + entries.map((e, idx) => {
        const kills = st.codexKills[e.id] || 0;
        let nextStepIdx = e.steps.findIndex((s, i) => !st.codexClaimed[`${e.id}_${i}`]);
        const canClaim = nextStepIdx >= 0 && kills >= e.steps[nextStepIdx];
        const targetVal = nextStepIdx >= 0 ? e.steps[nextStepIdx] : e.steps[e.steps.length - 1];
        const pct = Math.max(0, Math.min(100, (kills / Math.max(1, targetVal)) * 100));
        const ico = codexIcons[e.id] || `boss_ch${idx % 6}`;
        return `<div class="item-row-card ${canClaim ? 'selected' : ''}">
          <div class="item-row-left" style="flex:1;min-width:0;">
            <img class="item-row-icon" style="width:44px;height:44px;border-radius:10px;border:1.5px solid #d4a647;background:#10292f;object-fit:cover;" src="assets/img/${ico}.png?v=24" onerror="this.src='assets/img/res_core.png'" alt="" />
            <div style="flex:1;min-width:0;">
              <div class="item-row-title">${e.name} <span class="tag-pill">${fmt(kills)} / ${fmt(targetVal)}</span></div>
              <div class="item-row-sub">${e.desc}</div>
              <div class="codex-prog-track"><div class="codex-prog-fill" style="width:${pct.toFixed(1)}%"></div></div>
            </div>
          </div>
          ${nextStepIdx >= 0
            ? `<button class="btn-wuxia ${canClaim ? 'jade' : ''}" data-claim-codex="${e.id}" data-step="${nextStepIdx}" ${!canClaim ? 'disabled' : ''}>Nhận +${e.jade[nextStepIdx]} Ngọc</button>`
            : `<span class="tag-pill jade">✓ Hoàn Tất</span>`}
        </div>`;
      }).join('');
      body.querySelectorAll('[data-claim-codex]').forEach(btn => {
        btn.onclick = () => {
          const eid = btn.getAttribute('data-claim-codex');
          const sidx = parseInt(btn.getAttribute('data-step'), 10);
          const e = entries.find(x => x.id === eid);
          st.codexClaimed[`${eid}_${sidx}`] = true;
          st.jade += e.jade[sidx];
          audio.playSfx('collect');
          renderModalContent();
          updateHud();
        };
      });
    }
  }

  // 2. VÕ CÔNG PANEL (22 Ngọc Giản + Cộng Hưởng Tông Phái + Tuyệt Kỹ)
  function renderArtsPanel(body) {
    setModalHeader('Tàng Kinh Tiên Pháp', ['Ngọc Giản & Trang Bị', 'Cộng Hưởng Tứ Phái']);
    const st = engine.state;
    const skills = engine.data.game.fight.skills;
    const fams = engine.data.game.fight.mugong.fams;
    const reso = engine.getSchoolResonance();

    if (activeTab === 0) {
      const selSk = skills.find(s => s.id === selectedItem) || skills[0];
      selectedItem = selSk.id;

      const listHtml = skills.map(sk => {
        const learned = st.learnedSkills.includes(sk.id);
        const eqIdx = st.equippedSkills.indexOf(sk.id);
        const lv = st.skillLvs[sk.id] || 1;
        const famName = fams[sk.fam || 0] ? fams[sk.fam || 0].name : '';
        const icon = sk.icon || `mg_${sk.id}`;
        return `<div class="item-row-card ${selSk.id === sk.id ? 'selected' : ''}" data-sel-sk="${sk.id}">
          <div class="item-row-left">
            <img class="item-row-icon" src="assets/img/${icon}.png" style="${learned ? '' : 'filter:grayscale(0.92) brightness(0.62);'}" alt="" />
            <div>
              <div class="item-row-title">${sk.name} <span style="font-size:11px;color:#286c4f;">[${famName}]</span> ${learned ? `Lv.${lv}` : '🔒'}</div>
              <div class="item-row-sub">${sk.desc}</div>
            </div>
          </div>
          ${eqIdx >= 0 ? `<span style="background:var(--jade-main);color:#fff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:8px;">Ô ${eqIdx + 1}</span>` : ''}
        </div>`;
      }).join('');

      const isLearned = st.learnedSkills.includes(selSk.id);
      const curLv = st.skillLvs[selSk.id] || 1;
      const upCost = isLearned
        ? engine.data.game.skillLv.costBase + (curLv - 1) * engine.data.game.skillLv.costStep
        : (selSk.cost || 8);

      body.innerHTML = `
        <div class="panel-col-scroll">${listHtml}</div>
        <div class="panel-detail-box">
          <div>
            <div style="display:flex;gap:12px;align-items:center;">
              <img src="assets/img/${selSk.icon || 'mg_' + selSk.id}.png" style="width:68px;height:68px;border-radius:14px;" onerror="this.src='assets/img/sk_wave.png'" />
              <div>
                <div style="font-size:18px;font-weight:900;">${selSk.name}</div>
                <div style="font-size:12.5px;color:var(--jade-dark);font-weight:800;">
                  Hệ phái: ${fams[selSk.fam || 0].name} · Hồi chiêu: ${selSk.cd}s · Uy lực: ×${(selSk.mul * (1 + (curLv - 1) * 0.1)).toFixed(2)}
                </div>
              </div>
            </div>
            <p style="font-size:13.5px;line-height:1.55;margin-top:10px;">${selSk.desc}</p>
            <div style="font-size:12.5px;color:#555;">
              Ngọc Giản hiện có: <b>${fmt(st.scroll)}</b><br/>
              ${!isLearned ? `Yêu cầu cảnh giới: <b>${engine.data.game.realms[selSk.realm || 0].name}</b>` : ''}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn-wuxia jade" id="btn-learn-sk">
              ${isLearned ? `Tinh Luyện Lv.${curLv + 1} (${upCost} Ngọc Giản)` : `Lĩnh Ngộ Tiên Pháp (${upCost} Ngọc Giản)`}
            </button>
            ${isLearned ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
              ${[0, 1, 2, 3].map(idx => `<button class="btn-wuxia ${st.equippedSkills[idx] === selSk.id ? 'blue' : ''}" data-eq-slot="${idx}">Gắn Ô ${idx + 1}</button>`).join('')}
            </div>` : ''}
          </div>
        </div>
      `;
      body.querySelectorAll('[data-sel-sk]').forEach(el => {
        el.onclick = () => { selectedItem = el.getAttribute('data-sel-sk'); renderModalContent(); };
      });
      document.getElementById('btn-learn-sk').onclick = () => engine.learnOrUpgradeSkill(selSk.id);
      body.querySelectorAll('[data-eq-slot]').forEach(btn => {
        btn.onclick = () => engine.equipSkill(selSk.id, parseInt(btn.getAttribute('data-eq-slot'), 10));
      });
    } else {
      body.className = 'panel-body single-col';
      const ultIconMap = ['mg_ult_kwae', 'mg_ult_seon', 'mg_ult_pae', 'mg_ult_naega'];
      body.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${fams.map((f, idx) => {
          const cnt = reso.counts[idx];
          return `<div class="item-row-card ${cnt >= 2 ? 'selected' : ''}" style="flex-direction:column;align-items:flex-start;padding:14px;">
            <div class="item-row-left">
              <img class="item-row-icon" src="assets/img/${ultIconMap[idx]}.png" alt="" />
              <div>
                <div class="item-row-title">${f.name} · Đang gắn ${cnt}/4 chiêu</div>
                <div class="item-row-sub">Tuyệt kỹ 3 chiêu: <b>${f.ult.name}</b> (${f.ult.desc})</div>
              </div>
            </div>
            <div style="font-size:12.5px;line-height:1.6;margin-top:6px;">
              ${f.reso.map(r => `<div style="color:${cnt >= r.need ? '#1e6b47' : '#888'};font-weight:${cnt >= r.need ? '800' : '500'};">• [${r.need} chiêu] ${r.text}</div>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  // 3. ĐỆ TỬ PANEL (Danh Sách & Thăng Cấp / Xuất Trận / Chiêu Mộ Gacha)
  function renderDisciplePanel(body) {
    setModalHeader('Đệ Tử Thái Hư Tiên Môn', ['Đồng Môn', 'Chiêu Mộ Đệ Tử']);
    const st = engine.state;
    const allD = engine.data.game.disciples;
    const grades = engine.data.game.grades;

    if (activeTab === 0) {
      const selD = allD.find(d => d.id === selectedItem) || allD[0];
      selectedItem = selD.id;
      const owned = st.disciples[selD.id];
      const ds = engine.getDiscipleStats(selD.id);

      const gridHtml = `<div class="disciple-grid">` + allD.map(d => {
        const ow = st.disciples[d.id];
        const g = grades[d.grade];
        const dep = st.deployed.includes(d.id);
        return `<div class="disc-card ${!ow ? 'locked' : ''} ${selD.id === d.id ? 'selected' : ''}" data-sel-disc="${d.id}">
          <img class="face" src="assets/img/card_${d.id}.png" alt="${d.name}" />
          <span class="disc-grade-tag" style="background:${g.color};">${g.id}</span>
          ${dep ? `<span class="disc-deploy-tag">Xuất Trận</span>` : ''}
          <div class="disc-card-foot">
            <div>${d.name}</div>
            <div style="font-size:10px;color:#ffd970;">${ow ? '★'.repeat(ow.stars) + ` Lv.${ow.lv}` : 'Chưa Chiêu Mộ'}</div>
          </div>
        </div>`;
      }).join('') + `</div>`;

      const dlv = engine.data.game.discipleLv;
      const lvCost = owned ? Math.round(dlv.costBase + (owned.lv - 1) * dlv.costStep) : 0;
      const starNeed = owned && owned.stars < 4 ? engine.data.game.recruit.starNeed[owned.stars] : 0;

      body.innerHTML = `
        <div class="panel-col-scroll">${gridHtml}</div>
        <div class="panel-detail-box">
          <div style="display:flex;gap:12px;align-items:center;">
            <img src="assets/img/full_${selD.id}.png" style="height:200px;max-width:130px;object-fit:contain;" alt="${selD.name}" />
            <div>
              <span style="background:${grades[selD.grade].color};color:#fff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;">${grades[selD.grade].id}</span>
              <div style="font-size:20px;font-weight:900;margin-top:4px;">${selD.title} · ${selD.name}</div>
              <div style="font-size:12.5px;color:#555;">Binh khí: <b>${selD.weapon}</b> · Tuyệt kỹ: <b>${selD.skill}</b></div>
              <div style="font-size:12px;color:#666;margin-top:6px;">${selD.artDesc}</div>
              ${ds ? `<div style="margin-top:8px;font-size:13px;line-height:1.6;">
                Cấp: <b>Lv.${ds.lv}/${ds.capLv}</b> (${'★'.repeat(ds.stars)}${'☆'.repeat(4 - ds.stars)})<br/>
                ⚔ Công: <b>${fmt(ds.atk)}</b> · ❤ Máu: <b>${fmt(ds.maxHp)}</b> · 🛡 Thủ: <b>${fmt(ds.defStat)}</b><br/>
                Mảnh sao: <b>${ds.shards}</b> ${ds.stars < 4 ? `/ ${starNeed}` : '(Tối đa)'}
              </div>` : `<div style="margin-top:10px;color:var(--crimson);font-weight:800;">Chưa sở hữu — Chiêu mộ tại thẻ bên cạnh!</div>`}
            </div>
          </div>

          <div style="font-size:12px;color:var(--jade-dark);font-weight:700;">
            Điểm Tu Luyện hiện có: ${fmt(st.xp)} · Đang xuất trận: ${st.deployed.length}/${engine.getMaxDeploySlots ? engine.getMaxDeploySlots() : engine.data.game.start.deploySlots}
            ${st.injured && st.injured[selD.id] ? ' · <span style="color:#b83227;">⚠ Đang Trọng Thương (khởi đầu 25% Máu khi Viễn Chinh)</span>' : ''}
          </div>

          ${owned ? `<div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-wuxia" id="btn-disc-lv">Tu Luyện +1 (${fmt(lvCost)} XP)</button>
            ${owned.stars < 4 ? `<button class="btn-wuxia blue" id="btn-disc-star" ${owned.shards < starNeed ? 'disabled' : ''}>Thăng Sao (${owned.shards}/${starNeed})</button>` : ''}
            <button class="btn-wuxia jade" id="btn-disc-dep">${st.deployed.includes(selD.id) ? 'Thu Hồi Về Phái' : 'Cho Xuất Trận'}</button>
            ${st.injured && st.injured[selD.id] ? `<button class="btn-wuxia crimson" id="btn-disc-heal">💊 Trị Thương (${engine.data.jianghu?.exp?.injurePill || 10} Đan)</button>` : ''}
          </div>` : ''}
        </div>
      `;

      body.querySelectorAll('[data-sel-disc]').forEach(el => {
        el.onclick = () => { selectedItem = el.getAttribute('data-sel-disc'); renderModalContent(); };
      });
      const bLv = document.getElementById('btn-disc-lv');
      const bSt = document.getElementById('btn-disc-star');
      const bDp = document.getElementById('btn-disc-dep');
      const bHl = document.getElementById('btn-disc-heal');
      if (bLv) bLv.onclick = () => engine.levelUpDisciple(selD.id);
      if (bSt) bSt.onclick = () => engine.starUpDisciple(selD.id);
      if (bDp) bDp.onclick = () => engine.toggleDeployDisciple(selD.id);
      if (bHl) bHl.onclick = () => { if (engine.healInjuredDisciple(selD.id)) { renderModalContent(); updateHud(); } };
    } else {
      const rec = engine.data.game.recruit;
      let recLv = 1;
      rec.levels.forEach((l, i) => { if (st.recruitTotal >= l.need) recLv = i + 1; });

      body.className = 'panel-body single-col';
      body.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--hanji-card);padding:14px 18px;border-radius:14px;border:2px solid rgba(35,42,44,0.2);">
          <div>
            <div style="font-size:18px;font-weight:900;">Chiêu Mộ Anh Tài Tiên Giới · Cấp Chiêu Mộ ${recLv}/10</div>
            <div style="font-size:12.5px;color:#555;margin-top:3px;">
              Đã chiêu mộ: <b>${st.recruitTotal}</b> lần · Bảo hiểm Anh Tài+: <b>${st.recruitPity}/${rec.pity}</b> · Tiên Ngọc hiện có: <b>${fmt(st.jade)}</b>
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn-wuxia" id="btn-rec-1">Chiêu Mộ ×1 (${rec.costOne} Ngọc)</button>
            <button class="btn-wuxia jade" id="btn-rec-10">Chiêu Mộ ×10 (${rec.costTen} Ngọc)</button>
          </div>
        </div>

        <div style="margin-top:12px;">
          ${lastGachaResults ? `<div class="disciple-grid" style="grid-template-columns:repeat(5,1fr);">
            ${lastGachaResults.map(r => {
              const g = grades[r.disciple.grade];
              return `<div class="disc-card selected">
                <img class="face" src="assets/img/card_${r.disciple.id}.png" alt="" />
                <span class="disc-grade-tag" style="background:${g.color};">${g.id}</span>
                <span class="disc-deploy-tag" style="background:${r.isNew ? '#d6493c' : '#2d6ca2'};">${r.isNew ? 'MỚI!' : '+1 Mảnh'}</span>
                <div class="disc-card-foot">${r.disciple.name}</div>
              </div>`;
            }).join('')}
          </div>` : `<div style="text-align:center;padding:48px;color:#666;font-size:14px;">
            Nhấn <b>Chiêu Mộ ×1</b> hoặc <b>Chiêu Mộ ×10</b> (tiết kiệm 100 Tiên Ngọc) để đón đệ tử mới gia nhập Thái Hư Tiên Môn!
          </div>`}
        </div>
      `;
      document.getElementById('btn-rec-1').onclick = () => {
        const res = engine.recruitDisciples(1);
        if (res) { lastGachaResults = res; renderModalContent(); }
      };
      document.getElementById('btn-rec-10').onclick = () => {
        const res = engine.recruitDisciples(10);
        if (res) { lastGachaResults = res; renderModalContent(); }
      };
    }
  }

  // 4. ĐIỆN CÁC MÔN PHÁI PANEL (8 Điện Các + Đệ Tử Trực Điện + Linh Ấn Các)
  function renderTownPanel(body) {
    setModalHeader('Thái Hư Tiên Môn · Điện Các', ['Kiến Thiết Điện Các', 'Linh Ấn Các']);
    const st = engine.state;
    const halls = engine.data.game.halls;

    if (activeTab === 0) {
      const selH = halls.find(h => h.id === selectedItem) || halls[0];
      selectedItem = selH.id;
      const hSt = st.halls[selH.id];
      const cost = engine.getHallUpgradeCost(selH.id);
      const rate = engine.getHallHourlyRate(selH.id);

      const listHtml = halls.map(h => {
        const hs = st.halls[h.id];
        const building = hs.buildEnd > Date.now();
        return `<div class="item-row-card ${selH.id === h.id ? 'selected' : ''}" data-sel-hall="${h.id}">
          <div class="item-row-left">
            <img class="item-row-icon" src="assets/img/hallc_${h.id}.png" onerror="this.src='assets/img/ut_hall_${h.id}.png'" alt="" />
            <div>
              <div class="item-row-title">${h.name} <span style="color:var(--jade-dark);">${h.locked ? '(Sắp mở)' : `Lv.${hs.lv}/${h.maxLv}`}</span></div>
              <div class="item-row-sub">${h.role}</div>
            </div>
          </div>
          ${Math.floor(hs.stored || 0) >= 1 ? `<button class="btn-wuxia jade" data-quick-col="${h.id}">Thu +${fmt(hs.stored)}</button>` : (building ? `<span style="font-size:12px;font-weight:800;color:#b57614;">Đang xây...</span>` : '')}
        </div>`;
      }).join('');

      const ownedIds = Object.keys(st.disciples);
      const maxSlots = selH.slots > 0 ? selH.slots + (st.halls.dorm.lv > 0 ? 1 : 0) : 0;

      body.innerHTML = `
        <div class="panel-col-scroll">${listHtml}</div>
        <div class="panel-detail-box">
          <div>
            <img src="assets/img/hall_${selH.id}.png" style="width:100%;height:155px;object-fit:cover;border-radius:10px;border:1.5px solid rgba(0,0,0,0.2);" alt="" />
            <div style="font-size:18px;font-weight:900;margin-top:8px;">${selH.name} · Lv.${hSt.lv}/${selH.maxLv}</div>
            <div style="font-size:12.5px;color:#555;margin-top:2px;">${selH.role}</div>
            ${selH.res ? `<div style="margin-top:6px;font-size:13px;font-weight:800;color:var(--jade-dark);">
              Sản lượng: ${fmt(rate)}/giờ · Đang tích trữ: ${fmt(hSt.stored || 0)}
            </div>` : ''}

            ${maxSlots > 0 && hSt.lv > 0 ? `<div style="margin-top:10px;border-top:1px dashed #ccc;padding-top:8px;">
              <div style="font-size:12px;font-weight:800;margin-bottom:4px;">Đệ Tử Trực Điện (${(hSt.workers || []).length}/${maxSlots}): ${(hSt.workers || []).map(wid => engine.data.game.disciples.find(x => x.id === wid)?.name).join(', ') || 'Chưa cử người'}</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap;">
                ${ownedIds.map(did => {
                  const d = engine.data.game.disciples.find(x => x.id === did);
                  const active = (hSt.workers || []).includes(did);
                  return `<button class="btn-wuxia ${active ? 'jade' : ''}" style="padding:4px 8px;font-size:11px;" data-assign-w="${did}">${d.name}</button>`;
                }).join('')}
              </div>
            </div>` : ''}
          </div>

          <div style="display:flex;gap:8px;">
            ${Math.floor(hSt.stored || 0) >= 1 ? `<button class="btn-wuxia jade" id="btn-col-hall">Thu Hoạch (+${fmt(hSt.stored)})</button>` : ''}
            <button class="btn-wuxia" id="btn-up-hall" ${selH.locked || hSt.buildEnd > Date.now() ? 'disabled' : ''}>
              ${hSt.lv === 0 ? `Tái Thiết (${fmt(cost)} Linh Thạch)` : `Nâng Cấp Lv.${hSt.lv + 1} (${fmt(cost)} Linh Thạch)`}
            </button>
            <button class="btn-wuxia blue" id="btn-view-3d-town">Ngắm Sân 3D</button>
          </div>
        </div>
      `;

      body.querySelectorAll('[data-sel-hall]').forEach(el => {
        el.onclick = () => { selectedItem = el.getAttribute('data-sel-hall'); renderModalContent(); };
      });
      body.querySelectorAll('[data-quick-col]').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); engine.collectHall(btn.getAttribute('data-quick-col')); };
      });
      body.querySelectorAll('[data-assign-w]').forEach(btn => {
        btn.onclick = () => engine.assignHallWorker(selH.id, btn.getAttribute('data-assign-w'));
      });
      const bCol = document.getElementById('btn-col-hall');
      if (bCol) bCol.onclick = () => engine.collectHall(selH.id);
      document.getElementById('btn-up-hall').onclick = () => engine.startBuildHall(selH.id);
      document.getElementById('btn-view-3d-town').onclick = () => {
        closePanel();
        if (renderer.mode !== 'town') toggleSceneMode();
      };
    } else {
      const factions = engine.data.game.fight.relay.factions;
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="font-size:13px;color:#444;margin-bottom:8px;">
        Đánh bại chưởng môn/trại chủ các thế lực để thu chiến lợi phẩm <b>Linh Ấn</b>. Treo lên Linh Ấn Các tăng +4% Công & Sinh Lực mỗi tấm; Trả lại kết giao hữu hảo; Đập vỡ nhận ngay 80 Tiên Ngọc!
      </div>` + factions.map((fc, idx) => {
        const unlocked = idx === 0 ? st.maxStage >= 10 : !!st.clearedNodes[`r${idx}.boss`];
        const cur = st.plaques[idx] || '';
        return `<div class="item-row-card">
          <div>
            <div class="item-row-title">Linh Ấn · ${fc.name} ${cur ? `(${cur === 'hang' ? 'Đã Treo' : (cur === 'return' ? 'Đã Trả Lại' : 'Đã Đập Vỡ')})` : ''}</div>
            <div class="item-row-sub">${unlocked ? 'Đã thu phục thế lực này' : `Mở khi bình định ${fc.name}`}</div>
          </div>
          ${unlocked && !cur ? `<div style="display:flex;gap:6px;">
            <button class="btn-wuxia jade" data-plaque="${idx}" data-act="hang">Treo Lên (+4%)</button>
            <button class="btn-wuxia blue" data-plaque="${idx}" data-act="return">Trả Lại (+Hiệp)</button>
            <button class="btn-wuxia crimson" data-plaque="${idx}" data-act="break">Đập Vỡ (+80 Ngọc)</button>
          </div>` : `<span style="font-size:12px;font-weight:800;color:#666;">${cur ? 'Đã Xử Lý' : 'Chưa Mở'}</span>`}
        </div>`;
      }).join('');
      body.querySelectorAll('[data-plaque]').forEach(btn => {
        btn.onclick = () => {
          const idx = btn.getAttribute('data-plaque');
          const act = btn.getAttribute('data-act');
          st.plaques[idx] = act;
          if (act === 'return') st.rep += 10;
          if (act === 'break') { st.jade += 80; st.rep -= 5; }
          audio.playSfx('collect');
          renderModalContent();
          updateHud();
        };
      });
    }
  }

  // 5. GIANG HỒ PANEL (Bản Đồ 5 Chương / Trận Pháp / Phương Châm / Hồi Quy & Nghiệp Lực / Du Lãng)
  function renderJianghuPanel(body) {
    setModalHeader('Bản Đồ Tiên Giới', ['Viễn Chinh 5 Chương', 'Trận Pháp & Phương Châm', 'Hồi Quy & Nghiệp Lực', 'Du Lãng Vô Tận']);
    const st = engine.state;
    const jh = engine.data.jianghu;

    if (activeTab === 0) {
      const isRegionOpen = (idx) => idx === 0 || !!st.clearedNodes[`${jh.regions[idx - 1].id}.boss`];
      if (!isRegionOpen(selectedRegionIdx)) selectedRegionIdx = 0;
      const reg = jh.regions[selectedRegionIdx] || jh.regions[0];
      const regOpen = isRegionOpen(selectedRegionIdx);
      const nodes = reg.nodes;
      const selNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
      selectedNodeId = selNode.id;

      // Node layout coordinates (% on Xianxia World Map — all 9 nodes cleanly inside [12..88]x[16..84] with zero clipping!)
      const nodeCoords = {
        in: [12, 62], f1: [27, 36], f2: [29, 82], fork: [47, 58],
        q: [46, 20], a: [66, 40], b: [66, 80], rough: [80, 20], boss: [86, 58], story: [84, 20]
      };

      const hasForesight = engine.hasForesight && engine.hasForesight();
      const isNodeOpen = (n) => {
        if (!regOpen) return false;
        if (n.branch && !hasForesight) {
          const pickedBranch = st.branches && st.branches[reg.id];
          if (pickedBranch && pickedBranch !== n.branch) return false;
          if (!pickedBranch) return false;
        }
        if (!n.need || n.need.length === 0) return true;
        return n.need.every(req => req.split('|').some(sub => st.clearedNodes[`${reg.id}.${sub}`]));
      };

      const raidPending = st.raid && st.raid.pending;
      const expStreakPct = Math.round((engine.getExpStreakBonus ? engine.getExpStreakBonus() : 0) * 100);
      const injuredIds = Object.keys(st.injured || {});

      // Build glowing SVG connecting paths between prerequisite nodes -> child nodes!
      const routeLines = [];
      for (const n of nodes) {
        const dst = nodeCoords[n.id];
        if (!dst || !n.need) continue;
        for (const req of n.need) {
          for (const sub of req.split('|')) {
            const src = nodeCoords[sub];
            if (!src) continue;
            const activeRoute = !!st.clearedNodes[`${reg.id}.${sub}`];
            const bothCleared = activeRoute && !!st.clearedNodes[`${reg.id}.${n.id}`];
            routeLines.push(`<line x1="${src[0]}" y1="${src[1]}" x2="${dst[0]}" y2="${dst[1]}" class="map-route-line ${bothCleared ? 'cleared' : (activeRoute ? 'open' : 'locked')}" />`);
          }
        }
      }

      const needNames = (selNode.need || []).map(req =>
        req.split('|').map(sub => {
          const pn = nodes.find(x => x.id === sub);
          return pn ? (pn.name.includes('·') ? pn.name.split('·').slice(1).join('·').trim() : pn.name) : sub;
        }).join(' hoặc ')
      ).join(' + ');

      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;overflow:hidden;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${jh.regions.map((r, i) => {
              const rOpen = isRegionOpen(i);
              const rCleared = !!st.clearedNodes[`${r.id}.boss`];
              return `<button class="panel-tab ${i === selectedRegionIdx ? 'active' : ''} ${!rOpen ? 'locked-tab' : ''}" data-reg-idx="${i}" title="${rOpen ? r.title : `Bình định Thủ Lĩnh ${jh.regions[i - 1].title} để mở khóa!`}">${!rOpen ? '🔒 ' : (rCleared ? '✓ ' : '')}${r.title}</button>`;
            }).join('')}
          </div>
          <div class="jianghu-map-box" style="background-image:url('assets/img/${reg.art}.png?v=35');">
            <svg class="map-routes-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${routeLines.join('')}</svg>
            ${nodes.map(n => {
              const [lx, ly] = nodeCoords[n.id] || [50, 50];
              const clr = !!st.clearedNodes[`${reg.id}.${n.id}`];
              const open = isNodeOpen(n);
              const shortNm = n.name.includes('·') ? n.name.split('·').slice(1).join('·').trim() : n.name;
              return `<button class="map-node-btn ${clr ? 'cleared' : ''} ${n.kind === 'boss' ? 'boss-node' : ''} ${selNode.id === n.id ? 'selected' : ''} ${!open ? 'locked' : ''}"
                style="left:${lx}%;top:${ly}%;" data-node-id="${n.id}" title="${open ? n.name : 'Cần vượt cứ điểm trước để mở khóa!'}">
                ${clr ? '✓ ' : (!open ? '🔒 ' : '')}${shortNm}
              </button>`;
            }).join('')}
          </div>
        </div>

        <div class="panel-detail-box">
          <div>
            <div style="font-size:17px;font-weight:900;">${reg.title} — ${selNode.name.includes('·') ? selNode.name.split('·').slice(1).join('·').trim() : selNode.name}</div>
            <div style="font-size:12px;color:var(--crimson);font-weight:800;margin:4px 0;">
              Đặc tính địch: ${jh.traits.find(t => t.id === reg.trait)?.name || reg.trait} — Khắc chế bởi: ${jh.formations.find(f => f.id === jh.traits.find(t => t.id === reg.trait)?.counter)?.name || 'Bát Quái Tụ Linh Trận'}
            </div>
            <p style="font-size:13px;line-height:1.55;">${selNode.desc || reg.desc}</p>
          <div style="font-size:12.5px;color:#444;">
              Độ khó tương đương: <b>Ải ${selNode.stage || 10}</b> · Chuỗi Viễn Chinh: <b style="color:var(--jade-dark);">${st.expStreak || 0} (+${expStreakPct}% thưởng)</b><br/>
              Trận pháp đang bày: <b>${jh.formations.find(f => f.id === st.formation)?.name}</b>${hasForesight ? ' · <span style="color:#b88414;font-weight:800;">✦ Tiên Kiến Chi Minh</span>' : ''}
              ${selNode.branch && !hasForesight && (!st.branches[reg.id] || st.branches[reg.id] !== selNode.branch) ? `<div style="margin-top:4px;color:#b83227;font-weight:800;">🔒 Nhánh rẽ (${selNode.branch.toUpperCase()}): Cần chọn nhánh này ở điểm Ngã Rẽ hoặc mở Tiên Kiến Chi Minh!</div>` : ''}
              ${!isNodeOpen(selNode) && needNames ? `<div style="margin-top:4px;color:#b83227;font-weight:800;">🔒 Cần vượt trước: ${needNames}</div>` : ''}
            </div>
            ${raidPending ? `<div style="margin-top:8px;padding:9px 11px;border-radius:10px;background:rgba(184,50,39,0.12);border:1.5px solid #b83227;">
              <div style="font-size:12.5px;font-weight:900;color:#b83227;">🚨 TẬP KÍCH SƠN TRANG: ${raidPending.name}</div>
              <div style="font-size:11.5px;color:#333;margin:3px 0 6px;">${raidPending.line}</div>
              <button class="btn-wuxia crimson" id="btn-start-raid" style="padding:5px 12px;font-size:12px;">🛡 Nghênh Chiến Thủ Sơn Trang!</button>
            </div>` : (st.maxStage >= (jh.raid?.fromStage || 15) ? `<div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;background:rgba(20,52,58,0.06);padding:7px 10px;border-radius:9px;">
              <span style="font-size:11.5px;color:#444;">Đã đẩy lùi <b>${(st.raid && st.raid.wins) || 0}</b> đợt Tập Kích (chuỗi sạch: <b>${(st.raid && st.raid.cleanStreak) || 0}</b>)</span>
              <button class="btn-wuxia" id="btn-scout-raid" style="padding:4px 10px;font-size:11.5px;">🔍 Truy Kích Tập Kích</button>
            </div>` : '')}
            ${injuredIds.length ? `<div style="margin-top:6px;font-size:11.5px;color:#b83227;font-weight:800;">⚠ ${injuredIds.length} đệ tử đang trọng thương (vào mục Đệ Tử để trị thương)!</div>` : ''}
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${Object.values(st.outpostStored).some(v => v >= 5) ? `<button class="btn-wuxia" id="btn-col-outposts">Thu Cứ Điểm</button>` : ''}
            <button class="btn-wuxia jade" id="btn-enter-node" ${!isNodeOpen(selNode) ? 'disabled' : ''}>
              ${!isNodeOpen(selNode) ? '🔒 Chưa Mở Khóa' : (st.clearedNodes[`${reg.id}.${selNode.id}`] ? 'Xem Lại / Đánh Lại' : 'Khởi Hành Viễn Chinh')}
            </button>
          </div>
        </div>
      `;

      const bStartRaid = document.getElementById('btn-start-raid');
      if (bStartRaid) bStartRaid.onclick = () => { closePanel(); engine.startRaidDefense(); };
      const bScoutRaid = document.getElementById('btn-scout-raid');
      if (bScoutRaid) bScoutRaid.onclick = () => { engine.triggerRaidAlert(true); renderModalContent(); };

      body.querySelectorAll('[data-reg-idx]').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-reg-idx'), 10);
          if (!isRegionOpen(idx)) {
            engine.toast(`🔒 Bình định Thủ Lĩnh ${jh.regions[idx - 1].title} để mở khóa ${jh.regions[idx].title}!`);
            audio.playSfx('ui_deny');
            return;
          }
          selectedRegionIdx = idx;
          selectedNodeId = 'in';
          renderModalContent();
        };
      });
      body.querySelectorAll('[data-node-id]').forEach(btn => {
        btn.onclick = () => { selectedNodeId = btn.getAttribute('data-node-id'); renderModalContent(); };
      });
      const bOp = document.getElementById('btn-col-outposts');
      if (bOp) bOp.onclick = () => {
        for (const [rk, val] of Object.entries(st.outpostStored)) {
          const amt = Math.floor(val);
          if (amt > 0) { st[rk] = (st[rk] || 0) + amt; st.outpostStored[rk] -= amt; }
        }
        audio.playSfx('collect');
        engine.toast('Đã thu hoạch toàn bộ Cứ Điểm Tiên Giới!');
        renderModalContent();
        updateHud();
      };

      document.getElementById('btn-enter-node').onclick = () => {
        const key = `${reg.id}.${selNode.id}`;
        const finishNode = (choiceObj) => {
          st.clearedNodes[key] = true;
          st.season.stats.road++;
          if (selNode.form && !st.unlockedForms.includes(selNode.form)) {
            st.unlockedForms.push(selNode.form);
            engine.toast(`Đã lĩnh ngộ trận pháp mới: ${jh.formations.find(f => f.id === selNode.form)?.name}!`);
          }
          if (selNode.post && selNode.post.res) {
            st.outposts[key] = selNode.post;
          }
          const rwMul = (1 + (engine.getExpStreakBonus ? engine.getExpStreakBonus() : 0) + (engine.getPactRewardBonus ? engine.getPactRewardBonus() : 0)) * (engine.getLapMods ? engine.getLapMods().rewardMul : 1);
          const rewards = [...(selNode.reward || []), ...((choiceObj && choiceObj.reward) || [])];
          for (const rw of rewards) {
            st[rw.res] = (st[rw.res] || 0) + Math.max(1, Math.round(rw.n * rwMul));
          }
          const joins = [...(selNode.join || []), ...((choiceObj && choiceObj.join) || [])];
          for (const jid of joins) {
            if (!st.disciples[jid]) {
              st.disciples[jid] = { lv: 1, stars: 0, shards: 0 };
              audio.playVoice(`${jid}_join`);
              engine.toast(`🎉 ${engine.data.game.disciples.find(d => d.id === jid)?.name} đã gia nhập Thái Hư Tiên Môn!`);
            }
          }
          if (choiceObj && choiceObj.rep) st.rep += choiceObj.rep;
          if (choiceObj && choiceObj.branch) st.branches[reg.id] = choiceObj.branch;
          const karmaMul = 1 + (engine.getPerkVal ? engine.getPerkVal('karma') : 0);
          if (selNode.kind === 'boss') {
            if (engine.addFame) engine.addFame(jh.fame.region); else st.fame += jh.fame.region;
            st.karma += Math.round(jh.karma.boss * karmaMul);
          } else {
            st.karma += Math.round((selNode.kind === 'event' ? (jh.karma.evt || 1) : jh.karma.fight) * karmaMul);
          }
          engine.checkFeats();
          updateHud();
          renderModalContent();
        };

        closePanel();
        if (selNode.kind === 'event' || selNode.kind === 'story') {
          const repGate = jh.repGate || 20;
          const repVal = st.rep || 0;
          const meetsGate = (g) => {
            if (!g) return true;
            if (g === 'Hiệp') return repVal >= repGate;
            if (g === 'Bá') return repVal <= -repGate;
            if (g === 'Trung') return Math.abs(repVal) < repGate;
            return true;
          };
          const choices = (selNode.choices || []).map(ch => {
            const ok = meetsGate(ch.gate);
            return {
              label: ok
                ? `${ch.label}${ch.gate ? ` [${ch.gate}]` : ''} (${ch.desc})`
                : `🔒 ${ch.label} [Cần ${ch.gate}: Danh Vọng ${ch.gate === 'Hiệp' ? '≥ +' + repGate : (ch.gate === 'Bá' ? '≤ -' + repGate : 'trong -' + repGate + '..+' + repGate)}]`,
              onPick: () => {
                if (!ok) {
                  engine.toast(`🔒 Chưa đạt điều kiện Danh Vọng [${ch.gate}]!`);
                  audio.playSfx('ui_deny');
                  return;
                }
                finishNode(ch);
              }
            };
          });
          playStorySequence({
            title: selNode.name,
            lines: (selNode.cuts && selNode.cuts.length) ? selNode.cuts : [{ who: reg.title, fig: selNode.fig || '', text: selNode.desc }],
            choices: choices.length ? choices : null,
            onDone: choices.length ? null : () => finishNode(null)
          });
        } else {
          const startBattle = () => {
            if (renderer.mode === 'town') toggleSceneMode();
            engine.setupCombat('jianghu', false, {
              stage: selNode.stage || 12,
              sec: jh.nodeSec || 90,
              trait: reg.trait,
              isRegionBoss: selNode.kind === 'boss',
              title: `${reg.title} · ${selNode.name}`,
              onWin: () => {
                finishNode(null);
                const runEndingIfFinal = () => {
                  if (key === 'r5.boss' && engine.getActiveEnding) {
                    const end = engine.getActiveEnding();
                    if (end) {
                      if (!st.endingsSeen) st.endingsSeen = {};
                      const first = !st.endingsSeen[end.id];
                      st.endingsSeen[end.id] = true;
                      if (first) {
                        st.jade = (st.jade || 0) + 500;
                        engine.toast(`🏆 Đạt Kết Cục: ${end.name} · Thưởng +500 Linh Ngọc!`);
                      }
                      engine.saveState();
                      playStorySequence({ title: `KẾT CỤC · ${end.name}`, lines: end.cuts, doneLabel: 'Tiếp Tục Tu Tiên' });
                    }
                  }
                };
                if (selNode.after && selNode.after.length) {
                  playStorySequence({ title: selNode.name, lines: selNode.after, onDone: runEndingIfFinal });
                } else {
                  runEndingIfFinal();
                }
              }
            });
            const trObj = engine.getActiveTrait && engine.getActiveTrait(engine.combat);
            if (trObj) {
              engine.toast(trObj.countered
                ? `✦ Trận Pháp khắc chế hoàn toàn đặc tính ${trObj.name}!`
                : `⚠ Địch mang đặc tính ${trObj.name}: ${trObj.desc}`);
            }
          };
          if (selNode.cuts && selNode.cuts.length) {
            playStorySequence({ title: selNode.name, lines: selNode.cuts, doneLabel: 'Xung Trận!', onDone: startBattle });
          } else {
            startBattle();
          }
        }
      };
    } else if (activeTab === 1) {
      const repTier = engine.getRepTier ? engine.getRepTier() : null;
      const repVal = st.rep || 0;
      const repLabel = repTier ? `${repTier.name} (${repVal >= 0 ? '+' : ''}${repVal})` : `Vô Danh (${repVal >= 0 ? '+' : ''}${repVal})`;
      body.innerHTML = `
        <div class="panel-col-scroll">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-weight:900;font-size:15px;">Ngũ Hành Trận Pháp</span>
            <span class="tag-pill ${repVal >= 30 ? 'jade' : (repVal <= -30 ? 'gold' : '')}" title="Danh Vọng Tông Môn từ các lựa chọn Viễn Chinh (ảnh hưởng Kết Cục Chương 5 & hiệu ứng Danh Hiệu)">Danh Vọng: ${repLabel}</span>
          </div>
          ${jh.formations.map(f => {
            const unlocked = st.unlockedForms.includes(f.id) || st.maxStage >= 12;
            const active = st.formation === f.id;
            const mast = engine.getFormationMastery ? engine.getFormationMastery(f.id) : { uses: 0, tier: 0, mul: 1, nextNeed: 5 };
            const mastTxt = mast.nextNeed
              ? `Thông Thạo Bậc ${mast.tier} (+${Math.round((mast.mul - 1) * 100)}% · ${mast.uses}/${mast.nextNeed} trận)`
              : `Thông Thạo Tối Đa Bậc ${mast.tier} (+${Math.round((mast.mul - 1) * 100)}%)`;
            return `<div class="item-row-card ${active ? 'selected' : ''}">
              <div>
                <div class="item-row-title">${f.name} <span class="tag-pill jade" style="font-size:10.5px;">Bậc ${mast.tier}</span></div>
                <div class="item-row-sub">${f.desc}</div>
                <div style="font-size:11px;color:var(--jade-dark);font-weight:800;margin-top:2px;">⭐ ${mastTxt}</div>
              </div>
              <button class="btn-wuxia ${active ? 'jade' : ''}" data-set-form="${f.id}" ${!unlocked ? 'disabled' : ''}>${active ? 'Đang Bày' : 'Bày Trận'}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;margin-bottom:4px;">Phương Châm Trị Phái (5/5 Nhánh)</div>
          ${jh.doctrines.map((doc, dIdx) => `<div style="background:var(--hanji-card);padding:10px;border-radius:10px;border:1px solid #ccc;">
            <div style="font-weight:800;font-size:13.5px;margin-bottom:6px;">${doc.title}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${doc.opts.map((o, oIdx) => `<button class="btn-wuxia ${st.doctrines[dIdx] === oIdx ? 'jade' : ''}" style="font-size:11.5px;padding:5px 10px;" data-doc="${dIdx}" data-opt="${oIdx}" title="${o.desc}">${o.name}</button>`).join('')}
            </div>
          </div>`).join('')}
        </div>
      `;
      body.querySelectorAll('[data-set-form]').forEach(btn => {
        btn.onclick = () => {
          if (engine.hasPact && engine.hasPact('fixForm')) {
            engine.toast('🔒 Đang bật Thề Ước Cố Định Trận Pháp — không thể đổi trận!');
            audio.playSfx('ui_deny');
            return;
          }
          st.formation = btn.getAttribute('data-set-form');
          audio.playSfx('ui_click');
          renderModalContent();
        };
      });
      body.querySelectorAll('[data-doc]').forEach(btn => {
        btn.onclick = () => {
          st.doctrines[parseInt(btn.getAttribute('data-doc'), 10)] = parseInt(btn.getAttribute('data-opt'), 10);
          audio.playSfx('ui_click');
          renderModalContent();
        };
      });
    } else if (activeTab === 2) {
      const canRebirth = !!st.clearedNodes['r1.boss'] || st.maxStage >= 15;
      const karmaDiv = (jh.karma && jh.karma.rebirthDiv) || 2;
      const karmaMul = 1 + (engine.getPerkVal ? engine.getPerkVal('karma') : 0);
      const gainKarma = Math.max(15, Math.round((st.maxStage * 1.5 + Object.keys(st.clearedNodes).length * 4) * karmaMul * (1 + (engine.getPactRewardBonus ? engine.getPactRewardBonus() : 0) / karmaDiv)));
      const lapMods = engine.getLapMods ? engine.getLapMods() : { foeHpMul: 1, rewardMul: 1, cdMul: 1 };
      const activePacts = st.pacts || [];
      const pactBonusPct = Math.round((engine.getPactRewardBonus ? engine.getPactRewardBonus() : 0) * 100);
      body.innerHTML = `
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;">Nghiệp Lực Vĩnh Cửu & Thâm Hóa (Hiện có: ${fmt(st.karma)} Nghiệp)</div>
          ${jh.perks.map(p => {
            const lv = st.perks[p.id] || 0;
            const maxLv = engine.getPerkMaxLv ? engine.getPerkMaxLv(p) : p.max;
            const cost = engine.getPerkNextCost ? engine.getPerkNextCost(p, lv) : (p.costBase + lv * p.costStep);
            const isDeep = lv >= p.max && p.deep && p.deep > p.max;
            const lockedRebirth = p.needRebirth && (st.rebirths || 0) < p.needRebirth;
            return `<div class="item-row-card ${isDeep ? 'selected' : ''}">
              <div class="item-row-left">
                <img class="item-row-icon" src="assets/img/ut_pk_${p.id}.png" onerror="this.src='assets/img/ut_pk_sword.png'" alt="" />
                <div>
                  <div class="item-row-title">${p.name} Lv.${lv}/${maxLv} ${isDeep ? '<span class="tag-pill gold" style="font-size:10px;">Thâm Hóa</span>' : ''}</div>
                  <div class="item-row-sub">${p.desc}${lockedRebirth ? ` · <b style="color:#b83227;">Cần Hồi Quy ${p.needRebirth} lần</b>` : (isDeep ? ` · Thâm Hóa +${Math.round((p.deepPer || 0.05) * 100)}%/cấp` : '')}</div>
                </div>
              </div>
              <button class="btn-wuxia ${isDeep ? 'jade' : ''}" data-up-perk="${p.id}" ${lockedRebirth || st.karma < cost || lv >= maxLv ? 'disabled' : ''}>
                ${lv >= maxLv ? 'Tối Đa' : (lockedRebirth ? '🔒 Hồi Quy' : `${isDeep ? 'Thâm Hóa' : 'Nâng'} (${cost})`)}
              </button>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-col-scroll">
          <div style="background:var(--hanji-card);padding:12px;border-radius:12px;border:1.5px solid #c9b58b;">
            <div style="font-size:16px;font-weight:900;">Luân Hồi Hồi Quy · Chu Kỳ ${st.lap}/${jh.laps?.cap || 5}</div>
            <div style="font-size:12px;color:#444;margin:4px 0 6px;line-height:1.5;">
              Hiệu lực Chu Kỳ hiện tại: Quái <b>×${lapMods.foeHpMul.toFixed(2)} HP</b> · Thưởng <b>×${lapMods.rewardMul.toFixed(2)}</b> · Hồi chiêu kỹ năng <b>×${lapMods.cdMul.toFixed(2)}</b>.<br/>
              Nhận ngay khi Hồi Quy: <b style="color:var(--jade-dark);">+${gainKarma} Nghiệp Lực</b>!
            </div>
            <button class="btn-wuxia crimson" id="btn-do-rebirth" style="width:100%;" ${!canRebirth ? 'disabled' : ''}>
              ${canRebirth ? `🔄 Khởi Động Hồi Quy (+${gainKarma} Nghiệp)` : 'Mở khi vượt Thủ Lĩnh Chương 1 hoặc Ải 15'}
            </button>
          </div>
          <div style="font-weight:900;font-size:14.5px;margin-top:4px;display:flex;justify-content:space-between;align-items:center;">
            <span>📜 Minh Ước Thử Thách (${activePacts.length}/${jh.pactMax || 4})</span>
            <span class="tag-pill jade">Thưởng +${pactBonusPct}%</span>
          </div>
          ${(jh.pacts || []).map(pk => {
            const on = activePacts.includes(pk.id);
            const pactDescs = {
              strong: 'Tăng +30% Sinh Lực toàn bộ yêu thú & thủ lĩnh',
              nosalve: 'Giảm 2 bình Hồi Linh Đan tối đa khi chiến đấu',
              few: 'Giới hạn tối đa 3 Đệ Tử xuất trận cùng lúc',
              fixform: 'Khóa cố định Trận Pháp hiện tại, không thể đổi trận',
              rage: 'Thủ Lĩnh +30% Công và hóa cuồng nộ sớm ở 65% HP',
              grudge: 'Gọi thêm viện binh mai phục cùng Thủ Lĩnh & tăng Tập Kích Oán Thù'
            };
            const pct = Math.round(((pk.karma ?? pk.bonus) || 0) * 100);
            return `<div class="item-row-card ${on ? 'selected' : ''}" style="padding:8px 10px;">
              <div>
                <div class="item-row-title" style="font-size:13px;">${pk.name} <span class="tag-pill gold" style="font-size:10px;">+${pct}%</span></div>
                <div class="item-row-sub" style="font-size:11.5px;">${pk.desc || pactDescs[pk.id] || ''}</div>
              </div>
              <button class="btn-wuxia ${on ? 'crimson' : ''}" style="padding:5px 10px;font-size:11.5px;" data-toggle-pact="${pk.id}">${on ? 'Đang Lập' : 'Lập Ước'}</button>
            </div>`;
          }).join('')}
        </div>
      `;
      body.querySelectorAll('[data-up-perk]').forEach(btn => {
        btn.onclick = () => {
          const pid = btn.getAttribute('data-up-perk');
          const p = jh.perks.find(x => x.id === pid);
          const lv = st.perks[pid] || 0;
          const maxLv = engine.getPerkMaxLv ? engine.getPerkMaxLv(p) : p.max;
          const cost = engine.getPerkNextCost ? engine.getPerkNextCost(p, lv) : (p.costBase + lv * p.costStep);
          if (p.needRebirth && (st.rebirths || 0) < p.needRebirth) return;
          if (st.karma >= cost && lv < maxLv) {
            st.karma -= cost;
            st.perks[pid] = lv + 1;
            audio.playSfx('levelup');
            engine.saveState();
            renderModalContent();
            updateHud();
          }
        };
      });
      body.querySelectorAll('[data-toggle-pact]').forEach(btn => {
        btn.onclick = () => {
          engine.togglePact(btn.getAttribute('data-toggle-pact'));
          renderModalContent();
          updateHud();
        };
      });
      const bReb = document.getElementById('btn-do-rebirth');
      if (bReb) bReb.onclick = () => {
        if (!st.featStats) st.featStats = { expWins: 0, gritWins: 0, noSalveWins: 0, pactFullWins: 0, pactLapWins: 0, shadowCleanWins: 0, soloWins: 0 };
        const pCnt = (st.pacts || []).length;
        if (pCnt >= 4) st.featStats.pactFullWins = (st.featStats.pactFullWins || 0) + 1;
        if (pCnt >= 2) st.featStats.pactLapWins = (st.featStats.pactLapWins || 0) + 1;
        st.karma += gainKarma;
        st.rebirths++;
        st.lap = Math.min(jh.laps?.cap || 5, st.lap + 1);
        st.stage = 1;
        st.train = { atk: 0, hp: 0, def: 0, crit: 0, critDmg: 0 };
        st.realmIdx = 0;
        st.clearedNodes = {};
        st.branches = {};
        st.expStreak = 0;
        st.injured = {};
        audio.playSfx('ult');
        engine.checkFeats();
        engine.setupCombat('field');
        engine.toast(`🔄 Đã bước sang Chu Kỳ ${st.lap}! Nhận +${gainKarma} Nghiệp Lực!`);
        renderModalContent();
        updateHud();
      };
    } else {
      const wCfg = jh.wander || {};
      const routes = wCfg.routes || [
        { id: 'iron', name: 'Con Đường Thiết Bích', hp: 1.2, atk: 1, karma: 0.25, jade: 0 },
        { id: 'blood', name: 'Con Đường Huyết Khí', hp: 1, atk: 1.2, karma: 0, jade: 0.25 }
      ];
      const wearPct = Math.round((st.wanderWear || 0) * 100);
      const isBossNext = (st.wanderFloor % (wCfg.bossEvery || 10)) === 0;
      const isEvtNext = (st.wanderFloor % (wCfg.eventEvery || 4)) === 0;
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="display:flex;gap:18px;align-items:center;background:var(--hanji-card);padding:18px;border-radius:14px;">
        <img src="assets/img/region_wander.png" style="width:230px;height:175px;object-fit:cover;border-radius:12px;border:2px solid #232a2c;" alt="" />
        <div style="flex:1;">
          <div style="font-size:20px;font-weight:900;">Du Lãng Tiên Giới · Tầng ${st.wanderFloor} ${isBossNext ? '<span class="tag-pill gold">⚔ CAO THỦ ẨN THẾ</span>' : (isEvtNext ? '<span class="tag-pill jade">✦ KỲ NGỘ</span>' : '')}</div>
          <p style="font-size:13px;line-height:1.55;">
            Chặng đường bất tận thử thách bản lĩnh Thái Hư Tiên Môn. Mỗi tầng thưởng Tiên Ngọc & Nghiệp Lực, mỗi ${wCfg.eventEvery || 4} tầng gặp Kỳ Ngộ, mỗi ${wCfg.bossEvery || 10} tầng chạm trán Cao Thủ Ẩn Thế!
          </p>
          <div style="font-size:12px;margin-bottom:10px;color:${wearPct > 0 ? '#b83227' : '#2d6a4f'};font-weight:800;">
            Độ Mòn Sức Hiện Tại: -${wearPct}% Công/Máu (tăng +${Math.round((wCfg.wear || 0.1) * 100)}% sau mỗi tầng liên tiếp)
            ${wearPct > 0 ? `<button class="btn-wuxia" id="btn-wander-rest" style="margin-left:10px;padding:3px 10px;font-size:11.5px;">🍵 Nghỉ Hồi Sức (500 Linh Thạch)</button>` : ''}
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${routes.map((rt, ri) => `<button class="btn-wuxia ${ri === 0 ? 'jade' : 'crimson'}" data-wander-route="${rt.id}">
              ${rt.name} (Quái ${rt.hp > 1 ? `×${rt.hp} HP` : `×${rt.atk} Công`} · ${rt.karma > 0 ? `+${Math.round(rt.karma * 100)}% Nghiệp` : `+${Math.round(rt.jade * 100)}% Ngọc`})
            </button>`).join('')}
          </div>
        </div>
      </div>`;
      const bRest = document.getElementById('btn-wander-rest');
      if (bRest) bRest.onclick = () => {
        if (st.coin < 500) { engine.toast('Cần 500 Linh Thạch để nghỉ hồi sức!'); return; }
        st.coin -= 500;
        st.wanderWear = 0;
        audio.playSfx('heal');
        engine.toast('🍵 Đã nghỉ ngơi dưỡng sức — xóa sạch Mòn Sức Du Lãng!');
        renderModalContent();
        updateHud();
      };
      const goWander = (route) => {
        closePanel();
        if (renderer.mode === 'town') toggleSceneMode();
        const fl = st.wanderFloor;
        st.wanderRoute = route.id;
        const bossFl = (fl % (wCfg.bossEvery || 10)) === 0;
        const evtFl = (fl % (wCfg.eventEvery || 4)) === 0;
        const startWanderFight = () => {
          engine.setupCombat('jianghu', false, {
            stage: Math.max(18 + fl * 2, (wCfg.stageBase || 40) - 22 + fl * (wCfg.stageStep || 1)),
            sec: 75,
            isWander: true,
            isWanderBoss: bossFl,
            routeHpMul: route.hp || 1.0,
            routeAtkMul: route.atk || 1.0,
            title: `Du Lãng · Tầng ${fl} (${route.name})${bossFl ? ' · CAO THỦ ẨN THẾ' : ''}`,
            onWin: () => {
              const baseJ = bossFl ? (wCfg.jadeBoss || 50) : (wCfg.jade || 10);
              const baseK = bossFl ? (jh.karma?.wanderBoss || 5) : (jh.karma?.wander || 1);
              const jGain = Math.round(baseJ * (1 + (route.jade || 0)));
              const kGain = Math.max(1, Math.round(baseK * (1 + (route.karma || 0)) * (1 + (engine.getPerkVal ? engine.getPerkVal('karma') : 0))));
              st.jade += jGain;
              st.karma += kGain;
              st.wanderFloor++;
              st.wanderWear = Math.min(0.45, (st.wanderWear || 0) + (wCfg.wear || 0.1));
              if (bossFl && engine.addFame) engine.addFame(jh.fame?.wander || 25);
              engine.toast(`Vượt Du Lãng tầng ${fl}: +${jGain} Tiên Ngọc, +${kGain} Nghiệp Lực!`);
              engine.checkFeats();
            }
          });
        };
        const evList = wCfg.events || [];
        if (evtFl && evList.length) {
          const ev = evList[Math.floor(Math.random() * evList.length)];
          playStorySequence({
            title: `Kỳ Ngộ Du Lãng Tầng ${fl} · ${ev.name}`,
            lines: (ev.cuts && ev.cuts.length) ? ev.cuts : [{ who: ev.name, fig: ev.fig || '', text: ev.desc }],
            choices: (ev.choices || []).map(ch => ({
              label: `${ch.label} (${ch.desc})`,
              onPick: () => {
                if (ch.rep) st.rep += ch.rep;
                if (ch.karma) st.karma += ch.karma;
                for (const rw of (ch.reward || [])) engine.grantGift(rw.res, rw.n);
                engine.toast(`✦ Kỳ Ngộ Du Lãng: ${ch.label}!`);
                startWanderFight();
              }
            }))
          });
        } else {
          startWanderFight();
        }
      };
      body.querySelectorAll('[data-wander-route]').forEach(btn => {
        btn.onclick = () => {
          const rid = btn.getAttribute('data-wander-route');
          const rt = routes.find(x => x.id === rid) || routes[0];
          goWander(rt);
        };
      });
    }
  }

  // 6. THÍ LUYỆN PANEL (Bí Cảnh Tu Tiên + Thông Thiên Tháp 20 Tầng)
  function renderTrialPanel(body) {
    setModalHeader('Bí Cảnh Thí Luyện', ['Bí Cảnh Tu Tiên', 'Thông Thiên Tháp']);
    const st = engine.state;

    if (activeTab === 0) {
      const trCfg = engine.data.game.trial;
      const qNeed = trCfg.questTrain || 3;
      const qCur = (st.season && st.season.stats && st.season.stats.train) || 0;
      const qDone = !!st.trialQuestClaimed;
      const qReady = !qDone && qCur >= qNeed;
      const iconMap = { coin: 'dung_mine', xp: 'dung_spring', scroll: 'dung_tomb', forge: 'dung_forge' };
      const rewardChips = {
        coin: [{ img: 'coin', txt: 'Linh Thạch' }],
        xp: [{ img: 'res_herb', txt: 'Linh Khí & Tu Vi' }],
        scroll: [{ img: 'res_scroll', txt: 'Ngọc Giản' }, { img: 'res_pill', txt: 'Đan Dược' }],
        forge: [{ img: 'res_core', txt: 'Yêu Đan' }, { img: 'res_herb', txt: 'Linh Thảo' }]
      };
      const rarMap = { coin: 'rarity-linh', xp: 'rarity-linh', scroll: 'rarity-dia', forge: 'rarity-tien' };
      body.className = 'panel-body single-col';
      body.innerHTML = `<div class="item-row-card ${qReady ? 'selected' : ''}" style="background:rgba(212,166,71,0.12);border:1.5px solid #d4a647;">
        <div>
          <div class="item-row-title">📋 Thí Luyện Tu Hành Hằng Ngày (${Math.min(qCur, qNeed)}/${qNeed} lần Cường Hóa Tu Vi)</div>
          <div class="item-row-sub">Thưởng hoàn thành: <b>+${trCfg.questJade || 30} Tiên Ngọc</b> & <b>+${trCfg.questScroll || 2} Ngọc Giản</b></div>
        </div>
        <button class="btn-wuxia ${qReady ? 'jade' : ''}" id="btn-claim-trial-quest" ${!qReady ? 'disabled' : ''}>
          ${qDone ? 'Đã Nhận ✓' : (qReady ? 'Nhận Thưởng' : `${Math.min(qCur, qNeed)}/${qNeed}`)}
        </button>
      </div>` + trCfg.daily.map(d => {
        const left = st.dailyLeft[d.id] ?? (trCfg.dailyRuns || 2);
        const lv = st.dailyLv[d.id] || 1;
        const chips = (rewardChips[d.id] || []).map(ch => `<span class="dung-reward-chip"><img src="assets/img/${ch.img}.png" alt="" />${ch.txt}</span>`).join('');
        return `<div class="item-row-card ${rarMap[d.id] || ''}">
          <div class="item-row-left">
            <img class="item-row-icon dung-icon-frame" src="assets/img/${iconMap[d.id] || 'cont_daily'}.png" alt="" />
            <div>
              <div class="item-row-title">${d.name} · Bậc ${lv}/${d.maxLv}</div>
              <div class="item-row-sub">${d.desc || ''} · Còn <b>${left}/${trCfg.dailyRuns || 2}</b> lượt · Hộ Sơn +${(st.halls.gate.lv || 0) * 10}% thưởng</div>
              <div class="dung-reward-strip">${chips}</div>
            </div>
          </div>
          <button class="btn-wuxia jade" data-run-daily="${d.id}" ${left <= 0 ? 'disabled' : ''}>Khiêu Chiến</button>
        </div>`;
      }).join('');
      const bTq = document.getElementById('btn-claim-trial-quest');
      if (bTq) bTq.onclick = () => {
        if (!st.trialQuestClaimed && qCur >= qNeed) {
          st.trialQuestClaimed = true;
          st.jade += (trCfg.questJade || 30);
          st.scroll += (trCfg.questScroll || 2);
          audio.playSfx('collect');
          engine.toast(`🎁 Hoàn thành Thí Luyện Hằng Ngày: +${trCfg.questJade || 30} Tiên Ngọc, +${trCfg.questScroll || 2} Ngọc Giản!`);
          engine.saveState();
          renderModalContent();
          updateHud();
        }
      };
      body.querySelectorAll('[data-run-daily]').forEach(btn => {
        btn.onclick = () => {
          const did = btn.getAttribute('data-run-daily');
          closePanel();
          if (renderer.mode === 'town') toggleSceneMode();
          engine.setupCombat('daily', false, { dailyId: did, stage: (st.dailyLv[did] || 1) * 3, sec: 60 });
        };
      });
    } else {
      const tw = engine.data.game.trial.tower;
      const curFl = st.towerFloor;
      const towerPct = Math.min(100, Math.round(((curFl - 1) / Math.max(1, tw.floors)) * 100));
      const milestones = [
        { fl: 5,  boss: 'Linh Khê Ngọc Thiềm Vương', img: 'boss_ch0', tier: 'Bậc Linh Phẩm' },
        { fl: 10, boss: 'Thanh La Viên Vương',        img: 'boss_ch1', tier: 'Bậc Địa Phẩm' },
        { fl: 15, boss: 'Xích Viêm Hỏa Long Quân',    img: 'boss_ch3', tier: 'Bậc Thiên Phẩm' },
        { fl: 20, boss: 'Cửu U Ma Kiếm Đế · Đỉnh Tháp', img: 'boss_ch5', tier: 'Bậc Tiên Phẩm' }
      ];
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--hanji-card);padding:16px 18px;border-radius:14px;border:2px solid #d4a647;">
        <div style="display:flex;gap:14px;align-items:center;flex:1;">
          <img src="assets/img/ut_tower.png" style="width:74px;height:74px;border-radius:14px;border:2px solid #d4a647;" alt="" />
          <div style="flex:1;">
            <div style="font-size:20px;font-weight:900;">${tw.name} · Tầng ${curFl}/${tw.floors}</div>
            <div style="font-size:13px;color:#555;margin-top:3px;">
              Thưởng vượt tầng: <b>+${curFl % 5 === 0 ? tw.jadeBoss : tw.jade} Tiên Ngọc</b> & <b>+${tw.scroll} Ngọc Giản</b> (Mỗi 5 tầng trấn giữ bởi Thái Cổ Yêu Đế!)
            </div>
            <div class="codex-prog-track" style="margin-top:8px;max-width:380px;height:9px;"><div class="codex-prog-fill" style="width:${towerPct}%"></div></div>
          </div>
        </div>
        <button class="btn-wuxia crimson" id="btn-climb-tower" style="padding:11px 18px;font-size:14px;" ${curFl > tw.floors ? 'disabled' : ''}>⚔ Đăng Tháp Tầng ${curFl}</button>
      </div>
      <div style="font-weight:900;font-size:13.5px;color:var(--jade-dark);margin-top:6px;">CÁC MỐC THỦ LĨNH TRẤN THÁP (5 · 10 · 15 · 20)</div>
      <div class="tower-milestone-grid">
        ${milestones.map(m => {
          const done = curFl > m.fl;
          const active = !done && curFl > m.fl - 5;
          return `<div class="item-row-card ${active ? 'selected' : ''} ${m.fl >= 15 ? 'rarity-tien' : 'rarity-linh'}" style="flex-direction:column;align-items:flex-start;gap:8px;padding:12px;">
            <div class="item-row-left">
              <img class="item-row-icon" style="width:48px;height:48px;border-radius:10px;border:1.5px solid #d4a647;background:#10292f;object-fit:cover;" src="assets/img/${m.img}.png" alt="" />
              <div>
                <div class="item-row-title">Tầng ${m.fl} · ${m.boss}</div>
                <div class="item-row-sub">${m.tier} · ${done ? '<b style="color:#1b7a52;">✓ Đã chinh phục</b>' : (active ? '<b style="color:#b8332a;">⚔ Mục tiêu kế tiếp</b>' : 'Chưa mở khóa')}</div>
              </div>
            </div>
            <div class="dung-reward-strip">
              <span class="dung-reward-chip"><img src="assets/img/jade.png" alt="" />+${tw.jadeBoss} Tiên Ngọc</span>
              <span class="dung-reward-chip"><img src="assets/img/res_scroll.png" alt="" />+${tw.scroll} Ngọc Giản</span>
            </div>
          </div>`;
        }).join('')}
      </div>`;
      const bTw = document.getElementById('btn-climb-tower');
      if (bTw) bTw.onclick = () => {
        closePanel();
        if (renderer.mode === 'town') toggleSceneMode();
        engine.setupCombat('tower', false, { stage: st.towerFloor * 2 + 2, sec: 60 });
      };
    }
  }

  // 7. VÕ LÂM PANEL (Luận Kiếm Đài & Tiên Giới Minh & Kỳ Tích)
  function renderMurimPanel(body) {
    setModalHeader('Tiên Giới Đại Hội', ['Luận Kiếm Đài', 'Tiên Giới Minh', 'Bảng Kỳ Tích']);
    const st = engine.state;

    if (activeTab === 0) {
      const aCfg = engine.data.online.arena;
      const tiers = aCfg.tiers;
      let curTier = tiers[0];
      for (const t of tiers) { if (st.arenaScore >= t.at) curTier = t; }
      const capLv = st.arenaCapLv || 0;
      const capCosts = aCfg.capCost || [200, 300, 450, 650, 900, 1200, 1600, 2100, 2700, 3400];
      const nextCapCost = capLv < capCosts.length ? capCosts[capLv] : null;
      const rivals = [
        { name: 'Thanh Vân Kiếm · Lý Bạch Hạc', img: 'pt_unhak', title: 'Kiếm Tông Tinh Anh', powerMul: 0.88 },
        { name: 'Kim Cang Điện · Triệu Cương', img: 'pt_cheolsan', title: 'Thể Tu Hộ Pháp', powerMul: 1.02 },
        { name: 'U Minh Các · Diệp Vô Ngân', img: 'pt_heugyeong', title: 'Ảnh Tu Sát Thủ', powerMul: 1.18 }
      ];
      body.className = 'panel-body single-col';
      body.innerHTML = `
        <div style="background:var(--hanji-card);padding:14px 18px;border-radius:14px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:18px;font-weight:900;">Bậc Hiện Tại: ${curTier.name} · ${st.arenaScore} Điểm</div>
            <div style="font-size:12.5px;color:#555;">Vinh Dự: <b>${fmt(st.honor)}</b> · Chiến Ấn Lv.${capLv}/${capCosts.length} (<b>+${capLv * 3}% Công/Máu</b>) · Lượt hôm nay: <b>${st.arenaRunsLeft}/${aCfg.runs || 5}</b></div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-wuxia jade" id="btn-arena-cap" ${!nextCapCost || st.honor < nextCapCost ? 'disabled' : ''}>
              ${nextCapCost ? `🏅 Nâng Chiến Ấn (${nextCapCost} Vinh Dự)` : '🏅 Chiến Ấn Tối Đa'}
            </button>
            <button class="btn-wuxia" id="btn-arena-buy-jade" ${st.honor < 60 ? 'disabled' : ''}>💎 Đổi 40 Ngọc (60 Vinh Dự)</button>
            <button class="btn-wuxia" id="btn-arena-buy-pill" ${st.honor < 80 ? 'disabled' : ''}>💊 Đổi 3 Đan Đột Phá (80 Vinh Dự)</button>
          </div>
        </div>
        ${rivals.map(rv => {
          const estPts = Math.max(aCfg.winMin || 12, Math.min(aCfg.winMax || 40, Math.round((aCfg.win || 25) + (rv.powerMul - 1.0) * 60)));
          return `<div class="item-row-card">
          <div class="item-row-left">
            <img class="item-row-icon" style="border-radius:50%;border:2px solid #d4a647;object-fit:cover;" src="assets/img/${rv.img}.png" alt="" />
            <div>
              <div class="item-row-title">${rv.name} <span class="tag-pill jade">${rv.title}</span></div>
              <div class="item-row-sub">Chiến lực ước tính: <b>${fmt(engine.getSectPower() * rv.powerMul)}</b> · Thắng +${estPts} Điểm & +${aCfg.honorWin || 20} Vinh Dự</div>
            </div>
          </div>
          <button class="btn-wuxia crimson" data-arena-mul="${rv.powerMul}" data-arena-nm="${rv.name}" ${st.arenaRunsLeft <= 0 ? 'disabled' : ''}>⚔ Luận Kiếm</button>
        </div>`;
        }).join('')}
      `;
      const bCap = document.getElementById('btn-arena-cap');
      if (bCap) bCap.onclick = () => { if (engine.upgradeArenaCap()) { renderModalContent(); updateHud(); } };
      const bHJ = document.getElementById('btn-arena-buy-jade');
      if (bHJ) bHJ.onclick = () => {
        if (st.honor >= 60) { st.honor -= 60; st.jade += 40; audio.playSfx('collect'); engine.toast('Đổi +40 Tiên Ngọc từ Vinh Dự!'); renderModalContent(); updateHud(); }
      };
      const bHP = document.getElementById('btn-arena-buy-pill');
      if (bHP) bHP.onclick = () => {
        if (st.honor >= 80) { st.honor -= 80; st.pill += 3; audio.playSfx('collect'); engine.toast('Đổi +3 Đan Dược Đột Phá từ Vinh Dự!'); renderModalContent(); updateHud(); }
      };
      body.querySelectorAll('[data-arena-mul]').forEach(btn => {
        btn.onclick = () => {
          closePanel();
          if (renderer.mode === 'town') toggleSceneMode();
          engine.setupCombat('arena', false, {
            foeMul: parseFloat(btn.getAttribute('data-arena-mul')),
            foeName: btn.getAttribute('data-arena-nm'),
            sec: aCfg.sec || 60
          });
        };
      });
    } else if (activeTab === 1) {
      const gCfg = engine.data.online.guild;
      const skillCap = engine.getGuildSkillCap ? engine.getGuildSkillCap() : 8;
      const bld = st.guild.bld || { hall: 1, yard: 1, store: 1 };
      const storeMul = 1 + ((bld.store || 1) - 1) * 0.1;
      const donateMerit = Math.round((gCfg.donateMerit || 20) * storeMul);
      const weekScore = st.guild.weekScore || 0;
      const borrowPool = ['unhak', 'macheol', 'yeonhwa', 'cheolsan'];
      body.innerHTML = `
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;">Bí Thuật Tiên Giới Minh (Cống Hiến: ${fmt(st.merit)} · Trần Lv.${skillCap})</div>
          ${gCfg.skills.map(sk => {
            const lv = st.guild.skills[sk.id] || 0;
            const maxCap = Math.min(sk.max, skillCap);
            const cost = sk.costBase + lv * sk.costStep;
            return `<div class="item-row-card">
              <div>
                <div class="item-row-title">${sk.name} Lv.${lv}/${maxCap}</div>
                <div class="item-row-sub">Tăng +${Math.round(sk.per * 100)}% mỗi cấp</div>
              </div>
              <button class="btn-wuxia" data-g-sk="${sk.id}" ${st.merit < cost || lv >= maxCap ? 'disabled' : ''}>${lv >= maxCap ? 'Đạt Trần' : `Học (${cost})`}</button>
            </div>`;
          }).join('')}
          <div style="font-weight:900;font-size:14.5px;margin-top:8px;">🏛 3 Công Trình Minh Hội (EXP Minh: ${fmt(st.guild.exp)})</div>
          ${(gCfg.buildings || []).map(b => {
            const lv = bld[b.id] || 1;
            const needExp = (gCfg.bldExp || [])[lv];
            return `<div class="item-row-card" style="padding:8px 10px;">
              <div>
                <div class="item-row-title" style="font-size:13px;">${b.name} Lv.${lv}/${(gCfg.bldExp || []).length}</div>
                <div class="item-row-sub" style="font-size:11.5px;">${b.desc}</div>
              </div>
              <button class="btn-wuxia jade" style="padding:5px 10px;font-size:11.5px;" data-g-bld="${b.id}" ${!needExp || st.guild.exp < needExp ? 'disabled' : ''}>${needExp ? `Nâng (${needExp} EXP)` : 'Tối Đa'}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="panel-col-scroll">
          <div style="background:var(--hanji-card);padding:12px;border-radius:12px;border:1.5px solid #c9b58b;">
            <div style="font-size:16.5px;font-weight:900;">${st.guild.name} · Điểm Tuần: ${fmt(weekScore)}</div>
            <div style="font-size:12px;color:#555;margin:4px 0 8px;">Đồng môn: ${gCfg.botMembers || 12}/${gCfg.max || 30} · Mượn chi viện: <b>${st.guild.borrowLeft ?? 2}/${gCfg.borrowPerDay || 2}</b>${st.guild.borrowedId ? ` (Đang mượn: <b>${engine.data.game.disciples.find(d => d.id === st.guild.borrowedId)?.name}</b>)` : ''}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn-wuxia" id="btn-guild-donate">Quyên Góp (+${donateMerit} Cống Hiến)</button>
              <button class="btn-wuxia jade" id="btn-guild-cheer" ${(st.guild.cheers || 0) <= 0 ? 'disabled' : ''}>🙌 Cổ Vũ (${st.guild.cheers || 0}/${gCfg.cheerPerDay || 3})</button>
              <button class="btn-wuxia crimson" id="btn-guild-boss" ${st.guild.bossRuns <= 0 ? 'disabled' : ''}>⚔ Ma Đầu Minh (${st.guild.bossRuns}/${gCfg.bossRuns || 3})</button>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center;">
              <span style="font-size:11.5px;font-weight:800;color:#444;">Mượn Cao Thủ:</span>
              ${borrowPool.map(bid => {
                const dd = engine.data.game.disciples.find(x => x.id === bid);
                return `<button class="btn-wuxia" style="padding:4px 8px;font-size:11px;" data-g-borrow="${bid}" ${(st.guild.borrowLeft ?? 2) <= 0 ? 'disabled' : ''}>${dd ? dd.name : bid}</button>`;
              }).join('')}
            </div>
          </div>
          <div style="font-weight:900;font-size:14px;margin-top:4px;">🎁 10 Mốc Thưởng Tuần Minh Hội</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            ${(gCfg.stages || []).map((reqScore, idx) => {
              const claimed = !!(st.guild.stagesClaimed && st.guild.stagesClaimed[idx]);
              const ok = weekScore >= reqScore;
              return `<div class="item-row-card ${ok && !claimed ? 'selected' : ''}" style="padding:7px 9px;">
                <div>
                  <div class="item-row-title" style="font-size:12px;">Mốc ${idx + 1} (${fmt(reqScore)})</div>
                  <div class="item-row-sub" style="font-size:11px;">+${gCfg.stageMerit[idx]} Cống Hiến · +${gCfg.stageJade[idx]} Ngọc</div>
                </div>
                <button class="btn-wuxia ${ok && !claimed ? 'jade' : ''}" style="padding:4px 8px;font-size:11px;" data-g-stg="${idx}" ${!ok || claimed ? 'disabled' : ''}>${claimed ? '✓' : 'Nhận'}</button>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
      body.querySelectorAll('[data-g-sk]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-g-sk');
          const sk = gCfg.skills.find(x => x.id === id);
          const lv = st.guild.skills[id] || 0;
          const cost = sk.costBase + lv * sk.costStep;
          if (st.merit >= cost && lv < Math.min(sk.max, skillCap)) {
            st.merit -= cost;
            st.guild.skills[id] = lv + 1;
            audio.playSfx('levelup');
            renderModalContent();
          }
        };
      });
      body.querySelectorAll('[data-g-bld]').forEach(btn => {
        btn.onclick = () => { if (engine.upgradeGuildBuilding(btn.getAttribute('data-g-bld'))) { renderModalContent(); updateHud(); } };
      });
      body.querySelectorAll('[data-g-stg]').forEach(btn => {
        btn.onclick = () => { if (engine.claimGuildStage(parseInt(btn.getAttribute('data-g-stg'), 10))) { renderModalContent(); updateHud(); } };
      });
      body.querySelectorAll('[data-g-borrow]').forEach(btn => {
        btn.onclick = () => { if (engine.borrowGuildDisciple(btn.getAttribute('data-g-borrow'))) { renderModalContent(); updateHud(); } };
      });
      const bCheer = document.getElementById('btn-guild-cheer');
      if (bCheer) bCheer.onclick = () => { if (engine.cheerGuild()) { renderModalContent(); updateHud(); } };
      document.getElementById('btn-guild-donate').onclick = () => {
        if (st.coin < 500) { engine.toast('Cần 500 Linh Thạch để quyên góp!'); return; }
        st.coin -= 500;
        st.merit += donateMerit;
        st.guild.exp += (gCfg.donateExp || 10);
        st.guild.weekScore = (st.guild.weekScore || 0) + 300;
        audio.playSfx('collect');
        renderModalContent();
        updateHud();
      };
      document.getElementById('btn-guild-boss').onclick = () => {
        closePanel();
        if (renderer.mode === 'town') toggleSceneMode();
        engine.setupCombat('guildBoss', false, { stage: st.maxStage, sec: gCfg.bossSec || 60, bossName: 'Hộ Pháp Huyết Ma' });
      };
    } else {
      const fTier = engine.getFameTier ? engine.getFameTier() : { idx: 0, tier: { name: 'Sơn Môn Vô Danh' }, next: null };
      const hallPct = Math.round((engine.getFameModVal ? engine.getFameModVal('hall') : 0) * 100);
      const opPct = Math.round((engine.getFameModVal ? engine.getFameModVal('outpost') : 0) * 100);
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="background:var(--hanji-card);padding:12px 16px;border-radius:12px;border:1.5px solid #d4a647;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-size:16px;font-weight:900;color:var(--jade-dark);">🏛 Danh Tiếng Sơn Môn: ${fTier.tier.name} (${fmt(st.fame)}${fTier.next ? ` / ${fmt(fTier.next.at)}` : ' · Tối Đa'})</div>
          <div style="font-size:12px;color:#555;">Hiệu lực Danh Tiếng: <b>+${hallPct}% Sản lượng Điện Các</b> · <b>+${opPct}% Sản lượng Cứ Điểm</b>${fTier.next ? ` · Mốc kế tiếp: <b>${fTier.next.name}</b>` : ''}</div>
        </div>
        <span class="tag-pill gold">Đã đạt ${Object.keys(st.featsClaimed || {}).length}/${engine.data.jianghu.feats.length} Kỳ Tích</span>
      </div>` +
        engine.data.jianghu.feats.map(ft => {
          const done = !!st.featsClaimed[ft.id];
          const cur = engine.getFeatProgress ? engine.getFeatProgress(ft) : 0;
          const pct = done ? 100 : Math.min(100, Math.round((cur / Math.max(1, ft.n)) * 100));
          return `<div class="item-row-card ${done ? 'selected' : ''}">
            <div class="item-row-left" style="flex:1;">
              <img class="item-row-icon" src="assets/img/ft_${ft.id}.png" onerror="this.src='assets/img/emblem.png'" alt="" />
              <div style="flex:1;">
                <div class="item-row-title">${ft.name} ${done ? '🏆' : ''}</div>
                <div class="item-row-sub">${ft.desc} · Thưởng: +${ft.jade} Ngọc & +${ft.fame} Danh Vọng</div>
                <div class="codex-prog-track" style="margin-top:4px;max-width:260px;height:6px;"><div class="codex-prog-fill" style="width:${pct}%"></div></div>
              </div>
            </div>
            <span style="font-size:12px;font-weight:800;color:${done ? 'var(--jade-main)' : '#666'};">${done ? 'Đã Đạt ✓' : `${Math.min(cur, ft.n)}/${ft.n}`}</span>
          </div>`;
        }).join('');
    }
  }

  // 8. TIẾT KHÍ PANEL (Tu Luyện Lục 30 Tầng Free+Paid + Nhiệm Vụ Ngày/Tuần + Đổi Tín Vật + Thái Cổ Lôi Thú)
  function renderSeasonPanel(body) {
    setModalHeader('Tiết Khí Tu Luyện Lục', ['Tu Luyện Lục 30 Cấp', 'Nhiệm Vụ Ngày & Tuần', 'Đổi Tín Vật', 'Thái Cổ Lôi Thú']);
    const st = engine.state;
    const sCfg = engine.data.game.season;
    const curTier = Math.min(sCfg.tiers || 30, Math.floor(st.season.xp / sCfg.tierXp) + 1);
    const seasonResMap = {
      coinMin: { lbl: 'phút Linh Thạch', img: 'coin' },
      xpMin:   { lbl: 'phút Điểm Tu Vi', img: 'res_herb' },
      scroll:  { lbl: 'Ngọc Giản Tiên Pháp', img: 'res_scroll' },
      jade:    { lbl: 'Tiên Ngọc', img: 'jade' },
      pill:    { lbl: 'Đan Dược Đột Phá', img: 'res_pill' },
      coin:    { lbl: 'Linh Thạch', img: 'coin' },
      herb:    { lbl: 'Linh Thảo', img: 'res_herb' },
      core:    { lbl: 'Yêu Đan', img: 'res_core' }
    };
    const fmtSeasonRw = (resKey, n) => {
      const m = seasonResMap[resKey] || { lbl: resKey, img: 'coin' };
      return `<span class="dung-reward-chip"><img src="assets/img/${m.img}.png" alt="" />+${fmt(n)} ${m.lbl}</span>`;
    };

    if (activeTab === 0) {
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="background:var(--hanji-card);padding:12px 16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div><b>Cấp Tiết Khí: ${curTier}/${sCfg.tiers || 30}</b> (EXP: ${st.season.xp} · Tín Vật: <b>${st.season.token}</b>)</div>
        <span class="tag-pill ${st.season.passOwned ? 'gold' : ''}">${st.season.passOwned ? '✦ Đã Mở Tiên Lệnh Cao Cấp' : 'Tiên Lệnh Cao Cấp: Mua tại Thương Điếm'}</span>
      </div>` + sCfg.free.map((rw, idx) => {
        const tier = idx + 1;
        const unlocked = curTier >= tier;
        const claimed = !!st.season.claimedFree[tier];
        const pRw = (sCfg.paid || [])[idx];
        const pClaimed = !!(st.season.claimedPaid && st.season.claimedPaid[tier]);
        const pCanClaim = unlocked && !!st.season.passOwned && !pClaimed;
        const m = seasonResMap[rw.res] || { lbl: rw.res, img: 'coin' };
        return `<div class="item-row-card ${unlocked && (!claimed || pCanClaim) ? 'selected' : ''}" style="flex-wrap:wrap;gap:8px;">
          <div class="item-row-left">
            <img class="item-row-icon" style="width:42px;height:42px;padding:4px;background:#10292f;border-radius:10px;border:1.5px solid #d4a647;object-fit:contain;" src="assets/img/${m.img}.png" alt="" />
            <div>
              <div class="item-row-title">Bậc ${tier} · Tu Luyện Lục</div>
              <div class="dung-reward-strip"><b style="font-size:11px;color:#555;">Thường:</b> ${fmtSeasonRw(rw.res, rw.n)}${rw.res2 ? fmtSeasonRw(rw.res2, rw.n2) : ''}</div>
              ${pRw ? `<div class="dung-reward-strip" style="margin-top:3px;"><b style="font-size:11px;color:#b88414;">Tiên Lệnh:</b> ${fmtSeasonRw(pRw.res, pRw.n)}${pRw.res2 ? fmtSeasonRw(pRw.res2, pRw.n2) : ''}</div>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-wuxia ${unlocked && !claimed ? 'jade' : ''}" data-claim-s="${tier}" ${!unlocked || claimed ? 'disabled' : ''}>
              ${claimed ? 'Đã Nhận' : (unlocked ? 'Nhận Thường' : `Bậc ${tier}`)}
            </button>
            ${pRw ? `<button class="btn-wuxia ${pCanClaim ? 'crimson' : ''}" data-claim-sp="${tier}" ${!pCanClaim ? 'disabled' : ''}>
              ${pClaimed ? 'Đã Nhận ✓' : (!st.season.passOwned ? '🔒 Tiên Lệnh' : (unlocked ? 'Nhận Cao Cấp' : `Bậc ${tier}`))}
            </button>` : ''}
          </div>
        </div>`;
      }).join('');
      body.querySelectorAll('[data-claim-s]').forEach(btn => {
        btn.onclick = () => {
          const t = parseInt(btn.getAttribute('data-claim-s'), 10);
          const rw = sCfg.free[t - 1];
          st.season.claimedFree[t] = true;
          engine.grantGift(rw.res, rw.n);
          if (rw.res2) engine.grantGift(rw.res2, rw.n2);
          audio.playSfx('collect');
          renderModalContent();
          updateHud();
        };
      });
      body.querySelectorAll('[data-claim-sp]').forEach(btn => {
        btn.onclick = () => {
          const t = parseInt(btn.getAttribute('data-claim-sp'), 10);
          const rw = (sCfg.paid || [])[t - 1];
          if (!rw || !st.season.passOwned) return;
          if (!st.season.claimedPaid) st.season.claimedPaid = {};
          st.season.claimedPaid[t] = true;
          engine.grantGift(rw.res, rw.n);
          if (rw.res2) engine.grantGift(rw.res2, rw.n2);
          audio.playSfx('recruit_gold');
          engine.toast(`✨ Nhận thưởng Tiên Lệnh Cao Cấp Bậc ${t}!`);
          renderModalContent();
          updateHud();
        };
      });
    } else if (activeTab === 1) {
      const kindNames = {
        boss: 'Hạ gục Thủ Lĩnh Cánh Đồng',
        train: 'Cường hóa Tu Vi Tông Chủ',
        collect: 'Thu hoạch Điện Các Sơn Môn',
        skill: 'Nâng cấp Tiên Pháp',
        daily: 'Hoàn thành Bí Cảnh Tu Tiên',
        tower: 'Vượt tầng Thông Thiên Tháp',
        road: 'Hoàn thành điểm Viễn Chinh Tiên Giới',
        recruit: 'Chiêu mộ Đệ Tử Sơn Môn'
      };
      const renderGoalList = (list, isWeek) => {
        const cMap = isWeek ? (st.season.weekClaimed || {}) : (st.season.dayClaimed || {});
        return (list || []).map((g, idx) => {
          const cur = (st.season.stats && st.season.stats[g.kind]) || 0;
          const done = !!cMap[idx];
          const ok = cur >= g.n;
          return `<div class="item-row-card ${ok && !done ? 'selected' : ''}" style="padding:9px 12px;">
            <div>
              <div class="item-row-title" style="font-size:13.5px;">${kindNames[g.kind] || g.kind} (${Math.min(cur, g.n)}/${g.n})</div>
              <div class="item-row-sub">Thưởng: <b>+${g.xp} EXP Tiết Khí</b>${g.token ? ` · <b>+${g.token} Tín Vật</b>` : ''}</div>
            </div>
            <button class="btn-wuxia ${ok && !done ? 'jade' : ''}" data-sgoal-wk="${isWeek ? 1 : 0}" data-sgoal-idx="${idx}" ${!ok || done ? 'disabled' : ''}>
              ${done ? 'Đã Nhận ✓' : (ok ? 'Nhận Thưởng' : 'Đang Làm')}
            </button>
          </div>`;
        }).join('');
      };
      body.innerHTML = `
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;">📅 Nhiệm Vụ Ngày (${(sCfg.dayGoals || []).length})</div>
          ${renderGoalList(sCfg.dayGoals, false)}
        </div>
        <div class="panel-col-scroll">
          <div style="font-weight:900;font-size:15px;">📆 Nhiệm Vụ Tuần (${(sCfg.weekGoals || []).length})</div>
          ${renderGoalList(sCfg.weekGoals, true)}
        </div>
      `;
      body.querySelectorAll('[data-sgoal-idx]').forEach(btn => {
        btn.onclick = () => {
          const isW = btn.getAttribute('data-sgoal-wk') === '1';
          const idx = parseInt(btn.getAttribute('data-sgoal-idx'), 10);
          if (engine.claimSeasonGoal(isW, idx)) { renderModalContent(); updateHud(); }
        };
      });
    } else if (activeTab === 2) {
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="background:var(--hanji-card);padding:12px 16px;border-radius:12px;font-weight:900;">
        🛍 Cửa Hàng Đổi Tín Vật Tiết Khí · Hiện có: <span style="color:var(--jade-dark);">${fmt(st.season.token)} Tín Vật</span>
      </div>` + (sCfg.trade || []).map((it, idx) => {
        const bought = (st.season.tradeBought && st.season.tradeBought[idx]) || 0;
        const m = seasonResMap[it.res] || { lbl: it.res, img: 'coin' };
        return `<div class="item-row-card">
          <div class="item-row-left">
            <img class="item-row-icon" style="width:42px;height:42px;padding:4px;background:#10292f;border-radius:10px;border:1.5px solid #d4a647;object-fit:contain;" src="assets/img/${m.img}.png" alt="" />
            <div>
              <div class="item-row-title">+${fmt(it.n)} ${m.lbl}</div>
              <div class="item-row-sub">Đã đổi: <b>${bought}/${it.max}</b></div>
            </div>
          </div>
          <button class="btn-wuxia jade" data-strade="${idx}" ${bought >= it.max || st.season.token < it.cost ? 'disabled' : ''}>
            ${bought >= it.max ? 'Hết Lượt' : `Đổi (${it.cost} Tín Vật)`}
          </button>
        </div>`;
      }).join('');
      body.querySelectorAll('[data-strade]').forEach(btn => {
        btn.onclick = () => {
          if (engine.buySeasonTrade(parseInt(btn.getAttribute('data-strade'), 10))) { renderModalContent(); updateHud(); }
        };
      });
    } else {
      body.className = 'panel-body single-col';
      body.innerHTML = `<div style="background:var(--hanji-card);padding:18px;border-radius:14px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:19px;font-weight:900;">${sCfg.boss.name}</div>
          <div style="font-size:13px;color:#555;margin-top:4px;">Lượt hôm nay: <b>${st.season.bossRuns}/${sCfg.boss.runs || 2}</b> · Hạ gục nhận +${(sCfg.boss.xp || 30) * 2} EXP Tiết Khí & +${sCfg.boss.tokenPer || 25} Tín Vật!</div>
        </div>
        <button class="btn-wuxia crimson" id="btn-season-boss" ${st.season.bossRuns <= 0 ? 'disabled' : ''}>Xuất Kích Trừ Ma</button>
      </div>`;
      const bSb = document.getElementById('btn-season-boss');
      if (bSb) bSb.onclick = () => {
        closePanel();
        if (renderer.mode === 'town') toggleSceneMode();
        engine.setupCombat('seasonBoss', false, { stage: Math.max(5, st.maxStage), sec: sCfg.boss.sec || 60, bossName: sCfg.boss.name });
      };
    }
  }

  // 9. TRUYỆN KÝ & KỶ NIỆM ĐỒNG MÔN
  function renderStoryArchivePanel(body) {
    setModalHeader('Truyện Ký Thái Hư Tiên Môn', ['Chính Tuyến', 'Nhân Duyên Đồng Môn']);
    const story = engine.data.story;
    const lineMap = {};
    for (const ln of story.lore.lines) lineMap[ln.id] = ln;

    body.className = 'panel-body single-col';
    const scenes = story.lore.scenes.filter(sc => activeTab === 0 ? sc.kind !== 'bond' : sc.kind === 'bond');
    body.innerHTML = `<div class="item-row-card" id="btn-replay-prologue">
      <div>
        <div class="item-row-title">🎬 Chương Mở Đầu · Kiếm Trở Về (Đầy Đủ Mở & Kết)</div>
        <div class="item-row-sub">Xem lại cảnh trọng sinh của Thiên Hạ Đệ Nhất Kiếm Lâm Phong trước Sơn Môn</div>
      </div>
      <button class="btn-wuxia jade">Xem Ngay</button>
    </div>` + scenes.map(sc => {
      const resolved = sc.lines.map(lid => {
        const pickId = lid.includes('|') ? (engine.state.rep >= 0 ? lid.split('|')[0] : lid.split('|')[1]) : lid;
        return lineMap[pickId];
      }).filter(Boolean);
      const title = sc.title || (resolved[0] && resolved[0].text.split('\n')[0]) || sc.id;
      return `<div class="item-row-card" data-play-sc="${sc.id}">
        <div>
          <div class="item-row-title">${title}</div>
          <div class="item-row-sub">${sc.jade ? `Thưởng xem lần đầu: +${sc.jade} Tiên Ngọc` : 'Ký ức giang hồ'} ${engine.state.seenScenes[sc.id] ? '· Đã xem' : ''}</div>
        </div>
        <button class="btn-wuxia">Đọc Truyện</button>
      </div>`;
    }).join('');

      document.getElementById('btn-replay-prologue').onclick = () => {
      closePanel();
      const ch0 = story.chapters[0];
      const taggedLines = [
        ...ch0.open.map((l, i) => ({ ...l, voKey: `pro_open_${i}` })),
        ...ch0.close.map((l, i) => ({ ...l, voKey: `pro_close_${i}` }))
      ];
      playStorySequence({ title: ch0.title, lines: taggedLines });
    };
    body.querySelectorAll('[data-play-sc]').forEach(el => {
      el.onclick = () => {
        const scId = el.getAttribute('data-play-sc');
        const sc = story.lore.scenes.find(x => x.id === scId);
        const resolved = sc.lines.map(lid => {
          const pickId = lid.includes('|') ? (engine.state.rep >= 0 ? lid.split('|')[0] : lid.split('|')[1]) : lid;
          return lineMap[pickId];
        }).filter(Boolean);
        closePanel();
        playStorySequence({
          title: sc.title || 'Truyện Ký',
          lines: resolved,
          onDone: () => {
            if (!engine.state.seenScenes[sc.id]) {
              engine.state.seenScenes[sc.id] = true;
              if (sc.jade) engine.state.jade += sc.jade;
              if (sc.scroll) engine.state.scroll += sc.scroll;
              if (sc.jade || sc.scroll) engine.toast(`Nhận thưởng Nhân Duyên: +${sc.jade} Ngọc!`);
              updateHud();
            }
          }
        });
      };
    });
  }

  // 10. THƯƠNG ĐIẾM & NẠP THẺ ONLINE PANEL (4 Tabs: Nạp Ngọc ×2 / Gói & Thẻ Tháng / Nạp Đầu & VIP 1-10 / Giftcode & Lịch Sử)
  function renderShopPanel(body) {
    if (window.renderTopupShopPanel) {
      window.renderTopupShopPanel(body, activeTab, setModalHeader, closePanel, updateHud);
      return;
    }
    setModalHeader('Tiên Bảo Các Sơn Môn', ['Phúc Lợi & Bảo Khố']);
    const st = engine.state;
    const shop = engine.data.game.shop;
    body.className = 'panel-body single-col';
    body.innerHTML = `
      <div class="item-row-card selected">
        <div class="item-row-left">
          <img class="item-row-icon" style="border-radius:10px;border:1.5px solid #d4a647;background:#10292f;" src="assets/img/ut_shop_ad.png" alt="" />
          <div>
            <div class="item-row-title">Phúc Lợi Tiên Ngọc Hàng Ngày (${st.adJadeLeft}/${shop.adPerDay})</div>
            <div class="item-row-sub">Phúc lợi Tông Chủ miễn phí mỗi ngày — nhận ngay +${shop.adJade} Tiên Ngọc!</div>
          </div>
        </div>
        <button class="btn-wuxia jade" id="btn-free-ad-jade" ${st.adJadeLeft <= 0 ? 'disabled' : ''}>Nhận +${shop.adJade} Ngọc</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${shop.products.map(p => {
          const boughtOnce = p.once && st.shopBought[p.id];
          const icon = (p.icon && p.icon !== 'star') ? p.icon : (p.id === 'remove_ads' ? 'menu_sect' : (p.id === 'season_pass' ? 'nav_season' : `ut_shop_${p.id}`));
          const coinCost = Math.max(2000, Math.round((p.krw || 3300) * 1.5));
          return `<div class="item-row-card">
            <div class="item-row-left">
              <img class="item-row-icon" style="border-radius:10px;border:1.5px solid rgba(212,166,71,0.75);background:#10292f;padding:2px;object-fit:contain;" src="assets/img/${icon}.png" onerror="this.src='assets/img/cont_shop.png'" alt="" />
              <div>
                <div class="item-row-title">${p.name}</div>
                <div class="item-row-sub">${p.desc || `Nhận ngay +${fmt(p.jade || 0)} Tiên Ngọc`}${p.coin ? ` & +${fmt(p.coin)} Linh Thạch` : ''}</div>
              </div>
            </div>
            <button class="btn-wuxia" data-buy-prod="${p.id}" data-cost="${coinCost}" ${boughtOnce || st.coin < coinCost ? 'disabled' : ''}>
              ${boughtOnce ? 'Đã Đổi' : `Đổi (${fmt(coinCost)} Linh Thạch)`}
            </button>
          </div>`;
        }).join('')}
      </div>
    `;
    document.getElementById('btn-free-ad-jade').onclick = () => {
      if (st.adJadeLeft > 0) {
        st.adJadeLeft--;
        st.jade += shop.adJade;
        audio.playSfx('collect');
        renderModalContent();
        updateHud();
      }
    };
    body.querySelectorAll('[data-buy-prod]').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.getAttribute('data-buy-prod');
        const cost = parseInt(btn.getAttribute('data-cost'), 10);
        const prod = shop.products.find(x => x.id === pid);
        if (st.coin >= cost) {
          st.coin -= cost;
          if (prod.jade) st.jade += prod.jade;
          if (prod.coin) st.coin += prod.coin;
          if (prod.season) st.season.passOwned = true;
          if (prod.noAds) st.noAds = true;
          if (prod.days) st.passDaysLeft = Math.min(prod.maxDays || 90, (st.passDaysLeft || 0) + prod.days);
          if (prod.once || prod.season) st.shopBought[pid] = true;
          audio.playSfx('recruit_gold');
          engine.toast(`Đã đổi thành công: ${prod.name}!`);
          engine.saveState();
          renderModalContent();
          updateHud();
        }
      };
    });
  }

  // 11. THIẾT LẬP, SAO LƯU & THỐNG KÊ DPS PANEL
  function renderSettingsPanel(body) {
    setModalHeader('Thiết Lập & Thống Kê Chiến Đấu', ['Âm Thanh & Sao Lưu', 'Thống Kê DPS']);
    body.className = 'panel-body single-col';

    if (activeTab === 1) {
      const c = engine.combat;
      const ds = (c && c.dpsStats) || { t: 1, master: 0, swordArray: 0, artifact: 0, pet: 0, mates: {} };
      const secs = Math.max(1, ds.t || 1);
      const rows = [
        { name: '⚔ Tông Chủ Lâm Phong (Chính)', val: ds.master || 0, col: '#38d8c4' },
        { name: '🗡 Ngự Kiếm Trận (Phi Binh 3D)', val: ds.swordArray || 0, col: '#52b8ff' },
        { name: '✨ Pháp Bảo Hộ Thân 3D', val: ds.artifact || 0, col: '#b584ff' },
        { name: '🐾 Linh Thú Hộ Mệnh 3D', val: ds.pet || 0, col: '#ff8cc8' }
      ];
      for (const [mid, mv] of Object.entries(ds.mates || {})) {
        const dDef = engine.data.game.disciples.find(d => d.id === mid);
        rows.push({ name: `👤 Đệ Tử · ${dDef ? dDef.name : mid}`, val: mv, col: '#f2b84b' });
      }
      rows.sort((a, b) => b.val - a.val);
      const totalDmg = Math.max(1, rows.reduce((s, r) => s + r.val, 0));
      const totalDps = Math.round(totalDmg / secs);

      body.innerHTML = `
        <div class="tm-stat-box" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:900;font-size:15px;">Tổng Sát Thương Trận Hiện Tại: <span style="color:var(--jade-dark);">${fmt(totalDmg)}</span></div>
            <div style="font-size:12px;color:#555;">Thời gian giao chiến: ${secs.toFixed(1)}s · Trung bình toàn đội: <b>${fmt(totalDps)} DPS</b></div>
          </div>
          <button class="btn-wuxia" id="btn-reset-dps">Đặt Lại Bộ Đếm</button>
        </div>
        ${rows.map(r => {
          const pct = Math.round((r.val / totalDmg) * 100);
          const dps = Math.round(r.val / secs);
          return `<div class="tm-dps-row">
            <div class="tm-dps-head">
              <span><b>${r.name}</b></span>
              <span>${fmt(r.val)} (${pct}%) · <b>${fmt(dps)} DPS</b></span>
            </div>
            <div class="tm-dps-track"><div class="tm-dps-fill" style="width:${Math.max(2, pct)}%;background:${r.col};"></div></div>
          </div>`;
        }).join('')}
        <div style="font-size:12px;color:#555;padding:6px 4px;">
          💡 Phím tắt chiến đấu: <b>1–4</b> Tiên Pháp · <b>R</b> Tuyệt Kỹ · <b>Space</b> Thân Pháp Lướt Né · <b>Q/H</b> Hồi Linh Đan · <b>M/T</b> Ngồi Thiền · <b>Tab</b> Sơn Môn / Chiến Trường.
        </div>
      `;
      const rst = document.getElementById('btn-reset-dps');
      if (rst) rst.onclick = () => {
        if (engine.combat) engine.combat.dpsStats = { t: 0, master: 0, swordArray: 0, artifact: 0, pet: 0, mates: {} };
        renderModalContent();
      };
      return;
    }

    const curGfx = (renderer && renderer.gfxQuality) || 'high';
    body.innerHTML = `
      <div class="item-row-card">
        <div>
          <div class="item-row-title">🎮 Chất Lượng Đồ Họa 3D</div>
          <div class="item-row-sub">Cao (Bloom + Bóng 2048) · Cân Bằng (Bóng 1024 · Tối ưu FPS) · Mượt (Tắt Bloom &amp; Bóng động cho máy yếu)</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn-wuxia ${curGfx === 'high' ? 'jade' : ''}" data-set-gfx="high">Cao</button>
          <button class="btn-wuxia ${curGfx === 'med' ? 'jade' : ''}" data-set-gfx="med">Cân Bằng</button>
          <button class="btn-wuxia ${curGfx === 'low' ? 'jade' : ''}" data-set-gfx="low">Mượt</button>
        </div>
      </div>
      <div class="item-row-card">
        <div class="item-row-title">🎵 Nhạc Nền (BGM): ${Math.round(audio.bgmVol * 100)}%</div>
        <input type="range" min="0" max="100" value="${Math.round(audio.bgmVol * 100)}" id="rng-bgm" style="width:220px;" />
      </div>
      <div class="item-row-card">
        <div class="item-row-title">⚔ Hiệu Ứng Âm Thanh (SFX): ${Math.round(audio.sfxVol * 100)}%</div>
        <input type="range" min="0" max="100" value="${Math.round(audio.sfxVol * 100)}" id="rng-sfx" style="width:220px;" />
      </div>
      <div class="item-row-card">
        <div>
          <div class="item-row-title">🗣 Âm Lượng Lồng Tiếng Việt: <span id="lbl-voice-vol">${Math.round((audio.voiceVol ?? 1.25) * 100)}%</span></div>
          <div class="item-row-sub">Đã tích hợp bộ khuếch đại giọng nói &amp; tự động giảm nhạc nền khi thoại</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="range" min="0" max="150" value="${Math.round((audio.voiceVol ?? 1.25) * 100)}" id="rng-voice" style="width:140px;" />
          <button class="btn-wuxia" id="btn-test-voice">Nghe Thử</button>
          <button class="btn-wuxia ${audio.voiceOn ? 'jade' : ''}" id="btn-tog-voice">${audio.voiceOn ? 'Đang Bật' : 'Đang Tắt'}</button>
        </div>
      </div>
      <div class="item-row-card">
        <div>
          <div class="item-row-title">🏆 Lối Tắt Tiên Giới Đại Hội &amp; Tiết Khí</div>
          <div class="item-row-sub">Mở nhanh Luận Kiếm Đài, Tiên Giới Minh và Tu Luyện Lục 30 cấp</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-wuxia blue" id="btn-goto-murim-quick">Tiên Giới Đại Hội</button>
          <button class="btn-wuxia" id="btn-goto-season-quick">Tiết Khí Lục</button>
        </div>
      </div>
      <div class="item-row-card" style="flex-direction:column;align-items:stretch;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div>
            <div class="item-row-title">💾 Sao Lưu, Xuất / Nhập Mã Tiến Trình</div>
            <div class="item-row-sub">Tự động lưu mỗi 8 giây · Có thể sao chép mã để mang sang trình duyệt khác</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn-wuxia jade" id="btn-save-now">Lưu Ngay</button>
            <button class="btn-wuxia blue" id="btn-export-save">Xuất Mã Lưu</button>
            <button class="btn-wuxia gold" id="btn-import-save">Khôi Phục Mã</button>
            <button class="btn-wuxia crimson" id="btn-reset-save">Xóa Lưu Chơi Lại</button>
          </div>
        </div>
        <textarea id="txt-save-io" rows="2" placeholder="Bấm 'Xuất Mã Lưu' để lấy mã sao lưu, hoặc dán mã vào đây rồi bấm 'Khôi Phục Mã'..." style="width:100%;font-size:11px;font-family:monospace;border-radius:8px;border:1px solid #b5a687;padding:6px;background:#fffdf6;resize:vertical;"></textarea>
      </div>
    `;
    body.querySelectorAll('[data-set-gfx]').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-set-gfx');
        if (renderer && renderer.setQuality) renderer.setQuality(mode);
        audio.playSfx('ui_click');
        const lbl = mode === 'high' ? 'Cao (Bloom + Bóng 2048)' : (mode === 'med' ? 'Cân Bằng (60 FPS)' : 'Mượt (Tiết Kiệm GPU)');
        engine.toast(`🎮 Đã chuyển đồ họa sang: ${lbl}`);
        renderModalContent();
      };
    });
    document.getElementById('rng-bgm').oninput = (e) => {
      audio.setBgmVolume(parseInt(e.target.value, 10) / 100);
    };
    document.getElementById('rng-sfx').oninput = (e) => {
      audio.setSfxVolume(parseInt(e.target.value, 10) / 100);
    };
    document.getElementById('rng-voice').oninput = (e) => {
      const v = parseInt(e.target.value, 10) / 100;
      audio.setVoiceVolume(v);
      document.getElementById('lbl-voice-vol').textContent = `${Math.round(v * 100)}%`;
    };
    document.getElementById('btn-test-voice').onclick = () => {
      audio.playRandom(['master_ult_1', 'yeonhwa_join', 'cheolsan_join', 'narrator_recruit_gold'], true);
    };
    document.getElementById('btn-tog-voice').onclick = () => {
      audio.setVoiceEnabled(!audio.voiceOn);
      renderModalContent();
    };
    const bMq = document.getElementById('btn-goto-murim-quick');
    const bSq = document.getElementById('btn-goto-season-quick');
    if (bMq) bMq.onclick = () => openPanel('murim', 0);
    if (bSq) bSq.onclick = () => openPanel('season', 0);
    document.getElementById('btn-save-now').onclick = () => {
      engine.saveState();
      engine.toast('Đã lưu dữ liệu thành công!');
    };
    document.getElementById('btn-export-save').onclick = () => {
      const code = engine.exportSaveString();
      const ta = document.getElementById('txt-save-io');
      if (ta) { ta.value = code; ta.select(); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).catch(() => {});
      engine.toast('📋 Đã xuất & sao chép mã lưu vào Clipboard!');
    };
    document.getElementById('btn-import-save').onclick = () => {
      const ta = document.getElementById('txt-save-io');
      const res = engine.importSaveString(ta ? ta.value : '');
      engine.toast(res.ok ? `✅ ${res.msg}` : `⚠ ${res.msg}`);
      if (res.ok) { closePanel(); updateHud(); }
    };
    document.getElementById('btn-reset-save').onclick = () => {
      if (confirm('Bạn có chắc muốn xóa dữ liệu để bắt đầu lại từ Chương Mở Đầu?')) {
        engine.resetSave();
        closePanel();
        startPrologueOpening();
      }
    };
  }

  // ==================== SCENE TOGGLE, INPUTS & BOOTSTRAP ====================
  function setSceneMode(targetMode) {
    renderer.mode = targetMode;
    audio.playBgm(renderer.mode === 'town' ? 'bgm_town' : 'bgm_field');
    audio.playSfx('ui_tab');
    updateHud();
  }

  function toggleSceneMode() {
    if (renderer.mode === 'field' && !engine.isFeatureUnlocked('town')) {
      engine.toast(engine.getFeatureLockMsg('town'));
      audio.playSfx('ui_deny');
      return;
    }
    setSceneMode(renderer.mode === 'field' ? 'town' : 'field');
  }

  document.getElementById('btn-goto-town').onclick = () => {
    if (!engine.isFeatureUnlocked('town')) {
      engine.toast(engine.getFeatureLockMsg('town'));
      audio.playSfx('ui_deny');
      return;
    }
    setSceneMode('town');
  };
  document.getElementById('btn-leave-town').onclick = () => setSceneMode('field');
  document.getElementById('btn-open-town-panel').onclick = () => openPanel('town', 0);
  document.getElementById('btn-town-overview').onclick = (e) => {
    const ov = renderer.toggleTownOverview();
    e.currentTarget.textContent = ov ? 'Gần Lại' : 'Toàn Cảnh';
    audio.playSfx('ui_click');
  };

  document.getElementById('btn-open-growth-top').onclick = () => openPanel('growth', 0);
  document.getElementById('btn-open-settings').onclick = () => openPanel('settings', 0);
  document.getElementById('btn-use-salve').onclick = () => engine.useSalve();
  const btnDodgeEl = document.getElementById('btn-dodge-dash');
  if (btnDodgeEl) btnDodgeEl.onclick = () => engine.performDodge();
  const btnDpsEl = document.getElementById('btn-open-dps');
  if (btnDpsEl) btnDpsEl.onclick = () => openPanel('settings', 1);
  const btnMed = document.getElementById('btn-toggle-meditate');
  if (btnMed) btnMed.onclick = () => engine.toggleMeditate();
  const btnFlight = document.getElementById('btn-toggle-flight');
  if (btnFlight) btnFlight.onclick = () => engine.toggleSwordFlight();
  document.getElementById('hud-interrupt-btn').onclick = () => {
    for (let i = 0; i < 4; i++) {
      if (engine.castSkillSlot(i)) break;
    }
  };
  engine.onOpenPanelRequest = (panelName, tabIdx = 0) => openPanel(panelName, tabIdx);
  engine.onGotoTownRequest = () => setSceneMode('town');
  engine.onGotoFieldRequest = () => setSceneMode('field');

  document.getElementById('btn-boss-now').onclick = () => {
    const st = engine.state;
    const nextChapAvailable = Math.floor((st.maxStage - 1) / 10) > Math.floor((st.stage - 1) / 10);
    const bossReady = (st.stage % 10 === 9 && st.maxStage >= st.stage + 1);
    st.huntMode = false;
    if (nextChapAvailable) {
      st.stage = st.maxStage;
      engine.setupCombat('field');
    } else if (bossReady) {
      st.stage = st.stage + 1;
      engine.setupCombat('field', false, { forceBoss: true });
    } else {
      engine.toast('Đã chuyển sang chế độ Tiến Ải!');
    }
    engine.saveState();
    updateHud();
  };
  const btnHuntToggle = document.getElementById('btn-toggle-hunt');
  if (btnHuntToggle) {
    btnHuntToggle.onclick = () => {
      engine.state.huntMode = !engine.state.huntMode;
      engine.toast(engine.state.huntMode ? 'Đã bật Săn Bãi — Đứng farm tại ải này, không tự đổi map!' : 'Đã bật Tiến Ải — Tự tiến ải trong chương hiện tại!');
      audio.playSfx('ui_click');
      engine.saveState();
      updateHud();
    };
  }
  const btnAutoBossToggle = document.getElementById('btn-toggle-autoboss');
  if (btnAutoBossToggle) {
    btnAutoBossToggle.onclick = () => {
      const st = engine.state;
      st.autoBoss = !st.autoBoss;
      audio.playSfx('ui_click');
      if (st.autoBoss) {
        st.huntMode = false;
        const bossReady = (st.stage % 10 === 9 && st.maxStage >= st.stage + 1);
        if (bossReady && engine.combat && engine.combat.mode === 'field' && !engine.combat.isBossGate) {
          st.stage = st.stage + 1;
          engine.setupCombat('field', false, { forceBoss: true });
          engine.toast('👹 Đã bật Auto Boss — Tự tiến vào khiêu chiến Thủ Lĩnh ngay!');
        } else {
          engine.toast('👹 Đã bật Auto Boss — Qua Ải 9 tự đánh Boss Ải 10 & tự tiến Chương tiếp!');
        }
      } else {
        engine.toast('Đã tắt Auto Boss (dừng Săn Bãi tại Ải 9 chờ khiêu chiến Thủ Lĩnh).');
      }
      engine.saveState();
      updateHud();
    };
  }
  document.getElementById('btn-exit-mode').onclick = () => {
    engine.setupCombat('field');
    updateHud();
  };

  document.getElementById('btn-toggle-auto').onclick = (e) => {
    engine.state.autoSkill = !engine.state.autoSkill;
    e.currentTarget.classList.toggle('active', engine.state.autoSkill);
    e.currentTarget.textContent = engine.state.autoSkill ? 'Tự Động' : 'Thủ Công';
    audio.playSfx('ui_click');
  };

  document.getElementById('btn-toggle-speed').onclick = (e) => {
    const labels = ['1.0x', '1.5x', '2.0x', '3.0x'];
    engine.state.speedIdx = ((engine.state.speedIdx || 0) + 1) % labels.length;
    e.currentTarget.textContent = labels[engine.state.speedIdx];
    e.currentTarget.classList.toggle('active', engine.state.speedIdx > 0);
    audio.playSfx('ui_click');
  };

  document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.onclick = () => {
      const p = btn.getAttribute('data-panel');
      if (activePanel === p) closePanel();
      else openPanel(p, 0);
    };
  });

  document.querySelectorAll('[data-open-panel]').forEach(btn => {
    btn.onclick = () => {
      const p = btn.getAttribute('data-open-panel');
      const t = parseInt(btn.getAttribute('data-open-tab') || '0', 10);
      openPanel(p, t);
    };
  });

  // Click on 3D Arena ground to move Master manually (clamped to walkable ground, never into water/walls)!
  fxCanvas.addEventListener('pointerdown', (e) => {
    if (renderer.mode !== 'field' || activePanel || storyOpen || !gameEntered) return;
    const wp = renderer.screenToGround(e.clientX, e.clientY);
    if (wp && engine.combat) {
      if (engine.state && engine.state.meditating) engine.state.meditating = false;
      const safe = engine.resolveZoneCollision(engine.combat, wp.x, wp.z, 0.45);
      engine.combat.moveTarget = { x: safe.x, z: safe.z };
    }
  });

  // Click anywhere on story dialog card to advance to next line smoothly
  document.getElementById('story-overlay').addEventListener('click', (e) => {
    if (!storyOpen || !storyAdvanceFn) return;
    if (e.target.closest('button')) return;
    storyAdvanceFn();
  });

  // Keyboard hotkeys (Story advance on Space/Enter when reading; Combat hotkeys when playing)
  window.addEventListener('keydown', (e) => {
    if (storyOpen) {
      if ((e.code === 'Space' || e.code === 'Enter') && storyAdvanceFn) {
        e.preventDefault();
        storyAdvanceFn();
      }
      return;
    }
    if (!gameEntered) return;
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    if (e.key >= '1' && e.key <= '4') engine.castSkillSlot(parseInt(e.key, 10) - 1);
    else if (e.code === 'Space' && activePanel === 'alchemy' && activeTab === 0) { e.preventDefault(); triggerAlchemyStrike(); }
    else if (e.code === 'Space' && !activePanel) { e.preventDefault(); engine.performDodge(); }
    else if ((e.key === 'r' || e.key === 'R') && !activePanel) engine.castUltimate();
    else if (e.key === 'q' || e.key === 'Q' || e.key === 'h' || e.key === 'H') engine.useSalve();
    else if ((e.key === 'm' || e.key === 'M' || e.key === 't' || e.key === 'T') && !activePanel) engine.toggleMeditate();
    else if ((e.key === 'f' || e.key === 'F') && !activePanel) engine.toggleSwordFlight();
    else if (e.key === 'Tab' && gameEntered && !activePanel) { e.preventDefault(); toggleSceneMode(); }
    else if (e.key === 'Escape' && activePanel) closePanel();
  });

  function startPrologueOpening() {
    const ch0 = engine.data.story && engine.data.story.chapters && engine.data.story.chapters[0];
    if (!ch0) return;
    if (!engine.state.seenScenes) engine.state.seenScenes = {};
    engine.state.seenScenes.__prologue_open = true;
    engine.saveState();
    playStorySequence({
      title: ch0.title,
      lines: ch0.open,
      voPrefix: 'pro_open',
      doneLabel: 'Rút Kiếm Nghênh Chiến!',
      onDone: () => {
        if (engine.combat && engine.combat.mode === 'prologue') {
          engine.spawnPrologueFoes();
        }
        engine.toast(ch0.fightHint || 'Đánh đuổi đám tay chân đòi nợ!');
        updateHud();
      }
    });
  }

  // Start Game (FrontDoor)
  function enterGameFromFrontDoor() {
    if (gameEntered) return;
    gameEntered = true;
    audio.unlocked = true;
    audio.playSfx('clear');
    document.getElementById('front-door').classList.add('hidden');
    audio.playBgm('bgm_field');

    if (!engine.state.prologueDone || !engine.state.seenScenes || !engine.state.seenScenes.__prologue_open) {
      if (!engine.state.prologueDone && (!engine.combat || engine.combat.mode !== 'prologue')) {
        engine.setupCombat('prologue');
      }
      startPrologueOpening();
    } else {
      engine.checkAutoStoryTriggers();
      // Bế Quan Ngoại Tuyến (Offline Cultivation Harvest if away >= 3 mins!)
      const offRw = engine.computeOfflineReward();
      if (offRw) {
        const hrs = Math.floor(offRw.sec / 3600);
        const mins = Math.floor((offRw.sec % 3600) / 60);
        const timeStr = hrs > 0 ? `${hrs} giờ ${mins} phút` : `${mins} phút`;
        playStorySequence({
          title: `🧘 Bế Quan Ngoại Tuyến · Thu Hoạch (${timeStr})`,
          lines: [{
            who: 'Thanh Linh Nhi · Chấp Sự Tiên Môn',
            fig: 'npc_thanhlinh',
            text: `Mừng Tông Chủ xuất quan! Trong ${timeStr} bế quan vừa qua, đệ tử sơn môn đã tụ linh & thu hoạch được:\n• +${fmt(offRw.coin)} Linh Thạch · +${fmt(offRw.xp)} Tu Vi\n• +${offRw.herb} Linh Thảo · +${offRw.core} Yêu Đan`
          }],
          choices: [
            { label: '✨ Bế Quan Viên Mãn (Nhận ×2)', onPick: () => engine.claimOfflineReward(true) },
            { label: 'Thu Hoạch Bình Thường', onPick: () => engine.claimOfflineReward(false) }
          ]
        });
      }
    }
    updateHud();
  }
  document.getElementById('btn-enter-game').onclick = (e) => { e.stopPropagation(); enterGameFromFrontDoor(); };
  const btnNewGameFd = document.getElementById('btn-new-game-fd');
  if (btnNewGameFd) {
    btnNewGameFd.onclick = (e) => {
      e.stopPropagation();
      engine.resetSave();
      enterGameFromFrontDoor();
    };
  }
  document.getElementById('front-door').onclick = enterGameFromFrontDoor;

  // Boot Everything!
  (async function boot() {
    await Promise.all([renderer.loadAssets(), engine.init()]);
    if (engine.state && engine.state.prologueDone) {
      document.getElementById('btn-enter-game').textContent = 'TIẾP TỤC HÀNH TẨU';
      if (btnNewGameFd) btnNewGameFd.classList.remove('hidden');
    }
    updateHud();

    let lastTime = performance.now();
    let hudAcc = 0;
    function frame(now) {
      const dt = Math.min(0.1, (now - lastTime) * 0.001);
      lastTime = now;
      // Pause combat & world progression while on Title Screen or reading Story Cutscenes
      if (gameEntered && !storyOpen) {
        engine.tick(dt);
      }
      // Animate live Hỏa Hầu Heat Gauge smoothly when Alchemy Cauldron modal is open (freezes on hit mark!)
      if (activePanel === 'alchemy' && activeTab === 0) {
        if (alchemyFreezeT > 0) {
          alchemyFreezeT -= dt;
          if (alchemyFreezeT <= 0) {
            alchemyFreezeT = 0;
            const body = document.getElementById('modal-body');
            if (body) renderAlchemyPanel(body);
          }
        } else {
          alchemyHeatPos += alchemyHeatDir * dt * 1.05;
          if (alchemyHeatPos >= 0.96) { alchemyHeatPos = 0.96; alchemyHeatDir = -1; }
          else if (alchemyHeatPos <= 0.04) { alchemyHeatPos = 0.04; alchemyHeatDir = 1; }
          const cur = document.getElementById('alchemy-heat-cursor');
          if (cur) cur.style.left = `${(alchemyHeatPos * 100).toFixed(1)}%`;
        }
      }
      renderer.render(engine, dt);
      hudAcc += dt;
      if (hudAcc >= 0.15) {
        hudAcc = 0;
        updateHud();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();
})();
