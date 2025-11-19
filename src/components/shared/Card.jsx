import React from 'react';
import { motion } from 'framer-motion';
import { CARD_DATABASE } from '../../data/cards';

const Card = ({ cardId, index, totalCards, canPlay, onPlay }) => {
  const card = CARD_DATABASE[cardId];
  
  // 堆叠逻辑计算
  const overlap = totalCards > 5 ? -40 : 10; 
  const rotation = (index - (totalCards - 1) / 2) * 3; // 扇形展开角度
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * 5; // 扇形弧度
  
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
      // --- 拖拽逻辑 ---
      drag={canPlay ? "y" : false} // 只允许 Y 轴拖拽
      dragConstraints={{ top: -300, bottom: 0 }} // 拖拽限制
      dragSnapToOrigin={true} // 松手后回弹
      onDragEnd={(event, info) => {
        // 如果向上拖动超过 150px，视为出牌
        if (info.offset.y < -150 && canPlay) {
          onPlay(index);
        }
      }}
      whileHover={{ scale: 1.2, y: -50, zIndex: 100, rotate: 0 }} // 悬停放大
      whileDrag={{ scale: 1.1, zIndex: 100, rotate: 0, opacity: 0.8 }}
      
      className={`
        w-40 h-60 bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl 
        ${canPlay ? 'border-[#C8AA6E] cursor-grab active:cursor-grabbing' : 'border-slate-700 opacity-60 cursor-not-allowed'}
      `}
    >
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

