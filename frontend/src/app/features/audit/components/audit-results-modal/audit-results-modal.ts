import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuditService } from '../../../../core/services/audit.service';

@Component({
  selector: 'app-audit-results-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './audit-results-modal.html',
  styleUrl: './audit-results-modal.scss',
})
export class AuditResultsModal {
  private auditService = inject(AuditService);

  get report() {
    return this.auditService.newAuditReport;
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
    this.auditService.closeAuditReport();
  }
}