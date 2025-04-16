const InjectProduct = require('../models/injectProductModel');

class InjectProductService {
  // 添加格式化响应的辅助方法
  _formatResponse(product) {
    if (!product) return null;
    const productObj = product.toObject();
    const { _id, purchaseRecord, ...rest } = productObj;

    return {
      injectId: _id.toString(),
      ...rest,
      purchaseRecord: purchaseRecord ? {
        purchaseId: purchaseRecord._id.toString(),
        purchaseDate: purchaseRecord.purchaseDate,
        purchaseAmount: purchaseRecord.purchaseAmount,
        purchaseType: purchaseRecord.purchaseType,
        purchaseItem: purchaseRecord.purchaseItem,
        customerInfo: purchaseRecord.customerId ? {
          customerId: purchaseRecord.customerId._id.toString(),
          name: purchaseRecord.customerId.name,
          medicalRecordNumber: purchaseRecord.customerId.medicalRecordNumber
        } : null
      } : null
    };
  }

  // 创建单个或多个注射产品记录
  async createInjectProduct(productsData, purchaseRecordId) {
    // 确保 productsData 是数组
    const products = Array.isArray(productsData) ? productsData : [productsData];
    
    // 分离需要更新和需要创建的产品
    const toUpdate = products.filter(p => p.injectId);
    const toCreate = products.filter(p => !p.injectId);

    const results = [];

    // 处理更新操作
    if (toUpdate.length > 0) {
      const updatePromises = toUpdate.map(product => {
        const { injectId, ...updateData } = product;
        return InjectProduct.findByIdAndUpdate(
          injectId,
          { 
            ...updateData,
            purchaseRecord: purchaseRecordId,
            updatedAt: new Date()
          },
          { new: true }
        );
      });
      const updatedProducts = await Promise.all(updatePromises);
      results.push(...updatedProducts);
    }

    // 处理创建操作
    if (toCreate.length > 0) {
      const productsWithRecord = toCreate.map(product => ({
        ...product,
        purchaseRecord: purchaseRecordId
      }));
      const createdProducts = await InjectProduct.create(productsWithRecord);
      results.push(...(Array.isArray(createdProducts) ? createdProducts : [createdProducts]));
    }

    // 填充关联数据
    const populatedProducts = await InjectProduct.populate(results, {
      path: 'purchaseRecord',
      select: 'purchaseDate purchaseAmount purchaseType purchaseItem customerId',
      populate: {
        path: 'customerId',
        select: 'name medicalRecordNumber'
      }
    });

    return populatedProducts.map(product => this._formatResponse(product));
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
      conditions.purchaseRecord = purchaseRecordId;
    }

    const [products, total] = await Promise.all([
      InjectProduct.find(conditions)
        .populate({
          path: 'purchaseRecord',
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
      list: products.map(product => this._formatResponse(product)),
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
    ).populate({
      path: 'purchaseRecord',
      select: 'purchaseDate purchaseAmount purchaseType purchaseItem customerId',
      populate: {
        path: 'customerId',
        select: 'name medicalRecordNumber'
      }
    });
    return this._formatResponse(product);
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
  async updatePurchaseRecord(productId, purchaseRecordId) {
    const product = await InjectProduct.findByIdAndUpdate(
      productId,
      { 
        purchaseRecord: purchaseRecordId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'purchaseRecord',
      select: 'purchaseDate purchaseAmount purchaseType purchaseItem customerId',
      populate: {
        path: 'customerId',
        select: 'name medicalRecordNumber'
      }
    });
    return product;
  }

  // 批量删除注射产品记录
  async deleteInjectProducts(injectIds) {
    if (!Array.isArray(injectIds)) {
      injectIds = [injectIds];
    }
    await InjectProduct.deleteMany({ _id: { $in: injectIds } });
  }
}

module.exports = new InjectProductService(); 