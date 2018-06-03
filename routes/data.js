const app = require('express')
const https = require('https')
const { Pool, Client } = require('pg')

var router = app.Router()

var _jsonData;
var _executor;
var _response;

router.get('/', function(request, response, next) {
  _executor = returnAll;
  _response = response;
  getData()
})

router.get('/groups', function(request, response, next) {
  _executor = returnGroups;
  _response = response;
  getData()
})

function returnAll() {
  _response.send(_jsonData);
}

function returnGroups() {
  _response.send(_jsonData.groups);
}

function getData() {
  // Check if cache is stale
  let pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  // let client = new Client()
  // client.connect()
  pool.query('SELECT * FROM cache ORDER BY time DESC', (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {

      if (result.rows.length === 0) {
        console.log('  No data in database, fetching new data...')

        // There's nothing in database, so fetch data
        fetchRemoteData()
      
      } else {
        console.log('  Data found in database, checking staleness...')

        // Check how old it is
        let now = new Date()
        let cacheDate = new Date(result.rows[0].time)
        let diff = now.getTime() - cacheDate.getTime()
        let diffMin = Math.floor(diff / 1000 / 60)
        console.log('  Time differece is ' + diffMin + ' minutes.')

        if (diffMin > 30) {

          console.log('  Data is stale, fetching new data...')
          // The data is older than 30 minutes, so fetch new data
          fetchRemoteData()
        
        } else {

          // Use cached data
          console.log('  Data is fresh, sending cached data to browser...')
          _jsonData = result.rows[0].data
          _executor()
        }
      }
    }
    pool.end()
  })
}

function fetchRemoteData() {

  const url = 'https://raw.githubusercontent.com/lsv/fifa-worldcup-2018/master/data.json'

  https.get(url, function(json_response) {
    var body = ''

    json_response.on('data', function(chunk) {
      body += chunk
    })

    json_response.on('end', function() {
      console.log('  Got new data, inserting to database...')

      var remoteResponse = JSON.parse(body)
      let date = new Date()

      // Store it to database cache
      let pool = new Pool({
        connectionString: process.env.DATABASE_URL
      })
      pool.query('INSERT INTO cache (data, time) VALUES ($1, $2)', 
          [remoteResponse, date], 
          (err, res) => {

        if (err) {
          console.log(err.stack)
        } else {
          console.log('  Successfully updated database, sending to browser...')
          _jsonData = remoteResponse
          _executor()
        }
        pool.end()
      })

    });

  }).on('error', function(e) {
    console.log("Got an error: ", e)
  })
}

module.exports = router
