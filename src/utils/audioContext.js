// 全局音频上下文管理器
let audioContext = null;
let isAudioUnlocked = false;

// 创建静默音频来解锁浏览器音频限制
export const unlockAudio = () => {
    if (isAudioUnlocked) return Promise.resolve();
    
    return new Promise((resolve) => {
        // 创建一个超短的静默音频
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        silentAudio.volume = 0.01;
        
        const playPromise = silentAudio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    isAudioUnlocked = true;
                    console.log('[Audio] Unlocked successfully');
                    resolve();
                })
                .catch(() => {
                    console.warn('[Audio] Still blocked, will retry on next user interaction');
                    resolve();
                });
        } else {
            resolve();
        }
    });
};

// 检查音频是否已解锁
export const isAudioEnabled = () => isAudioUnlocked;

// Web Audio API 上下文（用于更高级的音频控制）
export const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// 恢复被暂停的音频上下文
export const resumeAudioContext = async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
};

