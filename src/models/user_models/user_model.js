const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const userSchema = new Schema({
    name: String, 
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: [{
        type: Schema.Types.ObjectId,
        ref: 'user_role'
    }],
    favourites: [{
        type: Schema.Types.ObjectId,
        ref: 'recipe'
    }],
}, {
    timestamps: true,
    versionKey: false
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

userSchema.plugin(uniqueValidator)

/// hash user password
userSchema.statics.encryptPassword = async (password) => {
    const genSalt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, genSalt)
}

/// compare user password
userSchema.statics.comparePassword = async (password, received) => {
    return await bcrypt.compare(password, received)
}

userSchema.pre('save', async function (next) {
    const user = this
    if (!user.isModified("password")) {
        return next()
    } else {
        const hash = await bcrypt.hash(user.password, 10)
        user.password = hash
        next()
    }
})

const UserModel = model('users', userSchema)

module.exports = UserModel