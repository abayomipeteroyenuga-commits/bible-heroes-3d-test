// Player (David) - third person controller with full procedural animation
class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.speed = 6;
    this.runMultiplier = 1.7;
    this.jumpForce = 9;
    this.gravity = 22;
    this.onGround = true;
    this.canJump = true;
    this.height = 1.6;
    this.radius = 0.4;
    this.life = 100;
    this.maxLife = 100;
    this.armor = 50;
    this.maxArmor = 50;
    this.faith = 100;
    this.maxFaith = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.sprintHeld = false;
    this.score = 0;
    this.hasSling = true;
    this.stones = 12;
    this.coins = 0;
    this.hasBow = false;
    this.arrows = 0;
    this.equippedWeapon = 'sling';
    this.weaponPower = 0;
    this.shieldBonus = 0;
    this.invincible = 0;
    this.shieldActive = 0;
    this.attackCooldown = 0;
    this.pendingProjectile = false;
    this.state = 'IDLE';
    this.action = 'NONE';
    this.actionTime = 0;
    this.emote = null;
    this.emoteTime = 0;
    this.emotion = 'calm';
    this.facing = 0;
    this.animTime = 0;
    this.keys = {};
    this.mouse = { x: 0, y: 0, locked: false };
    this.cameraAngle = Math.PI;
    this.cameraPitch = 0.28;
    this.cameraDistance = 8.2;
    this.cameraMinDist = 5.2;
    this.cameraMaxDist = 13.5;
    this.cameraHeight = 8.2;
    this.cameraBack = 8.2;
    this._camPos = null;
    this._camLook = null;
    this.lookSensitivity = 1;
    this._orbiting = false;
    this._lastOrbitX = 0;
    this._lastOrbitY = 0;
    this.joystick = { active: false, x: 0, y: 0 };
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 800;
    this.checkpoint = new THREE.Vector3(0, 1, 8);
    this.buildModel();
    scene.add(this.group);
    this.setupControls();
  }

  buildModel() {
    // David gets a distinct wardrobe for every world.  The look changes while his
    // identity, face, sling and animation rig remain consistent.
    const world = Math.max(1, Math.min(40, Number(window.Game && window.Game.currentWorld) || 1));
    const wardrobes = [
      [0x527a55,0x403225,0x70452a,0xc9a45a],[0x356b82,0x493526,0x6b4028,0xd3ad63],
      [0x875044,0x3d3028,0x70442a,0xe0b76a],[0x62518f,0x44372c,0x62402a,0xd7b56d],
      [0x7d7138,0x45362a,0x754b2b,0xcfa35b],[0x3e786a,0x49392c,0x5f3925,0xe0bb73],
      [0x7d4b61,0x392f2a,0x70452c,0xd8a45d],[0x4c774b,0x51412e,0x7b522d,0xe7bd6e],
      [0x41678b,0x4b392b,0x704127,0xd6a15c],[0x925b3b,0x3b3029,0x76462b,0xe0b56b],
      [0x4c6d8b,0x3b3027,0x62412c,0xd3aa62],[0x76506e,0x44372d,0x70482d,0xe2bd72],
      [0x3f7961,0x4b392c,0x674027,0xd8a65e],[0x8b4b42,0x413229,0x74472b,0xe4b86c],
      [0x566c3e,0x403229,0x6d482a,0xd4ad63],[0x49607f,0x4a372a,0x75472b,0xe1b66a],
      [0x78465f,0x3c302a,0x70462a,0xd8a861],[0x3e746f,0x47372c,0x694329,0xe3b56b],
      [0x806039,0x3f3228,0x76492b,0xd8ad62],[0x5a527f,0x40342a,0x6e4529,0xe5bd76],
      [0x8a4a38,0x423228,0x75462a,0xd9a05a],[0x3f7055,0x49372a,0x69432a,0xe4ba6e],
      [0x6b4b78,0x3c312b,0x72452b,0xd9ad68],[0x426b82,0x46352a,0x6e4328,0xe5b970],
      [0x7e553c,0x403329,0x774a2d,0xe2b36a],[0x3d765f,0x49382b,0x6a4329,0xd9a85e],
      [0x714969,0x3d3029,0x74482b,0xe6bc73],[0x4b6385,0x44352a,0x70442a,0xd7a15a],
      [0x8a513f,0x3e3028,0x76482b,0xe4b86b],[0x3e6e61,0x48372b,0x6c4329,0xdcae63],
      [0x62507d,0x403229,0x73472c,0xe4ba70],[0x79633c,0x433329,0x784b2e,0xd9aa5f],
      [0x4b785e,0x45362a,0x6c4329,0xe5bd72],[0x82475a,0x3c3029,0x76482b,0xdca45c],
      [0x456b88,0x45352a,0x6e4329,0xe8bf76],[0x7b533e,0x3f3128,0x794a2d,0xe3b267],
      [0x4b7869,0x45362a,0x6e442a,0xe9c17b],[0x694c82,0x3c3129,0x77492c,0xe2b96f],
      [0x8c5337,0x3e3028,0x7a4b2d,0xe8ba68],[0x3e7464,0x45352a,0x70452a,0xe7bd73],
      [0x5b5687,0x3d3029,0x75482c,0xe6bd77],[0x87613c,0x423329,0x7a4d2e,0xe8bc6c]
    ];
    const w = wardrobes[(world - 1) % wardrobes.length];
    const accent = w[3];
    const cloak = world >= 4 ? [0x2d4a3d,0x473a5b,0x5a3b32,0x374e68,0x66512d][(world - 4) % 5] : null;
    const sash = [0x9b3d32,0x315c72,0x8a6a2e,0x6c3c62,0x6b5130][(world - 1) % 5];
    this.humanoid = new Humanoid(this.group, {
      skin: 0xf0bd98, skinDark: 0xd49a79, shirt: w[0], pants: w[1], boot: w[2],
      hair: [0x24160e,0x321b12,0x3a2115,0x1f1510,0x4a2b18][(world-1)%5],
      hairStyle: world, isDavid: true, leather: 0x754522, accent: accent, pads: false,
      tunic: true, belt: true, sash: sash, sashSide: world % 2 ? 'left' : 'right', cloak: cloak,
      shoeStyle: world, sling: true, slingStyle: world, staff: false, helmet: false, eye: world % 3 === 0 ? 0x4b7d72 : 0x31577d
    });
    this.root = this.humanoid.root;
    this.torsoGroup = this.humanoid.torsoGroup;
    this.headGroup = this.humanoid.headGroup;
    this.leftArmGroup = this.humanoid.leftArmGroup;
    this.rightArmGroup = this.humanoid.rightArmGroup;
    this.leftLegGroup = this.humanoid.leftLegGroup;
    this.rightLegGroup = this.humanoid.rightLegGroup;
    this.slingMesh = this.humanoid.slingMesh;
    if (this.slingMesh) this.slingMesh.visible = true;
    this.browL = this.humanoid.browL;
    this.browR = this.humanoid.browR;
    this.smileMesh = this.humanoid.smile;
    this.eyeL = this.humanoid.eyeL;
    this.eyeR = this.humanoid.eyeR;

    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xf1c40f, transparent: true, opacity: 0.2, side: THREE.DoubleSide
      })
    );
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    // Animation state (same API — blending unchanged)
    this.anim = {
      walkCycle: 0,
      attackProgress: 0,
      hitTimer: 0,
      victoryTimer: 0,
      bob: 0,
      idleBreath: 0,
      pose: this._emptyPose(),
      blendSpeed: {
        IDLE: 8,
        WALK: 12,
        RUN: 14,
        SPRINT: 16,
        JUMP: 10,
        ATTACK: 18,
        HIT: 20,
        VICTORY: 6,
        EMOTE: 9
      }
    };

    this.group.position.set(0, 0, 8);
    this.group.scale.set(1, 1, 1);
  }

  _emptyPose() {
    return {
      leftArm: { x: 0, y: 0, z: 0 },
      rightArm: { x: 0, y: 0, z: 0 },
      leftLeg: { x: 0, y: 0, z: 0 },
      rightLeg: { x: 0, y: 0, z: 0 },
      leftShin: { x: 0.12 },
      rightShin: { x: 0.12 },
      torso: { x: 0, y: 0, z: 0, py: 0.72 },
      head: { x: 0, y: 0, z: 0 },
      rootY: 0,
      bodyZ: 0
    };
  }

  setupControls() {
    // Stable handlers so F works with pointer lock / any page focus
    this._onKeyDown = (e) => {
      const code = e.code || '';
      const key = String(e.key || '').toLowerCase();

      // Track movement keys (including repeat for continuous move)
      if (code) this.keys[code] = true;

      // Single-press actions: ignore auto-repeat
      if (e.repeat) return;

      const playing = window.Game && window.Game.state === 'playing';

      if (code === 'Escape' && playing) {
        window.Game.pause();
        return;
      }

      if (!playing) return;

      // F / G / T / K = Fire Sling (same tryAttack path)
      const isSlingKey =
        code === 'KeyF' || code === 'KeyG' || code === 'KeyT' || code === 'KeyK' ||
        key === 'f' || key === 'g' || key === 't' || key === 'k';
      if (isSlingKey) {
        e.preventDefault();
        if (e.repeat) return;
        this.tryAttack();
        return;
      }

      if (code === 'KeyQ' || key === 'q') {
        e.preventDefault();
        this.tryFaithShield();
        return;
      }

      if (code === 'KeyH' || key === 'h') {
        e.preventDefault();
        this.toggleEmoteMenu();
        return;
      }

      if (code === 'KeyC' || key === 'c') {
        e.preventDefault();
        if (window.Game && window.Game.craftArrows) window.Game.craftArrows();
        return;
      }

      if (code === 'KeyJ' || key === 'j') {
        e.preventDefault();
        if (window.Game) window.Game.useJaruscope();
        return;
      }

      if (code === 'KeyM' || key === 'm') {
        e.preventDefault();
        if (window.Game) window.Game.toggleGameMap();
        return;
      }

      if (code === 'KeyE' || key === 'e') {
        e.preventDefault();
        if (window.Game) window.Game.tryInteract();
      }
    };

    this._onKeyUp = (e) => {
      if (e.code) this.keys[e.code] = false;
    };

    this._orbitByDelta = (dx, dy) => {
      const s = this.lookSensitivity || 1;
      this.cameraAngle -= dx * 0.0048 * s;
      this.cameraPitch = Math.max(0.12, Math.min(0.62, this.cameraPitch + dy * 0.0032 * s));
    };

    this._onMouseMove = (e) => {
      if (!window.Game || window.Game.state !== 'playing') return;
      if (!this.isMobile && this.mouse.locked) {
        this._orbitByDelta(e.movementX, e.movementY);
        return;
      }
      if (this._orbiting) {
        this._orbitByDelta(e.clientX - this._lastOrbitX, e.clientY - this._lastOrbitY);
        this._lastOrbitX = e.clientX;
        this._lastOrbitY = e.clientY;
      }
    };

    this._onMouseDown = (e) => {
      if (!window.Game || window.Game.state !== 'playing') return;
      const t = e.target;
      if (t && t.closest && t.closest('button, a, input, select, label, .screen, .menu-btn, .mute-btn, .action-btn')) {
        return;
      }
      if (e.button === 2 || e.button === 1) {
        this._orbiting = true;
        this._lastOrbitX = e.clientX;
        this._lastOrbitY = e.clientY;
        return;
      }
      if (e.button === 0) this.tryAttack();
    };

    this._onMouseUp = () => {
      this._orbiting = false;
    };

    this._onWheel = (e) => {
      if (!window.Game || window.Game.state !== 'playing') return;
      e.preventDefault();
      this.cameraDistance = Math.max(
        this.cameraMinDist || 5.2,
        Math.min(this.cameraMaxDist || 13.5, (this.cameraDistance || 8.2) + (e.deltaY > 0 ? 0.55 : -0.55))
      );
      this.cameraHeight = this.cameraDistance;
    };

    this._onContextMenu = (e) => {
      if (window.Game && window.Game.state === 'playing') e.preventDefault();
    };

    this._onCanvasClick = () => {
      const canvas = document.getElementById('game-canvas');
      if (!this.isMobile && canvas && window.Game && window.Game.state === 'playing') {
        canvas.requestPointerLock && canvas.requestPointerLock();
      }
    };

    this._onPointerLock = () => {
      this.mouse.locked = document.pointerLockElement === document.getElementById('game-canvas');
    };

    window.addEventListener('keydown', this._onKeyDown, true);
    window.addEventListener('keyup', this._onKeyUp, true);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('contextmenu', this._onContextMenu);
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('click', this._onCanvasClick);
      canvas.addEventListener('wheel', this._onWheel, { passive: false });
    }
    document.addEventListener('pointerlockchange', this._onPointerLock);

    this.setupJoystick();
    this.setupMobileButtons();
  }

  setupJoystick() {
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    if (!base) return;
    this._joyBase = base;
    this._joyStick = stick;

    const maxDist = 40;
    this._joyStartX = 0;
    this._joyStartY = 0;

    this._onJoyStart = (e) => {
      e.preventDefault();
      this.joystick.active = true;
      const rect = base.getBoundingClientRect();
      this._joyStartX = rect.left + rect.width / 2;
      this._joyStartY = rect.top + rect.height / 2;
    };

    this._onJoyMove = (e) => {
      if (!this.joystick.active) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      let dx = t.clientX - this._joyStartX;
      let dy = t.clientY - this._joyStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      if (stick) stick.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
      this.joystick.x = dx / maxDist;
      this.joystick.y = dy / maxDist;
    };

    this._onJoyEnd = () => {
      this.joystick.active = false;
      this.joystick.x = 0;
      this.joystick.y = 0;
      if (stick) stick.style.transform = 'translate(-50%, -50%)';
    };

    base.addEventListener('touchstart', this._onJoyStart, { passive: false });
    base.addEventListener('touchmove', this._onJoyMove, { passive: false });
    base.addEventListener('touchend', this._onJoyEnd);
    base.addEventListener('mousedown', this._onJoyStart);
    window.addEventListener('mousemove', this._onJoyMove);
    window.addEventListener('mouseup', this._onJoyEnd);
  }

  setupMobileButtons() {
    this._mobileHandlers = [];
    const sprintBtn = document.getElementById('btn-sprint');
    if (sprintBtn) {
      const down = (e) => { e.preventDefault(); this.sprintHeld = true; };
      const up = () => { this.sprintHeld = false; };
      sprintBtn.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      this._mobileHandlers.push({ btn: sprintBtn, handler: down, extra: { up } });
    }
    const map = {
      'btn-attack': () => this.tryAttack(),
      'btn-special': () => this.tryFaithShield(),
      'btn-interact': () => { if (window.Game) window.Game.tryInteract(); },
      'btn-jaruscope': () => { if (window.Game) window.Game.useJaruscope(); },
      'btn-game-map': () => { if (window.Game) window.Game.toggleGameMap(); },
      'btn-emote': () => this.toggleEmoteMenu()
    };
    Object.keys(map).forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      // Use one PointerEvent instead of touchstart + mousedown. Browsers
      // synthesize a mousedown after touch, which previously caused some
      // mobile actions (attack/jump/interact) to fire twice.
      const handler = (e) => {
        e.preventDefault();
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        map[id]();
      };
      btn.addEventListener('pointerdown', handler);
      this._mobileHandlers.push({ btn, handler });
    });
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown, true);
    window.removeEventListener('keyup', this._onKeyUp, true);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('contextmenu', this._onContextMenu);
    document.removeEventListener('pointerlockchange', this._onPointerLock);
    const canvas = document.getElementById('game-canvas');
    if (canvas && this._onCanvasClick) canvas.removeEventListener('click', this._onCanvasClick);
    if (canvas && this._onWheel) canvas.removeEventListener('wheel', this._onWheel);

    if (this._joyBase) {
      this._joyBase.removeEventListener('touchstart', this._onJoyStart);
      this._joyBase.removeEventListener('touchmove', this._onJoyMove);
      this._joyBase.removeEventListener('touchend', this._onJoyEnd);
      this._joyBase.removeEventListener('mousedown', this._onJoyStart);
    }
    window.removeEventListener('mousemove', this._onJoyMove);
    window.removeEventListener('mouseup', this._onJoyEnd);

    if (this._mobileHandlers) {
      this._mobileHandlers.forEach(h => {
        h.btn.removeEventListener('pointerdown', h.handler);
        if (h.extra && h.extra.up) {
          window.removeEventListener('pointerup', h.extra.up);
          window.removeEventListener('pointercancel', h.extra.up);
        }
      });
      this._mobileHandlers = [];
    }
    this.sprintHeld = false;

    this.joystick.active = false;
    this.joystick.x = 0;
    this.joystick.y = 0;
    this.keys = {};
  }

  tryJump() {}

  playEmote(name) {
    if (this.action === 'HIT' || this.state === 'HIT' || this.state === 'VICTORY') return;
    const list = ['wave','thumbsup','celebrate','clap','happy','sad','worried','surprised','angry','thinking','prayer','victory'];
    if (list.indexOf(name) === -1) return;
    this.emote = name;
    this.emoteTime = 0;
    this.state = 'EMOTE';
    const face = {
      wave: 'calm', thumbsup: 'calm', celebrate: 'victory', clap: 'victory',
      happy: 'victory', sad: 'worried', worried: 'worried', surprised: 'alert',
      angry: 'determined', thinking: 'curious', prayer: 'calm', victory: 'victory'
    };
    this.emotion = face[name] || 'calm';
    if (window.UI) UI.showMessage(name.toUpperCase(), 900);
  }

  toggleEmoteMenu() {
    const el = document.getElementById('emote-panel');
    if (!el) return;
    el.classList.toggle('hidden');
  }

  // Same range as Game.spawnProjectile auto-aim (nearest living enemy / Goliath)
  hasEnemyInAttackRange(range = 25) {
    if (!window.Game) return false;
    const origin = this.getPosition();
    if (window.Game.enemies) {
      for (let i = 0; i < window.Game.enemies.length; i++) {
        const e = window.Game.enemies[i];
        if (!e || !e.alive || !e.group) continue;
        if (origin.distanceTo(e.group.position) <= range) return true;
      }
    }
    // Same auto-aim targets as Game.spawnProjectile (Goliath included)
    if (window.Game.goliath && window.Game.goliath.alive && window.Game.goliath.group) {
      if (origin.distanceTo(window.Game.goliath.group.position) <= range) return true;
    }
    return false;
  }

  tryAttack() {
    this.hasSling = true;
    if (this.slingMesh) this.slingMesh.visible = true;
    if (this.attackCooldown > 0) return;
    if (this.action === 'HIT' || this.state === 'VICTORY' || this.action === 'VICTORY') return;
    this.attackCooldown = 0.55;
    // Combat is an overlay. Never replace locomotion with ATTACK.
    this.action = 'FIRE';
    this.actionTime = 0.45;
    if (this.anim) this.anim.attackProgress = 0;
    this.pendingProjectile = false;
    if (window.Game && typeof window.Game.spawnProjectile === 'function') {
      window.Game.spawnProjectile();
    }
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.08, 0.16);
  }

  tryFaithShield() {
    if (this.faith < 25 || this.shieldActive > 0) return;
    this.faith -= 25;
    this.shieldActive = 4 + (this.shieldBonus || 0);
    this.shieldMesh.visible = true;
    if (window.UI) window.UI.showMessage('SHIELD OF FAITH!');
    if (window.AudioSystem) window.AudioSystem.faithShield();
    if (window.SaveSystem) SaveSystem.bumpStat('faithShieldUses', 1);
    if (window.Game) window.Game.updateHUD();
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.1, 0.2);
  }

  takeDamage(amount) {
    if (this.invincible > 0 || this.shieldActive > 0) {
      amount *= 0.3;
    }
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount);
      this.armor -= absorbed;
      amount -= absorbed;
    }
    if (amount > 0) {
      this.life = Math.max(0, this.life - amount);
      this.state = 'HIT';
      this.anim.hitTimer = 0;
      this.invincible = 0.8;
      this.pendingProjectile = false;
      if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.28, 0.32);
      if (window.AudioSystem) window.AudioSystem.damage();
      if (this.life > 0 && this.life <= this.maxLife * 0.25 && window.UI) {
        window.UI.showMessage('LOW HEALTH!', 1500);
      }
    }
    if (window.Game) window.Game.updateHUD();
    if (this.life <= 0) {
      this.respawn();
    }
  }

  heal(amount) {
    this.life = Math.min(this.maxLife, this.life + amount);
    if (window.Game) window.Game.updateHUD();
  }

  addArmor(amount) {
    this.armor = Math.min(this.maxArmor, this.armor + amount);
    if (window.Game) window.Game.updateHUD();
  }

  addFaith(amount) {
    this.faith = Math.min(this.maxFaith, this.faith + amount);
    if (window.Game) window.Game.updateHUD();
  }

  addScore(pts) {
    this.score += pts;
    if (window.Game) window.Game.updateHUD();
  }

  respawn() {
    this.life = this.maxLife;
    this.armor = Math.max(20, this.armor);
    this.group.position.copy(this.checkpoint);
    this.velocity.set(0, 0, 0);
    this.state = 'IDLE';
    if (window.UI) window.UI.showMessage('CHECKPOINT RESTORED');
    if (window.Game) window.Game.updateHUD();
  }

  setCheckpoint(pos) {
    this.checkpoint.copy(pos);
  }

  update(dt, worldBounds) {
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.actionTime > 0) {
      this.actionTime -= dt;
      if (this.actionTime <= 0 && this.action === 'FIRE') this.action = 'NONE';
    }
    if (this.invincible > 0) this.invincible -= dt;
    if (this.shieldActive > 0) {
      this.shieldActive -= dt;
      this.shieldMesh.material.opacity = 0.15 + Math.sin(this.animTime * 8) * 0.1;
      if (this.shieldActive <= 0) this.shieldMesh.visible = false;
    }

    let inputX = 0, inputZ = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputX += 1;
    if (this.joystick.active) {
      inputX += this.joystick.x;
      inputZ += this.joystick.y;
    }
    // Jump / attack / faith / interact handled on keydown (single-press)

    const joyX = this.joystick.active ? this.joystick.x : 0;
    const joyZ = this.joystick.active ? this.joystick.y : 0;
    const movingNow = Math.abs(inputX) > 0.02 || Math.abs(inputZ) > 0.02 || Math.abs(joyX) > 0.12 || Math.abs(joyZ) > 0.12;
    const wantsSprint = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.sprintHeld);
    if (wantsSprint && movingNow && this.stamina > 1) {
      this.stamina = Math.max(0, this.stamina - 22 * dt);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 16 * dt);
    }
    const isSprinting = wantsSprint && this.stamina > 1 && movingNow;
    const moveSpeed = this.speed * (isSprinting ? this.runMultiplier : 1);

    const forward = new THREE.Vector3(-Math.sin(this.cameraAngle), 0, -Math.cos(this.cameraAngle));
    const right = new THREE.Vector3(Math.cos(this.cameraAngle), 0, -Math.sin(this.cameraAngle));
    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, -inputZ);
    this.direction.addScaledVector(right, inputX);
    if (this.direction.lengthSq() > 0) this.direction.normalize();

    if (movingNow && this.state === 'EMOTE') {
      this.emote = null;
      this.emoteTime = 0;
      this.state = 'WALK';
    }

    // HIT / VICTORY can slow the body. FIRE must never freeze locomotion.
    const lockMove = this.state === 'HIT' || this.state === 'VICTORY' || this.action === 'HIT' || this.action === 'VICTORY';

    if (lockMove) {
      this.velocity.x *= 0.55;
      this.velocity.z *= 0.55;
      if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.05) this.velocity.z = 0;
    } else if (movingNow && this.direction.lengthSq() > 0) {
      this.facing = Math.atan2(this.direction.x, this.direction.z);
      let yawDiff = this.facing - this.group.rotation.y;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
      this.group.rotation.y += yawDiff * Math.min(1, dt * 10);
      const accel = isSprinting ? 14 : 11;
      this.velocity.x += (this.direction.x * moveSpeed - this.velocity.x) * Math.min(1, dt * accel);
      this.velocity.z += (this.direction.z * moveSpeed - this.velocity.z) * Math.min(1, dt * accel);
      const spd = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      if (isSprinting && spd > 5) this.state = 'SPRINT';
      else if (spd > 3.4) this.state = 'RUN';
      else this.state = 'WALK';
      if (!this.mouse.locked && !this._orbiting) {
        const behind = this.facing + Math.PI;
        let diff = behind - this.cameraAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.cameraAngle += diff * Math.min(1, dt * 2.6);
      }
    } else {
      this.velocity.x *= Math.pow(0.12, dt);
      this.velocity.z *= Math.pow(0.12, dt);
      if (Math.abs(this.velocity.x) < 0.08) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.08) this.velocity.z = 0;
      if (this.state !== 'EMOTE') this.state = 'IDLE';
    }

    // Move in short collision-safe steps so David cannot tunnel through thin walls/stones at high speed.
    const moveX = this.velocity.x * dt;
    const moveZ = this.velocity.z * dt;
    const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const steps = Math.max(1, Math.ceil(moveLen / 0.12));
    const stepX = moveX / steps;
    const stepZ = moveZ / steps;
    for (let i = 0; i < steps; i++) {
      this.group.position.x += stepX;
      if (window.Game && Game.world && Game.world.resolveCircle) {
        const fixedX = Game.world.resolveCircle(this.group.position.x, this.group.position.z, 0.45);
        this.group.position.x = fixedX.x;
        this.group.position.z = fixedX.z;
      }
      this.group.position.z += stepZ;
      if (window.Game && Game.world && Game.world.resolveCircle) {
        const fixedZ = Game.world.resolveCircle(this.group.position.x, this.group.position.z, 0.45);
        this.group.position.x = fixedZ.x;
        this.group.position.z = fixedZ.z;
      }
      if (worldBounds) {
        this.group.position.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, this.group.position.x));
        this.group.position.z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, this.group.position.z));
      }
    }
    this.group.position.y = 0;
    this.velocity.y = 0;
    this.onGround = true;

    this.animate(dt);

    if (this.action === 'FIRE' && this.pendingProjectile) {
      this.pendingProjectile = false;
      if (window.Game) window.Game.spawnProjectile();
    }

    this.updateCamera();
  }

  /**
   * Procedural animation with smooth pose blending.
   * Each state computes a target pose; current pose lerps toward it.
   */
  animate(dt) {
    const a = this.anim;
    const t = this.animTime;

    const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    const isMoving = horizontalSpeed > 0.3;
    const isRunningKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.sprintHeld;

    if (this.state === 'JUMP') {
      this.state = isMoving ? (isRunningKey ? 'RUN' : 'WALK') : 'IDLE';
    }

    if (this.humanoid) {
      this.humanoid.update(dt, this.state, {
        emote: this.emote,
        mood: this.emotion,
        fire: this.action === 'FIRE'
      });
      a.bob = this.humanoid.root.position.y || 0;
      a.walkCycle = this.humanoid.cycle;
      a.attackProgress = this.humanoid.attackT;
    } else {
      a.bob = 0;
    }

    // Invincibility blink
    this.group.visible = this.invincible <= 0 || Math.floor(t * 12) % 2 === 0;

    if (this.shieldMesh.visible) {
      this.shieldMesh.position.y = 1.0 + a.bob;
    }
  }

  _lerpPose(cur, tgt, k) {
    const lerp3 = (c, t) => {
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
      c.z += (t.z - c.z) * k;
    };
    lerp3(cur.leftArm, tgt.leftArm);
    lerp3(cur.rightArm, tgt.rightArm);
    lerp3(cur.leftLeg, tgt.leftLeg);
    lerp3(cur.rightLeg, tgt.rightLeg);
    if (!cur.leftShin) cur.leftShin = { x: 0.12 };
    if (!cur.rightShin) cur.rightShin = { x: 0.12 };
    if (!tgt.leftShin) tgt.leftShin = { x: 0.12 };
    if (!tgt.rightShin) tgt.rightShin = { x: 0.12 };
    cur.leftShin.x += (tgt.leftShin.x - cur.leftShin.x) * k;
    cur.rightShin.x += (tgt.rightShin.x - cur.rightShin.x) * k;
    lerp3(cur.torso, tgt.torso);
    cur.torso.py += (tgt.torso.py - cur.torso.py) * k;
    lerp3(cur.head, tgt.head);
    cur.rootY += (tgt.rootY - cur.rootY) * k;
    cur.bodyZ += (tgt.bodyZ - cur.bodyZ) * k;
    this._updateFace(dt);
  }

  updateEmotion(game) {
    if (this.state === 'VICTORY') this.emotion = 'victory';
    else if (this.state === 'HIT') this.emotion = 'pain';
    else if (this.state === 'ATTACK') this.emotion = 'determined';
    else if (this.life < 30) this.emotion = 'worried';
    else if (game && game.goliath && game.goliath.alive) this.emotion = 'determined';
    else if (game && game.enemies) {
      const pos = this.getPosition();
      let near = 0;
      game.enemies.forEach(e => {
        if (e.alive && e.group && e.group.position.distanceTo(pos) < 10) near++;
      });
      if (near >= 3) this.emotion = 'worried';
      else if (near >= 1) this.emotion = 'alert';
      else this.emotion = 'calm';
    } else this.emotion = this.emotion || 'calm';
  }

  _updateFace(dt) {
    if (!this.browL || !this.smileMesh) return;
    const e = this.emotion || 'calm';
    let brow = 0.1, browY = 0.15, smileScale = 0.85, smileY = -0.1;
    if (e === 'alert') { brow = -0.04; browY = 0.17; smileScale = 0.45; }
    else if (e === 'worried') { brow = 0.22; browY = 0.18; smileScale = 0.25; smileY = -0.08; }
    else if (e === 'determined') { brow = -0.1; browY = 0.17; smileScale = 0.35; }
    else if (e === 'pain') { brow = 0.3; browY = 0.19; smileScale = 0.15; smileY = -0.07; }
    else if (e === 'victory') { brow = -0.02; smileScale = 1.15; smileY = -0.11; }
    else if (e === 'curious') { brow = 0.06; browY = 0.16; smileScale = 0.7; }
    else { brow = 0.1 + Math.sin(this.animTime * 1.2) * 0.03; smileScale = 0.8; }
    if (this.state === 'HIT') { brow = 0.3; smileScale = 0.15; }
    if (this.state === 'VICTORY') { smileScale = 1.15; }
    this.browL.rotation.z = brow;
    this.browR.rotation.z = -brow;
    this.browL.position.y = browY;
    this.browR.position.y = browY;
    this.smileMesh.scale.set(smileScale, smileScale, 1);
    this.smileMesh.position.y = smileY;
    if (this.eyeL && this.eyeR) {
      const tired = this.life < 30 ? 0.85 : 1.05;
      const blink = (Math.sin(this.animTime * 0.7) > 0.96) ? 0.18 : tired;
      this.eyeL.scale.y = blink;
      this.eyeR.scale.y = blink;
    }
  }

  _computeTargetPose(target, dt, isMoving, isRunningKey) {
    const a = this.anim;

    // ---- IDLE ----
    if (this.state === 'IDLE') {
      a.idleBreath += dt * 2.2;
      const breath = Math.sin(a.idleBreath) * 0.03;
      target.torso.py = 0.72 + breath;
      target.head.x = Math.sin(a.idleBreath * 0.7) * 0.04;
      target.leftArm.z = 0.1 + Math.sin(a.idleBreath * 0.9) * 0.05;
      target.rightArm.z = -0.1 + Math.sin(a.idleBreath * 0.9 + 1.2) * 0.05;
      target.leftArm.x = Math.sin(a.idleBreath * 0.6) * 0.06;
      target.rightArm.x = Math.sin(a.idleBreath * 0.6 + 0.8) * 0.06;
      target.leftLeg.x = 0.06;
      target.rightLeg.x = 0.06;
      return;
    }

    // ---- WALK / RUN ----
    if (this.state === 'WALK' || this.state === 'RUN' || this.state === 'SPRINT') {
      const isSprint = this.state === 'SPRINT';
      const isRun = this.state === 'RUN' || isSprint;
      const cycleSpeed = isSprint ? 16 : isRun ? 12 : 8;
      const legAmp = isSprint ? 0.95 : isRun ? 0.78 : 0.5;
      const armAmp = isSprint ? 1.05 : isRun ? 0.85 : 0.55;
      const bobAmp = isSprint ? 0.11 : isRun ? 0.08 : 0.05;
      const leanAmt = isSprint ? 0.18 : isRun ? 0.12 : 0.06;

      a.walkCycle += dt * cycleSpeed;
      const s = Math.sin(a.walkCycle);
      const c = Math.cos(a.walkCycle);

      target.leftLeg.x = s * legAmp * 0.72;
      target.rightLeg.x = -s * legAmp * 0.72;
      target.leftShin = { x: 0.18 + Math.max(0, -s) * 0.55 };
      target.rightShin = { x: 0.18 + Math.max(0, s) * 0.55 };
      target.leftArm.x = -s * armAmp;
      target.rightArm.x = s * armAmp;
      target.leftArm.z = 0.14;
      target.rightArm.z = -0.14;
      target.torso.x = leanAmt;
      target.torso.z = c * 0.05;
      target.head.x = -leanAmt * 0.45;
      target.head.z = -c * 0.035;
      target.rootY = Math.abs(s) * bobAmp;
      return;
    }

    // ---- JUMP ----
    if (this.state === 'JUMP') {
      target.leftLeg.x = -0.6;
      target.rightLeg.x = -0.5;
      target.leftArm.x = -0.45;
      target.rightArm.x = -0.55;
      target.leftArm.z = 0.3;
      target.rightArm.z = -0.3;
      target.torso.x = 0.12;
      target.head.x = -0.08;

      if (this.onGround) {
        this.state = isMoving ? (isRunningKey ? 'RUN' : 'WALK') : 'IDLE';
      }
      return;
    }

    // ---- ATTACK ----
    if (this.state === 'ATTACK') {
      a.attackProgress += dt * 4.2;
      const p = Math.min(1, a.attackProgress);

      if (p < 0.4) {
        const wind = p / 0.4;
        target.rightArm.x = -0.25 - wind * 1.25;
        target.rightArm.y = wind * 0.7;
        target.rightArm.z = -wind * 0.2;
        target.torso.y = wind * 0.3;
        target.torso.x = wind * 0.08;
      } else {
        const rel = (p - 0.4) / 0.6;
        target.rightArm.x = -1.5 + rel * 2.0;
        target.rightArm.y = 0.7 - rel * 1.0;
        target.rightArm.z = -0.2 + rel * 0.35;
        target.torso.y = 0.3 - rel * 0.5;
        target.torso.x = 0.08 - rel * 0.05;
      }

      target.leftArm.x = -0.4;
      target.leftArm.z = 0.25;
      target.leftLeg.x = 0.3;
      target.rightLeg.x = 0.18;
      target.rootY = -0.05;
      target.head.x = 0.1;

      if (p >= 1) {
        a.attackProgress = 0;
        this.state = isMoving ? (isRunningKey ? 'RUN' : 'WALK') : 'IDLE';
      }
      return;
    }

    // ---- HIT ----
    if (this.state === 'HIT') {
      a.hitTimer += dt;
      const hitT = a.hitTimer;

      target.torso.x = -0.25 + Math.sin(hitT * 35) * 0.06;
      target.torso.z = Math.sin(hitT * 20) * 0.08;
      target.head.x = 0.2;
      target.head.z = Math.sin(hitT * 18) * 0.1;
      target.leftArm.x = 0.5;
      target.rightArm.x = 0.55;
      target.leftArm.z = 0.35;
      target.rightArm.z = -0.35;
      target.leftLeg.x = 0.2;
      target.rightLeg.x = 0.15;
      target.bodyZ = Math.sin(hitT * 22) * 0.14;
      target.rootY = -0.03;

      if (hitT > 0.42) {
        a.hitTimer = 0;
        this.state = isMoving ? (isRunningKey ? 'RUN' : 'WALK') : 'IDLE';
      }
      return;
    }

    if (this.state === 'EMOTE') {
      this.emoteTime += dt;
      const t = this.emoteTime;
      const n = this.emote;
      target.leftLeg.x = 0.08;
      target.rightLeg.x = 0.08;
      if (n === 'wave') {
        target.rightArm.x = -1.6 + Math.sin(t * 8) * 0.35;
        target.rightArm.z = -0.4;
        target.leftArm.z = 0.12;
      } else if (n === 'thumbsup') {
        target.rightArm.x = -1.35;
        target.rightArm.y = 0.4;
        target.rightArm.z = -0.15;
      } else if (n === 'celebrate' || n === 'victory') {
        target.leftArm.x = -2.2 + Math.sin(t * 6) * 0.2;
        target.rightArm.x = -2.3 + Math.sin(t * 6 + 0.8) * 0.2;
        target.rootY = Math.abs(Math.sin(t * 8)) * 0.06;
      } else if (n === 'clap') {
        const c = Math.abs(Math.sin(t * 10));
        target.leftArm.x = -0.9;
        target.rightArm.x = -0.9;
        target.leftArm.z = 0.35 - c * 0.25;
        target.rightArm.z = -0.35 + c * 0.25;
      } else if (n === 'happy') {
        target.leftArm.x = -0.4 + Math.sin(t * 4) * 0.15;
        target.rightArm.x = -0.4 + Math.sin(t * 4 + 1) * 0.15;
        target.head.z = Math.sin(t * 3) * 0.08;
      } else if (n === 'sad') {
        target.head.x = 0.28;
        target.leftArm.x = 0.25;
        target.rightArm.x = 0.25;
        target.torso.x = 0.08;
      } else if (n === 'worried') {
        target.head.z = Math.sin(t * 3) * 0.12;
        target.leftArm.x = 0.15;
        target.rightArm.x = 0.2;
      } else if (n === 'surprised') {
        target.leftArm.x = -1.4;
        target.rightArm.x = -1.4;
        target.leftArm.z = 0.5;
        target.rightArm.z = -0.5;
        target.head.x = -0.12;
      } else if (n === 'angry') {
        target.leftArm.x = 0.35;
        target.rightArm.x = 0.35;
        target.torso.x = 0.06;
        target.head.x = -0.06;
      } else if (n === 'thinking') {
        target.rightArm.x = -1.55;
        target.rightArm.y = 0.55;
        target.head.z = 0.15;
      } else if (n === 'prayer') {
        target.leftArm.x = -0.85;
        target.rightArm.x = -0.85;
        target.leftArm.z = 0.22;
        target.rightArm.z = -0.22;
        target.head.x = 0.18;
      }
      if (t > 2.4) {
        this.emote = null;
        this.state = 'IDLE';
      }
      return;
    }

    // ---- VICTORY ----
    if (this.state === 'VICTORY') {
      a.victoryTimer += dt;
      const v = a.victoryTimer;

      target.leftArm.x = -2.45 + Math.sin(v * 3.2) * 0.12;
      target.rightArm.x = -2.55 + Math.sin(v * 3.2 + 0.6) * 0.12;
      target.leftArm.z = 0.35;
      target.rightArm.z = -0.35;
      target.torso.x = -0.18;
      target.head.x = -0.25;
      target.leftLeg.x = 0.1;
      target.rightLeg.x = 0.1;
      target.rootY = Math.abs(Math.sin(v * 4.5)) * 0.1;
    }
  }

  _solvePlanarLeg(hipGroup, shinGroup, footY, footZ) {
    const L1 = 0.32;
    const L2 = 0.38;
    const hipY = (this.group.position.y || 0) + (this.root.position.y || 0) + hipGroup.position.y;
    const localY = footY - hipY;
    const localZ = footZ;
    let dist = Math.sqrt(localY * localY + localZ * localZ);
    const maxD = L1 + L2 - 0.02;
    const minD = 0.08;
    if (dist < minD) dist = minD;
    if (dist > maxD) dist = maxD;
    const cosKnee = (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2);
    const knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosKnee)));
    const cosHip = (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist);
    const reach = Math.atan2(localZ, -localY);
    const hip = reach - Math.acos(Math.max(-1, Math.min(1, cosHip)));
    hipGroup.rotation.x = hip;
    shinGroup.rotation.x = knee;
  }

  _applyFootIK() {
    if (!this.leftShinGroup || !this.rightShinGroup) return;
    const moving = this.state === 'WALK' || this.state === 'RUN' || this.state === 'SPRINT';
    const cycle = this.anim.walkCycle || 0;
    const s = Math.sin(cycle);
    const stride = this.state === 'SPRINT' ? 0.28 : this.state === 'RUN' ? 0.22 : 0.16;
    const ground = 0.03;
    if (moving) {
      const leftSwing = s > 0;
      const rightSwing = s < 0;
      const leftY = leftSwing ? ground + 0.1 * s : ground;
      const rightY = rightSwing ? ground + 0.1 * -s : ground;
      const leftZ = s * stride;
      const rightZ = -s * stride;
      this._solvePlanarLeg(this.leftLegGroup, this.leftShinGroup, leftY, leftZ);
      this._solvePlanarLeg(this.rightLegGroup, this.rightShinGroup, rightY, rightZ);
    } else {
      this._solvePlanarLeg(this.leftLegGroup, this.leftShinGroup, ground, 0.02);
      this._solvePlanarLeg(this.rightLegGroup, this.rightShinGroup, ground, -0.02);
    }
    if (this.leftFoot) this.leftShinGroup.rotation.x += 0.08;
    if (this.rightFoot) this.rightShinGroup.rotation.x += 0.08;
  }

  updateCamera(snap) {
    if (!this.camera || !this.group) return;
    const pos = this.group.position;
    const distIdeal = Math.max(this.cameraMinDist || 5.2, Math.min(this.cameraMaxDist || 13.5, this.cameraDistance || 8.2));
    const pitch = Math.max(0.12, Math.min(0.62, this.cameraPitch || 0.28));
    const yaw = this.cameraAngle;
    const headY = pos.y + 1.48;
    const look = new THREE.Vector3(
      pos.x - Math.sin(yaw) * 1.15,
      headY,
      pos.z - Math.cos(yaw) * 1.15
    );
    let dist = distIdeal;
    const desired = new THREE.Vector3(
      look.x + Math.sin(yaw) * dist * Math.cos(pitch),
      look.y + Math.sin(pitch) * dist + 0.35,
      look.z + Math.cos(yaw) * dist * Math.cos(pitch)
    );
    if (this.scene && THREE.Raycaster) {
      if (!this._camRay) this._camRay = new THREE.Raycaster();
      const from = look.clone();
      const path = desired.clone().sub(from);
      const len = path.length();
      if (len > 0.2) {
        this._camRay.set(from, path.normalize());
        this._camRay.far = len;
        const hits = this._camRay.intersectObjects(this.scene.children, true);
        for (let i = 0; i < hits.length; i++) {
          const h = hits[i];
          if (!h.object || !h.object.visible) continue;
          let skip = false;
          let o = h.object;
          while (o) {
            if (o === this.group) { skip = true; break; }
            o = o.parent;
          }
          if (skip) continue;
          if (h.object.geometry && h.object.geometry.type === 'SphereGeometry' && (h.object.geometry.parameters.radius || 0) > 40) continue;
          const safe = Math.max(this.cameraMinDist * 0.72, h.distance - 0.45);
          if (safe < dist) {
            dist = safe;
            desired.copy(from).addScaledVector(path, dist);
          }
          break;
        }
      }
    }
    if (!this._camPos) this._camPos = desired.clone();
    if (!this._camLook) this._camLook = look.clone();
    if (snap) {
      this._camPos.copy(desired);
      this._camLook.copy(look);
    } else {
      this._camPos.lerp(desired, 0.14);
      this._camLook.lerp(look, 0.18);
    }
    this.camera.up.set(0, 1, 0);
    this.camera.position.copy(this._camPos);
    this.camera.lookAt(this._camLook);
  }

  getPosition() {
    return this.group.position;
  }

  enableSling() {
    this.hasSling = true;
    this.slingMesh.visible = true;
  }
}

window.Player = Player;
