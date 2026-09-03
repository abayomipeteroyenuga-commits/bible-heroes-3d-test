# Character + Bug Audit

## Fixed
1. Victory screen was using a fallback of 20 for the maximum-world check even
   though SaveSystem supports 40 worlds. It now derives the limit from
   `SaveSystem.MAX_LEVEL` / `LEVELS.length`.
2. David character lacked a strong gameplay-readable identity at distance.
   Added a hip shepherd pouch, pouch flap and wrist wraps without changing the
   existing face or animation rig.
3. Guardian silhouettes were too close to generic humanoids. Added an armored
   waist guard and chest crest to the shared guardian build while preserving
   existing helmets, armor, clubs and animations.

## Validation
- All JavaScript files pass `node --check`.
- No external character model dependency was introduced.
- Existing input, combat, save, level and animation APIs remain unchanged.
