import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SubtaskResponse } from '../../../../dto/subtaskResponse';
import { Subtask } from '../../../../services/subtask';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SubtaskRequest } from '../../../../dto/subtaskRequest';
import { Util } from '../../../../dto/util';
import { Status } from '../../../../enum/statusEnum';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-edit-subtask',
  imports: [
    MatIconModule,
    MatDialogModule,
    FormFields,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-subtask.html',
  styleUrl: './edit-subtask.scss',
})
export class EditSubtask implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly subtaskService = inject(Subtask);
  private readonly toaster = inject(HotToastService);

  public isLoading = signal<boolean>(false);
  private subtask = signal<SubtaskResponse | null>(null);
  private taskId = signal<number>(0);
  public editSubtaskForm!: FormGroup;
  public statuses = Util.statuses;

  get reusableFields(): FormGroup {
    return this.editSubtaskForm.get('reusableFields') as FormGroup;
  }

  constructor() {
    effect(() => {
      const data = this.subtask();
      if (data) {
        this.editSubtaskForm.patchValue(
          {
            dueDate: data.dueDate,
            status: data.status,
          },
          { emitEvent: false }
        );

        if (this.reusableFields) {
          this.reusableFields.patchValue(
            {
              name: data.title,
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
      this.taskId.set(parseInt(param.get('t_id')!));
      if (this.taskId()) this.getSubtask(this.taskId());
    });

    this.editSubtaskForm = new FormGroup({
      dueDate: new FormControl<Date | null>(null, Validators.required),
      status: new FormControl<Status>(Status.ACTIVE, Validators.required),
    });
  }

  private getSubtask(taskId: number) {
    this.subtaskService.getSubtask(taskId, this.dialogData.subtaskId).subscribe({
      next: (response: SubtaskResponse) => {
        this.subtask.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  public onSubmit() {
    if (!confirm('Are you sure you want to update this subtask?')) return;

    this.isLoading.set(true);

    if (this.reusableFields) {
      const reusableFieldsValue = this.reusableFields.value;

      const request: SubtaskRequest = {
        title: reusableFieldsValue.name,
        description: reusableFieldsValue.description,
        priority: reusableFieldsValue.priority,
        status: this.editSubtaskForm.value.status,
        dueDate: this.editSubtaskForm.value.dueDate,
        taskId: this.taskId(),
      };

      this.subtaskService.updateSubtask(this.dialogData.subtaskId, request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toaster.success('Subtask was updated successfully');
          this.dialogRef.close();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.isLoading.set(false);
          this.toaster.error(`Error: ${err.error.message}`);
        },
      });
    } else {
      console.error('Error: Form fields are missing');
      this.isLoading.set(false);
      this.toaster.error('Error: Form fields are missing');
    }
  }
}
