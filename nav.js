// opt-in to strict mode
'use strict';

// This JS file contains functions + info related to...
// handling click-events on the navbar.

// Take users to the home page wherein a list of...
// all stories + favorites are displayed.
function navAllStories(evt) {
  // [console.debug()] outputs a message to the console, just like [console.log()]
  console.debug('navAllStories', evt);
  hidePageComponents();
  putStoriesOnPage();
  putFavoritesListOnPage();
  $favoritedStories.show();
}

$body.on('click', '#nav-all', navAllStories);

// Take users to a page wherein they can submit a new story.
function navSubmitStoryClick(evt) {
  console.debug('navSubmitStoryClick', evt);
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on('click', navSubmitStoryClick);

// Take users to a page filled w/ their favorite stories.
function navFavoritesClick(evt) {
  console.debug('navFavoritesClick', evt);
  hidePageComponents();
  putFavoritesListOnPage();
}

$body.on('click', '#nav-favorites', navFavoritesClick);

// show my stories on clicking "my stories"
function navMyStories(evt) {
  console.debug('navMyStories', evt);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

$body.on('click', '#nav-my-stories', navMyStories);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug('navLoginClick', evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on('click', navLoginClick);

// hide everything but profile on click on "profile"
function navProfileClick(evt) {
  console.debug('navProfileClick', evt);
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on('click', navProfileClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
