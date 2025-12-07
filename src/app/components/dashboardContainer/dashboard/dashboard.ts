import { Component, computed, inject, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { OverdueCard } from '../overdue-card/overdue-card';
import { ProjectsTable } from '../projects-table/projects-table';
import { MatCardModule } from '@angular/material/card';
import { AnalysisCard } from '../../shared/analysis-card/analysis-card';
import { MatDialog } from '@angular/material/dialog';
import { NewProject } from '../../projectsContainer/new-project/new-project';
import { Project } from '../../../services/project';
import { User } from '../../../services/user';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatListModule,
    MatIcon,
    MatButtonModule,
    MatToolbar,
    OverdueCard,
    ProjectsTable,
    MatCardModule,
    AnalysisCard,
    TitleCasePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly projectService = inject(Project);
  public readonly userService = inject(User);

  public cards = computed(() =>[
    {
      title: 'Total Projects',
      icon: 'folder_open',
      amount: this.projectService.projectsStats().totalProjects,
      color: 'var(--mat-sys-on-primary-fixed-variant)',
      bg: 'var(--mat-sys-primary-fixed-dim)',
    },
    {
      title: 'Completed Projects',
      icon: 'task_alt',
      amount: this.projectService.projectsStats().completedProjects,
      color: 'var(--mat-extended-custom-color1-on-color-container)',
      bg: 'var(--mat-extended-custom-color1-color-container)',
    },
    {
      title: 'Overdue',
      icon: 'warning',
      amount: this.projectService.projectsStats().overdueProjects,
      color: 'var(--mat-extended-custom-color2-color-container)',
      bg: 'var(--mat-extended-custom-color3-color-container)',
    },
  ]);

  ngOnInit(): void {
    this.projectService.loadProjectsStatus();
  }

  public openNewProjectDialog(): void {
    this.dialog.open(NewProject);
  }

}
