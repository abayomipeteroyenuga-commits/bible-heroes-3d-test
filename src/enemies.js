// Shadow Guardians + Goliath
class ShadowGuardian {
  constructor(scene, position) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.health = 30;
    this.maxHealth = 30;
    this.damage = 5;
    this.speed = 3.2;
    this.state = 'IDLE'; // IDLE, PATROL, DETECT, CHASE, ATTACK, HIT, DEFEATED
    this.detectRange = 12;
    this.attackRange = 2.2;
    this.attackCooldown = 0;
    this.patrolTarget = null;
    this.animTime = 0;
    this.alive = true;
    this.buildModel();
    this.group.position.copy(position);
    this.home = position.clone();
    scene.add(this.group);
  }

  buildModel() {
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x2c1a3a });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x6b3fa0 });

    // Body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 6), darkMat);
    body.position.y = 0.9;
    this.group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), darkMat);
    head.position.y = 1.7;
    this.group.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 6, 4);
    const le = new THREE.Mesh(eyeGeo, glowMat);
    le.position.set(-0.12, 1.75, 0.28);
    this.group.add(le);
    const re = new THREE.Mesh(eyeGeo, glowMat);
    re.position.set(0.12, 1.75, 0.28);
    this.group.add(re);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    this.leftArm = new THREE.Mesh(armGeo, darkMat);
    this.leftArm.position.set(-0.45, 1.1, 0);
    this.group.add(this.leftArm);
    this.rightArm = new THREE.Mesh(armGeo, darkMat);
    this.rightArm.position.set(0.45, 1.1, 0);
    this.group.add(this.rightArm);
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const dist = this.group.position.distanceTo(playerPos);

    if (this.state === 'DEFEATED') return;

    if (dist < this.attackRange) {
      this.state = 'ATTACK';
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.2;
        if (window.Game && window.Game.player) {
          window.Game.player.takeDamage(this.damage);
          if (window.UI) window.UI.showMessage('HIT!', 800);
        }
      }
      // Attack anim
      this.rightArm.rotation.x = -1.2 + Math.sin(this.animTime * 15) * 0.4;
    } else if (dist < this.detectRange) {
      this.state = 'CHASE';
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      this.group.position.x += dir.x * this.speed * dt;
      this.group.position.z += dir.z * this.speed * dt;
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      // Walk anim
      this.leftArm.rotation.x = Math.sin(this.animTime * 8) * 0.4;
      this.rightArm.rotation.x = Math.sin(this.animTime * 8 + Math.PI) * 0.4;
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

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    this.state = 'HIT';
    // Flash
    this.group.children.forEach(c => {
      if (c.material && c.material.color) {
        c.material.emissive = new THREE.Color(0xffffff);
        setTimeout(() => { if (c.material) c.material.emissive = new THREE.Color(0x000000); }, 100);
      }
    });
    if (this.health <= 0) {
      this.defeat();
    }
  }

  defeat() {
    this.alive = false;
    this.state = 'DEFEATED';
    // Particle dissolve
    if (window.Game) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x6b3fa0, 20);
      window.Game.player.addScore(100);
      if (window.UI) window.UI.showMessage('ENEMY DEFEATED! +100');
    }
    this.scene.remove(this.group);
  }
}

class Goliath {
  constructor(scene, position) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.health = 1000;
    this.maxHealth = 1000;
    this.damage = 15;
    this.speed = 2.5;
    this.state = 'IDLE';
    this.phase = 1;
    this.attackCooldown = 0;
    this.animTime = 0;
    this.alive = true;
    this.vulnerable = 'HEAD'; // HEAD, ARMOR, SHIELD
    this.vulnerableTimer = 0;
    this.buildModel();
    this.group.position.copy(position);
    this.group.scale.set(2.8, 2.8, 2.8);
    scene.add(this.group);
  }

  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xc4a574 });
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
    const helmetMat = new THREE.MeshLambertMaterial({ color: 0x2d3748 });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x744210 });

    // Legs
    const legGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    this.leftLeg = new THREE.Mesh(legGeo, skinMat);
    this.leftLeg.position.set(-0.35, 0.6, 0);
    this.group.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(legGeo, skinMat);
    this.rightLeg.position.set(0.35, 0.6, 0);
    this.group.add(this.rightLeg);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.8), armorMat);
    body.position.y = 2.0;
    this.group.add(body);
    this.body = body;

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), skinMat);
    head.position.y = 3.15;
    this.group.add(head);
    this.head = head;

    // Helmet
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.5, 8), helmetMat);
    helmet.position.y = 3.4;
    this.group.add(helmet);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.35, 1.3, 0.35);
    this.leftArm = new THREE.Mesh(armGeo, skinMat);
    this.leftArm.position.set(-1.0, 2.2, 0);
    this.group.add(this.leftArm);
    this.rightArm = new THREE.Mesh(armGeo, skinMat);
    this.rightArm.position.set(1.0, 2.2, 0);
    this.group.add(this.rightArm);

    // Shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 1.0), armorMat);
    shield.position.set(-1.3, 2.0, 0.3);
    this.group.add(shield);
    this.shield = shield;

    // Vulnerable markers (glow when active)
    this.vulnMarkers = {};
    const markerGeo = new THREE.SphereGeometry(0.2, 8, 6);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.7 });
    ['HEAD', 'ARMOR', 'SHIELD'].forEach((key, i) => {
      const m = new THREE.Mesh(markerGeo, markerMat.clone());
      if (key === 'HEAD') m.position.set(0, 3.5, 0.5);
      if (key === 'ARMOR') m.position.set(0, 2.2, 0.5);
      if (key === 'SHIELD') m.position.set(-1.3, 2.0, 0.6);
      m.visible = false;
      this.group.add(m);
      this.vulnMarkers[key] = m;
    });
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    this.animTime += dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    this.vulnerableTimer -= dt;

    // Phase
    const hpRatio = this.health / this.maxHealth;
    if (hpRatio < 0.3) this.phase = 3;
    else if (hpRatio < 0.6) this.phase = 2;
    else this.phase = 1;

    const speedMult = this.phase === 1 ? 1 : this.phase === 2 ? 1.4 : 1.8;
    const dist = this.group.position.distanceTo(playerPos);

    // Choose vulnerable target periodically
    if (this.vulnerableTimer <= 0) {
      const opts = ['HEAD', 'ARMOR', 'SHIELD'];
      this.vulnerable = opts[Math.floor(Math.random() * opts.length)];
      this.vulnerableTimer = 4;
      Object.keys(this.vulnMarkers).forEach(k => {
        this.vulnMarkers[k].visible = (k === this.vulnerable);
      });
    }

    // Look at player
    this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);

    // Movement & attacks
    if (dist > 6) {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      this.group.position.x += dir.x * this.speed * speedMult * dt;
      this.group.position.z += dir.z * this.speed * speedMult * dt;
      this.state = 'CHASE';
      this.leftLeg.rotation.x = Math.sin(this.animTime * 6) * 0.4;
      this.rightLeg.rotation.x = Math.sin(this.animTime * 6 + Math.PI) * 0.4;
    } else if (this.attackCooldown <= 0) {
      // Choose attack
      const r = Math.random();
      if (r < 0.4) this.groundStrike(playerPos);
      else if (r < 0.7) this.roar();
      else this.charge(playerPos);
      this.attackCooldown = this.phase === 3 ? 1.8 : 2.5;
    }
  }

  groundStrike(playerPos) {
    this.state = 'STRIKE';
    this.rightArm.rotation.x = -1.8;
    // Shockwave visual
    if (window.Game) {
      window.Game.spawnShockwave(this.group.position.clone());
      const dist = this.group.position.distanceTo(playerPos);
      if (dist < 8 && window.Game.player) {
        window.Game.player.takeDamage(this.damage);
        if (window.UI) window.UI.showMessage('GROUND STRIKE!', 1000);
      }
    }
    setTimeout(() => { this.rightArm.rotation.x = 0; }, 600);
  }

  roar() {
    this.state = 'ROAR';
    if (window.UI) window.UI.showMessage('GOLIATH ROARS!', 1200);
    // Slow player briefly
    if (window.Game && window.Game.player) {
      window.Game.player.speed = 3;
      setTimeout(() => { if (window.Game.player) window.Game.player.speed = 6; }, 2000);
    }
  }

  charge(playerPos) {
    this.state = 'CHARGE';
    const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
    // Quick dash
    this.group.position.x += dir.x * 4;
    this.group.position.z += dir.z * 4;
    const dist = this.group.position.distanceTo(playerPos);
    if (dist < 4 && window.Game && window.Game.player) {
      window.Game.player.takeDamage(this.damage * 1.2);
      if (window.UI) window.UI.showMessage('CHARGE!', 800);
    }
  }

  takeDamage(amount, hitZone) {
    if (!this.alive) return;
    // Bonus if correct vulnerable zone
    let dmg = amount;
    if (hitZone === this.vulnerable) {
      dmg *= 2.5;
      if (window.UI) window.UI.showMessage('CRITICAL HIT!', 900);
    }
    this.health = Math.max(0, this.health - dmg);
    if (window.UI) window.UI.updateBoss(this.health, this.maxHealth);
    // Flash
    this.body.material.emissive = new THREE.Color(0xff4444);
    setTimeout(() => { this.body.material.emissive = new THREE.Color(0x000000); }, 120);
    if (this.health <= 0) this.defeat();
  }

  defeat() {
    this.alive = false;
    this.state = 'DEFEATED';
    Object.values(this.vulnMarkers).forEach(m => m.visible = false);
    if (window.Game) {
      window.Game.spawnParticles(this.group.position.clone().add(new THREE.Vector3(0, 3, 0)), 0xf1c40f, 40);
      if (window.UI) {
        window.UI.showMessage('GOLIATH DEFEATED!');
        window.UI.hideBoss();
      }
    }
    // Fade out
    let opacity = 1;
    const fade = setInterval(() => {
      opacity -= 0.05;
      this.group.traverse(c => {
        if (c.material) {
          c.material.transparent = true;
          c.material.opacity = Math.max(0, opacity);
        }
      });
      if (opacity <= 0) {
        clearInterval(fade);
        this.scene.remove(this.group);
        if (window.Game) window.Game.onBossDefeated();
      }
    }, 50);
  }
}

window.ShadowGuardian = ShadowGuardian;
window.Goliath = Goliath;
