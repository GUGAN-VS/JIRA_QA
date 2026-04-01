import { Component } from '@angular/core';
import { Header } from './shared/components/header/header';
import { MainActionCard } from './features/audit/components/main-action-card/main-action-card';
import { HistoricalReports } from './features/report/components/historical-reports/historical-reports';
import { AuditResultsModal } from './features/audit/components/audit-results-modal/audit-results-modal';
import { ReportDetailModal } from './features/report/components/report-detail-modal/report-detail-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    MainActionCard,
    HistoricalReports,
    AuditResultsModal,
    ReportDetailModal,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
