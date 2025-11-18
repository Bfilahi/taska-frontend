import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ProjectCard } from "../project-card/project-card";
import { PriorityStatus } from "../../shared/priority-status/priority-status";
import { MatDialog } from '@angular/material/dialog';
import { NewProject } from '../new-project/new-project';



@Component({
  selector: 'app-projects',
  imports: [
    FormsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatListModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressBarModule,
    MatSelectModule,
    ProjectCard,
    PriorityStatus,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  public active = signal<boolean>(false);
  public dueDate = '03/12/26';

  readonly dialog = inject(MatDialog);
  public openNewProjectDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(NewProject);
  }

  public sortByDueDate(event: Event) {
    event.preventDefault();

    this.active.set(!this.active());
  }
}
