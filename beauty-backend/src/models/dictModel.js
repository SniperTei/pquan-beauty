const mongoose = require('mongoose');

const dictSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  remarks: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  }
});

const Dict = mongoose.model('Dict', dictSchema);

module.exports = Dict;

