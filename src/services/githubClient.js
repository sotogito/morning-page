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
   * 레퍼지토리 파일 목록 반환
   * @param {string} endpoint - API 엔드포인트 (예: '/user')
   * @returns {Promise<Object>}
   */
  async get(endpoint) {
    try {
      const url = `${GITHUB_API_BASE}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        
        if (response.status === 404 
          && errorBody.includes('This repository is empty')) {
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
   * 파일 저장 및 업데이트
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
    } catch (_error) {
      return false;
    }
  }
  
}
