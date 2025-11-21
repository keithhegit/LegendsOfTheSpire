/**
 * 六边形网格工具库
 * 基于 Axial 坐标系（q, r）和 Offset 坐标系（row, col）
 * 参考: https://www.redblobgames.com/grids/hexagons/
 */

// 六边形尺寸配置
export const HEX_SIZE = 50; // 六边形外接圆半径
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

/**
 * Offset坐标 -> Axial坐标
 * 使用 "odd-r" 布局（奇数行向右偏移）
 */
export function offsetToAxial(row, col) {
  const q = col - Math.floor((row - (row & 1)) / 2);
  const r = row;
  return { q, r };
}

/**
 * Axial坐标 -> Offset坐标
 */
export function axialToOffset(q, r) {
  const col = q + Math.floor((r - (r & 1)) / 2);
  const row = r;
  return { row, col };
}

/**
 * Axial坐标 -> Pixel坐标（用于SVG渲染）
 * 返回六边形中心点的像素坐标
 */
export function axialToPixel(q, r, hexSize = HEX_SIZE) {
  const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = hexSize * (3 / 2 * r);
  return { x, y };
}

/**
 * Offset坐标 -> Pixel坐标（快捷方法）
 * 使用 flat-top 布局（平顶朝上）
 */
export function offsetToPixel(row, col, hexSize = HEX_SIZE) {
  // Flat-top hexagon layout
  const isOddRow = row % 2 === 1;
  const x = hexSize * Math.sqrt(3) * (col + (isOddRow ? 0.5 : 0));
  const y = hexSize * 1.5 * row;
  return { x, y };
}

/**
 * 获取六边形的6个邻居（Offset坐标系）
 * 使用 "odd-r" 布局 + flat-top hexagon
 * 
 * Flat-top 邻居方向：
 *   NW  N  NE
 *    \  |  /
 *   W - X - E
 *    /  |  \
 *   SW  S  SE
 */
export function getHexNeighbors(row, col, maxRows = 30, maxCols = 7) {
  const isOddRow = row % 2 === 1;
  
  // Flat-top布局的邻居偏移（odd-r坐标系）
  // 奇数行向右偏移0.5个单位
  const neighbors = isOddRow
    ? [
        [row - 1, col],     [row - 1, col + 1], // N, NE (上方两个)
        [row, col - 1],     [row, col + 1],     // W, E (左右两个)
        [row + 1, col],     [row + 1, col + 1]  // S, SE (下方两个)
      ]
    : [
        [row - 1, col - 1], [row - 1, col],     // NW, N (上方两个)
        [row, col - 1],     [row, col + 1],     // W, E (左右两个)
        [row + 1, col - 1], [row + 1, col]      // SW, S (下方两个)
      ];
  
  // 过滤出边界内的邻居
  return neighbors.filter(([r, c]) => 
    r >= 0 && r < maxRows && c >= 0 && c < maxCols
  );
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
  const isOddRow = row % 2 === 1;
  
  let targetRow, targetCol;
  
  switch (direction) {
    case 'forward': // 正前方（下一行，同列或相邻列）
      targetRow = row + 1;
      targetCol = col;
      break;
      
    case 'forward-left': // 左前方
      targetRow = row + 1;
      targetCol = isOddRow ? col : col - 1;
      break;
      
    case 'forward-right': // 右前方
      targetRow = row + 1;
      targetCol = isOddRow ? col + 1 : col;
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
 * @param {number} size - 六边形大小
 * @returns {string} - SVG path 字符串
 */
export function generateHexagonPath(centerX, centerY, size = HEX_SIZE) {
  const points = [];
  
  // 生成6个顶点（flat-top布局，从3点钟方向开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i; // 0度起始，平顶朝上
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

