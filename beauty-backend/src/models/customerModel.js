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