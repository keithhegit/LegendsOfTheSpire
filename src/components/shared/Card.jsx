import React from 'react';
import { motion } from 'framer-motion';
import { CARD_DATABASE } from '../../data/cards';

const Card = ({ cardId, index, totalCards, canPlay, onPlay, cardUpgrades = {} }) => {
  const card = CARD_DATABASE[cardId];
  if (!card) return null;
  
  // 应用卡牌升级效果
  const upgrade = cardUpgrades[cardId] || {};
  const displayValue = card.value ? (card.value + (upgrade.value || 0)) : null;
  const displayBlock = card.block ? (card.block + (upgrade.block || 0)) : null;
  const displayEffectValue = card.effectValue ? (card.effectValue + (upgrade.effectValue || 0)) : null;
  
  // 堆叠逻辑（参考 c8d0950，简单逻辑）
  const overlap = totalCards > 5 ? -40 : 10; 
  const rotation = (index - (totalCards - 1) / 2) * 3;
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * 5;
  
  // 处理点击事件（保留点击作为备用）
  const handleClick = (e) => {
    e.stopPropagation();
    if (canPlay) {
      onPlay(index);
    }
  };
  
  return (
    <motion.div
      layout
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
      // 拖拽功能（参考线上环境 https://lol.keithhe.com/）
      drag={canPlay ? "y" : false}
      dragConstraints={{ top: -300, bottom: 0 }}
      dragSnapToOrigin={true}
      onDragEnd={(event, info) => {
        // 如果向上拖动超过 150px，视为出牌
        if (info.offset.y < -150 && canPlay) {
          onPlay(index);
        }
      }}
      // 悬停特效
      whileHover={canPlay ? { 
        scale: 1.2, 
        y: -80, 
        zIndex: 100, 
        rotate: 0
      } : {}}
      // 拖拽时的特效
      whileDrag={{ 
        scale: 1.1, 
        zIndex: 100, 
        rotate: 0, 
        opacity: 0.8 
      }}
      // 点击事件（作为备用）
      onClick={handleClick}
      
      className={`
        w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 lg:w-40 lg:h-60 
        bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl 
        transition-all duration-200
        ${canPlay ? 'border-[#C8AA6E] cursor-grab active:cursor-grabbing hover:border-[#F0E6D2] hover:shadow-[0_0_30px_rgba(200,170,110,0.8)]' : 'border-slate-700 opacity-60 cursor-not-allowed'}
      `}
    >
      {/* 卡牌图片 */}
      <div className="w-full h-12 sm:h-16 md:h-24 lg:h-40 bg-black overflow-hidden relative pointer-events-none">
        <img src={card.img} className="w-full h-full object-cover opacity-90" alt={card.name} />
        <div className="absolute top-0.5 sm:top-1 md:top-2 left-0.5 sm:left-1 md:left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-8 lg:h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-[8px] sm:text-[10px] md:text-xs lg:text-lg shadow-md">
          {card.cost}
        </div>
      </div>
      
      {/* 卡牌文本 */}
      <div className="flex-1 p-0.5 sm:p-1 md:p-1.5 lg:p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]">
        <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-[#F0E6D2] mb-0.5 md:mb-1 line-clamp-1">{card.name}</div>
        <div className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-2">
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
        <div className="mt-auto text-[5px] sm:text-[6px] md:text-[7px] lg:text-[9px] text-slate-500 uppercase font-bold tracking-wider">
          {card.type}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;

