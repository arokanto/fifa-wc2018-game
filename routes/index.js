var app = require('express');
var router = app.Router();

var guesses_match

/* GET home page. */
router.get('/', function(req, res, next) {

  let display_name = false;
  if (req.session && req.session.display_name) {
    display_name = req.session.display_name
  }
  if (req.query.id) {
    user_id = req.query.id
  } else {
    user_id = req.session.login_id
  }

  res.render('index.njk', {
    title: '',
    display_name: display_name,
    id: user_id
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
