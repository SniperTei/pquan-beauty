const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const authHandler = require('../middleware/authHandler');

// 上传图片
router.post('/', authHandler, (req, res) => {
  console.log('开始处理上传请求');
  
  upload(req, res, function (err) {
    if (err) {
      console.error('上传错误:', err);
      return res.error(400, 'A00102', err.message);
    }

    console.log('请求体:', req.body);
    console.log('文件:', req.files);

    if (!req.files || req.files.length === 0) {
      console.error('没有文件被上传');
      return res.error(400, 'A00103', '没有文件被上传');
    }

    const fileUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
    res.success({ urls: fileUrls }, '文件上传成功');
  });
});

module.exports = router; 