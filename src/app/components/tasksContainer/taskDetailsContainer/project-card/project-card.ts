import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../../../services/project';
import { ActivatedRoute } from '@angular/router';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';

@Component({
  selector: 'app-project-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard implements OnInit {
  private readonly projectService = inject(Project);
  private readonly route = inject(ActivatedRoute);

  public project = signal<ProjectResponse | null>(null);

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  public active: Status = Status.ACTIVE;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      const projectId: number = parseInt(param.get('p_id')!);
      if (projectId) this.getProject(projectId);
    });
  }

  private getProject(projectId: number) {
    this.projectService.getProject(projectId).subscribe({
      next: (response: ProjectResponse) => {
        this.project.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
}
