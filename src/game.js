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
    this.bindSlingKeys();
    this.loadSettings();
    // Simulate short load then show menu
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      UI.show('mainMenu');
      this.state = 'menu';
      this.populateMap();
      if (window.UI) UI.setWorldDisplay(SaveSystem.getContinueLevel());
      try {
        const params = new URLSearchParams(window.location.search || '');
        if (params.get('play') === '1') this.startLevel(SaveSystem.getContinueLevel() || 1);
      } catch (e) {}
    }, 1200);
  },

  bindSlingKeys() {
    if (this._slingKeysBound) return;
    this._slingKeysBound = true;
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const code = e.code || '';
      const key = String(e.key || '').toLowerCase();
      const fire =
        code === 'KeyF' || code === 'KeyG' || code === 'KeyT' || code === 'KeyK' ||
        key === 'f' || key === 'g' || key === 't' || key === 'k';
      if (!fire) return;
      e.preventDefault();
      this.fireSling();
    }, true);
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
    click('btn-shop', () => this.openShop());
    click('btn-pause-shop', () => this.openShop());
    click('btn-shop-back', () => {
      if (this.state === 'paused') UI.show('pause');
      else UI.show('mainMenu');
    });
    document.querySelectorAll('[data-shop-item]').forEach(btn => {
      btn.addEventListener('click', () => this.buyShopItem(btn.getAttribute('data-shop-item')));
    });
    click('btn-craft-arrows', () => this.craftArrows());
    click('btn-settings', () => { this.loadSettings(); UI.show('settings'); });
    click('btn-skip-intro', () => this.startLevel(this.currentWorld));
    click('btn-bible', () => UI.showBibleMoment(this.currentWorld));
    click('btn-bible-close', () => UI.hideBibleMoment());
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
    const fovEl = document.getElementById('set-fov');
    if (fovEl) {
      fovEl.addEventListener('input', () => {
        this.applyFov();
      });
      fovEl.addEventListener('change', () => this.saveSettings());
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
    if (el('set-fov')) el('set-fov').value = s.fov != null ? s.fov : 55;
    if (el('fov-label')) el('fov-label').textContent = (s.fov != null ? s.fov : 55) + '°';
    this.applyFov();
    if (el('set-music-vol')) el('set-music-vol').value = s.musicVolume != null ? s.musicVolume : 0.35;
    if (el('set-sfx-vol')) el('set-sfx-vol').value = s.sfxVolume != null ? s.sfxVolume : 0.7;
    if (window.AudioSystem) {
      AudioSystem.setSoundEnabled(s.sound !== false);
      AudioSystem.setMusicEnabled(s.music !== false);
      AudioSystem.musicVolume = s.musicVolume != null ? s.musicVolume : 0.35;
      AudioSystem.volume = s.sfxVolume != null ? s.sfxVolume : 0.7;
      if (AudioSystem.musicGain) AudioSystem.musicGain.gain.value = AudioSystem.musicVolume;
      if (AudioSystem.masterGain) AudioSystem.masterGain.gain.value = AudioSystem.volume;
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) muteBtn.textContent = (s.sound !== false && s.music !== false) ? '🔊' : '🔇';
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
      sensitivity: el('set-sensitivity') ? parseFloat(el('set-sensitivity').value) : 1,
      fov: el('set-fov') ? parseFloat(el('set-fov').value) : 55
    });
    if (window.AudioSystem) {
      AudioSystem.setSoundEnabled(sound);
      AudioSystem.setMusicEnabled(music);
      AudioSystem.musicVolume = musicVolume;
      AudioSystem.volume = sfxVolume;
      if (AudioSystem.musicGain) AudioSystem.musicGain.gain.value = musicVolume;
      if (AudioSystem.masterGain) AudioSystem.masterGain.gain.value = sfxVolume;
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) muteBtn.textContent = (sound && music) ? '🔊' : '🔇';
    }
    this.applyGraphics();
    this.applyFov();
    if (this.player) this.player.lookSensitivity = el('set-sensitivity') ? parseFloat(el('set-sensitivity').value) : 1;
  },

  getFov() {
    const el = document.getElementById('set-fov');
    if (el && el.value) return Math.max(35, Math.min(70, parseFloat(el.value) || 48));
    const data = SaveSystem.load();
    const fov = data && data.settings && data.settings.fov;
    return Math.max(40, Math.min(75, fov != null ? Number(fov) : 55));
  },

  applyFov() {
    const fov = this.getFov();
    const label = document.getElementById('fov-label');
    if (label) label.textContent = Math.round(fov) + '°';
    if (!this.camera) return;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  },

  populateMap() {
    const data = SaveSystem.load();
    if (window.UI) UI.setWorldDisplay(data.currentLevel || SaveSystem.getContinueLevel());
    UI.populateMap(data, (levelId) => {
      this.startWorld(levelId);
    });
  },

  startIntro() {
    this.startWorld(1);
  },

  playContinue() {
    const data = SaveSystem.load();
    const allDone = (data.completedLevels || []).length >= (SaveSystem.MAX_LEVEL || 20);
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
    if (n < 1 || n > (SaveSystem.MAX_LEVEL || 20)) return;
    if (!SaveSystem.isUnlocked(n)) {
      if (window.UI) UI.showMessage('This world is locked. Complete earlier worlds first.', 2400);
      return;
    }
    this.currentWorld = n;
    if (window.UI) UI.setWorldDisplay(n);
    this.startLevel(n);
  },

  startLevel(id) {
    if (id) this.currentWorld = parseInt(id, 10) || 1;
    this.teardownLevel();
    this.state = 'playing';
    this.worldCompleteReady = false;
    this._victoryQueued = false;
    this._worldCompletionHandled = false;
    this._victoryScreenShown = false;
    UI.hideBibleMoment();
    this.hiddenPathFound = false;
    this.mountainPassCrossed = false;
    this.rockyWildernessCrossed = false;
    this.caveEscaped = false;
    this.outpostBroken = false;
    this.fortressReached = false;
    this.goliathTerritoryEntered = false;
    UI.showGame();
    if (window.UI) UI.setWorldDisplay(this.currentWorld);
    if (typeof THREE === 'undefined') {
      console.error('THREE.js is not defined');
      if (window.UI) UI.showMessage('3D engine failed to load. Refresh the page.', 6000);
      this.state = 'menu';
      UI.show('mainMenu');
      return;
    }
    try {
      this.initThree();
    } catch (err) {
      console.error('initThree failed', err);
      if (window.UI) UI.showMessage('Could not start the 3D world.', 6000);
      this.state = 'menu';
      UI.show('mainMenu');
      return;
    }
    this.missions = new MissionSystem(this.currentWorld);
    UI.setMission(this.missions.getCurrent().text);
    this.exploredCamp = false;
    this.enemiesDefeated = 0;
    this.goliathDefeated = false;
    this.itemsCollected = 0;
    this.sheepChecked = 0; this.rockMarkers = 0; this.torchesLit = 0;
    this.suppliesSecured = 0; this.bannersCaptured = 0; this.standardsSecured = 0;
    this.footprintsInspected = 0; this.gateOpened = false; this.mountainSummitReached = false;
    if (window.AudioSystem) {
      AudioSystem.unlock();
      AudioSystem.exploreMusic();
    }
    this.clock = new THREE.Clock();
    if (!this._loopRunning) this.loop();
  },

  teardownLevel() {
    cancelAnimationFrame(this.animFrame);
    if (this._finishTimer) {
      clearTimeout(this._finishTimer);
      this._finishTimer = null;
    }
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
    const w = Math.max(window.innerWidth || 800, 320);
    const h = Math.max(window.innerHeight || 600, 240);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.getFov(), w / h, 0.1, 250);
    this.camera.position.set(0, 2.4, 11);

    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: false,
        failIfMajorPerformanceCaveat: false
      });
      this.renderer.shadowMap.enabled = false;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, true);
    this.renderer.setClearColor(0x7ec8e8, 1);
    this.renderer.autoClear = true;
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '2';
    canvas.style.background = '#7ec8e8';

    this.world = new World(this.scene, this.currentWorld || 1);
    const theme = window.getWorldTheme ? window.getWorldTheme(this.currentWorld || 1) : {};
    const skyCol = (theme.sky != null) ? theme.sky : 0x7ec8e8;
    this.scene.background = new THREE.Color(skyCol);
    this.renderer.setClearColor(skyCol, 1);
    // Unlit sky shell + ground so the view cannot render as a black void
    const skyShell = new THREE.Mesh(
      new THREE.SphereGeometry(80, 16, 12),
      new THREE.MeshBasicMaterial({ color: skyCol, side: THREE.BackSide })
    );
    this.scene.add(skyShell);
    const visGround = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 160),
      new THREE.MeshBasicMaterial({ color: theme.ground || 0x4c8a46 })
    );
    visGround.rotation.x = -Math.PI / 2;
    visGround.position.y = 0.02;
    this.scene.add(visGround);
    this.player = new Player(this.scene, this.camera);
    this.player.updateCamera(true);
    this.player.enableSling();
    this.player.stones = Math.max(this.player.stones, 5);
    this.applyInventoryToPlayer();
    const data = SaveSystem.load();
    if (this.player && data.settings && data.settings.sensitivity) {
      this.player.lookSensitivity = data.settings.sensitivity;
    }
    this.combat = new CombatSystem(this.scene);

    this.enemies = [];
    this._worldTheme = theme;
    this._waveIndex = 0;
    this._spawningWave = false;
    // A level with exactly one wave is complete once that wave is cleared;
    // multi-wave levels remain incomplete until every wave has spawned and died.
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

    const box = document.getElementById('game-container');
    if (box) {
      box.classList.remove('hidden');
      box.style.display = 'block';
      box.style.visibility = 'visible';
      box.style.opacity = '1';
      box.style.zIndex = '5';
    }
    this.onResize();
    this.player.updateCamera(true);
    this.renderer.render(this.scene, this.camera);
  },

  followCamera() {
    if (!this.player || !this.camera) return;
    const pos = this.player.group ? this.player.group.position : this.player.getPosition();
    if (!pos) return;
    const height = Math.max(10, Math.min(26, this.player.cameraHeight || 16));
    const back = this.player.cameraBack != null ? this.player.cameraBack : 5.5;
    this.camera.position.set(pos.x, pos.y + height, pos.z + back);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(pos.x, pos.y + 0.3, pos.z);
  },

  onResize() {
    if (!this.camera || !this.renderer) return;
    const box = document.getElementById('game-container');
    const w = Math.max((box && box.clientWidth) || window.innerWidth || 800, 320);
    const h = Math.max((box && box.clientHeight) || window.innerHeight || 600, 240);
    this.camera.aspect = w / h;
    this.camera.fov = this.getFov();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, true);
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
        if (this._bossCamOrigin.height) this.player.cameraHeight = this._bossCamOrigin.height;
        this.player.cameraAngle = 0;
        // Keep current angle (player may have moved)
        this._bossCamTimer = null;
        this._bossCamOrigin = null;
      }
    }

    try {
      this.player.update(dt, this.world.bounds);
      this.world.update(dt);
    } catch (err) {
      console.error('update error', err);
    }
    this.followCamera();

    const playerPos = this.player.getPosition();

    // Exploration check: leave the starting camp/area by a meaningful distance.
    // This prevents the first mission from completing almost immediately.
    if (!this.exploredCamp) {
      const start = new THREE.Vector3(0, 0, 8);
      if (playerPos.distanceTo(start) >= 6) this.exploredCamp = true;
    }

    // Keep legacy flags for HUD/compatibility, but make them match the same
    // visible landmarks used by MissionSystem.
    if (this.currentWorld === 3 && playerPos.distanceTo(new THREE.Vector3(-15, 0, -22)) < 5) {
      this.hiddenPathFound = true;
    }
    if (this.currentWorld === 5 && playerPos.distanceTo(new THREE.Vector3(0, 0, -30)) < 4.5) {
      this.mountainPassCrossed = true;
    }
    if (this.currentWorld === 2 && playerPos.distanceTo(new THREE.Vector3(0, 0, -56)) < 7) this.rockyWildernessCrossed = true;
    if (this.currentWorld === 4 && playerPos.distanceTo(new THREE.Vector3(0, 0, -62)) < 7) this.caveEscaped = true;
    if (this.currentWorld === 6 && playerPos.distanceTo(new THREE.Vector3(0, 0, -22)) < 5) this.outpostBroken = true;
    if (this.currentWorld === 7 && playerPos.distanceTo(new THREE.Vector3(0, 0, -29)) < 6) this.fortressReached = true;
    if (this.currentWorld === 9 && playerPos.distanceTo(new THREE.Vector3(0, 0, -60)) < 6) this.goliathTerritoryEntered = true;

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

    // World-specific interactions make every world play differently.
    const unique = this.world.getNearbyInteractable(playerPos);
    if (unique) {
      // The prompt is intentionally lightweight; E/Interact performs the action.
      unique.beacon.material.opacity = 0.65 + Math.sin(Date.now() * 0.006) * 0.25;
    }

    // Checkpoints
    const cp = this.world.getNearbyCheckpoint(playerPos);
    if (cp && !cp.activated) {
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
    const unique = this.world.getNearbyInteractable(playerPos);
    if (unique) {
      this.activateUniqueInteraction(unique);
      return;
    }
    // Prayer location (campfire)
    if (this.world.campfire && playerPos.distanceTo(this.world.campfire.position) < 3) {
      this.player.addFaith(25);
      UI.showMessage('FAITH RESTORED! +25');
    }
  },

  activateUniqueInteraction(item) {
    if (!item || item.used) return;
    item.used = true;
    const t = item.type;
    if (t === 'sheep') this.sheepChecked++;
    else if (t === 'marker') this.rockMarkers++;
    else if (t === 'hiddenPath') this.hiddenPathFound = true;
    else if (t === 'torch') this.torchesLit++;
    else if (t === 'bridge') this.mountainPassCrossed = true;
    else if (t === 'summit') this.mountainSummitReached = true;
    else if (t === 'supply') this.suppliesSecured++;
    else if (t === 'banner') this.bannersCaptured++;
    else if (t === 'gateSwitch') this.gateOpened = true;
    else if (t === 'standard') this.standardsSecured++;
    else if (t === 'footprint') this.footprintsInspected++;
    else if (t === 'arena') { /* World 10 arena entry is handled by the mission proximity check. */ }
    if (item.group) {
      this.combat.spawnParticles(item.group.position, 0xf1c40f, 14);
      this.scene.remove(item.group);
    }
    if (window.AudioSystem) AudioSystem.collect();
    UI.showMessage(item.label + ' ✓', 1200);
    this.player.addScore(75);
    this.updateHUD();
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
    } else if (item.type === 'stick' || item.type === 'feather' || item.type === 'flint') {
      if (window.SaveSystem) SaveSystem.addMaterial(item.type, 1);
      const labels = { stick: '🪵 STICK', feather: '🪶 FEATHER', flint: '🪨 FLINT' };
      UI.showMessage((labels[item.type] || item.type.toUpperCase()) + ' FOR CRAFTING');
      this.applyInventoryToPlayer();
    }
    this.player.addScore(50);
    this.updateHUD();
  },

  fireSling() {
    if (!this.player) return;
    if (this.state === 'menu' || this.state === 'paused') return;
    this.player.hasSling = true;
    this.player.tryAttack();
  },

  spawnProjectile() {
    if (!this.player) return;
    this.player.hasSling = true;
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
    let extraDmg = 0;
    if (this.player.hasBow && (this.player.arrows || 0) > 0) {
      this.player.arrows -= 1;
      extraDmg = 18;
      if (window.SaveSystem) SaveSystem.setInventoryField('arrows', this.player.arrows);
    }
    if (this.combat && typeof this.combat.spawnStone === 'function') {
      this.combat.spawnStone(origin, targetDir, isFaith, extraDmg);
    }
    this.updateHUD();
  },

  spawnParticles(pos, color, count) {
    this.combat.spawnParticles(pos, color, count);
  },

  spawnShockwave(pos) {
    this.combat.spawnShockwave(pos);
  },

  trySpawnNextWave() {
    const theme = this._worldTheme;
    if (!theme || !Array.isArray(theme.waves) || theme.waves.length < 2) return;
    if (this._spawningWave) return;
    const living = this.enemies.some(e => e.alive);
    if (living) return;
    if (this._waveIndex >= theme.waves.length - 1) {
      this.wavesComplete = true;
      return;
    }
    this._spawningWave = true;
    this._waveIndex++;
    const next = theme.waves[this._waveIndex] || [];
    const stats = this._enemyStats || {};
    next.forEach((p, i) => {
      this.enemies.push(new ShadowGuardian(this.scene, new THREE.Vector3(p[0], p[1], p[2]), i % 3, stats));
    });
    this.wavesComplete = false;
    this._spawningWave = false;
    if (window.UI) UI.showMessage('WAVE ' + (this._waveIndex + 1) + '!', 1600);
    if (window.AudioSystem) AudioSystem.battleMusic();
  },

  spawnWorldBoss() {
    if (this.goliath) return;
    const id = this.currentWorld || 1;
    const spec = window.getWorldBoss ? window.getWorldBoss(id) : { name: 'World Boss', hp: 200 };
    const theme = window.getWorldTheme ? window.getWorldTheme(id) : {};
    const gp = theme.goliathPos || [0, 0, -55];
    this.goliath = new WorldBoss(this.scene, new THREE.Vector3(gp[0], gp[1], gp[2]), id);
    UI.showBoss(this.goliath.health, this.goliath.maxHealth);
    const title = document.querySelector('#boss-hud .boss-name');
    if (title) title.textContent = (spec.name || 'BOSS').toUpperCase();
    const sub = document.querySelector('#boss-hud .boss-subtitle');
    if (sub) sub.textContent = spec.title || 'WORLD BOSS';
    UI.showMessage((spec.name || 'BOSS') + ' APPEARS!', 2800);
    if (window.AudioSystem) {
      AudioSystem.goliathAppear();
      AudioSystem.battleMusic();
    }
  },

  addCoins(n) {
    const add = parseInt(n, 10) || 0;
    if (!add) return;
    if (this.player) this.player.coins = (this.player.coins || 0) + add;
    if (window.SaveSystem) SaveSystem.addCoins(add);
    this.updateHUD();
  },

  applyInventoryToPlayer() {
    if (!this.player || !window.SaveSystem) return;
    const inv = SaveSystem.getInventory();
    this.player.coins = inv.coins || 0;
    this.player.hasBow = !!inv.hasBow;
    this.player.arrows = inv.arrows || 0;
    this.player.sticks = inv.sticks || 0;
    this.player.feathers = inv.feathers || 0;
    this.player.flint = inv.flint || 0;
    this.player.shieldBonus = inv.shieldBonus || 0;
    this.player.maxArmor = 50 + (inv.armorUpgrades || 0) * 15;
    this.player.armor = Math.max(this.player.armor, Math.min(this.player.maxArmor, 30 + (inv.armorUpgrades || 0) * 10));
  },

  openShop() {
    if (window.UI) UI.renderShop(SaveSystem.getInventory());
    UI.show('shop');
  },

  buyShopItem(item) {
    const result = SaveSystem.buyItem(item);
    if (window.UI) {
      UI.showMessage(result.message, 1800);
      UI.renderShop(SaveSystem.getInventory());
    }
    if (this.player && result.ok) this.applyInventoryToPlayer();
    this.updateHUD();
  },

  craftArrows() {
    if (!window.SaveSystem) return;
    const result = SaveSystem.craftArrows();
    if (window.UI) {
      UI.showMessage(result.message, 2000);
      UI.renderShop(SaveSystem.getInventory());
    }
    if (result.ok) this.applyInventoryToPlayer();
    this.updateHUD();
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
        dist: this.player.cameraDistance,
        height: this.player.cameraHeight
      };
      this.player.cameraHeight = 22;
      this.player.cameraDistance = 22;
      this.player.cameraAngle = 0;
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
      if (worldId === 20 && this.goliathDefeated) {
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
    const nextId = result.nextLevel || (worldId < (SaveSystem.MAX_LEVEL || 20) ? worldId + 1 : null);
    const nextLv = nextId && window.LEVELS ? window.LEVELS[nextId - 1] : null;

    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('victory-title', 'WORLD ' + worldId + ' COMPLETE!');
    if (worldId >= (SaveSystem.MAX_LEVEL || 20)) {
      setTxt('victory-subtitle', 'THE BIBLE HEROES ADVENTURE IS COMPLETE!');
      setTxt('victory-reward', 'GIANT SLAYER!');
      setTxt('victory-badge', '🏅 GIANT SLAYER');
    } else {
      setTxt('victory-subtitle', 'NEXT WORLD: WORLD ' + (worldId + 1));
      setTxt('victory-reward', (lv.name || ('World ' + worldId)).toUpperCase());
      setTxt('victory-badge', '🏅 WORLD ' + worldId + ' CLEARED');
    }
    UI.populateVictoryBible(worldId);
    setTxt('victory-score', score);
    setTxt('victory-items', this.itemsCollected);
    setTxt('victory-enemies', this.enemiesDefeated);
    const starEl = document.getElementById('victory-stars');
    if (starEl) starEl.textContent = '⭐'.repeat(stars);
    const unlockEl = document.querySelector('#victory-screen .unlock');
    if (unlockEl) {
      unlockEl.textContent = worldId >= (SaveSystem.MAX_LEVEL || 20)
        ? 'THE BIBLE HEROES ADVENTURE IS COMPLETE!'
        : ('NEXT WORLD: WORLD ' + nextId + (nextLv ? ' — ' + nextLv.name.toUpperCase() : ''));
    }
    const nextBtn = document.getElementById('btn-next-world');
    if (nextBtn) {
      const showNext = worldId < (SaveSystem.MAX_LEVEL || 20) && nextId;
      nextBtn.classList.toggle('hidden', !showNext);
      if (showNext) nextBtn.textContent = 'PLAY WORLD ' + nextId;
    }
    const mapBtn = document.getElementById('btn-continue');
    if (mapBtn) mapBtn.textContent = 'RETURN TO ADVENTURE MAP';

    UI.show('victory');
  },

  continueNextWorld() {
    const completed = (this._pendingVictory && this._pendingVictory.worldId) || this.currentWorld || 1;
    const next = completed + 1;
    if (next <= (SaveSystem.MAX_LEVEL || 20) && SaveSystem.isUnlocked(next)) {
      this.startWorld(next);
      return;
    }
    this.quitToMenu();
    this.populateMap();
    UI.show('map');
  },

  updateHUD() {
    if (!this.player) return;
    UI.updateStats(
      this.player.life, this.player.maxLife,
      this.player.armor, this.player.maxArmor,
      this.player.faith, this.player.maxFaith,
      this.player.score
    );
    const coinsEl = document.getElementById('hud-coins');
    if (coinsEl) coinsEl.textContent = String(this.player.coins || 0);
    const ammoEl = document.getElementById('hud-ammo');
    if (ammoEl) {
      ammoEl.textContent = this.player.hasBow
        ? ('BOW ' + (this.player.arrows || 0))
        : ('SLING ' + (this.player.stones || 0));
    }
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
    if (window.UI) UI.setWorldDisplay(SaveSystem.getContinueLevel());
  }
};

window.Game = Game;

window.addEventListener('keydown', (e) => {
  if (e.key && e.key.toLowerCase() === 'b' && Game.state === 'playing') {
    if (UI.elements && UI.elements.biblePanel && !UI.elements.biblePanel.classList.contains('hidden')) UI.hideBibleMoment();
    else UI.showBibleMoment(Game.currentWorld);
  }
});

// Boot
window.addEventListener('DOMContentLoaded', () => {
  try {
    Game.init();
  } catch (err) {
    console.error('Game.init failed', err);
    const el = document.getElementById('boot-error');
    if (el) {
      el.textContent = 'Game failed to start: ' + (err && err.message ? err.message : err);
      el.classList.remove('hidden');
    }
  }
});
