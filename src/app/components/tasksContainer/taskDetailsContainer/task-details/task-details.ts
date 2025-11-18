import { Component, inject } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from '@angular/material/table';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from "@angular/material/form-field";
import { SubtasksTable } from "../subtasks-table/subtasks-table";
import { TaskNotes } from "../task-notes/task-notes";
import { TaskDetailsCard } from "../task-details-card/task-details-card";
import { ProjectCard } from "../project-card/project-card";
import { MatDialog } from '@angular/material/dialog';
import { NewTask } from '../../new-task/new-task';



@Component({
  selector: 'app-task-details',
  imports: [
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    SubtasksTable,
    TaskNotes,
    TaskDetailsCard,
    ProjectCard,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails {
  public priorities = [
    { value: 'LOW-0', viewValue: 'LOW' },
    { value: 'MEDIUM-1', viewValue: 'MEDIUM' },
    { value: 'HIGH-2', viewValue: 'HIGH' },
  ];

  public status = [
    { value: 'TODO-0', viewValue: 'TODO' },
    { value: 'IN_PROGRESS-1', viewValue: 'IN PROGRESS' },
    { value: 'COMPLETED-2', viewValue: 'COMPLETED' },
  ];

  readonly dialog = inject(MatDialog);
  public openNewTaskDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(NewTask);
  }
}
