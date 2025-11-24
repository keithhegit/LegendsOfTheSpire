/**
 * 六边形自由探索地图视图
 * - 横版布局（左起右终）
 * - 战争迷雾：未探索区域以迷雾覆盖但仍显示结构
 * - 支持拖拽、居中、放大节点图标
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ITEM_URL, PROFILEICON_URL, CDN_URL } from '../data/constants';
import { ENEMY_POOL } from '../data/enemies';
import { getHexNeighbors, offsetToPixelRotated } from '../utils/hexagonGrid';

const GridMapView = ({ mapData, onNodeSelect, activeNode, currentFloor, act, lockedChoices = new Set() }) => {
  const containerRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exploredNodes, setExploredNodes] = useState(new Set());
  
  const HEX_SIZE = 45;
  const ICON_SCALE = 1.15;
  const MIN_VIEW_WIDTH = 1200;
  const MIN_VIEW_HEIGHT = 800;
  const PADDING = 120;

  const { positionMap, bounds, contentWidth, contentHeight } = useMemo(() => {
    if (!mapData) {
      return {
        positionMap: new Map(),
        bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
        contentWidth: MIN_VIEW_WIDTH,
        contentHeight: MIN_VIEW_HEIGHT,
      };
    }

    const map = new Map();
    const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };

    const GRID_COLS = mapData.grid?.[0]?.length || 11;
    mapData.nodes.forEach(node => {
      const pos = offsetToPixelRotated(node.row, node.col, mapData.totalFloors, GRID_COLS, HEX_SIZE);
      map.set(`${node.row}-${node.col}`, pos);
      b.minX = Math.min(b.minX, pos.x);
      b.maxX = Math.max(b.maxX, pos.x);
      b.minY = Math.min(b.minY, pos.y);
      b.maxY = Math.max(b.maxY, pos.y);
    });

    if (map.size === 0) {
      b.minX = b.minY = 0;
      b.maxX = b.maxY = 1;
    }

    const width = b.maxX - b.minX + HEX_SIZE * 2;
    const height = b.maxY - b.minY + HEX_SIZE * 2;

    return {
      positionMap: map,
      bounds: b,
      contentWidth: width,
      contentHeight: height,
    };
  }, [mapData]);

  const VIEW_WIDTH = Math.max(MIN_VIEW_WIDTH, contentWidth + PADDING * 2);
  const VIEW_HEIGHT = Math.max(MIN_VIEW_HEIGHT, contentHeight + PADDING * 2);
  
  // 初次加载时自动居中整张地图，方便玩家预览全貌
  useEffect(() => {
    if (!mapData) return;
    const offsetX = VIEW_WIDTH / 2 - (contentWidth / 2 + PADDING);
    const offsetY = VIEW_HEIGHT / 2 - (contentHeight / 2 + PADDING);
    setDragOffset({ x: offsetX, y: offsetY });
  }, [mapData, contentWidth, contentHeight, VIEW_WIDTH, VIEW_HEIGHT]);
  
  useEffect(() => {
    if (mapData && mapData.startNode && exploredNodes.size === 0) {
      setExploredNodes(new Set([`${mapData.startNode.row}-${mapData.startNode.col}`]));
    }
  }, [mapData]);
  
  useEffect(() => {
    if (activeNode) {
      setExploredNodes(prev => new Set([...prev, `${activeNode.row}-${activeNode.col}`]));
    }
  }, [activeNode]);
  
  if (!mapData || !mapData.grid) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#C8AA6E] text-xl">地图数据加载中...</div>
      </div>
    );
  }
  
  const { grid, totalFloors, startNode, bossNode } = mapData;
  const GRID_COLS = grid[0]?.length || 11;
  
  const getAvailableNodes = () => {
    if (!activeNode) return [];
    
    const neighbors = getHexNeighbors(activeNode.row, activeNode.col, totalFloors, GRID_COLS);
    const allAvailable = [];
    
    for (const [r, c] of neighbors) {
      const neighbor = grid[r][c];
      if (!neighbor) continue;
      
      const nodeKey = `${r}-${c}`;
      if (exploredNodes.has(nodeKey)) continue;
      if (lockedChoices.has(nodeKey)) continue;
      allAvailable.push(neighbor);
    }
    
    if (allAvailable.length <= 3) {
      return allAvailable;
    }
    
    const shuffled = [...allAvailable].sort((a, b) => {
      const seedA = `${a.row}-${a.col}`;
      const seedB = `${b.row}-${b.col}`;
      return seedA.localeCompare(seedB);
    });
    
    const hash = (activeNode.row * 1000 + activeNode.col) % shuffled.length;
    const selected = [];
    for (let i = 0; i < 3; i++) {
      selected.push(shuffled[(hash + i) % shuffled.length]);
    }
    
    return selected;
  };
  
  const getLockedNodes = () => {
    if (!activeNode) return new Set();
    
    const neighbors = getHexNeighbors(activeNode.row, activeNode.col, totalFloors, GRID_COLS);
    const allAvailable = [];
    
    for (const [r, c] of neighbors) {
      const neighbor = grid[r][c];
      if (neighbor && !exploredNodes.has(`${r}-${c}`)) {
        allAvailable.push(neighbor);
      }
    }
    
    if (allAvailable.length <= 3) {
      return new Set();
    }
    
    const selected = getAvailableNodes();
    const selectedSet = new Set(selected.map(n => `${n.row}-${n.col}`));
    
    const locked = new Set();
    for (const node of allAvailable) {
      const key = `${node.row}-${node.col}`;
      if (!selectedSet.has(key)) {
        locked.add(key);
      }
    }
    
    return locked;
  };
  
  const getVisibleNodes = () => {
    const visible = new Set();
    
    for (const key of exploredNodes) {
      visible.add(key);
      
      const [row, col] = key.split('-').map(Number);
      const neighbors = getHexNeighbors(row, col, totalFloors, GRID_COLS);
      
      for (const [r, c] of neighbors) {
        if (grid[r][c]) {
          visible.add(`${r}-${c}`);
        }
      }
    }
    
    return visible;
  };
  
  const availableNodes = getAvailableNodes();
  const availableSet = new Set(availableNodes.map(n => `${n.row}-${n.col}`));
  const lockedSet = getLockedNodes();
  const allLockedSet = new Set([...lockedSet, ...Array.from(lockedChoices).map(key => typeof key === 'string' ? key : `${key.row}-${key.col}`)]);
  const visibleSet = getVisibleNodes();
  
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
    if (node.type === 'CHEST') return `${PROFILEICON_URL}/2065.png`;
    if (node.type === 'BATTLE' && node.enemyId) {
      return ENEMY_POOL[node.enemyId]?.avatar || `${PROFILEICON_URL}/29.png`;
    }
    return null;
  };
  
  const getNodeColor = (node) => {
    if (node.row === startNode.row && node.col === startNode.col) return '#4ade80';
    if (node.row === bossNode.row && node.col === bossNode.col) return '#ef4444';
    
    switch (node.type) {
      case 'BATTLE': return '#dc2626';
      case 'SHOP': return '#f59e0b';
      case 'EVENT': return '#3b82f6';
      case 'REST': return '#10b981';
      case 'CHEST': return '#8b5cf6';
      default: return '#6b7280';
    }
  };
  
  const centerMap = () => {
    if (!activeNode) return;
    
    const pos = positionMap.get(`${activeNode.row}-${activeNode.col}`);
    if (!pos) return;
    const nodeX = pos.x - bounds.minX + PADDING;
    const nodeY = pos.y - bounds.minY + PADDING;
    setDragOffset({
      x: VIEW_WIDTH / 2 - nodeX,
      y: VIEW_HEIGHT / 2 - nodeY
    });
  };
  
  const renderHexNode = (node) => {
    const key = `${node.row}-${node.col}`;
    const pos = positionMap.get(key);
    if (!pos) return null;
    
    const isExplored = exploredNodes.has(key);
    const isAvailable = availableSet.has(key);
    const isLocked = allLockedSet.has(key);
    const isCurrent = activeNode && node.row === activeNode.row && node.col === activeNode.col;
    const isVisible = visibleSet.has(key);
    const isFogged = !isVisible;
    
    const x = pos.x - bounds.minX + PADDING + dragOffset.x;
    const y = pos.y - bounds.minY + PADDING + dragOffset.y;
    
    const color = getNodeColor(node);
    const icon = getMapIcon(node);
    
    const hexPath = Array.from({ length: 6 }, (_, i) => {
      const angle = Math.PI / 3 * i;
      const hx = HEX_SIZE * 0.85 * Math.cos(angle);
      const hy = HEX_SIZE * 0.85 * Math.sin(angle);
      return `${hx},${hy}`;
    }).join(' ');
    
    return (
      <g key={key} transform={`translate(${x}, ${y})`}>
        {isExplored && (() => {
          const neighbors = getHexNeighbors(node.row, node.col, totalFloors, GRID_COLS);
          return neighbors.map(([r, c]) => {
            const neighbor = grid[r][c];
            if (!neighbor || !exploredNodes.has(`${r}-${c}`)) return null;
            
            const nPos = positionMap.get(`${r}-${c}`);
            if (!nPos) return null;
            const nx = nPos.x - bounds.minX + PADDING + dragOffset.x;
            const ny = nPos.y - bounds.minY + PADDING + dragOffset.y;
            
            return (
              <line
                key={`${key}-${r}-${c}`}
                x1={0}
                y1={0}
                x2={nx - x}
                y2={ny - y}
                stroke="rgba(200, 170, 110, 0.3)"
                strokeWidth="2"
              />
            );
          });
        })()}
        
        <polygon
          points={hexPath}
          fill={
            isFogged
              ? 'rgba(5, 8, 25, 0.9)'
              : isExplored
                ? 'rgba(255,255,255,0.1)'
                : color
          }
          fillOpacity={isFogged ? 1 : (isExplored ? 1 : (isAvailable ? 0.8 : (isLocked ? 0.2 : 0.3)))}
          stroke={
            isFogged
              ? 'rgba(90, 100, 140, 0.35)'
              : isCurrent ? '#fff' : 
                isAvailable ? '#C8AA6E' : 
                isLocked ? 'rgba(100,100,100,0.5)' : 
                'rgba(255,255,255,0.2)'
          }
          strokeWidth={isCurrent ? 4 : (isAvailable ? 3 : 1)}
          style={{ cursor: (!isFogged && isAvailable && !isLocked) ? 'pointer' : 'default' }}
          onClick={() => {
            if (!isFogged && isAvailable && !isLocked) {
              onNodeSelect(node);
            }
          }}
        />
        
        {isFogged && (
          <polygon
            points={hexPath}
            fill="url(#fogGradient)"
            opacity={0.85}
            stroke="none"
          />
        )}
        
        {icon && (
          <image
            href={icon}
            x={-(HEX_SIZE * ICON_SCALE) / 2}
            y={-(HEX_SIZE * ICON_SCALE) / 2}
            width={HEX_SIZE * ICON_SCALE}
            height={HEX_SIZE * ICON_SCALE}
            clipPath="url(#hexClip)"
            opacity={
              isFogged ? 0 :
              isExplored ? 0.6 : (isAvailable ? 1 : (isLocked ? 0.2 : 0.4))
            }
            pointerEvents="none"
          />
        )}
        
        {isLocked && !isExplored && !isFogged && (
          <text
            x="0"
            y="0"
            fill="rgba(150,150,150,0.8)"
            fontSize="20"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
          >
            ✕
          </text>
        )}
        
        {isExplored && node !== activeNode && !isFogged && (
          <text
            x="0"
            y="0"
            fill="#C8AA6E"
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
          >
            ✓
          </text>
        )}
      </g>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#0a0e27]"
      style={{ width: VIEW_WIDTH, height: VIEW_HEIGHT, margin: '0 auto' }}
    >
      <svg
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => {
          setIsDragging(true);
          e.currentTarget.dataset.startX = e.clientX - dragOffset.x;
          e.currentTarget.dataset.startY = e.clientY - dragOffset.y;
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          const startX = parseFloat(e.currentTarget.dataset.startX);
          const startY = parseFloat(e.currentTarget.dataset.startY);
          setDragOffset({
            x: e.clientX - startX,
            y: e.clientY - startY
          });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <defs>
          <clipPath id="hexClip">
            <polygon points={Array.from({ length: 6 }, (_, i) => {
              const angle = Math.PI / 3 * i;
              const hx = HEX_SIZE * 0.5 * Math.cos(angle);
              const hy = HEX_SIZE * 0.5 * Math.sin(angle);
              return `${hx},${hy}`;
            }).join(' ')} />
          </clipPath>
          <linearGradient id="fogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(8,10,26,0.9)" />
            <stop offset="100%" stopColor="rgba(3,5,15,0.95)" />
          </linearGradient>
        </defs>
        
        {mapData.nodes.map(node => renderHexNode(node))}
      </svg>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={centerMap}
        className="absolute bottom-4 right-4 bg-[#C8AA6E] text-[#0a0e27] px-4 py-2 rounded-lg font-bold shadow-lg"
      >
        🎯 居中地图
      </motion.button>
      
      <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded-lg border border-[#C8AA6E]/30">
        <div className="text-[#C8AA6E] text-sm">
          <div>已探索: {exploredNodes.size} / {mapData.nodes.length}</div>
          <div>可选方向: {availableNodes.length}</div>
        </div>
      </div>
    </div>
  );
};

export default GridMapView;

