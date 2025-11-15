import { decodeFromBase64 } from '../utils/base64Utils';

export class GithubFile {
  constructor({ name, path, sha, downloadUrl, content, savedAt }) {
    this.name = name;
    this.path = path;
    this.sha = sha;
    this.downloadUrl = downloadUrl;
    this.content = content;
    this.savedAt = savedAt;
  }

  /**
   * GitHub API 응답을 GithubFile 모델로 변환
   * @param {Object} apiResponse - GitHub contents API 응답
   * @returns {GithubFile}
   */
  static fromGitHubAPI(apiResponse) {
    return new GithubFile({
      name: apiResponse.name,
      path: apiResponse.path,
      sha: apiResponse.sha,
      downloadUrl: apiResponse.download_url,
      content: null,
      savedAt: null,
    });
  }

  isMarkdown() {
    return this.name.endsWith('.md');
  }

  isDatePattern() {
    return /^\d{4}-\d{2}-\d{2}(\s+.+)?\.md$/.test(this.name);
  }

  extractDate() {
    const match = this.name.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  extractTitle() {
    const match = this.name.match(/^\d{4}-\d{2}-\d{2}\s+(.+)\.md$/);
    return match ? match[1] : null;
  }

  /**
   * base64 인코딩된 content를 디코딩
   */
  decodeContent(base64Content) {
    try {
      this.content = decodeFromBase64(base64Content);
      return this.content;
    } catch (error) {
      console.error('Failed to decode content:', error);
      this.content = '';
      return this.content;
    }
  }

  /**
   * 제목 포함 파일명 생성
   * @param {string} date - YYYY-MM-DD 형식
   * @param {string|null} title - 제목 (선택)
   * @returns {string} - 파일명
   */
  static createFileName(date, title = null) {
    if (title && title.trim()) {
      return `${date} ${title.trim()}.md`;
    }
    return `${date}.md`;
  }

  /**
   * 날짜로 정렬하기 위한 비교 함수 - 최신순
   * @param {GithubFile} a
   * @param {GithubFile} b
   * @returns {number}
   */
  static compareByDate(a, b) {
    const dateA = a.extractDate();
    const dateB = b.extractDate();
    
    if (!dateA || !dateB) return 0;
    
    return dateB.localeCompare(dateA);
  }
}
