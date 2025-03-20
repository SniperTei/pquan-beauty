const PurchaseRecord = require('../models/purchaseRecordModel');
const customerService = require('./customerService');
const mongoose = require('mongoose');

class PurchaseRecordService {
  async createPurchaseRecord(purchaseRecordData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { customerId, customerInfo, createdBy } = purchaseRecordData;
      let customer;

      // 如果提供了customerId，查找现有客户
      if (customerId) {
        customer = await customerService.getCustomerById(customerId);
        if (!customer) {
          throw new Error('客户不存在');
        }
      } 
      // 如果提供了customerInfo，查找或创建客户
      else if (customerInfo) {
        try {
          // 先尝试通过病历号查找客户
          customer = await customerService.getCustomerByMedicalRecordNumber(customerInfo.medicalRecordNumber);
        } catch (error) {
          // 如果客户不存在，创建新客户
          customer = await customerService.createCustomer({
            ...customerInfo,
            createdBy,
            updatedBy: createdBy
          });
        }
      } else {
        throw new Error('必须提供customerId或customerInfo');
      }

      // 创建消费记录
      const purchaseRecord = await PurchaseRecord.create({
        ...purchaseRecordData,
        customerId: customer._id,
        createdBy,
        updatedBy: createdBy
      });

      // 更新客户的最后消费时间
      await customerService.updateCustomer(customer._id, {
        lastPurchaseDate: new Date(),
        updatedBy: createdBy
      });

      await session.commitTransaction();
      return purchaseRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPurchaseRecords(query) {
    const { 
      page = 1, 
      limit = 10, 
      customerId = '', 
      customerName = '',
      medicalRecordNumber = '',
      purchaseDate = '', 
      purchaseType = '', 
      purchaseItem = '', 
      purchaseFactItem = '', 
      remarks = '' 
    } = query;

    try {
      // 构建客户查询条件
      const customerConditions = {};
      
      if (customerName) {
        customerConditions.name = { $regex: customerName, $options: 'i' };
      }
      
      if (medicalRecordNumber) {
        customerConditions.medicalRecordNumber = medicalRecordNumber;
      }

      // 如果有客户相关查询条件，先查询符合条件的客户ID列表
      let customerIds = [];
      if (customerName || medicalRecordNumber) {
        const customers = await mongoose.model('Customer').find(customerConditions).select('_id');
        customerIds = customers.map(c => c._id);
        if (customerIds.length === 0) {
          // 如果没有找到匹配的客户，直接返回空结果
          return {
            list: [],
            pagination: {
              total: 0,
              page: Number(page),
              limit: Number(limit)
            }
          };
        }
      }

      // 构建消费记录查询条件
      const condition = {};

      if (customerId) {
        condition.customerId = customerId;
      } else if (customerIds.length > 0) {
        // 如果有通过客户名或病历号查到的客户ID列表，使用这个列表查询
        condition.customerId = { $in: customerIds };
      }

      if (purchaseDate) {
        const startDate = new Date(purchaseDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(purchaseDate);
        endDate.setHours(23, 59, 59, 999);
        
        condition.purchaseDate = {
          $gte: startDate,
          $lte: endDate
        };
      }

      if (purchaseType) {
        condition.purchaseType = { $regex: purchaseType, $options: 'i' };
      }

      if (purchaseItem) {
        condition.purchaseItem = { $regex: purchaseItem, $options: 'i' };
      }

      if (purchaseFactItem) {
        condition.purchaseFactItem = { $regex: purchaseFactItem, $options: 'i' };
      }

      if (remarks) {
        condition.remarks = { $regex: remarks, $options: 'i' };
      }

      const skip = (Number(page) - 1) * Number(limit);

      // 使用 populate 获取客户信息
      const purchaseRecords = await PurchaseRecord.find(condition)
        .populate('customerId', 'name avatarUrl medicalRecordNumber _id')
        .skip(skip)
        .limit(Number(limit))
        .sort({ purchaseDate: -1 });

      // 格式化返回数据
      const formattedRecords = purchaseRecords.map(record => {
        const { customerId, ...rest } = record.toObject();
        return {
          ...rest,
          customerInfo: {
            customerId: customerId._id,
            name: customerId.name,
            avatarUrl: customerId.avatarUrl,
            medicalRecordNumber: customerId.medicalRecordNumber
          }
        };
      });

      const total = await PurchaseRecord.countDocuments(condition);

      return {
        list: formattedRecords,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      };
    } catch (error) {
      console.error('获取消费记录列表失败:', error);
      throw error;
    }
  }

  async updatePurchaseRecord(purchaseRecordId, purchaseRecordData) {
    const purchaseRecord = await PurchaseRecord.findByIdAndUpdate(purchaseRecordId, purchaseRecordData, { new: true });
    return purchaseRecord;
  }

  async deletePurchaseRecord(purchaseRecordId) {
    await PurchaseRecord.findByIdAndDelete(purchaseRecordId);
  }
}

module.exports = new PurchaseRecordService();
