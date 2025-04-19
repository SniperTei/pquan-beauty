const purchaseRecordService = require('../services/purchaseRecordService');
const injectProductService = require('../services/injectProductService');

class PurchaseRecordController {
  async createPurchaseRecord(req, res) {
    try {
      const purchaseRecordData = req.body;
      // 从 token 中获取当前用户信息
      purchaseRecordData.createdBy = req.user.userId;
      purchaseRecordData.updatedBy = req.user.userId;
      const purchaseRecord = await purchaseRecordService.createPurchaseRecord(purchaseRecordData);

      res.success(purchaseRecord, '采购记录创建成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getPurchaseRecords(req, res) {
    try {
      const query = req.query;
      const purchaseRecords = await purchaseRecordService.getPurchaseRecords(query);

      res.success(purchaseRecords, '采购记录列表获取成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async updatePurchaseRecord(req, res) {
    try {
      const purchaseRecordId = req.params.id;
      const purchaseRecordData = req.body;
      const purchaseRecord = await purchaseRecordService.updatePurchaseRecord(purchaseRecordId, purchaseRecordData);

      res.success(purchaseRecord, '采购记录更新成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async deletePurchaseRecord(req, res) {
    try {
      const purchaseRecordId = req.params.id;
      // 获取注射产品记录
      const injectProducts = await injectProductService.getInjectProducts({ purchaseRecordId });
      // 删除注射产品记录
      await injectProductService.deleteInjectProducts(injectProducts.list.map(item => item._id));
      // 删除采购记录
      await purchaseRecordService.deletePurchaseRecord(purchaseRecordId);

      res.success(null, '采购记录删除成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async importPurchaseRecords(req, res) {
    try {
      if (!req.file) {
        return res.error(400, 'A00100', '请上传文件');
      }

      const records = await purchaseRecordService.importPurchaseRecords(req.file, req.user.userId);
      res.success({ 
        total: records.length,
        message: `成功导入 ${records.length} 条记录`
      }, '数据导入成功');
    } catch (error) {
      res.error(400, 'A00100', `导入失败: ${error.message}`);
    }
  }

  async getPurchaseStats(req, res) {
    try {
      const stats = await purchaseRecordService.getPurchaseStats(req.query);
      res.success(stats, '获取消费统计数据成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }
}

module.exports = new PurchaseRecordController();
