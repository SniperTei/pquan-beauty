const express = require('express');
const router = express.Router();
const injectProductController = require('../controllers/injectProductController');
const authHandler = require('../middleware/authHandler');

router.post('/', authHandler, injectProductController.createInjectProduct);
router.get('/', authHandler, injectProductController.getInjectProducts);
router.get('/:id', authHandler, injectProductController.getInjectProductById);
router.put('/:id', authHandler, injectProductController.updateInjectProduct);
router.delete('/', authHandler, injectProductController.deleteInjectProduct);
router.put('/:id/purchaseRecord', authHandler, injectProductController.updatePurchaseRecords);
router.get('/stats/usage', authHandler, injectProductController.getInjectStats);
router.get('/stats/customers', authHandler, injectProductController.getCustomerStats);

module.exports = router; 