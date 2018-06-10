const { Pool, Client } = require('pg')


function getAllPlayers() {
  
  let sql = 'SELECT id, display_name FROM player'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql)
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getUserMatchGuesses(user_id) {
  
  let sql = 'SELECT * FROM guess_match WHERE user_id = $1 ORDER BY match_id'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql, [user_id])
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getAllMatchGuesses() {
  let sql = 'SELECT * FROM guess_match ORDER BY user_id, match_id'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql)
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getUserPositionGuesses(user_id) {
  let sql = 'SELECT * FROM guess_position WHERE user_id = $1 ORDER BY round, position'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql, [user_id])
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getAllPositionGuesses() {
  let sql = 'SELECT * FROM guess_position ORDER BY user_id, round, position'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql)
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getUserTopScorerGuess(user_id) {
  let sql = 'SELECT * FROM guess_scorer WHERE user_id = $1'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql, [user_id])
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}

function getAllTopScorerGuesses() {
  let sql = 'SELECT * FROM guess_scorer ORDER BY user_id'
  
  return new Promise(function(resolve, reject) {
    _executeQuery(sql)
    .then((result) => {
      resolve(result)
    })
    .catch(e => setImmediate(() => {reject(e)}))
  })
}


/**
 * 
 * @param {String} sql 
 * @param {Array} vars 
 */
function _executeQuery(sql, vars) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  return new Promise(function(resolve, reject) {

    pool.query(sql, vars, (err, result) => {
      if (err) {
        console.log(err.stack)
        reject(err.stack)
      } else {
        resolve(result)
      }
    })
  })
}


module.exports.getAllPlayers = getAllPlayers
module.exports.getUserMatchGuesses = getUserMatchGuesses
module.exports.getAllMatchGuesses = getAllMatchGuesses
module.exports.getUserPositionGuesses = getUserPositionGuesses
module.exports.getAllPositionGuesses = getAllPositionGuesses
module.exports.getUserTopScorerGuess = getUserTopScorerGuess
module.exports.getAllTopScorerGuesses = getAllTopScorerGuesses