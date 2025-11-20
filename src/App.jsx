import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Heart, RefreshCw, AlertTriangle, Flame, XCircle, Activity, Map as MapIcon, Gift, Anchor, Coins, ShoppingBag, ChevronRight, Star, Play, Pause, Volume2, VolumeX, Landmark, Lock, RotateCcw, Save, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. 静态资源与全局配置
// ==========================================

const CDN_VERSION = "13.1.1";
const CDN_URL = `https://ddragon.leagueoflegends.com/cdn/${CDN_VERSION}`;
const LOADING_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/loading";
const SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";
const ITEM_URL = `${CDN_URL}/img/item`;
const SPELL_URL = `${CDN_URL}/img/spell`;
const PASSIVE_URL = `${CDN_URL}/img/passive`;
const PROFILEICON_URL = `${CDN_URL}/img/profileicon`;
const VOICE_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/audio/spire/vo_assets_v1";

// 背景图配置 (按章节)
const ACT_BACKGROUNDS = {
    1: "https://i.17173cdn.com/2fhnvk/YWxqaGBf/cms3/JfEzktbjDoBxmzd.jpg", // 召唤师峡谷
    2: "https://images.17173cdn.com/2014/lol/2014/08/22/Shadow_Isles_10.jpg", // 暗影之地
    3: "https://pic.upmedia.mg/uploads/content/20220519/EV220519112427593030.webp"  // 虚空之地
};

// BGM URLs - 从constants导入
const BGM_MAP_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/To-the-Infinity%20-Castle%20(1).mp3";
const BGM_BATTLE_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/guimie-battle%20(1).mp3";

// 音效 - 使用新的R2存储地址
const SFX_BASE_URL = "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx";
const SFX_NEW_URL = "https://pub-4785f27b55bc484db8005d5841a1735a.r2.dev";
const SFX = {
    ATTACK: `${SFX_BASE_URL}/attack.mp3`, 
    BLOCK: `${SFX_BASE_URL}/block.mp3`,
    DRAW: `${SFX_BASE_URL}/draw.mp3`,
    WIN: `${SFX_BASE_URL}/win.mp3`,
    // 增强音效 - 独立的攻击、格挡、受击音效
    ATTACK_SWING: `${SFX_NEW_URL}/attack_swing.mp3`,
    ATTACK_HIT: `${SFX_NEW_URL}/attack_hit.mp3`,
    BLOCK_SHIELD: `${SFX_NEW_URL}/block_shield.mp3`,
    HIT_TAKEN: `${SFX_NEW_URL}/hit_taken.mp3`
};

const STARTING_DECK_BASIC = ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend"];
const SAVE_KEY = 'lots_save_v75';
const UNLOCK_KEY = 'lots_unlocks_v75';

// ==========================================
// 2. 游戏数据库
// ==========================================

const CHAMPION_POOL = {
  // --- 第一梯队 ---
  "Garen": { id: "Garen", name: "盖伦", title: "德玛西亚之力", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/Garen.png`, img: `${LOADING_URL}/Garen_0.jpg`, passive: "坚韧: 战斗结束时恢复 6 HP", relicId: "GarenPassive", initialCards: ["GarenQ", "GarenW", "Ignite", "Defend"], description: "德玛西亚的重装战士，擅长叠甲和持续作战。" },
  "Darius": { id: "Darius", name: "德莱厄斯", title: "诺克萨斯之手", maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Darius.png`, img: `${LOADING_URL}/Darius_0.jpg`, passive: "出血: 每次攻击时，给予敌人 1 层虚弱", relicId: "DariusPassive", initialCards: ["DariusW", "DariusE", "Strike", "Ignite"], description: "诺克萨斯的象征，依靠力量和流血效果压制敌人。" },
  "Lux": { id: "Lux", name: "拉克丝", title: "光辉女郎", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Lux.png`, img: `${LOADING_URL}/Lux_0.jpg`, passive: "光芒四射: 每回合开始时获得 1 点法力", relicId: "LuxPassive", initialCards: ["LuxQ", "LuxE", "Heal", "Ignite"], description: "法师英雄，擅长利用额外法力打出高费控制牌。" },
  "Jinx": { id: "Jinx", name: "金克丝", title: "暴走萝莉", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Jinx.png`, img: `${LOADING_URL}/Jinx_0.jpg`, passive: "爆发: 每回合初始手牌数量+1", relicId: "JinxPassive", initialCards: ["JinxQ", "JinxW", "Strike", "Strike"], description: "高爆发射手，通过快速抽牌和连击造成伤害。" },
  "Yasuo": { id: "Yasuo", name: "亚索", title: "疾风剑豪", maxHp: 78, maxMana: 3, avatar: `${CDN_URL}/img/champion/Yasuo.png`, img: `${LOADING_URL}/Yasuo_0.jpg`, passive: "浪客之道: 暴击几率+10%", relicId: "YasuoPassive", initialCards: ["YasuoQ", "YasuoE", "Defend", "Defend"], description: "高机动性剑客，利用连击和暴击进行爆发输出。" },
  "Sona": { id: "Sona", name: "娑娜", title: "琴瑟仙女", maxHp: 72, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sona.png`, img: `${LOADING_URL}/Sona_0.jpg`, passive: "能量弦: 每回合打出第三张卡时，获得 3 点临时护甲", relicId: "SonaPassive", initialCards: ["SonaQ", "SonaW", "Defend", "Heal"], description: "辅助英雄，专注于恢复和团队增益。" },
  "Ekko": { id: "Ekko", name: "艾克", title: "时间刺客", maxHp: 82, maxMana: 3, avatar: `${CDN_URL}/img/champion/Ekko.png`, img: `${LOADING_URL}/Ekko_0.jpg`, passive: "Z型驱动: 每次打出消耗卡时，获得 1 点力量", relicId: "EkkoPassive", initialCards: ["EkkoQ", "EkkoE", "Defend", "Ignite"], description: "高爆发刺客，利用消耗卡牌的机制快速成长。" },
  "Sylas": { id: "Sylas", name: "塞拉斯", title: "解脱者", maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sylas.png`, img: `${LOADING_URL}/Sylas_0.jpg`, passive: "叛乱: 每次打出技能牌时，回复 3 点生命值", relicId: "SylasPassive", initialCards: ["SylasQ", "SylasW", "Strike", "Defend"], description: "斗士英雄，通过频繁打出技能获得生存优势。" },
  "Urgot": { id: "Urgot", name: "厄加特", title: "无畏战车", maxHp: 100, maxMana: 3, avatar: `${CDN_URL}/img/champion/Urgot.png`, img: `${LOADING_URL}/Urgot_0.jpg`, passive: "回火: 战斗开始时获得 15 点临时护甲", relicId: "UrgotPassive", initialCards: ["UrgotQ", "UrgotW", "Defend", "Defend"], description: "坦克英雄，拥有高生命值和强力防御。" },
  "Viktor": { id: "Viktor", name: "维克托", title: "机械先驱", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Viktor.png`, img: `${LOADING_URL}/Viktor_0.jpg`, passive: "光荣进化: 回合开始时，50% 几率获得一张额外基础卡", relicId: "ViktorPassive", initialCards: ["ViktorQ", "ViktorE", "Ignite", "Heal"], description: "高科技法师，擅长通过快速滤牌获得优势。" },
  
  // --- 第二梯队 (新储备) ---
  "Riven": { id: "Riven", name: "瑞文", title: "放逐之刃", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Riven.png`, img: `${LOADING_URL}/Riven_0.jpg`, passive: "符文之刃: 每打出3张攻击牌，获得1点能量", relicId: "RivenPassive", initialCards: ["RivenQ", "RivenE", "Strike", "Defend"], description: "连招型战士，通过连续攻击积累能量。" },
  "TwistedFate": { id: "TwistedFate", name: "卡牌大师", title: "崔斯特", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/TwistedFate.png`, img: `${LOADING_URL}/TwistedFate_0.jpg`, passive: "灌铅骰子: 战斗胜利额外获得 15 金币", relicId: "TwistedFatePassive", initialCards: ["TwistedFateW", "TwistedFateQ", "Strike", "Ignite"], description: "经济型法师，通过额外金币获得装备优势。" },
  "LeeSin": { id: "LeeSin", name: "盲僧", title: "李青", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/LeeSin.png`, img: `${LOADING_URL}/LeeSin_0.jpg`, passive: "疾风骤雨: 打出技能牌后，下一张攻击牌费用-1", relicId: "LeeSinPassive", initialCards: ["LeeSinQ", "LeeSinW", "Strike", "Defend"], description: "节奏型战士，通过技能和攻击的配合打出连招。" },
  "Vayne": { id: "Vayne", name: "薇恩", title: "暗夜猎手", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Vayne.png`, img: `${LOADING_URL}/Vayne_0.jpg`, passive: "圣银弩箭: 对同一目标连续造成3次伤害时，额外造成10伤", relicId: "VaynePassive", initialCards: ["VayneQ", "VayneE", "Strike", "Strike"], description: "单体爆发射手，专注于对单一目标的持续输出。" },
  "Teemo": { id: "Teemo", name: "提莫", title: "迅捷斥候", maxHp: 65, maxMana: 3, avatar: `${CDN_URL}/img/champion/Teemo.png`, img: `${LOADING_URL}/Teemo_0.jpg`, passive: "游击战: 回合开始时，随机给一名敌人施加 2 层虚弱", relicId: "TeemoPassive", initialCards: ["TeemoQ", "TeemoR", "Strike", "Ignite"], description: "DoT型射手，通过虚弱和易伤削弱敌人。" },
  "Zed": { id: "Zed", name: "劫", title: "影流之主", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Zed.png`, img: `${LOADING_URL}/Zed_0.jpg`, passive: "影分身: 每回合第一张攻击牌会重复施放一次(50%伤害)", relicId: "ZedPassive", initialCards: ["ZedQ", "ZedE", "Strike", "Strike"], description: "爆发型刺客，通过复制攻击造成巨额伤害。" },
  "Nasus": { id: "Nasus", name: "内瑟斯", title: "沙漠死神", maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Nasus.png`, img: `${LOADING_URL}/Nasus_0.jpg`, passive: "汲魂痛击: 每次用攻击牌击杀敌人，获得1点力量", relicId: "NasusPassive", initialCards: ["NasusQ", "NasusW", "Strike", "Defend"], description: "无限成长型战士，通过击杀敌人永久提升力量。" },
  "Irelia": { id: "Irelia", name: "艾瑞莉娅", title: "刀锋舞者", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Irelia.png`, img: `${LOADING_URL}/Irelia_0.jpg`, passive: "热诚: 每次击杀敌人，恢复 1 点能量并抽 1 张牌", relicId: "IreliaPassive", initialCards: ["IreliaQ", "IreliaE", "Strike", "Defend"], description: "收割型战士，通过击杀重置和抽牌形成连击。" },
  "Thresh_Hero": { id: "Thresh_Hero", name: "锤石", title: "魂锁典狱长", maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Thresh.png`, img: `${LOADING_URL}/Thresh_0.jpg`, passive: "地狱诅咒: 敌人死亡增加 2 最大生命值", relicId: "ThreshPassive", initialCards: ["ThreshQ", "ThreshW", "Strike", "Defend"], description: "成长型坦克，通过击杀敌人永久提升生命上限。" },
  "Katarina_Hero": { id: "Katarina_Hero", name: "卡特琳娜", title: "不祥之刃", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Katarina.png`, img: `${LOADING_URL}/Katarina_0.jpg`, passive: "贪婪: 每回合打出的每第 4 张攻击牌伤害翻倍", relicId: "KatarinaPassive", initialCards: ["KatarinaQ", "KatarinaE", "Strike", "Strike"], description: "计数器型刺客，通过连击触发高额爆发伤害。" },
};

const RELIC_DATABASE = {
  // 基础被动遗物 (20个)
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
  "RivenPassive": { id: "RivenPassive", name: "符文之刃", description: "每打出3张攻击牌，获得1点能量", rarity: "PASSIVE", img: `${PASSIVE_URL}/RivenRunicBlades.png` },
  "TwistedFatePassive": { id: "TwistedFatePassive", name: "灌铅骰子", description: "战斗胜利额外获得 15 金币", rarity: "PASSIVE", img: `${PASSIVE_URL}/CardMaster_SealFate.png` },
  "LeeSinPassive": { id: "LeeSinPassive", name: "疾风骤雨", description: "打出技能牌后，下一张攻击牌费用-1", rarity: "PASSIVE", img: `${PASSIVE_URL}/LeeSinPassive.png` },
  "VaynePassive": { id: "VaynePassive", name: "圣银弩箭", description: "对同一目标连续造成3次伤害时，额外造成10伤", rarity: "PASSIVE", img: `${PASSIVE_URL}/Vayne_SilveredBolts.png` },
  "TeemoPassive": { id: "TeemoPassive", name: "游击战", description: "回合开始时，随机给一名敌人施加 2 层虚弱", rarity: "PASSIVE", img: `${PASSIVE_URL}/Teemo_P.png` },
  "ZedPassive": { id: "ZedPassive", name: "影分身", description: "每回合第一张攻击牌会重复施放一次(50%伤害)", rarity: "PASSIVE", img: `${PASSIVE_URL}/Zed_Passive.png` },
  "NasusPassive": { id: "NasusPassive", name: "汲魂痛击", description: "每次用攻击牌击杀敌人，获得1点力量", rarity: "PASSIVE", img: `${PASSIVE_URL}/Nasus_Passive.png` },
  "IreliaPassive": { id: "IreliaPassive", name: "热诚", description: "每次击杀敌人，恢复 1 点能量并抽 1 张牌", rarity: "PASSIVE", img: `${PASSIVE_URL}/Irelia_Passive.png` },
  "ThreshPassive": { id: "ThreshPassive", name: "地狱诅咒", description: "敌人死亡增加 2 最大生命值", rarity: "PASSIVE", img: `${PASSIVE_URL}/Thresh_Passive.png` },
  "KatarinaPassive": { id: "KatarinaPassive", name: "贪婪", description: "每回合打出的每第 4 张攻击牌伤害翻倍", rarity: "PASSIVE", img: `${PASSIVE_URL}/Katarina_Passive.png` },

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
  "GuardianAngel": { id: "GuardianAngel", name: "守护天使", price: 750, rarity: "RARE", description: "死亡时，恢复 40 点生命值。每场战斗限一次。", img: `${ITEM_URL}/3026.png`, charges: 1 },
  
  // 章节专属遗物 (Act Specific)
  "Cull": { id: "Cull", name: "萃取", price: 400, rarity: "RARE", description: "Act 1 限定：击杀 10 个敌人后获得 300 金币。", img: `${ITEM_URL}/1083.png` },
  "DarkSeal": { id: "DarkSeal", name: "黑暗封印", price: 300, rarity: "RARE", description: "Act 1 限定：每次战斗胜利 +2 HP上限。", img: `${ITEM_URL}/1082.png` },
  "QSS": { id: "QSS", name: "水银饰带", price: 500, rarity: "RARE", description: "Act 2 限定：战斗开始时获得 1 层人工制品 (抵挡Debuff)。", img: `${ITEM_URL}/3140.png` },
  "Executioner": { id: "Executioner", name: "死刑宣告", price: 450, rarity: "RARE", description: "Act 2 限定：攻击施加重伤 (敌人无法回复HP)。", img: `${ITEM_URL}/3123.png` },
  "Nashor": { id: "Nashor", name: "纳什之牙", price: 800, rarity: "RARE", description: "Act 3 限定：每回合打出的第 3 张攻击牌伤害翻倍。", img: `${ITEM_URL}/3115.png` }
};

// 扩展敌人池：加入暗影岛和虚空生物
const ENEMY_POOL = {
  // Act 1: Rift
  "Katarina": { id: "Katarina", name: "卡特琳娜", title: "不祥之刃", maxHp: 35, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Katarina_0.jpg`, avatar: `${CDN_URL}/img/champion/Katarina.png`, actions: [{ type: 'ATTACK', value: 5, count: 2, name: "瞬步连击" }, { type: 'DEBUFF', value: 0, name: "死亡莲华", effect: "VULNERABLE", effectValue: 1 }] },
  "Talon": { id: "Talon", name: "泰隆", title: "刀锋之影", maxHp: 40, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Talon_0.jpg`, avatar: `${CDN_URL}/img/champion/Talon.png`, actions: [{ type: 'ATTACK', value: 9, name: "诺克萨斯外交" }, { type: 'BUFF', value: 0, name: "翻墙跑路", effect: "BLOCK", effectValue: 8 }] },
  "Lucian": { id: "Lucian", name: "卢锡安", title: "圣枪游侠", maxHp: 55, act: 1, difficultyRank: 2, img: `${LOADING_URL}/Lucian_0.jpg`, avatar: `${CDN_URL}/img/champion/Lucian.png`, actions: [{ type: 'ATTACK', value: 6, count: 2, name: "圣光银弹" }] },
  "Darius_BOSS": { id: "Darius_BOSS", name: "德莱厄斯", title: "诺克萨斯之手", maxHp: 120, act: 1, difficultyRank: 99, img: `${LOADING_URL}/Darius_0.jpg`, avatar: `${CDN_URL}/img/champion/Darius.png`, actions: [{ type: 'ATTACK', value: 12, name: "大杀四方" }, { type: 'DEBUFF', value: 0, name: "致残打击", effect: "WEAK", effectValue: 2 }, { type: 'ATTACK', value: 20, name: "断头台！" }] },

  // Act 2: Shadow Isles
  "Hecarim": { id: "Hecarim", name: "赫卡里姆", title: "战争之影", maxHp: 80, act: 2, difficultyRank: 1, img: `${LOADING_URL}/Hecarim_0.jpg`, avatar: `${CDN_URL}/img/champion/Hecarim.png`, actions: [{ type: 'ATTACK', value: 12, name: "暴走" }, { type: 'BUFF', value: 0, name: "恐惧之灵", effect: "STRENGTH", effectValue: 2 }] },
  "Thresh": { id: "Thresh", name: "锤石", title: "魂锁典狱长", maxHp: 90, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Thresh_0.jpg`, avatar: `${CDN_URL}/img/champion/Thresh.png`, actions: [{ type: 'DEBUFF', value: 0, name: "死亡判决", effect: "VULNERABLE", effectValue: 2 }, { type: 'ATTACK', value: 8, name: "厄运钟摆" }] },
  "Karthus": { id: "Karthus", name: "卡尔萨斯", title: "死亡颂唱者", maxHp: 70, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Karthus_0.jpg`, avatar: `${CDN_URL}/img/champion/Karthus.png`, actions: [{ type: 'ATTACK', value: 4, count: 3, name: "荒芜" }, { type: 'ATTACK', value: 25, name: "安魂曲" }] },
  "Viego_BOSS": { id: "Viego_BOSS", name: "佛耶戈", title: "破败之王", maxHp: 180, act: 2, difficultyRank: 99, img: `${LOADING_URL}/Viego_0.jpg`, avatar: `${CDN_URL}/img/champion/Viego.png`, actions: [{ type: 'ATTACK', value: 15, count: 2, name: "破败王剑" }, { type: 'BUFF', value: 0, name: "茫茫焦土", effect: "BLOCK", effectValue: 20 }] },

  // Act 3: The Void
  "KhaZix": { id: "KhaZix", name: "卡兹克", title: "虚空掠夺者", maxHp: 100, act: 3, difficultyRank: 1, img: `${LOADING_URL}/Khazix_0.jpg`, avatar: `${CDN_URL}/img/champion/Khazix.png`, actions: [{ type: 'ATTACK', value: 25, name: "品尝恐惧" }] },
  "VelKoz": { id: "VelKoz", name: "维克兹", title: "虚空之眼", maxHp: 110, act: 3, difficultyRank: 2, img: `${LOADING_URL}/Velkoz_0.jpg`, avatar: `${CDN_URL}/img/champion/Velkoz.png`, actions: [{ type: 'ATTACK', value: 5, count: 4, name: "生命形态瓦解" }] },
  "BelVeth_BOSS": { id: "BelVeth_BOSS", name: "卑尔维斯", title: "虚空女皇", maxHp: 300, act: 3, difficultyRank: 99, img: `${LOADING_URL}/Belveth_0.jpg`, avatar: `${CDN_URL}/img/champion/Belveth.png`, actions: [{ type: 'ATTACK', value: 8, count: 4, name: "万载豪筵" }, { type: 'DEBUFF', value: 0, name: "虚空面容", effect: "WEAK", effectValue: 99 }] }
};

const CARD_DATABASE = {
  "Strike": { id: "Strike", hero: "Neutral", name: "打击", price: 0, type: "ATTACK", cost: 1, value: 6, description: "造成 6 点伤害。", img: `${SPELL_URL}/SummonerFlash.png`, rarity: "BASIC" },
  "Defend": { id: "Defend", hero: "Neutral", name: "防御", price: 0, type: "SKILL", cost: 1, block: 5, description: "获得 5 点护甲。", img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "BASIC" },
  "Ignite": { id: "Ignite", hero: "Neutral", name: "点燃", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "获得 2 点力量。消耗。", img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", hero: "Neutral", name: "治疗术", price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "恢复 10 点生命。消耗。", img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
  
  "GarenQ": { id: "GarenQ", hero: "Garen", name: "致命打击", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "造成 8 点伤害。给予 2 层易伤。", img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", hero: "Garen", name: "勇气", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "获得 12 点护甲。净化。", img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },
  "GarenR": { id: "GarenR", hero: "Garen", name: "德玛西亚之力", price: 200, type: "ATTACK", cost: 3, value: 30, description: "造成 30 点伤害。", img: `${SPELL_URL}/GarenR.png`, rarity: "RARE" },
  "DariusW": { id: "DariusW", hero: "Darius", name: "致残打击", price: 60, type: "ATTACK", cost: 1, value: 10, effect: "WEAK", effectValue: 1, description: "造成 10 点伤害。给予 1 层虚弱。", img: `${SPELL_URL}/DariusNoxianTacticsONH.png`, rarity: "COMMON" },
  "DariusE": { id: "DariusE", hero: "Darius", name: "无情铁手", price: 80, type: "SKILL", cost: 2, effect: "DRAW", effectValue: 1, description: "抓取 1 张牌。给予 3 层易伤。", img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "UNCOMMON" },
  "DariusR": { id: "DariusR", hero: "Darius", name: "诺克萨斯断头台", price: 200, type: "ATTACK", cost: 3, value: 35, description: "造成 35 点伤害。", img: `${SPELL_URL}/DariusR.png`, rarity: "RARE" },
  "LuxQ": { id: "LuxQ", hero: "Lux", name: "光之束缚", price: 70, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 3, description: "给予 3 层易伤。", img: `${SPELL_URL}/LuxLightBinding.png`, rarity: "COMMON" },
  "LuxE": { id: "LuxE", hero: "Lux", name: "透光奇点", price: 120, type: "ATTACK", cost: 2, value: 15, exhaust: true, description: "造成 15 点伤害。消耗。", img: `${SPELL_URL}/LuxLightStrikeKage.png`, rarity: "UNCOMMON" },
  "LuxR": { id: "LuxR", hero: "Lux", name: "终极闪光", price: 200, type: "ATTACK", cost: 3, value: 40, description: "造成 40 点伤害。", img: `${SPELL_URL}/LuxR.png`, rarity: "RARE" },
  "JinxQ": { id: "JinxQ", hero: "Jinx", name: "切自动挡", price: 40, type: "ATTACK", cost: 0, value: 4, isMultiHit: true, hits: 2, description: "造成 2 次 4 点伤害。", img: `${SPELL_URL}/JinxQ.png`, rarity: "COMMON" },
  "JinxW": { id: "JinxW", hero: "Jinx", name: "震荡电磁波", price: 90, type: "ATTACK", cost: 2, value: 20, effect: "WEAK", effectValue: 2, description: "造成 20 点伤害。给予 2 层虚弱。", img: `${SPELL_URL}/JinxW.png`, rarity: "UNCOMMON" },
  "JinxR": { id: "JinxR", hero: "Jinx", name: "超究极死神飞弹", price: 200, type: "ATTACK", cost: 3, value: 35, description: "造成 35 点伤害。", img: `${SPELL_URL}/JinxR.png`, rarity: "RARE" },
  "YasuoQ": { id: "YasuoQ", hero: "Yasuo", name: "斩钢闪", price: 40, type: "ATTACK", cost: 0, value: 4, description: "造成 4 点伤害。", img: `${SPELL_URL}/YasuoQ1Wrapper.png`, rarity: "COMMON" },
  "YasuoE": { id: "YasuoE", hero: "Yasuo", name: "踏前斩", price: 70, type: "ATTACK", cost: 1, value: 8, effect: "STRENGTH", effectValue: 1, description: "造成 8 点伤害。获得 1 点力量。", img: `${SPELL_URL}/YasuoDashWrapper.png`, rarity: "UNCOMMON" },
  "YasuoR": { id: "YasuoR", hero: "Yasuo", name: "狂风绝息斩", price: 200, type: "ATTACK", cost: 3, value: 30, effect: "VULNERABLE", effectValue: 3, description: "造成 30 点伤害。给予 3 层易伤。", img: `${SPELL_URL}/YasuoR.png`, rarity: "RARE" },
  "SonaQ": { id: "SonaQ", hero: "Sona", name: "英勇赞美诗", price: 50, type: "ATTACK", cost: 1, value: 7, effect: "HEAL", effectValue: 3, description: "造成 7 点伤害，回复 3 点生命。", img: `${SPELL_URL}/SonaHymnofValor.png`, rarity: "COMMON" },
  "SonaW": { id: "SonaW", hero: "Sona", name: "坚毅咏叹调", price: 80, type: "SKILL", cost: 1, block: 8, effect: "HEAL", effectValue: 5, description: "获得 8 点护甲，回复 5 点生命。", img: `${SPELL_URL}/SonaAriaofPerseverance.png`, rarity: "UNCOMMON" },
  "SonaR": { id: "SonaR", hero: "Sona", name: "狂舞终乐章", price: 200, type: "SKILL", cost: 3, effect: "VULNERABLE", effectValue: 5, block: 15, description: "获得 15 点护甲。给予 5 层易伤。", img: `${SPELL_URL}/SonaR.png`, rarity: "RARE" },
  "EkkoQ": { id: "EkkoQ", hero: "Ekko", name: "时间卷曲器", price: 50, type: "ATTACK", cost: 1, value: 12, exhaust: true, description: "造成 12 点伤害。消耗。", img: `${SPELL_URL}/EkkoQ.png`, rarity: "COMMON" },
  "EkkoE": { id: "EkkoE", hero: "Ekko", name: "相位俯冲", price: 90, type: "SKILL", cost: 0, block: 5, exhaust: true, description: "获得 5 点护甲。", img: `${SPELL_URL}/EkkoE.png`, rarity: "UNCOMMON" },
  "EkkoR": { id: "EkkoR", hero: "Ekko", name: "时空断裂", price: 200, type: "SKILL", cost: 3, effect: "HEAL", effectValue: 30, block: 20, description: "获得 20 点护甲，回复 30 点生命。", img: `${SPELL_URL}/EkkoR.png`, rarity: "RARE" },
  "SylasQ": { id: "SylasQ", hero: "Sylas", name: "锁链鞭击", price: 50, type: "ATTACK", cost: 1, value: 7, isMultiHit: true, hits: 2, description: "造成 2 次 7 点伤害。", img: `${SPELL_URL}/SylasQ.png`, rarity: "COMMON" },
  "SylasW": { id: "SylasW", hero: "Sylas", name: "弑君突刺", price: 90, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 15, description: "回复 15 点生命。", img: `${SPELL_URL}/SylasW.png`, rarity: "UNCOMMON" },
  "SylasR": { id: "SylasR", hero: "Sylas", name: "其人之道", price: 200, type: "ATTACK", cost: 3, value: 25, effect: "DRAW", effectValue: 2, description: "造成 25 点伤害。抓取 2 张牌。", img: `${SPELL_URL}/SylasR.png`, rarity: "RARE" },
  "UrgotQ": { id: "UrgotQ", hero: "Urgot", name: "腐蚀电荷", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "WEAK", effectValue: 1, description: "造成 8 点伤害，给予 1 层虚弱。", img: `${SPELL_URL}/UrgotQ.png`, rarity: "COMMON" },
  "UrgotW": { id: "UrgotW", hero: "Urgot", name: "净除", price: 90, type: "SKILL", cost: 1, block: 8, effect: "VULNERABLE", effectValue: 1, description: "获得 8 点护甲，给予 1 层易伤。", img: `${SPELL_URL}/UrgotW.png`, rarity: "UNCOMMON" },
  "UrgotR": { id: "UrgotR", hero: "Urgot", name: "超越死亡的恐惧", price: 200, type: "ATTACK", cost: 3, value: 30, effect: "WEAK", effectValue: 3, description: "造成 30 点伤害。给予 3 层虚弱。", img: `${SPELL_URL}/UrgotR.png`, rarity: "RARE" },
  "ViktorQ": { id: "ViktorQ", hero: "Viktor", name: "能量转移", price: 40, type: "ATTACK", cost: 0, value: 3, block: 3, description: "造成 3 点伤害，获得 3 点护甲。", img: `${SPELL_URL}/ViktorPowerTransfer.png`, rarity: "COMMON" },
  "ViktorE": { id: "ViktorE", hero: "Viktor", name: "死亡射线", price: 100, type: "ATTACK", cost: 2, value: 18, description: "造成 18 点伤害。", img: `${SPELL_URL}/ViktorDeathRay.png`, rarity: "UNCOMMON" },
  "ViktorR": { id: "ViktorR", hero: "Viktor", name: "混乱风暴", price: 200, type: "ATTACK", cost: 3, value: 18, isMultiHit: true, hits: 2, description: "造成 2 次 18 点伤害。", img: `${SPELL_URL}/ViktorR.png`, rarity: "RARE" },

  // 新储备英雄技能 (Placeholder icons until updated)
  "RivenQ": { id: "RivenQ", hero: "Riven", name: "折翼之舞", price: 50, type: "ATTACK", cost: 0, value: 4, description: "造成 4 点伤害。", img: `${SPELL_URL}/RivenTriCleave.png`, rarity: "COMMON" },
  "RivenE": { id: "RivenE", hero: "Riven", name: "勇往直前", price: 80, type: "SKILL", cost: 1, block: 5, effect: "DRAW", effectValue: 1, description: "获得 5 点护甲。抓取 1 张牌。", img: `${SPELL_URL}/RivenFeint.png`, rarity: "UNCOMMON" },
  "RivenR": { id: "RivenR", hero: "Riven", name: "放逐之锋", price: 200, type: "ATTACK", cost: 3, value: 32, effect: "STRENGTH", effectValue: 3, description: "造成 32 点伤害。获得 3 点力量。", img: `${SPELL_URL}/RivenR.png`, rarity: "RARE" },
  "TwistedFateW": { id: "TwistedFateW", hero: "TwistedFate", name: "选牌", price: 60, type: "SKILL", cost: 1, description: "获得随机一张红/黄/蓝牌 (简化: 抽2张)", effect: "DRAW", effectValue: 2, img: `${SPELL_URL}/PickACard.png`, rarity: "COMMON" },
  "TwistedFateQ": { id: "TwistedFateQ", hero: "TwistedFate", name: "万能牌", price: 90, type: "ATTACK", cost: 2, value: 8, description: "造成 8 点伤害 (群攻简化为单体)。", img: `${SPELL_URL}/WildCards.png`, rarity: "COMMON" },
  "TwistedFateR": { id: "TwistedFateR", hero: "TwistedFate", name: "命运", price: 200, type: "SKILL", cost: 3, effect: "DRAW", effectValue: 3, description: "抓取 3 张牌。", img: `${SPELL_URL}/TwistedFateR.png`, rarity: "RARE" },
  "LeeSinQ": { id: "LeeSinQ", hero: "LeeSin", name: "天音波", price: 50, type: "ATTACK", cost: 1, value: 6, effect: "VULNERABLE", effectValue: 1, description: "造成 6 点伤害。给予 1 层易伤。", img: `${SPELL_URL}/BlindMonkQOne.png`, rarity: "COMMON" },
  "LeeSinW": { id: "LeeSinW", hero: "LeeSin", name: "金钟罩", price: 80, type: "SKILL", cost: 1, block: 8, description: "获得 8 点护甲。", img: `${SPELL_URL}/BlindMonkWOne.png`, rarity: "UNCOMMON" },
  "LeeSinR": { id: "LeeSinR", hero: "LeeSin", name: "神龙摆尾", price: 200, type: "ATTACK", cost: 3, value: 30, effect: "VULNERABLE", effectValue: 5, description: "造成 30 点伤害。给予 5 层易伤。", img: `${SPELL_URL}/LeeSinR.png`, rarity: "RARE" },
  "VayneQ": { id: "VayneQ", hero: "Vayne", name: "闪避突袭", price: 40, type: "ATTACK", cost: 0, value: 4, description: "造成 4 点伤害。", img: `${SPELL_URL}/VayneTumble.png`, rarity: "COMMON" },
  "VayneE": { id: "VayneE", hero: "Vayne", name: "恶魔审判", price: 90, type: "ATTACK", cost: 2, value: 12, effect: "WEAK", effectValue: 2, description: "造成 12 点伤害。给予 2 层虚弱。", img: `${SPELL_URL}/VayneCondemn.png`, rarity: "UNCOMMON" },
  "VayneR": { id: "VayneR", hero: "Vayne", name: "终极时刻", price: 200, type: "ATTACK", cost: 3, value: 25, effect: "STRENGTH", effectValue: 5, description: "造成 25 点伤害。获得 5 点力量。", img: `${SPELL_URL}/VayneR.png`, rarity: "RARE" },
  "TeemoQ": { id: "TeemoQ", hero: "Teemo", name: "致盲吹箭", price: 50, type: "ATTACK", cost: 1, value: 5, effect: "WEAK", effectValue: 2, description: "造成 5 点伤害。给予 2 层虚弱。", img: `${SPELL_URL}/BlindingDart.png`, rarity: "COMMON" },
  "TeemoR": { id: "TeemoR", hero: "Teemo", name: "种蘑菇", price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 4, exhaust: true, description: "给予 4 层易伤。消耗。", img: `${SPELL_URL}/TeemoRCast.png`, rarity: "UNCOMMON" },
  "ZedQ": { id: "ZedQ", hero: "Zed", name: "影奥义！诸刃", price: 50, type: "ATTACK", cost: 1, value: 8, description: "造成 8 点伤害。", img: `${SPELL_URL}/ZedQ.png`, rarity: "COMMON" },
  "ZedE": { id: "ZedE", hero: "Zed", name: "影奥义！鬼斩", price: 80, type: "ATTACK", cost: 1, value: 4, effect: "DRAW", effectValue: 1, description: "造成 4 点伤害。抓取 1 张牌。", img: `${SPELL_URL}/ZedE.png`, rarity: "UNCOMMON" },
  "ZedR": { id: "ZedR", hero: "Zed", name: "禁奥义！瞬狱影杀阵", price: 200, type: "ATTACK", cost: 3, value: 18, isMultiHit: true, hits: 2, description: "造成 2 次 18 点伤害。", img: `${SPELL_URL}/ZedR.png`, rarity: "RARE" },
  "NasusQ": { id: "NasusQ", hero: "Nasus", name: "汲魂痛击", price: 50, type: "ATTACK", cost: 1, value: 6, description: "造成 6 点伤害。", img: `${SPELL_URL}/NasusQ.png`, rarity: "COMMON" },
  "NasusW": { id: "NasusW", hero: "Nasus", name: "枯萎", price: 80, type: "SKILL", cost: 1, effect: "WEAK", effectValue: 3, description: "给予 3 层虚弱。", img: `${SPELL_URL}/NasusW.png`, rarity: "UNCOMMON" },
  "NasusR": { id: "NasusR", hero: "Nasus", name: "死神降临", price: 200, type: "ATTACK", cost: 3, value: 30, effect: "STRENGTH", effectValue: 5, block: 15, description: "造成 30 点伤害。获得 5 点力量和 15 点护甲。", img: `${SPELL_URL}/NasusR.png`, rarity: "RARE" },
  "IreliaQ": { id: "IreliaQ", hero: "Irelia", name: "利刃冲击", price: 50, type: "ATTACK", cost: 1, value: 8, description: "造成 8 点伤害。", img: `${SPELL_URL}/IreliaQ.png`, rarity: "COMMON" },
  "IreliaE": { id: "IreliaE", hero: "Irelia", name: "比翼双刃", price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 2, description: "给予 2 层易伤。", img: `${SPELL_URL}/IreliaE.png`, rarity: "UNCOMMON" },
  "IreliaR": { id: "IreliaR", hero: "Irelia", name: "先锋之刃", price: 200, type: "ATTACK", cost: 3, value: 12, isMultiHit: true, hits: 3, description: "造成 3 次 12 点伤害。", img: `${SPELL_URL}/IreliaR.png`, rarity: "RARE" },
  "ThreshQ": { id: "ThreshQ", hero: "Thresh_Hero", name: "死亡判决", price: 80, type: "ATTACK", cost: 2, value: 10, effect: "VULNERABLE", effectValue: 1, description: "造成 10 点伤害。给予 1 层易伤。", img: `${SPELL_URL}/ThreshQ.png`, rarity: "COMMON" },
  "ThreshW": { id: "ThreshW", hero: "Thresh_Hero", name: "魂引之灯", price: 70, type: "SKILL", cost: 1, block: 10, effect: "DRAW", effectValue: 1, description: "获得 10 点护甲。抓取 1 张牌。", img: `${SPELL_URL}/ThreshW.png`, rarity: "UNCOMMON" },
  "ThreshR": { id: "ThreshR", hero: "Thresh_Hero", name: "幽冥监牢", price: 200, type: "SKILL", cost: 3, effect: "VULNERABLE", effectValue: 5, block: 20, description: "获得 20 点护甲。给予 5 层易伤。", img: `${SPELL_URL}/ThreshR.png`, rarity: "RARE" },
  "KatarinaQ": { id: "KatarinaQ", hero: "Katarina_Hero", name: "弹射之刃", price: 50, type: "ATTACK", cost: 1, value: 4, isMultiHit: true, hits: 3, description: "造成 3 次 4 点伤害。", img: `${SPELL_URL}/KatarinaQ.png`, rarity: "COMMON" },
  "KatarinaE": { id: "KatarinaE", hero: "Katarina_Hero", name: "瞬步", price: 40, type: "ATTACK", cost: 0, value: 3, effect: "DRAW", effectValue: 1, description: "造成 3 点伤害。抓取 1 张牌。", img: `${SPELL_URL}/KatarinaE.png`, rarity: "UNCOMMON" },
  "KatarinaR": { id: "KatarinaR", hero: "Katarina_Hero", name: "死亡莲华", price: 200, type: "ATTACK", cost: 3, value: 8, isMultiHit: true, hits: 5, description: "造成 5 次 8 点伤害。", img: `${SPELL_URL}/KatarinaR.png`, rarity: "RARE" },
};

// --- Utils ---
const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
const scaleEnemyStats = (baseStats, floorIndex, act) => {
  const difficultyMultiplier = 1 + 0.1 * floorIndex; 
  const actMultiplier = act; 
  const scaledHp = Math.floor(baseStats.maxHp * difficultyMultiplier * actMultiplier);
  const scaledActions = baseStats.actions.map(action => {
    let scaledAction = { ...action };
    const isAttack = scaledAction.type === 'ATTACK' || scaledAction.actionType === 'Attack';
    if (isAttack) {
      const baseDmg = scaledAction.type === 'ATTACK' ? scaledAction.value : scaledAction.dmgValue;
      // 降低攻击力50%：原来 floorIndex * 2，现在改为 floorIndex * 1，并且整体降低50%
      const scaledDmg = Math.floor((baseDmg + floorIndex * 1 + (act - 1) * 3) * 0.5);
      if (scaledAction.type === 'ATTACK') scaledAction.value = scaledDmg;
      if (scaledAction.actionType === 'Attack') scaledAction.dmgValue = scaledDmg;
    }
    if (action.effect && ['WEAK', 'VULNERABLE', 'STRENGTH'].includes(action.effect)) {
        scaledAction.effectValue = action.effectValue + Math.floor(floorIndex / 5); 
    }
    return scaledAction;
  });
  return { maxHp: scaledHp, actions: scaledActions };
};

const generateMap = (usedEnemyIds, act) => {
  const map = [];
  const actEnemyIds = Object.keys(ENEMY_POOL).filter(id => ENEMY_POOL[id].act === act && ENEMY_POOL[id].difficultyRank < 99);
  
  const getRandomEnemy = () => {
      const pool = actEnemyIds.length > 0 ? actEnemyIds : Object.keys(ENEMY_POOL).filter(id => ENEMY_POOL[id].difficultyRank < 99); 
      return pool[Math.floor(Math.random() * pool.length)];
  };
  
  const createNode = (id, type) => {
      const node = { id, type, status: 'LOCKED', next: [] };
      if (type === 'BATTLE') node.enemyId = getRandomEnemy();
      return node;
  };

  map.push([{ ...createNode('1-0', 'BATTLE'), status: 'AVAILABLE', next: ['2-0', '2-1'] }]);
  for (let i = 2; i <= 8; i++) {
    // Rest只在第8层（Boss前）出现，且只有10%概率
    const restOptions = i === 8 ? (Math.random() < 0.1 ? ['REST'] : []) : [];
    const nodeType1Pool = i === 8 
      ? [...restOptions, 'BATTLE', 'SHOP', 'EVENT', 'CHEST'].filter(Boolean)
      : ['BATTLE', 'SHOP', 'EVENT', 'CHEST'];
    const nodeType2Pool = i === 8 
      ? [...restOptions, 'BATTLE', 'EVENT', 'CHEST', 'SHOP'].filter(Boolean)
      : ['BATTLE', 'EVENT', 'CHEST', 'SHOP'];
    const nodeType1 = shuffle(nodeType1Pool)[0];
    const nodeType2 = shuffle(nodeType2Pool)[0];
    const nodes = [createNode(`${i}-0`, nodeType1), createNode(`${i}-1`, nodeType2)];
    const nextFloorIndex = i + 1;
    if (nextFloorIndex <= 9) {
        nodes[0].next = [`${nextFloorIndex}-0`, `${nextFloorIndex}-1`]; 
        nodes[1].next = [`${nextFloorIndex}-0`, `${nextFloorIndex}-1`]; 
    }
    if (i === 8) {
         nodes[0].next = [`9-0`];
         nodes[1].next = [`9-0`];
    }
    map.push(nodes);
  }
  // 第9层固定为REST（Boss前）
  map.push([{ ...createNode('9-0', 'REST'), next: ['10-0'] }]);
  
  let bossId = "Darius_BOSS";
  if (act === 2) bossId = "Viego_BOSS";
  if (act === 3) bossId = "BelVeth_BOSS";
  
  map.push([{ id: '10-0', type: 'BOSS', enemyId: bossId, status: 'LOCKED', next: [] }]);
  
  return { map };
};

// --- Components ---

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

const AudioPlayer = ({ src }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.3);
    useEffect(() => {
        if(audioRef.current && src) { 
            audioRef.current.volume = volume;
            audioRef.current.load(); // 重新加载音频
            const p = audioRef.current.play(); 
            if(p !== undefined) {
                p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); 
            }
        } 
    }, [src, volume]);
    const togglePlay = () => {
        if (isPlaying) { 
            audioRef.current?.pause(); 
            setIsPlaying(false); 
        } else { 
            audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); 
        } 
    };
    return (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-black/50 p-2 rounded-full border border-[#C8AA6E]/50 hover:bg-black/80 transition-all">
            <audio ref={audioRef} src={src} loop />
            <button onClick={togglePlay} className="text-[#C8AA6E] hover:text-white">{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={()=>{const v=volume===0?0.3:0; setVolume(v); if(audioRef.current) audioRef.current.volume=v;}} className="text-[#C8AA6E] hover:text-white">{volume===0 ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
        </div>
    );
};

const Card = ({ cardId, index, totalCards, canPlay, onPlay }) => {
  const card = CARD_DATABASE[cardId];
  const overlap = totalCards > 5 ? -50 : 10; 
  const rotation = (index - (totalCards - 1) / 2) * 3;
  const yOffset = Math.abs(index - (totalCards - 1) / 2) * 6; 

  return (
    <motion.div
      layout
      initial={{ y: 100, opacity: 0, scale: 0.5 }}
      animate={{ y: yOffset, opacity: 1, scale: 1, rotate: rotation }}
      exit={{ y: -100, opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ 
        marginLeft: index === 0 ? 0 : `${overlap}px`, 
        zIndex: index,
        transformOrigin: "bottom center",
        position: 'relative'
      }}
      drag={canPlay ? "y" : false}
      dragConstraints={{ top: -300, bottom: 0 }}
      dragSnapToOrigin={true}
      onDragEnd={(event, info) => { if (info.offset.y < -150 && canPlay) { onPlay(index); } }}
      whileHover={{ scale: 1.2, y: -80, zIndex: 100, rotate: 0 }}
      className={`w-40 h-60 bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl ${canPlay ? 'border-[#C8AA6E] cursor-grab active:cursor-grabbing' : 'border-slate-700 opacity-60 cursor-not-allowed'}`}
    >
      <div className="w-full h-36 bg-black overflow-hidden relative pointer-events-none">
        <img src={card.img} className="w-full h-full object-cover opacity-90" alt={card.name} />
        <div className="absolute top-1 left-1 w-6 h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-sm shadow-md">{card.cost}</div>
      </div>
      <div className="flex-1 p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]">
        <div className="text-xs font-bold text-[#F0E6D2] mb-1 line-clamp-1">{card.name}</div>
        <div className="text-[9px] text-[#A09B8C] leading-tight font-medium line-clamp-2">{card.description}</div>
        <div className="mt-auto text-[8px] text-slate-500 uppercase font-bold tracking-wider">{card.type}</div>
      </div>
    </motion.div>
  );
};

const MapView = ({ mapData, onNodeSelect, act }) => {
  const getMapIcon = (node) => {
      if (node.type === 'BOSS') {
          if(act===1) return `${CDN_URL}/img/champion/Darius.png`;
          if(act===2) return `${CDN_URL}/img/champion/Viego.png`;
          if(act===3) return `${CDN_URL}/img/champion/Belveth.png`;
      }
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
      <div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-black/60 z-10" /><div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: `url('${ACT_BACKGROUNDS[act] || ACT_BACKGROUNDS[1]}')` }}></div></div>
      <div className="relative z-20 w-full h-full flex flex-col-reverse items-center overflow-y-auto py-20 gap-16 hide-scrollbar">
        <div className="text-[#C8AA6E] font-serif text-2xl mb-8">第 {act} 章</div>
        {mapData.map((floor, floorIndex) => (
          <div key={floorIndex} className="flex justify-center gap-24 relative group">
            {floor.map((node, nodeIndex) => {
               const isAvailable = node.status === 'AVAILABLE';
               const isCompleted = node.status === 'COMPLETED';
               const isLocked = node.status === 'LOCKED';
               const iconUrl = getMapIcon(node);
               const labelText = node.type === 'BATTLE' ? (ENEMY_POOL[node.enemyId]?.name || 'Unknown') : node.type;
               return (
                 <div key={node.id} className="relative flex flex-col items-center">
                    {node.next && node.next.length > 0 && (
                        <div className="absolute bottom-full left-1/2 w-full h-16 pointer-events-none">
                            <svg width="200" height="64" style={{ overflow: 'visible', position: 'absolute', bottom: 0, left: '-100px' }}>
                                {node.next.map(nextId => {
                                    const nextNodeIndex = parseInt(nextId.split('-')[1]);
                                    const dx = (nextNodeIndex - nodeIndex) * 50 + 100; 
                                    return <line key={nextId} x1="100" y1="64" x2={dx} y2="0" stroke={isLocked ? "#334155" : "#C8AA6E"} strokeWidth="2" opacity="0.5" />;
                                })}
                            </svg>
                        </div>
                    )}
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

const ShopView = ({ onLeave, onBuyCard, onBuyRelic, onBuyMana, gold, deck, relics, championName }) => {
    const cardStock = useMemo(() => shuffle(Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC' && (c.hero === 'Neutral' || c.hero === championName))).slice(0, 5), [championName]);
    const relicStock = useMemo(() => Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)).slice(0, 3), [relics]);
    const showManaUpgrade = useMemo(() => Math.random() < 0.2, []); // 20%概率
    const [purchasedItems, setPurchasedItems] = useState([]);
    const handleBuy = (item, type) => { if (gold >= item.price && !purchasedItems.includes(item.id)) { setPurchasedItems([...purchasedItems, item.id]); if (type === 'CARD') onBuyCard(item); if (type === 'RELIC') onBuyRelic(item); } };
    return (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-6xl px-10 py-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#C8AA6E] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#C8AA6E] overflow-hidden bg-black"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                        <div><h2 className="text-3xl font-bold text-[#C8AA6E]">黑市商人</h2><p className="text-[#A09B8C] italic">"只要给钱，什么都卖。"</p></div>
                        </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600"><Coins size={32} /> {gold}</div>
                        </div>
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
                        {showManaUpgrade && (
                            <div className="mt-6">
                                <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-yellow-500 pl-3">特殊强化</h3>
                                <button 
                                    onClick={() => { if (gold >= 200 && !purchasedItems.includes('MANA_UPGRADE')) { setPurchasedItems([...purchasedItems, 'MANA_UPGRADE']); onBuyMana(); } }}
                                    disabled={gold < 200 || purchasedItems.includes('MANA_UPGRADE')}
                                    className={`p-4 w-full bg-slate-800 hover:bg-yellow-900/50 border rounded transition-all flex items-center gap-4 text-left ${
                                        gold >= 200 && !purchasedItems.includes('MANA_UPGRADE') 
                                            ? 'border-yellow-600 hover:border-yellow-500 cursor-pointer' 
                                            : 'border-slate-600 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="p-3 bg-black rounded border border-slate-700"><Zap className="text-yellow-500" /></div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[#F0E6D2]">能量上限+1</div>
                                        <div className="text-sm text-slate-400">永久增加 <span className="text-yellow-400">1 点能量上限</span></div>
                                    </div>
                                    <div className="text-yellow-400 font-bold">200 G</div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30"><button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">离开 <ChevronRight /></button></div>
            </div>
        </div>
    )
}

const ChestView = ({ onLeave, onRelicReward, relics, act }) => {
    // 根据当前章节过滤遗物：ACT1只能获得通用遗物，ACT2可以获得ACT1+ACT2，ACT3可以获得所有
    const availableRelics = Object.values(RELIC_DATABASE).filter(r => {
        if (r.rarity === 'PASSIVE' || r.rarity === 'BASIC' || relics.includes(r.id)) return false;
        // 章节专属遗物检查
        if (r.id === 'Cull' || r.id === 'DarkSeal') return act === 1; // ACT1专属
        if (r.id === 'QSS' || r.id === 'Executioner') return act >= 2; // ACT2专属
        if (r.id === 'Nashor') return act >= 3; // ACT3专属
        return true; // 通用遗物所有章节都可以获得
    });
    const rewards = useMemo(() => shuffle(availableRelics).slice(0, 3), [relics, act]);
    const [rewardChosen, setRewardChosen] = useState(false);
    const handleChoose = (relic) => { if (rewardChosen) return; setRewardChosen(true); onRelicReward(relic); };
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative z-10 max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden bg-black flex items-center justify-center"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">海克斯宝箱</h2>
                <p className="text-[#F0E6D2] text-lg mb-8">打开宝箱，选择一件强大的装备来武装自己。</p>
                <div className="flex justify-center gap-8">
                    {rewards.map((relic) => (
                        <div key={relic.id} onClick={() => handleChoose(relic)} className={`w-36 relative group transition-all p-4 rounded-lg border-2 ${rewardChosen ? 'opacity-40 pointer-events-none' : 'hover:scale-110 cursor-pointer border-[#C8AA6E] shadow-xl hover:shadow-[0_0_20px_#C8AA6E]'}`}>
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

const ChampionSelect = ({ onChampionSelect, unlockedIds }) => {
    const allChamps = Object.values(CHAMPION_POOL);
    const [refreshCount, setRefreshCount] = useState(0);
    const [displayChamps, setDisplayChamps] = useState(() => {
        const shuffled = shuffle([...allChamps]);
        return shuffled.slice(0, 3);
    });
    
    const handleRefresh = () => {
        if (refreshCount >= 3) {
            alert("基哥觉得你很机车，不许你再挑赶紧开始测");
            return;
        }
        const shuffled = shuffle([...allChamps]);
        setDisplayChamps(shuffled.slice(0, 3));
        setRefreshCount(prev => prev + 1);
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
            <h1 className="text-5xl font-bold text-[#C8AA6E] mb-4 uppercase tracking-widest">选择你的英雄</h1>
            <p className="text-[#F0E6D2] mb-4">选择一位英雄开始你的符文之地冒险</p>
            <button 
                onClick={handleRefresh} 
                className="mb-8 px-6 py-2 bg-[#C8AA6E]/20 hover:bg-[#C8AA6E]/40 border border-[#C8AA6E] text-[#C8AA6E] rounded transition-all flex items-center gap-2"
            >
                <RefreshCw size={16} />
                <span>刷新英雄 ({refreshCount}/3)</span>
            </button>
            <div className="flex gap-8">
                {displayChamps.map(c => { 
                    return (
                        <button 
                            key={c.id} 
                            onClick={() => onChampionSelect(c)} 
                            className="w-72 border-2 border-[#C8AA6E] p-4 text-left relative group transition-all hover:scale-105 cursor-pointer bg-[#091428]/80 flex flex-col"
                            style={{ minHeight: '28rem', maxHeight: '28rem' }}
                        >
                            <img src={c.img} className="w-full h-48 object-cover mb-3 rounded border border-[#C8AA6E]/50 flex-shrink-0" />
                            <div className="mb-2 flex-shrink-0">
                                <h2 className="text-xl text-[#C8AA6E] font-bold">{c.name}</h2>
                                <p className="text-xs text-[#A09B8C] italic">{c.title}</p>
                            </div>
                            <div className="mb-2 flex items-center gap-2 text-xs flex-shrink-0">
                                <span className="text-red-400 flex items-center gap-1"><Heart size={12} /> {c.maxHp} HP</span>
                                <span className="text-blue-400 flex items-center gap-1"><Zap size={12} /> {c.maxMana} 能量</span>
                        </div>
                            <p className="text-xs text-gray-300 mb-2 line-clamp-2 overflow-hidden flex-shrink-0" style={{ maxHeight: '2.5rem' }}>{c.description}</p>
                            <div className="border-t border-[#C8AA6E]/30 pt-2 mt-auto">
                                <div className="text-xs text-blue-400 font-bold mb-1">专属被动</div>
                                <div className="text-xs text-[#A09B8C] line-clamp-2 overflow-hidden" style={{ maxHeight: '2.5rem' }}>{c.passive}</div>
            </div>
                            <div className="border-t border-[#C8AA6E]/30 pt-2 mt-2">
                                <div className="text-xs text-purple-400 font-bold mb-1">初始卡组</div>
                                <div className="text-xs text-[#A09B8C] flex flex-wrap gap-1">
                                    {c.initialCards.map(cardId => {
                                        const card = CARD_DATABASE[cardId];
                                        return card ? <span key={cardId} className="px-1 bg-black/50 rounded">{card.name}</span> : null;
                                    })}
        </div>
                            </div>
                        </button>
                    ) 
                })}
            </div>
        </div>
    );
};

const EventView = ({ onLeave, onReward }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#0AC8B9]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden"><img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">神秘信号</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">你在草丛中发现了一个遗落的守卫眼，旁边似乎还散落着一些物资...</p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div><div><div className="font-bold text-[#F0E6D2]">训练</div><div className="text-sm text-slate-400">永久获得 <span className="text-red-400">+2 力量</span></div></div></button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div><div><div className="font-bold text-[#F0E6D2]">搜寻</div><div className="text-sm text-slate-400">获得一件 <span className="text-purple-400">随机装备</span></div></div></button>
                <button onClick={() => { onReward({ type: 'CARD_UPGRADE' }); }} className="p-4 bg-slate-800 hover:bg-blue-900/50 border border-slate-600 hover:border-blue-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-blue-500"><Star className="text-blue-500" /></div><div><div className="font-bold text-[#F0E6D2]">强化</div><div className="text-sm text-slate-400">随机一张已有卡牌 <span className="text-blue-400">属性+1</span> (攻击/防御/抓牌)</div></div></button>
            </div>
        </div>
    </div>
);

const RewardView = ({ onSkip, onCardSelect, goldReward, championName }) => {
  const rewards = useMemo(() => {
    // championName是中文名（如"盖伦"），需要找到对应的英文id（如"Garen"）
    const championId = Object.keys(CHAMPION_POOL).find(id => CHAMPION_POOL[id].name === championName);
    // 优先获取该英雄的R技能（大招）
    const championR = championId ? Object.values(CARD_DATABASE).find(c => c.hero === championId && c.id.endsWith('R')) : null;
    // 获取其他符合条件的卡牌（排除BASIC和PASSIVE，且属于该英雄或中立）
    const otherCards = Object.values(CARD_DATABASE).filter(c => 
      c.rarity !== 'BASIC' && 
      c.rarity !== 'PASSIVE' && 
      (c.hero === 'Neutral' || (championId && c.hero === championId)) &&
      c.id !== championR?.id
    );
    const shuffled = shuffle(otherCards);
    // 如果存在R技能，确保它出现在奖励中
    if (championR) {
      return [championR, ...shuffled.slice(0, 2)];
    }
    // 如果没有R技能，返回随机3张
    return shuffled.slice(0, 3);
  }, [championName]);
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
        <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">奖励</h2>
        <div className="text-2xl text-yellow-400 mb-8 flex items-center justify-center gap-2">
          <Coins size={28} className="text-yellow-400" />
          <span>金币 +{goldReward}</span>
        </div>
        <div className="flex justify-center gap-6 my-8">
          {rewards.map(c => (
            <div 
              key={c.id} 
              onClick={() => onCardSelect(c.id)} 
              className="w-48 h-64 bg-[#1E2328] border-2 border-[#C8AA6E] rounded-lg overflow-hidden cursor-pointer hover:scale-110 hover:shadow-[0_0_20px_#C8AA6E] transition-all group relative"
            >
              <div className="w-full h-40 bg-black overflow-hidden relative">
                <img src={c.img} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" alt={c.name} />
                <div className="absolute top-2 left-2 w-8 h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-sm">{c.cost}</div>
              </div>
              <div className="p-3 flex flex-col h-24">
                <div className="text-sm font-bold text-[#F0E6D2] mb-1 line-clamp-1">{c.name}</div>
                <div className="text-[10px] text-[#A09B8C] leading-tight line-clamp-2">{c.description}</div>
                <div className="mt-auto text-[8px] text-slate-500 uppercase font-bold">{c.type}</div>
                </div>
             </div>
          ))}
       </div>
        <button onClick={onSkip} className="mt-6 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest transition-all">跳过</button>
      </div>
    </div>
  );
};

const RestView = ({ onRest }) => (
    <div className="absolute inset-0 z-50 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col gap-8 text-center items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#0AC8B9] overflow-hidden bg-black shadow-[0_0_50px_#0AC8B9]"><img src={`${ITEM_URL}/2003.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-5xl font-serif text-[#0AC8B9] drop-shadow-[0_0_10px_#0AC8B9]">泉水憩息</h2>
            <button onClick={onRest} className="group w-64 h-80 bg-slate-900/80 border-2 border-[#0AC8B9] rounded-xl flex flex-col items-center justify-center hover:bg-[#0AC8B9]/20 transition-all cursor-pointer">
                <Heart size={64} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">回复</h3>
                <p className="text-[#0AC8B9]">回复 30% 生命值</p>
            </button>
        </div>
    </div>
);

const BattleScene = ({ heroData, enemyId, initialDeck, onWin, onLose, floorIndex, act }) => { 
  const getScaledEnemy = (enemyId, floor, currentAct) => {
    const baseEnemy = ENEMY_POOL[enemyId];
    const { maxHp, actions } = scaleEnemyStats(baseEnemy, floor, currentAct);
    return { ...baseEnemy, maxHp, actions };
  };
  const enemyConfig = getScaledEnemy(enemyId, floorIndex, act); 
  const initialMana = heroData.maxMana || 3; 
  const [gameState, setGameState] = useState('PLAYER_TURN');
  const [playerHp, setPlayerHp] = useState(heroData.currentHp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerMana, setPlayerMana] = useState(initialMana); 
  const [enemyHp, setEnemyHp] = useState(enemyConfig.maxHp); 
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [nextEnemyAction, setNextEnemyAction] = useState(enemyConfig.actions[0]);
  
  const deckRef = useRef({ drawPile: [], hand: [], discardPile: [] });
  const [renderTrigger, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  const [dmgOverlay, setDmgOverlay] = useState(null);
  const [heroAnim, setHeroAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  const [playerStatus, setPlayerStatus] = useState({ strength: heroData.baseStr || 0, weak: 0, vulnerable: 0 });
  const [enemyStatus, setEnemyStatus] = useState({ strength: 0, weak: 0, vulnerable: 0 });

  const playChampionVoice = (championKey) => {
    if (!championKey) return;
    const voiceUrl = `${VOICE_URL}/${championKey}.ogg`;
    const audio = new Audio(voiceUrl);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Champion voice play failed", e));
  };

  const playSfx = (type) => { 
    const url = SFX[type] || SFX.ATTACK;
    if (!url) return;
    const audio = new Audio(url);
    // 根据音效类型调整音量
    if (type === 'ATTACK_SWING' || type === 'ATTACK_HIT') {
      audio.volume = 0.5;
    } else if (type === 'BLOCK_SHIELD') {
      audio.volume = 0.4;
    } else if (type === 'HIT_TAKEN') {
      audio.volume = 0.6;
    } else {
      audio.volume = 0.4;
    }
    audio.play().catch(()=>{});
  };

  useEffect(() => {
    // 战斗开始时播放英雄语音
    if (heroData.id) {
      playChampionVoice(heroData.id);
    }
    
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
      playSfx('DRAW');
      let { drawPile, hand, discardPile } = deckRef.current;
      for(let i=0; i<count; i++) {
          if (drawPile.length === 0) {
              if (discardPile.length === 0) break; 
              drawPile = shuffle([...discardPile]);
              discardPile = [];
          }
          hand.push(drawPile.pop());
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
        if (heroData.relicId === "ViktorPassive" && Math.random() < 0.5) {
             const basicCard = shuffle(['Strike', 'Defend'])[0];
         let { hand } = deckRef.current;
         hand.push(basicCard);
         forceUpdate();
        }
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
          // 播放攻击挥击音效
          playSfx('ATTACK_SWING');
          triggerAnim('HERO', 'attack');
          setTimeout(() => {
              triggerAnim('ENEMY', 'hit');
              // 延迟播放攻击命中音效
              playSfx('ATTACK_HIT');
          }, 200);
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
              if (enemyBlock > 0) {
                  // 敌人格挡时播放格挡音效
                  playSfx('BLOCK_SHIELD');
                  if (enemyBlock >= finalDmg) { setEnemyBlock(b => b - finalDmg); dmgToHp = 0; }
                  else { dmgToHp = finalDmg - enemyBlock; setEnemyBlock(0); }
              } else if (dmgToHp > 0) {
                  // 敌人受击时播放受击音效
                  setTimeout(() => playSfx('HIT_TAKEN'), 250);
              }
              setEnemyHp(h => Math.max(0, h - dmgToHp)); total += dmgToHp;
              if(heroData.relics.includes("VampiricScepter")) setPlayerHp(h => Math.min(heroData.maxHp, h + 1));
              if(heroData.relicId === "DariusPassive") setEnemyStatus(s => ({ ...s, weak: s.weak + 1 }));
          }
          setDmgOverlay({val: total, target: 'ENEMY'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(card.block) { 
          // 玩家获得格挡时播放格挡音效
          playSfx('BLOCK_SHIELD');
          setPlayerBlock(b => b + card.block); 
      }
  };

  useEffect(() => { if(enemyHp<=0) { playSfx('WIN'); setTimeout(()=>onWin(playerHp), 1000); } }, [enemyHp]);
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
      if(act.type === 'ATTACK' || act.actionType === 'Attack') {
          // 敌人攻击挥击音效
          playSfx('ATTACK_SWING');
          setTimeout(() => {
              triggerAnim('HERO', 'hit');
              // 延迟播放攻击命中音效
              playSfx('ATTACK_HIT');
          }, 200);
          const baseDmg = act.type === 'ATTACK' ? act.value : act.dmgValue;
          let dmg = baseDmg + enemyStatus.strength;
          if(enemyStatus.weak > 0) dmg = Math.floor(dmg * 0.75);
          let total = 0; let remBlock = playerBlock; let currHp = playerHp;
          const count = act.count || 1;
          for(let i=0; i<count; i++) {
             let finalDmg = dmg;
             if(playerStatus.vulnerable > 0) finalDmg = Math.floor(finalDmg * 1.5);
             if(remBlock >= finalDmg) { 
                 // 玩家格挡时播放格挡音效
                 playSfx('BLOCK_SHIELD');
                 remBlock -= finalDmg; 
             } else { 
                 let pierce = finalDmg - remBlock; 
                 remBlock = 0; 
                 currHp -= pierce;
                 // 玩家受击时播放受击音效
                 setTimeout(() => playSfx('HIT_TAKEN'), 250);
                 if(heroData.relics.includes("BrambleVest")) setEnemyHp(h => Math.max(0, h - 3)); 
             }
             total += finalDmg;
          }
          setPlayerBlock(remBlock); setPlayerHp(currHp); setDmgOverlay({val: total, target: 'PLAYER'}); setTimeout(()=>setDmgOverlay(null), 800);
      }
      if(act.type === 'BUFF') { 
          // 敌人获得格挡时播放格挡音效
          playSfx('BLOCK_SHIELD'); 
          setEnemyBlock(b => b + act.effectValue); 
      }
      if(act.type === 'DEBUFF') { if(act.effect === 'WEAK') setPlayerStatus(s => ({...s, weak: s.weak + act.effectValue})); if(act.effect === 'VULNERABLE') setPlayerStatus(s => ({...s, vulnerable: s.vulnerable + act.effectValue})); }
      setEnemyBlock(0); setTimeout(startTurnLogic, 1000); 
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
             <div className={`absolute left-10 bottom-[42%] w-64 h-[500px] transition-all duration-200 ${heroAnim === 'attack' ? 'translate-x-32' : ''} ${heroAnim === 'hit' ? 'translate-x-[-10px] brightness-50 bg-red-500/30' : ''}`}>
                 <img src={heroData.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[#C8AA6E]" />
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-[#C8AA6E] p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-[#C8AA6E] font-bold"><span>HP {playerHp}/{heroData.maxHp}</span>{playerBlock > 0 && <span className="text-blue-400 flex items-center gap-1"><Shield size={12}/>{playerBlock}</span>}</div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all duration-300" style={{width: `${(playerHp/heroData.maxHp)*100}%`}}></div></div>{renderStatus(playerStatus)}</div>
                     </div>
             <div className="text-6xl font-black text-[#C8AA6E]/20 italic">VS</div>
             <div className={`absolute right-10 bottom-[42%] w-64 h-[500px] transition-all duration-200 ${enemyAnim === 'attack' ? '-translate-x-32' : ''} ${enemyAnim === 'hit' ? 'translate-x-[10px] brightness-50 bg-red-500/30' : ''}`}>
                 <img src={enemyConfig.img} className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-red-800" />
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-red-600 px-3 py-1 rounded flex items-center gap-2 animate-bounce"><IntentIcon /><span className="text-white font-bold text-lg">{displayValue}{nextEnemyAction.count>1?`x${nextEnemyAction.count}`:''}</span></div>
                 <div className="absolute -bottom-24 w-full bg-black/80 border border-red-800 p-2 rounded flex flex-col gap-1 shadow-lg z-40"><div className="flex justify-between text-xs text-red-500 font-bold"><span>{enemyConfig.name}</span><span>{enemyHp}/{enemyConfig.maxHp}</span></div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{width: `${(enemyHp/enemyConfig.maxHp)*100}%`}}></div></div>{enemyBlock > 0 && <div className="text-blue-400 text-xs font-bold flex items-center gap-1"><Shield size={10}/> 格挡 {enemyBlock}</div>}{renderStatus(enemyStatus)}</div>
                     </div>
                 </div>
        {dmgOverlay && (<div className={`absolute top-1/2 ${dmgOverlay.target==='ENEMY'?'right-1/4':'left-1/4'} -translate-y-1/2 text-8xl font-black text-white drop-shadow-[0_0_10px_red] animate-ping z-50`}>{dmgOverlay.val}</div>)}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-end justify-center pb-6 gap-4 pointer-events-none">
            <div className="absolute left-8 bottom-8 w-24 h-24 rounded-full bg-[#091428] border-4 border-[#C8AA6E] flex items-center justify-center shadow-[0_0_30px_#0066FF] pointer-events-auto text-center"><span className="text-4xl font-bold text-white block">{playerMana}</span><span className="text-[10px] text-[#C8AA6E] block">MANA</span><div className="text-[8px] text-gray-400 mt-1">{currentDrawPile.length}/{currentDiscardPile.length}</div></div>
            <div className="flex items-end justify-center" style={{ width: '600px', height: '240px', position: 'relative' }}>
                <AnimatePresence>
                    {hand.map((cid, i) => {
                        const c = CARD_DATABASE[cid]; const canPlay = playerMana >= c.cost && gameState === 'PLAYER_TURN';
                        const overlap = i === 0 ? 0 : (hand.length > 5 ? -40 : 10);
                        const rotation = (i - (hand.length - 1) / 2) * 3; const yOffset = Math.abs(i - (hand.length - 1) / 2) * 5;
                        return (
                            <motion.div key={`${cid}-${i}`} layout initial={{ y: 100, opacity: 0, scale: 0.5 }} animate={{ y: yOffset, opacity: 1, scale: 1, rotate: rotation }} exit={{ y: -100, opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ marginLeft: `${overlap}px`, zIndex: i, transformOrigin: "bottom center", position: 'relative' }} drag={canPlay ? "y" : false} dragConstraints={{ top: -300, bottom: 0 }} dragSnapToOrigin={true} onDragEnd={(event, info) => { if (info.offset.y < -150 && canPlay) { playCard(i); } }} whileHover={{ scale: 1.2, y: -80, zIndex: 100, rotate: 0 }} className={`w-40 h-60 bg-[#1E2328] border-2 rounded-lg flex flex-col items-center overflow-hidden shadow-2xl pointer-events-auto ${canPlay ? 'border-[#C8AA6E] cursor-grab active:cursor-grabbing' : 'border-slate-700 opacity-60 cursor-not-allowed'}`}>
                                <div className="w-full h-40 bg-black overflow-hidden relative pointer-events-none"><img src={c.img} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" /><div className="absolute top-2 left-2 w-8 h-8 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-[#C8AA6E] font-bold text-lg shadow-md">{c.cost}</div></div>
                                <div className="flex-1 p-2 text-center flex flex-col w-full pointer-events-none bg-[#1E2328]"><div className="text-sm font-bold text-[#F0E6D2] mb-1 line-clamp-1">{c.name}</div><div className="text-[10px] text-[#A09B8C] leading-tight font-medium line-clamp-2">{c.description}</div><div className="mt-auto text-[9px] text-slate-500 uppercase font-bold tracking-wider">{c.type}</div></div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
             </div>
            <button onClick={endTurn} disabled={gameState!=='PLAYER_TURN'} className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-[#C8AA6E] border-4 border-[#F0E6D2] flex items-center justify-center font-bold text-[#091428] shadow-lg hover:scale-105 hover:bg-white active:scale-95 transition-all pointer-events-auto">结束<br/>回合</button>
        </div>
    </div>
  );
};

// --- 主组件 ---

export default function LegendsOfTheSpire() {
  const [view, setView] = useState('MENU'); 
  const [mapData, setMapData] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [currentAct, setCurrentAct] = useState(1);
  const [masterDeck, setMasterDeck] = useState([]);
  const [champion, setChampion] = useState(null); 
  const [currentHp, setCurrentHp] = useState(80);
  const [maxHp, setMaxHp] = useState(80);
  const [gold, setGold] = useState(100);
  const [relics, setRelics] = useState([]);
  const [baseStr, setBaseStr] = useState(0);
  const [maxMana, setMaxMana] = useState(3);
  const [cardUpgrades, setCardUpgrades] = useState({}); // {cardId: {value: +1, block: +1, effectValue: +1}}
  const [showRelicReward, setShowRelicReward] = useState(null); // 显示遗物奖励UI
  const [activeNode, setActiveNode] = useState(null);
  const [usedEnemies, setUsedEnemies] = useState([]); 
  
  const [unlockedChamps, setUnlockedChamps] = useState(() => { try { const d = localStorage.getItem(UNLOCK_KEY); return d ? JSON.parse(d) : Object.keys(CHAMPION_POOL); } catch { return Object.keys(CHAMPION_POOL); } });
  const [hasSave, setHasSave] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(() => {
      const lastVersion = localStorage.getItem('last_version');
      return lastVersion !== 'v0.7.5';
  });
  const [bgmStarted, setBgmStarted] = useState(false);

  useEffect(() => { const savedData = localStorage.getItem(SAVE_KEY); if (savedData) setHasSave(true); }, []);

  useEffect(() => {
      if (view !== 'MENU' && view !== 'CHAMPION_SELECT' && view !== 'GAMEOVER' && view !== 'VICTORY_ALL') {
          localStorage.setItem(SAVE_KEY, JSON.stringify({ view, mapData, currentFloor, currentAct, masterDeck, champion, currentHp, maxHp, gold, relics, baseStr, maxMana, cardUpgrades, activeNode, usedEnemies }));
      }
  }, [view, currentHp, gold, currentFloor, currentAct]);

  const handleContinue = () => {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) {
          const data = JSON.parse(s);
          setMapData(data.mapData); setCurrentFloor(data.currentFloor); setCurrentAct(data.currentAct || 1); setMasterDeck(data.masterDeck); setChampion(data.champion); setCurrentHp(data.currentHp); setMaxHp(data.maxHp); setGold(data.gold); setRelics(data.relics); setBaseStr(data.baseStr); setMaxMana(data.maxMana || 3); setCardUpgrades(data.cardUpgrades || {}); setActiveNode(data.activeNode); setUsedEnemies(data.usedEnemies); setView(data.view);
      }
  };

  const handleNewGame = () => { localStorage.removeItem(SAVE_KEY); setHasSave(false); setView('CHAMPION_SELECT'); };

  const handleChampionSelect = (selectedChamp) => {
    // 播放英雄语音
    playChampionVoice(selectedChamp.id);
    setChampion(selectedChamp); setMaxHp(selectedChamp.maxHp); setCurrentHp(selectedChamp.maxHp);
    setMaxMana(selectedChamp.maxMana);
    setMasterDeck([...STARTING_DECK_BASIC, ...selectedChamp.initialCards]);
    setRelics([RELIC_DATABASE[selectedChamp.relicId].id]);
    setCardUpgrades({});
    const { map: newMap } = generateMap(usedEnemies, 1);
    setMapData(newMap); setCurrentFloor(0); setCurrentAct(1); setView('MAP');
  };

  const completeNode = () => {
      // 节点已经在handleNodeSelect时锁定，这里只需要解锁下一层节点
      const newMap = [...mapData];
      const nextFloorIdx = currentFloor + 1;
      if (nextFloorIdx < newMap.length) {
          activeNode.next.forEach(nextId => { const nextNode = newMap[nextFloorIdx].find(n => n.id === nextId); if(nextNode) nextNode.status = 'AVAILABLE'; });
          setMapData(newMap);
          setCurrentFloor(nextFloorIdx); 
          setView('MAP');
      } else { 
          // 章节通关逻辑
          if (currentAct < 3) {
              const nextAct = currentAct + 1;
              setCurrentAct(nextAct);
              setCurrentFloor(0);
              const { map: nextMap } = generateMap(usedEnemies, nextAct);
              setMapData(nextMap);
              // 章节奖励：回复 50% 生命
              setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.5)));
              alert(`第 ${currentAct} 章通关！进入下一章...`);
              setView('MAP');
          } else {
              // 游戏通关
              const allIds = Object.keys(CHAMPION_POOL);
              const locked = allIds.filter(id => !unlockedChamps.includes(id));
              if (locked.length > 0) {
                  const newUnlock = locked[Math.floor(Math.random() * locked.length)];
                  const updated = [...unlockedChamps, newUnlock];
                  setUnlockedChamps(updated);
                  localStorage.setItem(UNLOCK_KEY, JSON.stringify(updated));
                  alert(`恭喜通关！新英雄解锁: ${CHAMPION_POOL[newUnlock].name}`);
              }
              localStorage.removeItem(SAVE_KEY);
              setView('VICTORY_ALL'); 
          }
      }
  };
  
  const handleNodeSelect = (node) => {
      if (node.status !== 'AVAILABLE') return;
      // 立即锁定同层的其他节点
      const newMap = [...mapData];
      const floorNodes = newMap[currentFloor];
      floorNodes.forEach(n => { 
          if (n.id === node.id) {
              n.status = 'COMPLETED';
          } else {
              n.status = 'LOCKED';
          }
      });
      setMapData(newMap);
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
  const handleRelicReward = (relic, showUI = false) => { 
    setRelics(prev => [...prev, relic.id]); 
    if (relic.onPickup) { 
      const ns = relic.onPickup({ maxHp, currentHp }); 
      setMaxHp(ns.maxHp); 
      setCurrentHp(ns.currentHp); 
    }
    if (showUI) {
      setShowRelicReward(relic);
    } else {
      completeNode();
    }
  };
  const handleBuyRelic = (relic) => { setGold(prev => prev - relic.price); handleRelicReward(relic); };
  const handleEventReward = (reward) => { 
    if (reward.type === 'BUFF' && reward.stat === 'strength') {
      setBaseStr(prev => prev + reward.value);
      completeNode();
    } else if (reward.type === 'RELIC_RANDOM') { 
      // 根据当前章节过滤遗物
      const pool = Object.values(RELIC_DATABASE).filter(r => {
        if (r.rarity === 'PASSIVE' || relics.includes(r.id)) return false;
        // 章节专属遗物检查
        if (r.id === 'Cull' || r.id === 'DarkSeal') return currentAct === 1;
        if (r.id === 'QSS' || r.id === 'Executioner') return currentAct >= 2;
        if (r.id === 'Nashor') return currentAct >= 3;
        return true; // 通用遗物
      });
      if (pool.length > 0) {
        const randomRelic = shuffle(pool)[0];
        handleRelicReward(randomRelic, true); // 显示UI
      } else {
        completeNode();
      }
    } else if (reward.type === 'CARD_UPGRADE') {
      // 随机选择一张已有卡牌进行升级
      const upgradeableCards = masterDeck.filter(cardId => {
        const card = CARD_DATABASE[cardId];
        if (!card) return false;
        // 可以升级攻击、防御或抓牌效果
        return (card.type === 'ATTACK' && card.value) || 
               (card.type === 'SKILL' && card.block) || 
               (card.effect === 'DRAW' && card.effectValue);
      });
      if (upgradeableCards.length > 0) {
        const targetCardId = shuffle(upgradeableCards)[0];
        const card = CARD_DATABASE[targetCardId];
        const upgrade = { ...cardUpgrades[targetCardId] || {} };
        // 随机选择升级类型
        const upgradeTypes = [];
        if (card.type === 'ATTACK' && card.value) upgradeTypes.push('value');
        if (card.type === 'SKILL' && card.block) upgradeTypes.push('block');
        if (card.effect === 'DRAW' && card.effectValue) upgradeTypes.push('effectValue');
        if (upgradeTypes.length > 0) {
          const upgradeType = shuffle(upgradeTypes)[0];
          upgrade[upgradeType] = (upgrade[upgradeType] || 0) + 1;
          setCardUpgrades(prev => ({ ...prev, [targetCardId]: upgrade }));
        }
      }
      completeNode();
    } else if (reward.type === 'MANA_UPGRADE') {
      setMaxMana(prev => prev + 1);
      completeNode();
    }
  };
  const handleCardReward = (cardId) => { setMasterDeck([...masterDeck, cardId]); setGold(gold + 50); completeNode(); };
  const handleSkipReward = () => { setGold(gold + 50); completeNode(); };
  const handleRest = () => { setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.3))); completeNode(); };
  
  const restartGame = () => { setView('CHAMPION_SELECT'); setMasterDeck([]); setCurrentHp(80); setMaxHp(80); setGold(100); setRelics([]); setBaseStr(0); setChampion(null); setUsedEnemies([]); };
  const getCurrentBgm = () => (view === 'COMBAT' ? BGM_BATTLE_URL : BGM_MAP_URL);
  const playSfx = (type) => { 
    const url = SFX[type] || SFX.ATTACK;
    if (!url) return;
    const audio = new Audio(url);
    // 根据音效类型调整音量
    if (type === 'ATTACK_SWING' || type === 'ATTACK_HIT') {
      audio.volume = 0.5;
    } else if (type === 'BLOCK_SHIELD') {
      audio.volume = 0.4;
    } else if (type === 'HIT_TAKEN') {
      audio.volume = 0.6;
    } else {
      audio.volume = 0.4;
    }
    audio.play().catch(()=>{});
  };
  const playChampionVoice = (championKey) => {
    if (!championKey) return;
    const voiceUrl = `${VOICE_URL}/${championKey}.ogg`;
    const audio = new Audio(voiceUrl);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Champion voice play failed", e));
  };

  const renderView = () => {
      switch(view) {
          case 'MENU': return (
              <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/60"></div>
                  <div className="z-10 text-center"><h1 className="text-8xl font-black text-[#C8AA6E] mb-8 drop-shadow-lg tracking-widest">峡谷尖塔</h1><div className="flex flex-col gap-4 w-64 mx-auto">{hasSave && (<button onClick={handleContinue} className="px-8 py-4 bg-[#0AC8B9] hover:bg-white hover:text-[#0AC8B9] text-black font-bold rounded flex items-center justify-center gap-2 transition-all"><Play fill="currentColor" /> 继续征程</button>)}<button onClick={handleNewGame} className="px-8 py-4 border-2 border-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-black text-[#C8AA6E] font-bold rounded flex items-center justify-center gap-2 transition-all"><RotateCcw /> 新游戏</button></div><p className="mt-8 text-slate-400 text-sm">v0.7.5 Beta</p></div>
                  {showUpdateLog && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
                          <div className="max-w-2xl bg-[#091428]/95 border-2 border-[#C8AA6E] p-8 rounded-xl shadow-[0_0_50px_#C8AA6E]">
                              <h2 className="text-3xl font-bold text-[#C8AA6E] mb-6 text-center">v0.7.5 (当前版本) 更新日志</h2>
                              <div className="space-y-4 text-left max-h-96 overflow-y-auto">
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 全英雄实装</div>
                                      <div className="text-sm text-[#A09B8C]">英雄池扩充至 20 位，包含瑞文、卡牌、盲僧等新英雄，且每位英雄拥有独特的初始卡组和被动遗物。</div>
                 </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 三章节系统</div>
                                      <div className="text-sm text-[#A09B8C]">正式实装 Act 1 (峡谷), Act 2 (暗影岛), Act 3 (虚空) 的完整流程，包含专属敌人和 Boss。</div>
                     </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 章节专属遗物</div>
                                      <div className="text-sm text-[#A09B8C]">新增了只能在特定章节获取的强力遗物（如 Act 3 的纳什之牙）。</div>
                     </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 牌库打空 Bug</div>
                 </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 厄加特回血 Bug</div>
             </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 地图路径逻辑</div>
        </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 资源链接</div>
                                      <div className="text-sm text-[#A09B8C]">全面校对了 20 位英雄的技能图标、头像和 Loading 图，修复了所有 broken image。</div>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => {
                                      setShowUpdateLog(false);
                                      localStorage.setItem('last_version', 'v0.7.5');
                                      setBgmStarted(true);
                                  }} 
                                  className="mt-6 w-full px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold rounded transition-all"
                              >
                                  关闭
                              </button>
                          </div>
            </div>
        )}
            </div>
          );
          case 'CHAMPION_SELECT': return <ChampionSelect onChampionSelect={handleChampionSelect} unlockedIds={unlockedChamps} />;
          case 'MAP': return <MapView mapData={mapData} onNodeSelect={handleNodeSelect} currentFloor={currentFloor} act={currentAct} />;
          case 'SHOP': return <ShopView gold={gold} deck={masterDeck} relics={relics} onLeave={() => completeNode()} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} onBuyMana={() => { setGold(prev => prev - 200); setMaxMana(prev => prev + 1); }} championName={champion.name} />;
          case 'EVENT': return <EventView onLeave={() => completeNode()} onReward={handleEventReward} />;
          case 'CHEST': return <ChestView onLeave={() => completeNode()} onRelicReward={handleRelicReward} relics={relics} act={currentAct} />;
          case 'COMBAT': return <BattleScene heroData={{...champion, maxHp, currentHp, maxMana, relics, baseStr, cardUpgrades}} enemyId={activeNode.enemyId} initialDeck={masterDeck} onWin={handleBattleWin} onLose={() => { localStorage.removeItem(SAVE_KEY); setView('GAMEOVER'); }} floorIndex={currentFloor} act={currentAct} />;
          case 'REWARD': return <RewardView goldReward={50} onCardSelect={handleCardReward} onSkip={handleSkipReward} championName={champion.name} />;
          case 'REST': return <RestView onRest={handleRest} />;
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">传奇永不熄灭！</h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">回到菜单</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">战败</h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">回到菜单</button></div>;
          default: return <div>Loading...</div>;
      }
  };

                return (
      <div className="relative h-screen w-full bg-[#091428] font-sans select-none overflow-hidden">
          <AudioPlayer src={bgmStarted || view !== 'MENU' ? getCurrentBgm() : null} />
          {view !== 'GAMEOVER' && view !== 'VICTORY_ALL' && view !== 'MENU' && view !== 'CHAMPION_SELECT' && champion && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent z-50 flex items-center justify-between px-8 pointer-events-none">
                  <div className="flex items-center gap-6 pointer-events-auto">
                      <div className="relative group">
                          <img src={champion.avatar} className="w-12 h-12 rounded-full border-2 border-[#C8AA6E] shadow-lg" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#091428] rounded-full border border-[#C8AA6E] flex items-center justify-center text-xs font-bold text-[#C8AA6E]">{currentFloor+1}F</div>
                        </div>
                      <div className="flex flex-col">
                          <span className="text-[#F0E6D2] font-bold text-lg shadow-black drop-shadow-md flex items-center gap-2">
                            {champion.name}
                            <RelicTooltip relic={RELIC_DATABASE[champion.relicId]}>
                                <img src={RELIC_DATABASE[champion.relicId].img} 
                                     className="w-6 h-6 rounded border border-yellow-400 bg-black/50 cursor-help hover:scale-110 transition-transform" 
                                />
                            </RelicTooltip>
                            {relics.filter(rid => rid !== champion.relicId).map((rid, i) => {
                                const relic = RELIC_DATABASE[rid];
                                return (
                                    <RelicTooltip key={i} relic={relic}>
                                        <img src={relic.img} 
                                             className="w-6 h-6 rounded border border-[#C8AA6E]/50 bg-black/50 cursor-help hover:scale-110 transition-transform" 
                                        />
                                    </RelicTooltip>
                                );
                            })}
                          </span>
                          <div className="flex items-center gap-4 text-sm font-bold"><span className="text-red-400 flex items-center gap-1"><Heart size={14} fill="currentColor"/> {currentHp}/{maxHp}</span><span className="text-yellow-400 flex items-center gap-1"><Coins size={14} fill="currentColor"/> {gold}</span></div>
                        </div>
                    </div>
        </div>
          )}
          {renderView()}
          {showRelicReward && (
            <RelicRewardView 
              relic={showRelicReward} 
              onClose={() => {
                setShowRelicReward(null);
                completeNode();
              }} 
            />
          )}
      </div>
  );
}