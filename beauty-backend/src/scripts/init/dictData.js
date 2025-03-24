const Dict = require('../../models/dictModel');

// 消费类型字典数据
const purchaseTypes = [
  {
    code: 'injection',
    name: '注射',
    type: 'purchaseType',
    sort: 1,
    remarks: '注射类消费项目'
  },
  {
    code: 'operation',
    name: '手术',
    type: 'purchaseType',
    sort: 2,
    remarks: '手术类消费项目'
  },
  {
    code: 'skin',
    name: '皮肤',
    type: 'purchaseType',
    sort: 3,
    remarks: '皮肤类消费项目'
  }
];

async function initDictData() {
  try {
    // 检查是否已存在数据
    const existingDicts = await Dict.find({ type: 'purchaseType' });
    if (existingDicts.length > 0) {
      console.log('字典数据已存在，跳过初始化');
      return;
    }

    // 插入字典数据
    await Dict.insertMany(purchaseTypes);
    console.log('字典数据初始化成功');
  } catch (error) {
    console.error('字典数据初始化失败:', error);
    throw error;
  }
}

module.exports = initDictData; 