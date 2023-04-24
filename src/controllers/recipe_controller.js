/// instances
const RecipeModel = require('../models/recipe/recipe_model')
const RecipeTypeModel = require('../models/recipe/recipe_type_model')
const RecipeTagModel = require('../models/recipe/recipe_tags')
const RecipeDifficultyModel = require('../models/recipe/recipe_difficlty_model')
const validations = require('../utils/validations')
const cloudinary = require('../middleware/cloudinary')
const jwt_helper = require('../helpers/jwt_helper')
const fs = require('fs')

/// class functions
module.exports = {
    /// create new recipe
    async createRecipe(req, res) {
        /// decode token
        const decodeToken = jwt_helper.decodeAccessToken(req)
        /// image url array
        const imageUrl = []

        try {
            /// get and save http param into a variable
            const {
                name,
                type,
                portions,
                preparationTime,
                videoUri,
                steps,
                difficulty,
                tags,
                ingredients } = req.body

            /// instance of cloudinary and define image path and destination folder name
            const uploader = async (path) => await cloudinary.uploads(path, 'recipe Images/' + name + '_' + new Date().toISOString() + + '')

            /// get http files
            const files = req.files

            /// iterate in files array
            for (const file of files) {
                const { path } = file
                /// upload image to cloudinary service
                const newPath = await uploader(path)
                /// save cloudinary image path
                imageUrl.push(newPath.URL)
                /// delete local image
                try {
                    fs.unlinkSync(path)
                } catch (e) {

                }
            }

            /// body response model
            const ingredient = new RecipeModel({
                name,
                type,
                portions,
                preparationTime,
                steps,
                difficulty,
                image: {
                    path_folder: imageUrl.length === 0 ? null : 'recipe Images/' + name + '_' + new Date().toISOString(),
                    images: imageUrl.length === 0 ? null : imageUrl
                },
                videoUri,
                ingredients,
                comments: [],
                favourite_count: [],
                tags,
                created_by: decodeToken.id
            })

            /// DB query
            await ingredient.save()
                /// success response
                .then(response => {
                    res.status(201).json({
                        success: true,
                        message: 'post created',
                        data: response ?? []
                    })
                }) /// error response
                .catch(err => {
                    validations.validateResponse(res, err)
                })

        } catch (e) {
            /// internal error
            validations.validateResponse(res, e ?? 'Error while create post')
        }
    },

    /// get recipe by id
    async getRecipeByID(req, res) {
        try {
            /// decode token
            const decodeToken = jwt_helper.decodeAccessToken(req)

            /// get and save http param into a variable
            const { id } = req.query

            /// DB query
            await RecipeModel.findById({ _id: id })
                .populate('type', { name: 1 })
                .populate('difficulty', { name: 1 })
                .populate('created_by', { name: 1, lastname: 1 })
                /// success, post found
                .then(async (response) => {
                    /// success response
                    res.status(200).json({
                        success: true,
                        message: response === null ? 'Error, post does not exist' : 'data found',
                        data: response ?? []
                    })
                }) /// error response
                .catch(err => {
                    res.status(200).json({
                        success: true,
                        message: err ?? 'No data found',
                        data: []
                    })
                })

        } catch (e) {
            /// inernal error
            validations.validateResponse(res, 'Error while getting post')
        }
    },

    /// get all recipes
    async getAll(req, res) {
        try {
            const { type, name, tags } = req.body

            console.log(tags)
            var body = { name: { '$regex': name, '$options': 'i' } }

            if (type !== null && type !== undefined) {

                body = {
                    type: type,
                    name: { '$regex': name, '$options': 'i' }
                }
            }
            if (tags !== null && tags !== undefined && tags.length !== 0) {
                body = { name: { '$regex': name, '$options': 'i' }, tags: { $in: tags } }
            }
            if (tags !== null && tags !== undefined && type !== null && type !== undefined) {
                body = {
                    type: type,
                    name: { '$regex': name, '$options': 'i' },
                    tags: { $in: tags }
                }
            }

            /// DB query
            await RecipeModel.find(body)
                .populate('type', { name: 1 })
                .populate('difficulty', { name: 1 })
                .populate('tags', { name: 1 })
                .populate('created_by', { name: 1, lastname: 1 })
                .sort({ createdAt: 'descending' })
                .then(response => { /// success response
                    res.status(200).json({
                        success: true,
                        message: 'getting all recipes',
                        total_items: response.length,
                        data: response ?? []
                    })
                }).catch(err => { /// error response
                    validations.validateResponse(res, err)
                })
        } catch (e) { /// inernal error
            validations.validateResponse(res, e ?? 'Error while getting recipes')
        }
    },

    /// delete recipe
    async deleteRecipe(req, res) {
        try {
            /// get and save http param into a variable
            const { id } = req.query

            /// DB query
            await RecipeModel.findByIdAndDelete({ _id: id })
                .then(response => { /// success response
                    res.status(200).json({
                        success: true,
                        message: response === null ? 'Error, recipe does not exist' : 'deleted recipe',
                        data: response ?? {}
                    })
                }).catch(err => { /// error response
                    validations.validateResponse(res, err)
                })
        } catch (e) { /// internal error
            validations.validateResponse(res, e ?? 'Error while deleting recipe')
        }
    },

    /// update recipe data
    async updateRecipe(req, res) {
        /// image url array
        const imageUrl = []
        let updateMap = {}
        try {
            /// get and save http param into a variable
            const {
                id,
                name,
                type,
                steps,
                portions,
                preparationTime,
                videoUri,
                ingredients,
                difficulty
            } = req.body

            if (req.files.length > 0) {
                /// instance of cloudinary and define image path and destination folder name
                const uploader = async (path) => await cloudinary.uploads(path, 'recipe Images/' + name + '_' + new Date().toISOString() + + '')

                /// get http files
                const files = req.files
                /// iterate in files array
                for (const file of files) {
                    const { path } = file
                    /// upload image to cloudinary service
                    const newPath = await uploader(path)
                    /// save cloudinary image path
                    imageUrl.push(newPath.URL)
                    /// delete local image
                    try {
                        fs.unlinkSync(path)
                    } catch (e) {

                    }
                }

                updateMap = {
                    name,
                    type,
                    steps,
                    portions,
                    preparationTime,
                    image: {
                        path_folder: imageUrl.length === 0 ? null : 'recipe Images/' + name + '_' + new Date().toISOString(),
                        images: imageUrl.length === 0 ? null : imageUrl
                    },
                    videoUri,
                    ingredients,
                    difficulty
                }
            } else {
                updateMap = {
                    name,
                    portions,
                    steps,
                    type,
                    preparationTime,
                    videoUri,
                    ingredients,
                    difficulty
                }
            }


            /// DB query
            await RecipeModel.findByIdAndUpdate({ _id: id }, {
                /// data that will be update
                $set: updateMap
            }, { /// only update fields that has changes
                new: true
            }).then(response => { /// success response
                res.status(200).json({
                    success: true,
                    message: response === null ? 'Error, post does not exist' : 'post updated successfuly',
                    data: response ?? []
                })
            }).catch(err => {  /// error response
                validations.validateResponse(res, err)
            })

        } catch (e) {
            /// inernal error
            validations.validateResponse(res, e ?? 'Error while updating post')
        }
    },


    //** RECIPE CATEGORY METHODS **/

    /// create type
    async createRecipeType(req, res) {
        try {
            const { name } = req.body


            const recipeType = new RecipeTypeModel({
                name
            })

            await recipeType.save()
                .then(response => {
                    res.status(200).json({
                        success: true,
                        message: 'recipe type created',
                        data: response ?? []
                    })
                }).catch(err => {
                    validations.validateResponse(res, err)
                })

        } catch (e) {
            validations.validateResponse(res, e ?? 'Error while creating recipe type')
        }
    },

    /// get all recipe types
    async getAllTypes(req, res) {
        try {
            /// DB query
            await RecipeTypeModel.find({}).then(response => { /// success response
                res.status(200).json({
                    success: true,
                    message: 'getting all recipes',
                    total_items: response.length,
                    data: response ?? []
                })
            }).catch(err => { /// error response
                validations.validateResponse(res, err)
            })
        } catch (e) { /// inernal error
            validations.validateResponse(res, e ?? 'Error while getting recipes')
        }
    },

    //** RECIPE CATEGORY METHODS **/
    /// get all difficulty
    async createRecipeDifficulty(req, res) {
        try {
            const { name } = req.body


            const recipeType = new RecipeDifficultyModel({
                name
            })

            await recipeType.save()
                .then(response => {
                    res.status(200).json({
                        success: true,
                        message: 'recipe difficulty created',
                        data: response ?? []
                    })
                }).catch(err => {
                    validations.validateResponse(res, err)
                })

        } catch (e) {
            validations.validateResponse(res, e ?? 'Error while creating recipe difficulty')
        }
    },

    /// get all recipe types
    async getAllDifficulties(req, res) {
        try {
            /// DB query
            await RecipeDifficultyModel.find({}).then(response => { /// success response
                res.status(200).json({
                    success: true,
                    message: 'getting all difficulty',
                    data: response ?? []
                })
            }).catch(err => { /// error response
                validations.validateResponse(res, err)
            })
        } catch (e) { /// inernal error
            validations.validateResponse(res, e ?? 'Error while getting ')
        }
    },

    //** RECIPE TAG METHODS **/
    /// create tag
    async createRecipeTag(req, res) {
        try {
            /// get and save http param into a variable
            const { name } = req.body
            /// set param data to user role model
            const role = new RecipeTagModel({
                name
            })

            /// DB query
            await role.save()
                /// success response
                .then(response => {


                    res.status(201).json({
                        success: true,
                        message: 'RolTage was created successfuly',
                        data: response ?? {}
                    })
                }) /// error response
                .catch(err => {
                    validations.validateResponse(res, err)
                })
        } catch (e) {
            validations.validateResponse(res, e ?? 'Error while creating tag')
        }
    },

    async getAllTags(req, res) {
        try {
            await RecipeTagModel.find({}).then(response => {
                res.status(201).json({
                    success: true,
                    message: 'success',
                    data: response ?? []
                })
            }).catch(err => {
                validations.validateResponse(res, err)
            })
        } catch (e) {
            validations.validateResponse(res, e ?? 'Error while getting tag')
        }
    }
}