import { GitHubClient } from './githubClient';
import { getTodayString, isSameDay, isNextDay } from '../utils/dateUtils';
import { encodeToBase64, decodeFromBase64 } from '../utils/base64Utils';
import { COMMIT_MESSAGE } from '../constants/CommitMessage';

const STATS_PATH = '.morningpage/stats.json';

const ENDPOINTS = Object.freeze({
  morningPageFolder: (owner, repo) => `/repos/${owner}/${repo}/contents/.morningpage`,
  statsFile: (owner, repo) => `/repos/${owner}/${repo}/contents/${STATS_PATH}`,
});

const DEFAULT_STATS = {
  totalDays: 0,
  streak: 0,
  lastDate: null,
};

export class StatsService {
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
   * stats.json 파일 읽어오기
   * @returns {Promise<Object|null>}
   */
  async fetchStats() {
    try {
      const endpoint = ENDPOINTS.statsFile(this.owner, this.repo);
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
   * stats.json 파일 저장
   * @param {Object} statsData - 통계 데이터
   * @param {string|null} sha - 기존 파일 SHA (업데이트 시 필요)
   * @returns {Promise<Object>}
   */
  async saveStats(statsData, sha = null) {
    try {
      const endpoint = ENDPOINTS.statsFile(this.owner, this.repo);
      
      const content = JSON.stringify(statsData, null, 2);
      const base64Content = encodeToBase64(content);

      const data = {
        message: COMMIT_MESSAGE.UPDATE_STATS,
        content: base64Content,
      };
      
      if (sha) {
        data.sha = sha;
      }
      
      return await this.client.put(endpoint, data);
    } catch (error) {
      console.error('Failed to save stats:', error);
      throw error;
    }
  }

  /**
   * 첫 작성 - 초기 통계 설정
   */
  _setInitialStats(stats, currentDate) {
    stats.totalDays = 1;
    stats.streak = 1;
    stats.lastDate = currentDate;
  }

  /**
   * 연속 작성 - totalDays, streak 증가
   */
  _updateConsecutiveStreak(stats, currentDate) {
    stats.totalDays += 1;
    stats.streak += 1;
    stats.lastDate = currentDate;
  }

  /**
   * 연속 끊김 - totalDays증가 streak 초기화
   */
  _resetStreak(stats, currentDate) {
    stats.totalDays += 1;
    stats.streak = 1;
    stats.lastDate = currentDate;
  }

  /**
   * 업데이트가 필요한지 확인 (같은 날이면 필요 없음)
   */
  _needsUpdate(lastDate, currentDate) {
    return !isSameDay(lastDate, currentDate);
  }

  /**
   * 통계 업데이트
   * @param {string} currentDate - YYYY-MM-DD 형식의 날짜
   * @returns {Promise<void>}
   */
  async updateStats(currentDate = getTodayString()) {
    try {
      const statsFile = await this.fetchStats();
      let stats = DEFAULT_STATS;
      let sha = null;

      if (statsFile) {
        stats = statsFile.data;
        sha = statsFile.sha;
      }

      if (!stats.lastDate) {
        this._setInitialStats(stats, currentDate);
      } else if (!this._needsUpdate(stats.lastDate, currentDate)) {
        console.log('Same day, no stats update needed');
        return;
      } else if (isNextDay(stats.lastDate, currentDate)) {
        this._updateConsecutiveStreak(stats, currentDate);
      } else {
        this._resetStreak(stats, currentDate);
      }

      await this.saveStats(stats, sha);
      console.log('Stats updated:', stats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }
  
}
