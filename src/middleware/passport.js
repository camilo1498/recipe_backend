/// instances
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const UserModel = require('../models/user_models/user_model')

/// class functions
module.exports = function (passport) {

    /// local variable
    let opts = {};
    /// save decode token and secret
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('jwt');
    opts.secretOrKey = process.env.TOKEN_SECRET

    /// validate token
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

        /// validate if user exist
        UserModel.findById(jwt_payload.id, (err, user) => {
            if (err) {
                return done(err, false);  /// error response
            }
            if (user) {
                return done(null, user);  /// success response
            }
            else {
                return done(null, false);  /// error response
            }
        })

    }))

}