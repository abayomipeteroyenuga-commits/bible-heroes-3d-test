
function safeHumanoidTraverse(obj, fn) {
  if (obj && typeof obj.traverse === 'function') obj.traverse(fn);
}
// Shared low-poly humanoid rig + animation clips for David, guardians and bosses.
function Humanoid(parent, opt) {
  opt = opt || {};
  // David is permanently locked to the biblical shepherd design.
  if (opt && opt.isDavid) opt.modernDavid = false;
  this.opt = opt;
  this.parent = parent;
  this.time = 0;
  this.cycle = 0;
  this.attackT = 0;
  this.hitT = 0;
  this.emoteT = 0;
  this.state = 'IDLE';
  this.prevState = 'IDLE';
  this.blend = 1;
  this.lookYaw = 0;
  this.lookPitch = 0;
  this.build(opt);
}

Humanoid.prototype.build = function (opt) {
  const std = function (color, rough, metal) {
    if (THREE.MeshStandardMaterial) {
      return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.7 : rough, metalness: metal || 0 });
    }
    return new THREE.MeshPhongMaterial({ color: color, shininess: 18 });
  };
  const skin = std(opt.skin || 0xf0c4a0, 0.52, 0.02);
  const skinDark = std(opt.skinDark || 0xd9a07c, 0.62, 0.03);
  const shirt = std(opt.shirt || 0x4a7c59, 0.82, 0);
  const pants = std(opt.pants || 0x4a3a2c, 0.86, 0);
  const pantsDark = std(opt.pantsDark || 0x33261c, 0.88, 0);
  const boot = std(opt.boot || 0x5c3a22, 0.7, 0.05);
  const leather = std(opt.leather || 0x8a5a32, 0.72, 0.04);
  const hairM = std(opt.hair || 0x2c1a0e, 0.78, 0);
  const accent = std(opt.accent || 0xc9a15b, 0.45, 0.35);
  const armor = std(opt.armor || 0x6a5a48, 0.42, 0.45);

  this.root = new THREE.Group();
  this.root.name = 'HipsRoot';
  parentSafe(this.parent, this.root);

  this.hips = new THREE.Group();
  this.hips.name = 'Hips';
  this.hips.position.y = 0.78;
  this.root.add(this.hips);

  this.spine = new THREE.Group();
  this.spine.name = 'Spine';
  this.spine.position.y = 0.08;
  this.hips.add(this.spine);

  this.chest = new THREE.Group();
  this.chest.name = 'Chest';
  this.chest.position.y = 0.22;
  this.spine.add(this.chest);
  const torso = opt.isDavid
    ? new THREE.Mesh(new THREE.SphereGeometry(0.245, 20, 14), shirt)
    : new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.42, 14), shirt);
  torso.position.y = opt.isDavid ? 0.075 : 0.08;
  if (opt.isDavid) torso.scale.set(0.91, 1.24, 0.67);
  this.chest.add(torso);
  if (opt.isDavid) {
    const bodyMat = std(opt.shirt || 0x4a7c59, 0.78, 0);
    const chestPanel = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14), bodyMat);
    chestPanel.scale.set(0.92, 0.72, 0.22);
    chestPanel.position.set(0, 0.12, 0.17);
    this.chest.add(chestPanel);

    // Anatomical clothing volume: subtle pectoral and abdominal planes make
    // the shirt/jacket follow a real human torso instead of a single sphere.
    [-1, 1].forEach(side => {
      const pec = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), bodyMat);
      pec.scale.set(0.95, 0.52, 0.16);
      pec.position.set(side * 0.095, 0.14, 0.185);
      this.chest.add(pec);
    });
    for (let i = 0; i < 2; i++) {
      const abs = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), bodyMat);
      abs.scale.set(0.82, 0.52, 0.13);
      abs.position.set(0, 0.035 - i * 0.075, 0.19);
      this.chest.add(abs);
    }
    // A compact pelvis/waist transition gives the legs a natural hip anchor.
    const pelvisMat = std(opt.pants || 0x26334a, 0.86, 0);
    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 12), pelvisMat);
    pelvis.scale.set(1.02, 0.55, 0.70);
    pelvis.position.set(0, -0.005, 0.005);
    this.hips.add(pelvis);
  }

  // Layered biblical clothing: tunic hem, belt and optional sash/cloak make David
  // read as a dressed human character rather than a primitive mannequin.
  if (opt.tunic !== false && !opt.modernDavid) {
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.255, 0.14, 20), shirt);
    hem.position.y = -0.12;
    this.chest.add(hem);
    // Soft front/back drape panels give the tunic a cloth silhouette instead of a boxy shirt.
    const tunicFront = new THREE.Mesh(new THREE.SphereGeometry(0.205, 20, 14), shirt);
    tunicFront.scale.set(0.88, 1.10, 0.20);
    tunicFront.position.set(0, 0.015, 0.18);
    this.chest.add(tunicFront);
    const foldMat = std(opt.shirtDark || 0x66543a, 0.92, 0);
    for (const x of [-0.075, 0, 0.075]) {
      const fold = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.30, 0.012), foldMat);
      fold.position.set(x, -0.005, 0.372);
      fold.rotation.z = x * 0.7;
      this.chest.add(fold);
    }
  }
  if (opt.belt !== false && !opt.modernDavid) {
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.055, 14), leather);
    belt.position.y = -0.10;
    this.chest.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.025), accent);
    buckle.position.set(0, -0.10, 0.215);
    this.chest.add(buckle);
  }
  if (opt.sash && !opt.modernDavid) {
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 0.025), std(opt.sash, 0.8, 0));
    sash.position.set(opt.sashSide === 'left' ? -0.13 : 0.13, 0.02, 0.19);
    sash.rotation.z = opt.sashSide === 'left' ? -0.10 : 0.10;
    this.chest.add(sash);
  }
  if (opt.cloak && !opt.modernDavid) {
    const cloak = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.30, 0.52, 12, 1, true), std(opt.cloak, 0.9, 0));
    cloak.position.set(0, 0.02, -0.045);
    cloak.rotation.y = Math.PI;
    this.chest.add(cloak);
    this.cloak = cloak;
  }
  if (opt.armorChest && !opt.modernDavid) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.22), armor);
    plate.position.set(0, 0.12, 0.04);
    this.chest.add(plate);
  }

  this.neck = new THREE.Group();
  this.neck.position.y = 0.32;
  this.chest.add(this.neck);
  this.neck.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), skin));

  this.head = new THREE.Group();
  this.head.position.y = 0.16;
  this.neck.add(this.head);
  const faceMat = new THREE.MeshStandardMaterial({ color: opt.skin || 0xf0c4a0, roughness: 0.55, metalness: 0 });
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 22), faceMat);
  skull.scale.set(opt.isDavid ? 1.00 : 0.92, opt.isDavid ? 1.08 : 1.02, opt.isDavid ? 0.92 : 0.88);
  this.head.add(skull);
  if (opt.isDavid) {
    // More lifelike adult/teen human proportions: slightly smaller head,
    // broader shoulders and a tapered torso rather than a toy-like shape.
    this.head.scale.set(0.82, 0.84, 0.82);
  }
  const hairMat = std(opt.hair || 0x2c1a0e, 0.86, 0);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.168, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.46),
    hairMat
  );
  hair.position.set(0, 0.022, -0.012);
  this.head.add(hair);
  // David has natural, polished human hair — never a helmet. Each world can
  // use a different silhouette while keeping the same recognizable face.
  if (opt.isDavid && !opt.modernDavid) this.addDavidHair(opt.hairStyle || 1, hairMat, faceMat);
  this.earL = mesh(new THREE.SphereGeometry(0.035, 10, 8), faceMat, -0.148, 0.0, 0.0);
  this.earL.scale.set(0.55, 1.15, 0.75);
  this.head.add(this.earL);
  this.earR = this.earL.clone();
  this.earR.position.x = 0.148;
  this.head.add(this.earR);
  const eyeW = new THREE.MeshLambertMaterial({ color: 0xfffdf6 });
  const iris = new THREE.MeshLambertMaterial({ color: opt.eye || 0x2e5a7a });
  this.eyeL = mesh(new THREE.SphereGeometry(0.024, 10, 8), eyeW, -0.046, 0.018, 0.132);
  this.eyeL.scale.set(opt.isDavid ? 0.92 : 1.1, opt.isDavid ? 0.88 : 1.05, 0.42);
  this.head.add(this.eyeL);
  this.eyeR = this.eyeL.clone();
  this.eyeR.position.x = 0.046;
  this.head.add(this.eyeR);
  this.head.add(mesh(new THREE.SphereGeometry(0.012, 8, 6), iris, -0.046, 0.018, 0.145));
  this.head.add(mesh(new THREE.SphereGeometry(0.012, 8, 6), iris, 0.046, 0.018, 0.145));
  this.browL = mesh(new THREE.BoxGeometry(0.042, 0.007, 0.012), hairMat, -0.046, 0.058, 0.128);
  this.browR = mesh(new THREE.BoxGeometry(0.042, 0.007, 0.012), hairMat, 0.046, 0.058, 0.128);
  this.head.add(this.browL);
  this.head.add(this.browR);
  const nose = mesh(new THREE.SphereGeometry(0.018, 12, 8), faceMat, 0, -0.008, 0.138);
  nose.scale.set(0.65, 0.85, 0.8);
  this.head.add(nose);
  if (opt.isDavid) {
    // Refined human facial planes: jaw, chin and subtle ears give David a
    // recognizably human silhouette instead of a toy/mannequin face.
    const jawMat = new THREE.MeshStandardMaterial({ color: opt.skin || 0xf0c4a0, roughness: 0.58 });
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 16), jawMat);
    jaw.scale.set(1.03, 0.64, 0.86);
    jaw.position.set(0, -0.045, 0.018);
    this.head.add(jaw);
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), jawMat);
    chin.scale.set(0.82, 0.58, 0.62);
    chin.position.set(0, -0.067, 0.122);
    this.head.add(chin);
    const earInnerMat = new THREE.MeshStandardMaterial({ color: opt.skinDark || 0xd49a79, roughness: 0.6 });
    [-1,1].forEach(side => {
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.017, 10, 8), earInnerMat);
      inner.scale.set(0.55, 1.0, 0.42);
      inner.position.set(side * 0.151, 0.0, 0.008);
      this.head.add(inner);
    });
  }
  this.smile = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xc47a72 })
  );
  this.smile.position.set(0, -0.048, 0.128);
  this.smile.scale.set(1.6, 0.55, 0.45);
  this.head.add(this.smile);
  if (opt.isDavid) {
    const cheekMat = new THREE.MeshLambertMaterial({ color: 0xe7a58f, transparent: true, opacity: 0.22 });
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), cheekMat);
    cheekL.position.set(-0.075, -0.018, 0.124); cheekL.scale.set(1.2, 0.65, 0.35);
    const cheekR = cheekL.clone(); cheekR.position.x = 0.075;
    this.head.add(cheekL, cheekR);
    const eyeGlintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glL = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), eyeGlintMat);
    glL.position.set(-0.052, 0.025, 0.151);
    const glR = glL.clone(); glR.position.x = 0.052;
    this.head.add(glL, glR);
  }
  if (opt.helmet) {
    if (hair) hair.visible = false;
    this.addHelmet(opt.helmet, armor, accent, leather);
  }

  if (opt.isDavid && !opt.modernDavid) {
    // Asymmetrical shepherd shoulder cloth: clearly biblical and useful for the hero silhouette.
    const shoulderCloth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.205, 0.235, 0.34, 16, 1, true),
      std(opt.wrap || 0x9a6a3c, 0.9, 0)
    );
    shoulderCloth.scale.set(0.78, 1.0, 0.28);
    shoulderCloth.position.set(-0.12, 0.10, -0.015);
    shoulderCloth.rotation.z = -0.16;
    this.chest.add(shoulderCloth);
    // Narrow hanging edge of the shepherd cloth gives a natural layered drape.
    const clothEdge = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), std(opt.wrap || 0x9a6a3c, 0.92, 0));
    clothEdge.scale.set(0.42, 1.75, 0.20);
    clothEdge.position.set(-0.255, -0.045, 0.015);
    clothEdge.rotation.z = -0.10;
    this.chest.add(clothEdge);
  }

  this.shoulderL = new THREE.Group();
  this.shoulderL.position.set(opt.isDavid ? -0.285 : -0.22, 0.24, 0);
  this.chest.add(this.shoulderL);
  this.shoulderR = new THREE.Group();
  this.shoulderR.position.set(opt.isDavid ? 0.285 : 0.22, 0.24, 0);
  this.chest.add(this.shoulderR);
  if (opt.pads) {
    this.shoulderL.add(mesh(new THREE.SphereGeometry(0.08, 8, 6), leather, 0, 0, 0));
    this.shoulderR.add(mesh(new THREE.SphereGeometry(0.08, 8, 6), leather, 0, 0, 0));
  }

  this.armL = this.makeArm(-1, skin, shirt, leather, opt.isDavid);
  this.shoulderL.add(this.armL.root);
  this.armR = this.makeArm(1, skin, shirt, leather, opt.isDavid);
  this.shoulderR.add(this.armR.root);
  if (opt.isDavid && !opt.modernDavid) this.addDavidHeroDetails(skin, skinDark, shirt, leather, hairMat);

  this.thighL = new THREE.Group();
  this.thighL.position.set(opt.isDavid ? -0.118 : -0.09, 0, 0);
  this.hips.add(this.thighL);
  this.thighL.add(mesh(new THREE.CylinderGeometry(0.078, 0.067, 0.39, 12), pants, 0, -0.18, 0));
  this.shinL = new THREE.Group();
  this.shinL.position.y = -0.39;
  this.thighL.add(this.shinL);
  this.shinL.add(mesh(new THREE.CylinderGeometry(0.061, 0.051, 0.37, 12), pantsDark, 0, -0.17, 0));
  this.footL = new THREE.Group();
  this.footL.position.set(0, -0.37, 0.04);
  this.shinL.add(this.footL);
  this.footL.add(mesh(new THREE.BoxGeometry(0.11, 0.055, 0.20), boot, 0, 0, 0.045));
  if (opt.isDavid) { this.thighL.scale.set(1.08, 1.04, 1.05); this.shinL.scale.set(1.04, 1.03, 1.04); this.footL.scale.set(1.08, 1.08, 1.12); }
  if (opt.isDavid) this.addDavidFootwear(this.footL, opt.shoeStyle || 1, boot, leather, accent);

  this.thighR = new THREE.Group();
  this.thighR.position.set(opt.isDavid ? 0.118 : 0.09, 0, 0);
  this.hips.add(this.thighR);
  this.thighR.add(mesh(new THREE.CylinderGeometry(0.078, 0.067, 0.39, 12), pants, 0, -0.18, 0));
  this.shinR = new THREE.Group();
  this.shinR.position.y = -0.39;
  this.thighR.add(this.shinR);
  this.shinR.add(mesh(new THREE.CylinderGeometry(0.061, 0.051, 0.37, 12), pantsDark, 0, -0.17, 0));
  this.footR = new THREE.Group();
  this.footR.position.set(0, -0.37, 0.04);
  this.shinR.add(this.footR);
  this.footR.add(mesh(new THREE.BoxGeometry(0.11, 0.055, 0.20), boot, 0, 0, 0.045));
  if (opt.isDavid) { this.thighR.scale.set(1.08, 1.04, 1.05); this.shinR.scale.set(1.04, 1.03, 1.04); this.footR.scale.set(1.08, 1.08, 1.12); }
  if (opt.isDavid) this.addDavidFootwear(this.footR, opt.shoeStyle || 1, boot, leather, accent);

  // Character identity details: small silhouette pieces make David and guardians
  // read as authored characters even at gameplay camera distance.
  if (opt.isDavid && !opt.modernDavid) {
    const pouchMat = std(opt.pouch || 0x6f4728, 0.78, 0.02);
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.12, 0.055), pouchMat);
    pouch.position.set(opt.pouchSide === 'right' ? 0.19 : -0.19, -0.08, 0.055);
    pouch.rotation.z = opt.pouchSide === 'right' ? -0.08 : 0.08;
    this.hips.add(pouch);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.06), accent);
    flap.position.set(pouch.position.x, pouch.position.y + 0.052, pouch.position.z + 0.004);
    this.hips.add(flap);

  } else {
    // Guardian waist guard: gives armored enemies a stronger, readable silhouette.
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.27, 0.16, 12, 1, false),
      armor
    );
    skirt.position.y = -0.16;
    this.hips.add(skirt);
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), accent);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 0.11, 0.165);
    this.chest.add(crest);
  }

  // David's hands are intentionally empty. His combat/projectile system is
  // gameplay-only and no weapon, sling, staff, or hand-held prop is attached.
  this.sling = null;
  this.staff = null;

  if (opt.weapon === 'club') {
    const club = mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.7, 6), armor, 0, -0.28, 0.04);
    this.armR.hand.add(club);
  } else if (opt.weapon === 'spear') {
    this.armR.hand.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 6), leather, 0, -0.4, 0.05));
    this.armR.hand.add(mesh(new THREE.ConeGeometry(0.05, 0.16, 6), armor, 0, -0.98, 0.05));
  } else if (opt.weapon === 'staff') {
    this.armR.hand.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.2, 6), leather, 0, -0.35, 0.04));
  }

  this.neck.name = 'Neck';
  this.head.name = 'Head';
  this.shoulderL.name = 'ShoulderL';
  this.shoulderR.name = 'ShoulderR';
  this.armL.root.name = 'ArmL';
  this.armR.root.name = 'ArmR';
  this.armL.elbow.name = 'ElbowL';
  this.armR.elbow.name = 'ElbowR';
  this.armL.hand.name = 'HandL';
  this.armR.hand.name = 'HandR';
  this.thighL.name = 'ThighL';
  this.thighR.name = 'ThighR';
  this.shinL.name = 'ShinL';
  this.shinR.name = 'ShinR';
  this.footL.name = 'FootL';
  this.footR.name = 'FootR';

  this.torsoGroup = this.chest;
  this.headGroup = this.head;
  this.leftArmGroup = this.armL.root;
  this.rightArmGroup = this.armR.root;
  this.leftLegGroup = this.thighL;
  this.rightLegGroup = this.thighR;
  this.slingMesh = this.sling;
  this.initMixer();
};

Humanoid.createSling = function (style, leather, accent) {
  // 40 handcrafted sling silhouettes. A larger set of worlds now has a
  // distinct FIRE treatment inspired by readable fantasy-weapon language:
  // flame crowns, molten cores, runes, halos, ember rings and layered tongues.
  const i = Math.max(1, Math.min(40, Number(style) || 1));
  const palettes = [
    [0x7a4a28,0xc89b52],[0x315f7a,0x72c7e8],[0x6b3b2f,0xe09a58],[0x4b3f72,0xb7a3f5],
    [0x5d5528,0xe1c45b],[0x285d52,0x73d8b7],[0x713c58,0xe9a5c5],[0x405a35,0xa9d56f],
    [0x334e76,0x79aef2],[0x75452f,0xf0b45d],[0x5a3a72,0xc99aef],[0x2d625d,0x7ce0d0],
    [0x7a3b3b,0xf27d6d],[0x3d557a,0x8fc4ff],[0x6b522c,0xf0c66c],[0x4b6540,0xb6df86],
    [0x633d55,0xd98bb8],[0x345f6b,0x7fd4e3],[0x72502c,0xe7a75b],[0x4c4775,0xa99ef0],
    [0x6b332f,0xff9d4d],[0x315f4f,0x75e0a7],[0x69434d,0xe49aa5],[0x354f72,0x7db8ef],
    [0x76562c,0xf1cb69],[0x3b5f48,0x88d59a],[0x583c72,0xbfa0f0],[0x70402e,0xf09c61],
    [0x2f5c67,0x6ed9df],[0x68403d,0xe7a06d],[0x42556f,0x93baf0],[0x5f6231,0xd3e27a],
    [0x71344f,0xef8fa8],[0x335e54,0x78d7c0],[0x6b4828,0xf0bd62],[0x4b4770,0xb6a4f2],
    [0x713a32,0xffad58],[0x2f6657,0x77e2b1],[0x63436c,0xd9a0ef],[0x7a392f,0xff7b42]
  ];
  const pal = palettes[i - 1];
  const wrapMat = new THREE.MeshStandardMaterial({ color: pal[0], roughness: 0.72, metalness: 0.05 });
  const trimMat = new THREE.MeshStandardMaterial({ color: pal[1], roughness: 0.4, metalness: 0.35 });
  const g = new THREE.Group();
  g.name = 'DavidSling_World_' + i;

  const left = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.016,0.19,7), wrapMat);
  left.position.set(-0.045,0.005,0.015); left.rotation.z=-0.30; g.add(left);
  const right = left.clone(); right.position.x=0.045; right.rotation.z=0.30; g.add(right);
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.045,10,6), wrapMat);
  pouch.scale.set(1.15,0.7,0.55); pouch.position.set(0,-0.075,0.02); g.add(pouch);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.016,8,6), trimMat);
  bead.position.set(0,0.035,0.02); g.add(bead);

  // Distinct architectural accents by world group.
  if (i % 4 === 0) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052,0.009,6,12), trimMat);
    ring.rotation.x=Math.PI/2; ring.position.set(0,-0.075,0.02); g.add(ring);
  } else if (i % 4 === 1) {
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.022,0), trimMat);
    diamond.position.set(0,-0.075,0.045); g.add(diamond);
  } else if (i % 4 === 2) {
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.018,0.018), trimMat);
    guard.position.set(0,-0.02,0.02); guard.rotation.z=0.12; g.add(guard);
  } else {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.025,0.06,5), trimMat);
    crest.position.set(0,-0.075,0.045); crest.rotation.x=Math.PI/2; g.add(crest);
  }

  // Fire designs: deliberately varied rather than a single repeated ember.
  // Each entry maps a world to a different fire silhouette/effect.
  const fireDesigns = {
    2:'thunder', 3:'bomb', 4:'fireLong', 5:'ember', 6:'thunder', 7:'crown', 8:'bomb', 9:'lava', 10:'twinfire', 11:'fireLong', 12:'halo', 13:'thunder', 14:'magma',
    15:'bomb', 16:'sun', 17:'fireLong', 18:'wings', 19:'thunder', 20:'rune', 21:'bomb', 22:'phoenix', 23:'fireLong', 24:'petals', 25:'thunder', 26:'eye',
    27:'bomb', 28:'inferno', 29:'fireLong', 30:'sacred', 31:'thunder', 32:'spiral', 33:'bomb', 34:'fireLong', 35:'triple', 36:'thunder', 37:'flare', 38:'bomb', 39:'dragon', 40:'eternal'
  };
  const fireType = fireDesigns[i];
  if (fireType) {
    const fireMat = new THREE.MeshBasicMaterial({ color:0xff6a00, transparent:true, opacity:0.96 });
    const hotMat = new THREE.MeshBasicMaterial({ color:0xffdf66, transparent:true, opacity:0.98 });
    const emberMat = new THREE.MeshBasicMaterial({ color:0xff2a00, transparent:true, opacity:0.9 });
    g.userData.fireParts = [];
    const addFlame = (x,y,z,sx,sy,sz,rot=0,mat=fireMat) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.015,0.075,5), mat);
      m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.rotation.z=rot; g.add(m);
      g.userData.fireParts.push(m); return m;
    };
    const addEmber = (x,y,z,size=0.012,mat=hotMat) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(size,6,5), mat);
      m.position.set(x,y,z); g.add(m); g.userData.fireParts.push(m); return m;
    };
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.019,8,6), hotMat);
    core.position.set(0,-0.075,0.055); g.add(core); g.userData.fireParts.push(core);
    g.userData.fireSling = true;
    g.userData.fireType = fireType;
    g.userData.fireParts.forEach(m => { m.userData.baseScale = m.scale.clone(); m.userData.basePos = m.position.clone(); });
    g.userData.firePhase = i * 0.37;

    if (fireType === 'ember') {
      addEmber(0,-0.075,0.075,0.018,hotMat); addFlame(0,-0.025,0.055,0.8,0.9,0.8);
    } else if (fireType === 'crown') {
      for (let k=-2;k<=2;k++) addFlame(k*0.025,-0.028,0.055,0.7+(2-Math.abs(k))*0.15,1.1+(k===0?0.3:0),0.8,k*0.22,k===0?hotMat:fireMat);
    } else if (fireType === 'lava') {
      for (let k=0;k<5;k++) addEmber(-0.032+k*0.016,-0.078+(k%2)*0.008,0.058,0.009+(k%2)*0.004,k%2?fireMat:hotMat);
    } else if (fireType === 'twinfire') {
      addFlame(-0.027,-0.03,0.06,0.85,1.2,0.8,-0.18,fireMat); addFlame(0.027,-0.03,0.06,0.85,1.2,0.8,0.18,fireMat);
    } else if (fireType === 'halo') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.055,0.007,5,14), fireMat);
      halo.rotation.x=Math.PI/2; halo.position.set(0,-0.075,0.055); g.add(halo); g.userData.fireParts.push(halo);
    } else if (fireType === 'magma') {
      const core2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.028,0), emberMat);
      core2.position.set(0,-0.075,0.055); g.add(core2); g.userData.fireParts.push(core2);
      addFlame(-0.02,-0.03,0.05,0.6,1.0,0.7,-0.2,hotMat); addFlame(0.02,-0.03,0.05,0.6,1.0,0.7,0.2,fireMat);
    } else if (fireType === 'sun') {
      for (let k=0;k<6;k++) { const a=k*Math.PI/3; addEmber(Math.cos(a)*0.048,-0.075+Math.sin(a)*0.048,0.055,0.008,hotMat); }
    } else if (fireType === 'wings') {
      addFlame(-0.045,-0.035,0.05,0.7,1.3,0.7,-0.48,fireMat); addFlame(0.045,-0.035,0.05,0.7,1.3,0.7,0.48,fireMat);
    } else if (fireType === 'rune') {
      const rune = new THREE.Mesh(new THREE.TorusGeometry(0.033,0.006,5,8), hotMat);
      rune.rotation.x=Math.PI/2; rune.rotation.z=Math.PI/8; rune.position.set(0,-0.075,0.057); g.add(rune); g.userData.fireParts.push(rune);
    } else if (fireType === 'phoenix') {
      addFlame(0,-0.025,0.055,0.8,1.6,0.7,0,hotMat);
      addFlame(-0.038,-0.035,0.05,0.55,1.0,0.7,-0.4,fireMat); addFlame(0.038,-0.035,0.05,0.55,1.0,0.7,0.4,fireMat);
    } else if (fireType === 'petals') {
      for (let k=0;k<4;k++) { const a=k*Math.PI/2; addFlame(Math.cos(a)*0.03,-0.075+Math.sin(a)*0.03,0.055,0.55,0.9,0.65,a,fireMat); }
    } else if (fireType === 'eye') {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034,8,6), emberMat); eye.scale.set(1.35,0.55,0.7); eye.position.set(0,-0.075,0.058); g.add(eye); g.userData.fireParts.push(eye);
      addEmber(0,-0.075,0.084,0.009,hotMat);
    } else if (fireType === 'inferno') {
      for (let k=-2;k<=2;k++) addFlame(k*0.022,-0.026,0.05,0.65,1.0+Math.abs(k)*0.12,0.7,k*0.28,k===0?hotMat:fireMat);
      addEmber(0,-0.075,0.09,0.014,emberMat);
    } else if (fireType === 'sacred') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.043,0.006,5,12), hotMat);
      ring.rotation.x=Math.PI/2; ring.position.set(0,-0.075,0.055); g.add(ring); g.userData.fireParts.push(ring);
      addFlame(0,-0.02,0.058,0.55,1.5,0.65,0,hotMat);
    } else if (fireType === 'spiral') {
      for (let k=0;k<5;k++) { const a=k*0.75; addEmber(Math.cos(a)*0.038,-0.075+Math.sin(a)*0.028,0.055+0.006*k,0.009, k%2?fireMat:hotMat); }
    } else if (fireType === 'triple') {
      addFlame(-0.032,-0.03,0.05,0.55,1.1,0.65,-0.22,fireMat); addFlame(0,-0.018,0.055,0.65,1.45,0.7,0,hotMat); addFlame(0.032,-0.03,0.05,0.55,1.1,0.65,0.22,fireMat);
    } else if (fireType === 'flare') {
      const flare = new THREE.Mesh(new THREE.TorusGeometry(0.04,0.009,5,10), fireMat);
      flare.rotation.x=Math.PI/2; flare.position.set(0,-0.075,0.055); g.add(flare); g.userData.fireParts.push(flare);
      for (let k=0;k<4;k++) { const a=k*Math.PI/2; addFlame(Math.cos(a)*0.03,-0.075+Math.sin(a)*0.03,0.055,0.45,0.85,0.6,a,hotMat); }
    } else if (fireType === 'dragon') {
      addFlame(0,-0.018,0.055,0.75,1.6,0.7,0,hotMat);
      addFlame(-0.035,-0.035,0.05,0.5,1.1,0.65,-0.5,fireMat); addFlame(0.035,-0.035,0.05,0.5,1.1,0.65,0.5,fireMat);
      addEmber(0,-0.075,0.09,0.012,emberMat);
    } else if (fireType === 'eternal') {
      for (let k=0;k<7;k++) { const a=(k/7)*Math.PI*2; addEmber(Math.cos(a)*0.048,-0.075+Math.sin(a)*0.048,0.055,0.008, k%2?fireMat:hotMat); }
      addFlame(0,-0.018,0.058,0.8,1.8,0.7,0,hotMat);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.065,0.006,5,16), emberMat);
      halo.rotation.x=Math.PI/2; halo.position.set(0,-0.075,0.055); g.add(halo); g.userData.fireParts.push(halo);
    }
  }
  g.userData.world = i;
  g.userData.palette = pal;
  return g;
};

Humanoid.prototype.setSlingStyle = function (style) {
  // David no longer carries a sling. Keep this method for legacy game calls.
  this.sling = null;
  this.slingMesh = null;
};

Humanoid.prototype.addDavidHair = function (style, hairMat, faceMat) {
  const g = new THREE.Group();
  g.name = 'DavidHairStyle_' + style;
  this.head.add(g);
  const s = ((Number(style) - 1) % 10 + 10) % 10 + 1;
  const lock = (x,y,z,scale,rot) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 9), hairMat);
    m.position.set(x,y,z); m.scale.set(scale[0],scale[1],scale[2]);
    if (rot) m.rotation.z = rot; g.add(m); return m;
  };
  // Side/back volume makes the hair read as actual strands instead of a cap.
  if (s <= 3) {
    for (let i=0;i<5;i++) lock(-0.105 + i*0.052, 0.025-(i%2)*0.018, -0.105,  [0.75,1.35,0.72], (i-2)*0.10);
    for (let i=0;i<4;i++) lock(-0.14, 0.0-i*0.035, -0.015, [0.70,1.0,0.72], -0.16);
    for (let i=0;i<4;i++) lock(0.14, 0.0-i*0.035, -0.015, [0.70,1.0,0.72], 0.16);
  } else if (s <= 6) {
    for (let side of [-1,1]) for (let i=0;i<4;i++) lock(side*(0.115+i*0.006), 0.045-i*0.032, -0.015, [0.65,1.05,0.68], side*0.18);
    for (let i=0;i<3;i++) lock(-0.055+i*0.055, 0.045, 0.115, [0.65,0.72,0.55], (i-1)*0.10);
  } else {
    // Longer curls/locks for later worlds; restrained so they never cover the eyes.
    for (let side of [-1,1]) {
      for (let i=0;i<5;i++) lock(side*(0.11+0.008*Math.sin(i)), 0.02-i*0.037, -0.005, [0.72,1.15,0.70], side*0.14);
      lock(side*0.105, 0.07, 0.09, [0.70,0.90,0.60], side*0.12);
    }
  }
  // World-specific finishing detail: tied hair, short braid, or clean side locks.
  if (s===2 || s===5 || s===8) {
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.026,0.008,6,10), new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:0.8}));
    tie.rotation.x=Math.PI/2; tie.position.set(0,-0.105,-0.105); g.add(tie);
  }
  if (s===4 || s===7 || s===10) {
    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.035,10,8), hairMat);
    curl.position.set(0.0,0.115,0.045); curl.scale.set(1.0,0.65,0.75); g.add(curl);
  }
};

function skinMaterialFrom(opt) {
  return new THREE.MeshStandardMaterial({ color: opt.skin || 0xf0bd98, roughness: 0.58, metalness: 0.03 });
}


Humanoid.prototype.addDavidFootwear = function (foot, style, boot, leather, accent) {
  // Hand-crafted biblical leather sandals: rounded foot bed, raised heel,
  // layered toe straps and a heel strap. No modern sneaker geometry.
  const soleMat = new THREE.MeshStandardMaterial({color:0x241b16, roughness:0.94, metalness:0});
  const sole = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 10), soleMat);
  sole.scale.set(1.0, 0.16, 1.28);
  sole.position.set(0,-0.035,0.045); foot.add(sole);

  const footbed = new THREE.Mesh(new THREE.SphereGeometry(0.092, 18, 10), leather);
  footbed.scale.set(0.98,0.18,1.18);
  footbed.position.set(0,-0.014,0.048); foot.add(footbed);

  const strap = (z, y, rot) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.010,0.014,0.105,8), leather);
    m.rotation.z=Math.PI/2; m.rotation.y=rot||0;
    m.position.set(0,y,z); foot.add(m); return m;
  };
  strap(0.005,0.010,0.10);
  strap(0.055,0.014,-0.08);
  strap(0.102,0.012,0.05);

  const heel = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 9), boot);
  heel.scale.set(0.82,0.55,0.72);
  heel.position.set(0,0.004,-0.048); foot.add(heel);

  const heelStrap = new THREE.Mesh(new THREE.BoxGeometry(0.085,0.018,0.018), leather);
  heelStrap.position.set(0,0.038,-0.045); foot.add(heelStrap);
};

Humanoid.prototype.addHelmet = function (style, armor, accent, leather) {
  // Professional Biblical warrior helmet: dome + forehead crown + cheek guards.
  // IMPORTANT: no torus/cylinder crosses the face, so there is no horizontal "bar".
  const helm = new THREE.Group();
  this.head.add(helm);
  this.helmet = helm;
  const metal = armor || new THREE.MeshLambertMaterial({ color: 0x6a5a48 });
  const trim = accent || new THREE.MeshLambertMaterial({ color: 0xc9a15b });
  const dark = leather || new THREE.MeshLambertMaterial({ color: 0x3a2a1c });
  const kind = style === true ? 'basic' : String(style);

  const heavy = kind === 'heavy' || kind === 'boss' || kind === 'commander';
  const r = heavy ? 0.205 : 0.195;

  // Rounded shell, positioned high enough to clear the eyes and brows.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.56),
    metal
  );
  dome.scale.set(1.02, 0.92, 0.98);
  dome.position.set(0, 0.055, -0.012);
  helm.add(dome);

  // Forehead crown sits ABOVE the eyebrows; it is not a horizontal face bar.
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, heavy ? 0.055 : 0.045, 0.055),
    metal
  );
  crown.position.set(0, 0.108, 0.085);
  crown.rotation.x = -0.10;
  helm.add(crown);

  // Small side/cheek guards, kept away from the eyes.
  const guardH = heavy ? 0.115 : 0.09;
  const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.035, guardH, 0.055), metal);
  cheekL.position.set(-0.145, -0.015, 0.035);
  cheekL.rotation.z = -0.12;
  helm.add(cheekL);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.145;
  cheekR.rotation.z = 0.12;
  helm.add(cheekR);

  // Leather chin straps for higher tiers.
  if (heavy || kind === 'elite') {
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.018), dark);
    strapL.position.set(-0.12, -0.09, 0.08);
    strapL.rotation.z = -0.18;
    helm.add(strapL);
    const strapR = strapL.clone();
    strapR.position.x = 0.12;
    strapR.rotation.z = 0.18;
    helm.add(strapR);
  }

  if (kind === 'elite' || kind === 'commander' || kind === 'boss') {
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.045), trim);
    crest.position.set(0, 0.175, -0.015);
    helm.add(crest);
  }
};


Humanoid.prototype.addDavidHeroDetails = function (skin, skinDark, shirt, leather, hairMat) {
  // Final hero polish: youthful athletic anatomy, articulated empty hands and
  // layered fabric. Keep the silhouette readable at gameplay distance.
  const detail = (geo, mat, pos, scale, rot) => {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    if (rot) m.rotation.set(rot[0]||0, rot[1]||0, rot[2]||0);
    return m;
  };
  const shoulderMat = shirt;
  [-1,1].forEach(side => {
    const deltoid = detail(new THREE.SphereGeometry(0.075, 16, 10), shoulderMat, [side*0.015, -0.015, 0], [1.15,0.82,0.92]);
    this[side < 0 ? 'shoulderL' : 'shoulderR'].add(deltoid);
  });
  // Subtle forearm volume follows the real arm instead of a straight tube.
  [-1,1].forEach(side => {
    const arm = side < 0 ? this.armL : this.armR;
    const fore = detail(new THREE.SphereGeometry(0.052, 14, 10), skin, [0,-0.145,0], [0.82,1.45,0.72]);
    arm.elbow.add(fore);
    // Empty-hand knuckles: separate rounded forms make the hands expressive.
    arm.fingers.forEach((f, i) => {
      const knuckle = detail(new THREE.SphereGeometry(0.010, 8, 6), skinDark, [0,0.015,0.010], [1.0,0.65,0.75]);
      f.add(knuckle);
    });
  });
  // Tunic collar and layered hem for a more premium cloth silhouette.
  const collar = detail(new THREE.TorusGeometry(0.105,0.012,7,18), leather, [0,0.275,0.02], [1.18,0.72,0.9], [Math.PI/2,0,0]);
  this.chest.add(collar);
  [-1,1].forEach(side => {
    const fold = detail(new THREE.SphereGeometry(0.065, 12, 9), shirt, [side*0.13,-0.14,0.12], [0.48,1.45,0.22], [0,0,side*0.08]);
    this.chest.add(fold);
  });
  // A few individually placed curls break up the cap-like top hair silhouette.
  [-1,1].forEach(side => {
    for (let i=0;i<3;i++) {
      const curl = detail(new THREE.SphereGeometry(0.036, 12, 9), hairMat, [side*(0.105+i*0.018),0.095-i*0.045,0.105], [0.9,1.18,0.72], [0,0,side*(0.12+i*0.05)]);
      this.head.add(curl);
    }
  });
};

Humanoid.prototype.makeArm = function (side, skin, shirt, leather, isDavid) {
  const root = new THREE.Group();
  const upper = new THREE.Group();
  root.add(upper);
  upper.add(mesh(new THREE.CylinderGeometry(isDavid ? 0.072 : 0.055, isDavid ? 0.054 : 0.048, 0.28, 16), shirt, 0, -0.14, 0));
  const elbow = new THREE.Group();
  elbow.position.y = -0.28;
  upper.add(elbow);
  elbow.add(mesh(new THREE.CylinderGeometry(isDavid ? 0.055 : 0.045, isDavid ? 0.042 : 0.04, 0.26, 16), skin, 0, -0.13, 0));
  const hand = new THREE.Group();
  hand.position.y = -0.26;
  elbow.add(hand);
  const palm = mesh(new THREE.SphereGeometry(0.052, 14, 10), skin, 0, -0.02, 0.01);
  palm.scale.set(0.82, 1.12, 0.62);
  hand.add(palm);
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Group();
    f.position.set((-0.024 + i * 0.016) * side, -0.06, 0.01);
    const finger = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), skin);
    finger.scale.set(0.72, 1.65, 0.72);
    finger.rotation.x = 0.08;
    f.add(finger);
    hand.add(f);
    fingers.push(f);
  }
  const thumb = new THREE.Group();
  thumb.position.set(0.04 * side, -0.02, 0.02);
  thumb.rotation.z = -0.7 * side;
  const thumbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 8), skin);
  thumbMesh.scale.set(0.78, 1.55, 0.78);
  thumbMesh.rotation.z = 0.15;
  thumb.add(thumbMesh);
  hand.add(thumb);
  return { root: root, upper: upper, elbow: elbow, hand: hand, fingers: fingers, thumb: thumb };
};

Humanoid.prototype.initMixer = function () {
  this.mixer = new THREE.AnimationMixer(this.root);
  this.actions = {};
  this.currentClip = null;
  this.attackT = 0;
  this.cycle = 0;
  const clips = this.buildClips();
  Object.keys(clips).forEach((name) => {
    const action = this.mixer.clipAction(clips[name]);
    action.enabled = true;
    action.setEffectiveWeight(0);
    if (name === 'IDLE' || name === 'WALK' || name === 'RUN' || name === 'SPRINT') action.setLoop(THREE.LoopRepeat, Infinity);
    else action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = name !== 'IDLE';
    this.actions[name] = action;
  });
  if (this.actions.IDLE) {
    this.actions.IDLE.setEffectiveWeight(1);
    this.actions.IDLE.play();
    this.currentClip = 'IDLE';
  }
};

Humanoid.prototype.qTrack = function (bone, times, eulers) {
  const vals = [];
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  for (let i = 0; i < eulers.length; i++) {
    const r = eulers[i];
    e.set(r[0] || 0, r[1] || 0, r[2] || 0, 'XYZ');
    q.setFromEuler(e);
    vals.push(q.x, q.y, q.z, q.w);
  }
  return new THREE.QuaternionKeyframeTrack(bone + '.quaternion', times, vals);
};

Humanoid.prototype.yTrack = function (node, times, values) {
  return new THREE.NumberKeyframeTrack(node + '.position[y]', times, values);
};

Humanoid.prototype.clip = function (name, duration, tracks) {
  return new THREE.AnimationClip(name, duration, tracks);
};

Humanoid.prototype.buildClips = function () {
  const T = [0, 0.25, 0.5, 0.75, 1];
  const walk = this.clip('WALK', 1, [
    this.qTrack('ThighL', T, [[0.45,0,0],[0.1,0,0],[-0.45,0,0],[-0.1,0,0],[0.45,0,0]]),
    this.qTrack('ThighR', T, [[-0.45,0,0],[-0.1,0,0],[0.45,0,0],[0.1,0,0],[-0.45,0,0]]),
    this.qTrack('ShinL', T, [[0.15,0,0],[0.7,0,0],[0.15,0,0],[0.2,0,0],[0.15,0,0]]),
    this.qTrack('ShinR', T, [[0.15,0,0],[0.2,0,0],[0.15,0,0],[0.7,0,0],[0.15,0,0]]),
    this.qTrack('FootL', T, [[0.15,0,0],[-0.1,0,0],[0.2,0,0],[0.05,0,0],[0.15,0,0]]),
    this.qTrack('FootR', T, [[0.2,0,0],[0.05,0,0],[0.15,0,0],[-0.1,0,0],[0.2,0,0]]),
    this.qTrack('ArmL', T, [[-0.4,0,0.1],[-0.1,0,0.1],[0.4,0,0.1],[0.1,0,0.1],[-0.4,0,0.1]]),
    this.qTrack('ArmR', T, [[0.4,0,-0.1],[0.1,0,-0.1],[-0.4,0,-0.1],[-0.1,0,-0.1],[0.4,0,-0.1]]),
    this.qTrack('ElbowL', T, [[0.25,0,0],[0.35,0,0],[0.25,0,0],[0.2,0,0],[0.25,0,0]]),
    this.qTrack('ElbowR', T, [[0.25,0,0],[0.2,0,0],[0.25,0,0],[0.35,0,0],[0.25,0,0]]),
    this.qTrack('Hips', T, [[0,0.05,0.03],[0,0,0],[0,-0.05,-0.03],[0,0,0],[0,0.05,0.03]]),
    this.qTrack('Chest', T, [[0.06,-0.06,0],[0.06,0,0],[0.06,0.06,0],[0.06,0,0],[0.06,-0.06,0]]),
    this.qTrack('Head', T, [[-0.04,0.03,0],[-0.02,0,0],[-0.04,-0.03,0],[-0.02,0,0],[-0.04,0.03,0]]),
    this.yTrack('HipsRoot', T, [0, 0.02, 0, 0.02, 0])
  ]);
  const runT = [0, 0.2, 0.4, 0.6, 0.8];
  const run = this.clip('RUN', 0.8, [
    this.qTrack('ThighL', runT, [[0.7,0,0],[0.15,0,0],[-0.7,0,0],[-0.15,0,0],[0.7,0,0]]),
    this.qTrack('ThighR', runT, [[-0.7,0,0],[-0.15,0,0],[0.7,0,0],[0.15,0,0],[-0.7,0,0]]),
    this.qTrack('ShinL', runT, [[0.2,0,0],[0.95,0,0],[0.2,0,0],[0.25,0,0],[0.2,0,0]]),
    this.qTrack('ShinR', runT, [[0.2,0,0],[0.25,0,0],[0.2,0,0],[0.95,0,0],[0.2,0,0]]),
    this.qTrack('ArmL', runT, [[-0.85,0,0.12],[-0.2,0,0.12],[0.85,0,0.12],[0.2,0,0.12],[-0.85,0,0.12]]),
    this.qTrack('ArmR', runT, [[0.85,0,-0.12],[0.2,0,-0.12],[-0.85,0,-0.12],[-0.2,0,-0.12],[0.85,0,-0.12]]),
    this.qTrack('ElbowL', runT, [[0.7,0,0],[0.85,0,0],[0.7,0,0],[0.6,0,0],[0.7,0,0]]),
    this.qTrack('ElbowR', runT, [[0.7,0,0],[0.6,0,0],[0.7,0,0],[0.85,0,0],[0.7,0,0]]),
    this.qTrack('Chest', runT, [[0.16,-0.08,0],[0.16,0,0],[0.16,0.08,0],[0.16,0,0],[0.16,-0.08,0]]),
    this.qTrack('Hips', runT, [[0,0.08,0.04],[0,0,0],[0,-0.08,-0.04],[0,0,0],[0,0.08,0.04]]),
    this.qTrack('Head', runT, [[-0.08,0,0],[-0.06,0,0],[-0.08,0,0],[-0.06,0,0],[-0.08,0,0]]),
    this.yTrack('HipsRoot', runT, [0, 0.04, 0, 0.04, 0])
  ]);
  const sprint = this.clip('SPRINT', 0.62, [
    this.qTrack('ThighL', [0,0.155,0.31,0.465,0.62], [[0.9,0,0],[0.2,0,0],[-0.9,0,0],[-0.2,0,0],[0.9,0,0]]),
    this.qTrack('ThighR', [0,0.155,0.31,0.465,0.62], [[-0.9,0,0],[-0.2,0,0],[0.9,0,0],[0.2,0,0],[-0.9,0,0]]),
    this.qTrack('ShinL', [0,0.155,0.31,0.465,0.62], [[0.25,0,0],[1.05,0,0],[0.25,0,0],[0.3,0,0],[0.25,0,0]]),
    this.qTrack('ShinR', [0,0.155,0.31,0.465,0.62], [[0.25,0,0],[0.3,0,0],[0.25,0,0],[1.05,0,0],[0.25,0,0]]),
    this.qTrack('ArmL', [0,0.155,0.31,0.465,0.62], [[-1.05,0,0.14],[-0.25,0,0.14],[1.05,0,0.14],[0.25,0,0.14],[-1.05,0,0.14]]),
    this.qTrack('ArmR', [0,0.155,0.31,0.465,0.62], [[1.05,0,-0.14],[0.25,0,-0.14],[-1.05,0,-0.14],[-0.25,0,-0.14],[1.05,0,-0.14]]),
    this.qTrack('ElbowL', [0,0.31,0.62], [[0.85,0,0],[0.95,0,0],[0.85,0,0]]),
    this.qTrack('ElbowR', [0,0.31,0.62], [[0.85,0,0],[0.75,0,0],[0.85,0,0]]),
    this.qTrack('Chest', [0,0.31,0.62], [[0.24,0,0],[0.24,0.06,0],[0.24,0,0]]),
    this.qTrack('Head', [0,0.62], [[-0.12,0,0],[-0.12,0,0]]),
    this.yTrack('HipsRoot', [0,0.155,0.31,0.465,0.62], [0, 0.05, 0, 0.05, 0])
  ]);
  const idle = this.clip('IDLE', 2.4, [
    this.qTrack('Chest', [0,1.2,2.4], [[0.02,0,0],[0.05,0,0],[0.02,0,0]]),
    this.qTrack('Spine', [0,1.2,2.4], [[0.01,0,0],[0.03,0,0],[0.01,0,0]]),
    this.qTrack('Head', [0,0.8,1.6,2.4], [[0,0.08,0],[0.03,-0.06,0],[0,0.05,0],[0,0.08,0]]),
    this.qTrack('Hips', [0,1.2,2.4], [[0,0.03,0],[0,-0.03,0],[0,0.03,0]]),
    this.qTrack('ArmL', [0,1.2,2.4], [[0.05,0,0.12],[0.08,0,0.14],[0.05,0,0.12]]),
    this.qTrack('ArmR', [0,1.2,2.4], [[0.05,0,-0.12],[0.08,0,-0.14],[0.05,0,-0.12]]),
    this.qTrack('ThighL', [0,2.4], [[0.04,0,0],[0.04,0,0]]),
    this.qTrack('ThighR', [0,2.4], [[0.04,0,0],[0.04,0,0]]),
    this.qTrack('ShinL', [0,2.4], [[0.08,0,0],[0.08,0,0]]),
    this.qTrack('ShinR', [0,2.4], [[0.08,0,0],[0.08,0,0]])
  ]);
  const attack = this.clip('ATTACK', 0.7, [
    this.qTrack('ArmR', [0,0.22,0.45,0.7], [[-0.3,0,-0.1],[-1.7,0.4,-0.1],[0.4,0,-0.1],[-0.2,0,-0.1]]),
    this.qTrack('ElbowR', [0,0.22,0.45,0.7], [[0.3,0,0],[0.15,0,0],[0.55,0,0],[0.25,0,0]]),
    this.qTrack('Chest', [0,0.22,0.45,0.7], [[0,0,0],[0,0.4,0],[0,-0.25,0],[0,0,0]]),
    this.qTrack('Hips', [0,0.22,0.45,0.7], [[0,0,0],[0,0.18,0],[0,-0.12,0],[0,0,0]]),
    this.qTrack('ThighL', [0,0.45,0.7], [[0.2,0,0],[0.28,0,0],[0.1,0,0]]),
    this.qTrack('ArmL', [0,0.7], [[-0.35,0,0.2],[-0.2,0,0.12]])
  ]);
  const hit = this.clip('HIT', 0.4, [
    this.qTrack('Chest', [0,0.15,0.4], [[0,0,0],[-0.25,0,0.08],[0,0,0]]),
    this.qTrack('Head', [0,0.15,0.4], [[0,0,0],[0.2,0.1,0],[0,0,0]]),
    this.qTrack('ArmL', [0,0.15,0.4], [[0,0,0.12],[0.5,0,0.2],[0.1,0,0.12]]),
    this.qTrack('ArmR', [0,0.15,0.4], [[0,0,-0.12],[0.5,0,-0.2],[0.1,0,-0.12]])
  ]);
  const wave = this.clip('WAVE', 1.6, [
    this.qTrack('ArmR', [0,0.25,0.6,1.0,1.4,1.6], [[0,0,-0.12],[-1.6,0,-0.2],[-1.6,0,0.3],[-1.6,0,-0.2],[-1.6,0,0.2],[0,0,-0.12]]),
    this.qTrack('ElbowR', [0,0.25,1.6], [[0.2,0,0],[0.15,0,0],[0.2,0,0]]),
    this.qTrack('HandR', [0,0.6,1.0,1.4], [[0,0,0],[0,0,0.4],[0,0,-0.3],[0,0,0.3]])
  ]);
  const clap = this.clip('CLAP', 1.2, [
    this.qTrack('ArmL', [0,0.2,0.4,0.6,0.8,1.2], [[0,0,0.12],[-0.9,0,0.35],[-0.9,0,0.1],[-0.9,0,0.35],[-0.9,0,0.1],[0,0,0.12]]),
    this.qTrack('ArmR', [0,0.2,0.4,0.6,0.8,1.2], [[0,0,-0.12],[-0.9,0,-0.35],[-0.9,0,-0.1],[-0.9,0,-0.35],[-0.9,0,-0.1],[0,0,-0.12]])
  ]);
  const prayer = this.clip('PRAYER', 2.0, [
    this.qTrack('ArmL', [0,0.3,1.6,2], [[0,0,0.12],[-0.95,0,0.28],[-0.95,0,0.28],[0,0,0.12]]),
    this.qTrack('ArmR', [0,0.3,1.6,2], [[0,0,-0.12],[-0.95,0,-0.28],[-0.95,0,-0.28],[0,0,-0.12]]),
    this.qTrack('Head', [0,0.3,1.6,2], [[0,0,0],[0.22,0,0],[0.22,0,0],[0,0,0]])
  ]);
  const victory = this.clip('VICTORY', 1.8, [
    this.qTrack('ArmL', [0,0.25,0.7,1.2,1.8], [[0,0,0.12],[-2.1,0,0.2],[-2.0,0,0.05],[-2.15,0,0.2],[0,0,0.12]]),
    this.qTrack('ArmR', [0,0.25,0.7,1.2,1.8], [[0,0,-0.12],[-2.2,0,-0.2],[-2.05,0,-0.05],[-2.2,0,-0.2],[0,0,-0.12]]),
    this.yTrack('HipsRoot', [0,0.25,0.5,0.75,1.8], [0,0.06,0,0.06,0])
  ]);
  const think = this.clip('THINKING', 2.0, [
    this.qTrack('ArmR', [0,0.3,1.6,2], [[0,0,-0.12],[-1.5,0.4,-0.1],[-1.5,0.4,-0.1],[0,0,-0.12]]),
    this.qTrack('ElbowR', [0,0.3,2], [[0.2,0,0],[0.75,0,0],[0.2,0,0]]),
    this.qTrack('Head', [0,0.3,2], [[0,0,0],[0,0,0.12],[0,0,0]])
  ]);
  const thumbs = this.clip('THUMBSUP', 1.6, [
    this.qTrack('ArmR', [0,0.25,1.2,1.6], [[0,0,-0.12],[-1.4,0.3,-0.1],[-1.4,0.3,-0.1],[0,0,-0.12]]),
    this.qTrack('ElbowR', [0,0.25,1.6], [[0.2,0,0],[0.35,0,0],[0.2,0,0]])
  ]);
  const surprised = this.clip('SURPRISED', 1.2, [
    this.qTrack('ArmL', [0,0.2,0.9,1.2], [[0,0,0.12],[-1.3,0,0.45],[-1.2,0,0.4],[0,0,0.12]]),
    this.qTrack('ArmR', [0,0.2,0.9,1.2], [[0,0,-0.12],[-1.3,0,-0.45],[-1.2,0,-0.4],[0,0,-0.12]]),
    this.qTrack('Head', [0,0.2,1.2], [[0,0,0],[-0.12,0,0],[0,0,0]])
  ]);
  const worried = this.clip('WORRIED', 2.0, [
    this.qTrack('Head', [0,0.4,1.2,2], [[0,0,0],[0.2,0.1,0],[0.18,-0.1,0],[0,0,0]]),
    this.qTrack('Chest', [0,1,2], [[0,0,0],[0.08,0,0],[0,0,0]]),
    this.qTrack('ArmL', [0,2], [[0.15,0,0.12],[0.15,0,0.12]])
  ]);
  const angry = this.clip('ANGRY', 1.4, [
    this.qTrack('Chest', [0,0.3,1.4], [[0,0,0],[0.1,0,0],[0,0,0]]),
    this.qTrack('ArmL', [0,0.3,1.4], [[0.3,0,0.15],[0.35,0,0.15],[0.1,0,0.12]]),
    this.qTrack('ArmR', [0,0.3,1.4], [[0.3,0,-0.15],[0.35,0,-0.15],[0.1,0,-0.12]]),
    this.qTrack('Head', [0,0.3,1.4], [[-0.06,0,0],[-0.08,0,0],[0,0,0]])
  ]);
  const defeat = this.clip('DEFEATED', 1.2, [
    this.qTrack('Chest', [0,0.6,1.2], [[0,0,0],[0.55,0,0],[0.7,0,0]]),
    this.qTrack('Head', [0,0.6,1.2], [[0,0,0],[0.35,0,0],[0.45,0,0]]),
    this.qTrack('ArmL', [0,1.2], [[0.4,0,0.2],[0.6,0,0.2]]),
    this.qTrack('ArmR', [0,1.2], [[0.4,0,-0.2],[0.6,0,-0.2]])
  ]);
  return {
    IDLE: idle, WALK: walk, RUN: run, SPRINT: sprint, ATTACK: attack, HIT: hit,
    WAVE: wave, CLAP: clap, PRAYER: prayer, VICTORY: victory, THINKING: think,
    THUMBSUP: thumbs, SURPRISED: surprised, WORRIED: worried, ANGRY: angry, DEFEATED: defeat
  };
};

Humanoid.prototype.clipFor = function (state, extra) {
  extra = extra || {};
  if (state === 'EMOTE') {
    const e = String(extra.emote || 'wave').toUpperCase();
    const map = { WAVE:'WAVE', THUMBSUP:'THUMBSUP', CELEBRATE:'VICTORY', CLAP:'CLAP', PRAYER:'PRAYER', HAPPY:'VICTORY', WORRIED:'WORRIED', SAD:'WORRIED', SURPRISED:'SURPRISED', ANGRY:'ANGRY', THINKING:'THINKING', VICTORY:'VICTORY' };
    return map[e] || 'WAVE';
  }
  if (state === 'CHASE' || state === 'PATROL') return state === 'PATROL' ? 'WALK' : 'RUN';
  if (state === 'JUMP') return 'WALK';
  if (this.actions[state]) return state;
  return 'IDLE';
};

Humanoid.prototype.crossfade = function (name) {
  if (!name || !this.actions[name] || name === this.currentClip) return;
  const next = this.actions[name];
  const prev = this.currentClip && this.actions[this.currentClip];
  next.reset();
  next.setEffectiveWeight(1);
  next.play();
  if (prev && prev !== next) prev.crossFadeTo(next, 0.18, false);
  this.currentClip = name;
};

Humanoid.prototype.setState = function (state, extra) {
  const clip = this.clipFor(state, extra);
  if (state === 'ATTACK') this.attackT = 0;
  this.state = state;
  this.crossfade(clip);
};

Humanoid.prototype.update = function (dt, state, extra) {
  extra = extra || {};
  this.time = (this.time || 0) + dt;
  if (this.sling && this.sling.userData && this.sling.userData.fireSling) {
    const fu = this.sling.userData;
    fu.firePhase = (Number.isFinite(fu.firePhase) ? fu.firePhase : 0) + Math.min(Math.max(dt, 0), 0.05) * 3.8;
    const pulse = 0.92 + Math.sin(fu.firePhase) * 0.10;
    (fu.fireParts || []).forEach((m, idx) => {
      if (!m || !m.isObject3D || !m.scale || !m.position) return;
      const wobble = Math.sin(fu.firePhase * 1.7 + idx * 0.85) * 0.10;
      const bs = m.userData.baseScale || new THREE.Vector3(1,1,1);
      const bp = m.userData.basePos || m.position;
      m.scale.set(bs.x * (0.94 + pulse * 0.06), bs.y * (0.90 + pulse * 0.10), bs.z * (0.94 + pulse * 0.06));
      m.rotation.y += dt * (0.6 + idx * 0.025);
      if (fu.fireType === 'halo' || fu.fireType === 'sacred' || fu.fireType === 'flare' || fu.fireType === 'eternal') m.rotation.z += dt * 0.35;
      m.position.y = bp.y + wobble * 0.018;
      if (m.material && m.material.opacity !== undefined) m.material.opacity = 0.78 + Math.sin(fu.firePhase * 2 + idx) * 0.16;
    });
  }
  if (extra.fire) this.attackT = (this.attackT || 0) + dt * 3.6;
  else this.attackT = 0;
  const clip = this.clipFor(state, extra);
  if (clip !== this.currentClip && clip !== 'ATTACK') this.crossfade(clip);
  const atk = this.actions && this.actions.ATTACK;
  if (atk) {
    if (extra.fire) {
      if (!this._firing) {
        this._firing = true;
        atk.reset();
        atk.setLoop(THREE.LoopOnce, 1);
        atk.clampWhenFinished = true;
        atk.setEffectiveWeight(0.75);
        atk.play();
      }
    } else if (this._firing) {
      this._firing = false;
      atk.fadeOut(0.12);
    }
  }
  if (this.mixer) this.mixer.update(dt);
  this.face(extra.mood || (extra.fire ? 'determined' : state === 'HIT' ? 'pain' : state === 'CHASE' ? 'alert' : (this.isDavid ? 'determined' : 'calm')));
  this.cycle = (this.cycle || 0) + dt * 8;
};

Humanoid.prototype.face = function (mood) {
  const b = { calm: 0.08, alert: -0.1, worried: 0.22, determined: -0.12, pain: 0.28, victory: -0.04, curious: 0.05 }[mood] || 0.08;
  if (this.browL) this.browL.rotation.z = b;
  if (this.browR) this.browR.rotation.z = -b;
  if (this.smile) {
    const open = mood === 'victory' ? 1.8 : mood === 'pain' ? 0.9 : mood === 'worried' ? 1.1 : 1.6;
    this.smile.scale.set(open, 0.55, 0.45);
    this.smile.position.y = mood === 'worried' || mood === 'pain' ? -0.042 : -0.048;
  }
  const blink = Math.sin((this.time || 0) * 0.7) > 0.96 ? 0.12 : 1.05;
  if (this.eyeL) this.eyeL.scale.y = blink;
  if (this.eyeR) this.eyeR.scale.y = blink;
};

function mesh(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function parentSafe(parent, child) {
  if (parent && child) parent.add(child);
}
window.getPlayableCharacterOptions = function () {
  return {
    skin: 0xb98a68, skinDark: 0x8f6248, shirt: 0x8b7650, pants: 0x3b3027, boot: 0x5c3a22,
    hair: 0x2a1710, isDavid: true, modernDavid: false, leather: 0x754522, accent: 0xb88a4a,
    pads: false, tunic: true, belt: true, sash: null, cloak: null, shoeStyle: 1,
    pouchSide: 'right', pouch: 0x6f4728, wrap: 0x9a6a3c, sling: false, slingStyle: 1,
    staff: false, helmet: false, eye: 0x3a2418
  };
};

window.Humanoid = Humanoid;
