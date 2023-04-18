const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
    signAccessToken: (tokenData) => {
        return new Promise((resolve, reject) => {
            const secret = process.env.TOKEN_SECRET
            const options = {
                expiresIn: '1y'
            }
            JWT.sign(tokenData, secret, options, (err, token) => {
                if (err) {
                    reject(res.status(400).json({
                        success: false,
                        message: err.message,
                        data: {}
                    }))
                    return
                }
                resolve(token)
            })
        })
    },

    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message =
                    err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(
                    res.status(401).json({
                        success: false,
                        message: message,
                        data: {}
                    })
                )
            }
            req.payload = payload
            next()
        })
    },

    signRefreshToken: (tokenData) => {
        return new Promise((resolve, reject) => {
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y'
            }
            JWT.sign(tokenData, secret, options, (err, token) => {
                if (err) {
                    // reject(err)
                    reject(
                        res.status(400).json({
                            message: false,
                            message: err.message,
                            data: {}
                        })
                    )
                } else {
                    resolve(token)
                }
            })
        })
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
                (err, payload) => {
                    if (err) {
                        return reject(createError.Unauthorized())
                    }
                    return resolve(payload.id)
                }
            )
        })
    },

    decodeAccessToken: (req) => {
        const authorization = req.headers.authorization
        if (authorization && authorization.toLowerCase().startsWith('bearer')) {
            token = authorization.split(' ')[1]
            return JWT.decode(token, process.env.TOKEN_SECRET)
        } else {
            return null
        }
    },

    decodeRefreshToken: (req) => {
        const authorization = req.headers.authorization
        if (authorization && authorization.toLowerCase().startsWith('bearer')) {
            token = authorization.split(' ')[1]
            return JWT.decode(token, process.env.REFRESH_TOKEN_SECRET)
        } else {
            return null
        }
    }
}