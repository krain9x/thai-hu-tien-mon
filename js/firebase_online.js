// ==================== THÁI HƯ TIÊN MÔN — FIREBASE AUTH + FIRESTORE REALTIME ADAPTER ====================
(() => {
  const REALM_NAMES = [
    'Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh',
    'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Phi Thăng'
  ];

  const TOPUP_PACKS = [
    { id: 'jade_20k',       cat: 'jade',   name: 'Túi Tiên Ngọc Nhỏ',           vnd: 20000,   jade: 300,   firstX2: true,  vipExp: 200,   icon: 'ut_shop_jade_s',      desc: 'Nạp 20.000₫ nhận 300 Tiên Ngọc (Lần đầu ×2 thành 600 Ngọc!)' },
    { id: 'jade_50k',       cat: 'jade',   name: 'Hộp Tiên Ngọc',               vnd: 50000,   jade: 800,   firstX2: true,  vipExp: 500,   icon: 'ut_shop_jade_s',      desc: 'Nạp 50.000₫ nhận 800 Tiên Ngọc (Lần đầu ×2 thành 1.600 Ngọc!)' },
    { id: 'jade_100k',      cat: 'jade',   name: 'Rương Tiên Ngọc',             vnd: 100000,  jade: 1700,  firstX2: true,  vipExp: 1000,  icon: 'ut_shop_jade_m',      desc: 'Nạp 100.000₫ nhận 1.700 Tiên Ngọc (Lần đầu ×2 thành 3.400 Ngọc!)' },
    { id: 'jade_200k',      cat: 'jade',   name: 'Bảo Hạp Tiên Ngọc',           vnd: 200000,  jade: 3600,  firstX2: true,  vipExp: 2000,  icon: 'ut_shop_jade_l',      desc: 'Nạp 200.000₫ nhận 3.600 Tiên Ngọc (Lần đầu ×2 thành 7.200 Ngọc!)' },
    { id: 'jade_500k',      cat: 'jade',   name: 'Thái Hư Kim Khố',             vnd: 500000,  jade: 9500,  firstX2: true,  vipExp: 5000,  icon: 'ut_shop_jade_xl',     desc: 'Nạp 500.000₫ nhận 9.500 Tiên Ngọc (Lần đầu ×2 thành 19.000 Ngọc!)' },
    { id: 'jade_1000k',     cat: 'jade',   name: 'Chí Tôn Tiên Khố',            vnd: 1000000, jade: 20000, firstX2: true,  vipExp: 10000, icon: 'ut_shop_jade_xl',     desc: 'Nạp 1.000.000₫ nhận 20.000 Tiên Ngọc (Lần đầu ×2 thành 40.000 Ngọc!)' },
    { id: 'starter_pack',   cat: 'bundle', name: 'Gói Khai Tông Siêu Hời',      vnd: 49000,   jade: 1200,  coin: 30000, pill: 10, scroll: 15, once: true, vipExp: 500,  icon: 'cont_shop', desc: 'Giới hạn 1 lần: +1.200 Ngọc, +3 Vạn Linh Thạch, +10 Đan Đột Phá, +15 Ngọc Giản!' },
    { id: 'monthly_card',   cat: 'bundle', name: 'Thẻ Tháng Chí Tôn (30 Ngày)', vnd: 99000,   jade: 1000,  passDays: 30, dailyJade: 150, vipExp: 1000, icon: 'ut_shop_jade_pass30', desc: 'Nhận ngay +1.000 Ngọc · Mỗi ngày đăng nhập nhận +150 Ngọc trong 30 ngày!' },
    { id: 'season_pass',    cat: 'bundle', name: 'Tiên Lệnh Tu Luyện Lục',       vnd: 129000,  jade: 500,   seasonPass: true, once: true, vipExp: 1300, icon: 'nav_season', desc: 'Mở khóa trọn bộ 30 bậc thưởng Cao Cấp Tiết Khí + nhận ngay 500 Tiên Ngọc!' },
    { id: 'privilege_card', cat: 'bundle', name: 'Lệnh Bài Đặc Quyền Vĩnh Viễn',vnd: 199000,  jade: 1500,  noAds: true, once: true, vipExp: 2000, icon: 'menu_sect', desc: 'Vĩnh viễn +20% sản lượng Điện Các & Cứ Điểm + nhận ngay 1.500 Ngọc!' }
  ];

  const VIP_TIERS = [
    { lv: 1,  exp: 200,   title: 'VIP 1 · Linh Giả',          atkPct: 3,  coinPct: 5,   hallPct: 4,  chest: { jade: 200,   herb: 25,  core: 15 } },
    { lv: 2,  exp: 600,   title: 'VIP 2 · Chân Nhân',         atkPct: 6,  coinPct: 10,  hallPct: 8,  chest: { jade: 350,   pill: 5,   scroll: 8 } },
    { lv: 3,  exp: 1500,  title: 'VIP 3 · Kim Tiên',          atkPct: 10, coinPct: 15,  hallPct: 12, chest: { jade: 600,   pill: 8,   core: 35 } },
    { lv: 4,  exp: 3000,  title: 'VIP 4 · Thái Ất',           atkPct: 14, coinPct: 22,  hallPct: 16, chest: { jade: 900,   scroll: 15,herb: 60 } },
    { lv: 5,  exp: 6000,  title: 'VIP 5 · Đại La',            atkPct: 18, coinPct: 30,  hallPct: 22, chest: { jade: 1400,  pill: 15,  core: 60 } },
    { lv: 6,  exp: 10000, title: 'VIP 6 · Tiên Vương',        atkPct: 24, coinPct: 40,  hallPct: 28, chest: { jade: 2000,  scroll: 25,pill: 20 } },
    { lv: 7,  exp: 18000, title: 'VIP 7 · Tiên Đế',           atkPct: 30, coinPct: 50,  hallPct: 35, chest: { jade: 3000,  core: 100, herb: 120 } },
    { lv: 8,  exp: 30000, title: 'VIP 8 · Thánh Tôn',         atkPct: 38, coinPct: 65,  hallPct: 44, chest: { jade: 4500,  pill: 35,  scroll: 40 } },
    { lv: 9,  exp: 50000, title: 'VIP 9 · Đạo Tổ',            atkPct: 48, coinPct: 80,  hallPct: 55, chest: { jade: 6500,  core: 180, pill: 50 } },
    { lv: 10, exp: 80000, title: 'VIP 10 · Thái Hư Chí Tôn',  atkPct: 60, coinPct: 100, hallPct: 70, chest: { jade: 10000, scroll: 80,  pill: 80 } }
  ];

  const FIRST_TOPUP_REWARD = { weapon: 'wp_frost_jian', disciple: 'unhak', jade: 500, pill: 10, coin: 20000 };

  const GIFTCODES = {
    THAIHU2026: { title: 'Quà Khai Mở Máy Chủ Thái Hư 2026', rewards: { jade: 500, herb: 30, core: 20 } },
    TANTHU:     { title: 'Quà Tân Thủ Khai Tông Lập Phái',   rewards: { jade: 300, coin: 10000, pill: 5 } },
    TIENMONVIP: { title: 'Quà Tri Ân Tông Chủ Tiên Môn',     rewards: { jade: 800, scroll: 10, core: 15 } }
  };

  const COOP_TIERS = {
    1: { name: 'U Lam Yêu Vương (Sơ Cấp · 2–4 Người)',    bossName: 'U Lam Ma Giao Vương',  lv: 45,  hp: 260000,  atk: 95,  jade: 90,  essence: 16, gemLv: 2, gemQty: 2 },
    2: { name: 'Viêm Ma Đế Tôn (Trung Cấp · 2–4 Người)',  bossName: 'Phần Thiên Viêm Đế',   lv: 75,  hp: 780000,  atk: 240, jade: 160, essence: 30, gemLv: 2, gemQty: 3 },
    3: { name: 'Thái Cổ Hỗn Độn (Đỉnh Phong · 2–4 Người)',bossName: 'Thái Cổ Hỗn Độn Thú',  lv: 110, hp: 2200000, atk: 520, jade: 280, essence: 55, gemLv: 3, gemQty: 2 }
  };

  const WING_LABELS = {
    wing_thanhlam: 'Thanh Lam Dực',
    wing_xichviem: 'Xích Viêm Dực',
    wing_cuutieu:  'Cửu Tiêu Dực',
    wing_hongmong: 'Hồng Mông Dực'
  };

  function calcVipLv(exp) {
    let lv = 0;
    for (const t of VIP_TIERS) if (exp >= t.exp) lv = t.lv;
    return lv;
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  class FirebaseOnlineAdapter {
    constructor(client) {
      this.client = client;
      this.app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.TIENMON_FIREBASE_CONFIG);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.unsubs = [];
      this.lastStateSend = 0;
      this.lastPlazaSend = 0;
      this.startedCoopId = null;
      this.startedPkId = null;
      this.seededDone = false;
    }

    uid() {
      return (this.auth.currentUser && this.auth.currentUser.uid) || (this.client.user && this.client.user.id) || null;
    }

    async ensureSeeded() {
      if (this.seededDone) return;
      this.seededDone = true;
      try {
        const wbSnap = await this.db.collection('tm_meta').doc('world_boss').get();
        if (wbSnap.exists) return;
        const now = Date.now() / 1000;
        const batch = this.db.batch();
        batch.set(this.db.collection('tm_meta').doc('world_boss'), {
          name: 'Thái Cổ Huyết Lôi Ma Đế', lv: 1, hp: 2500000, maxHp: 2500000, respawn_at: 0, dmg_board: {}
        });
        const bots = [
          ['bot_1', 'lybachhac',  'Thanh Vân Kiếm Tông',   'Kiếm Tôn Thanh Vân', 48200, 6, 48, 17, 1540, 1950, 'wp_immortal_jian', 'wing_hongmong'],
          ['bot_2', 'diepvongan', 'U Minh Kiếm Các',       'Ảnh Kiếm Chí Tôn',   36500, 5, 42, 15, 1460, 1420, 'wp_thunder_spear', 'wing_cuutieu'],
          ['bot_3', 'trieucuong', 'Kim Cang Cổ Tự',        'Bất Động Kim Cang',  27400, 4, 35, 13, 1320, 1080, 'wp_jade_staff',    'wing_xichviem'],
          ['bot_4', 'hoaviemton', 'Xích Viêm Thần Cốc',    'Phần Thiên Hỏa Quân',19800, 4, 31, 11, 1245, 760,  'wp_flame_dao',     'wing_xichviem'],
          ['bot_5', 'hanbangnhi', 'Huyền Băng Tuyết Cung', 'Băng Tâm Tiên Tử',   14200, 3, 25, 9,  1180, 540,  'wp_frost_jian',    'wing_thanhlam']
        ];
        bots.forEach(([bid, uname, sect, title, pwr, ridx, stg, tw, arena, fame, wp, wing], i) => {
          const gid = `guild_${(i % 3) + 1}`;
          const tags = { guild_1: ['TĐLM', 'Thiên Đạo Liên Minh'], guild_2: ['CCTM', 'Cửu Châu Tiên Minh'], guild_3: ['UMHT', 'U Minh Huyết Tông'] }[gid];
          batch.set(this.db.collection('tm_users').doc(bid), {
            id: bid, username: uname, sect_name: sect, title, is_bot: true,
            power: pwr, realm_idx: ridx, max_stage: stg, tower_floor: tw, arena_score: arena, fame, lap: 1,
            vip_lv: i < 2 ? 4 : 2, guild_id: gid, guild_tag: tags[0], guild_name: tags[1],
            last_seen: now - 60,
            snapshot: {
              atk: Math.round(pwr * 0.14), maxHp: Math.round(pwr * 1.45), def: Math.round(pwr * 0.045),
              crit: 0.28, weapon: wp, cosmetics: { wing, aura: i < 2 ? 'aura_gold' : 'aura_jade' },
              deployed: ['unhak', 'yeonhwa', 'cheolsan']
            }
          });
        });
        [
          ['guild_1', 'Thiên Đạo Liên Minh', 'TĐLM', 'bot_1', 'lybachhac',  1450, 14800, 3, 240000, 320000, { hall: 3, yard: 2, store: 2 }],
          ['guild_2', 'Cửu Châu Tiên Minh',  'CCTM', 'bot_3', 'trieucuong', 920,  8400,  2, 195000, 240000, { hall: 2, yard: 2, store: 1 }],
          ['guild_3', 'U Minh Huyết Tông',   'UMHT', 'bot_2', 'diepvongan', 1180, 11200, 2, 160000, 240000, { hall: 2, yard: 1, store: 2 }]
        ].forEach(([gid, nm, tag, lid, lname, exp, wsc, blv, bhp, bmhp, bld]) => {
          batch.set(this.db.collection('tm_guilds').doc(gid), {
            id: gid, name: nm, tag, leader_id: lid, leader_name: lname,
            notice: 'Cùng nhau tu tiên, tranh đoạt Linh Mạch!', exp, week_score: wsc,
            boss_lv: blv, boss_hp: bhp, boss_max_hp: bmhp, bld, member_count: gid === 'guild_1' ? 2 : 1, created_at: now - 3600
          });
        });
        [
          ['vein_1', 'Thanh Lam Linh Mạch',    1, 45,  6,  180000,  'guild_1', 'Thiên Đạo Liên Minh', 'TĐLM'],
          ['vein_2', 'Xích Viêm Hỏa Mạch',     2, 70,  12, 320000,  'guild_2', 'Cửu Châu Tiên Minh',  'CCTM'],
          ['vein_3', 'Cửu Tiêu Lôi Mạch',      3, 100, 18, 520000,  'guild_3', 'U Minh Huyết Tông',   'UMHT'],
          ['vein_4', 'Thái Hư Tinh Mạch',      4, 140, 28, 850000,  null, null, null],
          ['vein_5', 'Hồng Mông Hỗn Độn Mạch', 5, 200, 45, 1400000, null, null, null]
        ].forEach(([vid, vnm, tier, rj, re_, hp, gid, gnm, gtag]) => {
          batch.set(this.db.collection('tm_veins').doc(vid), {
            id: vid, name: vnm, tier, reward_jade: rj, reward_essence: re_,
            hp, max_hp: hp, guild_id: gid, guild_name: gnm, guild_tag: gtag, captured_at: now - 1200
          });
        });
        [
          ['mkt_1', 'bot_1', 'lybachhac',  'herb', 30, 45],
          ['mkt_2', 'bot_3', 'trieucuong', 'core', 25, 60],
          ['mkt_3', 'bot_2', 'diepvongan', 'pill', 5,  80],
          ['mkt_4', 'bot_4', 'hoaviemton', 'gem_hoa', 2, 95]
        ].forEach(([mid, sid, snm, itype, qty, pr]) => {
          batch.set(this.db.collection('tm_market').doc(mid), {
            id: mid, seller_id: sid, seller_name: snm, item_type: itype, qty, price_jade: pr, status: 'open', created_at: now - 600
          });
        });
        batch.set(this.db.collection('tm_chat').doc('welcome_msg'), {
          channel: 'world', user_id: null, sender_name: 'Thiên Đạo Thông Báo', sect_name: 'Tiên Giới',
          realm_name: 'Hệ Thống', text: '🌟 Cụm Tiên Giới Firebase Cloud đã khai mở! Chư vị đạo hữu có thể lưu tiến độ vĩnh viễn và lập tổ đội ngay!', created_at: now - 30
        });
        await batch.commit();
      } catch (_) {}
    }

    stopListeners() {
      while (this.unsubs.length) {
        try { this.unsubs.pop()(); } catch (_) {}
      }
    }

    startListeners(myUid) {
      this.stopListeners();
      this.client.connected = true;

      // 1. Live Chat (World + Guild)
      this.unsubs.push(
        this.db.collection('tm_chat').orderBy('created_at', 'desc').limit(50).onSnapshot(snap => {
          const all = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
          const myGid = this.client.myGuild && this.client.myGuild.id;
          this.client.chatHistory.world = all.filter(m => m.channel === 'world');
          this.client.chatHistory.guild = myGid ? all.filter(m => m.channel === `guild:${myGid}`) : [];
          if (this.client.onChatMessage && all.length) this.client.onChatMessage(all[all.length - 1]);
        }, () => {})
      );

      // 2. Shared World Boss
      this.unsubs.push(
        this.db.collection('tm_meta').doc('world_boss').onSnapshot(doc => {
          if (!doc.exists) return;
          const b = doc.data();
          const ranked = Object.values(b.dmg_board || {}).sort((x, y) => y.dmg - x.dmg).slice(0, 15);
          const wb = { name: b.name, lv: b.lv, hp: b.hp, maxHp: b.maxHp, respawnIn: 0, topDamage: ranked };
          this.client.worldBoss = wb;
          if (this.client.onWorldBossUpdate) this.client.onWorldBossUpdate(wb);
        }, () => {})
      );

      // 3. Shared Town Plaza & Presence
      this.unsubs.push(
        this.db.collection('tm_plaza').limit(20).onSnapshot(async snap => {
          const now = Date.now() / 1000;
          const live = [];
          snap.docs.forEach(d => {
            const p = d.data();
            if (now - (p.updated || 0) < 90) live.push(p);
          });
          this.client.onlineCount = Math.max(1, live.length);
          this.client.onlineUsers = live;
          await this.refreshPlazaFromLive(live);
        }, () => {})
      );

      // 4. Co-op Rooms Real-Time Sync
      this.unsubs.push(
        this.db.collection('tm_coop_rooms').limit(20).onSnapshot(snap => {
          const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => !r.ended);
          this.client.coopRooms = rooms;
          const myRm = rooms.find(r => (r.members || []).some(m => m.id === myUid)) || null;
          this.client.currentCoopRoom = myRm;
          if (this.client.onCoopRooms) this.client.onCoopRooms(rooms);
          if (this.client.onCoopRoomUpdate) this.client.onCoopRoomUpdate(myRm);

          if (myRm && myRm.status === 'fighting' && this.startedCoopId !== myRm.id) {
            this.startedCoopId = myRm.id;
            if (this.client.onCoopStart) this.client.onCoopStart({ room: myRm, boss: myRm.boss, peers: myRm.members || [] });
          }
          if (myRm && myRm.status === 'fighting') {
            if (this.client.onCoopBossHp) this.client.onCoopBossHp({ roomId: myRm.id, hp: myRm.boss.hp, maxHp: myRm.boss.maxHp });
            const ps = myRm.peerStates || {};
            for (const [uidKey, pst] of Object.entries(ps)) {
              if (uidKey !== myUid && this.client.onCoopPeerState) {
                this.client.onCoopPeerState({ roomId: myRm.id, userId: uidKey, ...pst });
              }
            }
          }
          if (this.startedCoopId) {
            const endedDoc = snap.docs.find(d => d.id === this.startedCoopId);
            if (endedDoc && endedDoc.data().ended) {
              const ed = endedDoc.data();
              this.startedCoopId = null;
              const gems = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
              const gemId = gems[Math.floor(Math.random() * gems.length)];
              if (this.client.onCoopEnd) {
                this.client.onCoopEnd({
                  roomId: endedDoc.id, win: true, bossName: ed.boss.name, tier: ed.tier,
                  rewards: { jade: ed.reward.jade, essence: ed.reward.essence, gemId, gemLv: ed.reward.gemLv, gemQty: ed.reward.gemQty }
                });
              }
            }
          }
        }, () => {})
      );

      // 5. Real-time PK Invites & Active PK Rooms
      this.unsubs.push(
        this.db.collection('tm_pk_invites').where('to_id', '==', myUid).onSnapshot(snap => {
          snap.docChanges().forEach(ch => {
            if (ch.type === 'added') {
              const inv = ch.doc.data();
              if (inv.status === 'pending' && this.client.onPkInvite) {
                this.client.onPkInvite({ inviteId: ch.doc.id, from: inv.from });
              }
            }
          });
        }, () => {})
      );
      this.unsubs.push(
        this.db.collection('tm_pk_rooms').limit(20).onSnapshot(snap => {
          for (const d of snap.docs) {
            const rm = d.data();
            if (rm.p1 !== myUid && rm.p2 !== myUid) continue;
            const oppId = rm.p1 === myUid ? rm.p2 : rm.p1;
            if (!rm.ended && this.startedPkId !== d.id) {
              this.startedPkId = d.id;
              if (this.client.onPkStart) {
                this.client.onPkStart({
                  roomId: d.id, side: rm.p1 === myUid ? 0 : 1,
                  me: rm.info[myUid], opp: rm.info[oppId]
                });
              }
            }
            if (!rm.ended && rm.states && rm.states[oppId] && this.client.onPkOppState) {
              this.client.onPkOppState({ roomId: d.id, ...rm.states[oppId] });
            }
            if (!rm.ended && rm.hp && this.client.onPkHit) {
              this.client.onPkHit({ roomId: d.id, hpMap: rm.hp, dmg: 0, targetId: myUid });
            }
            if (rm.ended && this.startedPkId === d.id) {
              this.startedPkId = null;
              const win = rm.winner_id === myUid;
              if (this.client.onPkEnd) {
                this.client.onPkEnd({ roomId: d.id, win, scoreDelta: win ? 35 : -18, honor: win ? 35 : 10, newScore: (this.client.user.arena_score || 1000) + (win ? 35 : -18) });
              }
            }
          }
        }, () => {})
      );
    }

    async refreshPlazaFromLive(liveList) {
      const seen = new Set();
      const out = [];
      const offsets = [[-3.6, 2.2], [3.8, 2.4], [-5.2, 5.2], [5.0, 5.4], [-2.2, 6.8], [2.4, 7.0], [-6.4, 3.0], [6.5, 3.2]];
      let i = 0;
      for (const p of liveList) {
        seen.add(p.id);
        const [dx, dz] = offsets[i % offsets.length];
        out.push({ ...p, online: true, x: p.x ?? dx, z: p.z ?? dz });
        i++;
      }
      if (out.length < 8) {
        const uSnap = await this.db.collection('tm_users').orderBy('power', 'desc').limit(10).get();
        uSnap.docs.forEach(d => {
          const u = d.data();
          if (seen.has(d.id) || out.length >= 8) return;
          const [dx, dz] = offsets[i % offsets.length];
          i++;
          out.push({
            id: d.id, username: u.username, sectName: u.sect_name, power: u.power || 100,
            realmIdx: u.realm_idx || 0, weapon: (u.snapshot && u.snapshot.weapon) || 'wp_iron_jian',
            cosmetics: (u.snapshot && u.snapshot.cosmetics) || { wing: 'wing_none', aura: 'aura_none' },
            vipLv: u.vip_lv || 0, online: false, x: dx, z: dz, facing: (i % 2 ? 0.3 : -0.3)
          });
        });
      }
      this.client.plazaPlayers = out;
      if (this.client.onPlazaSync) this.client.onPlazaSync(out);
    }

    async tryAutoLogin() {
      await this.ensureSeeded();
      return new Promise(resolve => {
        const unsub = this.auth.onAuthStateChanged(async fbUser => {
          unsub();
          if (!fbUser) { resolve(null); return; }
          const res = await this.loadMe(fbUser.uid);
          resolve(res);
        });
      });
    }

    async loadMe(uid) {
      const uDoc = await this.db.collection('tm_users').doc(uid).get();
      if (!uDoc.exists) return null;
      const u = uDoc.data();
      const sDoc = await this.db.collection('tm_saves').doc(uid).get();
      const st = sDoc.exists ? (sDoc.data().state || null) : null;
      const gDoc = u.guild_id ? await this.db.collection('tm_guilds').doc(u.guild_id).get() : null;
      const mSnap = await this.db.collection('tm_mails').where('to_user_id', '==', uid).get();
      const unread = mSnap.docs.filter(d => !d.data().claimed).length;

      this.client.token = uid;
      this.client.user = u;
      this.client.myGuild = gDoc && gDoc.exists ? gDoc.data() : null;
      this.client.unreadMails = unread;
      await this.touchPlaza(u);
      this.startListeners(uid);
      if (this.client.onAuthChange) this.client.onAuthChange(u);
      return { ok: true, user: u, state: st, unreadMails: unread, guild: this.client.myGuild, onlineCount: this.client.onlineCount };
    }

    async touchPlaza(u, x = null, z = null, facing = 0) {
      if (!u || !u.id) return;
      const snap = u.snapshot || {};
      await this.db.collection('tm_plaza').doc(u.id).set({
        id: u.id, username: u.username, sectName: u.sect_name, power: u.power || 100,
        realmIdx: u.realm_idx || 0, weapon: snap.weapon || 'wp_iron_jian',
        cosmetics: snap.cosmetics || { wing: 'wing_none', aura: 'aura_none' },
        vipLv: u.vip_lv || 0,
        x: x ?? (Math.random() * 6 - 3), z: z ?? (2 + Math.random() * 4), facing,
        updated: Date.now() / 1000
      }, { merge: true }).catch(() => {});
    }

    async register(username, password, sectName, initialState = null) {
      await this.ensureSeeded();
      const uname = String(username || '').trim().toLowerCase();
      if (!uname || uname.length < 3 || uname.length > 20 || !/^[a-z0-9_]+$/.test(uname)) {
        return { ok: false, error: 'Tên đạo hiệu dài 3–20 ký tự, chỉ gồm chữ không dấu / số / _!' };
      }
      if (!password || password.length < 6) {
        return { ok: false, error: 'Mật khẩu tối thiểu 6 ký tự trên hệ thống Cloud!' };
      }
      const existing = await this.db.collection('tm_users').where('username', '==', uname).limit(1).get();
      if (!existing.empty) return { ok: false, error: 'Đạo hiệu này đã tồn tại!' };

      try {
        const cred = await this.auth.createUserWithEmailAndPassword(`${uname}@tienmon.local`, password);
        const uid = cred.user.uid;
        const now = Date.now() / 1000;
        const uObj = {
          id: uid, username: uname, sect_name: (sectName || 'Thái Hư Tiên Môn').slice(0, 28),
          title: 'Tông Chủ Khai Phái', is_bot: false,
          power: (initialState && initialState.power) || 100,
          realm_idx: (initialState && initialState.realmIdx) || 0,
          max_stage: (initialState && initialState.maxStage) || 1,
          tower_floor: (initialState && initialState.towerFloor) || 1,
          arena_score: 1000, fame: 0, lap: 1, vip_lv: 0,
          guild_id: null, guild_tag: '', guild_name: '',
          snapshot: {}, created_at: now, last_seen: now
        };
        const batch = this.db.batch();
        batch.set(this.db.collection('tm_users').doc(uid), uObj);
        batch.set(this.db.collection('tm_saves').doc(uid), { user_id: uid, state: initialState || {}, updated_at: now });
        batch.set(this.db.collection('tm_billing').doc(uid), { user_id: uid, total_vnd: 0, vip_exp: 0, vip_lv: 0, first_topup_claimed: 0, firstPacks: {}, vipClaimed: {}, pass_30_until: 0, pass_30_last_claim: '', no_ads: 0, season_pass: 0 });
        batch.set(this.db.collection('tm_mails').doc(), {
          to_user_id: uid, from_name: 'Thiên Đạo Sứ Giả', title: 'Quà Khai Phái Máy Chủ Online',
          body: 'Chúc mừng Tông Chủ đăng ký thành công! Nhận quà lập tông để xưng bá Tiên Giới:',
          attachments: { jade: 300, herb: 20, core: 12, pill: 3 }, claimed: false, created_at: now
        });
        await batch.commit();
        return await this.loadMe(uid);
      } catch (err) {
        return { ok: false, error: err.message || 'Lỗi đăng ký tài khoản Firebase' };
      }
    }

    async login(username, password) {
      await this.ensureSeeded();
      const uname = String(username || '').trim().toLowerCase();
      try {
        const cred = await this.auth.signInWithEmailAndPassword(`${uname}@tienmon.local`, password);
        return await this.loadMe(cred.user.uid);
      } catch (err) {
        return { ok: false, error: 'Sai tên Đạo Hiệu hoặc mật khẩu!' };
      }
    }

    async logout() {
      this.stopListeners();
      try { await this.auth.signOut(); } catch (_) {}
      this.client.token = '';
      this.client.user = null;
      this.client.connected = false;
      this.client.myGuild = null;
    }

    async wsSend(obj) {
      const uid = this.uid();
      if (!uid || !this.client.user) return false;
      const u = this.client.user;
      const now = Date.now() / 1000;
      const t = obj.type;

      if (t === 'chat_send') {
        const text = String(obj.text || '').trim().slice(0, 220);
        if (!text) return false;
        const ch = (obj.channel === 'guild' && u.guild_id) ? `guild:${u.guild_id}` : 'world';
        const cos = (u.snapshot && u.snapshot.cosmetics) || {};
        await this.db.collection('tm_chat').add({
          channel: ch, user_id: uid, sender_name: u.username, sect_name: u.sect_name,
          realm_name: REALM_NAMES[Math.min(9, Math.max(0, u.realm_idx || 0))],
          vip_lv: u.vip_lv || 0, wing_tag: WING_LABELS[cos.wing] || '', text, created_at: now
        });
        return true;
      }

      if (t === 'plaza_move') {
        if (now - this.lastPlazaSend < 2.0) return true;
        this.lastPlazaSend = now;
        await this.touchPlaza(u, obj.x, obj.z, obj.facing);
        return true;
      }

      if (t === 'coop_create') {
        const tier = Math.max(1, Math.min(3, parseInt(obj.tier || 1, 10)));
        const tdef = COOP_TIERS[tier];
        const snap = u.snapshot || {};
        const doc = await this.db.collection('tm_coop_rooms').add({
          name: String(obj.name || `Tổ Đội của ${u.username}`).slice(0, 30),
          tier, tierName: tdef.name, hostId: uid, status: 'waiting', ended: false,
          boss: { name: tdef.bossName, lv: tdef.lv, hp: tdef.hp, maxHp: tdef.hp, atk: tdef.atk },
          bossName: tdef.bossName, bossHp: tdef.hp, bossMaxHp: tdef.hp,
          reward: { jade: tdef.jade, essence: tdef.essence, gemLv: tdef.gemLv, gemQty: tdef.gemQty },
          members: [{ id: uid, username: u.username, sectName: u.sect_name, power: u.power || 100, atk: snap.atk || 180, maxHp: snap.maxHp || 1800, weapon: snap.weapon || 'wp_iron_jian', cosmetics: snap.cosmetics || {}, vipLv: u.vip_lv || 0 }],
          dmg: { [uid]: 0 }, peerStates: {}, created_at: now
        });
        return !!doc.id;
      }

      if (t === 'coop_join') {
        const ref = this.db.collection('tm_coop_rooms').doc(String(obj.roomId));
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          if (!d.exists) return;
          const rm = d.data();
          if (rm.status !== 'waiting' || rm.members.length >= 4 || rm.members.some(m => m.id === uid)) return;
          const snap = u.snapshot || {};
          rm.members.push({ id: uid, username: u.username, sectName: u.sect_name, power: u.power || 100, atk: snap.atk || 180, maxHp: snap.maxHp || 1800, weapon: snap.weapon || 'wp_iron_jian', cosmetics: snap.cosmetics || {}, vipLv: u.vip_lv || 0 });
          tx.update(ref, { members: rm.members });
        });
        return true;
      }

      if (t === 'coop_leave') {
        const ref = this.db.collection('tm_coop_rooms').doc(String(obj.roomId));
        const d = await ref.get();
        if (d.exists) {
          const mems = (d.data().members || []).filter(m => m.id !== uid);
          if (!mems.length) await ref.delete();
          else await ref.update({ members: mems, hostId: d.data().hostId === uid ? mems[0].id : d.data().hostId });
        }
        return true;
      }

      if (t === 'coop_start') {
        await this.db.collection('tm_coop_rooms').doc(String(obj.roomId)).update({ status: 'fighting', started_at: now });
        return true;
      }

      if (t === 'coop_state') {
        if (now - this.lastStateSend < 0.35) return true;
        this.lastStateSend = now;
        await this.db.collection('tm_coop_rooms').doc(String(obj.roomId)).update({
          [`peerStates.${uid}`]: { x: obj.x || 0, z: obj.z || 0, facing: obj.facing || 0, animClip: obj.animClip || '', moving: !!obj.moving }
        }).catch(() => {});
        return true;
      }

      if (t === 'coop_hit') {
        const ref = this.db.collection('tm_coop_rooms').doc(String(obj.roomId));
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          if (!d.exists || d.data().ended) return;
          const rm = d.data();
          const newHp = Math.max(0, (rm.boss.hp || 0) - Math.round(obj.dmg || 0));
          rm.boss.hp = newHp;
          rm.bossHp = newHp;
          rm.dmg[uid] = (rm.dmg[uid] || 0) + Math.round(obj.dmg || 0);
          tx.update(ref, { boss: rm.boss, bossHp: newHp, dmg: rm.dmg, ended: newHp <= 0, status: newHp <= 0 ? 'ended' : 'fighting' });
        });
        return true;
      }

      if (t === 'pk_invite') {
        const tid = String(obj.targetId);
        await this.db.collection('tm_pk_invites').add({
          from_id: uid, to_id: tid, status: 'pending', created_at: now,
          from: { id: uid, username: u.username, sectName: u.sect_name, power: u.power || 100, arenaScore: u.arena_score || 1000 }
        });
        if (this.client.onToast) this.client.onToast('⚔ Đã gửi Chiến Thư PK 1v1!');
        return true;
      }

      if (t === 'pk_decline') {
        await this.db.collection('tm_pk_invites').doc(String(obj.inviteId)).delete().catch(() => {});
        return true;
      }

      if (t === 'pk_accept') {
        const invRef = this.db.collection('tm_pk_invites').doc(String(obj.inviteId));
        const invDoc = await invRef.get();
        if (!invDoc.exists) return false;
        const inv = invDoc.data();
        await invRef.delete();
        const u1Doc = await this.db.collection('tm_users').doc(inv.from_id).get();
        const u1 = u1Doc.data() || inv.from;
        const s1 = u1.snapshot || {}, s2 = u.snapshot || {};
        const hp1 = Math.max(800, Math.round(s1.maxHp || 1600)), hp2 = Math.max(800, Math.round(s2.maxHp || 1600));
        await this.db.collection('tm_pk_rooms').add({
          p1: inv.from_id, p2: uid, ended: false, winner_id: null, created_at: now,
          hp: { [inv.from_id]: hp1, [uid]: hp2 }, maxHp: { [inv.from_id]: hp1, [uid]: hp2 },
          states: {},
          info: {
            [inv.from_id]: { id: inv.from_id, username: u1.username, sectName: u1.sect_name || u1.sectName, maxHp: hp1, atk: s1.atk || 120, weapon: s1.weapon || 'wp_iron_jian', power: u1.power || 300 },
            [uid]:         { id: uid, username: u.username, sectName: u.sect_name, maxHp: hp2, atk: s2.atk || 120, weapon: s2.weapon || 'wp_iron_jian', power: u.power || 300 }
          }
        });
        return true;
      }

      if (t === 'pk_state') {
        if (now - this.lastStateSend < 0.35) return true;
        this.lastStateSend = now;
        await this.db.collection('tm_pk_rooms').doc(String(obj.roomId)).update({
          [`states.${uid}`]: { x: obj.x || 0, z: obj.z || 0, facing: obj.facing || 0, animClip: obj.animClip || '', moving: !!obj.moving }
        }).catch(() => {});
        return true;
      }

      if (t === 'pk_action') {
        const ref = this.db.collection('tm_pk_rooms').doc(String(obj.roomId));
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          if (!d.exists || d.data().ended) return;
          const rm = d.data();
          const oppId = rm.p1 === uid ? rm.p2 : rm.p1;
          rm.hp[oppId] = Math.max(0, (rm.hp[oppId] || 0) - Math.round(obj.dmg || 0));
          const win = rm.hp[oppId] <= 0;
          tx.update(ref, { hp: rm.hp, ended: win, winner_id: win ? uid : null });
        });
        return true;
      }
      return false;
    }

    async api(path, method = 'GET', body = null) {
      await this.ensureSeeded();
      const uid = this.uid();
      const u = this.client.user;
      const now = Date.now() / 1000;
      const [cleanPath, qs] = path.split('?');
      const params = new URLSearchParams(qs || '');

      // 1. Auth & Save Sync
      if (cleanPath === '/api/auth/me') return uid ? await this.loadMe(uid) : { ok: false, error: 'Unauthorized' };

      if (cleanPath === '/api/save/sync') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const st = body.state || {}, snap = body.snapshot || {};
        const power = Math.round(body.power || snap.power || 100);
        const sect = String(body.sectName || u.sect_name).slice(0, 28);
        const patch = {
          sect_name: sect, power, realm_idx: st.realmIdx || 0, max_stage: st.maxStage || 1,
          tower_floor: st.towerFloor || 1, arena_score: st.arenaScore || 1000,
          fame: st.fame || 0, lap: st.lap || 1, snapshot: snap, last_seen: now
        };
        Object.assign(u, patch);
        await this.db.collection('tm_users').doc(uid).update(patch);
        await this.db.collection('tm_saves').doc(uid).set({ user_id: uid, state: st, updated_at: now });
        await this.touchPlaza(u);
        return { ok: true, syncedAt: now };
      }

      // 2. Leaderboard, Plaza & Inspect
      if (cleanPath === '/api/leaderboard') {
        const sort = params.get('sort') || 'power';
        const field = sort === 'stage' ? 'max_stage' : (sort === 'arena' ? 'arena_score' : (sort === 'tower' ? 'tower_floor' : 'power'));
        const snap = await this.db.collection('tm_users').orderBy(field, 'desc').limit(50).get();
        const onlineIds = new Set((this.client.onlineUsers || []).map(x => x.id));
        const list = snap.docs.map((d, i) => {
          const r = d.data();
          const ridx = r.realm_idx || 0;
          return {
            rank: i + 1, id: d.id, username: r.username, sectName: r.sect_name, title: r.title,
            isBot: !!r.is_bot, online: onlineIds.has(d.id), power: r.power || 100, realmIdx: ridx,
            realmName: REALM_NAMES[Math.min(9, Math.max(0, ridx))], maxStage: r.max_stage || 1,
            towerFloor: r.tower_floor || 1, arenaScore: r.arena_score || 1000,
            guildName: r.guild_name || '', guildTag: r.guild_tag || ''
          };
        });
        return { ok: true, sort, list, onlineCount: this.client.onlineCount };
      }

      if (cleanPath === '/api/plaza') {
        await this.refreshPlazaFromLive(this.client.onlineUsers || []);
        return { ok: true, players: this.client.plazaPlayers || [] };
      }

      const inspMatch = cleanPath.match(/^\/api\/player\/([^/]+)\/inspect$/);
      if (inspMatch) {
        const tid = decodeURIComponent(inspMatch[1]);
        const d = await this.db.collection('tm_users').doc(tid).get();
        if (!d.exists) return { ok: false, error: 'Không tìm thấy Đạo Hữu!' };
        const p = d.data();
        const snap = p.snapshot || {};
        const ridx = p.realm_idx || 0;
        if (!snap.gearDetail) {
          const suf = ridx >= 6 ? 'immortal' : (ridx >= 4 ? 'thunder' : (ridx >= 2 ? 'frost' : 'iron'));
          const blv = Math.max(1, Math.min(20, 2 + ridx * 3));
          snap.gearDetail = {
            weapon: { id: snap.weapon || 'wp_iron_jian', lv: blv, subs: [], sockets: [{ id: 'kim', lv: Math.min(3, 1 + Math.floor(ridx / 2)) }] },
            helm:   { id: `hm_${suf}`, lv: Math.max(1, blv - 1), subs: [], sockets: [] },
            armor:  { id: `ar_${suf}`, lv: blv, subs: [], sockets: [] },
            jade:   { id: `jd_${suf}`, lv: Math.max(1, blv - 1), subs: [], sockets: [] },
            ring:   { id: `rg_${suf}`, lv: Math.max(1, blv - 2), subs: [], sockets: [] },
            boots:  { id: `bt_${suf}`, lv: Math.max(1, blv - 2), subs: [], sockets: [] }
          };
        }
        return {
          ok: true,
          player: {
            id: d.id, username: p.username, sectName: p.sect_name, title: p.title, isBot: !!p.is_bot,
            online: (this.client.onlineUsers || []).some(x => x.id === d.id),
            power: p.power || 100, realmIdx: ridx, realmName: REALM_NAMES[Math.min(9, Math.max(0, ridx))],
            maxStage: p.max_stage || 1, towerFloor: p.tower_floor || 1, arenaScore: p.arena_score || 1000,
            vipLv: p.vip_lv || 0, cosmetics: snap.cosmetics || { wing: 'wing_none', aura: 'aura_none' },
            guild: p.guild_id ? { id: p.guild_id, name: p.guild_name, tag: p.guild_tag } : null,
            snapshot: snap
          }
        };
      }

      // 3. PvP Targets & World Boss
      if (cleanPath === '/api/pvp/targets') {
        const snap = await this.db.collection('tm_users').orderBy('arena_score', 'desc').limit(30).get();
        const onlineIds = new Set((this.client.onlineUsers || []).map(x => x.id));
        const targets = [], onlineList = [];
        snap.docs.forEach(d => {
          if (d.id === uid) return;
          const r = d.data(), ridx = r.realm_idx || 0;
          const it = {
            id: d.id, username: r.username, sectName: r.sect_name, title: r.title, isBot: !!r.is_bot,
            online: onlineIds.has(d.id), power: r.power || 100, realmIdx: ridx,
            realmName: REALM_NAMES[Math.min(9, Math.max(0, ridx))], arenaScore: r.arena_score || 1000, snapshot: r.snapshot || {}
          };
          if (it.online) onlineList.push(it);
          targets.push(it);
        });
        return { ok: true, online: onlineList, targets, logs: [] };
      }

      if (cleanPath === '/api/pvp/async_result') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const win = !!body.win;
        const delta = win ? 25 : -14;
        const newScore = Math.max(0, (u.arena_score || 1000) + delta);
        u.arena_score = newScore;
        await this.db.collection('tm_users').doc(uid).update({ arena_score: newScore });
        return { ok: true, arenaScore: newScore, delta };
      }

      if (cleanPath === '/api/worldboss') {
        const doc = await this.db.collection('tm_meta').doc('world_boss').get();
        const b = doc.data();
        const ranked = Object.values(b.dmg_board || {}).sort((x, y) => y.dmg - x.dmg).slice(0, 15);
        return { ok: true, boss: { name: b.name, lv: b.lv, hp: b.hp, maxHp: b.maxHp, respawnIn: 0, topDamage: ranked } };
      }

      if (cleanPath === '/api/worldboss/hit') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const ref = this.db.collection('tm_meta').doc('world_boss');
        let killed = false;
        let outBoss = null;
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          const b = d.data();
          const dmg = Math.max(0, Math.round(body.dmg || 0));
          b.hp = Math.max(0, (b.hp || 0) - dmg);
          const board = b.dmg_board || {};
          const prev = board[uid] || { username: u.username, sectName: u.sect_name, dmg: 0 };
          prev.dmg += dmg;
          board[uid] = prev;
          if (b.hp <= 0) {
            killed = true;
            const nlv = (b.lv || 1) + 1;
            const nmax = Math.round(2500000 * (1 + (nlv - 1) * 0.45));
            const pool = ['Thái Cổ Huyết Lôi Ma Đế', 'Cửu U Ma Long Vương', 'Huyền Minh Thiên Ma Tôn'];
            tx.update(ref, { name: pool[(nlv - 1) % pool.length], lv: nlv, hp: nmax, maxHp: nmax, dmg_board: {} });
          } else {
            tx.update(ref, { hp: b.hp, dmg_board: board });
          }
          outBoss = { name: b.name, lv: b.lv, hp: b.hp, maxHp: b.maxHp, respawnIn: 0, topDamage: Object.values(board).sort((x, y) => y.dmg - x.dmg).slice(0, 15) };
        });
        return { ok: true, boss: outBoss, killed };
      }

      // 4. Co-op Rooms list
      if (cleanPath === '/api/coop/rooms') {
        return { ok: true, rooms: this.client.coopRooms || [], tiers: COOP_TIERS };
      }

      // 5. Guilds & Guild War Veins
      if (cleanPath === '/api/guilds') {
        const gSnap = await this.db.collection('tm_guilds').get();
        const guilds = gSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.week_score || 0) - (a.week_score || 0));
        let myGuild = null;
        if (u && u.guild_id) {
          const g = guilds.find(x => x.id === u.guild_id);
          if (g) {
            const memSnap = await this.db.collection('tm_users').where('guild_id', '==', g.id).get();
            const onlineIds = new Set((this.client.onlineUsers || []).map(x => x.id));
            const members = memSnap.docs.map(m => {
              const md = m.data();
              return {
                id: m.id, username: md.username, sectName: md.sect_name, power: md.power || 100,
                realmName: REALM_NAMES[Math.min(9, Math.max(0, md.realm_idx || 0))],
                role: md.id === g.leader_id ? 'leader' : 'member',
                online: onlineIds.has(m.id), topDisciple: (md.snapshot && md.snapshot.deployed && md.snapshot.deployed[0]) || 'unhak'
              };
            });
            myGuild = { ...g, members };
          }
        }
        return { ok: true, guilds, myGuild };
      }

      if (cleanPath === '/api/guilds/create') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const nm = String(body.name || '').trim().slice(0, 26);
        const tag = String(body.tag || '').trim().toUpperCase().slice(0, 5);
        if (nm.length < 3 || tag.length < 2) return { ok: false, error: 'Tên Minh ≥ 3 ký tự & Tag ≥ 2 ký tự!' };
        const ref = this.db.collection('tm_guilds').doc();
        const gObj = {
          id: ref.id, name: nm, tag, leader_id: uid, leader_name: u.username,
          notice: String(body.notice || '').slice(0, 100), exp: 100, week_score: 0,
          boss_lv: 1, boss_hp: 160000, boss_max_hp: 160000, bld: { hall: 1, yard: 1, store: 1 }, member_count: 1, created_at: now
        };
        await ref.set(gObj);
        await this.db.collection('tm_users').doc(uid).update({ guild_id: ref.id, guild_name: nm, guild_tag: tag });
        u.guild_id = ref.id; u.guild_name = nm; u.guild_tag = tag;
        this.client.myGuild = gObj;
        return { ok: true, guildId: ref.id };
      }

      if (cleanPath === '/api/guilds/join') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const gid = String(body.guildId);
        const gRef = this.db.collection('tm_guilds').doc(gid);
        const gDoc = await gRef.get();
        if (!gDoc.exists) return { ok: false, error: 'Minh không tồn tại!' };
        const g = gDoc.data();
        await gRef.update({ member_count: (g.member_count || 1) + 1 });
        await this.db.collection('tm_users').doc(uid).update({ guild_id: gid, guild_name: g.name, guild_tag: g.tag });
        u.guild_id = gid; u.guild_name = g.name; u.guild_tag = g.tag;
        this.client.myGuild = g;
        return { ok: true };
      }

      if (cleanPath === '/api/guilds/leave') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        await this.db.collection('tm_users').doc(uid).update({ guild_id: null, guild_name: '', guild_tag: '' });
        u.guild_id = null; u.guild_name = ''; u.guild_tag = '';
        this.client.myGuild = null;
        return { ok: true };
      }

      if (cleanPath === '/api/guilds/action') {
        if (!uid || !u || !u.guild_id) return { ok: false, error: 'Bạn chưa vào Liên Minh!' };
        const ref = this.db.collection('tm_guilds').doc(u.guild_id);
        const doc = await ref.get();
        const g = doc.data();
        if (body.kind === 'donate') {
          await ref.update({ exp: (g.exp || 0) + 50, week_score: (g.week_score || 0) + 60 });
          return { ok: true, merit: 25 };
        }
        if (body.kind === 'upgrade_bld') {
          const bld = g.bld || { hall: 1, yard: 1, store: 1 };
          const bid = body.bldId || 'hall';
          const need = (bld[bid] || 1) * 150;
          if ((g.exp || 0) < need) return { ok: false, error: `Cần ${need} EXP Minh Hội!` };
          bld[bid] = (bld[bid] || 1) + 1;
          await ref.update({ exp: g.exp - need, bld });
          return { ok: true, bld };
        }
        return { ok: true };
      }

      if (cleanPath === '/api/guildwar') {
        const vSnap = await this.db.collection('tm_veins').get();
        const veins = vSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.tier - b.tier);
        const claimedToday = {};
        if (uid) {
          const today = todayStr();
          const cSnap = await this.db.collection('tm_vein_claims').where('user_id', '==', uid).get();
          cSnap.docs.forEach(d => { if (d.data().day_key === today) claimedToday[d.data().vein_id] = true; });
        }
        return { ok: true, veins, myGuildId: (u && u.guild_id) || null, claimedToday };
      }

      if (cleanPath === '/api/guildwar/attack') {
        if (!uid || !u || !u.guild_id) return { ok: false, error: 'Bạn cần gia nhập Liên Minh trước!' };
        const vid = String(body.veinId);
        const ref = this.db.collection('tm_veins').doc(vid);
        let resObj = null;
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          if (!d.exists) { resObj = { ok: false, error: 'Linh Mạch không tồn tại!' }; return; }
          const v = d.data();
          if (v.guild_id === u.guild_id) { resObj = { ok: false, error: 'Liên Minh của bạn đang trấn giữ Linh Mạch này!' }; return; }
          const dmg = Math.max(14000, Math.round((u.power || 500) * 2.4 * (1 + (u.vip_lv || 0) * 0.08)));
          const newHp = Math.max(0, (v.hp || 0) - dmg);
          if (newHp <= 0) {
            tx.update(ref, { guild_id: u.guild_id, guild_name: u.guild_name, guild_tag: u.guild_tag, hp: v.max_hp, captured_at: now });
            resObj = { ok: true, dmg, captured: true, hp: v.max_hp, maxHp: v.max_hp };
          } else {
            tx.update(ref, { hp: newHp });
            resObj = { ok: true, dmg, captured: false, hp: newHp, maxHp: v.max_hp };
          }
        });
        if (resObj && resObj.captured) {
          await this.db.collection('tm_chat').add({
            channel: 'world', user_id: null, sender_name: 'Thiên Đạo Thông Báo', sect_name: 'Tiên Giới', realm_name: 'Hệ Thống',
            text: `⛰ Bang Chiến Linh Mạch: Liên Minh [${u.guild_tag}] ${u.guild_name} do ${u.username} dẫn đầu đã đoạt thành công Linh Mạch!`, created_at: now
          });
        }
        return resObj;
      }

      if (cleanPath === '/api/guildwar/claim') {
        if (!uid || !u || !u.guild_id) return { ok: false, error: 'Bạn chưa gia nhập Liên Minh!' };
        const today = todayStr();
        const vSnap = await this.db.collection('tm_veins').where('guild_id', '==', u.guild_id).get();
        let jade = 0, essence = 0, names = [];
        for (const d of vSnap.docs) {
          const v = d.data();
          const cKey = `${uid}_${d.id}_${today}`;
          const cRef = this.db.collection('tm_vein_claims').doc(cKey);
          if (!(await cRef.get()).exists) {
            await cRef.set({ user_id: uid, vein_id: d.id, day_key: today });
            jade += v.reward_jade || 0;
            essence += v.reward_essence || 0;
            names.push(v.name);
          }
        }
        if (!names.length) return { ok: false, error: 'Hôm nay đã nhận hết bổng lộc Linh Mạch hoặc Minh chưa chiếm mạch nào!' };
        return { ok: true, jade, essence, veinNames: names };
      }

      // 6. Market, Friends & Mail
      if (cleanPath === '/api/market') {
        const mSnap = await this.db.collection('tm_market').where('status', '==', 'open').get();
        const listings = mSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        return { ok: true, listings };
      }
      if (cleanPath === '/api/market/list') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const ref = this.db.collection('tm_market').doc();
        await ref.set({ id: ref.id, seller_id: uid, seller_name: u.username, item_type: body.itemType, qty: Number(body.qty || 1), price_jade: Number(body.priceJade || 20), status: 'open', created_at: now });
        return { ok: true, id: ref.id };
      }
      if (cleanPath === '/api/market/buy') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const ref = this.db.collection('tm_market').doc(String(body.listingId));
        let res = null;
        await this.db.runTransaction(async tx => {
          const d = await tx.get(ref);
          if (!d.exists || d.data().status !== 'open') { res = { ok: false, error: 'Vật phẩm đã bán hoặc bị thu hồi!' }; return; }
          const l = d.data();
          tx.update(ref, { status: 'sold' });
          const earn = Math.max(1, Math.floor(l.price_jade * 0.95));
          tx.set(this.db.collection('tm_mails').doc(), {
            to_user_id: l.seller_id, from_name: 'Tiên Thị Đấu Giá', title: 'Bán Thành Công Vật Phẩm',
            body: `${u.username} đã mua ${l.qty} vật phẩm của bạn (đã trừ 5% phí sàn).`, attachments: { jade: earn }, claimed: false, created_at: now
          });
          res = { ok: true, itemType: l.item_type, qty: l.qty, priceJade: l.price_jade };
        });
        return res;
      }
      if (cleanPath === '/api/market/cancel') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const ref = this.db.collection('tm_market').doc(String(body.listingId));
        const d = await ref.get();
        if (!d.exists || d.data().seller_id !== uid || d.data().status !== 'open') return { ok: false, error: 'Không thể thu hồi!' };
        await ref.update({ status: 'cancelled' });
        return { ok: true, itemType: d.data().item_type, qty: d.data().qty };
      }

      if (cleanPath === '/api/friends') {
        if (!uid) return { ok: true, friends: [], requests: [] };
        const today = todayStr();
        const fSnap = await this.db.collection('tm_friends').where('user_id', '==', uid).get();
        const rSnap = await this.db.collection('tm_friends').where('friend_id', '==', uid).get();
        const friends = [], requests = [];
        for (const d of fSnap.docs) {
          const fd = d.data();
          if (fd.status !== 'accepted') continue;
          const tu = (await this.db.collection('tm_users').doc(fd.friend_id).get()).data();
          if (tu) friends.push({ id: fd.friend_id, username: tu.username, sectName: tu.sect_name, power: tu.power || 100, realmName: REALM_NAMES[Math.min(9, tu.realm_idx || 0)], online: (this.client.onlineUsers || []).some(x => x.id === fd.friend_id), giftedToday: fd.last_gift_day === today });
        }
        for (const d of rSnap.docs) {
          const fd = d.data();
          if (fd.status !== 'pending') continue;
          const tu = (await this.db.collection('tm_users').doc(fd.user_id).get()).data();
          if (tu) requests.push({ id: fd.user_id, username: tu.username, sectName: tu.sect_name, power: tu.power || 100, realmName: REALM_NAMES[Math.min(9, tu.realm_idx || 0)] });
        }
        return { ok: true, friends, requests };
      }
      if (cleanPath === '/api/friends/add') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const target = await this.db.collection('tm_users').where('username', '==', String(body.username || '').trim().toLowerCase()).limit(1).get();
        if (target.empty) return { ok: false, error: 'Không tìm thấy Đạo Hữu này!' };
        const td = target.docs[0];
        if (td.id === uid) return { ok: false, error: 'Không thể kết bạn với chính mình!' };
        const autoAcc = !!td.data().is_bot;
        await this.db.collection('tm_friends').doc(`${uid}_${td.id}`).set({ user_id: uid, friend_id: td.id, status: autoAcc ? 'accepted' : 'pending', last_gift_day: '' });
        if (autoAcc) await this.db.collection('tm_friends').doc(`${td.id}_${uid}`).set({ user_id: td.id, friend_id: uid, status: 'accepted', last_gift_day: '' });
        return { ok: true, msg: autoAcc ? `Đã kết giao với ${td.data().username}!` : `Đã gửi lời mời tới ${td.data().username}!` };
      }
      if (cleanPath === '/api/friends/accept') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const fid = String(body.friendId);
        await this.db.collection('tm_friends').doc(`${fid}_${uid}`).update({ status: 'accepted' });
        await this.db.collection('tm_friends').doc(`${uid}_${fid}`).set({ user_id: uid, friend_id: fid, status: 'accepted', last_gift_day: '' });
        return { ok: true };
      }
      if (cleanPath === '/api/friends/gift') {
        if (!uid || !u) return { ok: false, error: 'Unauthorized' };
        const fid = String(body.friendId), today = todayStr();
        const ref = this.db.collection('tm_friends').doc(`${uid}_${fid}`);
        const d = await ref.get();
        if (!d.exists || d.data().last_gift_day === today) return { ok: false, error: 'Hôm nay đã tặng quà Đạo Hữu này rồi!' };
        await ref.update({ last_gift_day: today });
        await this.db.collection('tm_mails').add({ to_user_id: fid, from_name: u.username, title: 'Quà Tặng Đạo Hữu', body: `${u.username} gửi tặng bạn 20 Tiên Ngọc!`, attachments: { jade: 20 }, claimed: false, created_at: now });
        return { ok: true };
      }

      if (cleanPath === '/api/mail') {
        if (!uid) return { ok: true, mails: [] };
        const mSnap = await this.db.collection('tm_mails').where('to_user_id', '==', uid).get();
        const mails = mSnap.docs.map(d => ({ id: d.id, fromName: d.data().from_name, title: d.data().title, body: d.data().body, attachments: d.data().attachments || {}, claimed: !!d.data().claimed, createdAt: d.data().created_at || now })).sort((a, b) => b.createdAt - a.createdAt);
        return { ok: true, mails };
      }
      if (cleanPath === '/api/mail/claim') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const mid = body.mailId;
        const mSnap = await this.db.collection('tm_mails').where('to_user_id', '==', uid).get();
        const total = {}; let count = 0;
        for (const d of mSnap.docs) {
          const md = d.data();
          if (md.claimed || (mid !== 'all' && d.id !== String(mid))) continue;
          await d.ref.update({ claimed: true });
          count++;
          for (const [k, v] of Object.entries(md.attachments || {})) total[k] = (total[k] || 0) + Number(v || 0);
        }
        return { ok: true, claimedCount: count, rewards: total };
      }

      // 7. Chat REST fallback
      if (cleanPath === '/api/chat') {
        const chReq = params.get('channel') || 'world';
        const targetCh = (chReq === 'guild' && u && u.guild_id) ? `guild:${u.guild_id}` : 'world';
        const cSnap = await this.db.collection('tm_chat').orderBy('created_at', 'desc').limit(50).get();
        const msgs = cSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.channel === targetCh).reverse();
        return { ok: true, messages: msgs };
      }

      // 8. Top-up (Sandbox), VIP 1-10 & Giftcodes on Firestore
      if (cleanPath === '/api/topup/info') {
        let billing = { total_vnd: 0, vip_exp: 0, vip_lv: 0, first_topup_claimed: 0, firstPacks: {}, vipClaimed: {}, passDaysLeft: 0, canClaimDailyPass: false };
        let orders = [];
        if (uid) {
          const bDoc = await this.db.collection('tm_billing').doc(uid).get();
          if (bDoc.exists) {
            const d = bDoc.data();
            const passLeft = (d.pass_30_until || 0) > now ? Math.max(1, Math.floor((d.pass_30_until - now) / 86400) + 1) : 0;
            billing = { ...d, passDaysLeft: passLeft, canClaimDailyPass: passLeft > 0 && d.pass_30_last_claim !== todayStr() };
          }
          const oSnap = await this.db.collection('tm_orders').where('user_id', '==', uid).get();
          orders = oSnap.docs.map(d => d.data()).sort((a, b) => b.created_at - a.created_at).slice(0, 20);
        }
        return { ok: true, packs: TOPUP_PACKS, vipTiers: VIP_TIERS, bank: { bankId: 'MB', bankName: 'MB Bank', accountNo: '0988886688', accountName: 'THAI HU TIEN MON STUDIO', momoPhone: '0988886688', sandbox: true }, billing, orders };
      }

      if (cleanPath === '/api/topup/order') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const pack = TOPUP_PACKS.find(p => p.id === body.packId);
        if (!pack) return { ok: false, error: 'Gói nạp không hợp lệ!' };
        const code = `TH${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const ord = {
          order_code: code, orderCode: code, user_id: uid, pack_id: pack.id, pack_name: pack.name,
          amount_vnd: pack.vnd, method: body.method || 'vietqr',
          transferContent: `NAP ${code}`, qrImageUrl: `https://img.vietqr.io/image/MB-0988886688-compact2.png?amount=${pack.vnd}&addInfo=${encodeURIComponent('NAP ' + code)}`,
          status: 'pending', created_at: now
        };
        await this.db.collection('tm_orders').doc(code).set(ord);
        return { ok: true, order: ord };
      }

      if (cleanPath === '/api/topup/confirm') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const ordRef = this.db.collection('tm_orders').doc(String(body.orderCode));
        const oDoc = await ordRef.get();
        if (!oDoc.exists || oDoc.data().status === 'paid') return { ok: false, error: 'Đơn hàng không hợp lệ hoặc đã thanh toán!' };
        const ord = oDoc.data();
        const pack = TOPUP_PACKS.find(p => p.id === ord.pack_id);
        const bRef = this.db.collection('tm_billing').doc(uid);
        const bDoc = await bRef.get();
        const b = bDoc.exists ? bDoc.data() : { total_vnd: 0, vip_exp: 0, vip_lv: 0, first_topup_claimed: 0, firstPacks: {}, vipClaimed: {}, pass_30_until: 0 };
        const isFirst = !!(pack.firstX2 && !(b.firstPacks && b.firstPacks[pack.id]));
        const bonusJade = isFirst ? pack.jade : 0;
        const firstPacks = { ...(b.firstPacks || {}), ...(isFirst || pack.once ? { [pack.id]: true } : {}) };
        const newExp = (b.vip_exp || 0) + (pack.vipExp || 0);
        const newVip = calcVipLv(newExp);
        const passUntil = pack.passDays ? Math.max(now, b.pass_30_until || 0) + pack.passDays * 86400 : (b.pass_30_until || 0);
        await bRef.set({
          ...b, total_vnd: (b.total_vnd || 0) + pack.vnd, vip_exp: newExp, vip_lv: newVip,
          firstPacks, pass_30_until: passUntil, no_ads: pack.noAds ? 1 : (b.no_ads || 0), season_pass: pack.seasonPass ? 1 : (b.season_pass || 0)
        }, { merge: true });
        await ordRef.update({ status: 'paid', jade_granted: pack.jade, bonus_jade: bonusJade, paid_at: now });
        await this.db.collection('tm_users').doc(uid).update({ vip_lv: newVip });
        if (u) u.vip_lv = newVip;
        const rewards = { jade: pack.jade + bonusJade };
        if (pack.coin) rewards.coin = pack.coin;
        if (pack.pill) rewards.pill = pack.pill;
        if (pack.scroll) rewards.scroll = pack.scroll;
        return { ok: true, rewards, bonusJade, unlockFlags: { vipLv: newVip, seasonPass: !!pack.seasonPass, noAds: !!pack.noAds, passDaysLeft: passUntil > now ? 30 : 0 } };
      }

      if (cleanPath === '/api/topup/claim_first') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const bRef = this.db.collection('tm_billing').doc(uid);
        const b = (await bRef.get()).data() || {};
        if (!b.total_vnd || b.first_topup_claimed) return { ok: false, error: 'Chưa đủ điều kiện hoặc đã nhận!' };
        await bRef.update({ first_topup_claimed: 1 });
        return { ok: true, reward: FIRST_TOPUP_REWARD };
      }

      if (cleanPath === '/api/topup/claim_vip') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const lv = Number(body.vipLv || 0);
        const tier = VIP_TIERS.find(t => t.lv === lv);
        const bRef = this.db.collection('tm_billing').doc(uid);
        const b = (await bRef.get()).data() || {};
        if (!tier || (b.vip_lv || 0) < lv || (b.vipClaimed && b.vipClaimed[String(lv)])) return { ok: false, error: 'Chưa đạt mốc VIP hoặc đã nhận!' };
        const vipClaimed = { ...(b.vipClaimed || {}), [String(lv)]: true };
        await bRef.update({ vipClaimed });
        return { ok: true, rewards: tier.chest };
      }

      if (cleanPath === '/api/topup/claim_daily_pass') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const today = todayStr();
        const bRef = this.db.collection('tm_billing').doc(uid);
        const b = (await bRef.get()).data() || {};
        if ((b.pass_30_until || 0) <= now || b.pass_30_last_claim === today) return { ok: false, error: 'Thẻ Tháng chưa kích hoạt hoặc hôm nay đã nhận!' };
        await bRef.update({ pass_30_last_claim: today });
        return { ok: true, rewards: { jade: 150 } };
      }

      if (cleanPath === '/api/giftcode/redeem') {
        if (!uid) return { ok: false, error: 'Unauthorized' };
        const code = String(body.code || '').trim().toUpperCase();
        const gc = GIFTCODES[code];
        if (!gc) return { ok: false, error: 'Mã Giftcode không hợp lệ!' };
        const cRef = this.db.collection('tm_giftcode_claims').doc(`${uid}_${code}`);
        if ((await cRef.get()).exists) return { ok: false, error: 'Tài khoản này đã dùng mã này rồi!' };
        await cRef.set({ user_id: uid, code, claimed_at: now });
        return { ok: true, title: gc.title, rewards: gc.rewards };
      }

      return { ok: false, error: `Unknown Firebase endpoint: ${cleanPath}` };
    }
  }

  window.FirebaseOnlineAdapter = FirebaseOnlineAdapter;
})();
