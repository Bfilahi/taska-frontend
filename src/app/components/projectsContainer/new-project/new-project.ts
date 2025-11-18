import { Component } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectTaskFormProject } from "../../project-task-form-project/project-task-form-project";

@Component({
  selector: 'app-add-project',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    ProjectTaskFormProject
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-project.html',
  styleUrl: './new-project.scss',
})
export class NewProject {

}
