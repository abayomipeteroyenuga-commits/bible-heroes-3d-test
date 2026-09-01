// Projectiles and combat helpers
class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.particles = [];
    this.shockwaves = [];
  }

  spawnStone(origin, direction, isFaith = false) {
    // Visible stone projectile
    const geo = new THREE.SphereGeometry(0.22, 10, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: isFaith ? 0xf1c40f : 0xc8c0b0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.position.y += 1.35;
    // Start slightly in front of David so it is clearly visible
    const dirN = direction.clone().normalize();
    mesh.position.addScaledVector(dirN, 0.6);
    this.scene.add(mesh);
    const vel = dirN.multiplyScalar(32);
    this.projectiles.push({
      mesh,
      velocity: vel,
      life: 2.5,
      damage: isFaith ? 80 : 30,
      isFaith,
      hitZone: null
    });
  }

  spawnParticles(position, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.1, 4, 3);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 6
        ),
        life: 0.8 + Math.random() * 0.5
      });
    }
  }

  spawnShockwave(position) {
    const geo = new THREE.RingGeometry(0.5, 1.5, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(position);
    mesh.position.y = 0.1;
    this.scene.add(mesh);
    this.shockwaves.push({ mesh, life: 0.8, scale: 1 });
  }

  update(dt, enemies, goliath, player) {
    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.life -= dt;
      p.velocity.y -= 12 * dt; // slight arc

      // Hit enemies
      let hit = false;
      enemies.forEach(e => {
        if (!e.alive) return;
        if (p.mesh.position.distanceTo(e.group.position.clone().add(new THREE.Vector3(0, 1, 0))) < 2.0) {
          e.takeDamage(p.damage);
          hit = true;
          if (window.AudioSystem) {
            AudioSystem.impact();
            AudioSystem.enemyHit();
          }
        }
      });

      // Hit Goliath — zone from actual projectile position vs scaled body
      if (goliath && goliath.alive) {
        const gPos = goliath.group.position;
        const scale = goliath.group.scale.y || 3.4;
        // Local height relative to Goliath feet
        const localY = (p.mesh.position.y - gPos.y) / scale;
        const localX = (p.mesh.position.x - gPos.x) / scale;
        const localZ = (p.mesh.position.z - gPos.z) / scale;
        // Approximate body radius in local space (~1.2 torso width)
        const horiz = Math.sqrt(localX * localX + localZ * localZ);
        if (horiz < 1.6 && localY > 0 && localY < 3.2) {
          let zone = 'ARMOR';
          if (localY > 2.0) zone = 'HEAD';
          else if (localX < -0.45) zone = 'SHIELD';
          goliath.takeDamage(p.damage, zone);
          hit = true;
          if (window.AudioSystem) AudioSystem.impact();
        }
      }

      if (p.life <= 0 || hit || p.mesh.position.y < 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 10 * dt;
      p.life -= dt;
      p.mesh.material.opacity = Math.max(0, p.life);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= dt;
      s.scale += dt * 12;
      s.mesh.scale.set(s.scale, s.scale, 1);
      s.mesh.material.opacity = Math.max(0, s.life);
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        this.shockwaves.splice(i, 1);
      }
    }
  }
}

window.CombatSystem = CombatSystem;
