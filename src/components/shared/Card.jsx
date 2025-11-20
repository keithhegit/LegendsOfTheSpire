import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_DATABASE } from '../../data/cards';
import { useIsMobile } from '../../hooks/useIsMobile';

const Card = ({ cardId, index, totalCards, canPlay, onPlay, cardUpgrades = {}, isMobile: isMobileProp }) => {
  const card = CARD_DATABASE[cardId];
  const [showDetail, setShowDetail] = useState(false);
  const lastTapRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileHook;
  
  // 应用卡牌升级效果
  const upgrade = cardUpgrades[cardId] || {};
  const displayValue = card.value ? (card.value + (upgrade.value || 0)) : null;
  const displayBlock = card.block ? (card.block + (upgrade.block || 0)) : null;
  const displayEffectValue = card.effectValue ? (card.effectValue + (upgrade.effectValue || 0)) : null;
  
  // 移动端堆叠算法优化：大幅增加负边距，确保6张牌能塞进手机屏幕
  const overlap = (i) => {
    if (i === 0) return 0;
    // 移动端：根据卡牌数量动态调整重叠距离，确保5-6张卡都能看到
    if (isMobile) {
      if (totalCards >= 6) return -32; // 6张牌时重叠更多
      if (totalCards >= 5) return -28; // 5张牌
      if (totalCards >= 4) return -24; // 4张牌
      return -15; // 3张以下
    }
    // 桌面端：较宽松
    if (totalCards > 5) return -50;
    if (totalCards > 4) return -30;
    return 10;
  };
  
  const rotation = (index - (totalCards - 1) / 2) * (isMobile ? 1.5 : 3); // 移动端旋转角度更小
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * (isMobile ? 2 : 6);
  
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
  
  // 长按查看详情
  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);
  
  // 处理触摸开始（用于滑动出牌和长按）
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    isLongPressRef.current = false;
    
    // 长按计时器（500ms）
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setShowDetail(true);
      setTimeout(() => setShowDetail(false), 3000);
    }, 500);
  };
  
  // 处理触摸结束（检测滑动）
  const handleTouchEnd = (e) => {
    // 清除长按计时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // 如果是长按，不触发出牌
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    
    if (!canPlay) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    
    // 向上滑动超过80px时出牌（降低阈值，更容易触发）
    if (deltaY > 80) {
      onPlay(index);
    }
  };
  
  // 处理触摸取消
  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    isLongPressRef.current = false;
  };
  
  return (
    <motion.div
      layout // 自动处理布局变化动画
      initial={{ y: 100, opacity: 0, scale: 0.5 }}
      animate={{ y: yOffset, opacity: 1, scale: 1, rotate: rotation }}
      exit={{ y: -100, opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ 
        marginLeft: `${overlap(index)}px`, 
        zIndex: index,
        transformOrigin: "bottom center",
        position: 'relative',
        touchAction: 'none' // 关键：防止移动端拖拽时触发页面滚动
      }}
      // 悬停特效：放大、上移、高亮边框
      whileHover={canPlay ? { 
        scale: 1.1, 
        y: -50, 
        zIndex: 100, 
        rotate: 0
      } : {}}
      whileTap={canPlay ? { 
        scale: 1.1, 
        y: -50, 
        zIndex: 100, 
        rotate: 0 
      } : {}}
      // 点击事件
      onClick={handleClick}
      // 触摸事件（移动端支持）
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onDoubleClick={handleDoubleTap}
      // 拖拽支持（滑动出牌）- 优化触控体验
      drag={canPlay ? "y" : false}
      dragConstraints={{ top: -300, bottom: 0 }}
      dragSnapToOrigin={true}
      dragElastic={0.2} // 取消惯性，让拖拽手感更"跟手"
      whileDrag={{ 
        scale: 1.2, // 拖拽时明显放大
        zIndex: 100, // 提高层级，防止被其他牌遮挡
        rotate: 0 // 拖拽时取消旋转
      }}
      onDragEnd={(event, info) => { 
        // 移动端判定阈值更小 (-80px), PC 端 (-150px)
        const threshold = isMobile ? -80 : -150;
        if (info.offset.y < threshold && canPlay) { 
          onPlay(index); 
        } 
      }}
      
      className={`
        w-24 h-36 md:w-40 md:h-60 
        bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl 
        transition-all duration-200
        ${canPlay ? 'border-[#C8AA6E] cursor-grab active:cursor-grabbing' : 'border-slate-700 opacity-60 cursor-not-allowed'}
      `}
    >
      {/* 卡牌详情弹窗 */}
      {showDetail && (
        <div className="absolute inset-0 z-50 bg-black/95 border-4 border-[#C8AA6E] rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-[#C8AA6E] mb-2">{card.name}</div>
          <div className="text-sm text-[#A09B8C] mb-4 text-center">{card.description}</div>
          <div className="flex gap-4 text-sm">
            {displayValue !== null && <div className="text-red-400">攻击: {displayValue}</div>}
            {displayBlock !== null && <div className="text-blue-400">防御: {displayBlock}</div>}
            {displayEffectValue !== null && <div className="text-purple-400">效果: {displayEffectValue}</div>}
          </div>
        </div>
      )}
      {/* 卡牌图片 */}
      <div className="w-full h-24 md:h-36 bg-black overflow-hidden relative pointer-events-none">
        <img src={card.img} className="w-full h-full object-cover opacity-90" alt={card.name} />
        <div className="absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-xs md:text-sm shadow-md">
          {card.cost}
        </div>
      </div>
      
      {/* 卡牌文本 */}
      <div className="flex-1 p-1 md:p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]">
        <div className="text-[10px] md:text-xs font-bold text-[#F0E6D2] mb-0.5 line-clamp-1">{card.name}</div>
        {/* 移动端隐藏详细描述，防止拥挤，或者只显示极简信息 */}
        <div className="text-[8px] md:text-[9px] text-[#A09B8C] leading-tight font-medium line-clamp-2 scale-90 md:scale-100 origin-top">
          {(() => {
            let desc = card.description;
            // 替换攻击卡牌的伤害值
            if (card.type === 'ATTACK' && card.value && displayValue !== null && displayValue !== card.value) {
              desc = desc.replace(new RegExp(`造成${card.value}点伤害`), `造成${displayValue}点伤害`);
              desc = desc.replace(new RegExp(`${card.value}点伤害`), `${displayValue}点伤害`);
            }
            // 替换技能卡牌的护甲值
            if (card.type === 'SKILL' && card.block && displayBlock !== null && displayBlock !== card.block) {
              desc = desc.replace(new RegExp(`获得${card.block}点护甲`), `获得${displayBlock}点护甲`);
              desc = desc.replace(new RegExp(`${card.block}点护甲`), `${displayBlock}点护甲`);
            }
            // 替换抓牌效果
            if (card.effect === 'DRAW' && card.effectValue && displayEffectValue !== null && displayEffectValue !== card.effectValue) {
              desc = desc.replace(new RegExp(`抓${card.effectValue}张牌`), `抓${displayEffectValue}张牌`);
              desc = desc.replace(new RegExp(`${card.effectValue}张`), `${displayEffectValue}张`);
            }
            return desc;
          })()}
        </div>
        <div className="mt-auto text-[8px] text-slate-500 uppercase font-bold tracking-wider hidden md:block">{card.type}</div>
      </div>
    </motion.div>
  );
};

export default Card;

