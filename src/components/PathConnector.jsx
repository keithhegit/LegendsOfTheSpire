/**
 * PathConnector.jsx - 路径连线组件
 * 
 * 用于在地图节点之间绘制连线，支持：
 * - SVG路径绘制（贝塞尔曲线）
 * - 已探索路径高亮
 * - 路径动画效果
 */

import React from 'react';
import { motion } from 'framer-motion';

const PathConnector = ({ 
  fromNode, 
  toNode, 
  fromPosition, 
  toPosition,
  isExplored = false, // 是否为已探索路径
  isHighlighted = false, // 是否高亮（可选路径）
  isHidden = false // 是否隐藏（迷雾中）
}) => {
  if (!fromPosition || !toPosition || isHidden) return null;

  const { x: x1, y: y1 } = fromPosition;
  const { x: x2, y: y2 } = toPosition;

  // 计算贝塞尔曲线控制点（使路径更自然）
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // 添加一些随机偏移，使路径不完全直线
  const offsetX = (Math.random() - 0.5) * 20;
  const offsetY = (Math.random() - 0.5) * 20;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;

  // 路径样式
  const getPathStyle = () => {
    let stroke = '#3C3C3C'; // 默认灰色
    let strokeWidth = 2;
    let opacity = 0.3;
    let strokeDasharray = '5,5'; // 虚线

    if (isExplored) {
      stroke = '#FF6B35'; // 橙色（已探索）
      strokeWidth = 3;
      opacity = 0.8;
      strokeDasharray = 'none'; // 实线
    }

    if (isHighlighted) {
      stroke = '#C8AA6E'; // 金色（高亮）
      strokeWidth = 4;
      opacity = 1;
      strokeDasharray = 'none';
    }

    return { stroke, strokeWidth, opacity, strokeDasharray };
  };

  const pathStyle = getPathStyle();

  // 生成SVG路径字符串
  const pathD = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

  return (
    <g>
      {/* 主路径 */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={pathStyle.stroke}
        strokeWidth={pathStyle.strokeWidth}
        strokeDasharray={pathStyle.strokeDasharray}
        opacity={pathStyle.opacity}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: pathStyle.opacity }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* 流动动画（仅已探索路径） */}
      {isExplored && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          strokeDasharray="10 20"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -30 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* 脉冲效果（仅高亮路径） */}
      {isHighlighted && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#C8AA6E"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </g>
  );
};

export default PathConnector;

