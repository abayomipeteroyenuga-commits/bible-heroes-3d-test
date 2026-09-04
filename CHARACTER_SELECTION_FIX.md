# Character Selection + Progression Fix

## Fixed
1. World 1 could appear to continue with Kelly because the saved `selectedCharacter` was reused by the PLAY WORLD 1 button.
2. PLAY WORLD 1 now explicitly targets World 1 and uses the hero selected in the chooser.
3. The selected hero is written to SaveSystem immediately before level construction.
4. Player construction uses the normalized selected hero.
5. Character chooser no longer uses reference images as character cards.
6. David and Kelly are rendered as actual transparent-background 3D models in the chooser.

## Progression
- Fresh save: David + World 1 unlocked.
- Completing World N unlocks N+1, through World 40.
- Adventure Map only starts unlocked worlds.
- CONTINUE uses the first unlocked incomplete world.
- PLAY WORLD 1 always starts World 1.
- Character choice applies to World 1 and every subsequent world until changed.
