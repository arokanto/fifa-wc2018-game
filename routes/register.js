var app = require('express')
var bcrypt = require('bcrypt')
var bodyParser  = require('body-parser')
var router = app.Router()
const { Pool, Client } = require('pg')

var urlEncodedParser = bodyParser.urlencoded({ extended: false })

router.post('/', urlEncodedParser, function(req, res, next) {
  console.log('Handling registration')
  if (!req.body.email || !req.body.password) {
    console.dir(req)
  } else {
    let pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
    const passHash = bcrypt.hashSync(req.body.password, 10)
    const sql = 'INSERT \
      INTO player (email_address, pass_hash, display_name) \
      VALUES ($1, $2, $3) \
      RETURNING id'
    const sqlValues = [req.body.email, passHash, req.body.display_name]
    pool.query(sql, sqlValues, (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        req.session.login_id = result.rows[0].id
        req.session.display_name = result.rows[0].display_name
        res.redirect('/login?ok')
      }
    })
    
  }
})

module.exports = router
