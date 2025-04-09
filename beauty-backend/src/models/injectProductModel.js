const mongoose = require('mongoose');

const injectProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // 注射数量
  injectQuantity: {
    type: Number,
    default: 0
  },
  // 关联消费记录
  purchaseRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRecord'
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 确保导出模型
const InjectProduct = mongoose.model('InjectProduct', injectProductSchema);
module.exports = InjectProduct;
