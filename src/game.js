// Main Game Controller
const Game = {
  state: 'loading', // loading, menu, intro, playing, paused, victory
  scene: null,
  camera: null,
  renderer: null,
  player: null,
  world: null,
  combat: null,
  enemies: [],
  goliath: null,
  missions: null,
  clock: null,
  exploredCamp: false,
  enemiesDefeated: 0,
  goliathDefeated: false,
  itemsCollected: 0,
  faithUses: 0,
  animFrame: null,

  init() {
    UI.init();
    if (window.AudioSystem) AudioSystem.init();
    this.setupMenuButtons();
    this.loadSettings();
    // Simulate short load then show menu
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      UI.show('mainMenu');
      this.state = 'menu';
      this.populateMap();
    }, 1200);
  },

  setupMenuButtons() {
    const click = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        if (window.AudioSystem) AudioSystem.uiClick();
        fn();
      });
    };
    click('btn-play', () => this.startIntro());
    click('btn-map', () => { this.populateMap(); UI.show('map'); });
    click('btn-howto', () => UI.show('howto'));
    click('btn-achievements', () => {
      UI.populateAchievements(SaveSystem.load().achievements);
      UI.show('achievements');
    });
    click('btn-settings', () => { this.loadSettings(); UI.show('settings'); });
    click('btn-skip-intro', () => this.startLevel(1));
    click('btn-resume', () => this.resume());
    click('btn-pause-map', () => {
      this.populateMap();
      UI.show('map');
    });
    click('btn-settings-pause', () => { this.loadSettings(); UI.show('settings'); });
    click('btn-quit', () => UI.show('confirmQuit'));
    click('btn-quit-yes', () => this.quitToMenu());
    click('btn-quit-no', () => UI.show('pause'));
    click('btn-continue', () => this.quitToMenu());
    click('btn-howto-back', () => UI.show('mainMenu'));
    click('btn-settings-back', () => {
      this.saveSettings();
      if (this.state === 'paused') UI.show('pause');
      else UI.show('mainMenu');
    });
    click('btn-map-back', () => {
      if (this.state === 'paused' || this.state === 'playing') UI.show('pause');
      else UI.show('mainMenu');
    });
    click('btn-ach-back', () => UI.show('mainMenu'));
    click('btn-credits', () => UI.show('credits'));
    click('btn-credits-back', () => UI.show('settings'));
    click('btn-reset-progress', () => UI.show('confirmReset'));
    click('btn-reset-yes', () => {
      SaveSystem.resetProgress();
      this.loadSettings();
      this.populateMap();
      UI.show('settings');
      if (window.UI) UI.showMessage('Progress reset', 2000);
    });
    click('btn-reset-no', () => UI.show('settings'));

    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!window.AudioSystem) return;
        const on = AudioSystem.toggleMute();
        muteBtn.textContent = on ? '🔊' : '🔇';
        document.getElementById('set-sound').checked = AudioSystem.enabled;
        document.getElementById('set-music').checked = AudioSystem.musicEnabled;
        this.saveSettings();
      });
    }
  },

  loadSettings() {
    const data = SaveSystem.load();
    const s = data.settings;
    const el = (id) => document.getElementById(id);
    if (el('set-sound')) el('set-sound').checked = s.sound !== false;
    if (el('set-music')) el('set-music').checked = s.music !== false;
    if (el('set-graphics')) el('set-graphics').value = s.graphics || 'medium';
    if (el('set-sensitivity')) el('set-sensitivity').value = s.sensitivity != null ? s.sensitivity : 1;
    if (el('set-music-vol')) el('set-music-vol').value = s.musicVolume != null ? s.musicVolume : 0.35;
    if (el('set-sfx-vol')) el('set-sfx-vol').value = s.sfxVolume != null ? s.sfxVolume : 0.7;
    if (window.AudioSystem) {
      AudioSystem.setSoundEnabled(s.sound !== false);
      AudioSystem.setMusicEnabled(s.music !== false);
      if (AudioSystem.musicGain) AudioSystem.musicVolume = s.musicVolume != null ? s.musicVolume : 0.35;
      if (AudioSystem.masterGain) AudioSystem.volume = s.sfxVolume != null ? s.sfxVolume : 0.7;
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) muteBtn.textContent = (s.sound !== false) ? '🔊' : '🔇';
    }
  },

  saveSettings() {
    const el = (id) => document.getElementById(id);
    const sound = el('set-sound') ? el('set-sound').checked : true;
    const music = el('set-music') ? el('set-music').checked : true;
    const musicVolume = el('set-music-vol') ? parseFloat(el('set-music-vol').value) : 0.35;
    const sfxVolume = el('set-sfx-vol') ? parseFloat(el('set-sfx-vol').value) : 0.7;
    SaveSystem.updateSettings({
      sound,
      music,
      musicVolume,
      sfxVolume,
      graphics: el('set-graphics') ? el('set-graphics').value : 'medium',
      sensitivity: el('set-sensitivity') ? parseFloat(el('set-sensitivity').value) : 1
    });
    if (window.AudioSystem) {
      AudioSystem.setSoundEnabled(sound);
      AudioSystem.setMusicEnabled(music);
      AudioSystem.musicVolume = musicVolume;
      AudioSystem.volume = sfxVolume;
      if (AudioSystem.musicGain) AudioSystem.musicGain.gain.value = musicVolume;
      if (AudioSystem.masterGain) AudioSystem.masterGain.gain.value = sfxVolume;
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) muteBtn.textContent = sound ? '🔊' : '🔇';
    }
    this.applyGraphics();
    if (this.player) this.player.lookSensitivity = el('set-sensitivity') ? parseFloat(el('set-sensitivity').value) : 1;
  },

  populateMap() {
    const data = SaveSystem.load();
    UI.populateMap(data.unlockedLevels, data.stars, (levelId) => {
      if (levelId === 1) {
        this.startIntro();
      } else if (data.unlockedLevels.indexOf(levelId) !== -1) {
        UI.showMessage('Level ' + levelId + ' is unlocked. Full world coming in a future update.', 2800);
      } else {
        UI.showMessage('This level is locked. Complete earlier adventures first.', 2500);
      }
    });
  },

  startIntro() {
    this.state = 'intro';
    UI.show('intro');
    // Auto proceed after narration
    setTimeout(() => {
      if (this.state === 'intro') this.startLevel();
    }, 6000);
  },

  startLevel() {
    this.teardownLevel();
    this.state = 'playing';
    UI.showGame();
    this.initThree();
    this.missions = new MissionSystem();
    UI.setMission(this.missions.getCurrent().text);
    this.exploredCamp = false;
    this.enemiesDefeated = 0;
    this.goliathDefeated = false;
    this.itemsCollected = 0;
    if (window.AudioSystem) {
      AudioSystem.unlock();
      AudioSystem.exploreMusic();
    }
    this.clock = new THREE.Clock();
    if (!this._loopRunning) this.loop();
  },

  teardownLevel() {
    cancelAnimationFrame(this.animFrame);
    this._loopRunning = false;
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    this.player = null;
    this.enemies = [];
    this.goliath = null;
    this.combat = null;
    if (this.scene) {
      while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    }
  },

  applyGraphics() {
    if (!this.renderer) return;
    const data = SaveSystem.load();
    const g = (data.settings && data.settings.graphics) || 'medium';
    const cap = g === 'low' ? 1 : g === 'high' ? 2 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    this.renderer.shadowMap.enabled = g !== 'low';
  },

  initThree() {
    const canvas = document.getElementById('game-canvas');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 5, 15);

    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.applyGraphics();

    this.world = new World(this.scene);
    this.player = new Player(this.scene, this.camera);
    // Level 1: David starts with his sling ready
    this.player.enableSling();
    this.player.stones = Math.max(this.player.stones, 5);
    const data = SaveSystem.load();
    if (this.player && data.settings && data.settings.sensitivity) {
      this.player.lookSensitivity = data.settings.sensitivity;
    }
    this.combat = new CombatSystem(this.scene);

    // Enemies
    this.enemies = [];
    const enemySpawns = [
      new THREE.Vector3(-6, 0, -8),
      new THREE.Vector3(7, 0, -15),
      new THREE.Vector3(-5, 0, -28),
      new THREE.Vector3(8, 0, -32),
      new THREE.Vector3(0, 0, -40)
    ];
    enemySpawns.forEach((pos, i) => {
      this.enemies.push(new ShadowGuardian(this.scene, pos, i % 3));
    });

    this.goliath = null;

    if (!this._resizeBound) {
      this._resizeBound = true;
      window.addEventListener('resize', () => this.onResize());
    }
  },

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  loop() {
    if (this.state !== 'playing' && this.state !== 'paused') {
      this._loopRunning = false;
      return;
    }
    this._loopRunning = true;
    this.animFrame = requestAnimationFrame(() => this.loop());
    if (this.state === 'paused') return;

    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Restore camera after Goliath entrance emphasis
    if (this._bossCamTimer != null && this._bossCamTimer > 0) {
      this._bossCamTimer -= dt;
      if (this._bossCamTimer <= 0 && this._bossCamOrigin && this.player) {
        this.player.cameraDistance = this._bossCamOrigin.dist;
        this.player.cameraPitch = this._bossCamOrigin.pitch;
        // Keep current angle (player may have moved)
        this._bossCamTimer = null;
        this._bossCamOrigin = null;
      }
    }

    this.player.update(dt, this.world.bounds);
    this.world.update(dt);

    const playerPos = this.player.getPosition();

    // Exploration check
    if (!this.exploredCamp && playerPos.z < 5 && (Math.abs(playerPos.x) > 3 || playerPos.z < 2)) {
      this.exploredCamp = true;
    }

    // Enemies
    this.enemies.forEach(e => {
      e.update(dt, playerPos);
    });
    this.enemiesDefeated = this.enemies.filter(e => !e.alive).length;

    // Goliath
    if (this.goliath && this.goliath.alive) {
      this.goliath.update(dt, playerPos);
    }

    // Combat
    this.combat.update(dt, this.enemies, this.goliath, this.player);

    // Checkpoints
    const cp = this.world.getNearbyCheckpoint(playerPos);
    if (cp) {
      cp.activated = true;
      this.player.setCheckpoint(cp.pos);
      UI.showMessage('CHECKPOINT SAVED: ' + cp.name);
    }

    // Missions
    this.missions.update(this);

    // Nearby item prompt
    const near = this.world.getNearbyCollectible(playerPos);
    if (near && !near.prompted) {
      // silent - player presses E
    }

    this.renderer.render(this.scene, this.camera);
  },

  tryInteract() {
    if (this.state !== 'playing') return;
    const playerPos = this.player.getPosition();
    const item = this.world.getNearbyCollectible(playerPos);
    if (item) {
      this.collectItem(item);
      return;
    }
    // Prayer location (campfire)
    if (this.world.campfire && playerPos.distanceTo(this.world.campfire.position) < 3) {
      this.player.addFaith(25);
      UI.showMessage('FAITH RESTORED! +25');
    }
  },

  collectItem(item) {
    item.collected = true;
    this.scene.remove(item.group);
    this.itemsCollected++;
    this.combat.spawnParticles(item.group.position, 0xf0c14b, 12);
    if (window.AudioSystem) AudioSystem.collect();

    if (item.type === 'stone') {
      this.player.stones++;
      UI.showMessage(`STONE ${this.player.stones}/5`);
    } else if (item.type === 'sling') {
      this.player.enableSling();
      UI.showMessage('SLING ACQUIRED!');
    } else if (item.type === 'health') {
      this.player.heal(25);
      UI.showMessage('❤️ +25 LIFE');
    } else if (item.type === 'armor') {
      this.player.addArmor(25);
      UI.showMessage('🛡️ +25 ARMOR');
    } else if (item.type === 'faith') {
      this.player.addFaith(30);
      UI.showMessage('⚡ +30 FAITH');
    }
    this.player.addScore(50);
    this.updateHUD();
  },

  spawnProjectile() {
    if (!this.player.hasSling) return;
    if (window.AudioSystem) AudioSystem.sling();
    const origin = this.player.getPosition().clone();
    const dir = new THREE.Vector3(
      -Math.sin(this.player.facing),
      0.15,
      -Math.cos(this.player.facing)
    );
    // Aim toward nearest enemy or goliath if close
    let targetDir = dir;
    let nearest = null;
    let nearestDist = 25;
    this.enemies.forEach(e => {
      if (!e.alive) return;
      const d = origin.distanceTo(e.group.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e.group.position;
      }
    });
    if (this.goliath && this.goliath.alive) {
      const d = origin.distanceTo(this.goliath.group.position);
      if (d < nearestDist) {
        nearest = this.goliath.group.position.clone().add(new THREE.Vector3(0, 4, 0));
      }
    }
    if (nearest) {
      targetDir = new THREE.Vector3().subVectors(nearest, origin).normalize();
    }
    const isFaith = this.player.shieldActive > 0 || this.player.faith > 80;
    this.combat.spawnStone(origin, targetDir, isFaith);
  },

  spawnParticles(pos, color, count) {
    this.combat.spawnParticles(pos, color, count);
  },

  spawnShockwave(pos) {
    this.combat.spawnShockwave(pos);
  },

  spawnGoliath() {
    if (this.goliath) return;
    this.goliath = new Goliath(this.scene, new THREE.Vector3(0, 0, -70));
    UI.showBoss(this.goliath.health, this.goliath.maxHealth);
    UI.showMessage('GOLIATH — THE PHILISTINE GIANT!', 3000);
    if (window.AudioSystem) {
      AudioSystem.goliathAppear();
      AudioSystem.battleMusic();
    }
    // Brief camera emphasis on boss entrance
    if (this.player) {
      this._bossCamTimer = 2.4;
      this._bossCamOrigin = {
        angle: this.player.cameraAngle,
        pitch: this.player.cameraPitch,
        dist: this.player.cameraDistance
      };
      this.player.cameraDistance = 18;
      this.player.cameraPitch = 0.55;
      // Look toward Goliath
      const gp = this.goliath.group.position;
      const pp = this.player.getPosition();
      this.player.cameraAngle = Math.atan2(-(gp.x - pp.x), -(gp.z - pp.z));
    }
  },

  onBossDefeated() {
    this.goliathDefeated = true;
    this.player.state = 'VICTORY';
    this.player.addScore(500);
    // Faith moment text
    UI.showMessage('DAVID: "I come with faith in God!"', 3000);
    setTimeout(() => {
      this.showVictory();
    }, 2500);
  },

  showVictory() {
    this.state = 'victory';
    cancelAnimationFrame(this.animFrame);
    if (window.AudioSystem) {
      AudioSystem.stopMusic();
      AudioSystem.levelComplete();
      setTimeout(() => { if (window.AudioSystem) AudioSystem.victory(); }, 400);
    }
    const score = this.player.score;
    const stars = score > 1200 ? 3 : score > 700 ? 2 : 1;
    document.getElementById('victory-score').textContent = score;
    document.getElementById('victory-items').textContent = this.itemsCollected;
    document.getElementById('victory-stars').textContent = '⭐'.repeat(stars);

    // Save progress
    SaveSystem.unlockLevel(2);
    SaveSystem.setBestScore(1, score);
    SaveSystem.setStars(1, stars);
    SaveSystem.setAchievement('davidTheBrave');
    SaveSystem.setAchievement('bossConqueror');
    SaveSystem.setAchievement('firstVictory');
    SaveSystem.setAchievement('adventureExplorer');
    SaveSystem.bumpStat('levelsCompleted', 1);
    if (this.enemiesDefeated >= 5) SaveSystem.setAchievement('guardianDefeater');

    UI.show('victory');
  },

  updateHUD() {
    if (!this.player) return;
    UI.updateStats(
      this.player.life, this.player.maxLife,
      this.player.armor, this.player.maxArmor,
      this.player.faith, this.player.maxFaith,
      this.player.score
    );
  },

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    UI.show('pause');
    document.exitPointerLock && document.exitPointerLock();
  },

  resume() {
    this.state = 'playing';
    UI.showGame();
    if (this.clock) this.clock.getDelta(); // reset delta
    if (!this._loopRunning) this.loop();
  },

  restartLevel() {
    this.startLevel();
  },

  quitToMenu() {
    this.state = 'menu';
    if (window.AudioSystem) AudioSystem.stopMusic();
    this.teardownLevel();
    UI.show('mainMenu');
    this.populateMap();
  }
};

window.Game = Game;

// Boot
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
