const customerService = require('../services/customerService');

class CustomerController {
  async createCustomer(req, res) {
    try {
      const customerData = req.body;
      // 从 token 中获取当前用户信息
      customerData.createdBy = req.user.userId;
      customerData.updatedBy = req.user.userId;

      const customer = await customerService.createCustomer(customerData);
      res.success(customer, '客户创建成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getCustomerById(req, res) {
    try {
      const customerId = req.params.id;
      const customer = await customerService.getCustomerById(customerId);

      if (!customer) {
        res.error(404, 'A00101', '客户不存在');
        return;
      }

      res.success(customer, '客户获取成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async updateCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const updateData = req.body;
      // 从 token 中获取当前用户信息
      updateData.updatedBy = req.user.userId;

      const customer = await customerService.updateCustomer(customerId, updateData);
      res.success(customer, '客户更新成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;
      await customerService.deleteCustomer(customerId);
      res.success(null, '客户删除成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async getCustomers(req, res) {
    try {
      const result = await customerService.getCustomers(req.query);
      res.success(result, '客户列表获取成功');
    } catch (error) {
      console.error('获取客户列表失败:', error);
      res.error(400, 'A00100', error.message);
    }
  }
}

module.exports = new CustomerController();