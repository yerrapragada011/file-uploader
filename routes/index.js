const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const fileController = require('../controllers/fileController')
const multer = require('multer')

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

router.get('/', userController.userHomePage)

router.get('/register', userController.registerUserGet)

router.post('/register', userController.registerUserPost)

router.get('/login', userController.loginUserGet)

router.post('/login', userController.loginUserPost)

router.get('/upload', ensureAuthenticated, fileController.uploadFileGet)

router.post(
  '/upload',
  ensureAuthenticated,
  upload.single('file'),
  fileController.uploadFilePost
)

router.get('/logout', userController.logoutUser)

module.exports = router
