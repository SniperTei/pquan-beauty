const PurchaseRecord = require('../models/purchaseRecordModel');
const customerService = require('./customerService');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

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
      const customerConditions = {
        isDeleted: { $ne: true } // 只查询未删除的客户
      };
      
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

      // 先查询一下数据，看看是否存在
      const records = await PurchaseRecord.find(condition);
      console.log('找到的记录:', JSON.stringify(records, null, 2));

      // 修改查询方式
      const purchaseRecords = await PurchaseRecord.find(condition)
        .populate({
          path: 'customerId',
          model: 'Customer',  // 明确指定模型
          select: 'name avatarUrl medicalRecordNumber'
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ purchaseDate: -1 });

      console.log('关联查询结果:', JSON.stringify(purchaseRecords, null, 2));

      // 格式化返回数据
      const formattedRecords = purchaseRecords.map(record => {
        const recordObj = record.toObject();
        const { _id, customerId, ...rest } = recordObj;

        return {
          purchaseId: _id.toString(),  // 将 _id 改为 purchaseId
          ...rest,
          customerInfo: customerId ? {
            customerId: customerId._id.toString(),
            name: customerId.name,
            avatarUrl: customerId.avatarUrl,
            medicalRecordNumber: customerId.medicalRecordNumber
          } : {
            customerId: null,
            name: '已删除的客户',
            avatarUrl: '',
            medicalRecordNumber: ''
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

  async importPurchaseRecords(file, userId) {
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = xlsx.utils.sheet_to_json(worksheet);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const importedRecords = [];

      for (const record of records) {
        // 解析日期
        const dateMatch = record['日期'].match(/(\d+)年(\d+)月/);
        if (!dateMatch) continue;
        
        const purchaseDate = new Date(2000 + parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1);

        // 查找或创建客户
        let customer = await customerService.getCustomerByMedicalRecordNumber(record['病案号'].toString(), session);

        if (!customer) {
          customer = await customerService.createCustomer({
            name: record['姓名'],
            medicalRecordNumber: record['病案号'].toString(),
            createdBy: userId,
            updatedBy: userId
          }, session);
        }

        // 创建消费记录
        const purchaseRecord = await PurchaseRecord.create([{
          customerId: customer._id,
          purchaseDate,
          purchaseAmount: record['注射'] || record['皮肤'] || 0, // 根据类型选择金额
          purchaseType: record['注射'] ? '注射' : (record['皮肤'] ? '皮肤' : '其他'),
          purchaseItem: record['项目'],
          purchaseFactItem: record['实际'] || '',
          remarks: '',
          createdBy: userId,
          updatedBy: userId
        }], { session });

        importedRecords.push(purchaseRecord[0]);

        // 更新客户最后消费时间
        await customerService.updateCustomer(customer._id, {
          lastPurchaseDate: purchaseDate,
          updatedBy: userId
        }, session);
      }

      await session.commitTransaction();
      return importedRecords;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
      // 删除临时文件
      fs.unlinkSync(file.path);
    }
  }
}

module.exports = new PurchaseRecordService();
