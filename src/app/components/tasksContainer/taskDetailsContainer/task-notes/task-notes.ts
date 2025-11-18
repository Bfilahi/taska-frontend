import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-task-notes',
  imports: [
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './task-notes.html',
  styleUrl: './task-notes.scss',
})
export class TaskNotes {

}
