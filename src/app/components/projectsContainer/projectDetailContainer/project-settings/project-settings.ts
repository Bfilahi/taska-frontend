import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { Project } from '../../../../services/project';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectRequest } from '../../../../dto/projectRequest';
import { Util } from '../../../../dto/util';
import { Status } from '../../../../enum/statusEnum';
import { TaskResponse } from '../../../../dto/taskResponse';
import { Task } from '../../../../services/task';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';

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
    FormsModule,
    FormFields,
    ReactiveFormsModule,
    MatPaginatorModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './project-settings.html',
  styleUrl: './project-settings.scss',
})
export class ProjectSettings implements OnInit, OnDestroy {
  private readonly projectService = inject(Project);
  private readonly taskService = inject(Task);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toaster = inject(HotToastService);

  public project = signal<ProjectResponse | null>(null);
  public overdueTasks = signal<TaskResponse[]>([]);
  private projectId = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public isDeleteLoading = signal<boolean>(false);

  private destroy$ = new Subject<void>();

  public projectForm!: FormGroup;

  public priorities = Util.priorities;
  public statuses = Util.statuses;

  public partialParams: { page: number; size: number } = {
    page: 1,
    size: 5,
  };
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);

  get reusableFields(): FormGroup | null {
    return this.projectForm.get('reusableFields') as FormGroup | null;
  }

  constructor() {
    effect(() => {
      const data = this.project();
      if (data) {
        this.projectForm.patchValue(
          {
            dueDate: data.dueDate,
            status: data.status,
          },
          { emitEvent: false }
        );

        if (this.reusableFields) {
          this.reusableFields.patchValue(
            {
              name: data.name,
              description: data.description,
              priority: data.priority,
              status: data.status,
            },
            { emitEvent: false }
          );
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      if (param.has('id')) {
        this.projectId.set(parseInt(param.get('id')!));
        this.getProject(this.projectId());
      }
    });

    this.getOverdueTasks();

    this.projectForm = new FormGroup({
      dueDate: new FormControl<Date | null>(null, Validators.required),
      status: new FormControl<Status>(Status.ACTIVE, Validators.required),
    });

    this.taskService.taskChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getOverdueTasks());
  }

  public onSubmit() {
    if (!confirm('Are you sure you want to update this project?')) return;

    this.isLoading.set(true);

    if (this.reusableFields) {
      const reusableFieldsValue = this.reusableFields.value;

      const request: ProjectRequest = {
        name: reusableFieldsValue.name,
        description: reusableFieldsValue.description,
        dueDate: this.projectForm.value.dueDate!,
        priority: reusableFieldsValue.priority,
        status: this.projectForm.value.status
      };

      this.projectService.updateProject(this.projectId(), request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toaster.success('Project was updated successfully');
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.error(err);
          this.toaster.error(`Error: ${err.error.message}`);
        },
      });
    } else {
      this.isLoading.set(false);
      console.error('Error: Form fields are missing');
      this.toaster.error('Error: Form fields are missing');
    }
  }

  public onDelete() {
    if (!confirm('Are you sure you want to delete this project?')) return;

    this.isDeleteLoading.set(true);

    this.projectService.deleteProject(this.projectId()).subscribe({
      next: () => {
        this.isDeleteLoading.set(false);
        this.toaster.success('Project was deleted successfully');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isDeleteLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }

  public onPageChange(event: PageEvent) {
    this.partialParams.page = event.pageIndex + 1;
    this.partialParams.size = event.pageSize;

    this.getOverdueTasks();
  }

  private getProject(id: number) {
    this.projectService.getProject(id).subscribe({
      next: (response: ProjectResponse) => {
        this.project.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  private getOverdueTasks() {
    this.taskService.getOverdueTasks(this.partialParams, this.projectId()).subscribe({
      next: (response: any) => {
        this.overdueTasks.set(response.content);
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
