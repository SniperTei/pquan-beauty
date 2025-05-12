const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    medicalRecordNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    lastPurchaseDate: {
      type: Date
    },
    remarks: {
      type: String,
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    newCustomerFlag: {
      type: String,
      enum: ['Y', 'N'],  // 只允许这两个值
      default: 'N',      // 默认为老客户
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

customerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;