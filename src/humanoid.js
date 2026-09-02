// Shared low-poly humanoid rig + animation clips for David, guardians and bosses.
function Humanoid(parent, opt) {
  opt = opt || {};
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
  const skin = new THREE.MeshPhongMaterial({ color: opt.skin || 0xf0c4a0, shininess: 28 });
  const skinDark = new THREE.MeshLambertMaterial({ color: opt.skinDark || 0xd9a07c });
  const shirt = new THREE.MeshPhongMaterial({ color: opt.shirt || 0x4a7c59, shininess: 16 });
  const pants = new THREE.MeshLambertMaterial({ color: opt.pants || 0x4a3a2c });
  const pantsDark = new THREE.MeshLambertMaterial({ color: opt.pantsDark || 0x33261c });
  const boot = new THREE.MeshLambertMaterial({ color: opt.boot || 0x5c3a22 });
  const leather = new THREE.MeshLambertMaterial({ color: opt.leather || 0x8a5a32 });
  const hairM = new THREE.MeshLambertMaterial({ color: opt.hair || 0x2c1a0e });
  const accent = new THREE.MeshLambertMaterial({ color: opt.accent || 0xc9a15b });
  const armor = new THREE.MeshLambertMaterial({ color: opt.armor || 0x6a5a48 });

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
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.42, 10), shirt);
  torso.position.y = 0.08;
  this.chest.add(torso);
  if (opt.armorChest) {
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
  const faceMat = new THREE.MeshLambertMaterial({ color: opt.skin || 0xf0c4a0 });
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 2), faceMat);
  skull.scale.set(0.92, 1.02, 0.88);
  this.head.add(skull);
  const hairMat = new THREE.MeshLambertMaterial({ color: opt.hair || 0x2c1a0e });
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.168, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.46),
    hairMat
  );
  hair.position.set(0, 0.02, -0.01);
  this.head.add(hair);
  this.head.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), faceMat, -0.148, 0.0, 0.01));
  this.head.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), faceMat, 0.148, 0.0, 0.01));
  const eyeW = new THREE.MeshLambertMaterial({ color: 0xfffdf6 });
  const iris = new THREE.MeshLambertMaterial({ color: opt.eye || 0x2e5a7a });
  this.eyeL = mesh(new THREE.SphereGeometry(0.024, 10, 8), eyeW, -0.046, 0.018, 0.132);
  this.eyeL.scale.set(1.1, 1.05, 0.42);
  this.head.add(this.eyeL);
  this.eyeR = this.eyeL.clone();
  this.eyeR.position.x = 0.046;
  this.head.add(this.eyeR);
  this.head.add(mesh(new THREE.SphereGeometry(0.012, 8, 6), iris, -0.046, 0.018, 0.145));
  this.head.add(mesh(new THREE.SphereGeometry(0.012, 8, 6), iris, 0.046, 0.018, 0.145));
  this.browL = mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), hairMat, -0.046, 0.058, 0.128);
  this.browR = mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), hairMat, 0.046, 0.058, 0.128);
  this.head.add(this.browL);
  this.head.add(this.browR);
  const nose = mesh(new THREE.SphereGeometry(0.018, 8, 6), faceMat, 0, -0.008, 0.138);
  nose.scale.set(0.65, 0.85, 0.8);
  this.head.add(nose);
  this.smile = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xc47a72 })
  );
  this.smile.position.set(0, -0.048, 0.128);
  this.smile.scale.set(1.6, 0.55, 0.45);
  this.head.add(this.smile);

  this.shoulderL = new THREE.Group();
  this.shoulderL.position.set(-0.22, 0.24, 0);
  this.chest.add(this.shoulderL);
  this.shoulderR = new THREE.Group();
  this.shoulderR.position.set(0.22, 0.24, 0);
  this.chest.add(this.shoulderR);
  if (opt.pads) {
    this.shoulderL.add(mesh(new THREE.SphereGeometry(0.08, 8, 6), leather, 0, 0, 0));
    this.shoulderR.add(mesh(new THREE.SphereGeometry(0.08, 8, 6), leather, 0, 0, 0));
  }

  this.armL = this.makeArm(-1, skin, shirt, leather);
  this.shoulderL.add(this.armL.root);
  this.armR = this.makeArm(1, skin, shirt, leather);
  this.shoulderR.add(this.armR.root);

  this.thighL = new THREE.Group();
  this.thighL.position.set(-0.09, 0, 0);
  this.hips.add(this.thighL);
  this.thighL.add(mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 8), pants, 0, -0.18, 0));
  this.shinL = new THREE.Group();
  this.shinL.position.y = -0.36;
  this.thighL.add(this.shinL);
  this.shinL.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 8), pantsDark, 0, -0.17, 0));
  this.footL = new THREE.Group();
  this.footL.position.set(0, -0.34, 0.04);
  this.shinL.add(this.footL);
  this.footL.add(mesh(new THREE.BoxGeometry(0.1, 0.05, 0.18), boot, 0, 0, 0.04));

  this.thighR = new THREE.Group();
  this.thighR.position.set(0.09, 0, 0);
  this.hips.add(this.thighR);
  this.thighR.add(mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 8), pants, 0, -0.18, 0));
  this.shinR = new THREE.Group();
  this.shinR.position.y = -0.36;
  this.thighR.add(this.shinR);
  this.shinR.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 8), pantsDark, 0, -0.17, 0));
  this.footR = new THREE.Group();
  this.footR.position.set(0, -0.34, 0.04);
  this.shinR.add(this.footR);
  this.footR.add(mesh(new THREE.BoxGeometry(0.1, 0.05, 0.18), boot, 0, 0, 0.04));

  if (opt.sling) {
    this.sling = new THREE.Group();
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 6, 12), leather);
    loop.rotation.x = Math.PI / 2;
    this.sling.add(loop);
    this.sling.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 5), leather, 0, -0.12, 0));
    this.sling.add(mesh(new THREE.SphereGeometry(0.03, 6, 5), accent, 0, -0.24, 0));
    this.sling.position.set(0.02, -0.02, 0.04);
    this.armR.hand.add(this.sling);
  }
  if (opt.staff) {
    this.staff = new THREE.Group();
    this.staff.add(mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.35, 6), new THREE.MeshLambertMaterial({ color: 0xb07a48 }), 0, 0.3, 0));
    this.staff.position.set(-0.02, -0.02, 0.03);
    this.armL.hand.add(this.staff);
  }
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

Humanoid.prototype.makeArm = function (side, skin, shirt, leather) {
  const root = new THREE.Group();
  const upper = new THREE.Group();
  root.add(upper);
  upper.add(mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.28, 8), shirt, 0, -0.14, 0));
  const elbow = new THREE.Group();
  elbow.position.y = -0.28;
  upper.add(elbow);
  elbow.add(mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.26, 8), skin, 0, -0.13, 0));
  const hand = new THREE.Group();
  hand.position.y = -0.26;
  elbow.add(hand);
  hand.add(mesh(new THREE.BoxGeometry(0.07, 0.08, 0.05), skin, 0, -0.02, 0.01));
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Group();
    f.position.set((-0.024 + i * 0.016) * side, -0.06, 0.01);
    f.add(mesh(new THREE.BoxGeometry(0.012, 0.05, 0.012), skin, 0, -0.02, 0));
    hand.add(f);
    fingers.push(f);
  }
  const thumb = new THREE.Group();
  thumb.position.set(0.04 * side, -0.02, 0.02);
  thumb.rotation.z = -0.7 * side;
  thumb.add(mesh(new THREE.BoxGeometry(0.014, 0.04, 0.014), skin, 0, -0.015, 0));
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
  this.face(extra.mood || (extra.fire ? 'determined' : state === 'HIT' ? 'pain' : state === 'CHASE' ? 'alert' : 'calm'));
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
window.Humanoid = Humanoid;
