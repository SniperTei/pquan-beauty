const PurchaseRecord = require('../models/purchaseRecordModel');
const customerService = require('./customerService');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/customerModel');
const moment = require('moment');

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
      startDate = '',
      endDate = '',
      sortField = '',
      sortOrder = 'desc'
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
        condition.purchaseType = purchaseType;  // 精确匹配消费类型
      }

      if (purchaseItem) {
        const keywords = purchaseItem.split(/\s+/).filter(Boolean);
        if (keywords.length > 0) {
          condition.purchaseItem = {
            $regex: keywords.map(keyword => 
              `(?=.*${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`
            ).join(''),
            $options: 'i'
          };
        }
      }

      if (purchaseFactItem) {
        const keywords = purchaseFactItem.split(/\s+/).filter(Boolean);
        if (keywords.length > 0) {
          condition.purchaseFactItem = {
            $regex: keywords.map(keyword => 
              `(?=.*${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`
            ).join(''),
            $options: 'i'
          };
        }
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
            // 处理字符串格式的日期，使用 moment 处理时区
            const momentDate = moment(dateStr, 'YYYY/M/D');
            if (momentDate.isValid()) {
              // 设置为当天的 00:00:00，使用本地时区
              purchaseDate = momentDate.startOf('day').toDate();
            } else {
              console.error('无效的日期格式:', dateStr);
              continue;
            }
          } else if (dateStr instanceof Date) {
            // 如果 Excel 已经将其解析为日期对象
            purchaseDate = moment(dateStr).startOf('day').toDate();
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

  async getPurchaseStats(query = {}) {
    try {
      const { 
        year,       // 年份，如：2025
        month,      // 月份，如：1-12
        date,       // 具体日期，如：2025-01-01
        startDate,  // 开始日期，如：2025-01-01
        endDate,    // 结束日期，如：2025-12-31
        purchaseType, // 消费类型（可选）
        groupBy = 'date' // 分组方式：date/month/year，默认按日
      } = query;

      const condition = {};

      // 设置时间范围条件
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        condition.purchaseDate = { $gte: start, $lte: end };
      } else if (year && month) {
        // 修改月份查询逻辑，确保只查询指定月份的数据
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0); // 月份的第一天凌晨
        const end = new Date(year, month, 0, 23, 59, 59, 999);  // 月份的最后一天晚上
        condition.purchaseDate = { 
          $gte: start,
          $lt: new Date(year, month, 1) // 使用 $lt 而不是 $lte，确保不包含下个月的数据
        };
      } else if (year) {
        const start = new Date(year, 0, 1, 0, 0, 0, 0);
        const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);
        condition.purchaseDate = { 
          $gte: start,
          $lt: end // 使用 $lt 确保不包含下一年的数据
        };
      } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        condition.purchaseDate = { $gte: start, $lte: end };
      }

      // 如果提供了消费类型
      if (purchaseType) {
        condition.purchaseType = purchaseType;
      }

      // 基础统计
      const baseStats = await PurchaseRecord.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$purchaseAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // 按时间和类型的二维统计
      const timeTypeStats = await PurchaseRecord.aggregate([
        { $match: condition },
        {
          $group: {
            _id: {
              type: '$purchaseType',
              // 根据 groupBy 参数选择不同的时间格式
              time: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: [groupBy, 'year'] },
                      then: { $dateToString: { format: '%Y', date: '$purchaseDate' } }
                    },
                    {
                      case: { $eq: [groupBy, 'month'] },
                      then: { $dateToString: { format: '%Y-%m', date: '$purchaseDate' } }
                    },
                    {
                      case: { $eq: [groupBy, 'date'] },
                      then: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' } }
                    }
                  ],
                  default: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' } }
                }
              }
            },
            amount: { $sum: '$purchaseAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.time': 1, '_id.type': 1 } }
      ]);

      // 处理统计结果
      const result = {
        totalAmount: baseStats[0]?.totalAmount || 0,
        count: baseStats[0]?.count || 0
      };

      // 按时间维度重组数据
      const timeGroupedStats = {};
      const typeSet = new Set();

      timeTypeStats.forEach(stat => {
        const { time, type } = stat._id;
        typeSet.add(type);

        if (!timeGroupedStats[time]) {
          timeGroupedStats[time] = {
            time,
            total: 0,
            count: 0,
            types: {}
          };
        }

        timeGroupedStats[time].types[type] = {
          amount: stat.amount,
          count: stat.count
        };

        timeGroupedStats[time].total += stat.amount;
        timeGroupedStats[time].count += stat.count;
      });

      // 转换为数组格式
      result.details = Object.values(timeGroupedStats).map(timeGroup => ({
        time: timeGroup.time,
        total: timeGroup.total,
        count: timeGroup.count,
        types: Array.from(typeSet).map(type => ({
          type,
          ...timeGroup.types[type] || { amount: 0, count: 0 }
        }))
      }));

      // 添加类型汇总
      result.typeStats = Array.from(typeSet).map(type => {
        const typeTotal = timeTypeStats
          .filter(stat => stat._id.type === type)
          .reduce((sum, stat) => ({
            amount: sum.amount + stat.amount,
            count: sum.count + stat.count
          }), { amount: 0, count: 0 });

        return {
          type,
          amount: typeTotal.amount,
          count: typeTotal.count
        };
      });

      return result;
    } catch (error) {
      console.error('获取消费统计数据失败:', error);
      throw error;
    }
  }
}

module.exports = new PurchaseRecordService();
