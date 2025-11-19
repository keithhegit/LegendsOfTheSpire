import React, { useState, useEffect } from 'react';
import { Heart, Coins, Play, RotateCcw } from 'lucide-react';
import ChampionSelect from './components/ChampionSelect';
import MapView from './components/MapView';
import ShopView from './components/ShopView';
import EventView from './components/EventView';
import ChestView from './components/ChestView';
import BattleScene from './components/BattleScene';
import RewardView from './components/RewardView';
import RestView from './components/RestView';
import AudioPlayer from './components/shared/AudioPlayer';
import RelicTooltip from './components/shared/RelicTooltip';
import { STARTING_DECK_BASIC, BGM_MAP_URL, BGM_BATTLE_URL } from './data/constants';
import { RELIC_DATABASE } from './data/relics';
import { CHAMPION_POOL } from './data/champions';
import { generateMap } from './utils/mapGenerator';
import { shuffle } from './utils/gameLogic';
import { saveGame, loadGame, clearSave, getUnlockedChampions, unlockRandomChampion } from './utils/storage';

export default function App() {
  const [view, setView] = useState('MENU'); 
  const [mapData, setMapData] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [masterDeck, setMasterDeck] = useState([]);
  const [champion, setChampion] = useState(null); 
  const [currentHp, setCurrentHp] = useState(80);
  const [maxHp, setMaxHp] = useState(80);
  const [gold, setGold] = useState(100);
  const [relics, setRelics] = useState([]);
  const [baseStr, setBaseStr] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [usedEnemies, setUsedEnemies] = useState([]); 
  
  // 解锁系统
  const [unlockedChamps, setUnlockedChamps] = useState(() => getUnlockedChampions(CHAMPION_POOL));
  const [hasSave, setHasSave] = useState(false);
  
  // 检查是否有存档
  useEffect(() => {
    const savedData = loadGame();
    if (savedData) setHasSave(true);
  }, []);
  
  // 自动保存
  useEffect(() => {
    if (view !== 'MENU' && view !== 'CHAMPION_SELECT' && view !== 'GAMEOVER' && view !== 'VICTORY_ALL') {
      saveGame({
        view, mapData, currentFloor, masterDeck, champion, currentHp, maxHp, gold, relics, baseStr, activeNode, usedEnemies
      });
    }
  }, [view, currentHp, gold, currentFloor, masterDeck, relics]);
  
  const handleContinue = () => {
    const savedData = loadGame();
    if (savedData) {
      setMapData(savedData.mapData);
      setCurrentFloor(savedData.currentFloor);
      setMasterDeck(savedData.masterDeck);
      setChampion(savedData.champion);
      setCurrentHp(savedData.currentHp);
      setMaxHp(savedData.maxHp);
      setGold(savedData.gold);
      setRelics(savedData.relics);
      setBaseStr(savedData.baseStr);
      setActiveNode(savedData.activeNode);
      setUsedEnemies(savedData.usedEnemies);
      setView(savedData.view);
    }
  };
  
  const handleNewGame = () => {
    clearSave();
    setHasSave(false);
    setView('CHAMPION_SELECT');
  }; 

  const handleChampionSelect = (selectedChamp) => {
    setChampion(selectedChamp); setMaxHp(selectedChamp.maxHp); setCurrentHp(selectedChamp.maxHp);
    setMasterDeck([...STARTING_DECK_BASIC, ...selectedChamp.initialCards]);
    setRelics([RELIC_DATABASE[selectedChamp.relicId].id]);
    const { map: newMap, finalEnemyIds } = generateMap(usedEnemies);
    setMapData(newMap); setUsedEnemies(finalEnemyIds); setCurrentFloor(0); setView('MAP');
  };

  const completeNode = () => {
      const newMap = [...mapData];
      const floorNodes = newMap[currentFloor];
      floorNodes.forEach(n => { if (n.id === activeNode.id) n.status = 'COMPLETED'; else n.status = 'LOCKED'; });
      const nextFloorIdx = currentFloor + 1;
      if (nextFloorIdx < newMap.length) {
          activeNode.next.forEach(nextId => { const nextNode = newMap[nextFloorIdx].find(n => n.id === nextId); if(nextNode) nextNode.status = 'AVAILABLE'; });
          setCurrentFloor(nextFloorIdx); setView('MAP');
      } else {
        // 通关解锁逻辑
        const allIds = Object.keys(CHAMPION_POOL);
        const newUnlock = unlockRandomChampion(allIds, CHAMPION_POOL);
        if (newUnlock) {
          setUnlockedChamps(getUnlockedChampions(CHAMPION_POOL));
          alert(`恭喜通关！新英雄解锁: ${CHAMPION_POOL[newUnlock].name}`);
        }
        clearSave();
        setView('VICTORY_ALL');
      }
  };
  
  const handleNodeSelect = (node) => {
      if (node.status !== 'AVAILABLE') return;
      setActiveNode(node);
      switch(node.type) {
          case 'BATTLE': case 'BOSS': setView('COMBAT'); break;
          case 'REST': setView('REST'); break;
          case 'SHOP': setView('SHOP'); break;
          case 'EVENT': setView('EVENT'); break;
          case 'CHEST': setView('CHEST'); break;
          default: break;
      }
  };

  const handleBattleWin = (remainingHp) => { 
      let passiveHeal = champion.relicId === "GarenPassive" ? 6 : 0; 
      setCurrentHp(Math.min(maxHp, remainingHp + passiveHeal)); 
      setView('REWARD'); 
  };
  const handleBuyCard = (card) => { setGold(prev => prev - card.price); setMasterDeck(prev => [...prev, card.id]); };
  const handleRelicReward = (relic) => { setRelics(prev => [...prev, relic.id]); if (relic.onPickup) { const ns = relic.onPickup({ maxHp, currentHp }); setMaxHp(ns.maxHp); setCurrentHp(ns.currentHp); } completeNode(); };
  const handleBuyRelic = (relic) => { setGold(prev => prev - relic.price); handleRelicReward(relic); };
  const handleEventReward = (reward) => { if (reward.type === 'BUFF' && reward.stat === 'strength') setBaseStr(prev => prev + reward.value); if (reward.type === 'RELIC_RANDOM') { const pool = Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)); if (pool.length > 0) handleRelicReward(shuffle(pool)[0]); } completeNode(); };
  const handleCardReward = (cardId) => { setMasterDeck([...masterDeck, cardId]); setGold(gold + 50); completeNode(); };
  const handleSkipReward = () => { setGold(gold + 50); completeNode(); };
  const handleRest = () => { setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.3))); completeNode(); };
  
  const restartGame = () => {
    clearSave();
    setHasSave(false);
      setView('CHAMPION_SELECT');
    setMasterDeck([]);
    setCurrentHp(80);
    setMaxHp(80);
    setGold(100);
    setRelics([]);
    setBaseStr(0);
      setChampion(null); 
      setUsedEnemies([]); 
  };

  const renderView = () => {
      switch(view) {
          case 'CHAMPION_SELECT': return <ChampionSelect onChampionSelect={handleChampionSelect} unlockedIds={unlockedChamps} />;
          case 'MENU': return (
            <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="z-10 text-center">
                <h1 className="text-8xl font-black text-[#C8AA6E] mb-8 drop-shadow-lg tracking-widest">峡谷尖塔</h1>
                <div className="flex flex-col gap-4 w-64 mx-auto">
                  {hasSave && (
                    <button onClick={handleContinue} className="px-8 py-4 bg-[#0AC8B9] hover:bg-white hover:text-[#0AC8B9] text-black font-bold rounded flex items-center justify-center gap-2 transition-all">
                      <Play fill="currentColor" /> 继续征程
                    </button>
                  )}
                  <button onClick={handleNewGame} className="px-8 py-4 border-2 border-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-black text-[#C8AA6E] font-bold rounded flex items-center justify-center gap-2 transition-all">
                    <RotateCcw /> 新游戏
                  </button>
                </div>
                <p className="mt-8 text-slate-400 text-sm">v2.0 Beta</p>
              </div>
            </div>
          );
          case 'MAP': return <MapView mapData={mapData} onNodeSelect={handleNodeSelect} currentFloor={currentFloor} />;
          case 'SHOP': return <ShopView gold={gold} deck={masterDeck} relics={relics} onLeave={() => completeNode()} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} championName={champion.name} />;
          case 'EVENT': return <EventView onLeave={() => completeNode()} onReward={handleEventReward} />;
          case 'CHEST': return <ChestView onLeave={() => completeNode()} onRelicReward={handleRelicReward} relics={relics} />;
          case 'COMBAT': return <BattleScene heroData={{...champion, maxHp, currentHp, relics, baseStr}} enemyId={activeNode.enemyId} initialDeck={masterDeck} onWin={handleBattleWin} onLose={() => { clearSave(); setView('GAMEOVER'); }} floorIndex={currentFloor} />;
          case 'REWARD': return <RewardView goldReward={50} onCardSelect={handleCardReward} onSkip={handleSkipReward} championName={champion.name} />;
          case 'REST': return <RestView onRest={handleRest} />;
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">德玛西亚万岁！</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">再来一局</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">战败</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">重新开始</button></div>;
          default: return <div>Loading...</div>;
      }
  };

  // 根据当前视图决定使用哪首 BGM
  const currentBGM = view === 'COMBAT' ? BGM_BATTLE_URL : BGM_MAP_URL;

  return (
      <div className="relative h-screen w-full bg-[#091428] font-sans select-none overflow-hidden">
          <AudioPlayer src={currentBGM} />
          {view !== 'GAMEOVER' && view !== 'VICTORY_ALL' && view !== 'CHAMPION_SELECT' && champion && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent z-50 flex items-center px-8 pointer-events-none">
                  <div className="flex items-center gap-6 pointer-events-auto flex-1">
                      <div className="relative group">
                          <img src={champion.avatar} className="w-12 h-12 rounded-full border-2 border-[#C8AA6E] shadow-lg" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-xs font-bold text-[#C8AA6E]">{currentFloor+1}F</div>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[#F0E6D2] font-bold text-lg shadow-black drop-shadow-md flex items-center gap-2">
                            {champion.name}
                            <RelicTooltip relic={RELIC_DATABASE[champion.relicId]}>
                                <img src={RELIC_DATABASE[champion.relicId].img} 
                                     className="w-6 h-6 rounded border border-yellow-400 bg-black/50 cursor-help hover:scale-110 transition-transform" 
                                />
                            </RelicTooltip>
                          </span>
                          <div className="flex items-center gap-4 text-sm font-bold">
                              <span className="text-red-400 flex items-center gap-1"><Heart size={14} fill="currentColor"/> {currentHp}/{maxHp}</span>
                              <span className="text-yellow-400 flex items-center gap-1"><Coins size={14} fill="currentColor"/> {gold}</span>
                          </div>
                      </div>
                      {/* 道具装备移到英雄专属右侧 */}
                      <div className="flex gap-2 pointer-events-auto ml-4">
                      {relics.filter(rid => rid !== champion.relicId).map((rid, i) => {
                          const relic = RELIC_DATABASE[rid];
                          return (
                              <RelicTooltip key={i} relic={relic}>
                                  <div className="w-10 h-10 rounded border border-[#C8AA6E]/50 bg-black/50 relative group cursor-help hover:scale-110 transition-transform">
                                      <img src={relic.img} className="w-full h-full object-cover" />
                                      {relic.charges !== undefined && relic.charges > 0 && (
                                          <div className="absolute bottom-0 right-0 text-[10px] bg-red-600 rounded-full w-4 h-4 flex items-center justify-center text-white border border-black">{relic.charges}</div>
                                      )}
                                  </div>
                              </RelicTooltip>
                          );
                      })}
                      </div>
                  </div>
              </div>
          )}
          {renderView()}
      </div>
  );
}
