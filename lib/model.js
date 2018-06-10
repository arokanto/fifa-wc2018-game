const https = require('https')
const { Pool, Client } = require('pg')
const dbAccess = require('./database_access')


/**
 * Load saved data from user.
 * @param {int} user_id 
 */
function loadUserData(user_id) {

  let jsonObject = getEmptyUserDataObject()

  return new Promise(function(resolve, reject) {

    // Chain up all the database queries and populate jsonObject with the return values
    dbAccess.getUserMatchGuesses(user_id)
    .then((result) => {
      
      // Handle matches
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i] 
        let rowOb = {
          "home": row.guess_home,
          "away": row.guess_away
        }
        jsonObject.group_matches['match_' + row.match_id] = rowOb
      }

      return dbAccess.getUserPositionGuesses(user_id)
    })
    .then((result) => {

      // Handle positions
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        jsonObject['round_' + row.round][row.position - 1] = row.team
      }
      positionGuesses = result
      return dbAccess.getUserTopScorerGuess(user_id)
    })
    .then ((result) => {

      // Handle top scorer
      if (result.rows.length > 0) {
        jsonObject.goal_star = result.rows[0].player
      }

      // Finally return the populated jsonObject
      resolve(jsonObject)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}


/**
 * Load guess data from all users
 */
function loadAllUserData() {

  let users = []

  return new Promise(function(resolve, reject) {

    // Chain up all the database queries and populate jsonObject with the return values
    dbAccess.getAllPlayers()
    .then((result) => {
      
      // Create player objects to an array
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        thisUser = getEmptyUserDataObject(row.id, row.display_name)
        users.push(thisUser)
      }
      
      return dbAccess.getAllMatchGuesses()
    })
    .then((result) => {
      
      // Handle matches
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        
        let rowOb = {
          "home": row.guess_home,
          "away": row.guess_away
        }
        
        let index = users.findIndex(u => u.user_id == row.user_id)
        userObject = users[index]
        userObject.group_matches['match_' + row.match_id] = rowOb
      }
      

      return dbAccess.getAllPositionGuesses()
    })
    .then((result) => {

      // Handle positions
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        let index = users.findIndex(u => u.user_id == row.user_id)
        userObject = users[index]
        userObject['round_' + row.round][row.position - 1] = row.team
      }

      return dbAccess.getAllTopScorerGuesses()
    })
    .then ((result) => {

      // Handle top scorer
      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i]
        let index = users.findIndex(u => u.user_id == row.user_id)
        userObject = users[index]
        userObject.goal_star = row.player
        userObject.goal_star_correct = row.correct
      }

      // Finally return the populated users array
      resolve(users)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}


/**
 * Load the master JSON file
 * @param {Object} response 
 */
function getData(response) {
  // Check if cache is stale
  let pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM cache ORDER BY time DESC')
      .then(result => {
        if (result.rows.length > 0) {

          // Some data found in database, check how old it is
          let now = new Date()
          let cacheDate = new Date(result.rows[0].time)
          let diff = now.getTime() - cacheDate.getTime()
          let diffMin = Math.floor(diff / 1000 / 60)
          console.log('  Time differece is ' + diffMin + ' minutes.')
          

          if (diffMin > 30) {

            console.log('  Data is stale, fetching new data...')
            // The data is older than 30 minutes, so fetch new data
            fetchRemoteData()
              .then(function(result) {
                resolve(result)
              })
              .catch(e => setImmediate(() => {reject(e)}))
          
          } else {

            // Use cached data
            console.log('  Data is fresh, sending cached data to browser...')
            let jsonObject = result.rows[0].data
            resolve(jsonObject)
          }

        } else {
          reject('stale data')
        }
      })
      .catch(e => setImmediate(() => {reject(e)}))

  })
}


/** INTERNAL FUNCTIONS */

/**
 * Internal function to load the master JSON file from remote source.
 * @param {Object} response 
 */
function fetchRemoteData(response) {

  const url = 'https://raw.githubusercontent.com/lsv/fifa-worldcup-2018/master/data.json'

  return new Promise(function(resolve, reject) {

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
            reject(err.stack)
          } else {
            console.log('  Successfully updated database, sending to browser...')
            let jsonObject = remoteResponse
            resolve(jsonObject)
          }
          pool.end()
        })

      });

    }).on('error', function(e) {
      console.log("Got an error: ", e)
      reject(e)
    })
  })
}


function getEmptyUserDataObject(user_id, display_name) {
  var userObject = {};

  userObject.group_matches = {}
  userObject.round_16 = []
  userObject.round_8 = []
  userObject.round_4 = []
  userObject.round_2 = []
  userObject.round_1 = []
  userObject.goal_star = ''

  if (user_id) {
    userObject.user_id = user_id 
  }
  if (display_name) {
    userObject.display_name = display_name 
  }

  return userObject
}



module.exports.loadUserData = loadUserData;
module.exports.loadAllUserData = loadAllUserData;
module.exports.getData = getData