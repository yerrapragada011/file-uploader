const { PrismaClient } = require('@prisma/client')
const passport = require('passport')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

exports.userHomePage = async (req, res) => {
  if (!req.user) {
    return res.render('index', { user: null, folders: [] })
  }

  const userId = req.user.id

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: userId
      }
    })

    res.render('index', {
      user: req.user,
      folders: folders
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

exports.registerUserGet = async (req, res) => {
  res.render('register')
}

exports.registerUserPost = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.redirect('/register')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    })

    req.login(user, (err) => {
      if (err) return next(err)
      return res.redirect('/')
    })
  } catch (error) {
    console.log(error)
    res.redirect('/register')
  }
}

exports.loginUserGet = async (req, res) => {
  res.render('login')
}

exports.loginUserPost = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      return res.redirect('/')
    })
  })(req, res, next)
}

exports.logoutUser = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
}
