import { GitHubClient } from './githubClient';
import { encodeToBase64, decodeFromBase64 } from '../utils/base64Utils';
import { COMMIT_MESSAGE } from '../constants/CommitMessage';

const MORNING_TIME_PATH = '.morningpage/morning-time.json';

const ENDPOINTS = Object.freeze({
  morningPageFolder: (owner, repo) => `/repos/${owner}/${repo}/contents/.morningpage`,
  morningTimeFile: (owner, repo) => `/repos/${owner}/${repo}/contents/${MORNING_TIME_PATH}`,
});

export class MorningTimeService {
  constructor(token, owner, repo) {
    this.client = new GitHubClient(token);
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * .morningpage 폴더 존재 여부 확인
   * @returns {Promise<boolean>}
   */
  async checkMorningPageFolder() {
    try {
      const endpoint = ENDPOINTS.morningPageFolder(this.owner, this.repo);
      await this.client.get(endpoint, { silent: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * morning-time.json 파일 가져오기
   * @returns {Promise<Object|null>}
   */
  async fetchMorningTime() {
    try {
      const endpoint = ENDPOINTS.morningTimeFile(this.owner, this.repo);
      const response = await this.client.get(endpoint, { silent: true });
      
      if (!response || !response.content) {
        return null;
      }

      const content = decodeFromBase64(response.content);
      const data = JSON.parse(content);

      return {
        data,
        sha: response.sha,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * morning-time.json 파일 저장 (생성 또는 업데이트)
   * @param {Object} timeConfig - 시간 설정 객체
   * @param {string|null} sha - 기존 파일 SHA (업데이트 시 필요)
   * @returns {Promise<Object>}
   */
  async saveMorningTime(timeConfig, sha = null) {
    try {
      const endpoint = ENDPOINTS.morningTimeFile(this.owner, this.repo);
      
      const content = JSON.stringify(timeConfig, null, 2);
      const base64Content = encodeToBase64(content);

      const data = {
        message: sha ? COMMIT_MESSAGE.UPDATE_MORNING_TIME : COMMIT_MESSAGE.CREATE_MORNING_TIME,
        content: base64Content,
      };

      if (sha) {
        data.sha = sha;
      }

      return await this.client.put(endpoint, data);
    } catch (error) {
      console.error('Failed to save morning time:', error);
      throw error;
    }
  }

}
