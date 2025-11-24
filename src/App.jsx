import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sword, Shield, Zap, Skull, Heart, RefreshCw, AlertTriangle, Flame, XCircle, Activity, Map as MapIcon, Gift, Anchor, Coins, ShoppingBag, ChevronRight, Star, Play, Pause, Volume2, VolumeX, Landmark, Lock, RotateCcw, Save, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGridMap } from './data/gridMapLayout_v4'; // v4鐢熸垚鍣紙甯︽鑳″悓妫€娴嬶級
import GridMapView from './components/GridMapView'; // 鏂扮増鍏竟褰㈠湴鍥捐鍥撅紙涓夐€変竴鏈哄埗锛?
import { getHexNeighbors } from './utils/hexagonGrid';
import CodexView from './components/CodexView';
import DeckView from './components/DeckView';
import BattleScene from './components/BattleScene';
import ChampionSelect from './components/ChampionSelect';
import ToastContainer from './components/shared/Toast';
import { unlockAudio } from './utils/audioContext';

// ==========================================
// 1. 闈欐€佽祫婧愪笌鍏ㄥ眬閰嶇疆
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

// 鑳屾櫙鍥鹃厤缃?(鎸夌珷鑺?
const ACT_BACKGROUNDS = {
    1: "https://i.17173cdn.com/2fhnvk/YWxqaGBf/cms3/JfEzktbjDoBxmzd.jpg", // 鍙敜甯堝场璋?
    2: "https://images.17173cdn.com/2014/lol/2014/08/22/Shadow_Isles_10.jpg", // 鏆楀奖涔嬪湴
    3: "https://pic.upmedia.mg/uploads/content/20220519/EV220519112427593030.webp"  // 铏氱┖涔嬪湴
};

// BGM URLs - 浠巆onstants瀵煎叆
const BGM_MAP_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/To-the-Infinity%20-Castle%20(1).mp3";
const BGM_BATTLE_URL = "https://pub-e9a8f18bbe6141f28c8b86c4c54070e1.r2.dev/bgm/spire/guimie-battle%20(1).mp3";

// 闊虫晥 - 浣跨敤鏂扮殑R2瀛樺偍鍦板潃
const SFX_BASE_URL = "https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/sfx";
const SFX_NEW_URL = "https://pub-4785f27b55bc484db8005d5841a1735a.r2.dev";
const SFX = {
    ATTACK: `${SFX_BASE_URL}/attack.mp3`, 
    BLOCK: `${SFX_BASE_URL}/block.mp3`,
    DRAW: `${SFX_BASE_URL}/draw.mp3`,
    WIN: `${SFX_BASE_URL}/win.mp3`,
    // 澧炲己闊虫晥 - 鐙珛鐨勬敾鍑汇€佹牸鎸°€佸彈鍑婚煶鏁?
    ATTACK_SWING: `${SFX_NEW_URL}/attack_swing.mp3`,
    ATTACK_HIT: `${SFX_NEW_URL}/attack_hit.mp3`,
    BLOCK_SHIELD: `${SFX_NEW_URL}/block_shield.mp3`,
    HIT_TAKEN: `${SFX_NEW_URL}/hit_taken.mp3`
};

const STARTING_DECK_BASIC = ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend"];
const SAVE_KEY = 'lots_save_v75';
const UNLOCK_KEY = 'lots_unlocks_v75';

// ==========================================
// 2. 娓告垙鏁版嵁搴?
// ==========================================

const CHAMPION_POOL = {
  // --- 绗竴姊槦 ---
  "Garen": { id: "Garen", name: "鐩栦鸡", title: "寰风帥瑗夸簹涔嬪姏", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/Garen.png`, img: `${LOADING_URL}/Garen_0.jpg`, passive: "鍧氶煣: 鎴樻枟缁撴潫鏃舵仮澶?6 HP", relicId: "GarenPassive", initialCards: ["GarenQ", "GarenW", "Ignite", "Defend"], description: "寰风帥瑗夸簹鐨勯噸瑁呮垬澹紝鎿呴暱鍙犵敳鍜屾寔缁綔鎴樸€? },
  "Darius": { id: "Darius", name: "寰疯幈鍘勬柉", title: "璇哄厠钀ㄦ柉涔嬫墜", maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Darius.png`, img: `${LOADING_URL}/Darius_0.jpg`, passive: "鍑鸿: 姣忔鏀诲嚮鏃讹紝缁欎簣鏁屼汉 1 灞傝櫄寮?, relicId: "DariusPassive", initialCards: ["DariusW", "DariusE", "Strike", "Ignite"], description: "璇哄厠钀ㄦ柉鐨勮薄寰侊紝渚濋潬鍔涢噺鍜屾祦琛€鏁堟灉鍘嬪埗鏁屼汉銆? },
  "Lux": { id: "Lux", name: "鎷夊厠涓?, title: "鍏夎緣濂抽儙", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Lux.png`, img: `${LOADING_URL}/Lux_0.jpg`, passive: "鍏夎姃鍥涘皠: 姣忓洖鍚堝紑濮嬫椂鑾峰緱 1 鐐规硶鍔?, relicId: "LuxPassive", initialCards: ["LuxQ", "LuxE", "Heal", "Ignite"], description: "娉曞笀鑻遍泟锛屾搮闀垮埄鐢ㄩ澶栨硶鍔涙墦鍑洪珮璐规帶鍒剁墝銆? },
  "Jinx": { id: "Jinx", name: "閲戝厠涓?, title: "鏆磋蛋钀濊帀", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Jinx.png`, img: `${LOADING_URL}/Jinx_0.jpg`, passive: "鐖嗗彂: 姣忓洖鍚堝垵濮嬫墜鐗屾暟閲?1", relicId: "JinxPassive", initialCards: ["JinxQ", "JinxW", "Strike", "Strike"], description: "楂樼垎鍙戝皠鎵嬶紝閫氳繃蹇€熸娊鐗屽拰杩炲嚮閫犳垚浼ゅ銆? },
  "Yasuo": { id: "Yasuo", name: "浜氱储", title: "鐤鹃鍓戣豹", maxHp: 78, maxMana: 3, avatar: `${CDN_URL}/img/champion/Yasuo.png`, img: `${LOADING_URL}/Yasuo_0.jpg`, passive: "娴涔嬮亾: 鏆村嚮鍑犵巼+10%", relicId: "YasuoPassive", initialCards: ["YasuoQ", "YasuoE", "Defend", "Defend"], description: "楂樻満鍔ㄦ€у墤瀹紝鍒╃敤杩炲嚮鍜屾毚鍑昏繘琛岀垎鍙戣緭鍑恒€? },
  "Sona": { id: "Sona", name: "濞戝", title: "鐞寸憻浠欏コ", maxHp: 72, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sona.png`, img: `${LOADING_URL}/Sona_0.jpg`, passive: "鑳介噺寮? 姣忓洖鍚堟墦鍑虹涓夊紶鍗℃椂锛岃幏寰?3 鐐逛复鏃舵姢鐢?, relicId: "SonaPassive", initialCards: ["SonaQ", "SonaW", "Defend", "Heal"], description: "杈呭姪鑻遍泟锛屼笓娉ㄤ簬鎭㈠鍜屽洟闃熷鐩娿€? },
  "Ekko": { id: "Ekko", name: "鑹惧厠", title: "鏃堕棿鍒哄", maxHp: 82, maxMana: 3, avatar: `${CDN_URL}/img/champion/Ekko.png`, img: `${LOADING_URL}/Ekko_0.jpg`, passive: "Z鍨嬮┍鍔? 姣忔鎵撳嚭娑堣€楀崱鏃讹紝鑾峰緱 1 鐐瑰姏閲?, relicId: "EkkoPassive", initialCards: ["EkkoQ", "EkkoE", "Defend", "Ignite"], description: "楂樼垎鍙戝埡瀹紝鍒╃敤娑堣€楀崱鐗岀殑鏈哄埗蹇€熸垚闀裤€? },
  "Sylas": { id: "Sylas", name: "濉炴媺鏂?, title: "瑙ｈ劚鑰?, maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Sylas.png`, img: `${LOADING_URL}/Sylas_0.jpg`, passive: "鍙涗贡: 姣忔鎵撳嚭鎶€鑳界墝鏃讹紝鍥炲 3 鐐圭敓鍛藉€?, relicId: "SylasPassive", initialCards: ["SylasQ", "SylasW", "Strike", "Defend"], description: "鏂楀＋鑻遍泟锛岄€氳繃棰戠箒鎵撳嚭鎶€鑳借幏寰楃敓瀛樹紭鍔裤€? },
  "Urgot": { id: "Urgot", name: "鍘勫姞鐗?, title: "鏃犵晱鎴樿溅", maxHp: 100, maxMana: 3, avatar: `${CDN_URL}/img/champion/Urgot.png`, img: `${LOADING_URL}/Urgot_0.jpg`, passive: "鍥炵伀: 鎴樻枟寮€濮嬫椂鑾峰緱 15 鐐逛复鏃舵姢鐢?, relicId: "UrgotPassive", initialCards: ["UrgotQ", "UrgotW", "Defend", "Defend"], description: "鍧﹀厠鑻遍泟锛屾嫢鏈夐珮鐢熷懡鍊煎拰寮哄姏闃插尽銆? },
  "Viktor": { id: "Viktor", name: "缁村厠鎵?, title: "鏈烘鍏堥┍", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Viktor.png`, img: `${LOADING_URL}/Viktor_0.jpg`, passive: "鍏夎崳杩涘寲: 鍥炲悎寮€濮嬫椂锛?0% 鍑犵巼鑾峰緱涓€寮犻澶栧熀纭€鍗?, relicId: "ViktorPassive", initialCards: ["ViktorQ", "ViktorE", "Ignite", "Heal"], description: "楂樼鎶€娉曞笀锛屾搮闀块€氳繃蹇€熸护鐗岃幏寰椾紭鍔裤€? },
  
  // --- 绗簩姊槦 (鏂板偍澶? ---
  "Riven": { id: "Riven", name: "鐟炴枃", title: "鏀鹃€愪箣鍒?, maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Riven.png`, img: `${LOADING_URL}/Riven_0.jpg`, passive: "绗︽枃涔嬪垉: 姣忔墦鍑?寮犳敾鍑荤墝锛岃幏寰?鐐硅兘閲?, relicId: "RivenPassive", initialCards: ["RivenQ", "RivenE", "Strike", "Defend"], description: "杩炴嫑鍨嬫垬澹紝閫氳繃杩炵画鏀诲嚮绉疮鑳介噺銆? },
  "TwistedFate": { id: "TwistedFate", name: "鍗＄墝澶у笀", title: "宕旀柉鐗?, maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/TwistedFate.png`, img: `${LOADING_URL}/TwistedFate_0.jpg`, passive: "鐏岄搮楠板瓙: 鎴樻枟鑳滃埄棰濆鑾峰緱 15 閲戝竵", relicId: "TwistedFatePassive", initialCards: ["TwistedFateW", "TwistedFateQ", "Strike", "Ignite"], description: "缁忔祹鍨嬫硶甯堬紝閫氳繃棰濆閲戝竵鑾峰緱瑁呭浼樺娍銆? },
  "LeeSin": { id: "LeeSin", name: "鐩插儳", title: "鏉庨潚", maxHp: 80, maxMana: 3, avatar: `${CDN_URL}/img/champion/LeeSin.png`, img: `${LOADING_URL}/LeeSin_0.jpg`, passive: "鐤鹃楠ら洦: 鎵撳嚭鎶€鑳界墝鍚庯紝涓嬩竴寮犳敾鍑荤墝璐圭敤-1", relicId: "LeeSinPassive", initialCards: ["LeeSinQ", "LeeSinW", "Strike", "Defend"], description: "鑺傚鍨嬫垬澹紝閫氳繃鎶€鑳藉拰鏀诲嚮鐨勯厤鍚堟墦鍑鸿繛鎷涖€? },
  "Vayne": { id: "Vayne", name: "钖囨仼", title: "鏆楀鐚庢墜", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Vayne.png`, img: `${LOADING_URL}/Vayne_0.jpg`, passive: "鍦ｉ摱寮╃: 瀵瑰悓涓€鐩爣杩炵画閫犳垚3娆′激瀹虫椂锛岄澶栭€犳垚10浼?, relicId: "VaynePassive", initialCards: ["VayneQ", "VayneE", "Strike", "Strike"], description: "鍗曚綋鐖嗗彂灏勬墜锛屼笓娉ㄤ簬瀵瑰崟涓€鐩爣鐨勬寔缁緭鍑恒€? },
  "Teemo": { id: "Teemo", name: "鎻愯帿", title: "杩呮嵎鏂ュ€?, maxHp: 65, maxMana: 3, avatar: `${CDN_URL}/img/champion/Teemo.png`, img: `${LOADING_URL}/Teemo_0.jpg`, passive: "娓稿嚮鎴? 鍥炲悎寮€濮嬫椂锛岄殢鏈虹粰涓€鍚嶆晫浜烘柦鍔?2 灞傝櫄寮?, relicId: "TeemoPassive", initialCards: ["TeemoQ", "TeemoR", "Strike", "Ignite"], description: "DoT鍨嬪皠鎵嬶紝閫氳繃铏氬急鍜屾槗浼ゅ墛寮辨晫浜恒€? },
  "Zed": { id: "Zed", name: "鍔?, title: "褰辨祦涔嬩富", maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Zed.png`, img: `${LOADING_URL}/Zed_0.jpg`, passive: "褰卞垎韬? 姣忓洖鍚堢涓€寮犳敾鍑荤墝浼氶噸澶嶆柦鏀句竴娆?50%浼ゅ)", relicId: "ZedPassive", initialCards: ["ZedQ", "ZedE", "Strike", "Strike"], description: "鐖嗗彂鍨嬪埡瀹紝閫氳繃澶嶅埗鏀诲嚮閫犳垚宸ㄩ浼ゅ銆? },
  "Nasus": { id: "Nasus", name: "鍐呯憻鏂?, title: "娌欐紶姝荤", maxHp: 85, maxMana: 3, avatar: `${CDN_URL}/img/champion/Nasus.png`, img: `${LOADING_URL}/Nasus_0.jpg`, passive: "姹查瓊鐥涘嚮: 姣忔鐢ㄦ敾鍑荤墝鍑绘潃鏁屼汉锛岃幏寰?鐐瑰姏閲?, relicId: "NasusPassive", initialCards: ["NasusQ", "NasusW", "Strike", "Defend"], description: "鏃犻檺鎴愰暱鍨嬫垬澹紝閫氳繃鍑绘潃鏁屼汉姘镐箙鎻愬崌鍔涢噺銆? },
  "Irelia": { id: "Irelia", name: "鑹剧憺鑾夊▍", title: "鍒€閿嬭垶鑰?, maxHp: 75, maxMana: 3, avatar: `${CDN_URL}/img/champion/Irelia.png`, img: `${LOADING_URL}/Irelia_0.jpg`, passive: "鐑瘹: 姣忔鍑绘潃鏁屼汉锛屾仮澶?1 鐐硅兘閲忓苟鎶?1 寮犵墝", relicId: "IreliaPassive", initialCards: ["IreliaQ", "IreliaE", "Strike", "Defend"], description: "鏀跺壊鍨嬫垬澹紝閫氳繃鍑绘潃閲嶇疆鍜屾娊鐗屽舰鎴愯繛鍑汇€?, baseStr: 0 },
  "Thresh": { id: "Thresh", name: "閿ょ煶", title: "榄傞攣鍏哥嫳闀?, maxHp: 90, maxMana: 3, avatar: `${CDN_URL}/img/champion/Thresh.png`, img: `${LOADING_URL}/Thresh_0.jpg`, passive: "鍦扮嫳璇呭拻: 姣忔鍑绘潃鏁屼汉锛屾案涔呭鍔?2 鏈€澶х敓鍛藉€?, relicId: "ThreshPassive", initialCards: ["ThreshQ", "ThreshW", "Strike", "Defend"], description: "鎴愰暱鍨嬪潶鍏嬶紝閫氳繃鍑绘潃鏁屼汉姘镐箙鎻愬崌鐢熷懡涓婇檺銆?, baseStr: 0 },
  "Katarina": { id: "Katarina", name: "鍗＄壒鐞冲", title: "涓嶇ゥ涔嬪垉", maxHp: 70, maxMana: 3, avatar: `${CDN_URL}/img/champion/Katarina.png`, img: `${LOADING_URL}/Katarina_0.jpg`, passive: "璐┆: 姣忓洖鍚堟瘡鎵撳嚭 3 寮犳敾鍑荤墝鍚庯紝涓嬩竴寮犳敾鍑荤墝浼ゅ缈诲€?, relicId: "KatarinaPassive", initialCards: ["KatarinaQ", "KatarinaE", "Strike", "Strike"], description: "璁℃暟鍣ㄥ瀷鍒哄锛岄€氳繃杩炲嚮瑙﹀彂楂橀鐖嗗彂浼ゅ銆?, baseStr: 0 },
};

const RELIC_DATABASE = {
  // 鍩虹琚姩閬楃墿 (20涓?
  "GarenPassive": { id: "GarenPassive", name: "鍧氶煣", description: "鎴樻枟缁撴潫鏃舵仮澶?6 HP", rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "DariusPassive": { id: "DariusPassive", name: "鍑鸿", description: "姣忔鏀诲嚮鏃讹紝缁欎簣鏁屼汉 1 灞傝櫄寮?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Garen_Passive.png` },
  "LuxPassive": { id: "LuxPassive", name: "鍏夎姃鍥涘皠", description: "姣忓洖鍚堝紑濮嬫椂鑾峰緱 1 鐐归澶栨硶鍔?, rarity: "PASSIVE", img: `${PASSIVE_URL}/LuxIllumination.png` },
  "JinxPassive": { id: "JinxPassive", name: "鐖嗗彂", description: "姣忓洖鍚堝垵濮嬫墜鐗屾暟閲?1", rarity: "PASSIVE", img: `${PASSIVE_URL}/Jinx_Passive.png` },
  "YasuoPassive": { id: "YasuoPassive", name: "娴涔嬮亾", description: "鏀诲嚮鐗屾毚鍑诲嚑鐜?10%", rarity: "PASSIVE", img: `${PASSIVE_URL}/Yasuo_Passive.png` },
  "SonaPassive": { id: "SonaPassive", name: "鑳介噺寮?, description: "姣忓洖鍚堟墦鍑虹涓夊紶鍗℃椂锛岃幏寰?3 鐐逛复鏃舵姢鐢?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Sona_Passive.png` },
  "EkkoPassive": { id: "EkkoPassive", name: "Z鍨嬮┍鍔ㄥ叡鎸?, description: "姣忔鎵撳嚭娑堣€楀崱鏃讹紝鑾峰緱 1 鐐瑰姏閲?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Ekko_P.png` },
  "SylasPassive": { id: "SylasPassive", name: "鍙涗贡", description: "姣忔鎵撳嚭鎶€鑳界墝鏃讹紝鍥炲 3 鐐圭敓鍛藉€?, rarity: "PASSIVE", img: `${PASSIVE_URL}/SylasP.png` },
  "UrgotPassive": { id: "UrgotPassive", name: "鍥炵伀", description: "鎴樻枟寮€濮嬫椂鑾峰緱 15 鐐逛复鏃舵姢鐢?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Urgot_Passive.png` },
  "ViktorPassive": { id: "ViktorPassive", name: "鍏夎崳杩涘寲", description: "鍥炲悎寮€濮嬫椂锛?0% 鍑犵巼鑾峰緱涓€寮犻澶栧熀纭€鍗?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Viktor_Passive.png` },
  "RivenPassive": { id: "RivenPassive", name: "绗︽枃涔嬪垉", description: "姣忔墦鍑?寮犳敾鍑荤墝锛岃幏寰?鐐硅兘閲?, rarity: "PASSIVE", img: `${PASSIVE_URL}/RivenRunicBlades.png` },
  "TwistedFatePassive": { id: "TwistedFatePassive", name: "鐏岄搮楠板瓙", description: "鎴樻枟鑳滃埄棰濆鑾峰緱 15 閲戝竵", rarity: "PASSIVE", img: `${PASSIVE_URL}/CardMaster_SealFate.png` },
  "LeeSinPassive": { id: "LeeSinPassive", name: "鐤鹃楠ら洦", description: "鎵撳嚭鎶€鑳界墝鍚庯紝涓嬩竴寮犳敾鍑荤墝璐圭敤-1", rarity: "PASSIVE", img: `${PASSIVE_URL}/LeeSinPassive.png` },
  "VaynePassive": { id: "VaynePassive", name: "鍦ｉ摱寮╃", description: "瀵瑰悓涓€鐩爣杩炵画閫犳垚3娆′激瀹虫椂锛岄澶栭€犳垚10浼?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Vayne_SilveredBolts.png` },
  "TeemoPassive": { id: "TeemoPassive", name: "娓稿嚮鎴?, description: "鍥炲悎寮€濮嬫椂锛岄殢鏈虹粰涓€鍚嶆晫浜烘柦鍔?2 灞傝櫄寮?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Teemo_P.png` },
  "ZedPassive": { id: "ZedPassive", name: "褰卞垎韬?, description: "姣忓洖鍚堢涓€寮犳敾鍑荤墝浼氶噸澶嶆柦鏀句竴娆?50%浼ゅ)", rarity: "PASSIVE", img: `${PASSIVE_URL}/Zed_Passive.png` },
  "NasusPassive": { id: "NasusPassive", name: "姹查瓊鐥涘嚮", description: "姣忔鐢ㄦ敾鍑荤墝鍑绘潃鏁屼汉锛岃幏寰?鐐瑰姏閲?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Nasus_Passive.png` },
  "IreliaPassive": { id: "IreliaPassive", name: "鐑瘹", description: "姣忔鍑绘潃鏁屼汉锛屾仮澶?1 鐐硅兘閲忓苟鎶?1 寮犵墝", rarity: "PASSIVE", img: `${PASSIVE_URL}/Irelia_Passive.png` },
  "ThreshPassive": { id: "ThreshPassive", name: "鍦扮嫳璇呭拻", description: "鏁屼汉姝讳骸澧炲姞 2 鏈€澶х敓鍛藉€?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Thresh_Passive.png` },
  "KatarinaPassive": { id: "KatarinaPassive", name: "璐┆", description: "姣忓洖鍚堟墦鍑虹殑姣忕 4 寮犳敾鍑荤墝浼ゅ缈诲€?, rarity: "PASSIVE", img: `${PASSIVE_URL}/Katarina_Passive.png` },

  // 閫氱敤閬楃墿
  "DoransShield": { id: "DoransShield", name: "澶氬叞涔嬬浘", price: 100, rarity: "COMMON", description: "鎴樻枟寮€濮嬫椂鑾峰緱 6 鐐规姢鐢层€?, img: `${ITEM_URL}/1054.png`, onBattleStart: (state) => ({ ...state, block: state.block + 6 }) },
  "LongSword": { id: "LongSword", name: "闀垮墤", price: 150, rarity: "COMMON", description: "鎴樻枟寮€濮嬫椂鑾峰緱 1 鐐瑰姏閲忋€?, img: `${ITEM_URL}/1036.png`, onBattleStart: (state) => ({ ...state, status: { ...state.status, strength: state.status.strength + 1 } }) },
  "RubyCrystal": { id: "RubyCrystal", name: "绾㈡按鏅?, price: 120, rarity: "COMMON", description: "鏈€澶х敓鍛藉€?+15銆?, img: `${ITEM_URL}/1028.png`, onPickup: (gameState) => ({ ...gameState, maxHp: gameState.maxHp + 15, currentHp: gameState.currentHp + 15 }) },
  "VampiricScepter": { id: "VampiricScepter", name: "鍚歌楝艰妭鏉?, price: 280, rarity: "UNCOMMON", description: "姣忔鎵撳嚭鏀诲嚮鐗屾仮澶?1 鐐圭敓鍛姐€?, img: `${ITEM_URL}/1053.png` },
  "Sheen": { id: "Sheen", name: "鑰€鍏?, price: 350, rarity: "UNCOMMON", description: "姣忓洖鍚堟墦鍑虹殑绗竴寮犳敾鍑荤墝锛屼激瀹崇炕鍊嶃€?, img: `${ITEM_URL}/3057.png` },
  "ZhonyasHourglass": { id: "ZhonyasHourglass", name: "涓▍娌欐紡", price: 500, rarity: "RARE", description: "姣忓満鎴樻枟闄愪竴娆★細鍏嶇柅涓嬩竴鍥炲悎鐨勬晫浜轰激瀹炽€?, img: `${ITEM_URL}/3157.png`, charges: 1 },
  "InfinityEdge": { id: "InfinityEdge", name: "鏃犲敖涔嬪垉", price: 700, rarity: "RARE", description: "鎵€鏈夋敾鍑荤墝浼ゅ+50%銆?, img: `${ITEM_URL}/3031.png` },
  "Redemption": { id: "Redemption", name: "鏁戣祹", price: 650, rarity: "RARE", description: "姣忓洖鍚堝紑濮嬫椂锛屾不鐤椾綘鍜屾晫浜?5 鐐圭敓鍛姐€?, img: `${ITEM_URL}/3107.png`, onTurnStart: (pState, eState) => ({ pState: { ...pState, hp: Math.min(pState.maxHp, pState.hp + 5) }, eState: { ...eState, hp: eState.hp + 5 } }) },
  "BrambleVest": { id: "BrambleVest", name: "鑽嗘鑳屽績", price: 200, rarity: "UNCOMMON", description: "姣忔琚敾鍑绘椂锛屽鏀诲嚮鑰呴€犳垚 3 鐐逛激瀹炽€?, img: `${ITEM_URL}/3076.png` },
  "GuardianAngel": { id: "GuardianAngel", name: "瀹堟姢澶╀娇", price: 750, rarity: "RARE", description: "姝讳骸鏃讹紝鎭㈠ 40 鐐圭敓鍛藉€笺€傛瘡鍦烘垬鏂楅檺涓€娆°€?, img: `${ITEM_URL}/3026.png`, charges: 1 },
  
  // 绔犺妭涓撳睘閬楃墿 (Act Specific)
  "Cull": { id: "Cull", name: "钀冨彇", price: 400, rarity: "RARE", description: "Act 1 闄愬畾锛氬嚮鏉€ 10 涓晫浜哄悗鑾峰緱 300 閲戝竵銆?, img: `${ITEM_URL}/1083.png` },
  "DarkSeal": { id: "DarkSeal", name: "榛戞殫灏佸嵃", price: 300, rarity: "RARE", description: "Act 1 闄愬畾锛氭瘡娆℃垬鏂楄儨鍒?+2 HP涓婇檺銆?, img: `${ITEM_URL}/1082.png` },
  "QSS": { id: "QSS", name: "姘撮摱楗板甫", price: 500, rarity: "RARE", description: "Act 2 闄愬畾锛氭垬鏂楀紑濮嬫椂鑾峰緱 1 灞備汉宸ュ埗鍝?(鎶垫尅Debuff)銆?, img: `${ITEM_URL}/3140.png` },
  "Executioner": { id: "Executioner", name: "姝诲垜瀹ｅ憡", price: 450, rarity: "RARE", description: "Act 2 闄愬畾锛氭敾鍑绘柦鍔犻噸浼?(鏁屼汉鏃犳硶鍥炲HP)銆?, img: `${ITEM_URL}/3123.png` },
  "Nashor": { id: "Nashor", name: "绾充粈涔嬬墮", price: 800, rarity: "RARE", description: "Act 3 闄愬畾锛氭瘡鍥炲悎鎵撳嚭鐨勭 3 寮犳敾鍑荤墝浼ゅ缈诲€嶃€?, img: `${ITEM_URL}/3115.png` }
};

// 鎵╁睍鏁屼汉姹狅細鍔犲叆鏆楀奖宀涘拰铏氱┖鐢熺墿
const ENEMY_POOL = {
  // Act 1: Rift
  "Katarina": { id: "Katarina", name: "鍗＄壒鐞冲", title: "涓嶇ゥ涔嬪垉", maxHp: 35, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Katarina_0.jpg`, avatar: `${CDN_URL}/img/champion/Katarina.png`, actions: [{ type: 'ATTACK', value: 5, count: 2, name: "鐬杩炲嚮" }, { type: 'DEBUFF', value: 0, name: "姝讳骸鑾插崕", effect: "VULNERABLE", effectValue: 1 }] },
  "Talon": { id: "Talon", name: "娉伴殕", title: "鍒€閿嬩箣褰?, maxHp: 40, act: 1, difficultyRank: 1, img: `${LOADING_URL}/Talon_0.jpg`, avatar: `${CDN_URL}/img/champion/Talon.png`, actions: [{ type: 'ATTACK', value: 9, name: "璇哄厠钀ㄦ柉澶栦氦" }, { type: 'BUFF', value: 0, name: "缈诲璺戣矾", effect: "BLOCK", effectValue: 8 }] },
  "Lucian": { id: "Lucian", name: "鍗㈤敗瀹?, title: "鍦ｆ灙娓镐緺", maxHp: 55, act: 1, difficultyRank: 2, img: `${LOADING_URL}/Lucian_0.jpg`, avatar: `${CDN_URL}/img/champion/Lucian.png`, actions: [{ type: 'ATTACK', value: 6, count: 2, name: "鍦ｅ厜閾跺脊" }] },
  "Darius_BOSS": { id: "Darius_BOSS", name: "寰疯幈鍘勬柉", title: "璇哄厠钀ㄦ柉涔嬫墜", maxHp: 120, act: 1, difficultyRank: 99, img: `${LOADING_URL}/Darius_0.jpg`, avatar: `${CDN_URL}/img/champion/Darius.png`, actions: [{ type: 'ATTACK', value: 12, name: "澶ф潃鍥涙柟" }, { type: 'DEBUFF', value: 0, name: "鑷存畫鎵撳嚮", effect: "WEAK", effectValue: 2 }, { type: 'ATTACK', value: 20, name: "鏂ご鍙帮紒" }] },

  // Act 2: Shadow Isles
  "Hecarim": { id: "Hecarim", name: "璧崱閲屽", title: "鎴樹簤涔嬪奖", maxHp: 80, act: 2, difficultyRank: 1, img: `${LOADING_URL}/Hecarim_0.jpg`, avatar: `${CDN_URL}/img/champion/Hecarim.png`, actions: [{ type: 'ATTACK', value: 12, name: "鏆磋蛋" }, { type: 'BUFF', value: 0, name: "鎭愭儳涔嬬伒", effect: "STRENGTH", effectValue: 2 }] },
  "Thresh": { id: "Thresh", name: "閿ょ煶", title: "榄傞攣鍏哥嫳闀?, maxHp: 90, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Thresh_0.jpg`, avatar: `${CDN_URL}/img/champion/Thresh.png`, actions: [{ type: 'DEBUFF', value: 0, name: "姝讳骸鍒ゅ喅", effect: "VULNERABLE", effectValue: 2 }, { type: 'ATTACK', value: 8, name: "鍘勮繍閽熸憜" }] },
  "Karthus": { id: "Karthus", name: "鍗″皵钀ㄦ柉", title: "姝讳骸棰傚敱鑰?, maxHp: 70, act: 2, difficultyRank: 2, img: `${LOADING_URL}/Karthus_0.jpg`, avatar: `${CDN_URL}/img/champion/Karthus.png`, actions: [{ type: 'ATTACK', value: 4, count: 3, name: "鑽掕姕" }, { type: 'ATTACK', value: 25, name: "瀹夐瓊鏇? }] },
  "Viego_BOSS": { id: "Viego_BOSS", name: "浣涜€舵垐", title: "鐮磋触涔嬬帇", maxHp: 180, act: 2, difficultyRank: 99, img: `${LOADING_URL}/Viego_0.jpg`, avatar: `${CDN_URL}/img/champion/Viego.png`, actions: [{ type: 'ATTACK', value: 15, count: 2, name: "鐮磋触鐜嬪墤" }, { type: 'BUFF', value: 0, name: "鑼尗鐒﹀湡", effect: "BLOCK", effectValue: 20 }] },

  // Act 3: The Void
  "KhaZix": { id: "KhaZix", name: "鍗″吂鍏?, title: "铏氱┖鎺犲ず鑰?, maxHp: 100, act: 3, difficultyRank: 1, img: `${LOADING_URL}/Khazix_0.jpg`, avatar: `${CDN_URL}/img/champion/Khazix.png`, actions: [{ type: 'ATTACK', value: 25, name: "鍝佸皾鎭愭儳" }] },
  "VelKoz": { id: "VelKoz", name: "缁村厠鍏?, title: "铏氱┖涔嬬溂", maxHp: 110, act: 3, difficultyRank: 2, img: `${LOADING_URL}/Velkoz_0.jpg`, avatar: `${CDN_URL}/img/champion/Velkoz.png`, actions: [{ type: 'ATTACK', value: 5, count: 4, name: "鐢熷懡褰㈡€佺摝瑙? }] },
  "BelVeth_BOSS": { id: "BelVeth_BOSS", name: "鍗戝皵缁存柉", title: "铏氱┖濂崇殗", maxHp: 300, act: 3, difficultyRank: 99, img: `${LOADING_URL}/Belveth_0.jpg`, avatar: `${CDN_URL}/img/champion/Belveth.png`, actions: [{ type: 'ATTACK', value: 8, count: 4, name: "涓囪浇璞" }, { type: 'DEBUFF', value: 0, name: "铏氱┖闈㈠", effect: "WEAK", effectValue: 99 }] }
};

const CARD_DATABASE = {
  "Strike": { id: "Strike", hero: "Neutral", name: "鎵撳嚮", price: 0, type: "ATTACK", cost: 1, value: 6, description: "閫犳垚 6 鐐逛激瀹炽€?, img: `${SPELL_URL}/SummonerFlash.png`, rarity: "BASIC" },
  "Defend": { id: "Defend", hero: "Neutral", name: "闃插尽", price: 0, type: "SKILL", cost: 1, block: 5, description: "鑾峰緱 5 鐐规姢鐢层€?, img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "BASIC" },
  "Ignite": { id: "Ignite", hero: "Neutral", name: "鐐圭噧", price: 80, type: "SKILL", cost: 0, value: 0, effect: "STRENGTH", effectValue: 2, exhaust: true, description: "鑾峰緱 2 鐐瑰姏閲忋€傛秷鑰椼€?, img: `${SPELL_URL}/SummonerDot.png`, rarity: "UNCOMMON" },
  "Heal": { id: "Heal", hero: "Neutral", name: "娌荤枟鏈?, price: 80, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 10, exhaust: true, description: "鎭㈠ 10 鐐圭敓鍛姐€傛秷鑰椼€?, img: `${SPELL_URL}/SummonerHeal.png`, rarity: "UNCOMMON" },
  
  "GarenQ": { id: "GarenQ", hero: "Garen", name: "鑷村懡鎵撳嚮", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "VULNERABLE", effectValue: 2, description: "閫犳垚 8 鐐逛激瀹炽€傜粰浜?2 灞傛槗浼ゃ€?, img: `${SPELL_URL}/GarenQ.png`, rarity: "COMMON" },
  "GarenW": { id: "GarenW", hero: "Garen", name: "鍕囨皵", price: 50, type: "SKILL", cost: 1, block: 12, effect: "CLEANSE", description: "鑾峰緱 12 鐐规姢鐢层€傚噣鍖栥€?, img: `${SPELL_URL}/GarenW.png`, rarity: "UNCOMMON" },
  "DariusW": { id: "DariusW", hero: "Darius", name: "鑷存畫鎵撳嚮", price: 60, type: "ATTACK", cost: 1, value: 10, effect: "WEAK", effectValue: 1, description: "閫犳垚 10 鐐逛激瀹炽€傜粰浜?1 灞傝櫄寮便€?, img: `${SPELL_URL}/DariusNoxianTacticsONH.png`, rarity: "COMMON" },
  "DariusE": { id: "DariusE", hero: "Darius", name: "鏃犳儏閾佹墜", price: 80, type: "SKILL", cost: 2, effect: "DRAW", effectValue: 1, description: "鎶撳彇 1 寮犵墝銆傜粰浜?3 灞傛槗浼ゃ€?, img: `${SPELL_URL}/SummonerBarrier.png`, rarity: "UNCOMMON" },
  "LuxQ": { id: "LuxQ", hero: "Lux", name: "鍏変箣鏉熺細", price: 70, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 3, description: "缁欎簣 3 灞傛槗浼ゃ€?, img: `${SPELL_URL}/LuxLightBinding.png`, rarity: "COMMON" },
  "LuxE": { id: "LuxE", hero: "Lux", name: "閫忓厜濂囩偣", price: 120, type: "ATTACK", cost: 2, value: 15, exhaust: true, description: "閫犳垚 15 鐐逛激瀹炽€傛秷鑰椼€?, img: `${SPELL_URL}/LuxLightStrikeKage.png`, rarity: "UNCOMMON" },
  "JinxQ": { id: "JinxQ", hero: "Jinx", name: "鍒囪嚜鍔ㄦ尅", price: 40, type: "ATTACK", cost: 0, value: 4, isMultiHit: true, hits: 2, description: "閫犳垚 2 娆?4 鐐逛激瀹炽€?, img: `${SPELL_URL}/JinxQ.png`, rarity: "COMMON" },
  "JinxW": { id: "JinxW", hero: "Jinx", name: "闇囪崱鐢电娉?, price: 90, type: "ATTACK", cost: 2, value: 20, effect: "WEAK", effectValue: 2, description: "閫犳垚 20 鐐逛激瀹炽€傜粰浜?2 灞傝櫄寮便€?, img: `${SPELL_URL}/JinxW.png`, rarity: "UNCOMMON" },
  "YasuoQ": { id: "YasuoQ", hero: "Yasuo", name: "鏂╅挗闂?, price: 40, type: "ATTACK", cost: 0, value: 4, description: "閫犳垚 4 鐐逛激瀹炽€?, img: `${SPELL_URL}/YasuoQ1Wrapper.png`, rarity: "COMMON" },
  "YasuoE": { id: "YasuoE", hero: "Yasuo", name: "韪忓墠鏂?, price: 70, type: "ATTACK", cost: 1, value: 8, effect: "STRENGTH", effectValue: 1, description: "閫犳垚 8 鐐逛激瀹炽€傝幏寰?1 鐐瑰姏閲忋€?, img: `${SPELL_URL}/YasuoDashWrapper.png`, rarity: "UNCOMMON" },
  "SonaQ": { id: "SonaQ", hero: "Sona", name: "鑻卞媷璧炵編璇?, price: 50, type: "ATTACK", cost: 1, value: 7, effect: "HEAL", effectValue: 3, description: "閫犳垚 7 鐐逛激瀹筹紝鍥炲 3 鐐圭敓鍛姐€?, img: `${SPELL_URL}/SonaHymnofValor.png`, rarity: "COMMON" },
  "SonaW": { id: "SonaW", hero: "Sona", name: "鍧氭瘏鍜忓徆璋?, price: 80, type: "SKILL", cost: 1, block: 8, effect: "HEAL", effectValue: 5, description: "鑾峰緱 8 鐐规姢鐢诧紝鍥炲 5 鐐圭敓鍛姐€?, img: `${SPELL_URL}/SonaAriaofPerseverance.png`, rarity: "UNCOMMON" },
  "EkkoQ": { id: "EkkoQ", hero: "Ekko", name: "鏃堕棿鍗锋洸鍣?, price: 50, type: "ATTACK", cost: 1, value: 12, exhaust: true, description: "閫犳垚 12 鐐逛激瀹炽€傛秷鑰椼€?, img: `${SPELL_URL}/EkkoQ.png`, rarity: "COMMON" },
  "EkkoE": { id: "EkkoE", hero: "Ekko", name: "鐩镐綅淇啿", price: 90, type: "SKILL", cost: 0, block: 5, exhaust: true, description: "鑾峰緱 5 鐐规姢鐢层€?, img: `${SPELL_URL}/EkkoE.png`, rarity: "UNCOMMON" },
  "SylasQ": { id: "SylasQ", hero: "Sylas", name: "閿侀摼闉嚮", price: 50, type: "ATTACK", cost: 1, value: 7, isMultiHit: true, hits: 2, description: "閫犳垚 2 娆?7 鐐逛激瀹炽€?, img: `${SPELL_URL}/SylasQ.png`, rarity: "COMMON" },
  "SylasW": { id: "SylasW", hero: "Sylas", name: "寮戝悰绐佸埡", price: 90, type: "SKILL", cost: 1, effect: "HEAL", effectValue: 15, description: "鍥炲 15 鐐圭敓鍛姐€?, img: `${SPELL_URL}/SylasW.png`, rarity: "UNCOMMON" },
  "UrgotQ": { id: "UrgotQ", hero: "Urgot", name: "鑵愯殌鐢佃嵎", price: 50, type: "ATTACK", cost: 1, value: 8, effect: "WEAK", effectValue: 1, description: "閫犳垚 8 鐐逛激瀹筹紝缁欎簣 1 灞傝櫄寮便€?, img: `${SPELL_URL}/UrgotQ.png`, rarity: "COMMON" },
  "UrgotW": { id: "UrgotW", hero: "Urgot", name: "鍑€闄?, price: 90, type: "SKILL", cost: 1, block: 8, effect: "VULNERABLE", effectValue: 1, description: "鑾峰緱 8 鐐规姢鐢诧紝缁欎簣 1 灞傛槗浼ゃ€?, img: `${SPELL_URL}/UrgotW.png`, rarity: "UNCOMMON" },
  "ViktorQ": { id: "ViktorQ", hero: "Viktor", name: "鑳介噺杞Щ", price: 40, type: "ATTACK", cost: 0, value: 3, block: 3, description: "閫犳垚 3 鐐逛激瀹筹紝鑾峰緱 3 鐐规姢鐢层€?, img: `${SPELL_URL}/ViktorPowerTransfer.png`, rarity: "COMMON" },
  "ViktorE": { id: "ViktorE", hero: "Viktor", name: "姝讳骸灏勭嚎", price: 100, type: "ATTACK", cost: 2, value: 18, description: "閫犳垚 18 鐐逛激瀹炽€?, img: `${SPELL_URL}/ViktorDeathRay.png`, rarity: "UNCOMMON" },

  // 鏂板偍澶囪嫳闆勬妧鑳?(Placeholder icons until updated)
  "RivenQ": { id: "RivenQ", hero: "Riven", name: "鎶樼考涔嬭垶", price: 50, type: "ATTACK", cost: 0, value: 4, description: "閫犳垚 4 鐐逛激瀹炽€?, img: `${SPELL_URL}/RivenTriCleave.png`, rarity: "COMMON" },
  "RivenE": { id: "RivenE", hero: "Riven", name: "鍕囧線鐩村墠", price: 80, type: "SKILL", cost: 1, block: 5, effect: "DRAW", effectValue: 1, description: "鑾峰緱 5 鐐规姢鐢层€傛姄鍙?1 寮犵墝銆?, img: `${SPELL_URL}/RivenFeint.png`, rarity: "UNCOMMON" },
  "TwistedFateW": { id: "TwistedFateW", hero: "TwistedFate", name: "閫夌墝", price: 60, type: "SKILL", cost: 1, description: "鑾峰緱闅忔満涓€寮犵孩/榛?钃濈墝 (绠€鍖? 鎶?寮?", effect: "DRAW", effectValue: 2, img: `${SPELL_URL}/PickACard.png`, rarity: "COMMON" },
  "TwistedFateQ": { id: "TwistedFateQ", hero: "TwistedFate", name: "涓囪兘鐗?, price: 90, type: "ATTACK", cost: 2, value: 8, description: "閫犳垚 8 鐐逛激瀹?(缇ゆ敾绠€鍖栦负鍗曚綋)銆?, img: `${SPELL_URL}/WildCards.png`, rarity: "COMMON" },
  "LeeSinQ": { id: "LeeSinQ", hero: "LeeSin", name: "澶╅煶娉?, price: 50, type: "ATTACK", cost: 1, value: 6, effect: "VULNERABLE", effectValue: 1, description: "閫犳垚 6 鐐逛激瀹炽€傜粰浜?1 灞傛槗浼ゃ€?, img: `${SPELL_URL}/BlindMonkQOne.png`, rarity: "COMMON" },
  "LeeSinW": { id: "LeeSinW", hero: "LeeSin", name: "閲戦挓缃?, price: 80, type: "SKILL", cost: 1, block: 8, description: "鑾峰緱 8 鐐规姢鐢层€?, img: `${SPELL_URL}/BlindMonkWOne.png`, rarity: "UNCOMMON" },
  "VayneQ": { id: "VayneQ", hero: "Vayne", name: "闂伩绐佽", price: 40, type: "ATTACK", cost: 0, value: 4, description: "閫犳垚 4 鐐逛激瀹炽€?, img: `${SPELL_URL}/VayneTumble.png`, rarity: "COMMON" },
  "VayneE": { id: "VayneE", hero: "Vayne", name: "鎭堕瓟瀹″垽", price: 90, type: "ATTACK", cost: 2, value: 12, effect: "WEAK", effectValue: 2, description: "閫犳垚 12 鐐逛激瀹炽€傜粰浜?2 灞傝櫄寮便€?, img: `${SPELL_URL}/VayneCondemn.png`, rarity: "UNCOMMON" },
  "TeemoQ": { id: "TeemoQ", hero: "Teemo", name: "鑷寸洸鍚圭", price: 50, type: "ATTACK", cost: 1, value: 5, effect: "WEAK", effectValue: 2, description: "閫犳垚 5 鐐逛激瀹炽€傜粰浜?2 灞傝櫄寮便€?, img: `${SPELL_URL}/BlindingDart.png`, rarity: "COMMON" },
  "TeemoR": { id: "TeemoR", hero: "Teemo", name: "绉嶈槕鑿?, price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 4, exhaust: true, description: "缁欎簣 4 灞傛槗浼ゃ€傛秷鑰椼€?, img: `${SPELL_URL}/TeemoRCast.png`, rarity: "UNCOMMON" },
  "ZedQ": { id: "ZedQ", hero: "Zed", name: "褰卞ゥ涔夛紒璇稿垉", price: 50, type: "ATTACK", cost: 1, value: 8, description: "閫犳垚 8 鐐逛激瀹炽€?, img: `${SPELL_URL}/ZedQ.png`, rarity: "COMMON" },
  "ZedE": { id: "ZedE", hero: "Zed", name: "褰卞ゥ涔夛紒楝兼柀", price: 80, type: "ATTACK", cost: 1, value: 4, effect: "DRAW", effectValue: 1, description: "閫犳垚 4 鐐逛激瀹炽€傛姄鍙?1 寮犵墝銆?, img: `${SPELL_URL}/ZedE.png`, rarity: "UNCOMMON" },
  "NasusQ": { id: "NasusQ", hero: "Nasus", name: "姹查瓊鐥涘嚮", price: 50, type: "ATTACK", cost: 1, value: 6, description: "閫犳垚 6 鐐逛激瀹炽€?, img: `${SPELL_URL}/NasusQ.png`, rarity: "COMMON" },
  "NasusW": { id: "NasusW", hero: "Nasus", name: "鏋悗", price: 80, type: "SKILL", cost: 1, effect: "WEAK", effectValue: 3, description: "缁欎簣 3 灞傝櫄寮便€?, img: `${SPELL_URL}/NasusW.png`, rarity: "UNCOMMON" },
  "IreliaQ": { id: "IreliaQ", hero: "Irelia", name: "鍒╁垉鍐插嚮", price: 50, type: "ATTACK", cost: 1, value: 8, description: "閫犳垚 8 鐐逛激瀹炽€?, img: `${SPELL_URL}/IreliaQ.png`, rarity: "COMMON" },
  "IreliaE": { id: "IreliaE", hero: "Irelia", name: "姣旂考鍙屽垉", price: 80, type: "SKILL", cost: 1, effect: "VULNERABLE", effectValue: 2, description: "缁欎簣 2 灞傛槗浼ゃ€?, img: `${SPELL_URL}/IreliaE.png`, rarity: "UNCOMMON" },
  "ThreshQ": { id: "ThreshQ", hero: "Thresh_Hero", name: "姝讳骸鍒ゅ喅", price: 80, type: "ATTACK", cost: 2, value: 10, effect: "VULNERABLE", effectValue: 1, description: "閫犳垚 10 鐐逛激瀹炽€傜粰浜?1 灞傛槗浼ゃ€?, img: `${SPELL_URL}/ThreshQ.png`, rarity: "COMMON" },
  "ThreshW": { id: "ThreshW", hero: "Thresh_Hero", name: "榄傚紩涔嬬伅", price: 70, type: "SKILL", cost: 1, block: 10, effect: "DRAW", effectValue: 1, description: "鑾峰緱 10 鐐规姢鐢层€傛姄鍙?1 寮犵墝銆?, img: `${SPELL_URL}/ThreshW.png`, rarity: "UNCOMMON" },
  "KatarinaQ": { id: "KatarinaQ", hero: "Katarina_Hero", name: "寮瑰皠涔嬪垉", price: 50, type: "ATTACK", cost: 1, value: 4, isMultiHit: true, hits: 3, description: "閫犳垚 3 娆?4 鐐逛激瀹炽€?, img: `${SPELL_URL}/KatarinaQ.png`, rarity: "COMMON" },
  "KatarinaE": { id: "KatarinaE", hero: "Katarina_Hero", name: "鐬", price: 40, type: "ATTACK", cost: 0, value: 3, effect: "DRAW", effectValue: 1, description: "閫犳垚 3 鐐逛激瀹炽€傛姄鍙?1 寮犵墝銆?, img: `${SPELL_URL}/KatarinaE.png`, rarity: "UNCOMMON" },
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
      // 闄嶄綆鏀诲嚮鍔?0%锛氬師鏉?floorIndex * 2锛岀幇鍦ㄦ敼涓?floorIndex * 1锛屽苟涓旀暣浣撻檷浣?0%
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
    // Rest鍙湪绗?灞傦紙Boss鍓嶏級鍑虹幇锛屼笖鍙湁10%姒傜巼
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
  // 绗?灞傚浐瀹氫负REST锛圔oss鍓嶏級
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
                {relic.charges !== undefined && <div className="text-xs text-red-400 mt-1">鍓╀綑娆℃暟: {relic.charges}</div>}
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
            audioRef.current.load(); // 閲嶆柊鍔犺浇闊抽
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
        <div className="text-[#C8AA6E] font-serif text-2xl mb-8">绗?{act} 绔?/div>
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
                      {isCompleted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[#C8AA6E] text-4xl font-bold">鉁?/span></div>}
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
                        <div><h2 className="text-3xl font-bold text-[#C8AA6E]">榛戝競鍟嗕汉</h2><p className="text-[#A09B8C] italic">"鍙缁欓挶锛屼粈涔堥兘鍗栥€?</p></div>
                        </div>
                    <div className="flex items-center gap-2 text-4xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-600"><Coins size={32} /> {gold}</div>
                        </div>
                <div className="grid grid-cols-2 gap-12 flex-1 overflow-y-auto">
                    <div>
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-blue-500 pl-3">鎶€鑳藉嵎杞?/h3>
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
                        <h3 className="text-xl text-[#F0E6D2] mb-4 uppercase tracking-widest border-l-4 border-purple-500 pl-3">娴峰厠鏂澶?/h3>
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
                <div className="mt-auto flex justify-end pt-6 border-t border-[#C8AA6E]/30"><button onClick={onLeave} className="px-8 py-3 bg-[#C8AA6E] hover:bg-[#F0E6D2] text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">绂诲紑 <ChevronRight /></button></div>
            </div>
        </div>
    )
}

const ChestView = ({ onLeave, onRelicReward, relics, act }) => {
    // 鏍规嵁褰撳墠绔犺妭杩囨护閬楃墿锛欰CT1鍙兘鑾峰緱閫氱敤閬楃墿锛孉CT2鍙互鑾峰緱ACT1+ACT2锛孉CT3鍙互鑾峰緱鎵€鏈?
    const availableRelics = Object.values(RELIC_DATABASE).filter(r => {
        if (r.rarity === 'PASSIVE' || r.rarity === 'BASIC' || relics.includes(r.id)) return false;
        // 绔犺妭涓撳睘閬楃墿妫€鏌?
        if (r.id === 'Cull' || r.id === 'DarkSeal') return act === 1; // ACT1涓撳睘
        if (r.id === 'QSS' || r.id === 'Executioner') return act >= 2; // ACT2涓撳睘
        if (r.id === 'Nashor') return act >= 3; // ACT3涓撳睘
        return true; // 閫氱敤閬楃墿鎵€鏈夌珷鑺傞兘鍙互鑾峰緱
    });
    const rewards = useMemo(() => shuffle(availableRelics).slice(0, 3), [relics, act]);
    const [rewardChosen, setRewardChosen] = useState(false);
    const handleChoose = (relic) => { if (rewardChosen) return; setRewardChosen(true); onRelicReward(relic); };
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative z-10 max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden bg-black flex items-center justify-center"><img src={`${ITEM_URL}/3400.png`} className="w-full h-full object-cover" /></div>
                <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">娴峰厠鏂疂绠?/h2>
                <p className="text-[#F0E6D2] text-lg mb-8">鎵撳紑瀹濈锛岄€夋嫨涓€浠跺己澶х殑瑁呭鏉ユ瑁呰嚜宸便€?/p>
                <div className="flex justify-center gap-8">
                    {rewards.map((relic) => (
                        <div key={relic.id} onClick={() => handleChoose(relic)} className={`w-36 relative group transition-all p-4 rounded-lg border-2 ${rewardChosen ? 'opacity-40 pointer-events-none' : 'hover:scale-110 cursor-pointer border-[#C8AA6E] shadow-xl hover:shadow-[0_0_20px_#C8AA6E]'}`}>
                            <img src={relic.img} className="w-full h-auto object-cover rounded-lg" />
                            <div className="font-bold text-[#F0E6D2] mt-3">{relic.name}</div>
                            <div className="text-xs text-[#A09B8C] mt-1">{relic.description}</div>
                            {rewardChosen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-3xl font-bold text-green-400">宸查€?/div>}
                        </div>
                    ))}
                </div>
                <button onClick={onLeave} className="mt-8 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest" disabled={!rewardChosen}>鍏抽棴瀹濈</button>
            </div>
        </div>
    );
};

const EventView = ({ onLeave, onReward }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 max-w-2xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#0AC8B9]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#C8AA6E] overflow-hidden"><img src={`${ITEM_URL}/3340.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">绁炵淇″彿</h2>
            <p className="text-[#F0E6D2] text-lg mb-8 leading-relaxed">浣犲湪鑽変笡涓彂鐜颁簡涓€涓仐钀界殑瀹堝崼鐪硷紝鏃佽竟浼间箮杩樻暎钀界潃涓€浜涚墿璧?..</p>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { onReward({ type: 'BUFF', stat: 'strength', value: 2 }); }} className="p-4 bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-red-500"><Sword className="text-red-500" /></div><div><div className="font-bold text-[#F0E6D2]">璁粌</div><div className="text-sm text-slate-400">姘镐箙鑾峰緱 <span className="text-red-400">+2 鍔涢噺</span></div></div></button>
                <button onClick={() => { onReward({ type: 'RELIC_RANDOM' }); }} className="p-4 bg-slate-800 hover:bg-purple-900/50 border border-slate-600 hover:border-purple-500 rounded transition-all flex items-center gap-4 group text-left"><div className="p-3 bg-black rounded border border-slate-700 group-hover:border-purple-500"><Gift className="text-purple-500" /></div><div><div className="font-bold text-[#F0E6D2]">鎼滃</div><div className="text-sm text-slate-400">鑾峰緱涓€浠?<span className="text-purple-400">闅忔満瑁呭</span></div></div></button>
            </div>
        </div>
    </div>
);

const RewardView = ({ onSkip, onCardSelect, goldReward, championName }) => {
  const rewards = useMemo(() => { const all = Object.values(CARD_DATABASE).filter(c => c.rarity!=='BASIC'&&c.rarity!=='PASSIVE'&&(c.hero==='Neutral'||c.hero===championName)); return shuffle(all).slice(0,3); }, [championName]);
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="max-w-4xl bg-[#091428]/90 border-2 border-[#C8AA6E] p-10 text-center rounded-xl shadow-[0_0_50px_#C8AA6E]">
        <h2 className="text-4xl font-bold text-[#C8AA6E] mb-6">濂栧姳</h2>
        <div className="text-2xl text-yellow-400 mb-8 flex items-center justify-center gap-2">
          <Coins size={28} className="text-yellow-400" />
          <span>閲戝竵 +{goldReward}</span>
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
        <button onClick={onSkip} className="mt-6 px-8 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded uppercase tracking-widest transition-all">璺宠繃</button>
      </div>
    </div>
  );
};

const RestView = ({ onRest }) => (
    <div className="absolute inset-0 z-50 bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col gap-8 text-center items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#0AC8B9] overflow-hidden bg-black shadow-[0_0_50px_#0AC8B9]"><img src={`${ITEM_URL}/2003.png`} className="w-full h-full object-cover" /></div>
            <h2 className="text-5xl font-serif text-[#0AC8B9] drop-shadow-[0_0_10px_#0AC8B9]">娉夋按鎲╂伅</h2>
            <button onClick={onRest} className="group w-64 h-80 bg-slate-900/80 border-2 border-[#0AC8B9] rounded-xl flex flex-col items-center justify-center hover:bg-[#0AC8B9]/20 transition-all cursor-pointer">
                <Heart size={64} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-2">鍥炲</h3>
                <p className="text-[#0AC8B9]">鍥炲 30% 鐢熷懡鍊?/p>
            </button>
        </div>
    </div>
);

// --- 涓荤粍浠?---

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
  const [lockedChoices, setLockedChoices] = useState(new Set()); // 涓夐€変竴锛氬凡閿佸畾鐨勯€夐」
  
  const [unlockedChamps, setUnlockedChamps] = useState(() => { 
      try { 
          const d = localStorage.getItem(UNLOCK_KEY); 
          if (!d) return Object.keys(CHAMPION_POOL);
          
          let saved = JSON.parse(d);
          // 淇鏃х増鏈殑ID (Thresh_Hero -> Thresh, Katarina_Hero -> Katarina)
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
          // 搴忓垪鍖?mapData锛屽皢 Map 杞崲涓烘櫘閫氬璞′互渚?JSON.stringify
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
      await unlockAudio(); // 瑙ｉ攣闊抽
      const s = localStorage.getItem(SAVE_KEY);
      if (s) {
          const data = JSON.parse(s);
          // 鎭㈠ nodeMap锛氬鏋滃畠鏄櫘閫氬璞★紝杞崲涓?Map
          const restoredMapData = { ...data.mapData };
          if (restoredMapData.nodeMap && !(restoredMapData.nodeMap instanceof Map)) {
              // 濡傛灉 nodeMap 鏄櫘閫氬璞★紝杞崲涓?Map
              restoredMapData.nodeMap = new Map(Object.entries(restoredMapData.nodeMap));
          } else if (!restoredMapData.nodeMap) {
              // 濡傛灉 nodeMap 涓嶅瓨鍦紝鍒涘缓鏂扮殑 Map
              restoredMapData.nodeMap = new Map();
          }
          setBgmStarted(true); // 绔嬪嵆鍚姩BGM
          setMapData(restoredMapData); setCurrentFloor(data.currentFloor); setCurrentAct(data.currentAct || 1); setMasterDeck(data.masterDeck); setChampion(data.champion); setCurrentHp(data.currentHp); setMaxHp(data.maxHp); setGold(data.gold); setRelics(data.relics); setBaseStr(data.baseStr); setActiveNode(data.activeNode); setUsedEnemies(data.usedEnemies); setView(data.view);
      }
  };

  const handleNewGame = async () => { 
      await unlockAudio(); // 瑙ｉ攣闊抽
      localStorage.removeItem(SAVE_KEY); 
      setHasSave(false); 
      setBgmStarted(true); // 绔嬪嵆鍚姩BGM
      setView('CHAMPION_SELECT'); 
  };

  const handleChampionSelect = (selectedChamp) => {
    // 鎾斁鑻遍泟璇煶
    playChampionVoice(selectedChamp.id);
    setChampion(selectedChamp); 
    setMaxHp(selectedChamp.maxHp); 
    setCurrentHp(selectedChamp.maxHp);
    setMasterDeck([...STARTING_DECK_BASIC, ...selectedChamp.initialCards]);
    setRelics([RELIC_DATABASE[selectedChamp.relicId].id]);
    setBaseStr(0);
    setGold(0);
    
    // 浣跨敤v4鍦板浘鐢熸垚鍣紙甯︽鑳″悓妫€娴嬪拰涓夐€変竴鏈哄埗锛?
    const newMapData = generateGridMap(1, []); // act=1, usedEnemies=[]
    setMapData(newMapData);
    
    // 璁剧疆鍒濆activeNode涓簊tartNode
    if (newMapData.startNode) {
      setActiveNode(newMapData.startNode);
    }
    
    setCurrentFloor(0); 
    setCurrentAct(1); 
    setUsedEnemies([]);
    setLockedChoices(new Set()); // 娓呯┖閿佸畾閫夐」
    setView('MAP');
  };

  const completeNode = () => {
      if (!activeNode || !mapData || !mapData.nodes) return;
      
      // v4鑷敱鎺㈢储绯荤粺锛氭爣璁板綋鍓嶈妭鐐逛负宸叉帰绱?
      const newNodes = [...mapData.nodes];
      const idx = newNodes.findIndex(n => n.row === activeNode.row && n.col === activeNode.col);
      if (idx === -1) return;
      
      // 鏍囪涓哄凡鎺㈢储锛堜笉鍐嶄娇鐢╯tatus锛屼娇鐢╡xplored灞炴€э級
      newNodes[idx].explored = true;
      newNodes[idx].status = 'COMPLETED';
      
      // 鏇存柊mapData锛堜繚鎸乬rid鍜宯odes鍚屾锛?
      const newGrid = mapData.grid ? mapData.grid.map(row => [...row]) : [];
      newNodes.forEach(node => {
        if (newGrid[node.row] && newGrid[node.row][node.col]) {
          newGrid[node.row][node.col] = node;
        }
      });
      
      setMapData({ ...mapData, grid: newGrid, nodes: newNodes });
      
      // 娉ㄦ剰锛氫笉娓呯┖閿佸畾閫夐」锛岄攣瀹氱殑閫夐」搴旇姘镐箙閿佸畾
      // 鍙湁鍦ㄧЩ鍔ㄥ埌鏂拌妭鐐规椂锛屾墠浼氶噸鏂拌绠楀彲鐢ㄩ€夐」锛堜絾宸查攣瀹氱殑閫夐」浠嶇劧閿佸畾锛?
      
      // 妫€鏌ユ槸鍚﹀埌杈綛OSS
      if (activeNode.type === 'BOSS') {
          // 绔犺妭閫氬叧閫昏緫
          if (currentAct < 3) {
              const nextAct = currentAct + 1;
              setCurrentAct(nextAct);
              setCurrentFloor(0);
              const nextMapData = generateGridMap(nextAct, []); // v4鐢熸垚鍣?
              setMapData(nextMapData);
              if (nextMapData.startNode) {
                setActiveNode(nextMapData.startNode);
              }
              // 娓呯┖閿佸畾閫夐」
              setLockedChoices(new Set());
              // 绔犺妭濂栧姳锛氬洖澶?50% 鐢熷懡
              setCurrentHp(Math.min(maxHp, currentHp + Math.floor(maxHp * 0.5)));
              alert(`绗?${currentAct} 绔犻€氬叧锛佽繘鍏ヤ笅涓€绔?..`);
              setView('MAP');
          } else {
              // 娓告垙閫氬叧
              const allIds = Object.keys(CHAMPION_POOL);
              const locked = allIds.filter(id => !unlockedChamps.includes(id));
              if (locked.length > 0) {
                  const newUnlock = locked[Math.floor(Math.random() * locked.length)];
                  const updated = [...unlockedChamps, newUnlock];
                  setUnlockedChamps(updated);
                  localStorage.setItem(UNLOCK_KEY, JSON.stringify(updated));
                  alert(`鎭枩閫氬叧锛佹柊鑻遍泟瑙ｉ攣: ${CHAMPION_POOL[newUnlock].name}`);
              }
              localStorage.removeItem(SAVE_KEY);
              setView('VICTORY_ALL'); 
          }
      } else {
          // 缁х画鎺㈢储锛岃繑鍥炲湴鍥捐鍥?
          setView('MAP');
      }
  };
  
  const handleNodeSelect = (node) => {
      // v4鑷敱鎺㈢储绯荤粺锛氬熀浜庡叚杈瑰舰閭绘帴瑙勫垯锛屼笉渚濊禆DAG
      // 涓夐€変竴鏈哄埗锛氬綋鐜╁閫夋嫨涓€涓妭鐐瑰悗锛岄攣瀹氬叾浠栭€夐」
      
      if (!activeNode) {
          // 璧风偣锛氬彧鑳介€夋嫨璧风偣鏈韩
          if (node.row !== mapData.startNode?.row || node.col !== mapData.startNode?.col) return;
      } else {
          // 妫€鏌ヨ妭鐐规槸鍚﹀湪宸查攣瀹氱殑閫夐」涓?
          const nodeKey = `${node.row}-${node.col}`;
          if (lockedChoices.has(nodeKey)) {
              return; // 宸查攣瀹氱殑閫夐」涓嶈兘閫夋嫨
          }
          
          // 鑾峰彇褰撳墠鑺傜偣鐨勬墍鏈夋湭鎺㈢储閭诲眳锛堟帓闄ゅ凡閿佸畾鐨勯€夐」锛?
          const neighbors = getHexNeighbors(activeNode.row, activeNode.col, mapData.totalFloors || 10, mapData.grid?.[0]?.length || 11);
          const availableNeighbors = neighbors
              .map(([r, c]) => mapData.grid?.[r]?.[c])
              .filter(n => {
                  if (!n || n.explored) return false;
                  // 鎺掗櫎宸查攣瀹氱殑閫夐」
                  const nKey = `${n.row}-${n.col}`;
                  if (lockedChoices.has(nKey)) return false;
                  return true;
              });
          
          // 妫€鏌ラ€夋嫨鐨勮妭鐐规槸鍚︽槸鍙敤閭诲眳
          const isNeighbor = availableNeighbors.some(n => n.row === node.row && n.col === node.col);
          if (!isNeighbor) {
              return; // 涓嶆槸鍙敤閭诲眳锛屼笉鑳介€夋嫨
          }
          
          // 銆愬叧閿慨澶嶃€戜笁閫変竴閿佸畾閫昏緫锛氬彧閿佸畾UI瀹為檯鏄剧ず鐨?涓€夐」涓殑鏈€夋嫨閫夐」
          // 蹇呴』涓嶨ridMapView_v3.jsx鐨刧etAvailableNodes()閫昏緫瀹屽叏涓€鑷?
          let displayedChoices = availableNeighbors;
          if (availableNeighbors.length > 3) {
              // 浣跨敤涓嶶I鐩稿悓鐨勬帓搴忓拰鍝堝笇閫昏緫
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
          
          // 鍙攣瀹歎I鏄剧ず鐨?涓€夐」涓殑鏈€夋嫨閫夐」
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

  // Toast閫氱煡绯荤粺
  const showToast = (message, type = 'default') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const handleBattleWin = (battleResult) => { 
      // 澶勭悊鎴樻枟缁撴灉锛堝彲鑳芥槸鏃ф牸寮忕殑remainingHp鏁板瓧锛屼篃鍙兘鏄柊鏍煎紡鐨勫璞★級
      const result = typeof battleResult === 'number' 
          ? { finalHp: battleResult, gainedStr: 0, gainedMaxHp: 0 }
          : battleResult;
      
      console.log('[鎴樻枟鑳滃埄] battleResult:', result); // 璋冭瘯鏃ュ織
      console.log('[褰撳墠灞炴€ baseStr:', baseStr, 'maxHp:', maxHp); // 璋冭瘯鏃ュ織
      
      // 鐩栦鸡琚姩锛氭垬鏂楃粨鏉熸仮澶岺P
      let passiveHeal = champion.relicId === "GarenPassive" ? 6 : 0; 
      
      // 鍐呯憻鏂鍔細灏嗘垬鏂椾腑鑾峰緱鐨勫姏閲忔案涔呭寲
      if (result.gainedStr > 0) {
          console.log('[鍐呯憻鏂痌 姘镐箙鍔涢噺澧為暱:', result.gainedStr, '鈫?, baseStr + result.gainedStr); // 璋冭瘯鏃ュ織
          setBaseStr(prev => prev + result.gainedStr);
          showToast(`姘镐箙鍔涢噺 +${result.gainedStr}`, 'strength');
      }
      
      // 閿ょ煶琚姩锛氭案涔呭鍔犳渶澶х敓鍛藉€?
      if (result.gainedMaxHp > 0) {
          console.log('[閿ょ煶] 鏈€澶P澧為暱:', result.gainedMaxHp, '鈫?, maxHp + result.gainedMaxHp); // 璋冭瘯鏃ュ織
          setMaxHp(prev => prev + result.gainedMaxHp);
          passiveHeal += result.gainedMaxHp; // 鏈€澶P澧為暱涔熺畻浣滄仮澶?
          showToast(`鏈€澶х敓鍛藉€?+${result.gainedMaxHp}`, 'maxHp');
      }
      
      // 鍗＄墝澶у笀琚姩锛氭垬鏂楄儨鍒╅澶栭噾甯?
      if (champion && champion.relicId === "TwistedFatePassive") {
          console.log('[鍗＄墝澶у笀] 鑾峰緱棰濆閲戝竵: +15'); // 璋冭瘯鏃ュ織
          setGold(prev => prev + 15);
          showToast('鐏岄搮楠板瓙: +15 閲戝竵', 'gold');
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
          // 闅忔満鍗囩骇涓€寮犲崱
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
      // 鍗囩骇鎸囧畾鍗＄墝锛堟壘鍒扮涓€涓尮閰嶇殑鏈崌绾х増鏈級
      const idx = masterDeck.findIndex(id => id === cardId);
      if (idx !== -1) {
          const newDeck = [...masterDeck];
          newDeck[idx] = cardId + '+';
          setMasterDeck(newDeck);
          setGold(prev => prev - 100);
      }
  };
  
  const handleBuyMana = () => {
      // 澧炲姞鏈€澶ф硶鍔涘€?(杩欓噷闇€瑕?GameState 鏀寔锛屾垨鑰呯敱 Relic 瀹炵幇锛岀畝鍖栬捣瑙侊紝鎴戜滑娣诲姞涓€涓壒娈婄殑琚姩閬楃墿)
      // 鐢变簬娌℃湁鐩存帴鐨?maxMana 鐘舵€侊紙鍐欐鍦?BattleScene锛夛紝鎴戜滑闇€瑕侀€氳繃閬楃墿鏉ヤ慨鏀?
      // 鎴栬€呭湪 App 涓坊鍔?maxMana 鐘舵€佷紶缁?BattleScene
      // 杩欓噷绠€鍗曞疄鐜帮細娣诲姞涓€涓殣钘忛仐鐗?"ManaGem"
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
    // 鏍规嵁闊虫晥绫诲瀷璋冩暣闊抽噺
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
                  <div className="z-10 text-center"><h1 className="text-8xl font-black text-[#C8AA6E] mb-8 drop-shadow-lg tracking-widest">宄¤胺灏栧</h1><div className="flex flex-col gap-4 w-64 mx-auto">{hasSave && (<button onClick={handleContinue} className="px-8 py-4 bg-[#0AC8B9] hover:bg-white hover:text-[#0AC8B9] text-black font-bold rounded flex items-center justify-center gap-2 transition-all"><Play fill="currentColor" /> 缁х画寰佺▼</button>)}<button onClick={handleNewGame} className="px-8 py-4 border-2 border-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-black text-[#C8AA6E] font-bold rounded flex items-center justify-center gap-2 transition-all"><RotateCcw /> 鏂版父鎴?/button></div><p className="mt-8 text-slate-400 text-sm">v0.8.0 Beta</p></div>
                  {showUpdateLog && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
                          <div className="max-w-2xl bg-[#091428]/95 border-2 border-[#C8AA6E] p-8 rounded-xl shadow-[0_0_50px_#C8AA6E]">
                              <h2 className="text-3xl font-bold text-[#C8AA6E] mb-6 text-center">v0.8.0 (褰撳墠鐗堟湰) 鏇存柊鏃ュ織</h2>
                              <div className="space-y-4 text-left max-h-96 overflow-y-auto">
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 鍏ㄨ嫳闆勫疄瑁?/div>
                                      <div className="text-sm text-[#A09B8C]">鑻遍泟姹犳墿鍏呰嚦 20 浣嶏紝鍖呭惈鐟炴枃銆佸崱鐗屻€佺洸鍍х瓑鏂拌嫳闆勶紝涓旀瘡浣嶈嫳闆勬嫢鏈夌嫭鐗圭殑鍒濆鍗＄粍鍜岃鍔ㄩ仐鐗┿€?/div>
                                  </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 涓夌珷鑺傜郴缁?/div>
                                      <div className="text-sm text-[#A09B8C]">姝ｅ紡瀹炶 Act 1 (宄¤胺), Act 2 (鏆楀奖宀?, Act 3 (铏氱┖) 鐨勫畬鏁存祦绋嬶紝鍖呭惈涓撳睘鏁屼汉鍜?Boss銆?/div>
                                  </div>
                                  <div className="border-l-4 border-green-500 pl-4">
                                      <div className="font-bold text-green-400 mb-1">[Feature] 璧勫阀涓撳睘閬楃墿</div>
                                      <div className="text-sm text-[#A09B8C]">鏂板浜嗗彧鑳藉湪鐗瑰畾绔犺妭鑾峰彇鐨勫己鍔涢仐鐗╋紙濡?Act 3 鐨勭撼浠€涔嬬墮锛夈€?/div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 鐗屽簱鎵撶┖ Bug</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 鍘勫姞鐗瑰洖琛€ Bug</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 鍦板浘璺緞閫昏緫</div>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                      <div className="font-bold text-blue-400 mb-1">[Fix] 璧勬簮閾炬帴</div>
                                      <div className="text-sm text-[#A09B8C]">鍏ㄩ潰鏍″浜?20 浣嶈嫳闆勭殑鎶€鑳藉浘鏍囥€佸ご鍍忓拰 Loading 鍥撅紝淇浜嗘墍鏈?broken image銆?/div>
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
                                  鍏抽棴
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
          case 'VICTORY_ALL': return <div className="h-screen w-full bg-[#0AC8B9]/20 flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-[#0AC8B9]">浼犲姘镐笉鐔勭伃锛?/h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-[#0AC8B9] text-black font-bold rounded">鍥炲埌鑿滃崟</button></div>;
          case 'GAMEOVER': return <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white"><h1 className="text-6xl font-bold text-red-600">鎴樿触</h1><button onClick={() => setView('MENU')} className="mt-8 px-8 py-3 bg-red-800 rounded font-bold">鍥炲埌鑿滃崟</button></div>;
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
                          {/* 閬楃墿鏍?- 绱ч偦琚姩鎶€鑳藉彸渚?*/}
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
