const app = require('express')
const https = require('https')
const { Pool, Client } = require('pg')

var router = app.Router()

router.post('/group_match', function(request, response, next) {

  let pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  let sql = 'SELECT EXISTS( \
      SELECT 1 \
      FROM guess_match \
      WHERE user_id = $1 \
        AND match_id = $2 \
    ) as exists';

  let values = [
    parseInt(request.session.login_id),
    parseInt(request.body.match_id)
  ]
  // console.dir(values)
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.log(err.stack)
      response.sendStatus(500)
    } else {

      let sql
      if (result.rows[0].exists) {
        sql = 'UPDATE guess_match \
          SET \
            guess_home = $3, \
            guess_away = $4 \
          WHERE match_id = $1\
            AND user_id = $2'
      } else {
        sql = 'INSERT INTO guess_match \
          (match_id, user_id, guess_home, guess_away) \
          VALUES($1, $2, $3, $4)'
      }

      let values = [
        parseInt(request.body.match_id),
        parseInt(request.session.login_id),
        parseInt(request.body.guess_home) || 0,
        parseInt(request.body.guess_away) || 0
      ]
      pool.query(sql, values, (err, result) => {
        if (err) {
          console.log(err.stack)
          response.sendStatus(500)
        } else {
          response.sendStatus(200)
        }
      })
    }
  })
})


router.post('/round', function(request, response, next) {

  let pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  let sql = 'SELECT EXISTS( \
      SELECT 1 \
      FROM guess_position \
      WHERE user_id = $1 \
        AND round = $2 \
        AND position = $3 \
    ) as exists';

  let values = [
    parseInt(request.session.login_id),
    parseInt(request.body.round),
    parseInt(request.body.position)
  ]
  // console.dir(values)
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.log(err.stack)
      response.sendStatus(500)
    } else {

      let sql
      if (result.rows[0].exists) {
        sql = 'UPDATE guess_position \
          SET \
            team = $3, \
            position = $4 \
          WHERE round = $1 \
            AND user_id = $2'
      } else {
        sql = 'INSERT INTO guess_position \
          (round, user_id, team, position) \
          VALUES($1, $2, $3, $4)'
      }

      let values = [
        parseInt(request.body.round),
        parseInt(request.session.login_id),
        parseInt(request.body.team),
        parseInt(request.body.position)
      ]

      pool.query(sql, values, (err, result) => {
        if (err) {
          console.log(err.stack)
          response.sendStatus(500)
        } else {
          response.sendStatus(200)
        }
      })
    }
  })
})


router.post('/goal_star', function(request, response, next) {

  var goalStar = request.body.goal_star.trim()
  goalStar = goalStar.substr(0, 100)
  let regex = new RegExp("^[-., 0-9a-zA-Z]+$")
  if (!regex.test(goalStar)) {
    response.sendStatus(422)
  }

  let pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  let sql = 'SELECT EXISTS( \
      SELECT 1 \
      FROM guess_scorer \
      WHERE user_id = $1 \
    ) as exists';

  let values = [
    parseInt(request.session.login_id)
  ]
  // console.dir(values)
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.log(err.stack)
      response.sendStatus(500)
    } else {

      let sql
      if (result.rows[0].exists) {
        sql = 'UPDATE guess_scorer \
          SET \
            player = $2 \
          WHERE user_id = $1'
      } else {
        sql = 'INSERT INTO guess_scorer \
          (user_id, player) \
          VALUES($1, $2)'
      }

      let values = [
        parseInt(request.session.login_id),
        goalStar
      ]
      pool.query(sql, values, (err, result) => {
        if (err) {
          console.log(err.stack)
          response.sendStatus(500)
        } else {
          response.sendStatus(200)
        }
      })
    }
  })
})


module.exports = router
