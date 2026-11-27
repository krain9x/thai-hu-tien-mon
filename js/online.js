// ==================== THÁI HƯ TIÊN MÔN — ONLINE MULTIPLAYER CLIENT (REST + WEBSOCKET) ====================
class OnlineClient {
  constructor() {
    this.token = localStorage.getItem('thai_hu_online_token') || '';
    this.user = null;
    this.ws = null;
    this.connected = false;
    this.onlineCount = 1;
    this.onlineUsers = [];
    this.worldBoss = null;
    this.unreadMails = 0;
    this.myGuild = null;
    this.chatHistory = { world: [], guild: [] };
    this.pendingInvite = null;
    this.pkRoom = null;
    this.reconnectTimer = null;
    this.syncAcc = 0;

    // Callbacks wired by ui.js / engine.js
    this.onChatMessage = null;
    this.onPresenceUpdate = null;
    this.onWorldBossUpdate = null;
    this.onPkInvite = null;
    this.onPkStart = null;
    this.onPkOppState = null;
    this.onPkHit = null;
    this.onPkEnd = null;
    this.onToast = null;
    this.onAuthChange = null;
    this.fb = null;
    this._backendReady = null;
  }

  async ensureBackend() {
    if (this._backendReady) return this._backendReady;
    this._backendReady = (async () => {
      const hasFb = !!(window.FirebaseOnlineAdapter && window.TIENMON_FIREBASE_CONFIG && window.firebase);
      const mode = window.TIENMON_ONLINE_MODE || 'auto';
      if (mode === 'firebase' && hasFb) {
        this.fb = new window.FirebaseOnlineAdapter(this);
        return 'firebase';
      }
      if (mode === 'server') return 'server';
      // 'auto': check if local/VPS Python server answers quickly; otherwise switch transparently to Firebase Firestore!
      const isStaticHost = location.protocol === 'file:' || location.hostname.endsWith('github.io') || location.hostname.endsWith('web.app');
      if (isStaticHost && hasFb) {
        this.fb = new window.FirebaseOnlineAdapter(this);
        return 'firebase';
      }
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 1200);
        const r = await fetch('/api/worldboss', { signal: ctrl.signal });
        clearTimeout(tid);
        if (r.ok) return 'server';
      } catch (_) {}
      if (hasFb) {
        this.fb = new window.FirebaseOnlineAdapter(this);
        return 'firebase';
      }
      return 'server';
    })();
    return this._backendReady;
  }

  isLoggedIn() {
    return !!(this.token && this.user);
  }

  async api(path, method = 'GET', body = null) {
    await this.ensureBackend();
    if (this.fb) return await this.fb.api(path, method, body);
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const opts = { method, headers };
    if (body !== null) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({ ok: false, error: 'Lỗi phản hồi máy chủ' }));
    if (!res.ok && data.ok === undefined) data.ok = false;
    return data;
  }

  async tryAutoLogin() {
    await this.ensureBackend();
    if (this.fb) return await this.fb.tryAutoLogin();
    if (!this.token) return null;
    try {
      const res = await this.api('/api/auth/me', 'GET');
      if (res && res.ok && res.user) {
        this.user = res.user;
        this.unreadMails = res.unreadMails || 0;
        this.myGuild = res.guild || null;
        this.onlineCount = res.onlineCount || 1;
        this.connectWs();
        await this.loadInitialChat();
        if (this.onAuthChange) this.onAuthChange(this.user);
        return res;
      }
    } catch (_) {}
    return null;
  }

  async register(username, password, sectName, initialState = null) {
    await this.ensureBackend();
    if (this.fb) return await this.fb.register(username, password, sectName, initialState);
    const res = await this.api('/api/auth/register', 'POST', { username, password, sectName, initialState });
    if (res && res.ok) {
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('thai_hu_online_token', this.token);
      this.unreadMails = 1;
      this.connectWs();
      await this.loadInitialChat();
      if (this.onAuthChange) this.onAuthChange(this.user);
    }
    return res;
  }

  async login(username, password) {
    await this.ensureBackend();
    if (this.fb) return await this.fb.login(username, password);
    const res = await this.api('/api/auth/login', 'POST', { username, password });
    if (res && res.ok) {
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('thai_hu_online_token', this.token);
      this.connectWs();
      await this.loadInitialChat();
      if (this.onAuthChange) this.onAuthChange(this.user);
    }
    return res;
  }

  logout() {
    if (this.fb) { this.fb.logout(); if (this.onAuthChange) this.onAuthChange(null); return; }
    this.token = '';
    this.user = null;
    this.connected = false;
    localStorage.removeItem('thai_hu_online_token');
    if (this.ws) { try { this.ws.close(); } catch (_) {} this.ws = null; }
    if (this.onAuthChange) this.onAuthChange(null);
  }

  async loadInitialChat() {
    if (this.fb) return; // Realtime onSnapshot handles chat automatically
    try {
      const w = await this.api('/api/chat?channel=world', 'GET');
      if (w && w.ok) this.chatHistory.world = w.messages || [];
      const g = await this.api('/api/chat?channel=guild', 'GET');
      if (g && g.ok) this.chatHistory.guild = g.messages || [];
    } catch (_) {}
  }

  connectWs() {
    if (this.fb) return;
    if (!this.token) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${proto}//${location.host}/ws?token=${encodeURIComponent(this.token)}`;
    try {
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => {
        this.connected = true;
        if (this.onPresenceUpdate) this.onPresenceUpdate();
      };
      ws.onmessage = (ev) => {
        let msg = null;
        try { msg = JSON.parse(ev.data); } catch (_) { return; }
        this.handleWsMessage(msg);
      };
      ws.onclose = () => {
        this.connected = false;
        if (this.onPresenceUpdate) this.onPresenceUpdate();
        if (this.token) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => this.connectWs(), 3000);
        }
      };
    } catch (_) {}
  }

  wsSend(obj) {
    if (this.fb) {
      if (!this.fb.uid()) return false;
      Promise.resolve(this.fb.wsSend(obj)).catch(err => console.warn('[fb wsSend]', err));
      return true;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }

  handleWsMessage(msg) {
    const t = msg.type;
    if (t === 'welcome') {
      this.onlineCount = msg.onlineCount || 1;
      if (msg.boss) this.worldBoss = msg.boss;
      if (this.onPresenceUpdate) this.onPresenceUpdate();
    } else if (t === 'presence') {
      this.onlineCount = msg.count || 1;
      this.onlineUsers = msg.users || [];
      if (this.onPresenceUpdate) this.onPresenceUpdate();
    } else if (t === 'chat' && msg.msg) {
      const ch = msg.msg.channel === 'guild' ? 'guild' : 'world';
      this.chatHistory[ch].push(msg.msg);
      if (this.chatHistory[ch].length > 80) this.chatHistory[ch].shift();
      if (this.onChatMessage) this.onChatMessage(msg.msg);
    } else if (t === 'wb_update' && msg.boss) {
      this.worldBoss = msg.boss;
      if (this.onWorldBossUpdate) this.onWorldBossUpdate(msg.boss, msg.lastHit);
    } else if (t === 'toast' && msg.msg) {
      if (this.onToast) this.onToast(msg.msg);
      this.refreshMailCount();
    } else if (t === 'pk_invite') {
      this.pendingInvite = msg;
      if (this.onPkInvite) this.onPkInvite(msg);
    } else if (t === 'pk_start') {
      this.pendingInvite = null;
      this.pkRoom = msg;
      if (this.onPkStart) this.onPkStart(msg);
    } else if (t === 'pk_opp_state') {
      if (this.onPkOppState) this.onPkOppState(msg);
    } else if (t === 'pk_hit') {
      if (this.onPkHit) this.onPkHit(msg);
    } else if (t === 'pk_end') {
      this.pkRoom = null;
      if (this.onPkEnd) this.onPkEnd(msg);
    } else if (t === 'plaza_sync') {
      this.plazaPlayers = msg.players || [];
      if (this.onPlazaSync) this.onPlazaSync(this.plazaPlayers);
    } else if (t === 'coop_rooms') {
      this.coopRooms = msg.rooms || [];
      if (this.onCoopRooms) this.onCoopRooms(this.coopRooms);
    } else if (t === 'coop_room_update') {
      this.currentCoopRoom = msg.room || null;
      if (this.onCoopRoomUpdate) this.onCoopRoomUpdate(msg.room);
    } else if (t === 'coop_start') {
      this.currentCoopRoom = msg.room || null;
      if (this.onCoopStart) this.onCoopStart(msg);
    } else if (t === 'coop_peer_state') {
      if (this.onCoopPeerState) this.onCoopPeerState(msg);
    } else if (t === 'coop_boss_hp') {
      if (this.onCoopBossHp) this.onCoopBossHp(msg);
    } else if (t === 'coop_end') {
      this.currentCoopRoom = null;
      if (this.onCoopEnd) this.onCoopEnd(msg);
    }
  }

  async refreshMailCount() {
    if (!this.isLoggedIn()) return;
    try {
      const r = await this.api('/api/mail', 'GET');
      if (r && r.ok) {
        this.unreadMails = (r.mails || []).filter(m => !m.claimed).length;
        if (this.onPresenceUpdate) this.onPresenceUpdate();
      }
    } catch (_) {}
  }

  async syncState(engine) {
    if (!this.isLoggedIn() || !engine || !engine.state) return false;
    try {
      const ms = engine.getMasterStats();
      const eq = engine.state.gearEquipped || {};
      const owned = engine.state.gearOwned || {};
      const subs = engine.state.gearSubstats || {};
      const socks = engine.state.gearSockets || {};
      const gearDetail = {};
      for (const sl of ['weapon', 'helm', 'armor', 'jade', 'ring', 'boots']) {
        const gid = eq[sl];
        if (gid) {
          gearDetail[sl] = {
            id: gid,
            lv: owned[gid] || 1,
            subs: (subs[gid] || []).slice(0, 4),
            sockets: (socks[gid] || []).slice(0, 4)
          };
        }
      }
      const snap = {
        power: engine.getSectPower(),
        atk: ms.atk,
        maxHp: ms.maxHp,
        def: ms.def,
        crit: ms.crit,
        critDmg: ms.critDmg,
        weapon: eq.weapon || 'wp_iron_jian',
        gearEquipped: eq,
        gearDetail,
        cosmetics: engine.state.cosmetics || { wing: 'wing_none', aura: 'aura_none' },
        pet: engine.state.petActive || '',
        deployed: (engine.state.deployed || []).slice(0, 4),
        realmIdx: engine.state.realmIdx || 0,
        sectName: (this.user && this.user.sect_name) || 'Thái Hư Tiên Môn'
      };
      const res = await this.api('/api/save/sync', 'POST', {
        state: engine.state,
        power: snap.power,
        snapshot: snap,
        sectName: snap.sectName
      });
      return !!(res && res.ok);
    } catch (_) {
      return false;
    }
  }

  sendPlazaMove(x, z, facing = 0) {
    return this.wsSend({ type: 'plaza_move', x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, facing: Math.round(facing * 100) / 100 });
  }

  createCoopRoom(tier = 1, name = '') {
    return this.wsSend({ type: 'coop_create', tier, name });
  }

  joinCoopRoom(roomId) {
    return this.wsSend({ type: 'coop_join', roomId });
  }

  leaveCoopRoom(roomId) {
    return this.wsSend({ type: 'coop_leave', roomId });
  }

  startCoopRoom(roomId) {
    return this.wsSend({ type: 'coop_start', roomId });
  }

  sendCoopState(roomId, payload) {
    return this.wsSend({ type: 'coop_state', roomId, ...payload });
  }

  sendCoopHit(roomId, dmg) {
    return this.wsSend({ type: 'coop_hit', roomId, dmg: Math.round(dmg) });
  }

  sendChat(text, channel = 'world') {
    return this.wsSend({ type: 'chat_send', text, channel });
  }

  sendPkInvite(targetId) {
    return this.wsSend({ type: 'pk_invite', targetId });
  }

  acceptPkInvite(inviteId) {
    return this.wsSend({ type: 'pk_accept', inviteId });
  }

  declinePkInvite(inviteId) {
    return this.wsSend({ type: 'pk_decline', inviteId });
  }

  sendPkState(roomId, payload) {
    return this.wsSend({ type: 'pk_state', roomId, ...payload });
  }

  sendPkAction(roomId, kind, dmg, crit = false, slotIdx = -1) {
    return this.wsSend({ type: 'pk_action', roomId, kind, dmg: Math.round(dmg), crit, slotIdx });
  }
}

window.OnlineClient = OnlineClient;
