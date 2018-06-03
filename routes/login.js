var app = require('express')
var bcrypt = require('bcrypt')
var bodyParser  = require('body-parser')
var router = app.Router()
const { Pool, Client } = require('pg')

var urlEncodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', function(req, res, next) {
  errorMessage = getErrorMessage(req.query.error)
  registered = (req.query.registered == '1')
  res.render('login.html', {
    title: 'Kirjaudu sisään',
    error: errorMessage,
    registered: registered
  })
})

router.post('/', urlEncodedParser, function(req, res, next) {
  if (!req.body.email || !req.body.password) {
    res.redirect('/login?error=fields')
  } else {
    let pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
    const sql = 'SELECT id, pass_hash, display_name FROM player WHERE email_address = $1'
    pool.query(sql, [req.body.email], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        if (result.rows.length === 0) {
          res.redirect('/login?error=email')
        } else {
          if (bcrypt.compareSync(req.body.password, result.rows[0].pass_hash)) {
            req.session.login_id = result.rows[0].id
            req.session.display_name = result.rows[0].display_name
            res.redirect('/')
          } else {
            res.redirect('/login?error=login')
          }
        }
      }
    })
  }
})

function getErrorMessage(code) {
  switch(code) {
    case 'email': return "Sähköpostiosoitetta ei löytynyt."
    case 'fields': return "Täytä molemmat kentät."
    case 'login': return "Väärä salasana."
    default: return null
  }
}

module.exports = router
