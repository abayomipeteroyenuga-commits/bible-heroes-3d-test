// UI Manager
const UI = {
  elements: {},
  messageTimeout: null,

  ACHIEVEMENTS: [
    { key: 'firstVictory', icon: '⭐', title: 'First Victory', desc: 'Complete any world' },
    { key: 'shieldOfFaith', icon: '⚡', title: 'Faithful Warrior', desc: 'Use Faith Shield 3 times' },
    { key: 'valleyExplorer', icon: '🌿', title: "Shepherd's Beginning", desc: 'Complete World 1' },
    { key: 'rockyWilderness', icon: '🪨', title: 'Rocky Survivor', desc: 'Complete World 2' },
    { key: 'forestSurvivor', icon: '🌲', title: 'Forest Explorer', desc: 'Complete World 3' },
    { key: 'caveExplorer', icon: '💎', title: 'Cave Escaper', desc: 'Complete World 4' },
    { key: 'mountainClimber', icon: '⛰️', title: 'Mountain Climber', desc: 'Complete World 5' },
    { key: 'outpostRaider', icon: '🏕️', title: 'Outpost Breaker', desc: 'Complete World 6' },
    { key: 'fortressBreaker', icon: '🏰', title: 'Fortress Challenger', desc: 'Complete World 7' },
    { key: 'battlefieldHero', icon: '⚔️', title: 'Battlefield Hero', desc: 'Complete World 8' },
    { key: 'goliathTerritory', icon: '👣', title: "Goliath's Territory", desc: 'Complete World 9' },
    { key: 'giantSlayer', icon: '👑', title: 'Giant Slayer', desc: 'Defeat Goliath in World 10' }
  ],

  init() {
    this.elements = {
      loading: document.getElementById('loading-screen'),
      mainMenu: document.getElementById('main-menu'),
      intro: document.getElementById('intro-screen'),
      game: document.getElementById('game-container'),
      pause: document.getElementById('pause-menu'),
      victory: document.getElementById('victory-screen'),
      howto: document.getElementById('howto-screen'),
      settings: document.getElementById('settings-screen'),
      map: document.getElementById('map-screen'),
      achievements: document.getElementById('achievements-screen'),
      credits: document.getElementById('credits-screen'),
      confirmReset: document.getElementById('confirm-reset'),
      confirmQuit: document.getElementById('confirm-quit'),
      lifeBar: document.getElementById('life-bar'),
      armorBar: document.getElementById('armor-bar'),
      faithBar: document.getElementById('faith-bar'),
      lifeText: document.getElementById('life-text'),
      armorText: document.getElementById('armor-text'),
      faithText: document.getElementById('faith-text'),
      scoreText: document.getElementById('score-text'),
      hudWorld: document.getElementById('hud-world'),
      hudWorldName: document.getElementById('hud-world-name'),
      missionText: document.getElementById('mission-text'),
      hudMessage: document.getElementById('hud-message'),
      bossHud: document.getElementById('boss-hud'),
      bossBar: document.getElementById('boss-bar'),
      bossText: document.getElementById('boss-text'),
      mobileControls: document.getElementById('mobile-controls'),
      biblePanel: document.getElementById('bible-panel')
    };
  },

  show(screen) {
    const all = [
      'loading', 'mainMenu', 'intro', 'game', 'pause', 'victory',
      'howto', 'settings', 'map', 'achievements', 'credits', 'confirmReset', 'confirmQuit'
    ];
    all.forEach(s => {
      if (this.elements[s]) this.elements[s].classList.add('hidden');
    });
    if (screen !== 'game' && this.elements.mobileControls) {
      this.elements.mobileControls.classList.add('hidden');
    }
    const target = this.elements[screen];
    if (!target) {
      console.error('Missing UI screen:', screen);
      return;
    }
    target.classList.remove('hidden');
  },

  showGame() {
    this.show('game');
    if (this.isMobile()) {
      this.elements.mobileControls.classList.remove('hidden');
    }
  },

  isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 800;
  },

  updateStats(life, maxLife, armor, maxArmor, faith, maxFaith, score) {
    this.elements.lifeBar.style.width = (life / maxLife * 100) + '%';
    this.elements.armorBar.style.width = (armor / maxArmor * 100) + '%';
    this.elements.faithBar.style.width = (faith / maxFaith * 100) + '%';
    this.elements.lifeText.textContent = Math.ceil(life) + ' / ' + maxLife;
    this.elements.armorText.textContent = Math.ceil(armor) + ' / ' + maxArmor;
    this.elements.faithText.textContent = Math.ceil(faith) + ' / ' + maxFaith;
    this.elements.scoreText.textContent = score;
  },

  setMission(text) {
    if (this.elements.missionText) this.elements.missionText.textContent = text;
  },

  getWorldInfo(worldId) {
    const n = Math.max(1, Math.min(10, parseInt(worldId, 10) || 1));
    const lv = (window.getLevel && window.getLevel(n)) ||
      (window.LEVELS && window.LEVELS[n - 1]) ||
      { id: n, name: 'World ' + n };
    const theme = (window.getWorldTheme && window.getWorldTheme(n)) || {};
    return { id: n, name: lv.name || ('World ' + n), icon: lv.icon || '📖', objective: theme.objective || '' };
  },

  setWorldDisplay(worldId) {
    const info = this.getWorldInfo(worldId);
    const label = 'WORLD ' + info.id;
    const name = String(info.name).toUpperCase();
    if (this.elements.hudWorld) this.elements.hudWorld.textContent = label;
    if (this.elements.hudWorldName) this.elements.hudWorldName.textContent = name;
    const pause = document.getElementById('pause-title');
    if (pause) pause.textContent = '⏸️ PAUSED — ' + label;
    const play = document.getElementById('btn-play');
    if (play && window.SaveSystem) {
      const data = SaveSystem.load();
      const done = (data.completedLevels || []).length >= 10;
      const next = SaveSystem.getContinueLevel();
      play.textContent = done ? '🗺️ ADVENTURE MAP' : ('▶️ PLAY WORLD ' + next);
    }
    return info;
  },

  showWorldIntro(worldId) {
    const info = this.getWorldInfo(worldId);
    const labelEl = document.getElementById('intro-world-label');
    const titleEl = document.getElementById('intro-title') || document.querySelector('#intro-screen .intro-title');
    const narrEl = document.getElementById('intro-narration');
    const missionEl = document.getElementById('intro-mission');
    if (labelEl) labelEl.textContent = 'WORLD ' + info.id;
    if (titleEl) titleEl.textContent = info.name.toUpperCase();
    const bible = window.getBibleWorldData ? window.getBibleWorldData(info.id) : null;
    if (narrEl) {
      narrEl.textContent = bible ? bible.story : ('World ' + info.id + ': ' + info.name + '. ' + (info.objective || 'Continue the adventure.'));
    }
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
    if (bible) {
      set('intro-bible-event', '📖 BIBLE MOMENT: ' + bible.event);
      set('intro-bible-passage', bible.passage);
      set('intro-bible-story', bible.story);
      set('intro-memory-verse', bible.verse);
      set('intro-lesson', bible.lesson);
    }
    if (missionEl) missionEl.textContent = 'MISSION: ' + (info.objective || info.name);
    const skip = document.getElementById('btn-skip-intro');
    if (skip) skip.textContent = 'BEGIN WORLD ' + info.id;
    this.show('intro');
  },

  getBibleInfo(worldId) {
    return window.getBibleWorldData ? window.getBibleWorldData(worldId) : null;
  },

  showBibleMoment(worldId) {
    const bible = this.getBibleInfo(worldId);
    if (!bible) return;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
    set('bible-panel-title', bible.event);
    set('bible-panel-passage', bible.passage);
    set('bible-panel-story', bible.story);
    set('bible-panel-verse', bible.verse);
    set('bible-panel-lesson', bible.lesson);
    set('bible-panel-prayer', bible.prayer);
    if (this.elements.biblePanel) this.elements.biblePanel.classList.remove('hidden');
  },

  hideBibleMoment() {
    if (this.elements.biblePanel) this.elements.biblePanel.classList.add('hidden');
  },

  populateVictoryBible(worldId) {
    const bible = this.getBibleInfo(worldId);
    if (!bible) return;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
    set('victory-bible-event', bible.event);
    set('victory-bible-passage', bible.passage);
    set('victory-bible-story', bible.story);
    set('victory-bible-lesson', bible.lesson);
    set('victory-bible-prayer', bible.prayer);
  },

  showMessage(text, duration) {
    duration = duration || 2500;
    const el = this.elements.hudMessage;
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      el.classList.add('hidden');
    }, duration);
  },

  showBoss(health, maxHealth) {
    this.elements.bossHud.classList.remove('hidden');
    this.elements.bossBar.style.width = (health / maxHealth * 100) + '%';
    this.elements.bossText.textContent = Math.ceil(health) + ' / ' + maxHealth;
  },

  hideBoss() {
    this.elements.bossHud.classList.add('hidden');
  },

  updateBoss(health, maxHealth) {
    this.elements.bossBar.style.width = (health / maxHealth * 100) + '%';
    this.elements.bossText.textContent = Math.ceil(health) + ' / ' + maxHealth;
  },

  populateMap(saveData, onSelect) {
    const list = document.getElementById('level-list');
    if (!list) {
      console.error('Missing UI container:', 'level-list');
      return;
    }
    if (!window.LEVELS) {
      console.error('LEVELS not loaded');
      return;
    }
    const data = saveData || (window.SaveSystem ? SaveSystem.load() : {});
    const unlocked = Array.isArray(data.unlockedLevels) && data.unlockedLevels.length ? data.unlockedLevels : [1];
    const completed = Array.isArray(data.completedLevels) ? data.completedLevels : [];
    const stars = data.stars || {};
    const current = Number(data.currentLevel) || 1;
    list.innerHTML = window.LEVELS.map(function(lv) {
      const isUnlocked = unlocked.indexOf(lv.id) !== -1;
      const isDone = completed.indexOf(lv.id) !== -1;
      const starCount = stars[lv.id] || 0;
      const isCurrent = isUnlocked && lv.id === current;
      const starStr = starCount > 0 ? '⭐'.repeat(starCount) : '';
      const lock = isUnlocked ? '' : ' 🔒';
      const cls = ['level-card', isUnlocked ? 'unlocked' : 'locked', isCurrent ? 'current' : '', isDone ? 'completed' : ''].filter(Boolean).join(' ');
      return '<button type="button" class="' + cls + '" data-level="' + lv.id + '" ' + (isUnlocked ? '' : 'disabled') + '>' +
        '<span class="level-icon">' + (lv.icon || '📖') + '</span>' +
        '<span class="level-num">World ' + lv.id + '</span>' +
        '<span class="level-name">' + lv.name + lock + '</span>' +
        '<span class="level-stars">' + (starStr || (isUnlocked ? 'Play!' : 'Locked')) + '</span>' +
      '</button>';
    }).join('');

    list.querySelectorAll('.level-card.unlocked').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = parseInt(btn.getAttribute('data-level'), 10);
        if (onSelect) onSelect(id);
      });
    });
  },

  populateAchievements(achievements) {
    const list = document.getElementById('achievements-list');
    if (!list) {
      console.error('Missing UI container:', 'achievements-list');
      return;
    }
    const data = achievements || {};
    list.innerHTML = this.ACHIEVEMENTS.map(function(a) {
      const unlocked = !!data[a.key];
      return '<div class="ach-card ' + (unlocked ? 'unlocked' : 'locked') + '">' +
        '<span class="ach-icon">' + a.icon + '</span>' +
        '<div class="ach-text"><strong>' + a.title + '</strong><span>' + a.desc + '</span></div>' +
        '<span class="ach-status">' + (unlocked ? '✓' : '🔒') + '</span>' +
      '</div>';
    }).join('');
  }
};

window.UI = UI;
