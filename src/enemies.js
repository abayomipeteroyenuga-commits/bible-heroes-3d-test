// Shadow Guardians (polished cartoon variants) + Goliath

const GUARDIAN_VARIANTS = [
  {
    name: 'Valley Guard',
    body: 0x5a4634, armor: 0x8a6a48, accent: 0xc4a06a,
    skin: 0xe0b08a, hair: 0x2a1a10, eye: 0x3a4a2a,
    scale: 0.94, headScale: 0.92, bodyWide: 0.95, helm: 'band'
  },
  {
    name: 'Ridge Soldier',
    body: 0x4a4038, armor: 0x6a6860, accent: 0xb0a090,
    skin: 0xc99670, hair: 0x1a120c, eye: 0x4a3020,
    scale: 1.02, headScale: 0.88, bodyWide: 1.12, helm: 'cap'
  },
  {
    name: 'Camp Watchman',
    body: 0x3a4a38, armor: 0x6a5a38, accent: 0xd0b060,
    skin: 0xd2a07a, hair: 0x3a2414, eye: 0x2a3a5a,
    scale: 0.96, headScale: 0.9, bodyWide: 1.0, helm: 'wrap'
  },
  {
    name: 'Brook Sentinel',
    body: 0x3a4a50, armor: 0x5a6a68, accent: 0x88b0b8,
    skin: 0xf0c4a0, hair: 0x4a3020, eye: 0x2a5080,
    scale: 0.93, headScale: 0.91, bodyWide: 0.92, helm: 'band'
  },
  {
    name: 'Iron Levy',
    body: 0x3a3a40, armor: 0x6a6a72, accent: 0xc0c4c8,
    skin: 0xb88860, hair: 0x120c08, eye: 0x2a2018,
    scale: 1.05, headScale: 0.86, bodyWide: 1.16, helm: 'cap'
  },
  {
    name: 'Desert Scout',
    body: 0x8a6a40, armor: 0xa08050, accent: 0xe8c070,
    skin: 0xc08050, hair: 0x201408, eye: 0x3a2818,
    scale: 0.95, headScale: 0.9, bodyWide: 0.98, helm: 'wrap'
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
      weapon: 'club'
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

    // --- Health bar (billboard) ---
    this.hpGroup = new THREE.Group();
    this.hpGroup.position.y = 1.55;
    this.group.add(this.hpGroup);

    const barBg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x1a1a2e, transparent: true, opacity: 0.85, depthTest: false })
    );
    this.hpGroup.add(barBg);

    this.hpBar = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xe53e3e, transparent: true, opacity: 0.95, depthTest: false })
    );
    this.hpBar.position.z = 0.01;
    this.hpGroup.add(this.hpBar);
    this.hpBarBaseWidth = 0.66;
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

  updateHealthBar() {
    const ratio = Math.max(0, this.health / this.maxHealth);
    this.hpBar.scale.x = Math.max(0.01, ratio);
    this.hpBar.position.x = -this.hpBarBaseWidth * 0.5 * (1 - ratio);
    this.hpBar.material.color.setHex(ratio > 0.5 ? 0x48bb78 : ratio > 0.25 ? 0xed8936 : 0xe53e3e);
  }

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

    this.animate(dt);
    this.updateHealthBar();

    // Billboard health bar toward camera
    if (window.Game && window.Game.camera) {
      this.hpGroup.lookAt(window.Game.camera.position);
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
    this.hpGroup.visible = false;

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
    this.group.scale.set(3.4, 3.4, 3.4);
    scene.add(this.group);
  }

  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    const skinDarkMat = new THREE.MeshLambertMaterial({ color: 0xb8885a });
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x5a6a7a });
    const armorDarkMat = new THREE.MeshLambertMaterial({ color: 0x3a4a5a });
    const bronzeMat = new THREE.MeshLambertMaterial({ color: 0xb8956a });
    const bronzeDarkMat = new THREE.MeshLambertMaterial({ color: 0x8a6a40 });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x6b3a2a });
    const leatherMat = new THREE.MeshLambertMaterial({ color: 0x5c4030 });
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
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.4, 10), armorDarkMat);
    helm.position.y = 0.22;
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
    this.group.scale.set(spec.scale || 2, spec.scale || 2, spec.scale || 2);
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
      weapon: spec.weapon || 'club'
    });
    this.root = this.humanoid.root;
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
