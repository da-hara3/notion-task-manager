import { GitHubNotionSynchronizer } from "./github/syncToNotion";
import { WebhookHandler } from "./webhook/handler";
import { NotionWebhookPayload } from "../types/notion";

// Google Apps Script用のグローバル関数定義

/**
 * GitHub→Notion同期を実行（1時間おきの定期実行用）
 */
function syncGitHubToNotion(): void {
  try {
    console.log("Starting GitHub to Notion synchronization");
    const synchronizer = new GitHubNotionSynchronizer();
    synchronizer.syncAssignedIssuesToNotion();
    console.log("Synchronization completed");
  } catch (error) {
    console.error(`Synchronization failed: ${error}`);
  }
}

/**
 * NotionからのWebhookを処理するエンドポイント
 */
function doPost(
  e: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput {
  try {
    console.log("Received webhook request");

    // リクエストの検証
    const webhookHandler = new WebhookHandler();
    const isValid = webhookHandler.verifyWebhook(
      e.parameter,
      e.postData.contents
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Invalid signature" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ペイロードのパース
    const payload = JSON.parse(e.postData.contents) as NotionWebhookPayload;

    // Webhookの処理
    webhookHandler.processWebhook(payload);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(`Webhook processing error: ${error}`);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 初期設定用の関数（手動実行用）
 */
function setupTriggers(): void {
  // 既存のトリガーを全て削除
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
  }

  // 1時間ごとの同期トリガーを設定
  ScriptApp.newTrigger("syncGitHubToNotion").timeBased().everyHours(1).create();

  console.log("Triggers have been set up successfully");
}
