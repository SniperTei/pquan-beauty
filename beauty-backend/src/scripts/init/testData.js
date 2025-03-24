const Customer = require('../../models/customerModel');
const mongoose = require('mongoose');

async function createTestCustomers() {
  const mockUserId = new mongoose.Types.ObjectId();
  
  const customers = [
    {
      name: '测试客户1',
      medicalRecordNumber: 'MRN001',
      createdBy: mockUserId,
      updatedBy: mockUserId
    },
    {
      name: '测试客户2',
      medicalRecordNumber: 'MRN002',
      createdBy: mockUserId,
      updatedBy: mockUserId
    }
  ];

  try {
    await Customer.insertMany(customers);
    console.log('测试数据创建成功');
  } catch (error) {
    console.error('创建测试数据失败:', error);
  }
}

module.exports = createTestCustomers; 