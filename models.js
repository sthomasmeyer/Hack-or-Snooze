// opt-in to strict mode
'use strict';

// Declare a [BASE_URL] variable so that you don't have to...
// re-type it everytime you make a GET or POST request to the API.
const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/******************************************************************************
 * Story: a single story in the system
 */
class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  // Create a method that returns the hostname of a given URL.
  getHostName() {
    return new URL(this.url).host;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is...
    // **not** an instance method. Rather, it is a method that is called on...
    // the class directly. This makes sense because there's no reason to...
    // invoke this method on an individual instance of the StoryList class.

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: 'GET',
    });

    // Use the response data from our 'GET' request + the [.map()] method to...
    // convert 'plain old' story objects from the Hack-or-Snooze API into...
    // an array filled w/ instances of the Story class.
    console.log(response.data);
    const stories = response.data.stories.map((story) => new Story(story));
    console.log(stories);

    // Use this new array of stories to return an instance of this StoryList class.
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, { title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });

    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story;
  }

  //   Delete story from API and remove from story lists.
  //   - user: the current User instance
  //   - storyId: the ID of the story you want to remove
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'DELETE',
      data: { token: user.loginToken },
    });
    // filter out the story whose ID we are removing
    this.stories = this.stories.filter((story) => story.storyId !== storyId);

    // do the same thing for the user's list of stories and their favorites
    user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId);
    user.favorites = user.favorites.filter((s) => s.storyId !== storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */
class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */
  constructor(
    {
      username,
      name,
      createdAt,
      // The "favorites" array will be filled w/...
      // a list of stories that the user has "favorited".
      favorites = [],
      // The "ownStories" array will be filled w/...
      // a list of stories that the user has submitted.
      ownStories = [],
    },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: 'POST',
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: 'POST',
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: 'GET',
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error('loginViaStoredCredentials failed', err);
      return null;
    }
  }

  // Add a story to the list of user favorites and update the API
  // -story: a Story instance to add to favorites
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite('add', story);
  }

  // Remove a story to the list of user favorites and update the API
  // -story: the Story instance to remove from favorites
  async removeFavorite(story) {
    console.log(this.favorites);
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite('remove', story);
    console.log(this.favorites);
  }

  // Update API w/ favorite / not-favorite
  // -newState: "add" or "remove"
  // -story: Story instance to make favorite / not favorite
  async _addOrRemoveFavorite(newState, story) {
    const method = newState === 'add' ? 'POST' : 'DELETE';
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }
  //Return true or false if given Story instance is a favorite of this user
  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  }
}
