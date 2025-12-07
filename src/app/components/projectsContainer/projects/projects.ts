import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ProjectCard } from '../project-card/project-card';
import { MatDialog } from '@angular/material/dialog';
import { NewProject } from '../new-project/new-project';
import { Project } from '../../../services/project';
import { ProjectResponse } from '../../../dto/projectResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-projects',
  imports: [
    FormsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatListModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressBarModule,
    MatSelectModule,
    ProjectCard,
    MatProgressSpinnerModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly projectService = inject(Project);

  public projects = signal<ProjectResponse[]>([]);
  public partialParams = {
    page: 1,
    size: 5,
  };
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);
  public isFilterOn = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public isSearchLoading = signal<boolean>(false);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getProjects();

    this.projectService.projectChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getProjects());
  }

  public search(event: HTMLInputElement) {
    this.isFilterOn.set(true);

    const keyword: string = event.value.trim();
    if(keyword.length <= 0) {
      this.isFilterOn.set(false);
      return;
    };

    this.projects.set([]);
    this.isSearchLoading.set(true);

    this.partialParams.page = 1;
    this.partialParams.size = 5;

    event.value = '';

    this.projectService.searchProjects(keyword, this.partialParams).subscribe({
      next: (response: any) => {
        this.projects.set(response.content);
        this.partialParams.page = response.page + 1;
        this.partialParams.size = response.size;
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isSearchLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isSearchLoading.set(false);
        console.error(err);
      },
    });
  }

  public openNewProjectDialog(): void {
    this.dialog.open(NewProject);
  }

  public reset() {
    this.isFilterOn.set(false);
    this.partialParams.page = 1;
    this.partialParams.size = 5;

    this.getProjects();
  }

  public onPageChange(event: PageEvent) {
    this.partialParams.page = event.pageIndex + 1;
    this.partialParams.size = event.pageSize;

    this.getProjects();
  }

  private getProjects() {
    this.isLoading.set(true);

    this.projectService.getAllProjects(this.partialParams).subscribe({
      next: (response: any) => {
        this.projects.set(response.content);
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
