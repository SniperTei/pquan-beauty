const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authHandler = require('../middleware/authHandler');

// 确保目录存在
const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// 初始化上传目录
['images', 'excel', 'word', 'pdf'].forEach(dir => {
  createDirectoryIfNotExists(`uploads/${dir}`);
});

// 获取文件类型目录
const getFileTypeDirectory = (mimetype, extension) => {
  // 图片文件
  if (mimetype.startsWith('image/')) {
    return 'images';
  }
  // Excel文件
  if (['application/vnd.ms-excel', 
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'text/csv'].includes(mimetype) || 
      ['.xlsx', '.xls', '.csv'].includes(extension)) {
    return 'excel';
  }
  // Word文件
  if (['application/msword',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
       .includes(mimetype) || 
      ['.doc', '.docx'].includes(extension)) {
    return 'word';
  }
  // PDF文件
  if (mimetype === 'application/pdf' || extension === '.pdf') {
    return 'pdf';
  }
  return 'others';
};

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const directory = getFileTypeDirectory(file.mimetype, fileExtension);
    const uploadPath = `uploads/${directory}`;
    createDirectoryIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    // 图片文件类型
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    // Excel文件类型
    excel: ['application/vnd.ms-excel', 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'],
    // Word文件类型
    word: ['application/msword',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    // PDF文件类型
    pdf: ['application/pdf']
  };

  const allowedExtensions = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    excel: ['.xlsx', '.xls', '.csv'],
    word: ['.doc', '.docx'],
    pdf: ['.pdf']
  };

  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // 检查是否是允许的文件类型
  const isAllowedMimeType = Object.values(allowedTypes)
    .flat()
    .includes(file.mimetype);
  
  const isAllowedExtension = Object.values(allowedExtensions)
    .flat()
    .includes(fileExtension);

  if (isAllowedMimeType && isAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 文件上传配置
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 单个文件限制 5MB
    files: 9 // 最多 9 个文件
  }
});

// 错误处理中间件
const handleUploadError = (err, req, res, next) => {
  console.log('Upload error:', err); // 添加错误日志

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.error(400, 'A00100', '文件大小不能超过 5MB');
    }
    // 添加更详细的错误信息
    switch (err.code) {
      case 'LIMIT_PART_COUNT':
        return res.error(400, 'A00100', '超出最大文件数量限制');
      case 'LIMIT_FILE_COUNT':
        return res.error(400, 'A00100', '超出最大文件数量限制');
      case 'LIMIT_FIELD_KEY':
        return res.error(400, 'A00100', '表单字段名超长');
      case 'LIMIT_FIELD_VALUE':
        return res.error(400, 'A00100', '表单字段值超长');
      case 'LIMIT_FIELD_COUNT':
        return res.error(400, 'A00100', '超出表单字段数量限制');
      case 'LIMIT_UNEXPECTED_FILE':
        return res.error(400, 'A00100', '未预期的文件字段');
      default:
        return res.error(400, 'A00100', '文件上传失败: ' + err.message);
    }
  }
  
  if (err.message.includes('不支持的文件类型')) {
    return res.error(400, 'A00100', '不支持的文件类型');
  }
  
  next(err);
};

// 生成文件访问URL
const getFileUrl = (req, filePath) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL
    : `${req.protocol}://${req.get('host')}`;
  
  return `${baseUrl}/${filePath}`;
};

// 处理单个文件信息
const processFileInfo = (req, file) => {
  return {
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    type: path.dirname(file.path).split('/').pop(),
    url: getFileUrl(req, file.path)
  };
};

// 上传接口 - 支持多文件
router.post('/', 
  authHandler,
  (req, res, next) => {
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return res.error(400, 'A00100', '请求格式必须是 multipart/form-data');
    }
    next();
  },
  upload.array('files', 9), // 使用 array 方法支持多文件，字段名改为 files
  handleUploadError,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.error(400, 'A00100', '请选择要上传的文件');
    }

    if (req.files.length > 9) {
      return res.error(400, 'A00100', '最多只能上传9个文件');
    }

    // 处理所有文件信息
    const filesInfo = req.files.map(file => processFileInfo(req, file));

    res.success({
      files: filesInfo,
      total: filesInfo.length
    }, '文件上传成功');
  }
);

// 治疗记录文件存储配置
const treatmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/treatments';
    createDirectoryIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    
    try {
      // 获取文件名
      let originalName = file.originalname;
      
      // 如果文件名是 URL 编码的，进行解码
      try {
        if (originalName.includes('%')) {
          originalName = decodeURIComponent(originalName);
        }
      } catch (e) {
        console.warn('文件名解码失败:', e);
      }

      const extension = path.extname(originalName);
      const nameWithoutExt = path.basename(originalName, extension);
      
      // 只替换不允许的文件名字符
      const safeName = nameWithoutExt.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
      
      // 生成最终文件名
      const finalName = `${safeName}_${timestamp}${extension}`;
      
      console.log('原始文件名:', file.originalname);
      console.log('解码后文件名:', originalName);
      console.log('最终文件名:', finalName);
      
      cb(null, finalName);
    } catch (err) {
      console.error('文件名处理错误:', err);
      cb(null, `treatment_${timestamp}${path.extname(file.originalname)}`);
    }
  }
});

// 治疗记录文件上传配置
const treatmentUpload = multer({
  storage: treatmentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 9
  }
});

// 上传治疗记录文件接口
router.post('/treatment', 
  authHandler,
  (req, res, next) => {
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return res.error(400, 'A00100', '请求格式必须是 multipart/form-data');
    }
    next();
  },
  treatmentUpload.array('files', 9),
  handleUploadError,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.error(400, 'A00100', '请选择要上传的文件');
    }

    if (req.files.length > 9) {
      return res.error(400, 'A00100', '最多只能上传9个文件');
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      type: 'treatments',
      url: getFileUrl(req, file.path)
    }));

    res.success({
      files: filesInfo,
      total: filesInfo.length
    }, '治疗记录文件上传成功');
  }
);

module.exports = router; 