import { ENEMY_POOL } from './enemies';
import { shuffle } from '../utils/gameLogic';

// 网格配置
export const GRID_ROWS = 15;
export const GRID_COLS = 7;

// 节点类型权重
const NODE_WEIGHTS = {
    BATTLE: 0.4,
    EVENT: 0.2,
    SHOP: 0.15,
    REST: 0.15,
    CHEST: 0.1
};

// 辅助函数：获取 Boss ID
const getBossId = (act) => {
    if (act === 1) return "Darius_BOSS";
    if (act === 2) return "Viego_BOSS";
    return "BelVeth_BOSS";
};

// 辅助函数：获取随机敌人
const getRandomEnemy = (act, usedEnemies = []) => {
    const enemies = Object.keys(ENEMY_POOL).filter(id => {
        const enemy = ENEMY_POOL[id];
        return enemy.act === act && 
               enemy.difficultyRank < 99 && 
               !usedEnemies.includes(id);
    });
    if (enemies.length === 0) {
        // 如果没有可用敌人，返回所有符合条件的敌人（不限制usedEnemies）
        const allActEnemies = Object.keys(ENEMY_POOL).filter(id => {
            const enemy = ENEMY_POOL[id];
            return enemy.act === act && enemy.difficultyRank < 99;
        });
        if (allActEnemies.length > 0) {
            return allActEnemies[Math.floor(Math.random() * allActEnemies.length)];
        }
        // 如果连这个都没有，返回第一个普通敌人
        const firstEnemy = Object.keys(ENEMY_POOL).find(id => ENEMY_POOL[id].difficultyRank < 99);
        return firstEnemy || "Katarina"; // 使用Katarina作为默认值
    }
    return enemies[Math.floor(Math.random() * enemies.length)];
};

// 生成网格地图数据
export const generateGridMap = (act, floorCount = 10, usedEnemies = []) => {
    const grid = [];
    
    // 初始化空网格 (15行 x 7列)
    for (let r = 0; r < GRID_ROWS; r++) {
        const row = [];
        for (let c = 0; c < GRID_COLS; c++) {
            row.push(null); // null 表示空地
        }
        grid.push(row);
    }

    const nodes = [];
    const nodeMap = new Map(); // 用于快速查找节点

    // 生成每一层的节点
    for (let r = 0; r < floorCount; r++) {
        // 倒序填充，row 0 是顶部(Boss)，row GRID_ROWS-1 是底部(Start)
        const currentRowIndex = GRID_ROWS - 1 - r;
        
        // 第一层(底部)只有1个起点节点，最后一层(Boss)只有1个Boss节点
        let nodeCount;
        let cols;
        if (r === 0) {
            nodeCount = 1; // 起点
            // 第一层节点固定在中间列，确保能解锁第二层的节点
            cols = [Math.floor(GRID_COLS / 2)];
        } else if (r === floorCount - 1) {
            nodeCount = 1; // Boss层
            cols = [Math.floor(GRID_COLS / 2)]; // Boss也居中
        } else {
            nodeCount = Math.floor(Math.random() * 3) + 2; // 中间层 2-4 个节点
            // 随机选择列位置
            const availableCols = Array.from({ length: GRID_COLS }, (_, i) => i);
            cols = shuffle([...availableCols]).slice(0, nodeCount);
        }

        // Boss 层处理（已在上面 cols 设置中处理）
        if (r === floorCount - 1) {
            const bossCol = cols[0]; // 使用 cols 中设定的列
            const bossNode = {
                id: `boss-${r}-${bossCol}`,
                row: r,
                col: bossCol,
                type: 'BOSS',
                status: 'LOCKED',
                enemyId: getBossId(act),
                next: [] // 没有下一层
            };
            grid[currentRowIndex][bossCol] = bossNode;
            nodes.push(bossNode);
            nodeMap.set(`${r}-${bossCol}`, bossNode);
            continue;
        }

        // 生成普通节点
        cols.forEach(col => {
            let type = 'BATTLE'; // 默认为战斗
            
            // 根据权重随机类型
            if (r > 0 && r < floorCount - 1) {
                const rand = Math.random();
                if (rand < NODE_WEIGHTS.BATTLE) type = 'BATTLE';
                else if (rand < NODE_WEIGHTS.BATTLE + NODE_WEIGHTS.EVENT) type = 'EVENT';
                else if (rand < NODE_WEIGHTS.BATTLE + NODE_WEIGHTS.EVENT + NODE_WEIGHTS.SHOP) type = 'SHOP';
                else if (rand < NODE_WEIGHTS.BATTLE + NODE_WEIGHTS.EVENT + NODE_WEIGHTS.SHOP + NODE_WEIGHTS.REST) type = 'REST';
                else type = 'CHEST';
            }

            const node = {
                id: `${r}-${col}`,
                row: r, // 逻辑层级 (0-9)
                col: col, // 列索引 (0-6)
                type: type,
                status: r === 0 ? 'AVAILABLE' : 'LOCKED', // 第一层解锁
                enemyId: type === 'BATTLE' ? getRandomEnemy(act, usedEnemies) : null,
                next: [] // 下一层可到达的节点ID
            };

            grid[currentRowIndex][col] = node;
            nodes.push(node);
            nodeMap.set(`${r}-${col}`, node);
        });
    }
    
    // 验证：确保第一层节点能解锁第二层的至少一个节点
    // 如果第二层没有节点在第一层节点的相邻位置，强制生成一个
    if (floorCount > 1) {
        const firstNode = nodes.find(n => n.row === 0);
        if (firstNode) {
            const secondRowNodes = nodes.filter(n => n.row === 1);
            const adjacentCols = [firstNode.col - 1, firstNode.col, firstNode.col + 1].filter(c => c >= 0 && c < GRID_COLS);
            const hasAdjacentNode = secondRowNodes.some(n => adjacentCols.includes(n.col));
            
            if (!hasAdjacentNode && secondRowNodes.length > 0) {
                // 如果没有相邻节点，移动一个第二层节点到相邻位置
                const nodeToMove = secondRowNodes[0];
                const targetCol = adjacentCols[Math.floor(adjacentCols.length / 2)]; // 选择中间的相邻列
                const oldGridRow = GRID_ROWS - 1 - nodeToMove.row;
                
                // 清除旧位置
                grid[oldGridRow][nodeToMove.col] = null;
                
                // 设置新位置
                nodeToMove.col = targetCol;
                nodeToMove.id = `${nodeToMove.row}-${targetCol}`;
                grid[oldGridRow][targetCol] = nodeToMove;
                nodeMap.delete(`${nodeToMove.row}-${nodeToMove.col}`);
                nodeMap.set(nodeToMove.id, nodeToMove);
            }
        }
    }

    // 建立连接关系：每个节点可以连接到下一层的相邻节点（正前、左前、右前）
    for (let r = 0; r < floorCount - 1; r++) {
        const currentRowIndex = GRID_ROWS - 1 - r;
        const nextRowIndex = GRID_ROWS - 1 - (r + 1);
        
        // 遍历当前层的所有节点
        for (let c = 0; c < GRID_COLS; c++) {
            const currentNode = grid[currentRowIndex][c];
            if (!currentNode) continue;

            // 查找下一层的相邻节点（正前、左前、右前）
            const nextCols = [
                c,      // 正前
                c - 1,  // 左前
                c + 1   // 右前
            ].filter(col => col >= 0 && col < GRID_COLS);

            nextCols.forEach(nextCol => {
                const nextNode = grid[nextRowIndex][nextCol];
                if (nextNode) {
                    currentNode.next.push(nextNode.id);
                }
            });
        }
    }

    return { grid, nodes, nodeMap };
};

