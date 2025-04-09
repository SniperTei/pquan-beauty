const Dict = require('../models/dictModel');

class DictService {
  async createDict(dictData) {
    const dict = await Dict.create(dictData);
    return dict;
  }

  async getDicts(query) {
    const { page = 1, limit = 10, type = '', code = '', name = '' } = query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const conditions = {};
    
    // 如果提供了type，精确匹配type
    if (type) {
      conditions.type = type;
    }

    // 如果提供了code或name，使用模糊查询
    if (code || name) {
      conditions.$or = [];
      if (code) {
        conditions.$or.push({ code: { $regex: new RegExp(code, 'i') } });
      }
      if (name) {
        conditions.$or.push({ name: { $regex: new RegExp(name, 'i') } });
      }
    }

    // 修改删除条件：匹配 isDeleted 为 false 或不存在的文档
    conditions.$or = conditions.$or || [];
    conditions.$or.push(
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    );

    // 执行查询
    const [dicts, total] = await Promise.all([
      Dict.find(conditions)
        .sort({ sort: 1 }) // 按 sort 字段升序排序
        .skip(skip)
        .limit(limit),
      Dict.countDocuments(conditions)
    ]);

    return {
      list: dicts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    };
  }

  async updateDict(dictId, dictData) {
    const dict = await Dict.findByIdAndUpdate(dictId, dictData, { new: true });
    return dict;
  }

  async deleteDict(dictId) {
    await Dict.findByIdAndDelete(dictId);
  }
}

module.exports = new DictService();