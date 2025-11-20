import React, { useState, useRef } from 'react';

const RelicTooltip = ({ relic, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const longPressTimerRef = useRef(null);
    const isLongPressRef = useRef(false);
    
    if (!relic) return children;
    
    // 处理长按（移动端）
    const handleTouchStart = (e) => {
        isLongPressRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setShowTooltip(true);
        }, 500); // 500ms 长按
    };
    
    const handleTouchEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };
    
    const handleTouchCancel = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        isLongPressRef.current = false;
    };
    
    // 处理鼠标悬停（桌面端）
    const handleMouseEnter = () => {
        setShowTooltip(true);
    };
    
    const handleMouseLeave = () => {
        setShowTooltip(false);
    };
    
    return (
        <div 
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
        >
            {children}
            {(showTooltip || (typeof window !== 'undefined' && window.innerWidth >= 768 && 'group-hover:block')) && (
                <div 
                    className={`absolute top-full left-0 mt-2 w-56 bg-black/95 border border-[#C8AA6E] p-3 z-[110] text-left pointer-events-none rounded-lg shadow-xl ${
                        typeof window !== 'undefined' && window.innerWidth >= 768 ? 'hidden group-hover:block' : showTooltip ? 'block' : 'hidden'
                    }`}
                    onClick={(e) => {
                        // 点击关闭（移动端）
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            e.stopPropagation();
                            setShowTooltip(false);
                        }
                    }}
                >
                    <div className="font-bold text-[#F0E6D2] mb-1">{relic.name}</div>
                    <div className="text-xs text-[#A09B8C] leading-relaxed whitespace-normal">{relic.description}</div>
                    {relic.charges !== undefined && <div className="text-xs text-red-400 mt-1">剩余次数: {relic.charges}</div>}
                    {typeof window !== 'undefined' && window.innerWidth < 768 && (
                        <div className="text-[10px] text-slate-500 mt-2 text-center">点击关闭</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RelicTooltip;

