export const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const scaleEnemyStats = (baseStats, floorIndex) => {
  const difficultyMultiplier = 1 + 0.1 * floorIndex; 
  const scaledHp = Math.floor(baseStats.maxHp * difficultyMultiplier);
  const scaledActions = baseStats.actions.map(action => {
    let scaledAction = { ...action };
    const isAttack = scaledAction.type === 'ATTACK' || scaledAction.actionType === 'Attack';
    if (isAttack) {
      const baseDmg = scaledAction.type === 'ATTACK' ? scaledAction.value : scaledAction.dmgValue;
      // 降低攻击力50%：原来 floorIndex * 2，现在改为 floorIndex * 1，并且整体降低50%
      const scaledDmg = Math.floor((baseDmg + floorIndex * 1) * 0.5);
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

