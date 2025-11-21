/**
 * 六边形网格地图生成器 v3 - 距离圈算法
 * 
 * 核心改变：
 * - 放弃"层级"概念，改用"距离圈"
 * - 允许横向/对角线移动，创造真正的Z型路径
 * - 最短路径：直线 (minSteps)
 * - 最长路径：绕圈探索 (maxSteps)
 * 
 * 设计目标：
 * - ACT1: 最短10步，最长15-20步
 * - ACT2: 最短20步，最长35-50步
 * - ACT3: 最短30步，最长50-80步
 */

import { getHexNeighbors, offsetToPixel, hexDistance, areHexagonsAdjacent } from '../utils/hexagonGrid';
import { ENEMY_POOL } from './enemies';

// 网格配置
export const GRID_COLS = 9; // 增加列数以支持横向探索
const GRID_ROWS_BASE = 15; // 基础行数

// ACT配置
const ACT_CONFIG = {
  1: { minSteps: 10, maxSteps: 20, totalNodes: 20 },
  2: { minSteps: 20, maxSteps: 50, totalNodes: 50 },
  3: { minSteps: 30, maxSteps: 80, totalNodes: 80 }
};

// 节点类型权重
const NODE_WEIGHTS = {
  BATTLE: 0.5,
  EVENT: 0.2,
  SHOP: 0.15,
  REST: 0.1,
  CHEST: 0.05
};

function getRandomNodeType(excludeTypes = []) {
  const rand = Math.random();
  let cumulative = 0;
  
  const types = Object.entries(NODE_WEIGHTS).filter(([type]) => !excludeTypes.includes(type));
  
  for (const [type, weight] of types) {
    cumulative += weight;
    if (rand < cumulative) return type;
  }
  
  return 'BATTLE';
}

function getBossId(act) {
  if (act === 1) return 'Darius_BOSS';
  if (act === 2) return 'Viego_BOSS';
  return 'BelVeth_BOSS';
}

function getRandomEnemy(act, usedEnemies = []) {
  const actEnemies = Object.entries(ENEMY_POOL)
    .filter(([id, enemy]) => enemy.act === act && enemy.difficultyRank < 99)
    .map(([id]) => id);
  
  const availableEnemies = actEnemies.filter(id => !usedEnemies.includes(id));
  
  if (availableEnemies.length === 0) {
    return actEnemies[Math.floor(Math.random() * actEnemies.length)] || 'Katarina';
  }
  
  return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
}

function createNode(row, col, type, act, distance, usedEnemies = []) {
  const id = `${row}-${col}`;
  const position = offsetToPixel(row, col);
  
  const node = {
    id,
    row,
    col,
    type,
    status: 'LOCKED',
    distance, // 从START的距离（步数）
    next: [],
    prev: [],
    position,
    enemyId: null
  };
  
  if (type === 'BATTLE') {
    node.enemyId = getRandomEnemy(act, usedEnemies);
    usedEnemies.push(node.enemyId);
  } else if (type === 'BOSS') {
    node.enemyId = getBossId(act);
  }
  
  return node;
}

/**
 * 距离圈算法：生成从START向外扩展的节点
 */
export function generateGridMap(act = 1, usedEnemies = []) {
  console.log(`\n=== Generating Map for ACT ${act} (Distance-Based Algorithm) ===`);
  
  const config = ACT_CONFIG[act];
  const { minSteps, maxSteps, totalNodes: targetNodeCount } = config;
  
  const gridRows = Math.max(GRID_ROWS_BASE, maxSteps); // 确保足够的行数
  const grid = Array.from({ length: gridRows }, () => 
    Array.from({ length: GRID_COLS }, () => null)
  );
  
  const nodes = [];
  const nodesByDistance = new Map(); // distance -> [nodes]
  
  // 阶段1: 放置START
  const startRow = 0;
  const startCol = Math.floor(GRID_COLS / 2);
  const startNode = createNode(startRow, startCol, 'START', act, 0, usedEnemies);
  startNode.status = 'AVAILABLE';
  grid[startRow][startCol] = startNode;
  nodes.push(startNode);
  nodesByDistance.set(0, [startNode]);
  
  console.log(`[Init] START at (${startRow}, ${startCol})`);
  
  // 阶段2: 生成最短路径（直线）
  let currentNode = startNode;
  const mainPath = [startNode];
  
  for (let step = 1; step <= minSteps; step++) {
    const targetRow = Math.min(currentNode.row + 1, gridRows - 1);
    const colOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    let targetCol = currentNode.col + colOffset;
    targetCol = Math.max(0, Math.min(GRID_COLS - 1, targetCol));
    
    // 如果位置被占用，找附近空位
    if (grid[targetRow][targetCol]) {
      for (let offset = 1; offset < GRID_COLS; offset++) {
        const testCol = (targetCol + offset) % GRID_COLS;
        if (!grid[targetRow][testCol]) {
          targetCol = testCol;
          break;
        }
      }
    }
    
    const nodeType = step === minSteps ? 'BOSS' : getRandomNodeType();
    const newNode = createNode(targetRow, targetCol, nodeType, act, step, usedEnemies);
    grid[targetRow][targetCol] = newNode;
    nodes.push(newNode);
    mainPath.push(newNode);
    
    currentNode.next.push(newNode.id);
    newNode.prev.push(currentNode.id);
    
    nodesByDistance.set(step, [newNode]);
    currentNode = newNode;
  }
  
  const bossNode = currentNode;
  console.log(`[MainPath] BOSS at (${bossNode.row}, ${bossNode.col}), shortest path=${minSteps} steps`);
  
  // 阶段3: 生成Z型绕路（关键！）
  // 策略：在主路径的中间段，向两侧生成"绕路"节点
  let currentNodeCount = nodes.length;
  
  for (let step = 2; step < minSteps - 1 && currentNodeCount < targetNodeCount; step++) {
    const mainPathNode = mainPath[step];
    
    // 在这一步的左侧和右侧各生成1-2个"绕路"节点
    const detourCount = Math.floor(Math.random() * 2) + 1; // 1-2个绕路节点
    
    for (let i = 0; i < detourCount; i++) {
      if (currentNodeCount >= targetNodeCount) break;
      
      // 横向偏移（左侧或右侧）
      const direction = Math.random() < 0.5 ? -1 : 1;
      const colOffset = direction * (2 + Math.floor(Math.random() * 2)); // ±2 或 ±3
      let targetCol = mainPathNode.col + colOffset;
      targetCol = Math.max(0, Math.min(GRID_COLS - 1, targetCol));
      
      // 同一行或上一行
      const targetRow = Math.random() < 0.5 ? mainPathNode.row : Math.max(0, mainPathNode.row - 1);
      
      if (grid[targetRow][targetCol]) continue;
      
      // 创建绕路节点
      const detourNode = createNode(targetRow, targetCol, getRandomNodeType(), act, step, usedEnemies);
      grid[targetRow][targetCol] = detourNode;
      nodes.push(detourNode);
      currentNodeCount++;
      
      // 连接：前一个主路径节点 -> 绕路节点 -> 下一个主路径节点
      const prevMainNode = mainPath[step - 1];
      const nextMainNode = mainPath[step + 1];
      
      prevMainNode.next.push(detourNode.id);
      detourNode.prev.push(prevMainNode.id);
      
      detourNode.next.push(nextMainNode.id);
      nextMainNode.prev.push(detourNode.id);
      
      console.log(`[Detour] Created at (${targetRow}, ${targetCol}), connects ${prevMainNode.id} -> ${detourNode.id} -> ${nextMainNode.id}`);
      
      // 可选：在绕路节点之间也创建横向连接
      if (Math.random() < 0.3 && currentNodeCount < targetNodeCount) {
        const detourCol2 = targetCol + direction * 2;
        if (detourCol2 >= 0 && detourCol2 < GRID_COLS && !grid[targetRow][detourCol2]) {
          const detour2 = createNode(targetRow, detourCol2, getRandomNodeType(), act, step + 1, usedEnemies);
          grid[targetRow][detourCol2] = detour2;
          nodes.push(detour2);
          currentNodeCount++;
          
          detourNode.next.push(detour2.id);
          detour2.prev.push(detourNode.id);
          
          detour2.next.push(nextMainNode.id);
          nextMainNode.prev.push(detour2.id);
        }
      }
    }
  }
  
  console.log(`[Detours] Generated ${currentNodeCount} total nodes (target: ${targetNodeCount})`);
  
  // 阶段4: 验证可达性
  const { reachable, distance: minDistance } = bfsCheck(nodes, startNode, bossNode);
  const maxDistance = dfsMaxDistance(nodes, startNode, bossNode);
  
  console.log(`[Validation] BOSS reachable: ${reachable}`);
  console.log(`[Validation] Distance range: ${minDistance} - ${maxDistance} (target: ${minSteps} - ${maxSteps})`);
  
  if (!reachable) {
    console.error(`[Validation] BOSS not reachable! Force connecting...`);
    // 强制连接最近的节点到BOSS
    const nearbyNodes = nodes.filter(n => 
      n.row === bossNode.row - 1 && Math.abs(n.col - bossNode.col) <= 2
    );
    if (nearbyNodes.length > 0) {
      const nearest = nearbyNodes[0];
      nearest.next.push(bossNode.id);
      bossNode.prev.push(nearest.id);
    }
  }
  
  console.log(`=== Map Generation Complete ===\n`);
  
  return {
    grid,
    nodes,
    startNode,
    bossNode,
    stats: {
      minSteps: minDistance,
      maxSteps: maxDistance,
      reachable,
      totalNodes: nodes.length
    },
    act,
    totalFloors: gridRows
  };
}

/**
 * BFS最短路径
 */
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

/**
 * DFS最长路径（记忆化搜索）
 */
function dfsMaxDistance(nodes, startNode, bossNode) {
  const memo = new Map();
  
  function dfs(nodeId) {
    if (memo.has(nodeId)) return memo.get(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return -Infinity;
    
    if (nodeId === bossNode.id) {
      memo.set(nodeId, 0);
      return 0;
    }
    
    if (node.next.length === 0) {
      memo.set(nodeId, -Infinity);
      return -Infinity;
    }
    
    let maxDist = -Infinity;
    for (const nextId of node.next) {
      const dist = dfs(nextId);
      if (dist !== -Infinity) {
        maxDist = Math.max(maxDist, dist + 1);
      }
    }
    
    memo.set(nodeId, maxDist);
    return maxDist;
  }
  
  return dfs(startNode.id);
}

