// 存档键名常量
const SAVE_KEY = 'lots_save_v1';
const UNLOCK_KEY = 'lots_unlocks_v1';

// 默认解锁英雄
const DEFAULT_UNLOCKS = ['Garen'];

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
export const getUnlockedChampions = () => {
  try {
    const data = localStorage.getItem(UNLOCK_KEY);
    return data ? JSON.parse(data) : DEFAULT_UNLOCKS;
  } catch (e) {
    return DEFAULT_UNLOCKS;
  }
};

export const unlockRandomChampion = (allChampionIds) => {
  const current = getUnlockedChampions();
  const locked = allChampionIds.filter(id => !current.includes(id));
  
  if (locked.length > 0) {
    const newUnlock = locked[Math.floor(Math.random() * locked.length)];
    const updated = [...current, newUnlock];
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(updated));
    return newUnlock; // 返回新解锁的英雄ID
  }
  return null; // 全解锁了
};

