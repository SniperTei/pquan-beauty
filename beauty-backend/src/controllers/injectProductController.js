const injectProductService = require('../services/injectProductService');

class InjectProductController {
  async createInjectProduct(req, res) {
    try {
      const productData = req.body;
      const product = await injectProductService.createInjectProduct(productData);
      res.success(product, '注射产品记录创建成功');
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
      const { id } = req.params;
      await injectProductService.deleteInjectProduct(id);
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

  async createInjectProducts(req, res) {
    try {
      const productsData = req.body;
      const products = await injectProductService.createInjectProducts(productsData);
      res.success(products, '批量创建注射产品记录成功');
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
}

module.exports = new InjectProductController(); 