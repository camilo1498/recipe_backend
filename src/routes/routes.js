const userroutes = require('./userRoutes')
const roleRoutes = require('./roleRoutes')
const recipeRoutes = require('./recipe_routes')

/// init routes
module.exports = (app) => {
    userroutes(app)
    roleRoutes(app)
    recipeRoutes(app)
}