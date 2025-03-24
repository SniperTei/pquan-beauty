const PurchaseRecord = require('../models/purchaseRecordModel');
const customerService = require('./customerService');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/customerModel');

// 添加日期格式化辅助函数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

      // 格式化返回数据
      const formattedRecord = purchaseRecord.toObject();
      return {
        ...formattedRecord,
        _id: formattedRecord._id.toString(),
        purchaseDate: formatDate(formattedRecord.purchaseDate)
      };
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
      purchaseType = '', 
      purchaseItem = '', 
      purchaseFactItem = '', 
      remarks = '',
      startDate = '',        // 开始日期
      endDate = '',         // 结束日期
      sortField = '',       // 排序字段：purchaseDate/purchaseAmount
      sortOrder = 'desc'    // 排序方向：asc/desc
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
        condition.customerId = { $in: customerIds };
      }

      if (startDate || endDate) {
        condition.purchaseDate = {};
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          condition.purchaseDate.$gte = start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          condition.purchaseDate.$lte = end;
        }
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

      // 构建排序条件
      let sortCondition = { purchaseDate: -1 }; // 默认按消费日期降序
      
      if (sortField && ['purchaseDate', 'purchaseAmount'].includes(sortField)) {
        sortCondition = {
          [sortField]: sortOrder === 'asc' ? 1 : -1
        };
      }

      // 执行查询
      const purchaseRecords = await PurchaseRecord.find(condition)
        .populate({
          path: 'customerId',
          model: 'Customer',
          select: 'name avatarUrl medicalRecordNumber'
        })
        .skip(skip)
        .limit(Number(limit))
        .sort(sortCondition);

      // 格式化返回数据
      const formattedRecords = purchaseRecords.map(record => {
        const recordObj = record.toObject();
        const { _id, customerId, purchaseDate, ...rest } = recordObj;

        return {
          purchaseId: _id.toString(),
          purchaseDate: formatDate(purchaseDate),
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
    const purchaseRecord = await PurchaseRecord.findByIdAndUpdate(
      purchaseRecordId, 
      purchaseRecordData, 
      { new: true }
    );
    
    // 格式化返回数据
    const formattedRecord = purchaseRecord.toObject();
    return {
      ...formattedRecord,
      _id: formattedRecord._id.toString(),
      purchaseDate: formatDate(formattedRecord.purchaseDate)
    };
  }

  async deletePurchaseRecord(purchaseRecordId) {
    await PurchaseRecord.findByIdAndDelete(purchaseRecordId);
  }

  async importPurchaseRecords(file, userId) {
    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = xlsx.utils.sheet_to_json(worksheet);

    try {
      const importedRecords = [];

      for (const record of records) {
        // 跳过空行
        if (!record['姓名'] || !record['病案号']) continue;

        // 解析日期
        try {
          let purchaseDate;
          const dateStr = record['日期'];
          
          if (typeof dateStr === 'string') {
            // 处理字符串格式的日期
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              purchaseDate = new Date(
                parseInt(parts[0]), // 年
                parseInt(parts[1]) - 1, // 月（需要减1，因为 Date 对象的月份是从0开始的）
                parseInt(parts[2]) // 日
              );
            } else {
              console.error('无效的日期格式:', dateStr);
              continue;
            }
          } else if (dateStr instanceof Date) {
            // 如果 Excel 已经将其解析为日期对象
            purchaseDate = dateStr;
          } else {
            console.error('无效的日期值:', dateStr);
            continue;
          }

          if (isNaN(purchaseDate.getTime())) {
            console.error('无效的日期:', dateStr);
            continue;
          }

          // 查找或创建客户
          let customer;
          try {
            // 先尝试通过病历号查找客户
            customer = await customerService.getCustomerByMedicalRecordNumber(record['病案号'].toString());
          } catch (error) {
            // 如果客户不存在，创建新客户
            customer = await customerService.createCustomer({
              name: record['姓名'],
              medicalRecordNumber: record['病案号'].toString(),
              createdBy: userId,
              updatedBy: userId
            });
          }

          // 确定消费类型和金额
          let purchaseType, purchaseAmount;
          purchaseType = record['类型'];
          let purchaseTypeValue = "";
          purchaseAmount = record['金额'];
          if (purchaseType === '注射') {
            purchaseTypeValue = "injection";
          } else if (purchaseType === '皮肤') {
            purchaseTypeValue = "skin";
          } else if (purchaseType === '手术') {
            purchaseTypeValue = "operation";
          } else {
            purchaseTypeValue = "other";
          }

          // 创建消费记录
          const purchaseRecord = await PurchaseRecord.create({
            customerId: customer._id,
            purchaseDate,
            purchaseAmount,
            purchaseType: purchaseTypeValue,
            purchaseItem: record['项目'] || '',
            purchaseFactItem: record['实际项目'] || '',
            remarks: '',
            createdBy: userId,
            updatedBy: userId
          });

          importedRecords.push(purchaseRecord);

          // 更新客户最后消费时间
          await customerService.updateCustomer(customer._id, {
            lastPurchaseDate: purchaseDate,
            updatedBy: userId
          });

        } catch (error) {
          console.error('处理记录时出错:', error);
          continue; // 跳过这条记录，继续处理下一条
        }
      }

      return importedRecords;
    } catch (error) {
      throw error;
    } finally {
      // 删除临时文件
      fs.unlinkSync(file.path);
    }
  }
}

module.exports = new PurchaseRecordService();
