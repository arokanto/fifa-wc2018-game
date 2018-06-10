var app = require('express')
var router = app.Router()

router.all('*', function(req, res, next) {
  if (req.url.match('^\/robots.txt')) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
  } else if (!req.session.login_id
      && !req.url.match('^\/login')
      && !req.url.match('^\/register')) {

    console.log('no session, redirecting...')
    res.redirect('/login')
  } else {
    next()
  }
});

router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

router.get('/favicon.ico', function (req, res) {
  res.sendStatus(404)
});

module.exports = router
