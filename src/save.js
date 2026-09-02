// Save System using localStorage
const SaveSystem = {
  KEY: 'pastorAbayomiBibleHeroes_v1',
  MAX_LEVEL: 20,

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
        faithShieldUses: 0,
        criticalHits: 0,
        levelsCompleted: 0
      },
      totalScore: 0,
      inventory: {
        coins: 0,
        armorUpgrades: 0,
        shieldBonus: 0,
        hasBow: false,
        arrows: 0,
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
      stars: { ...((raw && raw.stars) || {}) }
    };

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
    const prices = { armor: 40, shield: 35, bow: 80, arrows: 20 };
    const price = prices[item];
    if (!price) return { ok: false, message: 'Unknown item' };
    if (item === 'bow' && inv.hasBow) return { ok: false, message: 'You already own the bow' };
    if ((inv.coins || 0) < price) return { ok: false, message: 'Not enough coins' };
    inv.coins -= price;
    if (item === 'armor') inv.armorUpgrades = (inv.armorUpgrades || 0) + 1;
    if (item === 'shield') inv.shieldBonus = Math.min(4, (inv.shieldBonus || 0) + 1);
    if (item === 'bow') {
      inv.hasBow = true;
      inv.arrows = (inv.arrows || 0) + 8;
    }
    if (item === 'arrows') inv.arrows = (inv.arrows || 0) + 10;
    this.save(data);
    const labels = {
      armor: 'Armor upgraded!',
      shield: 'Faith shield strengthened!',
      bow: 'Bow unlocked!',
      arrows: '+10 arrows'
    };
    return { ok: true, message: labels[item] || 'Purchased', inventory: inv };
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
    const a = data.achievements;
    const s = data.stats;
    const completed = data.completedLevels || [];
    if (s.guardiansDefeated >= 5) a.guardianDefeater = true;
    if (s.faithShieldUses >= 3) a.shieldOfFaith = true;
    if (s.criticalHits >= 1) a.bullseye = true;
    if (completed.length >= 1) a.firstVictory = true;
    if (completed.indexOf(1) !== -1) a.adventureExplorer = true;
    if (completed.indexOf(10) !== -1) a.bibleHeroMaster = true;
    this.save(data);
  },

  resetProgress() {
    const settings = this.load().settings;
    const fresh = this.defaultData();
    fresh.settings = settings;
    this.save(fresh);
  }
};

window.SaveSystem = SaveSystem;
