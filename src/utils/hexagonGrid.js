/**
 * 六边形网格工具库
 * 基于 Axial 坐标系（q, r）和 Offset 坐标系（row, col）
 * 参考: https://www.redblobgames.com/grids/hexagons/
 */

// 六边形尺寸配置（flat-top）
export const HEX_SIZE = 50; // 外接圆半径
export const HEX_WIDTH = HEX_SIZE * 2;
export const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

/**
 * Offset坐标 -> Axial坐标
 * 我们将 row 映射为 r，col 映射为 q（轴向坐标系）
 */
export function offsetToAxial(row, col) {
  return { q: col, r: row };
}

/**
 * Axial坐标 -> Offset坐标
 */
export function axialToOffset(q, r) {
  return { row: r, col: q };
}

/**
 * Axial坐标 -> Pixel坐标（用于SVG渲染）
 * 返回六边形中心点的像素坐标
 */
export function axialToPixel(q, r, hexSize = HEX_SIZE) {
  // flat-top axial → pixel
  const x = hexSize * (3 / 2 * q);
  const y = hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

/**
 * Offset坐标 -> Pixel坐标（快捷方法）
 * 使用 flat-top 布局（平顶朝上）
 * 
 * Flat-top 六边形尺寸定义：
 * - hexSize = 外接圆半径 (radius)
 * - 宽度 = hexSize * 2
 * - 高度 = hexSize * sqrt(3)
 * - 水平间距 = hexSize * 2 * 0.75 = hexSize * 1.5
 * - 垂直间距 = hexSize * sqrt(3)
 */
export function offsetToPixel(row, col, hexSize = HEX_SIZE) {
  const { q, r } = offsetToAxial(row, col);
  return axialToPixel(q, r, hexSize);
}

/**
 * 获取六边形的6个邻居（Offset坐标系）
 * 使用轴向坐标的6个方向向量
 */
export function getHexNeighbors(row, col, maxRows = 30, maxCols = 7) {
  const directions = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];

  const neighbors = directions.map(([dq, dr]) => [row + dr, col + dq]);
  
  return neighbors.filter(([r, c]) => r >= 0 && r < maxRows && c >= 0 && c < maxCols);
}

/**
 * 获取指定方向的邻居（用于"三选一"逻辑）
 * @param {number} row - 当前行
 * @param {number} col - 当前列
 * @param {string} direction - 方向：'forward-left' | 'forward' | 'forward-right'
 * @param {number} maxRows - 最大行数
 * @param {number} maxCols - 最大列数
 * @returns {[number, number] | null} - [row, col] 或 null（如果越界）
 */
export function getNeighborInDirection(row, col, direction, maxRows = 30, maxCols = 7) {
  let targetRow, targetCol;
  
  switch (direction) {
    case 'forward': // 我们约定向下（row + 1）
      targetRow = row + 1;
      targetCol = col;
      break;
    case 'forward-left':
      targetRow = row + 1;
      targetCol = col - 1;
      break;
    case 'forward-right':
      targetRow = row;
      targetCol = col + 1;
      break;
      
    default:
      return null;
  }
  
  // 检查边界
  if (targetRow >= 0 && targetRow < maxRows && targetCol >= 0 && targetCol < maxCols) {
    return [targetRow, targetCol];
  }
  
  return null;
}

/**
 * 计算两个六边形节点之间的距离（Axial坐标系）
 * 使用六边形曼哈顿距离
 */
export function hexDistance(row1, col1, row2, col2) {
  const { q: q1, r: r1 } = offsetToAxial(row1, col1);
  const { q: q2, r: r2 } = offsetToAxial(row2, col2);
  
  // Axial 距离公式
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  
  return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(s1 - s2)) / 2;
}

/**
 * 生成六边形SVG路径字符串（用于渲染）
 * @param {number} centerX - 中心点X坐标
 * @param {number} centerY - 中心点Y坐标
 * @param {number} size - 六边形大小（外接圆半径）
 * @returns {string} - SVG path 字符串
 */
export function generateHexagonPath(centerX, centerY, size = HEX_SIZE) {
  const points = [];
  
  // 生成6个顶点（flat-top布局）
  // Flat-top: 顶点从右侧开始，角度偏移0度
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i; // 0, 60, 120, 180, 240, 300
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = centerX + size * Math.cos(angleRad);
    const y = centerY + size * Math.sin(angleRad);
    points.push([x, y]);
  }
  
  // 构建SVG path
  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  ).join(' ') + ' Z';
  
  return pathData;
}

/**
 * 检查两个六边形节点是否相邻
 */
export function areHexagonsAdjacent(row1, col1, row2, col2) {
  return hexDistance(row1, col1, row2, col2) === 1;
}

/**
 * 将坐标旋转90度（逆时针），用于横版布局
 * 原：row（垂直向下），col（水平向右）
 * 转后：row（水平向右），col（垂直向下）
 * 
 * 注意：这个函数用于渲染时的坐标转换，不改变内部逻辑
 * 旋转后：起点在左边（row=0），终点在右边（row=maxCols-1）
 * @param {number} row - 原始row（垂直方向）
 * @param {number} col - 原始col（水平方向）
 * @param {number} maxRows - 原始最大行数
 * @param {number} maxCols - 原始最大列数
 * @returns {{row: number, col: number}} - 旋转后的坐标
 */
export function rotate90CCW(row, col, maxRows, maxCols) {
  // 逆时针旋转90度：
  // 原row（垂直）→ 新col（垂直，保持不变）
  // 原col（水平）→ 新row（水平，保持不变）
  // 但需要调整：起点在左边，终点在右边
  return {
    row: col,  // 原col变成新row（水平方向）
    col: row   // 原row变成新col（垂直方向）
  };
}

/**
 * 旋转后的坐标转像素（横版布局）
 * @param {number} row - 原始row（垂直方向）
 * @param {number} col - 原始col（水平方向）
 * @param {number} maxRows - 原始最大行数
 * @param {number} maxCols - 原始最大列数
 * @param {number} hexSize - 六边形大小
 * @returns {{x: number, y: number}} - 像素坐标
 */
export function offsetToPixelRotated(row, col, maxRows, maxCols, hexSize = HEX_SIZE) {
  // 旋转90度：新row = 原col, 新col = 原row
  // 旋转后，row是水平方向（从左到右），col是垂直方向（从上到下）
  // 对于flat-top六边形：
  // - 水平方向（row）：使用 hexSize * 1.5 的间距
  // - 垂直方向（col）：使用 hexSize * sqrt(3) 的间距
  const rotatedRow = col;  // 原col变成水平方向
  const rotatedCol = row;  // 原row变成垂直方向
  
  const x = hexSize * 1.5 * rotatedRow;
  const y = hexSize * Math.sqrt(3) * rotatedCol;
  return { x, y };
}

