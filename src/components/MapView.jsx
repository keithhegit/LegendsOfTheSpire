import React from 'react';
import { CDN_URL, ITEM_URL, PROFILEICON_URL, MAP_BG_URL } from '../data/constants';
import { ENEMY_POOL } from '../data/enemies';

const MapView = ({ mapData, onNodeSelect }) => {
  const getMapIcon = (node) => {
      if (node.type === 'BOSS') return `${CDN_URL}/img/champion/Darius.png`; 
      if (node.type === 'REST') return `${ITEM_URL}/2003.png`; 
      if (node.type === 'SHOP') return `${ITEM_URL}/3400.png`; 
      if (node.type === 'EVENT') return `${ITEM_URL}/3340.png`; 
      if (node.type === 'CHEST') return `${PROFILEICON_URL}/2065.png`; 
      if (node.type === 'BATTLE' && node.enemyId) return ENEMY_POOL[node.enemyId]?.avatar || `${PROFILEICON_URL}/29.png`; 
      return null;
  };
  const getTypeStyle = (type) => {
      switch(type) {
          case 'BOSS': return "text-red-500 border-red-600/50 shadow-[0_0_10px_red]";
          case 'REST': return "text-blue-400 border-blue-500/50";
          case 'SHOP': return "text-yellow-400 border-yellow-500/50";
          case 'EVENT': return "text-purple-400 border-purple-500/50";
          case 'CHEST': return "text-green-400 border-green-500/50";
          case 'BATTLE': return "text-slate-200 border-slate-500/50";
          default: return "text-slate-400";
      }
  }
  return (
    <div className="flex flex-col items-center h-full w-full relative overflow-hidden bg-[#0c0c12]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${MAP_BG_URL}')` }}></div>
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </div>
      <div className="relative z-20 w-full h-full flex flex-col-reverse items-center overflow-y-auto py-20 gap-16 hide-scrollbar">
        {mapData.map((floor, floorIndex) => (
          <div key={floorIndex} className="flex justify-center gap-24 relative group">
            {floor.map((node) => {
               const isAvailable = node.status === 'AVAILABLE';
               const isCompleted = node.status === 'COMPLETED';
               const isLocked = node.status === 'LOCKED';
               const iconUrl = getMapIcon(node);
               const labelText = node.type === 'BATTLE' ? (ENEMY_POOL[node.enemyId]?.name || 'Unknown') : node.type;
               return (
                 <div key={node.id} className="relative flex flex-col items-center">
                    {floorIndex < mapData.length - 1 && node.next.length > 0 && (<div className={`absolute bottom-full w-0.5 h-16 -z-10 origin-bottom transform ${isLocked ? 'bg-slate-800' : 'bg-[#C8AA6E] shadow-[0_0_10px_#C8AA6E]'}`}></div>)}
                    <button onClick={() => isAvailable && onNodeSelect(node)} disabled={!isAvailable} className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-black ${isAvailable ? `border-[#C8AA6E] scale-110 shadow-[0_0_30px_#C8AA6E] cursor-pointer hover:scale-125 ring-2 ring-[#C8AA6E]/50` : 'border-slate-600'} ${isCompleted ? 'opacity-40 grayscale border-slate-500' : ''} ${isLocked ? 'opacity-20 blur-[1px]' : ''}`}>
                      {iconUrl && <img src={iconUrl} className="w-full h-full object-cover" alt={node.type} />}
                      {isCompleted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[#C8AA6E] text-4xl font-bold">✓</span></div>}
                    </button>
                    <div className={`absolute -bottom-8 px-3 py-1 rounded-full border bg-black/90 backdrop-blur-md whitespace-nowrap font-bold text-xs tracking-widest uppercase transition-all ${getTypeStyle(node.type)} ${isAvailable ? 'scale-110 shadow-lg z-30' : 'opacity-70 scale-90'}`}>{labelText}</div>
                 </div>
               )
            })}
          </div>
        ))}
      </div>
    </div>
  )
};

export default MapView;

