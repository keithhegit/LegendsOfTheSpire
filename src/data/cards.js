import { SPELL_URL } from './constants';

export const CARD_DATABASE = {
  "Strike": { id: "Strike", hero: "Neutral", name: "打击", price: 0, type: "ATTACK", cost: 1, value: 6, description: "造成 6 点伤害。", img: `${SPELL_URL}/SummonerFlash.png`, rarity: "BASIC" },
  "Defend": { id: "Defend", hero: "Neutral", name: "防御", price: 0, type: "SKILL", cost: 1, block: 5, description: "获得 5 点护甲。", img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "BASIC" },
  "Ignite": { id: "Ignite", hero: "Neutral", name: "点燃", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "获得 2 点力量。消耗。", img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", hero: "Neutral", name: "治疗术", price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "恢复 10 点生命。消耗。", img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
  
  // 盖伦
  "GarenQ": { id: "GarenQ", hero: "Garen", name: "致命打击", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "造成 8 点伤害。给予 2 层易伤。", img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", hero: "Garen", name: "勇气", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "获得 12 点护甲。净化。", img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },
  "GarenE": { id: "GarenE", hero: "Garen", name: "审判", price: 80, type: "ATTACK", cost: 2, value: 6, isMultiHit: true, hits: 3, description: "造成 3 次 6 点伤害。", img: `${SPELL_URL}/GarenE.png`, rarity: "UNCOMMON" },
  "GarenR": { id: "GarenR", hero: "Garen", name: "德玛西亚正义", price: 150, type: "ATTACK", cost: 3, value: 30, description: "造成 30 点巨额伤害。", img: `${SPELL_URL}/GarenR.png`, rarity: "RARE" },

  // 德莱厄斯
  "DariusW": { id: "DariusW", hero: "Darius", name: "致残打击", price: 60, type: "ATTACK", cost: 1, value: 10, effect: "WEAK", effectValue: 1, description: "造成 10 点伤害。给予 1 层虚弱。", img: `${SPELL_URL}/DariusNoxianTacticsONH.png`, rarity: "COMMON" },
  "DariusE": { id: "DariusE", hero: "Darius", name: "无情铁手", price: 80, type: "SKILL", cost: 2, effect: "DRAW", effectValue: 1, description: "抓取 1 张牌。给予 3 层易伤。", img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "UNCOMMON" },
  "DariusQ": { id: "DariusQ", hero: "Darius", name: "大杀四方", price: 80, type: "ATTACK", cost: 1, value: 8, isAOE: true, effect: "HEAL", effectValue: 3, description: "对所有敌人造成 8 点伤害，回复 3 点生命。", img: `${SPELL_URL}/DariusCleave.png`, rarity: "UNCOMMON" },
  "DariusR": { id: "DariusR", hero: "Darius", name: "诺克萨斯断头台", price: 150, type: "ATTACK", cost: 3, value: 40, description: "造成 40 点真实伤害。", img: `${SPELL_URL}/DariusExecute.png`, rarity: "RARE" },

  // 拉克丝
  "LuxQ": { id: "LuxQ", hero: "Lux", name: "光之束缚", price: 70, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 3, description: "给予 3 层易伤。", img: `${SPELL_URL}/LuxLightBinding.png`, rarity: "COMMON" },
  "LuxE": { id: "LuxE", hero: "Lux", name: "透光奇点", price: 120, type: "ATTACK", cost: 2, value: 15, exhaust: true, description: "造成 15 点伤害。消耗。", img: `${SPELL_URL}/LuxLightStrikeKage.png`, rarity: "UNCOMMON" },
  "LuxR": { id: "LuxR", hero: "Lux", name: "终极闪光", price: 150, type: "ATTACK", cost: 3, value: 25, isAOE: true, description: "对所有敌人造成 25 点伤害。", img: `${SPELL_URL}/LuxR.png`, rarity: "RARE" },

  // 金克丝
  "JinxQ": { id: "JinxQ", hero: "Jinx", name: "切自动挡", price: 40, type: "ATTACK", cost: 0, value: 4, isMultiHit: true, hits: 2, description: "造成 2 次 4 点伤害。", img: `${SPELL_URL}/JinxQ.png`, rarity: "COMMON" },
  "JinxW": { id: "JinxW", hero: "Jinx", name: "震荡电磁波", price: 90, type: "ATTACK", cost: 2, value: 20, effect: "WEAK", effectValue: 2, description: "造成 20 点伤害。给予 2 层虚弱。", img: `${SPELL_URL}/JinxW.png`, rarity: "UNCOMMON" },
  "JinxR": { id: "JinxR", hero: "Jinx", name: "超究极死神飞弹", price: 150, type: "ATTACK", cost: 3, value: 35, isAOE: true, description: "对所有敌人造成 35 点伤害。", img: `${SPELL_URL}/JinxR.png`, rarity: "RARE" },

  // 亚索
  "YasuoQ": { id: "YasuoQ", hero: "Yasuo", name: "斩钢闪", price: 40, type: "ATTACK", cost: 0, value: 4, description: "造成 4 点伤害。", img: `${SPELL_URL}/YasuoQ1Wrapper.png`, rarity: "COMMON" },
  "YasuoE": { id: "YasuoE", hero: "Yasuo", name: "踏前斩", price: 70, type: "ATTACK", cost: 1, value: 8, effect: "STRENGTH", effectValue: 1, description: "造成 8 点伤害。获得 1 点力量。", img: `${SPELL_URL}/YasuoDashWrapper.png`, rarity: "UNCOMMON" },
  "YasuoR": { id: "YasuoR", hero: "Yasuo", name: "狂风绝息斩", price: 150, type: "ATTACK", cost: 2, value: 20, isMultiHit: true, hits: 3, description: "造成 3 次 20 点伤害（只能对浮空敌人释放 - 简化为直接释放）。", img: `${SPELL_URL}/YasuoR.png`, rarity: "RARE" },

  // 娑娜
  "SonaQ": { id: "SonaQ", hero: "Sona", name: "英勇赞美诗", price: 50, type: "ATTACK", cost: 1, value: 7, effect: "HEAL", effectValue: 3, description: "造成 7 点伤害，回复 3 点生命。", img: `${SPELL_URL}/SonaHymnofValor.png`, rarity: "COMMON" },
  "SonaW": { id: "SonaW", hero: "Sona", name: "坚毅咏叹调", price: 80, type: "SKILL", cost: 1, block: 8, effect: "HEAL", effectValue: 5, description: "获得 8 点护甲，回复 5 点生命。", img: `${SPELL_URL}/SonaAriaofPerseverance.png`, rarity: "UNCOMMON" },
  "SonaR": { id: "SonaR", hero: "Sona", name: "狂舞终乐章", price: 150, type: "SKILL", cost: 3, effect: "STUN", description: "晕眩所有敌人 1 回合（简化为给予虚弱和易伤）。", effect: "WEAK", effectValue: 3, img: `${SPELL_URL}/SonaR.png`, rarity: "RARE" },

  // 艾克
  "EkkoQ": { id: "EkkoQ", hero: "Ekko", name: "时间卷曲器", price: 50, type: "ATTACK", cost: 1, value: 12, exhaust: true, description: "造成 12 点伤害。消耗。", img: `${SPELL_URL}/EkkoQ.png`, rarity: "COMMON" },
  "EkkoE": { id: "EkkoE", hero: "Ekko", name: "相位俯冲", price: 90, type: "SKILL", cost: 0, block: 5, exhaust: true, description: "获得 5 点护甲。", img: `${SPELL_URL}/EkkoE.png`, rarity: "UNCOMMON" },
  "EkkoR": { id: "EkkoR", hero: "Ekko", name: "时空断裂", price: 150, type: "SKILL", cost: 3, effect: "HEAL", effectValue: 20, value: 20, type: "ATTACK", description: "回复 20 点生命，造成 20 点伤害。", img: `${SPELL_URL}/EkkoR.png`, rarity: "RARE" },

  // 塞拉斯
  "SylasQ": { id: "SylasQ", hero: "Sylas", name: "锁链鞭击", price: 50, type: "ATTACK", cost: 1, value: 7, isMultiHit: true, hits: 2, description: "造成 2 次 7 点伤害。", img: `${SPELL_URL}/SylasQ.png`, rarity: "COMMON" },
  "SylasW": { id: "SylasW", hero: "Sylas", name: "弑君突刺", price: 90, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 15, description: "回复 15 点生命。", img: `${SPELL_URL}/SylasW.png`, rarity: "UNCOMMON" },
  "SylasR": { id: "SylasR", hero: "Sylas", name: "其人之道", price: 150, type: "SKILL", cost: 0, description: "随机获得一张敌人的技能卡（简化为获得随机强力卡）。", img: `${SPELL_URL}/SylasR.png`, rarity: "RARE" },

  // 厄加特
  "UrgotQ": { id: "UrgotQ", hero: "Urgot", name: "腐蚀电荷", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "WEAK", effectValue: 1, description: "造成 8 点伤害，给予 1 层虚弱。", img: `${SPELL_URL}/UrgotQ.png`, rarity: "COMMON" },
  "UrgotW": { id: "UrgotW", hero: "Urgot", name: "净除", price: 90, type: "SKILL", cost: 1, block: 8, effect: "VULNERABLE", effectValue: 1, description: "获得 8 点护甲，给予 1 层易伤。", img: `${SPELL_URL}/UrgotW.png`, rarity: "UNCOMMON" },
  "UrgotR": { id: "UrgotR", hero: "Urgot", name: "超越死亡的恐惧", price: 150, type: "ATTACK", cost: 3, value: 50, description: "造成 50 点伤害。", img: `${SPELL_URL}/UrgotR.png`, rarity: "RARE" },

  // 维克托
  "ViktorQ": { id: "ViktorQ", hero: "Viktor", name: "能量转移", price: 40, type: "ATTACK", cost: 0, value: 3, block: 3, description: "造成 3 点伤害，获得 3 点护甲。", img: `${SPELL_URL}/ViktorPowerTransfer.png`, rarity: "COMMON" },
  "ViktorE": { id: "ViktorE", hero: "Viktor", name: "死亡射线", price: 100, type: "ATTACK", cost: 2, value: 18, description: "造成 18 点伤害。", img: `${SPELL_URL}/ViktorDeathRay.png`, rarity: "UNCOMMON" },
  "ViktorR": { id: "ViktorR", hero: "Viktor", name: "混乱风暴", price: 150, type: "ATTACK", cost: 3, value: 5, isMultiHit: true, hits: 6, description: "造成 6 次 5 点伤害。", img: `${SPELL_URL}/ViktorChaosStorm.png`, rarity: "RARE" },
};
