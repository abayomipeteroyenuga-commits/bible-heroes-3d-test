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
    this.pendingProjectile = false;
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
    // Polished cartoon shepherd — materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xf0c4a0 });
    const skinShadowMat = new THREE.MeshLambertMaterial({ color: 0xe0a880 });
    const tunicMat = new THREE.MeshLambertMaterial({ color: 0x3f9a5c });
    const tunicMidMat = new THREE.MeshLambertMaterial({ color: 0x348a50 });
    const tunicDarkMat = new THREE.MeshLambertMaterial({ color: 0x2a6e40 });
    const beltMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    const beltDarkMat = new THREE.MeshLambertMaterial({ color: 0x6B4423 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3d2814 });
    const hairLightMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a });
    const sandalMat = new THREE.MeshLambertMaterial({ color: 0x7a4e2e });
    const staffMat = new THREE.MeshLambertMaterial({ color: 0xb8845a });
    const clothAccentMat = new THREE.MeshLambertMaterial({ color: 0xd4b06a });
    const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfffef8 });
    const eyeIrisMat = new THREE.MeshLambertMaterial({ color: 0x3a5a8a });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1208 });
    const cheekMat = new THREE.MeshLambertMaterial({ color: 0xf0a090 });
    const lipMat = new THREE.MeshLambertMaterial({ color: 0xd07070 });
    const pouchMat = new THREE.MeshLambertMaterial({ color: 0x9a7040 });

    // ── Root (vertical bob) ──
    this.root = new THREE.Group();
    this.group.add(this.root);

    // ── Torso (hip pivot) ──
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.72;
    this.root.add(this.torsoGroup);

    // Soft rounded torso (higher segs)
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.30, 0.36, 0.70, 14),
      tunicMat
    );
    torso.position.y = 0.36;
    this.torsoGroup.add(torso);
    this.torso = torso;

    // Chest panel detail
    const chest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.30, 0.28, 12),
      tunicMidMat
    );
    chest.position.y = 0.48;
    this.torsoGroup.add(chest);

    // Hem flare (skirt of tunic)
    const hem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.44, 0.16, 14),
      tunicDarkMat
    );
    hem.position.y = 0.02;
    this.torsoGroup.add(hem);

    // Fold lines (simple strips)
    for (let i = 0; i < 3; i++) {
      const fold = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.35, 0.01),
        tunicDarkMat
      );
      fold.position.set(-0.12 + i * 0.12, 0.28, 0.34);
      this.torsoGroup.add(fold);
    }

    // Belt + buckle
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.33, 0.09, 12),
      beltMat
    );
    belt.position.y = 0.20;
    this.torsoGroup.add(belt);
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.05),
      clothAccentMat
    );
    buckle.position.set(0, 0.20, 0.34);
    this.torsoGroup.add(buckle);
    // Belt ends
    const beltEnd = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.03), beltDarkMat);
    beltEnd.position.set(0.12, 0.08, 0.32);
    this.torsoGroup.add(beltEnd);

    // Stone pouch on hip
    const pouch = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 6),
      pouchMat
    );
    pouch.position.set(0.32, 0.14, 0.1);
    pouch.scale.set(0.9, 1.1, 0.7);
    this.torsoGroup.add(pouch);
    const pouchStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.02),
      beltMat
    );
    pouchStrap.position.set(0.28, 0.22, 0.12);
    this.torsoGroup.add(pouchStrap);

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.14, 10),
      skinMat
    );
    neck.position.y = 0.78;
    this.torsoGroup.add(neck);

    // ── Head ──
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.98;
    this.torsoGroup.add(this.headGroup);

    // Smooth head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 16, 14),
      skinMat
    );
    head.scale.set(1.0, 1.08, 0.96);
    this.headGroup.add(head);
    this.head = head;

    // Jaw soften
    const chin = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 8),
      skinShadowMat
    );
    chin.position.set(0, -0.14, 0.08);
    chin.scale.set(1.1, 0.7, 0.9);
    this.headGroup.add(chin);

    // Hair volume (smooth)
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 12),
      hairMat
    );
    hairCap.position.y = 0.1;
    hairCap.scale.set(1.05, 0.72, 1.02);
    this.headGroup.add(hairCap);

    // Bangs
    const bangs = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      hairLightMat
    );
    bangs.position.set(0, 0.16, 0.24);
    bangs.scale.set(1.7, 0.55, 0.55);
    this.headGroup.add(bangs);

    // Side curls
    [[-0.28, 0.0, 0.06], [0.28, 0.0, 0.06], [-0.22, -0.08, -0.05], [0.22, -0.08, -0.05]].forEach((p, i) => {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), i < 2 ? hairMat : hairLightMat);
      lock.position.set(p[0], p[1], p[2]);
      lock.scale.set(0.75, 1.3, 0.85);
      this.headGroup.add(lock);
    });

    // Large cartoon eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.085, 10, 8);
    const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeL.position.set(-0.11, 0.05, 0.25);
    eyeL.scale.set(1.05, 1.2, 0.55);
    this.headGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeR.position.set(0.11, 0.05, 0.25);
    eyeR.scale.set(1.05, 1.2, 0.55);
    this.headGroup.add(eyeR);

    // Iris
    const irisGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const irisL = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisL.position.set(-0.11, 0.04, 0.29);
    this.headGroup.add(irisL);
    const irisR = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisR.position.set(0.11, 0.04, 0.29);
    this.headGroup.add(irisR);

    // Pupils + shine
    const pupilGeo = new THREE.SphereGeometry(0.025, 6, 5);
    const pupilL = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilL.position.set(-0.11, 0.04, 0.32);
    this.headGroup.add(pupilL);
    const pupilR = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilR.position.set(0.11, 0.04, 0.32);
    this.headGroup.add(pupilR);
    const shineGeo = new THREE.SphereGeometry(0.012, 5, 4);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shineL = new THREE.Mesh(shineGeo, shineMat);
    shineL.position.set(-0.09, 0.06, 0.33);
    this.headGroup.add(shineL);
    const shineR = new THREE.Mesh(shineGeo, shineMat);
    shineR.position.set(0.13, 0.06, 0.33);
    this.headGroup.add(shineR);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.11, 0.022, 0.025);
    const browL = new THREE.Mesh(browGeo, hairMat);
    browL.position.set(-0.11, 0.15, 0.27);
    browL.rotation.z = 0.12;
    this.headGroup.add(browL);
    const browR = new THREE.Mesh(browGeo, hairMat);
    browR.position.set(0.11, 0.15, 0.27);
    browR.rotation.z = -0.12;
    this.headGroup.add(browR);

    // Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.055, 8, 6);
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.22, -0.02, 0.18);
    cheekL.scale.set(1, 0.7, 0.5);
    this.headGroup.add(cheekL);
    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(0.22, -0.02, 0.18);
    cheekR.scale.set(1, 0.7, 0.5);
    this.headGroup.add(cheekR);

    // Nose
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 6),
      skinShadowMat
    );
    nose.position.set(0, 0.0, 0.30);
    nose.scale.set(0.75, 1.0, 1.15);
    this.headGroup.add(nose);

    // Smile
    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI),
      lipMat
    );
    smile.position.set(0, -0.1, 0.27);
    smile.rotation.set(Math.PI, 0, Math.PI);
    this.headGroup.add(smile);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.06, 8, 6);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.28, 0.02, 0);
    earL.scale.set(0.5, 1, 0.7);
    this.headGroup.add(earL);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.28, 0.02, 0);
    earR.scale.set(0.5, 1, 0.7);
    this.headGroup.add(earR);

    // ── Left arm ──
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.40, 0.58, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const sleeveL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.10, 0.18, 10),
      tunicMat
    );
    sleeveL.position.y = -0.02;
    this.leftArmGroup.add(sleeveL);

    const upperArmL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 0.30, 10),
      skinMat
    );
    upperArmL.position.y = -0.18;
    this.leftArmGroup.add(upperArmL);

    const forearmL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.28, 10),
      skinMat
    );
    forearmL.position.y = -0.44;
    this.leftArmGroup.add(forearmL);

    const handL = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      skinMat
    );
    handL.position.y = -0.60;
    handL.scale.set(1.05, 0.85, 1.15);
    this.leftArmGroup.add(handL);
    this.leftArm = upperArmL;

    // Staff (parented to left hand)
    this.staff = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.032, 1.7, 8),
      staffMat
    );
    pole.position.y = 0.35;
    this.staff.add(pole);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), staffMat);
    knob.position.y = 1.22;
    this.staff.add(knob);
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), beltDarkMat);
    base.position.y = -0.5;
    this.staff.add(base);
    this.staff.position.set(-0.05, -0.52, 0.04);
    this.staff.rotation.z = 0.08;
    this.leftArmGroup.add(this.staff);

    // ── Right arm ──
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.40, 0.58, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const sleeveR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.10, 0.18, 10),
      tunicMat
    );
    sleeveR.position.y = -0.02;
    this.rightArmGroup.add(sleeveR);

    const upperArmR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 0.30, 10),
      skinMat
    );
    upperArmR.position.y = -0.18;
    this.rightArmGroup.add(upperArmR);

    const forearmR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.28, 10),
      skinMat
    );
    forearmR.position.y = -0.44;
    this.rightArmGroup.add(forearmR);

    const handR = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      skinMat
    );
    handR.position.y = -0.60;
    handR.scale.set(1.05, 0.85, 1.15);
    this.rightArmGroup.add(handR);
    this.rightArm = upperArmR;

    // Sling (parented to right hand) — visible once collected
    this.slingMesh = new THREE.Group();
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.018, 8, 14),
      beltMat
    );
    loop.rotation.x = Math.PI / 2;
    this.slingMesh.add(loop);
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.32, 5),
      beltDarkMat
    );
    cord.position.y = -0.18;
    this.slingMesh.add(cord);
    const pouchS = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 6),
      clothAccentMat
    );
    pouchS.position.y = -0.34;
    pouchS.scale.set(1.3, 0.7, 0.9);
    this.slingMesh.add(pouchS);
    this.slingMesh.position.set(0.04, -0.52, 0.1);
    this.slingMesh.visible = false;
    this.rightArmGroup.add(this.slingMesh);

    // ── Left leg ──
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.14, 0.72, 0);
    this.root.add(this.leftLegGroup);

    const thighL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.1, 0.32, 10),
      tunicDarkMat
    );
    thighL.position.y = -0.14;
    this.leftLegGroup.add(thighL);

    const shinL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 0.30, 10),
      skinMat
    );
    shinL.position.y = -0.42;
    this.leftLegGroup.add(shinL);
    this.leftLeg = thighL;

    const sandalL = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.05, 0.28),
      sandalMat
    );
    sandalL.position.set(0, -0.60, 0.03);
    this.leftLegGroup.add(sandalL);
    const strapL = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.03, 0.035),
      clothAccentMat
    );
    strapL.position.set(0, -0.56, 0.08);
    this.leftLegGroup.add(strapL);
    const ankleL = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 10),
      beltMat
    );
    ankleL.position.set(0, -0.55, 0);
    ankleL.rotation.x = Math.PI / 2;
    this.leftLegGroup.add(ankleL);

    // ── Right leg ──
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.14, 0.72, 0);
    this.root.add(this.rightLegGroup);

    const thighR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.1, 0.32, 10),
      tunicDarkMat
    );
    thighR.position.y = -0.14;
    this.rightLegGroup.add(thighR);

    const shinR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 0.30, 10),
      skinMat
    );
    shinR.position.y = -0.42;
    this.rightLegGroup.add(shinR);
    this.rightLeg = thighR;

    const sandalR = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.05, 0.28),
      sandalMat
    );
    sandalR.position.set(0, -0.60, 0.03);
    this.rightLegGroup.add(sandalR);
    const strapR = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.03, 0.035),
      clothAccentMat
    );
    strapR.position.set(0, -0.56, 0.08);
    this.rightLegGroup.add(strapR);
    const ankleR = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 10),
      beltMat
    );
    ankleR.position.set(0, -0.55, 0);
    ankleR.rotation.x = Math.PI / 2;
    this.rightLegGroup.add(ankleR);

    // ── Faith Shield ──
    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xf1c40f,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
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

      // F = Fire Sling (existing tryAttack — no duplicate system)
      const isF = code === 'KeyF' || key === 'f';
      if (isF) {
        e.preventDefault();
        this.tryAttack();
        return;
      }

      if (code === 'KeyQ' || key === 'q') {
        e.preventDefault();
        this.tryFaithShield();
        return;
      }

      if (code === 'Space' || key === ' ') {
        e.preventDefault();
        this.tryJump();
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

    // Capture on window so F works with pointer-lock / no canvas focus.
    // Single target avoids double-firing the same key event.
    window.addEventListener('keydown', this._onKeyDown, true);
    window.addEventListener('keyup', this._onKeyUp, true);

    document.addEventListener('mousemove', e => {
      if (!this.isMobile && this.mouse.locked) {
        this.cameraAngle -= e.movementX * 0.003;
        this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + e.movementY * 0.002));
      }
    });

    // Left click still uses the same tryAttack (unchanged)
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
    if (this.state === 'HIT' || this.state === 'VICTORY' || this.state === 'ATTACK') return;
    this.attackCooldown = 0.85;
    this.state = 'ATTACK';
    this.anim.attackProgress = 0;
    this.pendingProjectile = true; // launch at sling-release frame
  }

  tryFaithShield() {
    if (this.faith < 25 || this.shieldActive > 0) return;
    this.faith -= 25;
    this.shieldActive = 4;
    this.shieldMesh.visible = true;
    if (window.UI) window.UI.showMessage('SHIELD OF FAITH!');
    if (window.AudioSystem) window.AudioSystem.faithShield();
    if (window.SaveSystem) SaveSystem.bumpStat('faithShieldUses', 1);
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
      this.pendingProjectile = false;
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

    const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const moveSpeed = this.speed * (isRunning ? this.runMultiplier : 1);

    const forward = new THREE.Vector3(-Math.sin(this.cameraAngle), 0, -Math.cos(this.cameraAngle));
    const right = new THREE.Vector3(Math.cos(this.cameraAngle), 0, -Math.sin(this.cameraAngle));
    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, -inputZ);
    this.direction.addScaledVector(right, inputX);

    const busy = this.state === 'ATTACK' || this.state === 'HIT' || this.state === 'VICTORY';

    if (busy) {
      // No locomotion during attack / hit / victory
      this.velocity.x *= 0.6;
      this.velocity.z *= 0.6;
      if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.05) this.velocity.z = 0;
    } else if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      this.facing = Math.atan2(this.direction.x, this.direction.z);
      this.group.rotation.y = this.facing;
      this.velocity.x = this.direction.x * moveSpeed;
      this.velocity.z = this.direction.z * moveSpeed;
      if (this.onGround) this.state = isRunning ? 'RUN' : 'WALK';
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
      if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.05) this.velocity.z = 0;
      if (this.onGround) this.state = 'IDLE';
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

    // Launch sling stone at release frame (~45% through ATTACK)
    if (this.state === 'ATTACK' && this.pendingProjectile && this.anim.attackProgress >= 0.45) {
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
