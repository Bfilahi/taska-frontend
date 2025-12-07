import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from '@angular/router';
import { Project } from '../../../services/project';
import { ProjectResponse } from '../../../dto/projectResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";

@Component({
  selector: 'app-overdue-card',
  imports: [MatCardModule, MatIconModule, RouterLink, MatPaginatorModule],
  templateUrl: './overdue-card.html',
  styleUrl: './overdue-card.scss',
})
export class OverdueCard implements OnInit {
  private readonly projectService = inject(Project);
  public projects = signal<ProjectResponse[]>([]);

  public partialParams = {
    page: 1,
    size: 3,
  };

  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);

  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.getOverdueProjects();
  }

  public onPageChange(event: PageEvent){
    this.partialParams.page = event.pageIndex + 1;
    this.partialParams.size = event.pageSize;

    this.getOverdueProjects();
  }

  private getOverdueProjects() {
    this.isLoading.set(true);

    this.projectService.getOverdueProjects(this.partialParams).subscribe({
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
}
