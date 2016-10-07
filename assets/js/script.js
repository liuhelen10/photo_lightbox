function LightboxHandler(lightbox) {
  this.$lightbox = lightbox;
  this.$image = this.$lightbox.getElementsByClassName('lightbox-img')[0];
  this.$title = this.$lightbox.getElementsByClassName('lightbox-title')[0];
  this.$left = this.$lightbox.getElementsByClassName('left')[0];
  this.$right = this.$lightbox.getElementsByClassName('right')[0];

  this.photosArray = [];
  this.currentPhotoIndex = -1;
}

LightboxHandler.prototype.setPhotoData = function (photosArray) {
  this.photosArray = photosArray;
}

LightboxHandler.prototype.setCurrentPhotoIndex = function (currentPhotoIndex) {
  this.currentPhotoIndex = currentPhotoIndex;
}

LightboxHandler.prototype.open = function (currentPhotoIndex) {
  this.$lightbox.classList.remove('hide-fully');
  this.currentPhotoIndex = currentPhotoIndex;
  this.render();
}

LightboxHandler.prototype.close = function () {
  this.$lightbox.classList.add('hide-fully');
  this.$image.src = '';
  this.$title.innerHTML = '';
}

LightboxHandler.prototype.render = function () {
  var photo = this.photosArray[this.currentPhotoIndex];
  this.$title.innerHTML = photo.title;
  this.$image.src = photo.full_url;
}

LightboxHandler.prototype.showPreviousPhoto = function() {
  if (this.currentPhotoIndex > 0) {
    this.currentPhotoIndex--;
    this.render(this.photosArray[this.currentPhotoIndex]);
  }
}

LightboxHandler.prototype.showNextPhoto = function() {
  if (this.currentPhotoIndex < this.photosArray.length - 1) {
    this.currentPhotoIndex++;
    this.render(this.photosArray[this.currentPhotoIndex]);
  }
}



function initializePage() {
  var $searchInput = null,
    $photoGrid = null,
    lightboxHandler;

  document.addEventListener('DOMContentLoaded', onDOMLoad);

  function onDOMLoad() {
    var $searchButton = document.getElementById('search-btn');

    // Globals
    lightboxHandler = new LightboxHandler(document.getElementById('lightbox'));
    $searchInput = document.getElementById('search-input');
    $photoGrid = document.getElementById('photo-grid');

    $searchInput.focus();

    $searchButton.addEventListener('click', searchForPhotos);
    $searchInput.addEventListener('keydown', onSearchInputKeyDown);
    lightboxHandler.$left.addEventListener('click', lightboxHandler.showPreviousPhoto);
    lightboxHandler.$right.addEventListener('click', lightboxHandler.showNextPhoto)
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
    var response = JSON.parse(e.target.response),
      photosArray;

    if (response.stat !== 'ok') {
      // Handle error
      return;
    }

    photosArray = getFormattedPhotosResponse(response.photos.photo);
    lightboxHandler.setPhotoData(photosArray);

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
    lightboxHandler.open(photo.getAttribute('data-index'));
  }
}

initializePage();
