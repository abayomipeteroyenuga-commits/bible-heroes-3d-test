// UI Manager
const UI = {
  elements: {},
  messageTimeout: null,

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
    const all = ['loading', 'mainMenu', 'intro', 'game', 'pause', 'victory', 'howto', 'settings', 'map', 'achievements'];
    all.forEach(s => {
      if (this.elements[s]) this.elements[s].classList.add('hidden');
    });
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
    this.elements.lifeText.textContent = `${Math.ceil(life)} / ${maxLife}`;
    this.elements.armorText.textContent = `${Math.ceil(armor)} / ${maxArmor}`;
    this.elements.faithText.textContent = `${Math.ceil(faith)} / ${maxFaith}`;
    this.elements.scoreText.textContent = score;
  },

  setMission(text) {
    this.elements.missionText.textContent = text;
  },

  showMessage(text, duration = 2500) {
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
    this.elements.bossText.textContent = `${Math.ceil(health)} / ${maxHealth}`;
  },

  hideBoss() {
    this.elements.bossHud.classList.add('hidden');
  },

  updateBoss(health, maxHealth) {
    this.elements.bossBar.style.width = (health / maxHealth * 100) + '%';
    this.elements.bossText.textContent = `${Math.ceil(health)} / ${maxHealth}`;
  },

  populateMap(unlocked) {
    const list = document.getElementById('level-list');
    const levels = [
      '1. David & Goliath',
      '2. Walls of Jericho',
      '3. Joseph and His Dreams',
      '4. Three Hebrew Boys',
      '5. Daniel in the Lions\' Den',
      '6. Jonah and the Great Fish',
      '7. Noah\'s Ark',
      '8. Moses & the Red Sea',
      '9. Esther\'s Courage',
      '10. Bethlehem — Birth of Jesus'
    ];
    list.innerHTML = levels.map((name, i) => {
      const unlockedLevel = unlocked.includes(i + 1);
      return `<div class="level-item ${unlockedLevel ? 'unlocked' : 'locked'}">${name}${unlockedLevel ? '' : ' 🔒'}</div>`;
    }).join('');
  }
};

window.UI = UI;
