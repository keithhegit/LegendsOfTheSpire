# 网格地图系统重构计划 (Grid Map System Refactor)

> **分支**: new_grid  
> **版本**: v0.9.0 (规划中)  
> **制作人**: User  
> **工程师**: AI Assistant  
> **创建时间**: 2025-11-21

---

## 📋 目录

1. [需求分析](#需求分析)
2. [现状评估](#现状评估)
3. [核心设计](#核心设计)
4. [技术方案](#技术方案)
5. [实现路线图](#实现路线图)
6. [风险与挑战](#风险与挑战)
7. [待讨论问题](#待讨论问题)

---

## 需求分析

### 🎮 核心需求

根据制作人提供的参考图（某手游大地图）和描述，提取以下核心需求：

#### 1. 随机网格生成（Roguelike）
- ✅ **每次游戏重新生成地图**，确保可重玩性
- ✅ **分层设计**：ACT1 (10层) / ACT2 (20层) / ACT3 (30层)
- ✅ **起点固定**：玩家从底部出发
- ✅ **终点固定**：BOSS在顶部角落

#### 2. 探索机制（核心玩法）
- ✅ **视野限制**：玩家只能看到"最临近的3个格子"
- ✅ **三选一决策**：每一步提供3个选项（正前、左前、右前）
- ✅ **迷雾战争**：未探索区域显示迷雾，已探索区域置灰
- ✅ **不限步数**：玩家可以自由规划路线到达BOSS

#### 3. UI表现（参考图分析）
- 🔹 **六边形网格**（Hexagon Grid）：参考图使用六边形布局
- 🔹 **连接线可视化**：节点之间有橙色连线（已探索路径）
- 🔹 **节点状态**：
  - 已探索 + 已完成：置灰 + 显示建筑/资源
  - 可选择（3选1）：高亮 + 橙色火焰标记
  - 未探索（迷雾）：暗色 + 无细节
- 🔹 **节点类型图标**：
  - 营火（战斗）
  - 建筑（商店/事件）
  - 资源点（宝箱/金币）
  - 木材/石头（资源收集）

---

## 现状评估

### ✅ 当前已实现（v0.8.0）

从 `src/data/gridMapLayout.js` 和 `src/components/GridMapView.jsx` 分析：

1. **网格生成器已存在**：
   - `generateGridMap(act, floorCount)` 已实现
   - 使用 7列 x 15行 方格网格（非六边形）
   - 已有 DAG（有向无环图）结构

2. **迷雾系统已实现**：
   - `GridMapView.jsx` 已有 `isFogged` 逻辑
   - 基于 `currentFloor` 和 `currentFloor + 1` 的可见性

3. **节点类型已完整**：
   - BATTLE / SHOP / REST / CHEST / EVENT / BOSS

4. **选择逻辑已实现**：
   - `canClickNode` 基于 `activeNode` 和 `colDiff`
   - 已支持"三选一"（正前、左前、右前）

### ❌ 当前问题（需改进）

#### 问题1：网格形状不符合参考图
- **现状**：使用方格网格（Square Grid）
- **期望**：六边形网格（Hexagon Grid）
- **影响**：视觉风格和空间布局差异较大

#### 问题2：层数配置不灵活
- **现状**：`GRID_ROWS = 15` 硬编码
- **期望**：ACT1 (10层) / ACT2 (20层) / ACT3 (30层)
- **影响**：无法根据ACT动态调整难度曲线

#### 问题3：地图密度控制不足
- **现状**：每层随机生成 2-4 个节点
- **期望**：确保"三选一"体验，且路径不过于稀疏/密集
- **影响**：可能出现无路可走或选择过少的情况

#### 问题4：视野逻辑需优化
- **现状**：显示 `currentFloor` 和 `currentFloor + 1` 全部节点
- **期望**：只显示"最临近的3个格子"（当前节点的 `next` 数组）
- **影响**：玩家看到的信息过多，降低探索未知感

#### 问题5：路径连通性验证不足
- **现状**：生成后有简单验证，但可能存在死路
- **期望**：确保从起点到BOSS至少有一条可达路径
- **影响**：玩家可能卡关（地图生成BUG）

---

## 核心设计

### 🎯 设计目标

1. **Roguelike精髓**：每次地图都不同，但保证可玩性
2. **策略深度**：三选一迫使玩家权衡（战斗 vs 商店 vs 休息）
3. **视觉清晰**：迷雾、高亮、连线让玩家明确当前状态
4. **技术稳定**：地图生成算法健壮，不会出现无解情况

### 🗺️ 地图结构设计

#### 数据结构（建议改进）

```javascript
// 节点对象（Node）
{
  id: "0-3",              // 唯一标识 (row-col)
  row: 0,                 // 层级（0=起点，9=BOSS for ACT1）
  col: 3,                 // 列索引（0-6）
  type: "BATTLE",         // 节点类型
  status: "LOCKED",       // 状态：LOCKED / AVAILABLE / COMPLETED
  enemyId: "Katarina",    // 如果是战斗节点
  next: ["1-2", "1-3", "1-4"], // 下一层可达节点（最多3个）
  prev: ["0-3"],          // 上一层连接（回溯用）
  position: { x: 150, y: 200 } // 渲染坐标（六边形布局用）
}

// 地图对象（MapData）
{
  act: 1,                 // 当前章节
  totalFloors: 10,        // 总层数（动态）
  grid: Array<Array<Node>>, // 二维数组（便于查询）
  nodes: Array<Node>,     // 扁平数组（便于遍历）
  startNode: Node,        // 起点
  bossNode: Node,         // 终点
  currentPath: ["0-3", "1-3"] // 已走路径（用于连线绘制）
}
```

#### 生成算法（改进版）

##### 阶段1：初始化网格
```
输入：act (1/2/3)
输出：空网格矩阵

1. 根据ACT确定层数：
   - ACT1: 10层
   - ACT2: 20层
   - ACT3: 30层

2. 创建 totalFloors x 7 的空矩阵
```

##### 阶段2：放置关键节点
```
1. 起点（Floor 0）：
   - 固定在中间列（col = 3）
   - type = "START" (虚拟节点，不可交互)

2. BOSS（Floor totalFloors - 1）：
   - 随机选择角落列（col = 0 或 col = 6）
   - type = "BOSS"
   - 确保此位置可达
```

##### 阶段3：生成主路径（保证可达）
```
算法：从起点到BOSS的随机游走

1. currentNode = startNode
2. for floor in range(1, totalFloors - 1):
     - 选择一个合法列（±1 偏移，不超出边界）
     - 创建节点 node(floor, col)
     - 连接 currentNode.next.push(node.id)
     - currentNode = node
3. 连接最后一个节点到 BOSS

结果：一条从起点到BOSS的"主干道"
```

##### 阶段4：生成分支（实现三选一）
```
遍历每个非BOSS节点：
  if node.next.length < 3:
    尝试在下一层生成 1-2 个额外节点
    位置：当前节点的 ±1 列
    类型：随机（BATTLE 40% / EVENT 20% / SHOP 15% / REST 15% / CHEST 10%）
    连接：node.next.push(newNode.id)
```

##### 阶段5：验证与修正
```
1. 检查孤立节点（没有 prev 的节点）
   - 如果存在，随机连接到上一层的某个节点

2. 检查BOSS可达性
   - 使用BFS从起点遍历，确保能到达BOSS
   - 如果不可达，重新生成地图

3. 节点密度检查
   - 每层至少2个节点，最多5个节点
   - 如果不符合，调整分支数量
```

---

## 技术方案

### 📁 文件结构（新增/修改）

```
src/
├── data/
│   ├── gridMapLayout.js       [修改] 改进地图生成算法
│   └── hexagonLayout.js       [新增] 六边形布局计算工具
├── components/
│   ├── GridMapView.jsx        [修改] 改进迷雾和三选一逻辑
│   ├── HexagonNode.jsx        [新增] 单个六边形节点组件
│   └── PathConnector.jsx      [新增] 路径连线组件（SVG）
├── utils/
│   └── mapValidator.js        [新增] 地图验证工具（BFS/DFS）
└── App.jsx                    [修改] 集成新地图系统
```

### 🧮 核心算法伪代码

#### 算法1：六边形坐标转换

```javascript
// 六边形网格有两种坐标系：
// 1. Axial坐标（q, r）：便于数学计算
// 2. Pixel坐标（x, y）：用于渲染

function hexToPixel(row, col, hexSize = 50) {
  // Offset坐标 -> Axial坐标
  const q = col - Math.floor(row / 2);
  const r = row;
  
  // Axial坐标 -> Pixel坐标
  const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = hexSize * (3 / 2 * r);
  
  return { x, y };
}

function getHexNeighbors(row, col, maxCols = 7) {
  // 六边形的6个邻居（根据 odd-r offset 坐标系）
  const evenRow = row % 2 === 0;
  const neighbors = evenRow 
    ? [
        [row - 1, col - 1], [row - 1, col],     // 上左、上右
        [row, col - 1],     [row, col + 1],     // 左、右
        [row + 1, col - 1], [row + 1, col]      // 下左、下右
      ]
    : [
        [row - 1, col],     [row - 1, col + 1], // 上左、上右
        [row, col - 1],     [row, col + 1],     // 左、右
        [row + 1, col],     [row + 1, col + 1]  // 下左、下右
      ];
  
  return neighbors.filter(([r, c]) => r >= 0 && c >= 0 && c < maxCols);
}
```

#### 算法2：三选一逻辑

```javascript
function getAvailableChoices(currentNode, allNodes) {
  // 获取当前节点的下一层可达节点
  const nextNodes = currentNode.next
    .map(id => allNodes.find(n => n.id === id))
    .filter(Boolean);
  
  // 按类型优先级排序（可选）
  const priority = { SHOP: 1, REST: 2, EVENT: 3, BATTLE: 4, CHEST: 5 };
  nextNodes.sort((a, b) => priority[a.type] - priority[b.type]);
  
  // 最多返回3个
  return nextNodes.slice(0, 3);
}

function updateVisibility(mapData, currentNode) {
  // 核心：只显示当前节点的 next 数组
  mapData.nodes.forEach(node => {
    if (node.status === 'COMPLETED') {
      node.visible = true; // 已完成的总是可见
    } else if (currentNode.next.includes(node.id)) {
      node.visible = true; // 可选择的3个节点
      node.highlighted = true; // 高亮显示
    } else if (node.row <= currentNode.row) {
      node.visible = true; // 当前层及以下可见（置灰）
      node.fogged = true;  // 但处于迷雾状态
    } else {
      node.visible = false; // 其他节点完全隐藏
    }
  });
}
```

#### 算法3：路径验证（BFS）

```javascript
function validateMapReachability(startNode, bossNode, allNodes) {
  const visited = new Set();
  const queue = [startNode];
  
  while (queue.length > 0) {
    const current = queue.shift();
    if (current.id === bossNode.id) {
      return true; // BOSS可达
    }
    
    visited.add(current.id);
    current.next.forEach(nextId => {
      if (!visited.has(nextId)) {
        const nextNode = allNodes.find(n => n.id === nextId);
        if (nextNode) queue.push(nextNode);
      }
    });
  }
  
  return false; // BOSS不可达
}
```

---

## 实现路线图

### Phase 1: 算法重构（2-3天）

#### 任务1.1：地图生成器改进
- [ ] 修改 `generateGridMap` 支持动态层数
- [ ] 实现"主路径生成"算法
- [ ] 实现"分支生成"算法
- [ ] 添加地图验证逻辑

**优先级**: P0（核心功能）  
**预计工作量**: 8小时

#### 任务1.2：六边形布局工具
- [ ] 创建 `hexagonLayout.js`
- [ ] 实现坐标转换函数
- [ ] 实现邻居查询函数

**优先级**: P1（视觉优化）  
**预计工作量**: 4小时

#### 任务1.3：地图验证工具
- [ ] 创建 `mapValidator.js`
- [ ] 实现BFS可达性检查
- [ ] 实现节点密度检查

**优先级**: P0（稳定性）  
**预计工作量**: 3小时

---

### Phase 2: UI组件重构（3-4天）

#### 任务2.1：六边形节点组件
- [ ] 创建 `HexagonNode.jsx`
- [ ] SVG六边形绘制
- [ ] 节点状态样式（LOCKED/AVAILABLE/COMPLETED）
- [ ] 图标显示逻辑（战斗/商店/事件）

**优先级**: P1（视觉）  
**预计工作量**: 6小时

#### 任务2.2：路径连线组件
- [ ] 创建 `PathConnector.jsx`
- [ ] SVG路径绘制（贝塞尔曲线）
- [ ] 动画效果（已探索路径高亮）

**优先级**: P2（锦上添花）  
**预计工作量**: 4小时

#### 任务2.3：GridMapView重构
- [ ] 改用六边形布局渲染
- [ ] 优化"三选一"高亮逻辑
- [ ] 改进迷雾效果（只显示next节点）
- [ ] 添加拖拽查看全图功能

**优先级**: P0（核心）  
**预计工作量**: 8小时

---

### Phase 3: 游戏逻辑集成（2天）

#### 任务3.1：App.jsx集成
- [ ] 修改 `handleChampionSelect`（调用新生成器）
- [ ] 修改 `completeNode`（三选一逻辑）
- [ ] 修改 `handleNodeSelect`（节点点击）
- [ ] 更新存档逻辑（序列化新地图结构）

**优先级**: P0（功能完整）  
**预计工作量**: 6小时

#### 任务3.2：ACT切换逻辑
- [ ] ACT1 -> ACT2 地图重新生成（20层）
- [ ] ACT2 -> ACT3 地图重新生成（30层）
- [ ] Boss战胜利后的章节过渡动画

**优先级**: P1（完整体验）  
**预计工作量**: 4小时

---

### Phase 4: 测试与优化（2天）

#### 任务4.1：功能测试
- [ ] 地图生成100次，检查是否有无解情况
- [ ] 测试三选一是否始终有效
- [ ] 测试存档/读档是否正常

**优先级**: P0（质量保证）  
**预计工作量**: 4小时

#### 任务4.2：性能优化
- [ ] 地图渲染性能（大地图30层）
- [ ] 动画流畅度（60fps目标）

**优先级**: P2（体验）  
**预计工作量**: 3小时

#### 任务4.3：UI调优
- [ ] 六边形边缘抗锯齿
- [ ] 迷雾过渡动画
- [ ] 节点高亮效果

**优先级**: P2（美化）  
**预计工作量**: 3小时

---

## 风险与挑战

### ⚠️ 技术风险

#### 风险1：地图生成算法复杂度
- **问题**：确保"三选一"且无死路的算法可能需要多次迭代
- **影响**：加载时间过长（>2秒）
- **缓解方案**：
  - 使用Web Worker异步生成
  - 添加生成失败重试机制（最多3次）
  - 预生成地图模板（减少随机性）

#### 风险2：六边形布局坐标计算
- **问题**：六边形坐标系比方格复杂，容易出错
- **影响**：节点位置错乱、连线偏移
- **缓解方案**：
  - 使用成熟库（如 `honeycomb-grid`）
  - 编写单元测试验证坐标转换
  - 可视化调试工具（显示坐标）

#### 风险3：兼容旧存档
- **问题**：v0.8.0的存档使用旧地图结构
- **影响**：玩家读档失败
- **缓解方案**：
  - 添加版本检测逻辑
  - 旧存档强制从菜单开始新游戏
  - 显示友好提示："地图系统已升级，请开始新游戏"

### 🎮 游戏设计风险

#### 风险4：三选一可能导致选择疲劳
- **问题**：30层地图意味着至少30次选择
- **影响**：玩家感到枯燥
- **缓解方案**：
  - 增加节点类型多样性（新事件）
  - 显示节点预览信息（如商店折扣）
  - 添加"快速路径"选项（跳过普通战斗）

#### 风险5：地图过大导致迷失方向
- **问题**：30层地图玩家可能忘记目标
- **影响**：游戏体验下降
- **缓解方案**：
  - 添加小地图（右上角）
  - 显示"距离Boss还有X层"
  - 高亮关键节点（商店/休息点）

---

## 待讨论问题

### 🤔 需要制作人决策的问题

#### 问题1：网格形状选择
- **方案A**：继续使用方格网格（Square Grid）
  - 优点：当前代码改动小，稳定
  - 缺点：视觉效果不如参考图
- **方案B**：改用六边形网格（Hexagon Grid）
  - 优点：更美观，更符合Roguelike传统
  - 缺点：开发成本高，坐标系复杂

**建议**：先用方格网格实现核心逻辑，v1.0再升级为六边形

---

#### 问题2：迷雾可见范围
- **方案A**：只显示当前节点的3个next节点
  - 优点：未知感强，增加探索乐趣
  - 缺点：玩家信息过少，可能做出错误决策
- **方案B**：显示当前层+下一层全部节点
  - 优点：玩家能提前规划路线
  - 缺点：减少未知感

**建议**：方案A，但鼠标悬停节点时显示其下一层连接

---

#### 问题3：节点密度配置
- **当前**：每层2-4个节点
- **问题**：30层地图可能有120个节点，渲染压力大
- **方案**：
  - ACT1 (10层)：每层2-3个节点（共25节点）
  - ACT2 (20层)：每层2-4个节点（共50节点）
  - ACT3 (30层)：每层3-5个节点（共100节点）

**建议**：需要测试实际渲染性能后调整

---

#### 问题4：BOSS位置
- **原需求**：BOSS在顶部"角落"
- **技术细节**：角落是指 `col = 0` 或 `col = 6` 吗？
- **建议**：随机选择 `col = 0, 1, 5, 6`（避免正中间）

---

#### 问题5：存档策略
- **问题**：玩家在地图中途退出，如何存档？
- **方案A**：保存完整地图结构（可能>100KB）
- **方案B**：保存随机种子 + 已走路径（<1KB，但需要重新生成）

**建议**：方案A，使用压缩（`LZString`）

---

## 📊 预估工作量

| 阶段 | 任务数 | 预计时间 | 优先级 |
|------|--------|----------|--------|
| Phase 1: 算法重构 | 3 | 15小时 | P0 |
| Phase 2: UI组件 | 3 | 18小时 | P1 |
| Phase 3: 游戏集成 | 2 | 10小时 | P0 |
| Phase 4: 测试优化 | 3 | 10小时 | P1 |
| **总计** | **11** | **53小时** | - |

**建议开发周期**：2周（每天4小时开发时间）

---

## 🎯 里程碑

### Milestone 1: 核心算法完成（第1周）
- [x] 创建 `new_grid` 分支
- [ ] 地图生成器支持动态层数
- [ ] 三选一逻辑验证通过
- [ ] 地图可达性100%保证

### Milestone 2: UI可交互（第2周）
- [ ] GridMapView渲染正常
- [ ] 点击节点进入战斗/事件
- [ ] 迷雾和高亮效果完成

### Milestone 3: 完整流程（第2周末）
- [ ] ACT1->ACT2->ACT3流程打通
- [ ] 存档/读档正常
- [ ] 无严重BUG

### Milestone 4: 发布v0.9.0（第3周）
- [ ] 性能优化完成
- [ ] 文档更新
- [ ] 合并到main分支

---

## 📝 下一步行动

### 立即行动（获得制作人确认后）

1. **与制作人讨论**：
   - [ ] 确认网格形状（方格 vs 六边形）
   - [ ] 确认迷雾可见范围
   - [ ] 确认节点密度配置

2. **技术准备**：
   - [ ] 研究六边形布局库（如需要）
   - [ ] 设计地图数据结构JSON格式
   - [ ] 编写BFS验证算法原型

3. **代码实现**：
   - [ ] 创建 `src/data/gridMapLayout_v2.js`
   - [ ] 编写单元测试
   - [ ] 逐步替换旧代码

---

## 附录

### 参考资料
- [Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) - 六边形网格权威指南
- [Slay the Spire Map Generation](https://www.youtube.com/watch?v=4Ym1aWLJnyg) - 地图生成算法讲解
- [Darkest Dungeon UI](https://www.gdcvault.com/play/1025402/) - UI设计参考

### 技术栈
- **地图生成**: 自研算法 + BFS验证
- **六边形布局**: `honeycomb-grid` 或 自实现
- **SVG渲染**: React + `framer-motion`
- **性能优化**: `react-window` (虚拟列表)

---

**文档状态**: ✅ 规划完成，等待批准  
**下次更新**: 获得制作人反馈后

