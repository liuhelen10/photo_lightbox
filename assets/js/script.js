function initializePage() {
  var apiKey = '2a2a42163497badb56857f270528dd43';
  var searchTerm = null;

  document.addEventListener('DOMContentLoaded', onDOMLoad);

  function onDOMLoad() {
    var searchButton = document.getElementById('search-btn');
    searchTerm = document.getElementById('search-term');

    searchTerm.focus();

    searchButton.addEventListener('click', searchForPhotos);
  }

  function searchForPhotos() {
    var searchTermValue = searchTerm.value;
    var xhttp = new XMLHttpRequest();
    var apiUrl = 'https://api.flickr.com/services/rest/' +
      '?method=flickr.photos.search' +
      '&format=json&nojsoncallback=1&media=photos&per_page=104' +
      '&api_key=' + apiKey +
      '&text=' + searchTermValue;

    xhttp.onload = onSearchResultsLoaded;
    xhttp.open('GET', apiUrl, true);
    xhttp.send();
  }

  function onSearchResultsLoaded(e) {
    console.log('here');
  }
}

initializePage();
