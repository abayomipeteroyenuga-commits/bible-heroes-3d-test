// Main Game Controller
const Game = {
  state: 'loading', // loading, menu, intro, playing, paused, victory
  currentWorld: 1,
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
    click('btn-play', () => this.playContinue());
    click('btn-next-world', () => this.continueNextWorld());
    click('btn-map', () => { this.populateMap(); UI.show('map'); });
    click('btn-howto', () => UI.show('howto'));
    click('btn-achievements', () => {
      UI.populateAchievements(SaveSystem.load().achievements);
      UI.show('achievements');
    });
    click('btn-settings', () => { this.loadSettings(); UI.show('settings'); });
    click('btn-skip-intro', () => this.startLevel(1));
    click('btn-resume', () => this.resume());
    click('btn-pause-howto', () => UI.show('howto'));
    click('btn-pause-restart', () => this.restartLevel());
    click('btn-pause-map', () => {
      this.populateMap();
      UI.show('map');
    });
    click('btn-settings-pause', () => { this.loadSettings(); UI.show('settings'); });
    click('btn-quit', () => UI.show('confirmQuit'));
    click('btn-quit-yes', () => this.quitToMenu());
    click('btn-quit-no', () => UI.show('pause'));
    click('btn-continue', () => { this.quitToMenu(); this.populateMap(); UI.show('map'); });
    click('btn-howto-back', () => {
      if (this.state === 'paused') UI.show('pause');
      else UI.show('mainMenu');
    });
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
    UI.populateMap(data, (levelId) => {
      this.startWorld(levelId);
    });
  },

  startIntro() {
    this.startWorld(1);
  },

  playContinue() {
    const data = SaveSystem.load();
    const allDone = (data.completedLevels || []).length >= 10;
    if (allDone) {
      this.populateMap();
      UI.show('map');
      return;
    }
    const next = SaveSystem.getContinueLevel();
    this.startWorld(next);
  },

  startWorld(id) {
    const n = parseInt(id, 10) || 1;
    if (n < 1 || n > 10) return;
    if (!SaveSystem.isUnlocked(n)) {
      if (window.UI) UI.showMessage('This world is locked. Complete earlier worlds first.', 2400);
      return;
    }
    this.currentWorld = n;
    if (n === 1) {
      this.state = 'intro';
      const title = document.querySelector('#intro-screen .intro-title');
      const lv = window.LEVELS && window.LEVELS[0];
      if (title && lv) title.textContent = 'WORLD 1 — ' + lv.name.toUpperCase();
      UI.show('intro');
      setTimeout(() => {
        if (this.state === 'intro') this.startLevel(1);
      }, 4000);
    } else {
      this.startLevel(n);
    }
  },

  startLevel(id) {
    if (id) this.currentWorld = parseInt(id, 10) || 1;
    this.teardownLevel();
    this.state = 'playing';
    this.worldCompleteReady = false;
    this._victoryQueued = false;
    this._worldCompletionHandled = false;
    this._victoryScreenShown = false;
    this.hiddenPathFound = false;
    this.mountainPassCrossed = false;
    this.rockyWildernessCrossed = false;
    this.caveEscaped = false;
    this.outpostBroken = false;
    this.fortressReached = false;
    this.goliathTerritoryEntered = false;
    UI.showGame();
    this.initThree();
    this.missions = new MissionSystem(this.currentWorld);
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

    this.world = new World(this.scene, this.currentWorld || 1);
    this.player = new Player(this.scene, this.camera);
    this.player.enableSling();
    this.player.stones = Math.max(this.player.stones, 5);
    const data = SaveSystem.load();
    if (this.player && data.settings && data.settings.sensitivity) {
      this.player.lookSensitivity = data.settings.sensitivity;
    }
    this.combat = new CombatSystem(this.scene);

    this.enemies = [];
    const theme = window.getWorldTheme ? window.getWorldTheme(this.currentWorld || 1) : {};
    this._worldTheme = theme;
    this._waveIndex = 0;
    this.wavesComplete = !(theme.waves && theme.waves.length > 1);
    const spots = window.enemySpawnsFor ? window.enemySpawnsFor(this.currentWorld || 1) : [];
    const stats = { health: theme.enemyHp || 30, damage: theme.enemyDmg || 5, speed: theme.enemySpd || 3.2 };
    this._enemyStats = stats;
    spots.forEach((s, i) => {
      this.enemies.push(new ShadowGuardian(this.scene, new THREE.Vector3(s.x, s.y, s.z), i % 3, stats));
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
    if (this.currentWorld === 3 && playerPos.x < -13 && playerPos.z < -18 && playerPos.z > -28) {
      this.hiddenPathFound = true;
    }
    if (this.currentWorld === 5 && Math.abs(playerPos.x) < 4 && playerPos.z < -24 && playerPos.z > -36) {
      this.mountainPassCrossed = true;
    }
    if (this.currentWorld === 2 && playerPos.z < -52) this.rockyWildernessCrossed = true;
    if (this.currentWorld === 4 && playerPos.z < -58) this.caveEscaped = true;
    if (this.currentWorld === 6 && Math.abs(playerPos.x) < 8 && playerPos.z < -20 && playerPos.z > -26) this.outpostBroken = true;
    if (this.currentWorld === 7 && playerPos.z < -24 && Math.abs(playerPos.x) < 10) this.fortressReached = true;
    if (this.currentWorld === 9 && playerPos.z < -50) this.goliathTerritoryEntered = true;

    // Enemies
    this.enemies.forEach(e => {
      e.update(dt, playerPos);
    });
    this.enemiesDefeated = this.enemies.filter(e => !e.alive).length;
    this.trySpawnNextWave();

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

  trySpawnNextWave() {
    const theme = this._worldTheme;
    if (!theme || !theme.waves || theme.waves.length < 2) return;
    const living = this.enemies.some(e => e.alive);
    if (living) return;
    if (this._waveIndex >= theme.waves.length - 1) {
      this.wavesComplete = true;
      return;
    }
    this._waveIndex++;
    const next = theme.waves[this._waveIndex] || [];
    const stats = this._enemyStats || {};
    next.forEach((p, i) => {
      this.enemies.push(new ShadowGuardian(this.scene, new THREE.Vector3(p[0], p[1], p[2]), i % 3, stats));
    });
    if (window.UI) UI.showMessage('WAVE ' + (this._waveIndex + 1) + '!', 1600);
    if (window.AudioSystem) AudioSystem.battleMusic();
  },

  spawnGoliath() {
    if (this.goliath) return;
    const theme = window.getWorldTheme ? window.getWorldTheme(this.currentWorld || 1) : {};
    const gp = theme.goliathPos || [0, 0, -70];
    this.goliath = new Goliath(this.scene, new THREE.Vector3(gp[0], gp[1], gp[2]));
    if (theme.goliathHp) {
      this.goliath.health = theme.goliathHp;
      this.goliath.maxHealth = theme.goliathHp;
    }
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
    if (this.player) {
      this.player.state = 'VICTORY';
      this.player.addScore(500);
    }
    UI.showMessage('DAVID: "I come with faith in God!"', 3000);
    // MissionSystem detects goliathDefeated and calls finishWorld → completeCurrentWorld
  },

  completeCurrentWorld() {
    if (this._worldCompletionHandled) return;
    this._worldCompletionHandled = true;
    const worldId = this.currentWorld || 1;
    const score = this.player ? this.player.score : 0;
    const stars = score > 1200 ? 3 : score > 700 ? 2 : 1;
    const result = SaveSystem.completeLevel(worldId, score, stars);

    const lv = (window.LEVELS && window.LEVELS[worldId - 1]) || {};
    if (result.newlyCompleted) {
      if (lv.achievement) SaveSystem.setAchievement(lv.achievement);
      if (this.enemiesDefeated >= 5) SaveSystem.setAchievement('guardianDefeater');
      if (this.goliathDefeated) SaveSystem.setAchievement('bossConqueror');
      if (worldId === 10 && this.goliathDefeated) {
        SaveSystem.setAchievement('giantSlayer');
        SaveSystem.setAchievement('davidTheBrave');
      }
    }
    SaveSystem.checkAchievements();
    this._pendingVictory = { worldId, score, stars, result };
    this.showVictory();
  },

  showVictory() {
    if (this._victoryScreenShown) return;
    this._victoryScreenShown = true;
    this.state = 'victory';
    cancelAnimationFrame(this.animFrame);
    this._loopRunning = false;
    if (window.AudioSystem) {
      AudioSystem.stopMusic();
      AudioSystem.levelComplete();
      setTimeout(() => { if (window.AudioSystem) AudioSystem.victory(); }, 400);
    }

    const worldId = (this._pendingVictory && this._pendingVictory.worldId) || this.currentWorld || 1;
    const score = (this._pendingVictory && this._pendingVictory.score) || (this.player ? this.player.score : 0);
    const stars = (this._pendingVictory && this._pendingVictory.stars) || 1;
    const result = (this._pendingVictory && this._pendingVictory.result) || {};
    const lv = (window.LEVELS && window.LEVELS[worldId - 1]) || { name: 'World ' + worldId };
    const nextId = result.nextLevel || (worldId < 10 ? worldId + 1 : null);
    const nextLv = nextId && window.LEVELS ? window.LEVELS[nextId - 1] : null;

    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('victory-title', worldId === 10 ? 'DAVID & GOLIATH — FINAL VICTORY' : ('WORLD ' + worldId + ' COMPLETE!'));
    setTxt('victory-subtitle', worldId === 10 ? 'GIANT SLAYER' : lv.name.toUpperCase());
    setTxt('victory-score', score);
    setTxt('victory-items', this.itemsCollected);
    setTxt('victory-enemies', this.enemiesDefeated);
    const starEl = document.getElementById('victory-stars');
    if (starEl) starEl.textContent = '⭐'.repeat(stars);
    const unlockEl = document.querySelector('#victory-screen .unlock');
    if (unlockEl) {
      unlockEl.textContent = worldId === 10
        ? 'THE ADVENTURE IS COMPLETE! GIANT SLAYER!'
        : (nextLv ? ('NEXT WORLD UNLOCKED: WORLD ' + nextId + ' — ' + nextLv.name.toUpperCase()) : 'WORLD COMPLETE');
    }
    const nextBtn = document.getElementById('btn-next-world');
    if (nextBtn) nextBtn.classList.toggle('hidden', worldId >= 10 || !nextId);

    UI.show('victory');
  },

  continueNextWorld() {
    const next = (this.currentWorld || 1) + 1;
    if (next <= 10 && SaveSystem.isUnlocked(next)) this.startWorld(next);
    else {
      this.quitToMenu();
      this.populateMap();
      UI.show('map');
    }
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
