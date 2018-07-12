var loader = document.getElementById('loader')

fetch('/load/scores', { credentials: 'include' })
.then(function(response) {
  return response.json()
})
.then(function(data) {
  printTable(data)
})
.catch(function(error) {
  console.log(error)
})

function printTable(scoreData) {
  let scoreTable = document.getElementById('table--scores')
  let output = ''
  for (let i = 0; i < scoreData.length; i++) {
    let thisPlayer = scoreData[i]
    
    output += '<tr>';
    output += '<td>' + (i + 1) + '</td>'
    output += '<td><a href="/?id=' + thisPlayer.user_id + '">'
    output += thisPlayer.display_name + '</a></td>'
    output += '<td>' + thisPlayer.match_winners + '</td>'
    output += '<td>' + thisPlayer.match_results + '</td>'
    output += '<td>' + thisPlayer.positions + '</td>'
    output += '<td>' + thisPlayer.goal_king + '</td>'
    output += '<td>' + thisPlayer.total + '</td>'
    output += '</tr>'
  }
  scoreTable.innerHTML = output;
}

