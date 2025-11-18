import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { TasksTable } from "../tasks-table/tasks-table";
import { ProjectSettings } from "../project-settings/project-settings";
import { AnalysisCard } from "../../../shared/analysis-card/analysis-card";
import { MatDialog } from '@angular/material/dialog';
import { NewTask } from '../../../tasksContainer/new-task/new-task';



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
export class ProjectDetail {
  public cards = [
    {
      title: 'Total Tasks',
      icon: 'bolt',
      amount: 2,
      color: 'var(--mat-sys-on-primary-fixed-variant)',
      bg: 'var(--mat-sys-primary-fixed-dim)',
    },
    {
      title: 'Completed',
      icon: 'bolt',
      amount: 7,
      color: 'var(--mat-sys-on-tertiary-fixed-variant)',
      bg: 'var(--mat-sys-tertiary-fixed)',
    },
    {
      title: 'In Progress',
      icon: 'bolt',
      amount: 3,
      color: 'var(--mat-extended-custom-color2-color-container)',
      bg: 'var(--mat-extended-custom-color3-color-container)',
    },
  ];

  readonly dialog = inject(MatDialog);
  public openNewTaskDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(NewTask);
  }
}
