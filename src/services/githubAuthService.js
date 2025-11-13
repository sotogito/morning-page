import { GitHubClient } from './githubClient';
import { User } from '../models/User';
import { ERROR_MESSAGE } from '../constants/ErrorMessage';

const ENDPOINTS = Object.freeze({
  user: () => '/user',
  repo: (owner, repo) => `/repos/${owner}/${repo}`,
});

export class GitHubAuthService {
 
  static async authenticate(token, repoUrl) {
    if (!token || !repoUrl) {
      throw new Error(ERROR_MESSAGE.INVALID_LOGIN_INPUT);
    }

    const client = new GitHubClient(token);

    try {
      const userResponse = await client.get(ENDPOINTS.user());
      const user = User.fromGitHubAPI(userResponse);

      if (!user.isValid()) {
        throw new Error(ERROR_MESSAGE.LOGIN_FAIL_DESCRIPTION);
      }

      const { owner, repo } = this.parseRepoUrl(repoUrl);

      await this.validateRepoAccess(client, owner, repo);

      return {
        user,
        owner,
        repo,
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error(ERROR_MESSAGE.LOGIN_FAIL_DESCRIPTION);
    }
  }

  static async validateRepoAccess(client, owner, repo) {
    try {
      await client.get(ENDPOINTS.repo(owner, repo));
    } catch (_error) {
      throw new Error(ERROR_MESSAGE.LOGIN_FAIL_DESCRIPTION);
    }
  }

  static parseRepoUrl(repoUrl) {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error(ERROR_MESSAGE.INVALID_LOGIN_INPUT);
      }

      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    } catch (_error) {
      throw new Error(ERROR_MESSAGE.INVALID_LOGIN_INPUT);
    }
  }

}
