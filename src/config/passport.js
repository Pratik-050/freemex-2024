const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy

const { models: { Player } } = require('./../models')
const { response } = require('express')

module.exports = () => {
  passport.serializeUser((player, done) => {
    done(null, player.uuid)
  })

  passport.deserializeUser((uuid, done) => {
    Player.findOne({
      where: { uuid }
    })
      .then((player) => {
        done(null, player)
      })
      .catch((error) => {
        done(error)
      })
  })

  passport.use(
    new GoogleStrategy({
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_NAME}/auth/google/redirect`
    },
      (accessToken, refreshToken, profile, done) => {
        Player.findOrCreate({
          where: { googleId: profile.id },
          defaults: {
            username: profile.displayName,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            avatar: profile.photos[0].value,
            email: profile.emails[0].value
          }
        })
          .then(([player, isNew]) => {
            done(null, player)
            if (isNew) {
              console.log('New Google player created')
            } else {
              console.log('Existing player found in database:', player)
            }
          })
          .catch((error) => {
            done(error)
            console.log('Unable to find or create player (Google)', error)
          })
      })
  )

  passport.use(
    new GitHubStrategy({
      clientID: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_NAME}/auth/github/redirect`,
      scope: ['user:email', 'user:profile']
    },
      (accessToken, refreshToken, profile, done) => {
        Player.findOrCreate({
          where: { githubId: profile.id },
          defaults: {
            username: profile.username,
            name: profile.displayName || profile.username,
            avatar: profile.photos[0].value,
            email: profile.emails[0].value
          }
        })
          .then(([player, isNew]) => {
            done(null, player)
            if (isNew) console.log('New Github player created')
          })
          .catch((error) => {
            done(error)
            console.log('Unable to find or create player (Github)', error)
          })
      })
  )
}
