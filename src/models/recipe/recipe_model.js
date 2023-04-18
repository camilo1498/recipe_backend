const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const recipeSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    portions: {
        type: Number,
        default: 0
    },
    preparationTime: {
        type: Number,
        default: 0
    },
    videoUri: {
        type: String,
        default: ''
    },
    difficulty: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'difficulty'
    },
    type: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'recipe_type'
    },
    image: {
        path_folder: {
            type: String,
            required: true
        },
        images: {
            type: Array,
            required: true
        }
    },
    steps: [{
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'recipe_comment'
    }],
    ingredients: [{
        type: String,
        default: ''
    }],
    favourite_count: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],

    created_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
}, {
    timestamps: true,
    versionKey: false
})

recipeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

recipeSchema.plugin(uniqueValidator)

const RecipeModel = model('recipe', recipeSchema)

module.exports = RecipeModel