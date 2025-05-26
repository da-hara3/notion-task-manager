export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  url: string;
  html_url: string;
  state: 'open' | 'closed';
  assignees: Array<{
    login: string;
  }>;
  labels?: Array<{
    name: string;
  }>;
  parent?: {
    id: number;
    number: number;
    title: string;
    html_url: string;
  };
}