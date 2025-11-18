import { Component } from '@angular/core';
import { ProjectTaskFormProject } from "../../project-task-form-project/project-task-form-project";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-new-task',
  imports: [
    ProjectTaskFormProject,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTask {

}
