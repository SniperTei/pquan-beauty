const express = require('express');
const router = express.Router();
const purchaseRecordController = require('../controllers/purchaseRecordController');
const authHandler = require('../middleware/authHandler');

router.post('/', authHandler, purchaseRecordController.createPurchaseRecord);
router.get('/', authHandler, purchaseRecordController.getPurchaseRecords);
router.put('/:id', authHandler, purchaseRecordController.updatePurchaseRecord);
router.delete('/:id', authHandler, purchaseRecordController.deletePurchaseRecord);

module.exports = router;