// Projectiles and combat helpers
class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.particles = [];
    this.shockwaves = [];
  }

  spawnStone(origin, direction, isFaith = false) {
    const geo = new THREE.SphereGeometry(0.12, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: isFaith ? 0xf1c40f : 0xa0a8b0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.position.y += 1.2;
    this.scene.add(mesh);
    const vel = direction.clone().normalize().multiplyScalar(28);
    this.projectiles.push({
      mesh,
      velocity: vel,
      life: 2.0,
      damage: isFaith ? 80 : 25,
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
        if (p.mesh.position.distanceTo(e.group.position.clone().add(new THREE.Vector3(0, 1, 0))) < 1.5) {
          e.takeDamage(p.damage);
          hit = true;
        }
      });

      // Hit Goliath
      if (goliath && goliath.alive) {
        const gPos = goliath.group.position.clone();
        const dist = p.mesh.position.distanceTo(gPos.clone().add(new THREE.Vector3(0, 3, 0)));
        if (dist < 4) {
          // Determine hit zone roughly by height
          let zone = 'ARMOR';
          if (p.mesh.position.y > gPos.y + 7) zone = 'HEAD';
          else if (p.mesh.position.x < gPos.x - 1.5) zone = 'SHIELD';
          goliath.takeDamage(p.damage, zone);
          hit = true;
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
