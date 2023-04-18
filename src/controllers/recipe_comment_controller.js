const recipeCommentModel = require('../models/recipe/recipe_comment_model')
const validations = require('../utils/validations')
const cloudinary = require('../middleware/cloudinary')
const jwt_helper = require('../helpers/jwt_helper')
const fs = require('fs')
const { response } = require('express')


module.exports = {
    /// create comments
    async createComment(req, res) {
        /// decode token
        const decodeToken = jwt_helper.decodeAccessToken(req)
        /// image url array
        const imageUrl = []
        let updateMap = {}

        try {
            /// get and save http param into a variable
            const {
                recipe,
                message
            } = req.body

            if (req.files === undefined && req.files.length === 0 && message === undefined && message === null && message.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "debes enviar un comentario o imagen",
                    data: {}
                })
            }
            else if (req.files !== undefined && req.files.length > 0) {

                /// instance of cloudinary and define image path and destination folder name
                const uploader = async (path) => await cloudinary.uploads(path, 'recipe comment Images/' + new Date().toISOString() + + '')

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
                        console.log(e)
                    }
                }

                updateMap = {
                    user: decodeToken.id,
                    recipe,
                    message,
                    image: {
                        path_folder: imageUrl.length === 0 ? null : 'recipe comment Images/' + new Date().toISOString(),
                        images: imageUrl.length === 0 ? null : imageUrl
                    }
                }
            } else {
                updateMap = {
                    user: decodeToken.id,
                    recipe,
                    message
                }
            }

            const comment = new recipeCommentModel(updateMap)

            await comment.save().then(response => {
                res.status(201).json({
                    success: true,
                    message: 'comment created',
                    data: response ?? {}
                })
            }).catch(err => {
                validations.validateResponse(res, err)
            })


        } catch (e) {
            console.log(e)
            /// internal error
            validations.validateResponse(res, e ?? 'Error while create comment')
        }
    },

    /// get recipe by id
    async getRecipeCommentByID(req, res) {
        try {

            /// get and save http param into a variable
            const { recipe_id, page } = req.query

            /// DB query
            await recipeCommentModel.paginate({ recipe: recipe_id }, {
                page: page,
                limit: 10,
                lean: true,
                populate: {
                    path: 'user',
                    select: { name: 1, lastname: 1 }
                },
                sort: { createdAt: 'descending' }
            })
                /// success, post found
                .then(async (response) => {
                    /// success response
                    res.status(200).json({
                        success: true,
                        message: response === null ? 'Error, post does not exist' : 'data found',
                        page: response.page,
                        nextPage: response.nextPage ?? response.page,
                        prevPage: response.prevPage ?? response.page,
                        totalPages: response.totalPages,
                        total_items: response.totalDocs,
                        hasPrevPage: response.hasPrevPage,
                        hasNextPage: response.hasNextPage,
                        data: response.docs ?? []
                    })
                }) /// error response
                .catch(err => {
                    validations.validateResponse(res, err, [])
                })

        } catch (e) {
            console.log(e)
            /// inernal error
            validations.validateResponse(res, 'Error while getting post', [])
        }
    },
}