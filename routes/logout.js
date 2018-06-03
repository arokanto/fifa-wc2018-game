var app = require('express')
var bcrypt = require('bcrypt')
var router = app.Router()
const { Pool, Client } = require('pg')

router.get('/', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      console.log('Ei voitu tuhota sessiota')
    } else {
      res.redirect('/')
    }
  })
})


module.exports = router
