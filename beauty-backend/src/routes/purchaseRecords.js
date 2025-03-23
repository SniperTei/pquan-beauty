const express = require('express');
const router = express.Router();
const purchaseRecordController = require('../controllers/purchaseRecordController');
const authHandler = require('../middleware/authHandler');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authHandler, purchaseRecordController.createPurchaseRecord);
router.get('/', authHandler, purchaseRecordController.getPurchaseRecords);
router.put('/:id', authHandler, purchaseRecordController.updatePurchaseRecord);
router.delete('/:id', authHandler, purchaseRecordController.deletePurchaseRecord);

// 添加导入路由
router.post('/import', authHandler, upload.single('file'), purchaseRecordController.importPurchaseRecords);

module.exports = router;