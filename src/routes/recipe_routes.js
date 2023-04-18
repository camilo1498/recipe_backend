const RecipeController = require('../controllers/recipe_controller')
const RecipeCommentController = require('../controllers/recipe_comment_controller')
const validateRole = require('../middleware/validateRole')
const jwt_helper = require('../helpers/jwt_helper')
const passport = require('passport')
const { upload } = require('../middleware/uploadFile')


module.exports = (app) => {
    app.post('/api/recipe/create', [jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), /*validateRole.validateAdmin, */upload.array('image')], RecipeController.createRecipe),
        app.get('/api/recipe/getById', jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), RecipeController.getRecipeByID),
        app.get('/api/recipe/getAll', jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), RecipeController.getAll),
        app.delete('/api/recipe/delete', [jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false })/*, validateRole.validateAdmin*/], RecipeController.deleteRecipe),
        app.put('/api/recipe/updateRecipe', [jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false })/*, validateRole.validateAdmin]*/, upload.array('image')], RecipeController.updateRecipe),
        app.post('/api/recipe/create_recipe_type', jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), RecipeController.createRecipeType),
        app.get('/api/recipe/getAllTypes', jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), RecipeController.getAllTypes),

        app.post('/api/recipe/create_comment', [jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), /*validateRole.validateAdmin, */upload.array('image')], RecipeCommentController.createComment),
        app.get('/api/recipe/getAllCommentsById', jwt_helper.verifyAccessToken, passport.authenticate('jwt', { session: false }), RecipeCommentController.getRecipeCommentByID)
}