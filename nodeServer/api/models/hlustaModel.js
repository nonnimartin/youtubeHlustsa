'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TaskSchema = new Schema({
  Created_date: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    default: 'No url yet'
  }
});

module.exports = mongoose.model('Tasks', TaskSchema);
