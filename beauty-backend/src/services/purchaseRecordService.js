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
  // 转换响应格式的辅助方法
  _formatResponse(record) {
    if (!record) return null;
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
      } : null
    };
  }

  async createPurchaseRecord(recordData, session = null) {
    try {
      const { customerInfo, ...purchaseData } = recordData;
      let customer;

      // 处理客户信息
      if (customerInfo.customerId) {
        // 使用现有客户
        customer = await Customer.findById(customerInfo.customerId);
        if (!customer) {
          throw new Error('客户不存在');
        }
        // 更新客户的新老客户标记
        if (customerInfo.newCustomerFlag) {
          await Customer.findByIdAndUpdate(
            customerInfo.customerId,
            { newCustomerFlag: customerInfo.newCustomerFlag },
            { session }
          );
        }
      } else {
        // 创建新客户
        const newCustomerData = {
          ...customerInfo,
          newCustomerFlag: customerInfo.newCustomerFlag || 'N',
          createdBy: purchaseData.createdBy,
          updatedBy: purchaseData.createdBy
        };
        customer = await Customer.create([newCustomerData], { session });
        customer = customer[0];
      }

      // 创建消费记录
      const purchaseRecord = await PurchaseRecord.create([{
        ...purchaseData,
        customerId: customer._id
      }], { session });

      const record = purchaseRecord[0].toObject();

      // 返回创建的记录
      return {
        purchaseId: record._id.toString(),  // 添加 purchaseId
        ...record,
        _id: undefined,  // 移除 _id
        customerInfo: {
          customerId: customer._id,
          name: customer.name,
          medicalRecordNumber: customer.medicalRecordNumber,
          newCustomerFlag: customer.newCustomerFlag
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getPurchaseRecords(query) {
    try {
      const { 
        page = 1, 
        limit = 10,
        customerId,
        customerName,
        medicalRecordNumber,
        purchaseType,
        purchaseItem,
        startDate,
        endDate,
        sortField = 'updatedAt',
        sortOrder = 'desc'
      } = query;

      // 如果有客户相关的查询条件，先查询符合条件的客户ID
      let customerIds = undefined;
      if (customerName || medicalRecordNumber) {
        const customerQuery = {
          isDeleted: { $ne: true }
        };
        
        if (customerName) {
          customerQuery.name = { $regex: customerName, $options: 'i' };
        }
        if (medicalRecordNumber) {
          customerQuery.medicalRecordNumber = medicalRecordNumber;
        }
        
        const customers = await Customer.find(customerQuery).select('_id');
        customerIds = customers.map(c => c._id);
        
        // 如果没找到匹配的客户，直接返回空结果
        if (customerIds.length === 0) {
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
      const condition = {
        isDeleted: { $ne: true }
      };

      // 添加过滤条件
      if (customerId || customerIds) {
        condition.customerId = customerId || { $in: customerIds };
      }
      if (startDate && endDate) {
        condition.purchaseDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (purchaseType) {
        condition.purchaseType = purchaseType;
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
        // condition.purchaseItem = purchaseItem;
      }

      // 构建排序对象
      const sortOptions = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
        ...(sortField !== 'updatedAt' ? { updatedAt: -1 } : {})
      };

      // 执行查询
      const records = await PurchaseRecord.find(condition)
        .populate('customerId')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);

      // 获取总数
      const total = await PurchaseRecord.countDocuments(condition);

      return {
        list: records.map(this._formatResponse),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePurchaseRecord(purchaseRecordId, purchaseRecordData) {
    const purchaseRecord = await PurchaseRecord.findByIdAndUpdate(
      purchaseRecordId,
      purchaseRecordData,
      { new: true }
    ).populate('customerId');

    return this._formatResponse(purchaseRecord);
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
        if (!record['姓名'] || !record['病案号'] || !record['日期'] || !record['类型'] || !record['项目']) continue;
        // 如果金额是空，则补0
        if (!record['金额']) {
          record['金额'] = 0;
        }
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

  async getPurchaseStats(query = {}) {
    try {
      const { 
        year,
        month,
        date,
        startDate,
        endDate,
        purchaseType,
        groupBy = 'date'
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
        // 设置月份的起止时间
        const start = new Date(year, month - 1, 1); // 月份从0开始，所以要减1
        start.setHours(0, 0, 0, 0);
        const end = new Date(year, month, 0); // 获取月份的最后一天
        end.setHours(23, 59, 59, 999);
        condition.purchaseDate = { $gte: start, $lte: end };
      } else if (year) {
        // 设置年份的起止时间
        const start = new Date(year, 0, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(year, 11, 31);
        end.setHours(23, 59, 59, 999);
        condition.purchaseDate = { $gte: start, $lte: end };
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

      // 使用聚合管道进行统计
      const timeTypeStats = await PurchaseRecord.aggregate([
        { $match: condition },
        {
          $group: {
            _id: {
              type: '$purchaseType',
              time: {
                $dateToString: { 
                  format: '%Y-%m-%d', 
                  date: '$purchaseDate'
                }
              }
            },
            amount: { $sum: '$purchaseAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.time': 1, '_id.type': 1 } }
      ]);

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

        // 确保金额是数值类型并保留两位小数
        const amount = Number(parseFloat(stat.amount).toFixed(2));
        
        timeGroupedStats[time].types[type] = {
          amount,
          count: stat.count
        };

        // 使用精确的金额累加
        timeGroupedStats[time].total = Number(
          (timeGroupedStats[time].total + amount).toFixed(2)
        );
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

      // 添加类型汇总，同样保持精确计算
      result.typeStats = Array.from(typeSet).map(type => {
        const typeTotal = timeTypeStats
          .filter(stat => stat._id.type === type)
          .reduce((sum, stat) => {
            const amount = Number(parseFloat(stat.amount).toFixed(2));
            return {
              amount: Number((sum.amount + amount).toFixed(2)),
              count: sum.count + stat.count
            };
          }, { amount: 0, count: 0 });

        return {
          type,
          amount: typeTotal.amount,
          count: typeTotal.count
        };
      });

      // 确保总金额也使用精确计算
      if (baseStats[0]?.totalAmount) {
        result.totalAmount = Number(
          parseFloat(baseStats[0].totalAmount).toFixed(2)
        );
      }

      return result;
    } catch (error) {
      console.error('获取消费统计数据失败:', error);
      throw error;
    }
  }
}

module.exports = new PurchaseRecordService();
