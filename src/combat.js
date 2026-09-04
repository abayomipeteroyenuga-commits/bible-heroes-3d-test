// Projectiles and combat helpers
class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.particles = [];
    this.shockwaves = [];
    // Hard caps prevent rapid fire/impact effects from building an ever-growing
    // render/update queue on low-end devices.
    this.maxProjectiles = 36;
    this.maxParticles = 180;
    this.maxShockwaves = 18;
  }

  spawnStone(origin, direction, isFaith = false, extraDmg = 0, projectileType = 'stone') {
    // Shared projectile path; weapon type only changes the visual and damage bonus.
    // Drop the oldest projectile if the player fires unusually fast. This is a
    // safety valve against runaway allocations/freezes, not a gameplay limit.
    if (this.projectiles.length >= this.maxProjectiles) {
      const old = this.projectiles.shift();
      if (old && old.mesh) {
        this.scene.remove(old.mesh);
        if (old.mesh.geometry && old.mesh.geometry.dispose) old.mesh.geometry.dispose();
        if (old.mesh.material && old.mesh.material.dispose) old.mesh.material.dispose();
      }
    }
    const type = projectileType || 'stone';
    const colors = { stone: 0xf5f0e6, arrow: 0x8b5a2b, blade: 0xd8e0e8, flame: 0xff6a00, faith: 0xffe066 };
    const color = colors[type] || (isFaith ? 0xffe066 : 0xf5f0e6);
    const geo = type === 'arrow' ? new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6) :
      type === 'blade' ? new THREE.BoxGeometry(0.08, 0.08, 0.65) :
      new THREE.SphereGeometry(type === 'stone' ? 0.38 : 0.22, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.position.y += 1.35;
    // Start slightly in front of David so it is clearly visible
    const dirN = direction.clone().normalize();
    mesh.position.addScaledVector(dirN, 0.6);
    this.scene.add(mesh);
    if (type === 'arrow' || type === 'blade') mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirN);
    if (type === 'flame' || type === 'faith') {
      this.spawnParticles(mesh.position, color, type === 'faith' ? 5 : 4);
    }
    const vel = dirN.multiplyScalar(type === 'arrow' ? 38 : type === 'blade' ? 34 : 32);
    this.projectiles.push({
      mesh,
      velocity: vel,
      life: 2.5,
      damage: (isFaith ? 80 : 30) + (extraDmg || 0),
      isFaith,
      hitZone: null,
      projectileType: type
    });
  }

  spawnParticles(position, color, count = 15) {
    // Cap transient effects so repeated fire/impact effects cannot stall the loop.
    const room = Math.max(0, this.maxParticles - this.particles.length);
    count = Math.min(count, room);
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
    if (this.shockwaves.length >= this.maxShockwaves) {
      const old = this.shockwaves.shift();
      if (old && old.mesh) {
        this.scene.remove(old.mesh);
        if (old.mesh.geometry && old.mesh.geometry.dispose) old.mesh.geometry.dispose();
        if (old.mesh.material && old.mesh.material.dispose) old.mesh.material.dispose();
      }
    }
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

      // Hit exactly one Guardian per projectile. A projectile is removed after the
      // first valid hit so overlapping Guardians cannot all lose life from one shot.
      let hit = false;
      for (let ei = 0; ei < enemies.length; ei++) {
        const e = enemies[ei];
        if (!e || !e.alive || !e.group) continue;
        const dx = p.mesh.position.x - e.group.position.x;
        const dy = p.mesh.position.y - (e.group.position.y + 1);
        const dz = p.mesh.position.z - e.group.position.z;
        if (dx * dx + dy * dy + dz * dz < 4.0) {
          // Every successful Guardian shot removes exactly 3 life.
          e.takeDamage(3);
          hit = true;
          if (window.AudioSystem) {
            AudioSystem.impact();
            AudioSystem.enemyHit();
          }
          break;
        }
      }

      // Hit Goliath — zone from actual projectile position vs scaled body
      if (!hit && goliath && goliath.alive) {
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
          if (window.AudioSystem) {
            AudioSystem.impact();
            AudioSystem.bossHit();
          }
        }
      }

      if (p.life <= 0 || hit || p.mesh.position.y < 0) {
        if (!hit && window.AudioSystem) AudioSystem.miss();
        this.scene.remove(p.mesh);
        if (p.mesh.geometry && p.mesh.geometry.dispose) p.mesh.geometry.dispose();
        if (p.mesh.material && p.mesh.material.dispose) p.mesh.material.dispose();
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
        if (p.mesh.geometry && p.mesh.geometry.dispose) p.mesh.geometry.dispose();
        if (p.mesh.material && p.mesh.material.dispose) p.mesh.material.dispose();
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
        if (s.mesh.geometry && s.mesh.geometry.dispose) s.mesh.geometry.dispose();
        if (s.mesh.material && s.mesh.material.dispose) s.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }
  }
}

window.CombatSystem = CombatSystem;
