import { GitHubApiClient } from './api';
import { NotionApiClient } from '../notion/api';
import { GitHubIssue } from '../../types/github';

/**
 * GitHub IssueをNotionタスクに同期するクラス
 */
export class GitHubNotionSynchronizer {
  private githubClient: GitHubApiClient;
  private notionClient: NotionApiClient;

  constructor() {
    this.githubClient = new GitHubApiClient();
    this.notionClient = new NotionApiClient();
  }

  /**
   * 同期処理を実行する
   * 1時間ごとの定期実行用
   */
  public syncAssignedIssuesToNotion(): void {
    try {
      // 自分にアサインされているIssueを取得
      const issues = this.githubClient.getMyAssignedIssues();
      console.log(`Found ${issues.length} assigned issues`);

      // 各Issueに対して処理
      for (const issue of issues) {
        this.processIssue(issue);
      }
    } catch (error) {
      console.error(`Synchronization error: ${error}`);
    }
  }

  /**
   * 個別のIssueを処理する
   */
  private async processIssue(issue: GitHubIssue): Promise<void> {
    try {
      const issueUrl = issue.html_url;
      
      // Notionに同じURLのタスクがあるか検索
      const existingTask = await this.notionClient.findTaskByOriginalIssue(issueUrl);
      
      if (existingTask) {
        // 既存タスクが見つかった場合、タイトルを更新
        console.log(`Updating existing task for issue: ${issue.number}`);
        // タイトルの変更は一旦処理しないでおく
        // this.notionClient.updateTask(existingTask.id, {
        //   'Name': {
        //     title: [
        //       {
        //         text: {
        //           content: issue.title
        //         }
        //       }
        //     ]
        //   }
        // });
      } else {
        // 新規タスクを作成
        console.log(`Creating new task for issue: ${issue.number}`);
        this.notionClient.createTask({
          title: issue.title,
          originalIssue: issueUrl,
          status: '未整理'
        });
      }
    } catch (error) {
      console.error(`Error processing issue ${issue.number}: ${error}`);
    }
  }
}