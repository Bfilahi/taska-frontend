import { Component, signal } from '@angular/core';
import { ProjectTaskFormProject } from "../../project-task-form-project/project-task-form-project";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-edit-task',
  imports: [
    ProjectTaskFormProject,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss',
})
export class EditTask {
  public taskName = signal<string>('My task name');
  public taskDescription = signal<string>('My task description');
  public taskPriority:string = 'HIGH';
  public taskStatus: string = 'COMPLETED';
  public taskDueDate = signal<Date>(new Date('2-12-2026'));
}
