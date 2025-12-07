import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormFields } from '../../shared/form-fields/form-fields';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../../services/project';
import { ProjectRequest } from '../../../dto/projectRequest';
import { ProjectResponse } from '../../../dto/projectResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Util } from '../../../dto/util';
import { HotToastService } from '@ngxpert/hot-toast';



@Component({
  selector: 'app-new-project',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    FormFields,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-project.html',
  styleUrl: './new-project.scss',
})
export class NewProject implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<this>);
  public projectService = inject(Project);
  private readonly toaster = inject(HotToastService);

  public newProjectForm = new FormGroup({
    dueDate: new FormControl<Date | null>(null, [Validators.required, Util.dateMustBeAfterToday()]),
  });

  public project = signal<ProjectResponse | null>(null);
  public isLoading = signal<boolean>(false);

  private destroy$ = new Subject<void>();

  get reusableFields(): FormGroup | null {
    return this.newProjectForm.get('reusableFields') as FormGroup | null;
  }

  ngOnInit(): void {
    this.projectService.projectChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.projectService.loadProjectsStatus());
  }

  public onSubmit() {
    this.isLoading.set(true);

    if (this.reusableFields) {
      const reusableFieldsValue = this.reusableFields.value;

      const request: ProjectRequest = {
        name: reusableFieldsValue.name,
        description: reusableFieldsValue.description,
        dueDate: this.newProjectForm.value.dueDate!,
        priority: reusableFieldsValue.priority,
      };

      this.projectService.addNewProject(request).subscribe({
        next: (response: ProjectResponse) => {
          this.project.set(response);
          this.isLoading.set(false);
          this.newProjectForm.reset();
          this.dialogRef.close();
          this.toaster.success('New project was added successfully');
          this.projectService.loadProjectsStatus();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.isLoading.set(false);
          this.toaster.error(`Error: ${err.error.message}`);
        },
      });
    } else {
      this.toaster.error('Error: Form fields are missing.');
      console.error('Error: Form fields are missing.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
