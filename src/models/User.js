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

  /**
   * localStorage에 저장할 수 있는 형태로 변환
   */
  toJSON() {
    return {
      login: this.login,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
    };
  }

  /**
   * localStorage에서 User 모델로 복원
   */
  static fromJSON(json) {
    return new User(json);
  }

}
