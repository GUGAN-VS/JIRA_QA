import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuditService } from '../../../../core/services/audit.service';

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './report-detail-modal.html',
  styleUrl: './report-detail-modal.scss',
})
export class ReportDetailModal {
  private auditService = inject(AuditService);

  get report() {
    return this.auditService.selectedReport;
  }

  getHealth(score: number) {
    return this.auditService.getHealthStatus(score);
  }

  getScoreColor(score: number): string {
    if (score >= 8) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  }

  close(): void {
    this.auditService.closeSelectedReport();
  }
}