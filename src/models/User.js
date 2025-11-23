export class User {
  constructor({ login, name, email, avatarUrl }) {
    this.login = login;
    this.name = name;
    this.email = email;
    this.avatarUrl = avatarUrl;
  }

  static fromGitHubAPI(apiResponse) {
    return new User({
      login: apiResponse.login,
      name: apiResponse.name,
      email: apiResponse.email,
      avatarUrl: apiResponse.avatar_url,
    });
  }

  isValid() {
    return Boolean(this.login && this.name);
  }

  toJSON() {
    return {
      login: this.login,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
    };
  }

  static fromJSON(json) {
    return new User(json);
  }

}
