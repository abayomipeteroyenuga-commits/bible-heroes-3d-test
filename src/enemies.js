
// Futuristic Guardian visual layer inspired by the supplied armored-guardian reference.
// This is intentionally procedural so it remains lightweight, animated, and deployment-safe.
function addFuturisticGuardianArmor(group, anchors, options) {
  options = options || {};
  const metal = new THREE.MeshStandardMaterial({
    color: options.metal || 0x18384d, metalness: 0.82, roughness: 0.28
  });
  const dark = new THREE.MeshStandardMaterial({
    color: options.dark || 0x07141d, metalness: 0.9, roughness: 0.2
  });
  const trim = new THREE.MeshStandardMaterial({
    color: options.trim || 0x5bb9d6, metalness: 0.7, roughness: 0.22,
    emissive: options.trim || 0x5bb9d6, emissiveIntensity: 0.16
  });
  const visor = new THREE.MeshStandardMaterial({
    color: 0x071018, metalness: 0.65, roughness: 0.12,
    emissive: options.visor || 0x1ac7ff, emissiveIntensity: 0.72
  });

  // Chest reactor / segmented breastplate.
  if (anchors.torso) {
    const chest = new THREE.Group();
    chest.name = 'GuardianSciFiChest';
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.62, 0.16), metal);
    plate.position.set(0, 0.62, 0.34);
    plate.scale.set(1.05, 1, 1);
    chest.add(plate);

    const core = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.035), trim);
    core.position.set(0, 0.62, 0.435);
    chest.add(core);

    const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.05), dark);
    ribL.position.set(-0.30, 0.60, 0.42);
    ribL.rotation.z = -0.08;
    chest.add(ribL);
    const ribR = ribL.clone();
    ribR.position.x = 0.30;
    ribR.rotation.z = 0.08;
    chest.add(ribR);
    anchors.torso.add(chest);

    // Compact back power unit gives the silhouette the armored reference feel.
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.18), dark);
    pack.position.set(0, 0.68, -0.36);
    anchors.torso.add(pack);
  }

  // Helmet shell + glowing horizontal visor.
  if (anchors.head) {
    const helmet = new THREE.Group();
    helmet.name = 'GuardianSciFiHelmet';
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.43, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), metal
    );
    shell.scale.set(1.02, 0.98, 1.0);
    shell.position.set(0, 0.22, -0.01);
    helmet.add(shell);

    const visorBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.105, 0.055), visor);
    visorBar.position.set(0, 0.09, 0.39);
    helmet.add(visorBar);
    const visorLower = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.045), trim);
    visorLower.position.set(0, 0.0, 0.405);
    helmet.add(visorLower);

    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.30, 0.16), dark);
    sideL.position.set(-0.34, 0.04, 0.06);
    helmet.add(sideL);
    const sideR = sideL.clone();
    sideR.position.x = 0.34;
    helmet.add(sideR);

    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.12), trim);
    crest.position.set(0, 0.48, -0.02);
    helmet.add(crest);
    anchors.head.add(helmet);
  }

  // Heavy shoulders and forearm guards follow the existing humanoid animation groups.
  [anchors.leftArm, anchors.rightArm].forEach((arm, i) => {
    if (!arm) return;
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), metal);
    shoulder.position.set(i === 0 ? -0.08 : 0.08, 0.04, 0);
    shoulder.scale.set(1.35, 0.78, 1.05);
    arm.add(shoulder);

    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.34, 8), dark);
    fore.position.y = -0.53;
    arm.add(fore);
    const foreTrim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 5, 10), trim);
    foreTrim.rotation.x = Math.PI / 2;
    foreTrim.position.y = -0.42;
    arm.add(foreTrim);
  });

  // Knee/leg armor if leg animation groups are available.
  [anchors.leftLeg, anchors.rightLeg].forEach((leg, i) => {
    if (!leg) return;
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.15), metal);
    knee.position.set(0, -0.43, 0.05);
    leg.add(knee);
  });

  return { metal, dark, trim, visor };
}

// Shadow Guardians (polished cartoon variants) + Goliath

const GUARDIAN_VARIANTS = [
  {
    name: 'Azure Guardian', body: 0x163a52, armor: 0x2b536b, accent: 0x45c8ee,
    skin: 0xc99670, hair: 0x111820, eye: 0x9feeff,
    scale: 1.05, headScale: 0.92, bodyWide: 1.04, helm: 'armored'
  },
  {
    name: 'Steel Guardian', body: 0x1b2d3a, armor: 0x526878, accent: 0x7ed7f5,
    skin: 0xb88860, hair: 0x101418, eye: 0x8de7ff,
    scale: 1.10, headScale: 0.90, bodyWide: 1.10, helm: 'armored'
  },
  {
    name: 'Cobalt Guardian', body: 0x123a63, armor: 0x244e78, accent: 0x38bdf8,
    skin: 0xd2a07a, hair: 0x15100c, eye: 0x9eeaff,
    scale: 1.07, headScale: 0.91, bodyWide: 1.08, helm: 'elite'
  },
  {
    name: 'Titan Guardian', body: 0x152c3c, armor: 0x35576b, accent: 0x61dafb,
    skin: 0xf0c4a0, hair: 0x24170f, eye: 0xb8f4ff,
    scale: 1.15, headScale: 0.87, bodyWide: 1.16, helm: 'heavy'
  },
  {
    name: 'Obsidian Guardian', body: 0x0d1c28, armor: 0x263b49, accent: 0x29d3ff,
    skin: 0xb88860, hair: 0x0c0c0c, eye: 0x7de7ff,
    scale: 1.18, headScale: 0.86, bodyWide: 1.20, helm: 'commander'
  },
  {
    name: 'Dune Guardian', body: 0x31404a, armor: 0x6d786f, accent: 0x8dd7e8,
    skin: 0xc08050, hair: 0x201408, eye: 0xaeefff,
    scale: 1.08, headScale: 0.89, bodyWide: 1.08, helm: 'armored'
  }
];

class ShadowGuardian {
  constructor(scene, position, variantIndex, stats) {
    this.scene = scene;
    this.group = new THREE.Group();
    stats = stats || {};
    this.health = stats.health != null ? stats.health : 30;
    this.maxHealth = this.health;
    this.damage = stats.damage != null ? stats.damage : 5;
    this.speed = stats.speed != null ? stats.speed : 3.2;
    this.state = 'IDLE';
    this.detectRange = stats.detect != null ? stats.detect : 12;
    this.attackRange = 2.2;
    this.attackCooldown = 0;
    this.patrolTarget = null;
    this.animTime = 0;
    this.alive = true;
    this.hitTimer = 0;
    this.attackProgress = 0;
    this.walkCycle = 0;
    this.variant = GUARDIAN_VARIANTS[(variantIndex != null ? variantIndex : Math.floor(Math.random() * GUARDIAN_VARIANTS.length)) % GUARDIAN_VARIANTS.length];
    this.emotion = 'idle';
    this.buildModel();
    this.group.position.copy(position);
    this.group.scale.setScalar(this.variant.scale);
    this.home = position.clone();
    scene.add(this.group);
  }

  buildModel() {
    const v = this.variant;
    this.humanoid = new Humanoid(this.group, {
      skin: v.skin || 0xe0b08a,
      shirt: v.body || 0x5a4634,
      pants: v.armor || 0x4a4038,
      pantsDark: 0x2a2420,
      boot: 0x3a2a1c,
      hair: v.hair || 0x2a1a10,
      leather: v.armor || 0x6a5a48,
      armor: v.armor || 0x6a5a48,
      accent: v.accent || 0xc4a06a,
      eye: v.eye || 0x3a4a2a,
      pads: true,
      armorChest: true,
      weapon: 'club',
      helmet: ({ band: 'basic', cap: 'armored', wrap: 'wrap' }[v.helm]) || ['basic', 'armored', 'wrap', 'elite', 'heavy', 'commander'][GUARDIAN_VARIANTS.indexOf(v) % 6]
    });
    this.root = this.humanoid.root;
    this.torsoGroup = this.humanoid.torsoGroup;
    this.headGroup = this.humanoid.headGroup;
    this.leftArmGroup = this.humanoid.leftArmGroup;
    this.rightArmGroup = this.humanoid.rightArmGroup;
    this.leftLegGroup = this.humanoid.leftLegGroup;
    this.rightLegGroup = this.humanoid.rightLegGroup;
    this.leftArm = this.leftArmGroup;
    this.rightArm = this.rightArmGroup;
    this.browL = this.humanoid.browL;
    this.browR = this.humanoid.browR;

    // Upgrade every Guardian with the futuristic armored silhouette from the supplied reference.
    this.guardianArmor = addFuturisticGuardianArmor(this.group, {
      torso: this.torsoGroup,
      head: this.headGroup,
      leftArm: this.leftArmGroup,
      rightArm: this.rightArmGroup,
      leftLeg: this.leftLegGroup,
      rightLeg: this.rightLegGroup
    }, {
      metal: v.armor,
      dark: v.body,
      trim: v.accent,
      visor: v.accent
    });

    this.hpGroup = null;
    this.hpBar = null;
  }

  _updateHumanFace() {
    if (!this.browL) return;
    let z = 0.08;
    if (this.state === 'ATTACK') z = -0.12;
    else if (this.state === 'HIT') z = 0.28;
    else if (this.state === 'CHASE') z = -0.06;
    else if (this.health < this.maxHealth * 0.35) z = 0.18;
    this.browL.rotation.z = z;
    if (this.browR) this.browR.rotation.z = -z;
  }

  updateHealthBar() {}

  animate(dt) {
    let clip = this.state === 'PATROL' ? 'WALK' : this.state;
    if (clip === 'CHASE') clip = 'RUN';
    const mood = this.state === 'ATTACK' ? 'determined' : this.state === 'HIT' ? 'pain' : this.state === 'CHASE' ? 'alert' : (this.health < this.maxHealth * 0.35 ? 'worried' : 'calm');
    if (this.humanoid) this.humanoid.update(dt, clip, { mood: mood });

    if (this.state === 'HIT') {
      this.hitTimer += dt;
      if (this.hitTimer > 0.35) {
        this.hitTimer = 0;
        this.group.rotation.z = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'ATTACK') {
      this.attackProgress += dt * 2.8;
      const p = Math.min(1, this.attackProgress);
      if (!this.attackHitDone && p >= 0.5) {
        this.attackHitDone = true;
        if (window.Game && window.Game.player) {
          const d = this.group.position.distanceTo(window.Game.player.getPosition());
          if (d < this.attackRange + 0.5) {
            window.Game.player.takeDamage(this.damage);
            if (window.UI) window.UI.showMessage('HIT!', 800);
          }
        }
      }
      if (p >= 1) {
        this.attackProgress = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'CHASE' && window.Game && window.Game.player) {
      this.group.lookAt(window.Game.player.getPosition().x, this.group.position.y, window.Game.player.getPosition().z);
    }
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const dist = this.group.position.distanceTo(playerPos);

    if (this.state === 'DEFEATED') return;

    // Don't override HIT animation state machine mid-hit
    if (this.state !== 'HIT') {
      if (dist < this.attackRange) {
        this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
        if (this.state !== 'ATTACK' && this.attackCooldown <= 0) {
          this.state = 'ATTACK';
          this.attackProgress = 0;
          this.attackHitDone = false;
          this.attackCooldown = 1.4;
          if (window.AudioSystem) AudioSystem.swing();
        }
      } else if (dist < this.detectRange) {
        this.state = 'CHASE';
        const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
        this.group.position.x += dir.x * this.speed * dt;
        this.group.position.z += dir.z * this.speed * dt;
        this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      } else {
        this.state = 'PATROL';
        if (!this.patrolTarget || this.group.position.distanceTo(this.patrolTarget) < 1) {
          this.patrolTarget = this.home.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            0,
            (Math.random() - 0.5) * 8
          ));
        }
        const dir = new THREE.Vector3().subVectors(this.patrolTarget, this.group.position).normalize();
        this.group.position.x += dir.x * this.speed * 0.4 * dt;
        this.group.position.z += dir.z * this.speed * 0.4 * dt;
        this.group.lookAt(this.patrolTarget.x, this.group.position.y, this.patrolTarget.z);
      }
    }

    // Soft world bounds so enemies don't leave the play area
    if (window.Game && window.Game.world && window.Game.world.bounds) {
      const b = window.Game.world.bounds;
      this.group.position.x = Math.max(b.minX + 1, Math.min(b.maxX - 1, this.group.position.x));
      this.group.position.z = Math.max(b.minZ + 1, Math.min(b.maxZ - 1, this.group.position.z));
    }
    if (window.Game && Game.world && Game.world.resolveCircle) {
      const fixed = Game.world.resolveCircle(this.group.position.x, this.group.position.z, 0.5);
      this.group.position.x = fixed.x;
      this.group.position.z = fixed.z;
    }

    this.animate(dt);
    this.updateHealthBar();

    // Billboard health bar toward camera
    if (window.Game && window.Game.camera) {
      if (this.hpGroup) this.hpGroup.lookAt(window.Game.camera.position);
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    this.state = 'HIT';
    this.hitTimer = 0;
    if (window.Game && window.Game.player) {
      const away = this.group.position.clone().sub(window.Game.player.getPosition());
      away.y = 0;
      if (away.lengthSq() > 0.01) this.group.position.addScaledVector(away.normalize(), 0.35);
    }
    this.updateHealthBar();
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.07, 0.12);

    // Flash materials
    this.group.traverse(c => {
      if (c.isMesh && c.material && c.material.emissive) {
        const prev = c.material.emissive.getHex();
        c.material.emissive.setHex(0xffffff);
        setTimeout(() => {
          if (c.material) c.material.emissive.setHex(prev);
        }, 100);
      }
    });

    // Small knockback away from player
    if (window.Game && window.Game.player) {
      const away = new THREE.Vector3().subVectors(
        this.group.position,
        window.Game.player.getPosition()
      ).normalize();
      this.group.position.x += away.x * 0.4;
      this.group.position.z += away.z * 0.4;
    }

    if (this.health <= 0) this.defeat();
  }

  defeat() {
    this.alive = false;
    this.state = 'DEFEATED';
    if (this.hpGroup) this.hpGroup.visible = false;

    if (window.Game) {
      window.Game.spawnParticles(
        this.group.position.clone().add(new THREE.Vector3(0, 0.8, 0)),
        this.variant.accent,
        22
      );
      window.Game.player.addScore(100);
      if (window.Game.addCoins) window.Game.addCoins(6);
      if (window.UI) window.UI.showMessage('ENEMY DEFEATED! +100');
      if (window.SaveSystem) SaveSystem.bumpStat('guardiansDefeated', 1);
      if (window.RewardSystem) {
        const helm = (this.variant && this.variant.helm) || 'band';
        const kind = helm === 'cap' ? 'heavy' : helm === 'wrap' ? 'elite' : 'guardian';
        RewardSystem.onGuardian(kind, 'guard-' + (window.Game && Game.currentWorld) + '-' + Math.round(this.group.position.x) + '-' + Math.round(this.group.position.z));
      }
      if (window.AudioSystem) AudioSystem.enemyDefeat();
    }

    // Fall back + fade
    let t = 0;
    const startY = this.group.position.y;
    const fall = setInterval(() => {
      t += 0.05;
      this.group.rotation.x = Math.min(1.2, t * 2);
      this.group.position.y = startY - t * 0.3;
      this.group.traverse(c => {
        if (c.material) {
          c.material.transparent = true;
          c.material.opacity = Math.max(0, 1 - t);
        }
      });
      if (t >= 1) {
        clearInterval(fall);
        this.scene.remove(this.group);
      }
    }, 40);
  }
}

class Goliath {
  constructor(scene, position) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.health = 1000;
    this.maxHealth = 1000;
    this.damage = 15;
    this.speed = 2.4;
    this.state = 'ENTRANCE';
    this.phase = 1;
    this._announcedPhase = 1;
    this.attackCooldown = 1.5;
    this.animTime = 0;
    this.alive = true;
    this.vulnerable = 'HEAD';
    this.vulnerableTimer = 0;
    this.hitTimer = 0;
    this.stunTimer = 0;
    this.entranceTimer = 0;
    this.attackProgress = 0;
    this.walkCycle = 0;
    this.dustCooldown = 0;
    this.buildModel();
    this.group.position.copy(position);
    // True boss scale — much larger than David (~1.7) and guardians (~0.9)
    this.group.scale.set(4.0, 4.0, 4.0);
    scene.add(this.group);
  }

  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    const skinDarkMat = new THREE.MeshLambertMaterial({ color: 0xb8885a });
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x5a3b28 });
    const armorDarkMat = new THREE.MeshLambertMaterial({ color: 0x21150f });
    const bronzeMat = new THREE.MeshLambertMaterial({ color: 0xc08a3e });
    const bronzeDarkMat = new THREE.MeshLambertMaterial({ color: 0x70451e });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x5a1f1f });
    const leatherMat = new THREE.MeshLambertMaterial({ color: 0x3b2418 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2a1a10 });
    const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfff8f0 });

    this.root = new THREE.Group();
    this.group.add(this.root);

    // --- Legs ---
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.32, 0.7, 0);
    this.root.add(this.leftLegGroup);
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.55, 10), skinMat);
    thighL.position.y = -0.2;
    this.leftLegGroup.add(thighL);
    const greaveL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.45, 10), bronzeMat);
    greaveL.position.y = -0.55;
    this.leftLegGroup.add(greaveL);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.4), leatherMat);
    bootL.position.set(0, -0.82, 0.05);
    this.leftLegGroup.add(bootL);
    this.leftLeg = this.leftLegGroup;

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.32, 0.7, 0);
    this.root.add(this.rightLegGroup);
    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.55, 10), skinMat);
    thighR.position.y = -0.2;
    this.rightLegGroup.add(thighR);
    const greaveR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.45, 10), bronzeMat);
    greaveR.position.y = -0.55;
    this.rightLegGroup.add(greaveR);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.4), leatherMat);
    bootR.position.set(0, -0.82, 0.05);
    this.rightLegGroup.add(bootR);
    this.rightLeg = this.rightLegGroup;

    // --- Torso ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.7;
    this.root.add(this.torsoGroup);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 1.1, 12),
      armorMat
    );
    torso.position.y = 0.55;
    this.torsoGroup.add(torso);
    this.body = torso;

    // Chest plate detail
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.7, 0.25),
      bronzeMat
    );
    chest.position.set(0, 0.65, 0.35);
    this.torsoGroup.add(chest);

    // Skirt / cloth
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.75, 0.35, 10),
      clothMat
    );
    skirt.position.y = 0.05;
    this.torsoGroup.add(skirt);

    // Shoulder pads
    const padGeo = new THREE.SphereGeometry(0.28, 8, 6);
    const padL = new THREE.Mesh(padGeo, bronzeDarkMat);
    padL.position.set(-0.7, 1.0, 0);
    padL.scale.set(1.3, 0.8, 1);
    this.torsoGroup.add(padL);
    const padR = new THREE.Mesh(padGeo, bronzeDarkMat);
    padR.position.set(0.7, 1.0, 0);
    padR.scale.set(1.3, 0.8, 1);
    this.torsoGroup.add(padR);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.2, 8), skinMat);
    neck.position.y = 1.2;
    this.torsoGroup.add(neck);

    // --- Head ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 1.45;
    this.torsoGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 12), skinMat);
    head.scale.set(1, 1.1, 0.95);
    this.headGroup.add(head);
    this.head = head;

    // Beard
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshLambertMaterial({ color: 0x3a2a18 }));
    beard.position.set(0, -0.2, 0.12);
    beard.scale.set(1.1, 0.8, 0.9);
    this.headGroup.add(beard);

    // Eyes
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), eyeWhiteMat);
    eyeW.position.set(-0.12, 0.08, 0.32);
    eyeW.scale.set(1, 1.1, 0.5);
    this.headGroup.add(eyeW);
    const eyeW2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), eyeWhiteMat);
    eyeW2.position.set(0.12, 0.08, 0.32);
    eyeW2.scale.set(1, 1.1, 0.5);
    this.headGroup.add(eyeW2);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), eyeMat);
    pupil.position.set(-0.12, 0.07, 0.36);
    this.headGroup.add(pupil);
    const pupil2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), eyeMat);
    pupil2.position.set(0.12, 0.07, 0.36);
    this.headGroup.add(pupil2);

    // Brows
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), new THREE.MeshLambertMaterial({ color: 0x2a1a10 }));
    brow.position.set(-0.12, 0.18, 0.34);
    brow.rotation.z = 0.2;
    this.headGroup.add(brow);
    const brow2 = brow.clone();
    brow2.position.x = 0.12;
    brow2.rotation.z = -0.2;
    this.headGroup.add(brow2);

    // Helmet
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), armorDarkMat);
    helm.scale.set(1.02, 0.9, 0.98);
    helm.position.set(0, 0.23, -0.02);
    this.headGroup.add(helm);
    // Crest
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.2), bronzeMat);
    crest.position.y = 0.48;
    this.headGroup.add(crest);
    // Cheek guards
    const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.12), armorDarkMat);
    cheekL.position.set(-0.35, 0.0, 0.1);
    this.headGroup.add(cheekL);
    const cheekR = cheekL.clone();
    cheekR.position.x = 0.35;
    this.headGroup.add(cheekR);

    // --- Arms ---
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.85, 0.95, 0);
    this.torsoGroup.add(this.leftArmGroup);
    const upperL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.5, 8), skinMat);
    upperL.position.y = -0.2;
    this.leftArmGroup.add(upperL);
    const bracerL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.4, 8), bronzeMat);
    bracerL.position.y = -0.55;
    this.leftArmGroup.add(bracerL);
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), skinDarkMat);
    handL.position.y = -0.8;
    this.leftArmGroup.add(handL);
    this.leftArm = this.leftArmGroup;

    // Large shield on left arm
    this.shieldMesh = new THREE.Group();
    const shieldPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.08, 12),
      bronzeMat
    );
    shieldPlate.rotation.x = Math.PI / 2;
    this.shieldMesh.add(shieldPlate);
    const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), bronzeDarkMat);
    shieldBoss.position.z = 0.08;
    this.shieldMesh.add(shieldBoss);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 16), armorDarkMat);
    rim.rotation.x = Math.PI / 2;
    this.shieldMesh.add(rim);
    this.shieldMesh.position.set(-0.15, -0.5, 0.35);
    this.leftArmGroup.add(this.shieldMesh);
    this.shield = shieldPlate;

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.85, 0.95, 0);
    this.torsoGroup.add(this.rightArmGroup);
    const upperR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.5, 8), skinMat);
    upperR.position.y = -0.2;
    this.rightArmGroup.add(upperR);
    const bracerR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.4, 8), bronzeMat);
    bracerR.position.y = -0.55;
    this.rightArmGroup.add(bracerR);
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), skinDarkMat);
    handR.position.y = -0.8;
    this.rightArmGroup.add(handR);
    this.rightArm = this.rightArmGroup;

    // Large sword on right hand
    this.sword = new THREE.Group();
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.4, 0.18),
      new THREE.MeshLambertMaterial({ color: 0xc0c8d0 })
    );
    blade.position.y = 0.5;
    this.sword.add(blade);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 6), new THREE.MeshLambertMaterial({ color: 0xc0c8d0 }));
    tip.position.y = 1.3;
    this.sword.add(tip);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6), leatherMat);
    hilt.position.y = -0.2;
    this.sword.add(hilt);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.1), bronzeDarkMat);
    guard.position.y = -0.05;
    this.sword.add(guard);
    this.sword.position.set(0.05, -0.7, 0.1);
    this.sword.rotation.z = -0.15;
    this.rightArmGroup.add(this.sword);

    // Vulnerable markers
    this.vulnMarkers = {};
    const markerGeo = new THREE.SphereGeometry(0.18, 8, 6);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.75 });
    ['HEAD', 'ARMOR', 'SHIELD'].forEach(key => {
      const m = new THREE.Mesh(markerGeo, markerMat.clone());
      if (key === 'HEAD') m.position.set(0, 1.7, 0.5);
      if (key === 'ARMOR') m.position.set(0, 0.7, 0.55);
      if (key === 'SHIELD') m.position.set(-1.0, 0.4, 0.5);
      m.visible = false;
      this.torsoGroup.add(m);
      this.vulnMarkers[key] = m;
    });
  }

  animate(dt) {
    // Reset
    if (this.state !== 'DEFEATED') {
      this.leftArmGroup.rotation.set(0, 0, 0.15);
      this.rightArmGroup.rotation.set(0, 0, -0.15);
      this.leftLegGroup.rotation.set(0, 0, 0);
      this.rightLegGroup.rotation.set(0, 0, 0);
      this.torsoGroup.rotation.set(0, 0, 0);
      this.headGroup.rotation.set(0, 0, 0);
      this.root.position.y = 0;
    }

    if (this.state === 'ENTRANCE') {
      this.entranceTimer += dt;
      const t = Math.min(1, this.entranceTimer / 2.2);
      // Rise + roar pose
      this.root.position.y = (1 - t) * 2.5;
      this.rightArmGroup.rotation.x = -1.2 * t;
      this.leftArmGroup.rotation.x = -0.6 * t;
      this.headGroup.rotation.x = -0.25 * t;
      this.torsoGroup.rotation.x = -0.1 * t;
      if (t >= 1) {
        this.state = 'IDLE';
        this.attackCooldown = 1.0;
      }
      return;
    }

    if (this.state === 'HIT') {
      this.hitTimer += dt;
      this.torsoGroup.rotation.x = -0.2;
      this.headGroup.rotation.x = 0.15;
      this.group.rotation.z = Math.sin(this.hitTimer * 25) * 0.08;
      if (this.hitTimer > 0.4) {
        this.hitTimer = 0;
        this.group.rotation.z = 0;
        this.state = this.stunTimer > 0 ? 'STUN' : 'CHASE';
      }
      return;
    }

    if (this.state === 'STUN') {
      this.stunTimer -= dt;
      this.headGroup.rotation.x = 0.35;
      this.torsoGroup.rotation.x = 0.15;
      this.rightArmGroup.rotation.x = 0.4;
      this.leftArmGroup.rotation.x = 0.4;
      if (this.stunTimer <= 0) this.state = 'CHASE';
      return;
    }

    if (this.state === 'ROAR') {
      this.attackProgress += dt;
      this.headGroup.rotation.x = -0.4;
      this.rightArmGroup.rotation.x = -1.5;
      this.leftArmGroup.rotation.x = -1.0;
      this.torsoGroup.rotation.x = -0.15;
      if (this.attackProgress > 1.2) {
        this.attackProgress = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'STRIKE' || this.state === 'CHARGE') {
      this.attackProgress += dt * 2.2;
      const p = Math.min(1, this.attackProgress);
      if (p < 0.35) {
        this.rightArmGroup.rotation.x = -0.5 - (p / 0.35) * 1.4;
        this.torsoGroup.rotation.y = (p / 0.35) * 0.3;
      } else {
        const r = (p - 0.35) / 0.65;
        this.rightArmGroup.rotation.x = -1.9 + r * 2.2;
        this.torsoGroup.rotation.y = 0.3 - r * 0.4;
        if (!this.attackHitDone && p >= 0.45) {
          this.attackHitDone = true;
          if (window.Game && window.Game.player) {
            const d = this.group.position.distanceTo(window.Game.player.getPosition());
            const range = this._pendingAttackRange || 8;
            if (d < range) {
              window.Game.player.takeDamage(this._pendingAttackDamage || this.damage);
              if (window.UI) window.UI.showMessage(this._pendingAttackMsg || 'HIT!', 1000);
            }
          }
        }
      }
      this.leftArmGroup.rotation.x = -0.5;
      if (p >= 1) {
        this.attackProgress = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'CHASE') {
      this.walkCycle += dt * 5;
      const s = Math.sin(this.walkCycle);
      this.leftLegGroup.rotation.x = s * 0.45;
      this.rightLegGroup.rotation.x = -s * 0.45;
      this.leftArmGroup.rotation.x = -s * 0.3;
      this.rightArmGroup.rotation.x = s * 0.35;
      this.torsoGroup.rotation.z = Math.cos(this.walkCycle) * 0.04;
      this.root.position.y = Math.abs(s) * 0.05;
      // Footstep dust
      this.dustCooldown -= dt;
      if (this.dustCooldown <= 0 && window.Game) {
        this.dustCooldown = 0.55;
        const foot = this.group.position.clone();
        foot.y = 0.05;
        window.Game.spawnParticles(foot, 0xc2b280, 4);
      }
      return;
    }

    // IDLE breathing
    const breath = Math.sin(this.animTime * 1.6) * 0.025;
    this.torsoGroup.position.y = 0.7 + breath;
    this.headGroup.rotation.y = Math.sin(this.animTime * 0.6) * 0.08;
    this.rightArmGroup.rotation.z = -0.15 + Math.sin(this.animTime * 1.2) * 0.05;
    this.leftArmGroup.rotation.z = 0.15 + Math.sin(this.animTime * 1.2 + 1) * 0.04;
    this.sword.rotation.z = -0.15 + Math.sin(this.animTime * 1.2) * 0.03;
  }

  update(dt, playerPos) {
    if (!this.alive || this.state === 'DEFEATED') {
      this.animate(dt);
      return;
    }
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    this.vulnerableTimer -= dt;

    const hpRatio = Math.max(0, this.health / this.maxHealth);
    const nextPhase = hpRatio < 0.3 ? 3 : hpRatio < 0.6 ? 2 : 1;
    if (nextPhase > this.phase) this.enterPhase(nextPhase);
    else this.phase = nextPhase;

    // Busy / reaction states — no new decisions
    if (this.state === 'ENTRANCE' || this.state === 'HIT' || this.state === 'STUN') {
      this.animate(dt);
      return;
    }

    // Charge lunge moves over time toward stored direction
    if (this.state === 'CHARGE' && this._chargeDir) {
      const dash = (this.phase === 3 ? 16 : 12) * dt;
      this.group.position.x += this._chargeDir.x * dash;
      this.group.position.z += this._chargeDir.z * dash;
      this._clampBossBounds();
    }

    if (this.state === 'ROAR' || this.state === 'STRIKE' || this.state === 'CHARGE') {
      this.animate(dt);
      return;
    }

    const speedMult = this.phase === 1 ? 1 : this.phase === 2 ? 1.35 : 1.7;
    const dist = this.group.position.distanceTo(playerPos);

    if (this.vulnerableTimer <= 0) {
      const opts = ['HEAD', 'ARMOR', 'SHIELD'];
      this.vulnerable = opts[Math.floor(Math.random() * 3)];
      this.vulnerableTimer = this.phase === 3 ? 3 : 4;
      Object.keys(this.vulnMarkers).forEach(k => {
        this.vulnMarkers[k].visible = (k === this.vulnerable);
      });
    }

    this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);

    const strikeRange = 8;
    const chaseRange = 11;

    if (dist > chaseRange) {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position);
      dir.y = 0;
      if (dir.lengthSq() > 0.001) dir.normalize();
      this.group.position.x += dir.x * this.speed * speedMult * dt;
      this.group.position.z += dir.z * this.speed * speedMult * dt;
      this._clampBossBounds();
      this.state = 'CHASE';
    } else if (this.attackCooldown <= 0) {
      this.chooseAttack(dist, playerPos);
      this.attackCooldown = this.phase === 3 ? 1.7 : this.phase === 2 ? 2.2 : 2.6;
    } else if (dist > strikeRange) {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position);
      dir.y = 0;
      if (dir.lengthSq() > 0.001) dir.normalize();
      this.group.position.x += dir.x * this.speed * 0.55 * speedMult * dt;
      this.group.position.z += dir.z * this.speed * 0.55 * speedMult * dt;
      this._clampBossBounds();
      this.state = 'CHASE';
    } else {
      this.state = 'IDLE';
    }

    this.animate(dt);
  }

  enterPhase(n) {
    this.phase = n;
    this._announcedPhase = n;
    this.state = 'ROAR';
    this.roarTimer = 1.1;
    this.attackCooldown = 0.4;
    if (window.UI) {
      UI.showMessage(n === 3 ? 'GOLIATH ENRAGED!' : 'GOLIATH GROWS STRONGER!', 2200);
      if (UI.updateBoss) UI.updateBoss(this.health, this.maxHealth);
    }
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.35, 0.45);
    if (window.Game && window.Game.spawnParticles) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 2.2, 0)), 0xe06030, 14);
    }
    if (window.AudioSystem) {
      if (n === 3 && AudioSystem.bossEnrage) AudioSystem.bossEnrage();
      else if (AudioSystem.bossPhase) AudioSystem.bossPhase();
      else if (AudioSystem.goliathAppear) AudioSystem.goliathAppear();
    }
    this.group.scale.multiplyScalar(n === 3 ? 1.08 : 1.04);
  }

  chooseAttack(dist, playerPos) {
    this.attackProgress = 0;
    // Prefer strike up close, charge at mid range, roar when farther or in late phase
    let roll = Math.random();
    if (this.phase === 3) roll -= 0.1;
    if (dist < 7) {
      if (roll < 0.55) this.groundStrike(playerPos);
      else if (roll < 0.8) this.roar();
      else this.charge(playerPos);
    } else if (dist < 12) {
      if (roll < 0.35) this.groundStrike(playerPos);
      else if (roll < 0.55) this.roar();
      else this.charge(playerPos);
    } else {
      if (roll < 0.45) this.roar();
      else this.charge(playerPos);
    }
  }

  _clampBossBounds() {
    const b = window.Game && window.Game.world && window.Game.world.bounds;
    if (!b) return;
    this.group.position.x = Math.max(b.minX + 4, Math.min(b.maxX - 4, this.group.position.x));
    this.group.position.z = Math.max(b.minZ + 4, Math.min(b.maxZ - 4, this.group.position.z));
  }

  groundStrike(playerPos) {
    this.state = 'STRIKE';
    this.attackProgress = 0;
    this.attackHitDone = false;
    if (window.AudioSystem) AudioSystem.bossSwing();
    this._pendingAttackDamage = this.damage * (this.phase === 3 ? 1.25 : 1);
    this._pendingAttackMsg = 'GROUND STRIKE!';
    this._pendingAttackRange = 9;
    if (window.Game) window.Game.spawnShockwave(this.group.position.clone());
  }

  roar() {
    this.state = 'ROAR';
    this.attackProgress = 0;
    if (window.UI) window.UI.showMessage('GOLIATH ROARS!', 1200);
    if (window.AudioSystem) {
      if (AudioSystem.bossRoar) AudioSystem.bossRoar();
      else AudioSystem.goliathAppear();
    }
    if (window.Game && window.Game.player) {
      window.Game.player.speed = 3;
      setTimeout(() => { if (window.Game && window.Game.player) window.Game.player.speed = 6; }, 2000);
    }
  }

  charge(playerPos) {
    this.state = 'CHARGE';
    this.attackProgress = 0;
    this.attackHitDone = false;
    if (window.AudioSystem) {
      if (AudioSystem.bossCharge) AudioSystem.bossCharge();
      else AudioSystem.bossSwing();
    }
    this._pendingAttackDamage = this.damage * (this.phase === 3 ? 1.4 : 1.2);
    this._pendingAttackMsg = 'CHARGE!';
    this._pendingAttackRange = 6;
    const dir = new THREE.Vector3().subVectors(playerPos, this.group.position);
    dir.y = 0;
    if (dir.lengthSq() > 0.001) dir.normalize();
    else dir.set(0, 0, -1);
    this._chargeDir = dir;
  }

  takeDamage(amount, hitZone) {
    if (!this.alive || this.state === 'ENTRANCE' || this.state === 'DEFEATED') return;
    let dmg = amount;
    // Zone multipliers
    if (hitZone === 'HEAD') dmg *= 1.5;
    else if (hitZone === 'SHIELD') dmg *= 0.4;
    else if (hitZone === 'ARMOR') dmg *= 0.85;
    if (hitZone === this.vulnerable) {
      dmg *= 2.5;
      if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.22, 0.28);
      if (window.UI) window.UI.showMessage('CRITICAL HIT!', 900);
      if (window.SaveSystem) {
        SaveSystem.bumpStat('criticalHits', 1);
        SaveSystem.setAchievement('bullseye');
      }
      this.stunTimer = 0.9;
    } else if (window.UI) {
      window.UI.showMessage(hitZone + ' HIT', 700);
    }
    this.health = Math.max(0, this.health - dmg);
    if (window.AudioSystem && AudioSystem.bossHit) AudioSystem.bossHit();
    if (window.UI) window.UI.updateBoss(this.health, this.maxHealth);
    this.state = 'HIT';
    this.hitTimer = 0;
    // Flash
    this.group.traverse(c => {
      if (c.isMesh && c.material && c.material.emissive) {
        const prev = c.material.emissive.getHex();
        c.material.emissive.setHex(0xff6666);
        setTimeout(() => { if (c.material) c.material.emissive.setHex(prev); }, 120);
      }
    });
    if (window.Game) {
      window.Game.spawnParticles(
        this.group.position.clone().add(new THREE.Vector3(0, 4, 0)),
        0xf1c40f,
        10
      );
    }
    if (this.health <= 0) this.defeat();
  }

  defeat() {
    this.alive = false;
    this.state = 'DEFEATED';
    Object.values(this.vulnMarkers).forEach(m => { m.visible = false; });
    if (window.Game) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 4, 0)), 0xf1c40f, 40);
      if (window.UI) {
        window.UI.showMessage('GOLIATH DEFEATED!');
        window.UI.hideBoss();
        if (window.SaveSystem) SaveSystem.bumpStat('bossesDefeated', 1);
        if (window.RewardSystem) RewardSystem.onBoss(true, 40);
        if (window.AudioSystem) AudioSystem.enemyDefeat();
      }
    }
    // Safe fall + fade
    let t = 0;
    const fall = setInterval(() => {
      t += 0.04;
      this.group.rotation.x = Math.min(1.3, t * 1.5);
      this.group.position.y -= 0.08;
      this.group.traverse(c => {
        if (c.material) {
          c.material.transparent = true;
          c.material.opacity = Math.max(0, 1 - t);
        }
      });
      if (t >= 1) {
        clearInterval(fall);
        this.scene.remove(this.group);
        if (window.Game) window.Game.onBossDefeated();
      }
    }, 40);
  }
}

class WorldBoss {
  constructor(scene, position, worldId) {
    const spec = (window.getWorldBoss && window.getWorldBoss(worldId)) || {
      name: 'World Boss', title: 'BOSS', color: 0x5a3a7a, accent: 0xc4a06a, hp: 200, dmg: 10, scale: 2
    };
    this.scene = scene;
    this.spec = spec;
    this.name = spec.name;
    this.group = new THREE.Group();
    this.health = spec.hp;
    this.maxHealth = spec.hp;
    this.damage = spec.dmg;
    this.speed = spec.speed || 2.6;
    this.baseSpeed = this.speed;
    this.state = 'IDLE';
    this.phase = 1;
    this.detectRange = spec.detect || 20;
    this.attackRange = spec.range || 3.3;
    this.attacks = spec.attacks || ['swing'];
    this.attackKind = 'swing';
    this.attackCooldown = spec.cooldown || 1.6;
    this.baseCooldown = this.attackCooldown;
    this.windup = 0;
    this.recover = 0;
    this.chargeT = 0;
    this.chargeDir = new THREE.Vector3();
    this._announcedPhase = 1;
    this.animTime = 0;
    this.alive = true;
    this.hitTimer = 0;
    this.attackProgress = 0;
    this.buildModel(spec);
    this.group.position.copy(position);
    const bossScale = spec.style === 'guardian-colossus'
      ? Math.max(4.25, spec.scale || 4.25)
      : (spec.scale || 2);
    this.group.scale.setScalar(bossScale);
    scene.add(this.group);
  }

  buildModel(spec) {
    this.humanoid = new Humanoid(this.group, {
      skin: spec.skin || 0xc4a07a,
      shirt: spec.color || 0x5a3a7a,
      pants: spec.color || 0x4a3040,
      boot: 0x2a1a14,
      hair: spec.hair || 0x1a100c,
      leather: spec.accent || 0xc4a06a,
      armor: spec.accent || 0xc4a06a,
      accent: spec.accent || 0xc4a06a,
      pads: true,
      armorChest: true,
      weapon: spec.weapon || 'club',
      helmet: 'boss'
    });
    this.root = this.humanoid.root;

    // World 39 uses the oversized futuristic Guardian/Colossus style.
    if (spec.style === 'guardian-colossus') {
      this.guardianArmor = addFuturisticGuardianArmor(this.group, {
        torso: this.humanoid.torsoGroup,
        head: this.humanoid.headGroup,
        leftArm: this.humanoid.armL.root,
        rightArm: this.humanoid.armR.root,
        leftLeg: this.humanoid.thighL,
        rightLeg: this.humanoid.thighR
      }, {
        metal: spec.color || 0x173b52,
        dark: 0x07151e,
        trim: spec.accent || 0x45c8ee,
        visor: spec.accent || 0x45c8ee
      });
    }

    this.leftArm = this.humanoid.armL.root;
    this.rightArm = this.humanoid.armR.root;
    this.leftLeg = this.humanoid.thighL;
    this.rightLeg = this.humanoid.thighR;
    this.head = this.humanoid.head;
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;
    if (this.recover > 0) this.recover -= dt;

    const ratio = this.health / Math.max(1, this.maxHealth);
    const nextPhase = ratio <= 0.3 ? 3 : ratio <= 0.6 ? 2 : 1;
    if (nextPhase > this.phase) this.enterPhase(nextPhase);

    const to = playerPos.clone().sub(this.group.position);
    to.y = 0;
    const dist = to.length();

    if (this.hitTimer > 0) {
      this.state = 'HIT';
    } else if (this.windup > 0) {
      this.state = 'ATTACK';
      this.windup -= dt;
      if (this.attackKind === 'charge') {
        this.group.position.addScaledVector(this.chargeDir, this.speed * 2.2 * dt);
      }
      if (this.windup <= 0) {
        this.resolveAttack(dist, playerPos);
        this.recover = this.phase === 3 ? 0.22 : 0.38;
        this.state = 'RECOVER';
      }
    } else if (this.recover > 0) {
      this.state = 'RECOVER';
    } else if (dist > this.detectRange) {
      this.state = 'IDLE';
    } else if (dist > this.attackRange) {
      this.state = 'CHASE';
      const dir = to.normalize();
      this.group.position.addScaledVector(dir, this.speed * dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
    } else {
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      if (this.attackCooldown <= 0) this.beginAttack(dist, to);
      else this.state = 'CHASE';
    }

    if (window.Game && Game.world && Game.world.resolveCircle) {
      const fixed = Game.world.resolveCircle(this.group.position.x, this.group.position.z, 0.9);
      this.group.position.x = fixed.x;
      this.group.position.z = fixed.z;
    }
    if (this.humanoid) {
      const clip = this.state === 'ATTACK' ? 'ATTACK' : this.state === 'HIT' ? 'HIT' : this.state === 'CHASE' ? 'RUN' : 'IDLE';
      this.humanoid.update(dt, clip, { mood: this.phase >= 3 ? 'determined' : 'alert', fire: this.state === 'ATTACK' });
    }
  }

  enterPhase(n) {
    this.phase = n;
    this._announcedPhase = n;
    this.speed = this.baseSpeed * (n === 3 ? 1.38 : n === 2 ? 1.2 : 1);
    this.attackCooldown = 0.35;
    this.recover = 0.2;
    if (n >= 2 && this.attacks.indexOf('charge') === -1) this.attacks.push('charge');
    if (n >= 3 && this.attacks.indexOf('slam') === -1) this.attacks.push('slam');
    if (window.UI) UI.showMessage(n === 3 ? this.name.toUpperCase() + ' ENRAGED!' : this.name.toUpperCase() + ' — PHASE ' + n + '!', 1800);
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.28, 0.35);
    if (window.Game && window.Game.spawnParticles) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 1.6, 0)), this.spec.accent || 0xe06030, 12);
    }
    if (window.AudioSystem) {
      if (n === 3 && AudioSystem.bossEnrage) AudioSystem.bossEnrage();
      else if (AudioSystem.bossPhase) AudioSystem.bossPhase();
      else if (AudioSystem.bossSwing) AudioSystem.bossSwing();
    }
  }

  beginAttack(dist, to) {
    const list = this.attacks && this.attacks.length ? this.attacks : ['swing'];
    this.attackKind = list[Math.floor(Math.random() * list.length)];
    const cd = this.phase === 3 ? this.baseCooldown * 0.62 : this.phase === 2 ? this.baseCooldown * 0.8 : this.baseCooldown;
    this.attackCooldown = cd;
    this.windup = this.attackKind === 'charge' ? 0.55 : this.attackKind === 'slam' ? 0.48 : 0.34;
    this.chargeDir.copy(to).setY(0);
    if (this.chargeDir.lengthSq() > 0) this.chargeDir.normalize();
    this.state = 'ATTACK';
    if (window.AudioSystem) {
      if (this.attackKind === 'charge' && AudioSystem.bossCharge) AudioSystem.bossCharge();
      else if (this.attackKind === 'slam' && AudioSystem.bossWindup) AudioSystem.bossWindup();
      else if (AudioSystem.bossSwing) AudioSystem.bossSwing();
    }
    if (window.UI) {
      const label = this.attackKind === 'charge' ? 'CHARGE!' : this.attackKind === 'slam' ? 'SLAM!' : this.attackKind === 'throw' ? 'THROW!' : this.attackKind === 'shock' ? 'SHOCKWAVE!' : 'STRIKE!';
      UI.showMessage(label, 700);
    }
  }

  resolveAttack(dist, playerPos) {
    if (!window.Game || !window.Game.player) return;
    let hit = false;
    let dmg = this.damage;
    if (this.attackKind === 'throw' || this.attackKind === 'shock') {
      hit = dist < (this.attackKind === 'shock' ? 7 : 12);
      dmg = Math.round(this.damage * (this.attackKind === 'shock' ? 1.15 : 0.85));
    } else if (this.attackKind === 'charge') {
      hit = dist < this.attackRange + 1.8;
      dmg = Math.round(this.damage * 1.2);
    } else if (this.attackKind === 'slam') {
      hit = dist < this.attackRange + 0.8;
      dmg = Math.round(this.damage * 1.3);
    } else {
      hit = dist < this.attackRange + 0.4;
    }
    if (hit) {
      window.Game.player.takeDamage(dmg);
      if (window.Game.addCameraShake) window.Game.addCameraShake(this.attackKind === 'slam' || this.attackKind === 'shock' ? 0.28 : 0.18, 0.2);
      if (window.AudioSystem) {
        if ((this.attackKind === 'slam' || this.attackKind === 'shock') && AudioSystem.bossSlam) AudioSystem.bossSlam();
        else if (AudioSystem.impact) AudioSystem.impact();
      }
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.hitTimer = 0.25;
    if (window.AudioSystem && AudioSystem.bossHit) AudioSystem.bossHit();
    if (window.Game && window.Game.addCameraShake) window.Game.addCameraShake(0.18, 0.22);
    if (window.UI) window.UI.updateBoss(this.health, this.maxHealth);
    if (window.Game) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 2, 0)), this.spec.accent, 8);
    }
    if (this.health <= 0) this.defeat();
  }

  defeat() {
    this.alive = false;
    if (window.UI) {
      window.UI.showMessage(this.name.toUpperCase() + ' DEFEATED!');
      window.UI.hideBoss();
    }
    if (window.Game) {
      window.Game.addCoins(25);
      if (window.Game.player) window.Game.player.addScore(250);
    }
    if (window.SaveSystem) SaveSystem.bumpStat('bossesDefeated', 1);
    if (window.RewardSystem) RewardSystem.onBoss(false, window.Game && Game.currentWorld);
    if (window.AudioSystem) {
      if (AudioSystem.bossDefeat) AudioSystem.bossDefeat();
      else AudioSystem.enemyDefeat();
    }
    let t = 0;
    const fall = setInterval(() => {
      t += 0.05;
      this.group.rotation.x = Math.min(1.2, t * 1.6);
      this.group.position.y -= 0.06;
      this.group.traverse(c => {
        if (c.material) {
          c.material.transparent = true;
          c.material.opacity = Math.max(0, 1 - t);
        }
      });
      if (t >= 1) {
        clearInterval(fall);
        this.scene.remove(this.group);
        if (window.Game) window.Game.onBossDefeated();
      }
    }, 40);
  }
}

window.ShadowGuardian = ShadowGuardian;
window.Goliath = Goliath;
window.WorldBoss = WorldBoss;
