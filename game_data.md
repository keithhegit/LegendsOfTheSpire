# Legends of the Spire - 游戏数据手册

> **版本**: new_map (Latest)  
> **更新时间**: 2025-11-21

---

## 📖 目录

1. [英雄数据](#英雄数据)
2. [卡牌数据](#卡牌数据)
3. [敌人数据](#敌人数据)
4. [遗物数据](#遗物数据)
5. [平衡性修复日志](./BALANCE_FIXES_SUMMARY.md) 🔗 外部文档

---

## 英雄数据

### 基础属性对比表

| 英雄 | 生命值 | 法力值 | 被动技能 | 初始卡组 | 定位 |
|------|--------|--------|----------|----------|------|
| **盖伦** (Garen) | 80 | 3 | 坚韧：战斗结束恢复6HP | GarenQ, GarenW, Ignite, Defend | 坦克/持续作战 |
| **德莱厄斯** (Darius) | 90 | 3 | 出血：攻击给予1层虚弱 | DariusW, DariusE, Strike, Ignite | 战士/力量流 |
| **拉克丝** (Lux) | 70 | 3 | 光芒四射：回合开始+1法力 | LuxQ, LuxE, Heal, Ignite | 法师/高费控制 |
| **金克丝** (Jinx) | 75 | 3 | 爆发：回合开始手牌+1 | JinxQ, JinxW, Strike, Strike | 射手/连击爆发 |
| **亚索** (Yasuo) | 78 | 3 | 浪客之道：暴击+10% | YasuoQ, YasuoE, Defend, Defend | 剑客/暴击流 |
| **娑娜** (Sona) | 72 | 3 | 能量弦：第3张卡+3护甲 | SonaQ, SonaW, Defend, Heal | 辅助/治疗 |
| **艾克** (Ekko) | 82 | 3 | Z型共振：消耗卡+1力量 | EkkoQ, EkkoE, Defend, Ignite | 刺客/成长流 |
| **塞拉斯** (Sylas) | 85 | 3 | 叛乱：技能牌恢复3HP | SylasQ, SylasW, Strike, Defend | 斗士/吸血 |
| **厄加特** (Urgot) | 100 | 3 | 回火：战斗开始+15护甲 | UrgotQ, UrgotW, Defend, Defend | 坦克/高生命 |
| **维克托** (Viktor) | 70 | 3 | 光荣进化：50%获得额外基础卡 | ViktorQ, ViktorE, Ignite, Heal | 法师/抽牌 |
| **瑞文** (Riven) | 75 | 3 | 符文之刃：每打出3张攻击牌获得1点能量 | RivenQ, RivenE, Strike, Defend | 战士/连招 |
| **卡牌大师** (TwistedFate) | 70 | 3 | 灌铅骰子：战斗胜利额外+15金币 | TwistedFateW, TwistedFateQ, Strike, Ignite | 法师/经济 |
| **盲僧** (LeeSin) | 80 | 3 | 疾风骤雨：技能牌后下张攻击-1费 | LeeSinQ, LeeSinW, Strike, Defend | 战士/节奏 |
| **薇恩** (Vayne) | 70 | 3 | 圣银弩箭：连续3次伤害额外10伤 | VayneQ, VayneE, Strike, Strike | 射手/单体 |
| **提莫** (Teemo) | 65 | 3 | 游击战：回合开始随机给敌人2层虚弱 | TeemoQ, TeemoR, Strike, Ignite | 射手/DoT |
| **劫** (Zed) | 75 | 3 | 影分身：首张攻击牌重复50%伤害 | ZedQ, ZedE, Strike, Strike | 刺客/爆发 |
| **内瑟斯** (Nasus) | 85 | 3 | 汲魂痛击：击杀敌人+1力量 | NasusQ, NasusW, Strike, Defend | 战士/成长 |
| **艾瑞莉娅** (Irelia) | 75 | 3 | 热诚：击杀敌人恢复1能量抽1牌 | IreliaQ, IreliaE, Strike, Defend | 战士/收割 |
| **锤石** (Thresh) | 90 | 3 | 地狱诅咒：敌人死亡+2最大生命 | ThreshQ, ThreshW, Strike, Defend | 坦克/成长 |
| **卡特琳娜** (Katarina) | 70 | 3 | 贪婪：每第4张攻击牌伤害翻倍 | KatarinaQ, KatarinaE, Strike, Strike | 刺客/计数器 |

> **注**：已实装全部20位英雄！

---

## 英雄技能图标资源表

> **用途**: 用于排查 broken image 问题，所有图标URL基于 `SPELL_URL` 和 `PASSIVE_URL` 常量

### 图标URL前缀
- **技能图标**: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/`
- **被动图标**: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/passive/`
- **物品图标**: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/`

### 盖伦 (Garen) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 坚韧 | 被动 | `Garen_Passive.png` | `${PASSIVE_URL}/Garen_Passive.png` | ✅ |
| 致命打击 (Q) | 攻击 | `GarenQ.png` | `${SPELL_URL}/GarenQ.png` | ✅ |
| 勇气 (W) | 技能 | `GarenW.png` | `${SPELL_URL}/GarenW.png` | ✅ |
| 审判 (E) | 攻击 | `GarenE.png` | `${SPELL_URL}/GarenE.png` | ✅ |
| 德玛西亚正义 (R) | 攻击 | `GarenR.png` | `${SPELL_URL}/GarenR.png` | ✅ |

### 德莱厄斯 (Darius) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 出血 | 被动 | `Garen_Passive.png` | `${PASSIVE_URL}/Garen_Passive.png` | ⚠️ 占位符 |
| 致残打击 (Q) | 攻击 | `DariusNoxianTacticsONH.png` | `${SPELL_URL}/DariusNoxianTacticsONH.png` | ✅ |
| 无情铁手 (W) | 技能 | `SummonerBarrier.png` | `${SPELL_URL}/SummonerBarrier.png` | ⚠️ 通用图标 |
| 大杀四方 (E) | 攻击 | `DariusCleave.png` | `${SPELL_URL}/DariusCleave.png` | ✅ |
| 诺克萨斯断头台 (R) | 攻击 | `DariusExecute.png` | `${SPELL_URL}/DariusExecute.png` | ✅ |

### 拉克丝 (Lux) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 光芒四射 | 被动 | `LuxIllumination.png` | `${PASSIVE_URL}/LuxIllumination.png` | ✅ |
| 光之束缚 (Q) | 技能 | `LuxLightBinding.png` | `${SPELL_URL}/LuxLightBinding.png` | ✅ |
| 透光奇点 (E) | 攻击 | `LuxLightStrikeKage.png` | `${SPELL_URL}/LuxLightStrikeKage.png` | ✅ |
| 终极闪光 (R) | 攻击 | `LuxR.png` | `${SPELL_URL}/LuxR.png` | ✅ |

### 金克丝 (Jinx) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 爆发 | 被动 | `Jinx_Passive.png` | `${PASSIVE_URL}/Jinx_Passive.png` | ✅ |
| 切自动挡 (Q) | 攻击 | `JinxQ.png` | `${SPELL_URL}/JinxQ.png` | ✅ |
| 震荡电磁波 (W) | 攻击 | `JinxW.png` | `${SPELL_URL}/JinxW.png` | ✅ |
| 超究极死神飞弹 (R) | 攻击 | `JinxR.png` | `${SPELL_URL}/JinxR.png` | ✅ |

### 亚索 (Yasuo) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 浪客之道 | 被动 | `Yasuo_Passive.png` | `${PASSIVE_URL}/Yasuo_Passive.png` | ✅ |
| 斩钢闪 (Q) | 攻击 | `YasuoQ1Wrapper.png` | `${SPELL_URL}/YasuoQ1Wrapper.png` | ✅ |
| 踏前斩 (E) | 攻击 | `YasuoDashWrapper.png` | `${SPELL_URL}/YasuoDashWrapper.png` | ✅ |
| 狂风绝息斩 (R) | 攻击 | `YasuoR.png` | `${SPELL_URL}/YasuoR.png` | ✅ |

### 娑娜 (Sona) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 能量弦 | 被动 | `Sona_Passive.png` | `${PASSIVE_URL}/Sona_Passive.png` | ✅ |
| 英勇赞美诗 (Q) | 攻击 | `SonaHymnofValor.png` | `${SPELL_URL}/SonaHymnofValor.png` | ✅ |
| 坚毅咏叹调 (W) | 技能 | `SonaAriaofPerseverance.png` | `${SPELL_URL}/SonaAriaofPerseverance.png` | ✅ |
| 狂舞终乐章 (R) | 技能 | `SonaR.png` | `${SPELL_URL}/SonaR.png` | ✅ |

### 艾克 (Ekko) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| Z型驱动共振 | 被动 | `Ekko_P.png` | `${PASSIVE_URL}/Ekko_P.png` | ✅ |
| 时间卷曲器 (Q) | 攻击 | `EkkoQ.png` | `${SPELL_URL}/EkkoQ.png` | ✅ |
| 相位俯冲 (E) | 技能 | `EkkoE.png` | `${SPELL_URL}/EkkoE.png` | ✅ |
| 时空断裂 (R) | 混合 | `EkkoR.png` | `${SPELL_URL}/EkkoR.png` | ✅ |

### 塞拉斯 (Sylas) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 叛乱 | 被动 | `SylasP.png` | `${PASSIVE_URL}/SylasP.png` | ✅ |
| 锁链鞭击 (Q) | 攻击 | `SylasQ.png` | `${SPELL_URL}/SylasQ.png` | ✅ |
| 弑君突刺 (W) | 技能 | `SylasW.png` | `${SPELL_URL}/SylasW.png` | ✅ |
| 其人之道 (R) | 技能 | `SylasR.png` | `${SPELL_URL}/SylasR.png` | ✅ |

### 厄加特 (Urgot) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 回火 | 被动 | `Urgot_Passive.png` | `${PASSIVE_URL}/Urgot_Passive.png` | ✅ |
| 腐蚀电荷 (Q) | 攻击 | `UrgotQ.png` | `${SPELL_URL}/UrgotQ.png` | ✅ |
| 净除 (W) | 技能 | `UrgotW.png` | `${SPELL_URL}/UrgotW.png` | ✅ |
| 超越死亡的恐惧 (R) | 攻击 | `UrgotR.png` | `${SPELL_URL}/UrgotR.png` | ✅ |

### 维克托 (Viktor) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 光荣进化 | 被动 | `Viktor_Passive.png` | `${PASSIVE_URL}/Viktor_Passive.png` | ✅ |
| 能量转移 (Q) | 混合 | `ViktorPowerTransfer.png` | `${SPELL_URL}/ViktorPowerTransfer.png` | ✅ |
| 死亡射线 (E) | 攻击 | `ViktorDeathRay.png` | `${SPELL_URL}/ViktorDeathRay.png` | ✅ |
| 混乱风暴 (R) | 攻击 | `ViktorChaosStorm.png` | `${SPELL_URL}/ViktorChaosStorm.png` | ✅ |

### 瑞文 (Riven) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 符文之刃 | 被动 | `RivenRunicBlades.png` | `${PASSIVE_URL}/RivenRunicBlades.png` | ✅ |
| 折翼之舞 (Q) | 攻击 | `RivenTriCleave.png` | `${SPELL_URL}/RivenTriCleave.png` | ✅ |
| 镇魂怒吼 (W) | 技能 | `RivenMartyr.png` | `${SPELL_URL}/RivenMartyr.png` | ✅ |
| 勇往直前 (E) | 技能 | `RivenFeint.png` | `${SPELL_URL}/RivenFeint.png` | ✅ |
| 放逐之刃 (R) | 攻击 | `RivenFengShuiEngine.png` | `${SPELL_URL}/RivenFengShuiEngine.png` | ✅ |

### 卡牌大师 (TwistedFate) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 灌铅骰子 | 被动 | `CardMaster_SealFate.png` | `${PASSIVE_URL}/CardMaster_SealFate.png` | ✅ |
| 万能牌 (Q) | 攻击 | `WildCards.png` | `${SPELL_URL}/WildCards.png` | ✅ |
| 选牌 (W) | 技能 | `PickACard.png` | `${SPELL_URL}/PickACard.png` | ✅ |
| 命运 (R) | 技能 | `Destiny.png` | `${SPELL_URL}/Destiny.png` | ✅ |

### 盲僧 (LeeSin) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 疾风骤雨 | 被动 | `LeeSinPassive.png` | `${PASSIVE_URL}/LeeSinPassive.png` | ✅ |
| 天音波 (Q) | 攻击 | `BlindMonkQOne.png` | `${SPELL_URL}/BlindMonkQOne.png` | ✅ |
| 金钟罩 (W) | 技能 | `BlindMonkWOne.png` | `${SPELL_URL}/BlindMonkWOne.png` | ✅ |
| 猛龙摆尾 (R) | 攻击 | `BlindMonkRKick.png` | `${SPELL_URL}/BlindMonkRKick.png` | ✅ |

### 薇恩 (Vayne) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 圣银弩箭 | 被动 | `Vayne_SilveredBolts.png` | `${PASSIVE_URL}/Vayne_SilveredBolts.png` | ✅ |
| 闪避突袭 (Q) | 攻击 | `VayneTumble.png` | `${SPELL_URL}/VayneTumble.png` | ✅ |
| 恶魔审判 (E) | 攻击 | `VayneCondemn.png` | `${SPELL_URL}/VayneCondemn.png` | ✅ |
| 终极时刻 (R) | 技能 | `VayneInquisition.png` | `${SPELL_URL}/VayneInquisition.png` | ✅ |

### 提莫 (Teemo) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 游击战 | 被动 | `Teemo_P.png` | `${PASSIVE_URL}/Teemo_P.png` | ✅ |
| 致盲吹箭 (Q) | 攻击 | `BlindingDart.png` | `${SPELL_URL}/BlindingDart.png` | ✅ |
| 小跑 (W) | 技能 | `SummonerHaste.png` | `${SPELL_URL}/SummonerHaste.png` | ⚠️ 通用图标 |
| 致命毒刺 (R) | 攻击 | `TeemoRCast.png` | `${SPELL_URL}/TeemoRCast.png` | ✅ |

### 劫 (Zed) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 影分身 | 被动 | `Zed_Passive.png` | `${PASSIVE_URL}/Zed_Passive.png` | ✅ |
| 影奥义！诸刃 (Q) | 攻击 | `ZedQ.png` | `${SPELL_URL}/ZedQ.png` | ✅ |
| 影奥义！鬼斩 (E) | 攻击 | `ZedE.png` | `${SPELL_URL}/ZedE.png` | ✅ |
| 禁奥义！瞬狱影杀阵 (R) | 攻击 | `ZedR.png` | `${SPELL_URL}/ZedR.png` | ✅ |

### 内瑟斯 (Nasus) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 汲魂痛击 | 被动 | `Nasus_Passive.png` | `${PASSIVE_URL}/Nasus_Passive.png` | ✅ |
| 汲魂痛击 (Q) | 攻击 | `NasusQ.png` | `${SPELL_URL}/NasusQ.png` | ✅ |
| 枯萎 (W) | 技能 | `NasusW.png` | `${SPELL_URL}/NasusW.png` | ✅ |
| 死神降临 (R) | 混合 | `NasusR.png` | `${SPELL_URL}/NasusR.png` | ✅ |

### 艾瑞莉娅 (Irelia) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 热诚 | 被动 | `Irelia_Passive.png` | `${PASSIVE_URL}/Irelia_Passive.png` | ✅ |
| 利刃冲击 (Q) | 攻击 | `IreliaQ.png` | `${SPELL_URL}/IreliaQ.png` | ✅ |
| 比翼双刃 (E) | 技能 | `IreliaE.png` | `${SPELL_URL}/IreliaE.png` | ✅ |
| 先锋之刃 (R) | 攻击 | `IreliaR.png` | `${SPELL_URL}/IreliaR.png` | ✅ |

### 锤石 (Thresh) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 地狱诅咒 | 被动 | `Thresh_Passive.png` | `${PASSIVE_URL}/Thresh_Passive.png` | ✅ |
| 死亡判决 (Q) | 攻击 | `ThreshQ.png` | `${SPELL_URL}/ThreshQ.png` | ✅ |
| 魂引之灯 (W) | 技能 | `ThreshW.png` | `${SPELL_URL}/ThreshW.png` | ✅ |
| 幽冥监牢 (R) | 技能 | `ThreshR.png` | `${SPELL_URL}/ThreshR.png` | ✅ |

### 卡特琳娜 (Katarina) 技能图标

| 技能 | 类型 | 图标文件名 | 完整URL | 状态 |
|------|------|-----------|---------|------|
| 贪婪 | 被动 | `Katarina_Passive.png` | `${PASSIVE_URL}/Katarina_Passive.png` | ✅ |
| 弹射之刃 (Q) | 攻击 | `KatarinaQ.png` | `${SPELL_URL}/KatarinaQ.png` | ✅ |
| 瞬步 (E) | 攻击 | `KatarinaE.png` | `${SPELL_URL}/KatarinaE.png` | ✅ |
| 死亡莲华 (R) | 攻击 | `KatarinaR.png` | `${SPELL_URL}/KatarinaR.png` | ✅ |

### 通用卡牌图标

| 卡牌 | 图标文件名 | 完整URL | 状态 |
|------|-----------|---------|------|
| 打击 (Strike) | `SummonerFlash.png` | `${SPELL_URL}/SummonerFlash.png` | ⚠️ 通用图标 |
| 防御 (Defend) | `SummonerBarrier.png` | `${SPELL_URL}/SummonerBarrier.png` | ⚠️ 通用图标 |
| 点燃 (Ignite) | `SummonerDot.png` | `${SPELL_URL}/SummonerDot.png` | ⚠️ 通用图标 |
| 治疗术 (Heal) | `SummonerHeal.png` | `${SPELL_URL}/SummonerHeal.png` | ⚠️ 通用图标 |

---

## 卡牌数据

### 通用卡牌 (Neutral)

#### 基础卡 (BASIC)

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **打击** (Strike) | 1 | 攻击 | 造成6点伤害 | BASIC | 0 |
| **防御** (Defend) | 1 | 技能 | 获得5点护甲 | BASIC | 0 |

#### 进阶卡 (UNCOMMON)

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **点燃** (Ignite) | 0 | 技能 | 获得2点力量。**消耗** | UNCOMMON | 80 |
| **治疗术** (Heal) | 1 | 技能 | 恢复10点生命。**消耗** | UNCOMMON | 80 |

---

### 盖伦 (Garen) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **致命打击** (GarenQ) | 1 | 攻击 | 造成8点伤害，给予2层易伤 | COMMON | 50 |
| **勇气** (GarenW) | 1 | 技能 | 获得12点护甲，净化所有负面状态 | UNCOMMON | 50 |
| **审判** (GarenE) | 2 | 攻击 | 造成**3次**6点伤害 (总18伤) | UNCOMMON | 80 |
| **德玛西亚正义** (GarenR) | 3 | 攻击 | 造成30点巨额伤害 | **RARE** | 150 |

---

### 德莱厄斯 (Darius) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **致残打击** (DariusW) | 1 | 攻击 | 造成10点伤害，给予1层虚弱 | COMMON | 60 |
| **无情铁手** (DariusE) | 2 | 技能 | 抓取1张牌，给予3层易伤 | UNCOMMON | 80 |
| **大杀四方** (DariusQ) | 1 | 攻击 | 对所有敌人造成8点伤害，回复3HP | UNCOMMON | 80 |
| **诺克萨斯断头台** (DariusR) | 3 | 攻击 | 造成40点**真实伤害** | **RARE** | 150 |

---

### 拉克丝 (Lux) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **光之束缚** (LuxQ) | 1 | 技能 | 给予3层易伤 | COMMON | 70 |
| **透光奇点** (LuxE) | 2 | 攻击 | 造成15点伤害。**消耗** | UNCOMMON | 120 |
| **终极闪光** (LuxR) | 3 | 攻击 | 对所有敌人造成25点伤害 (AOE) | **RARE** | 150 |

---

### 金克丝 (Jinx) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **切自动挡** (JinxQ) | 0 | 攻击 | 造成**2次**4点伤害 (总8伤) | COMMON | 40 |
| **震荡电磁波** (JinxW) | 2 | 攻击 | 造成20点伤害，给予2层虚弱 | UNCOMMON | 90 |
| **超究极死神飞弹** (JinxR) | 3 | 攻击 | 对所有敌人造成35点伤害 (AOE) | **RARE** | 150 |

---

### 亚索 (Yasuo) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **斩钢闪** (YasuoQ) | 0 | 攻击 | 造成4点伤害 | COMMON | 40 |
| **踏前斩** (YasuoE) | 1 | 攻击 | 造成8点伤害，获得1点力量 | UNCOMMON | 70 |
| **狂风绝息斩** (YasuoR) | 2 | 攻击 | 造成**3次**20点伤害 (总60伤) | **RARE** | 150 |

---

### 娑娜 (Sona) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **英勇赞美诗** (SonaQ) | 1 | 攻击 | 造成7点伤害，回复3HP | COMMON | 50 |
| **坚毅咏叹调** (SonaW) | 1 | 技能 | 获得8点护甲，回复5HP | UNCOMMON | 80 |
| **狂舞终乐章** (SonaR) | 3 | 技能 | 给予所有敌人3层虚弱 (群体晕眩简化版) | **RARE** | 150 |

---

### 艾克 (Ekko) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **时间卷曲器** (EkkoQ) | 1 | 攻击 | 造成12点伤害。**消耗** | COMMON | 50 |
| **相位俯冲** (EkkoE) | 0 | 技能 | 获得5点护甲。**消耗** | UNCOMMON | 90 |
| **时空断裂** (EkkoR) | 3 | 混合 | 回复20HP，造成20点伤害 | **RARE** | 150 |

---

### 塞拉斯 (Sylas) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **锁链鞭击** (SylasQ) | 1 | 攻击 | 造成**2次**7点伤害 (总14伤) | COMMON | 50 |
| **弑君突刺** (SylasW) | 1 | 技能 | 回复15HP | UNCOMMON | 90 |
| **其人之道** (SylasR) | 0 | 技能 | 随机获得一张强力卡 (简化版) | **RARE** | 150 |

---

### 厄加特 (Urgot) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **腐蚀电荷** (UrgotQ) | 1 | 攻击 | 造成8点伤害，给予1层虚弱 | COMMON | 50 |
| **净除** (UrgotW) | 1 | 技能 | 获得8点护甲，给予敌人1层易伤 | UNCOMMON | 90 |
| **超越死亡的恐惧** (UrgotR) | 3 | 攻击 | 造成50点巨额伤害 | **RARE** | 150 |

---

### 维克托 (Viktor) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **能量转移** (ViktorQ) | 0 | 混合 | 造成3点伤害，获得3点护甲 | COMMON | 40 |
| **死亡射线** (ViktorE) | 2 | 攻击 | 造成18点伤害 | UNCOMMON | 100 |
| **混乱风暴** (ViktorR) | 3 | 攻击 | 造成**6次**5点伤害 (总30伤) | **RARE** | 150 |

---

### 瑞文 (Riven) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **折翼之舞** (RivenQ) | 0 | 攻击 | 造成4点伤害 | COMMON | 50 |
| **勇往直前** (RivenE) | 1 | 技能 | 获得5点护甲，抓取1张牌 | UNCOMMON | 80 |
| **放逐之刃** (RivenR) | 3 | 攻击 | 造成**3次**12点伤害 (总36伤) | **RARE** | 150 |

---

### 卡牌大师 (TwistedFate) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **选牌** (TwistedFateW) | 1 | 技能 | 抓取2张牌 (简化版选牌) | COMMON | 60 |
| **万能牌** (TwistedFateQ) | 2 | 攻击 | 造成8点伤害 | COMMON | 90 |
| **命运** (TwistedFateR) | 2 | 技能 | 抓取3张牌 (全图视野简化) | **RARE** | 150 |

---

### 盲僧 (LeeSin) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **天音波** (LeeSinQ) | 1 | 攻击 | 造成6点伤害，给予1层易伤 | COMMON | 50 |
| **金钟罩** (LeeSinW) | 1 | 技能 | 获得8点护甲 | UNCOMMON | 80 |
| **猛龙摆尾** (LeeSinR) | 2 | 攻击 | 造成25点伤害 | **RARE** | 150 |

---

### 薇恩 (Vayne) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **闪避突袭** (VayneQ) | 0 | 攻击 | 造成4点伤害 | COMMON | 40 |
| **恶魔审判** (VayneE) | 2 | 攻击 | 造成12点伤害，给予2层虚弱 | UNCOMMON | 90 |
| **终极时刻** (VayneR) | 2 | 技能 | 获得3点力量 | **RARE** | 150 |

---

### 提莫 (Teemo) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **致盲吹箭** (TeemoQ) | 1 | 攻击 | 造成5点伤害，给予2层虚弱 | COMMON | 50 |
| **种蘑菇** (TeemoR) | 1 | 技能 | 给予4层易伤。**消耗** | UNCOMMON | 80 |

---

### 劫 (Zed) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **影奥义！诸刃** (ZedQ) | 1 | 攻击 | 造成8点伤害 | COMMON | 50 |
| **影奥义！鬼斩** (ZedE) | 1 | 攻击 | 造成4点伤害，抓取1张牌 | UNCOMMON | 80 |
| **禁奥义！瞬狱影杀阵** (ZedR) | 3 | 攻击 | 造成35点伤害 | **RARE** | 150 |

---

### 内瑟斯 (Nasus) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **汲魂痛击** (NasusQ) | 1 | 攻击 | 造成6点伤害 | COMMON | 50 |
| **枯萎** (NasusW) | 1 | 技能 | 给予3层虚弱 | UNCOMMON | 80 |
| **死神降临** (NasusR) | 3 | 混合 | 获得5点力量，造成20点伤害 | **RARE** | 150 |

---

### 艾瑞莉娅 (Irelia) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **利刃冲击** (IreliaQ) | 1 | 攻击 | 造成8点伤害 | COMMON | 50 |
| **比翼双刃** (IreliaE) | 1 | 技能 | 给予2层易伤 | UNCOMMON | 80 |
| **先锋之刃** (IreliaR) | 3 | 攻击 | 造成**4次**8点伤害 (总32伤) | **RARE** | 150 |

---

### 锤石 (Thresh) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **死亡判决** (ThreshQ) | 2 | 攻击 | 造成10点伤害，给予1层易伤 | COMMON | 80 |
| **魂引之灯** (ThreshW) | 1 | 技能 | 获得10点护甲，抓取1张牌 | UNCOMMON | 70 |
| **幽冥监牢** (ThreshR) | 2 | 技能 | 给予3层虚弱和3层易伤 | **RARE** | 150 |

---

### 卡特琳娜 (Katarina) 专属卡牌

| 卡牌 | 费用 | 类型 | 效果 | 稀有度 | 价格 |
|------|------|------|------|--------|------|
| **弹射之刃** (KatarinaQ) | 1 | 攻击 | 造成**3次**4点伤害 (总12伤) | COMMON | 50 |
| **瞬步** (KatarinaE) | 0 | 攻击 | 造成3点伤害，抓取1张牌 | UNCOMMON | 40 |
| **死亡莲华** (KatarinaR) | 3 | 攻击 | 造成**6次**6点伤害 (总36伤) | **RARE** | 150 |

---

### 卡牌稀有度说明

| 稀有度 | 颜色标识 | 获取途径 | 特点 |
|--------|----------|----------|------|
| **BASIC** | 白色 | 初始卡组 | 基础攻击/防御，0费/1费 |
| **COMMON** | 灰色 | 战斗奖励/商店 | 英雄特色Q技能，通常1费 |
| **UNCOMMON** | 蓝色 | 战斗奖励/商店 | 英雄W/E技能，1-2费，效果更强 |
| **RARE** | 金色 | 战斗奖励(20%)/商店 | R技能(终结技)，3费，高伤害/特效 |

---

## 敌人数据

### Act 1 敌人 (诺克萨斯战线)

#### T1 敌人 (难度★☆☆)

| 敌人 | 生命值 | 行动模式 | 威胁等级 |
|------|--------|----------|----------|
| **卡特琳娜** (Katarina)<br>*不祥之刃* | 42 | • **瞬步连击**：2次6伤 (总12伤)<br>• **死亡莲华**：给予2层易伤<br>• **匕首投掷**：15点单体伤害 | ★☆☆ |
| **泰隆** (Talon)<br>*刀锋之影* | 48 | • **诺克萨斯外交**：12点伤害<br>• **刺客诡道**：2次8伤 (总16伤)<br>• **翻墙跑路**：获得10点护甲 | ★☆☆ |

#### T2 敌人 (难度★★☆)

| 敌人 | 生命值 | 行动模式 | 威胁等级 |
|------|--------|----------|----------|
| **塞拉斯** (Sylas_E)<br>*解脱者* | 65 | • **锁链鞭击**：10点伤害<br>• **弑君突刺**：给予2层虚弱<br>• **其人之道**：3次5伤 (总15伤) | ★★☆ |
| **卢锡安** (Lucian)<br>*圣枪游侠* | 60 | • **圣光银弹**：2次7伤 (总14伤)<br>• **热诚**：获得12点护甲<br>• **冷酷追击**：8伤+1层虚弱 | ★★☆ |
| **菲奥娜** (Fiora)<br>*无双剑姬* | 70 | • **破空斩**：14点伤害<br>• **心眼刀**：获得15点护甲<br>• **夺命连刺**：8点伤害 | ★★☆ |

#### BOSS (难度★★★)

| 敌人 | 生命值 | 行动模式 | 威胁等级 |
|------|--------|----------|----------|
| **德莱厄斯** (Darius_BOSS)<br>*诺克萨斯之手* | 150 | • **大杀四方**：15点伤害<br>• **致残打击**：给予3层虚弱<br>• **断头台！**：30点巨额伤害 | ★★★ |

---

### Act 2 敌人 (暗影岛战线)

#### T3 精英 (难度★★★)

| 敌人 | 生命值 | 行动模式 | 威胁等级 |
|------|--------|----------|----------|
| **佛耶戈** (Viego)<br>*破败之王* | 80 | • **破败王剑**：20点伤害<br>• **休止符**：获得3点力量<br>• **折磨**：2次12伤 (总24伤) | ★★★ |
| **乐芙兰** (LeBlanc)<br>*诡术妖姬* | 85 | • **恶意魔印**：给予3层易伤<br>• **幻影锁链**：18点伤害<br>• **故技重施**：2次12伤 (总24伤) | ★★★ |

> **注**：Act 2 BOSS 和 Act 3 敌人尚未实装。

---

### 敌人属性缩放机制

敌人属性会根据**楼层数**和**当前ACT**进行缩放：

```javascript
// 数值缩放公式 (src/utils/gameLogic.js)
const scaleEnemyStats = (enemy, floor, act) => {
  const floorMultiplier = 1 + (floor * 0.15);  // 每层+15%
  const actMultiplier = act;                    // Act 1: 1倍, Act 2: 2倍
  
  const scaledHp = Math.floor(enemy.maxHp * floorMultiplier * actMultiplier);
  const scaledActions = enemy.actions.map(action => ({
    ...action,
    value: action.value ? Math.floor(action.value * floorMultiplier) : undefined,
    dmgValue: action.dmgValue ? Math.floor(action.dmgValue * floorMultiplier) : undefined
  }));
  
  return { maxHp: scaledHp, actions: scaledActions };
};
```

**示例计算**：
- **Katarina** (基础42HP) 在 **Floor 5 (Act 1)** = `42 × (1 + 5×0.15) × 1 = 73.5 ≈ 74 HP`
- **Viego** (基础80HP) 在 **Floor 2 (Act 2)** = `80 × (1 + 2×0.15) × 2 = 208 HP`

---

## 遗物数据

### 被动遗物 (英雄专属，不可购买)

| 遗物 | 英雄 | 效果 |
|------|------|------|
| **坚韧** (GarenPassive) | 盖伦 | 战斗结束恢复6HP |
| **出血** (DariusPassive) | 德莱厄斯 | 每次攻击给予敌人1层虚弱 |
| **光芒四射** (LuxPassive) | 拉克丝 | 回合开始获得1点额外法力 |
| **爆发** (JinxPassive) | 金克丝 | 回合开始手牌+1 |
| **浪客之道** (YasuoPassive) | 亚索 | 攻击暴击+10% |
| **能量弦** (SonaPassive) | 娑娜 | 每回合第3张卡+3护甲 |
| **Z型共振** (EkkoPassive) | 艾克 | 消耗卡+1力量 |
| **叛乱** (SylasPassive) | 塞拉斯 | 技能牌回复3HP |
| **回火** (UrgotPassive) | 厄加特 | 战斗开始+15护甲 |
| **光荣进化** (ViktorPassive) | 维克托 | 回合开始50%获得额外基础卡 |
| **符文之刃** (RivenPassive) | 瑞文 | 每打出3张攻击牌获得1点能量 |
| **灌铅骰子** (TwistedFatePassive) | 卡牌大师 | 战斗胜利额外获得15金币 |
| **疾风骤雨** (LeeSinPassive) | 盲僧 | 打出技能牌后下一张攻击牌-1费 |
| **圣银弩箭** (VaynePassive) | 薇恩 | 对同一目标连续3次伤害额外10伤 |
| **游击战** (TeemoPassive) | 提莫 | 回合开始随机给敌人2层虚弱 |
| **影分身** (ZedPassive) | 劫 | 每回合第1张攻击牌重复50%伤害 |
| **汲魂痛击** (NasusPassive) | 内瑟斯 | 用攻击牌击杀敌人+1力量 |
| **热诚** (IreliaPassive) | 艾瑞莉娅 | 击杀敌人恢复1能量抽1牌 |
| **地狱诅咒** (ThreshPassive) | 锤石 | 敌人死亡+2最大生命值 |
| **贪婪** (KatarinaPassive) | 卡特琳娜 | 每第4张攻击牌伤害翻倍 |

---

### 通用遗物 (可购买/奖励获得)

#### COMMON (普通)

| 遗物 | 价格 | 效果 |
|------|------|------|
| **多兰之盾** (DoransShield) | 100 G | 战斗开始获得6点护甲 |
| **长剑** (LongSword) | 150 G | 战斗开始获得1点力量 |
| **红水晶** (RubyCrystal) | 120 G | 最大生命值+15 (立即生效) |

#### UNCOMMON (罕见)

| 遗物 | 价格 | 效果 |
|------|------|------|
| **吸血鬼节杖** (VampiricScepter) | 280 G | 每次攻击牌恢复1HP |
| **耀光** (Sheen) | 350 G | 每回合第1张攻击牌伤害翻倍 |
| **荆棘背心** (BrambleVest) | 200 G | 被攻击时反伤3点 |

#### RARE (稀有)

| 遗物 | 价格 | 效果 | 限制 |
|------|------|------|------|
| **中娅沙漏** (ZhonyasHourglass) | 500 G | 免疫下一回合敌人伤害 | 每场战斗1次 |
| **无尽之刃** (InfinityEdge) | 700 G | 所有攻击牌伤害+50% | - |
| **救赎** (Redemption) | 650 G | 回合开始你和敌人恢复5HP | - |
| **守护天使** (GuardianAngel) | 750 G | 死亡时恢复40HP | 每场战斗1次 |

---

## 游戏机制速查

### 战斗奖励机制

#### 卡牌奖励 (Reward Screen)
- **显示数量**：3张
- **R技能概率**：每个槽位20%独立判定
- **实际概率**：
  - 至少出现1张R技能 ≈ 48.8%
  - 出现2张R技能 ≈ 10.4%
  - 出现3张R技能 ≈ 0.8%

#### 金币奖励
- 基础：+50 G
- 跳过卡牌奖励：+100 G (额外+50)

---

### 卡牌升级机制

**升级标记**：卡牌ID添加 `+` 后缀 (如 `Strike+`)

**数值提升**：
- 攻击/格挡：+3
- 效果值：+1
- 费用：-1 (最低0费)

**获取途径**：
1. 商店升级：100 G (可选择)
2. 事件奖励："感悟"选项 (随机)

**视觉标识**：
- 绿色边框
- 绿色名称
- 卡牌名称带 `+` 标记

---

### 状态效果详解

| 状态 | 效果 | 叠加规则 | 衰减规则 |
|------|------|----------|----------|
| **护甲** (Block) | 抵挡伤害 | 玩家跨回合累积<br>敌人每回合清零 | 受伤时扣除 |
| **力量** (Strength) | 攻击+N | 可叠加 | 战斗内永久 |
| **虚弱** (Weak) | 攻击×0.75 | 可叠加 | 每回合-1 |
| **易伤** (Vulnerable) | 受伤×1.5 | 可叠加 | 每回合-1 |

---

## 数据统计

### 卡牌总数统计
- **BASIC**: 2张 (Strike, Defend)
- **COMMON**: 20张 (每英雄1-2张Q技能)
- **UNCOMMON**: 40+张 (W/E技能 + 通用卡)
- **RARE**: 20张 (每英雄1张R技能)
- **总计**: ~82张

### 敌人总数统计
- **Act 1**: 6个敌人 (5普通 + 1 BOSS)
- **Act 2**: 2个精英
- **Act 3**: 未实装
- **总计**: 8个

### 遗物总数统计
- **PASSIVE**: 20个 (英雄专属)
- **COMMON**: 3个
- **UNCOMMON**: 3个
- **RARE**: 4个
- **总计**: 30个

---

## 附录

### 缩写说明
- **HP**: Health Points (生命值)
- **AOE**: Area of Effect (范围伤害)
- **DOT**: Damage Over Time (持续伤害)
- **R技能**: Ultimate Skill (终结技/大招)

### 版本历史
- **v1.0** (2025-11-21): 初始版本，包含10位英雄、42张卡牌、8个敌人
- **v1.1** (2025-11-21): 全英雄实装，新增10位英雄 (瑞文、卡牌、盲僧、薇恩、提莫、劫、内瑟斯、艾瑞莉娅、锤石、卡特琳娜)，总计20位英雄、82张卡牌

---

> **提示**：本文档基于 `new_map` 分支最新代码生成，数据与游戏实时同步。如有变更请参考源代码 `src/data/` 目录。

