const Customer = require('../models/customerModel');

// 添加日期格式化辅助函数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class CustomerService {
  async createCustomer(customerData, session = null) {
    const options = session ? { session } : {};
    const customer = await Customer.create([customerData], options);
    return customer[0];
  }

  async getCustomerById(customerId) {
    const customer = await Customer.findOne({
      _id: customerId,
      isDeleted: { $ne: true }
    });
    return customer;
  }

  async updateCustomer(customerId, updateData, session = null) {
    const options = session ? { session, new: true } : { new: true };
    const customer = await Customer.findByIdAndUpdate(customerId, updateData, options);
    return customer;
  }
  
  async deleteCustomer(customerId, updatedBy) {
    // 软删除客户
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        isDeleted: true,
        updatedBy,
        updatedAt: new Date()
      },
      { new: true }
    );
    return customer;
  }

  async getCustomers(query) {
    const { page = 1, limit = 10, name = '', medicalRecordNumber = '' } = query;
    
    // 构建查询条件
    const condition = {
      isDeleted: { $ne: true } // 只查询未删除的客户
    };
    
    // 名称模糊查询
    if (name) {
      condition.name = { $regex: name, $options: 'i' };
    }
    
    // 病历号精确查询
    if (medicalRecordNumber) {
      condition.medicalRecordNumber = medicalRecordNumber;
    }

    try {
      // 计算跳过的文档数
      const skip = (Number(page) - 1) * Number(limit);

      // 执行查询
      const customers = await Customer.find(condition)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      // 格式化返回数据，将 _id 重命名为 customerId
      const formattedCustomers = customers.map(customer => {
        const { _id, ...rest } = customer.toObject();
        return {
          customerId: _id,
          ...rest
        };
      });

      // 获取总数
      const total = await Customer.countDocuments(condition);

      return {
        list: formattedCustomers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      };
    } catch (error) {
      console.error('获取客户列表失败:', error);
      throw error;
    }
  }

  async getCustomerByMedicalRecordNumber(medicalRecordNumber, session = null) {
    const options = session ? { session } : {};
    const customer = await Customer.findOne({
      medicalRecordNumber,
      isDeleted: { $ne: true }
    }, null, options);
    if (!customer) {
      throw new Error('客户不存在');
    }
    return customer;
  }

  // async getTotalCustomers() {
  //   try {
  //     const total = await Customer.countDocuments({ isDeleted: { $ne: true } });
  //     return total;
  //   } catch (error) {
  //     console.error('获取总客户数失败:', error);
  //     throw error;
  //   }
  // }

  // async getNewCustomersByDate(date) {
  //   try {
  //     // 转换日期为当天的开始和结束时间
  //     const startDate = new Date(date);
  //     startDate.setHours(0, 0, 0, 0);
      
  //     const endDate = new Date(date);
  //     endDate.setHours(23, 59, 59, 999);

  //     const count = await Customer.countDocuments({
  //       createdAt: {
  //         $gte: startDate,
  //         $lte: endDate
  //       },
  //       isDeleted: { $ne: true }
  //     });

  //     return count;
  //   } catch (error) {
  //     console.error('获取新增客户数失败:', error);
  //     throw error;
  //   }
  // }

  async getCustomerStats(query = {}) {
    try {
      const { 
        year,       // 年份，如：2025
        month,      // 月份，如：1-12
        date,       // 具体日期，如：2025-01-01
        startDate,  // 开始日期，如：2025-01-01
        endDate     // 结束日期，如：2025-12-31
      } = query;

      const condition = {
        isDeleted: { $ne: true }
      };

      // 如果提供了具体日期
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        condition.createdAt = { $gte: start, $lte: end };
      }
      // 如果提供了年份和月份
      else if (year && month) {
        const start = new Date(year, month - 1, 1); // 月份从0开始
        const end = new Date(year, month, 0, 23, 59, 59, 999); // 获取月份最后一天
        condition.createdAt = { $gte: start, $lte: end };
      }
      // 如果只提供了年份
      else if (year) {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        condition.createdAt = { $gte: start, $lte: end };
      }
      // 如果提供了日期区间
      else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        condition.createdAt = { $gte: start, $lte: end };
      }

      // 获取总数
      const total = await Customer.countDocuments(condition);

      // 如果查询的是时间范围，还返回每天的新增数量
      let dailyStats = [];
      if (condition.createdAt) {
        const { $gte: startDate, $lte: endDate } = condition.createdAt;
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        if (days <= 31) { // 只在查询范围不超过31天时返回每日统计
          for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            
            const count = await Customer.countDocuments({
              ...condition,
              createdAt: {
                $gte: currentDate,
                $lt: nextDate
              }
            });

            dailyStats.push({
              date: formatDate(currentDate),
              count
            });
          }
        }
      }

      return {
        total,
        dailyStats: dailyStats.length > 0 ? dailyStats : undefined
      };
    } catch (error) {
      console.error('获取客户统计数据失败:', error);
      throw error;
    }
  }
}

module.exports = new CustomerService();