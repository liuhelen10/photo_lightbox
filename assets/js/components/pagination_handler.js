// Handles all logic concerning pagination
function PaginationHandler(pagination, paginateCallback) {
  this.$pagination = pagination;
  this.$pageNumber = this.$pagination.getElementsByClassName('page-number')[0];
  this.$previous = this.$pagination.getElementsByClassName('previous')[0];
  this.$next = this.$pagination.getElementsByClassName('next')[0];
  this.currentPage = -1;

  this.setUpEventListeners(paginateCallback);
}

PaginationHandler.prototype.setUpEventListeners = function (paginateCallback) {
  this.$next.addEventListener('click', function () {
    paginateCallback(this.currentPage + 1);
  }.bind(this));

  this.$previous.addEventListener('click', function () {
    paginateCallback(this.currentPage - 1);
  }.bind(this))
}

PaginationHandler.prototype.render = function (currentPage, totalPages) {
  this.currentPage = currentPage;

  this.$pageNumber.innerHTML = [
    'Page ',
    this.currentPage,
    ' of ',
    totalPages
  ].join('');

  this.$pagination.classList.remove('hide-fully');

  // Handle showing/hiding of previous/next links
  if (this.currentPage > 1) {
    this.$previous.classList.remove('hide-fully')
  } else {
    this.$previous.classList.add('hide-fully')
  }

  if (this.currentPage < totalPages) {
    this.$next.classList.remove('hide-fully');
  } else {
    this.$next.classList.add('hide-fully');
  }
};

PaginationHandler.prototype.hide = function () {
  this.$pagination.classList.add('hide-fully');
};
