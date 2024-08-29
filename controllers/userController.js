const { PrismaClient } = require('@prisma/client')
const passport = require('passport')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

exports.userHomePage = async (req, res) => {
  res.render('index', { user: req.user })
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

exports.loginUserPost = async (req, res) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
}

exports.logoutUser = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
}
