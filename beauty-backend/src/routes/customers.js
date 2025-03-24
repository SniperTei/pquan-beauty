const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authHandler = require('../middleware/authHandler');

// 获取客户统计数据 - 需要放在 /:id 路由之前
router.get('/stats', authHandler, customerController.getCustomerStats);

// 其他路由
router.post('/', authHandler, customerController.createCustomer);
router.get('/:id', authHandler, customerController.getCustomerById);
router.put('/:id', authHandler, customerController.updateCustomer);
router.delete('/:id', authHandler, customerController.deleteCustomer);
router.get('/', authHandler, customerController.getCustomers);

// 获取总客户数
// router.get('/total', authHandler, customerController.getTotalCustomers);

// 获取某天新增客户数
// router.get('/new', authHandler, customerController.getNewCustomersByDate);

module.exports = router;