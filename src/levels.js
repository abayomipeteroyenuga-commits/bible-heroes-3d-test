
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

// 20 unique David vs Goliath adventure worlds
const WORLD_META = [
  { id: 1,  name: "Shepherd's Valley", icon: '🌿', achievement: 'valleyExplorer', sky: 0x87b8e0, fog: 0x87b8e0, ground: 0x5a8f4a, path: 0xb8956a, ambient: 0xfff5e0, sun: 0xffe8c0, dark: false, features: ['camp','trees','rocks','path'], landmark: 'hut' },
  { id: 2,  name: 'Rocky Wilderness', icon: '🪨', achievement: 'rockyWilderness', sky: 0xb8a090, fog: 0xb8a090, ground: 0x8a7a68, path: 0x6e5b48, ambient: 0xffe0c0, sun: 0xffcc88, dark: false, features: ['rocks','cliffs','path'], landmark: 'arch' },
  { id: 3,  name: 'Forest Valley', icon: '🌲', achievement: 'forestSurvivor', sky: 0x6ea06e, fog: 0x7aa87a, ground: 0x2f6b38, path: 0x6b4f32, ambient: 0xc8e0b8, sun: 0xdde8a0, dark: false, features: ['forest','stream','rocks','path'], landmark: 'shrine' },
  { id: 4,  name: 'Cave of Shadows', icon: '💎', achievement: 'caveExplorer', sky: 0x1a1428, fog: 0x2a2038, ground: 0x3a3344, path: 0x2a2430, ambient: 0x8866aa, sun: 0xaa88ff, dark: true, features: ['cave','crystals','torches','rocks'], landmark: 'crystal' },
  { id: 5,  name: 'Mountain Pass', icon: '⛰️', achievement: 'mountainClimber', sky: 0x9ec8e8, fog: 0xb0c8d8, ground: 0x7a8a78, path: 0x9a8a70, ambient: 0xe8f0ff, sun: 0xfff2d0, dark: false, features: ['mountains','bridge','cliffs','path'], landmark: 'bridge' },
  { id: 6,  name: 'Philistine Outpost', icon: '🏕️', achievement: 'outpostRaider', sky: 0xd4b48a, fog: 0xc8b090, ground: 0x8a7a50, path: 0x6a5a40, ambient: 0xffe8c8, sun: 0xffd080, dark: false, features: ['outpost','tents','towers','path'], landmark: 'tower' },
  { id: 7,  name: 'Fortified Valley', icon: '🏰', achievement: 'fortressBreaker', sky: 0x8aa0b8, fog: 0x90a0b0, ground: 0x6a7058, path: 0x8a7a60, ambient: 0xd8dce8, sun: 0xffe0b0, dark: false, features: ['walls','gates','towers','path'], landmark: 'gate' },
  { id: 8,  name: 'Great Battlefield', icon: '⚔️', achievement: 'battlefieldHero', sky: 0xc07050, fog: 0xb07050, ground: 0x6a6040, path: 0x8a7048, ambient: 0xffc8a0, sun: 0xffa060, dark: false, features: ['battlefield','banners','camps','path'], landmark: 'camp' },
  { id: 9,  name: 'Brook of Stones', icon: '💧', achievement: 'brookWalker', sky: 0x6eb8c8, fog: 0x7ab8c0, ground: 0x4a7a58, path: 0xc2b48a, ambient: 0xd0f0ff, sun: 0xfff0c8, dark: false, features: ['stream','bridge','rocks','path'], landmark: 'bridge' },
  { id: 10, name: "Israel's Camp", icon: '⛺', achievement: 'campScout', sky: 0xe8d2a8, fog: 0xd8c498, ground: 0x7a8a4a, path: 0xb89a68, ambient: 0xfff0d0, sun: 0xffd090, dark: false, features: ['camp','tents','path','rocks'], landmark: 'hut' },
  { id: 11, name: 'Valley of Elah', icon: '🌾', achievement: 'elahWalker', sky: 0xd8c060, fog: 0xc8b058, ground: 0x8a9a40, path: 0xc8b070, ambient: 0xfff4c8, sun: 0xffe080, dark: false, features: ['path','rocks','camp'], landmark: 'arch' },
  { id: 12, name: 'Philistine Ridge', icon: '🔺', achievement: 'ridgeRunner', sky: 0xc07048, fog: 0xb06040, ground: 0x8a5040, path: 0x6a4030, ambient: 0xffc8a0, sun: 0xff9040, dark: false, features: ['cliffs','rocks','path'], landmark: 'tower' },
  { id: 13, name: 'Whispering Pines', icon: '🌲', achievement: 'pineWalker', sky: 0x3a5a48, fog: 0x4a6a58, ground: 0x1a3a28, path: 0x4a3a28, ambient: 0x88aa88, sun: 0xaac080, dark: false, features: ['forest','trees','path','rocks'], landmark: 'shrine' },
  { id: 14, name: 'Sunbaked Dunes', icon: '🏜️', achievement: 'duneRunner', sky: 0xe8c070, fog: 0xd8b060, ground: 0xc8a050, path: 0xb89040, ambient: 0xffe8b0, sun: 0xffd060, dark: false, features: ['rocks','path','cliffs'], landmark: 'arch' },
  { id: 15, name: 'Storm Heights', icon: '🌩️', achievement: 'stormClimber', sky: 0x4a6080, fog: 0x5a7088, ground: 0x4a5a58, path: 0x6a6a68, ambient: 0xa0b8d0, sun: 0xc0d0e8, dark: false, features: ['mountains','cliffs','path'], landmark: 'bridge' },
  { id: 16, name: 'Iron Gate', icon: '🚪', achievement: 'ironBreaker', sky: 0x4a4a58, fog: 0x3a3a48, ground: 0x4a4a40, path: 0x3a3a38, ambient: 0x8890a0, sun: 0xb0b8c8, dark: false, features: ['walls','gates','towers','path'], landmark: 'gate' },
  { id: 17, name: 'Banner Plains', icon: '🚩', achievement: 'bannerKeeper', sky: 0xc05040, fog: 0xb04838, ground: 0x6a5040, path: 0x8a6048, ambient: 0xffb090, sun: 0xff8060, dark: false, features: ['battlefield','banners','path','camps'], landmark: 'camp' },
  { id: 18, name: 'Shadow Ravine', icon: '🌑', achievement: 'ravineWalker', sky: 0x201828, fog: 0x2a2030, ground: 0x2a2430, path: 0x1a1820, ambient: 0x665577, sun: 0x8866aa, dark: true, features: ['cave','cliffs','crystals','rocks'], landmark: 'crystal' },
  { id: 19, name: "Giant's Approach", icon: '👣', achievement: 'goliathTerritory', sky: 0x6a4038, fog: 0x5a3830, ground: 0x5a4030, path: 0x4a3028, ambient: 0xc09070, sun: 0xe07040, dark: false, features: ['territory','giantMarks','rocks','path','arena'], landmark: 'footprint' },
  { id: 20, name: 'Valley of the Giant', icon: '👑', achievement: 'giantSlayer', sky: 0x4a3060, fog: 0x503848, ground: 0x4a4030, path: 0x6a5040, ambient: 0xc8a0d0, sun: 0xff8060, dark: false, features: ['final','battlefield','banners','arena','mountains'], landmark: 'arena' }
];

const LEVELS = WORLD_META.map(w => ({ id: w.id, name: w.name, icon: w.icon, achievement: w.achievement }));

function layoutEnemies(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const ring = 10 + (i % 6) * 7;
    const a = (i * 2.2) + ring * 0.08;
    pts.push([
      Math.cos(a) * ring,
      0,
      -8 - Math.abs(Math.sin(a)) * ring - Math.floor(i / 6) * 6
    ]);
  }
  return pts;
}

const WORLD_THEMES = {};
WORLD_META.forEach(w => {
  const n = w.id;
  const count = 9 + n; // World 1 = 10, then +1 each world
  const pts = layoutEnemies(count);
  const theme = {
    sky: w.sky, fog: w.fog, ground: w.ground, path: w.path,
    ambient: w.ambient, sun: w.sun, dark: w.dark,
    features: w.features, landmark: w.landmark,
    objective: n === 20 ? 'Defeat the guards, then Goliath' : ('Defeat ' + count + ' Shadow Guardians'),
    collectibles: [[-14, 6], [14, -12], [-10, -28], [8, -44]],
    enemyCount: count,
    enemyHp: 18 + n * 3,
    enemyDmg: 4 + Math.floor(n / 4),
    enemySpd: 2.7 + n * 0.04,
    needEnemies: count,
    spawnGoliath: n === 20,
    goliathHp: n === 20 ? 480 : 0,
    goliathPos: [0, 0, -72]
  };
  if (count >= 16) {
    const waves = [];
    const size = 5;
    for (let i = 0; i < pts.length; i += size) waves.push(pts.slice(i, i + size));
    theme.waves = waves;
  } else {
    theme.spawns = pts;
  }
  WORLD_THEMES[n] = theme;
});

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
    const need = waves
      ? this.theme.waves.reduce((sum, wave) => sum + wave.length, 0)
      : (this.theme.needEnemies != null ? this.theme.needEnemies : (this.theme.spawns || []).length);
    const lv = (window.LEVELS || []).filter(l => l.id === id)[0];
    const doneName = ((lv && lv.name) ? lv.name : ('World ' + id)) + ' cleared!';
    const fightText = waves
      ? 'Defeat every enemy wave (' + need + ')'
      : 'Defeat the Shadow Guardians (' + need + ')';
    const fight = {
      id: 'enemies',
      text: fightText,
      check: g => g.enemiesDefeated >= need && (!waves || g.wavesComplete === true),
      onComplete: g => {
        const boss = window.getWorldBoss ? window.getWorldBoss(id) : { name: 'the World Boss' };
        UI.showMessage((id === 20 ? 'GOLIATH APPROACHES!' : (boss.name + ' APPEARS!')), 2200);
        if (id === 20) {
          if (g.spawnGoliath) g.spawnGoliath();
        } else if (g.spawnWorldBoss) {
          g.spawnWorldBoss();
        }
        this.next(g);
      }
    };
    return [
      fight,
      {
        id: 'boss',
        text: id === 20 ? 'Defeat Goliath' : ('Defeat ' + ((window.getWorldBoss && getWorldBoss(id).name) || 'the World Boss')),
        check: g => !!g.goliathDefeated,
        onComplete: g => this.finishWorld(g, id === 20 ? 'GIANT SLAYER!' : doneName)
      }
    ];
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

const WORLD_BOSSES = {
  1:  { name: 'Wolf of the Valley', title: 'VALLEY BOSS', color: 0x6b4a2a, accent: 0xc4a06a, hp: 160, dmg: 8, scale: 1.9 },
  2:  { name: 'Stone Warden', title: 'ROCK BOSS', color: 0x7a6a5a, accent: 0xd0c0a0, hp: 180, dmg: 8, scale: 2.0 },
  3:  { name: 'Forest Stalker', title: 'FOREST BOSS', color: 0x2a5a32, accent: 0x7cba4a, hp: 200, dmg: 9, scale: 2.0 },
  4:  { name: 'Cave Horror', title: 'CAVE BOSS', color: 0x3a2458, accent: 0xaa66ff, hp: 220, dmg: 9, scale: 2.1 },
  5:  { name: 'Mountain Champion', title: 'MOUNTAIN BOSS', color: 0x5a6a78, accent: 0xc0d8e8, hp: 240, dmg: 10, scale: 2.1 },
  6:  { name: 'Outpost Captain', title: 'OUTPOST BOSS', color: 0x8a5a28, accent: 0xe0a040, hp: 260, dmg: 10, scale: 2.15 },
  7:  { name: 'Gate Keeper', title: 'FORTRESS BOSS', color: 0x4a5060, accent: 0x90a0b8, hp: 280, dmg: 11, scale: 2.2 },
  8:  { name: 'War Banner Lord', title: 'BATTLE BOSS', color: 0x8a3020, accent: 0xff7040, hp: 300, dmg: 11, scale: 2.2 },
  9:  { name: 'Brook Champion', title: 'BROOK BOSS', color: 0x2a6a78, accent: 0x70d0e0, hp: 320, dmg: 12, scale: 2.25 },
  10: { name: "Camp Champion", title: 'CAMP BOSS', color: 0x7a6a30, accent: 0xe8d060, hp: 340, dmg: 12, scale: 2.25 },
  11: { name: 'Elah Champion', title: 'ELAH BOSS', color: 0x8a7a20, accent: 0xf0d040, hp: 360, dmg: 13, scale: 2.3 },
  12: { name: 'Ridge Captain', title: 'RIDGE BOSS', color: 0x8a3a28, accent: 0xff8050, hp: 380, dmg: 13, scale: 2.3 },
  13: { name: 'Pine Warden', title: 'PINE BOSS', color: 0x1a3a28, accent: 0x5aaa50, hp: 400, dmg: 14, scale: 2.35 },
  14: { name: 'Dune Raider', title: 'DUNE BOSS', color: 0xc09040, accent: 0xffe080, hp: 420, dmg: 14, scale: 2.35 },
  15: { name: 'Storm Champion', title: 'STORM BOSS', color: 0x3a4a70, accent: 0x80b0e0, hp: 440, dmg: 15, scale: 2.4 },
  16: { name: 'Iron Captain', title: 'IRON BOSS', color: 0x3a3a48, accent: 0xa0a8b8, hp: 460, dmg: 15, scale: 2.4 },
  17: { name: 'Banner Warlord', title: 'BANNER BOSS', color: 0xa02820, accent: 0xff6050, hp: 480, dmg: 16, scale: 2.45 },
  18: { name: 'Ravine Horror', title: 'RAVINE BOSS', color: 0x201828, accent: 0x8866aa, hp: 500, dmg: 16, scale: 2.5 },
  19: { name: "Giant's Herald", title: 'HERALD BOSS', color: 0x5a3028, accent: 0xe06030, hp: 560, dmg: 17, scale: 2.7 },
  20: { name: 'Goliath', title: 'THE PHILISTINE GIANT', color: 0x5a6a7a, accent: 0xb8956a, hp: 480, dmg: 18, scale: 3.4 }
};

function getWorldBoss(id) {
  const n = parseInt(id, 10) || 1;
  return WORLD_BOSSES[n] || WORLD_BOSSES[1];
}

window.BIBLE_WORLD_DATA = BIBLE_WORLD_DATA;
window.getBibleWorldData = getBibleWorldData;
window.LEVELS = LEVELS;
window.WORLD_THEMES = WORLD_THEMES;
window.getLevel = getLevel;
window.getWorldTheme = getWorldTheme;
window.enemySpawnsFor = enemySpawnsFor;
window.MissionSystem = MissionSystem;
window.WORLD_BOSSES = WORLD_BOSSES;
window.getWorldBoss = getWorldBoss;
