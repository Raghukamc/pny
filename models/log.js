const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const assert = require('assert');

const logItem = new Schema({
    log_type: String,
    log: String,
    status: String
},
{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

const LogItem = mongoose.model('logItem', logItem);
module.exports = LogItem;