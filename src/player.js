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
    this.score = 0;
    this.hasSling = false;
    this.stones = 0;
    this.invincible = 0;
    this.shieldActive = 0;
    this.attackCooldown = 0;
    this.state = 'IDLE'; // IDLE | WALK | RUN | JUMP | ATTACK | HIT | VICTORY
    this.facing = 0;
    this.animTime = 0;
    this.keys = {};
    this.mouse = { x: 0, y: 0, locked: false };
    this.cameraAngle = 0;
    this.cameraPitch = 0.35;
    this.cameraDistance = 7;
    this.joystick = { active: false, x: 0, y: 0 };
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 800;
    this.checkpoint = new THREE.Vector3(0, 1, 8);
    this.buildModel();
    scene.add(this.group);
    this.setupControls();
  }

  buildModel() {
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3d2914 });
    const sandalMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const staffMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });

    // Root — vertical bob only
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Torso (pivots at hips)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.7;
    this.root.add(this.torsoGroup);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.35), clothMat);
    torso.position.y = 0.35;
    this.torsoGroup.add(torso);
    this.torso = torso;

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.85;
    this.torsoGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), bodyMat);
    this.headGroup.add(head);
    this.head = head;

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), hairMat);
    hair.position.y = 0.12;
    hair.scale.set(1, 0.55, 1);
    this.headGroup.add(hair);

    // Left arm (shoulder pivot)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.38, 0.55, 0);
    this.torsoGroup.add(this.leftArmGroup);
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), bodyMat);
    this.leftArm.position.y = -0.28;
    this.leftArmGroup.add(this.leftArm);

    // Right arm (shoulder pivot)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.38, 0.55, 0);
    this.torsoGroup.add(this.rightArmGroup);
    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), bodyMat);
    this.rightArm.position.y = -0.28;
    this.rightArmGroup.add(this.rightArm);

    // Staff parented to left arm
    this.staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.55, 6), staffMat);
    this.staff.position.set(-0.08, -0.55, 0.05);
    this.staff.rotation.z = 0.12;
    this.leftArmGroup.add(this.staff);

    // Sling parented to right arm (hidden until collected)
    this.slingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0x5c4033 })
    );
    this.slingMesh.position.set(0.05, -0.35, 0.15);
    this.slingMesh.rotation.x = Math.PI / 2;
    this.slingMesh.visible = false;
    this.rightArmGroup.add(this.slingMesh);

    // Left leg (hip pivot)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.15, 0.7, 0);
    this.root.add(this.leftLegGroup);
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.22), clothMat);
    this.leftLeg.position.y = -0.28;
    this.leftLegGroup.add(this.leftLeg);
    const ls = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.3), sandalMat);
    ls.position.set(0, -0.58, 0.03);
    this.leftLegGroup.add(ls);

    // Right leg (hip pivot)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.15, 0.7, 0);
    this.root.add(this.rightLegGroup);
    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.22), clothMat);
    this.rightLeg.position.y = -0.28;
    this.rightLegGroup.add(this.rightLeg);
    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.3), sandalMat);
    rs.position.set(0, -0.58, 0.03);
    this.rightLegGroup.add(rs);

    // Shield of Faith
    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    // Procedural animation state + blend targets
    this.anim = {
      walkCycle: 0,
      attackProgress: 0,
      hitTimer: 0,
      victoryTimer: 0,
      bob: 0,
      idleBreath: 0,
      // Current blended pose (lerped each frame)
      pose: this._emptyPose(),
      // Blend speeds (higher = snappier)
      blendSpeed: {
        IDLE: 8,
        WALK: 12,
        RUN: 14,
        JUMP: 10,
        ATTACK: 18,
        HIT: 20,
        VICTORY: 6
      }
    };

    this.group.position.set(0, 0, 8);
  }

  _emptyPose() {
    return {
      leftArm: { x: 0, y: 0, z: 0 },
      rightArm: { x: 0, y: 0, z: 0 },
      leftLeg: { x: 0, y: 0, z: 0 },
      rightLeg: { x: 0, y: 0, z: 0 },
      torso: { x: 0, y: 0, z: 0, py: 0.7 },
      head: { x: 0, y: 0, z: 0 },
      rootY: 0,
      bodyZ: 0
    };
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Escape') {
        if (window.Game && window.Game.state === 'playing') window.Game.pause();
      }
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    document.addEventListener('mousemove', e => {
      if (!this.isMobile && this.mouse.locked) {
        this.cameraAngle -= e.movementX * 0.003;
        this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + e.movementY * 0.002));
      }
    });

    document.addEventListener('mousedown', e => {
      if (e.button === 0 && window.Game && window.Game.state === 'playing') {
        this.tryAttack();
      }
    });

    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        if (!this.isMobile && window.Game && window.Game.state === 'playing') {
          canvas.requestPointerLock && canvas.requestPointerLock();
        }
      });
    }
    document.addEventListener('pointerlockchange', () => {
      this.mouse.locked = document.pointerLockElement === document.getElementById('game-canvas');
    });

    this.setupJoystick();
    this.setupMobileButtons();
  }

  setupJoystick() {
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    if (!base) return;

    const maxDist = 40;
    let startX, startY;

    const onStart = (e) => {
      e.preventDefault();
      this.joystick.active = true;
      const rect = base.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };

    const onMove = (e) => {
      if (!this.joystick.active) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      let dx = t.clientX - startX;
      let dy = t.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this.joystick.x = dx / maxDist;
      this.joystick.y = dy / maxDist;
    };

    const onEnd = () => {
      this.joystick.active = false;
      this.joystick.x = 0;
      this.joystick.y = 0;
      stick.style.transform = 'translate(-50%, -50%)';
    };

    base.addEventListener('touchstart', onStart, { passive: false });
    base.addEventListener('touchmove', onMove, { passive: false });
    base.addEventListener('touchend', onEnd);
    base.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  setupMobileButtons() {
    const map = {
      'btn-jump': () => this.tryJump(),
      'btn-attack': () => this.tryAttack(),
      'btn-special': () => this.tryFaithShield(),
      'btn-interact': () => { if (window.Game) window.Game.tryInteract(); }
    };
    Object.keys(map).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const handler = (e) => { e.preventDefault(); map[id](); };
        btn.addEventListener('touchstart', handler, { passive: false });
        btn.addEventListener('mousedown', handler);
      }
    });
  }

  tryJump() {
    if (this.onGround && this.canJump) {
      this.velocity.y = this.jumpForce;
      this.onGround = false;
      this.canJump = false;
      this.state = 'JUMP';
      this.anim.walkCycle = 0;
    }
  }

  tryAttack() {
    if (this.attackCooldown > 0 || !this.hasSling) return;
    this.attackCooldown = 0.5;
    this.state = 'ATTACK';
    this.anim.attackProgress = 0;
    if (window.Game) window.Game.spawnProjectile();
  }

  tryFaithShield() {
    if (this.faith < 25 || this.shieldActive > 0) return;
    this.faith -= 25;
    this.shieldActive = 4;
    this.shieldMesh.visible = true;
    if (window.UI) window.UI.showMessage('SHIELD OF FAITH!');
    if (window.Game) window.Game.updateHUD();
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
    if (this.keys['Space']) this.tryJump();
    if (this.keys['KeyQ']) this.tryFaithShield();
    if (this.keys['KeyE'] && window.Game) window.Game.tryInteract();

    const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const moveSpeed = this.speed * (isRunning ? this.runMultiplier : 1);

    const forward = new THREE.Vector3(-Math.sin(this.cameraAngle), 0, -Math.cos(this.cameraAngle));
    const right = new THREE.Vector3(Math.cos(this.cameraAngle), 0, -Math.sin(this.cameraAngle));
    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, -inputZ);
    this.direction.addScaledVector(right, inputX);

    const busy = this.state === 'ATTACK' || this.state === 'HIT' || this.state === 'VICTORY';

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      this.facing = Math.atan2(this.direction.x, this.direction.z);
      this.group.rotation.y = this.facing;
      this.velocity.x = this.direction.x * moveSpeed;
      this.velocity.z = this.direction.z * moveSpeed;
      if (!busy && this.onGround) this.state = isRunning ? 'RUN' : 'WALK';
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
      if (this.onGround && !busy) this.state = 'IDLE';
    }

    this.velocity.y -= this.gravity * dt;
    this.group.position.x += this.velocity.x * dt;
    this.group.position.y += this.velocity.y * dt;
    this.group.position.z += this.velocity.z * dt;

    if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocity.y = 0;
      this.onGround = true;
      this.canJump = true;
    } else {
      this.onGround = false;
    }

    if (worldBounds) {
      this.group.position.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, this.group.position.x));
      this.group.position.z = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, this.group.position.z));
    }

    this.animate(dt);
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
    const isRunningKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'];

    // Resolve airborne → JUMP
    if (!this.onGround && this.state !== 'ATTACK' && this.state !== 'HIT' && this.state !== 'VICTORY') {
      this.state = 'JUMP';
    }

    // Build target pose for current state
    const target = this._emptyPose();
    this._computeTargetPose(target, dt, isMoving, isRunningKey);

    // Blend speed depends on state (attack/hit snap faster)
    const speed = a.blendSpeed[this.state] || 10;
    const k = 1 - Math.exp(-speed * dt); // frame-rate independent lerp factor

    this._lerpPose(a.pose, target, k);

    // Apply blended pose to skeleton
    const p = a.pose;
    this.leftArmGroup.rotation.set(p.leftArm.x, p.leftArm.y, p.leftArm.z);
    this.rightArmGroup.rotation.set(p.rightArm.x, p.rightArm.y, p.rightArm.z);
    this.leftLegGroup.rotation.set(p.leftLeg.x, p.leftLeg.y, p.leftLeg.z);
    this.rightLegGroup.rotation.set(p.rightLeg.x, p.rightLeg.y, p.rightLeg.z);
    this.torsoGroup.rotation.set(p.torso.x, p.torso.y, p.torso.z);
    this.torsoGroup.position.y = p.torso.py;
    this.headGroup.rotation.set(p.head.x, p.head.y, p.head.z);
    this.root.position.y = p.rootY;
    this.group.rotation.z = p.bodyZ;

    a.bob = p.rootY;

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
    lerp3(cur.torso, tgt.torso);
    cur.torso.py += (tgt.torso.py - cur.torso.py) * k;
    lerp3(cur.head, tgt.head);
    cur.rootY += (tgt.rootY - cur.rootY) * k;
    cur.bodyZ += (tgt.bodyZ - cur.bodyZ) * k;
  }

  _computeTargetPose(target, dt, isMoving, isRunningKey) {
    const a = this.anim;

    // ---- IDLE ----
    if (this.state === 'IDLE') {
      a.idleBreath += dt * 2.2;
      const breath = Math.sin(a.idleBreath) * 0.03;
      target.torso.py = 0.7 + breath;
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
    if (this.state === 'WALK' || this.state === 'RUN') {
      const isRun = this.state === 'RUN';
      const cycleSpeed = isRun ? 14 : 9;
      const legAmp = isRun ? 0.8 : 0.52;
      const armAmp = isRun ? 0.9 : 0.58;
      const bobAmp = isRun ? 0.1 : 0.055;
      const leanAmt = isRun ? 0.14 : 0.07;

      a.walkCycle += dt * cycleSpeed;
      const s = Math.sin(a.walkCycle);
      const c = Math.cos(a.walkCycle);

      target.leftLeg.x = s * legAmp;
      target.rightLeg.x = -s * legAmp;
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

  updateCamera() {
    const target = this.group.position.clone();
    target.y += 1.4;
    const offset = new THREE.Vector3(
      Math.sin(this.cameraAngle) * this.cameraDistance * Math.cos(this.cameraPitch),
      Math.sin(this.cameraPitch) * this.cameraDistance + 1.5,
      Math.cos(this.cameraAngle) * this.cameraDistance * Math.cos(this.cameraPitch)
    );
    const desired = target.clone().add(offset);
    this.camera.position.lerp(desired, 0.12);
    this.camera.lookAt(target);
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
