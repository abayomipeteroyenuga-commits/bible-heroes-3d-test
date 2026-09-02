// Save System using localStorage
const SaveSystem = {
  KEY: 'pastorAbayomiBibleHeroes_v1',
  MAX_LEVEL: 40,

  defaultData() {
    return {
      currentLevel: 1,
      highestUnlockedLevel: 1,
      unlockedLevels: [1],
      completedLevels: [],
      bestScores: {},
      stars: {},
      itemsFound: {},
      settings: {
        sound: true,
        music: true,
        musicVolume: 0.35,
        sfxVolume: 0.7,
        graphics: 'medium',
        sensitivity: 1,
        fov: 55
      },
      achievements: {
        davidTheBrave: false,
        firstVictory: false,
        bullseye: false,
        shieldOfFaith: false,
        guardianDefeater: false,
        bossConqueror: false,
        adventureExplorer: false,
        bibleHeroMaster: false,
        guardianHunter: false,
        eliteHunter: false,
        braveWarrior: false,
        champion: false,
        explorer: false,
        bibleScholar: false,
        bossSlayer: false,
        davidsChampion: false,
        goliathSlayer: false,
        valleyExplorer: false,
        rockyWilderness: false,
        forestSurvivor: false,
        caveExplorer: false,
        mountainClimber: false,
        outpostRaider: false,
        fortressBreaker: false,
        battlefieldHero: false,
        goliathTerritory: false,
        giantSlayer: false
      },
      stats: {
        guardiansDefeated: 0,
        bossesDefeated: 0,
        faithShieldUses: 0,
        criticalHits: 0,
        levelsCompleted: 0,
        scrollsCollected: 0,
        secretsDiscovered: 0,
        eliteDefeated: 0,
        quizzesCompleted: 0
      },
      gems: 0,
      totalXP: 0,
      claimedRewards: {},
      badges: {},
      totalScore: 0,
      inventory: {
        coins: 0,
        armorUpgrades: 0,
        shieldBonus: 0,
        hasBow: false,
        arrows: 0,
        equippedWeapon: 'sling',
        ownedWeapons: ['sling'],
        weaponLevels: {},
        sticks: 0,
        feathers: 0,
        flint: 0
      }
    };
  },

  _cleanList(arr) {
    const out = [];
    (arr || []).forEach(n => {
      const v = parseInt(n, 10);
      if (v >= 1 && v <= this.MAX_LEVEL && out.indexOf(v) === -1) out.push(v);
    });
    out.sort((a, b) => a - b);
    return out;
  },

  normalize(raw) {
    const def = this.defaultData();
    const data = {
      ...def,
      ...(raw || {}),
      settings: { ...def.settings, ...((raw && raw.settings) || {}) },
      achievements: { ...def.achievements, ...((raw && raw.achievements) || {}) },
      stats: { ...def.stats, ...((raw && raw.stats) || {}) },
      inventory: { ...def.inventory, ...((raw && raw.inventory) || {}) },
      bestScores: { ...((raw && raw.bestScores) || {}) },
      stars: { ...((raw && raw.stars) || {}) },
      claimedRewards: { ...((raw && raw.claimedRewards) || {}) },
      badges: { ...((raw && raw.badges) || {}) }
    };
    data.gems = Math.max(0, parseInt(data.gems, 10) || 0);
    data.totalXP = Math.max(0, parseInt(data.totalXP, 10) || 0);

    // Harden inventory data from older/corrupt saves.
    const inv = data.inventory || def.inventory;
    inv.ownedWeapons = Array.from(new Set(Array.isArray(inv.ownedWeapons) ? inv.ownedWeapons.filter(Boolean) : ['sling']));
    if (inv.ownedWeapons.indexOf('sling') === -1) inv.ownedWeapons.unshift('sling');
    inv.weaponLevels = (inv.weaponLevels && typeof inv.weaponLevels === 'object' && !Array.isArray(inv.weaponLevels)) ? inv.weaponLevels : {};
    inv.equippedWeapon = inv.ownedWeapons.indexOf(inv.equippedWeapon) !== -1 ? inv.equippedWeapon : 'sling';
    inv.coins = Math.max(0, parseInt(inv.coins, 10) || 0);
    inv.arrows = Math.max(0, parseInt(inv.arrows, 10) || 0);
    data.inventory = inv;

    data.unlockedLevels = this._cleanList(data.unlockedLevels);
    if (data.unlockedLevels.indexOf(1) === -1) data.unlockedLevels.unshift(1);

    let completed = this._cleanList(data.completedLevels);
    // Migrate old saves: stars > 0 means that world was completed
    Object.keys(data.stars || {}).forEach(k => {
      const id = parseInt(k, 10);
      const s = parseInt(data.stars[k], 10) || 0;
      if (id >= 1 && id <= this.MAX_LEVEL && s > 0 && completed.indexOf(id) === -1) completed.push(id);
    });
    data.completedLevels = this._cleanList(completed);

    data.highestUnlockedLevel = data.unlockedLevels.reduce((a, b) => Math.max(a, b), 1);
    if (data.stats.levelsCompleted < data.completedLevels.length) {
      data.stats.levelsCompleted = data.completedLevels.length;
    }

    data.currentLevel = this._computeCurrentLevel(data);
    data.totalScore = Object.values(data.bestScores || {}).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
    return data;
  },

  _computeCurrentLevel(data) {
    const unlocked = data.unlockedLevels || [1];
    const completed = data.completedLevels || [];
    for (let i = 0; i < unlocked.length; i++) {
      if (completed.indexOf(unlocked[i]) === -1) return unlocked[i];
    }
    return Math.min(this.MAX_LEVEL, data.highestUnlockedLevel || 1);
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultData();
      const data = this.normalize(JSON.parse(raw));
      this.save(data);
      return data;
    } catch (e) {
      return this.defaultData();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  },

  isUnlocked(level) {
    const n = parseInt(level, 10);
    return this.load().unlockedLevels.indexOf(n) !== -1;
  },

  isCompleted(level) {
    const n = parseInt(level, 10);
    return this.load().completedLevels.indexOf(n) !== -1;
  },

  getInventory() {
    const data = this.load();
    return data.inventory || this.defaultData().inventory;
  },

  setInventoryField(key, value) {
    const data = this.load();
    data.inventory = data.inventory || this.defaultData().inventory;
    data.inventory[key] = value;
    this.save(data);
  },

  addCoins(n) {
    const data = this.load();
    data.inventory = data.inventory || this.defaultData().inventory;
    data.inventory.coins = Math.max(0, (data.inventory.coins || 0) + (parseInt(n, 10) || 0));
    this.save(data);
    return data.inventory.coins;
  },

  buyItem(item) {
    const data = this.load();
    const inv = data.inventory || this.defaultData().inventory;
    data.inventory = inv;
    const prices = { armor: 40, shield: 35, bow: 80, arrows: 20, bronzeSword: 120, hunterBow: 180, flameSling: 220, faithBlade: 350 };
    const weaponNames = { bronzeSword: 'Bronze Sword', hunterBow: 'Hunter Bow', flameSling: 'Flame Sling', faithBlade: 'Faith Blade' };
    const price = prices[item];
    if (!price) return { ok: false, message: 'Unknown item' };
    if (item === 'bow' && inv.hasBow) return { ok: false, message: 'You already own the bow' };
    if (weaponNames[item] && (inv.ownedWeapons || ['sling']).indexOf(item) !== -1) return { ok: false, message: 'You already own the ' + weaponNames[item] };
    if (weaponNames[item] && item !== 'bronzeSword' && item !== 'hunterBow' && item !== 'flameSling' && item !== 'faithBlade') return { ok: false, message: 'Unknown weapon' };
    if ((inv.coins || 0) < price) return { ok: false, message: 'Not enough coins' };
    inv.coins -= price;
    if (item === 'armor') inv.armorUpgrades = (inv.armorUpgrades || 0) + 1;
    if (item === 'shield') inv.shieldBonus = Math.min(4, (inv.shieldBonus || 0) + 1);
    if (item === 'bow') {
      inv.hasBow = true;
      inv.arrows = (inv.arrows || 0) + 8;
    }
    if (item === 'arrows') inv.arrows = (inv.arrows || 0) + 10;
    if (weaponNames[item]) {
      inv.ownedWeapons = Array.isArray(inv.ownedWeapons) ? inv.ownedWeapons : ['sling'];
      inv.ownedWeapons.push(item);
      inv.equippedWeapon = item;
      inv.weaponLevels[item] = Math.max(1, inv.weaponLevels[item] || 0);
    }
    this.save(data);
    const labels = {
      armor: 'Armor upgraded!',
      shield: 'Faith shield strengthened!',
      bow: 'Bow unlocked!',
      arrows: '+10 arrows',
      bronzeSword: 'Bronze Sword purchased!',
      hunterBow: 'Hunter Bow purchased!',
      flameSling: 'Flame Sling purchased!',
      faithBlade: 'Faith Blade purchased!'
    };
    return { ok: true, message: labels[item] || 'Purchased', inventory: inv };
  },

  equipWeapon(item) {
    const data = this.load();
    const inv = data.inventory || this.defaultData().inventory;
    const owned = Array.isArray(inv.ownedWeapons) ? inv.ownedWeapons : ['sling'];
    if (owned.indexOf(item) === -1) return { ok: false, message: 'Weapon not owned' };
    inv.equippedWeapon = item;
    data.inventory = inv;
    this.save(data);
    return { ok: true, inventory: inv, message: 'Equipped ' + item };
  },

  addMaterial(kind, amount) {
    const data = this.load();
    data.inventory = data.inventory || this.defaultData().inventory;
    const key = kind === 'stick' ? 'sticks' : kind === 'feather' ? 'feathers' : kind === 'flint' ? 'flint' : null;
    if (!key) return data.inventory;
    data.inventory[key] = Math.max(0, (data.inventory[key] || 0) + (parseInt(amount, 10) || 1));
    this.save(data);
    return data.inventory;
  },

  craftArrows() {
    const data = this.load();
    const inv = data.inventory || this.defaultData().inventory;
    data.inventory = inv;
    const sticks = inv.sticks || 0;
    const feathers = inv.feathers || 0;
    const flint = inv.flint || 0;
    const batches = Math.min(sticks, feathers, flint);
    if (batches < 1) {
      return {
        ok: false,
        message: 'Need 1 stick, 1 feather and 1 flint',
        inventory: inv
      };
    }
    inv.sticks = sticks - batches;
    inv.feathers = feathers - batches;
    inv.flint = flint - batches;
    inv.arrows = (inv.arrows || 0) + batches * 3;
    this.save(data);
    return {
      ok: true,
      message: 'Crafted ' + (batches * 3) + ' arrows!',
      crafted: batches * 3,
      inventory: inv
    };
  },

  getContinueLevel() {
    const data = this.load();
    return data.currentLevel || 1;
  },

  unlockLevel(level) {
    const n = parseInt(level, 10);
    if (!n || n < 1 || n > this.MAX_LEVEL) return false;
    const data = this.load();
    if (data.unlockedLevels.indexOf(n) !== -1) return true;
    const maxUnlocked = data.unlockedLevels.reduce((a, b) => Math.max(a, b), 1);
    if (n !== maxUnlocked + 1) return false;
    data.unlockedLevels.push(n);
    data.unlockedLevels = this._cleanList(data.unlockedLevels);
    data.highestUnlockedLevel = data.unlockedLevels.reduce((a, b) => Math.max(a, b), 1);
    data.currentLevel = this._computeCurrentLevel(data);
    this.save(data);
    return true;
  },

  completeLevel(level, score, stars) {
    const n = parseInt(level, 10);
    const result = { success: false, newlyCompleted: false, nextLevel: null, currentLevel: 1 };
    if (!n || n < 1 || n > this.MAX_LEVEL) return result;

    const data = this.load();
    const newly = data.completedLevels.indexOf(n) === -1;
    if (newly) {
      data.completedLevels.push(n);
      data.completedLevels = this._cleanList(data.completedLevels);
      data.stats.levelsCompleted = data.completedLevels.length;
    }

    const sc = parseInt(score, 10) || 0;
    const st = Math.max(1, Math.min(3, parseInt(stars, 10) || 1));
    if (!data.bestScores[n] || sc > data.bestScores[n]) data.bestScores[n] = sc;
    if (!data.stars[n] || st > data.stars[n]) data.stars[n] = st;
    data.totalScore = Object.values(data.bestScores).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);

    if (n < this.MAX_LEVEL) {
      const next = n + 1;
      if (data.unlockedLevels.indexOf(next) === -1) data.unlockedLevels.push(next);
      data.unlockedLevels = this._cleanList(data.unlockedLevels);
    }

    data.highestUnlockedLevel = data.unlockedLevels.reduce((a, b) => Math.max(a, b), 1);
    data.currentLevel = this._computeCurrentLevel(data);

    if (data.completedLevels.length >= 1) data.achievements.firstVictory = true;
    if (data.completedLevels.indexOf(1) !== -1) {
      data.achievements.adventureExplorer = true;
      data.achievements.valleyExplorer = true;
    }
    if (data.completedLevels.indexOf(this.MAX_LEVEL) !== -1) {
      data.achievements.bibleHeroMaster = true;
    }

    this.save(data);
    result.success = true;
    result.newlyCompleted = newly;
    result.nextLevel = n < this.MAX_LEVEL ? n + 1 : null;
    result.currentLevel = data.currentLevel;
    return result;
  },

  setBestScore(level, score) {
    const data = this.load();
    if (!data.bestScores[level] || score > data.bestScores[level]) {
      data.bestScores[level] = score;
      data.totalScore = Object.values(data.bestScores).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
      this.save(data);
    }
  },

  setStars(level, stars) {
    const data = this.load();
    if (!data.stars[level] || stars > data.stars[level]) {
      data.stars[level] = stars;
      this.save(data);
    }
  },

  updateSettings(settings) {
    const data = this.load();
    data.settings = { ...data.settings, ...settings };
    this.save(data);
  },

  setAchievement(key) {
    const data = this.load();
    if (!data.achievements[key]) {
      data.achievements[key] = true;
      this.save(data);
      if (window.RewardSystem) RewardSystem.onAchievement(key);
      return true;
    }
    return false;
  },

  hasAchievement(key) {
    return !!this.load().achievements[key];
  },

  bumpStat(key, amount) {
    amount = amount == null ? 1 : amount;
    const data = this.load();
    data.stats[key] = (data.stats[key] || 0) + amount;
    this.save(data);
    this.checkAchievements(data);
  },

  checkAchievements(data) {
    data = data || this.load();
    const s = data.stats || {};
    const completed = data.completedLevels || [];
    if (s.guardiansDefeated >= 1) this.setAchievement('firstVictory');
    if (s.guardiansDefeated >= 5) this.setAchievement('guardianDefeater');
    if (s.guardiansDefeated >= 100) this.setAchievement('guardianHunter');
    if ((s.eliteDefeated || 0) >= 25) this.setAchievement('eliteHunter');
    if (s.faithShieldUses >= 3) this.setAchievement('shieldOfFaith');
    if (s.criticalHits >= 1) this.setAchievement('bullseye');
    if (completed.length >= 1) this.setAchievement('firstVictory');
    if (completed.length >= 5) this.setAchievement('braveWarrior');
    if (completed.length >= 10) this.setAchievement('champion');
    if (completed.indexOf(1) !== -1) this.setAchievement('adventureExplorer');
    if (completed.indexOf(20) !== -1) this.setAchievement('davidsChampion');
    if (completed.indexOf(40) !== -1) this.setAchievement('goliathSlayer');
    if ((s.bossesDefeated || 0) >= 1) this.setAchievement('bossConqueror');
    if ((s.bossesDefeated || 0) >= 10) this.setAchievement('bossSlayer');
    if ((s.secretsDiscovered || 0) >= 10) this.setAchievement('explorer');
    if ((s.quizzesCompleted || 0) >= 10) this.setAchievement('bibleScholar');
    if ((s.scrollsCollected || 0) >= 10) this.setAchievement('bibleScholar');
  },

  resetProgress() {
    const settings = this.load().settings;
    const fresh = this.defaultData();
    fresh.settings = settings;
    this.save(fresh);
  }
};

window.SaveSystem = SaveSystem;

const RewardSystem = {
  VALUES: {
    guardian: { xp: 25, gems: 5 },
    elite: { xp: 50, gems: 10 },
    heavy: { xp: 75, gems: 15 },
    commander: { xp: 100, gems: 20 },
    boss: { xp: 500, gems: 100 },
    goliath: { xp: 2000, gems: 500 },
    objective: { xp: 100, gems: 20 },
    majorObjective: { xp: 200, gems: 40 },
    scroll: { xp: 50, gems: 10 },
    secret: { xp: 100, gems: 50 },
    world: { xp: 500, gems: 100 },
    perfect: { xp: 250, gems: 50 }
  },
  ACHIEVEMENTS: {
    firstVictory: { title: 'First Victory', desc: 'Defeat your first Guardian.', icon: '🏆', xp: 100, gems: 25, badge: 'Guardian Hunter' },
    guardianHunter: { title: 'Guardian Hunter', desc: 'Defeat 100 Guardians.', icon: '⚔', xp: 500, gems: 100, badge: 'Guardian Hunter' },
    eliteHunter: { title: 'Elite Hunter', desc: 'Defeat 25 Elite Guardians.', icon: '🛡', xp: 750, gems: 150, badge: 'Elite Hunter' },
    braveWarrior: { title: 'Brave Warrior', desc: 'Complete 5 worlds.', icon: '🎖', xp: 500, gems: 100, badge: 'Brave Warrior' },
    champion: { title: 'Champion', desc: 'Complete 10 worlds.', icon: '🏅', xp: 1000, gems: 250, badge: 'Champion' },
    explorer: { title: 'Explorer', desc: 'Discover 10 secret areas.', icon: '🔎', xp: 500, gems: 150, badge: 'Explorer' },
    bibleScholar: { title: 'Bible Scholar', desc: 'Collect 10 Bible scrolls.', icon: '📜', xp: 750, gems: 200, badge: 'Bible Scholar' },
    bossSlayer: { title: 'Boss Slayer', desc: 'Defeat 10 bosses.', icon: '⚔', xp: 1000, gems: 250, badge: 'Boss Slayer' },
    davidsChampion: { title: "David's Champion", desc: 'Complete World 20.', icon: '🌟', xp: 2000, gems: 500, badge: "David's Champion" },
    goliathSlayer: { title: 'Goliath Slayer', desc: 'Defeat Goliath in World 40.', icon: '🗿', xp: 5000, gems: 1000, badge: 'Goliath Slayer' },
    guardianDefeater: { title: 'Guardian Defeater', desc: 'Defeat 5 Guardians.', icon: '⚔', xp: 100, gems: 20 },
    bossConqueror: { title: 'Boss Conqueror', desc: 'Defeat a world boss.', icon: '🏆', xp: 250, gems: 50 }
  },

  claimed(id) {
    const data = SaveSystem.load();
    return !!(data.claimedRewards && data.claimedRewards[id]);
  },

  grant(id, xp, gems, toast) {
    if (!id || this.claimed(id)) return false;
    const data = SaveSystem.load();
    data.claimedRewards = data.claimedRewards || {};
    data.claimedRewards[id] = true;
    data.gems = (data.gems || 0) + (gems || 0);
    data.totalXP = (data.totalXP || 0) + (xp || 0);
    data.totalScore = (data.totalScore || 0) + (xp || 0);
    SaveSystem.save(data);
    if (window.Game && window.Game.player && xp) window.Game.player.addScore(xp);
    if (window.UI) {
      if (UI.updateGems) UI.updateGems(data.gems);
      if (toast && UI.showRewardToast) UI.showRewardToast(toast);
    }
    if (window.Game && window.Game.updateHUD) window.Game.updateHUD();
    return true;
  },

  onGuardian(kind, uniqueId) {
    const key = kind === 'commander' || kind === 'heavy' || kind === 'elite' ? kind : 'guardian';
    const v = this.VALUES[key];
    const id = uniqueId || ('guardian-' + Date.now() + '-' + Math.random().toFixed(4));
    this.grant(id, v.xp, v.gems, '+' + v.xp + ' XP   💎 +' + v.gems);
    if (key !== 'guardian') SaveSystem.bumpStat('eliteDefeated', 1);
    SaveSystem.checkAchievements();
  },

  onBoss(isGoliath, worldId) {
    const v = isGoliath ? this.VALUES.goliath : this.VALUES.boss;
    const id = isGoliath ? 'boss-goliath-40' : ('boss-world-' + (worldId || 0));
    const title = isGoliath ? '🏆 GOLIATH DEFEATED!' : '🏆 BOSS DEFEATED!';
    this.grant(id, v.xp, v.gems, title + '  +' + v.xp + ' XP  💎 +' + v.gems);
    SaveSystem.checkAchievements();
  },

  onScroll(worldId, index) {
    const id = 'scroll-w' + worldId + '-' + index;
    const v = this.VALUES.scroll;
    if (this.grant(id, v.xp, v.gems, '📜 BIBLE SCROLL FOUND!  +' + v.xp + ' XP  💎 +' + v.gems)) {
      SaveSystem.bumpStat('scrollsCollected', 1);
    }
  },

  onSecret(worldId, key) {
    const id = 'secret-w' + worldId + '-' + key;
    const v = this.VALUES.secret;
    if (this.grant(id, v.xp, v.gems, '🔎 SECRET DISCOVERED!  +' + v.xp + ' XP  💎 +' + v.gems)) {
      SaveSystem.bumpStat('secretsDiscovered', 1);
    }
  },

  onObjective(worldId, objId, major) {
    const v = major ? this.VALUES.majorObjective : this.VALUES.objective;
    this.grant('obj-w' + worldId + '-' + objId, v.xp, v.gems, '+' + v.xp + ' XP   💎 +' + v.gems);
  },

  onWorldComplete(worldId, stars) {
    const v = this.VALUES.world;
    const id = 'world-complete-' + worldId;
    this.grant(id, v.xp, v.gems, '⭐ WORLD COMPLETE  +' + v.xp + ' XP  💎 +' + v.gems);
    if (stars >= 3) {
      const p = this.VALUES.perfect;
      this.grant('world-perfect-' + worldId, p.xp, p.gems, '🌟 PERFECT MISSION!  +' + p.xp + ' XP  💎 +' + p.gems);
    }
    SaveSystem.checkAchievements();
  },

  onAchievement(key) {
    const def = this.ACHIEVEMENTS[key];
    if (!def) return;
    const id = 'achievement-' + key;
    const ok = this.grant(id, def.xp || 0, def.gems || 0, '🏆 ACHIEVEMENT UNLOCKED!  ' + def.title + '  +' + (def.xp || 0) + ' XP  💎 +' + (def.gems || 0));
    if (ok && def.badge) {
      const data = SaveSystem.load();
      data.badges = data.badges || {};
      data.badges[key] = def.badge;
      SaveSystem.save(data);
    }
    if (window.AudioSystem && AudioSystem.levelComplete) AudioSystem.levelComplete();
  },

  summary() {
    const d = SaveSystem.load();
    const ach = d.achievements || {};
    const unlocked = Object.keys(this.ACHIEVEMENTS).filter(k => ach[k]).length;
    const totalA = Object.keys(this.ACHIEVEMENTS).length;
    const badges = Object.keys(d.badges || {}).length;
    return {
      gems: d.gems || 0,
      xp: d.totalXP || 0,
      worlds: (d.completedLevels || []).length,
      maxWorlds: SaveSystem.MAX_LEVEL,
      achievements: unlocked,
      maxAchievements: totalA,
      badges: badges,
      maxBadges: totalA
    };
  }
};

window.RewardSystem = RewardSystem;
