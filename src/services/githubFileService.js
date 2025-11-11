import { GitHubClient } from './githubClient';
import { GithubFile } from '../models/GithubFile';

export class GitHubFileService {
  constructor(token, owner, repo) {
    this.client = new GitHubClient(token);
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Repository의 모든 .md 파일 목록 가져오기 (재귀적으로 탐색)
   * @param {string} path - 탐색할 경로 (기본: 루트)
   * @returns {Promise<GithubFile[]>}
   */
  async fetchAllMarkdownFiles(path = '') {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
      console.log('Fetching from:', endpoint);
      const contents = await this.client.get(endpoint);

      if (!contents || contents.length === 0) {
        console.log('Repository is empty or path has no contents');
        return [];
      }

      const files = [];

      for (const item of contents) {
        if (item.type === 'dir') {
          const childFiles = await this.fetchAllMarkdownFiles(item.path);
          files.push(...childFiles);
        } else {
          const githubFile = GithubFile.fromGitHubAPI(item);
          if (githubFile.isMarkdown() && githubFile.isDatePattern()) {
            files.push(githubFile);
          }
        }
      }

      console.log(`Found ${files.length} markdown files matching date pattern`);
      return files;
    } catch (error) {
      console.error('Failed to fetch markdown files:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to load files from repository: ${error.message}`);
    }
  }

  /**
   * 특정 파일의 내용 가져오기
   * @param {string} path - 파일 경로
   * @returns {Promise<GithubFile>}
   */
  async fetchFileContent(path) {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await this.client.get(endpoint);

      const githubFile = GithubFile.fromGitHubAPI(response);
      
      // base64 content 디코딩
      if (response.content) {
        githubFile.decodeContent(response.content);
      }

      return githubFile;
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      throw new Error('Failed to load file content');
    }
  }

  /**
   * 파일 목록을 폴더 구조로 변환 (FileTree용)
   * @param {GithubFile[]} files - 파일 목록
   * @returns {Object[]} - 폴더 구조
   */
  buildFileTree(files) {
    const tree = [];
    const folderMap = new Map();

    // 날짜순 정렬 (최신순)
    const sortedFiles = files.sort(GithubFile.compareByDate);

    sortedFiles.forEach(file => {
      const parts = file.path.split('/');
      const fileName = parts.pop();
      
      let currentLevel = tree;
      let currentPath = '';

      // 폴더 구조 생성
      parts.forEach(folderName => {
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        let folder = folderMap.get(currentPath);
        
        if (!folder) {
          folder = {
            name: folderName,
            type: 'folder',
            path: currentPath,
            children: [],
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }

        currentLevel = folder.children;
      });

      // 파일 추가
      currentLevel.push({
        name: fileName,
        type: 'file',
        path: file.path,
        sha: file.sha,
        savedAt: file.savedAt,
      });
    });

    return tree;
  }

  /**
   * 특정 날짜의 파일이 존재하는지 확인
   * @param {GithubFile[]} files - 파일 목록
   * @param {string} date - YYYY-MM-DD 형식
   * @returns {GithubFile|null}
   */
  findFileByDate(files, date) {
    return files.find(file => file.extractDate() === date) || null;
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
      const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
      
      // content를 base64로 인코딩
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      const data = {
        message,
        content: base64Content,
      };

      if (sha) {
        data.sha = sha;
      }

      const response = await this.client.put(endpoint, data);
      return response;
    } catch (error) {
      console.error('Failed to save file:', error);
      throw new Error('Failed to save file to repository');
    }
  }

  /**
   * 특정 파일의 커밋 히스토리 가져오기
   * @param {string} path - 파일 경로
   * @returns {Promise<Object[]>}
   */
  async fetchFileCommits(path) {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/commits?path=${path}`;
      const commits = await this.client.get(endpoint);
      return commits;
    } catch (error) {
      console.error('Failed to fetch file commits:', error);
      throw new Error('Failed to load commit history');
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
