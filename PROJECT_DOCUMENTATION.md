# Legends of the Spire - 项目完整文档

> **游戏名称**: Legends of the Spire (尖塔传说)  
> **类型**: Roguelike 卡牌游戏  
> **平台**: Web (桌面 + 移动�?  
> **当前版本**: v0.8.0 (Production) | v0.9.0-alpha (Development)  
> **最后更�?*: 2025-11-21

---

## 📖 文档导航

### 🎮 产品设计�?
1. [游戏概述](#游戏概述)
2. [核心玩法](#核心玩法)
3. [游戏策划案](#游戏策划�?
4. [UI/UX设计](#uiux设计)
5. [版本演进历史](#版本演进历史)

### 💻 技术开发篇
6. [技术架构](#技术架�?
7. [核心代码逻辑](#核心代码逻辑)
8. [数据结构设计](#数据结构设计)
9. [开发路线图](#开发路线图)
10. [外部文档索引](#外部文档索引)

---

## 🎮 产品设计�?

### 游戏概述

#### 🎯 游戏定位

**Legends of the Spire** 是一款受《杀戮尖塔�?Slay the Spire) 启发，融合《英雄联盟�?League of Legends) 角色�?**Roguelike 卡牌游戏**�?

**核心特色**�?
- �?**20位英�?*：每位英雄拥有独特被动、专属技能卡牌（Q/W/E/R�?
- 🗺�?**随机地图探索**：六边形网格地图，迷雾战争，三选一决策
- 🎲 **永久成长**：部分英雄可跨战斗永久成长（力量/生命/金币�?
- 🔥 **快节奏战�?*：基于法力的回合制卡牌对�?
- 🎨 **LOL美术风格**：使用Riot官方API资源

#### 🎯 目标受众

- **核心玩家**：Roguelike爱好者、卡牌游戏玩�?
- **次要受众**：英雄联盟玩家、休闲策略游戏玩�?
- **年龄�?*�?6-35�?
- **平台**：浏览器（桌面优先，移动端适配�?

#### 🌟 竞品对比

| 特�?| Legends of the Spire | 杀戮尖�?| 炉石传说 | LOL云顶之弈 |
|------|---------------------|---------|---------|------------|
| **Roguelike** | �?| �?| �?| �?|
| **卡牌战斗** | �?| �?| �?| �?|
| **LOL角色** | �?| �?| �?| �?|
| **地图探索** | �?(六边�? | �?(纵向) | �?| �?|
| **免费游玩** | �?| �?($24.99) | 部分免费 | �?|
| **Web平台** | �?| �?| �?| �?|

---

### 核心玩法

#### 🎮 游戏流程

```
[选择英雄] 
    �?
[大地图探索] �?�?[战斗节点] �?[胜利奖励]
    �?             �?             �?
[特殊节点]     [失败]         [卡牌/金币/遗物]
    �?             �?             �?
[商店/休息]    [游戏结束]     [继续探索]
    �?                             �?
[BOSS战] �?[章节通关] �?[下一章节/游戏胜利]
```

#### 🗺�?大地图系统（v0.9.0核心更新�?

**设计理念**：从"线性爬�?升级�?开放地图探�?

##### 地图结构
- **网格类型**：六边形网格（Hexagon Grid�?
- **层数**�?
  - ACT1: 10层（诺克萨斯战线�?
  - ACT2: 20层（暗影岛战线）
  - ACT3: 30层（虚空战线�?
- **节点类型**�?
  - 🔥 **战斗** (50%): 对抗敌人，获得金�?
  - 🏪 **商店** (15%): 购买卡牌/遗物/升级
  - ❤️ **休息** (10%): 恢复生命�?
  - 🎁 **宝箱** (5%): 获得遗物
  - �?**事件** (20%): 随机事件（增�?风险�?
  - 👑 **BOSS** (1/章节): 章节最终战

##### 探索机制
1. **起点**：玩家从地图底部中间列出�?
2. **视野限制**：只能看到当前节点的"下一�?个可选节�?
3. **三选一决策**：每步从3个节点中选择1个（正前、左前、右前）
4. **迷雾战争**：未探索区域被迷雾覆盖，已探索节点置�?
5. **自由规划**：允�?绕路"探索，不限制最短路�?
6. **步数约束**�?
   - ACT1: 10-15步到达BOSS
   - ACT2: 20-40步到达BOSS
   - ACT3: 30-60步到达BOSS

**设计目标**�?
- �?增加策略深度（选择商店/休息/战斗的时机）
- �?提升重玩价值（每次地图不同�?
- �?制造紧张感（资源管理、路径规划）

#### ⚔️ 战斗系统

##### 战斗流程
1. **初始�?*：玩家抽�?张初始手牌，获得3点法�?
2. **玩家回合**�?
   - 打出卡牌（消耗法力）
   - 卡牌效果结算（伤�?格挡/力量�?
   - 结束回合
3. **敌人回合**�?
   - 敌人执行预定动作（显示在UI中）
   - 伤害结算（护甲优先抵挡）
4. **胜利条件**：敌人HP降为0
5. **失败条件**：玩家HP降为0

##### 核心机制
- **法力系统**：每回合3点法力，部分英雄可增加法力上�?
- **护甲系统**�?
  - **玩家**：护甲跨回合累积
  - **敌人**：护甲每回合结束清零
- **状态效�?*�?
  - **力量** (⚔️): 攻击伤害+N
  - **虚弱** (🌫�?: 攻击伤害×0.75
  - **易伤** (💔): 受到伤害×1.5
- **卡牌类型**�?
  - **攻击�?* (ATTACK): 造成伤害
  - **技能牌** (SKILL): 格挡/治疗/增益
  - **能力�?* (POWER): 永久增益（战斗内�?

#### 🃏 卡牌系统

##### 卡牌稀有度
| 稀有度 | 颜色 | 获取方式 | 特点 |
|--------|------|----------|------|
| **BASIC** | 白色 | 初始卡组 | 打击(6�?/防御(5�? |
| **COMMON** | 灰色 | 战斗奖励/商店 | 英雄Q技能，1�?|
| **UNCOMMON** | 蓝色 | 战斗奖励/商店 | 英雄W/E技能，1-2�?|
| **RARE** | 金色 | 战斗奖励(20%)/商店 | R技�?终结技)�?�?|

##### 卡牌升级
- **触发方式**�?
  - 商店花费100金币升级
  - 事件随机升级
- **升级效果**�?
  - 攻击/格挡�?3
  - 费用�?1（最�?费）
  - 视觉标识：绿色边�?+ 名称后缀 `+`

#### 👤 英雄系统

##### 20位英雄一�?

| 英雄 | 定位 | 被动特色 | 成长类型 |
|------|------|----------|----------|
| **盖伦** | 坦克 | 战斗结束恢复6HP | 持续作战 |
| **德莱厄斯** | 战士 | 攻击给予虚弱 | 力量�?|
| **拉克�?* | 法师 | 回合开�?1法力 | 控制�?|
| **金克�?* | 射手 | 回合开�?1手牌 | 连击�?|
| **亚索** | 剑客 | 攻击暴击+10% | 暴击�?|
| **娑娜** | 辅助 | �?张卡+3护甲 | 治疗�?|
| **艾克** | 刺客 | 消耗卡+1力量 | 成长�?|
| **塞拉�?* | 斗士 | 技能牌回复3HP | 吸血�?|
| **厄加�?* | 坦克 | 战斗开�?15�?| 高生�?|
| **维克�?* | 法师 | 50%抽额外卡 | 抽牌�?|
| **瑞文** | 战士 | �?张攻击牌+1法力 | 连招�?|
| **卡牌大师** | 法师 | 战斗胜利+15金币 | 🌟 **经济成长** |
| **盲僧** | 战士 | 技能后攻击-1�?| 节奏�?|
| **薇恩** | 射手 | 连续3次攻�?10�?| 单体爆发 |
| **提莫** | 射手 | 回合开始敌�?2虚弱 | DoT�?|
| **�?* | 刺客 | 首次攻击+50%伤害 | 爆发�?|
| **内瑟�?* | 战士 | 击杀+1力量 | 🌟 **力量成长** |
| **艾瑞莉娅** | 战士 | 击杀恢复法力并抽�?| 收割�?|
| **锤石** | 坦克 | 击杀+2最大HP | 🌟 **生命成长** |
| **卡特琳娜** | 刺客 | �?张攻击牌伤害翻�?| 计数�?|

**🌟 永久成长英雄**�?
- **内瑟�?*：每次用攻击牌击杀敌人，永�?1力量
- **锤石**：每次击杀敌人，永�?2最大生命�?
- **卡牌大师**：每次战斗胜利，获得15金币

##### 英雄技能结�?
- **被动技�?* (P): 自动触发，贯穿整场游�?
- **Q技�?* (COMMON): 基础技能，1�?
- **W技�?* (UNCOMMON): 进阶技能，1-2�?
- **E技�?* (UNCOMMON): 进阶技能，1-2�?
- **R技�?* (RARE): 终结技�?费，高威�?

---

### 游戏策划�?

#### 🎯 设计支柱

1. **策略深度 > 运气成分**
   - 玩家通过技能组合和路径规划获胜
   - 减少纯随机事件，增加可预测的选择

2. **短局快节�?(15-30分钟/局)**
   - 单次游戏时长适中，适合碎片化时�?
   - ACT1: 5-8分钟 | ACT2: 8-12分钟 | ACT3: 10-15分钟

3. **高重玩价�?*
   - 20位英�?× 随机地图 × 不同卡组组合
   - 每局体验不同，鼓励尝试新策略

4. **易学难精**
   - 新手友好：简单规则（出牌-打伤�?结束回合�?
   - 高手进阶：卡牌协同、节奏控制、资源管�?

#### 📊 数值设�?

##### 英雄属性缩�?
| 属�?| 最�?| 最�?| 平均 | 标准�?|
|------|------|------|------|--------|
| **生命�?* | 65 (提莫) | 100 (厄加�? | 77 | ±10 |
| **法力�?* | 3 (全英�? | 3+N (可购�? | 3 | 0 |
| **初始力量** | 0 | 0 | 0 | 0 |

##### 敌人属性缩�?
```javascript
// 敌人数值计算公�?
scaledHp = baseHp × (1 + floor × 0.15) × act
scaledDamage = baseDamage × (1 + floor × 0.15)

// 示例�?
// Katarina (基础42HP) �?Floor 5 (ACT1) = 42 × 1.75 × 1 = 73 HP
// Viego (基础80HP) �?Floor 2 (ACT2) = 80 × 1.3 × 2 = 208 HP
```

##### 卡牌平衡原则
- **伤害/费用比例**：约6伤害/1费（基准：打击卡�?
- **格挡/费用比例**：约5护甲/1费（基准：防御卡�?
- **R技�?*: 30-50伤害/3费（或特殊效果）

##### 经济系统
- **战斗奖励**�?0金币
- **跳过卡牌奖励**：额�?50金币（�?00�?
- **商店物价**�?
  - 基础卡：50金币
  - 进阶卡：80-120金币
  - R技能：150金币
  - 卡牌升级�?00金币
  - 法力上限+1�?00金币
  - 遗物�?00-750金币

#### 🎨 难度曲线

##### ACT1: 诺克萨斯战线（教学章节）
- **敌人难度**：★☆☆
- **层数**�?0�?
- **BOSS**：德莱厄�?(150HP)
- **设计目标**�?
  - 让玩家熟悉卡牌组�?
  - 建立基础卡组�?-12张卡�?
  - 获得1-2个遗�?

##### ACT2: 暗影岛战线（进阶挑战�?
- **敌人难度**：★★☆
- **层数**�?0�?
- **BOSS**：佛耶戈 (待定)
- **设计目标**�?
  - 测试卡组协同�?
  - 资源管理压力增加
  - 引入精英敌人

##### ACT3: 虚空战线（终极考验�?
- **敌人难度**：★★★
- **层数**�?0�?
- **BOSS**：贝尔薇�?(待定)
- **设计目标**�?
  - 完善的卡组构�?
  - 高风险高回报决策
  - 多重战术组合

#### ⚖️ 平衡性调整记�?

详见外部文档：[BALANCE_FIXES_SUMMARY.md](./BALANCE_FIXES_SUMMARY.md)

---

### UI/UX设计

#### 🎨 视觉风格

**核心风格**：《英雄联盟》官方美�?+ 暗黑魔幻风格

##### 配色方案
- **主色�?*�?
  - 金色 `#C8AA6E` (LOL经典�?
  - 深蓝 `#0A0E27` (背景)
  - 深灰 `#1E2328` (卡片背景)
- **强调�?*�?
  - 红色 `#FF0000` (BOSS/危险)
  - 绿色 `#00FF00` (成功/治疗)
  - 橙色 `#FF6600` (战斗/警告)

##### 字体设计
- **主字�?*：思源黑体 / Segoe UI
- **标题字体**：衬线字�?(游戏�?
- **字号层级**�?
  - H1: 24px (页面标题)
  - H2: 18px (区块标题)
  - Body: 14px (正文)
  - Caption: 10-12px (卡牌描述)

#### 📱 界面布局

##### 主菜�?
```
┌─────────────────────────────────�?
�?    [LOGO: Legends of Spire]    �?
�?                                  �?
�?        [新游�?按钮]            �?
�?        [继续游戏 按钮]          �?
�?        [英雄图鉴 按钮]          �?
�?                                  �?
�?   v0.8.0 Beta | 更新日志        �?
└─────────────────────────────────�?
```

##### 大地图界面（v0.9.0重构�?
```
┌─────────────────────────────────────�?
�?❤️ 85/85  ⚔️ +2  💰 250  [📖][🃏]  �? �?Header
├─────────────────────────────────────�?
�?                                     �?
�?       [六边形网格地图区域]         �? �?Main Map
�?        (可拖拽查看全�?             �?
�?                                     �?
�?  �?�?�? (可选节点高�?            �?
�? �?�?�?�?(已完成节点置�?          �?
�?  �?�?�? (迷雾节点暗色)            �?
�?                                     �?
├─────────────────────────────────────�?
�? 当前层数: 3/10  距离BOSS: 7�?     �? �?Status Bar
└─────────────────────────────────────�?
```

##### 战斗界面
```
┌─────────────────────────────────────�?
�? 敌人: Katarina                     �?
�? ❤️ 42/42  🛡�?0  下回�? 12点伤�? �?
├─────────────────────────────────────�?
�?                                     �?
�?      [敌人立绘/动画区域]           �?
�?                                     �?
├─────────────────────────────────────�?
�? 英雄: 盖伦                         �?
�? ❤️ 76/80  🛡�?5  �?3/3  ⚔️ +2      �?
├─────────────────────────────────────�?
�? [卡牌手牌区域 - 可拖拽出牌]       �?
�?  🃏  🃏  🃏  🃏  🃏               �?
└─────────────────────────────────────�?
```

#### 🎭 动画效果

- **卡牌出牌**：拖拽动画（framer-motion�?
- **伤害数字**：飘字动�?+ 颜色区分（红=伤害，绿=治疗�?
- **节点解锁**：光波扩散效�?
- **BOSS登场**：震�?+ 淡入
- **Toast通知**：底部滑入（永久成长提示�?

#### 📐 响应式设�?

- **桌面�?* (1200px+): 完整UI，双列布局
- **平板�?* (768-1199px): 单列布局，图标缩�?
- **移动�?* (320-767px): 纵向布局，卡牌区域优�?

---

### 版本演进历史

#### 📅 版本时间�?

```
v0.1.0 (Alpha) �?v0.5.0 (Beta) �?v0.7.5 �?v0.8.0 �?v0.9.0 (开发中)
   �?               �?              �?       �?       �?
   �?               �?              �?       �?       └─ 六边形地图系�?
   �?               �?              �?       └─ 20英雄实装 + 被动系统
   �?               �?              └─ 商店/事件扩展
   �?               └─ 移动端适配
   └─ 核心战斗系统
```

#### v0.8.0 (Current Production) - 2025-11-21

**主题**：全英雄实装 + 永久成长系统

**核心更新**�?
- �?**20位英雄完整实�?*�?0位新英雄 + 10位原有英�?
- �?**被动技能系�?*�?0/20 英雄被动全部实现
- �?**永久成长机制**：内瑟斯/锤石/卡牌大师跨战斗成�?
- �?**Toast通知系统**：永久成长获得时的视觉反�?
- �?**音频系统优化**：解决浏览器自动播放限制
- 🐛 **大量Bug修复**：英雄解锁、护甲累积、地图生成等

**详细日志**：参�?[readme_version.md](./readme_version.md)

#### v0.9.0 (In Development) - 2025-11-21+

**主题**：六边形地图系统 + 开放探�?

**计划更新**�?
- 🗺�?**六边形网格地�?*：替代线性爬塔，增加策略深度
- 🔍 **迷雾战争机制**：只显示3个可选节点，增强探索�?
- 📊 **动态层�?*：ACT1 (10�? / ACT2 (20�? / ACT3 (30�?
- 🎲 **路径多样�?*：允�?绕路"探索，不限制最短路�?
- 💾 **新存档系�?*：支持新地图结构的序列化

**开发进�?*�?
- �?Phase 1 (核心算法): 已完�?
  - �?六边形坐标系�?(`hexagonGrid.js`)
  - �?地图生成算法 v3 (`gridMapLayout_v3.js`)
  - �?串行绕路链优�?
  - �?自动重试保底机制
  - �?地图生成测试系统 (`test_map_generation.html`)
- �?Phase 2 (UI组件): 已完�?
  - �?六边形节点组�?(`HexagonNode.jsx`)
  - �?路径连线组件 (`PathConnector.jsx`)
  - �?新版地图视图 (`GridMapView_v2.jsx`)
  - �?拖拽查看全图功能
  - �?三选一高亮逻辑
  - �?迷雾效果优化
- 📝 Phase 3 (游戏集成): 规划�?
  - 📋 集成指南已完�?(`INTEGRATION_GUIDE.md`)
  - �?待集成到 `App.jsx`
- �?Phase 4 (测试与优�?: 待开�?

**详细规划**：参�?[new_grid.md](./new_grid.md)

**集成指南**：参�?[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

**测试工具**：参�?[HOW_TO_TEST.md](./HOW_TO_TEST.md)

---

## 💻 技术开发篇

### 技术架�?

#### 🛠�?技术栈

**前端框架**�?
- **React 18.3+** (函数式组�?+ Hooks)
- **Vite 7.2+** (构建工具)
- **Framer Motion** (动画�?

**UI框架**�?
- **Tailwind CSS** (样式)
- **Lucide React** (图标)

**数据管理**�?
- **LocalStorage** (游戏存档)
- **LZ-String** (存档压缩)

**资源加载**�?
- **Riot Games API** (英雄头像、技能图标、语�?
- **Cloudflare R2** (自定义资�?CDN)

**部署平台**�?
- **Cloudflare Pages** (静态网站托�?
- **GitHub** (代码仓库)

#### 📁 项目结构

```
legends-spire/
├── public/                    # 静态资�?
├── src/
�?  ├── data/                  # 游戏数据
�?  �?  ├── champions.js       # 英雄数据
�?  �?  ├── cards.js           # 卡牌数据�?
�?  �?  ├── enemies.js         # 敌人数据
�?  �?  ├── relics.js          # 遗物数据
�?  �?  ├── constants.js       # 全局常量
�?  �?  ├── gridMapLayout.js   # 地图生成�?v0.8.0)
�?  �?  └── gridMapLayout_v2.js # 地图生成�?v0.9.0)
�?  ├── components/            # UI组件
�?  �?  ├── shared/            # 通用组件
�?  �?  �?  ├── Card.jsx       # 卡牌组件
�?  �?  �?  └── Toast.jsx      # 通知组件
�?  �?  ├── BattleScene.jsx    # 战斗场景
�?  �?  ├── ChampionSelect.jsx # 英雄选择
�?  �?  ├── GridMapView.jsx    # 地图视图
�?  �?  ├── ShopView.jsx       # 商店界面
�?  �?  ├── RewardView.jsx     # 奖励界面
�?  �?  ├── EventView.jsx      # 事件界面
�?  �?  ├── RestView.jsx       # 休息界面
�?  �?  ├── CodexView.jsx      # 图鉴界面
�?  �?  └── DeckView.jsx       # 卡组查看
�?  ├── utils/                 # 工具函数
�?  �?  ├── gameLogic.js       # 游戏逻辑
�?  �?  ├── audioManager.js    # 音频管理
�?  �?  ├── audioContext.js    # 音频解锁
�?  �?  └── hexagonGrid.js     # 六边形工�?v0.9.0)
�?  ├── App.jsx                # 主应用入�?
�?  └── main.jsx               # React入口
├── test_map_generation.html   # 地图生成测试页面
├── game_data.md               # 游戏数据手册
├── readme_version.md          # 版本历史
├── new_grid.md                # v0.9.0开发规�?
├── HOW_TO_TEST.md             # 测试指南
└── PROJECT_DOCUMENTATION.md   # 本文�?
```

#### 🔄 数据�?

```
[LocalStorage 存档]
         �?
    [App.jsx 状态管理]
         �?
  ┌──────┴──────�?
  �?            �?
[Map View]  [Battle View]
  �?            �?
[节点选择]   [卡牌战斗]
  �?            �?
[完成节点]   [战斗结果]
  �?            �?
  └──────┬──────�?
         �?
   [更新存档]
```

---

### 核心代码逻辑

#### 🎮 游戏状态管�?(App.jsx)

```javascript
// 核心状�?
const [view, setView] = useState('MENU'); // 当前视图
const [champion, setChampion] = useState(null); // 选中英雄
const [currentHp, setCurrentHp] = useState(80); // 当前生命
const [maxHp, setMaxHp] = useState(80); // 最大生�?
const [gold, setGold] = useState(0); // 金币
const [masterDeck, setMasterDeck] = useState([]); // 主卡�?
const [relics, setRelics] = useState([]); // 遗物列表
const [baseStr, setBaseStr] = useState(0); // 基础力量
const [mapData, setMapData] = useState(null); // 地图数据
const [currentFloor, setCurrentFloor] = useState(0); // 当前�?
const [currentAct, setCurrentAct] = useState(1); // 当前章节
const [activeNode, setActiveNode] = useState(null); // 当前节点

// 视图切换
const viewStates = [
  'MENU',           // 主菜�?
  'CHAMPION_SELECT', // 选英�?
  'MAP',            // 大地�?
  'BATTLE',         // 战斗
  'REWARD',         // 奖励
  'SHOP',           // 商店
  'REST',           // 休息
  'EVENT',          // 事件
  'CHEST',          // 宝箱
  'GAMEOVER',       // 游戏结束
  'VICTORY_ALL'     // 游戏胜利
];
```

#### ⚔️ 战斗系统 (BattleScene.jsx)

```javascript
// 战斗状态机
const [gameState, setGameState] = useState('PLAYER_TURN');
// 状态：PLAYER_TURN �?ENEMY_TURN �?VICTORY / DEFEAT

// 核心战斗循环
const playCard = (cardIndex) => {
  // 1. 检查法力是否足�?
  if (playerMana < card.cost) return;
  
  // 2. 扣除法力，移除手�?
  setPlayerMana(m => m - card.cost);
  
  // 3. 应用卡牌效果
  switch (card.type) {
    case 'ATTACK':
      // 计算伤害：基础伤害 + 力量 - 敌人虚弱
      const damage = (card.value + playerStr) * (1 - enemyStatus.weak * 0.25);
      // 应用易伤
      const finalDamage = damage * (1 + playerStatus.vulnerable * 0.5);
      // 扣除护甲后的伤害
      const dmgToHp = Math.max(0, finalDamage - enemyBlock);
      setEnemyHp(h => h - dmgToHp);
      break;
      
    case 'SKILL':
      // 格挡 / 治疗 / 增益
      if (card.block) setPlayerBlock(b => b + card.block);
      if (card.heal) setPlayerHp(h => Math.min(maxHp, h + card.heal));
      break;
  }
  
  // 4. 触发被动技�?
  triggerPassiveSkills(card);
};

// 敌人回合
const executeEnemyTurn = () => {
  const action = currentEnemyAction;
  
  switch (action.type) {
    case 'ATTACK':
      const damage = action.value * (1 - playerStatus.weak * 0.25);
      const finalDamage = damage * (1 + enemyStatus.vulnerable * 0.5);
      const dmgToHp = Math.max(0, finalDamage - playerBlock);
      setPlayerHp(h => h - dmgToHp);
      break;
      
    case 'DEFEND':
      setEnemyBlock(b => b + action.value);
      break;
      
    case 'BUFF':
      setEnemyStr(s => s + action.value);
      break;
  }
};
```

#### 🗺�?地图生成系统 (gridMapLayout_v2.js)

```javascript
// 五阶段地图生成算�?
export function generateGridMap(act, usedEnemies = []) {
  // 阶段1: 初始化网�?
  const { grid, totalFloors, config } = initializeGrid(act);
  
  // 阶段2: 放置关键节点 (起点 + BOSS)
  const { nodes, startNode, bossNode } = placeKeyNodes(grid, totalFloors, act, usedEnemies);
  
  // 阶段3: 生成主路�?(随机游走)
  const mainPath = generateMainPath(grid, startNode, bossNode, totalFloors, act, usedEnemies, nodes);
  
  // 阶段4: 生成分支 (确保三选一)
  generateBranches(grid, nodes, totalFloors, act, config, usedEnemies);
  
  // 阶段5: 验证与修�?(BFS + 孤立节点修复)
  const stats = validateAndFix(grid, nodes, startNode, bossNode, config, totalFloors);
  
  return {
    grid,          // 二维数组
    nodes,         // 扁平数组
    startNode,     // 起点节点
    bossNode,      // BOSS节点
    stats,         // 统计数据
    act,           // 当前章节
    totalFloors    // 总层�?
  };
}

// BFS验证BOSS可达�?
function bfsCheck(nodes, startNode, bossNode) {
  const visited = new Set();
  const queue = [[startNode, 0]];
  
  while (queue.length > 0) {
    const [current, dist] = queue.shift();
    
    if (current.id === bossNode.id) {
      return { reachable: true, distance: dist };
    }
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    
    current.next.forEach(nextId => {
      const nextNode = nodes.find(n => n.id === nextId);
      if (nextNode && !visited.has(nextId)) {
        queue.push([nextNode, dist + 1]);
      }
    });
  }
  
  return { reachable: false, distance: -1 };
}
```

#### 🔷 六边形坐标系�?(hexagonGrid.js)

```javascript
// Offset坐标 -> Axial坐标 (用于数学计算)
export function offsetToAxial(row, col) {
  const q = col - Math.floor((row - (row & 1)) / 2);
  const r = row;
  return { q, r };
}

// Axial坐标 -> Pixel坐标 (用于渲染)
export function axialToPixel(q, r, hexSize = 50) {
  const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = hexSize * (3 / 2 * r);
  return { x, y };
}

// 获取六边形的6个邻�?
export function getHexNeighbors(row, col, maxRows, maxCols) {
  const isOddRow = row % 2 === 1;
  
  const neighbors = isOddRow
    ? [
        [row - 1, col],     [row - 1, col + 1], // NW, NE
        [row, col - 1],     [row, col + 1],     // W, E
        [row + 1, col],     [row + 1, col + 1]  // SW, SE
      ]
    : [
        [row - 1, col - 1], [row - 1, col],     // NW, NE
        [row, col - 1],     [row, col + 1],     // W, E
        [row + 1, col - 1], [row + 1, col]      // SW, SE
      ];
  
  return neighbors.filter(([r, c]) => 
    r >= 0 && r < maxRows && c >= 0 && c < maxCols
  );
}

// 生成SVG六边形路�?
export function generateHexagonPath(centerX, centerY, size = 50) {
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = centerX + size * Math.cos(angleRad);
    const y = centerY + size * Math.sin(angleRad);
    points.push([x, y]);
  }
  
  return points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  ).join(' ') + ' Z';
}
```

---

### 数据结构设计

#### 🃏 卡牌数据 (cards.js)

```javascript
export const CARD_DATABASE = {
  // 通用基础�?
  Strike: {
    id: 'Strike',
    name: '打击',
    type: 'ATTACK',
    cost: 1,
    value: 6,
    rarity: 'BASIC',
    hero: 'Neutral',
    description: '造成6点伤�?,
    img: `${SPELL_URL}/SummonerFlash.png`
  },
  
  // 英雄专属卡牌
  GarenQ: {
    id: 'GarenQ',
    name: '致命打击',
    type: 'ATTACK',
    cost: 1,
    value: 8,
    effect: 'VULNERABLE',
    effectValue: 2,
    rarity: 'COMMON',
    hero: 'Garen',
    description: '造成8点伤害，给予2层易�?,
    img: `${SPELL_URL}/GarenQ.png`,
    price: 50
  },
  
  // R技�?(终结技)
  GarenR: {
    id: 'GarenR',
    name: '德玛西亚正义',
    type: 'ATTACK',
    cost: 3,
    value: 30,
    rarity: 'RARE',
    hero: 'Garen',
    description: '造成30点巨额伤�?,
    img: `${SPELL_URL}/GarenR.png`,
    price: 150
  }
};
```

#### 👤 英雄数据 (champions.js)

```javascript
export const CHAMPION_POOL = {
  Garen: {
    id: 'Garen',
    name: '盖伦',
    title: '德玛西亚之力',
    maxHp: 80,
    maxMana: 3,
    baseStr: 0,
    avatar: `${CDN_URL}/img/champion/Garen.png`,
    img: `${CDN_URL}/img/champion/splash/Garen_0.jpg`,
    passive: '坚韧：战斗结束恢�?HP',
    relicId: 'GarenPassive',
    initialCards: ['GarenQ', 'GarenW', 'Ignite', 'Defend'],
    description: '坦克型英雄，擅长持续作战'
  }
};
```

#### 👾 敌人数据 (enemies.js)

```javascript
export const ENEMY_POOL = {
  Katarina: {
    id: 'Katarina',
    name: '卡特琳娜',
    title: '不祥之刃',
    maxHp: 42,
    avatar: `${CDN_URL}/img/champion/Katarina.png`,
    difficultyRank: 1,
    act: 1,
    actions: [
      { type: 'ATTACK', value: 6, hits: 2 },   // 瞬步连击
      { type: 'DEBUFF', value: 2, debuff: 'VULNERABLE' }, // 死亡莲华
      { type: 'ATTACK', value: 15 }             // 匕首投掷
    ]
  }
};
```

#### 🗺�?地图节点数据 (gridMapLayout_v2.js)

```javascript
// 节点对象结构
{
  id: "0-3",              // 唯一标识 (row-col)
  row: 0,                 // 层级�?=起点�?=BOSS for ACT1�?
  col: 3,                 // 列索引（0-6�?
  type: "BATTLE",         // 节点类型: BATTLE/SHOP/REST/CHEST/EVENT/BOSS/START
  status: "LOCKED",       // 状�? LOCKED/AVAILABLE/COMPLETED
  enemyId: "Katarina",    // 如果是战斗节�?
  next: ["1-2", "1-3", "1-4"], // 下一层可达节点（最�?个）
  prev: ["0-3"],          // 上一层连接（回溯用）
  position: { x: 150, y: 200 } // 渲染坐标（六边形布局用）
}

// 地图对象结构
{
  act: 1,                 // 当前章节
  totalFloors: 10,        // 总层�?
  grid: Array<Array<Node>>, // 二维数组（便于查询）
  nodes: Array<Node>,     // 扁平数组（便于遍历）
  startNode: Node,        // 起点
  bossNode: Node,         // 终点
  stats: {                // 统计数据
    minSteps: 12,         // 最短路径步�?
    maxSteps: 18,         // 最长路径步�?
    reachable: true       // BOSS是否可达
  }
}
```

#### 💾 存档数据结构

```javascript
// LocalStorage 存档格式
{
  view: 'MAP',           // 当前视图
  champion: {            // 英雄数据
    id: 'Garen',
    name: '盖伦',
    // ... 其他英雄属�?
  },
  currentHp: 76,         // 当前生命
  maxHp: 80,             // 最大生�?
  gold: 250,             // 金币
  masterDeck: ['GarenQ', 'Strike', 'Defend', ...], // 主卡�?
  relics: ['GarenPassive', 'LongSword'], // 遗物列表
  baseStr: 2,            // 基础力量
  mapData: {             // 地图数据
    // ... 序列化后的地图结�?
  },
  currentFloor: 3,       // 当前�?
  currentAct: 1,         // 当前章节
  activeNode: { id: '3-4', ... }, // 当前节点
  usedEnemies: ['Katarina', 'Talon'] // 已遇敌人
}
```

---

### 开发路线图

#### 🚀 近期计划 (v0.9.0)

##### Phase 2: UI组件重构（进行中�?

**任务2.1**: 六边形节点组�?
- [ ] 创建 `HexagonNode.jsx`
- [ ] SVG六边形绘�?
- [ ] 节点状态样式（LOCKED/AVAILABLE/COMPLETED�?
- [ ] 图标显示逻辑（战�?商店/事件�?

**任务2.2**: 路径连线组件
- [ ] 创建 `PathConnector.jsx`
- [ ] SVG路径绘制（贝塞尔曲线�?
- [ ] 动画效果（已探索路径高亮�?

**任务2.3**: GridMapView重构
- [ ] 改用六边形布局渲染
- [ ] 优化"三选一"高亮逻辑
- [ ] 改进迷雾效果（只显示next节点�?
- [ ] 添加拖拽查看全图功能

##### Phase 3: 游戏逻辑集成

**任务3.1**: App.jsx集成
- [ ] 修改 `handleChampionSelect`（调用新生成器）
- [ ] 修改 `completeNode`（三选一逻辑�?
- [ ] 修改 `handleNodeSelect`（节点点击）
- [ ] 更新存档逻辑（序列化新地图结构）

**任务3.2**: ACT切换逻辑
- [ ] ACT1 -> ACT2 地图重新生成�?0层）
- [ ] ACT2 -> ACT3 地图重新生成�?0层）
- [ ] Boss战胜利后的章节过渡动�?

##### Phase 4: 测试与优�?

**任务4.1**: 功能测试
- [ ] 地图生成100次，检查是否有无解情况
- [ ] 测试三选一是否始终有效
- [ ] 测试存档/读档是否正常

**任务4.2**: 性能优化
- [ ] 地图渲染性能（大地图30层）
- [ ] 动画流畅度（60fps目标�?

**任务4.3**: UI调优
- [ ] 六边形边缘抗锯齿
- [ ] 迷雾过渡动画
- [ ] 节点高亮效果

#### 🔮 远期计划 (v1.0+)

- 📱 **移动端深度优�?*：触摸操作、竖屏布局
- 🎵 **音效系统扩展**：战斗音效、UI音效、环境音�?
- 🏆 **成就系统**：解锁条件、徽章收�?
- 📊 **数据统计**：游戏历史、胜率统计、英雄使用率
- 🌐 **多语言支持**：英文、日�?
- 🎨 **皮肤系统**：英雄皮肤、卡�?
- 🤝 **社交功能**：分享战绩、排行榜

---

### 外部文档索引

#### 📚 游戏设计相关

| 文档名称 | 说明 | 路径 |
|---------|------|------|
| **game_data.md** | 游戏数据手册�?2张卡牌�?0位英雄�?个敌人�?0个遗物） | [./game_data.md](./game_data.md) |
| **BALANCE_FIXES_SUMMARY.md** | 英雄技能平衡性修复汇�?| [./BALANCE_FIXES_SUMMARY.md](./BALANCE_FIXES_SUMMARY.md) |
| **PASSIVE_TEST_GUIDE.md** | 被动技能测试指�?| [./PASSIVE_TEST_GUIDE.md](./PASSIVE_TEST_GUIDE.md) |
| **SKILL_DESCRIPTION_AUDIT.md** | 技能描述一致性审计报�?| [./SKILL_DESCRIPTION_AUDIT.md](./SKILL_DESCRIPTION_AUDIT.md) |

#### 🛠�?技术开发相�?

| 文档名称 | 说明 | 路径 |
|---------|------|------|
| **new_grid.md** | v0.9.0 六边形地图系统开发规�?| [./new_grid.md](./new_grid.md) |
| **INTEGRATION_GUIDE.md** | 网格地图系统集成指南（Phase 3�?| [./INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) |
| **HOW_TO_TEST.md** | 地图生成算法测试指南 | [./HOW_TO_TEST.md](./HOW_TO_TEST.md) |
| **NEW_HERO_SKILL_IMPLEMENTATION_SUMMARY.md** | 8个被动技能实装总结 | [./NEW_HERO_SKILL_IMPLEMENTATION_SUMMARY.md](./NEW_HERO_SKILL_IMPLEMENTATION_SUMMARY.md) |
| **P0_P1_P2_FIXES_SUMMARY.md** | P0-P2优先级修复详细报�?| [./P0_P1_P2_FIXES_SUMMARY.md](./P0_P1_P2_FIXES_SUMMARY.md) |
| **PERMANENT_GROWTH_FIX_PLAN.md** | 永久成长机制修复计划 | [./PERMANENT_GROWTH_FIX_PLAN.md](./PERMANENT_GROWTH_FIX_PLAN.md) |

#### 📝 版本历史相关

| 文档名称 | 说明 | 路径 |
|---------|------|------|
| **readme_version.md** | 版本迭代日志（分支功能对比、Commit历史�?| [./readme_version.md](./readme_version.md) |

#### 🌐 外部资源

| 资源名称 | 说明 | 链接 |
|---------|------|------|
| **生产环境** | 当前线上版本 (v0.8.0) | [https://lol.keithhe.com](https://lol.keithhe.com) |
| **GitHub仓库** | 源代码托�?| [github.com/keithhegit/LegendsOfTheSpire](https://github.com/keithhegit/LegendsOfTheSpire) |
| **Riot API文档** | 英雄联盟官方API | [developer.riotgames.com](https://developer.riotgames.com) |
| **参考项�?* | Mysterious Minaret (地图系统参�? | [github.com/shenmi124/Mysterious_Minaret](https://github.com/shenmi124/Mysterious_Minaret) |

---

## 📊 项目统计

### 代码统计

- **总代码行�?*: ~15,000+ �?
- **组件数量**: 15+ �?
- **数据文件**: 6 �?
- **工具函数**: 4 �?

### 游戏内容统计

- **英雄数量**: 20 �?
- **卡牌总数**: 82 �?
  - BASIC: 2 �?
  - COMMON: 20 �?
  - UNCOMMON: 40 �?
  - RARE: 20 �?
- **敌人数量**: 8 �?
- **遗物数量**: 30 �?
- **章节�?*: 3 �?(ACT1/2/3)

### 开发时间线

- **项目启动**: 2024-Q4
- **Alpha版本**: 2024-Q4
- **Beta版本**: 2025-Q1
- **v0.8.0发布**: 2025-11-21
- **v0.9.0计划**: 2025-11-22 - 2025-12-05

---

## 🙏 致谢

### 技术参�?

- **Slay the Spire**: Roguelike卡牌游戏设计灵感
- **Riot Games**: 英雄联盟美术资源和API支持
- **Mysterious Minaret**: 地图系统参�?
- **Red Blob Games**: 六边形网格算法教�?

### 开源库

- **React**: 前端框架
- **Vite**: 构建工具
- **Framer Motion**: 动画�?
- **Tailwind CSS**: 样式框架
- **LZ-String**: 压缩�?

---

## 📄 许可�?

本项目为个人学习项目，使用的英雄联盟相关素材版权�?Riot Games 所有�?

**使用限制**�?
- �?学习和研究用�?
- �?个人游玩
- �?商业用�?
- �?二次分发

---

## 📧 联系方式

- **项目维护�?*: [制作人姓名]
- **开发工程师**: AI Assistant
- **项目地址**: [GitHub仓库链接]
- **反馈渠道**: GitHub Issues

---

**文档版本**: v1.0.0  
**最后更�?*: 2025-11-21  
**文档状�?*: �?完整

---

> 💡 **提示**: 本文档是项目�?总览地图"，如需深入了解具体功能，请参考[外部文档索引](#外部文档索引)中的专项文档�?


