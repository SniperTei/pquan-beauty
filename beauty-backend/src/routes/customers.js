const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authHandler = require('../middleware/authHandler');

// 需要身份验证的路由
router.post('/', authHandler, customerController.createCustomer);
router.get('/:id', authHandler, customerController.getCustomerById);
router.put('/:id', authHandler, customerController.updateCustomer);
router.delete('/:id', authHandler, customerController.deleteCustomer);
router.get('/', authHandler, customerController.getCustomers);

module.exports = router;