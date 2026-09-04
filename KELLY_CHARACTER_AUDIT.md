# Kelly Character Audit

Implemented Kelly as a second selectable playable character.

## Verified
- Character selection screen added to main menu.
- David and Kelly cards are selectable.
- Selection persists in SaveSystem as `selectedCharacter`.
- World start passes selected character into Player.
- Kelly uses the existing humanoid combat/animation rig.
- Kelly has a modern purple/lavender outfit, white top, long leggings, chunky sneakers, backpack-compatible silhouette, expressive face and layered curly hair.
- Kelly is slightly taller (1.08x character scale).
- HUD hero name switches between DAVID and KELLY.
- David remains the default for existing/old saves.
- Sling/combat input remains shared and functional.
- Kelly reference image is bundled at `assets/characters/kelly-reference.jpg`.
- All `src/*.js` files pass Node syntax checks (0 errors).

## Flow
Main Menu -> CHOOSE HERO / PLAY WORLD 1 -> Character Selection -> DAVID or KELLY -> Continue -> selected World.

No external runtime asset dependency was introduced.
