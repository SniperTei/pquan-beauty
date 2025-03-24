const express = require('express');
const router = express.Router();
const dictController = require('../controllers/dictController');
const authHandler = require('../middleware/authHandler');

router.post('/', authHandler, dictController.createDict);
router.get('/', authHandler, dictController.getDicts);

module.exports = router;
