import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { RouterLink } from '@angular/router';
import { Project } from '../../../services/project';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ProjectResponse } from '../../../dto/projectResponse';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Subject, takeUntil } from 'rxjs';
import { Priority } from '../../../enum/priorityEnum';


@Component({
  selector: 'app-projects-table',
  imports: [
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    RouterLink,
    DatePipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './projects-table.html',
  styleUrl: './projects-table.scss',
})
export class ProjectsTable implements OnInit, OnDestroy {
  public readonly projectService = inject(Project);
  private destroy$ = new Subject<void>();

  public projects = signal<ProjectResponse[]>([]);
  public isLoading = signal<boolean>(true);
  private partialParams: { page: number; size: number } = {
    page: 1,
    size: 3,
  };

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  ngOnInit(): void {
    this.listProjects();

    this.projectService.projectChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.listProjects());
  }

  private listProjects() {
    this.projectService.getAllProjects(this.partialParams).subscribe({
      next: (response: any) => {
        this.projects.set(response.content);
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
