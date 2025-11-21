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

---

## 游戏机制说明 (Game Mechanics)

### 战斗状态系统 (Combat Status System)

#### 玩家/敌人通用状态

| 状态 | 图标 | 效果 | 持续时间 | 备注 |
|------|------|------|----------|------|
| **护甲 (Block)** | 🛡️ | 抵挡伤害。伤害优先扣除护甲，剩余伤害扣生命。 | **玩家**：跨回合累积<br>**敌人**：每回合结束清零 | 符合 Slay the Spire 机制 |
| **力量 (Strength)** | ⚔️ | 所有攻击牌伤害 +N 点。 | 永久（战斗内） | 通过卡牌/遗物/事件获得 |
| **虚弱 (Weak)** | 🌫️ | 攻击伤害 ×0.75（25%减伤）。 | N 回合（每回合结束-1） | 可叠加，多层效果不叠乘 |
| **易伤 (Vulnerable)** | 💔 | 受到伤害 ×1.5（50%增伤）。 | N 回合（每回合结束-1） | 可叠加，多层效果不叠乘 |

#### 特殊状态

| 状态 | 效果 | 获取方式 |
|------|------|----------|
| **消耗 (Exhaust)** | 卡牌打出后移除（不进入弃牌堆）。 | 特定卡牌属性 |
| **净化 (Cleanse)** | 移除所有虚弱和易伤。 | 盖伦W等卡牌 |

---

### R 技能 (Ultimate) 获取机制

**获取途径**：战斗胜利后的卡牌奖励（Reward Screen）

**概率机制**：
- 每个奖励槽位有 **20% 概率** 出现 RARE 卡牌（R技能）
- 每场战斗后 3 个奖励槽位独立判定
- 实际概率：单次战斗至少出现 1 张 R 技能 ≈ **48.8%**
- R 技能价格：150 金币（商店购买时）

**R 技能特点**：
- `rarity: "RARE"`
- 通常消耗 3 费（高费高威力）
- 伤害/效果远超普通卡牌（30-50 点伤害或特殊效果）
- 部分技能带有 AOE、多段攻击、治疗等特殊机制

**示例**：
- 盖伦R - 德玛西亚正义：3费 30伤害
- 德莱厄斯R - 诺克萨斯断头台：3费 40真实伤害
- 厄加特R - 超越死亡的恐惧：3费 50伤害

---

### 卡牌升级机制

**升级效果**：
- 卡牌ID添加 `+` 后缀（例如：`Strike+`）
- 数值提升：攻击/格挡 +3，效果值 +1
- 费用降低：消耗 -1（最低0费）
- 视觉标识：绿色边框 + 绿色名称 + `+` 标记

**获取方式**：
1. **商店升级**：100 金币升级任意卡牌（可选择）
2. **事件奖励**：部分事件提供随机升级（"感悟"选项）

---

### 商店特殊物品

| 物品 | 价格 | 效果 |
|------|------|------|
| 升级卡牌 | 100 G | 选择一张卡牌进行升级（+3数值，-1费用） |
| 法力上限 +1 | 200 G | 永久增加 1 点最大法力值（通过添加隐藏遗物"ManaGem"） |

