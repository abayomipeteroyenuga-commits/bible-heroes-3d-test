
// Bible-story layer: each world is anchored to a specific moment from 1 Samuel 17.
const BIBLE_WORLD_DATA = {
  1: {
    event: 'David the Shepherd', passage: '1 Samuel 17:12–15',
    story: 'David was the youngest son in his family and cared for his father’s sheep. He was learning courage and faithfulness in ordinary work.',
    verse: '“The LORD is my shepherd; I shall not want.” — Psalm 23:1',
    lesson: 'God can prepare you through small responsibilities before a big assignment.',
    prayer: 'Lord, help me be faithful in the little things and trust You every day. Amen.'
  },
  2: {
    event: 'David Is Sent to His Brothers', passage: '1 Samuel 17:17–20',
    story: 'Jesse sent David to take food to his brothers at the army camp. David obeyed and went where he was needed.',
    verse: '“Obey my voice, and I will be your God.” — Jeremiah 7:23',
    lesson: 'Obedience can place us exactly where God wants us to learn and serve.',
    prayer: 'Father, give me a willing heart to obey and serve others with joy. Amen.'
  },
  3: {
    event: 'David Hears Goliath', passage: '1 Samuel 17:23–26',
    story: 'David heard Goliath challenge the army of Israel. While many soldiers were afraid, David wondered why anyone should defy the living God.',
    verse: '“Who is this uncircumcised Philistine, that he should defy the armies of the living God?” — 1 Samuel 17:26',
    lesson: 'Faith helps us see God as greater than the problem in front of us.',
    prayer: 'God, when I face something frightening, help me remember that You are greater. Amen.'
  },
  4: {
    event: 'David Chooses Faith', passage: '1 Samuel 17:32–37',
    story: 'David told Saul that God had rescued him from a lion and a bear. He believed the same God could rescue him from Goliath.',
    verse: '“The LORD that delivered me out of the paw of the lion... he will deliver me.” — 1 Samuel 17:37',
    lesson: 'Remembering God’s past faithfulness gives courage for today’s challenge.',
    prayer: 'Lord, remind me of the ways You have helped me before, and strengthen my faith today. Amen.'
  },
  5: {
    event: 'David Refuses Saul’s Armor', passage: '1 Samuel 17:38–39',
    story: 'Saul offered David his armor, but David had not tested it. He chose what he could use confidently and prepared to face Goliath.',
    verse: '“I cannot go with these; for I have not proved them.” — 1 Samuel 17:39',
    lesson: 'Do not copy someone else’s method. Use the gifts and preparation God has given you.',
    prayer: 'Lord, help me use my gifts wisely and not compare myself with others. Amen.'
  },
  6: {
    event: 'Five Smooth Stones', passage: '1 Samuel 17:40',
    story: 'David took his staff, sling, and five smooth stones from the brook. He prepared carefully before stepping toward the giant.',
    verse: '“And he took his staff in his hand, and chose him five smooth stones.” — 1 Samuel 17:40',
    lesson: 'Faith does not cancel preparation. Trust God and do your part carefully.',
    prayer: 'Father, teach me to prepare well while trusting You with the result. Amen.'
  },
  7: {
    event: 'Goliath Challenges David', passage: '1 Samuel 17:41–44',
    story: 'Goliath mocked David because he looked young and small. David did not measure his future by Goliath’s opinion.',
    verse: '“And when the Philistine looked about, and saw David, he disdained him.” — 1 Samuel 17:42',
    lesson: 'People may underestimate you, but their opinion does not determine what God can do through you.',
    prayer: 'Lord, keep me humble and courageous when others doubt me. Amen.'
  },
  8: {
    event: 'David Declares His Faith', passage: '1 Samuel 17:45–47',
    story: 'David told Goliath that he came in the name of the LORD. He wanted everyone to know that victory belongs to God.',
    verse: '“The battle is the LORD’s.” — 1 Samuel 17:47',
    lesson: 'Our confidence should point people to God, not to ourselves.',
    prayer: 'God, let my courage and victories bring honor to You. Amen.'
  },
  9: {
    event: 'David Faces the Giant', passage: '1 Samuel 17:48–49',
    story: 'David ran toward the battle line, took a stone from his bag, and used his sling. He acted with courage instead of running away.',
    verse: '“David hasted, and ran toward the army to meet the Philistine.” — 1 Samuel 17:48',
    lesson: 'Faith can move us from fear to courageous action.',
    prayer: 'Lord, help me face my challenges with wisdom, courage, and trust in You. Amen.'
  },
  10: {
    event: 'Goliath Falls', passage: '1 Samuel 17:50–51',
    story: 'David defeated Goliath with a sling and a stone. Israel saw that God can give victory through someone the world might overlook.',
    verse: '“So David prevailed over the Philistine with a sling and with a stone.” — 1 Samuel 17:50',
    lesson: 'God is able to work through ordinary people who trust Him and step forward in faith.',
    prayer: 'Lord, make me brave, faithful, and ready to trust You when challenges seem too big. Amen.'
  }
};

function getBibleWorldData(id) {
  const n = parseInt(id, 10) || 1;
  return BIBLE_WORLD_DATA[n] || BIBLE_WORLD_DATA[1];
}

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

function getLevel(worldId) {
  const n = parseInt(worldId, 10) || 1;
  if (window.LEVELS) {
    for (let i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === n) return LEVELS[i];
    }
  }
  return LEVELS[0];
}

function getWorldTheme(id) {
  const n = parseInt(id, 10) || 1;
  return WORLD_THEMES[n] || WORLD_THEMES[1];
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

  // Keep level objectives tied to visible landmarks/areas rather than fragile
  // one-dimensional coordinate checks. This makes objectives work even when
  // the player approaches from a different direction.
  nearPoint(game, x, z, radius = 5) {
    if (!game || !game.player) return false;
    const p = game.player.getPosition();
    return Math.hypot(p.x - x, p.z - z) <= radius;
  }

  buildMissions() {
    const id = this.worldId;
    const waves = Array.isArray(this.theme.waves) && this.theme.waves.length > 0;
    const need = waves ? this.theme.waves.reduce((sum, wave) => sum + wave.length, 0)
      : (this.theme.needEnemies != null ? this.theme.needEnemies : (this.theme.spawns || []).length);
    const explore = {
      id: 'explore', text: this.theme.introObjective || 'Explore the area',
      check: g => !!g.exploredCamp,
      onComplete: g => { UI.showMessage('Area explored!'); this.next(g); }
    };
    const fight = {
      id: 'enemies', text: waves ? 'Survive every enemy wave' : ('Defeat the Shadow Guardians (' + need + ')'),
      check: g => g.enemiesDefeated >= need && (!waves || g.wavesComplete === true),
      onComplete: g => { UI.showMessage('Guardians defeated!'); this.next(g); }
    };
    const useCount = (flag, count, text, doneText) => ({
      id: flag, text,
      check: g => (g[flag] || 0) >= count,
      onComplete: g => { UI.showMessage(doneText); this.next(g); }
    });
    if (id === 1) return [explore, { id:'sheep', text:'Check on the 3 sheep', check:g=>g.sheepChecked>=3, onComplete:g=>{UI.showMessage('The flock is safe!');this.next(g);} }, fight, { id:'goal', text:"Reach the valley's far end", check:g=>this.nearPoint(g,0,-52,6), onComplete:g=>this.finishWorld(g,"Shepherd's Valley is cleared!") }];
    if (id === 2) return [explore, { id:'markers', text:'Find 3 safe paths through the rocks', check:g=>g.rockMarkers>=3, onComplete:g=>{UI.showMessage('You found the safe rocky route!');this.next(g);} }, fight, { id:'goal', text:'Reach the wilderness arch', check:g=>this.nearPoint(g,0,-56,8), onComplete:g=>this.finishWorld(g,'Rocky Wilderness crossed!') }];
    if (id === 3) return [explore, { id:'path', text:'Reveal the Hidden Path', check:g=>!!g.hiddenPathFound, onComplete:g=>{UI.showMessage('A hidden path is revealed!');this.next(g);} }, fight, { id:'goal', text:'Reach the forest shrine', check:g=>this.nearPoint(g,-15,-22,5), onComplete:g=>this.finishWorld(g,'The hidden path is yours!') }];
    if (id === 4) return [explore, { id:'torches', text:'Light all 4 cave torches', check:g=>g.torchesLit>=4, onComplete:g=>{UI.showMessage('The cave path is lit!');this.next(g);} }, fight, { id:'goal', text:'Escape through the crystal exit', check:g=>this.nearPoint(g,0,-62,7), onComplete:g=>this.finishWorld(g,'You escaped the Cave of Shadows!') }];
    if (id === 5) return [explore, { id:'bridge', text:'Cross the mountain bridge', check:g=>!!g.mountainPassCrossed, onComplete:g=>{UI.showMessage('Bridge crossed! Keep climbing.');this.next(g);} }, fight, { id:'goal', text:'Reach the mountain summit', check:g=>this.nearPoint(g,0,-62,7), onComplete:g=>this.finishWorld(g,'Mountain Pass cleared!') }];
    if (id === 6) return [explore, { id:'supplies', text:'Secure 4 supply crates', check:g=>g.suppliesSecured>=4, onComplete:g=>{UI.showMessage('The outpost supplies are secured!');this.next(g);} }, fight, { id:'goal', text:'Reach the outpost gate', check:g=>this.nearPoint(g,0,-22,5), onComplete:g=>this.finishWorld(g,'Outpost broken!') }];
    if (id === 7) return [explore, { id:'banners', text:'Capture the 4 fortress banners', check:g=>g.bannersCaptured>=4, onComplete:g=>{UI.showMessage('All fortress banners captured!');this.next(g);} }, fight, { id:'gate', text:'Open the fortress gate', check:g=>!!g.gateOpened, onComplete:g=>{UI.showMessage('The fortress gate is open!');this.next(g);} }, { id:'goal', text:'Enter the fortress courtyard', check:g=>this.nearPoint(g,0,-29,6), onComplete:g=>this.finishWorld(g,'Fortress reached!') }];
    if (id === 8) return [explore, { id:'standards', text:'Secure 5 battlefield standards', check:g=>g.standardsSecured>=5, onComplete:g=>{UI.showMessage('The battlefield is secured!');this.next(g);} }, fight, { id:'goal', text:'Hold the final battlefield', check:g=>g.wavesComplete===true&&g.enemiesDefeated>=need&&this.nearPoint(g,0,-58,9), onComplete:g=>this.finishWorld(g,'Battlefield survived!') }];
    if (id === 9) return [explore, { id:'footprints', text:'Follow 5 giant footprints', check:g=>g.footprintsInspected>=5, onComplete:g=>{UI.showMessage('You have found the giant\'s trail!');this.next(g);} }, fight, { id:'goal', text:"Reach Goliath's landmark", check:g=>this.nearPoint(g,0,-60,7), onComplete:g=>this.finishWorld(g,'THE GIANT IS NEAR...') }];
    return [explore, fight, { id:'arena', text:'Enter the final arena', check:g=>this.nearPoint(g,0,-70,12), onComplete:g=>{UI.showMessage('WARNING — A GREAT ENEMY APPROACHES...');g.spawnGoliath();this.next(g);} }, { id:'goliath', text:'Defeat Goliath', check:g=>!!g.goliathDefeated, onComplete:g=>this.finishWorld(g,'GIANT SLAYER!') }];
  }

  finishWorld(game, msg) {
    if (game._victoryQueued || game._worldCompletionHandled) return;
    game._victoryQueued = true;
    const worldId = game.currentWorld;
    if (window.UI && msg) UI.showMessage(msg, 2200);
    // Store the timer so restarting/leaving a level cannot accidentally
    // complete the old level 900ms later.
    if (game._finishTimer) clearTimeout(game._finishTimer);
    game._finishTimer = setTimeout(() => {
      game._finishTimer = null;
      if (game.state !== 'playing' || game.currentWorld !== worldId) return;
      if (game.completeCurrentWorld) game.completeCurrentWorld();
    }, 900);
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

window.BIBLE_WORLD_DATA = BIBLE_WORLD_DATA;
window.getBibleWorldData = getBibleWorldData;
window.LEVELS = LEVELS;
window.WORLD_THEMES = WORLD_THEMES;
window.getLevel = getLevel;
window.getWorldTheme = getWorldTheme;
window.enemySpawnsFor = enemySpawnsFor;
window.MissionSystem = MissionSystem;
