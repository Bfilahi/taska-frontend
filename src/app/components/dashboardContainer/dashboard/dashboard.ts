import { Component, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from "@angular/material/toolbar";
import { OverdueCard } from "../overdue-card/overdue-card";
import { ProjectsTable } from "../projects-table/projects-table";
import { MatCardModule } from "@angular/material/card";
import { AnalysisCard } from "../../shared/analysis-card/analysis-card";
import { MatDialog } from '@angular/material/dialog';
import { NewProject } from '../../projectsContainer/new-project/new-project';



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
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public cards = [
    {
      title: 'Total Projects',
      icon: 'folder_open',
      amount: 2,
      color: 'var(--mat-sys-on-primary-fixed-variant)',
      bg: 'var(--mat-sys-primary-fixed-dim)',
    },
    {
      title: 'Completed Projects',
      icon: 'task_alt',
      amount: 7,
      color: 'var(--mat-extended-custom-color1-on-color-container)',
      bg: 'var(--mat-extended-custom-color1-color-container)',
    },
    {
      title: 'Total Tasks',
      icon: 'checklist',
      amount: 3,
      color: 'var(--mat-sys-on-tertiary-fixed-variant)',
      bg: 'var(--mat-sys-tertiary-fixed)',
    },
    {
      title: 'Overdue',
      icon: 'warning',
      amount: 0,
      color: 'var(--mat-extended-custom-color2-color-container)',
      bg: 'var(--mat-extended-custom-color3-color-container)',
    },
  ];

  public user = signal<string>('Filahi');

  readonly dialog = inject(MatDialog);
  public openNewProjectDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(NewProject);
  }
}
