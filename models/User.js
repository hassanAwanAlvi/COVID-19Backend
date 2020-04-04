const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({


  nic: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },

  days: {
        type: Number,
        required: true
    },



})

userSchema.pre('save', async function (next) {

    next()
})

userSchema.statics.findByID = async (nic) => {
    // Search for a user by email and password.
    // const user = await User.findOne({ email} )
    const user = await User.find({ nic })
    if (!user) {
        return null
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User