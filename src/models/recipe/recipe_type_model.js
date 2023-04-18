const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const recipeTyeSchema = new Schema({
    name: String
}, {
    timestamps: true,
    versionKey: false
})

recipeTyeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

recipeTyeSchema.plugin(uniqueValidator)

const RecipeTypeModel = model('recipe_type', recipeTyeSchema)

module.exports = RecipeTypeModel