import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Heart, RefreshCw, AlertTriangle, Flame, XCircle, Activity, Map as MapIcon, Gift, Anchor, Coins, ShoppingBag, ChevronRight, Star, Play, Pause, Volume2, VolumeX, Landmark, Lock, RotateCcw, Save, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGridMap } from './data/gridMapLayout_v4'; // v4茅聬垄莽聠赂氓聻職茅聧拢卯聼聮莽麓聶莽聰炉茂赂陆卯聞麓茅聭鲁芒聙鲁忙聜聯氓娄芦芒聜卢氓篓麓氓卢露莽麓職
import GridMapView from './components/GridMapView'; // 茅聫聜忙聣庐氓垄聴茅聧聫卯聟隆莽芦聼猫陇掳茫聢聽忙鹿麓茅聧楼忙聧聬卯聺聥茅聧楼忙聮聟莽麓聶忙露聯氓陇聬芒聜卢氓陇聣莽芦麓茅聫聢氓聯聞氓聼聴茅聰聸?
import { getHexNeighbors } from './utils/hexagonGrid';
import CodexView from './components/CodexView';
import DeckView from './components/DeckView';
import BattleScene from './components/BattleScene';
import ChampionSelect from './components/ChampionSelect';
import ToastContainer from './components/shared/Toast';
import { unlockAudio } from './utils/audioContext';

// ==========================================
// 1. 茅聴聢忙卢聬芒聜卢盲陆陆莽楼芦氓漏搂忙聞陋莽卢聦茅聧聫茫聞楼莽聹卢茅聳掳氓露聡莽聳聠
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

// 茅聭鲁氓卤戮忙芦聶茅聧楼茅鹿聝氓聨陇莽录聝?(茅聨赂氓陇聦莽聫路茅聭潞?
const ACT_BACKGROUNDS = {
    1: "https://i.17173cdn.com/2fhnvk/YWxqaGBf/cms3/JfEzktbjDoBxmzd.jpg", // 茅聧聶卯聞聙忙聲聹莽聰炉氓聽聺氓聹潞莽聮聥?
    2: "https://images.17173cdn.com/2014/lol/2014/08/22/Shadow_Isles_10.jpg", // 茅聫聠忙楼聙氓楼聳忙露聰氓卢陋忙鹿麓
    3: "https://pic.upmedia.mg/uploads/content/20220519/EV220519112427593030.webp"  // 茅聯聫忙掳卤芒聰聳忙露聰氓卢陋忙鹿麓
};

// BGM URLs - 忙碌聽氓路聠onstants莽聙碌莽聟聨氓聫聠
const BGM_MAP_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/To-the-Infinity%20-Castle%20(1).mp3";
const BGM_BATTLE_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/guimie-battle%20(1).mp3";

// 茅聴聤猫聶芦忙聶楼 - 忙碌拢猫路篓忙聲陇茅聫聜忙聣庐忙庐聭R2莽聙聸忙篓潞氓聛聧茅聧娄忙聺驴忙陆聝
const SFX_BASE_URL = "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx";
const SFX_NEW_URL = "https://pub-4785f27b55bc484db8005d5841a1735a.r2.dev";
const SFX = {
    ATTACK: `${SFX_BASE_URL}/attack.mp3`, 
    BLOCK: `${SFX_BASE_URL}/block.mp3`,
    DRAW: `${SFX_BASE_URL}/draw.mp3`,
    WIN: `${SFX_BASE_URL}/win.mp3`,
    // 忙戮搂莽聜虏氓路卤茅聴聤猫聶芦忙聶楼 - 茅聬聶卯聞聜莽聫聸茅聬篓氓聥卢忙聲戮茅聧聭忙卤聡芒聜卢盲陆鹿莽聣赂茅聨赂脗掳芒聜卢盲陆赂氓陆聢茅聧聭氓漏職莽聟露茅聫聛?
    ATTACK_SWING: `${SFX_NEW_URL}/attack_swing.mp3`,
    ATTACK_HIT: `${SFX_NEW_URL}/attack_hit.mp3`,
    BLOCK_SHIELD: `${SFX_NEW_URL}/block_shield.mp3`,
    HIT_TAKEN: `${SFX_NEW_URL}/hit_taken.mp3`
};

const STARTING_DECK_BASIC = ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend"];
const SAVE_KEY = 'lots_save_v75';
const UNLOCK_KEY = 'lots_unlocks_v75';

// ==========================================
// 2. 氓篓聯氓聭聤氓聻聶茅聫聛莽聣聢氓碌聛忙聬麓?
// ==========================================

const CHAMPION_POOL = {
  // --- 莽禄聴卯聝驴莽芦麓氓搂聤卯聢聻忙搂娄 ---
  "Garen": { id: "Garen", name: "茅聬漏忙聽娄茅赂隆", title: "氓炉掳茅拢聨氓赂楼莽聭聴氓陇赂莽掳鹿忙露聰氓卢陋氓搂聫", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/Garen.png`, img: `${LOADING_URL}/Garen_0.jpg`, passive: "茅聧搂忙掳露莽聟拢: 茅聨麓忙篓禄忙聻聼莽录聛忙聮麓忙陆芦茅聫聝猫聢碌盲禄庐忙戮露?6 HP", relicId: "GarenPassive", initialCards: ["GarenQ", "GarenW", "Ignite", "Defend"], description: "氓炉掳茅拢聨氓赂楼莽聭聴氓陇赂莽掳鹿茅聬篓氓聥炉氓聶赂莽聭聛氓聭庐氓聻卢忙戮鹿卯聜卢莽麓聺茅聨驴氓聭麓忙職卤茅聧聶莽聤碌忙聲鲁茅聧聹氓卤戮氓炉聰莽录聛卯聟聺莽露聰茅聨麓忙篓赂芒聜卢? },
  "Darius": { id: "Darius", name: "氓炉掳莽聳炉氓鹿聢茅聧聵氓聥卢忙聼聣", title: "莽聮聡氓聯聞氓聨聽茅聮聙茫聞娄忙聼聣忙露聰氓卢芦氓垄聹", maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Darius.png`, img: `${LOADING_URL}/Darius_0.jpg`, passive: "茅聧聭茅赂驴卯聰聟: 氓搂拢氓驴聰卯聜录茅聫聙猫炉虏氓職庐茅聫聝猫庐鹿莽麓聺莽录聛忙卢聨莽掳拢茅聫聛氓卤录忙卤聣 1 莽聛聻氓聜聺忙芦聞氓炉庐?, relicId: "DariusPassive", initialCards: ["DariusW", "DariusE", "Strike", "Ignite"], description: "莽聮聡氓聯聞氓聨聽茅聮聙茫聞娄忙聼聣茅聬篓氓聥庐猫聳聞氓炉掳盲戮聤莽麓聺忙赂職忙驴聥忙陆卢茅聧聰忙露垄氓聶潞茅聧聹氓卤戮莽楼娄莽聬聸芒聜卢茅聫聛氓聽聼莽聛聣茅聧聵氓卢陋氓聼聴茅聫聛氓卤录忙卤聣茅聤聠? },
  "Lux": { id: "Lux", name: "茅聨路氓陇聤氓聨聽忙露聯?, title: "茅聧聫氓陇聨莽路拢忙驴聜忙聤陆氓聞聶", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Lux.png`, img: `${LOADING_URL}/Lux_0.jpg`, passive: "茅聧聫氓陇聨氓搂聝茅聧楼忙露聵莽職聽: 氓搂拢氓驴聯忙麓聳茅聧職氓聽聺莽麓聭忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 1 茅聬聬猫搂聞莽隆露茅聧聰?, relicId: "LuxPassive", initialCards: ["LuxQ", "LuxE", "Heal", "Ignite"], description: "氓篓聣忙聸聻莽卢聙茅聭禄茅聛聧忙鲁聼茅聰聸氓卤戮忙聬庐茅聴聙氓聻庐氓聼聞茅聬垄茫聞漏卯聳聜忙戮露忙聽篓莽隆露茅聧聰忙露聶氓垄娄茅聧聭忙麓陋莽聫庐莽聮聬猫搂聞氓赂露茅聧聮氓聣聛氓垄聺茅聤聠? },
  "Jinx": { id: "Jinx", name: "茅聳虏忙聢聺氓聨聽忙露聯?, title: "茅聫聠莽拢聥猫聸聥茅聮聙忙驴聤氓赂聙", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Jinx.png`, img: `${LOADING_URL}/Jinx_0.jpg`, passive: "茅聬聳氓聴聴氓陆聜: 氓搂拢氓驴聯忙麓聳茅聧職氓聽聺氓聻碌忙驴庐氓卢芦氓垄聹茅聬聴氓卤戮忙職聼茅聳虏?1", relicId: "JinxPassive", initialCards: ["JinxQ", "JinxW", "Strike", "Strike"], description: "忙楼聜忙篓录氓聻聨茅聧聶忙聢聺莽職聽茅聨碌氓卢露莽麓聺茅聳芦忙掳鲁莽鹿聝猫鹿聡卯聜娄芒聜卢莽聠赂氓篓聤茅聬聴氓卤陆忙聥掳忙聺漏莽聜虏氓職庐茅聳芦莽聤鲁氓聻職忙碌录茫聜聟卯聠聤茅聤聠? },
  "Yasuo": { id: "Yasuo", name: "忙碌聹忙掳卤氓聜篓", title: "茅聬陇茅鹿聝卯聴聯茅聧聯忙聢拢猫卤鹿", maxHp: 78, maxMana: 3, avatar: `${CDN_URL}/img/champion/Yasuo.png`, img: `${LOADING_URL}/Yasuo_0.jpg`, passive: "氓篓麓卯聛聞卯聟鹿忙露聰氓卢庐盲潞戮: 茅聫聠忙聺聭氓職庐茅聧聭莽聤碌氓路录+10%", relicId: "YasuoPassive", initialCards: ["YasuoQ", "YasuoE", "Defend", "Defend"], description: "忙楼聜忙篓禄忙潞聙茅聧聰茫聞娄芒聜卢脩聝氓垄陇莽聙鹿卯聺庐莽麓聺茅聧聮芒聲聝忙聲陇忙聺漏莽聜虏氓職庐茅聧聹氓卤戮忙炉職茅聧聭忙聵聫莽鹿聵莽聬聸氓虏聙氓聻聨茅聧聶忙聢拢莽路颅茅聧聭忙聛聮芒聜卢? },
  "Sona": { id: "Sona", name: "忙驴聻忙聢聺卯聼聜", title: "茅聬聻氓炉赂忙聠禄忙碌聽忙卢聫茫聜鲁", maxHp: 72, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sona.png`, img: `${LOADING_URL}/Sona_0.jpg`, passive: "茅聭鲁盲禄聥氓聶潞氓炉庐? 氓搂拢氓驴聯忙麓聳茅聧職氓聽聼氓垄娄茅聧聭猫聶鹿卯聝聡忙露聯氓陇聤莽麓露茅聧聴芒聞聝忙陇聜茅聰聸氓虏聝氓鹿聫氓炉掳?3 茅聬聬茅聙聸氓陇聧茅聫聝猫聢碌氓搂垄茅聬垄?, relicId: "SonaPassive", initialCards: ["SonaQ", "SonaW", "Defend", "Heal"], description: "忙聺聢氓聭颅氓搂陋茅聭禄茅聛聧忙鲁聼茅聰聸氓卤录莽卢聯氓篓聣茫聞陇莽掳卢茅聨颅茫聢聽卯聵虏茅聧聹氓卤陆忙麓聼茅聴聝莽聠路卯聳聝茅聬漏氓篓驴芒聜卢? },
  "Ekko": { id: "Ekko", name: "茅聭鹿忙聝搂氓聨聽", title: "茅聫聝氓聽聲忙拢驴茅聧聮氓聯聞卯聟鹿", maxHp: 82, maxMana: 3, avatar: `${CDN_URL}/img/champion/Ekko.png`, img: `${LOADING_URL}/Ekko_0.jpg`, passive: "Z茅聧篓氓卢庐芒聰聧茅聧聰? 氓搂拢氓驴聰卯聜录茅聨碌忙聮鲁氓職颅氓篓聭氓聽拢芒聜卢忙楼聙氓麓卤茅聫聝猫庐鹿莽麓聺茅聭戮氓鲁掳莽路卤 1 茅聬聬莽聭掳氓搂聫茅聳虏?, relicId: "EkkoPassive", initialCards: ["EkkoQ", "EkkoE", "Defend", "Ignite"], description: "忙楼聜忙篓录氓聻聨茅聧聶忙聢聺氓聼隆莽聙鹿卯聺庐莽麓聺茅聧聮芒聲聝忙聲陇氓篓聭氓聽拢芒聜卢忙楼聙氓麓卤茅聬聴氓虏聙忙庐聭茅聫聢氓聯聞氓聼聴猫鹿聡卯聜娄芒聜卢莽聠赂氓聻職茅聴聙猫拢陇芒聜卢? },
  "Sylas": { id: "Sylas", name: "忙驴聣莽聜麓氓陋潞茅聫聜?, title: "莽聭聶茂陆聢氓聤職茅聭掳?, maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sylas.png`, img: `${LOADING_URL}/Sylas_0.jpg`, passive: "茅聧聶忙露聴猫麓隆: 氓搂拢氓驴聰卯聜录茅聨碌忙聮鲁氓職颅茅聨露芒聜卢茅聭鲁莽聲聦氓垄聺茅聫聝猫庐鹿莽麓聺茅聧楼莽聜虏卯聵虏 3 茅聬聬氓聹颅忙聲聯茅聧聸猫聴聣芒聜卢?, relicId: "SylasPassive", initialCards: ["SylasQ", "SylasW", "Strike", "Defend"], description: "茅聫聜忙楼聙茂录聥茅聭禄茅聛聧忙鲁聼茅聰聸氓虏聞芒聜卢忙掳鲁莽鹿聝忙拢掳忙聢聽莽庐聮茅聨碌忙聮鲁氓職颅茅聨露芒聜卢茅聭鲁氓聙聼氓鹿聫氓炉掳忙楼聝忙聲聯莽聙聸忙篓鹿莽麓颅茅聧聰猫拢陇芒聜卢? },
  "Urgot": { id: "Urgot", name: "茅聧聵氓聥芦氓搂聻茅聬聴?, title: "茅聫聝莽聤碌忙聶卤茅聨麓忙篓驴忙潞聟", maxHp: 100, maxMana: 3, avatar: `${CDN_URL}/img/champion/Urgot.png`, img: `${LOADING_URL}/Urgot_0.jpg`, passive: "茅聧楼莽聜碌盲录聙: 茅聨麓忙篓禄忙聻聼氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 15 茅聬聬茅聙聸氓陇聧茅聫聝猫聢碌氓搂垄茅聬垄?, relicId: "UrgotPassive", initialCards: ["UrgotQ", "UrgotW", "Defend", "Defend"], description: "茅聧搂茂鹿聙氓聨聽茅聭禄茅聛聧忙鲁聼茅聰聸氓卤戮氓芦垄茅聫聢氓陇聬莽聫庐茅聬垄莽聠路忙聡隆茅聧聤莽聟聨忙聥掳氓炉庐氓聯聞氓搂聫茅聴聝忙聫聮氓掳陆茅聤聠? },
  "Viktor": { id: "Viktor", name: "莽录聛忙聺聭氓聨聽茅聨碌?, title: "茅聫聢莽聝聵卯聺芦茅聧聫氓聽楼芒聰聧", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Viktor.png`, img: `${LOADING_URL}/Viktor_0.jpg`, passive: "茅聧聫氓陇聨氓麓鲁忙聺漏忙露聵氓炉虏: 茅聧楼莽聜虏忙聜聨氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聰聸?0% 茅聧聭莽聤碌氓路录茅聭戮氓鲁掳莽路卤忙露聯芒聜卢氓炉庐莽聤禄卯聳聜忙戮露忙聽搂莽聠聙莽潞颅芒聜卢茅聧聴?, relicId: "ViktorPassive", initialCards: ["ViktorQ", "ViktorE", "Ignite", "Heal"], description: "忙楼聜忙篓录卯聺聳茅聨露芒聜卢氓篓聣忙聸聻莽卢聙茅聰聸氓卤戮忙聬庐茅聴聙氓聺聴芒聜卢忙掳鲁莽鹿聝猫鹿聡卯聜娄芒聜卢莽聠赂忙聤陇茅聬聴氓虏聝氓鹿聫氓炉掳忙陇戮莽麓颅茅聧聰猫拢陇芒聜卢? },
  
  // --- 莽禄聴卯聝驴莽掳漏氓搂聤卯聢聻忙搂娄 (茅聫聜忙聺驴氓聛聧忙戮露? ---
  "Riven": { id: "Riven", name: "茅聬聼莽聜麓忙聻聝", title: "茅聫聙茅鹿聝芒聜卢忙聞陋莽庐拢茅聧聮?, maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Riven.png`, img: `${LOADING_URL}/Riven_0.jpg`, passive: "莽禄聴茂赂陆忙聻聝忙露聰氓卢陋氓聻聣: 氓搂拢氓驴聰氓垄娄茅聧聭?氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺茅聰聸氓虏聝氓鹿聫氓炉掳?茅聬聬莽隆聟氓聟聵茅聳虏?, relicId: "RivenPassive", initialCards: ["RivenQ", "RivenE", "Strike", "Defend"], description: "忙聺漏莽聜麓氓芦聭茅聧篓氓卢芦氓聻卢忙戮鹿卯聜卢莽麓聺茅聳芦忙掳鲁莽鹿聝忙聺漏莽聜碌莽聰禄茅聫聙猫炉虏氓職庐莽禄聣卯聢聹莽聳庐茅聭鲁盲禄聥氓聶潞茅聤聠? },
  "TwistedFate": { id: "TwistedFate", name: "茅聧聴茂录聞氓垄聺忙戮露脩聝莽卢聙", title: "氓庐聲忙聴聙忙聼聣茅聬聴?, maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/TwistedFate.png`, img: `${LOADING_URL}/TwistedFate_0.jpg`, passive: "茅聬聫氓虏聞忙聬庐忙楼聽忙聺驴莽聯聶: 茅聨麓忙篓禄忙聻聼茅聭鲁忙禄聝氓聼聞忙拢掳忙驴聠卯聵禄茅聭戮氓鲁掳莽路卤 15 茅聳虏忙聢聺莽芦碌", relicId: "TwistedFatePassive", initialCards: ["TwistedFateW", "TwistedFateQ", "Strike", "Ignite"], description: "莽录聛氓驴聰莽楼鹿茅聧篓氓卢芦莽隆露莽聰炉氓聽卢莽麓聺茅聳芦忙掳鲁莽鹿聝忙拢掳忙驴聠卯聵禄茅聳虏忙聢聺莽芦碌茅聭戮氓鲁掳莽路卤莽聭聛氓聭颅卯聵卢忙碌录忙篓潞氓篓聧茅聤聠? },
  "LeeSin": { id: "LeeSin", name: "茅聬漏忙聫聮氓聞鲁", title: "茅聫聣氓潞篓忙陆職", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/LeeSin.png`, img: `${LOADING_URL}/LeeSin_0.jpg`, passive: "茅聬陇茅鹿聝卯聴聯忙楼聽茫聜聣忙麓娄: 茅聨碌忙聮鲁氓職颅茅聨露芒聜卢茅聭鲁莽聲聦氓垄聺茅聧職氓潞炉莽麓聺忙露聯氓卢漏莽芦麓氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺莽聮聬氓聹颅忙聲陇-1", relicId: "LeeSinPassive", initialCards: ["LeeSinQ", "LeeSinW", "Strike", "Defend"], description: "茅聭潞氓聜職卯職聰茅聧篓氓卢芦氓聻卢忙戮鹿卯聜卢莽麓聺茅聳芦忙掳鲁莽鹿聝茅聨露芒聜卢茅聭鲁猫聴聣忙聥掳茅聫聙猫炉虏氓職庐茅聬篓氓聥炉氓聨陇茅聧職氓聽聼氓垄娄茅聧聭茅赂驴莽鹿聸茅聨路忙露聳芒聜卢? },
  "Vayne": { id: "Vayne", name: "茅聮聳氓聸篓盲禄录", title: "茅聫聠忙楼聙卯聶聛茅聬職氓潞垄氓垄聹", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Vayne.png`, img: `${LOADING_URL}/Vayne_0.jpg`, passive: "茅聧娄茂陆聣忙聭卤氓炉庐芒聲聝卯聠聞: 莽聙碌莽聭掳忙聜聯忙露聯芒聜卢茅聬漏卯聠陆莽聢拢忙聺漏莽聜碌莽聰禄茅聳芦莽聤鲁氓聻職3氓篓聠芒聙虏忙驴聙莽聙鹿猫聶芦忙陇聜茅聰聸氓虏聞卯聳聜忙戮露忙聽颅芒聜卢莽聤鲁氓聻職10忙碌录?, relicId: "VaynePassive", initialCards: ["VayneQ", "VayneE", "Strike", "Strike"], description: "茅聧聴忙聸職莽露聥茅聬聳氓聴聴氓陆聜莽聛聫氓聥卢氓垄聹茅聰聸氓卤录莽卢聯氓篓聣茫聞陇莽掳卢莽聙碌莽聭掳氓麓聼忙露聯芒聜卢茅聬漏卯聠陆莽聢拢茅聬篓氓聥卢氓炉聰莽录聛卯聟隆莽路颅茅聧聭忙聛聮芒聜卢? },
  "Teemo": { id: "Teemo", name: "茅聨禄忙聞炉氓赂驴", title: "忙聺漏氓聭庐氓碌聨茅聫聜茫聝楼芒聜卢?, maxHp: 65, maxMana: 3, avatar: `${CDN_URL}/img/champion/Teemo.png`, img: `${LOADING_URL}/Teemo_0.jpg`, passive: "氓篓聯莽篓驴氓職庐茅聨麓? 茅聧楼莽聜虏忙聜聨氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聰聸氓虏聞忙庐垄茅聫聢猫聶鹿莽虏掳忙露聯芒聜卢茅聧職氓露聠忙聶芦忙碌聹莽聝聵忙聼娄茅聧聰?2 莽聛聻氓聜聺忙芦聞氓炉庐?, relicId: "TeemoPassive", initialCards: ["TeemoQ", "TeemoR", "Strike", "Ignite"], description: "DoT茅聧篓氓卢陋莽職聽茅聨碌氓卢露莽麓聺茅聳芦忙掳鲁莽鹿聝茅聯聫忙掳卢忙聙楼茅聧聹氓卤戮忙搂聴忙碌录茫聜聟氓垄聸氓炉庐猫戮篓忙聶芦忙碌聹忙聛聮芒聜卢? },
  "Zed": { id: "Zed", name: "茅聧聰?, title: "猫陇掳猫戮篓莽楼娄忙露聰氓卢漏氓炉聦", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Zed.png`, img: `${LOADING_URL}/Zed_0.jpg`, passive: "猫陇掳氓聧聻氓聻聨茅聼卢? 氓搂拢氓驴聯忙麓聳茅聧職氓聽垄卯聝聡忙露聯芒聜卢氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺忙碌录忙掳露氓聶赂忙戮露氓露聠忙聼娄茅聫聙氓聫楼莽芦麓氓篓聠?50%忙碌录茫聜聟卯聠聤)", relicId: "ZedPassive", initialCards: ["ZedQ", "ZedE", "Strike", "Strike"], description: "茅聬聳氓聴聴氓陆聜茅聧篓氓卢陋氓聼隆莽聙鹿卯聺庐莽麓聺茅聳芦忙掳鲁莽鹿聝忙戮露氓露聟氓聼聴茅聫聙猫炉虏氓職庐茅聳芦莽聤鲁氓聻職氓庐赂茫聞漏卯聳聜忙碌录茫聜聟卯聠聤茅聤聠? },
  "Nasus": { id: "Nasus", name: "茅聧聬氓聭炉忙聠禄茅聫聜?, title: "氓篓聦忙卢聬莽麓露氓搂聺猫聧陇卯職拢", maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Nasus.png`, img: `${LOADING_URL}/Nasus_0.jpg`, passive: "氓搂鹿忙聼楼莽聯聤茅聬楼忙露聵氓職庐: 氓搂拢氓驴聰卯聜录茅聬垄茫聞娄忙聲戮茅聧聭猫聧陇氓垄聺茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣茅聰聸氓虏聝氓鹿聫氓炉掳?茅聬聬莽聭掳氓搂聫茅聳虏?, relicId: "NasusPassive", initialCards: ["NasusQ", "NasusW", "Strike", "Defend"], description: "茅聫聝莽聤禄忙陋潞茅聨麓忙聞掳忙職卤茅聧篓氓卢芦氓聻卢忙戮鹿卯聜卢莽麓聺茅聳芦忙掳鲁莽鹿聝茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣氓搂聵茅聲聬莽庐聶茅聨禄忙聞卢氓麓聦茅聧聰忙露垄氓聶潞茅聤聠? },
  "Irelia": { id: "Irelia", name: "茅聭鹿氓聣搂忙聠潞茅聭戮氓陇聤芒聳聧", title: "茅聧聮芒聜卢茅聳驴氓卢颅氓聻露茅聭掳?, maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Irelia.png`, img: `${LOADING_URL}/Irelia_0.jpg`, passive: "茅聬聭卯聟隆莽聵鹿: 氓搂拢氓驴聰卯聜录茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣茅聰聸氓卤戮盲禄庐忙戮露?1 茅聬聬莽隆聟氓聟聵茅聳虏氓驴聯猫聥聼茅聨露?1 氓炉庐莽聤碌氓垄聺", relicId: "IreliaPassive", initialCards: ["IreliaQ", "IreliaE", "Strike", "Defend"], description: "茅聫聙猫路潞氓拢聤茅聧篓氓卢芦氓聻卢忙戮鹿卯聜卢莽麓聺茅聳芦忙掳鲁莽鹿聝茅聧聭莽禄聵忙陆聝茅聳虏氓露聡莽聳聠茅聧聹氓卤戮氓篓聤茅聬聴氓卤陆猫聢掳茅聨麓忙聞炉莽鹿聸茅聧聭忙卤聡芒聜卢?, baseStr: 0 },
  "Thresh": { id: "Thresh", name: "茅聳驴茫聜聡莽聟露", title: "忙娄聞氓聜聻忙聰拢茅聧聫氓聯楼氓芦鲁茅聴聙?, maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Thresh.png`, img: `${LOADING_URL}/Thresh_0.jpg`, passive: "茅聧娄忙聣庐氓芦鲁莽聮聡氓聭颅忙聥禄: 氓搂拢氓驴聰卯聜录茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣茅聰聸氓卤戮忙隆聢忙露聰氓聭颅卯聳聝茅聧聰?2 茅聫聢芒聜卢忙戮露脩聟忙聲聯茅聧聸猫聴聣芒聜卢?, relicId: "ThreshPassive", initialCards: ["ThreshQ", "ThreshW", "Strike", "Defend"], description: "茅聨麓忙聞掳忙職卤茅聧篓氓卢陋忙陆露茅聧聫氓卢露莽麓聺茅聳芦忙掳鲁莽鹿聝茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣氓搂聵茅聲聬莽庐聶茅聨禄忙聞卢氓麓聦茅聬垄莽聠路忙聡隆忙露聯氓漏聡忙陋潞茅聤聠?, baseStr: 0 },
  "Katarina": { id: "Katarina", name: "茅聧聴茂录聞氓拢聮茅聬聻氓聠虏卯聼聜", title: "忙露聯氓露聡茫聜楼忙露聰氓卢陋氓聻聣", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Katarina.png`, img: `${LOADING_URL}/Katarina_0.jpg`, passive: "莽聮聬卯聛聞芒聰聠: 氓搂拢氓驴聯忙麓聳茅聧職氓聽聼莽聵隆茅聨碌忙聮鲁氓職颅 3 氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺茅聧職氓潞炉莽麓聺忙露聯氓卢漏莽芦麓氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺忙碌录茫聜聟卯聠聤莽录聢猫炉虏芒聜卢?, relicId: "KatarinaPassive", initialCards: ["KatarinaQ", "KatarinaE", "Strike", "Strike"], description: "莽聮聛芒聞聝忙職聼茅聧拢茫聞楼莽聙路茅聧聮氓聯聞卯聟鹿茅聰聸氓虏聞芒聜卢忙掳鲁莽鹿聝忙聺漏莽聜虏氓職庐莽聭聶茂鹿聙氓陆聜忙楼聜忙漏聙卯聳聜茅聬聳氓聴聴氓陆聜忙碌录茫聜聟卯聠聤茅聤聠?, baseStr: 0 },
};

const RELIC_DATABASE = {
  // 茅聧漏猫聶鹿卯聰聟莽聬職卯聜垄氓搂漏茅聳卢忙楼聝氓垄驴 (20忙露聯?
  "GarenPassive": { id: "GarenPassive", name: "茅聧搂忙掳露莽聟拢", description: "茅聨麓忙篓禄忙聻聼莽录聛忙聮麓忙陆芦茅聫聝猫聢碌盲禄庐忙戮露?6 HP", rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "DariusPassive": { id: "DariusPassive", name: "茅聧聭茅赂驴卯聰聟", description: "氓搂拢氓驴聰卯聜录茅聫聙猫炉虏氓職庐茅聫聝猫庐鹿莽麓聺莽录聛忙卢聨莽掳拢茅聫聛氓卤录忙卤聣 1 莽聛聻氓聜聺忙芦聞氓炉庐?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "LuxPassive": { id: "LuxPassive", name: "茅聧聫氓陇聨氓搂聝茅聧楼忙露聵莽職聽", description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聺莽麓聭忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 1 茅聬聬氓陆聮卯聳聜忙戮露忙聽篓莽隆露茅聧聰?, rarity: "PASSIVE", img: `${PASSIVE_URL}/LuxIllumination.png` },
  "JinxPassive": { id: "JinxPassive", name: "茅聬聳氓聴聴氓陆聜", description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聺氓聻碌忙驴庐氓卢芦氓垄聹茅聬聴氓卤戮忙職聼茅聳虏?1", rarity: "PASSIVE", img: `${PASSIVE_URL}/Jinx_Passive.png` },
  "YasuoPassive": { id: "YasuoPassive", name: "氓篓麓卯聛聞卯聟鹿忙露聰氓卢庐盲潞戮", description: "茅聫聙猫炉虏氓職庐茅聬聴氓卤戮忙炉職茅聧聭猫炉虏氓職聭茅聬聹?10%", rarity: "PASSIVE", img: `${PASSIVE_URL}/Yasuo_Passive.png` },
  "SonaPassive": { id: "SonaPassive", name: "茅聭鲁盲禄聥氓聶潞氓炉庐?, description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聼氓垄娄茅聧聭猫聶鹿卯聝聡忙露聯氓陇聤莽麓露茅聧聴芒聞聝忙陇聜茅聰聸氓虏聝氓鹿聫氓炉掳?3 茅聬聬茅聙聸氓陇聧茅聫聝猫聢碌氓搂垄茅聬垄?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Sona_Passive.png` },
  "EkkoPassive": { id: "EkkoPassive", name: "Z茅聧篓氓卢庐芒聰聧茅聧聰茫聞楼氓聫隆茅聨赂?, description: "氓搂拢氓驴聰卯聜录茅聨碌忙聮鲁氓職颅氓篓聭氓聽拢芒聜卢忙楼聙氓麓卤茅聫聝猫庐鹿莽麓聺茅聭戮氓鲁掳莽路卤 1 茅聬聬莽聭掳氓搂聫茅聳虏?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Ekko_P.png` },
  "SylasPassive": { id: "SylasPassive", name: "茅聧聶忙露聴猫麓隆", description: "氓搂拢氓驴聰卯聜录茅聨碌忙聮鲁氓職颅茅聨露芒聜卢茅聭鲁莽聲聦氓垄聺茅聫聝猫庐鹿莽麓聺茅聧楼莽聜虏卯聵虏 3 茅聬聬氓聹颅忙聲聯茅聧聸猫聴聣芒聜卢?, rarity: "PASSIVE", img: `${PASSIVE_URL}/SylasP.png` },
  "UrgotPassive": { id: "UrgotPassive", name: "茅聧楼莽聜碌盲录聙", description: "茅聨麓忙篓禄忙聻聼氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 15 茅聬聬茅聙聸氓陇聧茅聫聝猫聢碌氓搂垄茅聬垄?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Urgot_Passive.png` },
  "ViktorPassive": { id: "ViktorPassive", name: "茅聧聫氓陇聨氓麓鲁忙聺漏忙露聵氓炉虏", description: "茅聧楼莽聜虏忙聜聨氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聰聸?0% 茅聧聭莽聤碌氓路录茅聭戮氓鲁掳莽路卤忙露聯芒聜卢氓炉庐莽聤禄卯聳聜忙戮露忙聽搂莽聠聙莽潞颅芒聜卢茅聧聴?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Viktor_Passive.png` },
  "RivenPassive": { id: "RivenPassive", name: "莽禄聴茂赂陆忙聻聝忙露聰氓卢陋氓聻聣", description: "氓搂拢氓驴聰氓垄娄茅聧聭?氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺茅聰聸氓虏聝氓鹿聫氓炉掳?茅聬聬莽隆聟氓聟聵茅聳虏?, rarity: "PASSIVE", img: `${PASSIVE_URL}/RivenRunicBlades.png` },
  "TwistedFatePassive": { id: "TwistedFatePassive", name: "茅聬聫氓虏聞忙聬庐忙楼聽忙聺驴莽聯聶", description: "茅聨麓忙篓禄忙聻聼茅聭鲁忙禄聝氓聼聞忙拢掳忙驴聠卯聵禄茅聭戮氓鲁掳莽路卤 15 茅聳虏忙聢聺莽芦碌", rarity: "PASSIVE", img: `${PASSIVE_URL}/CardMaster_SealFate.png` },
  "LeeSinPassive": { id: "LeeSinPassive", name: "茅聬陇茅鹿聝卯聴聯忙楼聽茫聜聣忙麓娄", description: "茅聨碌忙聮鲁氓職颅茅聨露芒聜卢茅聭鲁莽聲聦氓垄聺茅聧職氓潞炉莽麓聺忙露聯氓卢漏莽芦麓氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺莽聮聬氓聹颅忙聲陇-1", rarity: "PASSIVE", img: `${PASSIVE_URL}/LeeSinPassive.png` },
  "VaynePassive": { id: "VaynePassive", name: "茅聧娄茂陆聣忙聭卤氓炉庐芒聲聝卯聠聞", description: "莽聙碌莽聭掳忙聜聯忙露聯芒聜卢茅聬漏卯聠陆莽聢拢忙聺漏莽聜碌莽聰禄茅聳芦莽聤鲁氓聻職3氓篓聠芒聙虏忙驴聙莽聙鹿猫聶芦忙陇聜茅聰聸氓虏聞卯聳聜忙戮露忙聽颅芒聜卢莽聤鲁氓聻職10忙碌录?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Vayne_SilveredBolts.png` },
  "TeemoPassive": { id: "TeemoPassive", name: "氓篓聯莽篓驴氓職庐茅聨麓?, description: "茅聧楼莽聜虏忙聜聨氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聰聸氓虏聞忙庐垄茅聫聢猫聶鹿莽虏掳忙露聯芒聜卢茅聧職氓露聠忙聶芦忙碌聹莽聝聵忙聼娄茅聧聰?2 莽聛聻氓聜聺忙芦聞氓炉庐?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Teemo_P.png` },
  "ZedPassive": { id: "ZedPassive", name: "猫陇掳氓聧聻氓聻聨茅聼卢?, description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽垄卯聝聡忙露聯芒聜卢氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺忙碌录忙掳露氓聶赂忙戮露氓露聠忙聼娄茅聫聙氓聫楼莽芦麓氓篓聠?50%忙碌录茫聜聟卯聠聤)", rarity: "PASSIVE", img: `${PASSIVE_URL}/Zed_Passive.png` },
  "NasusPassive": { id: "NasusPassive", name: "氓搂鹿忙聼楼莽聯聤茅聬楼忙露聵氓職庐", description: "氓搂拢氓驴聰卯聜录茅聬垄茫聞娄忙聲戮茅聧聭猫聧陇氓垄聺茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣茅聰聸氓虏聝氓鹿聫氓炉掳?茅聬聬莽聭掳氓搂聫茅聳虏?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Nasus_Passive.png` },
  "IreliaPassive": { id: "IreliaPassive", name: "茅聬聭卯聟隆莽聵鹿", description: "氓搂拢氓驴聰卯聜录茅聧聭莽禄聵忙陆聝茅聫聛氓卤录忙卤聣茅聰聸氓卤戮盲禄庐忙戮露?1 茅聬聬莽隆聟氓聟聵茅聳虏氓驴聯猫聥聼茅聨露?1 氓炉庐莽聤碌氓垄聺", rarity: "PASSIVE", img: `${PASSIVE_URL}/Irelia_Passive.png` },
  "ThreshPassive": { id: "ThreshPassive", name: "茅聧娄忙聣庐氓芦鲁莽聮聡氓聭颅忙聥禄", description: "茅聫聛氓卤录忙卤聣氓搂聺猫庐鲁茅陋赂忙戮搂莽聜虏氓搂聻 2 茅聫聢芒聜卢忙戮露脩聟忙聲聯茅聧聸猫聴聣芒聜卢?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Thresh_Passive.png` },
  "KatarinaPassive": { id: "KatarinaPassive", name: "莽聮聬卯聛聞芒聰聠", description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聼氓垄娄茅聧聭猫聶鹿忙庐聭氓搂拢氓驴聲卯聝聡 4 氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺忙碌录茫聜聟卯聠聤莽录聢猫炉虏芒聜卢?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Katarina_Passive.png` },

  // 茅聳芦忙掳卤忙聲陇茅聳卢忙楼聝氓垄驴
  "DoransShield": { id: "DoransShield", name: "忙戮露忙掳卢氓聫聻忙露聰氓卢卢忙碌聵", price: 100, rarity: "COMMON", description: "茅聨麓忙篓禄忙聻聼氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 6 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢?, img: `${ITEM_URL}/1054.png`, onBattleStart: (state) => ({ ...state, block: state.block + 6 }) },
  "LongSword": { id: "LongSword", name: "茅聴聙氓聻庐氓垄陇", price: 150, rarity: "COMMON", description: "茅聨麓忙篓禄忙聻聼氓炉庐芒聜卢忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 1 茅聬聬莽聭掳氓搂聫茅聳虏氓驴聥芒聜卢?, img: `${ITEM_URL}/1036.png`, onBattleStart: (state) => ({ ...state, status: { ...state.status, strength: state.status.strength + 1 } }) },
  "RubyCrystal": { id: "RubyCrystal", name: "莽禄戮茫聢隆忙聦聣茅聫聟?, price: 120, rarity: "COMMON", description: "茅聫聢芒聜卢忙戮露脩聟忙聲聯茅聧聸猫聴聣芒聜卢?+15茅聤聠?, img: `${ITEM_URL}/1028.png`, onPickup: (gameState) => ({ ...gameState, maxHp: gameState.maxHp + 15, currentHp: gameState.currentHp + 15 }) },
  "VampiricScepter": { id: "VampiricScepter", name: "茅聧職忙颅聦卯聰聟忙楼聺猫聣掳氓娄颅茅聫聣?, price: 280, rarity: "UNCOMMON", description: "氓搂拢氓驴聰卯聜录茅聨碌忙聮鲁氓職颅茅聫聙猫炉虏氓職庐茅聬聴氓卤戮盲禄庐忙戮露?1 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢?, img: `${ITEM_URL}/1053.png` },
  "Sheen": { id: "Sheen", name: "茅聭掳芒聜卢茅聧聫?, price: 350, rarity: "UNCOMMON", description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聼氓垄娄茅聧聭猫聶鹿忙庐聭莽禄聴卯聝驴莽芦麓氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺茅聰聸氓卤录忙驴聙莽聙鹿氓麓聡莽聜聲茅聧聤氓露聝芒聜卢?, img: `${ITEM_URL}/3057.png` },
  "ZhonyasHourglass": { id: "ZhonyasHourglass", name: "忙露聯卯聟聻芒聳聧氓篓聦忙卢聬莽麓隆", price: 500, rarity: "RARE", description: "氓搂拢氓驴聯忙潞聙茅聨麓忙篓禄忙聻聼茅聴聞忙聞陋莽芦麓氓篓聠芒聵聟莽麓掳茅聧聫氓露聡忙聼聟忙露聯氓卢漏莽芦麓茅聧楼莽聜虏忙聜聨茅聬篓氓聥卢忙聶芦忙碌聹猫陆掳忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${ITEM_URL}/3157.png`, charges: 1 },
  "InfinityEdge": { id: "InfinityEdge", name: "茅聫聝莽聤虏忙聲聳忙露聰氓卢陋氓聻聣", price: 700, rarity: "RARE", description: "茅聨碌芒聜卢茅聫聢氓陇聥忙聲戮茅聧聭猫聧陇氓垄聺忙碌录茫聜聟卯聠聤+50%茅聤聠?, img: `${ITEM_URL}/3031.png` },
  "Redemption": { id: "Redemption", name: "茅聫聛忙聢拢莽楼鹿", price: 650, rarity: "RARE", description: "氓搂拢氓驴聯忙麓聳茅聧職氓聽聺莽麓聭忙驴庐氓卢芦忙陇聜茅聰聸氓卤戮盲赂聧茅聬陇忙陇戮莽露聵茅聧聹氓卤戮忙聶芦忙碌聹?5 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢?, img: `${ITEM_URL}/3107.png`, onTurnStart: (pState, eState) => ({ pState: { ...pState, hp: Math.min(pState.maxHp, pState.hp + 5) }, eState: { ...eState, hp: eState.hp + 5 } }) },
  "BrambleVest": { id: "BrambleVest", name: "茅聭陆氓聴聵卯聴聺茅聭鲁氓卤陆莽赂戮", price: 200, rarity: "UNCOMMON", description: "氓搂拢氓驴聰卯聜录莽聬職卯聜拢忙聲戮茅聧聭莽禄聵忙陇聜茅聰聸氓卤陆卯聡庐茅聫聙猫炉虏氓職庐茅聭掳氓聭麓芒聜卢莽聤鲁氓聻職 3 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${ITEM_URL}/3076.png` },
  "GuardianAngel": { id: "GuardianAngel", name: "莽聙鹿氓聽聼氓搂垄忙戮露芒聲聙氓篓聡", price: 750, rarity: "RARE", description: "氓搂聺猫庐鲁茅陋赂茅聫聝猫庐鹿莽麓聺茅聨颅茫聢聽卯聵虏 40 茅聬聬氓聹颅忙聲聯茅聧聸猫聴聣芒聜卢莽卢潞芒聜卢氓聜聸莽聵隆茅聧娄莽聝聵氓聻卢茅聫聜忙楼聟忙陋潞忙露聯芒聜卢氓篓聠脗掳芒聜卢?, img: `${ITEM_URL}/3026.png`, charges: 1 },
  
  // 莽禄聰莽聤潞氓娄颅忙露聯忙聮鲁莽聺聵茅聳卢忙楼聝氓垄驴 (Act Specific)
  "Cull": { id: "Cull", name: "茅聮聙氓聠篓氓陆聡", price: 400, rarity: "RARE", description: "Act 1 茅聴聞忙聞卢莽聲戮茅聰聸忙掳卢氓職庐茅聫聣芒聜卢 10 忙露聯卯聛聟忙聶芦忙碌聹氓聯聞忙聜聴茅聭戮氓鲁掳莽路卤 300 茅聳虏忙聢聺莽芦碌茅聤聠?, img: `${ITEM_URL}/1083.png` },
  "DarkSeal": { id: "DarkSeal", name: "忙娄聸忙聢聻忙庐芦莽聛聫盲陆赂氓碌聝", price: 300, rarity: "RARE", description: "Act 1 茅聴聞忙聞卢莽聲戮茅聰聸忙掳颅莽聵隆氓篓聠芒聞聝氓聻卢茅聫聜忙楼聞氓聞篓茅聧聮?+2 HP忙露聯氓漏聡忙陋潞茅聤聠?, img: `${ITEM_URL}/1082.png` },
  "QSS": { id: "QSS", name: "氓搂聵忙聮庐忙聭卤忙楼聴忙聺驴莽聰芦", price: 500, rarity: "RARE", description: "Act 2 茅聴聞忙聞卢莽聲戮茅聰聸忙掳颅氓聻卢茅聫聜忙楼聙莽麓聭忙驴庐氓卢芦忙陇聜茅聭戮氓鲁掳莽路卤 1 莽聛聻氓聜聶忙卤聣氓庐赂茫聝楼氓聼聴茅聧聺?(茅聨露氓聻芦氓掳聟Debuff)茅聤聠?, img: `${ITEM_URL}/3140.png` },
  "Executioner": { id: "Executioner", name: "氓搂聺猫炉虏氓聻聹莽聙鹿茂陆聟忙聠隆", price: 450, rarity: "RARE", description: "Act 2 茅聴聞忙聞卢莽聲戮茅聰聸忙掳颅忙聲戮茅聧聭莽禄聵忙聼娄茅聧聰莽聤禄氓聶赂忙碌录?(茅聫聛氓卤录忙卤聣茅聫聝莽聤鲁莽隆露茅聧楼莽聜虏卯聵虏HP)茅聤聠?, img: `${ITEM_URL}/3123.png` },
  "Nashor": { id: "Nashor", name: "莽禄戮氓聟聟莽虏聢忙露聰氓卢卢氓垄庐", price: 800, rarity: "RARE", description: "Act 3 茅聴聞忙聞卢莽聲戮茅聰聸忙掳颅莽聵隆茅聧楼莽聜虏忙聜聨茅聨碌忙聮鲁氓職颅茅聬篓氓聥颅卯聝聡 3 氓炉庐莽聤鲁忙聲戮茅聧聭猫聧陇氓垄聺忙碌录茫聜聟卯聠聤莽录聢猫炉虏芒聜卢氓露聝芒聜卢?, img: `${ITEM_URL}/3115.png` }
};

// 茅聨碌芒聲聛莽聺聧茅聫聛氓卤录忙卤聣氓搂鹿莽聥聟莽麓掳茅聧聰莽聤虏氓聫聠茅聫聠忙楼聙氓楼聳氓庐聙忙露聵忙聥掳茅聯聫忙掳卤芒聰聳茅聬垄莽聠潞氓垄驴
const ENEMY_POOL = {
  // Act 1: Rift
  "Katarina": { id: "Katarina", name: "茅聧聴茂录聞氓拢聮茅聬聻氓聠虏卯聼聜", title: "忙露聯氓露聡茫聜楼忙露聰氓卢陋氓聻聣", maxHp: 35, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Katarina_0.jpg`, avatar: `${CDN_URL}/img/champion/Katarina.png`, actions: [{ type: 'ATTACK', value: 5, count: 2, name: "茅聬卢卯聞聛卯聞聻忙聺漏莽聜虏氓職庐" }, { type: 'DEBUFF', value: 0, name: "氓搂聺猫庐鲁茅陋赂茅聭戮忙聫聮氓麓聲", effect: "VULNERABLE", effectValue: 1 }] },
  "Talon": { id: "Talon", name: "氓篓聣盲录麓忙庐聲", title: "茅聧聮芒聜卢茅聳驴氓卢漏莽庐拢猫陇掳?, maxHp: 40, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Talon_0.jpg`, avatar: `${CDN_URL}/img/champion/Talon.png`, actions: [{ type: 'ATTACK', value: 9, name: "莽聮聡氓聯聞氓聨聽茅聮聙茫聞娄忙聼聣忙戮露忙聽娄忙掳娄" }, { type: 'BUFF', value: 0, name: "莽录聢猫炉虏卯聲戮莽聮潞忙聢拢莽聼戮", effect: "BLOCK", effectValue: 8 }] },
  "Lucian": { id: "Lucian", name: "茅聧聴茫聢陇忙聲聴莽聙鹿?, title: "茅聧娄茂陆聠莽聛聶氓篓聯茅聲聬莽路潞", maxHp: 55, act: 1, difficultyRank: 2, img: `${LOADING_URL}/Lucian_0.jpg`, avatar: `${CDN_URL}/img/champion/Lucian.png`, actions: [{ type: 'ATTACK', value: 6, count: 2, name: "茅聧娄茂陆聟氓聨聹茅聳戮猫路潞猫聞聤" }] },
  "Darius_BOSS": { id: "Darius_BOSS", name: "氓炉掳莽聳炉氓鹿聢茅聧聵氓聥卢忙聼聣", title: "莽聮聡氓聯聞氓聨聽茅聮聙茫聞娄忙聼聣忙露聰氓卢芦氓垄聹", maxHp: 120, act: 1, difficultyRank: 99, img: `${LOADING_URL}/Darius_0.jpg`, avatar: `${CDN_URL}/img/champion/Darius.png`, actions: [{ type: 'ATTACK', value: 12, name: "忙戮露脩聞忙陆聝茅聧楼忙露聶忙聼聼" }, { type: 'DEBUFF', value: 0, name: "茅聭路氓颅聵莽聲芦茅聨碌忙聮鲁氓職庐", effect: "WEAK", effectValue: 2 }, { type: 'ATTACK', value: 20, name: "茅聫聜卯聟聻茫聛聰茅聧聶氓赂庐莽麓聮" }] },

  // Act 2: Shadow Isles
  "Hecarim": { id: "Hecarim", name: "莽聮搂卯聜垄氓麓卤茅聳虏氓卤陆卯聺聥", title: "茅聨麓忙篓鹿莽掳陇忙露聰氓卢陋氓楼聳", maxHp: 80, act: 2, difficultyRank: 1, img: `${LOADING_URL}/Hecarim_0.jpg`, avatar: `${CDN_URL}/img/champion/Hecarim.png`, actions: [{ type: 'ATTACK', value: 12, name: "茅聫聠莽拢聥猫聸聥" }, { type: 'BUFF', value: 0, name: "茅聨颅忙聞颅氓聞鲁忙露聰氓卢卢盲录聮", effect: "STRENGTH", effectValue: 2 }] },
  "Thresh": { id: "Thresh", name: "茅聳驴茫聜聡莽聟露", title: "忙娄聞氓聜聻忙聰拢茅聧聫氓聯楼氓芦鲁茅聴聙?, maxHp: 90, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Thresh_0.jpg`, avatar: `${CDN_URL}/img/champion/Thresh.png`, actions: [{ type: 'DEBUFF', value: 0, name: "氓搂聺猫庐鲁茅陋赂茅聧聮茫聜聟氓聳聟", effect: "VULNERABLE", effectValue: 2 }, { type: 'ATTACK', value: 8, name: "茅聧聵氓聥庐莽鹿聧茅聳陆莽聠赂忙聠聹" }] },
  "Karthus": { id: "Karthus", name: "茅聧聴芒聙鲁莽職碌茅聮聙茫聞娄忙聼聣", title: "氓搂聺猫庐鲁茅陋赂忙拢掳氓聜職忙聲卤茅聭掳?, maxHp: 70, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Karthus_0.jpg`, avatar: `${CDN_URL}/img/champion/Karthus.png`, actions: [{ type: 'ATTACK', value: 4, count: 3, name: "茅聭陆忙聨聲氓搂聲" }, { type: 'ATTACK', value: 25, name: "莽聙鹿氓陇聬莽聯聤茅聫聡? }] },
  "Viego_BOSS": { id: "Viego_BOSS", name: "忙碌拢忙露聹芒聜卢猫聢碌氓聻聬", title: "茅聬庐莽拢聥猫搂娄忙露聰氓卢卢氓赂聡", maxHp: 180, act: 2, difficultyRank: 99, img: `${LOADING_URL}/Viego_0.jpg`, avatar: `${CDN_URL}/img/champion/Viego.png`, actions: [{ type: 'ATTACK', value: 15, count: 2, name: "茅聬庐莽拢聥猫搂娄茅聬聹氓卢陋氓垄陇" }, { type: 'BUFF', value: 0, name: "茅聭录卯聜楼氓掳聴茅聬聮茂鹿聙忙鹿隆", effect: "BLOCK", effectValue: 20 }] },

  // Act 3: The Void
  "KhaZix": { id: "KhaZix", name: "茅聧聴芒聙鲁氓聬聜茅聧聫?, title: "茅聯聫忙掳卤芒聰聳茅聨潞莽聤虏茫聛職茅聭掳?, maxHp: 100, act: 3, difficultyRank: 1, img: `${LOADING_URL}/Khazix_0.jpg`, avatar: `${CDN_URL}/img/champion/Khazix.png`, actions: [{ type: 'ATTACK', value: 25, name: "茅聧聺盲陆赂莽職戮茅聨颅忙聞颅氓聞鲁" }] },
  "VelKoz": { id: "VelKoz", name: "莽录聛忙聺聭氓聨聽茅聧聫?, title: "茅聯聫忙掳卤芒聰聳忙露聰氓卢卢忙潞聜", maxHp: 110, act: 3, difficultyRank: 2, img: `${LOADING_URL}/Velkoz_0.jpg`, avatar: `${CDN_URL}/img/champion/Velkoz.png`, actions: [{ type: 'ATTACK', value: 5, count: 4, name: "茅聬垄莽聠路忙聡隆猫陇掳茫聢隆芒聜卢盲陆潞忙聭聺莽聭聶? }] },
  "BelVeth_BOSS": { id: "BelVeth_BOSS", name: "茅聧聴忙聢聺莽職碌莽录聛氓颅聵忙聼聣", title: "茅聯聫忙掳卤芒聰聳忙驴聜氓麓聡忙庐聴", maxHp: 300, act: 3, difficultyRank: 99, img: `${LOADING_URL}/Belveth_0.jpg`, avatar: `${CDN_URL}/img/champion/Belveth.png`, actions: [{ type: 'ATTACK', value: 8, count: 4, name: "忙露聯氓聸陋忙碌聡莽聮聻卯聛聠卯聞庐" }, { type: 'DEBUFF', value: 0, name: "茅聯聫忙掳卤芒聰聳茅聴聢茫聢聽卯聠聬", effect: "WEAK", effectValue: 99 }] }
};

const CARD_DATABASE = {
  "Strike": { id: "Strike", hero: "Neutral", name: "茅聨碌忙聮鲁氓職庐", price: 0, type: "ATTACK", cost: 1, value: 6, description: "茅聳芦莽聤鲁氓聻職 6 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/SummonerFlash.png`, rarity: "BASIC" },
  "Defend": { id: "Defend", hero: "Neutral", name: "茅聴聝忙聫聮氓掳陆", price: 0, type: "SKILL", cost: 1, block: 5, description: "茅聭戮氓鲁掳莽路卤 5 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢?, img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "BASIC" },
  "Ignite": { id: "Ignite", hero: "Neutral", name: "茅聬聬氓聹颅氓聶搂", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "茅聭戮氓鲁掳莽路卤 2 茅聬聬莽聭掳氓搂聫茅聳虏氓驴聥芒聜卢氓聜聸莽搂路茅聭掳忙陇录芒聜卢?, img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", hero: "Neutral", name: "氓篓聦猫聧陇忙聻聼茅聫聢?, price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "茅聨颅茫聢聽卯聵虏 10 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢氓聜聸莽搂路茅聭掳忙陇录芒聜卢?, img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
  
  "GarenQ": { id: "GarenQ", hero: "Garen", name: "茅聭路忙聺聭忙聡隆茅聨碌忙聮鲁氓職庐", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?2 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", hero: "Garen", name: "茅聧聲氓聸篓莽職碌", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "茅聭戮氓鲁掳莽路卤 12 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢氓聜職氓聶拢茅聧聳忙聽楼芒聜卢?, img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },
  "DariusW": { id: "DariusW", hero: "Darius", name: "茅聭路氓颅聵莽聲芦茅聨碌忙聮鲁氓職庐", price: 60, type: "ATTACK", cost: 1, value: 10, effect: "WEAK", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 10 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?1 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/DariusNoxianTacticsONH.png`, rarity: "COMMON" },
  "DariusE": { id: "DariusE", hero: "Darius", name: "茅聫聝莽聤鲁氓聞聫茅聳戮盲陆鹿氓垄聹", price: 80, type: "SKILL", cost: 2, effect: "DRAW", effectValue: 1, description: "茅聨露忙聮鲁氓陆聡 1 氓炉庐莽聤碌氓垄聺茅聤聠氓聜聹莽虏掳忙碌聹?3 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "UNCOMMON" },
  "LuxQ": { id: "LuxQ", hero: "Lux", name: "茅聧聫氓陇聣莽庐拢茅聫聣莽聠潞莽麓掳", price: 70, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 3, description: "莽录聛忙卢聨莽掳拢 3 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/LuxLightBinding.png`, rarity: "COMMON" },
  "LuxE": { id: "LuxE", hero: "Lux", name: "茅聳芦氓驴聯氓聨聹忙驴聜氓聸漏氓聛拢", price: 120, type: "ATTACK", cost: 2, value: 15, exhaust: true, description: "茅聳芦莽聤鲁氓聻職 15 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聸莽搂路茅聭掳忙陇录芒聜卢?, img: `${SPELL_URL}/LuxLightStrikeKage.png`, rarity: "UNCOMMON" },
  "JinxQ": { id: "JinxQ", hero: "Jinx", name: "茅聧聮氓聸陋氓職聹茅聧聰茫聞娄氓掳聟", price: 40, type: "ATTACK", cost: 0, value: 4, isMultiHit: true, hits: 2, description: "茅聳芦莽聤鲁氓聻職 2 氓篓聠?4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/JinxQ.png`, rarity: "COMMON" },
  "JinxW": { id: "JinxW", hero: "Jinx", name: "茅聴聡氓聸陋氓麓卤茅聬垄莽聰碌卯聴聠氓篓聣?, price: 90, type: "ATTACK", cost: 2, value: 20, effect: "WEAK", effectValue: 2, description: "茅聳芦莽聤鲁氓聻職 20 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?2 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/JinxW.png`, rarity: "UNCOMMON" },
  "YasuoQ": { id: "YasuoQ", hero: "Yasuo", name: "茅聫聜芒聲聟忙聦聴茅聴聜?, price: 40, type: "ATTACK", cost: 0, value: 4, description: "茅聳芦莽聤鲁氓聻職 4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/YasuoQ1Wrapper.png`, rarity: "COMMON" },
  "YasuoE": { id: "YasuoE", hero: "Yasuo", name: "茅聼陋氓驴聯氓垄聽茅聫聜?, price: 70, type: "ATTACK", cost: 1, value: 8, effect: "STRENGTH", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聺氓鹿聫氓炉掳?1 茅聬聬莽聭掳氓搂聫茅聳虏氓驴聥芒聜卢?, img: `${SPELL_URL}/YasuoDashWrapper.png`, rarity: "UNCOMMON" },
  "SonaQ": { id: "SonaQ", hero: "Sona", name: "茅聭禄氓聧聻氓陋路莽聮搂莽聜碌莽路篓莽聮聡?, price: 50, type: "ATTACK", cost: 1, value: 7, effect: "HEAL", effectValue: 3, description: "茅聳芦莽聤鲁氓聻職 7 茅聬聬茅聙聸忙驴聙莽聙鹿莽颅鹿莽麓聺茅聧楼莽聜虏卯聵虏 3 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢?, img: `${SPELL_URL}/SonaHymnofValor.png`, rarity: "COMMON" },
  "SonaW": { id: "SonaW", hero: "Sona", name: "茅聧搂忙掳颅莽聵聫茅聧聹氓驴聯氓戮聠莽聮聥?, price: 80, type: "SKILL", cost: 1, block: 8, effect: "HEAL", effectValue: 5, description: "茅聭戮氓鲁掳莽路卤 8 茅聬聬猫搂聞氓搂垄茅聬垄猫炉搂莽麓聺茅聧楼莽聜虏卯聵虏 5 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢?, img: `${SPELL_URL}/SonaAriaofPerseverance.png`, rarity: "UNCOMMON" },
  "EkkoQ": { id: "EkkoQ", hero: "Ekko", name: "茅聫聝氓聽聲忙拢驴茅聧聴茅聰聥忙麓赂茅聧拢?, price: 50, type: "ATTACK", cost: 1, value: 12, exhaust: true, description: "茅聳芦莽聤鲁氓聻職 12 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聸莽搂路茅聭掳忙陇录芒聜卢?, img: `${SPELL_URL}/EkkoQ.png`, rarity: "COMMON" },
  "EkkoE": { id: "EkkoE", hero: "Ekko", name: "茅聬漏茅聲聬莽露聟忙路聡卯聢職氓聲驴", price: 90, type: "SKILL", cost: 0, block: 5, exhaust: true, description: "茅聭戮氓鲁掳莽路卤 5 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢?, img: `${SPELL_URL}/EkkoE.png`, rarity: "UNCOMMON" },
  "SylasQ": { id: "SylasQ", hero: "Sylas", name: "茅聳驴盲戮聙忙聭录茅聴聣卯聟聻氓職庐", price: 50, type: "ATTACK", cost: 1, value: 7, isMultiHit: true, hits: 2, description: "茅聳芦莽聤鲁氓聻職 2 氓篓聠?7 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/SylasQ.png`, rarity: "COMMON" },
  "SylasW": { id: "SylasW", hero: "Sylas", name: "氓炉庐忙聢聺忙聜掳莽禄聬盲陆赂氓聼隆", price: 90, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 15, description: "茅聧楼莽聜虏卯聵虏 15 茅聬聬氓聹颅忙聲聯茅聧聸氓搂聬芒聜卢?, img: `${SPELL_URL}/SylasW.png`, rarity: "UNCOMMON" },
  "UrgotQ": { id: "UrgotQ", hero: "Urgot", name: "茅聭碌忙聞炉忙庐聦茅聬垄盲陆聝氓碌聨", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "WEAK", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿莽颅鹿莽麓聺莽录聛忙卢聨莽掳拢 1 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/UrgotQ.png`, rarity: "COMMON" },
  "UrgotW": { id: "UrgotW", hero: "Urgot", name: "茅聧聭芒聜卢茅聴聞?, price: 90, type: "SKILL", cost: 1, block: 8, effect: "VULNERABLE", effectValue: 1, description: "茅聭戮氓鲁掳莽路卤 8 茅聬聬猫搂聞氓搂垄茅聬垄猫炉搂莽麓聺莽录聛忙卢聨莽掳拢 1 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/UrgotW.png`, rarity: "UNCOMMON" },
  "ViktorQ": { id: "ViktorQ", hero: "Viktor", name: "茅聭鲁盲禄聥氓聶潞忙聺聻卯聞聜脨漏", price: 40, type: "ATTACK", cost: 0, value: 3, block: 3, description: "茅聳芦莽聤鲁氓聻職 3 茅聬聬茅聙聸忙驴聙莽聙鹿莽颅鹿莽麓聺茅聭戮氓鲁掳莽路卤 3 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢?, img: `${SPELL_URL}/ViktorPowerTransfer.png`, rarity: "COMMON" },
  "ViktorE": { id: "ViktorE", hero: "Viktor", name: "氓搂聺猫庐鲁茅陋赂莽聛聫氓聥颅氓職聨", price: 100, type: "ATTACK", cost: 2, value: 18, description: "茅聳芦莽聤鲁氓聻職 18 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/ViktorDeathRay.png`, rarity: "UNCOMMON" },

  // 茅聫聜忙聺驴氓聛聧忙戮露氓聸陋氓芦鲁茅聴聠氓聥卢氓娄搂茅聭鲁?(Placeholder icons until updated)
  "RivenQ": { id: "RivenQ", hero: "Riven", name: "茅聨露忙篓录猫聙聝忙露聰氓卢颅氓聻露", price: 50, type: "ATTACK", cost: 0, value: 4, description: "茅聳芦莽聤鲁氓聻職 4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/RivenTriCleave.png`, rarity: "COMMON" },
  "RivenE": { id: "RivenE", hero: "Riven", name: "茅聧聲氓聸搂莽路職茅聬漏忙聺聭氓垄聽", price: 80, type: "SKILL", cost: 1, block: 5, effect: "DRAW", effectValue: 1, description: "茅聭戮氓鲁掳莽路卤 5 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢氓聜聸氓搂聞茅聧聶?1 氓炉庐莽聤碌氓垄聺茅聤聠?, img: `${SPELL_URL}/RivenFeint.png`, rarity: "UNCOMMON" },
  "TwistedFateW": { id: "TwistedFateW", hero: "TwistedFate", name: "茅聳芦氓陇聦氓垄聺", price: 60, type: "SKILL", cost: 1, description: "茅聭戮氓鲁掳莽路卤茅聴聟氓驴聰忙潞聙忙露聯芒聜卢氓炉庐莽聤碌氓颅漏/忙娄聸?茅聮聝忙驴聢氓垄聺 (莽禄聽芒聜卢茅聧聳? 茅聨露?氓炉庐?", effect: "DRAW", effectValue: 2, img: `${SPELL_URL}/PickACard.png`, rarity: "COMMON" },
  "TwistedFateQ": { id: "TwistedFateQ", hero: "TwistedFate", name: "忙露聯氓聸陋氓聟聵茅聬聴?, price: 90, type: "ATTACK", cost: 2, value: 8, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿?(莽录聡茫聜聠忙聲戮莽禄聽芒聜卢茅聧聳忙聽娄猫麓聼茅聧聴忙聸職莽露聥)茅聤聠?, img: `${SPELL_URL}/WildCards.png`, rarity: "COMMON" },
  "LeeSinQ": { id: "LeeSinQ", hero: "LeeSin", name: "忙戮露芒聲聟莽聟露氓篓聣?, price: 50, type: "ATTACK", cost: 1, value: 6, effect: "VULNERABLE", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 6 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?1 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/BlindMonkQOne.png`, rarity: "COMMON" },
  "LeeSinW": { id: "LeeSinW", hero: "LeeSin", name: "茅聳虏忙聢娄忙聦聯莽录聝?, price: 80, type: "SKILL", cost: 1, block: 8, description: "茅聭戮氓鲁掳莽路卤 8 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢?, img: `${SPELL_URL}/BlindMonkWOne.png`, rarity: "UNCOMMON" },
  "VayneQ": { id: "VayneQ", hero: "Vayne", name: "茅聴聜卯聛聢盲录漏莽禄聬盲陆陆卯聺篓", price: 40, type: "ATTACK", cost: 0, value: 4, description: "茅聳芦莽聤鲁氓聻職 4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/VayneTumble.png`, rarity: "COMMON" },
  "VayneE": { id: "VayneE", hero: "Vayne", name: "茅聨颅氓聽聲莽聯聼莽聙鹿芒聙鲁氓聻陆", price: 90, type: "ATTACK", cost: 2, value: 12, effect: "WEAK", effectValue: 2, description: "茅聳芦莽聤鲁氓聻職 12 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?2 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/VayneCondemn.png`, rarity: "UNCOMMON" },
  "TeemoQ": { id: "TeemoQ", hero: "Teemo", name: "茅聭路氓炉赂忙麓赂茅聧職氓聹颅卯聠聞", price: 50, type: "ATTACK", cost: 1, value: 5, effect: "WEAK", effectValue: 2, description: "茅聳芦莽聤鲁氓聻職 5 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?2 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/BlindingDart.png`, rarity: "COMMON" },
  "TeemoR": { id: "TeemoR", hero: "Teemo", name: "莽禄聣氓露聢忙搂聲茅聭驴?, price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 4, exhaust: true, description: "莽录聛忙卢聨莽掳拢 4 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢氓聜聸莽搂路茅聭掳忙陇录芒聜卢?, img: `${SPELL_URL}/TeemoRCast.png`, rarity: "UNCOMMON" },
  "ZedQ": { id: "ZedQ", hero: "Zed", name: "猫陇掳氓聧聻茫聜楼忙露聰氓陇聸莽麓聮莽聮聡莽篓驴氓聻聣", price: 50, type: "ATTACK", cost: 1, value: 8, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/ZedQ.png`, rarity: "COMMON" },
  "ZedE": { id: "ZedE", hero: "Zed", name: "猫陇掳氓聧聻茫聜楼忙露聰氓陇聸莽麓聮忙楼聺氓聟录忙聼聙", price: 80, type: "ATTACK", cost: 1, value: 4, effect: "DRAW", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聸氓搂聞茅聧聶?1 氓炉庐莽聤碌氓垄聺茅聤聠?, img: `${SPELL_URL}/ZedE.png`, rarity: "UNCOMMON" },
  "NasusQ": { id: "NasusQ", hero: "Nasus", name: "氓搂鹿忙聼楼莽聯聤茅聬楼忙露聵氓職庐", price: 50, type: "ATTACK", cost: 1, value: 6, description: "茅聳芦莽聤鲁氓聻職 6 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/NasusQ.png`, rarity: "COMMON" },
  "NasusW": { id: "NasusW", hero: "Nasus", name: "茅聫聥卯聢聺忙聜聴", price: 80, type: "SKILL", cost: 1, effect: "WEAK", effectValue: 3, description: "莽录聛忙卢聨莽掳拢 3 莽聛聻氓聜聺忙芦聞氓炉庐盲戮驴芒聜卢?, img: `${SPELL_URL}/NasusW.png`, rarity: "UNCOMMON" },
  "IreliaQ": { id: "IreliaQ", hero: "Irelia", name: "茅聧聮芒聲聛氓聻聣茅聧聬忙聫聮氓職庐", price: 50, type: "ATTACK", cost: 1, value: 8, description: "茅聳芦莽聤鲁氓聻職 8 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/IreliaQ.png`, rarity: "COMMON" },
  "IreliaE": { id: "IreliaE", hero: "Irelia", name: "氓搂拢忙聴聜猫聙聝茅聧聶氓卤陆氓聻聣", price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 2, description: "莽录聛忙卢聨莽掳拢 2 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/IreliaE.png`, rarity: "UNCOMMON" },
  "ThreshQ": { id: "ThreshQ", hero: "Thresh_Hero", name: "氓搂聺猫庐鲁茅陋赂茅聧聮茫聜聟氓聳聟", price: 80, type: "ATTACK", cost: 2, value: 10, effect: "VULNERABLE", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 10 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聹莽虏掳忙碌聹?1 莽聛聻氓聜聸忙搂聴忙碌录茫聜聝芒聜卢?, img: `${SPELL_URL}/ThreshQ.png`, rarity: "COMMON" },
  "ThreshW": { id: "ThreshW", hero: "Thresh_Hero", name: "忙娄聞氓聜職莽麓漏忙露聰氓卢卢盲录聟", price: 70, type: "SKILL", cost: 1, block: 10, effect: "DRAW", effectValue: 1, description: "茅聭戮氓鲁掳莽路卤 10 茅聬聬猫搂聞氓搂垄茅聬垄氓卤聜芒聜卢氓聜聸氓搂聞茅聧聶?1 氓炉庐莽聤碌氓垄聺茅聤聠?, img: `${SPELL_URL}/ThreshW.png`, rarity: "UNCOMMON" },
  "KatarinaQ": { id: "KatarinaQ", hero: "Katarina_Hero", name: "氓炉庐莽聭掳莽職聽忙露聰氓卢陋氓聻聣", price: 50, type: "ATTACK", cost: 1, value: 4, isMultiHit: true, hits: 3, description: "茅聳芦莽聤鲁氓聻職 3 氓篓聠?4 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢?, img: `${SPELL_URL}/KatarinaQ.png`, rarity: "COMMON" },
  "KatarinaE": { id: "KatarinaE", hero: "Katarina_Hero", name: "茅聬卢卯聞聛卯聞聻", price: 40, type: "ATTACK", cost: 0, value: 3, effect: "DRAW", effectValue: 1, description: "茅聳芦莽聤鲁氓聻職 3 茅聬聬茅聙聸忙驴聙莽聙鹿莽聜陆芒聜卢氓聜聸氓搂聞茅聧聶?1 氓炉庐莽聤碌氓垄聺茅聤聠?, img: `${SPELL_URL}/KatarinaE.png`, rarity: "UNCOMMON" },
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
      // 茅聴聞氓露聞莽露聠茅聫聙猫炉虏氓職庐茅聧聰?0%茅聰聸忙掳卢氓赂芦茅聫聣?floorIndex * 2茅聰聸氓虏聙氓鹿聡茅聧娄茫聞娄忙聲录忙露聯?floorIndex * 1茅聰聸氓卤陆猫聥聼忙露聯忙聴聙忙職拢忙碌拢忙聮禄忙陋路忙碌拢?0%
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
    // Rest茅聧聶卯聛聞忙鹿陋莽禄聴?莽聛聻氓聜娄莽麓聶Boss茅聧聯氓露聫莽麓職茅聧聭猫聶鹿氓鹿聡茅聰聸氓卤录莽卢聳茅聧聶卯聛聟忙鹿聛10%氓搂聮氓聜聹氓路录
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
  // 莽禄聴?莽聛聻氓聜職忙碌聬莽聙鹿忙掳芦猫麓聼REST茅聰聸氓聹聰oss茅聧聯氓露聫莽麓職
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
                {relic.charges !== undefined && <div className="text-xs text-red-400 mt-1">茅聧聯芒聲聙莽露聭氓篓聠芒聞聝忙職聼: {relic.charges}</div>}
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
            audioRef.current.load(); // 茅聳虏氓露聠忙聼聤茅聧聰莽聤潞忙碌聡茅聴聤忙聤陆卯聲露
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
        <div className="text-[#C8AA6E] font-serif text-2xl mb-8">莽禄聴?{act} 莽禄聰?/div>
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
                      {isCompleted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[#C8AA6E] text-4xl font-bold">茅聣聛?/span></div>}
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

const ShopView = ({ onLeave, onBuyCard, onBuyRelic, gold, deck, relics, championName }) => {
    const cardStock = useMemo(() => shuffle(Object.values(CARD_DATABASE).filter(c => c.rarity !== 'BASIC' && (c.hero === 'Neutral' || c.hero === championName))).slice(0, 5), [championName]);
    const relicStock = useMemo(() => Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)).slice(0, 3), [relics]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const handleBuy = (item, type) => { if (gold >= item.price && !purchasedItems.includes(item.id)) { setPurchasedItems([...purchasedItems, item.id]); if (type === 'CARD') onBuyCard(item); if (type === 'RELIC') onBuyRelic(item); } };
    return (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-6xl px-10 py-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#C8AA6E] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#C8AA6E] overflow-hidden bg-black"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                        <div><h2 className="text-3xl font-bold text-[#C8AA6E]">忙娄聸忙聢聺莽芦露茅聧聼氓聴聲忙卤聣</h2><p className="text-[#A09B8C] italic">"茅聧聶卯聛聡卯聸娄莽录聛忙卢聯忙聦露茅聰聸氓卤录莽虏聢忙露聰氓聽楼氓聟聵茅聧聴忙聽楼芒聜卢?</p></div>
                        </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600"><Coins size={32} /> {gold}</div>
                        </div>
                <div className="grid grid-cols-2 gap-12 flex-1 overflow-y-auto">
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-blue-500 pl-3">茅聨露芒聜卢茅聭鲁猫聴聣氓碌聨忙聺聻?/h3>
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
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-purple-500 pl-3">氓篓麓氓鲁掳氓聨聽茅聫聜卯聢聺卯聴聤忙戮露?/h3>
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
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30"><button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">莽禄聜猫炉虏莽麓聭 <ChevronRight /></button></div>
            </div>
        </div>
    )
}

const ChestView = ({ onLeave, onRelicReward, relics, act }) => {
    // 茅聫聧猫搂聞氓碌聛猫陇掳忙聮鲁氓垄聽莽禄聰莽聤潞氓娄颅忙聺漏氓聸篓忙聤陇茅聳卢忙楼聝氓垄驴茅聰聸忙卢掳CT1茅聧聶卯聛聡氓聟聵茅聭戮氓鲁掳莽路卤茅聳芦忙掳卤忙聲陇茅聳卢忙楼聝氓垄驴茅聰聸氓颅聣CT2茅聧聶卯聢聶盲潞聮茅聭戮氓鲁掳莽路卤ACT1+ACT2茅聰聸氓颅聣CT3茅聧聶卯聢聶盲潞聮茅聭戮氓鲁掳莽路卤茅聨碌芒聜卢茅聫聢?
    const availableRelics = Object.values(RELIC_DATABASE).filter(r => {
        if (r.rarity === 'PASSIVE' || r.rarity === 'BASIC' || relics.includes(r.id)) return false;
        // 莽禄聰莽聤潞氓娄颅忙露聯忙聮鲁莽聺聵茅聳卢忙楼聝氓垄驴氓娄芦芒聜卢茅聫聦?
        if (r.id === 'Cull' || r.id === 'DarkSeal') return act === 1; // ACT1忙露聯忙聮鲁莽聺聵
        if (r.id === 'QSS' || r.id === 'Executioner') return act >= 2; // ACT2忙露聯忙聮鲁莽聺聵
        if (r.id === 'Nashor') return act >= 3; // ACT3忙露聯忙聮鲁莽聺聵
        return true; // 茅聳芦忙掳卤忙聲陇茅聳卢忙楼聝氓垄驴茅聨碌芒聜卢茅聫聢氓陇聦莽聫路茅聭潞氓聜聻氓聟聵茅聧聶卯聢聶盲潞聮茅聭戮氓鲁掳莽路卤
    });
    const rewards = useMemo(() => shuffle(availableRelics).slice(0, 3), [relics, act]);
    const [rewardChosen, setRewardChosen] = useState(false);
    const handleChoose = (relic) => { if (rewardChosen) return; setRewardChosen(true); onRelicReward(relic); };
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative z-10 max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden bg-black flex items-center justify-center"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">氓篓麓氓鲁掳氓聨聽茅聫聜卯聢職莽聳聜莽禄聽?/h2>
                <p className="text-[#F0E6D2] text-lg mb-8">茅聨碌忙聮鲁莽麓聭莽聙鹿忙驴聢卯聠聢茅聰聸氓虏聞芒聜卢氓陇聥氓芦篓忙露聯芒聜卢忙碌聽猫路潞氓路卤忙戮露脩聟忙庐聭莽聭聛氓聭颅卯聵卢茅聫聣茫聝娄卯聞聼莽聭聛氓聭掳氓職聹氓庐赂盲戮驴芒聜卢?/p>
                <div className="flex justify-center gap-8">
                    {rewards.map((relic) => (
                        <div key={relic.id} onClick={() => handleChoose(relic)} className={`w-36 relative group transition-all p-4 rounded-lg border-2 ${rewardChosen ? 'opacity-40 pointer-events-none' : 'hover:scale-110 cursor-pointer border-[#C8AA6E] shadow-xl hover:shadow-[0_0_20px_#C8AA6E]'}`}>
                            <img src={relic.img} className="w-full h-auto object-cover rounded-lg" />
                            <div className="font-bold text-[#F0E6D2] mt-3">{relic.name}</div>
                            <div className="text-xs text-[#A09B8C] mt-1">{relic.description}</div>
                            {rewardChosen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-3xl font-bold text-green-400">氓庐赂忙聼楼芒聜卢?/div>}
                        </div>
                    ))}
                </div>
                <button onClick={onLeave} className="mt-8 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest" disabled={!rewardChosen}>茅聧聫忙聤陆忙拢麓莽聙鹿忙驴聢卯聠聢</button>
            </div>
        </div>
    );
};

const EventView = ({ onLeave, onReward }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#0AC8B9]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden"><img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">莽禄聛莽聜碌卯聺聺忙路聡芒聙鲁氓陆驴</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">忙碌拢莽聤虏忙鹿陋茅聭陆氓陇聣莽卢隆忙露聯卯聟聻氓陆聜茅聬聹茅垄聛莽掳隆忙露聯芒聜卢忙露聯卯聛聢盲禄聬茅聮聙莽聲聦忙庐聭莽聙鹿氓聽聺氓麓录茅聬陋莽隆路莽麓聺茅聫聝盲陆陆莽芦聼忙碌录茅聴麓莽庐庐忙聺漏忙篓禄忙職聨茅聮聙莽聲聦忙陆聝忙露聯芒聜卢忙碌聹忙露職氓垄驴莽聮搂?..</p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div><div><div className="font-bold text-[#F0E6D2]">莽聮聛卯聟聽莽虏聦</div><div className="text-sm text-slate-400">氓搂聵茅聲聬莽庐聶茅聭戮氓鲁掳莽路卤 <span className="text-red-400">+2 茅聧聰忙露垄氓聶潞</span></div></div></button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div><div><div className="font-bold text-[#F0E6D2]">茅聨录忙禄聝卯聡掳</div><div className="text-sm text-slate-400">茅聭戮氓鲁掳莽路卤忙露聯芒聜卢忙碌聽?<span className="text-purple-400">茅聴聟氓驴聰忙潞聙莽聭聛氓聭颅卯聵卢</span></div></div></button>
            </div>
        </div>
    </div>
);

const RewardView = ({ onSkip, onCardSelect, goldReward, championName }) => {
  const rewards = useMemo(() => { const all = Object.values(CARD_DATABASE).filter(c => c.rarity!=='BASIC'&&c.rarity!=='PASSIVE'&&(c.hero==='Neutral'||c.hero===championName)); return shuffle(all).slice(0,3); }, [championName]);
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
        <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">忙驴聜忙聽搂氓搂鲁</h2>
        <div className="text-2xl text-yellow-400 mb-8 flex items-center justify-center gap-2">
          <Coins size={28} className="text-yellow-400" />
          <span>茅聳虏忙聢聺莽芦碌 +{goldReward}</span>
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
        <button onClick={onSkip} className="mt-6 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest transition-all">莽聮潞氓庐聽莽鹿聝</button>
      </div>
    </div>
  );
};

const RestView = ({ onRest }) => (
    <div className="absolute inset-0 z-50 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col gap-8 text-center items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#0AC8B9] overflow-hidden bg-black shadow-[0_0_50px_#0AC8B9]"><img src={`${ITEM_URL}/2003.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-5xl font-serif text-[#0AC8B9] drop-shadow-[0_0_10px_#0AC8B9]">氓篓聣氓陇聥忙聦聣茅聨虏芒聲聜盲录聟</h2>
            <button onClick={onRest} className="group w-64 h-80 bg-slate-900/80 border-2 border-[#0AC8B9] rounded-xl flex flex-col items-center justify-center hover:bg-[#0AC8B9]/20 transition-all cursor-pointer">
                <Heart size={64} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">茅聧楼莽聜虏卯聵虏</h3>
                <p className="text-[#0AC8B9]">茅聧楼莽聜虏卯聵虏 30% 茅聬垄莽聠路忙聡隆茅聧聤?/p>
            </button>
        </div>
    </div>
);

// --- 忙露聯猫聧陇莽虏聧忙碌聽?---

export default function LegendsOfTheSpire() {
  const [view, setView] = useState('MENU'); 
  const [mapData, setMapData] = useState({ grid: [], nodes: [], nodeMap: new Map() });
  const [currentFloor, setCurrentFloor] = useState(0);
  const [currentAct, setCurrentAct] = useState(1);
  const [masterDeck, setMasterDeck] = useState([]);
  const [champion, setChampion] = useState(null); 
  const [currentHp, setCurrentHp] = useState(80);
  const [maxHp, setMaxHp] = useState(80);
  const [gold, setGold] = useState(100);
  const [relics, setRelics] = useState([]);
  const [baseStr, setBaseStr] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [usedEnemies, setUsedEnemies] = useState([]); 
  const [showCodex, setShowCodex] = useState(false); 
  const [showDeck, setShowDeck] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lockedChoices, setLockedChoices] = useState(new Set()); // 忙露聯氓陇聬芒聜卢氓陇聣莽芦麓茅聰聸忙掳卢氓聡隆茅聳驴盲陆赂莽聲戮茅聬篓氓聥炉芒聜卢氓陇聬茫聙聧
  
  const [unlockedChamps, setUnlockedChamps] = useState(() => { 
      try { 
          const d = localStorage.getItem(UNLOCK_KEY); 
          if (!d) return Object.keys(CHAMPION_POOL);
          
          let saved = JSON.parse(d);
          // 忙路聡卯聠录卯聵虏茅聫聝脩聟氓垄聴茅聫聢卯聞聜忙庐聭ID (Thresh_Hero -> Thresh, Katarina_Hero -> Katarina)
          saved = saved.map(id => {
              if (id === 'Thresh_Hero') return 'Thresh';
              if (id === 'Katarina_Hero') return 'Katarina';
              return id;
          });
          return saved;
      } catch { 
          return Object.keys(CHAMPION_POOL); 
      } 
  });
  const [hasSave, setHasSave] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(() => {
      const lastVersion = localStorage.getItem('last_version');
      return lastVersion !== 'v0.8.0';
  });
  const [bgmStarted, setBgmStarted] = useState(false);

  useEffect(() => { const savedData = localStorage.getItem(SAVE_KEY); if (savedData) setHasSave(true); }, []);

  useEffect(() => {
      if (view !== 'MENU' && view !== 'CHAMPION_SELECT' && view !== 'GAMEOVER' && view !== 'VICTORY_ALL') {
          // 忙聬麓氓驴聯氓聻陋茅聧聳?mapData茅聰聸氓卤陆莽職垄 Map 忙聺聻卯聞聛氓麓虏忙露聯莽聝聵忙芦聵茅聳芦忙掳卢卯聡庐莽聮聻芒聙虏盲潞聮忙赂職?JSON.stringify
          const serializableMapData = {
              ...mapData,
              nodeMap: mapData.nodeMap instanceof Map 
                  ? Object.fromEntries(mapData.nodeMap) 
                  : mapData.nodeMap
          };
          localStorage.setItem(SAVE_KEY, JSON.stringify({ view, mapData: serializableMapData, currentFloor, currentAct, masterDeck, champion, currentHp, maxHp, gold, relics, baseStr, activeNode, usedEnemies }));
      }
  }, [view, currentHp, gold, currentFloor, currentAct]);

  const handleContinue = async () => {
      await unlockAudio(); // 莽聭聶茂陆聣忙聰拢茅聴聤忙聤陆卯聲露
      const s = localStorage.getItem(SAVE_KEY);
      if (s) {
          const data = JSON.parse(s);
          // 茅聨颅茫聢聽卯聵虏 nodeMap茅聰聸忙掳卢卯聸搂茅聫聥忙禄聝莽聲聽茅聫聞卯聢聸忙芦聵茅聳芦忙掳卢卯聡庐莽聮聻芒聵聟莽麓聺忙聺聻卯聞聛氓麓虏忙露聯?Map
          const restoredMapData = { ...data.mapData };
          if (restoredMapData.nodeMap && !(restoredMapData.nodeMap instanceof Map)) {
              // 忙驴隆氓聜聸莽聛聣 nodeMap 茅聫聞卯聢聸忙芦聵茅聳芦忙掳卢卯聡庐莽聮聻芒聵聟莽麓聺忙聺聻卯聞聛氓麓虏忙露聯?Map
              restoredMapData.nodeMap = new Map(Object.entries(restoredMapData.nodeMap));
          } else if (!restoredMapData.nodeMap) {
              // 忙驴隆氓聜聸莽聛聣 nodeMap 忙露聯氓露聟莽聯篓茅聧娄卯聼聮莽麓聺茅聧聮忙露聵莽录聯茅聫聜忙聣庐忙庐聭 Map
              restoredMapData.nodeMap = new Map();
          }
          setBgmStarted(true); // 莽禄聰氓卢陋氓碌聠茅聧職卯聢職氓搂漏BGM
          setMapData(restoredMapData); setCurrentFloor(data.currentFloor); setCurrentAct(data.currentAct || 1); setMasterDeck(data.masterDeck); setChampion(data.champion); setCurrentHp(data.currentHp); setMaxHp(data.maxHp); setGold(data.gold); setRelics(data.relics); setBaseStr(data.baseStr); setActiveNode(data.activeNode); setUsedEnemies(data.usedEnemies); setView(data.view);
      }
  };

  const handleNewGame = async () => { 
      await unlockAudio(); // 莽聭聶茂陆聣忙聰拢茅聴聤忙聤陆卯聲露
      localStorage.removeItem(SAVE_KEY); 
      setHasSave(false); 
      setBgmStarted(true); // 莽禄聰氓卢陋氓碌聠茅聧職卯聢職氓搂漏BGM
      setView('CHAMPION_SELECT'); 
  };

  const handleChampionSelect = (selectedChamp) => {
    // 茅聨戮卯聟聼忙聳聛茅聭禄茅聛聧忙鲁聼莽聮聡卯聟垄莽聟露
    playChampionVoice(selectedChamp.id);
    setChampion(selectedChamp); 
    setMaxHp(selectedChamp.maxHp); 
    setCurrentHp(selectedChamp.maxHp);
    setMasterDeck([...STARTING_DECK_BASIC, ...selectedChamp.initialCards]);
    setRelics([RELIC_DATABASE[selectedChamp.relicId].id]);
    setBaseStr(0);
    setGold(0);
    
    // 忙碌拢猫路篓忙聲陇v4茅聧娄忙聺驴忙碌聵茅聬垄莽聠赂氓聻職茅聧拢卯聼聮莽麓聶莽聰炉茂赂陆卯聞麓茅聭鲁芒聙鲁忙聜聯氓娄芦芒聜卢氓篓麓氓卢陋忙聥掳忙露聯氓陇聬芒聜卢氓陇聣莽芦麓茅聫聢氓聯聞氓聼聴茅聰聸?
    const newMapData = generateGridMap(1, []); // act=1, usedEnemies=[]
    setMapData(newMapData);
    
    // 莽聮聛氓聣搂莽聳聠茅聧聮忙驴聠卯聺聬activeNode忙露聯莽掳聤tartNode
    if (newMapData.startNode) {
      setActiveNode(newMapData.startNode);
    }
    
    setCurrentFloor(0); 
    setCurrentAct(1); 
    setUsedEnemies([]);
    setLockedChoices(new Set()); // 氓篓聯氓聭炉芒聰聳茅聳驴盲陆赂莽聲戮茅聳芦氓陇聬茫聙聧
    setView('MAP');
  };

  const completeNode = () => {
      if (!activeNode || !mapData || !mapData.nodes) return;
      
      // v4茅聭路卯聛聠忙聲卤茅聨潞茫聢垄氓聜篓莽禄炉猫聧陇莽虏潞茅聰聸忙掳颅莽聢拢莽聮聛忙聺驴莽露聥茅聧聯氓露聢氓娄颅茅聬聬茅聙聸猫麓聼氓庐赂氓聫聣氓赂掳莽禄卤?
      const newNodes = [...mapData.nodes];
      const idx = newNodes.findIndex(n => n.row === activeNode.row && n.col === activeNode.col);
      if (idx === -1) return;
      
      // 茅聫聧氓聸陋卯聠聡忙露聯氓聯聞氓聡隆茅聨潞茫聢垄氓聜篓茅聰聸氓聽聹莽卢聣茅聧聬氓露聞氓篓聡茅聬垄芒聲炉tatus茅聰聸氓卤录氓篓聡茅聬垄芒聲隆xplored莽聛聻莽聜麓芒聜卢脩聧莽麓職
      newNodes[idx].explored = true;
      newNodes[idx].status = 'COMPLETED';
      
      // 茅聫聡氓颅聵忙聼聤mapData茅聰聸氓聽聹莽鹿職茅聨赂盲鹿卢rid茅聧聹氓庐炉odes茅聧職氓卤戮卯聞聻茅聰聸?
      const newGrid = mapData.grid ? mapData.grid.map(row => [...row]) : [];
      newNodes.forEach(node => {
        if (newGrid[node.row] && newGrid[node.row][node.col]) {
          newGrid[node.row][node.col] = node;
        }
      });
      
      setMapData({ ...mapData, grid: newGrid, nodes: newNodes });
      
      // 氓篓聣茫聞娄氓聣掳茅聰聸忙掳芦莽卢聣氓篓聯氓聭炉芒聰聳茅聳驴盲陆赂莽聲戮茅聳芦氓陇聬茫聙聧茅聰聸氓虏聞忙聰拢莽聙鹿忙掳卤忙庐聭茅聳芦氓陇聬茫聙聧忙聬麓忙聴聡卯聡職氓搂聵茅聲聬莽庐聶茅聳驴盲陆赂莽聲戮
      // 茅聧聶卯聛聟忙鹿聛茅聧娄茫聞搂脨漏茅聧聰茫聞楼氓聼聦茅聫聜忙聥聦氓娄颅茅聬聬猫搂聞忙陇聜茅聰聸氓卤戮氓垄聽忙碌录忙掳露氓聶赂茅聫聜忙聥聦卯聟赂莽禄聽忙楼聙氓陆虏茅聬垄茫聞漏芒聜卢氓陇聬茫聙聧茅聰聸氓聽聹莽碌戮氓庐赂忙聼楼忙聰拢莽聙鹿忙掳卤忙庐聭茅聳芦氓陇聬茫聙聧忙碌聽氓露聡氓聤搂茅聳驴盲陆赂莽聲戮茅聰聸?
      
      // 氓娄芦芒聜卢茅聫聦茫聝娄忙搂赂茅聧職茂鹿聙氓聼聦忙聺聢莽露聸OSS
      if (activeNode.type === 'BOSS') {
          // 莽禄聰莽聤潞氓娄颅茅聳芦忙掳卢氓聫搂茅聳芦忙聵聫莽路芦
          if (currentAct < 3) {
              const nextAct = currentAct + 1;
              setCurrentAct(nextAct);
              setCurrentFloor(0);
              const nextMapData = generateGridMap(nextAct, []); // v4茅聬垄莽聠赂氓聻職茅聧拢?
              setMapData(nextMapData);
              if (nextMapData.startNode) {
                setActiveNode(nextMapData.startNode);
              }
              // 氓篓聯氓聭炉芒聰聳茅聳驴盲陆赂莽聲戮茅聳芦氓陇聬茫聙聧
              setLockedChoices(new Set());
              // 莽禄聰莽聤潞氓娄颅忙驴聜忙聽搂氓搂鲁茅聰聸忙掳卢忙麓聳忙戮露?50% 茅聬垄莽聠路忙聡隆
              setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.5)));
              alert(`莽禄聴?${currentAct} 莽禄聰莽聤禄芒聜卢忙掳卢氓聫搂茅聰聸盲陆陆莽鹿聵茅聧聫茫聝陇莽卢聟忙露聯芒聜卢莽禄聰?..`);
              setView('MAP');
          } else {
              // 氓篓聯氓聭聤氓聻聶茅聳芦忙掳卢氓聫搂
              const allIds = Object.keys(CHAMPION_POOL);
              const locked = allIds.filter(id => !unlockedChamps.includes(id));
              if (locked.length > 0) {
                  const newUnlock = locked[Math.floor(Math.random() * locked.length)];
                  const updated = [...unlockedChamps, newUnlock];
                  setUnlockedChamps(updated);
                  localStorage.setItem(UNLOCK_KEY, JSON.stringify(updated));
                  alert(`茅聨颅卯聟聻忙聻漏茅聳芦忙掳卢氓聫搂茅聰聸盲陆鹿忙聼聤茅聭禄茅聛聧忙鲁聼莽聭聶茂陆聣忙聰拢: ${CHAMPION_POOL[newUnlock].name}`);
              }
              localStorage.removeItem(SAVE_KEY);
              setView('VICTORY_ALL'); 
          }
      } else {
          // 莽录聛脩聟莽聰禄茅聨潞茫聢垄氓聜篓茅聰聸氓虏聝莽鹿聭茅聧楼莽聜虏忙鹿麓茅聧楼忙聧聬卯聺聥茅聧楼?
          setView('MAP');
      }
  };
  
  const handleNodeSelect = (node) => {
      // v4茅聭路卯聛聠忙聲卤茅聨潞茫聢垄氓聜篓莽禄炉猫聧陇莽虏潞茅聰聸忙掳卢莽聠聙忙碌聹氓潞隆氓聫職忙聺聢莽聭掳猫聢掳茅聳颅莽禄聵氓赂麓莽聭聶氓聥芦氓聻炉茅聰聸氓卤录莽卢聣忙赂職忙驴聤莽娄聠DAG
      // 忙露聯氓陇聬芒聜卢氓陇聣莽芦麓茅聫聢氓聯聞氓聼聴茅聰聸忙掳卢莽露聥茅聬聹芒聲聛卯聠聧茅聳芦氓陇聥氓芦篓忙露聯芒聜卢忙露聯卯聛聡氓娄颅茅聬聬莽聭掳忙聜聴茅聰聸氓虏聞忙聰拢莽聙鹿忙掳卢氓聫戮忙碌聽忙聽颅芒聜卢氓陇聬茫聙聧
      
      if (!activeNode) {
          // 莽聮搂茅拢聨氓聛拢茅聰聸忙掳卢氓陆搂茅聭鲁盲禄聥芒聜卢氓陇聥氓芦篓莽聮搂茅拢聨氓聛拢茅聫聢卯聞聝茅聼漏
          if (node.row !== mapData.startNode?.row || node.col !== mapData.startNode?.col) return;
      } else {
          // 氓娄芦芒聜卢茅聫聦茫聝篓氓娄颅茅聬聬猫搂聞忙搂赂茅聧職茂鹿聙忙鹿陋氓庐赂忙聼楼忙聰拢莽聙鹿忙掳卤忙庐聭茅聳芦氓陇聬茫聙聧忙露聯?
          const nodeKey = `${node.row}-${node.col}`;
          if (lockedChoices.has(nodeKey)) {
              return; // 氓庐赂忙聼楼忙聰拢莽聙鹿忙掳卤忙庐聭茅聳芦氓陇聬茫聙聧忙露聯氓露聢氓聟聵茅聳芦氓陇聥氓芦篓
          }
          
          // 茅聭戮氓鲁掳氓陆聡猫陇掳忙聮鲁氓垄聽茅聭潞氓聜聹氓聛拢茅聬篓氓聥卢氓垄聧茅聫聢氓陇聥忙鹿颅茅聨潞茫聢垄氓聜篓茅聳颅猫炉虏莽聹鲁茅聰聸氓聽聼氓赂聯茅聴聞茫聜聟氓聡隆茅聳驴盲陆赂莽聲戮茅聬篓氓聥炉芒聜卢氓陇聬茫聙聧茅聰聸?
          const neighbors = getHexNeighbors(activeNode.row, activeNode.col, mapData.totalFloors || 10, mapData.grid?.[0]?.length || 11);
          const availableNeighbors = neighbors
              .map(([r, c]) => mapData.grid?.[r]?.[c])
              .filter(n => {
                  if (!n || n.explored) return false;
                  // 茅聨潞忙聨聴忙芦聨氓庐赂忙聼楼忙聰拢莽聙鹿忙掳卤忙庐聭茅聳芦氓陇聬茫聙聧
                  const nKey = `${n.row}-${n.col}`;
                  if (lockedChoices.has(nKey)) return false;
                  return true;
              });
          
          // 氓娄芦芒聜卢茅聫聦茫聝漏芒聜卢氓陇聥氓芦篓茅聬篓氓聥庐氓娄颅茅聬聬猫搂聞忙搂赂茅聧職茂赂陆忙搂赂茅聧聶卯聢聹忙聲陇茅聳颅猫炉虏莽聹鲁
          const isNeighbor = availableNeighbors.some(n => n.row === node.row && n.col === node.col);
          if (!isNeighbor) {
              return; // 忙露聯氓露聠忙搂赂茅聧聶卯聢聹忙聲陇茅聳颅猫炉虏莽聹鲁茅聰聸氓卤录莽卢聣茅聭鲁盲禄聥芒聜卢氓陇聥氓芦篓
          }
          
          // 茅聤聠忙聞卢氓聫搂茅聳驴卯聠禄忙聟篓忙戮露氓露聝芒聜卢忙聢聹莽卢聛茅聳芦氓陇聣莽芦麓茅聳驴盲陆赂莽聲戮茅聳芦忙聵聫莽路芦茅聰聸忙掳卢氓陆搂茅聳驴盲陆赂莽聲戮UI莽聙鹿莽聜潞忙陋炉茅聫聞氓聣搂茫聛職茅聬篓?忙露聯卯聛聢芒聜卢氓陇聬茫聙聧忙露聯卯聟聽忙庐聭茅聫聢卯聛聢芒聜卢氓陇聥氓芦篓茅聳芦氓陇聬茫聙聧
          // 猫鹿聡氓聭麓茫聙聫忙露聯氓露篓ridMapView_v3.jsx茅聬篓氓聢搂etAvailableNodes()茅聳芦忙聵聫莽路芦莽聙鹿氓卤陆氓聫聫忙露聯芒聜卢茅聭路?
          let displayedChoices = availableNeighbors;
          if (availableNeighbors.length > 3) {
              // 忙碌拢猫路篓忙聲陇忙露聯氓露露I茅聬漏莽篓驴忙聜聯茅聬篓氓聥卢氓赂聯忙聬麓氓驴聯忙聥掳茅聧聺氓聽聺莽卢聡茅聳芦忙聵聫莽路芦
              const sorted = [...availableNeighbors].sort((a, b) => {
                  const seedA = `${a.row}-${a.col}`;
                  const seedB = `${b.row}-${b.col}`;
                  return seedA.localeCompare(seedB);
              });
              const hash = (activeNode.row * 1000 + activeNode.col) % sorted.length;
              displayedChoices = [];
              for (let i = 0; i < 3; i++) {
                  displayedChoices.push(sorted[(hash + i) % sorted.length]);
              }
          }
          
          // 茅聧聶卯聛聢忙聰拢莽聙鹿忙颅聨I茅聫聞氓聣搂茫聛職茅聬篓?忙露聯卯聛聢芒聜卢氓陇聬茫聙聧忙露聯卯聟聽忙庐聭茅聫聢卯聛聢芒聜卢氓陇聥氓芦篓茅聳芦氓陇聬茫聙聧
          const newLockedChoices = new Set(lockedChoices);
          displayedChoices.forEach(n => {
              if (n.row !== node.row || n.col !== node.col) {
                  newLockedChoices.add(`${n.row}-${n.col}`);
              }
          });
          setLockedChoices(newLockedChoices);
      }
      
      setActiveNode(node);
      setCurrentFloor(node.row);
      
      switch(node.type) {
          case 'BATTLE': case 'BOSS': setView('COMBAT'); break;
          case 'REST': setView('REST'); break;
          case 'SHOP': setView('SHOP'); break;
          case 'EVENT': setView('EVENT'); break;
          case 'CHEST': setView('CHEST'); break;
          default: break;
      }
  };

  // Toast茅聳芦忙掳卤莽聟隆莽禄炉猫聧陇莽虏潞
  const showToast = (message, type = 'default') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const handleBattleWin = (battleResult) => { 
      // 忙戮露氓聥颅忙聜聤茅聨麓忙篓禄忙聻聼莽录聛忙聮麓莽聛聣茅聰聸氓聽聺氓陆虏茅聭鲁猫聤楼忙搂赂茅聫聝脩聞莽聣赂氓炉庐氓驴聲忙庐聭remainingHp茅聫聛忙聺驴莽聯搂茅聰聸氓卤录莽炉聝茅聧聶卯聢聺氓聟聵茅聫聞卯聢聸忙聼聤茅聫聧莽聟聨莽麓隆茅聬篓氓聥芦卯聡庐莽聮聻芒聵聟莽麓職
      const result = typeof battleResult === 'number' 
          ? { finalHp: battleResult, gainedStr: 0, gainedMaxHp: 0 }
          : battleResult;
      
      console.log('[茅聨麓忙篓禄忙聻聼茅聭鲁忙禄聝氓聼聞] battleResult:', result); // 莽聮聥氓聠颅莽聵炉茅聫聝茫聝楼莽鹿聰
      console.log('[猫陇掳忙聮鲁氓垄聽莽聛聻莽聜麓芒聜卢卯聹拢 baseStr:', baseStr, 'maxHp:', maxHp); // 莽聮聥氓聠颅莽聵炉茅聫聝茫聝楼莽鹿聰
      
      // 茅聬漏忙聽娄茅赂隆莽聬職卯聜垄氓搂漏茅聰聸忙掳颅氓聻卢茅聫聜忙楼聝莽虏篓茅聫聣莽聠赂盲禄庐忙戮露氓虏潞P
      let passiveHeal = champion.relicId === "GarenPassive" ? 6 : 0; 
      
      // 茅聧聬氓聭炉忙聠禄茅聫聜卯聢聺卯聺娄茅聧聰卯聼聮莽麓掳莽聛聫氓聴聵氓聻卢茅聫聜忙陇戮猫聟聭茅聭戮氓鲁掳莽路卤茅聬篓氓聥芦氓搂聫茅聳虏氓驴聰忙隆聢忙露聰氓聭颅氓炉虏
      if (result.gainedStr > 0) {
          console.log('[茅聧聬氓聭炉忙聠禄茅聫聜莽聴聦 氓搂聵茅聲聬莽庐聶茅聧聰忙露垄氓聶潞忙戮搂莽聜潞忙職卤:', result.gainedStr, '茅聢芦?, baseStr + result.gainedStr); // 莽聮聥氓聠颅莽聵炉茅聫聝茫聝楼莽鹿聰
          setBaseStr(prev => prev + result.gainedStr);
          showToast(`氓搂聵茅聲聬莽庐聶茅聧聰忙露垄氓聶潞 +${result.gainedStr}`, 'strength');
      }
      
      // 茅聳驴茫聜聡莽聟露莽聬職卯聜垄氓搂漏茅聰聸忙掳颅忙隆聢忙露聰氓聭颅卯聳聝茅聧聰莽聤鲁忙赂露忙戮露脩聟忙聲聯茅聧聸猫聴聣芒聜卢?
      if (result.gainedMaxHp > 0) {
          console.log('[茅聳驴茫聜聡莽聟露] 茅聫聢芒聜卢忙戮露卯聹聨P忙戮搂莽聜潞忙職卤:', result.gainedMaxHp, '茅聢芦?, maxHp + result.gainedMaxHp); // 莽聮聥氓聠颅莽聵炉茅聫聝茫聝楼莽鹿聰
          setMaxHp(prev => prev + result.gainedMaxHp);
          passiveHeal += result.gainedMaxHp; // 茅聫聢芒聜卢忙戮露卯聹聨P忙戮搂莽聜潞忙職卤忙露聰莽聠潞莽聲禄忙碌拢忙禄聞盲禄庐忙戮露?
          showToast(`茅聫聢芒聜卢忙戮露脩聟忙聲聯茅聧聸猫聴聣芒聜卢?+${result.gainedMaxHp}`, 'maxHp');
      }
      
      // 茅聧聴茂录聞氓垄聺忙戮露脩聝莽卢聙莽聬職卯聜垄氓搂漏茅聰聸忙掳颅氓聻卢茅聫聜忙楼聞氓聞篓茅聧聮芒聲聟卯聳聜忙戮露忙聽颅氓聶戮莽聰炉?
      if (champion && champion.relicId === "TwistedFatePassive") {
          console.log('[茅聧聴茂录聞氓垄聺忙戮露脩聝莽卢聙] 茅聭戮氓鲁掳莽路卤忙拢掳忙驴聠卯聵禄茅聳虏忙聢聺莽芦碌: +15'); // 莽聮聥氓聠颅莽聵炉茅聫聝茫聝楼莽鹿聰
          setGold(prev => prev + 15);
          showToast('茅聬聫氓虏聞忙聬庐忙楼聽忙聺驴莽聯聶: +15 茅聳虏忙聢聺莽芦碌', 'gold');
      }
      
      setCurrentHp(Math.min(maxHp + (result.gainedMaxHp || 0), result.finalHp + passiveHeal)); 
      setView('REWARD'); 
  };
  const handleBuyCard = (card) => { setGold(prev => prev - card.price); setMasterDeck(prev => [...prev, card.id]); };
  const handleRelicReward = (relic) => { setRelics(prev => [...prev, relic.id]); if (relic.onPickup) { const ns = relic.onPickup({ maxHp, currentHp }); setMaxHp(ns.maxHp); setCurrentHp(ns.currentHp); } completeNode(); };
  const handleBuyRelic = (relic) => { setGold(prev => prev - relic.price); handleRelicReward(relic); };
  const handleEventReward = (reward) => {
      if (reward.type === 'BUFF' && reward.stat === 'strength') setBaseStr(prev => prev + reward.value);
      if (reward.type === 'RELIC_RANDOM') { const pool = Object.values(RELIC_DATABASE).filter(r => r.rarity !== 'PASSIVE' && !relics.includes(r.id)); if (pool.length > 0) handleRelicReward(shuffle(pool)[0]); } 
      if (reward.type === 'UPGRADE_RANDOM') {
          // 茅聴聟氓驴聰忙潞聙茅聧聴氓聸漏茅陋聡忙露聯芒聜卢氓炉庐莽聤虏氓麓卤
          const upgradableIndices = masterDeck.map((id, idx) => !id.endsWith('+') ? idx : -1).filter(i => i !== -1);
          if (upgradableIndices.length > 0) {
              const randomIdx = upgradableIndices[Math.floor(Math.random() * upgradableIndices.length)];
              const newDeck = [...masterDeck];
              newDeck[randomIdx] = newDeck[randomIdx] + '+';
              setMasterDeck(newDeck);
          }
      }
      completeNode();
  };
  const handleCardReward = (cardId) => { setMasterDeck([...masterDeck, cardId]); setGold(gold + 50); completeNode(); };
  
  const handleUpgradeCard = (cardId) => {
      // 茅聧聴氓聸漏茅陋聡茅聨赂氓聸搂莽聲戮茅聧聴茂录聞氓垄聺茅聰聸氓聽聼氓拢聵茅聧聮忙聣庐卯聝聡忙露聯芒聜卢忙露聯卯聛聞氓掳庐茅聳掳氓露聡忙庐聭茅聫聢卯聛聞氓麓聦莽禄戮脩聟氓垄聴茅聫聢卯聞聤莽麓職
      const idx = masterDeck.findIndex(id => id === cardId);
      if (idx !== -1) {
          const newDeck = [...masterDeck];
          newDeck[idx] = cardId + '+';
          setMasterDeck(newDeck);
          setGold(prev => prev - 100);
      }
  };
  
  const handleBuyMana = () => {
      // 忙戮搂莽聜虏氓搂聻茅聫聢芒聜卢忙戮露脩聞莽隆露茅聧聰忙露聵芒聜卢?(忙聺漏忙卢聯氓聶路茅聴聡芒聜卢莽聭聲?GameState 茅聫聙卯聢聸氓炉聰茅聰聸氓卤戮氓聻篓茅聭掳氓聭炉忙聲卤 Relic 莽聙鹿莽聜碌氓鹿聡茅聰聸氓虏聙莽聲聺茅聧聳忙聽卢忙聧拢莽聭聶盲戮聤莽麓聺茅聨麓忙聢聹忙禄聭氓篓拢猫炉虏氓搂聻忙露聯芒聜卢忙露聯卯聛聠氓拢聮氓篓聢氓漏聞忙庐聭莽聬職卯聜垄氓搂漏茅聳卢忙楼聝氓垄驴)
      // 茅聬垄氓聫聵莽掳卢氓篓聦芒聞聝忙鹿聛茅聬漏氓颅聵氓赂麓茅聬篓?maxMana 茅聬聵猫聢碌芒聜卢盲戮聤莽麓聶茅聧聬忙卢聬卯聞麓茅聧娄?BattleScene茅聰聸氓陇聸莽麓聺茅聨麓忙聢聹忙禄聭茅聴聡芒聜卢莽聭聲盲戮聙芒聜卢忙掳鲁莽鹿聝茅聳卢忙楼聝氓垄驴茅聫聣茫聝陇忙聟篓茅聫聙?
      // 茅聨麓忙聽卢芒聜卢氓聭颅忙鹿陋 App 忙露聯卯聟聼氓聺聤茅聧聰?maxMana 茅聬聵猫聢碌芒聜卢盲陆路莽麓露莽录聛?BattleScene
      // 忙聺漏忙卢聯氓聶路莽禄聽芒聜卢茅聧聴忙聸聻莽聳聞茅聬聹氓赂庐莽麓掳氓篓拢猫炉虏氓搂聻忙露聯芒聜卢忙露聯卯聛聢忙庐拢茅聮聵氓驴聸盲禄聬茅聬聴?"ManaGem"
      setRelics(prev => [...prev, "ManaGem"]); 
      setGold(prev => prev - 200);
  };

  const handleSkipReward = () => { setGold(gold + 50); completeNode(); };
  const handleRest = () => { setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.3))); completeNode(); };
  
  const restartGame = () => { setView('CHAMPION_SELECT'); setMasterDeck([]); setCurrentHp(80); setMaxHp(80); setGold(100); setRelics([]); setBaseStr(0); setChampion(null); setUsedEnemies([]); };
  const getCurrentBgm = () => (view === 'COMBAT' ? BGM_BATTLE_URL : BGM_MAP_URL);
  const playSfx = (type) => { 
    const url = SFX[type] || SFX.ATTACK;
    if (!url) return;
    const audio = new Audio(url);
    // 茅聫聧猫搂聞氓碌聛茅聴聤猫聶芦忙聶楼莽禄芦猫炉虏莽聙路莽聮聥氓聠漏忙職拢茅聴聤忙聤陆氓聶潞
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
                  <div className="z-10 text-center"><h1 className="text-8xl font-black text-[#C8AA6E] mb-8 drop-shadow-lg tracking-widest">氓庐聞脗陇猫聝潞莽聛聫忙聽搂卯聰聶</h1><div className="flex flex-col gap-4 w-64 mx-auto">{hasSave && (<button onClick={handleContinue} className="px-8 py-4 bg-[#0AC8B9] hover:bg-white hover:text-[#0AC8B9] text-black font-bold rounded flex items-center justify-center gap-2 transition-all"><Play fill="currentColor" /> 莽录聛脩聟莽聰禄氓炉掳盲陆潞芒聳录</button>)}<button onClick={handleNewGame} className="px-8 py-4 border-2 border-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-black text-[#C8AA6E] font-bold rounded flex items-center justify-center gap-2 transition-all"><RotateCcw /> 茅聫聜莽聣聢莽聢露茅聨麓?/button></div><p className="mt-8 text-slate-400 text-sm">v0.8.0 Beta</p></div>
                  {showUpdateLog && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
                          <div className="max-w-2xl bg-[#091428]/95 border-2 border-[#C8AA6E] p-8 rounded-xl shadow-[0_0_50px_#C8AA6E]">
                              <h2 className="text-3xl font-bold text-[#C8AA6E] mb-6 text-center">v0.8.0 (猫陇掳忙聮鲁氓垄聽茅聬聴氓聽聼忙鹿掳) 茅聫聡氓颅聵忙聼聤茅聫聝茫聝楼莽鹿聰</h2>
                              <div className="space-y-4 text-left max-h-96 overflow-y-auto">
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 茅聧聫茫聞篓氓芦鲁茅聴聠氓聥芦莽聳聞莽聭聛?/div>
                                      <div className="text-sm text-[#A09B8C]">茅聭禄茅聛聧忙鲁聼氓搂鹿莽聤鲁氓垄驴茅聧聫氓聭掳氓職娄 20 忙碌拢氓露聫莽麓聺茅聧聳氓聭颅忙聝聢茅聬聼莽聜麓忙聻聝茅聤聠盲陆赂氓麓卤茅聬聴氓卤禄芒聜卢盲陆潞忙麓赂茅聧聧脩聟莽聯聭茅聫聜忙聥聦氓芦鲁茅聴聠氓聥露莽麓聺忙露聯忙聴聙莽聵隆忙碌拢氓露聢氓芦鲁茅聴聠氓聥卢氓芦垄茅聫聢氓陇聦氓芦颅茅聬聴氓聹颅忙庐聭茅聧聮忙驴聠卯聺聬茅聧聴茂录聞莽虏聧茅聧聹氓虏聝卯聺娄茅聧聰茫聞漏盲禄聬茅聬聴芒聰驴芒聜卢?/div>
                                  </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 忙露聯氓陇聦莽聫路茅聭潞氓聜聹茅聝麓莽录聛?/div>
                                      <div className="text-sm text-[#A09B8C]">氓搂聺茂陆聟莽麓隆莽聙鹿莽聜露卯聴聤 Act 1 (氓庐聞脗陇猫聝潞), Act 2 (茅聫聠忙楼聙氓楼聳氓庐聙?, Act 3 (茅聯聫忙掳卤芒聰聳) 茅聬篓氓聥芦莽聲卢茅聫聛氓颅聵莽楼娄莽禄聥氓卢露莽麓聺茅聧聳氓聭颅忙聝聢忙露聯忙聮鲁莽聺聵茅聫聛氓卤录忙卤聣茅聧聹?Boss茅聤聠?/div>
                                  </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 莽聮搂氓聥芦茅聵聙忙露聯忙聮鲁莽聺聵茅聳卢忙楼聝氓垄驴</div>
                                      <div className="text-sm text-[#A09B8C]">茅聫聜忙聺驴卯聳聝忙碌聹氓聴聴氓陆搂茅聭鲁猫聴聣忙鹿陋茅聬聴莽聭掳莽聲戮莽禄聰莽聤潞氓娄颅茅聭戮氓鲁掳氓陆聡茅聬篓氓聥芦氓路卤茅聧聰忙露垄盲禄聬茅聬聴芒聲聥莽麓聶忙驴隆?Act 3 茅聬篓氓聥颅忙聮录忙碌聽芒聜卢忙露聰氓卢卢氓垄庐茅聰聸氓陇聢芒聜卢?/div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 茅聬聴氓卤陆莽掳卤茅聨碌忙聮露芒聰聳 Bug</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 茅聧聵氓聥芦氓搂聻茅聬聴莽聭掳忙麓聳莽聬聸芒聜卢 Bug</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 茅聧娄忙聺驴忙碌聵莽聮潞卯聢職莽路聻茅聳芦忙聵聫莽路芦</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 莽聮搂氓聥卢莽掳庐茅聳戮莽聜卢氓赂麓</div>
                                      <div className="text-sm text-[#A09B8C]">茅聧聫茫聞漏忙陆掳茅聫聧芒聙鲁卯聡庐忙碌聹?20 忙碌拢氓露聢氓芦鲁茅聴聠氓聥颅忙庐聭茅聨露芒聜卢茅聭鲁猫聴聣忙碌聵茅聫聧氓聸楼芒聜卢盲陆赂茫聛聰茅聧聧氓驴聯忙聥掳 Loading 茅聧楼忙聮聟莽麓聺忙路聡卯聠录卯聵虏忙碌聹氓聴聵氓垄聧茅聫聢?broken image茅聤聠?/div>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => {
                                      setShowUpdateLog(false);
                                      localStorage.setItem('last_version', 'v0.8.0');
                                      setBgmStarted(true);
                                  }} 
                                  className="mt-6 w-full px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold rounded transition-all"
                              >
                                  茅聧聫忙聤陆忙拢麓
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          );
          case 'CHAMPION_SELECT': return <ChampionSelect onChampionSelect={handleChampionSelect} unlockedIds={unlockedChamps} />;
          case 'MAP': return <GridMapView mapData={mapData} onNodeSelect={handleNodeSelect} currentFloor={currentFloor} act={currentAct} activeNode={activeNode} lockedChoices={lockedChoices} />;
          case 'SHOP': return <ShopView gold={gold} deck={masterDeck} relics={relics} onLeave={() => completeNode()} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} onUpgradeCard={handleUpgradeCard} onBuyMana={handleBuyMana} championName={champion.name} />;
          case 'EVENT': return <EventView onLeave={() => completeNode()} onReward={handleEventReward} />;
          case 'CHEST': return <ChestView onLeave={() => completeNode()} onRelicReward={handleRelicReward} relics={relics} act={currentAct} />;
          case 'COMBAT': return champion ? <BattleScene heroData={{...champion, maxHp, currentHp, relics, baseStr}} enemyId={activeNode?.enemyId} initialDeck={masterDeck} onWin={handleBattleWin} onLose={() => { localStorage.removeItem(SAVE_KEY); setView('GAMEOVER'); }} floorIndex={currentFloor} act={currentAct} /> : <div>Loading...</div>;
          case 'REWARD': return <RewardView goldReward={50} onCardSelect={handleCardReward} onSkip={handleSkipReward} championName={champion.name} />;
          case 'REST': return <RestView onRest={handleRest} />;
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">忙碌录莽聤虏卯職聦氓搂聵茅聲聬莽卢聣茅聬聰氓聥颅盲录聝茅聰聸?/h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">茅聧楼莽聜虏氓聼聦茅聭驴忙禄聝氓麓聼</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">茅聨麓忙篓驴猫搂娄</h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">茅聧楼莽聜虏氓聼聦茅聭驴忙禄聝氓麓聼</button></div>;
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
                      <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                          <span className="text-[#F0E6D2] font-bold text-lg shadow-black drop-shadow-md flex items-center gap-2">
                            {champion.name}
                            <RelicTooltip relic={RELIC_DATABASE[champion.relicId]}>
                                <img src={RELIC_DATABASE[champion.relicId].img} 
                                     className="w-6 h-6 rounded border border-yellow-400 bg-black/50 cursor-help hover:scale-110 transition-transform" 
                                />
                            </RelicTooltip>
                          </span>
                              <div className="flex items-center gap-4 text-sm font-bold"><span className="text-red-400 flex items-center gap-1"><Heart size={14} fill="currentColor"/> {currentHp}/{maxHp}</span><span className="text-yellow-400 flex items-center gap-1"><Coins size={14} fill="currentColor"/> {gold}</span></div>
                          </div>
                          {/* 茅聳卢忙楼聝氓垄驴茅聫聧?- 莽禄卤脩聡氓聛娄莽聬職卯聜垄氓搂漏茅聨露芒聜卢茅聭鲁猫聴聣氓陆赂忙赂職?*/}
                          <div className="flex gap-2 flex-wrap max-w-md">
                      {relics.filter(rid => rid !== champion.relicId).map((rid, i) => {
                          const relic = RELIC_DATABASE[rid];
                          return (
                              <RelicTooltip key={i} relic={relic}>
                                          <div className="w-9 h-9 rounded border border-[#C8AA6E]/50 bg-black/50 relative group cursor-help hover:scale-110 transition-transform">
                                      <img src={relic.img} className="w-full h-full object-cover" />
                                  </div>
                              </RelicTooltip>
                          );
                      })}
                  </div>
              </div>
      </div>
            </div>
        )}
          {renderView()}
          {showCodex && <CodexView onClose={() => setShowCodex(false)} />}
          {showDeck && <DeckView deck={masterDeck} onClose={() => setShowDeck(false)} />}
          <ToastContainer toasts={toasts} />
    </div>
  );
}
