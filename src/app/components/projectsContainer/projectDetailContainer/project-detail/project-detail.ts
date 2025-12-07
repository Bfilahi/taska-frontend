import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { TasksTable } from '../tasks-table/tasks-table';
import { ProjectSettings } from '../project-settings/project-settings';
import { AnalysisCard } from '../../../shared/analysis-card/analysis-card';
import { MatDialog } from '@angular/material/dialog';
import { NewTask } from '../../../tasksContainer/new-task/new-task';
import { Project } from '../../../../services/project';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Status } from '../../../../enum/statusEnum';
import { Subject, takeUntil } from 'rxjs';
import { Task } from '../../../../services/task';

@Component({
  selector: 'app-project-detail',
  imports: [
    MatToolbarModule,
    MatIcon,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    RouterLink,
    MatInputModule,
    MatMenuModule,
    TasksTable,
    ProjectSettings,
    AnalysisCard,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnInit, OnDestroy {
  private readonly projectService = inject(Project);
  private readonly taskService = inject(Task);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  public active: Status = Status.ACTIVE;
  public completed: Status = Status.COMPLETED;

  public project = signal<ProjectResponse | null>(null);
  public projectId = signal<number>(0);

  private destroy$ = new Subject<void>();

  public cards = computed(() => [
    {
      title: 'Total Tasks',
      icon: 'bolt',
      amount: this.projectService.projectStats().totalTasks,
      color: 'var(--mat-sys-on-primary-fixed-variant)',
      bg: 'var(--mat-sys-primary-fixed-dim)',
    },
    {
      title: 'Completed',
      icon: 'bolt',
      amount: this.projectService.projectStats().completedTasks,
      color: 'var(--mat-sys-on-tertiary-fixed-variant)',
      bg: 'var(--mat-sys-tertiary-fixed)',
    },
    {
      title: 'In Progress',
      icon: 'bolt',
      amount: this.projectService.projectStats().tasksInProgress,
      color: 'var(--mat-extended-custom-color2-color-container)',
      bg: 'var(--mat-extended-custom-color3-color-container)',
    },
    {
      title: 'Overdue',
      icon: 'warning',
      amount: this.projectService.projectStats().overdueTasks,
      color: 'var(--mat-extended-custom-color2-color-container)',
      bg: 'var(--mat-extended-custom-color3-color-container)',
    },
  ]);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      if (param.has('id')) {
        this.projectId.set(parseInt(param.get('id')!));
        this.projectService.loadProjectStatus(this.projectId());
        this.getProject();
      }
    });

    this.taskService.taskChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.getProject());
  }

  public openNewTaskDialog(): void {
    this.dialog
      .open(NewTask)
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.projectService.loadProjectStatus(this.projectId());
        }
      });
  }

  private getProject() {
    this.projectService.getProject(this.projectId()).subscribe({
      next: (response: ProjectResponse) => {
        this.project.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
