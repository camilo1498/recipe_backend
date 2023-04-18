/// instances
const multer = require('multer')
const path = require('path')

/// define local destination to upload files
const storage = multer.diskStorage({
    destination: './public',
    filename: (req, file, cb) => {
        /// define file name
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})

/// validate file extention
const file_filter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

/// upload to local server storage
const upload = multer({ storage: storage, fileFilter: file_filter })


/// export class functions
module.exports = {
    upload
}