// World builder - Israelite battlefield
class World {
  constructor(scene) {
    this.scene = scene;
    this.collectibles = [];
    this.checkpoints = [];
    this.interactables = [];
    this.bounds = { minX: -45, maxX: 45, minZ: -90, maxZ: 30 };
    this.build();
  }

  build() {
    this.createLighting();
    this.createSky();
    this.createTerrain();
    this.createCamp();
    this.createPath();
    this.createTreesAndRocks();
    this.createEnemyArea();
    this.createBattlefield();
    this.createGoliathArena();
    this.placeCollectibles();
    this.placeCheckpoints();
  }

  createLighting() {
    const ambient = new THREE.AmbientLight(0xfff5e0, 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffe8c0, 0.95);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);
    this.sun = sun;

    // Soft fill
    const fill = new THREE.DirectionalLight(0xa0c0ff, 0.25);
    fill.position.set(-20, 20, -30);
    this.scene.add(fill);
  }

  createSky() {
    this.scene.background = new THREE.Color(0x87b8e0);
    this.scene.fog = new THREE.Fog(0x87b8e0, 40, 110);

    // Simple sun disc
    const sunGeo = new THREE.SphereGeometry(4, 16, 12);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(40, 45, -60);
    this.scene.add(sunMesh);
  }

  createTerrain() {
    // Main ground
    const groundGeo = new THREE.PlaneGeometry(100, 140, 40, 50);
    // Simple height variation
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // plane is XY before rotation
      const h = Math.sin(x * 0.08) * 0.6 + Math.cos(z * 0.06) * 0.5 + Math.sin(x * 0.2 + z * 0.15) * 0.3;
      pos.setZ(i, h);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Dirt path
    const pathGeo = new THREE.PlaneGeometry(6, 100);
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xb8956a });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, -25);
    this.scene.add(path);
  }

  createCamp() {
    // Tents
    const tentPositions = [
      [-8, 0, 12], [-12, 0, 6], [8, 0, 10], [11, 0, 4], [-5, 0, 18]
    ];
    tentPositions.forEach(p => this.createTent(p[0], p[1], p[2]));

    // Campfire
    this.createCampfire(0, 0, 10);

    // Wooden crates / supplies
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    for (let i = 0; i < 4; i++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), crateMat);
      crate.position.set(-6 + i * 1.5, 0.5, 15);
      crate.castShadow = true;
      this.scene.add(crate);
    }

    // Flag pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 5, 6),
      new THREE.MeshLambertMaterial({ color: 0x5c4033 })
    );
    pole.position.set(5, 2.5, 16);
    this.scene.add(pole);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1),
      new THREE.MeshLambertMaterial({ color: 0xc0392b, side: THREE.DoubleSide })
    );
    flag.position.set(5.8, 4.2, 16);
    this.scene.add(flag);
  }

  createTent(x, y, z) {
    const group = new THREE.Group();
    const cloth = new THREE.MeshLambertMaterial({ color: 0xd4c4a0 });
    // Cone tent
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 4), cloth);
    tent.position.y = 1.6;
    tent.rotation.y = Math.PI / 4;
    group.add(tent);
    // Entrance flap
    const flap = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xc4b490, side: THREE.DoubleSide }));
    flap.position.set(0, 0.9, 1.5);
    group.add(flap);
    group.position.set(x, y, z);
    this.scene.add(group);
  }

  createCampfire(x, y, z) {
    const group = new THREE.Group();
    // Logs
    const logMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6), logMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i * Math.PI) / 3;
      log.position.y = 0.12;
      group.add(log);
    }
    // Flame (simple)
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.0, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6622 })
    );
    flame.position.y = 0.7;
    group.add(flame);
    this.flame = flame;
    // Glow light
    const fireLight = new THREE.PointLight(0xff6622, 1.2, 12);
    fireLight.position.y = 1;
    group.add(fireLight);
    group.position.set(x, y, z);
    this.scene.add(group);
    this.campfire = group;
  }

  createPath() {
    // Rocks along path
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7a6a });
    for (let i = 0; i < 18; i++) {
      const s = 0.4 + Math.random() * 0.8;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
      rock.position.set(
        (Math.random() - 0.5) * 10,
        s * 0.4,
        5 - i * 5 + (Math.random() - 0.5) * 3
      );
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock);
    }
  }

  createTreesAndRocks() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    for (let i = 0; i < 25; i++) {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.2, 6), trunkMat);
      trunk.position.y = 1.1;
      group.add(trunk);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.5, 7), leafMat);
      leaves.position.y = 3.0;
      group.add(leaves);
      const x = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 25);
      const z = 20 - Math.random() * 80;
      group.position.set(x, 0, z);
      this.scene.add(group);
    }

    // Distant mountains
    const mtMat = new THREE.MeshLambertMaterial({ color: 0x6a7a6a });
    for (let i = 0; i < 8; i++) {
      const mt = new THREE.Mesh(new THREE.ConeGeometry(8 + Math.random() * 6, 12 + Math.random() * 8, 5), mtMat);
      mt.position.set(-40 + i * 12, 4, -95);
      this.scene.add(mt);
    }
  }

  createEnemyArea() {
    // Simple wooden barricades
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    for (let i = 0; i < 6; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.3), woodMat);
      post.position.set(-8 + i * 3, 0.9, -25);
      this.scene.add(post);
    }
  }

  createBattlefield() {
    // Open area markers
    const markerMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    for (let i = 0; i < 5; i++) {
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.4, 0), markerMat);
      stone.position.set((Math.random() - 0.5) * 20, 0.3, -45 + (Math.random() - 0.5) * 8);
      this.scene.add(stone);
    }
  }

  createGoliathArena() {
    // Arena circle
    const ringGeo = new THREE.RingGeometry(12, 14, 32);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0x8B6914, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.05, -70);
    this.scene.add(ring);

    // Arena rocks
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x6a6a5a });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), rockMat);
      rock.position.set(Math.cos(angle) * 15, 0.6, -70 + Math.sin(angle) * 15);
      this.scene.add(rock);
    }
  }

  placeCollectibles() {
    // Smooth stones (5)
    const stonePositions = [
      new THREE.Vector3(-7, 0.3, 8),
      new THREE.Vector3(9, 0.3, 2),
      new THREE.Vector3(-4, 0.3, -8),
      new THREE.Vector3(6, 0.3, -18),
      new THREE.Vector3(-10, 0.3, -30)
    ];
    stonePositions.forEach((pos, i) => {
      this.addCollectible('stone', pos, `Smooth Stone ${i + 1}`);
    });

    // Sling
    this.addCollectible('sling', new THREE.Vector3(0, 0.4, -12), "David's Sling");

    // Health (2)
    this.addCollectible('health', new THREE.Vector3(-9, 0.4, 14), 'Health');
    this.addCollectible('health', new THREE.Vector3(7, 0.4, -35), 'Health');

    // Armor (2)
    this.addCollectible('armor', new THREE.Vector3(10, 0.4, 8), 'Armor');
    this.addCollectible('armor', new THREE.Vector3(-8, 0.4, -40), 'Armor');

    // Faith energy (3)
    this.addCollectible('faith', new THREE.Vector3(3, 0.4, 16), 'Faith Energy');
    this.addCollectible('faith', new THREE.Vector3(-6, 0.4, -22), 'Faith Energy');
    this.addCollectible('faith', new THREE.Vector3(4, 0.4, -50), 'Faith Energy');
  }

  addCollectible(type, position, label) {
    const group = new THREE.Group();
    let mesh;
    if (type === 'stone') {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xa0a8b0, emissive: 0x223344 })
      );
    } else if (type === 'sling') {
      mesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.08, 8, 16),
        new THREE.MeshLambertMaterial({ color: 0x5c4033, emissive: 0x221100 })
      );
    } else if (type === 'health') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.15),
        new THREE.MeshLambertMaterial({ color: 0xe74c3c, emissive: 0x441111 })
      );
    } else if (type === 'armor') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.5, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x3498db, emissive: 0x112244 })
      );
    } else {
      mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3),
        new THREE.MeshLambertMaterial({ color: 0xf1c40f, emissive: 0x443300 })
      );
    }
    group.add(mesh);
    // Glow ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.55, 16),
      new THREE.MeshBasicMaterial({ color: 0xf0c14b, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);
    group.position.copy(position);
    this.scene.add(group);
    this.collectibles.push({
      type,
      label,
      group,
      mesh,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2
    });
  }

  placeCheckpoints() {
    const positions = [
      { pos: new THREE.Vector3(0, 0, 8), name: 'CAMP CHECKPOINT' },
      { pos: new THREE.Vector3(0, 0, -20), name: 'PATH CHECKPOINT' },
      { pos: new THREE.Vector3(0, 0, -48), name: 'BATTLEFIELD CHECKPOINT' }
    ];
    positions.forEach(cp => {
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.15, 16),
        new THREE.MeshLambertMaterial({ color: 0x2ecc71, emissive: 0x115522 })
      );
      marker.position.copy(cp.pos);
      marker.position.y = 0.1;
      this.scene.add(marker);
      this.checkpoints.push({ ...cp, mesh: marker, activated: false });
    });
  }

  update(dt) {
    // Bob collectibles
    this.collectibles.forEach(c => {
      if (c.collected) return;
      c.group.position.y = 0.3 + Math.sin(Date.now() * 0.003 + c.bobOffset) * 0.15;
      c.group.rotation.y += dt * 1.5;
    });
    // Flame flicker
    if (this.flame) {
      this.flame.scale.y = 0.9 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  }

  getNearbyCollectible(playerPos, radius = 2.2) {
    return this.collectibles.find(c => !c.collected && c.group.position.distanceTo(playerPos) < radius);
  }

  getNearbyCheckpoint(playerPos, radius = 2.5) {
    return this.checkpoints.find(c => !c.activated && c.pos.distanceTo(playerPos) < radius);
  }
}

window.World = World;
