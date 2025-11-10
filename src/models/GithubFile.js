export class GithubFile {
  constructor({ name, path, sha, type, downloadUrl, content, savedAt, children }) {
    this.name = name;
    this.path = path;
    this.sha = sha;
    this.type = type;
    this.downloadUrl = downloadUrl;
    this.content = content;
    this.savedAt = savedAt;
    this.children = children || [];
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
      type: apiResponse.type === 'dir' ? 'folder' : 'file',
      downloadUrl: apiResponse.download_url,
      content: null,
      savedAt: null,
      children: [],
    });
  }

  isMarkdown() {
    return this.type === 'file' && this.name.endsWith('.md');
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
      this.content = decodeURIComponent(escape(atob(base64Content)));
      return this.content;
    } catch (error) {
      console.error('Failed to decode content:', error);
      this.content = '';
      return this.content;
    }
  }

  isFolder() {
    return this.type === 'folder';
  }

  isFile() {
    return this.type === 'file';
  }

  /**
   * 파일 트리 구조로 변환 (FileTree 컴포넌트용)
   */
  toFileTreeNode() {
    return {
      name: this.name,
      type: this.type,
      path: this.path,
      children: this.children.map(child => child.toFileTreeNode()),
      sha: this.sha,
      savedAt: this.savedAt,
    };
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
   * 날짜로 정렬하기 위한 비교 함수
   * @param {GithubFile} a
   * @param {GithubFile} b
   * @returns {number}
   */
  static compareByDate(a, b) {
    const dateA = a.extractDate();
    const dateB = b.extractDate();
    
    if (!dateA || !dateB) return 0;
    
    return dateB.localeCompare(dateA); // 최신순
  }
}
