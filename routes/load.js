const app = require('express')
const https = require('https')
const { Pool, Client } = require('pg')

var router = app.Router()

router.get('/', function(request, response, next) {
  loadData(response, request.session.login_id)
  
})

function loadData(response, user_id) {
  var jsonObject = {};

  jsonObject.group_matches = {}
  jsonObject.round_16 = []
  jsonObject.round_8 = []
  jsonObject.round_4 = []
  jsonObject.round_2 = []
  jsonObject.round_1 = []
  jsonObject.goal_star = ''

  var pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  pool.query(
      'SELECT * FROM guess_match WHERE user_id = $1 ORDER BY match_id ASC',
      [user_id],
      (err, result) => {

    if (err) {
      console.log(err.stack)
    } else {

      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        let rowOb = {
          "home": row.guess_home,
          "away": row.guess_away
        }
        jsonObject.group_matches['match_' + row.match_id] = rowOb
      }

      pool.query(
        'SELECT * FROM guess_position WHERE user_id = $1 ORDER BY round, position',
        [user_id],
        (err, result) => {
  
        if (err) {
          console.log(err.stack)
        } else {

          for (let i = 0; i < result.rows.length; i++) {
            let row = result.rows[i]
            jsonObject['round_' + row.round][row.position - 1] = row.team
          }

          pool.query(
            'SELECT player FROM guess_scorer WHERE user_id = $1',
            [user_id],
            (err, result) => {
      
            if (err) {
              console.log(err.stack)
            } else {
              if (result.rows.length > 0) {
                jsonObject.goal_star = result.rows[0].player
              }
              response.send(jsonObject)
            }
          })
        }
      })
    }
  })
}


module.exports = router
