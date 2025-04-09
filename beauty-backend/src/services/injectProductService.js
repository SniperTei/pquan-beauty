const InjectProduct = require('../models/injectProductModel');

class InjectProductService {
  async createInjectProduct(productData) {
    const product = await InjectProduct.create(productData);
    return product;
  }

  async getInjectProducts(query) {
    const { page = 1, limit = 10, name = '', purchaseRecordId = '' } = query;
    const skip = (page - 1) * limit;

    const conditions = {};
    
    // 名称模糊查询
    if (name) {
      conditions.name = { $regex: new RegExp(name, 'i') };
    }

    // 通过消费记录ID查询
    if (purchaseRecordId) {
      conditions.purchaseRecords = purchaseRecordId;
    }

    const [products, total] = await Promise.all([
      InjectProduct.find(conditions)
        .populate({
          path: 'purchaseRecords',
          select: 'purchaseDate purchaseAmount purchaseType purchaseItem customerId',
          populate: {
            path: 'customerId',
            select: 'name medicalRecordNumber'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InjectProduct.countDocuments(conditions)
    ]);

    return {
      list: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    };
  }

  async updateInjectProduct(productId, productData) {
    const product = await InjectProduct.findByIdAndUpdate(
      productId,
      { ...productData, updatedAt: new Date() },
      { new: true }
    ).populate('purchaseRecords');
    return product;
  }

  async deleteInjectProduct(productId) {
    await InjectProduct.findByIdAndDelete(productId);
  }

  async getInjectProductById(productId) {
    return await InjectProduct.findById(productId).populate('purchaseRecords');
  }

  // 批量创建注射产品记录
  async createInjectProducts(productsData) {
    const products = await InjectProduct.insertMany(productsData);
    return products;
  }

  // 更新注射产品的消费记录关联
  async updatePurchaseRecords(productId, purchaseRecordIds) {
    const product = await InjectProduct.findByIdAndUpdate(
      productId,
      { 
        $addToSet: { purchaseRecords: { $each: purchaseRecordIds } },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('purchaseRecords');
    return product;
  }
}

module.exports = new InjectProductService(); 