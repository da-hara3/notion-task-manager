// 環境変数にすると管理が面倒なものをべgit ignoreされたファイルで定義
import { REPOSITORIES } from './config/repositories';

/** 環境変数のキー */
const ENV_KEYS = {
  GITHUB: {
    USERNAME: 'GITHUB_USERNAME',
    TOKEN: 'GITHUB_TOKEN'
  },
  NOTION: {
    DATABASE_ID: 'NOTION_DATABASE_ID',
    TOKEN: 'NOTION_TOKEN'
  },
  WEBHOOK: {
    SECRET: 'WEBHOOK_SECRET'
  }
} as const;

/** 環境設定 */
const CONFIG = {
  /** GitHub関連設定 */
  GITHUB: {
    /** 監視対象リポジトリ（組織名/リポジトリ名の形式） */
    REPOSITORIES,
    /** 自分のGitHubユーザー名 */
    MY_USERNAME: PropertiesService.getScriptProperties().getProperty(ENV_KEYS.GITHUB.USERNAME),
    /** APIアクセス用トークン（PropertiesServiceから取得） */
    get API_TOKEN(): string {
      return PropertiesService.getScriptProperties().getProperty(ENV_KEYS.GITHUB.TOKEN) || '';
    }
  },
  
  /** Notion関連設定 */
  NOTION: {
    /** タスクデータベースID */
    DATABASE_ID: PropertiesService.getScriptProperties().getProperty(ENV_KEYS.NOTION.DATABASE_ID),
    /** APIアクセス用トークン（PropertiesServiceから取得） */
    get API_TOKEN(): string {
      return PropertiesService.getScriptProperties().getProperty(ENV_KEYS.NOTION.TOKEN) || '';
    }
  },
  
  /** Webhook関連設定 */
  WEBHOOK: {
    /** 検証用シークレット（PropertiesServiceから取得） */
    get SECRET(): string {
      return PropertiesService.getScriptProperties().getProperty(ENV_KEYS.WEBHOOK.SECRET) || '';
    }
  }
};

export {
  CONFIG
};
