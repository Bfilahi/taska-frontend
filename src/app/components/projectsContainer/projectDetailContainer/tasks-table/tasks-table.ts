import { Component, inject } from '@angular/core';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PriorityStatus } from "../../../shared/priority-status/priority-status";
import { MatDialog } from '@angular/material/dialog';
import { EditTask } from '../../../tasksContainer/edit-task/edit-task';




enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum Status {
  TODO,
  IN_PROGRESS,
  COMPLETED,
}

export interface PeriodicElement {
  title: string;
  priority: Priority;
  status: string;
  subtasks: number;
  dueDate: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    title: 'Security Audit',
    priority: Priority.LOW,
    status: Status[0],
    subtasks: 2,
    dueDate: '2025-12-26',
  },
  {
    title: 'Helium',
    priority: Priority.MEDIUM,
    status: Status[1],
    subtasks: 6,
    dueDate: '2025-12-03',
  },
  {
    title: 'Lithium',
    priority: Priority.LOW,
    status: Status[0],
    subtasks: 0,
    dueDate: '2026-01-26',
  },
  {
    title: 'Beryllium',
    priority: Priority.HIGH,
    status: Status[2],
    subtasks: 4,
    dueDate: '2026-01-12',
  },
];





@Component({
  selector: 'app-tasks-table',
  imports: [
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    PriorityStatus,
  ],
  templateUrl: './tasks-table.html',
  styleUrl: './tasks-table.scss',
})
export class TasksTable {
  readonly dialog = inject(MatDialog);
  public openNewTaskDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(EditTask);
  }
  
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

  displayedColumns: string[] = ['title', 'priority', 'status', 'subtasks', 'dueDate', 'menu'];
  dataSource = ELEMENT_DATA;
}
