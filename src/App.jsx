import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Heart, RefreshCw, AlertTriangle, Flame, XCircle, Activity, Map as MapIcon, Gift, Anchor, Coins, ShoppingBag, ChevronRight, Star, Play, Pause, Volume2, VolumeX, Landmark } from 'lucide-react';

// --- 1. 静态资源与配置 ---

const CDN_VERSION = "13.1.1";
const CDN_URL = `https://ddragon.leagueoflegends.com/cdn/${CDN_VERSION}`;
const LOADING_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/loading";
const SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";
const ITEM_URL = `${CDN_URL}/img/item`;
const SPELL_URL = `${CDN_URL}/img/spell`;
const PASSIVE_URL = `${CDN_URL}/img/passive`;
const PROFILEICON_URL = `${CDN_URL}/img/profileicon`;

// 局外地图背景
const MAP_BG_URL = "https://pub-c98d5902eedf42f6a99765dfad981fd88.r2.dev/LoL/lol-valley.jpg";

// BGM 地址
const BGM_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/origin/01%20-%20Aim%20to%20Be%20a%20Pok%C3%A9mon%20Master%20-%20%E3%82%81%E3%81%96%E3%81%9B%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC.mp3";
const BATTLE_BGM_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/guimie-battle%20(1).mp3"; // 战斗BGM

// 初始卡组 (基础卡)
const STARTING_DECK_BASIC = ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend"];

// --- 2. 数据库 (Databases) ---

// 2.1 英雄数据库 (10 Champions) - 初始牌组和被动已配置
const CHAMPION_POOL = {
  // 盖伦 - 战士/回血
  "Garen": {
    name: "盖伦", title: "德玛西亚之力", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/Garen.png`, img: `${LOADING_URL}/Garen_0.jpg`,
    passive: "坚韧: 战斗结束时恢复 6 HP",
    relicId: "GarenPassive",
    initialCards: ["GarenQ", "GarenW", "Ignite", "Defend"],
    description: "德玛西亚的重装战士，擅长叠甲和持续作战。"
  },
  // 德莱厄斯 - 狂战士/力量
  "Darius": {
    name: "德莱厄斯", title: "诺克萨斯之手", maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Darius.png`, img: `${LOADING_URL}/Darius_0.jpg`,
    passive: "出血: 每次攻击时，给予敌人 1 层虚弱",
    relicId: "DariusPassive",
    initialCards: ["DariusW", "DariusE", "Strike", "Ignite"],
    description: "诺克萨斯的象征，依靠力量和流血效果压制敌人。"
  },
  // 拉克丝 - 法师/控制
  "Lux": {
    name: "拉克丝", title: "光辉女郎", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Lux.png`, img: `${LOADING_URL}/Lux_0.jpg`,
    passive: "光芒四射: 每回合开始时获得 1 点法力",
    relicId: "LuxPassive",
    initialCards: ["LuxQ", "LuxE", "Heal", "Ignite"],
    description: "法师英雄，擅长利用额外法力打出高费控制牌。"
  },
  // 金克丝 - 射手/狂热
  "Jinx": {
    name: "金克丝", title: "暴走萝莉", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Jinx.png`, img: `${LOADING_URL}/Jinx_0.jpg`,
    passive: "爆发: 每回合初始手牌数量+1",
    relicId: "JinxPassive",
    initialCards: ["JinxQ", "JinxW", "Strike", "Strike"],
    description: "高爆发射手，通过快速抽牌和连击造成伤害。"
  },
  // 亚索 - 剑客/暴击
  "Yasuo": {
    name: "亚索", title: "疾风剑豪", maxHp: 78, maxMana: 3, avatar: `${CDN_URL}/img/champion/Yasuo.png`, img: `${LOADING_URL}/Yasuo_0.jpg`,
    passive: "浪客之道: 暴击几率+10%",
    relicId: "YasuoPassive",
    initialCards: ["YasuoQ", "YasuoE", "Defend", "Defend"], // 亚索初始卡组应包含基础防御
    description: "高机动性剑客，利用连击和暴击进行爆发输出。"
  },
  // 娑娜 - 辅助/治疗
  "Sona": {
    name: "娑娜", title: "琴瑟仙女", maxHp: 72, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sona.png`, img: `${LOADING_URL}/Sona_0.jpg`,
    passive: "能量弦: 每回合打出第三张卡时，获得 3 点临时护甲",
    relicId: "SonaPassive",
    initialCards: ["SonaQ", "SonaW", "Defend", "Heal"],
    description: "辅助英雄，专注于恢复和团队增益。"
  },
  // 艾克 - 刺客/时间
  "Ekko": {
    name: "艾克", title: "时间刺客", maxHp: 82, maxMana: 3, avatar: `${CDN_URL}/img/champion/Ekko.png`, img: `${LOADING_URL}/Ekko_0.jpg`,
    passive: "Z型驱动共振: 每次打出消耗卡时，获得 1 点力量",
    relicId: "EkkoPassive",
    initialCards: ["EkkoQ", "EkkoE", "Defend", "Ignite"],
    description: "高爆发刺客，利用消耗卡牌的机制快速成长。"
  },
  // 塞拉斯 - 斗士/偷取
  "Sylas": {
    id: "Sylas", name: "塞拉斯", title: "解脱者", maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sylas.png`, img: `${LOADING_URL}/Sylas_0.jpg`,
    passive: "叛乱: 每次打出技能牌时，回复 3 点生命值",
    relicId: "SylasPassive",
    initialCards: ["SylasQ", "SylasW", "Strike", "Defend"],
    description: "斗士英雄，通过频繁打出技能获得生存优势。"
  },
  // 厄加特 - 坦克/压制
  "Urgot": {
    id: "Urgot", name: "厄加特", title: "无畏战车", maxHp: 100, maxMana: 3, avatar: `${CDN_URL}/img/champion/Urgot.png`, img: `${LOADING_URL}/Urgot_0.jpg`,
    passive: "回火: 战斗开始时获得 15 点临时护甲",
    relicId: "UrgotPassive",
    initialCards: ["UrgotQ", "UrgotW", "Defend", "Defend"],
    description: "坦克英雄，拥有高生命值和强力防御。"
  },
  // 维克托 - 科技/进化
  "Viktor": {
    id: "Viktor", name: "维克托", title: "机械先驱", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Viktor.png`, img: `${LOADING_URL}/Viktor_0.jpg`,
    passive: "光荣进化: 回合开始时，50% 几率获得一张额外基础卡",
    relicId: "ViktorPassive",
    initialCards: ["ViktorQ", "ViktorE", "Ignite", "Heal"],
    description: "高科技法师，擅长通过快速滤牌获得优势。"
  },
};

// 2.2 遗物数据库 (Relics) - 新增宝箱/商店遗物
const RELIC_DATABASE = {
  // 基础被动遗物
  "GarenPassive": { id: "GarenPassive", name: "坚韧", description: "战斗结束时恢复 6 HP", rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "DariusPassive": { id: "DariusPassive", name: "出血", description: "每次攻击时，给予敌人 1 层虚弱", rarity: "PASSIVE", img: `${PASSIVE_URL}/Darius_Passive.png` },
  "LuxPassive": { id: "LuxPassive", name: "光芒四射", description: "每回合开始时获得 1 点额外法力", rarity: "PASSIVE", img: `${PASSIVE_URL}/LuxIllumination.png` },
  "JinxPassive": { id: "JinxPassive", name: "爆发", description: "每回合初始手牌数量+1", rarity: "PASSIVE", img: `${PASSIVE_URL}/Jinx_Passive.png` },
  "YasuoPassive": { id: "YasuoPassive", name: "浪客之道", description: "攻击牌暴击几率+10%", rarity: "PASSIVE", img: `${PASSIVE_URL}/Yasuo_Passive.png` },
  "SonaPassive": { id: "SonaPassive", name: "能量弦", description: "每回合打出第三张卡时，获得 3 点临时护甲", rarity: "PASSIVE", img: `${PASSIVE_URL}/Sona_Passive.png` },
  "EkkoPassive": { id: "EkkoPassive", name: "Z型驱动共振", description: "每次打出消耗卡时，获得 1 点力量", rarity: "PASSIVE", img: `${PASSIVE_URL}/Ekko_P.png` },
  "SylasPassive": { id: "SylasPassive", name: "叛乱", description: "每次打出技能牌时，回复 3 点生命值", rarity: "PASSIVE", img: `${PASSIVE_URL}/SylasP.png` },
  "UrgotPassive": { id: "UrgotPassive", name: "回火", description: "战斗开始时获得 15 点临时护甲", rarity: "PASSIVE", img: `${PASSIVE_URL}/Urgot_Passive.png` },
  "ViktorPassive": { id: "ViktorPassive", name: "光荣进化", description: "回合开始时，50% 几率获得一张额外基础卡", rarity: "PASSIVE", img: `${PASSIVE_URL}/Viktor_Passive.png` },

  // 商店/宝箱遗物 (COMMON)
  "DoransShield": {
    id: "DoransShield", name: "多兰之盾", price: 100, rarity: "COMMON",
    description: "战斗开始时获得 6 点护甲。",
    img: `${ITEM_URL}/1054.png`,
    onBattleStart: (state) => ({ ...state, block: state.block + 6 })
  },
  "LongSword": {
    id: "LongSword", name: "长剑", price: 150, rarity: "COMMON",
    description: "战斗开始时获得 1 点力量。",
    img: `${ITEM_URL}/1036.png`,
    onBattleStart: (state) => ({ ...state, status: { ...state.status, strength: state.status.strength + 1 } })
  },
  "RubyCrystal": {
    id: "RubyCrystal", name: "红水晶", price: 120, rarity: "COMMON",
    description: "最大生命值 +15。",
    img: `${ITEM_URL}/1028.png`,
    onPickup: (gameState) => ({ ...gameState, maxHp: gameState.maxHp + 15, currentHp: gameState.currentHp + 15 })
  },
  // 商店/宝箱遗物 (UNCOMMON)
  "VampiricScepter": {
    id: "VampiricScepter", name: "吸血鬼节杖", price: 280, rarity: "UNCOMMON",
    description: "每次打出攻击牌恢复 1 点生命。",
    img: `${ITEM_URL}/1053.png`,
  },
  "Sheen": {
    id: "Sheen", name: "耀光", price: 350, rarity: "UNCOMMON",
    description: "每回合打出的第一张攻击牌，伤害翻倍。",
    img: `${ITEM_URL}/3057.png`,
  },
  "ZhonyasHourglass": {
    id: "ZhonyasHourglass", name: "中娅沙漏", price: 500, rarity: "RARE",
    description: "每场战斗限一次：免疫下一回合的敌人伤害。",
    img: `${ITEM_URL}/3157.png`,
    charges: 1
  },
  // 宝箱专属遗物 (RARE)
  "InfinityEdge": {
    id: "InfinityEdge", name: "无尽之刃", price: 700, rarity: "RARE",
    description: "所有攻击牌伤害+50%。",
    img: `${ITEM_URL}/3031.png`,
  },
  "Redemption": {
    id: "Redemption", name: "救赎", price: 650, rarity: "RARE",
    description: "每回合开始时，治疗你和敌人 5 点生命。",
    img: `${ITEM_URL}/3107.png`,
    onTurnStart: (pState, eState) => ({ 
        pState: { ...pState, hp: Math.min(pState.maxHp, pState.hp + 5) },
        eState: { ...eState, hp: eState.hp + 5 }
    })
  },
  "BrambleVest": {
    id: "BrambleVest", name: "荆棘背心", price: 200, rarity: "UNCOMMON",
    description: "每次被攻击时，对攻击者造成 3 点伤害。",
    img: `${ITEM_URL}/3076.png`,
  },
  "GuardianAngel": {
    id: "GuardianAngel", name: "守护天使", price: 750, rarity: "RARE",
    description: "死亡时，恢复 40 点生命值。每场战斗限一次。",
    img: `${ITEM_URL}/3026.png`,
    charges: 1
  }
};

// 2.3 敌人数据库 (Enemy Pool) - 沿用 V4.0 的难度配置
const ENEMY_POOL = {
  // Tier 1: Easy (Floor 1-3)
  "Katarina": {
    id: "Katarina", name: "卡特琳娜", title: "不祥之刃", maxHp: 42, difficultyRank: 1,
    img: `${LOADING_URL}/Katarina_0.jpg`, avatar: `${CDN_URL}/img/champion/Katarina.png`,
    actions: [
      { type: 'ATTACK', value: 6, count: 2, name: "瞬步连击" }, 
      { type: 'DEBUFF', value: 0, name: "死亡莲华", effect: "VULNERABLE", effectValue: 2 }, 
      { type: 'ATTACK', value: 15, name: "匕首投掷" }
    ]
  },
  "Talon": {
    id: "Talon", name: "泰隆", title: "刀锋之影", maxHp: 48, difficultyRank: 1,
    img: `${LOADING_URL}/Talon_0.jpg`, avatar: `${CDN_URL}/img/champion/Talon.png`,
    actions: [
      { type: 'ATTACK', value: 12, name: "诺克萨斯外交" },
      { type: 'ATTACK', value: 8, name: "刺客诡道", count: 2 },
      { type: 'BUFF', value: 0, name: "翻墙跑路", effect: "BLOCK", effectValue: 10 }
    ]
  },
  // Tier 2: Medium (Floor 4-7)
  "Sylas_E": {
    id: "Sylas_E", name: "塞拉斯", title: "解脱者", maxHp: 65, difficultyRank: 2,
    img: `${LOADING_URL}/Sylas_0.jpg`, avatar: `${CDN_URL}/img/champion/Sylas.png`,
    actions: [
      { type: 'ATTACK', value: 10, name: "锁链鞭击" },
      { type: 'DEBUFF', value: 0, name: "弑君突刺", effect: "WEAK", effectValue: 2 },
      { type: 'ATTACK', value: 5, count: 3, name: "其人之道" } 
    ]
  },
  "Lucian": {
    id: "Lucian", name: "卢锡安", title: "圣枪游侠", maxHp: 60, difficultyRank: 2,
    img: `${LOADING_URL}/Lucian_0.jpg`, avatar: `${CDN_URL}/img/champion/Lucian.png`,
    actions: [
      { type: 'ATTACK', value: 7, count: 2, name: "圣光银弹" }, 
      { type: 'BUFF', value: 0, name: "热诚", effect: "BLOCK", effectValue: 12 },
      { type: 'DEBUFF', value: 0, name: "冷酷追击", effect: "WEAK", effectValue: 1, actionType: 'Attack', dmgValue: 8 } 
    ]
  },
  "Fiora": {
    id: "Fiora", name: "菲奥娜", title: "无双剑姬", maxHp: 70, difficultyRank: 2,
    img: `${LOADING_URL}/Fiora_0.jpg`, avatar: `${CDN_URL}/img/champion/Fiora.png`,
    actions: [
      { type: 'ATTACK', value: 14, name: "破空斩" },
      { type: 'BUFF', value: 0, name: "心眼刀", effect: "BLOCK", effectValue: 15 },
      { type: 'ATTACK', value: 8, name: "夺命连刺" }
    ]
  },
  // Tier 3: Elite (Floor 8-9)
  "Viego": {
    id: "Viego", name: "佛耶戈", title: "破败之王", maxHp: 80, difficultyRank: 3,
    img: `${LOADING_URL}/Viego_0.jpg`, avatar: `${CDN_URL}/img/champion/Viego.png`,
    actions: [
      { type: 'ATTACK', value: 20, name: "破败王剑" },
      { type: 'BUFF', value: 0, name: "休止符", effect: "STRENGTH", effectValue: 3 },
      { type: 'ATTACK', value: 12, count: 2, name: "折磨" },
    ]
  },
  "LeBlanc": {
    id: "LeBlanc", name: "乐芙兰", title: "诡术妖姬", maxHp: 85, difficultyRank: 3,
    img: `${LOADING_URL}/LeBlanc_0.jpg`, avatar: `${CDN_URL}/img/champion/Leblanc.png`,
    actions: [
      { type: 'DEBUFF', value: 0, name: "恶意魔印", effect: "VULNERABLE", effectValue: 3 },
      { type: 'ATTACK', value: 18, name: "幻影锁链" },
      { type: 'ATTACK', value: 12, count: 2, name: "故技重施" }, 
    ]
  },
  // Boss Tier (Floor 10)
  "Darius_BOSS": {
    id: "Darius_BOSS", name: "德莱厄斯", title: "诺克萨斯之手", maxHp: 150, difficultyRank: 99,
    img: `${LOADING_URL}/Darius_0.jpg`, avatar: `${CDN_URL}/img/champion/Darius.png`,
    actions: [
      { type: 'ATTACK', value: 15, name: "大杀四方" },
      { type: 'DEBUFF', value: 0, name: "致残打击", effect: "WEAK", effectValue: 3 },
      { type: 'ATTACK', value: 30, name: "断头台！" }
    ]
  }
};


// 2.4 卡牌数据库 (Cards) - 包含所有英雄的基础卡和通用卡
const CARD_DATABASE = {
  // 基础卡 (通用卡牌)
  "Strike": { id: "Strike", hero: "Neutral", name: "打击", price: 0, type: "ATTACK", cost: 1, value: 6, description: "造成 6 点伤害。", img: `${SPELL_URL}/SummonerFlash.png`, rarity: "BASIC" }, 
  "Defend": { id: "Defend", hero: "Neutral", name: "防御", price: 0, type: "SKILL", cost: 1, block: 5, description: "获得 5 点护甲。", img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "BASIC" }, 
  "Ignite": { id: "Ignite", hero: "Neutral", name: "点燃", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "获得 2 点力量。消耗。", img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", hero: "Neutral", name: "治疗术", price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "恢复 10 点生命。消耗。", img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
  
  // 盖伦 (Garen)
  "GarenQ": { id: "GarenQ", hero: "Garen", name: "致命打击", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "造成 8 点伤害。给予 2 层易伤。", img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", hero: "Garen", name: "勇气", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "获得 12 点护甲。净化。", img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },

  // 德莱厄斯 (Darius)
  "DariusW": { id: "DariusW", hero: "Darius", name: "致残打击", price: 60, type: "ATTACK", cost: 1, value: 10, effect: "WEAK", effectValue: 1, description: "造成 10 点伤害。给予 1 层虚弱。", img: `${SPELL_URL}/DariusNoxianTacticsONH.png`, rarity: "COMMON" },
  "DariusE": { id: "DariusE", hero: "Darius", name: "无情铁手", price: 80, type: "SKILL", cost: 2, effect: "DRAW", effectValue: 1, description: "抓取 1 张牌。给予 3 层易伤。", img: `${SPELL_URL}/DariusAxeGrab.png`, rarity: "UNCOMMON" },
  
  // 拉克丝 (Lux)
  "LuxQ": { id: "LuxQ", hero: "Lux", name: "光之束缚", price: 70, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 3, description: "给予 3 层易伤。", img: `${SPELL_URL}/LuxLightBinding.png`, rarity: "COMMON" },
  "LuxE": { id: "LuxE", hero: "Lux", name: "透光奇点", price: 120, type: "ATTACK", cost: 2, value: 15, exhaust: true, description: "造成 15 点伤害。消耗。", img: `${SPELL_URL}/LuxLightStrikeKage.png`, rarity: "UNCOMMON" },

  // 金克丝 (Jinx)
  "JinxQ": { id: "JinxQ", hero: "Jinx", name: "切自动挡", price: 40, type: "ATTACK", cost: 0, value: 4, isMultiHit: true, hits: 2, description: "造成 2 次 4 点伤害。", img: `${SPELL_URL}/JinxQ.png`, rarity: "COMMON" },
  "JinxW": { id: "JinxW", hero: "Jinx", name: "震荡电磁波", price: 90, type: "ATTACK", cost: 2, value: 20, effect: "WEAK", effectValue: 2, description: "造成 20 点伤害。给予 2 层虚弱。", img: `${SPELL_URL}/JinxW.png`, rarity: "UNCOMMON" },

  // 亚索 (Yasuo)
  "YasuoQ": { id: "YasuoQ", hero: "Yasuo", name: "斩钢闪", price: 40, type: "ATTACK", cost: 0, value: 4, description: "造成 4 点伤害。", img: `${SPELL_URL}/YasuoQ1Wrapper.png`, rarity: "COMMON" },
  "YasuoE": { id: "YasuoE", hero: "Yasuo", name: "踏前斩", price: 70, type: "ATTACK", cost: 1, value: 8, effect: "STRENGTH", effectValue: 1, description: "造成 8 点伤害。获得 1 点力量。", img: `${SPELL_URL}/YasuoDashWrapper.png`, rarity: "UNCOMMON" },
  
  // 娑娜 (Sona)
  "SonaQ": { id: "SonaQ", hero: "Sona", name: "英勇赞美诗", price: 50, type: "ATTACK", cost: 1, value: 7, effect: "HEAL", effectValue: 3, description: "造成 7 点伤害，回复 3 点生命。", img: `${SPELL_URL}/SonaHymnofValor.png`, rarity: "COMMON" },
  "SonaW": { id: "SonaW", hero: "Sona", name: "坚毅咏叹调", price: 80, type: "SKILL", cost: 1, block: 8, effect: "HEAL", effectValue: 5, description: "获得 8 点护甲，回复 5 点生命。", img: `${SPELL_URL}/SonaAriaofPerseverance.png`, rarity: "UNCOMMON" },

  // 艾克 (Ekko)
  "EkkoQ": { id: "EkkoQ", hero: "Ekko", name: "时间卷曲器", price: 50, type: "ATTACK", cost: 1, value: 12, exhaust: true, description: "造成 12 点伤害。消耗。", img: `${SPELL_URL}/EkkoQ.png`, rarity: "COMMON" },
  "EkkoE": { id: "EkkoE", hero: "Ekko", name: "相位俯冲", price: 90, type: "SKILL", cost: 0, block: 5, exhaust: true, description: "获得 5 点护甲。", img: `${SPELL_URL}/EkkoE.png`, rarity: "UNCOMMON" },

  // 塞拉斯 (Sylas)
  "SylasQ": { id: "SylasQ", hero: "Sylas", name: "锁链鞭击", price: 50, type: "ATTACK", cost: 1, value: 7, isMultiHit: true, hits: 2, description: "造成 2 次 7 点伤害。", img: `${SPELL_URL}/SylasQ.png`, rarity: "COMMON" },
  "SylasW": { id: "SylasW", hero: "Sylas", name: "弑君突刺", price: 90, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 15, description: "回复 15 点生命。", img: `${SPELL_URL}/SylasW.png`, rarity: "UNCOMMON" },
  
  // 厄加特 (Urgot)
  "UrgotQ": { id: "UrgotQ", hero: "Urgot", name: "腐蚀电荷", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "WEAK", effectValue: 1, description: "造成 8 点伤害，给予 1 层虚弱。", img: `${SPELL_URL}/UrgotQ.png`, rarity: "COMMON" },
  "UrgotW": { id: "UrgotW", hero: "Urgot", name: "净除", price: 90, type: "SKILL", cost: 1, block: 8, effect: "VULNERABLE", effectValue: 1, description: "获得 8 点护甲，给予 1 层易伤。", img: `${SPELL_URL}/UrgotW.png`, rarity: "UNCOMMON" },

  // 维克托 (Viktor)
  "ViktorQ": { id: "ViktorQ", hero: "Viktor", name: "能量转移", price: 40, type: "ATTACK", cost: 0, value: 3, block: 3, description: "造成 3 点伤害，获得 3 点护甲。", img: `${SPELL_URL}/ViktorPowerTransfer.png`, rarity: "COMMON" },
  "ViktorE": { id: "ViktorE", hero: "Viktor", name: "死亡射线", price: 100, type: "ATTACK", cost: 2, value: 18, description: "造成 18 点伤害。", img: `${SPELL_URL}/ViktorDeathRay.png`, rarity: "UNCOMMON" },
};


// --- 3. 工具函数 ---

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 3.1 难度缩放逻辑
const scaleEnemyStats = (baseStats, floorIndex) => {
  const difficultyMultiplier = 1 + 0.1 * floorIndex; 
  const scaledHp = Math.floor(baseStats.maxHp * difficultyMultiplier);
  
  const scaledActions = baseStats.actions.map(action => {
    let scaledAction = { ...action };
    const isAttack = scaledAction.type === 'ATTACK' || scaledAction.actionType === 'Attack';

    if (isAttack) {
      const baseDmg = scaledAction.type === 'ATTACK' ? scaledAction.value : scaledAction.dmgValue;
      const scaledDmg = baseDmg + floorIndex * 2;
      
      if (scaledAction.type === 'ATTACK') scaledAction.value = scaledDmg;
      if (scaledAction.actionType === 'Attack') scaledAction.dmgValue = scaledDmg;
    }
    
    if (action.effect && (action.effect === 'WEAK' || action.effect === 'VULNERABLE' || action.effect === 'STRENGTH')) {
        scaledAction.effectValue = action.effectValue + Math.floor(floorIndex / 5); 
    }
    return scaledAction;
  });

  return { maxHp: scaledHp, actions: scaledActions };
};

// 3.2 10层随机地图生成算法
const generateMap = (usedEnemyIds) => {
  const map = [];
  const allEnemyIds = Object.keys(ENEMY_POOL).filter(id => ENEMY_POOL[id].difficultyRank < 99); // 排除 Boss
  let availableEnemyIds = allEnemyIds.filter(id => !usedEnemyIds.includes(id));
  if (availableEnemyIds.length < 8) availableEnemyIds = shuffle(allEnemyIds); // 重置池，确保至少有8个不重复

  const getUniqueEnemy = (minRank, maxRank) => {
    let availablePool = availableEnemyIds.filter(id => ENEMY_POOL[id].difficultyRank >= minRank && ENEMY_POOL[id].difficultyRank <= maxRank);
    if (availablePool.length === 0) availablePool = shuffle(allEnemyIds).filter(id => ENEMY_POOL[id].difficultyRank >= minRank); // 确保有后备
    
    const selectedId = availablePool.pop(); // 直接从末尾取，效率更高
    availableEnemyIds = availablePool; // 更新可用池
    return selectedId;
  };
  
  const createNode = (id, type, minRank, maxRank) => {
      const node = { id, type, status: 'LOCKED', next: [] };
      if (type === 'BATTLE') node.enemyId = getUniqueEnemy(minRank, maxRank);
      return node;
  };

  // Floor 0 (Level 1)
  map.push([{ ...createNode('1-0', 'BATTLE', 1, 1), status: 'AVAILABLE', next: ['2-0', '2-1'] }]);

  // Floors 1-7 (Level 2-8): 每次两选一，难度递增
  for (let i = 2; i <= 8; i++) {
    const floorIndex = i - 1;
    const minRank = i < 4 ? 1 : (i < 7 ? 2 : 3);
    const maxRank = i < 4 ? 1 : (i < 7 ? 2 : 3);
    
    const nodeType1 = shuffle(['BATTLE', 'REST', 'SHOP'])[0];
    const nodeType2 = shuffle(['BATTLE', 'EVENT', 'CHEST'])[0];

    const nodes = [
        createNode(`${i}-0`, nodeType1, minRank, maxRank),
        createNode(`${i}-1`, nodeType2, minRank, maxRank)
    ];

    // 连接到下一层
    const nextFloorIndex = i + 1;
    if (nextFloorIndex <= 9) {
        nodes[0].next = [`${nextFloorIndex}-0`];
        nodes[1].next = [`${nextFloorIndex}-0`];
    }
    
    // 特殊情况：强制岔路口连接到两个节点
    if (i === 3 || i === 6) {
         nodes[0].next = [`${nextFloorIndex}-0`];
         nodes[1].next = [`${nextFloorIndex}-1`];
    }
    
    map.push(nodes);
  }

  // Floor 8 (Level 9): 终极准备
  map.push([{ ...createNode('9-0', 'REST', 1, 1), next: ['10-0'] }]);

  // Floor 9 (Level 10): BOSS
  map.push([{ id: '10-0', type: 'BOSS', enemyId: 'Darius_BOSS', status: 'LOCKED', next: [] }]);

  return { map, finalEnemyIds: usedEnemyIds.concat(allEnemyIds.filter(id => !availableEnemyIds.includes(id))) };
};


// --- 4. 子组件 ---

// 4.0 背景音乐组件 (AudioPlayer) - 支持战斗/局外BGM切换

const AudioPlayer = ({ currentView }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);

    // 根据当前视图选择BGM
    const currentBGM = currentView === 'COMBAT' ? BATTLE_BGM_URL : BGM_URL;

    useEffect(() => {
        if(audioRef.current) {
            const wasPlaying = isPlaying;
            audioRef.current.pause();
            audioRef.current.src = currentBGM;
            audioRef.current.volume = volume;
            if (wasPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBGM]);

    useEffect(() => {
        if(audioRef.current && !isPlaying) {
            audioRef.current.volume = volume;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
        }
    }, []);

    const togglePlay = () => {
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-black/50 p-2 rounded-full border border-[#C8AA6E]/50 hover:bg-black/80 transition-all">
            <audio ref={audioRef} src={currentBGM} loop />
            <button onClick={togglePlay} className="text-[#C8AA6E] hover:text-white">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => {
                const newVol = volume === 0 ? 0.3 : 0;
                setVolume(newVol);
                if(audioRef.current) audioRef.current.volume = newVol;
            }} className="text-[#C8AA6E] hover:text-white">
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
    );
};


// 4.1 地图视图 (MapView) - 修复可视性问题

const MapView = ({ mapData, onNodeSelect, currentFloor }) => {
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
      {/* 背景优化 - 加深遮罩 */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/80 z-10" />
          <div className="absolute inset-0 bg-cover bg-center opacity-50" 
               style={{ backgroundImage: `url('${MAP_BG_URL}')` }}>
          </div>
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
                    {/* 连线 */}
                    {floorIndex < mapData.length - 1 && node.next.length > 0 && (
                        <div className={`absolute bottom-full w-0.5 h-16 -z-10 origin-bottom transform ${isLocked ? 'bg-slate-800' : 'bg-[#C8AA6E] shadow-[0_0_10px_#C8AA6E]'}`}></div>
                    )}

                    <button 
                      onClick={() => isAvailable && onNodeSelect(node)}
                      disabled={!isAvailable}
                      className={`
                        w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-black
                        ${isAvailable ? `border-[#C8AA6E] scale-110 shadow-[0_0_30px_#C8AA6E] cursor-pointer hover:scale-125 ring-2 ring-[#C8AA6E]/50` : 'border-slate-600'}
                        ${isCompleted ? 'opacity-40 grayscale border-slate-500' : ''}
                        ${isLocked ? 'opacity-20 blur-[1px]' : ''}
                      `}
                    >
                      {iconUrl && <img src={iconUrl} className="w-full h-full object-cover" alt={node.type} />}
                      {isCompleted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[#C8AA6E] text-4xl font-bold">✓</span></div>}
                    </button>
                    
                    {/* 高亮标签显示 */}
                    <div className={`
                        absolute -bottom-8 px-3 py-1 rounded-full border bg-black/90 backdrop-blur-md whitespace-nowrap
                        font-bold text-xs tracking-widest uppercase transition-all
                        ${getTypeStyle(node.type)}
                        ${isAvailable ? 'scale-110 shadow-lg z-30' : 'opacity-70 scale-90'}
                    `}>
                        {labelText}
                    </div>
                 </div>
               )
            })}
          </div>
        ))}
      </div>
    </div>
  )
};

// 4.2 商店视图 (ShopView) - 新增 CHEST 逻辑
const ShopView = ({ onLeave, onBuyCard, onBuyRelic, gold, deck, relics, championName }) => {
    const cardStock = useMemo(() => shuffle(Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC' && (c.hero === 'Neutral' || c.hero === championName))).slice(0, 5), [championName]);
    const relicStock = useMemo(() => Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)).slice(0, 3), [relics]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    
    const handleBuy = (item, type) => {
        if (gold >= item.price && !purchasedItems.includes(item.id)) {
            setPurchasedItems([...purchasedItems, item.id]);
            if (type === 'CARD') onBuyCard(item);
            if (type === 'RELIC') onBuyRelic(item);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-6xl px-10 py-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#C8AA6E] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#C8AA6E] overflow-hidden bg-black">
                            <img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[#C8AA6E]">黑市商人</h2>
                            <p className="text-[#A09B8C] italic">"只要给钱，什么都卖。"</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600">
                        <Coins size={32} /> {gold}
                    </div>
                </div>
                {/* ... 卡牌和遗物库存展示 (省略大部分细节以节约空间) ... */}
                <div className="grid grid-cols-2 gap-12 flex-1 overflow-y-auto">
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-blue-500 pl-3">技能卷轴</h3>
                        <div className="flex flex-wrap gap-4">
                            {cardStock.map(card => {
                                const isBought = purchasedItems.includes(card.id);
                                return (
                                    <div key={card.id} onClick={() => !isBought && handleBuy(card, 'CARD')} className={`w-32 h-48 relative group transition-all ${isBought ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-105 cursor-pointer'}`}>
                                        <img src={card.img} className="w-full h-full object-cover rounded border border-slate-600" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-center py-1 text-xs font-bold text-[#C8AA6E] border-t border-[#C8AA6E]">{card.price} G</div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black border border-[#C8AA6E] p-2 z-50 hidden group-hover:block text-center pointer-events-none text-xs text-white"><div className="font-bold mb-1">{card.name}</div>{card.description}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-purple-500 pl-3">海克斯装备</h3>
                        <div className="flex flex-wrap gap-6">
                            {relicStock.map(relic => {
                                const isBought = purchasedItems.includes(relic.id);
                                return (
                                    <div key={relic.id} onClick={() => !isBought && handleBuy(relic, 'RELIC')} className={`w-20 h-20 relative group transition-all ${isBought ? 'opacity-20 grayscale pointer-events-none' : 'hover:scale-110 cursor-pointer'}`}>
                                        <img src={relic.img} className="w-full h-full object-cover rounded-lg border-2 border-[#C8AA6E] shadow-[0_0_10px_#C8AA6E]" />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 rounded text-yellow-400 font-bold text-sm whitespace-nowrap">{relic.price} G</div>
                                        <RelicTooltip relic={relic}><div className="w-full h-full absolute inset-0"></div></RelicTooltip>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30">
                    <button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">离开 <ChevronRight /></button>
                </div>
            </div>
        </div>
    )
}

// 4.3 宝箱视图 (ChestView) - NEW
const ChestView = ({ onLeave, onRelicReward, relics }) => {
    // 随机抽取 3 个稀有度 RARE 或 UNCOMMON 遗物
    const availableRelics = Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && r.rarity !== 'BASIC' && !relics.includes(r.id));
    const rewards = useMemo(() => shuffle(availableRelics).slice(0, 3), [relics]);
    const [rewardChosen, setRewardChosen] = useState(false);

    const handleChoose = (relic) => {
        if (rewardChosen) return;
        setRewardChosen(true);
        onRelicReward(relic);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative z-10 max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden">
                    <img src={`${ITEM_URL}/3302.png`} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">海克斯宝箱</h2>
                <p className="text-[#F0E6D2] text-lg mb-8">
                    打开宝箱，选择一件强大的装备来武装自己。
                </p>
                <div className="flex justify-center gap-8">
                    {rewards.map((relic) => (
                        <div key={relic.id} onClick={() => handleChoose(relic)} 
                             className={`w-36 relative group transition-all p-4 rounded-lg border-2 
                             ${rewardChosen ? 'opacity-40 pointer-events-none' : 'hover:scale-110 cursor-pointer border-[#C8AA6E] shadow-xl hover:shadow-[0_0_20px_#C8AA6E]'}`}>
                            <img src={relic.img} className="w-full h-auto object-cover rounded-lg" />
                            <div className="font-bold text-[#F0E6D2] mt-3">{relic.name}</div>
                            <div className="text-xs text-[#A09B8C] mt-1">{relic.description}</div>
                            {rewardChosen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-3xl font-bold text-green-400">已选</div>}
                        </div>
                    ))}
                </div>
                <button onClick={onLeave} className="mt-8 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest" disabled={!rewardChosen}>关闭宝箱</button>
            </div>
        </div>
    );
};


// 4.4 英雄选择视图 (ChampionSelect) - NEW
const ChampionSelect = ({ onChampionSelect }) => {
    const allChamps = Object.values(CHAMPION_POOL);
    const availableChamps = useMemo(() => {
        // 确保盖伦在池中，然后随机选另外两个
        const nonGarenChamps = allChamps.filter(c => c.name !== '盖伦');
        const randomTwo = shuffle(nonGarenChamps).slice(0, 2);
        return shuffle([allChamps.find(c => c.name === '盖伦'), ...randomTwo]);
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
            <h1 className="text-5xl font-bold text-[#C8AA6E] mb-4 uppercase tracking-widest">选择你的英雄</h1>
            <p className="text-[#F0E6D2] mb-12">选择一位英雄开始你的符文之地冒险</p>
            <div className="flex gap-10">
                {availableChamps.map(champ => (
                    <button key={champ.name} onClick={() => onChampionSelect(champ)}
                        className="w-72 h-96 bg-[#1E2328] border-2 border-[#C8AA6E] rounded-xl overflow-hidden hover:scale-105 transition-all shadow-[0_0_20px_rgba(200,170,110,0.5)] cursor-pointer relative group"
                    >
                        <img src={champ.img} className="w-full h-full object-cover object-top opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                            <h2 className="text-3xl font-bold text-[#F0E6D2]">{champ.name}</h2>
                            <p className="text-sm text-[#C8AA6E] mb-2">{champ.title}</p>
                            <p className="text-xs text-[#A09B8C] line-clamp-2">{champ.description}</p>
                            <div className="mt-3 flex items-center text-sm font-bold text-red-400">
                                <Heart size={14} className="mr-1" /> HP: {champ.maxHp}
                            </div>
                            <div className="text-xs text-blue-400 mt-1">法力: {champ.maxMana}</div> {/* 修复：显示法力值 */}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};


// 4.5 遗物提示组件 (RelicTooltip) - 修复右上角遗物提示
const RelicTooltip = ({ relic, children }) => {
    if (!relic) return children; // 防止 relic 为空导致错误
    return (
        <div className="relative group">
            {children}
            <div className="absolute top-full left-1/2 mt-2 transform -translate-x-1/2 w-48 bg-black border border-[#C8AA6E] p-3 z-[110] hidden group-hover:block text-center pointer-events-none rounded-lg shadow-xl">
                <div className="font-bold text-[#F0E6D2]">{relic.name}</div>
                <div className="text-xs text-[#A09B8C]">{relic.description}</div>
                {relic.charges !== undefined && <div className="text-xs text-red-400 mt-1">剩余次数: {relic.charges}</div>}
            </div>
        </div>
    );
};

// 4.6 其余 View 组件 (EventView, RewardView, RestView) 保持不变，但已包含在完整代码中
const EventView = ({ onLeave, onReward }) => (
    // ... (EventView code remains largely the same)
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#0AC8B9]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden">
                <img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl font-bold text-[#0AC8B9] mb-6">神秘信号</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">
                你在草丛中发现了一个遗落的守卫眼，旁边似乎还散落着一些物资...
            </p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left">
                    <div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div>
                    <div><div className="font-bold text-[#F0E6D2]">训练</div><div className="text-sm text-slate-400">永久获得 <span className="text-red-400">+2 力量</span></div></div>
                </button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left">
                    <div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div>
                    <div><div className="font-bold text-[#F0E6D2]">搜寻</div><div className="text-sm text-slate-400">获得一件 <span className="text-purple-400">随机装备</span></div></div>
                </button>
            </div>
        </div>
    </div>
);

const RewardView = ({ onSkip, onCardSelect, goldReward, championName }) => {
  const rewards = useMemo(() => {
    const allCards = Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC' && c.rarity !== 'PASSIVE');
    const heroCards = allCards.filter(c => c.hero === championName || c.hero === 'Neutral');
    return shuffle(heroCards).slice(0, 3);
  }, [championName]);
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
       <h2 className="text-4xl font-bold text-[#C8AA6E] mb-2">胜利!</h2>
       <p className="text-[#F0E6D2] mb-8 flex items-center gap-2 text-xl"><Coins className="text-yellow-400"/> +{goldReward} 金币</p>
       <h3 className="text-xl text-white mb-6 uppercase tracking-widest">选择战利品</h3>
       <div className="flex gap-6 mb-10">
          {rewards.map((card, idx) => (
             <div key={idx} onClick={() => onCardSelect(card.id)} className="w-48 h-72 bg-[#1E2328] border-2 border-[#C8AA6E] rounded-xl hover:scale-105 transition-transform cursor-pointer flex flex-col overflow-hidden group shadow-xl">
                <div className="h-32 bg-black relative"><img src={card.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /></div>
                <div className="p-4 flex-1 flex flex-col items-center text-center">
                    <h4 className="font-bold text-[#F0E6D2] mb-2">{card.name}</h4>
                    <p className="text-xs text-[#A09B8C]">{card.description}</p>
                    <div className="mt-auto text-xs font-bold text-[#C8AA6E] uppercase">{card.rarity}</div>
                </div>
             </div>
          ))}
       </div>
       <button onClick={onSkip} className="px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest">跳过</button>
    </div>
  );
};

const RestView = ({ onRest }) => (
    <div className="absolute inset-0 z-50 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col gap-8 text-center items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#0AC8B9] overflow-hidden bg-black shadow-[0_0_50px_#0AC8B9]">
                 <img src={`${ITEM_URL}/2003.png`} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-5xl font-serif text-[#0AC8B9] drop-shadow-[0_0_10px_#0AC8B9]">泉水憩息</h2>
            <button onClick={onRest} className="group w-64 h-80 bg-slate-900/80 border-2 border-[#0AC8B9] rounded-xl flex flex-col items-center justify-center hover:bg-[#0AC8B9]/20 transition-all cursor-pointer">
                <Heart size={64} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">回复</h3>
                <p className="text-[#0AC8B9]">回复 30% 生命值</p>
            </button>
        </div>
    </div>
);


// --- 5. 主游戏容器 (Game Manager) ---

export default function LegendsOfTheSpire() {
  const [view, setView] = useState('CHAMPION_SELECT'); // 初始视图改为英雄选择
  const [mapData, setMapData] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [masterDeck, setMasterDeck] = useState([]);
  const [champion, setChampion] = useState(null); // 存储当前选择的英雄数据
  const [currentHp, setCurrentHp] = useState(80);
  const [maxHp, setMaxHp] = useState(80);
  const [gold, setGold] = useState(100);
  const [relics, setRelics] = useState([]);
  const [baseStr, setBaseStr] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [usedEnemies, setUsedEnemies] = useState([]); 

  const handleChampionSelect = (selectedChamp) => {
    setChampion(selectedChamp); setMaxHp(selectedChamp.maxHp); setCurrentHp(selectedChamp.maxHp);
    setMasterDeck([...STARTING_DECK_BASIC, ...selectedChamp.initialCards]);
    setRelics([RELIC_DATABASE[selectedChamp.relicId].id]);
    const { map: newMap, finalEnemyIds } = generateMap(usedEnemies);
    setMapData(newMap); setUsedEnemies(finalEnemyIds); setCurrentFloor(0); setView('MAP');
  };


  const completeNode = () => {
      const newMap = [...mapData];
      const floorNodes = newMap[currentFloor];
      floorNodes.forEach(n => { if (n.id === activeNode.id) n.status = 'COMPLETED'; else n.status = 'LOCKED'; });
      const nextFloorIdx = currentFloor + 1;
      if (nextFloorIdx < newMap.length) {
          activeNode.next.forEach(nextId => { const nextNode = newMap[nextFloorIdx].find(n => n.id === nextId); if(nextNode) nextNode.status = 'AVAILABLE'; });
          setCurrentFloor(nextFloorIdx); setView('MAP');
      } else { setView('VICTORY_ALL'); }
  };
  
  const handleNodeSelect = (node) => {
      if (node.status !== 'AVAILABLE') return;
      setActiveNode(node);
      switch(node.type) {
          case 'BATTLE': case 'BOSS': setView('COMBAT'); break;
          case 'REST': setView('REST'); break;
          case 'SHOP': setView('SHOP'); break;
          case 'EVENT': setView('EVENT'); break;
          case 'CHEST': setView('CHEST'); break;
          default: break;
      }
  };

  const handleBattleWin = (remainingHp) => { 
      let passiveHeal = champion.relicId === "GarenPassive" ? 6 : 0; 
      setCurrentHp(Math.min(maxHp, remainingHp + passiveHeal)); 
      setView('REWARD'); 
  };
  const handleBuyCard = (card) => { setGold(prev => prev - card.price); setMasterDeck(prev => [...prev, card.id]); };
  const handleRelicReward = (relic) => { setRelics(prev => [...prev, relic.id]); if (relic.onPickup) { const ns = relic.onPickup({ maxHp, currentHp }); setMaxHp(ns.maxHp); setCurrentHp(ns.currentHp); } completeNode(); };
  const handleBuyRelic = (relic) => { setGold(prev => prev - relic.price); handleRelicReward(relic); };
  const handleEventReward = (reward) => { if (reward.type === 'BUFF' && reward.stat === 'strength') setBaseStr(prev => prev + reward.value); if (reward.type === 'RELIC_RANDOM') { const pool = Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)); if (pool.length > 0) handleRelicReward(shuffle(pool)[0]); } completeNode(); };
  const handleCardReward = (cardId) => { setMasterDeck([...masterDeck, cardId]); setGold(gold + 50); completeNode(); };
  const handleSkipReward = () => { setGold(gold + 50); completeNode(); };
  const handleRest = () => { setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.3))); completeNode(); };
  
  const restartGame = () => { setView('CHAMPION_SELECT'); setMasterDeck([]); setCurrentHp(80); setMaxHp(80); setGold(100); setRelics([]); setBaseStr(0); setChampion(null); setUsedEnemies([]); };

  const renderView = () => {
      switch(view) {
          case 'CHAMPION_SELECT': return <ChampionSelect onChampionSelect={handleChampionSelect} />;
          case 'MAP': return <MapView mapData={mapData} onNodeSelect={handleNodeSelect} currentFloor={currentFloor} />;
          case 'SHOP': return <ShopView gold={gold} deck={masterDeck} relics={relics} onLeave={() => completeNode()} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} championName={champion.name} />;
          case 'EVENT': return <EventView onLeave={() => completeNode()} onReward={handleEventReward} />;
          case 'CHEST': return <ChestView onLeave={() => completeNode()} onRelicReward={handleRelicReward} relics={relics} />;
          case 'COMBAT': return <BattleScene heroData={{...champion, maxHp, currentHp, relics, baseStr}} enemyId={activeNode.enemyId} initialDeck={masterDeck} onWin={handleBattleWin} onLose={() => setView('GAMEOVER')} floorIndex={currentFloor} />;
          case 'REWARD': return <RewardView goldReward={50} onCardSelect={handleCardReward} onSkip={handleSkipReward} championName={champion.name} />;
          case 'REST': return <RestView onRest={handleRest} />;
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">德玛西亚万岁！</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">再来一局</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">战败</h1><button onClick={restartGame} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">重新开始</button></div>;
          default: return <div>Loading...</div>;
      }
  };

  return (
      <div className="relative h-screen w-full bg-[#091428] font-sans select-none overflow-hidden">
          <AudioPlayer currentView={view} />
          {view !== 'GAMEOVER' && view !== 'VICTORY_ALL' && view !== 'CHAMPION_SELECT' && champion && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent z-50 flex items-center justify-between px-8 pointer-events-none">
                  <div className="flex items-center gap-6 pointer-events-auto">
                      {/* 修复 1: 挪动英雄被动到名字右侧 */}
                      <div className="relative group">
                          <img src={champion.avatar} className="w-12 h-12 rounded-full border-2 border-[#C8AA6E] shadow-lg" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-xs font-bold text-[#C8AA6E]">{currentFloor+1}F</div>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[#F0E6D2] font-bold text-lg shadow-black drop-shadow-md flex items-center gap-2">
                            {champion.name}
                            {/* 英雄被动遗物图标在此显示 */}
                            <RelicTooltip relic={RELIC_DATABASE[champion.relicId]}>
                                <img src={RELIC_DATABASE[champion.relicId].img} 
                                     className="w-6 h-6 rounded border border-yellow-400 bg-black/50 cursor-help hover:scale-110 transition-transform" 
                                />
                            </RelicTooltip>
                          </span>
                          <div className="flex items-center gap-4 text-sm font-bold">
                              <span className="text-red-400 flex items-center gap-1"><Heart size={14} fill="currentColor"/> {currentHp}/{maxHp}</span>
                              <span className="text-yellow-400 flex items-center gap-1"><Coins size={14} fill="currentColor"/> {gold}</span>
                          </div>
                      </div>
                  </div>
                  {/* 将通用遗物移到更靠近右侧，避免遮挡UI */}
                  <div className="flex gap-2 pointer-events-auto mr-4">
                      {relics.filter(rid => rid !== champion.relicId).map((rid, i) => {
                          const relic = RELIC_DATABASE[rid];
                          return (
                              <RelicTooltip key={i} relic={relic}>
                                  <div className="w-10 h-10 rounded border border-[#C8AA6E]/50 bg-black/50 relative group cursor-help hover:scale-110 transition-transform">
                                      <img src={relic.img} className="w-full h-full object-cover" />
                                      {relic.charges !== undefined && relic.charges > 0 && (
                                          <div className="absolute bottom-0 right-0 text-[10px] bg-red-600 rounded-full w-4 h-4 flex items-center justify-center text-white border border-black">{relic.charges}</div>
                                      )}
                                  </div>
                              </RelicTooltip>
                          );
                      })}
                  </div>
              </div>
          )}
          {renderView()}
      </div>
  );
}

// --- 6. 战斗场景 (Battle Scene) - 增加了难度缩放逻辑 ---

const BattleScene = ({ heroData, enemyId, initialDeck, onWin, onLose, floorIndex }) => { 
  
  const getScaledEnemy = (enemyId, floor) => {
    const baseEnemy = ENEMY_POOL[enemyId];
    const { maxHp, actions } = scaleEnemyStats(baseEnemy, floor);
    return { ...baseEnemy, maxHp, actions };
  };

  const enemyConfig = getScaledEnemy(enemyId, floorIndex); 
  
  // 修复 2: Mana NaN 错误。从 heroData 中读取 maxMana，并设置初始 mana。
  const initialMana = heroData.maxMana || 3; 

  const [gameState, setGameState] = useState('PLAYER_TURN');
  const [playerHp, setPlayerHp] = useState(heroData.currentHp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerMana, setPlayerMana] = useState(initialMana); // 修复 Mana NaN
  const [enemyHp, setEnemyHp] = useState(enemyConfig.maxHp); 
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [nextEnemyAction, setNextEnemyAction] = useState(enemyConfig.actions[0]);
  
  // 使用 Ref 管理牌库，解决闭包状态丢失问题
  const deckRef = useRef({
    drawPile: [],
    hand: [],
    discardPile: []
  });
  
  const [renderTrigger, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  const [dmgOverlay, setDmgOverlay] = useState(null);
  const [heroAnim, setHeroAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  const [playerStatus, setPlayerStatus] = useState({ strength: heroData.baseStr || 0, weak: 0, vulnerable: 0 });
  const [enemyStatus, setEnemyStatus] = useState({ strength: 0, weak: 0, vulnerable: 0 });

  useEffect(() => {
    const initialDrawPile = shuffle([...initialDeck]);
    deckRef.current = { drawPile: initialDrawPile, hand: [], discardPile: [] };
    let block = 0; let str = heroData.baseStr || 0;
    heroData.relics.forEach(rid => {
        const relic = RELIC_DATABASE[rid];
        if(relic.onBattleStart) { const newState = relic.onBattleStart({ block, status: { strength: str } }); block = newState.block; str = newState.status.strength; }
        if(rid === heroData.relicId && heroData.relicId === "UrgotPassive") block += 15; 
    });
    setPlayerBlock(block); setPlayerStatus(prev => ({ ...prev, strength: str }));
    startTurnLogic();
  }, []);

  const triggerAnim = (target, type) => { if(target === 'HERO') { setHeroAnim(type); setTimeout(() => setHeroAnim(""), 500); } if(target === 'ENEMY') { setEnemyAnim(type); setTimeout(() => setEnemyAnim(""), 500); } };

  const drawCards = (count) => {
      let { drawPile, hand, discardPile } = deckRef.current;
      for(let i=0; i<count; i++) {
          if (drawPile.length === 0) {
              if (discardPile.length === 0) break; 
              drawPile = shuffle([...discardPile]);
              discardPile = [];
          }
          hand.push(drawPile.pop());
          // 维克托被动：50% 几率获得一张额外基础卡
          if (heroData.relicId === "ViktorPassive" && Math.random() < 0.5) {
              const basicCard = shuffle(['Strike', 'Defend'])[0];
              hand.push(basicCard);
          }
      }
      deckRef.current = { drawPile, hand, discardPile };
      forceUpdate();
  };

  const startTurnLogic = () => {
    setGameState('PLAYER_TURN'); 
    setPlayerMana(initialMana + (heroData.relicId === "LuxPassive" ? 1 : 0)); 
    setPlayerBlock(0);
    
    let drawCount = 5; if (heroData.relicId === "JinxPassive") drawCount = 6; 
    drawCards(drawCount);
    
    setNextEnemyAction(enemyConfig.actions[Math.floor(Math.random()*enemyConfig.actions.length)]);
    
    heroData.relics.forEach(rid => { const relic = RELIC_DATABASE[rid]; if(relic.onTurnStart) { const { pState, eState } = relic.onTurnStart({ hp: playerHp, maxHp: heroData.maxHp }, { hp: enemyHp }); setPlayerHp(pState.hp); setEnemyHp(eState.hp); } });
  };

  const playCard = (index) => {
      if(gameState!=='PLAYER_TURN') return;
      const { hand, discardPile } = deckRef.current;
      const cardId = hand[index];
      const card = CARD_DATABASE[cardId];
      
      if(playerMana < card.cost) return;
      setPlayerMana(p => p - card.cost);
      
      const newHand = [...hand]; newHand.splice(index, 1);
      if(!card.exhaust) { deckRef.current = { ...deckRef.current, hand: newHand, discardPile: [...discardPile, cardId] }; } 
      else { deckRef.current = { ...deckRef.current, hand: newHand }; }
      forceUpdate();
      
      if(card.effect === 'DRAW') drawCards(card.effectValue);

      if(card.exhaust && heroData.relicId === "EkkoPassive") setPlayerStatus(s => ({ ...s, strength: s.strength + 1 }));
      if(card.type === 'SKILL' && heroData.relicId === "SylasPassive") setPlayerHp(h => Math.min(heroData.maxHp, h + 3));
      if(card.effect === 'VULNERABLE') setEnemyStatus(s => ({ ...s, vulnerable: s.vulnerable + card.effectValue }));
      if(card.effect === 'WEAK') setEnemyStatus(s => ({ ...s, weak: s.weak + card.effectValue }));
      if(card.effect === 'STRENGTH') setPlayerStatus(s => ({ ...s, strength: s.strength + card.effectValue }));
      if(card.effect === 'CLEANSE') setPlayerStatus(s => ({ ...s, weak: 0, vulnerable: 0 }));
      if(card.effect === 'HEAL') setPlayerHp(h => Math.min(heroData.maxHp, h + card.effectValue));

      if(card.type === 'ATTACK') {
          triggerAnim('HERO', 'attack'); setTimeout(() => triggerAnim('ENEMY', 'hit'), 200);
          let dmg = card.value + playerStatus.strength;
          if (playerStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          const hits = card.isMultiHit ? card.hits : 1;
          let total = 0;
          for(let i=0; i<hits; i++) {
              let finalDmg = dmg;
              if (enemyStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
              if (heroData.relicId === "YasuoPassive" && Math.random() < 0.1) finalDmg = Math.floor(finalDmg * 2);
              if (heroData.relics.includes("InfinityEdge")) finalDmg = Math.floor(finalDmg * 1.5);
              let dmgToHp = finalDmg;
              if (enemyBlock > 0) { if (enemyBlock >= finalDmg) { setEnemyBlock(b => b - finalDmg); dmgToHp = 0; } else { dmgToHp = finalDmg - enemyBlock; setEnemyBlock(0); } }
              setEnemyHp(h => Math.max(0, h - dmgToHp)); total += dmgToHp;
              if(heroData.relics.includes("VampiricScepter")) setPlayerHp(h => Math.min(heroData.maxHp, h + 1));
              if(heroData.relicId === "DariusPassive") setEnemyStatus(s => ({ ...s, weak: s.weak + 1 }));
          }
          setDmgOverlay({val: total, target: 'ENEMY'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(card.block) setPlayerBlock(b => b + card.block);
  };

  useEffect(() => { if(enemyHp<=0) setTimeout(()=>onWin(playerHp), 1000); }, [enemyHp]);
  useEffect(() => { if(playerHp<=0) setTimeout(onLose, 1000); }, [playerHp]);

  const endTurn = () => { 
      const { hand, discardPile } = deckRef.current;
      deckRef.current = { ...deckRef.current, discardPile: [...discardPile, ...hand], hand: [] };
      forceUpdate();
      setGameState('ENEMY_TURN'); 
      setPlayerStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)})); 
      setEnemyStatus(s => ({...s, weak: Math.max(0, s.weak-1), vulnerable: Math.max(0, s.vulnerable-1)})); 
      setTimeout(enemyAction, 1000); 
  };

  const enemyAction = () => {
      if(enemyHp<=0) return;
      triggerAnim('ENEMY', 'attack');
      const act = nextEnemyAction;

      // 1. 处理攻击/多段攻击
      if(act.type === 'ATTACK' || act.actionType === 'Attack') {
          setTimeout(() => triggerAnim('HERO', 'hit'), 200);
          
          const baseDmg = act.type === 'ATTACK' ? act.value : act.dmgValue;
          let dmg = baseDmg + enemyStatus.strength;
          if(enemyStatus.weak > 0) dmg = Math.floor(dmg * 0.75);

          let total = 0;
          let remBlock = playerBlock;
          let currHp = playerHp;
          const count = act.count || 1;
          for(let i=0; i<count; i++) {
             let finalDmg = dmg;
             if(playerStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
             if(remBlock >= finalDmg) remBlock -= finalDmg;
             else { 
                 let pierce = finalDmg - remBlock; 
                 remBlock = 0; 
                 currHp -= pierce;
                 if(heroData.relics.includes("BrambleVest")) { // 荆棘背心
                     setEnemyHp(h => Math.max(0, h - 3));
                 }
             }
             total += finalDmg;
          }
          setPlayerBlock(remBlock); setPlayerHp(currHp);
          setDmgOverlay({val: total, target: 'PLAYER'});
          setTimeout(()=>setDmgOverlay(null), 800);
      }

      if(act.type === 'BUFF') setEnemyBlock(b => b + act.effectValue);
      if(act.type === 'DEBUFF') { if(act.effect === 'WEAK') setPlayerStatus(s => ({...s, weak: s.weak + act.effectValue})); if(act.effect === 'VULNERABLE') setPlayerStatus(s => ({...s, vulnerable: s.vulnerable + act.effectValue})); }
      
      // 在回合结束时重置敌人格挡（除非是BUFF）
      if(act.type !== 'BUFF') setEnemyBlock(0); 
      setTimeout(startTurnLogic, 1000); 
  };

  const renderStatus = (status) => (
    <div className="flex gap-1 mt-1 flex-wrap">
        {status.strength > 0 && <div className="flex items-center text-[10px] text-red-400 bg-red-900/40 px-1 rounded border border-red-900 shadow-sm"><Sword size={10} className="mr-1"/> {status.strength}</div>}
        {status.weak > 0 && <div className="flex items-center text-[10px] text-yellow-400 bg-yellow-900/40 px-1 rounded border border-yellow-900 shadow-sm"><Activity size={10} className="mr-1"/> 虚弱 {status.weak}</div>}
        {status.vulnerable > 0 && <div className="flex items-center text-[10px] text-purple-400 bg-purple-900/40 px-1 rounded border border-purple-900 shadow-sm"><Zap size={10} className="mr-1"/> 易伤 {status.vulnerable}</div>}
    </div>
  );
  
  const displayValue = nextEnemyAction.type === 'ATTACK' ? nextEnemyAction.value : (nextEnemyAction.actionType === 'Attack' ? nextEnemyAction.dmgValue : nextEnemyAction.effectValue);
  const IntentIcon = () => { const type = nextEnemyAction.type; const isAttack = type === 'ATTACK' || nextEnemyAction.actionType === 'Attack'; if (isAttack) return <Sword size={20} className="text-red-500"/>; if (type === 'BUFF') return <Shield size={20} className="text-blue-400"/>; if (type === 'DEBUFF') return <Skull size={20} className="text-purple-400"/>; return <AlertTriangle size={20} className="text-gray-400"/>; };

  const { hand, drawPile: currentDrawPile, discardPile: currentDiscardPile } = deckRef.current;


  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: `url(${SPLASH_URL}/SummonersRift_1.jpg)`}}></div>
        
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             {/* 玩家立绘 */}
             <div className={`
                absolute left-10 bottom-[42%] w-64 h-[500px] transition-all duration-200
                ${heroAnim === 'attack' ? 'translate-x-32' : ''}
                ${heroAnim === 'hit' ? 'translate-x-[-10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 <img src={heroData.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[#C8AA6E]" />
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-[#C8AA6E] p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-[#C8AA6E] font-bold"><span>HP {playerHp}/{heroData.maxHp}</span>{playerBlock > 0 && <span className="text-blue-400 flex items-center gap-1"><Shield size={12}/>{playerBlock}</span>}</div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(playerHp/heroData.maxHp)*100}%`}}></div></div>{renderStatus(playerStatus)}</div>
             </div>

             <div className="text-6xl font-black text-[#C8AA6E]/20 italic">VS</div>

             {/* 敌人立绘同步上移 */}
             <div className={`
                absolute right-10 bottom-[42%] w-64 h-[500px] transition-all duration-200
                ${enemyAnim === 'attack' ? '-translate-x-32' : ''}
                ${enemyAnim === 'hit' ? 'translate-x-[10px] brightness-50 bg-red-500/30' : ''}
             `}>
                 <img src={enemyConfig.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-red-800" />
                 {/* 意图图标显示 scaled value */}
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-red-600 px-3 py-1 rounded flex items-center gap-2 animate-bounce"><IntentIcon /><span className="text-white font-bold text-lg">{displayValue}{nextEnemyAction.count>1?`x${nextEnemyAction.count}`:''}</span></div>
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-red-800 p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-red-500 font-bold"><span>{enemyConfig.name}</span><span>{enemyHp}/{enemyConfig.maxHp}</span></div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(enemyHp/enemyConfig.maxHp)*100}%`}}></div></div>{enemyBlock > 0 && <div className="text-blue-400 text-xs font-bold flex items-center gap-1"><Shield size={10}/> 格挡 {enemyBlock}</div>}{renderStatus(enemyStatus)}</div>
             </div>
        </div>

        {dmgOverlay && (<div className={`absolute top-1/2 ${dmgOverlay.target==='ENEMY'?'right-1/4':'left-1/4'} -translate-y-1/2 text-8xl font-black text-white drop-shadow-[0_0_10px_red] animate-ping z-50`}>{dmgOverlay.val}</div>)}

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-end justify-center pb-6 gap-4 pointer-events-none">
            <div className="absolute left-8 bottom-8 w-24 h-24 rounded-full bg-[#091428] border-4 border-[#C8AA6E] flex items-center justify-center shadow-[0_0_30px_#0066FF] pointer-events-auto text-center">
                <span className="text-4xl font-bold text-white block">{playerMana}</span>
                <span className="text-[10px] text-[#C8AA6E] block">MANA</span>
                <div className="text-[8px] text-gray-400 mt-1">{currentDrawPile.length}/{currentDiscardPile.length}</div>
            </div>
            <div className="flex items-end justify-center" style={{ width: '600px' }}>
                {hand.map((cid, i) => {
                    const c = CARD_DATABASE[cid]; const canPlay = playerMana >= c.cost && gameState === 'PLAYER_TURN';
                    // 修复 2: 手牌堆叠逻辑
                    const marginLeft = i === 0 ? 0 : (hand.length > 5 ? -40 : 10);
                    return (
                        <div key={i} onClick={()=>playCard(i)} style={{ marginLeft: `${marginLeft}px`, zIndex: i }} className={`w-40 h-60 bg-[#1E2328] border-2 rounded-lg relative flex flex-col items-center overflow-hidden shadow-2xl transition-all duration-200 group ${canPlay ? 'border-[#C8AA6E] hover:-translate-y-12 hover:scale-110 cursor-pointer hover:z-50 pointer-events-auto' : 'border-slate-700 opacity-60 pointer-events-auto'}`}>
                            <div className="w-full h-40 bg-black overflow-hidden relative"><img src={c.img} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" /><div className="absolute top-2 left-2 w-8 h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-lg shadow-md">{c.cost}</div></div>
                            <div className="flex-1 p-2 text-center flex flex-col w-full"><div className="text-sm font-bold text-[#F0E6D2] mb-1 line-clamp-1">{c.name}</div><div className="text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-2">{c.description}</div><div className="mt-auto text-[9px] text-slate-500 uppercase font-bold tracking-wider">{c.type}</div></div>
                        </div>
                    )
                })}
            </div>
            <button onClick={endTurn} disabled={gameState!=='PLAYER_TURN'} className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-[#C8AA6E] border-4 border-[#F0E6D2] flex items-center justify-center font-bold text-[#091428] shadow-lg hover:scale-105 hover:bg-white active:scale-95 transition-all pointer-events-auto">结束<br/>回合</button>
        </div>
    </div>
  );
};