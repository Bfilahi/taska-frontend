import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-task-details-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './task-details-card.html',
  styleUrl: './task-details-card.scss',
})
export class TaskDetailsCard {

}
