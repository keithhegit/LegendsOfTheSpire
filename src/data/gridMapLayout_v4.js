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
export const GRID_COLS = 11; // 增加宽度，支持更自由的探索

const ACT_CONFIG = {
  1: {
    minRows: 12,
    maxRows: 15,
    minNodes: 35,
    maxNodes: 50,
    nodeDensity: 0.35 // 35% 的格子有节点
  },
  2: {
    minRows: 25,
    maxRows: 32,
    minNodes: 70,
    maxNodes: 100,
    nodeDensity: 0.32
  },
  3: {
    minRows: 45,
    maxRows: 55,
    minNodes: 120,
    maxNodes: 180,
    nodeDensity: 0.30
  }
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
  const gridRows = config.minRows + Math.floor(Math.random() * (config.maxRows - config.minRows + 1));
  
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
  const mainPath = generateMainPath(grid, gridRows, startNode, bossNode, act, usedEnemies, allNodes);
  
  // ===========================
  // Step 4: 填充额外节点（达到目标密度）
  // ===========================
  const targetNodeCount = Math.floor(gridRows * GRID_COLS * config.nodeDensity);
  fillAdditionalNodes(grid, gridRows, targetNodeCount, act, usedEnemies, allNodes);
  
  // ===========================
  // Step 5: BFS验证BOSS可达性
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
const generateMainPath = (grid, gridRows, startNode, bossNode, act, usedEnemies, allNodes) => {
  const path = [startNode];
  let currentNode = startNode;
  let currentRow = startNode.row;
  let currentCol = startNode.col;

  const chooseHorizontalDir = () => {
    const towardBoss = bossNode.col > currentCol ? 1 : bossNode.col < currentCol ? -1 : 0;
    if (towardBoss === 0) {
      return Math.random() < 0.5 ? 1 : -1;
    }
    return Math.random() < 0.7 ? towardBoss : -towardBoss;
  };

  while (currentRow < bossNode.row) {
    // 0-2 次横向移动（保持一层内的左右摆动）
    const lateralMoves = Math.random() < 0.5 ? 1 : 0;
    for (let i = 0; i < lateralMoves; i++) {
      const dir = chooseHorizontalDir();
      let targetCol = currentCol + dir;
      if (targetCol < 0 || targetCol >= GRID_COLS) continue;
      if (!grid[currentRow][targetCol]) {
        const node = createNode(currentRow, targetCol, getRandomNodeType(currentRow, gridRows), null, act, usedEnemies);
        grid[currentRow][targetCol] = node;
        allNodes.push(node);
      }
      currentCol = targetCol;
      currentNode = grid[currentRow][currentCol];
      path.push(currentNode);
    }

    const nextRow = currentRow + 1;
    const upwardOptions = [];

    if (nextRow < gridRows) {
      if (currentCol >= 0 && currentCol < GRID_COLS) upwardOptions.push(currentCol);
      if (currentCol - 1 >= 0) upwardOptions.push(currentCol - 1);
    }

    let nextCol = upwardOptions.filter(c => c >= 0 && c < GRID_COLS);
    if (nextCol.length === 0) {
      nextCol = [Math.max(0, Math.min(GRID_COLS - 1, currentCol))];
    }

    nextCol = nextCol.sort((a, b) => Math.abs(a - bossNode.col) - Math.abs(b - bossNode.col))[0];

    let nextNode = grid[nextRow][nextCol];
    if (!nextNode) {
      nextNode = createNode(nextRow, nextCol, getRandomNodeType(nextRow, gridRows), null, act, usedEnemies);
      grid[nextRow][nextCol] = nextNode;
      allNodes.push(nextNode);
    }

    path.push(nextNode);
    currentNode = nextNode;
    currentRow = nextRow;
    currentCol = nextCol;
  }

  console.log(`[主路径] 生成了 ${path.length} 个节点`);
  return path;
};

// ===========================
// 填充额外节点
// ===========================
const fillAdditionalNodes = (grid, gridRows, targetCount, act, usedEnemies, allNodes) => {
  if (allNodes.length >= targetCount) return;
  const desiredCount = Math.max(targetCount, allNodes.length);
  let added = 0;

  const tryPlaceNeighbor = () => {
    const baseNode = allNodes[Math.floor(Math.random() * allNodes.length)];
    if (!baseNode) return false;

    const neighbors = getHexNeighbors(baseNode.row, baseNode.col, gridRows, GRID_COLS)
      .filter(([r, c]) => r > 0 && r < gridRows - 1 && c >= 0 && c < GRID_COLS && !grid[r][c]);

    if (neighbors.length === 0) return false;
    const [row, col] = neighbors[Math.floor(Math.random() * neighbors.length)];
    const nodeType = getRandomNodeType(row, gridRows);
    const node = createNode(row, col, nodeType, null, act, usedEnemies);
    grid[row][col] = node;
    allNodes.push(node);
    added++;
    return true;
  };

  const maxAttempts = desiredCount * 12;
  let attempts = 0;

  while (allNodes.length < desiredCount && attempts < maxAttempts) {
    attempts++;
    tryPlaceNeighbor();
  }

  console.log(`[额外节点] 添加了 ${added} 个节点`);
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
  const gridRows = config.minRows;
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

