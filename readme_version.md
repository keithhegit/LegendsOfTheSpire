# Legends of the Spire - Version History & Features

## Branches

### `new_mobile` (Commit `b165218`)
**Status:** Frozen / Legacy Feature Reference
**Key Features:**
- **Card Upgrades:** Shop allowed upgrading cards (adding `+` suffix for stats boost).
- **Event Enhancements:** Events offered random card upgrades.
- **R Skills (Ultimates):** Ultimate abilities were partially implemented/planned.
- **Shop Special:** "Mana +1" option (20% chance).
- **Audio:** Basic SFX.

### `new_map` (Current, Commit `f350035`+)
**Status:** Active Development
**Key Features:**
- **Grid Map System:** 7x15 Grid with Fog of War, Pathfinding, and Node types (Battle, Event, Shop, Rest, Chest, Boss).
- **Directed Acyclic Graph (DAG):** Map data structure migration.
- **New Views:**
  - `GridMapView`: Canvas/Grid-based map rendering.
  - `CodexView`: View unlocked cards, enemies, relics.
  - `DeckView`: View current deck.
- **UI/UX Improvements:**
  - Champion Select UI fixes (portraits, text).
  - Enhanced Fog of War visuals.
  - Drag-to-play card restoration.
- **Bug Fixes:**
  - Map serialization (fixing `new Map()` error).
  - Null checks for cards/enemies/relics.
  - Audio error handling.

## Feature Restoration (Migrating from `new_mobile` to `new_map`)

### 1. Shop System Enhancements
- [x] **Card Upgrade Service:** Allow players to pay gold to upgrade a card (Stats +3, Cost -1 etc.).
- [x] **Special Items:** Chance to purchase Max Mana +1.

### 2. Event System Enhancements
- [x] **Random Enhancement:** Events can grant a random upgrade to a card in the deck.

### 3. Ultimate Skills (R)
- [x] **Implementation:** Added R skills (Ultimate) to `CARD_DATABASE` with `RARE` rarity.
  - Garen: Demacian Justice
  - Darius: Noxian Guillotine
  - Lux: Final Spark (and others)

## Commit Log (Recent)
- `f350035`: fix: Handle Map serialization in localStorage
- `7da1204`: fix: Remove inline BattleScene, optimize fog of war
- `b165218`: fix: Add null checks for relics (Legacy base)

