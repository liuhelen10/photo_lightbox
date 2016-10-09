// Page logic
function initializePage() {
  var $searchInput = null,
    $photoGrid = null,
    lightboxHandler,
    paginationHandler;

  document.addEventListener('DOMContentLoaded', onDOMLoad);

  function onDOMLoad() {
    // Globals
    lightboxHandler = new LightboxHandler(document.getElementById('lightbox'));
    paginationHandler = new PaginationHandler(
      document.getElementById('pagination'),
      triggerSearchNextOrPreviousPage
    );
    $searchInput = document.getElementById('search-input');
    $photoGrid = document.getElementById('photo-grid');

    var $searchButton = document.getElementById('search-btn');

    $searchInput.focus();

    $searchButton.addEventListener('click', searchForPhotos);
    $searchInput.addEventListener('keydown', triggerSearchForPhotos);
  }

  function triggerSearchNextOrPreviousPage(page) {
    searchForPhotos({ page: page });
  }

  function triggerSearchForPhotos(e) {
    // Enter key
    if (e && e.type === 'keydown' && e.keyCode === 13) {
      searchForPhotos();
    }
  }

  function searchForPhotos(options) {
    options = options || {};

    var apiKey = '2a2a42163497badb56857f270528dd43',
        xhttp = new XMLHttpRequest(),
        apiUrl = [
          'https://api.flickr.com/services/rest/',
          '?method=flickr.photos.search',
          '&format=json&nojsoncallback=1&media=photos&per_page=104',
          '&api_key=', apiKey,
          '&text=', $searchInput.value,
          '&page=', options.page || '1',
        ].join('');

    showPhotoGridMessage('Loading...');
    paginationHandler.hide();

    xhttp.onload = onSearchResultsLoaded;
    xhttp.open('GET', apiUrl, true);
    xhttp.send();
  }

  function showPhotoGridMessage(message) {
    $photoGrid.innerHTML = [
      '<p class="type-italic">',
      message,
      '</p>'
    ].join('');
  }

  function onSearchResultsLoaded(e) {
    var response = JSON.parse(e.target.response),
      photosArray;

    if (response.stat !== 'ok') {
      showPhotoGridMessage('We\'re sorry, there was an error loading your photos');
      return;
    }

    // Clear photo grid
    $photoGrid.innerHTML = '';

    photosArray = getFormattedPhotosResponse(response.photos.photo);
    lightboxHandler.setPhotosArray(photosArray);

    if (!photosArray.length) {
      showPhotoGridMessage('No results found');
    } else {
      renderPhotoGrid(photosArray, response.photos);
    }

    function getFormattedPhotosResponse(photos) {
      var photosResponse = [],
        photo,
        formattedPhoto;

      for (var i = 0; i < photos.length; i++) {
        photo = photos[i];
        formattedPhoto = getFormattedPhoto(photo, i);

        photosResponse.push(formattedPhoto);
      }

      return photosResponse;
    }

    function getFormattedPhoto(photo, i) {
      var baseUrl = getPhotoBaseUrl(photo);

      return {
        full_url: baseUrl + '_c.jpg',
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

  function renderPhotoGrid(photosArray, responseData) {
    for (var i = 0; i < photosArray.length; i++) {
      appendPhotoToGrid(photosArray[i]);
    }

    paginationHandler.render(responseData.page, responseData.pages);
  }

  function appendPhotoToGrid(photo) {
    var $image = document.createElement('img');

    $image.src = photo.thumbnail_url;
    $image.className = 'image-thumbnail clickable';
    $image.setAttribute('alt', photo.title);
    $image.setAttribute('data-index', photo.index);

    $image.addEventListener('click', openLightbox)

    $photoGrid.appendChild($image);

    function openLightbox(e) {
      var photo = e.target;
      lightboxHandler.open(photo.getAttribute('data-index'));
    }
  }
}

initializePage();
