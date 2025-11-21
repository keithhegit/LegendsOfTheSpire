# 网格地图系统集成指南

> **版本**: v0.9.0  
> **分支**: new_grid  
> **更新时间**: 2025-11-21

---

## 📋 集成概述

本指南说明如何将新的六边形网格地图系统集成到主应用(`App.jsx`)中。

---

## ✅ 已完成的准备工作

### Phase 1: 核心算法 ✅
- ✅ `src/utils/hexagonGrid.js` - 六边形坐标系统
- ✅ `src/data/gridMapLayout_v3.js` - 地图生成器（带保底机制）
- ✅ `test_map_generation.html` - 测试系统

### Phase 2: UI组件 ✅
- ✅ `src/components/HexagonNode.jsx` - 六边形节点组件
- ✅ `src/components/PathConnector.jsx` - 路径连线组件
- ✅ `src/components/GridMapView_v2.jsx` - 新版地图视图

---

## 🔧 Phase 3: App.jsx集成步骤

### 步骤1: 更新导入语句

**修改** `src/App.jsx` (第4-5行):

```javascript
// 旧版本
import { generateGridMap, GRID_ROWS, GRID_COLS } from './data/gridMapLayout';
import GridMapView from './components/GridMapView';

// 新版本
import { generateGridMap } from './data/gridMapLayout_v3'; // 使用v3生成器
import GridMapView_v2 from './components/GridMapView_v2'; // 使用v2视图
```

---

### 步骤2: 修改 `handleChampionSelect` 函数

**位置**: `src/App.jsx` 约第730行

```javascript
// 旧版本
const handleChampionSelect = (selectedChamp) => {
  setChampion(selectedChamp);
  unlockAudio();
  setBgmStarted(true);
  const newDeck = [...STARTING_DECK_BASIC, ...selectedChamp.initialCards];
  setMasterDeck(shuffle(newDeck));
  setCurrentHp(selectedChamp.maxHp);
  setMaxHp(selectedChamp.maxHp);
  setGold(0);
  setBaseStr(0);
  setRelics([selectedChamp.relicId]);
  
  // 生成地图（旧）
  const floorCount = 10;
  const newMap = generateGridMap(1, floorCount);
  setMapData(newMap);
  
  setCurrentFloor(0);
  setCurrentAct(1);
  setUsedEnemies([]);
  setView('MAP');
};

// 新版本
const handleChampionSelect = (selectedChamp) => {
  setChampion(selectedChamp);
  unlockAudio();
  setBgmStarted(true);
  const newDeck = [...STARTING_DECK_BASIC, ...selectedChamp.initialCards];
  setMasterDeck(shuffle(newDeck));
  setCurrentHp(selectedChamp.maxHp);
  setMaxHp(selectedChamp.maxHp);
  setGold(0);
  setBaseStr(0);
  setRelics([selectedChamp.relicId]);
  
  // 生成地图（新）- 使用v3生成器，带自动重试
  const newMap = generateGridMap(1, []); // act=1, usedEnemies=[]
  setMapData(newMap);
  
  // 设置初始activeNode为startNode
  if (newMap.startNode) {
    setActiveNode(newMap.startNode);
  }
  
  setCurrentFloor(0);
  setCurrentAct(1);
  setUsedEnemies([]);
  setView('MAP');
};
```

---

### 步骤3: 修改 `completeNode` 函数

**位置**: `src/App.jsx` 约第850行

```javascript
// 旧版本
const completeNode = () => {
  const newNodes = [...mapData.nodes];
  const idx = newNodes.findIndex(n => n.id === activeNode.id);
  if (idx === -1) return;
  
  newNodes[idx].status = 'COMPLETED';
  
  // 解锁下一层的相邻节点
  const nextFloor = currentFloor + 1;
  newNodes.forEach(node => {
    if (node.row === nextFloor && Math.abs(node.col - activeNode.col) <= 1) {
      node.status = 'AVAILABLE';
    }
  });
  
  setMapData({ ...mapData, nodes: newNodes });
  setCurrentFloor(nextFloor);
  setView('MAP');
};

// 新版本
const completeNode = () => {
  const newNodes = [...mapData.nodes];
  const idx = newNodes.findIndex(n => n.id === activeNode.id);
  if (idx === -1) return;
  
  // 标记当前节点为已完成
  newNodes[idx].status = 'COMPLETED';
  
  // 解锁下一层的连接节点（基于DAG的next数组）
  if (activeNode.next && activeNode.next.length > 0) {
    activeNode.next.forEach(nextId => {
      const nextNode = newNodes.find(n => n.id === nextId);
      if (nextNode) {
        nextNode.status = 'AVAILABLE';
      }
    });
  }
  
  setMapData({ ...mapData, nodes: newNodes });
  setCurrentFloor(activeNode.row + 1); // 更新当前层
  setView('MAP');
};
```

---

### 步骤4: 修改 `handleNodeSelect` 函数

**位置**: `src/App.jsx` 约第870行

```javascript
// 新版本（逻辑保持不变，但确保正确设置activeNode）
const handleNodeSelect = (node) => {
  setActiveNode(node); // 设置当前选中节点
  
  switch (node.type) {
    case 'BATTLE':
      setView('BATTLE');
      break;
    case 'SHOP':
      setView('SHOP');
      break;
    case 'REST':
      setView('REST');
      break;
    case 'CHEST':
      setView('CHEST');
      break;
    case 'EVENT':
      setView('EVENT');
      break;
    case 'BOSS':
      setView('BATTLE'); // BOSS战也是战斗
      break;
    default:
      break;
  }
};
```

---

### 步骤5: 修改渲染视图

**位置**: `src/App.jsx` 约第1000行

```javascript
// 旧版本
case 'MAP':
  return (
    <GridMapView
      mapData={mapData}
      onNodeSelect={handleNodeSelect}
      currentFloor={currentFloor}
      act={currentAct}
      activeNode={activeNode}
    />
  );

// 新版本
case 'MAP':
  return (
    <GridMapView_v2
      mapData={mapData}
      onNodeSelect={handleNodeSelect}
      currentFloor={currentFloor}
      act={currentAct}
      activeNode={activeNode}
    />
  );
```

---

### 步骤6: 更新存档逻辑（可选）

如果需要保存/读取新的地图结构，确保序列化包含以下字段：

```javascript
const saveData = {
  view,
  champion,
  currentHp,
  maxHp,
  gold,
  masterDeck,
  relics,
  baseStr,
  mapData: {
    ...mapData,
    // v3生成器返回的新字段
    startNode: mapData.startNode,
    bossNode: mapData.bossNode,
    stats: mapData.stats
  },
  currentFloor,
  currentAct,
  activeNode,
  usedEnemies
};
```

---

## 🧪 测试清单

### 功能测试
- [ ] **新游戏启动**: 选择英雄后，地图正确生成
- [ ] **节点选择**: 只能点击高亮的3个节点（三选一）
- [ ] **节点完成**: 完成后正确解锁下一层节点
- [ ] **迷雾效果**: 只显示可达节点，其他节点迷雾
- [ ] **拖拽查看**: 可以拖拽地图查看全图
- [ ] **居中按钮**: 点击后视图居中到当前节点
- [ ] **路径连线**: 已探索路径高亮显示
- [ ] **BOSS战**: 到达BOSS节点后进入战斗

### 视觉测试
- [ ] 六边形节点正确渲染
- [ ] 节点图标显示正确（战斗/商店/事件/BOSS）
- [ ] 高亮节点有金色边框和脉冲效果
- [ ] 已完成节点置灰且有✓标记
- [ ] 路径连线流动动画正常

### 边界测试
- [ ] 地图生成失败时使用线性保底地图
- [ ] 无下一层节点时（到达BOSS）正确处理
- [ ] 存档/读档后地图状态正确恢复

---

## ⚠️ 注意事项

1. **ACT切换**: 当前集成仅处理ACT1，ACT2/ACT3需要在BOSS战胜利后重新生成地图：
   ```javascript
   const handleActClear = () => {
     const nextAct = currentAct + 1;
     if (nextAct > 3) {
       setView('VICTORY_ALL');
       return;
     }
     
     const newMap = generateGridMap(nextAct, []);
     setMapData(newMap);
     setActiveNode(newMap.startNode);
     setCurrentAct(nextAct);
     setCurrentFloor(0);
     setView('MAP');
   };
   ```

2. **性能优化**: 如果地图节点过多（ACT3约80个节点），考虑：
   - 使用`React.memo`优化节点渲染
   - 虚拟化不在视口的节点
   - 减少动画复杂度

3. **移动端适配**: 当前拖拽逻辑仅支持鼠标，需添加触摸事件支持：
   ```javascript
   onTouchStart, onTouchMove, onTouchEnd
   ```

---

## 📚 相关文档

- [new_grid.md](./new_grid.md) - 完整开发规划
- [HOW_TO_TEST.md](./HOW_TO_TEST.md) - 测试指南
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - 项目总览

---

## 🎉 集成完成后

完成集成后，运行测试并提交：

```bash
npm run dev
# 测试新游戏流程
git add src/App.jsx
git commit -m "feat(Phase3): Integrate hexagon map system into App.jsx"
git push origin new_grid
```

---

**文档版本**: v1.0.0  
**最后更新**: 2025-11-21  
**下一步**: Phase 4 - 测试与优化

