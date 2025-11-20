import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_DATABASE } from '../../data/cards';

const Card = ({ cardId, index, totalCards, canPlay, onPlay }) => {
  const card = CARD_DATABASE[cardId];
  const [showDetail, setShowDetail] = useState(false);
  const lastTapRef = useRef(0);
  const touchStartYRef = useRef(0);
  
  // 堆叠逻辑计算（移动端优化）
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 优化叠加效果：支持5-6张卡牌都能看到
  const overlap = isMobile 
    ? (totalCards > 4 ? -12 : totalCards > 3 ? -10 : 2)  // 移动端：4张以上时重叠更多
    : (totalCards > 5 ? -35 : totalCards > 4 ? -30 : 10); // 桌面端：5张以上时重叠更多
  const rotation = (index - (totalCards - 1) / 2) * (isMobile ? 1.2 : 2.5); // 扇形展开角度
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * (isMobile ? 1.5 : 4); // 扇形弧度
  
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
        if (info.offset.y < -120 && canPlay) { // 降低阈值，更容易触发
          onPlay(index); 
        } 
      }}
      
      className={`
        ${isMobile ? 'w-12 h-16' : 'w-16 h-24'} sm:w-20 sm:h-28 md:w-24 md:h-36 lg:w-40 lg:h-60 bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl 
        transition-all duration-200
        ${canPlay ? 'border-[#C8AA6E] cursor-pointer hover:border-[#F0E6D2] hover:shadow-[0_0_30px_rgba(200,170,110,0.8)] active:cursor-grabbing active:scale-110' : 'border-slate-700 opacity-60 cursor-not-allowed'}
      `}
      style={{
        touchAction: 'pan-y', // 允许垂直拖拽，防止误触
      }}
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
      <div className={`w-full ${isMobile ? 'h-8' : 'h-12'} sm:h-16 md:h-24 lg:h-40 bg-black overflow-hidden relative pointer-events-none`}>
        <img src={card.img} className="w-full h-full object-cover opacity-90" alt={card.name} />
        <div className={`absolute top-0.5 sm:top-1 md:top-2 left-0.5 sm:left-1 md:left-2 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-8 lg:h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold ${isMobile ? 'text-[6px]' : 'text-[8px]'} sm:text-[10px] md:text-xs lg:text-lg shadow-md`}>
          {card.cost}
        </div>
      </div>
      
      {/* 卡牌文本 */}
      <div className={`flex-1 ${isMobile ? 'p-0.5' : 'p-0.5'} sm:p-1 md:p-1.5 lg:p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]`}>
        <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} sm:text-[10px] md:text-xs lg:text-sm font-bold text-[#F0E6D2] mb-0.5 md:mb-1 line-clamp-1`}>{card.name}</div>
        <div className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} sm:text-[7px] md:text-[8px] lg:text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-2`}>
          {card.description}
        </div>
        <div className={`mt-auto ${isMobile ? 'text-[4px]' : 'text-[5px]'} sm:text-[6px] md:text-[7px] lg:text-[9px] text-slate-500 uppercase font-bold tracking-wider`}>
          {card.type}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;

