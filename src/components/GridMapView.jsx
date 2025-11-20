import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CDN_URL, ITEM_URL, PROFILEICON_URL, ACT_BACKGROUNDS } from '../data/constants';
import { ENEMY_POOL } from '../data/enemies';
import { GRID_ROWS, GRID_COLS } from '../data/gridMapLayout';

const GridMapView = ({ mapData, onNodeSelect, currentFloor, act, activeNode }) => {
    // 图标获取逻辑
    const getMapIcon = (node) => {
        if (!node) return null;

        if (node.type === 'BOSS') {
            if (act === 1) return `${CDN_URL}/img/champion/Darius.png`;
            if (act === 2) return `${CDN_URL}/img/champion/Viego.png`;
            if (act === 3) return `${CDN_URL}/img/champion/Belveth.png`;
        }
        if (node.type === 'REST') return `${ITEM_URL}/2003.png`; 
        if (node.type === 'SHOP') return `${ITEM_URL}/3400.png`; 
        if (node.type === 'EVENT') return `${ITEM_URL}/3340.png`; 
        if (node.type === 'CHEST') return `${ITEM_URL}/3400.png`; // 使用宝箱图标
        if (node.type === 'BATTLE' && node.enemyId) {
            const enemy = ENEMY_POOL[node.enemyId];
            return enemy?.avatar || enemy?.img || `${PROFILEICON_URL}/29.png`;
        }
        return null; 
    };

    // 判断节点是否被迷雾覆盖（参考 map.js 的 mapcan 逻辑）
    const isFogged = (node) => {
        if (!node) return true;
        // 如果节点在当前层或下一层（正前、左前、右前），不显示迷雾
        // 参考 map.js: mapcan 函数检查 (id-20)==(x) || (id-20)==(x.sub(1)) || (id-20)==(x.add(1))
        if (node.row <= currentFloor + 1) return false;
        return true;
    };
    
    // 判断节点是否可点击（参考 map.js 的 mapcan 逻辑：只能点击正前、左前、右前）
    // mapcan(x,y,id): if((id-20)==(x) || (id-20)==(x.sub(1)) || (id-20)==(x.add(1))){return true}
    // 在我们的实现中：id 对应 node.col，x 对应 activeNode.col（当前列位置）
    const canClickNode = (node) => {
        if (!node) return false;
        // 如果没有 activeNode，只能点击当前层的 AVAILABLE 节点
        if (!activeNode) {
            return node.row === currentFloor && node.status === 'AVAILABLE';
        }
        
        // 如果节点在当前层，检查是否是 AVAILABLE
        if (node.row === currentFloor) {
            return node.status === 'AVAILABLE';
        }
        
        // 如果节点在下一层，需要检查是否是相邻列（正前、左前、右前）
        // 参考 mapcan: (id-20)==(x) || (id-20)==(x.sub(1)) || (id-20)==(x.add(1))
        if (node.row === currentFloor + 1) {
            const colDiff = node.col - activeNode.col;
            // 正前(colDiff=0)、左前(colDiff=-1)、右前(colDiff=1)
            return Math.abs(colDiff) <= 1;
        }
        
        return false;
    };

    // 网格单元格渲染
    const renderCell = (rowIndex, colIndex) => {
        const node = mapData.grid[rowIndex][colIndex];

        if (!node) {
            return <div key={`${rowIndex}-${colIndex}`} className="w-16 h-16" />; // 空占位
        }

        const isAvailable = node.status === 'AVAILABLE';
        const isCompleted = node.status === 'COMPLETED';
        const isLocked = node.status === 'LOCKED';
        const isFog = isFogged(node);
        // 检查节点是否在可点击范围内（正前、左前、右前）- 参考 mapcan 逻辑
        const isInClickableRange = canClickNode(node);
        const iconUrl = getMapIcon(node);
        
        // 节点类型颜色（参考 map.js 的 mapsty 函数）
        const getNodeTypeColor = (node) => {
            if (!node) return 'border-slate-700';
            // 当前选中位置：红色边框（参考 mapsty: if((id-10) == player.map.x) return "#CE0000"）
            // 注意：参考库中 id-10 是当前层，id-20 是下一层
            if (activeNode && node.row === activeNode.row && node.col === activeNode.col) {
                return 'border-[#CE0000] bg-red-900/30';
            }
            // 根据节点类型返回颜色（参考 mapsty）
            // 精英怪(1): #801b1b, 商店(2): #fff200, 宝箱(3): #00ff88, 营火(4): #fe9750
            if (node.type === 'BOSS') return 'border-[#801b1b] bg-red-900/30'; // 精英怪颜色
            if (node.type === 'BATTLE') return 'border-slate-500 bg-slate-800/50';
            if (node.type === 'SHOP') return 'border-[#fff200] bg-yellow-900/30'; // 黄色
            if (node.type === 'CHEST') return 'border-[#00ff88] bg-green-900/30'; // 绿色
            if (node.type === 'EVENT') return 'border-purple-500 bg-purple-900/30';
            if (node.type === 'REST') return 'border-[#fe9750] bg-orange-900/30'; // 橙色
            // 可点击范围内的节点：白色边框（参考 mapsty: mapcan(...) ? '#FFFFFF' : '#666666'）
            if (isInClickableRange && !isFog) {
                return 'border-white bg-white/10';
            }
            // 不可点击的节点：灰色边框
            return 'border-[#666666]';
        };
        const typeColor = getNodeTypeColor(node);

        return (
            <div key={node.id} className="relative flex items-center justify-center w-16 h-16">
                <motion.button
                    whileHover={isInClickableRange ? { scale: 1.1 } : {}}
                    whileTap={isInClickableRange ? { scale: 0.9 } : {}}
                    onClick={() => isInClickableRange && onNodeSelect(node)}
                    disabled={!isInClickableRange}
                    className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-lg transition-all relative
                        ${isAvailable ? 'border-[#C8AA6E] ring-2 ring-[#C8AA6E]/50 z-20 brightness-110' : typeColor}
                        ${isCompleted ? 'opacity-50 grayscale' : ''}
                        ${isLocked && !isFog && isInClickableRange ? 'opacity-80' : ''}
                        ${isFog ? 'opacity-30 brightness-50' : ''}
                        ${!isInClickableRange && !isFog ? 'opacity-40' : ''}
                        ${isInClickableRange ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                >
                    {iconUrl && (
                        <img 
                            src={iconUrl} 
                            className="w-full h-full object-cover" 
                            alt={node.type}
                            onError={(e) => {
                                e.target.src = `${PROFILEICON_URL}/29.png`;
                            }}
                        />
                    )}
                    {isCompleted && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#C8AA6E] font-bold text-lg">
                            ✓
                        </div>
                    )}
                    {isFog && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <span className="text-slate-600 text-xs">?</span>
                        </div>
                    )}
                </motion.button>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center h-full w-full relative overflow-hidden bg-[#0c0c12]">
            {/* 背景 */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60" 
                    style={{ backgroundImage: `url('${ACT_BACKGROUNDS[act || 1]}')` }}
                />
            </div>

            {/* 网格容器 */}
            <div className="relative z-20 w-full h-full overflow-y-auto py-10 flex justify-center">
                <div 
                    className="grid gap-4" 
                    style={{ 
                        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                        width: `${GRID_COLS * 80}px` // 每列80px (64px + 16px gap)
                    }}
                >
                    {/* 渲染每一行、每一列 */}
                    {mapData.grid.map((row, rIndex) => 
                        row.map((_, cIndex) => renderCell(rIndex, cIndex))
                    )}
                </div>
            </div>
            
            {/* 底部状态栏 */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none z-30 flex justify-center items-end pb-4 text-[#C8AA6E] font-serif">
                当前层数: {currentFloor + 1} / 10
            </div>
        </div>
    );
};

export default GridMapView;

