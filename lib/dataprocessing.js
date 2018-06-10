const DEBUG = false;

function calculateScores(data, userData) {
  
  if (DEBUG) {
    data = changeToDebugData(data)
  }

  let scores = []
  var thisUser
  var thisMatch
  var thisUserGuesses

  for (let i = 0; i < userData.length; i++) {
    thisUser = userData[i]
    scoreObject = {
      "display_name": thisUser.display_name,
      "match_winners": 0,
      "match_results": 0,
      "positions": 0,
      "goal_king": 0
    }

    // Match winners & results
    for (let key in data.groups) {
      if (data.groups.hasOwnProperty(key)) {
        for (let k = 0; k < data.groups[key].matches.length; k++) {
          thisMatch = data.groups[key].matches[k]
          thisUserGuesses = thisUser.group_matches['match_' + thisMatch.name]

          if (thisUserGuesses !== undefined && thisMatch.finished) {

            // We found the correct match and there are meaningful results, 
            // let's compare them.

            // First the results
            if (thisUserGuesses.home === thisMatch.home_result
                && thisUserGuesses.away === thisMatch.away_result) {
              
                scoreObject.match_results += 3
            }

            // And then the winners
            var realWinner
            if (thisMatch.home_result > thisMatch.away_result) {
              realWinner = 1
            } else if (thisMatch.home_result < thisMatch.away_result) {
              realWinner = -1
            } else {
              realWinner = 0
            }

            var guessWinner
            if (thisUserGuesses.home > thisUserGuesses.away) {
              guessWinner = 1
            } else if (thisUserGuesses.home < thisUserGuesses.away) {
              guessWinner = -1
            } else {
              guessWinner = 0
            }

            if (realWinner === guessWinner) {
              scoreObject.match_winners += 1
            }

          }
        }
      }
      
    }

    // Positions
    for (let key in data.knockout) {
      if (data.knockout.hasOwnProperty(key)) {
        var round = parseInt(key.split('_')[1])
        for (let j = 0; j < data.knockout[key].matches.length; j++) {
          thisMatch = data.knockout[key].matches[j]
          if (thisMatch.finished) {
            thisUserGuesses = thisUser['round_' + round]
            for (let k = 0; k < thisUserGuesses.length; k++) {
              let thisGuess = thisUserGuesses[k]
              if (thisMatch.home_team === thisGuess || thisMatch.away_team === thisGuess) {
                scoreObject.positions += 2
              }
            }
          }
        }
      }
    }

    if (thisUser.goal_star_correct) {
      scoreObject.goal_king = 10
    }

    scoreObject.total = scoreObject.match_winners 
      + scoreObject.match_results 
      + scoreObject.positions 
      + scoreObject.goal_king

    scores.push(scoreObject)

  }

  // Sort the results
  scores.sort(function(a, b) {
    if (a.total < b.total) return 1
    if (a.total > b.total) return -1
    if (a.goal_king < b.goal_king) return 1
    if (a.goal_king > b.goal_king) return -1
    if (a.positions < b.positions) return 1
    if (a.positions > b.positions) return -1
    if (a.match_winners < b.match_winners) return 1
    if (a.match_winners > b.match_winners) return -1
    if (a.match_results < b.match_results) return 1
    if (a.match_results > b.match_results) return -1
    return 0
  })

  return scores
}


function changeToDebugData(data) {
  data.groups.a.matches[0].finished = true
  data.groups.a.matches[0].home_result = 3
  data.groups.a.matches[0].away_result = 1
  data.groups.a.matches[0].date = '2018-06-10T17:00:00+03:00'

  data.knockout.round_16.matches[0].finished = true
  data.knockout.round_16.matches[0].home_team = 1
  data.knockout.round_16.matches[0].away_team = 2

  
  // console.dir(data)
  return data
}



function closeExpired(data) {
  let now = new Date()
  let knockoutExpire = new Date('2018-06-14T18:00:00+03:00')
  data.knockout_closed = (now > knockoutExpire) ? true : false

  if (DEBUG) {
    data = changeToDebugData(data)
    data.knockout_closed = true
  }

  for (let key in data.groups) {
    if (data.groups.hasOwnProperty(key)) {
      for (let k = 0; k < data.groups[key].matches.length; k++) {
        thisMatch = data.groups[key].matches[k]
        thisMatch.started = (now > new Date(thisMatch.date)) ? true : false
      }
    }
  }
  
  

  return data
}



module.exports.calculateScores = calculateScores
module.exports.closeExpired = closeExpired