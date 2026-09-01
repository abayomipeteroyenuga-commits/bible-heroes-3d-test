# PastorAbayomi Bible Stories — David & Goliath

**10-World Adventure**

A real playable third-person 3D browser adventure game built with HTML5, CSS3, JavaScript and Three.js (WebGL).

## Features

- Third-person camera following David
- WASD + mouse (desktop) and virtual joystick + large touch buttons (mobile)
- Walk, run, jump, attack with sling, Faith Shield (Q)
- Collectible smooth stones, sling, health, armor, faith energy
- Mission system with progression
- Shadow Guardians (enemy AI: patrol, detect, chase, attack)
- Goliath boss with phases, ground strike, roar, charge, vulnerable targets
- Health / Armor / Faith systems
- Checkpoints and respawn
- localStorage save (progress, scores, unlocked levels, settings)
- Ten playable David vs Goliath worlds with save/unlock progression

## Local Testing

1. Open the project folder.
2. Serve the files with any static server (required for modules / some browsers):

```bash
# Python 3
python -m http.server 8080

# or Node
npx serve .
```

3. Open `http://localhost:8080` in a modern browser (Chrome, Firefox, Edge, Safari).

You can also open `index.html` directly in some browsers, but a local server is recommended.

## Controls

### Desktop
- **W A S D** — Move
- **Shift** — Run
- **Space** — Jump
- **Mouse** — Camera (click canvas to lock pointer)
- **Left Click** — Sling attack (after collecting sling)
- **Q** — Shield of Faith (costs 25 Faith)
- **E** — Interact / Collect / Pray at campfire
- **ESC** — Pause

### Mobile
- Left virtual joystick — Move
- **JUMP** / **ATTACK** / **FAITH** / **E** buttons

## GitHub Upload

1. Create a new repository on GitHub.
2. Push the project:

```bash
git init
git add .
git commit -m "Bible Heroes Adventure - Level 1 David & Goliath"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bible-heroes-adventure.git
git push -u origin main
```

## Vercel Deployment

1. Install Vercel CLI or connect the GitHub repo at [vercel.com](https://vercel.com).
2. Import the repository.
3. Framework Preset: **Other**.
4. Build Command: leave empty.
5. Output Directory: `.` (root).
6. Deploy.

The game is fully static — no backend required. It works with custom domains.

## Project Structure

```
bible-heroes-adventure/
├── index.html
├── style.css
├── README.md
├── src/
│   ├── game.js       # Main loop & state
│   ├── player.js     # David controller + camera
│   ├── enemies.js    # Shadow Guardians + Goliath
│   ├── world.js      # Terrain, camp, collectibles
│   ├── combat.js     # Projectiles, particles
│   ├── levels.js     # Missions & level list
│   ├── ui.js         # HUD & menus
│   └── save.js       # localStorage
└── assets/           # Ready for future models/audio/textures
```

## Future Level Development

Levels 2–10 are defined in `src/levels.js` and unlocked via `SaveSystem`.

To add a new level:

1. Create a new world builder (or extend `World`) for the environment.
2. Add enemy/boss classes as needed.
3. Create a new mission sequence in `MissionSystem` or a level-specific mission class.
4. Load the appropriate level when the player selects it from the Adventure Map.

Only Level 1 is fully implemented and playable in this version.

## Brand

**PastorAbayomiBibleStories**  
**Bible Heroes Adventure**

Child-friendly, low-poly, no blood/gore, faith-themed combat.

## License

For educational and ministry use under Pastor Abayomi Bible Stories.
