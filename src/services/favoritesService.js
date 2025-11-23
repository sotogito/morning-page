import { GitHubClient } from './githubClient';
import { encodeToBase64, decodeFromBase64 } from '../utils/base64Utils';
import { COMMIT_MESSAGE } from '../constants/CommitMessage';

const FAVORITES_PATH = '.morningpage/favorites.json';

const ENDPOINTS = Object.freeze({
  morningPageFolder: (owner, repo) => `/repos/${owner}/${repo}/contents/.morningpage`,
  favoritesFile: (owner, repo) => `/repos/${owner}/${repo}/contents/${FAVORITES_PATH}`,
});

const DEFAULT_FAVORITES = {
  paths: [],
};

export class FavoritesService {
  constructor(token, owner, repo) {
    this.client = new GitHubClient(token);
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * .morningpage 폴더가 존재하는지 확인
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
   * favorites.json 파일 읽어오기
   * @returns {Promise<Object|null>}
   */
  async fetchFavorites() {
    try {
      const endpoint = ENDPOINTS.favoritesFile(this.owner, this.repo);
      const response = await this.client.get(endpoint, { silent: true });
      
      if (response.content) {
        const content = decodeFromBase64(response.content);
        return {
          data: JSON.parse(content),
          sha: response.sha,
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * favorites.json 파일 저장
   * @param {string[]} paths - 즐겨찾기 경로 배열
   * @param {string|null} sha - 기존 파일 SHA (업데이트 시 필요)
   * @returns {Promise<Object>}
   */
  async saveFavorites(paths, sha = null) {
    try {
      const endpoint = ENDPOINTS.favoritesFile(this.owner, this.repo);
      
      const favoritesData = { paths };
      const content = JSON.stringify(favoritesData, null, 2);
      const base64Content = encodeToBase64(content);

      const data = {
        message: COMMIT_MESSAGE.UPDATE_FAVORITES,
        content: base64Content,
      };
      
      if (sha) {
        data.sha = sha;
      }
      
      return await this.client.put(endpoint, data);
    } catch (error) {
      console.error('Failed to save favorites:', error);
      throw error;
    }
  }

}
