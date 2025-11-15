import { GitHubClient } from './githubClient';
import { GithubFile } from '../models/GithubFile';
import { ERROR_MESSAGE } from '../constants/ErrorMessage';
import { StatsService } from './statsService';
import { encodeToBase64 } from '../utils/base64Utils';

const ENDPOINTS = Object.freeze({
  contents: (owner, repo, path = '') => `/repos/${owner}/${repo}/contents/${path}`,
  commits: (owner, repo, path) => `/repos/${owner}/${repo}/commits?path=${path}`,
});

export class GitHubFileService {
  constructor(token, owner, repo) {
    this.client = new GitHubClient(token);
    this.owner = owner;
    this.repo = repo;
    this.statsService = new StatsService(token, owner, repo);
  }

  /**
   * 레퍼지토리의 모든 .md 파일 목록 가져오기
   * @param {string} path - 탐색할 경로 (기본: 루트)
   * @returns {Promise<GithubFile[]>}
   */
  async fetchAllMarkdownFiles(path = '') {
    try {
      const endpoint = ENDPOINTS.contents(this.owner, this.repo, path);
      const contents = await this.client.get(endpoint);

      if (!contents || contents.length === 0) {
        return [];
      }

      const files = [];

      for (const item of contents) {
        if (item.type === 'dir') {
          if (item.name === '.morningpage') {
            continue;
          }
          const childFiles = await this.fetchAllMarkdownFiles(item.path);
          files.push(...childFiles);
        } else {
          const githubFile = GithubFile.fromGitHubAPI(item);
          if (githubFile.isMarkdown() && githubFile.isDatePattern()) {
            files.push(githubFile);
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to fetch markdown files:', error);
      console.error('Error details:', error.message);
      throw new Error(ERROR_MESSAGE.FAIL_LOAD_FILES);
    }
  }

  /**
   * 특정 파일의 내용 가져오기
   * @param {string} path - 파일 경로
   * @returns {Promise<GithubFile>}
   */
  async fetchFileContent(path) {
    try {
      console.log("내용 가져오기");
      const endpoint = ENDPOINTS.contents(this.owner, this.repo, path);
      const response = await this.client.get(endpoint);

      const githubFile = GithubFile.fromGitHubAPI(response);

      if (response.content) {
        githubFile.decodeContent(response.content);
      }

      return githubFile;
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      throw new Error(ERROR_MESSAGE.FAIL_LOAD_FILE);
    }
  }

  /**
   * 파일 저장/업데이트
   * @param {string} path - 파일 경로
   * @param {string} content - 파일 내용
   * @param {string} message - 커밋 메시지
   * @param {string|null} sha - 기존 파일의 SHA (업데이트 시 필요)
   * @returns {Promise<Object>}
   */
  async saveFile(path, content, message, sha = null) {
    try {
      const endpoint = ENDPOINTS.contents(this.owner, this.repo, path);
  
      const base64Content = encodeToBase64(content);

      const data = {
        message,
        content: base64Content,
      };
      if (sha) {
        data.sha = sha;
      }
      
      const result = await this.client.put(endpoint, data);
      
      await this.updateStatsIfNeeded(path);
      
      return result;
    } catch (error) {
      console.error('Failed to save file:', error);
      throw new Error(ERROR_MESSAGE.FAIL_SAVE_FILE);
    }
  }

  /**
   * 필요한 경우 통계 업데이트
   * @param {string} path - 저장된 파일 경로
   */
  async updateStatsIfNeeded(path) {
    try {
      const hasMorningPageFolder = await this.statsService.checkMorningPageFolder();
      if (!hasMorningPageFolder) {
        console.log('No .morningpage folder found, skipping stats update');
        return;
      }

      if (path.endsWith('.md')) {
        const datePattern = /(\d{4})-(\d{2})-(\d{2})(\s.*)?\.md$/;
        if (datePattern.test(path)) {
          await this.statsService.updateStats();
          console.log('Stats updated for:', path);
        }
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  /**
   * 특정 파일의 커밋 히스토리 가져오기
   * @param {string} path - 파일 경로
   * @returns {Promise<Object[]>}
   */
  async fetchFileCommits(path) {
    try {
      console.log("시간 가져오기");
      const endpoint = ENDPOINTS.commits(this.owner, this.repo, path);

      return await this.client.get(endpoint);
    } catch (error) {
      console.error('Failed to fetch file commits:', error);
      throw new Error(ERROR_MESSAGE.FAIL_LOAD_FILE);
    }
  }

  /**
   * 파일의 마지막 커밋 시간 가져오기
   * @param {string} path - 파일 경로
   * @returns {Promise<string|null>} - ISO timestamp
   */
  async getLastCommitTime(path) {
    try {
      const commits = await this.fetchFileCommits(path);
      if (commits.length > 0) {
        return commits[0].commit.committer.date;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get last commit time:', error);
      return null;
    }
  }

}
