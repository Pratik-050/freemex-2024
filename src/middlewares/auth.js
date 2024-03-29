const spareRoutes = [
  /^GET \/api\/players\?sort=true/, // Leaderboard
  /^GET \/api\/schedules/ // Schedule
]

/**
 * Player needs to be authenticated to continue, except
 * if the requested route is in `spareRoutes`.
 */
function player (req, res, next) {
  if (
    !(spareRoutes.some((route) => (
      route.test(`${req.method} ${req.originalUrl}`)
    ))) &&
    !req.isAuthenticated()
  ) {
    res.status(401).json({
      message: 'Unauthorized.'
    })
    return
  }
  next()
}

/**
 * Admin needs to be authenticated to continue.
 */
function admin (req, res, next) {
  if (!req.headers.cookie) {
    res.status(400).json({
      message: 'Cookies not found.'
    })
    return
  }
  const cookie = req.headers.cookie
    .split('; ')
    .find((c) => c.startsWith('__u='))

  if (!cookie) {
    res.status(400).json({
      message: 'Relevant cookie not found, please login.'
    })
    return
  }

  /* eslint-disable new-cap -- ¯\_(ツ)_/¯ built-in */
  const [username, password] = (
    new Buffer
      .from(decodeURIComponent(cookie.split('=')[1]), 'base64')
      .toString()
      .split(':')
  )
  /* eslint-enable new-cap */

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

  next()
}

module.exports = { player, admin }
