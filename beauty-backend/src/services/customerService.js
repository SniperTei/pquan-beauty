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
    const customers = await Customer.find(query);
    return customers;
  }
}

module.exports = new CustomerService();