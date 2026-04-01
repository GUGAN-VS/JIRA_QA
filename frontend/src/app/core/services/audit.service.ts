import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReportSummary, FullReport, HealthStatus } from '../models/report.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  readonly reports = signal<ReportSummary[]>([]);
  readonly isAuditing = signal<boolean>(false);
  readonly newAuditReport = signal<FullReport | null>(null);
  readonly selectedReport = signal<FullReport | null>(null);
  readonly shouldProceedWithAudit = signal<boolean>(false);

  constructor() {
    this.loadHistoricalReports();
  }

  loadHistoricalReports(): void {
    this.http.get<ReportSummary[]>(`${this.apiUrl}/reports/`).subscribe({
      next: (data) => this.reports.set(data),
      error: (err) => console.error('Failed to load reports', err)
    });
  }

  confirmPendingAudit(): void {
    this.shouldProceedWithAudit.set(true);
  }

  cancelPendingAudit(): void {
    this.shouldProceedWithAudit.set(false);
  }

  runAudit(projectKeys: string, sprintIds?: string, sprintNames?: string): void {
    this.isAuditing.set(true);

    let params = new HttpParams().set('project_keys', projectKeys);
    if (sprintIds) params = params.set('sprint_ids', sprintIds);
    if (sprintNames) params = params.set('sprint_names', sprintNames);

    this.http.post<FullReport>(`${this.apiUrl}/sprint-audit/run`, null, { params })
      .subscribe({
        next: (report) => {
          this.newAuditReport.set(report);
          this.isAuditing.set(false);
          this.loadHistoricalReports(); // Refresh the list after a new audit
        },
        error: (err) => {
          console.error('Audit failed', err);
          this.isAuditing.set(false);
        }
      });
  }

  closeAuditReport(): void {
    this.newAuditReport.set(null);
  }

  viewReport(reportId: string): void {
    this.http.get<FullReport>(`${this.apiUrl}/reports/${reportId}`).subscribe({
      next: (report) => this.selectedReport.set(report),
      error: (err) => console.error('Failed to fetch report details', err)
    });
  }

  closeSelectedReport(): void {
    this.selectedReport.set(null);
  }

  getHealthStatus(score: number): HealthStatus {
    if (score >= 80) return { label: 'Healthy Backlog', colorClass: 'health--green' };
    if (score >= 60) return { label: 'Needs Attention', colorClass: 'health--yellow' };
    return { label: 'Critical Issues', colorClass: 'health--red' };
  }

  filterReports(projectFilter: string, sprintFilter: string): ReportSummary[] {
    return this.reports().filter((report) => {
      if (projectFilter && !report.project_names?.some((p) => p.includes(projectFilter))) {
        return false;
      }
      if (sprintFilter && !report.sprint_names?.some((s) => s.includes(sprintFilter))) {
        return false;
      }
      return true;
    });
  }
}
