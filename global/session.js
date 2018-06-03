var app = require('express')
var router = app.Router()

router.all('*', function(req, res, next) {
  if (!req.session.login_id
      && !req.url.match('^\/login')
      && !req.url.match('^\/register')) {

    console.log(req.url)
    console.log('no session, redirecting...')
    res.redirect('/login')
  } else {
    next()
  }
});

module.exports = router
