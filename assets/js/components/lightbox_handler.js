// Handles all logic concerning the lightbox
function LightboxHandler(lightbox) {
  this.$lightbox = lightbox;
  this.$image = this.$lightbox.getElementsByClassName('lightbox-img')[0];
  this.$title = this.$lightbox.getElementsByClassName('lightbox-title')[0];
  this.$chevronLeft = this.$lightbox.getElementsByClassName('chevron-left')[0];
  this.$chevronRight = this.$lightbox.getElementsByClassName('chevron-right')[0];
  this.photosArray = [];
  this.currentPhotoIndex = -1;

  this.setUpEventListeners();
};

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
};

LightboxHandler.prototype.setPhotosArray = function (photosArray) {
  this.photosArray = photosArray;
};

LightboxHandler.prototype.setCurrentPhotoIndex = function (currentPhotoIndex) {
  this.currentPhotoIndex = currentPhotoIndex;
};

LightboxHandler.prototype.open = function (currentPhotoIndex) {
  this.$lightbox.classList.remove('hide-fully');
  this.currentPhotoIndex = parseInt(currentPhotoIndex, 10);
  this.render();
};

LightboxHandler.prototype.close = function () {
  this.$lightbox.classList.add('hide-fully');
  this.$image.src = '';
  this.$title.innerHTML = '';
};

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
};

LightboxHandler.prototype.showPreviousPhoto = function() {
  if (this.currentPhotoIndex > 0) {
    this.currentPhotoIndex--;
    this.render(this.photosArray[this.currentPhotoIndex]);
  }
};

LightboxHandler.prototype.showNextPhoto = function() {
  if (this.currentPhotoIndex < this.photosArray.length - 1) {
    this.currentPhotoIndex++;
    this.render(this.photosArray[this.currentPhotoIndex]);
  }
};
