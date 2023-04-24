const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const tagsSchema = new Schema({
    name: String
}, {
    timestamps: true,
    versionKey: false
})

tagsSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

tagsSchema.plugin(uniqueValidator)

const tagModel = model('recipe_tags', tagsSchema)

module.exports = tagModel