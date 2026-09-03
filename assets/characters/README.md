# Character System

The game now ships with two fully implemented procedural character families:

- **David** — unique biblical shepherd silhouette with face details, layered tunic,
  belt/buckle, world-specific hair, footwear, sling, hip pouch and wrist wraps.
- **Shadow Guardians** — armored humanoid enemies with variant skin/armor palettes,
  helmets, chest armor, waist guards, crest details and club weapons.

The models are built in `src/humanoid.js`, then configured by `src/player.js` and
`src/enemies.js`. They require no external 3D model download, so GitHub/Vercel
deployments work offline.

Optional future GLB files can be added here and wired through a GLTF loader:
- david.glb
- shadow_guardian.glb
- goliath.glb
