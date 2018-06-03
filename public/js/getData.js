function getData(endpoint = '') {
  fetch('/data/' + endpoint)
    .then(function(response) {
      return response.json()
    })
    .then(function(data) {
      return data
    })
}