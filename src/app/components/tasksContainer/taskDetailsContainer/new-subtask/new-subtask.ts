import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SubtaskRequest } from '../../../../dto/subtaskRequest';
import { Subtask } from '../../../../services/subtask';
import { Util } from '../../../../dto/util';
import { HotToastService } from '@ngxpert/hot-toast';


@Component({
  selector: 'app-new-subtask',
  imports: [
    MatIconModule,
    MatDialogModule,
    FormFields,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-subtask.html',
  styleUrl: './new-subtask.scss',
})
export class NewSubtask implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly subtaskService = inject(Subtask);
  private readonly dialogReg = inject(MatDialogRef<this>);
  private readonly toaster = inject(HotToastService);

  public isLoading = signal<boolean>(false);
  private taskId = signal<number>(0);

  public newSubtaskForm: FormGroup = new FormGroup({
    dueDate: new FormControl<Date | null>(null, [Validators.required, Util.dateMustBeAfterToday()]),
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      this.taskId.set(parseInt(param.get('t_id')!));
    });
  }

  get reusableFields(): FormGroup {
    return this.newSubtaskForm.get('reusableFields') as FormGroup;
  }

  public onSubmit() {
    this.isLoading.set(true);

    if (this.reusableFields && this.taskId()) {
      const reusableFieldsValue = this.reusableFields.value;

      const request: SubtaskRequest = {
        title: reusableFieldsValue.name,
        description: reusableFieldsValue.description,
        priority: reusableFieldsValue.priority,
        dueDate: this.newSubtaskForm.value.dueDate,
        taskId: this.taskId(),
      };

      this.subtaskService.addNewSubtask(request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogReg.close();
          this.toaster.success('New subtask was added successfully');
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.isLoading.set(false);
          this.toaster.error(`Error: ${err.error.message}`);
        },
      });
    } else {
      this.isLoading.set(false);
      console.error('Error: Form fields are missing');
      this.toaster.error('Error: Form fields are missing');
    }
  }
}
