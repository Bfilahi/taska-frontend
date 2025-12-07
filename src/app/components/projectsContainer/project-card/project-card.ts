import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProjectResponse } from '../../../dto/projectResponse';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Status } from '../../../enum/statusEnum';
import { Priority } from '../../../enum/priorityEnum';

@Component({
  selector: 'app-project-card',
  imports: [
    RouterLink,
    MatCardModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  public projects = input<ProjectResponse[]>([]);
  public partialParams = input<{ page: number; size: number }>({
    page: 1,
    size: 5,
  });
  public totalElements = input<number>(0);
  public totalPages = input<number>(0);
  public isLoading = input<boolean>(false);
  public isSearchLoading = input<boolean>(false);
  public onClick = output<PageEvent>();

  public active: Status = Status.ACTIVE;

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  public onPageChange(event: PageEvent) {
    this.onClick.emit(event);
  }
}
