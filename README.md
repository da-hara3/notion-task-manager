# Notion Task Manager

Notionをメインのタスク管理プラットフォームとして、GitHubと連携し、タスクの状態や内容を自動で同期・更新できる補助ツールを構築します。

## 機能概要

1. **GitHub Issue → Notion タスク同期**
   - 対象リポジトリのIssueを取得
   - Assigneeが自分のIssueのみを対象
   - 新規作成時の設定:
     - `RecordType` = `タスク`
     - `Status` = `未整理`
     - `OriginalIssue` = GitHubのIssue URL
     - `Title` = GitHub Issueのタイトル

2. **Notion タスクのステータス変更トリガー**
   - `Status` が `完了` に変化したとき、`完了日` に当日の日付を自動入力
   - NotionからWebhook通知を受信し処理

## 使用技術

- Google Apps Script（定期実行、Webhook受信）
- claspを利用したTypeScriptでのコード管理
- GitHub REST API（Issue情報取得）
- Notion API（DB登録・更新）

## 必要な準備

### 1. トークンの取得

- **GitHub Personal Access Token**
  - GitHub > Settings > Developer settings > Personal access tokens から取得
  - 必要な権限: `repo`

- **Notion API Token**
  - [Notion Developers](https://developers.notion.com/) から取得
  - Notionのインテグレーションを作成し、トークンを取得

### 2. Google Apps Scriptの設定

1. Google Apps Scriptのプロジェクトを作成
2. 必要なプロパティを設定:
   - `GITHUB_TOKEN`: GitHubのPersonal Access Token
   - `NOTION_TOKEN`: NotionのAPI Token
   - `WEBHOOK_SECRET`: Webhookの検証用シークレット

### 3. クローンとセットアップ

```bash
# claspをインストール
npm install -g @google/clasp

# claspにログイン
clasp login

# リポジトリをクローン
git clone [リポジトリURL]
cd notion-task-manager

# 依存関係をインストール
npm install

# .clasp.jsonのYOUR_SCRIPT_ID_HEREをGASのスクリプトIDに置き換え

# 必要な設定をsrc/config.tsに記載:
# - GitHubリポジトリ
# - 自分のユーザー名
# - NotionデータベースID

# デプロイ
clasp push
```

### 4. トリガーの設定

1. Google Apps Scriptのプロジェクトを開く
2. `setupTriggers` 関数を実行してトリガーを設定

### 5. Webhookの設定

1. GASのデプロイURLを取得
2. Notionのインテグレーション設定でWebhookを登録

## 主な機能

- GitHub IssueをNotionタスクに同期
- Notionのステータス変更をトリガーに処理を実行

## 今後の拡張

- ParentItemの自動リンク
- タグによる分類
- Google Apps ScriptからCloud Runへの移行