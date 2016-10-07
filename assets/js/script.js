function initializePage() {
  var photosArray = [],
    currentPhotoIndex = -1,
    $searchInput = null,
    $photoGrid = null,
    lightboxHandler = new LightboxHandler();

  document.addEventListener('DOMContentLoaded', onDOMLoad);

  function LightboxHandler() {
    this.show = function () {
      var $lightbox = document.getElementById('lightbox');
      $lightbox.classList.remove('hide-fully');
    }.bind(this);

    this.close = function () {
      var $lightbox = document.getElementById('lightbox'),
        $lightboxImg = document.getElementById('lightbox-img'),
        $title = $lightbox.getElementsByTagName('h3')[0];

      currentPhotoIndex = -1;
      $lightbox.classList.add('hide-fully');
      $lightboxImg.src = '';
      $title.innerHTML = '';
    }

    this.showNextPhoto = function () {
      if (currentPhotoIndex < photosArray.length - 1) {
        currentPhotoIndex++;
        this.render();
      }
    }.bind(this);

    this.showPreviousPhoto = function () {
      if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        this.render();
      }
    }.bind(this);

    this.render = function () {
      var $lightbox = document.getElementById('lightbox'),
        $lightboxImg = document.getElementById('lightbox-img'),
        $title = $lightbox.getElementsByTagName('h3')[0],
        photo = photosArray[currentPhotoIndex];

      $title.innerHTML = photo.title;
      $lightboxImg.src = photo.full_url;
    }.bind(this);
  }

  function onDOMLoad() {
    var $searchButton = document.getElementById('search-btn');
    $searchInput = document.getElementById('search-input');
    $photoGrid = document.getElementById('photo-grid'),
    $lightbox = document.getElementById('lightbox'),
    $lightboxLeft = $lightbox.getElementsByClassName('left')[0],
    $lightboxRight = $lightbox.getElementsByClassName('right')[0];

    $searchInput.focus();

    $searchButton.addEventListener('click', searchForPhotos);
    $searchInput.addEventListener('keydown', onSearchInputKeyDown);
    $lightboxLeft.addEventListener('click', lightboxHandler.showPreviousPhoto);
    $lightboxRight.addEventListener('click', lightboxHandler.showNextPhoto);
    document.addEventListener('keydown', triggerLightboxKeydownAction);
    document.addEventListener('click', triggerCloseLightbox);
  }

  function onSearchInputKeyDown(e) {
    if (!e) return;

    if (e.keyCode === 13) {
      // Enter is pressed
      searchForPhotos();
    }
  }

  function triggerLightboxKeydownAction(e) {
    if (e.keyCode === 27) {
      // Escape key
      lightboxHandler.close();
    } else {
      if (!document.getElementById('lightbox').classList.contains('hide-fully')) {
        if (e.keyCode === 39) {
          // Right arrow
          lightboxHandler.showNextPhoto();
        } else if (e.keyCode === 37) {
          // Left arrow
          lightboxHandler.showPreviousPhoto();
        }
      }
    }
  }

  function triggerCloseLightbox(e) {
    var isKeydown = e.type === 'keydown';
    var escapeKeyPressed = isKeydown && e.keyCode === 27;
    var outsideOfLightboxClicked = e.type === 'click' && e.target.getElementsByClassName('modal').length;

    if (escapeKeyPressed || outsideOfLightboxClicked) lightboxHandler.close();
  }

  function searchForPhotos() {
    // Clear photo grid
    $photoGrid.innerHTML = '';

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
    var response = JSON.parse(e.target.response);

    if (response.stat !== 'ok') {
      // Handle error
      return;
    }

    photosArray = getFormattedPhotosResponse(response.photos.photo);

    for (var i = 0; i < photosArray.length; i++) {
      appendPhotoToGrid(photosArray[i]);
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

    $image.addEventListener('click', openLightbox)

    $photoGrid.appendChild($image);
  }

  function openLightbox(e) {
    var photo = e.target;

    currentPhotoIndex = photo.getAttribute('data-index');

    lightboxHandler.show();
    lightboxHandler.render();
  }
}

initializePage();
