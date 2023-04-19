const userroutes = require('./userRoutes')
const roleRoutes = require('./roleRoutes')
const recipeRoutes = require('./recipe_routes')

/// init routes
module.exports = (app) => {
    app.get('*', (req, res) => { res.status(404).json({ 'success': false, 'message': 'api not found' }) })
    app.post('*', (req, res) => { res.status(404).json({ 'success': false, 'message': 'api not found' }) })
    app.put('*', (req, res) => { res.status(404).json({ 'success': false, 'message': 'api not found' }) })
    app.delete('*', (req, res) => { res.status(404).json({ 'success': false, 'message': 'api not found' }) })
    app.patch('*', (req, res) => { res.status(404).json({ 'success': false, 'message': 'api not found' }) })
    userroutes(app)
    roleRoutes(app)
    recipeRoutes(app)
}