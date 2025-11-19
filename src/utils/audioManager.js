import { VOICE_URL } from '../data/constants';

// 简单的音效 URL (使用公共资源或占位符)
const SFX_URLS = {
  ATTACK: "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx/attack_hit.mp3", // 需替换为实际短音效
  BLOCK: "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx/block.mp3",
  DRAW: "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx/card_draw.mp3",
  WIN: "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx/victory_stinger.mp3"
};

export const playSfx = (type) => {
  const url = SFX_URLS[type];
  if (!url) return;
  
  const audio = new Audio(url);
  audio.volume = 0.4;
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

