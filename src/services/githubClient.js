const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubClient {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
    };
  }

  /**
   * GitHub API GET 요청
   * @param {string} endpoint - API 엔드포인트 (예: '/user')
   * @returns {Promise<Object>}
   */
  async get(endpoint) {
    try {
      const url = `${GITHUB_API_BASE}${endpoint}`;
      console.log('GitHub API GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        
        // 404이고 빈 레포지토리인 경우 빈 배열 반환
        if (response.status === 404 && errorBody.includes('This repository is empty')) {
          console.log('Repository is empty, returning empty array');
          return [];
        }
        
        console.error('GitHub API Error Response:', errorBody);
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub API GET error:', error);
      throw error;
    }
  }

  /**
   * GitHub API PUT 요청 (파일 저장/업데이트)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} data - 요청 본문
   * @returns {Promise<Object>}
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub API PUT error:', error);
      throw error;
    }
  }

  /**
   * 토큰 유효성 확인
   * @returns {Promise<boolean>}
   */
  async validateToken() {
    try {
      await this.get('/user');
      return true;
    } catch (error) {
      return false;
    }
  }
}
