// Lightbox Handler -- handles all logic concerning the lightbox
function LightboxHandler(lightbox) {
  this.$lightbox = lightbox;
  this.$image = this.$lightbox.getElementsByClassName('lightbox-img')[0];
  this.$title = this.$lightbox.getElementsByClassName('lightbox-title')[0];
  this.$chevronLeft = this.$lightbox.getElementsByClassName('chevron-left')[0];
  this.$chevronRight = this.$lightbox.getElementsByClassName('chevron-right')[0];
  this.photosArray = [];
  this.currentPhotoIndex = -1;

  this.setUpEventListeners();
}

LightboxHandler.prototype.setUpEventListeners = function () {
  var $leftNav = this.$lightbox.getElementsByClassName('left')[0],
    $rightNav = this.$lightbox.getElementsByClassName('right')[0];

  $leftNav.addEventListener('click', this.showPreviousPhoto.bind(this));
  $rightNav.addEventListener('click', this.showNextPhoto.bind(this))

  document.addEventListener('keydown', triggerKeyDownAction.bind(this));
  document.addEventListener('click', triggerClose.bind(this));

  function triggerKeyDownAction(e) {
    if (!e) return;

    if (e.keyCode === 27) {
      // Escape key
      this.close();
    } else {
      if (!this.$lightbox.classList.contains('hide-fully')) {
        if (e.keyCode === 39) {
          // Right arrow
          this.showNextPhoto();
        } else if (e.keyCode === 37) {
          // Left arrow
          this.showPreviousPhoto();
        }
      }
    }
  }

  function triggerClose(e) {
    var isKeydown = e.type === 'keydown';
    var isClick = e.type === 'click';
    var escapeKeyPressed = isKeydown && e.keyCode === 27;
    var outsideOfLightboxClicked = isClick && e.target.getElementsByClassName('modal').length;
    var exitButtonClicked = isClick && e.target.classList.contains('exit');

    if (escapeKeyPressed || outsideOfLightboxClicked || exitButtonClicked) {
      this.close();
    }
  }
}

LightboxHandler.prototype.setPhotosArray = function (photosArray) {
  this.photosArray = photosArray;
}

LightboxHandler.prototype.setCurrentPhotoIndex = function (currentPhotoIndex) {
  this.currentPhotoIndex = currentPhotoIndex;
}

LightboxHandler.prototype.open = function (currentPhotoIndex) {
  this.$lightbox.classList.remove('hide-fully');
  this.currentPhotoIndex = parseInt(currentPhotoIndex, 10);
  this.render();
}

LightboxHandler.prototype.close = function () {
  this.$lightbox.classList.add('hide-fully');
  this.$image.src = '';
  this.$title.innerHTML = '';
}

LightboxHandler.prototype.render = function () {
  var photo = this.photosArray[this.currentPhotoIndex],
    onLastPhoto = this.currentPhotoIndex === this.photosArray.length - 1,
    onFirstPhoto = this.currentPhotoIndex === 0;

  this.$image.src = '';
  this.$image.alt = photo.title;
  this.$title.innerHTML = photo.title;
  this.$image.src = photo.full_url;

  // Handle hiding/showing left and right arrows
  if (onLastPhoto) {
    this.$chevronRight.classList.add('hide-fully');
  } else {
    this.$chevronRight.classList.remove('hide-fully');
  }

  if (onFirstPhoto) {
    this.$chevronLeft.classList.add('hide-fully');
  } else {
    this.$chevronLeft.classList.remove('hide-fully');
  }
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



// Page logic
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
    $searchInput.addEventListener('keydown', triggerSearchForPhotos);
  }

  function triggerSearchForPhotos(e) {
    // Enter key
    if (e && e.keyCode === 13) searchForPhotos();
  }

  function searchForPhotos() {
    var apiKey = '2a2a42163497badb56857f270528dd43',
        xhttp = new XMLHttpRequest(),
        apiUrl = 'https://api.flickr.com/services/rest/' +
          '?method=flickr.photos.search' +
          '&format=json&nojsoncallback=1&media=photos&per_page=104' +
          '&api_key=' + apiKey +
          '&text=' + $searchInput.value;

    showPhotoGridMessage('Loading...');

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

    function renderPhotoGrid(photosArray, responseData) {
      for (var i = 0; i < photosArray.length; i++) {
        appendPhotoToGrid(photosArray[i]);
      }

      var $paginationDiv = document.getElementsByClassName('pagination')[0];
      var $pageNumber = document.getElementsByClassName('page-number')[0];
      var $previous = $paginationDiv.getElementsByClassName('previous')[0];
      var $next = $paginationDiv.getElementsByClassName('next')[0];
      var currentPage = responseData.page;
      var totalPages = responseData.pages;

      $pageNumber.innerHTML = [
        'Page ',
        currentPage,
        ' of ',
        totalPages
      ].join('');

      $paginationDiv.classList.remove('hide-fully');

      if (currentPage > 1) {
        $previous.classList.remove('hide-fully')
      } else {
        $previous.classList.add('hide-fully')
      }

      if (currentPage < totalPages) {
        $next.classList.remove('hide-fully');
      } else {
        $next.classList.add('hide-fully');
      }
    }

    // Photo response handlers
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
