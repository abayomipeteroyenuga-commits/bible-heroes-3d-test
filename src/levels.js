// 10 David vs Goliath adventure worlds
const LEVELS = [
  { id: 1, name: "Shepherd's Valley", icon: '🌿', achievement: 'valleyExplorer' },
  { id: 2, name: 'Rocky Wilderness', icon: '🪨', achievement: 'rockyWilderness' },
  { id: 3, name: 'Forest Valley', icon: '🌲', achievement: 'forestSurvivor' },
  { id: 4, name: 'Cave of Shadows', icon: '💎', achievement: 'caveExplorer' },
  { id: 5, name: 'Mountain Pass', icon: '⛰️', achievement: 'mountainClimber' },
  { id: 6, name: 'Philistine Outpost', icon: '🏕️', achievement: 'outpostRaider' },
  { id: 7, name: 'Fortified Valley', icon: '🏰', achievement: 'fortressBreaker' },
  { id: 8, name: 'Great Battlefield', icon: '⚔️', achievement: 'battlefieldHero' },
  { id: 9, name: "Goliath's Territory", icon: '👣', achievement: 'goliathTerritory' },
  { id: 10, name: 'The Final Battle', icon: '👑', achievement: 'giantSlayer' }
];

const WORLD_THEMES = {
  1: {
    sky: 0x87b8e0, fog: 0x87b8e0, ground: 0x5a8f4a, path: 0xb8956a,
    ambient: 0xfff5e0, sun: 0xffe8c0, dark: false,
    features: ['camp', 'trees', 'rocks', 'path', 'arena'],
    objective: 'Learn and survive — prepare for Goliath',
    landmark: 'hut',
    spawns: [[-6,0,-8],[7,0,-15],[-5,0,-28],[8,0,-32],[0,0,-40]],
    collectibles: [[-7,8],[9,2],[-12,6],[6,-18],[-10,-30]],
    enemyCount: 5, enemyHp: 30, enemyDmg: 5, enemySpd: 3.2,
    needEnemies: 5, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  2: {
    sky: 0xb8a090, fog: 0xb8a090, ground: 0x8a7a68, path: 0x6e5b48,
    ambient: 0xffe0c0, sun: 0xffcc88, dark: false,
    features: ['rocks', 'cliffs', 'caves', 'path'],
    objective: 'Cross the Rocky Wilderness',
    landmark: 'arch',
    spawns: [[-12,0,-6],[12,0,-14],[-8,0,-26],[10,0,-34],[0,0,-46],[14,0,-50]],
    collectibles: [[-14,-10],[14,-22],[-16,-40],[8,-54]],
    enemyCount: 6, enemyHp: 36, enemyDmg: 6, enemySpd: 3.3,
    needEnemies: 6, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  3: {
    sky: 0x6ea06e, fog: 0x7aa87a, ground: 0x2f6b38, path: 0x6b4f32,
    ambient: 0xc8e0b8, sun: 0xdde8a0, dark: false,
    features: ['forest', 'stream', 'rocks', 'path'],
    objective: 'Find the Hidden Path',
    landmark: 'shrine',
    spawns: [[-14,0,-12],[14,0,-18],[-10,0,-30],[12,0,-38],[-6,0,-48],[8,0,-56],[0,0,-24]],
    collectibles: [[-16,-16],[16,-28],[-18,-44],[4,-60]],
    enemyCount: 7, enemyHp: 40, enemyDmg: 6, enemySpd: 3.4,
    needEnemies: 6, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  4: {
    sky: 0x1a1428, fog: 0x2a2038, ground: 0x3a3344, path: 0x2a2430,
    ambient: 0x8866aa, sun: 0xaa88ff, dark: true,
    features: ['cave', 'crystals', 'torches', 'rocks'],
    objective: 'Escape the Cave of Shadows',
    landmark: 'crystal',
    spawns: [[-8,0,-10],[8,0,-16],[-12,0,-28],[10,0,-36],[0,0,-44],[-6,0,-52],[6,0,-60]],
    collectibles: [[-10,-14],[12,-32],[-14,-50],[0,-62]],
    enemyCount: 7, enemyHp: 44, enemyDmg: 7, enemySpd: 3.3,
    needEnemies: 6, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  5: {
    sky: 0x9ec8e8, fog: 0xb0c8d8, ground: 0x7a8a78, path: 0x9a8a70,
    ambient: 0xe8f0ff, sun: 0xfff2d0, dark: false,
    features: ['mountains', 'bridge', 'cliffs', 'path'],
    objective: 'Cross the Mountain Pass',
    landmark: 'bridge',
    spawns: [[-10,0,-8],[10,0,-16],[0,0,-28],[-12,0,-36],[12,0,-44],[-6,0,-52],[6,0,-58],[0,0,-64]],
    collectibles: [[-12,-12],[12,-30],[-8,-48],[8,-62]],
    enemyCount: 8, enemyHp: 48, enemyDmg: 7, enemySpd: 3.5,
    needEnemies: 7, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  6: {
    sky: 0xd4b48a, fog: 0xc8b090, ground: 0x8a7a50, path: 0x6a5a40,
    ambient: 0xffe8c8, sun: 0xffd080, dark: false,
    features: ['outpost', 'tents', 'towers', 'path'],
    objective: 'Break Through the Outpost',
    landmark: 'tower',
    spawns: [[-14,0,-10],[14,0,-10],[-10,0,-24],[10,0,-24],[0,0,-34],[-8,0,-46],[8,0,-46],[0,0,-58]],
    collectibles: [[-16,-6],[16,-20],[-12,-40],[10,-56]],
    enemyCount: 8, enemyHp: 52, enemyDmg: 8, enemySpd: 3.5,
    needEnemies: 7, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -70]
  },
  7: {
    sky: 0x8aa0b8, fog: 0x90a0b0, ground: 0x6a7058, path: 0x8a7a60,
    ambient: 0xd8dce8, sun: 0xffe0b0, dark: false,
    features: ['walls', 'gates', 'towers', 'path', 'arena'],
    objective: 'Reach the Fortress',
    landmark: 'gate',
    spawns: [[-16,0,-8],[16,0,-8],[-12,0,-20],[12,0,-20],[0,0,-28],[-10,0,-40],[10,0,-40],[0,0,-50],[6,0,-58]],
    collectibles: [[-18,-12],[18,-26],[-8,-44],[8,-60]],
    enemyCount: 9, enemyHp: 56, enemyDmg: 8, enemySpd: 3.6,
    needEnemies: 7, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -68]
  },
  8: {
    sky: 0xc07050, fog: 0xb07050, ground: 0x6a6040, path: 0x8a7048,
    ambient: 0xffc8a0, sun: 0xffa060, dark: false,
    features: ['battlefield', 'banners', 'camps', 'path', 'arena'],
    objective: 'Survive the Battlefield',
    landmark: 'camp',
    waves: [
      [[-8,0,-12],[8,0,-12]],
      [[-12,0,-24],[0,0,-24],[12,0,-24]],
      [[-10,0,-38],[10,0,-38]],
      [[-14,0,-48],[0,0,-50],[14,0,-48]],
      [[-8,0,-58],[8,0,-58],[0,0,-62]]
    ],
    collectibles: [[-16,-16],[16,-32],[-12,-52],[12,-64]],
    enemyCount: 13, enemyHp: 60, enemyDmg: 9, enemySpd: 3.6,
    needEnemies: 13, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -72]
  },
  9: {
    sky: 0x6a5048, fog: 0x6a4840, ground: 0x5a4a40, path: 0x4a3a30,
    ambient: 0xc8a090, sun: 0xe09060, dark: false,
    features: ['territory', 'giantMarks', 'rocks', 'path', 'arena'],
    objective: "Enter Goliath's Territory",
    landmark: 'footprint',
    spawns: [[-16,0,-10],[16,0,-14],[-8,0,-26],[10,0,-32],[0,0,-40],[-14,0,-48],[14,0,-52],[-6,0,-60],[6,0,-64],[0,0,-36]],
    collectibles: [[-18,-18],[18,-28],[-10,-54],[8,-66]],
    enemyCount: 10, enemyHp: 68, enemyDmg: 10, enemySpd: 3.7,
    needEnemies: 8, spawnGoliath: false, goliathHp: 0,
    goliathPos: [0, 0, -74]
  },
  10: {
    sky: 0x4a3060, fog: 0x503848, ground: 0x4a4030, path: 0x6a5040,
    ambient: 0xc8a0d0, sun: 0xff8060, dark: false,
    features: ['final', 'battlefield', 'banners', 'arena', 'mountains'],
    objective: 'Defeat Goliath',
    landmark: 'arena',
    waves: [
      [[-10,0,-10],[10,0,-10]],
      [[-14,0,-24],[0,0,-22],[14,0,-24]],
      [[-12,0,-40],[12,0,-40],[0,0,-44]],
      [[-8,0,-56],[8,0,-56]]
    ],
    collectibles: [[-16,-8],[16,-26],[-14,-46],[10,-62]],
    enemyCount: 10, enemyHp: 75, enemyDmg: 10, enemySpd: 3.8,
    needEnemies: 10, spawnGoliath: true, goliathHp: 1600,
    goliathPos: [0, 0, -75]
  }
};

function getWorldTheme(id) {
  return WORLD_THEMES[id] || WORLD_THEMES[1];
}

function enemySpawnsFor(worldId) {
  const theme = getWorldTheme(worldId);
  if (theme.waves && theme.waves.length) {
    return theme.waves[0].map(p => ({ x: p[0], y: p[1], z: p[2] }));
  }
  const list = theme.spawns || [[-6,0,-8],[7,0,-15],[-5,0,-28],[8,0,-32],[0,0,-40]];
  return list.map(p => ({ x: p[0], y: p[1], z: p[2] }));
}

class MissionSystem {
  constructor(worldId) {
    this.worldId = worldId || 1;
    this.theme = getWorldTheme(this.worldId);
    this.current = 0;
    this.missions = this.buildMissions();
  }

  buildMissions() {
    const id = this.worldId;
    const need = this.theme.needEnemies;
    const obj = this.theme.objective || 'Complete the world';
    const waves = !!(this.theme.waves && this.theme.waves.length);
    const goliath = !!this.theme.spawnGoliath;

    const explore = {
      id: 'explore',
      text: obj,
      check: (g) => g.exploredCamp,
      onComplete: (g) => { UI.showMessage('Keep going!'); this.next(g); }
    };
    const fight = {
      id: 'enemies',
      text: waves ? 'Survive every enemy wave' : ('Defeat the Shadow Guardians (' + need + ')'),
      check: (g) => g.enemiesDefeated >= need && g.wavesComplete !== false,
      onComplete: (g) => { UI.showMessage('Guardians fall!'); this.next(g); }
    };

    if (id === 1) {
      return [explore, fight, {
        id: 'goal', text: "Reach the valley's far end",
        check: (g) => g.player.getPosition().z < -48,
        onComplete: (g) => this.finishWorld(g, "Shepherd's Valley is cleared!")
      }];
    }
    if (id === 2) {
      return [explore, fight, {
        id: 'goal', text: 'Reach the wilderness exit',
        check: (g) => !!g.rockyWildernessCrossed,
        onComplete: (g) => this.finishWorld(g, 'Rocky Wilderness crossed!')
      }];
    }
    if (id === 3) {
      return [explore, {
        id: 'path', text: 'Find the Hidden Path (west grove)',
        check: (g) => !!g.hiddenPathFound,
        onComplete: (g) => { UI.showMessage('Hidden path found!'); this.next(g); }
      }, fight, {
        id: 'goal', text: 'Reach the forest shrine',
        check: (g) => g.player.getPosition().distanceTo(new THREE.Vector3(-15, 0, -22)) < 5,
        onComplete: (g) => this.finishWorld(g, 'The hidden path is yours!')
      }];
    }
    if (id === 4) {
      return [explore, fight, {
        id: 'goal', text: 'Reach the cave exit',
        check: (g) => !!g.caveEscaped,
        onComplete: (g) => this.finishWorld(g, 'You escaped the Cave of Shadows!')
      }];
    }
    if (id === 5) {
      return [explore, {
        id: 'bridge', text: 'Cross the mountain bridge',
        check: (g) => !!g.mountainPassCrossed,
        onComplete: (g) => { UI.showMessage('Bridge crossed!'); this.next(g); }
      }, fight, {
        id: 'goal', text: 'Reach the mountain exit',
        check: (g) => g.player.getPosition().z < -58,
        onComplete: (g) => this.finishWorld(g, 'Mountain Pass cleared!')
      }];
    }
    if (id === 6) {
      return [explore, fight, {
        id: 'goal', text: 'Reach the outpost gate',
        check: (g) => !!g.outpostBroken,
        onComplete: (g) => this.finishWorld(g, 'Outpost broken!')
      }];
    }
    if (id === 7) {
      return [explore, fight, {
        id: 'goal', text: 'Enter the fortress courtyard',
        check: (g) => !!g.fortressReached,
        onComplete: (g) => this.finishWorld(g, 'Fortress reached!')
      }];
    }
    if (id === 8) {
      return [explore, fight, {
        id: 'goal', text: 'Hold the battlefield after the last wave',
        check: (g) => g.wavesComplete === true && g.enemiesDefeated >= need,
        onComplete: (g) => this.finishWorld(g, 'Battlefield survived!')
      }];
    }
    if (id === 9) {
      return [explore, fight, {
        id: 'goal', text: "Reach Goliath's landmark",
        check: (g) => !!g.goliathTerritoryEntered,
        onComplete: (g) => this.finishWorld(g, 'THE GIANT IS NEAR...')
      }];
    }
    // World 10
    return [explore, fight, {
      id: 'arena', text: 'Reach the final arena',
      check: (g) => g.player.getPosition().z < -58,
      onComplete: (g) => {
        UI.showMessage('WARNING — A GREAT ENEMY APPROACHES...');
        g.spawnGoliath();
        this.next(g);
      }
    }, {
      id: 'goliath', text: 'Defeat Goliath',
      check: (g) => g.goliathDefeated,
      onComplete: () => {}
    }];
  }

  finishWorld(game, msg) {
    UI.showMessage(msg, 2200);
    if (!game._victoryQueued) {
      game._victoryQueued = true;
      setTimeout(() => game.showVictory(), 900);
    }
  }

  getCurrent() {
    return this.missions[this.current] || this.missions[this.missions.length - 1];
  }

  update(game) {
    const m = this.getCurrent();
    if (m && m.check(game) && !m.completed) {
      m.completed = true;
      m.onComplete(game);
    }
  }

  next(game) {
    this.current = Math.min(this.current + 1, this.missions.length - 1);
    UI.setMission(this.getCurrent().text);
  }

  reset() {
    this.current = 0;
    this.missions.forEach(m => { m.completed = false; });
  }
}

window.LEVELS = LEVELS;
window.WORLD_THEMES = WORLD_THEMES;
window.getWorldTheme = getWorldTheme;
window.enemySpawnsFor = enemySpawnsFor;
window.MissionSystem = MissionSystem;
