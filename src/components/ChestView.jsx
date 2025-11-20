import React, { useState, useMemo } from 'react';
import { ITEM_URL } from '../data/constants';
import { RELIC_DATABASE } from '../data/relics';
import { shuffle } from '../utils/gameLogic';

const ChestView = ({ onLeave, onRelicReward, relics }) => {
    const availableRelics = Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && r.rarity !== 'BASIC' && !relics.includes(r.id));
    const rewards = useMemo(() => shuffle(availableRelics).slice(0, 3), [relics]);
    const [rewardChosen, setRewardChosen] = useState(false);
    const handleChoose = (relic) => { if (rewardChosen) return; setRewardChosen(true); onRelicReward(relic); };
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative z-10 max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden bg-black flex items-center justify-center"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">海克斯宝箱</h2>
                <p className="text-[#F0E6D2] text-lg mb-8">打开宝箱，选择一件强大的装备来武装自己。</p>
                <div className="flex justify-center gap-8">
                    {rewards.map((relic) => (
                        <div key={relic.id} onClick={() => handleChoose(relic)} className={`w-36 relative group transition-all p-4 rounded-lg border-2 ${rewardChosen ? 'opacity-40 pointer-events-none' : 'hover:scale-110 cursor-pointer border-[#C8AA6E] shadow-xl hover:shadow-[0_0_20px_#C8AA6E]'}`}>
                            <img src={relic.img} className="w-full h-auto object-cover rounded-lg" />
                            <div className="font-bold text-[#F0E6D2] mt-3">{relic.name}</div>
                            <div className="text-xs text-[#A09B8C] mt-1">{relic.description}</div>
                            {rewardChosen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-3xl font-bold text-green-400">已选</div>}
                        </div>
                    ))}
                </div>
                <button onClick={onLeave} className="mt-8 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest" disabled={!rewardChosen}>关闭宝箱</button>
            </div>
        </div>
    );
};

export default ChestView;

