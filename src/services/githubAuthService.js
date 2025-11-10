import { GitHubClient } from './githubClient';
import { User } from '../models/User';

export class GitHubAuthService {
  /**
   * 사용자 인증 및 정보 가져오기
   */
  static async authenticate(token, repoUrl) {
    if (!token || !repoUrl) {
      throw new Error('Token and repository URL are required');
    }

    const client = new GitHubClient(token);

    try {
      const userResponse = await client.get('/user');
      const user = User.fromGitHubAPI(userResponse);

      if (!user.isValid()) {
        throw new Error('Invalid user data received from GitHub');
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
      throw new Error('GitHub authentication failed. Please check your token and repository URL.');
    }
  }

  /**
   * Repository 접근 권한 확인
   */
  static async validateRepoAccess(client, owner, repo) {
    try {
      await client.get(`/repos/${owner}/${repo}`);
    } catch (error) {
      throw new Error('Cannot access the repository. Please check your permissions.');
    }
  }

  /**
   * Repository URL에서 owner와 repo 이름 추출
   */
  static parseRepoUrl(repoUrl) {
    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL format');
      }

      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    } catch (error) {
      throw new Error('Failed to parse repository URL');
    }
  }

}
