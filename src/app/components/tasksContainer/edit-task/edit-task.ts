import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormFields } from '../../shared/form-fields/form-fields';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../services/task';
import { ActivatedRoute } from '@angular/router';
import { TaskResponse } from '../../../dto/taskResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskRequest } from '../../../dto/taskRequest';
import { Util } from '../../../dto/util';
import { Status } from '../../../enum/statusEnum';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-edit-task',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormFields,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss',
})
export class EditTask implements OnInit {
  private readonly taskService = inject(Task);
  private readonly dialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(HotToastService);

  private task = signal<TaskResponse | null>(null);
  private projectId = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public editTaskForm!: FormGroup;
  public statuses = Util.statuses;

  get reusableFields(): FormGroup | null {
    return this.editTaskForm.get('reusableFields') as FormGroup | null;
  }

  constructor() {
    effect(() => {
      const data = this.task();
      if (data) {
        this.editTaskForm.patchValue(
          {
            dueDate: data.dueDate,
            status: data.status,
          },
          { emitEvent: false }
        );
      }

      if (this.reusableFields) {
        this.reusableFields.patchValue(
          {
            name: data?.title,
            description: data?.description,
            priority: data?.priority,
            status: data?.status,
          },
          { emitEvent: false }
        );
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      this.projectId.set(parseInt(param.get('id')!));
      if (!this.task()) {
        if (this.projectId()) {
          this.getTask(this.dialogData.taskId, this.projectId());
        }
      }
    });

    this.editTaskForm = new FormGroup({
      dueDate: new FormControl<Date | null>(null, Validators.required),
      status: new FormControl<Status>(Status.ACTIVE, Validators.required),
    });
  }

  public onSubmit() {
    if (!confirm('Are you sure you want to update this task?')) return;

    this.isLoading.set(true);

    if (this.reusableFields) {
      const reusableFieldsValue = this.reusableFields.value;

      const request: TaskRequest = {
        title: reusableFieldsValue.name,
        description: reusableFieldsValue.description,
        priority: reusableFieldsValue.priority,
        status: this.editTaskForm.value.status,
        dueDate: this.editTaskForm.value.dueDate,
        projectId: this.projectId(),
      };

      this.taskService.updateTask(this.dialogData.taskId, request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toaster.success('Task was updated successfully');
          this.dialogRef.close(true);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.error(err);
          this.toaster.error(`Error: ${err.error.message}`);
        },
      });
    } else {
      console.error('Error: Form fields are missing');
      this.isLoading.set(false);
      this.toaster.error('Error: Form fields are missing');
    }
  }

  private getTask(taskId: number, projectId: number) {
    this.taskService.getTask(taskId, projectId).subscribe({
      next: (response: TaskResponse) => {
        this.task.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
}
