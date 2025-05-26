import { CONFIG } from '../config';
import { NotionTask, RecordType, TaskStatus } from '../../types/notion';

/**
 * Notion APIクライアント
 */
export class NotionApiClient {
  private readonly baseUrl = 'https://api.notion.com/v1';
  private readonly token = CONFIG.NOTION.API_TOKEN;
  private readonly databaseId = CONFIG.NOTION.DATABASE_ID;

  /**
   * HTTPリクエストを送信する
   */
  private fetch(endpoint: string, options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {}): any {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
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
      console.error(`Notion API Error: ${responseCode} ${responseText}`);
      throw new Error(`Notion API Error: ${responseCode} ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  /**
   * タスクをNotionデータベースから検索する
   * @param originalIssueUrl GitHubのIssue URL
   */
  public async findTaskByOriginalIssue(originalIssueUrl: string): Promise<NotionTask | null> {
    const query = {
      filter: {
        property: 'OriginalIssue',
        url: {
          equals: originalIssueUrl
        }
      }
    };

    const endpoint = `/databases/${this.databaseId}/query`;
    const response = this.fetch(endpoint, {
      method: 'post',
      payload: JSON.stringify(query)
    });

    if (!response.results || response.results.length === 0) {
      return null;
    }

    // 最初の一致結果を返す
    const page = response.results[0];
    return this.parsePageToTask(page);
  }

  /**
   * 新しいタスクをNotionデータベースに作成
   */
  public createTask(task: {
    title: string;
    originalIssue: string;
    status?: TaskStatus;
  }): NotionTask {
    const endpoint = '/pages';
    const payload = {
      parent: { database_id: this.databaseId },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: task.title
              }
            }
          ]
        },
        'RecordType': {
          select: {
            name: 'タスク' as RecordType
          }
        },
        'Status': {
          select: {
            name: task.status || '未整理' as TaskStatus
          }
        },
        'OriginalIssue': {
          url: task.originalIssue
        }
      }
    };

    const response = this.fetch(endpoint, {
      method: 'post',
      payload: JSON.stringify(payload)
    });

    return this.parsePageToTask(response);
  }

  /**
   * タスクを更新する
   */
  public updateTask(pageId: string, properties: Record<string, any>): NotionTask {
    const endpoint = `/pages/${pageId}`;
    const payload = {
      properties
    };

    const response = this.fetch(endpoint, {
      method: 'patch',
      payload: JSON.stringify(payload)
    });

    return this.parsePageToTask(response);
  }

  /**
   * タスクの完了日を設定する
   */
  public setCompletionDate(pageId: string, date: Date = new Date()): NotionTask {
    const formattedDate = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
    
    return this.updateTask(pageId, {
      '完了日': {
        date: {
          start: formattedDate
        }
      }
    });
  }

  /**
   * Notionのページオブジェクトをタスクオブジェクトに変換
   */
  private parsePageToTask(page: any): NotionTask {
    const properties = page.properties;
    
    // タイトルを取得（titleプロパティから）
    const titleProperty = properties.Name || properties.Name;
    const title = titleProperty.title?.map((t: any) => t.text?.content || '').join('') || '';
    
    // ステータスを取得
    const statusProperty = properties.Status || properties.status;
    const status = statusProperty?.select?.name || '未整理';
    
    // レコードタイプを取得
    const recordTypeProperty = properties.RecordType || properties['record_type'];
    const recordType = recordTypeProperty?.select?.name || 'タスク';
    
    // 元のIssueURLを取得
    const originalIssueProperty = properties.OriginalIssue || properties['original_issue'];
    const originalIssue = originalIssueProperty?.url || '';
    
    // 完了日を取得
    const completionDateProperty = properties['完了日'] || properties['completion_date'];
    const completionDate = completionDateProperty?.date?.start || '';
    
    return {
      id: page.id,
      recordType: recordType as RecordType,
      status: status as TaskStatus,
      title,
      originalIssue,
      completionDate
    };
  }
}