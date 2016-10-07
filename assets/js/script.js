function initializePage() {
  var $searchInput = null,
    $photoGrid = null;

  document.addEventListener('DOMContentLoaded', onDOMLoad);

  function onDOMLoad() {
    var $searchButton = document.getElementById('search-btn');
    $searchInput = document.getElementById('search-input');
    $photoGrid = document.getElementById('photo-grid');

    $searchInput.focus();

    $searchButton.addEventListener('click', searchForPhotos);
    $searchInput.addEventListener('keydown', onSearchInputKeyDown);
  }

  function onSearchInputKeyDown(e) {
    if (!e) return;

    if (e.keyCode === 13) {
      // Enter is pressed
      searchForPhotos();
    }
  }

  function searchForPhotos() {
    // Clear photo grid
    document.getElementById('photo-grid').innerHTML = '';

    var apiKey = '2a2a42163497badb56857f270528dd43',
        xhttp = new XMLHttpRequest(),
        apiUrl = 'https://api.flickr.com/services/rest/' +
          '?method=flickr.photos.search' +
          '&format=json&nojsoncallback=1&media=photos&per_page=104' +
          '&api_key=' + apiKey +
          '&text=' + $searchInput.value;

    xhttp.onload = onSearchResultsLoaded;
    xhttp.open('GET', apiUrl, true);
    xhttp.send();
  }

  function onSearchResultsLoaded(e) {
    var response = JSON.parse(e.target.response),
      photos;

    if (response.stat !== 'ok') {
      // Handle error
      return;
    }

    photos = getFormattedPhotosResponse(response.photos.photo);

    for (var i = 0; i < photos.length; i++) {
      appendPhotoToGrid(photos[i]);
    }

    /* Photo response handlers */
    function getFormattedPhotosResponse(photos) {
      var photosResponse = [];

      for (var i = 0; i < photos.length; i++) {
        var photo = photos[i],
          formattedPhoto = getFormattedPhoto(photo, i);

        photosResponse.push(formattedPhoto);
      }

      return photosResponse;
    }

    function getFormattedPhoto(photo, i) {
      var baseUrl = getPhotoBaseUrl(photo);

      return {
        full_url: baseUrl + '.jpg',
        thumbnail_url: baseUrl + '_q.jpg',
        title: photo.title,
        index: i
      };
    }

    function getPhotoBaseUrl(photo) {
      return [
        'https://farm',
        photo.farm,
        '.staticflickr.com/',
        photo.server,
        '/',
        photo.id,
        '_',
        photo.secret
      ].join('');
    }
  }

  function appendPhotoToGrid(photo) {
    var $image = document.createElement('img');

    $image.src = photo.thumbnail_url;
    $image.className = 'image-thumbnail clickable';
    $image.setAttribute('data-full-url', photo.full_url);
    $image.setAttribute('data-index', photo.index);
    $image.setAttribute('data-title', photo.title);

    $photoGrid.appendChild($image);
  }
}

initializePage();
