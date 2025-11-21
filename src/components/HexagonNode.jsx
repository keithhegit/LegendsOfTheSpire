/**
 * HexagonNode.jsx - 六边形节点组件
 * 
 * 用于渲染单个地图节点，支持：
 * - SVG六边形形状
 * - 节点状态样式（LOCKED/AVAILABLE/COMPLETED）
 * - 节点类型图标（战斗/商店/事件/休息/宝箱/BOSS）
 * - 动画效果（hover/click）
 */

import React from 'react';
import { motion } from 'framer-motion';
import { generateHexagonPath } from '../utils/hexagonGrid';

const HexagonNode = ({ 
  node, 
  position, 
  size = 50, 
  isClickable = false,
  isHighlighted = false,
  isFogged = false,
  onClick 
}) => {
  if (!node) return null;

  const { x, y } = position;
  const hexPath = generateHexagonPath(x, y, size);
  
  // 节点状态样式
  const getNodeStyle = () => {
    const { type, status } = node;
    
    // 基础颜色（根据节点类型）
    let fillColor = '#1E2328'; // 默认深灰
    let strokeColor = '#3C3C3C'; // 默认边框
    let strokeWidth = 2;
    
    switch (type) {
      case 'START':
        fillColor = '#0A7B83';
        strokeColor = '#0BC5DE';
        break;
      case 'BOSS':
        fillColor = '#8B0000';
        strokeColor = '#FF0000';
        strokeWidth = 3;
        break;
      case 'BATTLE':
        fillColor = '#4A2F2F';
        strokeColor = '#FF6B35';
        break;
      case 'SHOP':
        fillColor = '#2F4A2F';
        strokeColor = '#F4C430';
        break;
      case 'REST':
        fillColor = '#2F2F4A';
        strokeColor = '#00CED1';
        break;
      case 'CHEST':
        fillColor = '#4A3C2F';
        strokeColor = '#FFD700';
        break;
      case 'EVENT':
        fillColor = '#3C2F4A';
        strokeColor = '#9370DB';
        break;
      default:
        break;
    }
    
    // 状态修饰
    if (status === 'COMPLETED') {
      fillColor = '#0F1419'; // 深色（已完成）
      strokeColor = '#555555';
    }
    
    if (isHighlighted) {
      strokeColor = '#C8AA6E'; // LOL金色高亮
      strokeWidth = 4;
    }
    
    // 迷雾效果
    const opacity = isFogged ? 0.3 : 1;
    
    return {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity
    };
  };
  
  // 获取节点图标URL
  const getNodeIcon = () => {
    if (isFogged && node.status !== 'COMPLETED') {
      return null; // 迷雾中不显示图标
    }
    
    const CDN_URL = 'https://ddragon.leagueoflegends.com/cdn/13.24.1';
    const ITEM_URL = `${CDN_URL}/img/item`;
    const PROFILEICON_URL = `${CDN_URL}/img/profileicon`;
    
    switch (node.type) {
      case 'BOSS':
        // 根据act显示不同BOSS头像
        const bossNames = { 1: 'Darius', 2: 'Viego', 3: 'Belveth' };
        return `${CDN_URL}/img/champion/${bossNames[node.act] || 'Darius'}.png`;
      case 'REST':
        return `${ITEM_URL}/2003.png`; // 血瓶
      case 'SHOP':
        return `${ITEM_URL}/3400.png`; // 金币
      case 'EVENT':
        return `${ITEM_URL}/3340.png`; // 问号
      case 'CHEST':
        return `${PROFILEICON_URL}/2065.png`; // 宝箱
      case 'BATTLE':
        if (node.enemyId) {
          // 显示敌人头像
          return `${CDN_URL}/img/champion/${node.enemyId.split('_')[0]}.png`;
        }
        return `${ITEM_URL}/1055.png`; // 剑（默认战斗图标）
      case 'START':
        return `${ITEM_URL}/2055.png`; // 起点标记
      default:
        return null;
    }
  };
  
  const nodeStyle = getNodeStyle();
  const iconUrl = getNodeIcon();
  
  return (
    <motion.g
      className={isClickable ? 'cursor-pointer' : ''}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.1 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: nodeStyle.opacity, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 六边形背景 */}
      <path
        d={hexPath}
        fill={nodeStyle.fill}
        stroke={nodeStyle.stroke}
        strokeWidth={nodeStyle.strokeWidth}
        className="transition-all duration-200"
      />
      
      {/* 节点图标 */}
      {iconUrl && (
        <image
          href={iconUrl}
          x={x - size * 0.6}
          y={y - size * 0.6}
          width={size * 1.2}
          height={size * 1.2}
          clipPath={`url(#hexClip-${node.id})`}
          opacity={node.status === 'COMPLETED' ? 0.5 : 0.9}
        />
      )}
      
      {/* Clip Path for Icon */}
      <defs>
        <clipPath id={`hexClip-${node.id}`}>
          <path d={hexPath} />
        </clipPath>
      </defs>
      
      {/* 已完成标记 */}
      {node.status === 'COMPLETED' && (
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill="#C8AA6E"
          fontSize="24"
          fontWeight="bold"
        >
          ✓
        </text>
      )}
      
      {/* 高亮光效 */}
      {isHighlighted && (
        <motion.path
          d={hexPath}
          fill="none"
          stroke="#C8AA6E"
          strokeWidth="2"
          opacity="0.5"
          animate={{
            strokeWidth: [2, 6, 2],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.g>
  );
};

export default HexagonNode;

