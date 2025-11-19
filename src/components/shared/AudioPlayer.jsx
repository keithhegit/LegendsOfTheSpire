import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = ({ src }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const prevSrcRef = useRef(null);
    const shouldAutoPlayRef = useRef(true); // 默认应该自动播放
    
    // 当 src 变化时，切换音乐源
    useEffect(() => {
        if (audioRef.current && src) {
            const wasPlaying = prevSrcRef.current !== null && !audioRef.current.paused;
            const isNewSrc = prevSrcRef.current !== src;
            prevSrcRef.current = src;
            
            if (isNewSrc) {
                audioRef.current.src = src;
            }
            audioRef.current.volume = volume;
            
            // 如果之前正在播放，或者应该自动播放（首次加载），则播放
            if (wasPlaying || (shouldAutoPlayRef.current && isNewSrc)) {
                shouldAutoPlayRef.current = false; // 标记已尝试自动播放
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch(() => {
                            // 浏览器阻止自动播放时，静默失败（用户需要交互后才能播放）
                            setIsPlaying(false);
                        });
                }
            }
        }
    }, [src, volume]);
    
    // 组件首次挂载时，如果src已存在，尝试自动播放
    useEffect(() => {
        if (audioRef.current && src && shouldAutoPlayRef.current) {
            audioRef.current.src = src;
            audioRef.current.volume = volume;
            shouldAutoPlayRef.current = false;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => {
                        setIsPlaying(false);
                    });
            }
        }
    }, []); // 只在组件挂载时执行一次

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            }
        }
    };

    const toggleMute = () => {
        const newVolume = volume === 0 ? 0.3 : 0;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-black/50 p-2 rounded-full border border-[#C8AA6E]/50 hover:bg-black/80 transition-all">
            <audio ref={audioRef} loop />
            <button onClick={togglePlay} className="text-[#C8AA6E] hover:text-white">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={toggleMute} className="text-[#C8AA6E] hover:text-white">
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
    );
};

export default AudioPlayer;

