/**
 * GridMapView_v2.jsx - 六边形网格地图视图（重构版）
 * 
 * 核心改进：
 * - 使用六边形布局（HexagonNode组件）
 * - 优化"三选一"高亮逻辑（基于node.next）
 * - 改进迷雾效果（只显示可达节点）
 * - 添加路径连线（PathConnector组件）
 * - 支持拖拽查看全图
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import HexagonNode from './HexagonNode';
import PathConnector from './PathConnector';
import { offsetToPixel } from '../utils/hexagonGrid';
import { ACT_BACKGROUNDS } from '../data/constants';

const GridMapView_v2 = ({ mapData, onNodeSelect, currentFloor, act, activeNode }) => {
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const HEX_SIZE = 45; // 六边形大小
  const VIEW_WIDTH = 1200; // 视口宽度
  const VIEW_HEIGHT = 800; // 视口高度

  // 计算所有节点的渲染位置
  const nodePositions = useMemo(() => {
    if (!mapData || !mapData.nodes) return new Map();
    
    const positions = new Map();
    mapData.nodes.forEach(node => {
      const pos = offsetToPixel(node.row, node.col, HEX_SIZE);
      positions.set(node.id, {
        x: pos.x + VIEW_WIDTH / 2,
        y: pos.y + 100 // 顶部留白
      });
    });
    return positions;
  }, [mapData]);

  // 获取当前可选节点（三选一）
  const getAvailableChoices = () => {
    if (!mapData || !mapData.nodes) return [];
    
    // 如果有activeNode，返回其next节点
    if (activeNode && activeNode.next) {
      return activeNode.next
        .map(id => mapData.nodes.find(n => n.id === id))
        .filter(Boolean)
        .slice(0, 3); // 最多3个
    }
    
    // 否则返回当前层的AVAILABLE节点
    return mapData.nodes.filter(n => 
      n.row === currentFloor && n.status === 'AVAILABLE'
    );
  };

  const availableChoices = getAvailableChoices();
  const availableChoiceIds = new Set(availableChoices.map(n => n.id));

  // 判断节点是否处于迷雾中
  const isFogged = (node) => {
    if (!node) return true;
    
    // 已完成的节点总是可见
    if (node.status === 'COMPLETED') return false;
    
    // 当前可选节点不迷雾
    if (availableChoiceIds.has(node.id)) return false;
    
    // 当前层及以下可见（但是置灰）
    if (node.row <= currentFloor) return false;
    
    // 其他节点在迷雾中
    return true;
  };

  // 判断节点是否可点击
  const isClickable = (node) => {
    return availableChoiceIds.has(node.id);
  };

  // 判断节点是否高亮
  const isHighlighted = (node) => {
    return availableChoiceIds.has(node.id);
  };

  // 判断路径是否已探索
  const isPathExplored = (fromNode, toNode) => {
    return fromNode.status === 'COMPLETED' && 
           fromNode.next && 
           fromNode.next.includes(toNode.id);
  };

  // 判断路径是否高亮
  const isPathHighlighted = (fromNode, toNode) => {
    return activeNode && 
           activeNode.id === fromNode.id && 
           availableChoiceIds.has(toNode.id);
  };

  // 判断路径是否隐藏（迷雾中）
  const isPathHidden = (fromNode, toNode) => {
    return isFogged(fromNode) || isFogged(toNode);
  };

  // 鼠标拖拽逻辑
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - viewOffset.x,
      y: e.clientY - viewOffset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // 限制拖拽范围
    const maxOffset = 500;
    setViewOffset({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 节点点击处理
  const handleNodeClick = (node) => {
    if (isClickable(node)) {
      onNodeSelect(node);
    }
  };

  // 自动居中到当前节点
  const centerOnActiveNode = () => {
    if (!activeNode || !nodePositions.has(activeNode.id)) return;
    
    const pos = nodePositions.get(activeNode.id);
    setViewOffset({
      x: VIEW_WIDTH / 2 - pos.x,
      y: VIEW_HEIGHT / 2 - pos.y
    });
  };

  if (!mapData || !mapData.nodes || mapData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0c0c12] text-[#C8AA6E]">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">地图加载中...</p>
          <p className="text-sm text-slate-400">正在生成 ACT{act} 地图</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative flex flex-col items-center h-full w-full overflow-hidden bg-[#0c0c12]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: `url('${ACT_BACKGROUNDS[act]}')` }}
        />
      </div>

      {/* SVG地图容器 */}
      <motion.svg
        className="relative z-20 cursor-move"
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${viewOffset.x}, ${viewOffset.y})`}>
          {/* 渲染所有路径连线 */}
          {mapData.nodes.map(fromNode => {
            if (!fromNode.next || fromNode.next.length === 0) return null;
            
            return fromNode.next.map(toNodeId => {
              const toNode = mapData.nodes.find(n => n.id === toNodeId);
              if (!toNode) return null;
              
              const fromPos = nodePositions.get(fromNode.id);
              const toPos = nodePositions.get(toNode.id);
              
              return (
                <PathConnector
                  key={`path-${fromNode.id}-${toNodeId}`}
                  fromNode={fromNode}
                  toNode={toNode}
                  fromPosition={fromPos}
                  toPosition={toPos}
                  isExplored={isPathExplored(fromNode, toNode)}
                  isHighlighted={isPathHighlighted(fromNode, toNode)}
                  isHidden={isPathHidden(fromNode, toNode)}
                />
              );
            });
          })}

          {/* 渲染所有节点 */}
          {mapData.nodes.map(node => {
            const position = nodePositions.get(node.id);
            if (!position) return null;
            
            return (
              <HexagonNode
                key={node.id}
                node={node}
                position={position}
                size={HEX_SIZE}
                isClickable={isClickable(node)}
                isHighlighted={isHighlighted(node)}
                isFogged={isFogged(node)}
                onClick={() => handleNodeClick(node)}
              />
            );
          })}
        </g>
      </motion.svg>

      {/* 底部状态栏 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-30 flex justify-center items-end pb-4">
        <div className="text-[#C8AA6E] font-serif text-center space-y-1">
          <div className="text-lg font-bold">
            ACT {act} - 当前层数: {currentFloor + 1} / {mapData.totalFloors}
          </div>
          <div className="text-sm text-slate-400">
            拖拽查看全图 | 点击高亮节点前进
          </div>
        </div>
      </div>

      {/* 居中按钮 */}
      {activeNode && (
        <button
          onClick={centerOnActiveNode}
          className="absolute top-4 right-4 z-40 px-4 py-2 bg-[#C8AA6E] text-black rounded-lg font-bold hover:bg-[#F0E6D2] transition-colors"
        >
          居中视图
        </button>
      )}

      {/* 调试信息（开发模式） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 z-40 bg-black/80 text-white text-xs p-3 rounded-lg font-mono">
          <div>Active: {activeNode?.id || 'None'}</div>
          <div>Choices: {availableChoices.length}</div>
          <div>Offset: ({viewOffset.x.toFixed(0)}, {viewOffset.y.toFixed(0)})</div>
        </div>
      )}
    </div>
  );
};

export default GridMapView_v2;

