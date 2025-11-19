import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARD_DATABASE } from '../data/cards';
import { RELIC_DATABASE } from '../data/relics';
import { ENEMY_POOL } from '../data/enemies';
import { scaleEnemyStats, shuffle } from '../utils/gameLogic';
import { SPLASH_URL } from '../data/constants';
import { playSfx } from '../utils/audioManager';
import Card from './shared/Card';

const BattleScene = ({ heroData, enemyId, initialDeck, onWin, onLose, floorIndex }) => { 
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

  useEffect(() => {
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
    setPlayerBlock(0);
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
  };

  const playCard = (index) => {
      if(gameState!=='PLAYER_TURN') return;
      const { hand, discardPile } = deckRef.current;
      const cardId = hand[index];
      const card = CARD_DATABASE[cardId];
      if(playerMana < card.cost) return;
      setPlayerMana(p => p - card.cost);
      const newHand = [...hand]; newHand.splice(index, 1);
      if(!card.exhaust) { deckRef.current = { ...deckRef.current, hand: newHand, discardPile: [...discardPile, cardId] }; } 
      else { deckRef.current = { ...deckRef.current, hand: newHand }; }
      forceUpdate();
      
      if(card.effect === 'DRAW') drawCards(card.effectValue);
      if(card.exhaust && heroData.relicId === "EkkoPassive") setPlayerStatus(s => ({ ...s, strength: s.strength + 1 }));
      if(card.type === 'SKILL' && heroData.relicId === "SylasPassive") setPlayerHp(h => Math.min(heroData.maxHp, h + 3));
      if(card.effect === 'VULNERABLE') setEnemyStatus(s => ({ ...s, vulnerable: s.vulnerable + card.effectValue }));
      if(card.effect === 'WEAK') setEnemyStatus(s => ({ ...s, weak: s.weak + card.effectValue }));
      if(card.effect === 'STRENGTH') setPlayerStatus(s => ({ ...s, strength: s.strength + card.effectValue }));
      if(card.effect === 'CLEANSE') setPlayerStatus(s => ({ ...s, weak: 0, vulnerable: 0 }));
      if(card.effect === 'HEAL') setPlayerHp(h => Math.min(heroData.maxHp, h + card.effectValue));
      if(card.type === 'ATTACK') {
          playSfx('ATTACK');
          triggerAnim('HERO', 'attack'); setTimeout(() => triggerAnim('ENEMY', 'hit'), 200);
          let dmg = card.value + playerStatus.strength;
          if (playerStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          const hits = card.isMultiHit ? card.hits : 1;
          let total = 0;
          for(let i=0; i<hits; i++) {
              let finalDmg = dmg;
              if (enemyStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
              if (heroData.relicId === "YasuoPassive" && Math.random() < 0.1) finalDmg = Math.floor(finalDmg * 2);
              if (heroData.relics.includes("InfinityEdge")) finalDmg = Math.floor(finalDmg * 1.5);
              let dmgToHp = finalDmg;
              if (enemyBlock > 0) { 
                  playSfx('BLOCK');
                  if (enemyBlock >= finalDmg) { setEnemyBlock(b => b - finalDmg); dmgToHp = 0; } 
                  else { dmgToHp = finalDmg - enemyBlock; setEnemyBlock(0); } 
              }
              setEnemyHp(h => Math.max(0, h - dmgToHp)); total += dmgToHp;
              if(heroData.relics.includes("VampiricScepter")) setPlayerHp(h => Math.min(heroData.maxHp, h + 1));
              if(heroData.relicId === "DariusPassive") setEnemyStatus(s => ({ ...s, weak: s.weak + 1 }));
          }
          setDmgOverlay({val: total, target: 'ENEMY'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(card.block) {
          playSfx('BLOCK');
          setPlayerBlock(b => b + card.block);
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
          setTimeout(() => triggerAnim('HERO', 'hit'), 200);
          playSfx('ATTACK');
          const baseDmg = act.type === 'ATTACK' ? act.value : act.dmgValue;
          let dmg = baseDmg + enemyStatus.strength;
          if(enemyStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          let total = 0; let remBlock = playerBlock; let currHp = playerHp;
          const count = act.count || 1;
          for(let i=0; i<count; i++) {
             let finalDmg = dmg;
             if(playerStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
             if(remBlock >= finalDmg) {
                 playSfx('BLOCK');
                 remBlock -= finalDmg;
             } else { 
                 let pierce = finalDmg - remBlock; 
                 remBlock = 0; 
                 currHp -= pierce; 
                 if(heroData.relics.includes("BrambleVest")) setEnemyHp(h => Math.max(0, h - 3)); 
             }
             total += finalDmg;
          }
          setPlayerBlock(remBlock); setPlayerHp(currHp); setDmgOverlay({val: total, target: 'PLAYER'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(act.type === 'BUFF') {
          playSfx('BLOCK');
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

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: `url(${SPLASH_URL}/SummonersRift_1.jpg)`}}></div>
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             <div className={`absolute left-10 bottom-[42%] w-64 h-[500px] transition-all duration-200 ${heroAnim === 'attack' ? 'translate-x-32' : ''} ${heroAnim === 'hit' ? 'translate-x-[-10px] brightness-50 bg-red-500/30' : ''}`}>
                 <img src={heroData.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[#C8AA6E]" />
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-[#C8AA6E] p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-[#C8AA6E] font-bold"><span>HP {playerHp}/{heroData.maxHp}</span>{playerBlock > 0 && <span className="text-blue-400 flex items-center gap-1"><Shield size={12}/>{playerBlock}</span>}</div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(playerHp/heroData.maxHp)*100}%`}}></div></div>{renderStatus(playerStatus)}</div>
             </div>
             <div className="text-6xl font-black text-[#C8AA6E]/20 italic">VS</div>
             <div className={`absolute right-10 bottom-[42%] w-64 h-[500px] transition-all duration-200 ${enemyAnim === 'attack' ? '-translate-x-32' : ''} ${enemyAnim === 'hit' ? 'translate-x-[10px] brightness-50 bg-red-500/30' : ''}`}>
                 <img src={enemyConfig.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-red-800" />
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-red-600 px-3 py-1 rounded flex items-center gap-2 animate-bounce"><IntentIcon /><span className="text-white font-bold text-lg">{displayValue}{nextEnemyAction.count>1?`x${nextEnemyAction.count}`:''}</span></div>
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-red-800 p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-red-500 font-bold"><span>{enemyConfig.name}</span><span>{enemyHp}/{enemyConfig.maxHp}</span></div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(enemyHp/enemyConfig.maxHp)*100}%`}}></div></div>{enemyBlock > 0 && <div className="text-blue-400 text-xs font-bold flex items-center gap-1"><Shield size={10}/> 格挡 {enemyBlock}</div>}{renderStatus(enemyStatus)}</div>
             </div>
        </div>
        {dmgOverlay && (<div className={`absolute top-1/2 ${dmgOverlay.target==='ENEMY'?'right-1/4':'left-1/4'} -translate-y-1/2 text-8xl font-black text-white drop-shadow-[0_0_10px_red] animate-ping z-50`}>{dmgOverlay.val}</div>)}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-end justify-center pb-6 gap-4 pointer-events-none">
            <div className="absolute left-8 bottom-8 w-24 h-24 rounded-full bg-[#091428] border-4 border-[#C8AA6E] flex items-center justify-center shadow-[0_0_30px_#0066FF] pointer-events-auto text-center">
                <span className="text-4xl font-bold text-white block">{playerMana}</span>
                <span className="text-[10px] text-[#C8AA6E] block">MANA</span>
                <div className="text-[8px] text-gray-400 mt-1">{currentDrawPile.length}/{currentDiscardPile.length}</div>
            </div>
            <div className="flex items-end justify-center pointer-events-auto" style={{ width: '600px', height: '240px', position: 'relative' }}>
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
                            />
                        )
                    })}
                </AnimatePresence>
            </div>
            <button onClick={endTurn} disabled={gameState!=='PLAYER_TURN'} className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-[#C8AA6E] border-4 border-[#F0E6D2] flex items-center justify-center font-bold text-[#091428] shadow-lg hover:scale-105 hover:bg-white active:scale-95 transition-all pointer-events-auto">结束<br/>回合</button>
        </div>
    </div>
  );
};

export default BattleScene;

