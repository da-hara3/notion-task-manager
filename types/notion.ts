export type RecordType = 'タスク' | 'タグ' | 'Epic';
export type TaskStatus = '未整理' | '未着手' | '進行中' | '保留' | '完了' | '中止';

export interface NotionTask {
  id: string;
  recordType: RecordType;
  status: TaskStatus;
  title: string;
  originalIssue?: string;
  tags?: string[];
  parentItem?: string;
  completionDate?: string;
}

export interface NotionWebhookPayload {
  type: string;
  pageId: string;
  propertyId?: string;
  propertyName?: string;
  previousValue?: any;
  newValue?: any;
}