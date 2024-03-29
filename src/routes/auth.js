const { Router } = require('express')
const passport = require('passport')

const router = Router()

router.get('/logout', (req, res) => {
  if (req.user) { req.logout() }
  res.redirect(`${process.env.CORS_ORIGINS}`)
})

router.get('/google', passport.authenticate(
  'google',
  {
    scope: ['profile', 'email']
  }
))
router.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect(`${process.env.CORS_ORIGINS}`)
})

router.get('/github', passport.authenticate(
  'github',
  {
    scope: ['user:email', 'user:profile']
  }
))
router.get('/github/redirect', passport.authenticate('github', { failureRedirect: '/login' }), (_req, res) => {
  res.redirect(`${process.env.CORS_ORIGINS}`)
})

router.post('/admin', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.clearCookie('__u')
    res.status(400).json({
      message: 'Empty username or password',
      body: req.body
    })
    return
  }
  let isAdmin = true
  isAdmin = process.env.ADMIN_USERNAME === username && isAdmin
  isAdmin = process.env.ADMIN_PASSWORD === password && isAdmin
  if (!isAdmin) {
    res.clearCookie('__u')
    res.status(401).json({
      message: 'Unauthorized.'
    })
    return
  }
  /* eslint-disable new-cap -- ¯\_(ツ)_/¯ built-in */
  const cookie = new Buffer.from(`${username}:${password}`).toString('base64')
  /* eslint-enable new-cap */
  res.cookie('__u', cookie, {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    domain: (new URL(process.env.DOMAIN_NAME)).hostname,
    sameSite: 'strict'
  })
  res.sendStatus(200)
})

module.exports = router
