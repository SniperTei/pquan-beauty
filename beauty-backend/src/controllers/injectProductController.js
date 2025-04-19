const injectProductService = require('../services/injectProductService');

class InjectProductController {
  async createInjectProduct(req, res) {
    try {
      const { products, purchaseRecordId } = req.body;
      
      if (!purchaseRecordId) {
        return res.error(400, 'A00100', '消费记录ID是必须的');
      }

      if (!products || (Array.isArray(products) && products.length === 0)) {
        return res.error(400, 'A00100', '至少需要一个产品信息');
      }

      const createdProducts = await injectProductService.createInjectProduct(products, purchaseRecordId);
      res.success(createdProducts, '注射产品记录创建成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getInjectProducts(req, res) {
    try {
      const query = req.query;
      const products = await injectProductService.getInjectProducts(query);
      res.success(products, '注射产品记录列表获取成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async updateInjectProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const product = await injectProductService.updateInjectProduct(id, productData);
      res.success(product, '注射产品记录更新成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async deleteInjectProduct(req, res) {
    try {
      const { injectIds } = req.body;
      
      if (!injectIds || !Array.isArray(injectIds) || injectIds.length === 0) {
        return res.error(400, 'A00100', '请提供要删除的注射产品ID列表');
      }

      await injectProductService.deleteInjectProducts(injectIds);
      res.success(null, '注射产品记录删除成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getInjectProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await injectProductService.getInjectProductById(id);
      res.success(product, '注射产品记录获取成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async updatePurchaseRecords(req, res) {
    try {
      const { id } = req.params;
      const { purchaseRecordIds } = req.body;
      const product = await injectProductService.updatePurchaseRecords(id, purchaseRecordIds);
      res.success(product, '注射产品消费记录关联更新成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getInjectStats(req, res) {
    try {
      const { yearMonth } = req.query;
      
      if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
        return res.error(400, 'A00100', '请提供正确的年月格式(YYYY-MM)');
      }

      const stats = await injectProductService.getInjectStats(yearMonth);
      res.success(stats, '获取注射产品用量统计成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }
}

module.exports = new InjectProductController(); 