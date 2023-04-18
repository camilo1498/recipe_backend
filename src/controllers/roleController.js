/// instances
const UserRoleModel = require('../models/role_models/user_role_model')
const validations = require('../utils/validations')

/// class functions
module.exports = {
    /// create user role function
    async createRole(req, res) {
        try {
            /// get and save http param into a variable
            const { roleName, roleDescription } = req.body

            /// set param data to user role model
            const role = new UserRoleModel({
                roleName,
                roleDescription,
            })

            /// DB query
            await role.save()
                /// success response
                .then(response => {


                    res.status(201).json({
                        success: true,
                        message: 'Role was created successfuly',
                        data: response ?? {}
                    })
                }) /// error response
                .catch(err => {
                    validations.validateResponse(res, err)
                })

        } catch (e) {
            /// internal error
            validations.validateResponse(res, e ?? 'Error while creating role, please contact with support')
        }
    },

    /// get user role by id
    async getRoleById(req, res) {
        try {
            /// get and save http param into a variable
            const { id } = req.query

            /// DB query
            await UserRoleModel.findById({ _id: id })
                /// success response
                .then(response => {
                    res.status(202).json({
                        success: true,
                        message: response === null ? 'Error, role does nor exist' : 'Role list',
                        data: response ?? {}
                    })
                }) /// error response
                .catch(err => {
                    validations.validateResponse(res, err)
                })

        } catch (e) {
            /// internal error
            validations.validateResponse(res, e ?? 'Error while getting roles, please contact with support')
        }
    }
}