const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const fileController = require('../controllers/fileController')
const multer = require('multer')
const path = require('path')

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      req.fileValidationError = 'Only image files are allowed!'
      cb(null, false)
    }
  }
})

router.get('/', userController.userHomePage)

router.get('/register', userController.registerUserGet)

router.post('/register', userController.registerUserPost)

router.get('/login', userController.loginUserGet)

router.post('/login', userController.loginUserPost)

router.get('/upload-file', ensureAuthenticated, fileController.uploadFileGet)

router.post(
  '/upload-file',
  ensureAuthenticated,
  upload.single('file'),
  fileController.uploadFilePost
)

router.get(
  '/create-folder',
  ensureAuthenticated,
  fileController.createFolderGet
)

router.post(
  '/create-folder',
  ensureAuthenticated,
  fileController.createFolderPost
)

router.get('/folders/:id', fileController.folderDetailGet)

router.post(
  '/folders/:id/upload',
  ensureAuthenticated,
  upload.single('file'),
  fileController.folderFileUpload
)

router.post(
  '/folders/:id/update',
  ensureAuthenticated,
  fileController.updateFolderName
)

router.post(
  '/folders/:id/delete',
  ensureAuthenticated,
  fileController.deleteFolder
)

router.get(
  '/folders/uploads/:id',
  ensureAuthenticated,
  fileController.viewFileGet
)

router.get('/logout', userController.logoutUser)

module.exports = router
