import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MultiSelect } from '../../../../shared/components/multi-select/multi-select';
import { AuditService } from '../../../../core/services/audit.service';
import { Subject, of } from 'rxjs'; // Removed timer
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

@Component({
  selector: 'app-main-action-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MultiSelect],
  templateUrl: './main-action-card.html',
  styleUrl: './main-action-card.scss',
})
export class MainActionCard implements OnInit {
  private auditService = inject(AuditService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  rawProjects: JiraProject[] = [];

  projectOptions = signal<string[]>([]);
  sprintOptions = signal<string[]>([]);

  selectedProjects = signal<string[]>([]);
  selectedSprints = signal<string[]>([]);
  
  // Track loading state for the dynamic sprints
  isLoadingSprints = signal<boolean>(false);

  // Track pending audit parameters
  private pendingAuditParams = signal<{
    projectKeys: string;
    sprintNames?: string;
  } | null>(null);

  private projectSelectionSubject = new Subject<string[]>();

  constructor() {
    // Watch for when the user confirms they want to proceed with the audit
    effect(() => {
      const shouldProceed = this.auditService.shouldProceedWithAudit();
      const pending = this.pendingAuditParams();

      // If user confirmed and we have pending params, proceed with audit
      if (shouldProceed && pending) {
        this.executeAudit(pending.projectKeys, pending.sprintNames);
        this.pendingAuditParams.set(null);
        // Reset flags after starting the audit
        this.auditService.cancelPendingAudit();
      }
    });
  }

  ngOnInit() {
    this.http.get<JiraProject[]>(`${this.apiUrl}/sprints/projects`).subscribe({
      next: (projects) => {
        this.rawProjects = projects;
        const names = projects.map(p => p.name);
        this.projectOptions.set(names);
      },
      error: (err) => console.error('Failed to load Jira projects', err)
    });

    this.projectSelectionSubject
      .pipe(
        switchMap((selectedNames) => {
          
          this.isLoadingSprints.set(true);
          this.sprintOptions.set([]);
          this.selectedSprints.set([]);

          if (selectedNames.length === 0) {
            this.isLoadingSprints.set(false);
            return of(null);
          }

          // Directly process the keys and make the HTTP call
          const selectedKeys = selectedNames.map(name => {
            const found = this.rawProjects.find(p => p.name === name);
            return found ? found.key : name;
          });

          const projectKeysStr = selectedKeys.join(',');

          // switchMap will automatically abort this HTTP request if a new click happens
          return this.http.get<string[]>(`${this.apiUrl}/sprints/by-projects?project_keys=${projectKeysStr}`).pipe(
            catchError((err) => {
              console.error('Failed to load sprints', err);
              return of([]); 
            })
          );
        })
      )
      .subscribe((sprintNames) => {
        if (sprintNames !== null) {
          this.sprintOptions.set(sprintNames);
          this.isLoadingSprints.set(false);
        }
      });
  }

  get isAuditing() {
    return this.auditService.isAuditing;
  }

  get isDisabled(): boolean {
    return this.selectedProjects().length === 0;
  }

  onProjectsChange(selectedNames: string[]): void {
    this.selectedProjects.set(selectedNames);
    this.projectSelectionSubject.next(selectedNames);
  }

  handleRunAudit(): void {
    if (this.isDisabled || this.isAuditing()) return;

    const selectedKeys = this.selectedProjects().map(selectedName => {
      const found = this.rawProjects.find(p => p.name === selectedName);
      return found ? found.key : selectedName;
    });

    const projectKeysStr = selectedKeys.join(',');
    const sprintNamesStr = this.selectedSprints().length > 0 
      ? this.selectedSprints().join(',') 
      : undefined;

    this.executeAudit(projectKeysStr, sprintNamesStr);
  }

  private executeAudit(projectKeysStr: string, sprintNamesStr?: string): void {
    this.auditService.runAudit(projectKeysStr, undefined, sprintNamesStr);
  }
}