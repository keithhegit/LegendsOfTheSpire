import React, { useMemo, useState } from 'react';
import { Coins, ChevronRight, ArrowUpCircle, Zap } from 'lucide-react';
import { shuffle } from '../utils/gameLogic';
import { CARD_DATABASE } from '../data/cards';
import { RELIC_DATABASE } from '../data/relics';
import { ITEM_URL } from '../data/constants';
import RelicTooltip from './shared/RelicTooltip';

const ShopView = ({ onLeave, onBuyCard, onBuyRelic, onUpgradeCard, onBuyMana, gold, relics, deck, championName }) => {
    const cardStock = useMemo(() => shuffle(Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC' && (c.hero === 'Neutral' || c.hero === championName))).slice(0, 5), [championName]);
    const relicStock = useMemo(() => Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)).slice(0, 3), [relics]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [showUpgrade, setShowUpgrade] = useState(false);
    
    // 计算可升级的卡牌（排除已升级的）
    const upgradableCards = useMemo(() => {
        if (!deck) return [];
        // 过滤掉已经升级过的卡牌（带+号的）
        // 注意：deck 是 cardId 数组
        return [...new Set(deck.filter(id => !id.endsWith('+')))].map(id => CARD_DATABASE[id]).filter(Boolean);
    }, [deck]);

    const handleBuy = (item, type) => { 
        if (gold >= item.price && !purchasedItems.includes(item.id)) { 
            setPurchasedItems([...purchasedItems, item.id]); 
            if (type === 'CARD') onBuyCard(item); 
            if (type === 'RELIC') onBuyRelic(item); 
        } 
    };
    
    const handleBuyMana = () => {
        if (gold >= 200 && !purchasedItems.includes('MANA_UP')) {
             setPurchasedItems([...purchasedItems, 'MANA_UP']);
             onBuyMana();
        }
    };

    const handleUpgrade = (cardId) => {
        if (gold >= 100) {
            onUpgradeCard(cardId);
            setShowUpgrade(false); // 关闭升级界面
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            
            {showUpgrade && (
                <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-in fade-in">
                    <h3 className="text-3xl text-[#C8AA6E] mb-8 font-bold">选择一张卡牌升级 (100 G)</h3>
                    <div className="grid grid-cols-5 gap-4 max-w-5xl overflow-y-auto p-4 max-h-[70vh]">
                        {upgradableCards.map((card, idx) => (
                             <div key={`${card.id}-${idx}`} onClick={() => handleUpgrade(card.id)} className="w-32 h-48 bg-[#1E2328] border border-slate-600 rounded hover:scale-105 hover:border-green-500 cursor-pointer transition-all relative group">
                                <img src={card.img} className="w-full h-20 object-cover opacity-70 group-hover:opacity-100" />
                                <div className="p-2">
                                    <div className="text-xs font-bold text-[#F0E6D2]">{card.name}</div>
                                    <div className="text-[10px] text-green-400 mt-2">升级后: 数值+3</div>
                                </div>
                             </div>
                        ))}
                    </div>
                    <button onClick={() => setShowUpgrade(false)} className="mt-8 px-8 py-2 border border-slate-600 text-slate-400 hover:text-white rounded">取消</button>
                </div>
            )}

            <div className="relative z-10 w-full max-w-6xl px-10 py-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#C8AA6E] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#C8AA6E] overflow-hidden bg-black"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                        <div><h2 className="text-3xl font-bold text-[#C8AA6E]">黑市商人</h2><p className="text-[#A09B8C] italic">"只要给钱，什么都卖。"</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600"><Coins size={32} /> {gold}</div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setShowUpgrade(true)} 
                        disabled={gold < 100 || upgradableCards.length === 0}
                        className={`px-6 py-3 bg-slate-800 border border-green-600 rounded flex items-center gap-2 transition-all ${gold >= 100 ? 'hover:bg-green-900/50 text-green-400' : 'opacity-50 grayscale cursor-not-allowed text-slate-500'}`}
                    >
                        <ArrowUpCircle /> 升级卡牌 (100 G)
                    </button>
                    
                    {/* 20% 概率出现的特殊商品 (这里简化为始终显示但有购买限制，或者随机显示) */}
                    <button 
                         onClick={handleBuyMana}
                         disabled={gold < 200 || purchasedItems.includes('MANA_UP')}
                         className={`px-6 py-3 bg-slate-800 border border-blue-600 rounded flex items-center gap-2 transition-all ${gold >= 200 && !purchasedItems.includes('MANA_UP') ? 'hover:bg-blue-900/50 text-blue-400' : 'opacity-50 grayscale cursor-not-allowed text-slate-500'}`}
                    >
                        <Zap /> 法力上限 +1 (200 G)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-12 flex-1 overflow-y-auto">
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-blue-500 pl-3">技能卷轴</h3>
                        <div className="flex flex-wrap gap-4">
                            {cardStock.map(card => {
                                const isBought = purchasedItems.includes(card.id);
                                return (
                                    <div key={card.id} onClick={() => !isBought && handleBuy(card, 'CARD')} className={`w-32 h-48 relative group transition-all ${isBought ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-105 cursor-pointer'}`}>
                                        <img src={card.img} className="w-full h-full object-cover rounded border border-slate-600" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-center py-1 text-xs font-bold text-[#C8AA6E] border-t border-[#C8AA6E]">{card.price} G</div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black border border-[#C8AA6E] p-2 z-50 hidden group-hover:block text-center pointer-events-none text-xs text-white"><div className="font-bold mb-1">{card.name}</div>{card.description}</div>
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
                                        <RelicTooltip relic={relic}><div className="w-full h-full absolute inset-0"></div></RelicTooltip>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30"><button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">离开 <ChevronRight /></button></div>
            </div>
        </div>
    )
}

export default ShopView;
