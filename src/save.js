// Save System using localStorage
const SaveSystem = {
  KEY: 'pastorAbayomiBibleHeroes_v1',

  defaultData() {
    return {
      currentLevel: 1,
      unlockedLevels: [1],
      bestScores: { 1: 0 },
      stars: { 1: 0 },
      itemsFound: {},
      settings: {
        sound: true,
        music: true,
        musicVolume: 0.35,
        sfxVolume: 0.7,
        graphics: 'medium',
        sensitivity: 1
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
      totalScore: 0
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultData();
      const parsed = JSON.parse(raw);
      const def = this.defaultData();
      return {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        achievements: { ...def.achievements, ...(parsed.achievements || {}) },
        stats: { ...def.stats, ...(parsed.stats || {}) },
        bestScores: { ...def.bestScores, ...(parsed.bestScores || {}) },
        stars: { ...def.stars, ...(parsed.stars || {}) }
      };
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

  unlockLevel(level) {
    const n = parseInt(level, 10);
    if (!n || n < 1 || n > 10) return;
    const data = this.load();
    const unlocked = data.unlockedLevels || [1];
    if (unlocked.indexOf(n) !== -1) return;
    // Sequential only: next world after the highest already unlocked
    const maxUnlocked = unlocked.reduce((a, b) => Math.max(a, b), 1);
    if (n !== maxUnlocked + 1) return;
    unlocked.push(n);
    data.unlockedLevels = unlocked;
    this.save(data);
  },

  setBestScore(level, score) {
    const data = this.load();
    if (!data.bestScores[level] || score > data.bestScores[level]) {
      data.bestScores[level] = score;
      data.totalScore = Object.values(data.bestScores).reduce((a, b) => a + b, 0);
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

  bumpStat(key, amount = 1) {
    const data = this.load();
    data.stats[key] = (data.stats[key] || 0) + amount;
    this.save(data);
    this.checkAchievements(data);
  },

  checkAchievements(data) {
    data = data || this.load();
    const a = data.achievements;
    const s = data.stats;
    if (s.guardiansDefeated >= 5 && !a.guardianDefeater) {
      a.guardianDefeater = true;
    }
    if (s.faithShieldUses >= 3 && !a.shieldOfFaith) {
      a.shieldOfFaith = true;
    }
    if (s.criticalHits >= 1 && !a.bullseye) {
      a.bullseye = true;
    }
    if (s.levelsCompleted >= 1 && !a.firstVictory) {
      a.firstVictory = true;
    }
    if (s.levelsCompleted >= 1 && !a.adventureExplorer) {
      a.adventureExplorer = true;
    }
    if (data.unlockedLevels.length >= 10 && !a.bibleHeroMaster) {
      a.bibleHeroMaster = true;
    }
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
