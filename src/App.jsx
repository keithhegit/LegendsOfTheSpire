import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Heart, RefreshCw, AlertTriangle, Flame, XCircle, Activity, Map as MapIcon, Gift, Anchor, Coins, ShoppingBag, ChevronRight, Star, Play, Pause, Volume2, VolumeX } from 'lucide-react';

// --- 1. 静态资源与配置 ---

const CDN_URL = "https://ddragon.leagueoflegends.com/cdn/13.1.1";
const LOADING_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/loading";
const SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";
const ITEM_URL = "https://ddragon.leagueoflegends.com/cdn/13.1.1/img/item";
const SPELL_URL = "https://ddragon.leagueoflegends.com/cdn/13.1.1/img/spell";

// 局外地图背景
const MAP_BG_URL = "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/LoL/lol-valley.jpg";

// BGM 地址
const BGM_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/origin/01%20-%20Aim%20to%20Be%20a%20Pok%C3%A9mon%20Master%20-%20%E3%82%81%E3%81%96%E3%81%9B%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC.mp3";

// 英雄配置: 盖伦
const HERO_DATA = {
  name: "盖伦",
  title: "德玛西亚之力",
  maxHp: 80,
  maxMana: 3,
  img: `${LOADING_URL}/Garen_0.jpg`, // 战斗立绘
  avatar: `${CDN_URL}/img/champion/Garen.png`, // 头像
  passive: "坚韧: 战斗结束时恢复 6 HP",
};

// --- 2. 数据库 (Databases) ---

// 2.1 遗物数据库
const RELIC_DATABASE = {
  "DoransShield": {
    id: "DoransShield", name: "多兰之盾", price: 0, rarity: "COMMON",
    description: "战斗开始时获得 6 点护甲。",
    img: `${ITEM_URL}/1054.png`,
    onBattleStart: (state) => ({ ...state, block: state.block + 6 })
  },
  "LongSword": {
    id: "LongSword", name: "长剑", price: 150, rarity: "COMMON",
    description: "战斗开始时获得 1 点力量。",
    img: `${ITEM_URL}/1036.png`,
    onBattleStart: (state) => ({ ...state, status: { ...state.status, strength: state.status.strength + 1 } })
  },
  "RubyCrystal": {
    id: "RubyCrystal", name: "红水晶", price: 120, rarity: "COMMON",
    description: "最大生命值 +15 (购买时生效)。",
    img: `${ITEM_URL}/1028.png`,
    onPickup: (gameState) => ({ ...gameState, maxHp: gameState.maxHp + 15, currentHp: gameState.currentHp + 15 })
  },
  "VampiricScepter": {
    id: "VampiricScepter", name: "吸血鬼节杖", price: 280, rarity: "UNCOMMON",
    description: "每次打出攻击牌恢复 1 点生命。",
    img: `${ITEM_URL}/1053.png`,
  },
  "SunfireAegis": {
    id: "SunfireAegis", name: "日炎圣盾", price: 350, rarity: "RARE",
    description: "每回合开始对敌人造成 3 点伤害。",
    img: `${ITEM_URL}/3068.png`,
    onTurnStart: (enemyState) => ({ ...enemyState, hp: Math.max(0, enemyState.hp - 3) })
  },
};

// 2.2 敌人数据库 (全英雄阵容)
const ENEMY_POOL = {
  "Katarina": {
    id: "Katarina", name: "卡特琳娜", title: "不祥之刃",
    maxHp: 42,
    img: `${LOADING_URL}/Katarina_0.jpg`, // 战斗立绘
    avatar: `${CDN_URL}/img/champion/Katarina.png`, // 地图图标
    actions: [
      { type: 'ATTACK', value: 6, count: 2, name: "瞬步连击" },
      { type: 'DEBUFF', value: 0, name: "死亡莲华", effect: "VULNERABLE", effectValue: 2 },
      { type: 'ATTACK', value: 15, name: "匕首投掷" }
    ]
  },
  "Talon": {
    id: "Talon", name: "泰隆", title: "刀锋之影",
    maxHp: 48,
    img: `${LOADING_URL}/Talon_0.jpg`,
    avatar: `${CDN_URL}/img/champion/Talon.png`,
    actions: [
      { type: 'ATTACK', value: 12, name: "诺克萨斯外交" },
      { type: 'ATTACK', value: 8, name: "刺客诡道" }, // 简单化
      { type: 'BUFF', value: 0, name: "翻墙跑路", effect: "BLOCK", effectValue: 10 }
    ]
  },
  "Sylas": {
    id: "Sylas", name: "塞拉斯", title: "解脱者",
    maxHp: 65,
    img: `${LOADING_URL}/Sylas_0.jpg`,
    avatar: `${CDN_URL}/img/champion/Sylas.png`,
    actions: [
      { type: 'ATTACK', value: 10, name: "锁链鞭击" },
      { type: 'DEBUFF', value: 0, name: "弑君突刺", effect: "WEAK", effectValue: 2 },
      { type: 'ATTACK', value: 5, count: 3, name: "其人之道" }
    ]
  },
  "Fiora": {
    id: "Fiora", name: "菲奥娜", title: "无双剑姬",
    maxHp: 60,
    img: `${LOADING_URL}/Fiora_0.jpg`,
    avatar: `${CDN_URL}/img/champion/Fiora.png`,
    actions: [
      { type: 'ATTACK', value: 14, name: "破空斩" },
      { type: 'BUFF', value: 0, name: "心眼刀", effect: "BLOCK", effectValue: 15 },
      { type: 'ATTACK', value: 8, name: "夺命连刺" }
    ]
  },
  "Darius": {
    id: "Darius", name: "德莱厄斯", title: "诺克萨斯之手",
    maxHp: 150,
    img: `${LOADING_URL}/Darius_0.jpg`,
    avatar: `${CDN_URL}/img/champion/Darius.png`,
    actions: [
      { type: 'ATTACK', value: 15, name: "大杀四方" },
      { type: 'DEBUFF', value: 0, name: "致残打击", effect: "WEAK", effectValue: 3 },
      { type: 'ATTACK', value: 30, name: "断头台！" }
    ]
  }
};

// 2.3 卡牌数据库
const CARD_DATABASE = {
  "GarenQ": { id: "GarenQ", name: "致命打击", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "造成 8 点伤害。给予 2 层易伤。", img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", name: "勇气", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "获得 12 点护甲。净化。", img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },
  "GarenE": { id: "GarenE", name: "审判", price: 75, type: "ATTACK", cost: 2, value: 6, isMultiHit: true, hits: 3, description: "造成 3 次 6 点伤害。", img: `${SPELL_URL}/GarenE.png`, rarity: "COMMON" },
  "GarenR": { id: "GarenR", name: "德玛西亚正义", price: 150, type: "ATTACK", cost: 3, value: 50, exhaust: true, description: "造成 50 点真实伤害。消耗。", img: `${SPELL_URL}/GarenR.png`, rarity: "RARE" },
  "Strike": { id: "Strike", name: "打击", price: 0, type: "ATTACK", cost: 1, value: 6, description: "造成 6 点伤害。", img: `${CDN_URL}/img/passive/Garen_Passive.png`, rarity: "BASIC" },
  "Defend": { id: "Defend", name: "防御", price: 0, type: "SKILL", cost: 1, block: 5, description: "获得 5 点护甲。", img: `${ITEM_URL}/1029.png`, rarity: "BASIC" },
  "Ignite": { id: "Ignite", name: "点燃", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "获得 2 点力量。消耗。", img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", name: "治疗术", price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "恢复 10 点生命。消耗。", img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
};

const STARTING_DECK = ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "GarenQ", "Ignite"];

// --- 3. 工具函数 ---

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 10层地图生成算法
const generateMap = () => {
  const map = [];
  // 1-3: 基础
  map.push([{ id: '1-0', type: 'BATTLE', enemyId: 'Katarina', status: 'AVAILABLE', next: ['2-0'] }]);
  map.push([{ id: '2-0', type: 'BATTLE', enemyId: 'Talon', status: 'LOCKED', next: ['3-0', '3-1'] }]);
  
  // 3: 分支
  map.push([
    { id: '3-0', type: 'BATTLE', enemyId: 'Fiora', status: 'LOCKED', next: ['4-0'] },
    { id: '3-1', type: 'SHOP', status: 'LOCKED', next: ['4-0'] }
  ]);

  // 4: 休息
  map.push([{ id: '4-0', type: 'REST', status: 'LOCKED', next: ['5-0'] }]);

  // 5-7: 进阶
  map.push([{ id: '5-0', type: 'BATTLE', enemyId: 'Sylas', status: 'LOCKED', next: ['6-0', '6-1'] }]);
  map.push([
    { id: '6-0', type: 'EVENT', status: 'LOCKED', next: ['7-0'] },
    { id: '6-1', type: 'SHOP', status: 'LOCKED', next: ['7-0'] }
  ]);
  map.push([{ id: '7-0', type: 'BATTLE', enemyId: 'Katarina', status: 'LOCKED', next: ['8-0'] }]);

  // 8: 精英
  map.push([{ id: '8-0', type: 'BATTLE', enemyId: 'Fiora', status: 'LOCKED', next: ['9-0'] }]);

  // 9: 休息前夕
  map.push([{ id: '9-0', type: 'REST', status: 'LOCKED', next: ['10-0'] }]);

  // 10: BOSS
  map.push([{ id: '10-0', type: 'BOSS', enemyId: 'Darius', status: 'LOCKED', next: [] }]);

  return map;
};

// --- 4. 子组件 ---

// 4.0 背景音乐组件
const AudioPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);

    useEffect(() => {
        if(audioRef.current) {
            audioRef.current.volume = volume;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
        }
    }, []);

    const togglePlay = () => {
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-black/50 p-2 rounded-full border border-[#C8AA6E]/50 hover:bg-black/80 transition-all">
            <audio ref={audioRef} src={BGM_URL} loop />
            <button onClick={togglePlay} className="text-[#C8AA6E] hover:text-white">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => {
                const newVol = volume === 0 ? 0.3 : 0;
                setVolume(newVol);
                if(audioRef.current) audioRef.current.volume = newVol;
            }} className="text-[#C8AA6E] hover:text-white">
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
    );
};


// 4.1 地图视图
const MapView = ({ mapData, onNodeSelect, currentFloor }) => {
  const getMapIcon = (node) => {
      if (node.type === 'BOSS') return `${CDN_URL}/img/champion/Darius.png`; 
      if (node.type === 'REST') return `${ITEM_URL}/2003.png`; 
      if (node.type === 'SHOP') return `${ITEM_URL}/3400.png`; 
      if (node.type === 'EVENT') return `${ITEM_URL}/3340.png`; 
      if (node.type === 'BATTLE' && node.enemyId) return ENEMY_POOL[node.enemyId].avatar; 
      return null;
  };

  // 节点类型文字高亮样式
  const getTypeStyle = (type) => {
      switch(type) {
          case 'BOSS': return "text-red-500 border-red-600/50 shadow-[0_0_10px_red]";
          case 'REST': return "text-blue-400 border-blue-500/50";
          case 'SHOP': return "text-yellow-400 border-yellow-500/50";
          case 'EVENT': return "text-purple-400 border-purple-500/50";
          case 'BATTLE': return "text-slate-200 border-slate-500/50";
          default: return "text-slate-400";
      }
  }

  return (
    <div className="flex flex-col items-center h-full w-full relative overflow-hidden bg-[#0c0c12]">
      {/* 修复1：地图背景优化 - 加深遮罩至80% */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/80 z-10" />
          <div className="absolute inset-0 bg-cover bg-center opacity-50" 
               style={{ backgroundImage: `url('${MAP_BG_URL}')` }}>
          </div>
      </div>
      
      <div className="relative z-20 w-full h-full flex flex-col-reverse items-center overflow-y-auto py-20 gap-16 hide-scrollbar">
        {mapData.map((floor, floorIndex) => (
          <div key={floorIndex} className="flex justify-center gap-24 relative group">
            {floor.map((node) => {
               const isAvailable = node.status === 'AVAILABLE';
               const isCompleted = node.status === 'COMPLETED';
               const isLocked = node.status === 'LOCKED';
               const iconUrl = getMapIcon(node);
               const labelText = node.type === 'BATTLE' ? ENEMY_POOL[node.enemyId].name : node.type;

               return (
                 <div key={node.id} className="relative flex flex-col items-center">
                    {/* 连线加亮 */}
                    {floorIndex < mapData.length - 1 && node.next.length > 0 && (
                        <div className={`absolute bottom-full w-0.5 h-16 -z-10 origin-bottom transform ${isLocked ? 'bg-slate-800' : 'bg-[#C8AA6E] shadow-[0_0_10px_#C8AA6E]'}`}></div>
                    )}

                    <button 
                      onClick={() => isAvailable && onNodeSelect(node)}
                      disabled={!isAvailable}
                      className={`
                        w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-black
                        ${isAvailable ? `border-[#C8AA6E] scale-110 shadow-[0_0_30px_#C8AA6E] cursor-pointer hover:scale-125 ring-2 ring-[#C8AA6E]/50` : 'border-slate-600'}
                        ${isCompleted ? 'opacity-40 grayscale border-slate-500' : ''}
                        ${isLocked ? 'opacity-20 blur-[1px]' : ''}
                      `}
                    >
                      <img src={iconUrl} className="w-full h-full object-cover" alt={node.type} />
                      {isCompleted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[#C8AA6E] text-4xl font-bold">✓</span></div>}
                    </button>
                    
                    {/* 修复2：高亮标签显示
                        不管是否锁定，都显示类型，方便用户决策。如果是可选状态，则更亮。
                     */}
                    <div className={`
                        absolute -bottom-8 px-3 py-1 rounded-full border bg-black/90 backdrop-blur-md whitespace-nowrap
                        font-bold text-xs tracking-widest uppercase transition-all
                        ${getTypeStyle(node.type)}
                        ${isAvailable ? 'scale-110 shadow-lg z-30' : 'opacity-70 scale-90'}
                    `}>
                        {labelText}
                    </div>
                 </div>
               )
            })}
          </div>
        ))}
      </div>
    </div>
  )
};

// 4.2 商店视图 (无变动)
const ShopView = ({ onLeave, onBuyCard, onBuyRelic, gold, deck, relics }) => {
    const cardStock = useMemo(() => shuffle(Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC')).slice(0, 5), []);
    const relicStock = useMemo(() => Object.values(RELIC_DATABASE).filter(r => !relics.includes(r.id)).slice(0, 3), [relics]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const handleBuy = (item, type) => {
        if (gold >= item.price && !purchasedItems.includes(item.id)) {
            setPurchasedItems([...purchasedItems, item.id]);
            if (type === 'CARD') onBuyCard(item);
            if (type === 'RELIC') onBuyRelic(item);
        }
    };
    return (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-6xl px-10 py-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#C8AA6E] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#C8AA6E] overflow-hidden bg-black">
                            <img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#C8AA6E]">黑市商人</h2>
                            <p className="text-[#A09B8C] italic">"只要给钱，什么都卖。"</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600">
                        <Coins size={32} /> {gold}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-12 flex-1 overflow-y-auto">
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-blue-500 pl-3">技能卷轴</h3>
                        <div className="flex flex-wrap gap-4">
                            {cardStock.map(card => {
                                const isBought = purchasedItems.includes(card.id);
                                const canAfford = gold >= card.price;
                                return (
                                    <div key={card.id} onClick={() => !isBought && handleBuy(card, 'CARD')} className={`w-32 h-48 relative group transition-all ${isBought ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-105 cursor-pointer'}`}>
                                        <img src={card.img} className="w-full h-full object-cover rounded border border-slate-600" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-center py-1 text-xs font-bold text-[#C8AA6E] border-t border-[#C8AA6E]">{card.price} G</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-purple-500 pl-3">海克斯装备</h3>
                        <div className="flex flex-wrap gap-6">
                            {relicStock.map(relic => {
                                const isBought = purchasedItems.includes(relic.id);
                                return (
                                    <div key={relic.id} onClick={() => !isBought && handleBuy(relic, 'RELIC')} className={`w-20 h-20 relative group transition-all ${isBought ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-110 cursor-pointer'}`}>
                                        <img src={relic.img} className="w-full h-full object-cover rounded-lg border-2 border-[#C8AA6E] shadow-[0_0_10px_#C8AA6E]" />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 rounded text-yellow-400 font-bold text-sm whitespace-nowrap">{relic.price} G</div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black border border-[#C8AA6E] p-3 z-50 hidden group-hover:block text-center pointer-events-none">
                                            <div className="font-bold text-[#F0E6D2]">{relic.name}</div>
                                            <div className="text-xs text-[#A09B8C]">{relic.description}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30">
                    <button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">离开 <ChevronRight /></button>
                </div>
            </div>
        </div>
    )
}

// 4.3 事件视图 (无变动)
const EventView = ({ onLeave, onReward }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#0AC8B9]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden">
                <img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl font-bold text-[#0AC8B9] mb-6">神秘信号</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">
                你在草丛中发现了一个遗落的守卫眼，旁边似乎还散落着一些物资...
            </p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left">
                    <div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div>
                    <div><div className="font-bold text-[#F0E6D2]">训练</div><div className="text-sm text-slate-400">永久获得 <span className="text-red-400">+2 力量</span></div></div>
                </button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left">
                    <div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div>
                    <div><div className="font-bold text-[#F0E6D2]">搜寻</div><div className="text-sm text-slate-400">获得一件 <span className="text-purple-400">随机装备</span></div></div>
                </button>
            </div>
        </div>
    </div>
);

// 4.4 战利品视图 (无变动)
const RewardView = ({ onSkip, onCardSelect, goldReward }) => {
  const rewards = useMemo(() => {
    const allCards = Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC');
    return shuffle(allCards).slice(0, 3);
  }, []);
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
       <h2 className="text-4xl font-bold text-[#C8AA6E] mb-2">胜利!</h2>
       <p className="text-[#F0E6D2] mb-8 flex items-center gap-2 text-xl"><Coins className="text-yellow-400"/> +{goldReward} 金币</p>
       <h3 className="text-xl text-white mb-6 uppercase tracking-widest">选择战利品</h3>
       <div className="flex gap-6 mb-10">
          {rewards.map((card, idx) => (
             <div key={idx} onClick={() => onCardSelect(card.id)} className="w-48 h-72 bg-[#1E2328] border-2 border-[#C8AA6E] rounded-xl hover:scale-105 transition-transform cursor-pointer flex flex-col overflow-hidden group shadow-xl">
                <div className="h-32 bg-black relative"><img src={card.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /></div>
                <div className="p-4 flex-1 flex flex-col items-center text-center">
                    <h4 className="font-bold text-[#F0E6D2] mb-2">{card.name}</h4>
                    <p className="text-xs text-[#A09B8C]">{card.description}</p>
                    <div className="mt-auto text-xs font-bold text-[#C8AA6E] uppercase">{card.rarity}</div>
                </div>
             </div>
          ))}
       </div>
       <button onClick={onSkip} className="px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest">跳过</button>
    </div>
  );
};

// 4.5 休息点 (无变动)
const RestView = ({ onRest }) => (
    <div className="absolute inset-0 z-50 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col gap-8 text-center items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#0AC8B9] overflow-hidden bg-black shadow-[0_0_50px_#0AC8B9]">
                 <img src={`${ITEM_URL}/2003.png`} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-5xl font-serif text-[#0AC8B9] drop-shadow-[0_0_10px_#0AC8B9]">泉水憩息</h2>
            <button onClick={onRest} className="group w-64 h-80 bg-slate-900/80 border-2 border-[#0AC8B9] rounded-xl flex flex-col items-center justify-center hover:bg-[#0AC8B9]/20 transition-all cursor-pointer">
                <Heart size={64} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">回复</h3>
                <p className="text-[#0AC8B9]">回复 30% 生命值</p>
            </button>
        </div>
    </div>
);

// --- 5. 主游戏容器 (Game Manager) ---
// 保持原有逻辑，仅视觉调整
export default function App() {
  const [view, setView] = useState('MAP');
  const [mapData, setMapData] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [masterDeck, setMasterDeck] = useState([...STARTING_DECK]);
  const [currentHp, setCurrentHp] = useState(HERO_DATA.maxHp);
  const [maxHp, setMaxHp] = useState(HERO_DATA.maxHp);
  const [gold, setGold] = useState(100);
  const [relics, setRelics] = useState(["DoransShield"]);
  const [baseStr, setBaseStr] = useState(0);
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    const newMap = generateMap();
    setMapData(newMap);
    setCurrentFloor(0);
  }, []);

  const handleNodeSelect = (node) => {
      setActiveNode(node);
      switch(node.type) {
          case 'BATTLE': case 'BOSS': setView('COMBAT'); break;
          case 'REST': setView('REST'); break;
          case 'SHOP': setView('SHOP'); break;
          case 'EVENT': setView('EVENT'); break;
          default: break;
      }
  };

  const completeNode = () => {
      const newMap = [...mapData];
      const floorNodes = newMap[currentFloor];
      const targetNode = floorNodes.find(n => n.id === activeNode.id);
      if(targetNode) targetNode.status = 'COMPLETED';
      const nextFloorIdx = currentFloor + 1;
      if (nextFloorIdx < newMap.length) {
          activeNode.next.forEach(nextId => {
              const nextNode = newMap[nextFloorIdx].find(n => n.id === nextId);
              if(nextNode) nextNode.status = 'AVAILABLE';
          });
          setCurrentFloor(nextFloorIdx);
          setView('MAP');
      } else { setView('VICTORY_ALL'); }
  };

  const handleBattleWin = (remainingHp) => { setCurrentHp(Math.min(maxHp, remainingHp + 6)); setView('REWARD'); };
  const handleBuyCard = (card) => { setGold(prev => prev - card.price); setMasterDeck(prev => [...prev, card.id]); };
  const handleBuyRelic = (relic) => {
      setGold(prev => prev - relic.price); setRelics(prev => [...prev, relic.id]);
      if (relic.onPickup) { const ns = relic.onPickup({ maxHp, currentHp }); setMaxHp(ns.maxHp); setCurrentHp(ns.currentHp); }
  };
  const handleEventReward = (reward) => {
      if (reward.type === 'BUFF' && reward.stat === 'strength') setBaseStr(prev => prev + reward.value);
      if (reward.type === 'RELIC_RANDOM') {
          const pool = Object.values(RELIC_DATABASE).filter(r => !relics.includes(r.id));
          if (pool.length > 0) setRelics(prev => [...prev, pool[Math.floor(Math.random() * pool.length)].id]);
      }
      completeNode();
  };
  const handleCardReward = (cardId) => { setMasterDeck([...masterDeck, cardId]); setGold(gold + 50); completeNode(); };
  const handleSkipReward = () => { setGold(gold + 50); completeNode(); };
  const handleRest = () => { setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.3))); completeNode(); };
  const restartGame = () => {
      setMasterDeck([...STARTING_DECK]); setCurrentHp(HERO_DATA.maxHp); setMaxHp(HERO_DATA.maxHp); setGold(100); setRelics(["DoransShield"]); setBaseStr(0);
      setMapData(generateMap()); setCurrentFloor(0); setView('MAP');
  };

  const renderView = () => {
      switch(view) {
          case 'MAP': return <MapView mapData={mapData} onNodeSelect={handleNodeSelect} currentFloor={currentFloor} />;
          case 'SHOP': return <ShopView gold={gold} deck={masterDeck} relics={relics} onLeave={() => completeNode()} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} />;
          case 'EVENT': return <EventView onLeave={() => completeNode()} onReward={handleEventReward} />;
          case 'COMBAT': return <BattleScene heroData={{...HERO_DATA, maxHp, currentHp, relics, baseStr}} enemyId={activeNode.enemyId} initialDeck={masterDeck} onWin={handleBattleWin} onLose={() => setView('GAMEOVER')} />;
          case 'REWARD': return <RewardView goldReward={50} onCardSelect={handleCardReward} onSkip={handleSkipReward} />;
          case 'REST': return <RestView onRest={handleRest} />;
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">德玛西亚万岁！</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">再来一局</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">战败</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">重新开始</button></div>;
          default: return <div>Loading...</div>;
      }
  };

  return (
      <div className="relative h-screen w-full bg-[#091428] font-sans select-none overflow-hidden">
          <AudioPlayer />
          {view !== 'GAMEOVER' && view !== 'VICTORY_ALL' && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent z-50 flex items-center justify-between px-8 pointer-events-none">
                  <div className="flex items-center gap-6 pointer-events-auto">
                      <div className="relative group">
                          <img src={HERO_DATA.avatar} className="w-12 h-12 rounded-full border-2 border-[#C8AA6E] shadow-lg" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-xs font-bold text-[#C8AA6E]">{currentFloor+1}F</div>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[#F0E6D2] font-bold text-lg shadow-black drop-shadow-md">{HERO_DATA.name}</span>
                          <div className="flex items-center gap-4 text-sm font-bold">
                              <span className="text-red-400 flex items-center gap-1"><Heart size={14} fill="currentColor"/> {currentHp}/{maxHp}</span>
                              <span className="text-yellow-400 flex items-center gap-1"><Coins size={14} fill="currentColor"/> {gold}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2 pointer-events-auto mr-24">
                      {relics.map((rid, i) => (
                          <div key={i} className="w-10 h-10 rounded border border-[#C8AA6E]/50 bg-black/50 relative group cursor-help hover:scale-110 transition-transform">
                              <img src={RELIC_DATABASE[rid].img} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
              </div>
          )}
          {renderView()}
      </div>
  );
}

// --- 6. 战斗场景 (修复3: 布局防遮挡) ---

const BattleScene = ({ heroData, enemyId, initialDeck, onWin, onLose }) => {
  const enemyConfig = ENEMY_POOL[enemyId];
  const [gameState, setGameState] = useState('PLAYER_TURN');
  const [playerHp, setPlayerHp] = useState(heroData.currentHp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerMana, setPlayerMana] = useState(heroData.maxMana);
  const [enemyHp, setEnemyHp] = useState(enemyConfig.maxHp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [nextEnemyAction, setNextEnemyAction] = useState(enemyConfig.actions[0]);
  
  const [drawPile, setDrawPile] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [dmgOverlay, setDmgOverlay] = useState(null);
  
  const [heroAnim, setHeroAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");

  const [playerStatus, setPlayerStatus] = useState({ strength: heroData.baseStr || 0, weak: 0, vulnerable: 0 });
  const [enemyStatus, setEnemyStatus] = useState({ strength: 0, weak: 0, vulnerable: 0 });

  useEffect(() => {
    const deck = shuffle([...initialDeck]);
    setDrawPile(deck);
    let block = 0; let str = heroData.baseStr || 0;
    if(heroData.relics.includes("DoransShield")) block += 6;
    if(heroData.relics.includes("LongSword")) str += 1;
    setPlayerBlock(block);
    setPlayerStatus(prev => ({ ...prev, strength: str }));
    startTurn(deck, []);
  }, []);

  const triggerAnim = (target, type) => {
      if(target === 'HERO') { setHeroAnim(type); setTimeout(() => setHeroAnim(""), 500); }
      if(target === 'ENEMY') { setEnemyAnim(type); setTimeout(() => setEnemyAnim(""), 500); }
  };

  const startTurn = (currDraw, currDiscard) => {
    setGameState('PLAYER_TURN'); setPlayerMana(heroData.maxMana); setPlayerBlock(0);
    let newDraw = [...currDraw], newDiscard = [...currDiscard], newHand = [];
    for(let i=0; i<5; i++) {
        if(newDraw.length===0) { if(newDiscard.length===0) break; newDraw=shuffle([...newDiscard]); newDiscard=[]; }
        newHand.push(newDraw.pop());
    }
    setDrawPile(newDraw); setDiscardPile(newDiscard); setHand(newHand);
    setNextEnemyAction(enemyConfig.actions[Math.floor(Math.random()*enemyConfig.actions.length)]);
  };

  const playCard = (index) => {
      if(gameState!=='PLAYER_TURN') return;
      const card = CARD_DATABASE[hand[index]];
      if(playerMana < card.cost) return;
      
      setPlayerMana(p => p - card.cost);
      const newHand = [...hand]; newHand.splice(index, 1); setHand(newHand);
      if(card.exhaust) {/*...*/ } else setDiscardPile(p => [...p, card.id]);

      if(card.effect === 'VULNERABLE') setEnemyStatus(s => ({ ...s, vulnerable: s.vulnerable + card.effectValue }));
      if(card.effect === 'STRENGTH') setPlayerStatus(s => ({ ...s, strength: s.strength + card.effectValue }));
      if(card.effect === 'CLEANSE') setPlayerStatus(s => ({ ...s, weak: 0, vulnerable: 0 }));
      if(card.effect === 'HEAL') setPlayerHp(h => Math.min(heroData.maxHp, h + card.effectValue));

      if(card.type === 'ATTACK') {
          triggerAnim('HERO', 'attack');
          setTimeout(() => triggerAnim('ENEMY', 'hit'), 200);
          let dmg = card.value + playerStatus.strength;
          if (playerStatus.weak > 0) dmg = Math.floor(dmg * 0.75);

          const hits = card.isMultiHit ? card.hits : 1;
          let total = 0;
          for(let i=0; i<hits; i++) {
              let finalDmg = dmg;
              if (enemyStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);

              let dmgToHp = finalDmg;
              if (enemyBlock > 0) {
                  if (enemyBlock >= finalDmg) { setEnemyBlock(b => b - finalDmg); dmgToHp = 0; }
                  else { dmgToHp = finalDmg - enemyBlock; setEnemyBlock(0); }
              }
              setEnemyHp(h => Math.max(0, h - dmgToHp));
              total += dmgToHp;
          }
          setDmgOverlay({val: total, target: 'ENEMY'});
          setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(card.block) setPlayerBlock(b => b + card.block);
  };

  useEffect(() => { if(enemyHp<=0) setTimeout(()=>onWin(playerHp), 1000); }, [enemyHp]);
  useEffect(() => { if(playerHp<=0) setTimeout(onLose, 1000); }, [playerHp]);

  const endTurn = () => {
      setDiscardPile([...discardPile, ...hand]); setHand([]); setGameState('ENEMY_TURN');
      setPlayerStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)}));
      setEnemyStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)}));
      setTimeout(enemyAction, 1000);
  };

  const enemyAction = () => {
      if(enemyHp<=0) return;
      triggerAnim('ENEMY', 'attack');
      const act = nextEnemyAction;

      if(act.type === 'ATTACK') {
          setTimeout(() => triggerAnim('HERO', 'hit'), 200);
          let dmg = act.value + enemyStatus.strength;
          if(enemyStatus.weak > 0) dmg = Math.floor(dmg * 0.75);

          let total = 0;
          let remBlock = playerBlock;
          let currHp = playerHp;
          const count = act.count || 1;
          for(let i=0; i<count; i++) {
             let finalDmg = dmg;
             if(playerStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
             if(remBlock >= finalDmg) remBlock -= finalDmg;
             else { let pierce = finalDmg - remBlock; remBlock = 0; currHp -= pierce; }
             total += finalDmg;
          }
          setPlayerBlock(remBlock); setPlayerHp(currHp);
          setDmgOverlay({val: total, target: 'PLAYER'});
          setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(act.type === 'BUFF') setEnemyBlock(b => b + act.effectValue);
      if(act.type === 'DEBUFF') {
          if(act.effect === 'WEAK') setPlayerStatus(s => ({...s, weak: s.weak + act.effectValue}));
          if(act.effect === 'VULNERABLE') setPlayerStatus(s => ({...s, vulnerable: s.vulnerable + act.effectValue}));
      }
      setEnemyBlock(0);
      setTimeout(() => startTurn(drawPile, discardPile), 1000);
  };

  const renderStatus = (status) => (
    <div className="flex gap-1 mt-1 flex-wrap">
        {status.strength > 0 && <div className="flex items-center text-[10px] text-red-400 bg-red-900/40 px-1 rounded border border-red-900 shadow-sm"><Sword size={10} className="mr-1"/> {status.strength}</div>}
        {status.weak > 0 && <div className="flex items-center text-[10px] text-yellow-400 bg-yellow-900/40 px-1 rounded border border-yellow-900 shadow-sm"><Activity size={10} className="mr-1"/> 虚弱 {status.weak}</div>}
        {status.vulnerable > 0 && <div className="flex items-center text-[10px] text-purple-400 bg-purple-900/40 px-1 rounded border border-purple-900 shadow-sm"><Zap size={10} className="mr-1"/> 易伤 {status.vulnerable}</div>}
    </div>
  );

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: `url(${SPLASH_URL}/SummonersRift_1.jpg)`}}></div>
        
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             {/* 修复3：玩家立绘位置上移至 42%，彻底避开手牌区域 */}
             <div className={`
                absolute left-10 bottom-[42%] w-64 h-[500px] transition-all duration-200
                ${heroAnim === 'attack' ? 'translate-x-32' : ''}
                ${heroAnim === 'hit' ? 'translate-x-[-10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 <img src={heroData.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[#C8AA6E]" />
                 <div className="absolute -bottom-16 w-full bg-black/80 border border-[#C8AA6E] p-2 rounded flex flex-col gap-1 shadow-lg">
                     <div className="flex justify-between text-xs text-[#C8AA6E] font-bold">
                        <span>HP {playerHp}/{heroData.maxHp}</span>
                        {playerBlock > 0 && <span className="text-blue-400 flex items-center gap-1"><Shield size={12}/>{playerBlock}</span>}
                     </div>
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(playerHp/heroData.maxHp)*100}%`}}></div>
                     </div>
                     {renderStatus(playerStatus)}
                 </div>
             </div>

             <div className="text-6xl font-black text-[#C8AA6E]/20 italic">VS</div>

             {/* 敌人立绘同步上移 */}
             <div className={`
                absolute right-10 bottom-[42%] w-64 h-[500px] transition-all duration-200
                ${enemyAnim === 'attack' ? '-translate-x-32' : ''}
                ${enemyAnim === 'hit' ? 'translate-x-[10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 <img src={enemyConfig.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-red-800" />
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-red-600 px-3 py-1 rounded flex items-center gap-2 animate-bounce">
                      {nextEnemyAction.type==='ATTACK' ? <Sword size={20} className="text-red-500"/> : <Shield size={20} className="text-blue-400"/>}
                      <span className="text-white font-bold text-lg">{nextEnemyAction.value}{nextEnemyAction.count>1?`x${nextEnemyAction.count}`:''}</span>
                 </div>
                 <div className="absolute -bottom-16 w-full bg-black/80 border border-red-800 p-2 rounded flex flex-col gap-1 shadow-lg">
                     <div className="flex justify-between text-xs text-red-500 font-bold">
                        <span>{enemyConfig.name}</span>
                        <span>{enemyHp}/{enemyConfig.maxHp}</span>
                     </div>
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(enemyHp/enemyConfig.maxHp)*100}%`}}></div>
                     </div>
                     {enemyBlock > 0 && <div className="text-blue-400 text-xs font-bold flex items-center gap-1"><Shield size={10}/> 格挡 {enemyBlock}</div>}
                     {renderStatus(enemyStatus)}
                 </div>
             </div>
        </div>

        {dmgOverlay && (
            <div className={`absolute top-1/2 ${dmgOverlay.target==='ENEMY'?'right-1/4':'left-1/4'} -translate-y-1/2 text-8xl font-black text-white drop-shadow-[0_0_10px_red] animate-ping z-50`}>
                {dmgOverlay.val}
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-end justify-center pb-6 gap-4">
            <div className="absolute left-8 bottom-8 w-24 h-24 rounded-full bg-[#091428] border-4 border-[#C8AA6E] flex items-center justify-center shadow-[0_0_30px_#0066FF]">
                <span className="text-4xl font-bold text-white">{playerMana}</span>
                <span className="absolute bottom-2 text-[10px] text-[#C8AA6E]">MANA</span>
            </div>

            {hand.map((cid, i) => {
                const c = CARD_DATABASE[cid];
                const canPlay = playerMana >= c.cost;
                return (
                    <div key={i} onClick={()=>playCard(i)} 
                         className={`
                            w-40 h-60 bg-[#1E2328] border-2 rounded-lg relative flex flex-col items-center overflow-hidden shadow-2xl transition-all duration-200 group
                            ${canPlay ? 'border-[#C8AA6E] hover:-translate-y-12 hover:scale-110 cursor-pointer z-30' : 'border-slate-700 opacity-60'}
                         `}>
                        {/* 图片区域加高到 60% */}
                        <div className="w-full h-36 bg-black overflow-hidden relative">
                            <img src={c.img} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                            <div className="absolute top-2 left-2 w-8 h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-lg shadow-md">{c.cost}</div>
                        </div>
                        {/* 文本区域压缩 */}
                        <div className="flex-1 p-2 text-center flex flex-col w-full">
                            <div className="text-sm font-bold text-[#F0E6D2] mb-1 line-clamp-1">{c.name}</div>
                            <div className="text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-3">{c.description}</div>
                            <div className="mt-auto text-[9px] text-slate-500 uppercase font-bold tracking-wider">{c.type}</div>
                        </div>
                    </div>
                )
            })}
            
            <button onClick={endTurn} disabled={gameState!=='PLAYER_TURN'} className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-[#C8AA6E] border-4 border-[#F0E6D2] flex items-center justify-center font-bold text-[#091428] shadow-lg hover:scale-105 hover:bg-white active:scale-95 transition-all">
                结束<br/>回合
            </button>
        </div>
    </div>
  );
};