import { PASSIVE_URL, ITEM_URL } from './constants';

export const RELIC_DATABASE = {
  // 基础被动
  "GarenPassive": { id: "GarenPassive", name: "坚韧", description: "战斗结束时恢复 6 HP", rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "DariusPassive": { id: "DariusPassive", name: "出血", description: "每次攻击时，给予敌人 1 层虚弱", rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "LuxPassive": { id: "LuxPassive", name: "光芒四射", description: "每回合开始时获得 1 点额外法力", rarity: "PASSIVE", img: `${PASSIVE_URL}/LuxIllumination.png` },
  "JinxPassive": { id: "JinxPassive", name: "爆发", description: "每回合初始手牌数量+1", rarity: "PASSIVE", img: `${PASSIVE_URL}/Jinx_Passive.png` },
  "YasuoPassive": { id: "YasuoPassive", name: "浪客之道", description: "攻击牌暴击几率+10%", rarity: "PASSIVE", img: `${PASSIVE_URL}/Yasuo_Passive.png` },
  "SonaPassive": { id: "SonaPassive", name: "能量弦", description: "每回合打出第三张卡时，获得 3 点临时护甲", rarity: "PASSIVE", img: `${PASSIVE_URL}/Sona_Passive.png` },
  "EkkoPassive": { id: "EkkoPassive", name: "Z型驱动共振", description: "每次打出消耗卡时，获得 1 点力量", rarity: "PASSIVE", img: `${PASSIVE_URL}/Ekko_P.png` },
  "SylasPassive": { id: "SylasPassive", name: "叛乱", description: "每次打出技能牌时，回复 3 点生命值", rarity: "PASSIVE", img: `${PASSIVE_URL}/SylasP.png` },
  "UrgotPassive": { id: "UrgotPassive", name: "回火", description: "战斗开始时获得 15 点临时护甲", rarity: "PASSIVE", img: `${PASSIVE_URL}/Urgot_Passive.png` },
  "ViktorPassive": { id: "ViktorPassive", name: "光荣进化", description: "回合开始时，50% 几率获得一张额外基础卡", rarity: "PASSIVE", img: `${PASSIVE_URL}/Viktor_Passive.png` },

  // 通用遗物
  "DoransShield": { id: "DoransShield", name: "多兰之盾", price: 100, rarity: "COMMON", description: "战斗开始时获得 6 点护甲。", img: `${ITEM_URL}/1054.png`, onBattleStart: (state) => ({ ...state, block: state.block + 6 }) },
  "LongSword": { id: "LongSword", name: "长剑", price: 150, rarity: "COMMON", description: "战斗开始时获得 1 点力量。", img: `${ITEM_URL}/1036.png`, onBattleStart: (state) => ({ ...state, status: { ...state.status, strength: state.status.strength + 1 } }) },
  "RubyCrystal": { id: "RubyCrystal", name: "红水晶", price: 120, rarity: "COMMON", description: "最大生命值 +15。", img: `${ITEM_URL}/1028.png`, onPickup: (gameState) => ({ ...gameState, maxHp: gameState.maxHp + 15, currentHp: gameState.currentHp + 15 }) },
  "VampiricScepter": { id: "VampiricScepter", name: "吸血鬼节杖", price: 280, rarity: "UNCOMMON", description: "每次打出攻击牌恢复 1 点生命。", img: `${ITEM_URL}/1053.png` },
  "Sheen": { id: "Sheen", name: "耀光", price: 350, rarity: "UNCOMMON", description: "每回合打出的第一张攻击牌，伤害翻倍。", img: `${ITEM_URL}/3057.png` },
  "ZhonyasHourglass": { id: "ZhonyasHourglass", name: "中娅沙漏", price: 500, rarity: "RARE", description: "每场战斗限一次：免疫下一回合的敌人伤害。", img: `${ITEM_URL}/3157.png`, charges: 1 },
  "InfinityEdge": { id: "InfinityEdge", name: "无尽之刃", price: 700, rarity: "RARE", description: "所有攻击牌伤害+50%。", img: `${ITEM_URL}/3031.png` },
  "Redemption": { id: "Redemption", name: "救赎", price: 650, rarity: "RARE", description: "每回合开始时，治疗你和敌人 5 点生命。", img: `${ITEM_URL}/3107.png`, onTurnStart: (pState, eState) => ({ pState: { ...pState, hp: Math.min(pState.maxHp, pState.hp + 5) }, eState: { ...eState, hp: eState.hp + 5 } }) },
  "BrambleVest": { id: "BrambleVest", name: "荆棘背心", price: 200, rarity: "UNCOMMON", description: "每次被攻击时，对攻击者造成 3 点伤害。", img: `${ITEM_URL}/3076.png` },
  "GuardianAngel": { id: "GuardianAngel", name: "守护天使", price: 750, rarity: "RARE", description: "死亡时，恢复 40 点生命值。每场战斗限一次。", img: `${ITEM_URL}/3026.png`, charges: 1 }
};

