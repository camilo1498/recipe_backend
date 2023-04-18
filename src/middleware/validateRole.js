/// instances
const jwt = require('jsonwebtoken')
const UserModel = require('../models/user_models/user_model')
const RoleModel = require('../models/role_models/user_role_model')
const validations = require('../utils/validations')

/// class functions
module.exports = {
    /// validate admin role
    async validateAdmin(req, res, next) {
        try {
            /// get token from header
            let token = req.headers.authorization.split(' ')[1];
            /// decode token
            const decodeToken = jwt.verify(token, process.env.TOKEN_SECRET)

            /// find user by role
            await UserModel.findById({ _id: decodeToken.id }).populate('role', { roleName: 1 }).then(async (response) => {
                /// find role by id
                const adminRole = await RoleModel.find({
                    _id: {
                        $in: response.role
                    }
                })
                /// iterate into role response
                for (let i = 0; i < adminRole.length; i++) {
                    /// if user has an admin role go to the next middleware
                    if (adminRole[i].roleName === 'admin') {
                        next()
                        return
                    } else { /// error response
                        return validations.validateResponse(res, 'the user has not permissions')
                    }
                }
            }).catch(err => {
                /// error response
                return validations.validateResponse(res, err)
            })
        } catch (e) {  /// internal error
            return validations.validateResponse(res, 'Error getting role info!')
        }
    }
}