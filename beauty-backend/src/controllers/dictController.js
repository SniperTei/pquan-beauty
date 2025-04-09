const dictService = require('../services/dictService');

class DictController {
  async createDict(req, res) {
    try {
      // 检查用户是否是管理员
      if (!req.user.isAdmin) {
        return res.error(403, 'A00403', '只有管理员才能创建字典');
      }

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