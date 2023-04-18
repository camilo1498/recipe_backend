const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const dificultySchema = new Schema({
    name: {
        type: String,
        require: true
    }
})

dificultySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

dificultySchema.plugin(uniqueValidator)

const RecipeDifficultyModel = model('difficulty', dificultySchema)

module.exports = RecipeDifficultyModel