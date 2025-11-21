import React from 'react';
import { Sword, Gift, Zap } from 'lucide-react';
import { ITEM_URL } from '../data/constants';

const EventView = ({ onLeave, onReward }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden"><img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">神秘信号</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">你在草丛中发现了一个遗落的守卫眼，旁边似乎还散落着一些物资...</p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div><div><div className="font-bold text-[#F0E6D2]">训练</div><div className="text-sm text-slate-400">永久获得 <span className="text-red-400">+2 力量</span></div></div></button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div><div><div className="font-bold text-[#F0E6D2]">搜寻</div><div className="text-sm text-slate-400">获得一件 <span className="text-purple-400">随机装备</span></div></div></button>
                <button onClick={() => { onReward({ type: 'UPGRADE_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-green-900/50 border border-slate-600 hover:border-green-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-green-500"><Zap className="text-green-500" /></div><div><div className="font-bold text-[#F0E6D2]">感悟</div><div className="text-sm text-slate-400">随机 <span className="text-green-400">升级一张卡牌</span></div></div></button>
            </div>
        </div>
    </div>
);

export default EventView;
