/// instances
const cloudinary = require('cloudinary')
const dotenenv = require('dotenv')

/// init dotenv
dotenenv.config()

/// init cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

/// export module
module.exports = {
    uploads(file, folder) {
        return new Promise(resolve => {
            cloudinary.uploader.upload(file, (result) => {
                resolve({
                    URL: result.url,
                    id: result.public_id
                })
            }, {
                resource_type: "auto",
                folder: folder
            })
        })
    },

    delete(folder) {
        return new Promise(resolve => {
            cloudinary.v2.api.delete_folder(folder)
        })
    }
}