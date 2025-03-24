const Dict = require('../models/dictModel');

class DictService {
  async createDict(dictData) {
    const dict = await Dict.create(dictData);
    return dict;
  }

  async getDicts(query) {
    const { page = 1, limit = 10, type = '', code = '', name = '' } = query;
    const skip = (page - 1) * limit;
    const dicts = await Dict.find({
      $or: [
        { type: { $regex: new RegExp(type, 'i') } },
        { code: { $regex: new RegExp(code, 'i') } },
        { name: { $regex: new RegExp(name, 'i') } }
      ]
    })
    .skip(skip)
    .limit(limit);

    return {
      list: dicts,
      total: dicts.length
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