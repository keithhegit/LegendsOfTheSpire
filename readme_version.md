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

## Commit Log (`new_map` Branch - Recent to Oldest)

### Latest (2025-11-21)
- `65138ef`: **fix: Remove duplicate onClick handler in Card.jsx causing double card play on drag**
  - 修复拖拽卡牌时触发两次 `onPlay` 的bug
  - 移除 `onClick` 事件，只保留 `onDragEnd` 拖拽交互
  - 解决了打出1张牌后自动打出第2张牌的问题

- `375bf2c`: **fix: Add validation to ensure second floor has reachable nodes from first floor**
  - 修复地图生成bug：第二层没有可选择节点
  - 第一层起点固定在中间列，确保有足够相邻空间
  - 添加验证机制：自动调整第二层节点到可达位置

- `a2078b1`: **fix: Critical bugs - add null check for relic.onTurnStart, restore card upgrade logic in playCard**
  - 修复 console 报错：`Cannot read properties of undefined (reading 'onTurnStart')`
  - 在 `startTurnLogic` 中添加 relic null 检查
  - 恢复 `playCard` 中的升级卡牌处理逻辑（`+` 后缀）

- `f2b5429`: **feat: Restore shop upgrades, event enhancements, R skills from new_mobile**
  - Shop: 添加卡牌升级服务（100金）和法力上限+1购买（200金）
  - Event: 添加"感悟"选项，随机升级一张卡牌
  - 为所有英雄添加 R 技能（Ultimate），rarity: "RARE"
  - 升级卡牌视觉优化：绿色边框、绿色名称、`+` 后缀

### Previous
- `f350035`: **fix: Handle Map serialization in localStorage**
  - 修复 `new Map()` 序列化错误
  - 添加 `nodeMap` 显式序列化/反序列化逻辑

- `7da1204`: **fix: Remove inline BattleScene, optimize fog of war**
  - 移除 App.jsx 中的内联 `BattleScene` 组件
  - 优化迷雾效果和地图可见性
  - 参考 Mysterious_Minaret 库的 `map.js` 实现

- `473fbbc`: **Initial new_map implementation**
  - 实现 7x15 网格地图系统
  - 迷雾战争机制
  - DAG 数据结构
  - GridMapView, CodexView, DeckView 组件

### Legacy Base
- `b165218` (`new_mobile`): **fix: Add null checks for relics**
  - 旧分支功能基线

