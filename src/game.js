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
    document.getElementById('btn-play').addEventListener('click', () => this.startIntro());
    document.getElementById('btn-map').addEventListener('click', () => {
      this.populateMap();
      UI.show('map');
    });
    document.getElementById('btn-howto').addEventListener('click', () => UI.show('howto'));
    document.getElementById('btn-achievements').addEventListener('click', () => UI.show('achievements'));
    document.getElementById('btn-settings').addEventListener('click', () => UI.show('settings'));
    document.getElementById('btn-skip-intro').addEventListener('click', () => this.startLevel());
    document.getElementById('btn-resume').addEventListener('click', () => this.resume());
    document.getElementById('btn-restart').addEventListener('click', () => this.restartLevel());
    document.getElementById('btn-settings-pause').addEventListener('click', () => UI.show('settings'));
    document.getElementById('btn-quit').addEventListener('click', () => this.quitToMenu());
    document.getElementById('btn-continue').addEventListener('click', () => this.quitToMenu());
    document.getElementById('btn-howto-back').addEventListener('click', () => UI.show('mainMenu'));
    document.getElementById('btn-settings-back').addEventListener('click', () => {
      this.saveSettings();
      if (this.state === 'paused') UI.show('pause');
      else UI.show('mainMenu');
    });
    document.getElementById('btn-map-back').addEventListener('click', () => UI.show('mainMenu'));
    document.getElementById('btn-ach-back').addEventListener('click', () => UI.show('mainMenu'));
  },

  loadSettings() {
    const data = SaveSystem.load();
    const s = data.settings;
    document.getElementById('set-sound').checked = s.sound;
    document.getElementById('set-music').checked = s.music;
    document.getElementById('set-graphics').value = s.graphics;
    document.getElementById('set-sensitivity').value = s.sensitivity;
  },

  saveSettings() {
    SaveSystem.updateSettings({
      sound: document.getElementById('set-sound').checked,
      music: document.getElementById('set-music').checked,
      graphics: document.getElementById('set-graphics').value,
      sensitivity: parseFloat(document.getElementById('set-sensitivity').value)
    });
  },

  populateMap() {
    const data = SaveSystem.load();
    UI.populateMap(data.unlockedLevels);
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
    this.state = 'playing';
    UI.showGame();
    this.initThree();
    this.missions = new MissionSystem();
    UI.setMission(this.missions.getCurrent().text);
    this.exploredCamp = false;
    this.enemiesDefeated = 0;
    this.goliathDefeated = false;
    this.itemsCollected = 0;
    this.clock = new THREE.Clock();
    this.loop();
  },

  initThree() {
    const container = document.getElementById('game-container');
    const canvas = document.getElementById('game-canvas');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 5, 15);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.world = new World(this.scene);
    this.player = new Player(this.scene, this.camera);
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
    enemySpawns.forEach(pos => {
      this.enemies.push(new ShadowGuardian(this.scene, pos));
    });

    this.goliath = null;

    window.addEventListener('resize', () => this.onResize());
  },

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  loop() {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    this.animFrame = requestAnimationFrame(() => this.loop());
    if (this.state === 'paused') return;

    const dt = Math.min(this.clock.getDelta(), 0.05);

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
    UI.showMessage('GOLIATH APPEARS!');
    // Faith moment setup
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
    if (this.player.stones >= 5) SaveSystem.setAchievement('stoneCollector');

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
    this.clock.getDelta(); // reset delta
    this.loop();
  },

  restartLevel() {
    cancelAnimationFrame(this.animFrame);
    // Clean scene
    while (this.scene && this.scene.children.length) {
      this.scene.remove(this.scene.children[0]);
    }
    this.enemies = [];
    this.goliath = null;
    this.startLevel();
  },

  quitToMenu() {
    cancelAnimationFrame(this.animFrame);
    this.state = 'menu';
    if (this.scene) {
      while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    }
    UI.show('mainMenu');
    this.populateMap();
  }
};

window.Game = Game;

// Boot
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
