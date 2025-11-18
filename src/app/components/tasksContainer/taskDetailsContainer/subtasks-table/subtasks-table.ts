import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from '@angular/material/table';
import { EditTask } from '../../edit-task/edit-task';



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
  selector: 'app-subtasks-table',
  imports: [MatIconModule, MatMenuModule, MatTableModule, MatButtonModule],
  templateUrl: './subtasks-table.html',
  styleUrl: './subtasks-table.scss',
})
export class SubtasksTable {
  displayedColumns: string[] = ['title', 'priority', 'status', 'dueDate', 'menu'];
  dataSource = ELEMENT_DATA;

  readonly dialog = inject(MatDialog);
  public openEditTaskDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(EditTask);
  }
}
