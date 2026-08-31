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
        graphics: 'medium',
        sensitivity: 1
      },
      achievements: {
        davidTheBrave: false,
        stoneCollector: false,
        protector: false,
        faithful: false
      },
      totalScore: 0
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultData();
      const data = JSON.parse(raw);
      return { ...this.defaultData(), ...data };
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
    const data = this.load();
    if (!data.unlockedLevels.includes(level)) {
      data.unlockedLevels.push(level);
      this.save(data);
    }
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
    data.achievements[key] = true;
    this.save(data);
  }
};

window.SaveSystem = SaveSystem;
