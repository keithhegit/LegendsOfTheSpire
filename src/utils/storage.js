// 存档键名常量
const SAVE_KEY = 'lots_save_v1';
const UNLOCK_KEY = 'lots_unlocks_v1';

// --- 存档管理 ---
export const saveGame = (state) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Save failed", e);
  }
};

export const loadGame = () => {
  try {
    const save = localStorage.getItem(SAVE_KEY);
    return save ? JSON.parse(save) : null;
  } catch (e) {
    console.error("Load failed", e);
    return null;
  }
};

export const clearSave = () => {
  localStorage.removeItem(SAVE_KEY);
};

// --- 解锁系统 ---
// 获取所有英雄ID（需要在调用时传入，避免循环依赖）
export const getAllChampionIds = (championPool) => {
  return Object.keys(championPool || {});
};

// 获取已解锁的英雄列表
// 如果首次游戏（没有存储数据），返回所有英雄（全部解锁）
export const getUnlockedChampions = (championPool) => {
  try {
    const data = localStorage.getItem(UNLOCK_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 首次游戏：返回所有英雄ID（全部解锁）
    return getAllChampionIds(championPool);
  } catch (e) {
    // 出错时也返回所有英雄（全部解锁）
    return getAllChampionIds(championPool);
  }
};

export const unlockRandomChampion = (allChampionIds, championPool) => {
  const current = getUnlockedChampions(championPool);
  const locked = allChampionIds.filter(id => !current.includes(id));
  
  if (locked.length > 0) {
    const newUnlock = locked[Math.floor(Math.random() * locked.length)];
    const updated = [...current, newUnlock];
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(updated));
    return newUnlock; // 返回新解锁的英雄ID
  }
  return null; // 全解锁了
};

