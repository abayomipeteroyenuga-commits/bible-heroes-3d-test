# Visual / 3D Polish Patch

## Fixed
- Added sRGB output encoding and ACES filmic tone mapping for cleaner, more consistent colors.
- Added hemisphere sky/ground fill lighting so characters and environments remain readable.
- Removed terrain height displacement that did not match the character's flat-ground physics; this eliminated floating/sinking props and collectibles.
- Added readable canvas-based 3D sign labels to world set pieces.
- Improved sheep models with legs, ears, higher-quality geometry and shadows.
- Improved cave crystals with emissive Phong materials, transparency, shadows and a soft glow light.
- Improved water with transparent, shiny Phong material.
- Improved mountain bridge with rail posts and supports plus better shadowing.
- Added warm point lights to cave torches.
- Enabled consistent cast/receive shadows across opaque environment meshes.
- Removed a duplicate David right-eye iris mesh that could cause z-fighting/visual artifacts.

## Scope
This patch focuses on visible rendering, model presentation, lighting, depth, and prop grounding. Gameplay logic was preserved from the previous Bible Story Layer build.
