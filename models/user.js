const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const assert = require('assert');

const userSchema = new Schema({
    username: String,
    lastname: String,
    email: String,
    dob: Date,
    address: String,
    city: String,
    country: String,
    subs: String,
    secretToken: String,
    active: Boolean,
    password: String,
}, 
{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;





module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch(error) {
        throw new Error('Hashing failed', error);
    }
};
module.exports.comparePasswords = async (inputPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(inputPassword, hashedPassword);
        
    } catch(error) {
        throw new Error('Comparing failed', error);
    }
};