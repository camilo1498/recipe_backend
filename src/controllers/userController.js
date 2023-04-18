const UserModel = require('../models/user_models/user_model')
const UserRoleModel = require('../models/role_models/user_role_model')
const validations = require('../utils/validations')
const jwt_helper = require('../helpers/jwt_helper')
const { populate } = require('../models/user_models/user_model')

module.exports = {
    /// register user
    async registerUser(req, res) {
        try {
            /// get and save http param into a variable
            const { name, lastname, email, password } = req.body

            /// get default user role
            const roleName = "client"
            const role = await UserRoleModel.findOne({ roleName })

            /// validate paramaters
            if (name === undefined || name === null || name.length === 0) {
                validations.validateResponse(res, "cannot get the parameter 'name'")
            } else if (lastname === undefined || lastname === null || lastname.length === 0) {
                validations.validateResponse(res, "cannot get the parameter 'lastname'")
            } else if (email === undefined || email === null || email.length === 0) {
                validations.validateResponse(res, "cannot get the parameter 'email'")
            } else if (!validations.validateEmail(email)) {
                validations.validateResponse(res, "invalid email")
            } else if (password === undefined || password === null || password.length === 0) {
                validations.validateResponse(res, "cannot get the parameter 'password'")
            } else {
                /// instance model object
                const user = new UserModel({
                    name,
                    lastname,
                    email,
                    password,
                    role: role._id,
                    favourites: []
                });

                /// save in db
                var response = await user.save().then(response => { /// success response
                    return {
                        success: true,
                        message: "user saved successfuly",
                        data: response ?? {}
                    };
                }).catch(err => { /// error response
                    return {
                        success: false,
                        message: err['message'],
                        data: {}
                    };
                });

                /// send response
                if (response['success'] === true) {/// success response
                    /// token data
                    const tokenData = {
                        id: response.data.id,
                        role: user.role
                    }

                    /// create token
                    const generated_token = await jwt_helper.signAccessToken(tokenData)
                    const generated_refresh_token = await jwt_helper.signRefreshToken(tokenData)

                    /// get user info
                    const userProfile = await UserModel.findOne({ _id: response.data.id }).populate('role', {
                        roleName: 1
                    });
                    res.status(201).json({
                        success: true,
                        message: "user saved successfuly",
                        token: generated_token,
                        refresh_token: generated_refresh_token,
                        data: userProfile ?? {}
                    });
                } else {/// error response
                    res.status(400).json(response);
                }

            }
        } catch (err) { /// inernal error
            validations.validateResponse(res, err ?? "error while user registration, please contact with support")
        }
    },

    /// auth user
    async loginUser(req, res) {
        try {
            const { email, password } = req.query

            /// DB query
            const user = await UserModel.findOne({ email })

            /// validate and compare password
            const correctPassword = user === null
                ? false
                : await UserModel.comparePassword(password, user.password)

            /// if user or password is incorred
            if (!(user && correctPassword)) {
                /// error response
                res.status(401).json({
                    success: false,
                    message: "incorrect email or password",
                    data: {}
                })
            } else {
                /// token data
                const tokenData = {
                    id: user._id,
                    role: user.role
                }

                /// create token
                const generated_token = await jwt_helper.signAccessToken(tokenData)
                const generated_refresh_token = await jwt_helper.signRefreshToken(tokenData)

                /// success response
                res.status(201).json({
                    success: true,
                    message: "user logged",
                    token: generated_token,
                    refresh_token: generated_refresh_token
                })
            }
        } catch (err) { /// inernal error
            validations.validateResponse(res, err ?? "error in user login")
        }
    },

    /// get profile
    async getUserProfile(req, res, next) {
        try {
            /// local variables
            let decodeToken = null

            /// decode token
            decodeToken = jwt_helper.decodeAccessToken(req)
            /// getting user id

            /// if token or decode token are invalid
            if (!decodeToken.id) {
                /// error response
                validations.validateResponse(res, "invalid token")
            } else {
                /// DB query

                await UserModel.findById({ _id: decodeToken.id })
                    .populate('role', { roleName: 1 })
                    .populate({
                        path: 'favourites',
                        select: [
                            'name',
                            'portions',
                            'preparationTime',
                            'difficulty',
                            'image'
                        ],
                        populate: {
                            path: 'type',
                            select: 'name'
                        }
                    })
                    .then(response => {
                        /// success response
                        res.status(200).json({
                            success: true,
                            message: "finded user",
                            data: response ?? {}
                        })
                    }).catch(e => {
                        validations.validateResponse(res, e)
                    });
            }

        } catch (err) {
            /// inernal error
            validations.validateResponse(res, err ?? "error while getting user profile info")
        }
    },

    async updateProfile(req, res) {
        try {

            const { name, lastname, email } = req.body;

            /// local variables
            let decodeToken = null
            let userId

            /// decode token
            decodeToken = jwt_helper.decodeAccessToken(req)
            /// getting user id
            userId = decodeToken.id

            /// if token or decode token are invalid
            if (!decodeToken.id) {
                /// error response
                validations.validateResponse(res, "invalid token")
            } else {
                const user = await UserModel.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        name,
                        lastname,
                        email
                    }
                }, { new: true }).then(response => {
                    return {
                        success: true,
                        message: response === null ? 'Error, model does not exist' : 'user was updated successfuly',
                        data: response ?? {}
                    };
                    //res.status(200).json();
                }).catch(e => {
                    return {
                        success: false,
                        message: e,
                        data: response ?? {}
                    }
                });
                if (user.success === true) {
                    /// get user info
                    const userProfile = await UserModel.findOne({ _id: user.data.id }).populate('role', {
                        roleName: 1
                    });

                    /// success response
                    res.status(201).json({
                        'success': true,
                        message: user.message,
                        data: userProfile ?? {}
                    })
                } else { /// error response
                    res.status(401).json(user)
                }

            }

        } catch (err) {
            /// inernal error
            validations.validateResponse(res, err ?? "error while getting user profile info")
        }
    },


    async refreshToken(req, res) {
        try {
            const { refresh_token } = req.query

            /// validate if refresh token exist
            if (!refresh_token) {
                res.status(400).json({
                    success: false,
                    message: 'BadRequest',
                    data: {}
                })
            } else {
                /// verify refresh token before generte the new one
                await jwt_helper.verifyRefreshToken(refresh_token).then(async (response) => {
                    const user = await UserModel.findById({ _id: response })
                    /// token data
                    const tokenData = {
                        id: user._id,
                        name: user.name,
                        lastname: user.lastname,
                        email: user.email,
                        role: user.role
                    }

                    /// create token
                    const generated_token = await jwt_helper.signAccessToken(tokenData)
                    const generated_refresh_token = await jwt_helper.signRefreshToken(tokenData)

                    res.status(200).json({
                        success: true,
                        message: 'new generated token',
                        data: {
                            token: generated_token,
                            refresh_token: generated_refresh_token
                        }
                    })
                })
            }
        } catch (err) {
            /// internal error
            validations.validateResponse(res, err ?? 'Error while validating token')
        }
    },

    async saveOrUnsafeRecipe(req, res) {
        try {
            /// decode token
            const decodeToken = jwt_helper.decodeAccessToken(req)

            /// get recipe id
            const { id } = req.query
            await UserModel.findById({ _id: decodeToken.id }).then(async (response) => {
                if (!response.favourites.includes(id)) {
                    /// save
                    /// DB query to user collections
                    await UserModel.findByIdAndUpdate({ _id: decodeToken.id }, {
                        /// delete user id to "favourites" array
                        $push: {
                            favourites: id
                        }
                    },
                        /// only update fields that has changes
                        { new: true })
                        .then(response => {
                            res.status(200).json({
                                success: true,
                                message: 'liked recipe',
                                data: {
                                    favourite: true
                                }
                            })
                        })/// unliked post success
                        .catch(err => { /// error response
                            validations.validateResponse(res, err)
                        })
                } else {
                    /// unsave
                    // DB query to user collections
                    await UserModel.findByIdAndUpdate({ _id: decodeToken.id }, {
                        /// delete user id to "favourites" array
                        $pull: {
                            favourites: id
                        }
                    },
                        /// only update fields that has changes
                        { new: true })
                        .then(response => {
                            res.status(200).json({
                                success: true,
                                message: 'unlike recipe',
                                data: {
                                    favourite: false
                                }
                            })
                        })/// unliked post success
                        .catch(err => { /// error response
                            validations.validateResponse(res, err)
                        })
                }
            }).catch(e => {
                validations.validateResponse(res, e, { data: { favourite: false } })
            })


        } catch (e) {
            validations.validateResponse(res, e, { data: { favourite: false } })
        }
    }
}