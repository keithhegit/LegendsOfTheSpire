import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_DATABASE } from '../../data/cards';

const Card = ({ cardId, index, totalCards, canPlay, onPlay }) => {
  const card = CARD_DATABASE[cardId];
  const [showDetail, setShowDetail] = useState(false);
  const lastTapRef = useRef(0);
  const touchStartYRef = useRef(0);
  
  // 堆叠逻辑计算
  const overlap = totalCards > 5 ? -40 : 10; 
  const rotation = (index - (totalCards - 1) / 2) * 3; // 扇形展开角度
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * 5; // 扇形弧度
  
  // 处理点击事件
  const handleClick = (e) => {
    e.stopPropagation();
    if (canPlay) {
      onPlay(index);
    }
  };
  
  // 处理双击查看详情
  const handleDoubleTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
      setShowDetail(true);
      setTimeout(() => setShowDetail(false), 2000);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };
  
  // 处理触摸开始（用于滑动出牌）
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  
  // 处理触摸结束（检测滑动）
  const handleTouchEnd = (e) => {
    if (!canPlay) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    
    // 向上滑动超过100px时出牌
    if (deltaY > 100) {
      onPlay(index);
    }
  };
  
  return (
    <motion.div
      layout // 自动处理布局变化动画
      initial={{ y: 100, opacity: 0, scale: 0.5 }}
      animate={{ y: yOffset, opacity: 1, scale: 1, rotate: rotation }}
      exit={{ y: -100, opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ 
        marginLeft: index === 0 ? 0 : `${overlap}px`, 
        zIndex: index,
        transformOrigin: "bottom center",
        position: 'relative'
      }}
      // 悬停特效：放大、上移、高亮边框
      whileHover={canPlay ? { 
        scale: 1.25, 
        y: -60, 
        zIndex: 100, 
        rotate: 0,
        boxShadow: "0 0 30px rgba(200, 170, 110, 0.8)"
      } : {}}
      // 点击事件
      onClick={handleClick}
      // 触摸事件（移动端支持）
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
      // 拖拽支持（滑动出牌）
      drag={canPlay ? "y" : false}
      dragConstraints={{ top: -300, bottom: 0 }}
      dragSnapToOrigin={true}
      onDragEnd={(event, info) => { 
        if (info.offset.y < -150 && canPlay) { 
          onPlay(index); 
        } 
      }}
      
      className={`
        w-40 h-60 bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl 
        transition-all duration-200
        ${canPlay ? 'border-[#C8AA6E] cursor-pointer hover:border-[#F0E6D2] hover:shadow-[0_0_30px_rgba(200,170,110,0.8)] active:cursor-grabbing' : 'border-slate-700 opacity-60 cursor-not-allowed'}
      `}
    >
      {/* 卡牌详情弹窗 */}
      {showDetail && (
        <div className="absolute inset-0 z-50 bg-black/95 border-4 border-[#C8AA6E] rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-[#C8AA6E] mb-2">{card.name}</div>
          <div className="text-sm text-[#A09B8C] mb-4 text-center">{card.description}</div>
          <div className="flex gap-4 text-sm">
            {card.value && <div className="text-red-400">攻击: {card.value}</div>}
            {card.block && <div className="text-blue-400">防御: {card.block}</div>}
            {card.effectValue && <div className="text-purple-400">效果: {card.effectValue}</div>}
          </div>
        </div>
      )}
      {/* 卡牌图片 */}
      <div className="w-full h-40 bg-black overflow-hidden relative pointer-events-none">
        <img src={card.img} className="w-full h-full object-cover opacity-90" alt={card.name} />
        <div className="absolute top-2 left-2 w-8 h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-lg shadow-md">
          {card.cost}
        </div>
      </div>
      
      {/* 卡牌文本 */}
      <div className="flex-1 p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]">
        <div className="text-sm font-bold text-[#F0E6D2] mb-1 line-clamp-1">{card.name}</div>
        <div className="text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-2">
          {card.description}
        </div>
        <div className="mt-auto text-[9px] text-slate-500 uppercase font-bold tracking-wider">
          {card.type}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;

