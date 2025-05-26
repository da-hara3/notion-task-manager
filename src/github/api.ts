import { CONFIG } from '../config';
import { GitHubIssue } from '../../types/github';

/**
 * GitHub APIクライアント
 */
export class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token = CONFIG.GITHUB.API_TOKEN;
  private readonly username = CONFIG.GITHUB.MY_USERNAME;

  /**
   * HTTPリクエストを送信する
   */
  private fetch(endpoint: string, options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {}): any {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'notion-task-manager-gas',
      ...options.headers
    };

    const response = UrlFetchApp.fetch(url, {
      ...options,
      headers,
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode < 200 || responseCode >= 300) {
      console.error(`GitHub API Error: ${responseCode} ${responseText}`);
      throw new Error(`GitHub API Error: ${responseCode} ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  /**
   * 自分にアサインされたIssueを全リポジトリから取得
   */
  public getMyAssignedIssues(): GitHubIssue[] {
    const allIssues: GitHubIssue[] = [];

    // 設定された全リポジトリをループ
    for (const repo of CONFIG.GITHUB.REPOSITORIES) {
      try {
        // リポジトリからIssueを取得
        // 24時間前の日時をISO形式で取得
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 10);
        const since = oneDayAgo.toISOString();
        
        const endpoint = `/repos/${repo}/issues?assignee=${this.username}&state=open&sort=updated&direction=desc&since=${since}`;
        const issues = this.fetch(endpoint);
        
        // 取得したIssuesを配列に追加（PullRequestを除外）
        if (Array.isArray(issues)) {
          const filteredIssues = issues.filter(issue => !issue.pull_request);
          allIssues.push(...filteredIssues);
        }
      } catch (error) {
        console.error(`Error fetching issues from ${repo}: ${error}`);
      }
    }

    return allIssues;
  }
}