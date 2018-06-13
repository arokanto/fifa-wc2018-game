var jsonData
var activeElement
var goalStarTimout
var loader = document.getElementById('loader')
var knockoutClosed = true

fetch('/load/data/', { credentials: 'include' })
  .then(function(response) {
    return response.json()
  })
  .then(function(data) {
    jsonData = data

    fetch('/load/me', { credentials: 'include' })
      .then(function(response) {
        return response.json()
      })
      .then(function(data){
        userData = data

        if (!jsonData.knockout_closed) {
          knockoutClosed = false
        } else {
          document.getElementById('goalStar').setAttribute('disabled', true)
        }

        printGroups(jsonData.groups)
        printBestTable(16)
        printBestTable(8)
        printBestTable(4)
        printBestTable(2)
        printBestTable(1)
        setupListeners()

        document.getElementById('goalStar').value = userData.goal_star
      })
  })

function printGroups(groups) {
  let guessGroupMatchesTable = document.getElementById('table--group-matches')
  let matches = getMatchesSorted(groups)
  let output = ''
  for (let i = 0; i < matches.length; i++) {
    let thisMatch = matches[i]
    let thisDate = new Date(thisMatch.date)
    let thisScore = '-'

    disabledClass = ''
    if (thisMatch.started) {
      disabledClass = 'disabled'
    }

    let guess_home = 0
    let guess_away = 0
    let thisMatchName = 'match_' + thisMatch.name
    
    if (userData.group_matches[thisMatchName]) {
      let guesses = userData.group_matches[thisMatchName]
      guess_home = guesses.home
      guess_away = guesses.away
    }

    let home_result_class = ''
    let away_result_class = ''
    if(thisMatch.finished) {
      if (guess_home == thisMatch.home_result) {
        home_result_class = 'group-match--input__correct'
      } else {
        home_result_class = 'group-match--input__incorrect'
      }
      if (guess_away == thisMatch.away_result) {
        away_result_class = 'group-match--input__correct'
      } else {
        away_result_class = 'group-match--input__incorrect'
      }

      thisScore = calculateResultScore(thisMatch, guess_home, guess_away)
    }
    
    output += '<tr class="' + disabledClass + '">';
    output += '<td>' + thisMatch.name + '</td>'
    output += '<td>' + thisDate.toLocaleDateString("fi-FI") 
               + ' ' + thisDate.toLocaleTimeString("fi-FI") + '</td>'
    output += '<td>' 
    output += '<label class="match--team--container match--team--container__home">'
    output += '<input ' + disabledClass + ' value="' + guess_home + '" type="number" min="0" max="9" '
    output +=   'class="group-match--input ' + home_result_class + '" '
    output +=   'id="match-' + thisMatch.name + '-home">'
    output += '<div class="match--team">'
    output += '<span class="match--team--name">' + getTeamInfo(thisMatch.home_team, 'name') + '</span>'
    output += '<span class="match--team--flag" style="background-image: url(' + getTeamInfo(thisMatch.home_team, 'flag') + ')"></span>'
    output += '</div>'
    output += '</label>'
    if (thisMatch.finished) {
      output += '<p class="group-match--result">' + thisMatch.home_result + '</p>'
    }
    output += '</td>'
    output += '<td>' 
    output += '<label class="match--team--container match--team--container__away">'
    output += '<input ' + disabledClass + ' value="' + guess_away + '" type="number" min="0" max="9" '
    output +=   'class="group-match--input ' + away_result_class + '" '
    output +=   'id="match-' + thisMatch.name + '-away">'
    output += '<div class="match--team">'
    output += '<span class="match--team--flag" style="background-image: url(' + getTeamInfo(thisMatch.away_team, 'flag') + ')"></span>'
    output += '<span class="match--team--name">' + getTeamInfo(thisMatch.away_team, 'name') + '</span>'
    output += '</div>'
    output += '</label>'
    if (thisMatch.finished) {
      output += '<p class="group-match--result group-match--result__away">' + thisMatch.away_result + '</p>'
    }
    output += '</td>'
    output += '<td>' + thisScore + '</td>'
    output += '</tr>'
  }
  guessGroupMatchesTable.innerHTML = output;
}

function printBestTable(round) {
  let guessBestTable = document.getElementById('table--best-' + round)
  let output = '';
  for (let i = 0; i < round; i++) {
    output += '<tr>'
    output += '<td>' + (i + 1) + '</td>'
    output += '<td>' + getTeamDropdown(round, i) + '</td>'
    output += '<td></td>'
    output += '</tr>'
  }
  guessBestTable.innerHTML = output;
}

function getMatchesSorted(groups) {
  let matches = []
  for (let group in groups) {
    for (let match = 0; match < groups[group].matches.length; match++) {
      matches.push( groups[group].matches[match] )
    }
  }
  matches.sort(
    function(a, b) {
      return a.name - b.name
    }
  )
  
  return matches
}

function getTeamInfo(teamNumber, info) {
  let teams = jsonData.teams;
  if (info === 'emojiString' && teamNumber === 27) {
    return " 🇹🇳"
  } else {
    return teams[teamNumber - 1][info]
  }
  
}

function calculateResultScore(thisMatch, guess_home, guess_away) {
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
  if (guess_home > guess_away) {
    guessWinner = 1
  } else if (guess_home < guess_away) {
    guessWinner = -1
  } else {
    guessWinner = 0
  }

  if (realWinner === guessWinner) {
    return 1
  } else {
    return 0
  }
}

function getTeamDropdown(round, position) {
  let team = null
  var ddOutput
  if (userData['round_' + round][position]) {
    team = userData['round_' + round][position]
  }

  if (!knockoutClosed) {
    let selectId = 'best-' + round + '-' + position
    ddOutput = '<select class="dropdown--teams" id="' + selectId + '">'
    ddOutput += '<option>--Valitse--</option>'
    for (let i = 0; i < jsonData.teams.length; i++) {
      ddOutput += '<option value="' + jsonData.teams[i].id + '"'
      ddOutput += (team == parseInt(jsonData.teams[i].id)) ? ' selected>' : '>'
      ddOutput += jsonData.teams[i].name
      ddOutput += '</option>'
    }
    ddOutput += '</select>'
  } else {
    if (team) {
      ddOutput = '<p>' + jsonData.teams[team].name + '</p>'
    } else {
      ddOutput = '<p class="dim">&laquo;Ei valittu&raquo;</p>'
    }
  }
  return ddOutput

}

function setupListeners() {
  document.querySelectorAll('.group-match--input').forEach(function(element, index) {
    element.addEventListener('change', function(event) {
      activeElement = event.target;
      activeElement.setAttribute('disabled', 'disabled')
      let elementNameArray = event.target.id.split('-')
      let matchId = elementNameArray[1]
      let homeGuess = document.getElementById('match-' + matchId + '-home').value;
      let awayGuess = document.getElementById('match-' + matchId + '-away').value;
      saveGroupMatchGuess(matchId, homeGuess, awayGuess)
    })
  })

  if (!knockoutClosed) {
    document.querySelectorAll('.dropdown--teams').forEach(function(element, index) {
      element.addEventListener('change', function(event) {
        let elementNameArray = event.target.id.split('-')
        let round = elementNameArray[1]
        let team = event.target.value
        let position = parseInt(elementNameArray[2]) + 1
        saveRoundGuess(round, team, position)
      })
    })

    document.getElementById('goalStar').addEventListener('input', function(event) {
      if (goalStarTimout) {
        clearTimeout(goalStarTimout)
      }
      goalStarTimout = setTimeout(saveGoalStar, 1000)
    })
  }
}

function saveGoalStar() {
  loader.style.display = 'block'
  let data = {
    'goal_star': document.getElementById('goalStar').value
  }
  fetch('/save/goal_star', {
    body: JSON.stringify(data), 
    cache: 'no-cache', 
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST', 
    mode: 'cors', 
    redirect: 'follow', 
    referrer: 'no-referrer',
  })
  .then(function() {
    loader.style.display = 'none'
  })
}

function saveGroupMatchGuess(matchId, homeGuess, awayGuess) {
  let data = {
    'match_id': matchId,
    'guess_home': homeGuess,
    'guess_away': awayGuess
  }
  fetch('/save/group_match', {
    body: JSON.stringify(data), 
    cache: 'no-cache', 
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST', 
    mode: 'cors', 
    redirect: 'follow', 
    referrer: 'no-referrer',
  })
  .then(function() {
    activeElement.removeAttribute('disabled')
  })
}

function saveRoundGuess(round, team, position) {
  let data = {
    'round':    round,
    'team':     team,
    'position': position
  }
  fetch('/save/round', {
    body: JSON.stringify(data), 
    cache: 'no-cache', 
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST', 
    mode: 'cors', 
    redirect: 'follow', 
    referrer: 'no-referrer',
  })
  .then(function() {
    console.log('saved round')
  })
}