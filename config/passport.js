const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' })
        }

        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error)
  }
})
