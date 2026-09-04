# David-Only Final Audit

## Character flow
- Kelly and the hero chooser have been removed from the main menu and DOM.
- PLAY WORLD 1 starts directly at World 1.
- Player construction is hard-locked to David.
- Legacy saves are normalized to `selectedCharacter: david`, so an old Kelly selection cannot reappear.
- HUD and dialogue are David-only.

## David 3D upgrade
- Modern 3D boy silhouette retained.
- Swept brown hair and expressive face retained.
- Brown/orange open jacket upgraded with zipper, hem and chest badge.
- Blue inner shirt retained.
- Navy shorts upgraded with waistband and pockets.
- Chunky sneakers upgraded with ankle cuff, sole and laces.
- Blue-grey backpack retained.
- Sling/combat rig and all existing animations preserved.

## Regression checks
- World files, enemy files, boss files, audio and progression systems were not intentionally changed.
- No Kelly runtime references remain in HTML, CSS or JS.
- No character-selection screen references remain.
