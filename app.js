const express = require('express')
const session = require('express-session')
const passport = require('passport')
const path = require('path')
const multer = require('multer')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')

const app = express()
const PORT = process.env.PORT || 3000

require('./config/passport')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(
  session({
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    })
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Example app listening on port ${PORT}`)
})
