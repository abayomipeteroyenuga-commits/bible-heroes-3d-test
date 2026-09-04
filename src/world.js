// World builder - Israelite battlefield
class World {
  constructor(scene, worldId) {
    this.scene = scene;
    this.worldId = worldId || 1;
    this.theme = (window.getWorldTheme && window.getWorldTheme(this.worldId)) || {};
    this.collectibles = [];
    this.checkpoints = [];
    this.interactables = [];
    this.uniqueObjects = [];
    this.colliders = [];
    this.landscapeSeed = (worldId * 10007 + 7919) >>> 0;
    this._rand = () => {
      this.landscapeSeed = (this.landscapeSeed * 1664525 + 1013904223) >>> 0;
      return this.landscapeSeed / 4294967296;
    };
    this.bounds = { minX: -45, maxX: 45, minZ: -90, maxZ: 30 };
    this.build();
  }

  addCollider(x, z, r) {
    this.colliders.push({ type: 'circle', x: x, z: z, r: r });
  }

  addBoxCollider(x, z, halfX, halfZ) {
    this.colliders.push({ type: 'box', x: x, z: z, halfX: halfX, halfZ: halfZ });
  }

  resolveCircle(x, z, radius) {
    const list = this.colliders || [];
    // Multiple passes handle corners and overlapping obstacles cleanly.
    for (let pass = 0; pass < 3; pass++) {
      let changed = false;
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.type === 'box') {
          const minX = c.x - c.halfX - radius;
          const maxX = c.x + c.halfX + radius;
          const minZ = c.z - c.halfZ - radius;
          const maxZ = c.z + c.halfZ + radius;
          if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            const pushL = x - minX;
            const pushR = maxX - x;
            const pushT = z - minZ;
            const pushB = maxZ - z;
            const m = Math.min(pushL, pushR, pushT, pushB);
            if (m === pushL) x = minX;
            else if (m === pushR) x = maxX;
            else if (m === pushT) z = minZ;
            else z = maxZ;
            changed = true;
          }
          continue;
        }
        const dx = x - c.x;
        const dz = z - c.z;
        const min = (c.r || 0.8) + radius;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          if (d2 > 0.000001) {
            const d = Math.sqrt(d2);
            const push = (min - d) / d;
            x += dx * push;
            z += dz * push;
          } else {
            x += min;
          }
          changed = true;
        }
      }
      if (!changed) break;
    }
    return { x: x, z: z };
  }

  hasFeature(name) {
    return this.theme.features && this.theme.features.indexOf(name) !== -1;
  }

  build() {
    this.createLighting();
    this.createSky();
    this.createTerrain();
    this.createNaturalLandscape();
    this.createWorldDressing();
    if (this.hasFeature('camp') || this.hasFeature('outpost') || this.hasFeature('camps')) this.createCamp();
    this.createPath();
    if (![4, 6, 7, 8, 14, 16, 17, 18, 20].includes(this.worldId)) this.createTreesAndRocks();
    if (this.hasFeature('forest')) this.createDenseForest();
    if (this.hasFeature('cliffs') || this.hasFeature('mountains')) this.createCliffs();
    if (this.hasFeature('cave')) this.createCaveShell();
    if (this.hasFeature('crystals')) this.createCrystals();
    if (this.hasFeature('stream')) this.createStream();
    if (this.hasFeature('bridge')) this.createBridge();
    if (this.hasFeature('towers') || this.hasFeature('walls') || this.hasFeature('gates')) this.createFort();
    if (this.hasFeature('banners') || this.hasFeature('battlefield') || this.hasFeature('final')) this.createBanners();
    if (this.hasFeature('giantMarks') || this.hasFeature('territory')) this.createGiantMarks();
    if (this.worldId >= 6) this.createEnemyArea();
    if ([8, 17, 20].includes(this.worldId)) this.createBattlefield();
    if (this.worldId === 20) this.createGoliathArena();
    this.placeCollectibles();
    this.placeCheckpoints();
    this.createLandmark();
    this.createUniqueSetpieces();
    this.createIndividualWorldDressing();
    this.createOrganicEnvironment();
  }

  createLighting() {
    const ambCol = this.theme.ambient || 0xfff5e0;
    const sunCol = this.theme.sun || 0xffe8c0;
    const ambient = new THREE.AmbientLight(ambCol, this.theme.dark ? 0.35 : 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(sunCol, this.theme.dark ? 0.45 : 0.95);
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

    // Soft sky fill keeps David readable in every world.
    const hemi = new THREE.HemisphereLight(this.theme.sky || 0x9ec8ea, this.theme.ground || 0x45643a, this.theme.dark ? 0.5 : 0.75);
    this.scene.add(hemi);
    const fill = new THREE.DirectionalLight(0xa0c0ff, 0.28);
    fill.position.set(-20, 20, -30);
    this.scene.add(fill);
  }

  createSky() {
    const sky = this.theme.sky || 0x87b8e0;
    const fog = this.theme.fog || sky;
    this.scene.background = new THREE.Color(sky);
    this.scene.fog = new THREE.Fog(fog, this.theme.dark ? 30 : 60, this.theme.dark ? 120 : 200);

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
      // Layered, low-amplitude terrain noise: broad hills + smaller natural undulation.
      const broad = Math.sin(x * 0.075 + this.worldId * 0.31) * 1.05 + Math.cos(z * 0.055 - this.worldId * 0.17) * 0.75;
      const detail = Math.sin(x * 0.19 + z * 0.11) * 0.28 + Math.cos(x * 0.31 - z * 0.17) * 0.16;
      let h = broad + detail;
      // Keep the central playable route comparatively gentle for readable movement.
      h *= Math.min(1, Math.abs(x) / 9);
      pos.setZ(i, h);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ color: this.theme.ground || 0x5a8f4a, roughness: 0.92, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Dirt path
    const pathGeo = new THREE.PlaneGeometry(6, 100);
    const pathMat = new THREE.MeshStandardMaterial({ color: this.theme.path || 0xb8956a, roughness: 0.88, metalness: 0.0 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, -25);
    this.scene.add(path);
  }


  // Natural landscape layer inspired by the supplied reference: bright open meadow,
  // rolling terrain, mature trees, shrubs, flowers and a readable dirt trail. Each of
  // the 40 worlds gets a deterministic visual profile so worlds are not clones.
  createNaturalLandscape() {
    const id = this.worldId;
    const r = this._rand;
    const palettes = [
      [0x78a94f,0x3f7338,0x6f4b2f,0xc9b17b,0x8fcf67],
      [0x6f9b55,0x315d3a,0x6a4a35,0xb79a6c,0x79bd61],
      [0x82b35c,0x3f7f3b,0x745037,0xd0b77f,0xa2d875],
      [0x5f8750,0x294d32,0x5b4437,0xa68c67,0x73b35c],
      [0x8aa35d,0x4a713c,0x79553b,0xcdbd8b,0x9bd06c],
      [0x6f8f61,0x355c3e,0x664833,0xb9a477,0x83c66a],
      [0x739f4a,0x376b31,0x70472c,0xc4a66e,0x8bcf58],
      [0x8ba85c,0x4e743b,0x76503a,0xd2bc84,0xa8d86e],
      [0x668e58,0x2f5d39,0x614936,0xb59a78,0x78c871],
      [0x7ea761,0x3b6d40,0x694a31,0xc7ae7a,0x93d06f]
    ];
    const p = palettes[(id - 1) % palettes.length];
    const phase = Math.floor((id - 1) / 10);
    const treeDensity = 18 + ((id * 7) % 19) + phase * 3;
    const bushDensity = 12 + ((id * 5) % 15);
    const flowerDensity = 18 + ((id * 11) % 24);
    const hillCount = 5 + ((id * 3) % 6);
    const pathWiggle = 0.8 + ((id * 13) % 18) / 10;
    const canopy = 0.9 + ((id * 17) % 12) / 20;
    const grassMat = new THREE.MeshLambertMaterial({ color: p[0] });
    const leafMat = new THREE.MeshLambertMaterial({ color: p[1] });
    const trunkMat = new THREE.MeshLambertMaterial({ color: p[2] });
    const dirtMat = new THREE.MeshLambertMaterial({ color: p[3] });
    const flowerMat = new THREE.MeshBasicMaterial({ color: p[4] });

    // Meadow patches break up the flat ground and echo the open grassy reference.
    for (let i = 0; i < 16; i++) {
      const x = (r() - 0.5) * 88;
      const z = 20 - r() * 118;
      const sx = 3 + r() * 7;
      const sz = 2 + r() * 6;
      const patch = new THREE.Mesh(new THREE.CircleGeometry(1, 14), grassMat);
      patch.rotation.x = -Math.PI / 2;
      patch.scale.set(sx, sz, 1);
      patch.position.set(x, 0.015, z);
      patch.material = grassMat;
      this.scene.add(patch);
    }

    // Winding secondary trail segments. The main mission corridor remains clear.
    for (let i = 0; i < 12; i++) {
      const z = 18 - i * 10;
      const x = Math.sin(i * 0.72 + id * 0.19) * pathWiggle;
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(5.2 + r() * 1.5, 12), dirtMat);
      seg.rotation.x = -Math.PI / 2;
      seg.rotation.z = Math.sin(i * 0.5 + id) * 0.035;
      seg.position.set(x, 0.022, z);
      this.scene.add(seg);
    }

    // Mature trees: layered crowns instead of the single-cone look.
    for (let i = 0; i < treeDensity; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (8.5 + r() * 34);
      const z = 22 - r() * 116;
      const g = new THREE.Group();
      const h = 2.6 + r() * 2.8;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, h, 7), trunkMat);
      trunk.position.y = h / 2;
      const crown = new THREE.Group();
      const lobes = 3 + Math.floor(r() * 3);
      for (let j = 0; j < lobes; j++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry((0.9 + r() * 0.65) * canopy, 9, 7), leafMat);
        leaf.position.set((r() - 0.5) * 1.5, h + 0.25 + r() * 1.1, (r() - 0.5) * 1.4);
        crown.add(leaf);
      }
      g.add(trunk, crown);
      g.rotation.y = r() * Math.PI * 2;
      g.position.set(x, 0, z);
      g.scale.y = 0.92 + r() * 0.35;
      this.scene.add(g);
      this.addCollider(x, z, 0.75);
    }

    // Low shrubs/bushes make the edges feel organic.
    for (let i = 0; i < bushDensity; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (7 + r() * 35);
      const z = 20 - r() * 112;
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.75 + r() * 0.7, 9, 7), leafMat);
      bush.scale.y = 0.55 + r() * 0.25;
      bush.position.set(x, 0.45, z);
      this.scene.add(bush);
    }

    // Small flower clusters, with a unique density/layout in every world.
    for (let i = 0; i < flowerDensity; i++) {
      const x = (r() - 0.5) * 72;
      const z = 18 - r() * 112;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.28, 5), trunkMat);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.075 + r() * 0.05, 6, 5), flowerMat);
      const g = new THREE.Group();
      stem.position.y = 0.14; bloom.position.y = 0.31; g.add(stem, bloom);
      g.position.set(x, 0, z);
      this.scene.add(g);
    }

    // Distant rolling hills reinforce the wide green landscape reference.
    const hillMat = new THREE.MeshLambertMaterial({ color: p[1] });
    for (let i = 0; i < hillCount; i++) {
      const h = 7 + r() * 10;
      const radius = 9 + r() * 8;
      const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), hillMat);
      hill.scale.set(radius, h, radius * 0.55);
      hill.position.set(-48 + r() * 96, h * 0.45 - 1, -92 - r() * 35);
      this.scene.add(hill);
    }

    // Water/pond variants: every 4th world gets a different natural water feature.
    if (id % 4 === 0) {
      const waterMat = new THREE.MeshPhongMaterial({ color: 0x5da9c8, transparent: true, opacity: 0.72, shininess: 70 });
      const water = new THREE.Mesh(new THREE.CircleGeometry(4.5 + r() * 3, 24), waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set((r() - 0.5) * 28, 0.035, -18 - r() * 62);
      this.scene.add(water);
    }

    // World-specific atmospheric tint while preserving the bright readable look.
    if (id % 5 === 0) {
      this.scene.fog = new THREE.Fog(this.theme.fog || this.theme.sky || 0x87b8e0, 42, 155);
    }
  }

  // Extra visual dressing makes every world feel populated and intentionally designed.
  // It is deterministic per world so layouts stay stable between reloads.
  createWorldDressing() {
    const id = this.worldId;
    let seed = 7919 * id + 104729;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const ground = this.theme.ground || 0x5a8f4a;
    const accent = this.theme.sun || 0xffd080;
    const foliage = this.theme.dark ? 0x24352a : 0x356b32;
    const stone = this.theme.dark ? 0x3c3a46 : 0x77736a;
    const wood = 0x60452f;

    // Dense micro-detail along the playable corridor.
    for (let i = 0; i < 34; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (7 + rand() * 28);
      const z = 18 - rand() * 105;
      const type = (i + id) % 4;
      let mesh;
      if (type === 0) {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(0.16 + rand() * 0.12, 0.45 + rand() * 0.4, 5), new THREE.MeshLambertMaterial({ color: foliage }));
        mesh.position.set(x, 0.2, z);
      } else if (type === 1) {
        mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + rand() * 0.25, 0), new THREE.MeshLambertMaterial({ color: stone }));
        mesh.position.set(x, 0.18, z);
      } else if (type === 2) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22 + rand() * 0.15, 8, 6), new THREE.MeshLambertMaterial({ color: ground }));
        mesh.scale.y = 0.45;
        mesh.position.set(x, 0.12, z);
      } else {
        const g = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5), new THREE.MeshLambertMaterial({ color: foliage }));
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshBasicMaterial({ color: accent }));
        stem.position.y = 0.23; bloom.position.y = 0.48; g.add(stem, bloom); mesh = g;
        mesh.position.set(x, 0, z);
      }
      mesh.rotation.y = rand() * Math.PI * 2;
      mesh.castShadow = true;
      this.scene.add(mesh);
    }

    // A distinct signature structure/prop set for each world family.
    const family = (id - 1) % 10;
    if (family === 0) this.createWorldFences(rand, wood, accent);
    else if (family === 1) this.createWorldStonePillars(rand, stone, accent);
    else if (family === 2) this.createWorldGrove(rand, foliage, accent);
    else if (family === 3) this.createWorldCaveDetails(rand, stone, accent);
    else if (family === 4) this.createWorldMountainDetails(rand, stone, accent);
    else if (family === 5) this.createWorldOutpostDetails(rand, wood, accent);
    else if (family === 6) this.createWorldFortDetails(rand, stone, accent);
    else if (family === 7) this.createWorldBattleDetails(rand, wood, accent);
    else if (family === 8) this.createWorldRiverDetails(rand, stone, accent);
    else this.createWorldRoyalDetails(rand, stone, accent);

    // A subtle horizon silhouette gives the worlds more depth without adding a heavy asset cost.
    const farMat = new THREE.MeshLambertMaterial({ color: stone });
    for (let i = 0; i < 7; i++) {
      const h = 8 + rand() * 10;
      const m = new THREE.Mesh(new THREE.ConeGeometry(7 + rand() * 5, h, 7), farMat);
      m.position.set(-42 + i * 14, h / 2 - 0.2, -102 - rand() * 8);
      this.scene.add(m);
    }
  }

  createWorldFences(rand, wood, accent) {
    const mat = new THREE.MeshLambertMaterial({ color: wood });
    for (let i = 0; i < 8; i++) {
      const x = i % 2 ? 18 : -18, z = 12 - i * 5;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.8, 6), mat);
      post.position.set(x, 0.9, z);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), mat);
      rail.position.set(x + (x > 0 ? -1.2 : 1.2), 1.05, z);
      this.scene.add(post, rail);
    }
  }
  createWorldStonePillars(rand, stone, accent) {
    const mat = new THREE.MeshLambertMaterial({ color: stone });
    for (let i = 0; i < 6; i++) {
      const h = 1.8 + rand() * 2.4;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45 + rand() * 0.2, 0.6, h, 7), mat);
      p.position.set((i % 2 ? 22 : -22) + (rand() - 0.5) * 2, h / 2, -8 - i * 12);
      this.scene.add(p); this.addCollider(p.position.x, p.position.z, 0.65);
    }
  }
  createWorldGrove(rand, foliage, accent) {
    const trunk = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
    const leaves = new THREE.MeshLambertMaterial({ color: foliage });
    for (let i = 0; i < 10; i++) {
      const g = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 2.6, 7), trunk); t.position.y = 1.3;
      const c = new THREE.Mesh(new THREE.SphereGeometry(1.15 + rand() * 0.5, 10, 7), leaves); c.position.y = 2.8;
      g.add(t, c); const x = (i % 2 ? 1 : -1) * (13 + rand() * 17); const z = 8 - rand() * 90;
      g.position.set(x,0,z); this.scene.add(g); this.addCollider(x,z,0.75);
    }
  }
  createWorldCaveDetails(rand, stone, accent) {
    const mat = new THREE.MeshPhongMaterial({ color: stone, shininess: 25 });
    for (let i = 0; i < 12; i++) {
      const h = 1.5 + rand() * 4;
      const x = (i % 2 ? 1 : -1) * (8 + rand() * 8), z = 8 - i * 8;
      const stal = new THREE.Mesh(new THREE.ConeGeometry(0.45 + rand() * 0.35, h, 6), mat);
      stal.position.set(x, h / 2, z); this.scene.add(stal);
    }
  }
  createWorldMountainDetails(rand, stone, accent) {
    const rock = new THREE.MeshLambertMaterial({ color: stone });
    for (let i = 0; i < 9; i++) {
      const s = 0.8 + rand() * 1.5;
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), rock);
      m.position.set((rand() - 0.5) * 70, s * 0.45, -15 - rand() * 70); m.rotation.y = rand()*Math.PI;
      this.scene.add(m);
    }
  }
  createWorldOutpostDetails(rand, wood, accent) {
    const crateMat = new THREE.MeshLambertMaterial({ color: wood });
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9), crateMat);
      c.position.set((i%2?1:-1)*(9+rand()*4),0.45,-10-rand()*65); c.rotation.y=rand(); this.scene.add(c);
      this.addCollider(c.position.x,c.position.z,0.62);
    }
  }
  createWorldFortDetails(rand, stone, accent) {
    const mat = new THREE.MeshLambertMaterial({ color: stone });
    for (let i=0;i<6;i++) {
      const x = (i%2?1:-1)*27, z = 8-i*12;
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.5,3.5,2.5),mat); b.position.set(x,1.75,z); this.scene.add(b); this.addCollider(x,z,1.7);
    }
  }
  createWorldBattleDetails(rand, wood, accent) {
    const poleMat = new THREE.MeshLambertMaterial({color:wood});
    for(let i=0;i<8;i++){
      const x=(i%2?1:-1)*(12+rand()*5), z=5-i*9;
      const p=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,4,6),poleMat); p.position.set(x,2,z);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.8),new THREE.MeshLambertMaterial({color:accent,side:THREE.DoubleSide})); f.position.set(x+(x>0?-0.6:0.6),3.5,z); this.scene.add(p,f);
    }
  }
  createWorldRiverDetails(rand, stone, accent) {
    const mat=new THREE.MeshLambertMaterial({color:stone});
    for(let i=0;i<12;i++){ const s=.25+rand()*.55; const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat); r.position.set(-14+(rand()-.5)*4,s*.4,-8-rand()*75); this.scene.add(r); this.addCollider(r.position.x,r.position.z,s*.9); }
  }
  createWorldRoyalDetails(rand, stone, accent) {
    const mat=new THREE.MeshLambertMaterial({color:stone});
    for(let i=0;i<5;i++){ const h=2.5+rand()*2; const b=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,h,8),mat); b.position.set((i%2?1:-1)*(15+rand()*8),h/2,-15-i*12); this.scene.add(b); this.addCollider(b.position.x,b.position.z,.85); }
  }

  createCamp() {
    // Tents
    const tentPositions = [
      [-8, 0, 12], [-12, 0, 6], [8, 0, 10], [11, 0, 4], [-5, 0, 18]
    ];
    tentPositions.forEach(p => {
      this.createTent(p[0], p[1], p[2]);
      this.addCollider(p[0], p[2], 1.7);
    });

    // Campfire
    this.createCampfire(0, 0, 10);

    // Wooden crates / supplies
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    for (let i = 0; i < 4; i++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), crateMat);
      crate.position.set(-6 + i * 1.5, 0.5, 15);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.scene.add(crate);
      this.addCollider(crate.position.x, crate.position.z, 0.85);
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
      const s = 0.4 + this._rand() * 0.8;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
      rock.position.set(
        (this._rand() - 0.5) * 10,
        s * 0.4,
        5 - i * 5 + (this._rand() - 0.5) * 3
      );
      rock.rotation.set(this._rand(), this._rand(), this._rand());
      rock.castShadow = true;
      this.scene.add(rock);
      this.addCollider(rock.position.x, rock.position.z, s * 0.9);
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
      const x = (this._rand() > 0.5 ? 1 : -1) * (12 + this._rand() * 25);
      const z = 20 - this._rand() * 80;
      group.position.set(x, 0, z);
      trunk.castShadow = true;
      leaves.castShadow = true;
      this.scene.add(group);
      this.addCollider(x, z, 0.85);
    }

    // Distant mountains
    const mtMat = new THREE.MeshLambertMaterial({ color: 0x6a7a6a });
    for (let i = 0; i < 8; i++) {
      const mt = new THREE.Mesh(new THREE.ConeGeometry(8 + this._rand() * 6, 12 + this._rand() * 8, 5), mtMat);
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
      this.addCollider(rock.position.x, rock.position.z, 1.35);
    }
  }

  createUniqueSetpieces() {
    const id = this.worldId;
    if (id === 1 || id === 10) this.createShepherdValleySetpiece();
    if (id === 2 || id === 14) this.createRockMazeSetpiece();
    if (id === 3 || id === 13) this.createHiddenGroveSetpiece();
    if (id === 4 || id === 18) this.createTorchCaveSetpiece();
    if (id === 5 || id === 15) this.createMountainPassSetpiece();
    if (id === 6 || id === 11) this.createOutpostSetpiece();
    if (id === 7 || id === 16) this.createFortressSetpiece();
    if (id === 8 || id === 17) this.createBattlefieldSetpiece();
    if (id === 9 || id === 12) this.createGoliathTerritorySetpiece();
    if (id === 19) this.createGoliathTerritorySetpiece();
    if (id === 20) this.createFinalBattleSetpiece();
  }

  addInteractable(type, position, label, color = 0xf1c40f) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.7, 0.25, 10),
      new THREE.MeshLambertMaterial({ color, emissive: 0x332200 })
    );
    base.position.y = 0.13;
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
    );
    beacon.position.y = 0.75;
    group.add(base, beacon);
    group.position.copy(position);
    this.scene.add(group);
    const item = { type, label, group, position: group.position.clone(), used: false, beacon };
    this.interactables.push(item);
    return item;
  }

  createSign(position, text, color = 0x8b5a2b) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.8, 6), new THREE.MeshLambertMaterial({ color: 0x5c4033 }));
    post.position.copy(position); post.position.y = 0.9;
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.18), new THREE.MeshLambertMaterial({ color }));
    board.position.copy(position); board.position.y = 1.65;
    this.scene.add(post, board);
  }

  createSheep(x, z) {
    const g = new THREE.Group();
    const wool = new THREE.MeshLambertMaterial({ color: 0xf3eee0 });
    const dark = new THREE.MeshLambertMaterial({ color: 0x4b3a32 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 10), wool); body.scale.set(1.25, 0.8, 0.8); body.position.y = 0.85;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), dark); head.position.set(0.8, 1.0, 0);
    g.add(body, head); g.position.set(x,0,z); this.scene.add(g); return g;
  }

  createShepherdValleySetpiece() {
    [[-8,0],[8,2],[-5,-10]].forEach(p => this.createSheep(p[0],p[1]));
    this.createSign(new THREE.Vector3(0,0,2), 'SHEPHERD CAMP');
    [[-8,0,2],[0,0,-8],[8,0,-18]].forEach((p,i) => this.addInteractable('sheep', new THREE.Vector3(p[0],0,p[2]), 'Check sheep '+(i+1), 0x9bd36a));
  }

  createRockMazeSetpiece() {
    const mat = new THREE.MeshLambertMaterial({ color: 0x706050 });
    const walls = [[-8,-18,10,2],[8,-30,10,2],[-8,-42,10,2],[8,-50,10,2]];
    walls.forEach(w => { const m=new THREE.Mesh(new THREE.BoxGeometry(w[2],3,w[3]),mat); m.position.set(w[0],1.5,w[1]); this.scene.add(m); this.addBoxCollider(w[0], w[1], w[2] / 2, w[3] / 2); });
    [[-14,-18],[14,-30],[-14,-42]].forEach((p,i)=>this.addInteractable('marker',new THREE.Vector3(p[0],0,p[1]),'Mark rock '+(i+1),0xd6a85b));
    this.createSign(new THREE.Vector3(0,0,-4),'ROCKY PASS');
  }

  createHiddenGroveSetpiece() {
    const leaf = new THREE.MeshLambertMaterial({ color: 0x174b26 });
    for(let i=0;i<8;i++){ const g=new THREE.Mesh(new THREE.SphereGeometry(2.1,8,6),leaf); g.position.set(-15+(i%2)*3,2,-16-Math.floor(i/2)*4); this.scene.add(g); }
    this.addInteractable('hiddenPath',new THREE.Vector3(-15,0,-22),'Reveal hidden path',0x8ee08e);
    this.createSign(new THREE.Vector3(5,0,-8),'LOOK CAREFULLY');
  }

  createTorchCaveSetpiece() {
    [[-6,-18],[6,-30],[-6,-42],[6,-54]].forEach((p,i)=>{
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,2.4,6),new THREE.MeshLambertMaterial({color:0x5c4033})); pole.position.set(p[0],1.2,p[1]);
      const flame=new THREE.Mesh(new THREE.ConeGeometry(0.28,0.7,8),new THREE.MeshBasicMaterial({color:0xffa020})); flame.position.set(p[0],2.6,p[1]);
      const light=new THREE.PointLight(0xff9a3d,1.0,8); light.position.set(p[0],2.3,p[1]);
      this.scene.add(pole,flame,light); this.addInteractable('torch',new THREE.Vector3(p[0],0,p[1]),'Light torch '+(i+1),0xffb347);
    });
  }

  createMountainPassSetpiece() {
    const snow=new THREE.MeshLambertMaterial({color:0xdce8ef});
    for(let i=0;i<5;i++){ const m=new THREE.Mesh(new THREE.ConeGeometry(5,12,5),snow); m.position.set(-30+i*15,6,-70); this.scene.add(m); }
    this.addInteractable('bridge',new THREE.Vector3(0,0,-30),'Cross mountain bridge',0x8b6914);
    this.addInteractable('summit',new THREE.Vector3(0,0,-62),'Reach mountain summit',0xe8f2ff);
  }

  createOutpostSetpiece() {
    const crateMat=new THREE.MeshLambertMaterial({color:0x7a4b2b});
    [[-10,-20],[10,-20],[-8,-40],[8,-40]].forEach((p,i)=>{
      const c=new THREE.Mesh(new THREE.BoxGeometry(2,1.5,2),crateMat); c.position.set(p[0],0.75,p[1]); this.scene.add(c);
      this.addInteractable('supply',new THREE.Vector3(p[0],0,p[1]),'Secure supply '+(i+1),0xe6b04a);
    });
    this.createSign(new THREE.Vector3(0,0,-6),'PHILISTINE OUTPOST');
  }

  createFortressSetpiece() {
    [[-12,-12],[12,-12],[-12,-36],[12,-36]].forEach((p,i)=>this.addInteractable('banner',new THREE.Vector3(p[0],0,p[1]),'Capture banner '+(i+1),0xd94a4a));
    this.addInteractable('gateSwitch',new THREE.Vector3(0,0,-22),'Open fortress gate',0xf1d15b);
  }

  createBattlefieldSetpiece() {
    [[-10,-14],[10,-26],[-10,-40],[10,-54],[0,-66]].forEach((p,i)=>this.addInteractable('standard',new THREE.Vector3(p[0],0,p[1]),'Secure battlefield standard '+(i+1),0xd94a4a));
  }

  createGoliathTerritorySetpiece() {
    [[-3,-18],[3,-28],[-3,-38],[3,-48],[-3,-58]].forEach((p,i)=>{
      const mark=new THREE.Mesh(new THREE.CircleGeometry(2.1,12),new THREE.MeshLambertMaterial({color:0x35261e})); mark.rotation.x=-Math.PI/2; mark.position.set(p[0],0.07,p[1]); this.scene.add(mark);
      this.addInteractable('footprint',new THREE.Vector3(p[0],0,p[1]),'Inspect giant footprint '+(i+1),0xc49a6c);
    });
  }

  createFinalBattleSetpiece() {
    const stoneMat=new THREE.MeshLambertMaterial({color:0xa6adb4});
    for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.DodecahedronGeometry(0.55,0),stoneMat); const a=(i/5)*Math.PI*2; s.position.set(Math.cos(a)*5,0.5,-70+Math.sin(a)*5); this.scene.add(s); }
    this.addInteractable('arena',new THREE.Vector3(0,0,-70),'Enter final arena',0xf4d35e);
  }

  placeCollectibles() {
    const custom = this.theme && this.theme.collectibles;
    const stonePositions = custom
      ? custom.map(p => new THREE.Vector3(p[0], 0.3, p[1]))
      : [
          new THREE.Vector3(-7, 0.3, 8),
          new THREE.Vector3(9, 0.3, 2),
          new THREE.Vector3(-4, 0.3, -8),
          new THREE.Vector3(6, 0.3, -18),
          new THREE.Vector3(-10, 0.3, -30)
        ];
    stonePositions.forEach((pos, i) => {
      this.addCollectible(i === 0 ? 'faith' : 'stone', pos, i === 0 ? 'Faith Token' : ('Smooth Stone ' + (i + 1)));
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

    this.addCollectible('stick', new THREE.Vector3(-12, 0.4, 4), 'Stick');
    this.addCollectible('stick', new THREE.Vector3(11, 0.4, -26), 'Stick');
    this.addCollectible('feather', new THREE.Vector3(8, 0.4, 12), 'Feather');
    this.addCollectible('feather', new THREE.Vector3(-11, 0.4, -16), 'Feather');
    this.addCollectible('flint', new THREE.Vector3(-3, 0.4, -6), 'Flint');
    this.addCollectible('flint', new THREE.Vector3(13, 0.4, -42), 'Flint');
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
    } else if (type === 'stick') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 0.7, 6),
        new THREE.MeshLambertMaterial({ color: 0x8b5a2b, emissive: 0x221100 })
      );
      mesh.rotation.z = 0.6;
    } else if (type === 'feather') {
      mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.45, 6),
        new THREE.MeshLambertMaterial({ color: 0xf5f0e0, emissive: 0x333322 })
      );
    } else if (type === 'flint') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.22, 0),
        new THREE.MeshLambertMaterial({ color: 0x4a5560, emissive: 0x111122 })
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

  createLandmark() {
    const kind = this.theme && this.theme.landmark;
    if (!kind || kind === 'arena') return;
    if (kind === 'hut') {
      const hut = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3, 6), new THREE.MeshLambertMaterial({ color: 0x8b5a2b }));
      hut.position.set(-14, 1.5, 10);
      this.scene.add(hut);
      this.addCollider(-14, 10, 1.8);
    } else if (kind === 'arch') {
      const mat = new THREE.MeshLambertMaterial({ color: 0x7a6a58 });
      const l = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 1.5), mat); l.position.set(-4, 4, -56);
      const r = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 1.5), mat); r.position.set(4, 4, -56);
      const t = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 1.5), mat); t.position.set(0, 8.2, -56);
      this.scene.add(l); this.scene.add(r); this.scene.add(t);
      this.addCollider(-4, -56, 1.2);
      this.addCollider(4, -56, 1.2);
    } else if (kind === 'shrine') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0xc8c0a0 }));
      base.position.set(-15, 0.25, -22);
      const stone = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, 0.4), new THREE.MeshLambertMaterial({ color: 0xddd4b0 }));
      stone.position.set(-15, 1.5, -22);
      this.scene.add(base); this.scene.add(stone);
      this.addCollider(-15, -22, 1.3);
    } else if (kind === 'crystal') {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(2.2), new THREE.MeshLambertMaterial({ color: 0x88ccff, emissive: 0x224466 }));
      c.position.set(0, 2.2, -62);
      this.scene.add(c);
    } else if (kind === 'tower') {
      const tw = new THREE.Mesh(new THREE.BoxGeometry(3.5, 10, 3.5), new THREE.MeshLambertMaterial({ color: 0x6a5a48 }));
      tw.position.set(16, 5, -8);
      this.scene.add(tw);
      this.addCollider(16, -8, 2.2);
    }
  }

  createDenseForest() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x1e6b32 });
    for (let i = 0; i < 28; i++) {
      const g = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.2, 6), trunkMat);
      tr.position.y = 1.6;
      const lf = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 6), leafMat);
      lf.position.y = 3.4;
      g.add(tr); g.add(lf);
      const side = i % 2 === 0 ? -1 : 1;
      g.position.set(side * (10 + (i % 5) * 2.2), 0, -8 - i * 2.4);
      this.scene.add(g);
      this.addCollider(g.position.x, g.position.z, 0.9);
    }
  }

  createCliffs() {
    const mat = new THREE.MeshLambertMaterial({ color: 0x7a6a58 });
    for (let i = 0; i < 10; i++) {
      const h = 4 + (i % 4) * 1.8;
      const m = new THREE.Mesh(new THREE.BoxGeometry(5, h, 4), mat);
      const side = i % 2 === 0 ? -18 : 18;
      m.position.set(side + (i % 3) * 2, h / 2, -10 - i * 7);
      this.scene.add(m);
      this.addBoxCollider(m.position.x, m.position.z, 2.5, 2);
    }
  }

  createCaveShell() {
    const rock = new THREE.MeshLambertMaterial({ color: 0x2c2434 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(70, 2, 120), rock);
    roof.position.set(0, 12, -30);
    this.scene.add(roof);
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 8, 6), rock);
      p.position.set((i % 2 ? 8 : -8), 4, -8 - i * 8);
      this.scene.add(p);
      this.addCollider(p.position.x, p.position.z, 0.8);
    }
  }

  createCrystals() {
    const mat = new THREE.MeshPhongMaterial({ color: 0x88aaff, emissive: 0x223366, shininess: 70 });
    for (let i = 0; i < 16; i++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 5), mat);
      c.position.set((i % 2 ? 6 : -6) + Math.sin(i) * 3, 0.8, -6 - i * 4.5);
      this.scene.add(c);
    }
  }

  createStream() {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 80),
      new THREE.MeshPhongMaterial({ color: 0x3a7ab8, transparent: true, opacity: 0.78, shininess: 70 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(-14, 0.05, -25);
    this.scene.add(water);
  }

  createBridge() {
    const plank = new THREE.MeshLambertMaterial({ color: 0x6a4a28 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4, 0.25, 16), plank);
    deck.position.set(0, 1.2, -30);
    this.scene.add(deck);
    [-2, 2].forEach(x => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 16), plank);
      rail.position.set(x, 1.7, -30);
      this.scene.add(rail);
    });
  }

  createFort() {
    const wall = new THREE.MeshLambertMaterial({ color: 0x8a7a68 });
    const wood = new THREE.MeshLambertMaterial({ color: 0x5a4030 });
    const left = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 2), wall);
    left.position.set(-16, 3, -22);
    const right = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 2), wall);
    right.position.set(16, 3, -22);
    this.scene.add(left); this.scene.add(right);
    this.addBoxCollider(left.position.x, left.position.z, 9, 1);
    this.addBoxCollider(right.position.x, right.position.z, 9, 1);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 1.2), wood);
    gate.position.set(0, 2.5, -22);
    this.scene.add(gate);
    this.addBoxCollider(gate.position.x, gate.position.z, 3, 0.6);
    [-20, 20].forEach(x => {
      const tw = new THREE.Mesh(new THREE.BoxGeometry(3, 9, 3), wall);
      tw.position.set(x, 4.5, -22);
      this.scene.add(tw);
      this.addBoxCollider(tw.position.x, tw.position.z, 1.5, 1.5);
    });
  }

  createBanners() {
    const cloth = new THREE.MeshLambertMaterial({ color: 0x8b1a1a, side: THREE.DoubleSide });
    for (let i = 0; i < 8; i++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 5, 6),
        new THREE.MeshLambertMaterial({ color: 0x4a3020 })
      );
      const side = i % 2 ? 10 : -10;
      pole.position.set(side, 2.5, -8 - i * 8);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1), cloth);
      flag.position.set(side + (i % 2 ? -0.9 : 0.9), 4.2, -8 - i * 8);
      this.scene.add(pole); this.scene.add(flag);
    }
  }

  createGiantMarks() {
    const dirt = new THREE.MeshLambertMaterial({ color: 0x3a2a20 });
    for (let i = 0; i < 5; i++) {
      const print = new THREE.Mesh(new THREE.CircleGeometry(2.4, 10), dirt);
      print.rotation.x = -Math.PI / 2;
      print.position.set((i % 2 ? 3 : -3), 0.06, -20 - i * 10);
      this.scene.add(print);
    }
  }

  // Each world gets its own visual identity and a fuller, hand-dressed environment.
  // Lightweight geometry keeps the game mobile-friendly while avoiding repetitive layouts.
  createIndividualWorldDressing() {
    const id = this.worldId;
    const C = THREE.Color;
    const mat = (color, rough=0.9) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
    const add = (mesh, x, y, z, ry=0, collider=0) => {
      mesh.position.set(x,y,z); mesh.rotation.y = ry; mesh.castShadow = true; mesh.receiveShadow = true; this.scene.add(mesh);
      if (collider) this.addCollider(x,z,collider);
      return mesh;
    };
    const stone = this.theme.dark ? 0x46404e : 0x777064;
    const wood = 0x62452f;
    const gold = this.theme.sun || 0xe0a060;
    const cloth = this.theme.dark ? 0x5b496f : 0x9d3d36;
    const green = this.theme.dark ? 0x29402f : 0x3f7435;
    const water = 0x4e9fc0;
    const addRock = (x,z,s=0.6) => add(new THREE.Mesh(new THREE.DodecahedronGeometry(s,1),mat(stone)),x,s*.45,z,Math.random()*6.28,s*.75);
    const addTree = (x,z,scale=1) => {
      const g=new THREE.Group();
      const t=new THREE.Mesh(new THREE.CylinderGeometry(.16*scale,.28*scale,2.2*scale,7),mat(wood)); t.position.y=1.1*scale;
      const l=new THREE.Mesh(new THREE.SphereGeometry(1.05*scale,10,7),mat(green)); l.position.y=2.45*scale;
      g.add(t,l); add(g,x,0,z,0,.7*scale);
    };
    const addTorch = (x,z) => {
      const g=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,1.8,6),mat(wood)); pole.position.y=.9;
      const flame=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,6),new THREE.MeshBasicMaterial({color:0xff7138})); flame.position.y=1.95;
      const light=new THREE.PointLight(0xff7b45,.45,7); light.position.y=1.8; g.add(pole,flame,light); add(g,x,0,z);
    };
    const addArch = (x,z,color=stone) => {
      const g=new THREE.Group(), m=mat(color);
      const a=new THREE.Mesh(new THREE.BoxGeometry(.9,3.6,.9),m); const b=a.clone(); a.position.set(-1.7,1.8,0); b.position.set(1.7,1.8,0);
      const top=new THREE.Mesh(new THREE.BoxGeometry(4.3,.7,1),m); top.position.y=3.5; g.add(a,b,top); add(g,x,0,z,0,1.0);
    };
    const addCrate = (x,z,rot=0) => add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat(wood)),x,.5,z,rot,.7);
    const addBanner = (x,z,color=cloth) => {
      const g=new THREE.Group(); const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,3.8,6),mat(wood)); pole.position.y=1.9;
      const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.72),new THREE.MeshStandardMaterial({color,roughness:.8,side:THREE.DoubleSide})); flag.position.set(.58,3.15,0); g.add(pole,flag); add(g,x,0,z);
    };
    const addBoulderRow=(count,spread,z)=>{ for(let i=0;i<count;i++) addRock((i-(count-1)/2)*spread,z+(i%2)*1.4,.45+(i%3)*.18); };

    // 40 intentionally different scene treatments.
    switch(id) {
      case 1: addTree(-16,-18); addTree(16,-34); addArch(0,-55); addBanner(-11,-12); addBanner(11,-38); break;
      case 2: addBoulderRow(7,3.2,-28); addArch(0,-72,0x70685e); addRock(-19,-52,1.4); addRock(20,-60,1.2); break;
      case 3: for(let i=0;i<8;i++) addTree((i%2?-1:1)*(11+i%3*4),8-i*11,.9+(i%3)*.12); addTorch(-6,-46); addTorch(6,-62); break;
      case 4: for(let i=0;i<7;i++) addRock((i%2?-1:1)*(8+i%3*3),-10-i*9,.7+(i%3)*.25); addTorch(-5,-35); addTorch(5,-55); break;
      case 5: addArch(0,-42,0x7c8077); addBoulderRow(6,4,-60); addTree(-24,-22,.8); addTree(24,-70,.8); break;
      case 6: for(let i=0;i<5;i++){addCrate(-11+i*1.4,4); addCrate(10-i*1.3,-9,.2*i);} addBanner(-13,-28); addBanner(13,-48); addTorch(-7,-34); addTorch(7,-34); break;
      case 7: addArch(0,-24,0x707477); addBanner(-12,-18); addBanner(12,-18); addBanner(-12,-56); addBanner(12,-56); break;
      case 8: for(let i=0;i<5;i++){addRock(-18+i*3,-38-i*5,.6);addRock(18-i*3,-44-i*5,.55);} addBanner(-10,-30); addBanner(10,-42); addCrate(-5,-50); addCrate(5,-50,.4); break;
      case 9: for(let i=0;i<8;i++) addRock(-9+i*2.5,-16-i*8,.35+(i%2)*.2); addTree(-22,-30,.85); addTree(22,-52,.85); addArch(0,-76,0x718080); break;
      case 10: addTree(-20,-18); addTree(20,-25); addTree(-18,-55); addTree(18,-68); addBanner(0,-10); addCrate(-7,14); addCrate(7,14); break;
      case 11: addTree(-21,-18,.9); addTree(21,-40,.9); addArch(0,-62,0x8d7b58); addBanner(-10,-48,0xc7a33a); addBanner(10,-48,0xc7a33a); break;
      case 12: addBoulderRow(8,2.7,-35); addArch(0,-68,0x7a5548); addBanner(-15,-25,0x8e342b); break;
      case 13: for(let i=0;i<12;i++) addTree((i%2?-1:1)*(10+(i%4)*4),5-i*8,1+(i%3)*.12); addTorch(-6,-42); addTorch(6,-58); break;
      case 14: for(let i=0;i<9;i++) addRock((i%2?-1:1)*(10+i%3*4),-8-i*9,.5+(i%3)*.2); addArch(0,-52,0xa77d4b); addBanner(0,-18,0xd49a45); break;
      case 15: addBoulderRow(7,3.4,-30); addArch(0,-74,0x6d7778); addTree(-25,-18,.7); addTree(25,-60,.7); break;
      case 16: addArch(0,-24,0x5c5f68); addBanner(-14,-34,0x4b5260); addBanner(14,-34,0x4b5260); addTorch(-8,-48); addTorch(8,-48); break;
      case 17: for(let i=0;i<7;i++) addBanner(i%2?-12:12,-10-i*10,i%3?0xa33d32:0x3f568f); addCrate(-6,-52); addCrate(6,-52); break;
      case 18: for(let i=0;i<9;i++){addRock((i%2?-1:1)*(8+i%3*3),-12-i*8,.65+(i%3)*.2); addTorch((i%2?-1:1)*5,-16-i*9);} break;
      case 19: addBoulderRow(9,3.3,-32); addRock(-20,-58,2.0); addRock(20,-66,2.2); addArch(0,-78,0x654d46); break;
      case 20: for(let i=0;i<8;i++) addBanner(i%2?-13:13,-12-i*8,i%2?0x7d2030:0xc4a43a); addArch(0,-48,0x66535c); addBoulderRow(10,3,-74); break;
      case 21: for(let i=0;i<12;i++) addTree((i%2?-1:1)*(11+(i%4)*3),6-i*8,.85+(i%3)*.12); addArch(0,-70,0x7c7758); break;
      case 22: for(let i=0;i<10;i++) addTree((i%2?-1:1)*(12+(i%3)*5),10-i*10,1.15); addBoulderRow(6,4,-64); break;
      case 23: for(let i=0;i<10;i++) addRock(-10+i*2.3,-15-i*7,.35+(i%3)*.15); addTree(-22,-38,.75); addTree(22,-58,.75); addArch(0,-78,0x62766d); break;
      case 24: for(let i=0;i<6;i++){addRock(-10+i*4,-22-i*9,.8); addTorch((i%2?-1:1)*6,-18-i*10);} addArch(0,-68,0x76513e); break;
      case 25: addArch(0,-22,0x707982); addArch(0,-68,0x707982); addBanner(-14,-42,0x45618a); addBanner(14,-42,0x45618a); break;
      case 26: addBoulderRow(8,3.5,-25); addArch(0,-60,0xa27449); addRock(-22,-48,1.7); addRock(22,-72,1.6); break;
      case 27: addTorch(-9,8); addTorch(9,2); addTorch(-9,-35); addTorch(9,-48); addBanner(0,-20,0x536fa8); addCrate(-6,-5); addCrate(6,-5); break;
      case 28: addArch(0,-24,0x74736f); addBoulderRow(7,3,-48); addBanner(-13,-62,0x7a4d45); addBanner(13,-62,0x7a4d45); break;
      case 29: addTree(-20,-20,.8); addTree(20,-42,.8); addBoulderRow(7,3.2,-60); addArch(0,-78,0x8a7045); break;
      case 30: for(let i=0;i<9;i++) addRock(-10+i*2.4,-12-i*8,.3+(i%2)*.18); addTree(-22,-30,.85); addTree(22,-56,.85); addArch(0,-76,0x668f98); break;
      case 31: addCrate(-7,10); addCrate(7,10); addCrate(-7,-2); addCrate(7,-2); addTree(-20,-34,.8); addTree(20,-50,.8); addBanner(0,-24,0xc0a047); break;
      case 32: for(let i=0;i<8;i++) addRock(-9+i*2.5,-18-i*8,.32+(i%3)*.14); addTree(-22,-46,.9); addTree(22,-64,.9); addArch(0,-80,0x6f8580); break;
      case 33: for(let i=0;i<8;i++) addRock((i%2?-1:1)*(10+i%3*3),-15-i*8,.6+(i%3)*.2); addBanner(-10,-32,0x9d2e20); addBanner(10,-48,0xe08a2c); addTorch(-5,-58); addTorch(5,-58); break;
      case 34: addArch(0,-24,0x8a6a42); addBanner(-14,-42,0xb36a2c); addBanner(14,-42,0xb36a2c); addTorch(-7,-58); addTorch(7,-58); break;
      case 35: addBoulderRow(7,3.5,-34); addArch(0,-76,0x78858a); addTree(-24,-20,.75); addTree(24,-64,.75); break;
      case 36: addTorch(-8,4); addTorch(8,-4); addTorch(-8,-34); addTorch(8,-48); for(let i=0;i<5;i++) addRock((i%2?-1:1)*(8+i*2),-18-i*10,.6); break;
      case 37: addCrate(-7,8); addCrate(7,8); addBanner(-12,-16,0xa23c32); addBanner(12,-28,0x4f5d8f); addBanner(-12,-48,0xa23c32); addBanner(12,-60,0x4f5d8f); break;
      case 38: addArch(0,-26,0x7d6858); addCrate(-8,-12); addCrate(8,-20); addTree(-22,-46,.8); addTree(22,-66,.8); addBanner(0,-54,0x865343); break;
      case 39: addArch(0,-24,0x624854); addBanner(-13,-38,0x8c3040); addBanner(13,-38,0xd0a040); addBanner(-13,-62,0x8c3040); addBanner(13,-62,0xd0a040); addBoulderRow(8,3,-76); break;
      case 40: addArch(0,-26,0x68506a); addArch(0,-70,0x68506a); for(let i=0;i<8;i++) addBanner(i%2?-14:14,-10-i*9,i%2?0x7b3040:0xd0a040); addBoulderRow(10,3.2,-84); addRock(-22,-62,2.1); addRock(22,-62,2.1); break;
    }

    // Give every world a subtle foreground scatter so the playable space feels alive.
    const seed = id * 137 + 41; let r = seed;
    const random = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
    for(let i=0;i<10;i++) {
      const side = random() > .5 ? 1 : -1;
      const x = side * (6.5 + random()*30);
      const z = 20 - random()*108;
      if(Math.abs(x)<7) continue;
      const type = i%3;
      if(type===0) addRock(x,z,.18+random()*.3);
      else if(type===1) addTree(x,z,.45+random()*.35);
      else addTorch(x,z);
    }
  }

  // Organic environment pass: natural terrain silhouettes, varied vegetation,
  // geological forms, water and atmospheric depth. Decorative only; gameplay
  // colliders remain separate so the world stays predictable.
  createOrganicEnvironment() {
    const id = this.worldId;
    let seed = 9187 * id + 13331;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const has = n => this.hasFeature(n);
    const ground = this.theme.ground || 0x5a8f4a;
    const foliage = this.theme.dark ? 0x26382d : 0x3f7138;
    const foliage2 = this.theme.dark ? 0x334a3a : 0x5d8b45;
    const rock = this.theme.dark ? 0x403b48 : 0x777064;
    const sand = [14,26,29,38].includes(id) || has('dunes') ? 0xc69b57 : ground;
    const organicMat = c => new THREE.MeshStandardMaterial({color:c, roughness:0.96, metalness:0});

    // Soft biome-specific ground accents instead of square/pixel tiles.
    for (let i = 0; i < 95; i++) {
      const side = rand() > 0.5 ? 1 : -1;
      const x = side * (7.5 + rand() * 34);
      const z = 18 - rand() * 112;
      const s = 0.25 + rand() * 1.25;
      const geo = new THREE.SphereGeometry(s, 7, 5);
      const c = (has('forest') || has('trees')) ? (rand() > 0.55 ? foliage2 : foliage) : sand;
      const m = new THREE.Mesh(geo, organicMat(c));
      m.scale.y = 0.10 + rand() * 0.18;
      m.position.set(x, 0.03 + rand() * 0.06, z);
      m.rotation.y = rand() * Math.PI * 2;
      m.receiveShadow = true;
      this.scene.add(m);
    }

    // Natural shrubs and grasses in forest/valley biomes.
    if (has('forest') || has('trees') || [1,3,13,21,22,31].includes(id)) {
      for (let i = 0; i < 32; i++) {
        const side = i % 2 ? 1 : -1;
        const x = side * (8 + rand() * 31), z = 16 - rand() * 108;
        const g = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.07,0.45+rand()*0.35,6), organicMat(0x5b442f));
        stem.position.y = 0.25;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.32+rand()*0.2,8,6), organicMat(rand()>0.5?foliage:foliage2));
        leaf.scale.y = 0.7;
        leaf.position.y = 0.62;
        g.add(stem, leaf); g.position.set(x,0,z); g.rotation.y=rand()*Math.PI*2;
        g.castShadow = true; this.scene.add(g);
      }
    }

    // Organic rock clusters and boulders for mountains, deserts and rocky worlds.
    if (has('rocks') || has('cliffs') || has('mountains') || [2,12,14,19,26,29,35].includes(id)) {
      for (let i = 0; i < 24; i++) {
        const side = i % 2 ? 1 : -1;
        const x = side * (9 + rand() * 30), z = 12 - rand() * 105;
        const r = 0.45 + rand() * 1.25;
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), organicMat(rock));
        m.scale.set(1 + rand()*0.7, 0.65 + rand()*0.7, 0.8 + rand()*0.55);
        m.position.set(x, r*0.45, z); m.rotation.set(rand(),rand(),rand());
        m.castShadow=true; m.receiveShadow=true; this.scene.add(m);
      }
    }

    // Layered distant mountain silhouettes make open areas feel geographically deep.
    if (has('mountains') || has('cliffs') || [2,5,12,15,20,26,35,40].includes(id)) {
      for (let i=0;i<9;i++) {
        const h=8+rand()*16, w=7+rand()*9;
        const m=new THREE.Mesh(new THREE.ConeGeometry(w,h,9), organicMat(rock));
        m.position.set(-48+i*12+(rand()-.5)*5,h*0.45-0.4,-108-rand()*12);
        m.rotation.y=rand()*Math.PI; this.scene.add(m);
      }
    }

    // Desert dune ridges: smooth overlapping forms rather than blocky tiles.
    if ([14,26,29,38].includes(id)) {
      const duneMat=organicMat(0xc79a55);
      for(let i=0;i<10;i++){
        const side=i%2?1:-1, x=side*(12+rand()*28), z=10-rand()*108;
        const m=new THREE.Mesh(new THREE.SphereGeometry(4+rand()*4,12,8),duneMat);
        m.scale.set(1.8,0.35+rand()*0.18,0.8); m.position.set(x,-0.05,z); this.scene.add(m);
      }
    }

    // Cave atmosphere: dark rock masses, mineral accents and low mist.
    if (has('cave')) {
      const caveMat=organicMat(this.theme.dark?0x29252f:0x4b454d);
      for(let i=0;i<12;i++){
        const side=i%2?1:-1, x=side*(8+rand()*29), z=5-rand()*100;
        const m=new THREE.Mesh(new THREE.DodecahedronGeometry(1+rand()*2,1),caveMat);
        m.scale.y=1.3+rand()*1.2; m.position.set(x,0.9,z); m.rotation.set(rand(),rand(),rand()); m.castShadow=true; this.scene.add(m);
      }
      const mistMat=new THREE.MeshBasicMaterial({color:this.theme.fog||0x332b40,transparent:true,opacity:0.12,depthWrite:false});
      for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(4+rand()*4,12,8),mistMat);m.scale.y=.35;m.position.set((rand()-.5)*30,1+rand()*1.5,-15-rand()*70);this.scene.add(m);}
    }

    // Ocean/shore treatment for water-oriented worlds. Kept outside the playable corridor.
    if ([30,32].includes(id) || has('ocean')) {
      const waterMat=new THREE.MeshStandardMaterial({color:0x3d91b0,transparent:true,opacity:0.72,roughness:0.18,metalness:0.05});
      const water=new THREE.Mesh(new THREE.PlaneGeometry(34,118,24,48),waterMat);
      water.rotation.x=-Math.PI/2; water.position.set(27, -0.28, -42); this.scene.add(water);
      for(let i=0;i<18;i++){
        const foam=new THREE.Mesh(new THREE.TorusGeometry(0.35+rand()*0.5,0.035,5,12),new THREE.MeshBasicMaterial({color:0xc8eef4,transparent:true,opacity:0.45}));
        foam.rotation.x=Math.PI/2; foam.position.set(10+rand()*28,-0.08,15-rand()*110); this.scene.add(foam);
      }
    }

    // Atmospheric depth: stronger haze in dark/cave worlds, softer horizon elsewhere.
    const fogColor = this.theme.fog || this.theme.sky || 0x87b8e0;
    const near = this.theme.dark ? 22 : 48;
    const far = this.theme.dark ? 105 : 185;
    this.scene.fog = new THREE.Fog(fogColor, near, far);

    // Tiny ambient fireflies/dust in selected natural worlds.
    if (has('forest') || has('stream') || id===23 || id===27) {
      const dustMat=new THREE.MeshBasicMaterial({color:0xe7d79b,transparent:true,opacity:0.38});
      for(let i=0;i<28;i++){
        const d=new THREE.Mesh(new THREE.SphereGeometry(0.035+rand()*0.035,5,4),dustMat);
        d.position.set((rand()-.5)*55,0.7+rand()*3,18-rand()*110); this.scene.add(d);
      }
    }
  }

  getNearbyInteractable(playerPos, radius = 2.6) {
    return this.interactables.find(i => !i.used && i.group && i.group.position.distanceTo(playerPos) < radius);
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
