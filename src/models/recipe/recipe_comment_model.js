const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const recipeCommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    recipe: {
        type: Schema.Types.ObjectId,
        ref: 'recipe'
    },
    message: String,
    image: {
        path_folder: {
            type: String
        },
        images: {
            type: Array
        }
    },
    date: {
        type: String,
        required: true
    }
}, {
    timestamps: false,
    versionKey: false
})


recipeCommentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

recipeCommentSchema.plugin(uniqueValidator)
recipeCommentSchema.plugin(mongoosePaginate)

const RecipeCommentModel = model('recipe_comment', recipeCommentSchema)

module.exports = RecipeCommentModel