import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: 'app-project-card',
  imports: [MatCardModule, MatProgressBarModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {

}
