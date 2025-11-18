import { Component, Input, input } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { TitleCasePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-project-task-form-project',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    TitleCasePipe,
    FormsModule,
    MatDialogModule
],
  templateUrl: './project-task-form-project.html',
  styleUrl: './project-task-form-project.scss',
})
export class ProjectTaskFormProject {
  public header = input<string>('');
  public type = input<string>('');
  public buttonName = input<string>('');
  public icon = input<string>('');

  public taskName = input<string>('');
  public taskDescription = input<string>('');
  @Input() taskStatus: string = '';
  @Input() taskPriority: string = '';




  public priorities = [
    { value: 'LOW', viewValue: 'LOW' },
    { value: 'MEDIUM', viewValue: 'MEDIUM' },
    { value: 'HIGH', viewValue: 'HIGH' },
  ];

  public status = [
    { value: 'TODO', viewValue: 'TODO' },
    { value: 'IN_PROGRESS', viewValue: 'IN PROGRESS' },
    { value: 'COMPLETED', viewValue: 'COMPLETED' },
  ];
}
