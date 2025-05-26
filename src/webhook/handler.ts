import { CONFIG } from '../config';
import { NotionApiClient } from '../notion/api';
import { NotionWebhookPayload } from '../../types/notion';

/**
 * Webhookハンドラクラス
 */
export class WebhookHandler {
  private notionClient: NotionApiClient;

  constructor() {
    this.notionClient = new NotionApiClient();
  }

  /**
   * Webhookリクエストを処理する
   * @param payload Webhookペイロード
   */
  public processWebhook(payload: NotionWebhookPayload): void {
    try {
      console.log(`Processing webhook: ${JSON.stringify(payload)}`);
      
      // ステータス変更イベントのみを処理
      if (payload.propertyName === 'Status' && 
          payload.newValue && 
          payload.newValue === '完了') {
        
        // 完了に変更された場合、完了日を現在の日付に設定
        console.log(`Updating completion date for page: ${payload.pageId}`);
        this.notionClient.setCompletionDate(payload.pageId);
      }
    } catch (error) {
      console.error(`Error processing webhook: ${error}`);
    }
  }

  /**
   * Webhookの認証を確認する
   * @param requestHeaders リクエストヘッダー
   * @param requestBody リクエスト本文
   */
  public verifyWebhook(requestHeaders: any, requestBody: string): boolean {
    // ここで実際の認証ロジックを実装。NotionのWebhookシステムによって異なる
    // 例: HMAC-SHA256署名検証などが一般的
    
    // 仮の実装として、常にtrueを返す
    return true;
  }
}