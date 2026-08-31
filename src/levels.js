// Level / Mission system
const LEVELS = [
  {
    id: 1,
    name: 'David & Goliath',
    unlocked: true
  },
  { id: 2, name: 'Walls of Jericho', unlocked: false },
  { id: 3, name: 'Joseph and His Dreams', unlocked: false },
  { id: 4, name: 'Three Hebrew Boys', unlocked: false },
  { id: 5, name: "Daniel in the Lions' Den", unlocked: false },
  { id: 6, name: 'Jonah and the Great Fish', unlocked: false },
  { id: 7, name: "Noah's Ark", unlocked: false },
  { id: 8, name: 'Moses & the Red Sea', unlocked: false },
  { id: 9, name: "Esther's Courage", unlocked: false },
  { id: 10, name: 'Bethlehem — Birth of Jesus', unlocked: false }
];

class MissionSystem {
  constructor() {
    this.current = 0;
    this.missions = [
      {
        id: 'explore',
        text: 'Explore the Israelite camp',
        check: (game) => game.exploredCamp,
        onComplete: (game) => {
          game.exploredCamp = true;
          UI.showMessage('MISSION COMPLETE!');
          this.next(game);
        }
      },
      {
        id: 'stones',
        text: 'Find 5 Smooth Stones',
        check: (game) => game.player.stones >= 5,
        onComplete: (game) => {
          UI.showMessage('David has prepared his stones.');
          this.next(game);
        }
      },
      {
        id: 'sling',
        text: 'Find the Sling',
        check: (game) => game.player.hasSling,
        onComplete: (game) => {
          UI.showMessage('SLING ACQUIRED! Attack ready.');
          this.next(game);
        }
      },
      {
        id: 'enemies',
        text: 'Defeat the Shadow Guardians',
        check: (game) => game.enemiesDefeated >= 5,
        onComplete: (game) => {
          UI.showMessage('MISSION COMPLETE!');
          this.next(game);
        }
      },
      {
        id: 'battlefield',
        text: 'Reach the Battlefield',
        check: (game) => game.player.getPosition().z < -55,
        onComplete: (game) => {
          UI.showMessage('WARNING — A GREAT ENEMY APPROACHES...');
          this.next(game);
          game.spawnGoliath();
        }
      },
      {
        id: 'goliath',
        text: 'Defeat Goliath',
        check: (game) => game.goliathDefeated,
        onComplete: (game) => {
          // Handled by victory flow
        }
      }
    ];
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
    const m = this.getCurrent();
    UI.setMission(m.text);
  }

  reset() {
    this.current = 0;
    this.missions.forEach(m => m.completed = false);
  }
}

window.LEVELS = LEVELS;
window.MissionSystem = MissionSystem;
