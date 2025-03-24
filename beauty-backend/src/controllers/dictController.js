const dictService = require('../services/dictService');

class DictController {
  async createDict(req, res) {
    try {
      const dictData = req.body;
      const dict = await dictService.createDict(dictData);
      res.success(dict, '字典创建成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getDicts(req, res) {
    try {
      const query = req.query;
      const dicts = await dictService.getDicts(query);

      res.success(dicts, '字典列表获取成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }
  
}

module.exports = new DictController();