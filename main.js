// opt-in to strict mode
'use strict';

// Declare variables to capture all key DOM elements:
const $body = $('body');

const $storiesLoadingMsg = $('#stories-loading-msg');
const $allStoriesList = $('#all-stories-list');
const $favoritedStories = $('#favorited-stories');
const $ownStories = $('#my-stories');

// selector that finds all three story lists
const $storiesLists = $('.stories-list');

const $loginForm = $('#login-form');
const $signupForm = $('#signup-form');

const $submitForm = $('#submit-form');

const $navSubmitStory = $('#nav-submit-story');
const $navLogin = $('#nav-login');
const $navUserProfile = $('#nav-user-profile');
const $navLogOut = $('#nav-logout');

const $userProfile = $('#user-profile');

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $submitForm,
    $ownStories,
    $favoritedStories,
    $userProfile,
  ];
  components.forEach((c) => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
  // [console.debug()] outputs a message to the console, just like [console.log()]
  console.debug('start');

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // If a user is logged-in, then invoke the [updateUIOnUserLogin] function...
  // It will update the nav-bar + generate a user profile.
  // Also, add a list of the user's favorite stories.
  if (currentUser) {
    updateUIOnUserLogin();
    putFavoritesListOnPage();
  }
}

// Once the DOM is entirely loaded, begin the app
console.warn(
  'HEY STUDENT: This program sends many debug messages to' +
    " the console. If you don't see the message 'start' below this, you're not" +
    ' seeing those helpful debug messages. In your browser console, click on' +
    " menu 'Default Levels' and add Verbose"
);

$(start);
