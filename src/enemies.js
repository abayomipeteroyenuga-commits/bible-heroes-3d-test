// Shadow Guardians (polished cartoon variants) + Goliath

const GUARDIAN_VARIANTS = [
  {
    name: 'Shade Scout',
    body: 0x3a2450,
    armor: 0x5a3a7a,
    accent: 0x8b5cf6,
    skin: 0x6b5a7a,
    eye: 0xc4b5fd,
    scale: 0.88,
    headScale: 1.05,
    bodyWide: 0.92
  },
  {
    name: 'Night Brute',
    body: 0x2a2035,
    armor: 0x4a5568,
    accent: 0x63b3ed,
    skin: 0x5a5068,
    eye: 0x90cdf4,
    scale: 0.95,
    headScale: 0.92,
    bodyWide: 1.12
  },
  {
    name: 'Ember Warden',
    body: 0x3d2a28,
    armor: 0x744210,
    accent: 0xf6ad55,
    skin: 0x7a5a50,
    eye: 0xfbd38d,
    scale: 0.90,
    headScale: 1.0,
    bodyWide: 1.0
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
    this.detectRange = 12;
    this.attackRange = 2.2;
    this.attackCooldown = 0;
    this.patrolTarget = null;
    this.animTime = 0;
    this.alive = true;
    this.hitTimer = 0;
    this.attackProgress = 0;
    this.walkCycle = 0;
    this.variant = GUARDIAN_VARIANTS[(variantIndex != null ? variantIndex : Math.floor(Math.random() * 3)) % 3];
    this.buildModel();
    this.group.position.copy(position);
    this.group.scale.setScalar(this.variant.scale);
    this.home = position.clone();
    scene.add(this.group);
  }

  buildModel() {
    const v = this.variant;
    const bodyMat = new THREE.MeshLambertMaterial({ color: v.body });
    const armorMat = new THREE.MeshLambertMaterial({ color: v.armor });
    const accentMat = new THREE.MeshLambertMaterial({ color: v.accent });
    const skinMat = new THREE.MeshLambertMaterial({ color: v.skin });
    const eyeMat = new THREE.MeshBasicMaterial({ color: v.eye });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1a1228 });

    this.root = new THREE.Group();
    this.group.add(this.root);

    // --- Legs ---
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.14, 0.55, 0);
    this.root.add(this.leftLegGroup);
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 7), bodyMat);
    thighL.position.y = -0.12;
    this.leftLegGroup.add(thighL);
    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.26, 7), skinMat);
    shinL.position.y = -0.36;
    this.leftLegGroup.add(shinL);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.2), darkMat);
    bootL.position.set(0, -0.52, 0.02);
    this.leftLegGroup.add(bootL);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.14, 0.55, 0);
    this.root.add(this.rightLegGroup);
    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 7), bodyMat);
    thighR.position.y = -0.12;
    this.rightLegGroup.add(thighR);
    const shinR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.26, 7), skinMat);
    shinR.position.y = -0.36;
    this.rightLegGroup.add(shinR);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.2), darkMat);
    bootR.position.set(0, -0.52, 0.02);
    this.rightLegGroup.add(bootR);

    // --- Torso ---
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.55;
    this.root.add(this.torsoGroup);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * v.bodyWide, 0.26 * v.bodyWide, 0.5, 8),
      armorMat
    );
    torso.position.y = 0.28;
    this.torsoGroup.add(torso);
    this.bodyMesh = torso;

    // Shoulder pads
    const padGeo = new THREE.SphereGeometry(0.12, 6, 5);
    const padL = new THREE.Mesh(padGeo, accentMat);
    padL.position.set(-0.28 * v.bodyWide, 0.48, 0);
    padL.scale.set(1.2, 0.7, 1);
    this.torsoGroup.add(padL);
    const padR = new THREE.Mesh(padGeo, accentMat);
    padR.position.set(0.28 * v.bodyWide, 0.48, 0);
    padR.scale.set(1.2, 0.7, 1);
    this.torsoGroup.add(padR);

    // Belt
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.27 * v.bodyWide, 0.27 * v.bodyWide, 0.06, 8), darkMat);
    belt.position.y = 0.08;
    this.torsoGroup.add(belt);

    // --- Head ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.62;
    this.torsoGroup.add(this.headGroup);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22 * v.headScale, 10, 8),
      skinMat
    );
    head.scale.set(1, 1.05, 0.95);
    this.headGroup.add(head);

    // Helmet / hood variation by type
    if (v.name === 'Shade Scout') {
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.35, 7), bodyMat);
      hood.position.y = 0.2;
      this.headGroup.add(hood);
    } else if (v.name === 'Night Brute') {
      const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.22, 8), armorMat);
      helm.position.y = 0.12;
      this.headGroup.add(helm);
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.12), accentMat);
      crest.position.y = 0.28;
      this.headGroup.add(crest);
    } else {
      // Ember Warden mask
      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.12), armorMat);
      mask.position.set(0, 0.02, 0.16);
      this.headGroup.add(mask);
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 5), accentMat);
      hornL.position.set(-0.14, 0.22, 0);
      hornL.rotation.z = 0.4;
      this.headGroup.add(hornL);
      const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 5), accentMat);
      hornR.position.set(0.14, 0.22, 0);
      hornR.rotation.z = -0.4;
      this.headGroup.add(hornR);
    }

    // Glowing eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 6, 5);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.08, 0.04, 0.18 * v.headScale);
    this.headGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.08, 0.04, 0.18 * v.headScale);
    this.headGroup.add(eyeR);

    // --- Arms ---
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.32 * v.bodyWide, 0.48, 0);
    this.torsoGroup.add(this.leftArmGroup);
    const upperL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.28, 6), skinMat);
    upperL.position.y = -0.12;
    this.leftArmGroup.add(upperL);
    const lowerL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.24, 6), bodyMat);
    lowerL.position.y = -0.36;
    this.leftArmGroup.add(lowerL);
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), skinMat);
    handL.position.y = -0.5;
    this.leftArmGroup.add(handL);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.32 * v.bodyWide, 0.48, 0);
    this.torsoGroup.add(this.rightArmGroup);
    const upperR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.28, 6), skinMat);
    upperR.position.y = -0.12;
    this.rightArmGroup.add(upperR);
    const lowerR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.24, 6), bodyMat);
    lowerR.position.y = -0.36;
    this.rightArmGroup.add(lowerR);
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), skinMat);
    handR.position.y = -0.5;
    this.rightArmGroup.add(handR);

    // Weapon / claw on right hand (child-friendly)
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 5), accentMat);
    claw.position.set(0, -0.62, 0.05);
    claw.rotation.x = Math.PI;
    this.rightArmGroup.add(claw);

    // Compatibility refs for any external code
    this.leftArm = this.leftArmGroup;
    this.rightArm = this.rightArmGroup;

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

  updateHealthBar() {
    const ratio = Math.max(0, this.health / this.maxHealth);
    this.hpBar.scale.x = Math.max(0.01, ratio);
    this.hpBar.position.x = -this.hpBarBaseWidth * 0.5 * (1 - ratio);
    this.hpBar.material.color.setHex(ratio > 0.5 ? 0x48bb78 : ratio > 0.25 ? 0xed8936 : 0xe53e3e);
  }

  animate(dt) {
    // Reset joint rotations
    this.leftArmGroup.rotation.set(0, 0, 0.12);
    this.rightArmGroup.rotation.set(0, 0, -0.12);
    this.leftLegGroup.rotation.set(0, 0, 0);
    this.rightLegGroup.rotation.set(0, 0, 0);
    this.torsoGroup.rotation.set(0, 0, 0);
    this.headGroup.rotation.set(0, 0, 0);
    this.root.position.y = 0;

    if (this.state === 'HIT') {
      this.hitTimer += dt;
      const t = this.hitTimer;
      this.torsoGroup.rotation.x = -0.25;
      this.headGroup.rotation.x = 0.2;
      this.leftArmGroup.rotation.x = 0.5;
      this.rightArmGroup.rotation.x = 0.5;
      this.group.rotation.z = Math.sin(t * 30) * 0.12;
      if (t > 0.35) {
        this.hitTimer = 0;
        this.group.rotation.z = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'ATTACK') {
      this.attackProgress += dt * 2.8;
      const p = Math.min(1, this.attackProgress);
      if (p < 0.45) {
        const w = p / 0.45;
        this.rightArmGroup.rotation.x = -0.4 - w * 1.2;
        this.torsoGroup.rotation.y = w * 0.25;
      } else {
        const r = (p - 0.45) / 0.55;
        this.rightArmGroup.rotation.x = -1.6 + r * 1.8;
        this.torsoGroup.rotation.y = 0.25 - r * 0.35;
        // Impact frame
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
      }
      this.leftArmGroup.rotation.x = -0.3;
      this.leftLegGroup.rotation.x = 0.2;
      this.rightLegGroup.rotation.x = 0.15;
      if (p >= 1) {
        this.attackProgress = 0;
        this.state = 'CHASE';
      }
      return;
    }

    if (this.state === 'CHASE' || this.state === 'PATROL') {
      const speed = this.state === 'CHASE' ? 10 : 6;
      const amp = this.state === 'CHASE' ? 0.55 : 0.35;
      this.walkCycle += dt * speed;
      const s = Math.sin(this.walkCycle);
      this.leftLegGroup.rotation.x = s * amp;
      this.rightLegGroup.rotation.x = -s * amp;
      this.leftArmGroup.rotation.x = -s * amp * 0.9;
      this.rightArmGroup.rotation.x = s * amp * 0.9;
      this.torsoGroup.rotation.z = Math.cos(this.walkCycle) * 0.04;
      this.root.position.y = Math.abs(s) * (this.state === 'CHASE' ? 0.06 : 0.03);
      this.headGroup.rotation.x = -0.05;
      return;
    }

    // IDLE breathing
    const breath = Math.sin(this.animTime * 2.2) * 0.03;
    this.torsoGroup.position.y = 0.55 + breath;
    this.headGroup.rotation.y = Math.sin(this.animTime * 0.8) * 0.12;
    this.headGroup.rotation.x = Math.sin(this.animTime * 1.1) * 0.04;
    this.leftArmGroup.rotation.z = 0.12 + Math.sin(this.animTime * 1.5) * 0.05;
    this.rightArmGroup.rotation.z = -0.12 + Math.sin(this.animTime * 1.5 + 1) * 0.05;
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
    this.updateHealthBar();

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
    if (hpRatio < 0.3) this.phase = 3;
    else if (hpRatio < 0.6) this.phase = 2;
    else this.phase = 1;

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
    this._pendingAttackDamage = this.damage * (this.phase === 3 ? 1.25 : 1);
    this._pendingAttackMsg = 'GROUND STRIKE!';
    this._pendingAttackRange = 9;
    if (window.Game) window.Game.spawnShockwave(this.group.position.clone());
  }

  roar() {
    this.state = 'ROAR';
    this.attackProgress = 0;
    if (window.UI) window.UI.showMessage('GOLIATH ROARS!', 1200);
    if (window.Game && window.Game.player) {
      window.Game.player.speed = 3;
      setTimeout(() => { if (window.Game && window.Game.player) window.Game.player.speed = 6; }, 2000);
    }
  }

  charge(playerPos) {
    this.state = 'CHARGE';
    this.attackProgress = 0;
    this.attackHitDone = false;
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
    this.speed = 2.6;
    this.state = 'CHASE';
    this.attackCooldown = 1.4;
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
    const body = new THREE.MeshLambertMaterial({ color: spec.color });
    const accent = new THREE.MeshLambertMaterial({ color: spec.accent });
    const skin = new THREE.MeshLambertMaterial({ color: 0xc4a07a });
    this.root = new THREE.Group();
    this.group.add(this.root);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 1.05, 8), body);
    torso.position.y = 1.15;
    this.root.add(torso);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.5), accent);
    chest.position.set(0, 1.35, 0.08);
    this.root.add(chest);
    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), skin);
    this.head.position.y = 1.85;
    this.root.add(this.head);
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.28, 8), accent);
    helm.position.y = 2.08;
    this.root.add(helm);
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.48, 1.4, 0);
    this.root.add(this.leftArm);
    this.leftArm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 6), skin));
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.48, 1.4, 0);
    this.root.add(this.rightArm);
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 1.1, 6), accent);
    club.position.set(0, -0.55, 0.1);
    this.rightArm.add(club);
    this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.8, 6), body);
    this.leftLeg.position.set(-0.2, 0.4, 0);
    this.root.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.8, 6), body);
    this.rightLeg.position.set(0.2, 0.4, 0);
    this.root.add(this.rightLeg);
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
      return;
    }
    const to = playerPos.clone().sub(this.group.position);
    to.y = 0;
    const dist = to.length();
    if (dist > 0.2) {
      const dir = to.normalize();
      this.group.position.addScaledVector(dir, this.speed * dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
    }
    const walk = Math.sin(this.animTime * 6) * 0.35;
    if (this.leftLeg) this.leftLeg.rotation.x = walk;
    if (this.rightLeg) this.rightLeg.rotation.x = -walk;
    if (this.leftArm) this.leftArm.rotation.x = -walk * 0.6;
    if (this.rightArm) this.rightArm.rotation.x = walk * 0.6;
    if (dist < 3.2 && this.attackCooldown <= 0) {
      this.attackCooldown = 1.8;
      this.rightArm.rotation.x = -1.2;
      if (window.Game && window.Game.player) window.Game.player.takeDamage(this.damage);
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.hitTimer = 0.25;
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
