import { VOICE_URL } from '../data/constants';

// 音效 URL - 使用新的R2存储地址
const SFX_BASE_URL = "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx";
const SFX_NEW_URL = "https://pub-4785f27b55bc484db8005d5841a1735a.r2.dev";

// 音效 URL 映射
const SFX_URLS = {
  // 基础音效
  ATTACK: `${SFX_BASE_URL}/attack_hit.mp3`, // 攻击音效（保留用于兼容）
  BLOCK: `${SFX_BASE_URL}/block.mp3`, // 格挡音效（保留用于兼容）
  DRAW: `${SFX_BASE_URL}/card_draw.mp3`,
  WIN: `${SFX_BASE_URL}/victory_stinger.mp3`,
  
  // 增强音效 - 独立的攻击、格挡、受击音效（使用新的R2存储）
  ATTACK_SWING: `${SFX_NEW_URL}/attack_swing.mp3`, // 攻击挥击音效
  ATTACK_HIT: `${SFX_NEW_URL}/attack_hit.mp3`, // 攻击命中音效
  BLOCK_SHIELD: `${SFX_NEW_URL}/block_shield.mp3`, // 格挡护盾音效
  HIT_TAKEN: `${SFX_NEW_URL}/hit_taken.mp3`, // 受击音效
};

export const playSfx = (type) => {
  const url = SFX_URLS[type];
  if (!url) return;
  
  const audio = new Audio(url);
  // 根据音效类型调整音量
  if (type === 'ATTACK_SWING' || type === 'ATTACK_HIT') {
    audio.volume = 0.5; // 攻击音效稍大
  } else if (type === 'BLOCK_SHIELD') {
    audio.volume = 0.4; // 格挡音效
  } else if (type === 'HIT_TAKEN') {
    audio.volume = 0.6; // 受击音效更明显
  } else {
    audio.volume = 0.4; // 默认音量
  }
  
  audio.play().catch(e => console.log("SFX play failed (user interaction required)", e));
};

// 播放英雄语音
export const playChampionVoice = (championKey) => {
  if (!championKey) return;
  
  const voiceUrl = `${VOICE_URL}/${championKey}.ogg`;
  const audio = new Audio(voiceUrl);
  audio.volume = 0.6;
  audio.play().catch(e => console.log("Champion voice play failed", e));
};

