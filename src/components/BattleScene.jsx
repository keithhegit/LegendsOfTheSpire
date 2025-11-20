import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARD_DATABASE } from '../data/cards';
import { RELIC_DATABASE } from '../data/relics';
import { ENEMY_POOL } from '../data/enemies';
import { scaleEnemyStats, shuffle } from '../utils/gameLogic';
import { SPLASH_URL } from '../data/constants';
import { playSfx, playChampionVoice } from '../utils/audioManager';
import { useIsMobile } from '../hooks/useIsMobile';
import Card from './shared/Card';

// 背景图配置 (按章节)
const ACT_BACKGROUNDS = {
    1: "https://i.17173cdn.com/2fhnvk/YWxqaGBf/cms3/JfEzktbjDoBxmzd.jpg", // 召唤师峡谷
    2: "https://images.17173cdn.com/2014/lol/2014/08/22/Shadow_Isles_10.jpg", // 暗影之地
    3: "https://pic.upmedia.mg/uploads/content/20220519/EV220519112427593030.webp"  // 虚空之地
};

const BattleScene = ({ heroData, enemyId, initialDeck, onWin, onLose, floorIndex, act }) => { 
  const getScaledEnemy = (enemyId, floor) => {
    const baseEnemy = ENEMY_POOL[enemyId];
    const { maxHp, actions } = scaleEnemyStats(baseEnemy, floor);
    return { ...baseEnemy, maxHp, actions };
  };
  const enemyConfig = getScaledEnemy(enemyId, floorIndex); 
  const initialMana = heroData.maxMana || 3; 
  const [gameState, setGameState] = useState('PLAYER_TURN');
  const [playerHp, setPlayerHp] = useState(heroData.currentHp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerMana, setPlayerMana] = useState(initialMana); 
  const [enemyHp, setEnemyHp] = useState(enemyConfig.maxHp); 
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [nextEnemyAction, setNextEnemyAction] = useState(enemyConfig.actions[0]);
  
  const deckRef = useRef({ drawPile: [], hand: [], discardPile: [] });
  const [renderTrigger, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);
  const [dmgOverlay, setDmgOverlay] = useState(null);
  const [heroAnim, setHeroAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  const [playerStatus, setPlayerStatus] = useState({ strength: heroData.baseStr || 0, weak: 0, vulnerable: 0 });
  const [enemyStatus, setEnemyStatus] = useState({ strength: 0, weak: 0, vulnerable: 0 });
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState(0); // 本回合打出的卡牌数量（SonaPassive）
  const [attackCardsPlayed, setAttackCardsPlayed] = useState(0); // 本回合打出的攻击牌数量（RivenPassive, KatarinaPassive）
  const [lastSkillCardPlayed, setLastSkillCardPlayed] = useState(false); // 上一张是否是技能牌（LeeSinPassive）
  const [vayneHitCount, setVayneHitCount] = useState(0); // Vayne被动：连续伤害计数
  const [isFirstAttackCard, setIsFirstAttackCard] = useState(true); // Zed被动：第一张攻击牌

  useEffect(() => {
    // 战斗开始时播放英雄语音
    if (heroData.id) {
      playChampionVoice(heroData.id);
    }
    
    const initialDrawPile = shuffle([...initialDeck]);
    deckRef.current = { drawPile: initialDrawPile, hand: [], discardPile: [] };
    let block = 0; let str = heroData.baseStr || 0;
    heroData.relics.forEach(rid => {
        const relic = RELIC_DATABASE[rid];
        if(relic.onBattleStart) { const newState = relic.onBattleStart({ block, status: { strength: str } }); block = newState.block; str = newState.status.strength; }
        if(rid === heroData.relicId && heroData.relicId === "UrgotPassive") block += 15; 
    });
    setPlayerBlock(block); setPlayerStatus(prev => ({ ...prev, strength: str }));
    startTurnLogic();
  }, []);

  const triggerAnim = (target, type) => { if(target === 'HERO') { setHeroAnim(type); setTimeout(() => setHeroAnim(""), 500); } if(target === 'ENEMY') { setEnemyAnim(type); setTimeout(() => setEnemyAnim(""), 500); } };

  const drawCards = (count) => {
      let { drawPile, hand, discardPile } = deckRef.current;
      for(let i=0; i<count; i++) {
          if (drawPile.length === 0) {
              if (discardPile.length === 0) break; 
              drawPile = shuffle([...discardPile]);
              discardPile = [];
          }
          hand.push(drawPile.pop());
      }
      deckRef.current = { drawPile, hand, discardPile };
      forceUpdate();
      playSfx('DRAW');
  };

  const startTurnLogic = () => {
    setGameState('PLAYER_TURN'); 
    setPlayerMana(initialMana + (heroData.relicId === "LuxPassive" ? 1 : 0)); 
    // 护甲不再清零，保留上一回合剩余的护甲（可以叠加）
    // setPlayerBlock(0); // 移除这行，让护甲可以叠加
    let drawCount = 5; if (heroData.relicId === "JinxPassive") drawCount = 6; 
    drawCards(drawCount);
    if (heroData.relicId === "ViktorPassive" && Math.random() < 0.5) {
         const basicCard = shuffle(['Strike', 'Defend'])[0];
         let { hand } = deckRef.current;
         hand.push(basicCard);
         forceUpdate();
    }
    setNextEnemyAction(enemyConfig.actions[Math.floor(Math.random()*enemyConfig.actions.length)]);
    heroData.relics.forEach(rid => { const relic = RELIC_DATABASE[rid]; if(relic.onTurnStart) { const { pState, eState } = relic.onTurnStart({ hp: playerHp, maxHp: heroData.maxHp }, { hp: enemyHp }); setPlayerHp(pState.hp); setEnemyHp(eState.hp); } });
    // TeemoPassive: 回合开始时，随机给一名敌人施加 2 层虚弱
    if (heroData.relicId === "TeemoPassive") {
      setEnemyStatus(s => ({ ...s, weak: s.weak + 2 }));
    }
    // 重置回合计数
    setCardsPlayedThisTurn(0);
    setAttackCardsPlayed(0);
    setLastSkillCardPlayed(false);
    setIsFirstAttackCard(true);
    setVayneHitCount(0);
  };

  const playCard = (index) => {
      if(gameState!=='PLAYER_TURN') return;
      const { hand, discardPile } = deckRef.current;
      const cardId = hand[index];
      const card = CARD_DATABASE[cardId];
      
      // LeeSinPassive: 打出技能牌后，下一张攻击牌费用-1
      let actualCost = card.cost;
      if (card.type === 'ATTACK' && lastSkillCardPlayed && heroData.relicId === "LeeSinPassive") {
        actualCost = Math.max(0, card.cost - 1);
      }
      
      if(playerMana < actualCost) return;
      setPlayerMana(p => p - actualCost);
      const newHand = [...hand]; newHand.splice(index, 1);
      if(!card.exhaust) { deckRef.current = { ...deckRef.current, hand: newHand, discardPile: [...discardPile, cardId] }; } 
      else { deckRef.current = { ...deckRef.current, hand: newHand }; }
      forceUpdate();
      
      // 应用卡牌升级效果
      const upgrade = heroData.cardUpgrades?.[cardId] || {};
      const upgradedValue = (card.value || 0) + (upgrade.value || 0);
      const upgradedBlock = (card.block || 0) + (upgrade.block || 0);
      const upgradedEffectValue = (card.effectValue || 0) + (upgrade.effectValue || 0);
      
      // 更新卡牌计数（用于被动技能）
      const newCardsPlayed = cardsPlayedThisTurn + 1;
      setCardsPlayedThisTurn(newCardsPlayed);
      
      // LeeSinPassive: 打出技能牌后，标记下一张攻击牌费用-1
      if (card.type === 'SKILL') {
        setLastSkillCardPlayed(true);
      } else if (card.type === 'ATTACK') {
        setLastSkillCardPlayed(false); // 攻击牌使用后重置
      }
      
      if(card.effect === 'DRAW') drawCards(upgradedEffectValue || card.effectValue);
      if(card.exhaust && heroData.relicId === "EkkoPassive") setPlayerStatus(s => ({ ...s, strength: s.strength + 1 }));
      if(card.type === 'SKILL' && heroData.relicId === "SylasPassive") setPlayerHp(h => Math.min(heroData.maxHp, h + 3)); 
      if(card.effect === 'VULNERABLE') setEnemyStatus(s => ({ ...s, vulnerable: s.vulnerable + (upgradedEffectValue || card.effectValue) }));
      if(card.effect === 'WEAK') setEnemyStatus(s => ({ ...s, weak: s.weak + (upgradedEffectValue || card.effectValue) }));
      if(card.effect === 'STRENGTH') setPlayerStatus(s => ({ ...s, strength: s.strength + (upgradedEffectValue || card.effectValue) }));
      if(card.effect === 'CLEANSE') setPlayerStatus(s => ({ ...s, weak: 0, vulnerable: 0 }));
      if(card.effect === 'HEAL') setPlayerHp(h => Math.min(heroData.maxHp, h + (upgradedEffectValue || card.effectValue)));
      
      // SonaPassive: 每回合打出第三张卡时，获得 3 点临时护甲
      if (newCardsPlayed === 3 && heroData.relicId === "SonaPassive") {
        setPlayerBlock(b => b + 3);
      }
      
      if(card.type === 'ATTACK') {
          // 更新攻击牌计数
          const newAttackCount = attackCardsPlayed + 1;
          setAttackCardsPlayed(newAttackCount);
          
          // RivenPassive: 每打出3张攻击牌，获得1点能量
          if (heroData.relicId === "RivenPassive" && newAttackCount % 3 === 0) {
            setPlayerMana(p => p + 1);
          }
          
          // KatarinaPassive: 每回合打出的每第 4 张攻击牌伤害翻倍
          const isKatarina4thAttack = heroData.relicId === "KatarinaPassive" && newAttackCount % 4 === 0;
          
          // ZedPassive: 每回合第一张攻击牌会重复施放一次(50%伤害)
          const isZedFirstAttack = heroData.relicId === "ZedPassive" && isFirstAttackCard;
          setIsFirstAttackCard(false);
          // 播放攻击挥击音效
          playSfx('ATTACK_SWING');
          triggerAnim('HERO', 'attack'); 
          setTimeout(() => {
              triggerAnim('ENEMY', 'hit');
              // 延迟播放攻击命中音效
              playSfx('ATTACK_HIT');
          }, 200);
          let dmg = upgradedValue + playerStatus.strength;
          if (playerStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          
          // KatarinaPassive: 每回合打出的每第 4 张攻击牌伤害翻倍
          if (isKatarina4thAttack) {
            dmg = dmg * 2;
          }
          
          const hits = card.isMultiHit ? card.hits : 1;
          let total = 0;
          
          for(let i=0; i<hits; i++) {
              let finalDmg = dmg;
              if (enemyStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
              if (heroData.relicId === "YasuoPassive" && Math.random() < 0.1) finalDmg = Math.floor(finalDmg * 2);
              if (heroData.relics.includes("InfinityEdge")) finalDmg = Math.floor(finalDmg * 1.5);
              
              // VaynePassive: 对同一目标连续造成3次伤害时，额外造成10伤
              const newVayneCount = vayneHitCount + 1;
              if (heroData.relicId === "VaynePassive" && newVayneCount % 3 === 0) {
                finalDmg += 10;
              }
              setVayneHitCount(newVayneCount);
              
              let dmgToHp = finalDmg;
              if (enemyBlock > 0) { 
                  // 敌人格挡时播放格挡音效
                  playSfx('BLOCK_SHIELD');
                  if (enemyBlock >= finalDmg) { setEnemyBlock(b => b - finalDmg); dmgToHp = 0; } 
                  else { dmgToHp = finalDmg - enemyBlock; setEnemyBlock(0); } 
              } else if (dmgToHp > 0) {
                  // 敌人受击时播放受击音效
                  setTimeout(() => playSfx('HIT_TAKEN'), 250);
              }
              
              // 应用伤害并检测击杀（在setEnemyHp回调中直接触发被动技能）
              const currentEnemyHp = enemyHp;
              const willKill = currentEnemyHp > 0 && currentEnemyHp <= dmgToHp;
              
              setEnemyHp(h => Math.max(0, h - dmgToHp));
              
              // 如果击杀敌人，立即触发被动技能（使用setTimeout确保状态更新后执行）
              if (willKill) {
                setTimeout(() => {
                  // 内瑟斯被动：用攻击牌击杀敌人，永久+1力量（在攻击牌块内，所以一定是攻击牌击杀）
                  if (heroData.relicId === "NasusPassive" && heroData.onKillEnemy) {
                    heroData.onKillEnemy({ type: 'strength', value: 1 });
                  }
                  // 艾瑞莉娅被动：击杀敌人，恢复1点能量并抽1张牌
                  if (heroData.relicId === "IreliaPassive") {
                    setPlayerMana(p => p + 1);
                    drawCards(1);
                  }
                  // 锤石被动：敌人死亡增加2最大生命值
                  if (heroData.relicId === "ThreshPassive" && heroData.onKillEnemy) {
                    heroData.onKillEnemy({ type: 'maxHp', value: 2 });
                  }
                  // Vayne被动：击杀后重置计数
                  if (heroData.relicId === "VaynePassive") {
                    setVayneHitCount(0);
                  }
                }, 100);
              }
              
              total += dmgToHp;
              if(heroData.relics.includes("VampiricScepter")) setPlayerHp(h => Math.min(heroData.maxHp, h + 1));
              if(heroData.relicId === "DariusPassive") setEnemyStatus(s => ({ ...s, weak: s.weak + 1 }));
          }
          
          // ZedPassive: 每回合第一张攻击牌会重复施放一次(50%伤害)
          if (isZedFirstAttack) {
            setTimeout(() => {
              let zedDmg = Math.floor((upgradedValue + playerStatus.strength) * 0.5);
              if (playerStatus.weak > 0) zedDmg = Math.floor(zedDmg * 0.75);
              if (enemyStatus.vulnerable > 0) zedDmg = Math.floor(zedDmg * 1.5);
              let zedDmgToHp = zedDmg;
              if (enemyBlock > 0) {
                if (enemyBlock >= zedDmg) { setEnemyBlock(b => b - zedDmg); zedDmgToHp = 0; }
                else { zedDmgToHp = zedDmg - enemyBlock; setEnemyBlock(0); }
              }
              setEnemyHp(h => Math.max(0, h - zedDmgToHp));
            }, 400);
          }
          
          setDmgOverlay({val: total, target: 'ENEMY'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(card.block || upgradedBlock > 0) {
          // 玩家获得格挡时播放格挡音效
          playSfx('BLOCK_SHIELD');
          const finalBlock = upgradedBlock || card.block;
          setPlayerBlock(b => b + finalBlock);
      }
  };

  useEffect(() => { 
      if(enemyHp<=0) {
          playSfx('WIN');
          setTimeout(()=>onWin(playerHp), 1000); 
      }
  }, [enemyHp]);
  useEffect(() => { if(playerHp<=0) setTimeout(onLose, 1000); }, [playerHp]);
  
  const endTurn = () => { 
      const { hand, discardPile } = deckRef.current;
      deckRef.current = { ...deckRef.current, discardPile: [...discardPile, ...hand], hand: [] };
      forceUpdate();
      setGameState('ENEMY_TURN'); 
      setPlayerStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)})); 
      setEnemyStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)})); 
      setTimeout(enemyAction, 1000); 
  };
  
  const enemyAction = () => {
      if(enemyHp<=0) return;
      triggerAnim('ENEMY', 'attack');
      const act = nextEnemyAction;
      if(act.type === 'ATTACK' || act.actionType === 'Attack') {
          // 敌人攻击挥击音效
          playSfx('ATTACK_SWING');
          setTimeout(() => {
              triggerAnim('HERO', 'hit');
              // 延迟播放攻击命中音效
              playSfx('ATTACK_HIT');
          }, 200);
          const baseDmg = act.type === 'ATTACK' ? act.value : act.dmgValue;
          let dmg = baseDmg + enemyStatus.strength;
          if(enemyStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          let total = 0; let remBlock = playerBlock; let currHp = playerHp;
          const count = act.count || 1;
          for(let i=0; i<count; i++) {
             let finalDmg = dmg;
             if(playerStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
             if(remBlock >= finalDmg) {
                 // 玩家格挡时播放格挡音效
                 playSfx('BLOCK_SHIELD');
                 remBlock -= finalDmg;
             } else { 
                 let pierce = finalDmg - remBlock; 
                 remBlock = 0; 
                 currHp -= pierce;
                 // 玩家受击时播放受击音效
                 setTimeout(() => playSfx('HIT_TAKEN'), 250);
                 if(heroData.relics.includes("BrambleVest")) setEnemyHp(h => Math.max(0, h - 3)); 
             }
             total += finalDmg;
          }
          setPlayerBlock(remBlock); setPlayerHp(currHp); setDmgOverlay({val: total, target: 'PLAYER'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(act.type === 'BUFF') {
          // 敌人获得格挡时播放格挡音效
          playSfx('BLOCK_SHIELD');
          setEnemyBlock(b => b + act.effectValue);
      }
      if(act.type === 'DEBUFF') { if(act.effect === 'WEAK') setPlayerStatus(s => ({...s, weak: s.weak + act.effectValue})); if(act.effect === 'VULNERABLE') setPlayerStatus(s => ({...s, vulnerable: s.vulnerable + act.effectValue})); }
      setEnemyBlock(0); 
      setTimeout(startTurnLogic, 1000); 
  };

  const renderStatus = (status) => (
    <div className="flex gap-1 mt-1 flex-wrap">
        {status.strength > 0 && <div className="flex items-center text-[10px] text-red-400 bg-red-900/40 px-1 rounded border border-red-900 shadow-sm"><Sword size={10} className="mr-1"/> {status.strength}</div>}
        {status.weak > 0 && <div className="flex items-center text-[10px] text-yellow-400 bg-yellow-900/40 px-1 rounded border border-yellow-900 shadow-sm"><Activity size={10} className="mr-1"/> 虚弱 {status.weak}</div>}
        {status.vulnerable > 0 && <div className="flex items-center text-[10px] text-purple-400 bg-purple-900/40 px-1 rounded border border-purple-900 shadow-sm"><Zap size={10} className="mr-1"/> 易伤 {status.vulnerable}</div>}
    </div>
  );
  const displayValue = nextEnemyAction.type === 'ATTACK' ? nextEnemyAction.value : (nextEnemyAction.actionType === 'Attack' ? nextEnemyAction.dmgValue : nextEnemyAction.effectValue);
  const IntentIcon = () => { const type = nextEnemyAction.type; const isAttack = type === 'ATTACK' || nextEnemyAction.actionType === 'Attack'; if (isAttack) return <Sword size={20} className="text-red-500"/>; if (type === 'BUFF') return <Shield size={20} className="text-blue-400"/>; if (type === 'DEBUFF') return <Skull size={20} className="text-purple-400"/>; return <AlertTriangle size={20} className="text-gray-400"/>; };

  const { hand, drawPile: currentDrawPile, discardPile: currentDiscardPile } = deckRef.current;
  
  // 使用 useIsMobile Hook 进行 JS 级响应式检测
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: `url(${ACT_BACKGROUNDS[act || 1]})`}}></div>
        
        {/* 战斗区域：核心修复 - 移动端向上平移，为卡牌留出空间 */}
        <div className={`absolute inset-0 flex items-center justify-between z-10 pointer-events-none ${isMobile ? '-top-[10%]' : ''} pt-2 md:pt-4 px-2 md:px-10`}>
             
             {/* 玩家 (左) - 移动端 w-20 h-28 (80x112px) */}
             <div className={`
                absolute transition-all duration-200 
                left-2 bottom-[45%] w-20 h-28
                md:left-10 md:bottom-[42%] md:w-64 md:h-[500px]
                ${heroAnim === 'attack' ? 'translate-x-4 md:translate-x-32' : ''} 
                ${heroAnim === 'hit' ? 'translate-x-[-5px] md:translate-x-[-10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 <img src={heroData.img} className="w-full h-full object-cover object-top rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-[#C8AA6E]" />
                 {/* 玩家状态栏 - z-40 确保层级最高 */}
                 <div className="absolute -bottom-10 md:-bottom-24 w-full bg-black/80 border border-[#C8AA6E] p-0.5 md:p-2 rounded flex flex-col gap-0.5 md:gap-1 shadow-lg z-40">
                     <div className="flex justify-between text-[8px] md:text-xs text-[#C8AA6E] font-bold">
                         <span>HP {playerHp}/{heroData.maxHp}</span>
                         {playerBlock > 0 && <span className="text-blue-400 flex items-center gap-0.5"><Shield size={8} className="md:w-3 md:h-3"/>{playerBlock}</span>}
                     </div>
                     <div className="w-full h-0.5 md:h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(playerHp/heroData.maxHp)*100}%`}}></div>
                     </div>
                     {renderStatus(playerStatus)}
                 </div>
             </div>
             
             {/* 敌人 (右) - 移动端 w-20 h-28 (80x112px) */}
             <div className={`
                absolute transition-all duration-200
                right-2 bottom-[45%] w-20 h-28
                md:right-10 md:bottom-[42%] md:w-64 md:h-[500px]
                ${enemyAnim === 'attack' ? '-translate-x-4 md:-translate-x-32' : ''} 
                ${enemyAnim === 'hit' ? 'translate-x-[5px] md:translate-x-[10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 {/* 意图图标 */}
                 <div className="absolute -top-4 md:-top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-red-600 px-1 py-0.5 md:px-3 md:py-1 rounded flex items-center gap-0.5 md:gap-2 animate-bounce z-50">
                      <IntentIcon />
                      <span className="text-white font-bold text-[8px] md:text-lg">{displayValue}{nextEnemyAction.count>1?`x${nextEnemyAction.count}`:''}</span>
                 </div>
                 <img src={enemyConfig.img} className="w-full h-full object-cover object-top rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-red-800" />
                 {/* 敌人状态栏 - z-40 确保层级最高 */}
                 <div className="absolute -bottom-10 md:-bottom-24 w-full bg-black/80 border border-red-800 p-0.5 md:p-2 rounded flex flex-col gap-0.5 md:gap-1 shadow-lg z-40">
                     <div className="flex justify-between text-[8px] md:text-xs text-red-500 font-bold">
                         <span className="truncate">{enemyConfig.name}</span>
                         <span>{enemyHp}/{enemyConfig.maxHp}</span>
                     </div>
                     <div className="w-full h-0.5 md:h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(enemyHp/enemyConfig.maxHp)*100}%`}}></div>
                     </div>
                     {enemyBlock > 0 && <div className="text-blue-400 text-[8px] md:text-xs font-bold flex items-center gap-0.5"><Shield size={8} className="md:w-2.5 md:h-2.5"/> {enemyBlock}</div>}
                     {renderStatus(enemyStatus)}
                 </div>
             </div>
        </div>
        
        {/* 伤害飘字 */}
        {dmgOverlay && (
            <div className={`absolute top-1/2 ${dmgOverlay.target==='ENEMY'?'right-[25%]':'left-[25%]'} -translate-y-1/2 text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_10px_red] animate-ping z-50`}>
                {dmgOverlay.val}
            </div>
        )}
        {/* 底部控制区：手牌和按钮 - 移动端 bottom: 60px 避开手势条 */}
        <div className={`absolute left-0 right-0 ${isMobile ? 'bottom-[60px]' : 'bottom-0'} md:bottom-0 h-[40%] md:h-1/3 bg-gradient-to-t from-black via-black/90 to-transparent z-30 flex items-end justify-center pb-1 md:pb-6 gap-1 md:gap-4 pointer-events-none`}>
            
            {/* Mana 球 - z-40 确保层级最高 */}
            <div className="absolute left-1 bottom-1 md:left-8 md:bottom-8 w-12 h-12 md:w-24 md:h-24 rounded-full bg-[#091428] border-2 md:border-4 border-[#C8AA6E] flex items-center justify-center shadow-[0_0_30px_#0066FF] pointer-events-auto text-center z-40">
                <span className="text-lg md:text-4xl font-bold text-white block">{playerMana}</span>
                {/* 移动端隐藏 MANA 文字以节省空间 */}
                <span className="text-[6px] md:text-[10px] text-[#C8AA6E] hidden md:block">MANA</span>
                <div className="absolute -bottom-3 md:bottom-2 text-[6px] md:text-[8px] text-gray-400 w-full text-center">{currentDrawPile.length}/{currentDiscardPile.length}</div>
            </div>
            
            {/* 手牌区域 */}
            <div className="flex items-end justify-center" style={{ width: '100%', maxWidth: '800px', height: '100%', position: 'relative' }}>
                <AnimatePresence>
                    {hand.map((cid, i) => {
                        const canPlay = playerMana >= CARD_DATABASE[cid].cost && gameState === 'PLAYER_TURN';
                        return (
                            <Card 
                                key={`${cid}-${i}`} 
                                cardId={cid} 
                                index={i} 
                                totalCards={hand.length} 
                                canPlay={canPlay} 
                                onPlay={playCard}
                                cardUpgrades={heroData.cardUpgrades || {}}
                            />
                        )
                    })}
                </AnimatePresence>
            </div>
            
            {/* 结束回合按钮 - z-40 确保层级最高 */}
            <button 
                onClick={endTurn} 
                disabled={gameState!=='PLAYER_TURN'} 
                className={`
                    absolute right-1 bottom-1 md:right-8 md:bottom-8 
                    w-12 h-12 md:w-24 md:h-24 
                    rounded-full bg-[#C8AA6E] border-2 md:border-4 border-[#F0E6D2] 
                    flex items-center justify-center 
                    font-bold text-[#091428] text-[7px] md:text-base
                    shadow-lg hover:scale-105 hover:bg-white active:scale-95 transition-all pointer-events-auto z-40
                `}
            >
                结束<br/>回合
            </button>
        </div>
    </div>
  );
};

export default BattleScene;

