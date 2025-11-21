/**
 * ===========================
 * 六边形网格自由探索地图生成器 v4
 * ===========================
 * 
 * 核心设计：
 * 1. 放弃DAG结构，使用六边形邻接规则
 * 2. 玩家可以向任意相邻方向移动（除了已探索的）
 * 3. 战争迷雾：只显示已探索+相邻的格子
 * 4. BOSS必须可达，但路径自由选择
 */

import { ENEMY_POOL } from './enemies';
import { shuffle } from '../utils/gameLogic';
import { getHexNeighbors } from '../utils/hexagonGrid';

// ===========================
// 配置常量
// ===========================
export const GRID_COLS = 11; // 网格宽度

const ACT_CONFIG = {
  1: {
    minRows: 7,
    maxRows: 12,
    minSteps: 16,
    maxSteps: 22,
    maxHorizontalRun: 2,
    detourChance: 0.3,
    optionalBranches: 3
  },
  2: {
    minRows: 10,
    maxRows: 20,
    minSteps: 32,
    maxSteps: 46,
    maxHorizontalRun: 2,
    detourChance: 0.45,
    optionalBranches: 6
  },
  3: {
    minRows: 13,
    maxRows: 25,
    minSteps: 55,
    maxSteps: 72,
    maxHorizontalRun: 3,
    detourChance: 0.55,
    optionalBranches: 10
  }
};

// 图形模板定义（带权重）
const SHAPE_PATTERNS = {
  1: [
    { name: '直线 (I)', weight: 1, anchors: [{ ratio: 0, offset: 0 }, { ratio: 1, offset: 0 }], loops: [] },
    { name: 'S 字', weight: 3, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.4, offset: -2 }, { ratio: 0.8, offset: 2 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.5, direction: 1, span: 2 }] },
    { name: '立 字阶梯', weight: 5, anchors: [{ ratio: 0, offset: -1 }, { ratio: 0.3, offset: -1 }, { ratio: 0.5, offset: 2 }, { ratio: 0.8, offset: 2 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.5, direction: -1, span: 3 }] }
  ],
  2: [
    { name: '工 字', weight: 4, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.2, offset: 4 }, { ratio: 0.5, offset: 0 }, { ratio: 0.8, offset: -4 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.15, direction: -1, span: 3 }, { ratio: 0.85, direction: 1, span: 3 }] },
    { name: 'O 型', weight: 4, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.25, offset: 3 }, { ratio: 0.5, offset: 0 }, { ratio: 0.75, offset: -3 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.3, direction: 1, span: 2 }, { ratio: 0.7, direction: -1, span: 2 }] },
    { name: '梯形', weight: 3, anchors: [{ ratio: 0, offset: -2 }, { ratio: 0.5, offset: 2 }, { ratio: 1, offset: -1 }], loops: [{ ratio: 0.55, direction: 1, span: 2 }] },
    { name: '立 字阶梯', weight: 6, anchors: [{ ratio: 0, offset: -2 }, { ratio: 0.3, offset: -2 }, { ratio: 0.5, offset: 3 }, { ratio: 0.8, offset: 3 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.5, direction: -1, span: 4 }] }
  ],
  3: [
    { name: 'S 扩展', weight: 4, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.2, offset: -4 }, { ratio: 0.45, offset: 4 }, { ratio: 0.7, offset: -3 }, { ratio: 1, offset: 2 }], loops: [{ ratio: 0.35, direction: 1, span: 3 }, { ratio: 0.65, direction: -1, span: 3 }] },
    { name: '椭圆 O', weight: 4, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.15, offset: 3 }, { ratio: 0.4, offset: 4 }, { ratio: 0.6, offset: -4 }, { ratio: 0.85, offset: -3 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.2, direction: 1, span: 3 }, { ratio: 0.8, direction: -1, span: 3 }] },
    { name: '工 字扩展', weight: 5, anchors: [{ ratio: 0, offset: 0 }, { ratio: 0.2, offset: 5 }, { ratio: 0.5, offset: 0 }, { ratio: 0.8, offset: -5 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.15, direction: -1, span: 4 }, { ratio: 0.85, direction: 1, span: 4 }] },
    { name: '立 字阶梯', weight: 8, anchors: [{ ratio: 0, offset: -2 }, { ratio: 0.3, offset: -2 }, { ratio: 0.5, offset: 3 }, { ratio: 0.8, offset: 3 }, { ratio: 1, offset: 0 }], loops: [{ ratio: 0.5, direction: -1, span: 4 }] }
  ]
};

// 挖空配置（空洞尺寸范围）
const HOLE_SIZE_RANGE = {
  minWidth: 1,
  maxWidth: 4,
  minHeight: 1,
  maxHeight: 4
};

// 空洞数量范围（根据ACT调整）
const HOLE_COUNT_RANGE = {
  1: { min: 1, max: 2 },  // ACT1: 1-2个空洞
  2: { min: 1, max: 3 },  // ACT2: 1-3个空洞
  3: { min: 2, max: 4 }   // ACT3: 2-4个空洞
};

const clampColumn = (col) => Math.max(0, Math.min(GRID_COLS - 1, col));

// 加权随机选择图形模板
const pickShapePattern = (act) => {
  const patterns = SHAPE_PATTERNS[act] || SHAPE_PATTERNS[1];
  const totalWeight = patterns.reduce((sum, p) => sum + (p.weight || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const pattern of patterns) {
    rand -= (pattern.weight || 1);
    if (rand <= 0) return pattern;
  }
  return patterns[0];
};

// 随机生成空洞尺寸
const generateRandomHole = () => {
  const width = HOLE_SIZE_RANGE.minWidth + Math.floor(Math.random() * (HOLE_SIZE_RANGE.maxWidth - HOLE_SIZE_RANGE.minWidth + 1));
  const height = HOLE_SIZE_RANGE.minHeight + Math.floor(Math.random() * (HOLE_SIZE_RANGE.maxHeight - HOLE_SIZE_RANGE.minHeight + 1));
  return { width, height, name: `${width}x${height}` };
};

// 应用挖空：在地图中间区域挖出空洞，形成立字型/O型/S型
// 100%概率应用挖空，随机生成N个随机尺寸的空洞
const applyHoles = (grid, gridRows, gridCols, mainPath, act) => {
  // 100%概率应用挖空
  const holeCountRange = HOLE_COUNT_RANGE[act] || HOLE_COUNT_RANGE[1];
  const holeCount = holeCountRange.min + Math.floor(Math.random() * (holeCountRange.max - holeCountRange.min + 1));
  console.log(`[挖空] 生成 ${holeCount} 个随机尺寸空洞`);
  
  // 创建主路径节点集合（保护主路径不被挖空）
  const mainPathSet = new Set(mainPath.map(n => `${n.row}-${n.col}`));
  
  // 计算安全区域（避开起点和终点附近）
  const safeStartRow = Math.floor(gridRows * 0.15);
  const safeEndRow = Math.floor(gridRows * 0.85);
  const safeStartCol = Math.floor(gridCols * 0.2);
  const safeEndCol = Math.floor(gridCols * 0.8);
  
  let totalRemoved = 0;
  
  // 生成多个随机空洞
  for (let h = 0; h < holeCount; h++) {
    const hole = generateRandomHole();
    console.log(`[挖空 ${h + 1}/${holeCount}] 尺寸: ${hole.name}`);
    
    // 随机选择空洞位置（确保不越界）
    const maxRow = Math.max(safeStartRow, safeEndRow - hole.height);
    const maxCol = Math.max(safeStartCol, safeEndCol - hole.width);
    
    if (maxRow < safeStartRow || maxCol < safeStartCol) {
      console.warn(`[挖空 ${h + 1}] 跳过：尺寸过大无法放置`);
      continue;
    }
    
    const centerRow = safeStartRow + Math.floor(Math.random() * (maxRow - safeStartRow + 1));
    const centerCol = safeStartCol + Math.floor(Math.random() * (maxCol - safeStartCol + 1));
    
    // 挖空：移除该区域内的所有节点（但保留主路径上的节点）
    const removed = [];
    for (let r = centerRow; r < centerRow + hole.height && r < gridRows; r++) {
      for (let c = centerCol; c < centerCol + hole.width && c < gridCols; c++) {
        if (grid[r] && grid[r][c]) {
          const key = `${r}-${c}`;
          // 保护主路径节点
          if (!mainPathSet.has(key)) {
            removed.push([r, c]);
            grid[r][c] = null;
          }
        }
      }
    }
    
    totalRemoved += removed.length;
    console.log(`[挖空 ${h + 1}] 移除了 ${removed.length} 个节点`);
  }
  
  console.log(`[挖空] 总共移除了 ${totalRemoved} 个节点`);
};

const buildRowTargets = (gridRows, bossCol, pattern) => {
  const anchors = (pattern.anchors?.length ? pattern.anchors : [{ ratio: 0, offset: 0 }, { ratio: 1, offset: 0 }])
    .map(anchor => ({
      row: Math.max(0, Math.min(gridRows - 1, Math.round(anchor.ratio * (gridRows - 1)))),
      col: clampColumn(bossCol + (anchor.offset || 0))
    }))
    .sort((a, b) => a.row - b.row);

  const targets = new Array(gridRows).fill(bossCol);
  for (let row = 0; row < gridRows; row++) {
    if (row <= anchors[0].row) {
      targets[row] = anchors[0].col;
      continue;
    }
    if (row >= anchors[anchors.length - 1].row) {
      targets[row] = anchors[anchors.length - 1].col;
      continue;
    }
    const nextIndex = anchors.findIndex(anchor => anchor.row >= row);
    const nextAnchor = anchors[nextIndex];
    const prevAnchor = anchors[nextIndex - 1];
    if (nextAnchor.row === row) {
      targets[row] = nextAnchor.col;
    } else {
      const t = (row - prevAnchor.row) / (nextAnchor.row - prevAnchor.row);
      const interpolated = Math.round(prevAnchor.col + (nextAnchor.col - prevAnchor.col) * t);
      targets[row] = clampColumn(interpolated);
    }
  }
  return targets;
};

const buildLoopTriggers = (pattern, gridRows, config) => {
  return (pattern.loops || []).map(loop => ({
    row: Math.max(1, Math.min(gridRows - 2, Math.round(loop.ratio * (gridRows - 1)))),
    direction: loop.direction || 1,
    span: Math.max(1, loop.span || config.maxHorizontalRun),
    used: false
  }));
};

// 节点类型权重
const NODE_WEIGHTS = {
  BATTLE: 0.50,
  EVENT: 0.20,
  SHOP: 0.12,
  REST: 0.12,
  CHEST: 0.06
};

// ===========================
// 主生成函数
// ===========================
export const generateGridMap = (act, usedEnemies = [], attempt = 0) => {
  console.log(`\n========== 生成 ACT${act} 六边形自由探索地图 ==========`);
  
  const config = ACT_CONFIG[act];
  // 随机选择行数范围
  const gridRows = config.minRows + Math.floor(Math.random() * (config.maxRows - config.minRows + 1));
  const targetSteps = config.minSteps + Math.floor(Math.random() * (config.maxSteps - config.minSteps + 1));
  const pattern = pickShapePattern(act);
  console.log(`[图形] ACT${act} 使用: ${pattern.name}, 行数: ${gridRows}, 目标步数 ${targetSteps}`);
  
  // 初始化网格
  const grid = Array(gridRows).fill(null).map(() => Array(GRID_COLS).fill(null));
  const allNodes = [];
  
  // ===========================
  // Step 1: 生成起点
  // ===========================
  const startCol = Math.floor(GRID_COLS / 2);
  const startNode = createNode(0, startCol, 'BATTLE', null, act, usedEnemies);
  startNode.status = 'AVAILABLE';
  grid[0][startCol] = startNode;
  allNodes.push(startNode);
  
  console.log(`[起点] row=0, col=${startCol}`);
  
  // ===========================
  // Step 2: 生成BOSS（顶层中央）
  // ===========================
  const bossRow = gridRows - 1;
  const bossCol = Math.floor(GRID_COLS / 2);
  const bossNode = createNode(bossRow, bossCol, 'BOSS', getBossId(act), act, usedEnemies);
  grid[bossRow][bossCol] = bossNode;
  allNodes.push(bossNode);
  
  console.log(`[BOSS] row=${bossRow}, col=${bossCol}`);
  
  // ===========================
  // Step 3: 生成主路径（确保BOSS可达）
  // ===========================
  const mainPath = generateMainPath(grid, gridRows, startNode, bossNode, config, pattern, targetSteps, act, usedEnemies, allNodes);

  // ===========================
  // Step 4: 生成可选支线
  // ===========================
  addOptionalBranches(grid, mainPath, config.optionalBranches, act, usedEnemies, allNodes);
  
  // ===========================
  // Step 5: 应用挖空（形成立字型/O型/S型）
  // ===========================
  applyHoles(grid, gridRows, GRID_COLS, mainPath, act);
  
  // 更新allNodes：移除被挖空的节点
  const nodeMap = new Map(allNodes.map(n => [`${n.row}-${n.col}`, n]));
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!grid[r][c] && nodeMap.has(`${r}-${c}`)) {
        const idx = allNodes.findIndex(n => n.row === r && n.col === c);
        if (idx >= 0) allNodes.splice(idx, 1);
      }
    }
  }
  
  // ===========================
  // Step 6: 移除孤立节点（飞地）- 在挖空之后，确保所有节点都可达
  // ===========================
  removeIsolatedNodes(grid, gridRows, startNode, bossNode, allNodes);
  
  // ===========================
  // Step 7: BFS验证BOSS可达性
  // ===========================
  const reachable = isBossReachable(grid, startNode, bossNode);
  
  console.log(`\n========== 生成完成 ==========`);
  console.log(`总节点数: ${allNodes.length}`);
  console.log(`BOSS可达: ${reachable ? '✅' : '❌'}`);
  
  if (!reachable) {
    console.warn(`⚠️ BOSS不可达！第 ${attempt + 1} 次尝试失败`);
    if (attempt < 4) {
      return generateGridMap(act, usedEnemies, attempt + 1);
    }
    console.warn('⚠️ 多次生成失败，使用fallback生成线性地图');
    return generateFallbackMap(act, usedEnemies);
  }
  
  return {
    grid,
    nodes: allNodes,
    totalFloors: gridRows,
    startNode,
    bossNode,
    act
  };
};

// ===========================
// 生成主路径（确保BOSS可达）
// ===========================
const generateMainPath = (grid, gridRows, startNode, bossNode, config, pattern, targetSteps, act, usedEnemies, allNodes) => {
  const path = [startNode];
  let currentNode = startNode;
  let currentRow = startNode.row;
  let currentCol = startNode.col;
  const bossRow = bossNode.row;
  const bossCol = bossNode.col;
  const verticalStepsNeeded = bossRow - currentRow;
  let budgetRemaining = Math.max(0, targetSteps - verticalStepsNeeded);
  const rowTargets = buildRowTargets(gridRows, bossCol, pattern);
  const loopTriggers = buildLoopTriggers(pattern, gridRows, config);

  const moveHorizontal = (dir, countsBudget = true) => {
    const targetCol = currentCol + dir;
    if (targetCol < 0 || targetCol >= GRID_COLS) {
      return false;
    }
    if (!grid[currentRow][targetCol]) {
      const node = createNode(currentRow, targetCol, getRandomNodeType(currentRow, gridRows), null, act, usedEnemies);
      grid[currentRow][targetCol] = node;
      allNodes.push(node);
    }
    currentCol = targetCol;
    currentNode = grid[currentRow][currentCol];
    path.push(currentNode);
    if (countsBudget) {
      budgetRemaining = Math.max(0, budgetRemaining - 1);
    }
    return true;
  };

  const moveUpward = (targetCol) => {
    const nextRow = currentRow + 1;
    if (nextRow >= gridRows) return;
    let nextNode = grid[nextRow][targetCol];
    if (!nextNode) {
      nextNode = createNode(nextRow, targetCol, getRandomNodeType(nextRow, gridRows), null, act, usedEnemies);
      grid[nextRow][targetCol] = nextNode;
      allNodes.push(nextNode);
    }
    currentRow = nextRow;
    currentCol = targetCol;
    currentNode = nextNode;
    path.push(nextNode);
  };

  const maybeApplyPatternLoop = () => {
    if (!loopTriggers.length) return;
    for (const loop of loopTriggers) {
      if (loop.used) continue;
      if (Math.abs(currentRow - loop.row) > 1) continue;
      if (budgetRemaining < loop.span * 2) continue;
      let success = true;
      for (let step = 0; step < loop.span; step++) {
        if (!moveHorizontal(loop.direction)) { success = false; break; }
      }
      if (success) {
        for (let step = 0; step < loop.span; step++) {
          if (!moveHorizontal(-loop.direction)) { success = false; break; }
        }
      }
      if (success) {
        loop.used = true;
      }
      break;
    }
  };

  // 主路径推进到 BOSS 楼层的前一层
  while (currentRow < bossRow - 1) {
    const nextRow = currentRow + 1;
    const desiredCol = rowTargets[nextRow] ?? bossCol;
    const delta = desiredCol - currentCol;
    const dir = delta >= 0 ? 1 : -1;
    let movesNeeded = Math.abs(delta);

    while (movesNeeded > 0) {
      if (!moveHorizontal(dir, false)) break;
      movesNeeded--;
    }

    if (budgetRemaining > 0 && Math.random() < config.detourChance) {
      const extraDir = Math.random() < 0.5 ? 1 : -1;
      const steps = Math.min(config.maxHorizontalRun, budgetRemaining);
      let performed = 0;
      while (performed < steps && moveHorizontal(extraDir)) {
        performed++;
      }
      while (performed > 0 && moveHorizontal(-extraDir)) {
        performed--;
      }
    }

    maybeApplyPatternLoop();
    moveUpward(desiredCol);
  }

  // 现在处于 BOSS 楼层的前一层，横向调整到 bossCol
  while (budgetRemaining > 0) {
    const dir = currentCol < bossCol ? 1 : currentCol > bossCol ? -1 : (Math.random() < 0.5 ? 1 : -1);
    if (!moveHorizontal(dir)) break;
  }

  while (currentCol < bossCol) moveHorizontal(1, false);
  while (currentCol > bossCol) moveHorizontal(-1, false);

  currentRow = bossRow - 1;
  moveUpward(bossCol);
  grid[bossRow][bossCol] = bossNode;
  currentNode = bossNode;
  path.push(bossNode);

  console.log(`[主路径] 生成了 ${path.length} 个节点`);
  return path;
};

// ===========================
// 填充额外节点
// ===========================
const addOptionalBranches = (grid, mainPath, branchCount, act, usedEnemies, allNodes) => {
  if (!branchCount || branchCount <= 0) return;
  const gridRows = grid.length;
  const mainSet = new Set(mainPath.map(n => `${n.row}-${n.col}`));

  for (let i = 0; i < branchCount; i++) {
    const baseIndex = 2 + Math.floor(Math.random() * Math.max(1, mainPath.length - 4));
    const baseNode = mainPath[baseIndex];
    if (!baseNode) continue;

    let available = getHexNeighbors(baseNode.row, baseNode.col, gridRows, GRID_COLS)
      .filter(([r, c]) => !grid[r][c]);
    if (available.length === 0) continue;

    const branchLength = 1 + Math.floor(Math.random() * 2);
    let prevNode = baseNode;

    for (let step = 0; step < branchLength; step++) {
      if (available.length === 0) break;
      const [row, col] = available[Math.floor(Math.random() * available.length)];
      const nodeType = getOptionalBranchType();
      const node = createNode(row, col, nodeType, null, act, usedEnemies);
      grid[row][col] = node;
      allNodes.push(node);
      prevNode = node;
      available = getHexNeighbors(prevNode.row, prevNode.col, gridRows, GRID_COLS)
        .filter(([r, c]) => !grid[r][c] && !mainSet.has(`${r}-${c}`));
    }
  }
};

// ===========================
// BFS验证BOSS可达性
// ===========================
const isBossReachable = (grid, startNode, bossNode) => {
  const visited = new Set();
  const queue = [startNode];
  visited.add(`${startNode.row}-${startNode.col}`);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.row === bossNode.row && current.col === bossNode.col) {
      return true;
    }
    
    const neighbors = getHexNeighbors(current.row, current.col, grid.length, GRID_COLS);
    for (const [r, c] of neighbors) {
      const neighbor = grid[r][c];
      if (neighbor && !visited.has(`${r}-${c}`)) {
        visited.add(`${r}-${c}`);
        queue.push(neighbor);
      }
    }
  }
  
  return false;
};

// ===========================
// 移除孤立节点（飞地）- 确保所有节点都从起点可达
// ===========================
const removeIsolatedNodes = (grid, gridRows, startNode, bossNode, allNodes) => {
  // 使用BFS找到所有从起点可达的节点
  const reachableSet = new Set();
  const queue = [startNode];
  reachableSet.add(`${startNode.row}-${startNode.col}`);
  
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getHexNeighbors(current.row, current.col, gridRows, GRID_COLS);
    
    for (const [r, c] of neighbors) {
      const neighbor = grid[r] && grid[r][c];
      if (!neighbor) continue;
      
      const key = `${r}-${c}`;
      if (!reachableSet.has(key)) {
        reachableSet.add(key);
        queue.push(neighbor);
      }
    }
  }
  
  // 移除所有不可达的节点（飞地），但保护起点和BOSS
  const isolated = [];
  for (let i = allNodes.length - 1; i >= 0; i--) {
    const node = allNodes[i];
    const key = `${node.row}-${node.col}`;
    
    // 保护起点和BOSS节点（即使它们不可达，也不移除）
    if ((node.row === startNode.row && node.col === startNode.col) ||
        (node.row === bossNode.row && node.col === bossNode.col)) {
      continue;
    }
    
    // 如果节点不在可达集合中，说明它是飞地
    if (!reachableSet.has(key)) {
      isolated.push(node);
      // 从grid中移除
      if (grid[node.row] && grid[node.row][node.col]) {
        grid[node.row][node.col] = null;
      }
      // 从allNodes中移除
      allNodes.splice(i, 1);
    }
  }
  
  if (isolated.length > 0) {
    console.log(`[清理飞地] 移除了 ${isolated.length} 个孤立节点`);
  }
};

// ===========================
// 工具函数
// ===========================
const createNode = (row, col, type, enemyId, act, usedEnemies) => {
  return {
    id: `${row}-${col}`,
    row,
    col,
    type,
    status: 'LOCKED',
    enemyId: type === 'BATTLE' ? (enemyId || getRandomEnemy(act, usedEnemies)) : enemyId,
    explored: false // 新增：标记是否已探索
  };
};

const getRandomNodeType = (row, totalRows) => {
  // 前20%：更多战斗
  // 中间60%：混合
  // 后20%：更多商店/休息
  const progress = row / totalRows;
  
  let weights = { ...NODE_WEIGHTS };
  if (progress < 0.2) {
    weights.BATTLE = 0.70;
    weights.EVENT = 0.15;
    weights.SHOP = 0.05;
    weights.REST = 0.05;
    weights.CHEST = 0.05;
  } else if (progress > 0.8) {
    weights.BATTLE = 0.40;
    weights.EVENT = 0.15;
    weights.SHOP = 0.20;
    weights.REST = 0.20;
    weights.CHEST = 0.05;
  }
  
  const rand = Math.random();
  let cumulative = 0;
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand < cumulative) return type;
  }
  return 'BATTLE';
};

const getOptionalBranchType = () => {
  const roll = Math.random();
  if (roll < 0.35) return 'EVENT';
  if (roll < 0.55) return 'CHEST';
  if (roll < 0.75) return 'REST';
  if (roll < 0.9) return 'SHOP';
  return 'BATTLE';
};

const getBossId = (act) => {
  if (act === 1) return "Darius_BOSS";
  if (act === 2) return "Viego_BOSS";
  return "BelVeth_BOSS";
};

const getRandomEnemy = (act, usedEnemies = []) => {
  const actEnemies = Object.keys(ENEMY_POOL).filter(
    id => ENEMY_POOL[id].act === act && !id.includes('BOSS')
  );
  
  const available = actEnemies.filter(id => !usedEnemies.includes(id));
  
  if (available.length === 0) {
    console.warn(`Act ${act} no unique enemies left, reusing from pool`);
    return actEnemies[Math.floor(Math.random() * actEnemies.length)] || 'Katarina';
  }
  
  return available[Math.floor(Math.random() * available.length)];
};

// ===========================
// Fallback：简单线性地图
// ===========================
const generateFallbackMap = (act, usedEnemies) => {
  console.log('[Fallback] 生成简单线性地图');
  const config = ACT_CONFIG[act];
  const gridRows = config.minRows + Math.floor(Math.random() * (config.maxRows - config.minRows + 1));
  const grid = Array(gridRows).fill(null).map(() => Array(GRID_COLS).fill(null));
  const allNodes = [];
  
  const centerCol = Math.floor(GRID_COLS / 2);
  
  for (let row = 0; row < gridRows; row++) {
    const type = row === gridRows - 1 ? 'BOSS' : getRandomNodeType(row, gridRows);
    const enemyId = type === 'BOSS' ? getBossId(act) : null;
    const node = createNode(row, centerCol, type, enemyId, act, usedEnemies);
    
    if (row === 0) node.status = 'AVAILABLE';
    
    grid[row][centerCol] = node;
    allNodes.push(node);
  }
  
  return {
    grid,
    nodes: allNodes,
    totalFloors: gridRows,
    startNode: allNodes[0],
    bossNode: allNodes[allNodes.length - 1],
    act
  };
};

// ===========================
// 导出用于测试
// ===========================
export const generateGridMapWithRetry = (act, usedEnemies = [], maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const mapData = generateGridMap(act, usedEnemies);
    if (isBossReachable(mapData.grid, mapData.startNode, mapData.bossNode)) {
      return mapData;
    }
    console.warn(`尝试 ${i + 1}/${maxRetries} 失败，重新生成...`);
  }
  
  console.error('所有尝试失败，使用fallback');
  return generateFallbackMap(act, usedEnemies);
};

