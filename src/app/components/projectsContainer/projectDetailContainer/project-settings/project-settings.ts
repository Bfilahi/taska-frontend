import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-project-settings',
  imports: [
    MatCardModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './project-settings.html',
  styleUrl: './project-settings.scss',
})
export class ProjectSettings {
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
