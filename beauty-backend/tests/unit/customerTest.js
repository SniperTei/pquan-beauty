const mongoose = require('mongoose');
const Customer = require('../../src/models/customerModel');
const customerService = require('../../src/services/customerService');

describe('Customer Tests', () => {
  let testCustomer;
  const mockUserId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty_test');
  });

  afterAll(async () => {
    // 清理数据库并断开连接
    await Customer.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 在每个测试前清理数据
    await Customer.deleteMany({});

    // 创建测试数据
    testCustomer = await Customer.create({
      name: '测试客户',
      medicalRecordNumber: 'MRN001',
      createdBy: mockUserId,
      updatedBy: mockUserId
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      const customerData = {
        name: '新客户',
        medicalRecordNumber: 'MRN002',
        createdBy: mockUserId,
        updatedBy: mockUserId
      };

      const customer = await customerService.createCustomer(customerData);

      expect(customer).toBeDefined();
      expect(customer.name).toBe(customerData.name);
      expect(customer.medicalRecordNumber).toBe(customerData.medicalRecordNumber);
    });

    it('should fail when creating customer with duplicate medical record number', async () => {
      const customerData = {
        name: '重复客户',
        medicalRecordNumber: 'MRN001', // 使用已存在的病历号
        createdBy: mockUserId,
        updatedBy: mockUserId
      };

      await expect(customerService.createCustomer(customerData))
        .rejects
        .toThrow();
    });
  });

  describe('getCustomerById', () => {
    it('should get customer by id successfully', async () => {
      const customer = await customerService.getCustomerById(testCustomer._id);

      expect(customer).toBeDefined();
      expect(customer.name).toBe(testCustomer.name);
      expect(customer.medicalRecordNumber).toBe(testCustomer.medicalRecordNumber);
    });

    it('should return null for non-existent customer id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const customer = await customerService.getCustomerById(nonExistentId);

      expect(customer).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const updateData = {
        name: '更新的客户名称',
        remarks: '添加备注'
      };

      const updatedCustomer = await customerService.updateCustomer(
        testCustomer._id,
        updateData
      );

      expect(updatedCustomer.name).toBe(updateData.name);
      expect(updatedCustomer.remarks).toBe(updateData.remarks);
    });

    it('should fail when updating non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: '更新名称' };

      const updatedCustomer = await customerService.updateCustomer(
        nonExistentId,
        updateData
      );

      expect(updatedCustomer).toBeNull();
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      await customerService.deleteCustomer(testCustomer._id);

      const deletedCustomer = await Customer.findById(testCustomer._id);
      expect(deletedCustomer).toBeNull();
    });
  });

  describe('getCustomers', () => {
    beforeEach(async () => {
      // 创建多个测试客户
      await Customer.create([
        {
          name: '客户A',
          medicalRecordNumber: 'MRN002',
          createdBy: mockUserId,
          updatedBy: mockUserId
        },
        {
          name: '客户B',
          medicalRecordNumber: 'MRN003',
          createdBy: mockUserId,
          updatedBy: mockUserId
        }
      ]);
    });

    it('should get all customers', async () => {
      const customers = await customerService.getCustomers({});
      expect(customers.length).toBe(3); // 包括beforeEach中创建的测试客户
    });

    it('should filter customers by name', async () => {
      const customers = await customerService.getCustomers({ name: '客户A' });
      expect(customers.length).toBe(1);
      expect(customers[0].name).toBe('客户A');
    });
  });
}); 