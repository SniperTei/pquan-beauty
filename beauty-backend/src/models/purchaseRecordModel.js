const mongoose = require('mongoose');

const purchaseRecordSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchaseAmount: {
    type: Number,
    required: true
  },
  purchaseType: {
    type: String,
    required: true
  },
  purchaseItem: {
    type: String,
    required: true
  },
  purchaseFactItem: {
    type: String,
    required: false
  },
  remarks: {
    type: String,
    required: false
  },
  createdBy: {
    type: String,
    required: false
  },
  updatedBy: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

purchaseRecordSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const PurchaseRecord = mongoose.model('PurchaseRecord', purchaseRecordSchema);

module.exports = PurchaseRecord;