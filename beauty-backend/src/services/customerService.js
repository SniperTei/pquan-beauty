const Customer = require('../models/customerModel');

class CustomerService {
  async createCustomer(customerData) {
    const customer = await Customer.create(customerData);
    return customer;
  }

  async getCustomerById(customerId) {
    const customer = await Customer.findById(customerId);
    return customer;
  }

  async updateCustomer(customerId, updateData) {
    const customer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    return customer;
  }
  
  async deleteCustomer(customerId) {
    await Customer.findByIdAndDelete(customerId);
  }

  async getCustomers(query) {
    const { page = 1, limit = 10, name = '', medicalRecordNumber = '' } = query;
    
    // 构建查询条件
    const condition = {};
    
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

  async getCustomerByMedicalRecordNumber(medicalRecordNumber) {
    const customer = await Customer.findOne({ medicalRecordNumber });
    if (!customer) {
      throw new Error('客户不存在');
    }
    return customer;
  }
}

module.exports = new CustomerService();