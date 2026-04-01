export interface SprintSummary {
  total_stories: number;
  sprint_ready: number;
  needs_work: number;
  not_ready: number;
  average_score: number;
  overall_health: string;
}

export interface StoryScores {
  invest: number;
  acceptance_criteria: number;
  ambiguity: number;
  business_value: number;
  scope: number;
  technical_clarity: number;
}

export interface Story {
  key: string;
  summary: string;
  overall_score: number;
  readiness: string;
  scores: StoryScores;
  issues: string[];
  suggestions: string[];
  rewritten_summary?: string;
  rewritten_acceptance_criteria?: string;
}

export interface AuditLLMReport {
  sprint_summary: SprintSummary;
  stories: Story[];
}

export interface ReportSummary {
  _id: string;
  report_id: string;
  project_keys: string[];
  project_names: string[];
  sprint_ids: number[];
  sprint_names: string[];
  run_date: string;
  stories_analyzed: number;
  issues_found: number;
  quality_score: number;
  overall_health: string;
  story_keys: string[];
}

export interface FullReport extends ReportSummary {
  total_issues: number;
  jql_used: string[];
  report: AuditLLMReport | null;
}

export interface HealthStatus {
  label: string;
  colorClass: string;
}