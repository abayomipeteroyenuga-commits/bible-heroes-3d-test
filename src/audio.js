// Child-friendly audio system — local WAV assets, unlocks after first user gesture
const AudioSystem = {
  enabled: true,
  musicEnabled: true,
  unlocked: false,
  volume: 0.7,
  musicVolume: 0.35,
  buffers: {},
  ctx: null,
  currentMusic: null,
  musicSource: null,
  musicGain: null,
  masterGain: null,
  musicName: null,

  FILES: {
    sling_fire: 'assets/audio/sling_fire.wav',
    impact: 'assets/audio/impact.wav',
    enemy_hit: 'assets/audio/enemy_hit.wav',
    damage: 'assets/audio/damage.wav',
    collect: 'assets/audio/collect.wav',
    faith_shield: 'assets/audio/faith_shield.wav',
    goliath_appear: 'assets/audio/goliath_appear.wav',
    level_complete: 'assets/audio/level_complete.wav',
    victory: 'assets/audio/victory.wav',
    music_explore: 'assets/audio/music_explore.wav',
    music_battle: 'assets/audio/music_battle.wav',
    ui_click: 'assets/audio/ui_click.wav'
  },

  async init() {
    // Load settings
    try {
      const data = window.SaveSystem ? SaveSystem.load() : null;
      if (data && data.settings) {
        this.enabled = data.settings.sound !== false;
        this.musicEnabled = data.settings.music !== false;
      }
    } catch (e) {}

    // Preload via HTMLAudioElement as fallback path; real decode after unlock
    this._preloadTags();

    // Unlock on first gesture (browser autoplay policy)
    const unlock = () => this.unlock();
    ['pointerdown', 'touchstart', 'keydown'].forEach(ev => {
      window.addEventListener(ev, unlock, { once: true, passive: true });
    });
  },

  _preloadTags() {
    this.tags = {};
    Object.keys(this.FILES).forEach(key => {
      const a = new Audio();
      a.preload = 'auto';
      a.src = this.FILES[key];
      a.volume = 0.001; // silent preload
      this.tags[key] = a;
    });
  },

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.ctx.destination);

      // Decode all buffers
      await Promise.all(Object.keys(this.FILES).map(async key => {
        try {
          const res = await fetch(this.FILES[key]);
          const arr = await res.arrayBuffer();
          this.buffers[key] = await this.ctx.decodeAudioData(arr.slice(0));
        } catch (err) {
          console.warn('Audio load failed:', key, err);
        }
      }));

      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch (e) {
      console.warn('AudioContext failed, using HTMLAudio fallback', e);
    }
  },

  play(name, opts = {}) {
    if (!this.enabled) return;
    const vol = opts.volume != null ? opts.volume : 1;
    const rate = opts.rate != null ? opts.rate : 1;

    // Web Audio path
    if (this.ctx && this.buffers[name]) {
      try {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers[name];
        src.playbackRate.value = rate;
        const g = this.ctx.createGain();
        g.gain.value = vol;
        src.connect(g);
        g.connect(this.masterGain);
        src.start(0);
        return;
      } catch (e) {}
    }

    // HTMLAudio fallback
    const tag = this.tags && this.tags[name];
    if (tag) {
      try {
        const clone = tag.cloneNode();
        clone.volume = Math.min(1, vol * this.volume);
        clone.play().catch(() => {});
      } catch (e) {}
    }
  },

  playMusic(name, loop = true) {
    if (!this.musicEnabled) return;
    if (this.musicName === name && this.musicSource) return;

    this.stopMusic();
    this.musicName = name;

    if (this.ctx && this.buffers[name]) {
      try {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers[name];
        src.loop = loop;
        src.connect(this.musicGain);
        src.start(0);
        this.musicSource = src;
        return;
      } catch (e) {}
    }

    // Fallback
    const tag = this.tags && this.tags[name];
    if (tag) {
      try {
        tag.loop = loop;
        tag.volume = this.musicVolume;
        tag.currentTime = 0;
        tag.play().catch(() => {});
        this.musicSource = tag;
      } catch (e) {}
    }
  },

  stopMusic() {
    if (this.musicSource) {
      try {
        if (this.musicSource.stop) this.musicSource.stop();
        else if (this.musicSource.pause) {
          this.musicSource.pause();
          this.musicSource.currentTime = 0;
        }
      } catch (e) {}
      this.musicSource = null;
    }
    this.musicName = null;
  },

  setSoundEnabled(on) {
    // Sound effects and music are independent settings. Turning SFX off
    // must never stop the background music.
    this.enabled = !!on;
  },

  setMusicEnabled(on) {
    const next = !!on;
    if (next === this.musicEnabled) return;
    this.musicEnabled = next;
    if (!next) {
      // Preserve the selected track so music can resume when re-enabled.
      const current = this.musicName;
      this.stopMusic();
      this.musicName = current;
    } else if (this.musicName) {
      const n = this.musicName;
      this.musicName = null;
      this.playMusic(n);
    }
  },

  toggleMute() {
    const on = !(this.enabled || this.musicEnabled);
    this.setSoundEnabled(on);
    this.setMusicEnabled(on);
    return on;
  },

  // Convenience aliases
  sling() { this.play('sling_fire', { volume: 0.9, rate: 1 }); },
  impact() { this.play('impact', { volume: 0.9 }); },
  enemyHit() { this.play('enemy_hit', { volume: 0.85 }); },
  damage() { this.play('damage', { volume: 0.9 }); },
  swing() { this.play('sling_fire', { volume: 0.45, rate: 0.7 }); },
  bossSwing() { this.play('goliath_appear', { volume: 0.35, rate: 1.35 }); },
  bossAppear() { this.play('goliath_appear', { volume: 0.95, rate: 0.92 }); },
  bossPhase() { this.play('faith_shield', { volume: 0.7, rate: 0.7 }); this.play('goliath_appear', { volume: 0.55, rate: 1.15 }); },
  bossEnrage() { this.play('goliath_appear', { volume: 1, rate: 0.78 }); this.play('impact', { volume: 0.8, rate: 0.55 }); },
  bossWindup() { this.play('ui_click', { volume: 0.35, rate: 0.45 }); },
  bossCharge() { this.play('impact', { volume: 0.7, rate: 0.6 }); this.play('sling_fire', { volume: 0.35, rate: 0.5 }); },
  bossSlam() { this.play('impact', { volume: 1, rate: 0.5 }); },
  bossRoar() { this.play('goliath_appear', { volume: 0.85, rate: 0.65 }); },
  bossHit() { this.play('enemy_hit', { volume: 1, rate: 0.75 }); },
  bossDefeat() { this.play('impact', { volume: 0.9, rate: 0.55 }); this.play('victory', { volume: 0.45, rate: 0.9 }); },
  enemyDefeat() { this.play('impact', { volume: 0.7, rate: 0.85 }); },
  miss() { this.play('ui_click', { volume: 0.25, rate: 0.6 }); },
  collect() { this.play('collect', { volume: 0.9 }); },
  faithShield() { this.play('faith_shield', { volume: 0.9 }); },
  goliathAppear() { this.play('goliath_appear', { volume: 1 }); },
  levelComplete() { this.play('level_complete', { volume: 1 }); },
  victory() { this.play('victory', { volume: 1 }); },
  uiClick() { this.play('ui_click', { volume: 0.5 }); },
  exploreMusic() { this.playMusic('music_explore', true); },
  battleMusic() { this.playMusic('music_battle', true); }
};

window.AudioSystem = AudioSystem;
