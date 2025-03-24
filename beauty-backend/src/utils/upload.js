const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 设置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  console.log('收到文件:', file);
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只支持上传图片文件'), false);
  }
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 5, // 5MB
    files: 10 // 最多10个文件
  },
  fileFilter: fileFilter
}).array('images', 10);

module.exports = upload;
