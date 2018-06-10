var app = require('express');
var router = app.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let display_name = false;
  if (req.session && req.session.display_name) {
    display_name = req.session.display_name
  }
  res.render('scores.njk', {
    title: '',
    display_name: display_name,
    path: req.originalUrl
  });
});




module.exports = router;
