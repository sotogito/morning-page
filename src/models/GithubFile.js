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

  static createFileName(date, title = null) {
    if (title && title.trim()) {
      return `${date} ${title.trim()}.md`;
    }
    return `${date}.md`;
  }

  static compareByDate(a, b) {
    const dateA = a.extractDate();
    const dateB = b.extractDate();
    
    if (!dateA || !dateB) return 0;
    
    return dateB.localeCompare(dateA);
  }
  
}
