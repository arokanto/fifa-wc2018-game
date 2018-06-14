var app = require('express');
var router = app.Router();

var guesses_match

/* GET home page. */
router.get('/', function(req, res, next) {

  bypass = (req.query.super_secret_bypass == '1')
  let display_name = false;
  if (req.session && req.session.display_name) {
    display_name = req.session.display_name
  }

  res.render('index.njk', {
    title: '',
    display_name: display_name,
    path: req.originalUrl,
    bypass: bypass
  });
});

router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

router.get('/favicon.ico', function (req, res) {
  res.sendStatus(404)
});


module.exports = router;
