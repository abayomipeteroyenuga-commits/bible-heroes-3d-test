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
      missionText: document.getElementById('mission-text'),
      hudMessage: document.getElementById('hud-message'),
      bossHud: document.getElementById('boss-hud'),
      bossBar: document.getElementById('boss-bar'),
      bossText: document.getElementById('boss-text'),
      mobileControls: document.getElementById('mobile-controls')
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
    if (this.elements[screen]) this.elements[screen].classList.remove('hidden');
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
    this.elements.missionText.textContent = text;
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

  populateMap(unlocked, stars, onSelect) {
    const list = document.getElementById('level-list');
    if (!list || !window.LEVELS) return;
    const current = unlocked[unlocked.length - 1] || 1;
    list.innerHTML = window.LEVELS.map(function(lv) {
      const isUnlocked = unlocked.indexOf(lv.id) !== -1;
      const starCount = (stars && stars[lv.id]) || 0;
      const isCurrent = isUnlocked && lv.id === current;
      const starStr = starCount > 0 ? '⭐'.repeat(starCount) : '';
      const lock = isUnlocked ? '' : ' 🔒';
      const cls = ['level-card', isUnlocked ? 'unlocked' : 'locked', isCurrent ? 'current' : '', starCount > 0 ? 'completed' : ''].filter(Boolean).join(' ');
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
    if (!list) return;
    list.innerHTML = this.ACHIEVEMENTS.map(function(a) {
      const unlocked = !!(achievements && achievements[a.key]);
      return '<div class="ach-card ' + (unlocked ? 'unlocked' : 'locked') + '">' +
        '<span class="ach-icon">' + a.icon + '</span>' +
        '<div class="ach-text"><strong>' + a.title + '</strong><span>' + a.desc + '</span></div>' +
        '<span class="ach-status">' + (unlocked ? '✓' : '🔒') + '</span>' +
      '</div>';
    }).join('');
  }
};

window.UI = UI;
