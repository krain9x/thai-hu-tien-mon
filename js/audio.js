// ============================================================================
// Thái Hư Tiên Môn — WebAudio Amplified Vietnamese Cultivation Voice + BGM/SFX
// Uses Web Audio API GainNode (3.1x / +10dB) + DynamicsCompressorNode + Ducking
// ============================================================================

class MurimAudio {
  constructor() {
    this.bgmVol = 0.42;
    this.sfxVol = 0.65;
    this.voiceVol = 1.25; // 0..1.5 user multiplier on top of 3.0x WebAudio preamp!
    this.voiceOn = true;
    this.unlocked = false;
    this.bgmPendingRetry = false;
    this.currentBgmName = '';
    this.currentBgm = null;
    this.duckUntil = 0;

    this.actx = null;
    this.voiceGainNode = null;
    this.voiceCompNode = null;
    this.activeVoiceSrc = null;
    this.voiceBufferCache = new Map();
    this.voiceFetchPending = new Map();

    this.pools = new Map();
    this.lastPlayed = new Map();
    this.isPageHidden = !!(typeof document !== 'undefined' && document.hidden);

    try {
      const saved = JSON.parse(localStorage.getItem('tienmon_audio_cfg_v1') || '{}');
      if (typeof saved.bgmVol === 'number') this.bgmVol = saved.bgmVol;
      if (typeof saved.sfxVol === 'number') this.sfxVol = saved.sfxVol;
      if (typeof saved.voiceVol === 'number') this.voiceVol = saved.voiceVol;
      if (typeof saved.voiceOn === 'boolean') this.voiceOn = saved.voiceOn;
    } catch (_) {}

    const unlock = () => {
      if (this.isPageHidden) return;
      this.ensureAudioContext();
      const firstUnlock = !this.unlocked;
      this.unlocked = true;
      if ((firstUnlock || this.bgmPendingRetry) && this.currentBgmName) {
        this.bgmPendingRetry = false;
        this.playBgm(this.currentBgmName, true);
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    // Mobile & Tab Background Guard: mute/pause ALL BGM, SFX & WebAudio immediately when hidden/locked!
    const syncVis = (forceHide = false) => {
      const hide = forceHide || !!(typeof document !== 'undefined' && document.hidden);
      this.setBackgroundSuspended(hide);
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => syncVis(false));
    }
    window.addEventListener('pagehide', () => syncVis(true));
    window.addEventListener('pageshow', () => syncVis(false));

    // Smooth ducking restore loop
    setInterval(() => {
      if (!this.isPageHidden) this.updateBgmDucking();
    }, 80);
  }

  setBackgroundSuspended(hidden) {
    this.isPageHidden = !!hidden;
    if (this.isPageHidden) {
      if (this.currentBgm) {
        try { this.currentBgm.pause(); } catch (_) {}
      }
      for (const pool of this.pools.values()) {
        for (const a of pool) {
          try { if (!a.paused) a.pause(); } catch (_) {}
        }
      }
      this.stopVoice();
      if (this.actx && this.actx.state === 'running') {
        this.actx.suspend().catch(() => {});
      }
    } else if (this.unlocked) {
      if (this.actx && this.actx.state === 'suspended') {
        this.actx.resume().catch(() => {});
      }
      if (this.currentBgm) {
        this.currentBgm.play().catch(() => {});
      } else if (this.currentBgmName) {
        this.playBgm(this.currentBgmName, true);
      }
    }
  }

  ensureAudioContext() {
    if (!this.actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        this.actx = new AC();
        // Studio Vocal Chain: High-pass 85Hz -> Presence Shelf -> 3.2x Preamp -> Brickwall Limiter!
        this.voiceGainNode = this.actx.createGain();
        this.voiceCompNode = this.actx.createDynamicsCompressor();
        this.voiceCompNode.threshold.value = -8.0;
        this.voiceCompNode.knee.value = 6.0;
        this.voiceCompNode.ratio.value = 10.0;
        this.voiceCompNode.attack.value = 0.002;
        this.voiceCompNode.release.value = 0.14;

        const presence = this.actx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 2800;
        presence.Q.value = 1.0;
        presence.gain.value = 3.5; // Crisp Vietnamese consonant clarity!

        this.voiceGainNode.connect(presence);
        presence.connect(this.voiceCompNode);
        this.voiceCompNode.connect(this.actx.destination);
        this.syncVoiceGain();
      }
    }
    if (this.actx && this.actx.state === 'suspended') {
      this.actx.resume().catch(() => {});
    }
  }

  syncVoiceGain() {
    if (this.voiceGainNode) {
      // 3.1x base boost (~+10 dB) * user voiceVol (default 1.25 => ~3.88x = +11.8 dB!)
      this.voiceGainNode.gain.value = this.voiceOn ? Math.max(0, this.voiceVol * 3.1) : 0;
    }
  }

  updateBgmDucking() {
    if (!this.currentBgm) return;
    const ducked = performance.now() < this.duckUntil;
    const target = this.bgmVol * (ducked ? 0.34 : 1.0);
    const cur = this.currentBgm.volume;
    if (Math.abs(cur - target) > 0.01) {
      this.currentBgm.volume = Math.max(0, Math.min(1, cur + (target - cur) * 0.35));
    }
  }

  savePrefs() {
    try {
      localStorage.setItem('tienmon_audio_cfg_v1', JSON.stringify({
        bgmVol: this.bgmVol,
        sfxVol: this.sfxVol,
        voiceVol: this.voiceVol,
        voiceOn: this.voiceOn
      }));
    } catch (_) {}
  }

  setBgmVolume(v) {
    this.bgmVol = Math.max(0, Math.min(1, v));
    if (this.currentBgm) {
      this.currentBgm.volume = this.bgmVol;
    }
    this.savePrefs();
  }

  setSfxVolume(v) {
    this.sfxVol = Math.max(0, Math.min(1, v));
    this.savePrefs();
  }

  setVoiceVolume(v) {
    this.voiceVol = Math.max(0, Math.min(1.5, v));
    this.syncVoiceGain();
    this.savePrefs();
  }

  setVoiceEnabled(on) {
    this.voiceOn = !!on;
    this.syncVoiceGain();
    if (!this.voiceOn) {
      this.stopVoice();
    }
    this.savePrefs();
  }

  resolveBgmSrc(name) {
    const ttBgm = {
      bgm_town: 'bgm_town', town: 'bgm_town', bgm_menu: 'bgm_town', bgm_title: 'bgm_town',
      bgm_field: 'bgm_ch0', field: 'bgm_ch0', bgm_ch0: 'bgm_ch0',
      bgm_ch1: 'bgm_ch1', bgm_ch2: 'bgm_ch2', bgm_ch3: 'bgm_ch3', bgm_ch4: 'bgm_ch4', bgm_ch5: 'bgm_ch5',
      bgm_boss: 'bgm_boss', boss: 'bgm_boss',
      bgm_tower: 'bgm_tower', tower: 'bgm_tower',
      bgm_arena: 'bgm_arena', arena: 'bgm_arena', bgm_battle: 'bgm_arena'
    };
    if (ttBgm[name]) return `assets/audio_tt/bgm/${ttBgm[name]}.mp3`;
    return `assets/audio/${name}.wav`;
  }

  resolveSfxSrc(name) {
    const ttSfx = {
      hit: 'hit_light', hit_light: 'hit_light', hit_heavy: 'hit_heavy', crit: 'hit_heavy',
      sword: 'whoosh_m', slash: 'whoosh_m', swing: 'whoosh_s', dodge: 'sky_whistle',
      skill: 'daiNhat_cast', ult: 'vanHon_big', boss: 'gong',
      levelup: 'shimmer_rise', recruit_gold: 'chime', collect: 'chime',
      ui_click: 'chime_low', ui_tab: 'whoosh_s',
      sk_wave: 'whoosh_l', sk_burst: 'boom', sk_crescent: 'whoosh_l', sk_leap: 'sky_whistle',
      sk_flash: 'cuuU_cast', sk_meteor: 'huyetSat_big', sk_blades: 'whoosh_m', sk_whirl: 'cuuU_big',
      sk_shadow: 'vanHon_cast', sk_storm: 'vanHon_big', sk_sweep: 'huyetSat_cast', sk_quake: 'boom',
      sk_heaven: 'daiNhat_big', sk_palm: 'hit_heavy', sk_pull: 'rune_hum', sk_aegis: 'rune_hum'
    };
    if (ttSfx[name]) return `assets/audio_tt/sfx/${ttSfx[name]}.wav`;
    return `assets/audio/${name}.wav`;
  }

  playBgm(name, force = false) {
    if (!force && this.currentBgmName === name && this.currentBgm && !this.currentBgm.paused) {
      return;
    }
    this.currentBgmName = name;
    if (this.currentBgm) {
      try { this.currentBgm.pause(); } catch (_) {}
      this.currentBgm = null;
    }
    if (!this.unlocked || !name || this.isPageHidden) return;
    const audio = new Audio(this.resolveBgmSrc(name));
    audio.loop = true;
    audio.volume = this.bgmVol;
    this.bgmPendingRetry = false;
    audio.play().catch(() => { this.bgmPendingRetry = true; });
    this.currentBgm = audio;
  }

  playSfx(name, volMul = 1.0, minGapMs = 45) {
    if (!this.unlocked || this.sfxVol <= 0.01 || !name || this.isPageHidden) return;
    const now = performance.now();
    const prev = this.lastPlayed.get(name) || 0;
    if (now - prev < minGapMs) return;
    this.lastPlayed.set(name, now);

    let pool = this.pools.get(name);
    if (!pool) {
      pool = [];
      this.pools.set(name, pool);
    }
    let inst = pool.find(a => a.paused || a.ended);
    if (!inst) {
      if (pool.length >= 4) {
        inst = pool[0];
        try { inst.currentTime = 0; } catch (_) {}
      } else {
        inst = new Audio(this.resolveSfxSrc(name));
        pool.push(inst);
      }
    } else {
      try { inst.currentTime = 0; } catch (_) {}
    }
    const duckMul = now < this.duckUntil ? 0.52 : 1.0;
    inst.volume = Math.max(0, Math.min(1, this.sfxVol * volMul * duckMul));
    inst.play().catch(() => {});
  }

  stopVoice() {
    if (this.activeVoiceSrc) {
      try { this.activeVoiceSrc.stop(); } catch (_) {}
      this.activeVoiceSrc = null;
    }
    this.duckUntil = 0;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  async loadVoiceBuffer(name) {
    if (this.voiceBufferCache.has(name)) return this.voiceBufferCache.get(name);
    if (this.voiceFetchPending.has(name)) return this.voiceFetchPending.get(name);
    const p = fetch(`assets/audio_vi/${name}.mp3`)
      .then(r => { if (!r.ok) return null; return r.arrayBuffer(); })
      .then(ab => ab ? this.actx.decodeAudioData(ab) : null)
      .then(buf => {
        this.voiceBufferCache.set(name, buf);
        this.voiceFetchPending.delete(name);
        return buf;
      })
      .catch(() => {
        this.voiceFetchPending.delete(name);
        return null;
      });
    this.voiceFetchPending.set(name, p);
    return p;
  }

  playVoice(name, minGapMs = 650) {
    if (!this.unlocked || !this.voiceOn || this.voiceVol <= 0.02 || !name || this.isPageHidden) return;
    this.ensureAudioContext();
    const key = `vo_${name}`;
    const now = performance.now();
    const prev = this.lastPlayed.get(key) || 0;
    if (now - prev < minGapMs) return;
    this.lastPlayed.set(key, now);

    // Don't interrupt important story/ult/join lines with random short skill grunts
    if (this.activeVoiceSrc && name.startsWith('master_skill_')) {
      return;
    }

    this.loadVoiceBuffer(name).then(buf => {
      if (!buf || !this.voiceOn || !this.actx) return;
      if (this.activeVoiceSrc) {
        try { this.activeVoiceSrc.stop(); } catch (_) {}
        this.activeVoiceSrc = null;
      }
      const src = this.actx.createBufferSource();
      src.buffer = buf;
      src.connect(this.voiceGainNode);
      this.syncVoiceGain();
      this.activeVoiceSrc = src;
      this.duckUntil = performance.now() + buf.duration * 1000 + 180;
      this.updateBgmDucking();
      src.onended = () => {
        if (this.activeVoiceSrc === src) {
          this.activeVoiceSrc = null;
        }
      };
      src.start(0);
    });
  }

  playCutsceneLine(voKey, who = '', text = '') {
    if (!this.unlocked || !this.voiceOn) return;
    this.stopVoice();
    if (voKey) {
      this.playVoice(voKey, 0);
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis && text) {
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        const viVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('vi'));
        if (viVoice) {
          const u = new SpeechSynthesisUtterance(text.replace(/\n+/g, ' '));
          u.voice = viVoice;
          u.lang = 'vi-VN';
          u.volume = 1.0;
          u.rate = 1.04;
          this.duckUntil = performance.now() + 3200;
          window.speechSynthesis.speak(u);
          return;
        }
      } catch (_) {}
    }
    const whoMap = {
      'Lâm Phong': 'master_skill_1',
      'Tông Chủ': 'master_clear_1',
      'Thanh Linh Nhi': 'narrator_hall_done',
      'Thanh Linh Nhi · Kiếm Linh': 'narrator_hall_done',
      'Cốt Nanh': 'boss_taunt_0',
      'Huyền Nha': 'boss_taunt_1',
      'Ly Sương': 'boss_taunt_2',
      'Phần Thiên': 'boss_taunt_3',
      'Hàn Tuyệt': 'boss_taunt_4',
      'Vô Gián': 'boss_taunt_5'
    };
    if (who && whoMap[who]) {
      this.playVoice(whoMap[who], 100);
    }
  }

  playRandom(list, isVoice = false) {
    if (!list || !list.length) return;
    const pick = list[Math.floor(Math.random() * list.length)];
    if (isVoice) this.playVoice(pick);
    else this.playSfx(pick);
  }

  playSkillAudio(skillId) {
    const map = {
      wave: 'sk_wave', burst: 'sk_burst', crescent: 'sk_crescent', leap: 'sk_leap',
      flash: 'sk_flash', meteor: 'sk_meteor', blades: 'sk_blades', whirl: 'sk_whirl',
      shadow: 'sk_shadow', storm: 'sk_storm', sweep: 'sk_sweep', quake: 'sk_quake',
      heaven: 'sk_heaven', palm: 'sk_palm', pull: 'sk_pull', aegis: 'sk_aegis',
      clear_counter: 'sk_clear_counter', shadow_mark: 'sk_shadow_mark',
      meridian_recall: 'sk_meridian_recall', blood_opening: 'sk_blood_opening',
      heaven_pressure: 'sk_heaven_pressure', united_seal: 'sk_united_seal'
    };
    this.playSfx(map[skillId] || 'skill', 0.88, 30);
    if (Math.random() < 0.35) {
      this.playRandom(['master_skill_1', 'master_skill_2', 'master_skill_3'], true);
    }
  }
}

window.MurimAudio = MurimAudio;
