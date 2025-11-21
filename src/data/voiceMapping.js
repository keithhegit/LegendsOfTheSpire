// 英雄ID到语音文件名的映射
// 某些英雄的ID与Riot语音文件名不一致，需要手动映射
export const VOICE_MAPPING = {
    // 标准映射（ID和语音文件名相同）
    'Garen': 'Garen',
    'Darius': 'Darius',
    'Lux': 'Lux',
    'Jinx': 'Jinx',
    'Yasuo': 'Yasuo',
    'Sona': 'Sona',
    'Ekko': 'Ekko',
    'Sylas': 'Sylas',
    'Urgot': 'Urgot',
    'Viktor': 'Viktor',
    'Riven': 'Riven',
    'Vayne': 'Vayne',
    'Teemo': 'Teemo',
    'Zed': 'Zed',
    'Nasus': 'Nasus',
    'Irelia': 'Irelia',
    'Thresh': 'Thresh',
    'Katarina': 'Katarina',
    
    // 特殊映射（需要转换）
    'TwistedFate': 'TwistedFate', // 可能需要改为 'TF' 或其他
    'LeeSin': 'LeeSin',           // 可能需要改为 'Lee_Sin' 或 'Lee'
};

// 获取英雄的语音文件名
export const getVoiceFileName = (championId) => {
    return VOICE_MAPPING[championId] || championId;
};

