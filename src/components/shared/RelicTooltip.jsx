import React from 'react';

const RelicTooltip = ({ relic, children }) => {
    if (!relic) return children;
    return (
        <div className="relative group">
            {children}
            <div className="absolute top-full left-0 mt-2 w-56 bg-black/95 border border-[#C8AA6E] p-3 z-[110] hidden group-hover:block text-left pointer-events-none rounded-lg shadow-xl">
                <div className="font-bold text-[#F0E6D2] mb-1">{relic.name}</div>
                <div className="text-xs text-[#A09B8C] leading-relaxed whitespace-normal">{relic.description}</div>
                {relic.charges !== undefined && <div className="text-xs text-red-400 mt-1">剩余次数: {relic.charges}</div>}
            </div>
        </div>
    );
};

export default RelicTooltip;

