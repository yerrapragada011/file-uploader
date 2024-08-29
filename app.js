const express = require('express')
const app = express()
const path = require('node:path')
const passport = require('passport')

const expressSession = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require('@prisma/client')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

require('./config/passport')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    })
  })
)

app.use(passport.initialize())
app.use(passport.session())

const PORT = 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Example app listening on port ${PORT}`)
})
