var app = require('express')
var router = app.Router()
var model = require('../lib/model')
var dataprocessing = require('../lib/dataprocessing')


// SUB-ROUTES

router.get('/me', function(request, response, next) {
  model.loadUserData(request.session.login_id)
  .then(function(result) {
    response.send(result)
  })
  .catch(e => setImmediate(() => {
    console.log(e)
    response.sendStatus(500)
  }))
})

router.get('/others', function(request, response, next) {
  
  let data

  model.getData()
  .then(function(result) {
    data = result
    model.loadAllUserData()
      .then(function(result) {
        results = dataprocessing.getGuessesForClosedMatches(data, result)
        response.send(results)
      })
      .catch(e => setImmediate(() => {
        console.log(e)
        response.sendStatus(500)
      }))
  })
  .catch(e => setImmediate(() => {
    console.log(e)
    response.sendStatus(500)
  }))

})

router.get('/scores', function(request, response, next) {

  var data
  var userData

  model.getData()
  .then(function(result) {
    data = result
    model.loadAllUserData()
      .then(function(result) {
        userData = result
        results = dataprocessing.calculateScores(data, userData)
        response.send(results)
      })
      .catch(e => setImmediate(() => {
        console.log(e)
        response.sendStatus(500)
      }))
  })
  .catch(e => setImmediate(() => {
    console.log(e)
    response.sendStatus(500)
  }))
})

router.get('/data', function(request, response, next) {
  model.getData()
  .then(function(result) {
    result = dataprocessing.closeExpired(result)
    response.send(result)
  })
  .catch(e => setImmediate(() => {reject(e)}))
})


module.exports = router
