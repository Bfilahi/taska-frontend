import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';


interface Project {
  name: string;
  description: string;
  status: 'ACTIVE' | 'ON HOLD' | 'COMPLETED';
  members: number;
  startDate: Date;
  progress: number; // 0 to 100
}


@Component({
  selector: 'app-projects-table',
  imports: [
    MatIconModule, 
    MatCardModule, 
    MatProgressBarModule,
    RouterLink,
    DatePipe
  ],
  templateUrl: './projects-table.html',
  styleUrl: './projects-table.scss',
})
export class ProjectsTable {
  public projects: Project[] = [
    {
      name: 'Kubernetes Migration',
      description: 'Migrate the monolithic app infrastructure to Kubernetes for scalability.',
      status: 'ACTIVE',
      members: 3,
      startDate: new Date('2026-01-20'),
      progress: 20,
    },
    {
      name: 'Project: Automated Regression Suite',
      description: 'Selenium + Playwright hybrid test framework for regression testing.',
      status: 'ACTIVE',
      members: 3,
      startDate: new Date('2025-10-15'),
      progress: 60,
    },
  ];
}
