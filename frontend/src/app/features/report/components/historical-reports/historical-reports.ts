import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MultiSelect } from '../../../../shared/components/multi-select/multi-select';
import { AuditService } from '../../../../core/services/audit.service';
import { ReportSummary } from '../../../../core/models/report.model';

@Component({
  selector: 'app-historical-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MultiSelect
  ],
  templateUrl: './historical-reports.html',
  styleUrl: './historical-reports.scss',
})
export class HistoricalReports {
  private auditService = inject(AuditService);

  showFilters = signal(false);
  projectFilter = signal('');
  sprintFilter = signal('');
  reportIdFilter = signal<string[]>([]);
  runDateFilter = signal<Date | null>(null);
  storyIdFilter = signal('');
  issuesFoundFilter = signal<string[]>([]);
  qualityScoreFilter = signal<string[]>([]);

  // Get unique report IDs for dropdown
  reportIds = computed(() => {
    const allReports = this.auditService.filterReports('', '');
    return [...new Set(allReports.map(r => r.report_id))].sort();
  });

  // Quality score filter options
  issueFilterOptions = ['0 to 5', '6 to 10', 'Greater than 10'];
  qualityScoreOptions = ['Less than 60', '60 to 80', 'Greater than 80'];

  filteredReports = computed(() => {
    let reports = this.auditService.filterReports('', '');

    // Project filter (case-insensitive, trimmed, space-agnostic)
    const projectSearch = this.normalizeString(this.projectFilter());
    if (projectSearch) {
      reports = reports.filter(r => 
        r.project_names.some(p => this.normalizeString(p).includes(projectSearch))
      );
    }

    // Sprint filter (case-insensitive, trimmed, space-agnostic)
    const sprintSearch = this.normalizeString(this.sprintFilter());
    if (sprintSearch) {
      reports = reports.filter(r => 
        r.sprint_names.some(s => this.normalizeString(s).includes(sprintSearch))
      );
    }

    // Report ID filter
    const selectedReportIds = this.reportIdFilter();
    if (selectedReportIds.length) {
      reports = reports.filter(r => selectedReportIds.includes(r.report_id));
    }

    // Run date filter
    if (this.runDateFilter()) {
      const filterDate = new Date(this.runDateFilter()!);
      filterDate.setHours(0, 0, 0, 0);
      reports = reports.filter(r => {
        const reportDate = new Date(r.run_date);
        reportDate.setHours(0, 0, 0, 0);
        return reportDate.getTime() === filterDate.getTime();
      });
    }

    // Story ID filter
    const storySearch = this.normalizeString(this.storyIdFilter());
    if (storySearch) {
      reports = reports.filter(r => 
        // Using optional chaining just in case the backend payload misses this field
        r.story_keys?.some(key => this.normalizeString(key).includes(storySearch))
      );
    }

    // Issues found filter
    const selectedIssueFilters = this.issuesFoundFilter();
    if (selectedIssueFilters.length) {
      reports = reports.filter(r => {
        return selectedIssueFilters.some(filter => this.matchesIssueCountFilter(r.issues_found, filter));
      });
    }

    // Quality score filter
    const selectedScoreFilters = this.qualityScoreFilter();
    if (selectedScoreFilters.length) {
      reports = reports.filter(r => {
        return selectedScoreFilters.some(filter => this.matchesQualityScoreFilter(r.quality_score, filter));
      });
    }

    return reports;
  });

  // Normalize string for case-insensitive, space-agnostic comparison
  private normalizeString(str: string): string {
    return str.trim().toLowerCase().replace(/\s+/g, '');
  }

  private matchesQualityScoreFilter(score: number, filter: string): boolean {
    switch (filter) {
      case 'Less than 60':
        return score < 60;
      case '60 to 80':
        return score >= 60 && score <= 80;
      case 'Greater than 80':
        return score > 80;
      default:
        return false;
    }
  }

  private matchesIssueCountFilter(count: number, filter: string): boolean {
    switch (filter) {
      case '0 to 5':
        return count < 6;
      case '6 to 10':
        return count >= 6 && count <= 10;
      case 'Greater than 10':
        return count > 10;
      default:
        return false;
    }
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  clearFilters(): void {
    this.projectFilter.set('');
    this.sprintFilter.set('');
    this.reportIdFilter.set([]);
    this.runDateFilter.set(null);
    this.storyIdFilter.set('');
    this.issuesFoundFilter.set([]);
    this.qualityScoreFilter.set([]);
  }

  viewReport(report: ReportSummary): void {
    this.auditService.viewReport(report.report_id);
  }

  getHealth(score: number) {
    return this.auditService.getHealthStatus(score);
  }

  getIssueClass(count: number): string {
    if (count > 10) return 'issues--red';
    if (count > 5)  return 'issues--yellow';
    return 'issues--cyan';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score--cyan';
    if (score >= 60) return 'score--yellow';
    return 'score--red';
  }
}